import {
  ArticleContentSchema,
  CategoryContentSchema,
  InsightsContentSchema,
  type ArticleContent,
  type ArticleExtra,
  type ArticleListRow,
  type CategoryContent,
  type CategoryExtra,
  type CategoryListRow,
  type InsightsContent,
  type InsightsContentInput
} from '#shared/utils/insightsSchema'
import { resolveInsightsView } from '#shared/utils/insightsPublic'
import { INSIGHTS_DUMMY_ARTICLES, INSIGHTS_DUMMY_CATEGORIES, INSIGHTS_DUMMY_CONTENT } from '../../data/insightsDummy'
import { defineCollection, type CollectionRecord } from './collection'
import { defineSingletonPage } from './singletonPage'

// Insights CMS = three layers on the shared engines (same as Work):
//
//   insights   singleton  (pages:insights)                 — masthead + which articles / filters
//   articles   collection (collections:articles:*)          — editorial content
//   categories collection (collections:article-categories:*) — topic taxonomy
//
// References are checked server-side on save / publish / archive / delete.

type ArticleRec = CollectionRecord<ArticleContent>
type CategoryRec = CollectionRecord<CategoryContent>

function fieldError(statusCode: 400 | 422, path: string, message: string): never {
  throw createError({ statusCode, statusMessage: statusCode === 400 ? 'Invalid input' : 'Not ready to publish', data: { fields: [{ path, message }] } })
}
function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categoriesCollection = defineCollection<CategoryContent>({
  name: 'article-categories',
  entityType: 'category',
  idPrefix: 'cat',
  schema: CategoryContentSchema,
  lists: [],
  actions: { create: 'category.create', update: 'category.update', publish: 'category.publish', unpublish: 'category.unpublish', archive: 'category.archive', delete: 'category.delete' },
  dummyRecords: INSIGHTS_DUMMY_CATEGORIES,
  async validate(content, { id }) {
    const all = await categoriesCollection.readAll()
    if (all.some((r) => r.id !== id && r.draft.content.slug === content.slug)) fieldError(400, 'slug', 'Another category already uses this slug.')
    if (all.some((r) => r.id !== id && r.draft.content.name.toLowerCase() === content.name.toLowerCase())) fieldError(400, 'name', 'Another category already uses this name.')
  },
  async beforeArchive(rec) {
    const used = (await articlesCollection.readAll()).filter((a) => a.status !== 'archived' && a.draft.content.categoryIds.includes(rec.id))
    if (used.length) conflict(`This category is used by ${used.length} article(s). Reassign them first.`)
    const use = await landingUsage()
    if (use.categories.draftActive.has(rec.id) || use.categories.publishedActive.has(rec.id)) conflict('This category is a filter on the Insights page. Remove or deactivate it there first.')
  },
  async beforeDelete(rec) {
    const used = (await articlesCollection.readAll()).filter((a) => a.draft.content.categoryIds.includes(rec.id) || a.published?.content.categoryIds.includes(rec.id))
    if (used.length) conflict(`This category is used by ${used.length} article(s). Reassign them first.`)
    if ((await landingUsage()).categories.any.has(rec.id)) conflict('This category is referenced by the Insights page. Remove it there first.')
  }
})

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const articlesCollection = defineCollection<ArticleContent>({
  name: 'articles',
  entityType: 'article',
  idPrefix: 'art',
  schema: ArticleContentSchema,
  lists: [],
  actions: { create: 'article.create', update: 'article.update', publish: 'article.publish', unpublish: 'article.unpublish', archive: 'article.archive', delete: 'article.delete' },
  dummyRecords: INSIGHTS_DUMMY_ARTICLES,
  async validate(content, { id }) {
    const all = await articlesCollection.readAll()
    if (all.some((r) => r.id !== id && r.draft.content.slug === content.slug)) fieldError(400, 'slug', 'Another article already uses this slug.')
    for (const [i, cid] of content.categoryIds.entries()) {
      const c = await categoriesCollection.peek(cid)
      if (!c) fieldError(400, `categoryIds.${i}`, 'This category does not exist.')
      if (c.status === 'archived') fieldError(400, `categoryIds.${i}`, 'This category is archived.')
    }
  },
  async beforePublish(rec) {
    for (const [i, cid] of rec.draft.content.categoryIds.entries()) {
      const c = await categoriesCollection.peek(cid)
      if (c?.status !== 'published') fieldError(422, `categoryIds.${i}`, 'Publish this category first.')
    }
  },
  async beforeArchive(rec) {
    const use = await landingUsage()
    if (use.articles.draftActive.has(rec.id) || use.articles.publishedActive.has(rec.id)) conflict('This article is in the Insights issue. Remove or deactivate it there first.')
  },
  async beforeDelete(rec) {
    if ((await landingUsage()).articles.any.has(rec.id)) conflict('This article is referenced by the Insights page. Remove it there first.')
  }
})

