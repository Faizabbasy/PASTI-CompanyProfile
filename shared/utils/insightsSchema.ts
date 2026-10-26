import { z } from 'zod'
import {
  itemId,
  linkUrl,
  maxActive,
  mediaRef,
  recordRef,
  SeoSchema,
  slug,
  sortOrder,
  text,
  type ActorRef,
  type PageSource,
  type PageStatus,
  type SingletonAdminState,
  type WithId
} from '#shared/cms/fields'

// Insights CMS — three layers on the shared core:
//
//   Insights landing (singleton) — masthead copy, which articles the issue
//                                  shows (order + active) and which topic
//                                  filters appear. References only.
//   Articles (collection)        — the editorial content of each insight.
//   Categories (collection)      — the topic taxonomy (filter chips).
//
// Maps the CURRENT /insights: masthead → "Contents" list with topic filter →
// full-screen Reader. There is no /insights/:slug route yet (owner
// 2026-10-23): body blocks, author and date are modelled but not rendered.
// Microcopy ("All", "Read insight", "In this insight", "Next", "View full
// poster"…), layout and motion stay in code. The homepage keeps reading the
// legacy useInsights() — it never reads this CMS.

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export const CATEGORY_LIMITS = { name: 20, description: 200 } as const

const CategoryContentObject = z
  .object({
    name: text(CATEGORY_LIMITS.name, { required: true }),
    slug,
    description: text(CATEGORY_LIMITS.description),
    // Off = never offered publicly (filter, article label), even if published.
    active: z.boolean()
  })
  .strict()
export const CategoryContentSchema = CategoryContentObject
export type CategoryContent = z.infer<typeof CategoryContentObject>

