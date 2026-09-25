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

/**
 * Approved Controlled-Momentum tokens (docs/rework-v2/06-design-tokens.json
 * `motion`), added for Milestone 1 (Global Foundation) per
 * 08-implementation-plan.md §3.7. These are the FROZEN, spec-authoritative
 * duration tiers and easing family — new section work should reference
 * these directly rather than reinventing timing. The groups above
 * (motionDuration/motionEase/motionStagger/spatialEase/spatialDuration)
 * are UNCHANGED and still valid for their existing call sites; this is a
 * pure addition, not a replacement, per the plan's "no motion redesign,
 * pure rename/addition" discipline for this composable.
 */
export const motionTier = {
  /** 06-design-tokens.json motion.duration — seconds. */
  microMin: 0.12,
  microMax: 0.25,
  standardMin: 0.3,
  standardMax: 0.6,
  cinematicMin: 0.8,
  cinematicMax: 1.6
} as const

export const interactionTiming = {
  /** 06-design-tokens.json motion.interactionTiming — seconds. */
  hoverFocusMin: 0.12,
  hoverFocusMax: 0.15,
  openCloseMin: 0.2,
  openCloseMax: 0.3
} as const

/**
 * Approved easing family (06-design-tokens.json motion.ease). Use
 * `approvedEase.gsapStandard`/`gsapPrimary`/`gsapCinematic` as GSAP ease
 * strings, `approvedEase.cssPrimary` for raw CSS transitions (same value
 * as main.css's `--ease-css-primary`). Forbidden per the same token:
 * bounce, elastic, spring, cartoon-overshoot — never use gsap's
 * `back.out`/`elastic.out`/`bounce.out` families.
 */
export const approvedEase = {
  cssPrimary: 'cubic-bezier(0.16, 1, 0.3, 1)',
  gsapPrimary: 'power4.out',
  gsapStandard: 'power3.out',
  gsapCinematic: 'expo.out'
} as const

/**
 * Shared reduced-motion matchMedia query strings — the established pattern
 * across this folder's composables (see useScrollReveal.ts /
 * useMaskedReveal.ts) is `gsap.matchMedia().add(reducedMotionQuery.reduce,
 * ...)`, repeated inline per file. Centralized here so new composables
 * reference the same two strings instead of retyping the media-query text,
 * without changing how any existing composable already calls
 * `gsap.matchMedia()` (pure addition, no behavior change to existing
 * call sites — those keep their own inline strings unless separately
 * migrated). See also app.vue's `data-reduced-motion` attribute for the
 * plain-CSS equivalent of the same check.
 */
export const reducedMotionQuery = {
  reduce: '(prefers-reduced-motion: reduce)',
  noPreference: '(prefers-reduced-motion: no-preference)'
} as const

/**
 * MILESTONE 5A FINAL CLOSURE — single semantic source for the JS-side
 * width queries every Heavy/Medium homepage section's `gsap.matchMedia()`/
 * `window.matchMedia()` split uses, so `768px`/`767px` stop being a
 * repeated magic number scattered per file. Values are the exact pixel
 * boundaries from `06-design-tokens.json`'s `breakpoint` block (also
 * mirrored as `tailwind.config.ts`'s `tablet`/`desktop`/`wide` aliases —
 * one canonical breakpoint system, not two):
 *
 *   < 640        → Mobile   → Recomposed Experience
 *   640–1023     → Tablet   → Reduced Complexity
 *   >= 1024      → Desktop  → Full Experience
 *   >= 1440      → Wide     → Desktop composition + wide-only refinements
 *
 * Owner-locked responsive model (Milestone 5A final closure): full
 * pinned/sticky/Heavy desktop choreography activates at `desktop` (1024px),
 * NOT at the legacy `768px` Tailwind `md` boundary — 768px sits inside the
 * frozen Tablet tier, so keeping it as the "full experience" threshold
 * would silently give Tablet viewports the Desktop-Heavy treatment. Below
 * `desktop`, sections use their Tablet-labeled reduced-complexity branch;
 * below `tablet`, their Mobile-labeled recomposed branch — see each
 * section's own matchMedia usage for what "reduced complexity" means for
 * that specific section (05-homepage rework Milestone 5A commit history).
 */
export const breakpointQuery = {
  /** Reduced Complexity floor — matches Tablet and up (>= 640px). */
  tabletUp: '(min-width: 640px)',
  /** Recomposed Experience ceiling — matches below Tablet (< 640px). */
  belowTablet: '(max-width: 639px)',
  /** Full Experience floor — matches Desktop and up (>= 1024px). Use this,
   * not `768px`, to gate any section's full pinned/sticky/Heavy
   * choreography. */
  desktopUp: '(min-width: 1024px)',
  /** Reduced Complexity ceiling — matches below Desktop (< 1024px), i.e.
   * Tablet and Mobile combined. Use this to gate a section's simplified/
   * non-pinned branch when it intentionally serves both Tablet and Mobile
   * with the same composition. */
  belowDesktop: '(max-width: 1023px)',
  /** Tablet tier only, both bounds (640px–1023px inclusive). Use this when
   * a section needs to distinguish Tablet from Mobile within its
   * "reduced complexity" branch (e.g. spacing/sizing tuning), rather than
   * treating the whole sub-desktop range identically. */
  tabletOnly: '(min-width: 640px) and (max-width: 1023px)',
  /** Wide tier floor — matches Wide and up (>= 1440px), for desktop-
   * composition-plus-refinement tuning only, never a new layout branch. */
  wideUp: '(min-width: 1440px)'
} as const
