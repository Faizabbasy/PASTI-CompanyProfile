// app/composables/motion/kineticBlueprintPaths.ts
//
// Static SVG path/coordinate/gradient data for the Hero "Signal
// Architecture" system — see
// docs/superpowers/specs/2026-09-11-hero-signal-architecture-design.md.
// Pure data: no GSAP/DOM code. All `d` strings are fixed for the lifetime
// of the composable instance — nothing here is ever path-morphed; only
// transform/opacity/gradient-stop-offset/stroke-dashoffset/filter (applied
// by the composable and CSS) animate.

export type BlueprintTier = 'desktop' | 'tablet' | 'mobile'

export interface FacetPhaseState {
  x?: number
  y?: number
  rotation?: number
  scale?: number
  opacity?: number
}

export type ScrollPhaseName = 'wake' | 'expansion' | 'lock' | 'release' | 'handoff'

export interface FacetDef {
  id: 'plate-a' | 'plate-b' | 'plate-c'
  d: string
  gradientId: string
  /** Idle-state baseline opacity. */
  opacity: number
  /** Exact aligned transform this facet animates to for the Facet Lock
   *  signature event and the scroll "lock" phase — edges meet precisely
   *  at this position across all three facets. */
  lockTarget: { x: number; y: number; rotation: number }
  /** Authored target state for each named scroll phase. */
  phases?: Partial<Record<ScrollPhaseName, FacetPhaseState>>
}

export interface GradientStopDef {
  offset: number
  color: string
}

export interface GradientDef {
  id: string
  type: 'linear' | 'radial'
  /** Angle in degrees for linear gradients, converted to x1/y1/x2/y2 by the
   *  component template. Ignored for radial gradients. */
  angle?: number
  stops: GradientStopDef[]
}

export interface SignalComposition {
  viewBox: string
  facets: FacetDef[]
  gradients: GradientDef[]
}

export const PIN_DISTANCE_VH: Record<BlueprintTier, number> = {
  desktop: 160,
  tablet: 100,
  mobile: 65
}

const VIEWBOX = '0 0 1600 900'

// Tailwind navy/yellow scale values (tailwind.config.ts) — hard-coded here
// since gradient <stop> color attributes must be literal color values, not
// theme() references (those only resolve in compiled Tailwind CSS, not in
// imperatively-created SVG attributes).
const NAVY_900 = '#051B28'
const NAVY_700 = '#0B3954'
const NAVY_600 = '#124A64'
const NAVY_500 = '#1C5E7C'
const NAVY_400 = '#3F839F'
const NAVY_300 = '#6FA2B7'
const YELLOW_600 = '#D69C00'
const YELLOW_500 = '#FBBA00'
const YELLOW_300 = '#FFDA4D'

// Three-stop gradients (rather than a flat two-color fade) so each facet
// reads as a material surface catching a light source at one edge — a
// brighter mid-stop simulates a highlight/reflection band instead of a
// uniform vector wash.
const desktopGradients: GradientDef[] = [
  {
    id: 'grad-plate-a',
    type: 'linear',
    angle: 128,
    stops: [
      { offset: 0, color: NAVY_900 },
      { offset: 45, color: NAVY_600 },
      { offset: 62, color: NAVY_400 },
      { offset: 100, color: NAVY_500 }
    ]
  },
  {
    id: 'grad-plate-b',
    type: 'linear',
    angle: 42,
    stops: [
      { offset: 0, color: NAVY_700 },
      { offset: 50, color: NAVY_400 },
      { offset: 68, color: NAVY_300 },
      { offset: 100, color: NAVY_500 }
    ]
  },
  {
    id: 'grad-plate-c',
    type: 'radial',
    stops: [
      { offset: 0, color: YELLOW_300 },
      { offset: 35, color: YELLOW_600 },
      { offset: 100, color: NAVY_600 }
    ]
  }
]

