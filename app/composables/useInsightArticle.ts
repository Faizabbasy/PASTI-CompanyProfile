import type { InjectionKey } from 'vue'
import type { BodyBlock } from '#shared/utils/insightsSchema'
import {
  PublicArticleResponseSchema,
  type InsightsArticleView,
  type PublicArticlePage
} from '#shared/utils/insightsPublic'

// /insights/:slug — one article's own page (2026-10-27). CMS only: legacy
// code articles have no body, so without the Insights CMS (flag off,
// unpublished, no body) the route is a 404 and the Reader stays the only way
// to read an article. The admin preview builds the same view from drafts.
//
//   GET /api/public/insights/:slug → resolveArticlePage (shared) → toArticlePageView

const pad = (n: number) => String(n).padStart(2, '0')

// Links go through useInsightArticleLink: the article's own page when it
// has a body, else the Reader on /insights (?read=).
export interface InsightArticleRef {
  view: InsightsArticleView
}
export interface InsightTocItem { id: string; text: string; level: 2 | 3 }
export interface InsightArticlePageView {
  article: InsightsArticleView & { page: NonNullable<InsightsArticleView['page']> }
  body: BodyBlock[]
  // Anchor id per body block (headings only, '' otherwise).
  anchors: string[]
  toc: InsightTocItem[]
  author: string
  // YYYY-MM-DD: the written date, else the real publish date ('' = none).
  date: string
  readMinutes: number
  position: number
  total: number
  next: InsightArticleRef | null
  more: InsightArticleRef[]
  seo: PageSeo
}

export const articleHref = (a: { slug?: string; hasBody?: boolean }) =>
  a.hasBody && a.slug ? `/insights/${a.slug}` : `/insights?read=${a.slug ?? ''}`

// Words of every text block (inline **bold** markers don't count).
function wordCount(blocks: BodyBlock[]) {
  const text = blocks
    .map((b) => (b.type === 'list' ? b.items.join(' ') : 'text' in b ? b.text : b.type === 'image' ? b.caption : ''))
    .join(' ')
    .replace(/\*+/g, '')
  return text.split(/\s+/).filter(Boolean).length
}

const anchorOf = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\*+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'bagian'

export function toArticlePageView(p: PublicArticlePage): InsightArticlePageView {
  const [view] = toInsightsArticleViews([p.article])
  const article = { ...view!, index: pad(Math.max(1, p.position)), hasBody: p.article.body.length > 0 } as InsightArticlePageView['article']
  const ref = (r: NonNullable<PublicArticlePage['next']>): InsightArticleRef => {
    const v = { ...toInsightsArticleViews([r])[0]!, index: pad(r.position), hasBody: r.hasBody }
    return { view: v }
  }

  const seen = new Map<string, number>()
  const anchors = p.article.body.map((b) => {
    if (b.type !== 'heading') return ''
    const base = anchorOf(b.text)
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n > 1 ? `${base}-${n}` : base
  })
  const toc = p.article.body.flatMap((b, i) => (b.type === 'heading' ? [{ id: anchors[i]!, text: b.text.replace(/\*+/g, ''), level: b.level }] : []))

  return {
    article,
    body: p.article.body,
    anchors,
    toc,
    author: p.article.authorName,
    date: p.article.publishDate || p.article.publishedAt.slice(0, 10),
    // ~200 words a minute; the lead (excerpt) is read too.
    readMinutes: Math.max(1, Math.round((wordCount(p.article.body) + p.article.excerpt.split(/\s+/).length) / 200)),
    position: p.position,
    total: p.total,
    next: p.next ? ref(p.next) : null,
    more: p.more.map(ref),
    seo: {
      title: `${p.article.title} | ${translate('The PASTI Journal', useLocale())}`,
      description: p.article.excerpt,
      image: p.article.coverImage
    }
  }
}

// Called once by pages/insights/[slug].vue. Anything but a published
// article with a body → 404 (CMS down → 503), never a blank page.
export async function resolveInsightArticle(slug: string) {
  const nuxtApp = useNuxtApp()
  const locale = useLocale()
  const { data } = await useAsyncData(`insight-article-${slug}-${locale}`, async () => {
    if (import.meta.server && !insightsCmsEnabled()) return { status: 'disabled' as const }
    try {
      const raw = await $fetch(`/api/public/insights/${encodeURIComponent(slug)}`, { query: { lang: locale }, timeout: 2500 })
      const parsed = PublicArticleResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[insights] article response failed validation')
        return { status: 'error' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[insights] article unavailable:', (err as Error).message)
      return { status: 'error' as const }
    }
  })
  const d = data.value
  if (d?.status !== 'published') {
    throw createError({ statusCode: d?.status === 'error' ? 503 : 404, statusMessage: d?.status === 'error' ? 'Unavailable' : 'Not Found', fatal: true })
  }
  return nuxtApp.runWithContext(() => toArticlePageView(d.content as PublicArticlePage))
}

function insightsCmsEnabled(): boolean {
  const cms = useRuntimeConfig().cms as { insightsPublicEnabled?: unknown } | undefined
  return String(cms?.insightsPublicEnabled) === 'true'
}

// Inline emphasis inside body text: **bold** and *italic* only (the body is
// plain text — no HTML). Unclosed markers stay as typed.
export type InlinePart = { text: string; strong?: boolean; em?: boolean }
export function inlineParts(text: string): InlinePart[] {
  const out: InlinePart[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index) })
    out.push(m[1] !== undefined ? { text: m[1], strong: true } : { text: m[2]!, em: true })
    last = m.index! + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

// Where "Read the full article" points. The admin previews provide their
// own (the draft article page) so editors never land on a public 404.
const ARTICLE_LINK_KEY: InjectionKey<(a: InsightsArticleView) => string> = Symbol('insight-article-link')
export function provideInsightArticleLink(fn: (a: InsightsArticleView) => string) {
  provide(ARTICLE_LINK_KEY, fn)
}
export function useInsightArticleLink() {
  const custom = inject(ARTICLE_LINK_KEY, null)
  const lp = useLocalePath()
  return (a: InsightsArticleView) => custom?.(a) ?? lp(articleHref(a))
}
