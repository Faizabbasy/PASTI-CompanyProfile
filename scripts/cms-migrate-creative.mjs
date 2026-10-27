#!/usr/bin/env node
// Migrate the CURRENT public Creative content into the Creative CMS as an
// unpublished draft.  npm run cms:migrate-creative [-- --dry-run] [-- --force]
//
// - Source of truth: what /creative renders today. The script runs the real
//   legacy builder (buildLegacyCreativeContent → useCreative / useWhatsapp /
//   pageSeo.creative) — no copy is duplicated here.
// - Shared records (projects, testimonial, company standards/milestones) are
//   stored as references derived from what the page shows today.
// - Proof before writing: the migrated content, run back through the public
//   adapter, must reproduce today's normalized page exactly.
// - Transform: shared/utils/creativeMigration.ts (deterministic ids).
// - Validate: shared/utils/creativeSchema.ts (the schema the API enforces).
// - Write: the local dev CMS store (.data/cms) as a draft. Never publishes,
//   never touches the public flag, never edits legacy source files.
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

// --lang id → build and write the Indonesian record (default: English, the original record).
const LANG = process.argv.includes('--lang') && process.argv[process.argv.indexOf('--lang') + 1] === 'id' ? 'id' : 'en'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
const TAG = '[migrate-creative]'

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production — this targets the local dev CMS store only.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, {
  alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') },
  interopDefault: true
})
const load = (p) => jiti.import(resolve(root, p))
await (await import('./lib/nuxt-shims.mjs')).installNuxtShims(load, LANG)

// The legacy composables call each other through Nuxt auto-imports; provide
// those names as globals so the real, unmodified files run as-is.
const { useCompany } = await load('app/composables/useCompany.ts')
const { useWhatsapp } = await load('app/composables/useWhatsapp.ts')
const { useSelectedWork } = await load('app/composables/useSelectedWork.ts')
const { useTestimonials } = await load('app/composables/useTestimonials.ts')
const { pageSeo } = await load('app/composables/useSeo.ts')
Object.assign(globalThis, { useCompany, useWhatsapp, useSelectedWork, useTestimonials, pageSeo })
const { useCreative } = await load('app/composables/useCreative.ts')
globalThis.useCreative = useCreative

const { buildLegacyCreativeContent, creativeLegacyRefs, adaptCreativeCms } = await load('app/composables/useCreativePage.ts')
const { legacyToCreativeContent, CREATIVE_MIGRATION_VERSION, CREATIVE_DUMMY_MARKERS } = await load('shared/utils/creativeMigration.ts')
const MIG_VERSION = LANG === 'id' ? CREATIVE_MIGRATION_VERSION.replace('-v', '-id-v') : CREATIVE_MIGRATION_VERSION
const { CreativeContentSchema } = await load('shared/utils/creativeSchema.ts')
// The record for the chosen language (--lang id → Indonesian; default English = the original record).
const { creativeFor } = await load('server/utils/cms/creativePage.ts')
const _engine = creativeFor(LANG)
const buildMigratedCreativeRecord = _engine.buildMigratedRecord
const CREATIVE_RECORD_KEY = _engine.RECORD_KEY
const CREATIVE_REVISION_PREFIX = _engine.REVISION_PREFIX

// Same origin usePageSeo() builds the canonical from (runtimeConfig.public.siteUrl).
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')

const legacy = buildLegacyCreativeContent()
const refs = creativeLegacyRefs(legacy)
const content = legacyToCreativeContent(legacy, refs, { canonicalUrl: `${siteUrl}/creative` })

const parsed = CreativeContentSchema.safeParse(content)
if (!parsed.success) {
  console.error(`${TAG} Migrated content fails the Creative schema (unresolvable ref or limit) — nothing written:`)
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
const leftovers = CREATIVE_DUMMY_MARKERS.filter((m) => text.includes(m))
if (leftovers.length) {
  console.error(`${TAG} Dummy markers found in migrated content (${leftovers.join(', ')}) — nothing written.`)
  process.exit(1)
}

// Round trip: migrated content → public adapter must equal today's page.
// Only item keys (CMS ids vs legacy keys), the source tag and the explicit
// canonical (equal to the default URL) may differ.
const publicShape = {
  ...content,
  services: { ...content.services, items: content.services.items.map(({ active, sortOrder, ...r }) => r) },
  wall: { ...content.wall, visuals: content.wall.visuals.map(({ active, sortOrder, ...r }) => r) },
  work: { ...content.work, uiux: { ...content.work.uiux, items: content.work.uiux.items.map(({ active, sortOrder, ...r }) => r) } }
}
const adapted = adaptCreativeCms(legacy, { version: 1, content: publicShape })
const strip = (c) => {
  const x = JSON.parse(JSON.stringify(c))
  delete x.source
  delete x.cmsVersion
  delete x.seo.canonical
  x.services.items.forEach((i) => delete i.key)
  x.wall.visuals.forEach((v) => delete v.key)
  return x
}
if (adapted.seo.canonical && adapted.seo.canonical !== `${siteUrl}/creative`) {
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
  version: MIG_VERSION,
  headline: [content.hero.headlineLine1, content.hero.headlineLine2],
  services: content.services.items.map((s) => s.id),
  visuals: content.wall.visuals.map((v) => v.id),
  refs,
  roundTrip: 'identical to the current page'
}

const storage = await openCmsStore(root)
const existing = await storage.getItem(CREATIVE_RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === MIG_VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`${TAG} Already migrated (${MIG_VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error(`${TAG} The Creative record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.`)
    process.exit(2)
  }
  if (!FORCE) {
    console.error(`${TAG} The Creative draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.`)
    process.exit(2)
  }
}

if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = buildMigratedCreativeRecord(content, MIG_VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(CREATIVE_REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(CREATIVE_RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'creative.migrate',
  entityType: 'page',
  entityId: 'creative',
  timestamp: now,
  metadata: {
    version: MIG_VERSION,
    source: 'legacy Creative (useCreative + Hero/Services/Wall/Work template constants) + pageSeo.creative',
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${MIG_VERSION} into the Creative draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))
