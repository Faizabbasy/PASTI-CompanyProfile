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
 *   completed/recorded — this is the correct status for all 4 quotes
 *   below until that task actually happens.
 * - `verified`: the §11 task has been completed and recorded (by whom/
 *   when should be tracked wherever that verification record lives —
 *   not invented here).
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
}

/**
 * Client testimonials — quotes previously supplied by the client and already
 * present in the codebase (not sourced from the content mapping doc, which
 * has no testimonial field). These are treated as `existing-unverified`, NOT
 * `verified` — their prior presence in the codebase or having been client-
 * supplied at some earlier point is not itself the §11 verification task,
 * and no such task has actually been performed here. The frozen spec's
 * 6-card baseline (1 Featured + 3 Medium + 2 Compact, §17.7 CLOSED) is
 * supported architecturally from the start; the 4 existing-unverified
 * quotes populate Featured + the 3 Medium slots, and the 2 Compact slots
 * remain explicit `placeholder`s until new client-approved quotes exist or
 * an owner sign-off accepts shipping with unresolved status
 * (08-implementation-plan.md §17.1/§17.7). Before final production sign-
 * off, every `existing-unverified` slot must actually complete §11's
 * verification task (or be replaced/marked placeholder) — do not flip this
 * to `verified` without that task actually happening.
 *
 * No avatar by default (spec-locked) — `rating` was dropped entirely: the
 * frozen spec has no field for a star/numeric rating, and inventing one
 * (or continuing to render the previous "X.X/5" numeral) would be adding
 * unapproved content, not preserving existing structure.
 */
export function useTestimonials() {
  const testimonials: Testimonial[] = [
    {
      tier: 'featured',
      status: 'existing-unverified',
      name: 'Rizki Aprianto',
      role: 'Head of Sales Perdana',
      quote:
        "Throughout our engagement and collaboration with Pasti People, I've consistently been impressed by their exceptional level of precision and attention to detail. This is particularly evident and highly valuable in their development of complex custom system cycles, where their accuracy has been absolutely crucial to the success of our projects."
    },
    {
      tier: 'medium',
      status: 'existing-unverified',
      name: 'Yodi Izharivan',
      role: 'Senior Research Fellow at Bank BSI',
      quote:
        'Collaborating with Pasti People on the UI/UX development for BSI Insight was an outstanding experience. From the initial brief to final delivery, their team demonstrated a deep understanding of our needs, responded quickly to feedback, and provided smart, solution-driven inputs throughout the process.'
    },
    {
      tier: 'medium',
      status: 'existing-unverified',
      name: 'Banu Wimbadi',
      role: 'Founder Perdana Consulting',
      quote:
        "Collaborating with Pasti People on our system development projects has proven to be highly valuable. Their ability to deliver practical, real-world solutions—paired with user-friendly systems that are easily understood even by non-technical clients—has resulted in a high level of client satisfaction. Pasti People demonstrates both technical expertise and a deep understanding of user needs"
    },
    {
      tier: 'medium',
      status: 'existing-unverified',
      name: 'Calvin Kim',
      role: 'CMO of Dingo Korea',
      quote:
        'The systems developed by Pasti People are not only technically sound but also easy to implement and adopt. Their structured approach and clear communication make the entire process smooth and efficient for all stakeholders involved'
    },
    {
      tier: 'compact',
      status: 'placeholder',
      name: 'Pending client approval',
      role: 'Placeholder — content not yet sourced',
      quote: 'Lorem ipsum dolor sit amet — testimonial pending client sourcing and verification.'
    },
    {
      tier: 'compact',
      status: 'placeholder',
      name: 'Pending client approval',
      role: 'Placeholder — content not yet sourced',
      quote: 'Lorem ipsum dolor sit amet — testimonial pending client sourcing and verification.'
    }
  ]

  return { testimonials }
}
