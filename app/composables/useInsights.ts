/**
 * Composition role per 04-homepage-spec.md §7's locked homepage architecture:
 * exactly 1 Featured (Digital Editorial Feature) + 3 Supporting, relatively
 * close in visual weight. Not a ranking of editorial importance — a
 * composition-state role, same "visual hierarchy, not priority" principle
 * as Testimoni's tier field.
 */
export type InsightRole = 'featured' | 'supporting'

/**
 * Content-verification status — same principle as Testimoni's
 * `TestimonialContentStatus` (08-implementation-plan.md §17.1 CLOSED):
 * existing-in-code/client-supplied content is not automatically
 * `verified` production content. None of these articles have completed
 * the §11 verification task (title/claim accuracy, image licensing/
 * production-readiness, brand-naming consistency) as part of this
 * milestone — all 7 are `existing-unverified` until that task actually
 * happens and is recorded.
 */
export type InsightContentStatus = 'existing-unverified' | 'verified' | 'placeholder'

export interface InsightArticle {
  index: string
  title: string
  image: string
  role: InsightRole
  status: InsightContentStatus
}

/**
 * Insights articles. Images sourced from .docs/image/insight*.PNG, 7 poster-style
 * article visuals previously supplied by the client (each already carries its own
 * headline, in the same "full promo poster" format as Selected Work's case-study
 * images) — treated as `existing-unverified`, not `verified`: having been supplied
 * earlier and already present in the codebase is not itself the §11 verification
 * task, and no such task has been performed here. Titles below each card were
 * updated to match the headline shown in its image, replacing the prior generic
 * placeholder titles — this is a copy-matching correction, not a verification.
 *
 * Homepage composition per the frozen spec: exactly 4 articles (1 Featured + 3
 * Supporting) — the first 4 here (most relevant to PASTI's enterprise/tech/security
 * profile) carry that role; the full set of 7 lives on the /insights page, reached
 * via this section's "View all" link. Featured = the article the spec calls a
 * Digital Editorial Feature, not necessarily "most important." Before final
 * production sign-off, every `existing-unverified` article must actually complete
 * §11's verification task (or be replaced/marked placeholder).
 */
export function useInsights() {
  const articles: InsightArticle[] = [
    { index: '01', title: 'Cybersecurity: Protect What Matters. Build With Confidence.', image: '/images/insights/cybersecurity-compliance.png', role: 'featured', status: 'existing-unverified' },
    { index: '02', title: 'Enterprise Technology', image: '/images/insights/enterprise-technology.png', role: 'supporting', status: 'existing-unverified' },
    { index: '03', title: 'AI & Digital Transformation', image: '/images/insights/ai-digital-transformation.png', role: 'supporting', status: 'existing-unverified' },
    { index: '04', title: 'The Future of Business: Innovate Today. Lead Tomorrow.', image: '/images/insights/future-of-business.png', role: 'supporting', status: 'existing-unverified' },
    { index: '05', title: 'Creative & Brand', image: '/images/insights/creative-and-brand.png', role: 'supporting', status: 'existing-unverified' },
    { index: '06', title: 'Ideas That Move Business Forward.', image: '/images/insights/ideas-that-move-business.png', role: 'supporting', status: 'existing-unverified' },
    { index: '07', title: 'Digital Product & UX', image: '/images/insights/digital-product-ux.png', role: 'supporting', status: 'existing-unverified' }
  ]

  return { articles }
}
