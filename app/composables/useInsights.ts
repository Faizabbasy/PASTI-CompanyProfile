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

/** A headline split into a plain part and an accent part (rendered in PASTI
 * Yellow on the dark Insight pages, mirroring the accent on the poster). */
export interface InsightAccentLine {
  text: string
  accent: string
}

/**
 * Homepage "topic page" content (owner redesign 2026-09-30). Every string is
 * transcribed from the text already printed on the article's poster image —
 * nothing new is claimed. `focus` is the centre (x% y% of the poster) of the
 * visual focal point the zoomed detail tile frames.
 */
export interface InsightPage {
  category: string
  /** Topic group for the /insights index filter. */
  topic: 'Technology' | 'Business' | 'Creative'
  headline: InsightAccentLine
  tagline?: InsightAccentLine
  description: string
  points: string[]
  focus: string
}

export interface InsightArticle {
  index: string
  title: string
  image: string
  role: InsightRole
  status: InsightContentStatus
  page?: InsightPage
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
    {
      index: '01',
      title: 'Cybersecurity: Protect What Matters. Build With Confidence.',
      image: '/images/insights/cybersecurity-compliance.webp',
      role: 'featured',
      status: 'existing-unverified',
      page: {
        category: 'Security', topic: 'Technology',
        headline: { text: 'Cybersecurity', accent: '' },
        tagline: { text: 'Protect What Matters.', accent: 'Build With Confidence.' },
        description: 'Advanced security solutions to safeguard your data, systems, and digital future.',
        points: ['Network Security', 'Data Encryption', 'Endpoint Protection', 'Threat Detection'],
        focus: '74.5% 48%'
      }
    },
    {
      index: '02',
      title: 'Enterprise Technology',
      image: '/images/insights/enterprise-technology.webp',
      role: 'supporting',
      status: 'existing-unverified',
      page: {
        category: 'Enterprise', topic: 'Technology',
        headline: { text: 'Enterprise', accent: 'Technology' },
        description: 'Scalable solutions and robust systems that power enterprises, streamline operations, and drive long-term value.',
        points: ['Cloud', 'Applications', 'Data', 'Security'],
        focus: '77% 29%'
      }
    },
    {
      index: '03',
      title: 'AI & Digital Transformation',
      image: '/images/insights/ai-digital-transformation.webp',
      role: 'supporting',
      status: 'existing-unverified',
      page: {
        category: 'AI', topic: 'Technology',
        headline: { text: 'AI & Digital', accent: 'Transformation' },
        description: 'Leveraging AI and emerging technologies to transform operations, elevate customer experiences, and drive sustainable growth.',
        points: ['AI Overview', 'Data Insights', 'Automation', 'Analytics'],
        focus: '79% 27%'
      }
    },
    {
      index: '04',
      title: 'The Future of Business: Innovate Today. Lead Tomorrow.',
      image: '/images/insights/future-of-business.webp',
      role: 'supporting',
      status: 'existing-unverified',
      page: {
        category: 'Business', topic: 'Business',
        headline: { text: 'The Future of Business', accent: '' },
        tagline: { text: 'Innovate Today.', accent: 'Lead Tomorrow.' },
        description: 'Embracing change, technology, and human potential to create a better tomorrow.',
        points: ['Change', 'Technology', 'Human Potential', 'A Better Tomorrow'],
        focus: '68% 27%'
      }
    },
    {
      index: '05',
      title: 'Creative & Brand',
      image: '/images/insights/creative-and-brand.webp',
      role: 'supporting',
      status: 'existing-unverified',
      page: {
        category: 'Brand', topic: 'Creative',
        headline: { text: 'Creative', accent: '& Brand' },
        description: 'Ideas that connect, stories that resonate, and brands that leave a lasting impact.',
        points: ['Concept', 'Visual Identity', 'Typography', 'Storytelling'],
        focus: '70% 40%'
      }
    },
    {
      index: '06',
      title: 'Ideas That Move Business Forward.',
      image: '/images/insights/ideas-that-move-business.webp',
      role: 'supporting',
      status: 'existing-unverified',
      page: {
        category: 'Strategy', topic: 'Business',
        headline: { text: 'Ideas That Move', accent: 'Business Forward.' },
        description: 'Insights, trends, and strategies to help you build, scale, and lead in the digital era.',
        points: ['Insights', 'Trends', 'Strategies'],
        focus: '66% 60%'
      }
    },
    {
      index: '07',
      title: 'Digital Product & UX',
      image: '/images/insights/digital-product-ux.webp',
      role: 'supporting',
      status: 'existing-unverified',
      page: {
        category: 'Product', topic: 'Creative',
        headline: { text: 'Digital Product', accent: '& UX' },
        description: 'Designing intuitive experiences and digital products that delight users and solve real problems.',
        points: ['Intuitive Experiences', 'Digital Products', 'Real Problems'],
        focus: '72% 45%'
      }
    }
  ]

  return { articles }
}
