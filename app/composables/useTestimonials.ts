/**
 * Composition tier per 04-homepage-spec.md §5's locked 6-card baseline (1
 * Featured + 3 Medium + 2 Compact). This is a VISUAL hierarchy for this
 * composition state only — it does not rank testimonial credibility (spec:
 * "One Visual Anchor, Not One Superior Testimonial").
 */
export type TestimonialTier = 'featured' | 'medium' | 'compact'

/**
 * Content-verification status — NOT a stand-in for "does content exist."
 * Existing-in-code or client-supplied content does not automatically
 * qualify as verified production content (08-implementation-plan.md §17.1
 * CLOSED decision: "existing-in-code never automatically means
 * production-approved"). Only mark a slot `verified` once the actual
 * verification task in §11 has been performed and recorded — quote
 * authenticity, name, role, company, public-display consent/approval
 * where applicable, and brand-naming consistency. None of that
 * verification work has been performed as part of this milestone.
 *
 * - `existing-unverified`: real content already supplied by the client and
 *   present in the codebase, but the §11 verification task has NOT been
 *   completed/recorded.
 * - `verified`: the §11 task has been completed and recorded — the four
 *   quotes below, by owner confirmation on 2026-10-16.
 * - `placeholder`: an explicit empty slot, no real content, Lorem-ipsum
 *   copy per the frozen global copy rule.
 */
export type TestimonialContentStatus = 'existing-unverified' | 'verified' | 'placeholder'

export interface Testimonial {
  tier: TestimonialTier
  status: TestimonialContentStatus
  name: string
  role: string
  quote: string
  /** Round client portrait under /public. Optional: cards fall back to the
   * initials monogram when it's missing. */
  photo?: string
}

/**
 * Client testimonials (owner-confirmed as real, 2026-10-16 — the same four
 * quotes the client shows on its current site, so status is `verified`).
 *
 * Owner decisions 2026-10-16:
 * - "Pasti People" inside the quotes → "PASTI" (current brand name, COMPRO
 *   p.2); every other word is the client's own.
 * - No star rating (all five-star, adds no information).
 * - Portraits: INTERIM ~75px crops from a screenshot of the current site,
 *   upscaled to 160px — only shown small (attribution rows). Replace the
 *   files in /public/images/testimonials/ with the originals when supplied.
 * - The two Lorem placeholder slots were removed.
 */
export function useTestimonials() {
  const testimonials: Testimonial[] = [
    {
      tier: 'featured',
      status: 'verified',
      name: 'Rizki Aprianto',
      role: 'Head of Sales Perdana',
      photo: '/images/testimonials/rizki-aprianto.webp',
      quote:
        "Throughout our engagement and collaboration with PASTI, I've consistently been impressed by their exceptional level of precision and attention to detail. This is particularly evident and highly valuable in their development of complex custom system cycles, where their accuracy has been absolutely crucial to the success of our projects."
    },
    {
      tier: 'medium',
      status: 'verified',
      name: 'Yodi Izharivan',
      role: 'Senior Research Fellow at Bank BSI',
      photo: '/images/testimonials/yodi-izharivan.webp',
      quote:
        'Collaborating with PASTI on the UI/UX development for BSI Insight was an outstanding experience. From the initial brief to final delivery, their team demonstrated a deep understanding of our needs, responded quickly to feedback, and provided smart, solution-driven inputs throughout the process.'
    },
    {
      tier: 'medium',
      status: 'verified',
      name: 'Banu Wimbadi',
      role: 'Founder Perdana Consulting',
      photo: '/images/testimonials/banu-wimbadi.webp',
      quote:
        "Collaborating with PASTI on our system development projects has proven to be highly valuable. Their ability to deliver practical, real-world solutions—paired with user-friendly systems that are easily understood even by non-technical clients—has resulted in a high level of client satisfaction. PASTI demonstrates both technical expertise and a deep understanding of user needs"
    },
    {
      tier: 'medium',
      status: 'verified',
      name: 'Calvin Kim',
      role: 'CMO of Dingo Korea',
      photo: '/images/testimonials/calvin-kim.webp',
      quote:
        'The systems developed by PASTI are not only technically sound but also easy to implement and adopt. Their structured approach and clear communication make the entire process smooth and efficient for all stakeholders involved'
    }
  ]

  return { testimonials }
}
