import { z } from 'zod'
import { PERSPECTIVE_REFS, type ArticleContent, type CategoryContent, type InsightsContent } from '#shared/utils/insightsSchema'

// Public Insights contract.
//
// 1. `resolveInsightsView` — pure join of the landing selections with
//    Article and Category contents. The public API runs it on PUBLISHED
//    snapshots (active categories only); the admin preview runs it on drafts.
// 2. `PublicInsightsResponse` — what GET /api/public/insights returns.
// 3. `InsightsPageContent` — the one normalized shape the /insights
//    components render, whichever source (legacy code or CMS) produced it.
//    Its article shape matches the legacy InsightArticle the Reader renders.

export interface InsightsAccentLine { text: string; accent: string }
export interface InsightsArticleView {
  index: string
  // CMS only: the article's slug (admin preview edit links, article pages).
  slug?: string
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
  perspective: z.object({ sourceRef: z.enum(PERSPECTIVE_REFS), links: z.array(z.object({ label: s, url: s })) }).nullable()
})
const PublicInsightsContentSchema = z.object({
  hero: z.object({ eyebrow: s, headline: s.min(1), lede: s, primaryCtaLabel: s, secondaryCtaLabel: s, secondaryCtaUrl: s }),
  contents: z.object({ sectionLabel: s, title: s, articles: z.array(PublicArticleSchema) }),
  filters: z.array(s),
  seo: z.object({ metaTitle: s, metaDescription: s, ogImage: s, canonicalUrl: s, noIndex: z.boolean() })
})
export type PublicInsightsContent = z.infer<typeof PublicInsightsContentSchema>

const sorted = <T extends { sortOrder: number }>(list: T[]) => [...list].sort((a, b) => a.sortOrder - b.sortOrder)

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
    .map((a) => {
      const c = a.content
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
        perspective: c.perspective.sourceRef ? { sourceRef: c.perspective.sourceRef, links: c.perspective.links.map((l) => ({ ...l })) } : null
      }
    })

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