// --- Desktop composition ---
const desktopComposition: SignalComposition = {
  viewBox: VIEWBOX,
  facets: [
    {
      id: 'plate-a',
      d: 'M -100 -50 L 680 -30 L 980 340 L 620 640 L -100 400 Z',
      gradientId: 'grad-plate-a',
      opacity: 0.62,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.62 },
        expansion: { x: -20, y: -10, rotation: -1, scale: 1.12, opacity: 0.68 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.12, opacity: 0.74 },
        release: { x: 10, y: 40, rotation: 1, scale: 1.05, opacity: 0.6 },
        handoff: { x: 20, y: 140, rotation: 1.5, scale: 1, opacity: 0.32 }
      }
    },
    {
      id: 'plate-b',
      d: 'M 900 260 L 1720 480 L 1500 900 L 780 620 L 950 400 Z',
      gradientId: 'grad-plate-b',
      opacity: 0.48,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.48 },
        expansion: { x: 25, y: -15, rotation: 1, scale: 1.12, opacity: 0.54 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.12, opacity: 0.6 },
        release: { x: -10, y: 35, rotation: -1, scale: 1.05, opacity: 0.46 },
        handoff: { x: -15, y: 130, rotation: -1.5, scale: 1, opacity: 0.24 }
      }
    },
    {
      id: 'plate-c',
      d: 'M 1150 40 L 1580 20 L 1620 260 L 1280 300 Z',
      gradientId: 'grad-plate-c',
      opacity: 0.36,
      lockTarget: { x: -15, y: 25, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.36 },
        expansion: { x: 10, y: -10, rotation: 2, scale: 1.08, opacity: 0.42 },
        lock: { x: -15, y: 25, rotation: 0, scale: 1.08, opacity: 0.48 },
        release: { x: 60, y: 120, rotation: 4, scale: 0.95, opacity: 0.26 },
        handoff: { x: 90, y: 220, rotation: 6, scale: 0.85, opacity: 0 }
      }
    }
  ],
  gradients: desktopGradients
}

// --- Tablet composition: same fractured-plate geometry as desktop (still
// reads as one dominant structure at tablet width via viewBox scaling). ---
const tabletComposition: SignalComposition = desktopComposition

// --- Mobile composition: repositioned into a narrower/taller effective
// footprint so plate-a stays the dominant visible mass in portrait
// orientation, with the secondary band anchored below the CTA row. ---
const mobileComposition: SignalComposition = {
  viewBox: VIEWBOX,
  facets: [
    {
      id: 'plate-a',
      d: 'M -100 -50 L 620 -20 L 880 360 L 500 700 L -100 420 Z',
      gradientId: 'grad-plate-a',
      opacity: 0.64,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.64 },
        expansion: { x: -12, y: -8, rotation: -1, scale: 1.08, opacity: 0.7 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.08, opacity: 0.76 },
        release: { x: 8, y: 30, rotation: 1, scale: 1.03, opacity: 0.6 },
        handoff: { x: 15, y: 110, rotation: 1.5, scale: 1, opacity: 0.32 }
      }
    },
    {
      id: 'plate-b',
      d: 'M 780 480 L 1650 640 L 1500 900 L 700 780 L 820 600 Z',
      gradientId: 'grad-plate-b',
      opacity: 0.46,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.46 },
        expansion: { x: 15, y: -10, rotation: 1, scale: 1.08, opacity: 0.52 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.08, opacity: 0.58 },
        release: { x: -8, y: 25, rotation: -1, scale: 1.02, opacity: 0.44 },
        handoff: { x: -12, y: 100, rotation: -1.5, scale: 1, opacity: 0.22 }
      }
    },
    {
      id: 'plate-c',
      d: 'M 1000 40 L 1560 20 L 1600 220 L 1180 260 Z',
      gradientId: 'grad-plate-c',
      opacity: 0.34,
      lockTarget: { x: -10, y: 18, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.34 },
        expansion: { x: 8, y: -8, rotation: 2, scale: 1.05, opacity: 0.4 },
        lock: { x: -10, y: 18, rotation: 0, scale: 1.05, opacity: 0.46 },
        release: { x: 40, y: 90, rotation: 4, scale: 0.95, opacity: 0.24 },
        handoff: { x: 60, y: 170, rotation: 6, scale: 0.85, opacity: 0 }
      }
    }
  ],
  gradients: desktopGradients
}

export function getComposition(tier: BlueprintTier): SignalComposition {
  if (tier === 'mobile') return mobileComposition
  return tabletComposition // identical source data to desktop; node count trimmed by the composable
}
