#!/usr/bin/env node
// Migrate the CURRENT public /insights content into the Insights CMS as
// unpublished drafts.  npm run cms:migrate-insights [-- --dry-run] [-- --force]
//
// - Source of truth: what /insights renders today. The script runs the real
//   legacy builder (buildLegacyInsightsContent → useInsights / useWhatsapp /
//   pageSeo.insights) — no copy is duplicated here.
// - Transform: shared/utils/insightsMigration.ts (deterministic ids). PASTI
//   perspectives become references to the shared sentence they quote.
// - Validate: the landing / article / category schemas the API enforces, and
//   a round trip: migrated records → public resolver → adapter must equal the
//   current page exactly (hero, contents, topics, every article).
// - Write: the local dev CMS store (.data/cms) as DRAFTS. Never publishes,
//   never touches the public flag, never edits legacy source files. The
//   homepage keeps reading useInsights() unchanged.
//
// Re-running is safe (same rules as the Work migration): unchanged → skipped,
// dummy → replaced/removed, edited real draft → refused without --force,
// anything with a published version → always refused.

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
const TAG = '[migrate-insights]'

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production — this targets the local dev CMS store only.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, { alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') }, interopDefault: true })
const load = (p) => jiti.import(resolve(root, p))
await (await import('./lib/nuxt-shims.mjs')).installNuxtShims(load, LANG)

// Nuxt auto-imports used by the legacy composables, provided as globals so the
// real, unmodified files run as-is.
const { useCompany } = await load('app/composables/useCompany.ts')
const { useWhatsapp } = await load('app/composables/useWhatsapp.ts')
const { useSelectedWork } = await load('app/composables/useSelectedWork.ts')
const { useTestimonials } = await load('app/composables/useTestimonials.ts')
const { useFeaturedCases, approvedVisuals, approvedMetrics } = await load('app/composables/useFeaturedCases.ts')
const { pageSeo } = await load('app/composables/useSeo.ts')
Object.assign(globalThis, { useCompany, useWhatsapp, useSelectedWork, useTestimonials, useFeaturedCases, approvedVisuals, approvedMetrics, pageSeo })
const { useTechnology } = await load('app/composables/useTechnology.ts')
const { useCreative } = await load('app/composables/useCreative.ts')
Object.assign(globalThis, { useTechnology, useCreative })
const { useInsights } = await load('app/composables/useInsights.ts')
globalThis.useInsights = useInsights

const { buildLegacyInsightsContent, adaptInsightsCms, resolvePerspective } = await load('app/composables/useInsightsPage.ts')
const { legacyToInsightsMigration, INSIGHTS_MIGRATION_VERSION } = await load('shared/utils/insightsMigration.ts')
const { resolveInsightsView } = await load('shared/utils/insightsPublic.ts')
const { InsightsContentSchema, ArticleContentSchema, CategoryContentSchema } = await load('shared/utils/insightsSchema.ts')
const { INSIGHTS_DUMMY_MARKERS } = await load('server/data/insightsDummy.ts')
const { insightsPage, articlesCollection, categoriesCollection } = await load('server/utils/cms/insights.ts')

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')
const legacy = buildLegacyInsightsContent()

const fail = (msg, issues = []) => {
  console.error(`${TAG} ${msg} — nothing written.`)
  for (const i of issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}

let m
try {
  m = legacyToInsightsMigration(legacy, legacy.contents.articles, resolvePerspective, { canonicalUrl: `${siteUrl}/insights` })
} catch (e) {
  fail(e.message)
}

// --dump <file>: write the built migration (this language) as JSON and stop —
// used by cms-bilingual-collections.mjs to pair English and Indonesian copy.
if (args.has('--dump')) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(process.argv[process.argv.indexOf('--dump') + 1], JSON.stringify(m))
  process.exit(0)
}

const l = InsightsContentSchema.safeParse(m.landing)
if (!l.success) fail('Insights landing fails its schema', l.error.issues)
for (const c of m.categories) {
  const r = CategoryContentSchema.safeParse(c.content)
  if (!r.success) fail(`Category ${c.id} fails its schema`, r.error.issues)
}
for (const a of m.articles) {
  const r = ArticleContentSchema.safeParse(a.content)
  if (!r.success) fail(`Article ${a.id} fails its schema`, r.error.issues)
}
const text = JSON.stringify(m)
const leftovers = INSIGHTS_DUMMY_MARKERS.filter((x) => text.includes(x))
if (leftovers.length) fail(`Dummy markers found (${leftovers.join(', ')})`)

// ---- round trip --------------------------------------------------------------
const { counts: _c, ...resolved } = resolveInsightsView(m.landing, m.articles, m.categories)
const adapted = adaptInsightsCms(legacy, { version: 1, content: resolved })
const plain = (v) => JSON.parse(JSON.stringify(v))
// Differences that are expected and not rendered: CMS articles list every
// topic (`topics`), and the perspective's internal `source` note.
const norm = (articles) => plain(articles).map((a) => {
  if (a.page) {
    delete a.page.topics
    if (a.page.pasti) delete a.page.pasti.source
  }
  return a
})
if (!isDeepStrictEqual(plain(adapted.hero), plain(legacy.hero))) fail('Round trip: hero differs from the current page')
if (adapted.contents.sectionLabel !== legacy.contents.sectionLabel || adapted.contents.title !== legacy.contents.title) fail('Round trip: contents labels differ')
if (!isDeepStrictEqual(adapted.contents.topics, legacy.contents.topics)) fail('Round trip: topic filters differ')
if (!isDeepStrictEqual(norm(adapted.contents.articles), norm(legacy.contents.articles))) fail('Round trip: articles differ from the current page')
if (!isDeepStrictEqual(plain(adapted.seo), { ...plain(legacy.seo), canonical: `${siteUrl}/insights` })) fail('Round trip: SEO differs')

const summary = {
  version: INSIGHTS_MIGRATION_VERSION,
  categories: m.categories.map((c) => `${c.id} (${c.content.name})`),
  articles: m.articles.map((a) => `${a.id} → ${a.content.categoryIds.join(',')} · perspective ${a.content.perspective.sourceRef || 'none'}`),
  filters: m.landing.filters.items.map((i) => i.categoryId)
}

// ---- write -------------------------------------------------------------------
const storage = await openCmsStore(root)
const now = new Date().toISOString()
const plan = []
function decide(existing, content, label) {
  if (!existing) return 'create'
  const same = existing.source?.kind === 'migration' && existing.source.version === INSIGHTS_MIGRATION_VERSION && JSON.stringify(existing.draft.content) === JSON.stringify(content)
  if (same) return 'skip'
  if (existing.dummy) return 'replace-dummy'
  if (existing.published) fail(`${label} holds real content with a published version — refusing to overwrite. Resolve it in the CMS`)
  if (!FORCE) fail(`${label} holds real content that differs from this migration. Re-run with --force to replace the draft`)
  return 'replace-forced'
}

plan.push({ key: insightsPage.RECORD_KEY, label: 'Insights page', action: decide(await storage.getItem(insightsPage.RECORD_KEY), m.landing, 'The Insights page'), build: () => insightsPage.buildMigratedRecord(m.landing, INSIGHTS_MIGRATION_VERSION, now), revisions: insightsPage.REVISION_PREFIX })
for (const c of m.categories) {
  const key = `${categoriesCollection.PREFIX}:${c.id}`
  plan.push({ key, label: c.id, action: decide(await storage.getItem(key), c.content, `Category ${c.id}`), build: () => categoriesCollection.buildMigratedRecord(c.id, c.content, {}, INSIGHTS_MIGRATION_VERSION, now), revisions: `collection-revisions:article-categories:${c.id}` })
}
for (const a of m.articles) {
  const key = `${articlesCollection.PREFIX}:${a.id}`
  plan.push({ key, label: a.id, action: decide(await storage.getItem(key), a.content, `Article ${a.id}`), build: () => articlesCollection.buildMigratedRecord(a.id, a.content, {}, INSIGHTS_MIGRATION_VERSION, now), revisions: `collection-revisions:articles:${a.id}` })
}

const migratedKeys = new Set(plan.map((p) => p.key))
const strayDummies = []
for (const prefix of [categoriesCollection.PREFIX, articlesCollection.PREFIX]) {
  for (const k of await storage.getKeys(prefix)) {
    if (migratedKeys.has(k)) continue
    if ((await storage.getItem(k))?.dummy) strayDummies.push(k)
  }
}

const changes = plan.filter((p) => p.action !== 'skip')
if (!changes.length && !strayDummies.length) {
  console.log(`${TAG} Already migrated (${INSIGHTS_MIGRATION_VERSION}); drafts unchanged — nothing to do.`)
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
await storage.setItem(categoriesCollection.META_KEY, { seededAt: now, migrated: INSIGHTS_MIGRATION_VERSION })
await storage.setItem(articlesCollection.META_KEY, { seededAt: now, migrated: INSIGHTS_MIGRATION_VERSION })

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'insights.migrate',
  entityType: 'page',
  entityId: 'insights',
  timestamp: now,
  metadata: {
    version: INSIGHTS_MIGRATION_VERSION,
    source: 'legacy /insights (useInsights + Masthead/Contents constants) + pageSeo.insights',
    actions: plan.map((p) => `${p.label}: ${p.action}`),
    removedDummies: strayDummies.length,
    status: 'drafts (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${INSIGHTS_MIGRATION_VERSION} as drafts (nothing published).`)
console.log(JSON.stringify({ ...summary, actions: entry.metadata.actions, removedDummies: strayDummies }, null, 2))
