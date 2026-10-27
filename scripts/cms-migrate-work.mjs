#!/usr/bin/env node
// Migrate the CURRENT public /work content into the Work CMS as unpublished
// drafts.  npm run cms:migrate-work [-- --dry-run] [-- --force]
//
// - Source of truth: what /work renders today. The script runs the real
//   legacy builder (buildLegacyWorkContent → useWorkPortfolio /
//   useFeaturedCases / useWhatsapp / pageSeo.work) plus the full legacy case
//   records — no copy is duplicated here.
// - Transform: shared/utils/workMigration.ts (deterministic ids, owner claim
//   decisions of 2026-10-23).
// - Validate: the Work / Project / Case Study schemas the API enforces, and
//   a round trip: migrated records → public resolver → adapter must equal the
//   legacy Hero + Project Index exactly, and the legacy cases minus AT-WF and
//   minus the needs_approval metrics.
// - Write: the local dev CMS store (.data/cms) as DRAFTS. Never publishes,
//   never touches the public flag, never edits legacy source files.
//
// Re-running is safe:
//   - a record already holding this migration with an unchanged draft → skipped
//   - dev seed (dummy) records → replaced / removed
//   - real records that were edited → refused unless --force (never-published only)
//   - real records with a published version → always refused

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
const TAG = '[migrate-work]'

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

// Provide the Nuxt auto-imports the legacy composables use as globals so the
// real, unmodified files run as-is.
const { useCompany } = await load('app/composables/useCompany.ts')
const { useWhatsapp } = await load('app/composables/useWhatsapp.ts')
const { useSelectedWork } = await load('app/composables/useSelectedWork.ts')
const { useFeaturedCases, approvedVisuals, approvedMetrics } = await load('app/composables/useFeaturedCases.ts')
const { pageSeo } = await load('app/composables/useSeo.ts')
Object.assign(globalThis, { useCompany, useWhatsapp, useSelectedWork, useFeaturedCases, approvedVisuals, approvedMetrics, pageSeo })
const { useWorkPortfolio } = await load('app/composables/useWorkPortfolio.ts')
globalThis.useWorkPortfolio = useWorkPortfolio

const { buildLegacyWorkContent, adaptWorkCms } = await load('app/composables/useWorkPage.ts')
const { legacyToWorkMigration, WORK_MIGRATION_VERSION, WORK_FEATURED_BASELINE } = await load('shared/utils/workMigration.ts')
const { resolveWorkView } = await load('shared/utils/workPublic.ts')
const { WorkContentSchema } = await load('shared/utils/workSchema.ts')
const { ProjectContentSchema } = await load('shared/utils/projectSchema.ts')
const { CaseStudyContentSchema } = await load('shared/utils/caseStudySchema.ts')
const { WORK_DUMMY_MARKERS } = await load('server/data/workDummy.ts')
const { workPage, projectsCollection, casesCollection } = await load('server/utils/cms/work.ts')

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')
const legacy = buildLegacyWorkContent()
const { projects: legacyProjects } = useWorkPortfolio()
const { allCases } = useFeaturedCases()
const legacyCases = allCases.filter((c) => c.publicationStatus === 'approved')

const m = legacyToWorkMigration(legacy, legacyProjects, legacyCases, { canonicalUrl: `${siteUrl}/work` })

