// app/composables/motion/useHeroHandoff.ts
//
// Module-level singleton bridging Hero's disassembly exit to WhatWeDo's
// entrance reveal (see
// docs/legacy/superpowers/specs/2026-09-11-hero-disassembly-handoff-design.md,
// "Word ↔ facet mapping" and "Reconstruction on WhatWeDo" — legacy
// pre-rework-v2 spec; superseded by docs/rework-v2/04-homepage-spec.md
// Hero/What We Build sections for current art direction, kept here as the
// origin reference for this specific handoff mechanism). Hero computes
// where each headline word visually lands during its scroll-driven
// disassembly and publishes it here; WhatWeDo's EditorialIntro reads it
// once at mount to start its three accent words from those positions
// instead of a generic yPercent reveal. Neither component touches the
// other's DOM or ScrollTrigger — this is the only thing they share.
//
// Coordinates are viewport-relative (vw/vh + degrees), not pixels, since
// Hero and WhatWeDo are different DOM subtrees at different scroll
// offsets — a fixed-pixel handoff would go stale the moment either
// section's height changes.

export interface HandoffLandingPoint {
  xVw: number
  yVh: number
  rotation: number
}

type LandingPoints = [HandoffLandingPoint, HandoffLandingPoint, HandoffLandingPoint]

const landingPoints = ref<LandingPoints | null>(null)

export function useHeroHandoff() {
  function setLandingPoints(points: LandingPoints) {
    landingPoints.value = points
  }

  return {
    landingPoints: readonly(landingPoints),
    setLandingPoints
  }
}
