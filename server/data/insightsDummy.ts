import type { ArticleContent, CategoryContent, InsightsContent } from '#shared/utils/insightsSchema'

// DEV/DEMO seed for the Insights CMS (dummy phase). Never real content: every
// record is flagged `dummy: true`, names carry "[Dummy]" and copy is Lorem
// ipsum. Seeded as drafts only; refused publicly outside `nuxt dev`.

export const INSIGHTS_DUMMY_MARKERS = ['[Dummy]', 'Lorem ipsum']

export const INSIGHTS_DUMMY_CATEGORIES: { id: string; content: CategoryContent }[] = [
  { id: 'cat-demo-one', content: { name: '[Dummy] Tech', slug: 'demo-tech', description: 'Lorem ipsum dolor sit amet.', active: true } },
  { id: 'cat-demo-two', content: { name: '[Dummy] Biz', slug: 'demo-biz', description: '', active: true } },
  { id: 'cat-demo-off', content: { name: '[Dummy] Off', slug: 'demo-off', description: 'Inactive demo category.', active: false } }
]

const article = (n: string, cats: string[], image: string): ArticleContent => ({
  title: `[Dummy] Article ${n}`,
  slug: `demo-article-${n.toLowerCase()}`,
  kicker: 'Lorem',
  categoryIds: cats,
  headline: { text: `Lorem ${n}`, accent: 'ipsum' },
  tagline: { text: '', accent: '' },
  excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  points: ['Lorem', 'Ipsum', 'Dolor'],
  coverImage: image,
  coverImageAlt: 'Lorem ipsum dolor sit amet',
  coverFocus: '70% 40%',
  perspective: { sourceRef: '', links: [] },
  authorName: '',
  publishDate: '',
  body: [
    { type: 'heading', level: 2, text: 'Lorem ipsum' },
    { type: 'paragraph', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { type: 'list', style: 'bullet', items: ['Lorem', 'Ipsum'] }
  ]
})

export const INSIGHTS_DUMMY_ARTICLES: { id: string; content: ArticleContent }[] = [
  { id: 'art-demo-one', content: article('One', ['cat-demo-one'], '/images/insights/enterprise-technology.webp') },
  { id: 'art-demo-two', content: article('Two', ['cat-demo-two'], '/images/insights/creative-and-brand.webp') },
  { id: 'art-demo-three', content: article('Three', ['cat-demo-one', 'cat-demo-two'], '/images/insights/digital-product-ux.webp') }
]

export const INSIGHTS_DUMMY_CONTENT: InsightsContent = {
  hero: {
    eyebrow: '[Dummy] Journal',
    headline: 'Lorem',
    lede: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    primaryCtaLabel: 'Lorem ipsum',
    secondaryCtaLabel: 'Dolor sit',
    secondaryCtaUrl: '/contact'
  },
  contents: {
    sectionLabel: 'Lorem',
    title: 'Lorem ipsum',
    items: [
      { id: 'ia-demo-1', articleId: 'art-demo-one', sortOrder: 1, active: true },
      { id: 'ia-demo-2', articleId: 'art-demo-two', sortOrder: 2, active: true },
      { id: 'ia-demo-3', articleId: 'art-demo-three', sortOrder: 3, active: true }
    ]
  },
  filters: {
    items: [
      { id: 'if-demo-1', categoryId: 'cat-demo-one', sortOrder: 1, active: true },
      { id: 'if-demo-2', categoryId: 'cat-demo-two', sortOrder: 2, active: true }
    ]
  },
  seo: { metaTitle: '[Dummy] Lorem ipsum', metaDescription: 'Lorem ipsum dolor sit amet.', ogImage: '', canonicalUrl: '', noIndex: true }
}
