import { z } from 'zod'
import { PERSPECTIVE_REFS, type ArticleContent, type BodyBlock, type CategoryContent, type InsightsContent } from '#shared/utils/insightsSchema'

// Public Insights contract.
//
// 1. `resolveInsightsView` — pure join of the landing selections with
//    Article and Category contents. The public API runs it on PUBLISHED
//    snapshots (active categories only); the admin preview runs it on drafts.
// 2. `PublicInsightsResponse` — what GET /api/public/insights returns.
// 3. `InsightsPageContent` — the one normalized shape the /insights
//    components render, whichever source (legacy code or CMS) produced it.
//    Its article shape matches the legacy InsightArticle the Reader renders.
// 4. `resolveArticlePage` / `PublicArticleResponse` — one article's own page
//    (/insights/:slug): the summary above plus its body, author and date,
//    and the issue around it (position, next, more).

export interface InsightsAccentLine { text: string; accent: string }
export interface InsightsArticleView {
  index: string
  // CMS only: the article's slug (admin preview edit links, article pages).
  slug?: string
  // CMS only: the article has a written body, so it has its own page.
  hasBody?: boolean
  title: string
  // Cover alt text (legacy: the title).
  alt: string
  image: string
  page?: {
    category: string
    topic: string
    // CMS only: every topic the article belongs to (filter). Legacy = [topic].
    topics?: string[]
    headline: InsightsAccentLine
    tagline?: InsightsAccentLine
    description: string
    points: string[]
    focus: string
    pasti?: { label: string; text: string; source: string; links: { label: string; to: string }[] }
  }
}

export interface InsightsPageContent {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: { eyebrow: string; headline: string; lede: string; primaryCtaLabel: string; secondaryCta: { label: string; href: string } }
  contents: { sectionLabel: string; title: string; topics: string[]; articles: InsightsArticleView[] }
  seo: { title: string; description: string; image: string; canonical?: string; noIndex?: boolean }
}

// ---- resolver -------------------------------------------------------------

export interface InsightsSourceRecord<C> { id: string; content: C }

const s = z.string()
const Accent = z.object({ text: s, accent: s })
const PublicArticleSchema = z.object({
  slug: s,
  title: s,
  kicker: s,
  topics: z.array(s),
  headline: Accent,
  tagline: Accent,
  excerpt: s,
  points: z.array(s),
  coverImage: s,
  coverImageAlt: s,
  coverFocus: s,
  perspective: z.object({ sourceRef: z.enum(PERSPECTIVE_REFS), links: z.array(z.object({ label: s, url: s })) }).nullable(),
  hasBody: z.boolean()
})
const PublicInsightsContentSchema = z.object({
  hero: z.object({ eyebrow: s, headline: s.min(1), lede: s, primaryCtaLabel: s, secondaryCtaLabel: s, secondaryCtaUrl: s }),
  contents: z.object({ sectionLabel: s, title: s, articles: z.array(PublicArticleSchema) }),
  filters: z.array(s),
  seo: z.object({ metaTitle: s, metaDescription: s, ogImage: s, canonicalUrl: s, noIndex: z.boolean() })
})
export type PublicInsightsContent = z.infer<typeof PublicInsightsContentSchema>

const sorted = <T extends { sortOrder: number }>(list: T[]) => [...list].sort((a, b) => a.sortOrder - b.sortOrder)

type PublicArticle = z.infer<typeof PublicArticleSchema>
function articleSummary(c: ArticleContent, categoryById: Map<string, InsightsSourceRecord<CategoryContent>>): PublicArticle {
  return {
    slug: c.slug,
    title: c.title,
    kicker: c.kicker,
    topics: c.categoryIds.map((id) => categoryById.get(id)?.content.name).filter((n): n is string => !!n),
    headline: { ...c.headline },
    tagline: { ...c.tagline },
    excerpt: c.excerpt,
    points: [...c.points],
    coverImage: c.coverImage,
    coverImageAlt: c.coverImageAlt,
    coverFocus: c.coverFocus,
    perspective: c.perspective.sourceRef ? { sourceRef: c.perspective.sourceRef, links: c.perspective.links.map((l) => ({ ...l })) } : null,
    hasBody: c.body.length > 0
  }
}