// ---------------------------------------------------------------------------
// Insights landing (singleton)
// ---------------------------------------------------------------------------

async function validateLandingRefs(content: InsightsContent | InsightsContentInput) {
  const articles = new Map((await articlesCollection.readAll()).map((r) => [r.id, r]))
  const categories = new Map((await categoriesCollection.readAll()).map((r) => [r.id, r]))
  content.contents.items.forEach((i, n) => {
    const a = articles.get(i.articleId)
    if (!a) fieldError(400, `contents.items.${n}.articleId`, 'This article does not exist.')
    if (a.status === 'archived') fieldError(400, `contents.items.${n}.articleId`, 'This article is archived.')
  })
  content.filters.items.forEach((i, n) => {
    const c = categories.get(i.categoryId)
    if (!c) fieldError(400, `filters.items.${n}.categoryId`, 'This category does not exist.')
    if (c.status === 'archived') fieldError(400, `filters.items.${n}.categoryId`, 'This category is archived.')
  })
}

async function assertLandingRefsPublished(content: InsightsContent) {
  const articles = new Map((await articlesCollection.readAll()).map((r) => [r.id, r]))
  const categories = new Map((await categoriesCollection.readAll()).map((r) => [r.id, r]))
  content.contents.items.forEach((i, n) => {
    if (i.active && articles.get(i.articleId)?.status !== 'published') fieldError(422, `contents.items.${n}.articleId`, 'Publish this article first, or set it inactive.')
  })
  content.filters.items.forEach((i, n) => {
    if (i.active && categories.get(i.categoryId)?.status !== 'published') fieldError(422, `filters.items.${n}.categoryId`, 'Publish this category first, or set it inactive.')
  })
}

export const insightsPage = defineSingletonPage<'insights', InsightsContent, InsightsContentInput>({
  id: 'insights',
  schema: InsightsContentSchema,
  dummyContent: INSIGHTS_DUMMY_CONTENT,
  lists: [
    { path: 'contents.items', prefix: 'ia' },
    { path: 'filters.items', prefix: 'if' }
  ],
  actions: { update: 'insights.update', publish: 'insights.publish', unpublish: 'insights.unpublish', archive: 'insights.archive' },
  validate: validateLandingRefs,
  beforePublish: assertLandingRefsPublished
})

async function landingUsage() {
  const r = await insightsPage.peekRecord()
  const sets = () => ({ any: new Set<string>(), draftActive: new Set<string>(), publishedActive: new Set<string>() })
  const out = { articles: sets(), categories: sets() }
  if (!r) return out
  const add = (c: InsightsContent, kind: 'draftActive' | 'publishedActive') => {
    for (const i of c.contents.items) {
      out.articles.any.add(i.articleId)
      if (i.active) out.articles[kind].add(i.articleId)
    }
    for (const i of c.filters.items) {
      out.categories.any.add(i.categoryId)
      if (i.active) out.categories[kind].add(i.categoryId)
    }
  }
  add(r.draft.content, 'draftActive')
  if (r.published) add(r.published.content, r.status === 'published' ? 'publishedActive' : 'draftActive')
  return out
}

export async function ensureInsightsSeeded() {
  await categoriesCollection.ensureSeeded()
  await articlesCollection.ensureSeeded()
}

// ---------------------------------------------------------------------------
// Admin views
// ---------------------------------------------------------------------------

export async function listArticleRows(): Promise<ArticleListRow[]> {
  await ensureInsightsSeeded()
  const [articles, categories, use] = await Promise.all([articlesCollection.readAll(), categoriesCollection.readAll(), landingUsage()])
  const name = (id: string) => categories.find((c) => c.id === id)?.draft.content.name ?? `Unknown (${id})`
  return articles.map((a) => ({
    id: a.id,
    title: a.draft.content.title,
    slug: a.draft.content.slug,
    categories: a.draft.content.categoryIds.map(name),
    status: a.status,
    dummy: a.dummy,
    source: a.source ?? { kind: 'seed' },
    hasUnpublishedChanges: a.draft.changedSincePublish,
    publishedVersion: a.published?.version ?? null,
    inIssue: use.articles.draftActive.has(a.id) || use.articles.publishedActive.has(a.id),
    updatedAt: a.updatedAt,
    updatedBy: a.updatedBy
  }))
}

