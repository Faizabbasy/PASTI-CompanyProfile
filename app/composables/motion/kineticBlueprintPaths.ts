// app/composables/motion/kineticBlueprintPaths.ts
//
// Static SVG path/coordinate data for the Hero Kinetic Blueprint system —
// see docs/superpowers/specs/2026-09-11-hero-kinetic-blueprint-design.md.
// Deliberately free of GSAP/DOM code: this module only describes WHAT the
// composition looks like per tier, never HOW it animates. All `d` strings
// are fixed for the lifetime of the composable instance — per the spec's
// "SVG animation technique constraint", nothing here is ever interpolated
// as a path morph; only `transform`/`opacity`/`stroke-dashoffset` (declared
// per-phase below) animate.

export type BlueprintTier = 'desktop' | 'tablet' | 'mobile'

export interface BlueprintPhaseState {
  transform?: string
  opacity?: number
  strokeDashoffset?: number
}

export type BlueprintPhaseName = 'calibration' | 'construction' | 'convergence' | 'resolution' | 'handoff'

export interface BlueprintElementDef {
  id: string
  d: string
  /** 'secondary' elements are skipped entirely (not built) on tablet/mobile. */
  detail?: 'primary' | 'secondary'
  /** 'guide' elements fade out during the Resolution phase. */
  role?: 'guide'
  /** Idle-state baseline transform/opacity (before any idle timeline runs). */
  idle?: BlueprintPhaseState
  /** Authored target state for each named scroll phase. */
  phases?: Partial<Record<BlueprintPhaseName, BlueprintPhaseState>>
}

export interface BlueprintComposition {
  viewBox: string
  /** The 3 major masses: left (dominant), right (subordinate fan), bottom (anchor band). */
  masses: BlueprintElementDef[]
  constructionLines: BlueprintElementDef[]
  gridLines: BlueprintElementDef[]
  registrationMarks: BlueprintElementDef[]
  nodes: BlueprintElementDef[]
}

export const PIN_DISTANCE_VH: Record<BlueprintTier, number> = {
  desktop: 160,
  tablet: 100,
  mobile: 65
}

const VIEWBOX = '0 0 1600 900'

// --- Desktop composition (full system, spec "Visual composition") ---
const desktopComposition: BlueprintComposition = {
  viewBox: VIEWBOX,
  masses: [
    {
      id: 'mass-left',
      d: 'M -80 120 L 340 40 L 420 260 L 60 420 Z',
      idle: { transform: 'translate(0px, 0px)', opacity: 0.12 },
      phases: {
        calibration: { transform: 'translate(0px, 0px)', opacity: 0.12 },
        construction: { transform: 'translate(8px, -6px) scale(1.04)', opacity: 0.16 },
        convergence: { transform: 'translate(14px, -10px) scale(1.08)', opacity: 0.18 },
        resolution: { transform: 'translate(14px, -10px) scale(1.08)', opacity: 0.18 },
        handoff: { transform: 'translate(6px, 30px) scale(1.04)', opacity: 0.14 }
      }
    },
    {
      id: 'mass-right',
      d: 'M 1680 60 L 1420 200 L 1560 340 L 1650 180 Z',
      idle: { transform: 'translate(0px, 0px)', opacity: 0.07 },
      phases: {
        calibration: { transform: 'translate(0px, 0px)', opacity: 0.07 },
        construction: { transform: 'translate(-10px, 8px) scale(1.03)', opacity: 0.09 },
        convergence: { transform: 'translate(-16px, 12px) scale(1.05)', opacity: 0.1 },
        resolution: { transform: 'translate(-16px, 12px) scale(1.05)', opacity: 0.1 },
        handoff: { transform: 'translate(-8px, 26px) scale(1.02)', opacity: 0.08 }
      }
    },
    {
      id: 'mass-bottom',
      d: 'M -40 820 L 1640 780 L 1640 830 L -40 870 Z',
      idle: { transform: 'translate(0px, 0px)', opacity: 0.06 },
      phases: {
        calibration: { transform: 'translate(0px, 0px)', opacity: 0.06 },
        construction: { transform: 'translate(0px, -4px)', opacity: 0.08 },
        convergence: { transform: 'translate(0px, -8px)', opacity: 0.09 },
        resolution: { transform: 'translate(0px, -8px)', opacity: 0.09 },
        handoff: { transform: 'translate(0px, 60px)', opacity: 0.05 }
      }
    }
  ],
  constructionLines: [
    { id: 'cl-1', d: 'M 40 440 L 380 180', detail: 'primary', idle: { strokeDashoffset: 0, opacity: 0.2 } },
    { id: 'cl-2', d: 'M 120 460 L 400 300', detail: 'primary', idle: { strokeDashoffset: 0, opacity: 0.16 } },
    { id: 'cl-3', d: 'M 0 300 L 300 120', detail: 'secondary', role: 'guide', idle: { strokeDashoffset: 400, opacity: 0.12 } },
    { id: 'cl-4', d: 'M 60 500 L 360 380', detail: 'secondary', role: 'guide', idle: { strokeDashoffset: 400, opacity: 0.1 } },
    { id: 'cl-5', d: 'M 1600 40 L 1300 260', detail: 'primary', idle: { strokeDashoffset: 0, opacity: 0.14 } },
    { id: 'cl-6', d: 'M 1600 120 L 1250 340', detail: 'primary', idle: { strokeDashoffset: 0, opacity: 0.12 } },
    { id: 'cl-7', d: 'M 1600 200 L 1200 420', detail: 'secondary', role: 'guide', idle: { strokeDashoffset: 400, opacity: 0.1 } },
    { id: 'cl-8', d: 'M 1600 280 L 1150 480', detail: 'secondary', role: 'guide', idle: { strokeDashoffset: 400, opacity: 0.08 } }
  ],
  gridLines: [
    { id: 'grid-v1', d: 'M 533 0 L 533 900', detail: 'primary', idle: { opacity: 0.05 } },
    { id: 'grid-v2', d: 'M 1066 0 L 1066 900', detail: 'primary', idle: { opacity: 0.05 } },
    { id: 'grid-h1', d: 'M 0 300 L 1600 300', detail: 'secondary', role: 'guide', idle: { opacity: 0.04 } },
    { id: 'grid-h2', d: 'M 0 600 L 1600 600', detail: 'secondary', role: 'guide', idle: { opacity: 0.04 } }
  ],
  registrationMarks: [
    { id: 'reg-1', d: 'M 470 220 L 470 236 M 470 220 L 486 220', detail: 'secondary', role: 'guide', idle: { opacity: 0.18 } },
    { id: 'reg-2', d: 'M 1130 220 L 1130 236 M 1130 220 L 1114 220', detail: 'secondary', role: 'guide', idle: { opacity: 0.18 } },
    { id: 'reg-3', d: 'M 800 640 L 800 624 M 800 640 L 816 640', detail: 'secondary', role: 'guide', idle: { opacity: 0.14 } }
  ],
  nodes: [
    { id: 'node-1', d: 'M 340 40 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0', idle: { opacity: 1 } },
    { id: 'node-2', d: 'M 1560 340 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0', idle: { opacity: 1 } },
    { id: 'node-3', d: 'M 533 300 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0', detail: 'secondary', idle: { opacity: 1 } },
    { id: 'node-4', d: 'M 1066 600 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0', detail: 'secondary', idle: { opacity: 1 } },
    { id: 'node-5', d: 'M 800 800 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0', idle: { opacity: 1 } },
    { id: 'node-6', d: 'M 200 420 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0', detail: 'secondary', idle: { opacity: 1 } },
    { id: 'node-7', d: 'M 1420 200 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0', detail: 'secondary', idle: { opacity: 1 } }
  ]
}