export function resolveInsightsView(
  landing: InsightsContent,
  articles: InsightsSourceRecord<ArticleContent>[],
  categories: InsightsSourceRecord<CategoryContent>[]
): PublicInsightsContent & { counts: { missingRefs: number } } {
  const articleById = new Map(articles.map((a) => [a.id, a]))
  // Only active categories are ever offered publicly.
  const categoryById = new Map(categories.filter((c) => c.content.active).map((c) => [c.id, c]))
  let missingRefs = 0

  const shown = sorted(landing.contents.items.filter((i) => i.active))
    .map((i) => {
      const a = articleById.get(i.articleId)
      if (!a) missingRefs++
      return a ?? null
    })
    .filter((a): a is InsightsSourceRecord<ArticleContent> => !!a)
    .map((a) => articleSummary(a.content, categoryById))

  // Filter chips: selected, active categories that at least one shown article uses.
  const used = new Set(shown.flatMap((a) => a.topics))
  const filters = sorted(landing.filters.items.filter((i) => i.active))
    .map((i) => categoryById.get(i.categoryId)?.content.name)
    .filter((n): n is string => !!n && used.has(n))

  return {
    hero: { ...landing.hero },
    contents: { sectionLabel: landing.contents.sectionLabel, title: landing.contents.title, articles: shown },
    filters,
    seo: { ...landing.seo },
    counts: { missingRefs }
  }
}

// ---- response -------------------------------------------------------------

const ResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('unpublished') }),
  z.object({ status: z.literal('published'), version: z.number().int(), publishedAt: s, content: PublicInsightsContentSchema })
])
export const PublicInsightsResponseSchema = ResponseSchema
export type PublicInsightsResponse = z.infer<typeof ResponseSchema>

// ---- article page ---------------------------------------------------------

// The block shapes are validated on save (insightsSchema); the client only
// checks the envelope, then renders the block types it knows.
const PublicBlockSchema = z.object({ type: s }).passthrough()
const ArticleRefSchema = PublicArticleSchema.extend({ position: z.number().int() })
const PublicArticlePageSchema = z.object({
  article: PublicArticleSchema.extend({
    body: z.array(PublicBlockSchema),
    authorName: s,
    publishDate: s,
    // Real CMS publish time of this language's record ('' in previews).
    publishedAt: s
  }),
  // 1-based place in the issue (0 = not in the issue: previews only).
  position: z.number().int(),
  total: z.number().int(),
  next: ArticleRefSchema.nullable(),
  more: z.array(ArticleRefSchema)
})
export type PublicArticlePage = Omit<z.infer<typeof PublicArticlePageSchema>, 'article'> & {
  article: Omit<z.infer<typeof PublicArticlePageSchema>['article'], 'body'> & { body: BodyBlock[] }
}

export const ARTICLE_MORE_LIMIT = 3

// One article with the issue around it. The issue order is the landing's
// active picks. Public pages exist only for articles IN the issue with a
// written body (`requireBody`); the admin preview renders any draft.
// "More": up to 3 other articles of the issue, the ones sharing a topic first.
export function resolveArticlePage(
  landing: { contents: { items: InsightsContent['contents']['items'] } },
  articles: (InsightsSourceRecord<ArticleContent> & { publishedAt?: string | null })[],
  categories: InsightsSourceRecord<CategoryContent>[],
  slug: string,
  opts: { requireBody: boolean }
): PublicArticlePage | null {
  const articleById = new Map(articles.map((a) => [a.id, a]))
  const categoryById = new Map(categories.filter((c) => c.content.active).map((c) => [c.id, c]))
  const issue = sorted(landing.contents.items.filter((i) => i.active))
    .map((i) => articleById.get(i.articleId))
    .filter((a): a is NonNullable<typeof a> => !!a)
  const target = articles.find((a) => a.content.slug === slug)
  if (!target) return null
  const at = issue.indexOf(target)
  if (opts.requireBody && (at < 0 || !target.content.body.length)) return null

  const ref = (a: (typeof issue)[number]) => ({ ...articleSummary(a.content, categoryById), position: issue.indexOf(a) + 1 })
  const others = issue.filter((a) => a !== target)
  const next = others.length ? (at < 0 ? issue[0]! : issue[(at + 1) % issue.length]!) : null
  const self = articleSummary(target.content, categoryById)
  const shares = (a: (typeof issue)[number]) => a.content.categoryIds.some((id) => target.content.categoryIds.includes(id))
  const rest = others.filter((a) => a !== next)
  const more = [...rest.filter(shares), ...rest.filter((a) => !shares(a))].slice(0, ARTICLE_MORE_LIMIT)
  const c = target.content
  return {
    article: { ...self, body: c.body.map((b) => structuredClone(b)), authorName: c.authorName, publishDate: c.publishDate, publishedAt: target.publishedAt ?? '' },
    position: at + 1,
    total: issue.length,
    next: next ? ref(next) : null,
    more: more.map(ref)
  }
}

const ArticleResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('not-found') }),
  z.object({ status: z.literal('published'), version: z.number().int(), content: PublicArticlePageSchema })
])
export const PublicArticleResponseSchema = ArticleResponseSchema
export type PublicArticleResponse = z.infer<typeof ArticleResponseSchema>