export async function listCategoryRows(): Promise<CategoryListRow[]> {
  await ensureInsightsSeeded()
  const [articles, categories] = await Promise.all([articlesCollection.readAll(), categoriesCollection.readAll()])
  return categories.map((c) => ({
    id: c.id,
    name: c.draft.content.name,
    slug: c.draft.content.slug,
    active: c.draft.content.active,
    status: c.status,
    dummy: c.dummy,
    source: c.source ?? { kind: 'seed' },
    hasUnpublishedChanges: c.draft.changedSincePublish,
    articleCount: articles.filter((a) => a.status !== 'archived' && a.draft.content.categoryIds.includes(c.id)).length,
    updatedAt: c.updatedAt,
    updatedBy: c.updatedBy
  }))
}

export async function articleAdminResponse(rec: ArticleRec) {
  const use = await landingUsage()
  const extra: ArticleExtra = {
    publishedSlug: rec.published?.content.slug ?? null,
    usedInLanding: { draft: use.articles.draftActive.has(rec.id), published: use.articles.publishedActive.has(rec.id) }
  }
  return { state: articlesCollection.toAdminState(rec, extra), revision: rec.draft.revision }
}

export async function categoryAdminResponse(rec: CategoryRec) {
  const articles = await articlesCollection.readAll()
  const extra: CategoryExtra = {
    articleCount: articles.filter((a) => a.status !== 'archived' && a.draft.content.categoryIds.includes(rec.id)).length,
    publishedSlug: rec.published?.content.slug ?? null
  }
  return { state: categoriesCollection.toAdminState(rec, extra), revision: rec.draft.revision }
}

export async function getInsightsPreviewData() {
  await ensureInsightsSeeded()
  const draft = await insightsPage.getDraftContent()
  const src = <C>(r: CollectionRecord<C>) => ({ id: r.id, status: r.status, content: r.draft.content })
  const [articles, categories] = await Promise.all([articlesCollection.readAll(), categoriesCollection.readAll()])
  return {
    insights: draft,
    articles: articles.filter((r) => r.status !== 'archived').map(src),
    categories: categories.filter((r) => r.status !== 'archived').map(src)
  }
}

export async function getArticlePreviewData(id: string) {
  const r = await articlesCollection.read(id)
  const cats = await categoriesCollection.readAll()
  return {
    record: { id: r.id, status: r.status, version: r.draft.version, updatedAt: r.draft.updatedAt, content: r.draft.content },
    categories: cats.filter((c) => c.status !== 'archived').map((c) => ({ id: c.id, status: c.status, content: c.draft.content }))
  }
}

// For the generated record routes (categories have no preview page).
export async function getCategoryPreviewData(id: string) {
  const r = await categoriesCollection.read(id)
  return { record: { id: r.id, status: r.status, version: r.draft.version, updatedAt: r.draft.updatedAt, content: r.draft.content } }
}

// ---------------------------------------------------------------------------
// Public read path
// ---------------------------------------------------------------------------

// Published landing joined with PUBLISHED articles and PUBLISHED + active
// categories only. No drafts, actors or workflow metadata; the body, author
// and date are not public yet (no detail page). Never seeds.
export async function getPublishedInsights(lang: CmsLang = 'en') {
  const snap = await insightsPage.forLocale(lang).getPublishedSnapshot()
  if (!snap) return null
  const [articles, categories] = await Promise.all([articlesCollection.getPublishedAll(), categoriesCollection.getPublishedAll()])
  const toSrc = <C>(r: { id: string; content: C }) => ({ id: r.id, content: r.content })
  const { counts: _counts, ...content } = resolveInsightsView(snap.content, articles.map(toSrc), categories.map(toSrc))
  const usedIds = new Set([...snap.content.contents.items.map((i) => i.articleId), ...snap.content.filters.items.map((i) => i.categoryId)])
  const dummy = snap.dummy || [...articles, ...categories].some((r) => r.dummy && usedIds.has(r.id))
  return { dummy, version: snap.version, publishedAt: snap.publishedAt, content }
}
