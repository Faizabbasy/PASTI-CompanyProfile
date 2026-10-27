#!/usr/bin/env node
// Migrate the CURRENT public Technology content into the Technology CMS as
// an unpublished draft.  npm run cms:migrate-technology [-- --dry-run] [-- --force]
//
// - Source of truth: what /technology renders today. The script runs the
//   real legacy builder (buildLegacyTechnologyContent → useTechnology /
//   useWhatsapp / pageSeo.technology) — no copy is duplicated here.
// - Case studies are stored as references (case:<id> / work:<index>) to the
//   existing project records, derived from the cards the page shows today;
//   every ref must resolve back to the identical card.
// - Transform: shared/utils/technologyMigration.ts (deterministic ids).
// - Validate: shared/utils/technologySchema.ts (the schema the API enforces).
// - Write: the local dev CMS store (.data/cms, same fs driver as
//   nuxt.config.ts nitro.storage.cms) as a draft. Never publishes, never
//   touches the public flag, never edits legacy source files.
//
// Not an HTTP endpoint: it only runs from a developer's shell with
// filesystem access to the store.
//
// Re-running is safe:
//   - record already holds this migration and the draft is unchanged → no-op
//   - record is dev seed (dummy) data → replaced entirely (dummy draft, dummy
//     published snapshot and dummy revisions removed)
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
const TAG = '[migrate-technology]'

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
const { useFeaturedCases, approvedVisuals, approvedMetrics } = await load('app/composables/useFeaturedCases.ts')
const { pageSeo } = await load('app/composables/useSeo.ts')
Object.assign(globalThis, { useCompany, useWhatsapp, useSelectedWork, useFeaturedCases, approvedVisuals, approvedMetrics, pageSeo })
const { useTechnology } = await load('app/composables/useTechnology.ts')
globalThis.useTechnology = useTechnology

const { buildLegacyTechnologyContent, technologyWorkRefFor, resolveTechnologyWorkRef } = await load('app/composables/useTechnologyPage.ts')
const { legacyToTechnologyContent, TECHNOLOGY_MIGRATION_VERSION, TECHNOLOGY_DUMMY_MARKERS } = await load('shared/utils/technologyMigration.ts')
const MIG_VERSION = LANG === 'id' ? TECHNOLOGY_MIGRATION_VERSION.replace('-v', '-id-v') : TECHNOLOGY_MIGRATION_VERSION
const { TechnologyContentSchema, TECHNOLOGY_WORK_REFS } = await load('shared/utils/technologySchema.ts')
// The record for the chosen language (--lang id → Indonesian; default English = the original record).
const { technologyFor } = await load('server/utils/cms/technologyPage.ts')
const _engine = technologyFor(LANG)
const buildMigratedTechnologyRecord = _engine.buildMigratedRecord
const TECHNOLOGY_RECORD_KEY = _engine.RECORD_KEY
const TECHNOLOGY_REVISION_PREFIX = _engine.REVISION_PREFIX

// Same origin usePageSeo() builds the canonical from (runtimeConfig.public.siteUrl).
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')

const legacy = buildLegacyTechnologyContent()

// Case-study refs: each card shown today → its record ref, which must be in
// the allowlist and resolve back to exactly the same card.
const workRefs = legacy.work.cards.map((card) => {
  const ref = technologyWorkRefFor(card)
  if (!TECHNOLOGY_WORK_REFS.includes(ref)) {
    console.error(`${TAG} Case card "${card.title}" (${card.to}) has no allowed reference — nothing written.`)
    process.exit(1)
  }
  if (!isDeepStrictEqual(JSON.parse(JSON.stringify(resolveTechnologyWorkRef(ref))), JSON.parse(JSON.stringify(card)))) {
    console.error(`${TAG} Reference ${ref} does not resolve to the card shown today — nothing written.`)
    process.exit(1)
  }
  return ref
})

const content = legacyToTechnologyContent(legacy, workRefs, { canonicalUrl: `${siteUrl}/technology` })

const parsed = TechnologyContentSchema.safeParse(content)
if (!parsed.success) {
  console.error(`${TAG} Migrated content fails the Technology schema — nothing written:`)
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
const leftovers = TECHNOLOGY_DUMMY_MARKERS.filter((m) => text.includes(m))
if (leftovers.length) {
  console.error(`${TAG} Dummy markers found in migrated content (${leftovers.join(', ')}) — nothing written.`)
  process.exit(1)
}

const summary = {
  version: MIG_VERSION,
  headline: [content.hero.headlineLine1, content.hero.headlineLine2, content.hero.headlineLine3],
  capabilities: content.capabilities.items.map((c) => c.id),
  work: content.work.items.map((w) => w.ref)
}

const storage = await openCmsStore(root)
const existing = await storage.getItem(TECHNOLOGY_RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === MIG_VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`${TAG} Already migrated (${MIG_VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error(`${TAG} The Technology record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.`)
    process.exit(2)
  }
  if (!FORCE) {
    console.error(`${TAG} The Technology draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.`)
    process.exit(2)
  }
}

if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = buildMigratedTechnologyRecord(content, MIG_VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(TECHNOLOGY_REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(TECHNOLOGY_RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'technology.migrate',
  entityType: 'page',
  entityId: 'technology',
  timestamp: now,
  metadata: {
    version: MIG_VERSION,
    source: 'legacy Technology (useTechnology + Hero/Work template constants) + pageSeo.technology',
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${MIG_VERSION} into the Technology draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))
