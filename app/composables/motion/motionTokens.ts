/**
 * Centralized motion values — durations, easings, and stagger amounts used
 * across the GSAP-driven composables in this folder. Every value here is
 * copied verbatim from what each composable already used before this file
 * existed (see git history), so adopting these tokens is a pure rename,
 * not a motion redesign: no visual behavior changes.
 *
 * Named groups follow the "instant/fast/medium/slow/editorial/spring/exit"
 * families referenced in the project's motion context doc, mapped onto the
 * durations/easings actually in use rather than inventing a new scale.
 */

export const motionDuration = {
  /** Cursor-spotlight glide while actively tracking the pointer. */
  hover: 0.3,
  /** Quick pointer-follow settle (card tilt hover, spotlight leave). */
  fast: 0.4,
  /** Default hover/interaction settle (magnetic pull, ambient skew). */
  medium: 0.5,
  /** Snap-back / release easing after a fast interaction. */
  mediumSlow: 0.6,
  /** Primary scroll-reveal entrance (masked text, generic fade-up). */
  editorial: 0.8,
  /** Large-scale entrance beats (Hero word reveal). */
  slow: 0.9,
  /** Outgoing/leave-transition beats — deliberately quicker than entrances. */
  exit: 0.35
} as const

export const motionEase = {
  /** Standard scroll-reveal / settle easing used almost everywhere. */
  standard: 'power3.out',
  /** Softer settle for snap-backs and short pointer interactions. */
  soft: 'power2.out',
  /** Leave-transition easing — accelerates out rather than decelerating in. */
  exit: 'power2.in',
  /** Count-up / numeric reveal easing. */
  count: 'sine.out'
} as const

export const motionStagger = {
  /** Tight per-character/word stagger inside a single reveal unit. */
  tight: 0.015,
  /** Leave-transition stagger for scroll-reveal groups. */
  exitGroup: 0.02,
  /** Default useMaskedReveal / useScrollReveal per-word or per-card stagger. */
  base: 0.05,
  /** Slightly looser stagger (Trust logo grid, service rows). */
  loose: 0.08,
  /** Wide stagger for a small number of large elements (Testimonials cards). */
  wide: 0.15
} as const

/**
 * Spatial-depth motion language, added for the large-scale spatial motion
 * pass (see .docs/context/LARGE_SCALE_MOTION_PLAN.md). Kept alongside the
 * groups above rather than merged into them — these three eases carry a
 * specific narrative meaning ("approaching focus" / "arriving and
 * stopping" / "ambient loop") that's reused consistently across Hero,
 * Trust, Testimonials, Footer, so the *feel* of movement stays unified
 * even though each section's mechanic differs.
 */
export const spatialEase = {
  /** Element approaching camera / coming into focus. */
  enter: 'power4.out',
  /** Camera/viewpoint arriving and stopping (pin exits, footer collapse). */
  settle: 'expo.out',
  /** Ambient looping motion (glows, idle breathing). */
  drift: 'sine.inOut'
} as const

export const spatialDuration = {
  /** Large depth transitions: Hero exit, Selected Work pin handoff. */
  cinematic: 1.6
} as const
