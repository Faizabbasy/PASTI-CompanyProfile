#!/usr/bin/env node
// Migrate the CURRENT public copy of a product page into its CMS record as an
// unpublished draft.
//   npm run cms:migrate-open | cms:migrate-shiftly | cms:migrate-e-corporate
//   (add -- --dry-run to only check, -- --force to replace an edited draft)
//
// - Source of truth: what the page renders today. The script runs the real
//   legacy builder (buildLegacy<X>Content → the page composable + og image).
// - Transform: pickSections() copies exactly the fields of the page's field
//   map (shared/utils/<x>Schema.ts) — nothing else.
// - Validate: the content schema the API enforces, plus a round trip: the
//   migrated record run through the public adapter must reproduce today's
//   page content exactly.
// - Write: the CMS store (Postgres when NUXT_CMS_DATABASE_URL is set, else
//   .data/cms) as a draft. Never publishes, never touches the public flag.
//
// Re-running is safe:
//   - record already holds this migration and the draft is unchanged → no-op
//   - record is dev seed (dummy) data → replaced entirely
//   - record holds real content that was edited or published → refused;
//     pass --force to replace an edited, never-published draft

import { createJiti } from 'jiti'
import { openCmsStore } from './lib/cms-store.mjs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

const PRODUCTS = {
  open: { name: 'OPEN', Name: 'Open', UP: 'OPEN', composable: 'useOpen', schema: 'openSchema', server: 'openPage', action: 'open' },
  shiftly: { name: 'SHIFTLY', Name: 'Shiftly', UP: 'SHIFTLY', composable: 'useShiftly', schema: 'shiftlySchema', server: 'shiftlyPage', action: 'shiftly' },
  'e-corporate': { name: 'e-CORPORATE', Name: 'Ecorporate', UP: 'ECORPORATE', composable: 'useEcorporate', schema: 'ecorporateSchema', server: 'ecorporatePage', action: 'ecorporate' }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [slug, ...rest] = process.argv.slice(2)
const args = new Set(rest)
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
const P = PRODUCTS[slug]
if (!P) {
  console.error(`[migrate-product] Usage: node scripts/cms-migrate-product.mjs <${Object.keys(PRODUCTS).join('|')}> [--dry-run] [--force]`)
  process.exit(1)
}
const TAG = `[migrate-${slug}]`
const VERSION = `${slug}-v1`

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, {
  alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') },
  interopDefault: true
})
const load = (p) => jiti.import(resolve(root, p))

// The page composables are self-contained; expose what the page source files
// reach through Nuxt auto-imports.
globalThis[P.composable] = (await load(`app/composables/${P.composable}.ts`))[P.composable]
globalThis.defineProductPageSource = (await load('app/composables/useProductPageSource.ts')).defineProductPageSource

const pageSource = await load(`app/composables/use${P.Name}Page.ts`)
const buildLegacy = pageSource[`buildLegacy${P.Name}Content`]
const adapt = pageSource[`adapt${P.Name}Cms`]
const schemaMod = await load(`shared/utils/${P.schema}.ts`)
const sections = schemaMod[`${P.UP}_SECTIONS`]
const schema = schemaMod[`${P.Name}ContentSchema`]
const { pickSections } = await load('shared/cms/productFields.ts')
const serverMod = await load(`server/utils/cms/${P.server}.ts`)
const buildMigratedRecord = serverMod[`buildMigrated${P.Name}Record`]
const RECORD_KEY = serverMod[`${P.UP}_RECORD_KEY`]
const REVISION_PREFIX = serverMod[`${P.UP}_REVISION_PREFIX`]

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')
const canonical = `${siteUrl}/${slug}`

const legacy = buildLegacy()
const content = {
  ...pickSections(sections, legacy),
  seo: { metaTitle: legacy.seo.title, metaDescription: legacy.seo.description, ogImage: legacy.seo.image, canonicalUrl: canonical, noIndex: false }
}

const parsed = schema.safeParse(content)
if (!parsed.success) {
  console.error(`${TAG} Migrated content fails the ${P.name} schema — nothing written:`)
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
if (text.includes('[Dummy]')) {
  console.error(`${TAG} Dummy markers found in migrated content — nothing written.`)
  process.exit(1)
}

// Round trip: the migrated record through the public adapter must give back
// exactly today's page content (canonical = the default page URL).
const adapted = adapt(legacy, { version: 1, content })
const strip = (c) => {
  const x = JSON.parse(JSON.stringify(c))
  delete x.source
  delete x.cmsVersion
  delete x.seo.canonical
  return x
}
if (!isDeepStrictEqual(strip(adapted), strip(legacy))) {
  const a = strip(adapted), b = strip(legacy)
  for (const k of Object.keys(b)) if (!isDeepStrictEqual(a[k], b[k])) console.error(`${TAG} "${k}" does not round-trip:\n  cms:    ${JSON.stringify(a[k]).slice(0, 400)}\n  legacy: ${JSON.stringify(b[k]).slice(0, 400)}`)
  console.error(`${TAG} Migrated content would not reproduce today's page — nothing written.`)
  process.exit(1)
}

const summary = { version: VERSION, sections: Object.keys(sections).length, seo: content.seo.metaTitle, roundTrip: 'identical to the current page' }

const storage = await openCmsStore(root)
const existing = await storage.getItem(RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`${TAG} Already migrated (${VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error(`${TAG} The ${P.name} record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.`)
    process.exit(2)
  }
  if (!FORCE) {
    console.error(`${TAG} The ${P.name} draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.`)
    process.exit(2)
  }
}

if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = buildMigratedRecord(content, VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: `${P.action}.migrate`,
  entityType: 'page',
  entityId: slug,
  timestamp: now,
  metadata: {
    version: VERSION,
    source: `legacy ${P.name} (${P.composable} + og image)`,
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${VERSION} into the ${P.name} draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))
process.exit(0)