// ---- schema checks -----------------------------------------------------------
const fail = (msg, issues = []) => {
  console.error(`${TAG} ${msg} — nothing written.`)
  for (const i of issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const w = WorkContentSchema.safeParse(m.work)
if (!w.success) fail('Work page fails its schema', w.error.issues)
for (const p of m.projects) {
  const r = ProjectContentSchema.safeParse(p.content)
  if (!r.success) fail(`Project ${p.id} fails its schema`, r.error.issues)
}
for (const c of m.cases) {
  const r = CaseStudyContentSchema.safeParse(c.content)
  if (!r.success) fail(`Case study ${c.id} fails its schema`, r.error.issues)
}
const text = JSON.stringify(m)
const leftovers = WORK_DUMMY_MARKERS.filter((x) => text.includes(x))
if (leftovers.length) fail(`Dummy markers found (${leftovers.join(', ')})`)

// ---- round trip --------------------------------------------------------------
const src = (r) => ({ id: r.id, meta: r.legacyAnchor ? { legacyAnchor: r.legacyAnchor } : {}, content: r.content })
const { counts, ...resolved } = resolveWorkView(m.work, m.projects.map(src), m.cases.map(src))
const adapted = adaptWorkCms(legacy, { version: 1, content: resolved })
const plain = (v) => JSON.parse(JSON.stringify(v))
if (!isDeepStrictEqual(plain(adapted.hero), plain(legacy.hero))) fail('Round trip: hero differs from the current page')
if (!isDeepStrictEqual(plain(adapted.index), plain(legacy.index))) fail('Round trip: project index differs from the current page')
const expectedCases = plain(legacy.cases)
expectedCases.items = expectedCases.items
  .filter((c) => WORK_FEATURED_BASELINE.includes(c.id))
  .map((c, i) => ({ ...c, index: String(i + 1).padStart(2, '0'), metrics: ['textile', 'at-wf'].includes(c.id) ? [] : c.metrics }))
if (!isDeepStrictEqual(plain(adapted.cases), expectedCases)) fail('Round trip: featured cases differ from the expected baseline')
const expectedSeo = { ...plain(legacy.seo), canonical: `${siteUrl}/work` }
if (!isDeepStrictEqual(plain(adapted.seo), expectedSeo)) fail('Round trip: SEO differs from the current page')

const summary = {
  version: WORK_MIGRATION_VERSION,
  projects: m.projects.map((p) => `${p.id}${p.legacyAnchor ? ` (#work-${p.legacyAnchor})` : ' (not selected)'}`),
  caseStudies: m.cases.map((c) => `${c.id} → ${c.content.projectId}`),
  featured: m.work.featuredCases.items.map((i) => i.caseStudyId),
  claims: m.cases.flatMap((c) => c.content.metrics.map((x) => `${c.content.slug}: ${x.value} ${x.label} = ${x.claimStatus}`)),
  media: m.cases.flatMap((c) => c.content.gallery.map((g) => `${c.content.slug}: ${g.src} = ${g.approvalStatus}`)),
  withheldPublicly: counts
}

// ---- write -------------------------------------------------------------------
const storage = await openCmsStore(root)
const now = new Date().toISOString()
const plan = []

function decide(existing, content, label) {
  if (!existing) return 'create'
  const same = existing.source?.kind === 'migration' && existing.source.version === WORK_MIGRATION_VERSION && JSON.stringify(existing.draft.content) === JSON.stringify(content)
  if (same) return 'skip'
  if (existing.dummy) return 'replace-dummy'
  if (existing.published) fail(`${label} holds real content with a published version — refusing to overwrite. Resolve it in the CMS`)
  if (!FORCE) fail(`${label} holds real content that differs from this migration. Re-run with --force to replace the draft`)
  return 'replace-forced'
}

const workKey = workPage.RECORD_KEY
plan.push({ key: workKey, label: 'Work page', action: decide(await storage.getItem(workKey), m.work, 'The Work page'), build: () => workPage.buildMigratedRecord(m.work, WORK_MIGRATION_VERSION, now), revisions: workPage.REVISION_PREFIX })
for (const p of m.projects) {
  const key = `${projectsCollection.PREFIX}:${p.id}`
  plan.push({ key, label: p.id, action: decide(await storage.getItem(key), p.content, `Project ${p.id}`), build: () => projectsCollection.buildMigratedRecord(p.id, p.content, p.legacyAnchor ? { legacyAnchor: p.legacyAnchor } : {}, WORK_MIGRATION_VERSION, now), revisions: `collection-revisions:projects:${p.id}` })
}
for (const c of m.cases) {
  const key = `${casesCollection.PREFIX}:${c.id}`
  plan.push({ key, label: c.id, action: decide(await storage.getItem(key), c.content, `Case study ${c.id}`), build: () => casesCollection.buildMigratedRecord(c.id, c.content, {}, WORK_MIGRATION_VERSION, now), revisions: `collection-revisions:case-studies:${c.id}` })
}

// Dev-seed (dummy) records outside the migration are removed so no demo
// content can be referenced; real records outside it are left alone.
const migratedKeys = new Set(plan.map((p) => p.key))
const strayDummies = []
for (const prefix of [projectsCollection.PREFIX, casesCollection.PREFIX]) {
  for (const k of await storage.getKeys(prefix)) {
    if (migratedKeys.has(k)) continue
    const r = await storage.getItem(k)
    if (r?.dummy) strayDummies.push(k)
  }
}

const changes = plan.filter((p) => p.action !== 'skip')
if (!changes.length && !strayDummies.length) {
  console.log(`${TAG} Already migrated (${WORK_MIGRATION_VERSION}); drafts unchanged — nothing to do.`)
  process.exit(0)
}
if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify({ ...summary, actions: plan.map((p) => `${p.label}: ${p.action}`), removeDummies: strayDummies }, null, 2))
  process.exit(0)
}

for (const p of changes) {
  for (const k of await storage.getKeys(p.revisions)) await storage.removeItem(k)
  await storage.setItem(p.key, p.build())
}
for (const k of strayDummies) await storage.removeItem(k)
// Mark the collections as seeded so the dev dummy set never comes back.
await storage.setItem(projectsCollection.META_KEY, { seededAt: now, migrated: WORK_MIGRATION_VERSION })
await storage.setItem(casesCollection.META_KEY, { seededAt: now, migrated: WORK_MIGRATION_VERSION })

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'work.migrate',
  entityType: 'page',
  entityId: 'work',
  timestamp: now,
  metadata: {
    version: WORK_MIGRATION_VERSION,
    source: 'legacy /work (useWorkPortfolio + useFeaturedCases + Hero/FeaturedCases constants) + pageSeo.work',
    actions: plan.map((p) => `${p.label}: ${p.action}`),
    removedDummies: strayDummies.length,
    status: 'drafts (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${WORK_MIGRATION_VERSION} as drafts (nothing published).`)
console.log(JSON.stringify({ ...summary, actions: entry.metadata.actions, removedDummies: strayDummies }, null, 2))
