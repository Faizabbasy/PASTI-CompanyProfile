#!/usr/bin/env node
// Create the Indonesian records of Work + Insights (pages, projects, case
// studies, articles, categories) from the English ones, as unpublished drafts.
//   npm run cms:bilingual-collections [-- --dry-run] [-- --force]
//
// - Start: each English record's DRAFT (what the owner has in the CMS now).
// - Translate: wherever an English text still equals the code copy it was
//   migrated from, the Indonesian code copy (app/i18n/content/*) replaces it.
//   Text the owner changed in the CMS stays as is (to translate in the CMS).
//   Pairing: the English and Indonesian migrations list items in the same
//   order (built by cms-migrate-work / -insights --lang en|id --dump).
// - Shared values (ids, slugs, relations, images, claim / approval status,
//   which items a page shows and their order) always come from English.
// - Validate every record against its schema; nothing is written on failure.
// - Write: `pages:<id>@id` and `collections:<name>@id:<id>` as drafts. Never
//   publishes. Existing Indonesian records are kept unless they are an
//   untouched copy (never published, never saved); --force replaces any
//   never-published Indonesian draft.

import { createJiti } from 'jiti'
import { openCmsStore } from './lib/cms-store.mjs'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

const TAG = '[bilingual-collections]'
const VERSION = 'bilingual-id-v1'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production.`)
  process.exit(1)
}

// ---- both languages' code copy -------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'pasti-bilingual-'))
const dump = (script, lang) => {
  const out = join(tmp, `${script}-${lang}.json`)
  execFileSync(process.execPath, [resolve(root, 'scripts', `cms-migrate-${script}.mjs`), '--lang', lang, '--dump', out], { stdio: ['ignore', 'ignore', 'inherit'], env: process.env })
  return JSON.parse(readFileSync(out, 'utf8'))
}
const legacy = {
  work: { en: dump('work', 'en'), id: dump('work', 'id') },
  insights: { en: dump('insights', 'en'), id: dump('insights', 'id') }
}
rmSync(tmp, { recursive: true, force: true })

const jiti = createJiti(import.meta.url, { alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') }, interopDefault: true })
const load = (p) => jiti.import(resolve(root, p))
const { WorkContentSchema } = await load('shared/utils/workSchema.ts')
const { ProjectContentSchema } = await load('shared/utils/projectSchema.ts')
const { CaseStudyContentSchema } = await load('shared/utils/caseStudySchema.ts')
const { InsightsContentSchema, ArticleContentSchema, CategoryContentSchema } = await load('shared/utils/insightsSchema.ts')
const { isMediaRef } = await load('shared/cms/fields.ts')

// Keys whose values are never text to translate (ids, relations, statuses,
// enums, links, images, layout values).
const NEUTRAL = new Set([
  'id', 'slug', 'projectId', 'caseStudyId', 'articleId', 'categoryId', 'categoryIds', 'claimStatus', 'approvalStatus',
  'active', 'sortOrder', 'kind', 'mode', 'sourceRef', 'url', 'href', 'canonicalUrl', 'coverFocus', 'year', 'noIndex', 'level', 'style', 'type', 'weeks'
])

// The English draft, with every string that still equals the English code
// copy replaced by the Indonesian code copy at the same place.
function translate(draft, en, id, skip = new Set(), path = '') {
  if (skip.has(path)) return draft
  if (typeof draft === 'string') {
    if (isMediaRef(draft) || draft === '') return draft
    return typeof en === 'string' && typeof id === 'string' && en === draft ? id : draft
  }
  if (Array.isArray(draft)) {
    const pair = Array.isArray(en) && Array.isArray(id) && en.length === id.length
    return draft.map((v, i) => translate(v, pair ? en[i] : undefined, pair ? id[i] : undefined, skip, `${path}[]`))
  }
  if (draft && typeof draft === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(draft)) {
      out[k] = NEUTRAL.has(k) ? v : translate(v, en?.[k], id?.[k], skip, path ? `${path}.${k}` : k)
    }
    return out
  }
  return draft
}

// Same-position pairs: English code record → Indonesian code record, by the
// English record id (the migrated ids the DB records still carry).
function pairs(enList, idList) {
  const map = new Map()
  enList.forEach((r, i) => map.set(r.id, { en: r.content, id: idList[i]?.content }))
  return map
}

const storage = await openCmsStore(root)
const now = new Date().toISOString()
const WHO = { id: 'system', name: `Migration ${VERSION}` }
const plan = []
const fail = (msg, issues = []) => {
  console.error(`${TAG} ${msg} — nothing written.`)
  for (const i of issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}

// An Indonesian record may be replaced when it was never published and is
// either untouched (a fresh copy: revision 1) or --force is given.
function decide(existing, label) {
  if (!existing) return 'create'
  if (existing.published || existing.revisions?.length) return 'keep (published)'
  if (existing.draft?.revision === 1 || FORCE) return 'replace'
  console.log(`${TAG} ${label}: Indonesian draft was edited — kept (use --force to replace).`)
  return 'keep (edited)'
}

const translatedStrings = (a, b) => {
  let n = 0
  const walk = (x, y) => {
    if (typeof x === 'string') return void (x !== y && n++)
    if (x && typeof x === 'object') for (const k of Object.keys(x)) walk(x[k], y?.[k])
  }
  walk(a, b)
  return n
}

async function planSingleton(id, en, idCode, schema, skip) {
  const enRec = await storage.getItem(`pages:${id}`)
  if (!enRec) return console.log(`${TAG} pages:${id} — no English record, skipped.`)
  const key = `pages:${id}@id`
  const content = translate(enRec.draft.content, en, idCode, new Set(skip))
  const check = schema.safeParse(content)
  if (!check.success) fail(`${key} fails its schema`, check.error.issues)
  const existing = await storage.getItem(key)
  const action = decide(existing, key)
  plan.push({
    key, action, translated: translatedStrings(content, enRec.draft.content),
    build: () => ({
      id, dummy: false, source: { kind: 'migration', version: VERSION, migratedAt: now }, status: 'draft',
      draft: { version: 1, revision: 1, changedSincePublish: true, content, updatedAt: now, updatedBy: WHO },
      published: null, revisions: [], createdAt: now, updatedAt: now, updatedBy: WHO, publishedAt: null, publishedBy: null
    })
  })
}

async function planCollection(name, codePairs, schema) {
  const keys = await storage.getKeys(`collections:${name}`)
  for (const k of keys) {
    const enRec = await storage.getItem(k)
    if (!enRec) continue
    const key = `collections:${name}@id:${enRec.id}`
    const pair = codePairs.get(enRec.id)
    const content = pair ? translate(enRec.draft.content, pair.en, pair.id) : structuredClone(enRec.draft.content)
    const check = schema.safeParse(content)
    if (!check.success) fail(`${key} fails its schema`, check.error.issues)
    const existing = await storage.getItem(key)
    const action = decide(existing, key)
    plan.push({
      key, action, translated: translatedStrings(content, enRec.draft.content), noCodeCopy: !pair,
      build: () => ({
        id: enRec.id, dummy: !!enRec.dummy, ...(enRec.source ? { source: { kind: 'migration', version: VERSION, migratedAt: now } } : {}),
        meta: structuredClone(enRec.meta ?? {}), status: enRec.status === 'archived' ? 'archived' : 'draft',
        draft: { version: 1, revision: 1, changedSincePublish: true, content, updatedAt: now, updatedBy: WHO },
        published: null, revisions: [], createdAt: enRec.createdAt, createdBy: enRec.createdBy, updatedAt: now, updatedBy: WHO, publishedAt: null, publishedBy: null
      })
    })
  }
}

const W = legacy.work, I = legacy.insights
await planSingleton('work', W.en.work, W.id.work, WorkContentSchema, ['projectIndex.items', 'featuredCases.items'])
await planSingleton('insights', I.en.landing, I.id.landing, InsightsContentSchema, ['contents.items', 'filters.items'])
await planCollection('projects', pairs(W.en.projects, W.id.projects), ProjectContentSchema)
await planCollection('case-studies', pairs(W.en.cases, W.id.cases), CaseStudyContentSchema)
await planCollection('article-categories', pairs(I.en.categories, I.id.categories), CategoryContentSchema)
await planCollection('articles', pairs(I.en.articles, I.id.articles), ArticleContentSchema)

for (const p of plan) console.log(`${TAG} ${p.action.padEnd(16)} ${p.key}  (${p.translated} texts translated${p.noCodeCopy ? '; no code copy — English text kept' : ''})`)
const writes = plan.filter((p) => p.action === 'create' || p.action === 'replace')
if (DRY) {
  console.log(`${TAG} Dry run — would write ${writes.length} record(s).`)
  process.exit(0)
}
for (const p of writes) {
  const record = p.build()
  if (p.action === 'replace') {
    const prev = await storage.getItem(p.key)
    if (isDeepStrictEqual(prev?.draft?.content, record.draft.content)) continue
  }
  await storage.setItem(p.key, record)
}
const entry = { id: randomUUID(), userId: null, action: 'bilingual.migrate', entityType: 'page', entityId: 'work+insights', timestamp: now, metadata: { version: VERSION, lang: 'id', written: writes.map((p) => p.key), status: 'drafts (not published)' } }
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)
console.log(`${TAG} Wrote ${writes.length} Indonesian draft(s). Nothing published.`)
process.exit(0)
