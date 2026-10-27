#!/usr/bin/env node
// Step 4 — migrate the CURRENT public About content into the About CMS as
// an unpublished draft.  npm run cms:migrate-about [-- --dry-run] [-- --force]
//
// - Source of truth: what /about renders today. The script runs the real
//   legacy builder (buildLegacyAboutContent → useAbout / useCompany /
//   useWhoWeAre / useWhatsapp) and pageSeo.about — no copy is duplicated here.
// - Transform: shared/utils/aboutMigration.ts (deterministic ids).
// - Validate: shared/utils/aboutSchema.ts (the same schema the API enforces).
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

// --lang id → build and write the Indonesian record (default: English, the original record).
const LANG = process.argv.includes('--lang') && process.argv[process.argv.indexOf('--lang') + 1] === 'id' ? 'id' : 'en'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')

if (process.env.NODE_ENV === 'production') {
  console.error('[migrate-about] Refusing to run with NODE_ENV=production — this targets the local dev CMS store only.')
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
const { useWhoWeAre } = await load('app/composables/useWhoWeAre.ts')
const { useWhatsapp } = await load('app/composables/useWhatsapp.ts')
Object.assign(globalThis, { useCompany, useWhoWeAre, useWhatsapp })
const { useAbout } = await load('app/composables/useAbout.ts')
globalThis.useAbout = useAbout

const { buildLegacyAboutContent } = await load('app/composables/useAboutPage.ts')
const { pageSeo } = await load('app/composables/useSeo.ts')
const { legacyToAboutContent, ABOUT_MIGRATION_VERSION, DUMMY_MARKERS } = await load('shared/utils/aboutMigration.ts')
const MIG_VERSION = LANG === 'id' ? ABOUT_MIGRATION_VERSION.replace('-v', '-id-v') : ABOUT_MIGRATION_VERSION
const { AboutContentSchema } = await load('shared/utils/aboutSchema.ts')
// The record for the chosen language (--lang id → Indonesian; default English = the original record).
const { aboutFor } = await load('server/utils/cms/aboutPage.ts')
const _engine = aboutFor(LANG)
const buildMigratedAboutRecord = _engine.buildMigratedRecord
const ABOUT_RECORD_KEY = _engine.RECORD_KEY
const ABOUT_REVISION_PREFIX = _engine.REVISION_PREFIX

// Same origin usePageSeo() builds the canonical from (runtimeConfig.public.siteUrl).
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')

const legacy = buildLegacyAboutContent()
const content = legacyToAboutContent(legacy, {
  title: pageSeo.about.title,
  description: pageSeo.about.description,
  image: pageSeo.about.image,
  canonicalUrl: `${siteUrl}/about`
})

const parsed = AboutContentSchema.safeParse(content)
if (!parsed.success) {
  console.error('[migrate-about] Migrated content fails the About schema — nothing written:')
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
const leftovers = DUMMY_MARKERS.filter((m) => text.includes(m))
if (leftovers.length) {
  console.error(`[migrate-about] Dummy markers found in migrated content (${leftovers.join(', ')}) — nothing written.`)
  process.exit(1)
}

const summary = {
  version: MIG_VERSION,
  storyParagraphs: content.story.paragraphs.length,
  values: content.values.map((v) => v.id),
  milestones: content.milestones.map((m) => m.id),
  proof: content.proof.map((p) => `${p.value} ${p.label}`),
  leadership: content.leadership.map((l) => `${l.name} (${l.role})`)
}

const storage = await openCmsStore(root)
const existing = await storage.getItem(ABOUT_RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === MIG_VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`[migrate-about] Already migrated (${MIG_VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error('[migrate-about] The About record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.')
    process.exit(2)
  }
  if (!FORCE) {
    console.error('[migrate-about] The About draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.')
    process.exit(2)
  }
}

if (DRY) {
  console.log('[migrate-about] Dry run — would write:', JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = buildMigratedAboutRecord(content, MIG_VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(ABOUT_REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(ABOUT_RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'about.migrate',
  entityType: 'page',
  entityId: 'about',
  timestamp: now,
  metadata: {
    version: MIG_VERSION,
    source: 'legacy About (useAbout/useCompany/useWhoWeAre/Hero constants) + pageSeo.about',
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`[migrate-about] Migrated ${MIG_VERSION} into the About draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))