export interface CategoryListRow {
  id: string
  name: string
  slug: string
  active: boolean
  status: PageStatus
  dummy: boolean
  source: PageSource
  hasUnpublishedChanges: boolean
  articleCount: number
  updatedAt: string
  updatedBy: ActorRef
}
export interface CategoryExtra {
  articleCount: number
  publishedSlug: string | null
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

export const ARTICLE_LIMITS = {
  title: 90,
  kicker: 20,
  headline: 28,
  accent: 28,
  tagline: 36,
  excerpt: 240,
  point: 28,
  points: 4,
  alt: 160,
  linkLabel: 44,
  links: 3,
  categories: 3,
  author: 60,
  blocks: 60,
  paragraph: 2000,
  heading: 120,
  quote: 600,
  listItem: 300,
  listItems: 20,
  caption: 200
} as const

// PASTI perspective = a sentence that already lives in shared company content
// (a Technology / Creative service description, the company vision or the
// founder's quote). Articles reference it; the text is never copied here.
export const PERSPECTIVE_REFS = [
  'technology:technology-development',
  'technology:custom-built-ai-solutions',
  'technology:enterprise-platforms',
  'technology:mobile-app-development-mvp',
  'technology:cybersecurity-compliance-architecture',
  'technology:system-maintenance-sla-support',
  'creative:creative-communication',
  'creative:integrated-campaign-strategy',
  'creative:social-media-playbooks-management',
  'creative:vertical-video-development',
  'creative:production-house-services',
  'creative:brand-identity-ui-ux-design',
  'company:vision',
  'company:founder-quote'
] as const
export type PerspectiveRef = (typeof PERSPECTIVE_REFS)[number]

// "x% y%" — the poster's visual focal point (Reader cover crop).
const FOCUS = /^(100|[1-9]?\d)(\.\d)?% (100|[1-9]?\d)(\.\d)?%$/

const AccentLine = (max: number, accentMax: number, required: boolean) =>
  z.object({ text: text(max, { required }), accent: text(accentMax) }).strict()

// Structured body (prepared for a future /insights/:slug page; not rendered
// publicly yet). Plain text only — no HTML, no embeds, no custom CSS/JS.
const BlockParagraph = z.object({ type: z.literal('paragraph'), text: text(ARTICLE_LIMITS.paragraph, { required: true }) }).strict()
const BlockHeading = z.object({ type: z.literal('heading'), level: z.union([z.literal(2), z.literal(3)]), text: text(ARTICLE_LIMITS.heading, { required: true }) }).strict()
const BlockQuote = z.object({ type: z.literal('quote'), text: text(ARTICLE_LIMITS.quote, { required: true }), attribution: text(120) }).strict()
const BlockList = z
  .object({
    type: z.literal('list'),
    style: z.enum(['bullet', 'numbered']),
    items: z.array(text(ARTICLE_LIMITS.listItem, { required: true })).min(1, 'Add at least one item.').max(ARTICLE_LIMITS.listItems, `Max ${ARTICLE_LIMITS.listItems} items.`)
  })
  .strict()
const BlockImage = z
  .object({ type: z.literal('image'), src: mediaRef.refine((v) => v !== '', 'Required.'), alt: text(ARTICLE_LIMITS.alt, { required: true }), caption: text(ARTICLE_LIMITS.caption) })
  .strict()
const BlockDivider = z.object({ type: z.literal('divider') }).strict()
const BodyBlockUnion = z.discriminatedUnion('type', [BlockParagraph, BlockHeading, BlockQuote, BlockList, BlockImage, BlockDivider])
export const BodyBlockSchema = BodyBlockUnion
export type BodyBlock = z.infer<typeof BodyBlockUnion>

const ArticleContentObject = z
  .object({
    // Plain title: Reader dialog label, poster alt default, "Now showing", "Next".
    title: text(ARTICLE_LIMITS.title, { required: true }),
    slug,
    // Small label next to the topic (e.g. Security, Enterprise).
    kicker: text(ARTICLE_LIMITS.kicker, { required: true }),
    // First = primary topic (label); all are used by the topic filter.
    categoryIds: z
      .array(recordRef)
      .min(1, 'Pick at least one category.')
      .max(ARTICLE_LIMITS.categories, `Max ${ARTICLE_LIMITS.categories} categories.`)
      .refine((l) => new Set(l).size === l.length, 'Duplicate category.'),
    // Display headline; the accent part renders in yellow.
    headline: AccentLine(ARTICLE_LIMITS.headline, ARTICLE_LIMITS.accent, true),
    tagline: AccentLine(ARTICLE_LIMITS.tagline, ARTICLE_LIMITS.tagline, false),
    excerpt: text(ARTICLE_LIMITS.excerpt, { required: true }),
    // "In this insight" grid (2–4 cells fit the design; 0 hides it).
    points: z
      .array(text(ARTICLE_LIMITS.point, { required: true }))
      .max(ARTICLE_LIMITS.points, `Max ${ARTICLE_LIMITS.points} points.`)
      .refine((l) => l.length !== 1, 'Use at least 2 points, or none.'),
    coverImage: mediaRef.refine((v) => v !== '', 'Required.'),
    coverImageAlt: text(ARTICLE_LIMITS.alt, { required: true }),
    coverFocus: z.string().trim().refine((v) => FOCUS.test(v), 'Use "x% y%", e.g. 70% 40%.'),
    perspective: z
      .object({
        // '' = no PASTI perspective block.
        sourceRef: z.union([z.literal(''), z.enum(PERSPECTIVE_REFS)]),
        links: z
          .array(z.object({ label: text(ARTICLE_LIMITS.linkLabel, { required: true }), url: linkUrl.refine((v) => v !== '', 'Required.') }).strict())
          .max(ARTICLE_LIMITS.links, `Max ${ARTICLE_LIMITS.links} links.`)
      })
      .strict()
      .superRefine((p, ctx) => {
        if (!p.sourceRef && p.links.length) ctx.addIssue({ code: 'custom', path: ['links'], message: 'Links only show with a perspective — pick a source first.' })
      }),
    // Prepared, not rendered yet (no detail page). Never invent these.
    authorName: text(ARTICLE_LIMITS.author),
    publishDate: z
      .string()
      .trim()
      .refine((v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), 'Use YYYY-MM-DD or leave empty.'),
    body: z.array(BodyBlockUnion).max(ARTICLE_LIMITS.blocks, `Max ${ARTICLE_LIMITS.blocks} blocks.`)
  })
  .strict()
export const ArticleContentSchema = ArticleContentObject
export type ArticleContent = z.infer<typeof ArticleContentObject>

export interface ArticleListRow {
  id: string
  title: string
  slug: string
  categories: string[]
  status: PageStatus
  dummy: boolean
  source: PageSource
  hasUnpublishedChanges: boolean
  publishedVersion: number | null
  inIssue: boolean
  updatedAt: string
  updatedBy: ActorRef
}
export interface ArticleExtra {
  publishedSlug: string | null
  usedInLanding: { draft: boolean; published: boolean }
}

// ---------------------------------------------------------------------------
// Insights landing (singleton)
// ---------------------------------------------------------------------------

export const INSIGHTS_LIMITS = {
  // Measured (copy stress test 390–1920px): longer eyebrows push the hero
  // marker past a 390px phone; the word fits 8 letters with an initial
  // capital only (8 capitals overflow the mobile column).
  eyebrow: 18,
  // One word set at hero-title scale and filled with the posters.
  headlineWord: 8,
  lede: 180,
  ctaLabel: 22,
  sectionLabel: 20,
  title: 18,
  articles: 24,
  articlesActive: 12,
  filters: 8
} as const

function atLeastOneActive(label: string) {
  return (list: { active: boolean }[], ctx: z.RefinementCtx) => {
    if (!list.some((i) => i.active)) ctx.addIssue({ code: 'custom', message: `Keep at least one active ${label}.` })
  }
}
function uniqueBy<T>(get: (i: T) => string, label: string) {
  return (list: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>()
    list.forEach((item, i) => {
      if (seen.has(get(item))) ctx.addIssue({ code: 'custom', path: [i], message: `Duplicate ${label}.` })
      seen.add(get(item))
    })
  }
}

const InsightsContentObject = z
  .object({
    hero: z
      .object({
        eyebrow: text(INSIGHTS_LIMITS.eyebrow, { required: true }),
        headline: text(INSIGHTS_LIMITS.headlineWord, { required: true })
          .refine((v) => !/\s/.test(v), 'One word — the design fills its letters with the posters.')
          .refine((v) => !/[A-Z]/.test(v.slice(1)), 'Capitalise the first letter only — capitals are wider and overflow on phones.')
          .refine((v) => !/[.!?]$/.test(v), 'Leave out the final period — the design adds it.'),
        lede: text(INSIGHTS_LIMITS.lede, { required: true }),
        // Scrolls to the contents (code-managed action).
        primaryCtaLabel: text(INSIGHTS_LIMITS.ctaLabel, { required: true }),
        secondaryCtaLabel: text(INSIGHTS_LIMITS.ctaLabel, { required: true }),
        secondaryCtaUrl: linkUrl.refine((v) => v !== '', 'Required.')
      })
      .strict(),
    contents: z
      .object({
        sectionLabel: text(INSIGHTS_LIMITS.sectionLabel, { required: true }),
        // The yellow period is added by the design.
        title: text(INSIGHTS_LIMITS.title, { required: true }).refine((v) => !/[.!?]$/.test(v), 'Leave out the final period — the design adds it.'),
        items: z
          .array(z.object({ id: itemId, articleId: recordRef, sortOrder, active: z.boolean() }).strict())
          .max(INSIGHTS_LIMITS.articles, `Max ${INSIGHTS_LIMITS.articles} articles.`)
          .superRefine(maxActive(INSIGHTS_LIMITS.articlesActive, 'articles'))
          .superRefine(atLeastOneActive('article'))
          .superRefine(uniqueBy((i: { articleId: string }) => i.articleId, 'article'))
      })
      .strict(),
    // Topic filter chips: which categories appear and in which order.
    filters: z
      .object({
        items: z
          .array(z.object({ id: itemId, categoryId: recordRef, sortOrder, active: z.boolean() }).strict())
          .max(INSIGHTS_LIMITS.filters, `Max ${INSIGHTS_LIMITS.filters} filters.`)
          .superRefine(uniqueBy((i: { categoryId: string }) => i.categoryId, 'category'))
      })
      .strict(),
    seo: SeoSchema
  })
  .strict()
export const InsightsContentSchema = InsightsContentObject
export type InsightsContentInput = z.infer<typeof InsightsContentObject>
type ArticlePick = InsightsContentInput['contents']['items'][number]
type FilterPick = InsightsContentInput['filters']['items'][number]
export interface InsightsContent extends Omit<InsightsContentInput, 'contents' | 'filters'> {
  contents: Omit<InsightsContentInput['contents'], 'items'> & { items: WithId<ArticlePick>[] }
  filters: { items: WithId<FilterPick>[] }
}
export type InsightsAdminState = SingletonAdminState<'insights', InsightsContent>
