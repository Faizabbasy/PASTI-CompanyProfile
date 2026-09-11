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

export interface RailDef {
  id: 'primary-rail'
  d: string
}

export interface BandDef {
  id: 'secondary-band'
  d: string
}

export interface NodeDef {
  id: string
  cx: number
  cy: number
  r: number
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
  rail: RailDef
  band: BandDef
  nodes: NodeDef[]
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
const NAVY_500 = '#1C5E7C'
const NAVY_300 = '#6FA2B7'
const YELLOW_600 = '#D69C00'
const YELLOW_500 = '#FBBA00'

const desktopGradients: GradientDef[] = [
  { id: 'grad-plate-a', type: 'linear', angle: 128, stops: [{ offset: 0, color: NAVY_900 }, { offset: 100, color: NAVY_500 }] },
  { id: 'grad-plate-b', type: 'linear', angle: 42, stops: [{ offset: 0, color: NAVY_700 }, { offset: 100, color: NAVY_300 }] },
  { id: 'grad-plate-c', type: 'radial', stops: [{ offset: 0, color: YELLOW_600 }, { offset: 100, color: NAVY_500 }] }
]

// --- Desktop composition ---
const desktopComposition: SignalComposition = {
  viewBox: VIEWBOX,
  facets: [
    {
      id: 'plate-a',
      d: 'M -100 -50 L 680 -30 L 980 340 L 620 640 L -100 400 Z',
      gradientId: 'grad-plate-a',
      opacity: 0.42,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.42 },
        expansion: { x: -20, y: -10, rotation: -1, scale: 1.12, opacity: 0.46 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.12, opacity: 0.5 },
        release: { x: 10, y: 40, rotation: 1, scale: 1.05, opacity: 0.4 },
        handoff: { x: 20, y: 140, rotation: 1.5, scale: 1, opacity: 0.2 }
      }
    },
    {
      id: 'plate-b',
      d: 'M 900 260 L 1720 480 L 1500 900 L 780 620 L 950 400 Z',
      gradientId: 'grad-plate-b',
      opacity: 0.32,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.32 },
        expansion: { x: 25, y: -15, rotation: 1, scale: 1.12, opacity: 0.36 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.12, opacity: 0.4 },
        release: { x: -10, y: 35, rotation: -1, scale: 1.05, opacity: 0.3 },
        handoff: { x: -15, y: 130, rotation: -1.5, scale: 1, opacity: 0.15 }
      }
    },
    {
      id: 'plate-c',
      d: 'M 1150 40 L 1580 20 L 1620 260 L 1280 300 Z',
      gradientId: 'grad-plate-c',
      opacity: 0.22,
      lockTarget: { x: -15, y: 25, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.22 },
        expansion: { x: 10, y: -10, rotation: 2, scale: 1.08, opacity: 0.26 },
        lock: { x: -15, y: 25, rotation: 0, scale: 1.08, opacity: 0.3 },
        release: { x: 60, y: 120, rotation: 4, scale: 0.95, opacity: 0.16 },
        handoff: { x: 90, y: 220, rotation: 6, scale: 0.85, opacity: 0 }
      }
    }
  ],
  rail: { id: 'primary-rail', d: 'M 100 850 L 1500 80' },
  band: { id: 'secondary-band', d: 'M -50 760 L 1650 700 L 1650 860 L -50 900 Z' },
  nodes: [
    { id: 'node-1', cx: 620, cy: 640, r: 6 },
    { id: 'node-2', cx: 980, cy: 340, r: 6 },
    { id: 'node-3', cx: 1500, cy: 80, r: 5 },
    { id: 'node-4', cx: 100, cy: 850, r: 5 }
  ],
  gradients: desktopGradients
}

// --- Tablet composition: same fractured-plate geometry as desktop (still
// reads as one dominant structure at tablet width via viewBox scaling);
// only the node count is trimmed by the composable at build time. ---
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
      opacity: 0.44,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.44 },
        expansion: { x: -12, y: -8, rotation: -1, scale: 1.08, opacity: 0.48 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.08, opacity: 0.52 },
        release: { x: 8, y: 30, rotation: 1, scale: 1.03, opacity: 0.4 },
        handoff: { x: 15, y: 110, rotation: 1.5, scale: 1, opacity: 0.2 }
      }
    },
    {
      id: 'plate-b',
      d: 'M 780 480 L 1650 640 L 1500 900 L 700 780 L 820 600 Z',
      gradientId: 'grad-plate-b',
      opacity: 0.3,
      lockTarget: { x: 0, y: 0, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.3 },
        expansion: { x: 15, y: -10, rotation: 1, scale: 1.08, opacity: 0.34 },
        lock: { x: 0, y: 0, rotation: 0, scale: 1.08, opacity: 0.38 },
        release: { x: -8, y: 25, rotation: -1, scale: 1.02, opacity: 0.28 },
        handoff: { x: -12, y: 100, rotation: -1.5, scale: 1, opacity: 0.14 }
      }
    },
    {
      id: 'plate-c',
      d: 'M 1000 40 L 1560 20 L 1600 220 L 1180 260 Z',
      gradientId: 'grad-plate-c',
      opacity: 0.2,
      lockTarget: { x: -10, y: 18, rotation: 0 },
      phases: {
        wake: { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0.2 },
        expansion: { x: 8, y: -8, rotation: 2, scale: 1.05, opacity: 0.24 },
        lock: { x: -10, y: 18, rotation: 0, scale: 1.05, opacity: 0.28 },
        release: { x: 40, y: 90, rotation: 4, scale: 0.95, opacity: 0.14 },
        handoff: { x: 60, y: 170, rotation: 6, scale: 0.85, opacity: 0 }
      }
    }
  ],
  rail: { id: 'primary-rail', d: 'M 80 860 L 1400 100' },
  band: { id: 'secondary-band', d: 'M -50 820 L 1650 790 L 1650 870 L -50 900 Z' },
  nodes: [
    { id: 'node-1', cx: 500, cy: 700, r: 6 },
    { id: 'node-2', cx: 880, cy: 360, r: 5 }
  ],
  gradients: desktopGradients
}

export function getComposition(tier: BlueprintTier): SignalComposition {
  if (tier === 'mobile') return mobileComposition
  return tabletComposition // identical source data to desktop; node count trimmed by the composable
}
