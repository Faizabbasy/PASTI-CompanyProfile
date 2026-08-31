export interface InsightArticle {
  index: string
  title: string
  image: string
}

/**
 * Insights articles. Images sourced from .docs/image/insight*.PNG, 7 real poster-style
 * article visuals supplied by the client (each already carries its own headline, in the
 * same "full promo poster" format as Selected Work's case-study images). Titles below
 * each card were updated to match the headline shown in its image, replacing the prior
 * generic placeholder titles.
 *
 * Only the first 3 (most relevant to PASTI's enterprise/tech/security profile) render
 * in the homepage section; the full set of 7 lives on the /insights page, reached via
 * this section's "Visit insights" link.
 */
export function useInsights() {
  const articles: InsightArticle[] = [
    { index: '01', title: 'Cybersecurity: Protect What Matters. Build With Confidence.', image: '/images/insights/cybersecurity-compliance.png' },
    { index: '02', title: 'Enterprise Technology', image: '/images/insights/enterprise-technology.png' },
    { index: '03', title: 'AI & Digital Transformation', image: '/images/insights/ai-digital-transformation.png' },
    { index: '04', title: 'The Future of Business: Innovate Today. Lead Tomorrow.', image: '/images/insights/future-of-business.png' },
    { index: '05', title: 'Creative & Brand', image: '/images/insights/creative-and-brand.png' },
    { index: '06', title: 'Ideas That Move Business Forward.', image: '/images/insights/ideas-that-move-business.png' },
    { index: '07', title: 'Digital Product & UX', image: '/images/insights/digital-product-ux.png' }
  ]

  return { articles }
}