// --- Tablet composition: same major masses, 'secondary' elements filtered
// out by the composable at build time (see Task 3's `buildElements`) rather
// than duplicated here with different coordinates — geometry is identical
// to desktop for masses/primary lines/nodes, only element SET differs. ---
const tabletComposition: BlueprintComposition = desktopComposition

// --- Mobile composition: masses repositioned into a narrower/taller
// coordinate space so the left mass and right fan both stay visible and the
// bottom band sits below the CTA row, per spec "Responsive art direction". ---
const mobileComposition: BlueprintComposition = {
  viewBox: VIEWBOX,
  masses: [
    {
      id: 'mass-left',
      d: 'M -60 100 L 260 40 L 320 220 L 40 320 Z',
      idle: { transform: 'translate(0px, 0px)', opacity: 0.14 },
      phases: {
        calibration: { transform: 'translate(0px, 0px)', opacity: 0.14 },
        construction: { transform: 'translate(6px, -4px) scale(1.03)', opacity: 0.17 },
        convergence: { transform: 'translate(10px, -8px) scale(1.06)', opacity: 0.19 },
        resolution: { transform: 'translate(10px, -8px) scale(1.06)', opacity: 0.19 },
        handoff: { transform: 'translate(4px, 20px) scale(1.03)', opacity: 0.15 }
      }
    },
    {
      id: 'mass-right',
      d: 'M 1660 620 L 1440 700 L 1520 800 L 1650 720 Z',
      idle: { transform: 'translate(0px, 0px)', opacity: 0.08 },
      phases: {
        calibration: { transform: 'translate(0px, 0px)', opacity: 0.08 },
        construction: { transform: 'translate(-6px, 4px) scale(1.02)', opacity: 0.1 },
        convergence: { transform: 'translate(-10px, 8px) scale(1.04)', opacity: 0.11 },
        resolution: { transform: 'translate(-10px, 8px) scale(1.04)', opacity: 0.11 },
        handoff: { transform: 'translate(-4px, 18px) scale(1.02)', opacity: 0.09 }
      }
    },
    {
      id: 'mass-bottom',
      d: 'M -40 860 L 1640 840 L 1640 880 L -40 900 Z',
      idle: { transform: 'translate(0px, 0px)', opacity: 0.07 },
      phases: {
        calibration: { transform: 'translate(0px, 0px)', opacity: 0.07 },
        construction: { transform: 'translate(0px, -3px)', opacity: 0.09 },
        convergence: { transform: 'translate(0px, -6px)', opacity: 0.1 },
        resolution: { transform: 'translate(0px, -6px)', opacity: 0.1 },
        handoff: { transform: 'translate(0px, 40px)', opacity: 0.06 }
      }
    }
  ],
  constructionLines: [
    { id: 'cl-1', d: 'M 20 320 L 260 140', detail: 'primary', idle: { strokeDashoffset: 0, opacity: 0.18 } },
    { id: 'cl-5', d: 'M 1600 680 L 1440 780', detail: 'primary', idle: { strokeDashoffset: 0, opacity: 0.12 } }
  ],
  gridLines: [],
  registrationMarks: [],
  nodes: [
    { id: 'node-1', d: 'M 260 40 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0', idle: { opacity: 1 } },
    { id: 'node-2', d: 'M 1520 800 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0', idle: { opacity: 1 } },
    { id: 'node-5', d: 'M 800 850 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0', idle: { opacity: 1 } }
  ]
}

export function getComposition(tier: BlueprintTier): BlueprintComposition {
  if (tier === 'mobile') return mobileComposition
  return tabletComposition // identical source data to desktop; element filtering happens in the composable
}
