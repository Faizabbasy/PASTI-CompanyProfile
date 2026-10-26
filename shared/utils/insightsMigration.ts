import { PERSPECTIVE_REFS, type ArticleContent, type CategoryContent, type InsightsContent, type PerspectiveRef } from '#shared/utils/insightsSchema'

// CURRENT public /insights content → Insights CMS records (deterministic, no
// new copy). Used by scripts/cms-migrate-insights.mjs; nothing is published.
// Only the 7 articles shown today are migrated (owner 2026-10-23: the drafts
// in docs/insights/drafts stay out until reviewed). Author, date and body are
// left empty — the current site has none.

export const INSIGHTS_MIGRATION_VERSION = 'insights-v1'

export interface LegacyInsightArticle {
  index: string
  title: string
  image: string
  page?: {
    category: string
    topic: string
    headline: { text: string; accent: string }
    tagline?: { text: string; accent: string }
    description: string
    points: string[]
    focus: string
    pasti?: { label: string; text: string; links: { label: string; to: string }[] }
  }
}
export interface LegacyInsightsPage {
  hero: { eyebrow: string; headline: string; lede: string; primaryCtaLabel: string; secondaryCta: { label: string; href: string } }
  contents: { sectionLabel: string; title: string; topics: string[] }
  seo: { title: string; description: string; image: string }
}

export const insightsSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')

export interface InsightsMigration {
  landing: InsightsContent
  categories: { id: string; content: CategoryContent }[]
  articles: { id: string; content: ArticleContent }[]
}

export function legacyToInsightsMigration(
  page: LegacyInsightsPage,
  articles: LegacyInsightArticle[],
  // The app-side resolver: which shared sentence a ref points at.
  resolve: (ref: PerspectiveRef) => { label: string; text: string } | null,
  opts: { canonicalUrl: string }
): InsightsMigration {
  const categories = page.contents.topics.map((t) => ({ id: `cat-${insightsSlug(t)}`, content: { name: t, slug: insightsSlug(t), description: '', active: true } }))

  const out = articles.map((a) => {
    const p = a.page
    if (!p) throw new Error(`Article ${a.index} has no page content`)
    const slug = insightsSlug(`${p.headline.text} ${p.headline.accent}`)
    let sourceRef: '' | PerspectiveRef = ''
    if (p.pasti) {
      const match = PERSPECTIVE_REFS.find((r) => {
        const res = resolve(r)
        return res && res.text === p.pasti!.text && res.label === p.pasti!.label
      })
      if (!match) throw new Error(`Article ${a.index}: PASTI perspective does not match any shared source`)
      sourceRef = match
    }
    return {
      id: `art-${slug}`,
      content: {
        title: a.title,
        slug,
        kicker: p.category,
        categoryIds: [`cat-${insightsSlug(p.topic)}`],
        headline: { ...p.headline },
        tagline: p.tagline ? { ...p.tagline } : { text: '', accent: '' },
        excerpt: p.description,
        points: [...p.points],
        coverImage: a.image,
        // The page renders the title as the cover alt today.
        coverImageAlt: a.title,
        coverFocus: p.focus,
        perspective: { sourceRef, links: (p.pasti?.links ?? []).map((l) => ({ label: l.label, url: l.to })) },
        authorName: '',
        publishDate: '',
        body: []
      } satisfies ArticleContent
    }
  })

  const landing: InsightsContent = {
    hero: {
      eyebrow: page.hero.eyebrow,
      headline: page.hero.headline,
      lede: page.hero.lede,
      primaryCtaLabel: page.hero.primaryCtaLabel,
      secondaryCtaLabel: page.hero.secondaryCta.label,
      secondaryCtaUrl: page.hero.secondaryCta.href
    },
    contents: {
      sectionLabel: page.contents.sectionLabel,
      title: page.contents.title,
      items: out.map((a, i) => ({ id: `ia-${a.content.slug}`, articleId: a.id, sortOrder: i + 1, active: true }))
    },
    filters: { items: categories.map((c, i) => ({ id: `if-${c.content.slug}`, categoryId: c.id, sortOrder: i + 1, active: true })) },
    seo: { metaTitle: page.seo.title, metaDescription: page.seo.description, ogImage: page.seo.image, canonicalUrl: opts.canonicalUrl, noIndex: false }
  }

  return { landing, categories, articles: out }
}
