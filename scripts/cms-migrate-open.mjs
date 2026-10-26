#!/usr/bin/env node
// Migrate the CURRENT public OPEN copy into the OPEN CMS as an unpublished
// draft.  npm run cms:migrate-open [-- --dry-run] [-- --force]
//
// - Source of truth: what /open renders today. The script runs the real
//   legacy builder (buildLegacyOpenContent → useOpen() + og image + hero
//   button labels) — no copy is duplicated here.
// - Transform: shared/utils/openMigration.ts (copies exactly the mapped
//   fields of shared/utils/openSchema.ts).
// - Validate: OpenContentSchema (the schema the API enforces), plus a round
//   trip: the migrated record run through the public adapter must reproduce
//   today's page content exactly.
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

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
const TAG = '[migrate-open]'

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, {
  alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') },
  interopDefault: true
})
const load = (p) => jiti.import(resolve(root, p))

// useOpen() is self-contained; expose it the way Nuxt auto-imports it.
const { useOpen } = await load('app/composables/useOpen.ts')
globalThis.useOpen = useOpen

const { buildLegacyOpenContent, adaptOpenCms } = await load('app/composables/useOpenPage.ts')
const { legacyToOpenContent, OPEN_MIGRATION_VERSION, OPEN_DUMMY_MARKERS } = await load('shared/utils/openMigration.ts')
const { OpenContentSchema, OPEN_SECTION_KEYS } = await load('shared/utils/openSchema.ts')
const { buildMigratedOpenRecord, OPEN_RECORD_KEY, OPEN_REVISION_PREFIX } = await load('server/utils/cms/openPage.ts')

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')

const legacy = buildLegacyOpenContent()
const content = legacyToOpenContent({ sections: legacy, seo: legacy.seo }, { canonicalUrl: `${siteUrl}/open` })

const parsed = OpenContentSchema.safeParse(content)
if (!parsed.success) {
  console.error(`${TAG} Migrated content fails the OPEN schema — nothing written:`)
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
const leftovers = OPEN_DUMMY_MARKERS.filter((m) => text.includes(m))
if (leftovers.length) {
  console.error(`${TAG} Dummy markers found in migrated content (${leftovers.join(', ')}) — nothing written.`)
  process.exit(1)
}

// Round trip: the migrated record through the public adapter must give back
// exactly today's page content (canonical = the default page URL).
const adapted = adaptOpenCms(legacy, { version: 1, content })
const strip = (c) => {
  const x = JSON.parse(JSON.stringify(c))
  delete x.source
  delete x.cmsVersion
  delete x.seo.canonical
  return x
}
if (adapted.seo.canonical && adapted.seo.canonical !== `${siteUrl}/open`) {
  console.error(`${TAG} Canonical differs from the default page URL — nothing written.`)
  process.exit(1)
}
if (!isDeepStrictEqual(strip(adapted), strip(legacy))) {
  const a = strip(adapted), b = strip(legacy)
  for (const k of Object.keys(b)) if (!isDeepStrictEqual(a[k], b[k])) console.error(`${TAG} section "${k}" does not round-trip:\n  cms:    ${JSON.stringify(a[k]).slice(0, 400)}\n  legacy: ${JSON.stringify(b[k]).slice(0, 400)}`)
  console.error(`${TAG} Migrated content would not reproduce today's page — nothing written.`)
  process.exit(1)
}

const summary = {
  version: OPEN_MIGRATION_VERSION,
  sections: OPEN_SECTION_KEYS.length,
  headline: content.hero.statement,
  seo: content.seo.metaTitle,
  roundTrip: 'identical to the current page'
}

const storage = await openCmsStore(root)
const existing = await storage.getItem(OPEN_RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === OPEN_MIGRATION_VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`${TAG} Already migrated (${OPEN_MIGRATION_VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error(`${TAG} The OPEN record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.`)
    process.exit(2)
  }
  if (!FORCE) {
    console.error(`${TAG} The OPEN draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.`)
    process.exit(2)
  }
}

if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = buildMigratedOpenRecord(content, OPEN_MIGRATION_VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(OPEN_REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(OPEN_RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'open.migrate',
  entityType: 'page',
  entityId: 'open',
  timestamp: now,
  metadata: {
    version: OPEN_MIGRATION_VERSION,
    source: 'legacy OPEN (useOpen + og image + hero button labels)',
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${OPEN_MIGRATION_VERSION} into the OPEN draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))
process.exit(0)
