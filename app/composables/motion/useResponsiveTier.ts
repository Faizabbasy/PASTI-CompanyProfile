/**
 * Whether the viewport currently falls in the tablet width range
 * (768-1024px). Motion composables use this to scale down interaction
 * intensity (tilt/magnetic/skew strength) for that range specifically —
 * distinct from the existing `pointer: fine` checks, which only gate
 * whether an effect runs at all, not how strong it is. A tablet with a
 * fine pointer (trackpad, stylus) still passes `pointer: fine` and should
 * still get the effect, just a gentler version of it.
 *
 * Read once at setup time rather than watched reactively — these are
 * hover/pointer composables set up once in onMounted, not components that
 * re-render on resize, so a live media-query listener would add
 * complexity with no real payoff (a tablet doesn't switch to desktop
 * width mid-session in practice).
 */
export function isTabletViewport(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches
}

/** Scales an intensity value down for the tablet range, unchanged otherwise. */
export function tabletScaled(value: number, scale = 0.5): number {
  return isTabletViewport() ? value * scale : value
}
