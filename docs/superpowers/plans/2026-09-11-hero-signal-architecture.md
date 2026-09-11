# Hero Signal Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the just-built Kinetic Blueprint Hero background (rejected as too thin/decorative) with "Signal Architecture" — a bold, high-occupation 2D SVG+GSAP graphic identity: a 3-facet fractured primary plate + rail (~55-65% canvas occupation), a secondary anchor band (~10-15%), a dynamic clipPath void protecting the headline/subtext/CTA block, gradient-filled facets, large-amplitude idle motion, a periodic "Facet Lock" signature event, and a 5-phase pinned scroll choreography that moves the main structure itself.

**Architecture:** `kineticBlueprintPaths.ts` is rewritten to export facet/rail/band path data per tier instead of masses/lines/grid/registration/nodes. `useHeroKineticBlueprint.ts` is rewritten: the proven lifecycle scaffolding (tier detection, `IntersectionObserver`/`visibilitychange` pause, `ResizeObserver` tier-crossing rebuild, pointer `MediaQueryList` reconciliation, live reduced-motion listener, `useGsapContext`-compatible cleanup) is kept structurally but every idle/scroll/signature-event body is replaced for the new facet-based structure, and a new `data-hero-content` bounding-box tracker drives a dynamic SVG clipPath. `HeroKineticBlueprint.vue` gains `<defs>` (gradients + clipPath) and a restructured group layout. `main.css` gains new element classes with drop-shadow depth layering. `Hero.vue`'s only change is confirming `data-hero-content` is readable by the composable (it already carries that attribute — no markup change needed there).

**Tech Stack:** Vue 3 (`<script setup>`), Nuxt 4, GSAP 3.12 core + ScrollTrigger (already installed — no new dependency), inline SVG (`<linearGradient>`, `<radialGradient>`, `<clipPath>`), Tailwind (existing `theme()` color tokens only).

**Spec:** `docs/superpowers/specs/2026-09-11-hero-signal-architecture-design.md`

## Global Constraints

- No Three.js, no WebGL, no shaders anywhere in the new code.
- No SVG path `d` attribute is ever animated; all motion uses `transform` (`translate`/`rotate`/`scale`), the clipPath hole's rect coordinates, gradient stop `offset` values, `stroke-dashoffset`, `opacity`, and CSS `filter: drop-shadow(...)` only. No MorphSVGPlugin or other paid GSAP plugin may be added to `package.json`.
- Locked/untouched: everything inside `data-hero-content` in `Hero.vue` (headline triad, subtext, CTA row, corner brackets), container/max-width, section height, navbar, existing entry timeline, section order, base palette tokens (navy/yellow/paper scale itself).
- Palette stays within the existing `navy`/`yellow`/`paper` Tailwind tokens (`tailwind.config.ts`) — no new color values. Boldness comes from gradients/opacity/layering, not new hues.
- Pin distances are exact per tier: desktop 160vh, tablet 100vh, mobile 65vh (unchanged from the prior plan).
- Pointer interaction capability re-evaluated on both a tier change AND a live `(hover: hover) and (pointer: fine)` `MediaQueryList` `change` event — never derived only once at setup or only inside the resize handler.
- Pointer bounds cached in document space (`documentTop = rect.top + window.scrollY`), never re-measured with `getBoundingClientRect()` inside the pointer/ticker hot path.
- Every observer/listener/timeline the composable creates must be released in its returned cleanup function.
- `ClientOnly` wraps the whole component (already the case in `Hero.vue` — no change needed there).
- Motion timing must use the existing tokens from `app/composables/motion/motionTokens.ts` (`motionDuration`, `motionEase`, `motionStagger`) wherever a generic entrance/settle timing is needed, matching the rest of the page's motion language — task-specific custom eases (`power3.out` + `back.out(1.2)` for Facet Lock, per spec) are additive, not a replacement for those tokens elsewhere.

---

### Task 1: Rewrite static path/coordinate data (`kineticBlueprintPaths.ts`)

**Files:**
- Modify (full rewrite): `app/composables/motion/kineticBlueprintPaths.ts`

**Interfaces:**
- Consumes: nothing (pure data module)
- Produces:
  - `export type BlueprintTier = 'desktop' | 'tablet' | 'mobile'` (unchanged name, kept for import-site stability)
  - `export interface FacetPhaseState { x?: number; y?: number; rotation?: number; scale?: number; opacity?: number }`
  - `export interface FacetDef { id: 'plate-a' | 'plate-b' | 'plate-c'; d: string; gradientId: string; opacity: number; lockTarget: { x: number; y: number; rotation: number }; phases?: Partial<Record<'wake' | 'expansion' | 'lock' | 'release' | 'handoff', FacetPhaseState>> }`
  - `export interface RailDef { id: 'primary-rail'; d: string }`
  - `export interface BandDef { id: 'secondary-band'; d: string }`
  - `export interface NodeDef { id: string; cx: number; cy: number; r: number }`
  - `export interface GradientStopDef { offset: number; color: string }`
  - `export interface GradientDef { id: string; type: 'linear' | 'radial'; angle?: number; stops: GradientStopDef[] }`
  - `export interface SignalComposition { viewBox: string; facets: FacetDef[]; rail: RailDef; band: BandDef; nodes: NodeDef[]; gradients: GradientDef[] }`
  - `export const PIN_DISTANCE_VH: Record<BlueprintTier, number>` → `{ desktop: 160, tablet: 100, mobile: 65 }` (unchanged values)
  - `export function getComposition(tier: BlueprintTier): SignalComposition`

This module is pure data — no GSAP, no DOM APIs. Coordinates below use the same `0 0 1600 900` viewBox as the prior system, so tier-relative sizing logic elsewhere doesn't need to change.

- [ ] **Step 1: Write the file**

```typescript
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
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npx nuxi typecheck
```
Expected: no errors in this file (pure data + types, no runtime dependencies). Errors may still appear from `useHeroKineticBlueprint.ts` at this point since it still imports the old (now-removed) type names — that's expected and fixed in Task 3.

- [ ] **Step 3: Commit**

```bash
git add app/composables/motion/kineticBlueprintPaths.ts
git commit -m "feat: replace Kinetic Blueprint path data with Signal Architecture facets

Rewrites kineticBlueprintPaths.ts from the rejected thin/scattered
masses+lines+grid+registration+nodes data model to a 3-facet
fractured-plate + rail + anchor-band model with per-facet gradient
definitions and per-phase scroll targets, per the Signal Architecture
design spec.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: SVG structure — `<defs>` (gradients + clipPath) and group layout in `HeroKineticBlueprint.vue`

**Files:**
- Modify: `app/components/home/HeroKineticBlueprint.vue`

**Interfaces:**
- Consumes: nothing new from other tasks (template-only change; the composable in Task 3 will read/write to the groups and `<defs>` elements this task creates by `data-*` attribute / id, same imperative-DOM pattern as the retired Kinetic Blueprint composable)
- Produces: a `<defs>` block with 3 gradients + 1 clipPath, referenced by `id` from CSS/JS in later tasks; group elements the composable appends generated facet/rail/band/node elements into

This task only changes the template's static scaffolding — no new script logic. The composable (Task 3+) still builds facet/rail/band/node elements imperatively and appends them into these groups, exactly like the retired system did for masses/lines/grid/nodes — keeping the proven "component owns the SVG root + defs, composable owns everything appended inside" split.

- [ ] **Step 1: Rewrite the template**

Replace the full contents of `app/components/home/HeroKineticBlueprint.vue`:

```vue
<script setup lang="ts">
const svgRef = ref<SVGSVGElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  contentRef.value = sectionRef.value?.querySelector('[data-hero-content]') ?? null
  return useHeroKineticBlueprint(svgRef, { sectionEl: sectionRef, contentEl: contentRef })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg ref="svgRef" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
      <defs>
        <!-- Gradient <stop> elements and the void clipPath's <rect> are
             populated/updated imperatively by useHeroKineticBlueprint —
             see kineticBlueprintPaths.ts's GradientDef data and the
             composable's buildGradients()/updateVoidClip() functions. -->
        <linearGradient id="grad-plate-a" data-gradient-kind="linear" />
        <linearGradient id="grad-plate-b" data-gradient-kind="linear" />
        <radialGradient id="grad-plate-c" data-gradient-kind="radial" />
        <clipPath id="signal-void-clip" clipPathUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1600" height="900" />
          <rect data-void-hole x="0" y="0" width="0" height="0" rx="10" ry="10" />
        </clipPath>
      </defs>
      <g data-blueprint-group="band" clip-path="url(#signal-void-clip)" />
      <g data-blueprint-group="facets" clip-path="url(#signal-void-clip)" />
      <g data-blueprint-group="rail" />
      <g data-blueprint-group="nodes" />
    </svg>
  </div>
</template>
```

Note: `<clipPath>`'s child fill-rule defaults to `nonzero`, which does not produce a hole from two non-overlapping same-winding rects the way `evenodd` does — Task 3's clipPath setup explicitly sets `clip-rule="evenodd"` on the inner hole `<rect>` (a per-element override, valid per the SVG spec) rather than relying on a fill-rule default, since the outer/inner rects here are siblings rather than a single compound path.

- [ ] **Step 2: Typecheck and lint**

Run:
```bash
npx nuxi typecheck
npm run lint
```
Expected: typecheck errors about `useHeroKineticBlueprint`'s options shape are expected until Task 3 updates that function's signature to accept `contentEl` — confirm the *only* new errors are about that mismatch, nothing else.

- [ ] **Step 3: Commit**

```bash
git add app/components/home/HeroKineticBlueprint.vue
git commit -m "feat: restructure Hero mount component SVG for Signal Architecture

Replaces the masses/lines/grid/registration/nodes group layout with
facets/rail/band/nodes groups, adds <defs> scaffolding for the 3 facet
gradients and the dynamic void clipPath, and passes the Hero's
data-hero-content element through to the composable for bounding-box
tracking.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Composable skeleton — tier detection, gradient/facet building, void-clip tracking

**Files:**
- Create (full rewrite of): `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `getComposition`, `PIN_DISTANCE_VH`, `SignalComposition`, `FacetDef`, `GradientDef`, `BlueprintTier` from `kineticBlueprintPaths.ts` (Task 1)
- Produces:
  - `export interface UseHeroKineticBlueprintOptions { sectionEl: Ref<HTMLElement | null>; contentEl: Ref<HTMLElement | null> }`
  - `export function useHeroKineticBlueprint(svgEl: Ref<SVGSVGElement | null>, options: UseHeroKineticBlueprintOptions): () => void`
  - Internal (relied on by later tasks in this same file): `getTier(): BlueprintTier`, `buildFacets(tier): void`, `updateVoidClip(): void`, `facetEls(): SVGGElement[]`, `railEl(): SVGLineElement | null`, `bandEl(): SVGPathElement | null`, `nodeEls(): SVGCircleElement[]`

This task establishes tier detection, imperative facet/rail/band/node building (mirroring the retired composable's `makePath`/`buildElements` pattern but for the new element shapes), gradient `<stop>` population, and the void-clip bounding-box tracker. No idle motion, signature event, pointer, scroll, or entry choreography yet — later tasks add those. Mounting the component at this point renders the correct static composition per tier, with the void hole correctly cut around the Hero's content, and no console errors.

- [ ] **Step 1: Write the composable skeleton**

```typescript
// app/composables/motion/useHeroKineticBlueprint.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getComposition,
  PIN_DISTANCE_VH,
  type BlueprintTier,
  type FacetDef,
  type GradientDef,
  type SignalComposition
} from './kineticBlueprintPaths'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export interface UseHeroKineticBlueprintOptions {
  sectionEl: Ref<HTMLElement | null>
  contentEl: Ref<HTMLElement | null>
}

export function useHeroKineticBlueprint(
  svgEl: Ref<SVGSVGElement | null>,
  options: UseHeroKineticBlueprintOptions
): () => void {
  if (!import.meta.client || !svgEl.value) return () => {}

  const svg = svgEl.value
  const sectionEl = options.sectionEl.value ?? svg.closest('section') ?? svg.parentElement!
  const contentEl = options.contentEl.value ?? sectionEl.querySelector('[data-hero-content]')

  // --- Responsive tier: re-evaluated live (never captured once). Desktop
  // >=1024px, tablet 640-1023px, mobile <640px, matching the retired
  // Kinetic Blueprint composable's breakpoints. ---
  function getTier(): BlueprintTier {
    if (window.matchMedia('(max-width: 639px)').matches) return 'mobile'
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet'
    return 'desktop'
  }
  let currentTier: BlueprintTier = getTier()

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches

  const NS = 'http://www.w3.org/2000/svg'

  const facetsGroup = svg.querySelector('[data-blueprint-group="facets"]') as SVGGElement
  const railGroup = svg.querySelector('[data-blueprint-group="rail"]') as SVGGElement
  const bandGroup = svg.querySelector('[data-blueprint-group="band"]') as SVGGElement
  const nodesGroup = svg.querySelector('[data-blueprint-group="nodes"]') as SVGGElement
  const voidHoleRect = svg.querySelector('[data-void-hole]') as SVGRectElement
  voidHoleRect.setAttribute('clip-rule', 'evenodd')

  let composition: SignalComposition = getComposition(currentTier)
  let builtTier: BlueprintTier | null = null

  function facetEls(): SVGGElement[] {
    return Array.from(facetsGroup.children) as SVGGElement[]
  }
  function railEl(): SVGLineElement | null {
    return railGroup.querySelector('[data-blueprint-id="primary-rail"]')
  }
  function bandEl(): SVGPathElement | null {
    return bandGroup.querySelector('[data-blueprint-id="secondary-band"]')
  }
  function nodeEls(): SVGCircleElement[] {
    return Array.from(nodesGroup.children) as SVGCircleElement[]
  }
  function facetById(id: string): SVGGElement | undefined {
    return facetEls().find((el) => el.dataset.blueprintId === id)
  }

  function buildGradients(gradients: GradientDef[]) {
    for (const grad of gradients) {
      const el = svg.querySelector(`#${grad.id}`) as SVGElement | null
      if (!el) continue
      el.replaceChildren()
      if (grad.type === 'linear') {
        const angleRad = ((grad.angle ?? 90) * Math.PI) / 180
        const x1 = 50 - Math.cos(angleRad) * 50
        const y1 = 50 - Math.sin(angleRad) * 50
        const x2 = 50 + Math.cos(angleRad) * 50
        const y2 = 50 + Math.sin(angleRad) * 50
        el.setAttribute('x1', `${x1}%`)
        el.setAttribute('y1', `${y1}%`)
        el.setAttribute('x2', `${x2}%`)
        el.setAttribute('y2', `${y2}%`)
      }
      for (const stop of grad.stops) {
        const stopEl = document.createElementNS(NS, 'stop')
        stopEl.setAttribute('offset', `${stop.offset}%`)
        stopEl.setAttribute('stop-color', stop.color)
        stopEl.dataset.stopOffset = String(stop.offset)
        el.appendChild(stopEl)
      }
    }
  }

  function makeFacet(def: FacetDef): SVGGElement {
    const g = document.createElementNS(NS, 'g')
    g.dataset.blueprintId = def.id
    g.style.opacity = String(def.opacity)
    const path = document.createElementNS(NS, 'path')
    path.setAttribute('d', def.d)
    path.setAttribute('fill', `url(#${def.gradientId})`)
    path.setAttribute('class', 'signal-architecture__facet')
    g.appendChild(path)
    return g
  }

  function buildFacets(tier: BlueprintTier) {
    if (builtTier === tier) return
    builtTier = tier
    composition = getComposition(tier)

    facetsGroup.replaceChildren()
    for (const def of composition.facets) {
      facetsGroup.appendChild(makeFacet(def))
    }
    buildGradients(composition.gradients)

    railGroup.replaceChildren()
    const rail = document.createElementNS(NS, 'line')
    const [, x1, y1, , x2, y2] = composition.rail.d.match(/M ([-.\d]+) ([-.\d]+) L ([-.\d]+) ([-.\d]+)/) ?? []
    rail.setAttribute('x1', x1 ?? '0')
    rail.setAttribute('y1', y1 ?? '0')
    rail.setAttribute('x2', x2 ?? '0')
    rail.setAttribute('y2', y2 ?? '0')
    rail.dataset.blueprintId = composition.rail.id
    rail.setAttribute('class', 'signal-architecture__rail')
    railGroup.appendChild(rail)

    bandGroup.replaceChildren()
    const band = document.createElementNS(NS, 'path')
    band.setAttribute('d', composition.band.d)
    band.dataset.blueprintId = composition.band.id
    band.setAttribute('class', 'signal-architecture__band')
    bandGroup.appendChild(band)

    nodesGroup.replaceChildren()
    for (const def of composition.nodes) {
      const circle = document.createElementNS(NS, 'circle')
      circle.setAttribute('cx', String(def.cx))
      circle.setAttribute('cy', String(def.cy))
      circle.setAttribute('r', String(def.r))
      circle.dataset.blueprintId = def.id
      circle.setAttribute('class', 'signal-architecture__node')
      nodesGroup.appendChild(circle)
    }
  }

  buildFacets(currentTier)

  // --- Void clip: keeps the headline/subtext/CTA union bounding box free
  // of any facet/band coverage, tracked live against the actual DOM
  // content rather than a fixed guess (spec "Negative-space void"). ---
  const VOID_BUFFER_PX = 32
  const VOID_RADIUS = 10

  function updateVoidClip() {
    if (!contentEl) return
    const svgRect = svg.getBoundingClientRect()
    const contentRect = contentEl.getBoundingClientRect()
    if (svgRect.width === 0 || svgRect.height === 0) return

    // Convert from viewport pixels into the SVG's 1600x900 viewBox space,
    // matching preserveAspectRatio="xMidYMid slice" scaling.
    const scale = Math.max(1600 / svgRect.width, 900 / svgRect.height)
    const offsetX = (svgRect.width * scale - 1600) / 2
    const offsetY = (svgRect.height * scale - 900) / 2

    const left = (contentRect.left - svgRect.left) * scale - offsetX - VOID_BUFFER_PX
    const top = (contentRect.top - svgRect.top) * scale - offsetY - VOID_BUFFER_PX
    const width = contentRect.width * scale + VOID_BUFFER_PX * 2
    const height = contentRect.height * scale + VOID_BUFFER_PX * 2

    voidHoleRect.setAttribute('x', String(left))
    voidHoleRect.setAttribute('y', String(top))
    voidHoleRect.setAttribute('width', String(Math.max(0, width)))
    voidHoleRect.setAttribute('height', String(Math.max(0, height)))
    voidHoleRect.setAttribute('rx', String(VOID_RADIUS))
    voidHoleRect.setAttribute('ry', String(VOID_RADIUS))
  }

  updateVoidClip()

  return () => {
    // Cleanup body filled in by later tasks (ResizeObserver,
    // IntersectionObserver, ScrollTrigger, idle timelines, pointer
    // listeners, content-resize observer all disconnect here).
  }
}
```

- [ ] **Step 2: Add minimal CSS for the new element classes**

Replace the `.kinetic-blueprint__*` block in `app/assets/css/main.css` (currently at the lines shown by `grep -n "kinetic-blueprint__" app/assets/css/main.css` — replace that whole block, from `.kinetic-blueprint__mass {` through the closing `}` of the `--pointer-nudge-y` rule) with:

```css
  .signal-architecture__facet {
    stroke: none;
  }
  .signal-architecture__rail {
    stroke: theme(colors.yellow.500);
    stroke-width: 4;
    stroke-linecap: round;
    fill: none;
  }
  .signal-architecture__band {
    fill: theme(colors.navy.700);
    fill-opacity: 0.28;
  }
  .signal-architecture__node {
    fill: theme(colors.yellow.500);
    fill-opacity: 0.6;
    transition: fill-opacity 0.3s ease;
  }
  .signal-architecture__node[data-active='true'] {
    fill-opacity: 1;
  }
  [data-blueprint-id='plate-a'] .signal-architecture__facet {
    filter: drop-shadow(0 12px 24px rgba(5, 27, 40, 0.18));
  }
  [data-blueprint-id='plate-b'] .signal-architecture__facet {
    filter: drop-shadow(0 6px 14px rgba(5, 27, 40, 0.1));
  }
```

- [ ] **Step 3: Temporarily mount the component standalone to verify rendering**

Manual verification only — do not wire into `Hero.vue` yet (already wired from the prior Kinetic Blueprint work; `Hero.vue` already renders `<HomeHeroKineticBlueprint>`, so this step is just running the dev server and checking the existing mount):

```bash
npm run dev
```
Open the homepage. Confirm:
- No console errors
- The SVG renders 3 gradient-filled facets, a yellow rail line, a navy band, and a few nodes at desktop width
- The headline/subtext/CTA area has a visibly clear void — no facet color directly under the text
- Resizing to <640px width and reloading shows the mobile composition

- [ ] **Step 4: Typecheck and lint**

```bash
npx nuxi typecheck
npm run lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts app/assets/css/main.css
git commit -m "feat: rewrite Kinetic Blueprint composable skeleton for Signal Architecture

Tier detection, per-tier facet/rail/band/node building, gradient
<stop> population, and a live void clipPath tracked against the
Hero's actual data-hero-content bounding box. No animation yet — later
tasks add idle motion, the Facet Lock signature event, pointer
interaction, entry choreography, and the pinned scroll timeline.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Lifecycle discipline — visibility pause, resize/tier rebuild, content-resize void tracking

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `buildFacets`, `getTier`, `updateVoidClip` (Task 3, same file)
- Produces: composable's cleanup function now disconnects all observers/listeners created in this task; internal `syncRunState(): void`, `reconcileTier(): void` relied on by Tasks 5-8

Mirrors the retired composable's proven pattern: `IntersectionObserver` + `document.visibilitychange` genuinely stop/start the idle system (idle system itself arrives in Task 5 — this task wires the pause/resume *mechanism* against a placeholder `startIdleTimelines`/`stopIdleTimelines` pair that Task 5 fills in), and a `ResizeObserver` on both the section (tier rebuild) and the content block (void-clip tracking) — two independent observers since they watch different elements for different reasons.

- [ ] **Step 1: Add placeholder idle start/stop and visibility/intersection pausing**

Insert after `updateVoidClip()` call from Task 3 Step 1, replacing the `return () => { ... }` block:

```typescript
  // --- Idle system start/stop — bodies filled in by Task 5. Declared here
  // so the visibility/intersection lifecycle wiring in this task has a
  // stable pair of functions to call; Task 5 replaces these two function
  // bodies without touching this section. ---
  let idleStopped = true
  function startIdleTimelines() {
    idleStopped = false
  }
  function stopIdleTimelines() {
    idleStopped = true
  }

  // --- Visibility / intersection pausing: genuinely stop/start idle
  // timelines, mirroring the retired composable's syncRunState pattern. ---
  let isVisible = true
  let isTabVisible = document.visibilityState === 'visible'
  let isRunning = false

  function syncRunState() {
    const shouldRun = isVisible && isTabVisible && !reducedMotion
    if (shouldRun && !isRunning) {
      isRunning = true
      startIdleTimelines()
    } else if (!shouldRun && isRunning) {
      isRunning = false
      stopIdleTimelines()
    }
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      syncRunState()
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(sectionEl)

  const handleVisibilityChange = () => {
    isTabVisible = document.visibilityState === 'visible'
    syncRunState()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
```

- [ ] **Step 2: Add resize/tier-crossing rebuild and content-resize void tracking**

Insert immediately after Step 1's block:

```typescript
  // --- Resize: rebuild the facet/rail/band/node set only on an actual
  // tier crossing. viewBox + preserveAspectRatio absorbs same-tier resizes
  // with zero JS, except the void clip, which must track the content box
  // continuously (handled by contentResizeObserver below, independent of
  // tier). ---
  function reconcileTier() {
    const nextTier = getTier()
    if (nextTier === currentTier) return
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildFacets(currentTier)
    syncRunState()
    updateVoidClip()
  }

  const resizeObserver = new ResizeObserver(() => reconcileTier())
  resizeObserver.observe(sectionEl)

  let contentResizeObserver: ResizeObserver | null = null
  if (contentEl) {
    contentResizeObserver = new ResizeObserver(() => updateVoidClip())
    contentResizeObserver.observe(contentEl)
  }
```

- [ ] **Step 3: Start the system and wire full cleanup**

Add immediately after Step 2's block, replacing the empty `return () => { ... }` from Task 3:

```typescript
  syncRunState()

  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    contentResizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
```

- [ ] **Step 4: Manual verification**

With the dev server running (`npm run dev`):
- Scroll the Hero out of view and back — no console errors.
- Switch tabs and back — no console errors.
- Resize across 640px/1024px breakpoints — facet set rebuilds correctly, void clip stays correctly positioned around the headline.
- Resize the browser height only (no tier change) — void clip's rect updates smoothly as the content box's viewport position changes (confirm via temporary `console.log(voidHoleRect.outerHTML)` inside `updateVoidClip`, removed before committing).

- [ ] **Step 5: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 6: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add visibility pause, tier rebuild, and void-clip resize tracking

IntersectionObserver + visibilitychange gate the (as-yet-empty) idle
system; ResizeObserver on the section rebuilds facets only on an
actual tier crossing; a second ResizeObserver on data-hero-content
keeps the void clipPath's hole tracking the real content box
independent of tier changes.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Idle motion — facet drift, rail sweep, band shift, gradient stop drift

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `facetEls`, `railEl`, `bandEl`, `nodeEls`, `composition` (Task 3), `startIdleTimelines`/`stopIdleTimelines` placeholders (Task 4, replaced by this task)
- Produces: `idleTweens: gsap.core.Tween[]` module-scope array later tasks' cleanup relies on being emptied by `stopIdleTimelines()`

Implements the spec's "Idle motion" section: large-amplitude facet drift (15-30px translate, ±0.5-1.5° rotate), periodic rail stroke-dashoffset sweep, secondary band micro-shift, gradient stop offset drift, and small node opacity pulses — replacing the Task 4 placeholder bodies.

- [ ] **Step 1: Replace the placeholder `startIdleTimelines`/`stopIdleTimelines` with the real idle system**

Replace the Task 4 Step 1 placeholder block:

```typescript
  let idleStopped = true
  function startIdleTimelines() {
    idleStopped = false
  }
  function stopIdleTimelines() {
    idleStopped = true
  }
```

with:

```typescript
  // --- Idle motion system (spec "Idle motion") — large-amplitude facet
  // drift, periodic rail sweep, band micro-shift, gradient stop drift, and
  // node pulses. `idleStopped` gates every self-rescheduling callback so
  // stopIdleTimelines() halts the whole system without individually
  // tracking every future scheduled call — same pattern as the retired
  // Kinetic Blueprint composable's timescale system. ---
  let idleStopped = true
  const idleTweens: gsap.core.Tween[] = []
  const idleDelayedCalls: gsap.core.Tween[] = []

  function gradientStopEls(gradientId: string): SVGStopElement[] {
    const el = svg.querySelector(`#${gradientId}`)
    return el ? (Array.from(el.children) as SVGStopElement[]) : []
  }

  function startFacetDrift() {
    for (const facet of facetEls()) {
      const runDrift = () => {
        if (idleStopped) return
        const distance = gsap.utils.random(15, 30)
        const angleRad = gsap.utils.random(0, 360) * (Math.PI / 180)
        idleTweens.push(
          gsap.to(facet, {
            x: Math.cos(angleRad) * distance,
            y: Math.sin(angleRad) * distance,
            rotation: gsap.utils.random(-1.5, 1.5),
            duration: gsap.utils.random(8, 16),
            ease: 'sine.inOut',
            onComplete: runDrift
          })
        )
      }
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(0, 4), runDrift))
    }
  }

  function startRailSweep() {
    const rail = railEl()
    if (!rail) return
    const length = rail.getTotalLength()
    rail.style.strokeDasharray = String(length)
    const runSweep = () => {
      if (idleStopped) return
      idleTweens.push(
        gsap.fromTo(
          rail,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: gsap.utils.random(10, 14), ease: 'sine.inOut', onComplete: runSweep }
        )
      )
    }
    runSweep()
  }

  function startBandShift() {
    const band = bandEl()
    if (!band) return
    const runShift = () => {
      if (idleStopped) return
      idleTweens.push(
        gsap.to(band, {
          x: gsap.utils.random(-15, 15),
          duration: gsap.utils.random(12, 20),
          ease: 'sine.inOut',
          onComplete: runShift
        })
      )
    }
    runShift()
  }

  function startGradientDrift() {
    for (const facet of composition.facets) {
      const stops = gradientStopEls(facet.gradientId)
      if (stops.length < 2) continue
      const runDrift = () => {
        if (idleStopped) return
        const tl = gsap.timeline({ onComplete: runDrift })
        stops.forEach((stop, i) => {
          const base = Number(stop.dataset.stopOffset)
          const jitter = gsap.utils.random(-8, 8)
          tl.to(
            stop,
            {
              attr: { offset: `${Math.min(100, Math.max(0, base + jitter))}%` },
              duration: gsap.utils.random(10, 18),
              ease: 'sine.inOut'
            },
            0
          )
        })
        idleTweens.push(tl as unknown as gsap.core.Tween)
      }
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(0, 5), runDrift))
    }
  }

  function startNodePulse() {
    for (const node of nodeEls()) {
      idleTweens.push(
        gsap.to(node, {
          scale: 1.25,
          transformOrigin: 'center',
          duration: gsap.utils.random(3, 6),
          delay: gsap.utils.random(0, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      )
    }
  }

  function startIdleTimelines() {
    idleStopped = false
    startFacetDrift()
    startRailSweep()
    startBandShift()
    startGradientDrift()
    startNodePulse()
  }

  function stopIdleTimelines() {
    idleStopped = true
    for (const tween of idleTweens.splice(0)) tween.kill()
    for (const call of idleDelayedCalls.splice(0)) call.kill()
  }
```

- [ ] **Step 2: Manual verification**

```bash
npm run dev
```
Open the homepage and observe the Hero background for at least 20 seconds. Confirm:
- Facets visibly drift (translate + slight rotation) over several seconds — motion should be clearly perceptible, not subtle
- The yellow rail periodically redraws (dash sweep)
- The gradient inside each facet subtly shifts over time (not a hard color jump)
- Nodes pulse gently
- No two consecutive 10-second windows look identical (no obvious short loop from the desynchronized delays)

- [ ] **Step 3: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 4: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add large-amplitude idle motion to Signal Architecture composable

Facet drift (15-30px translate, up to 1.5deg rotation), periodic rail
stroke-dashoffset sweep, secondary band micro-shift, animated gradient
stop offsets, and node pulses — replacing Kinetic Blueprint's
near-imperceptible amplitudes with motion that reads clearly at rest,
per the Signal Architecture spec's idle motion requirements.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Signature idle event — "Facet Lock"

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `facetEls`, `facetById`, `railEl`, `nodeEls`, `composition`, `idleStopped`, `idleTweens`, `idleDelayedCalls` (Tasks 3/5, same file)
- Produces: `runFacetLock(): void`, wired into a periodic self-rescheduling loop alongside the Task 5 idle system

Implements the spec's "Signature idle event — Facet Lock": every 8-14s, facets animate to their authored `lockTarget` with a decisive `power3.out` + `back.out(1.2)` settle, the rail flashes, gradient stops converge, then everything releases back to independent drift.

- [ ] **Step 1: Add the Facet Lock sequence**

Insert immediately after `startNodePulse()` (Task 5), before `function startIdleTimelines()`:

```typescript
  function activateNode(node: SVGCircleElement, duration = 0.4) {
    node.dataset.active = 'true'
    idleTweens.push(
      gsap.to(node, {
        scale: 1.4,
        duration: duration * 0.5,
        yoyo: true,
        repeat: 1,
        transformOrigin: 'center',
        ease: 'power2.out',
        onComplete: () => {
          node.dataset.active = 'false'
        }
      })
    )
  }

  function runFacetLock() {
    const facets = facetEls()
    if (facets.length === 0) return
    const rail = railEl()
    const nodes = nodeEls()

    const tl = gsap.timeline()
    for (const def of composition.facets) {
      const el = facetById(def.id)
      if (!el) continue
      // A single tween using back.out(1.4): GSAP's back-out ease already
      // overshoots past the target and settles back in one continuous
      // motion, giving the "mechanical click into place" feel the spec
      // calls for without layering a second tween on the same properties
      // (which would fight the first for control of x/y/rotation).
      tl.to(
        el,
        {
          x: def.lockTarget.x,
          y: def.lockTarget.y,
          rotation: def.lockTarget.rotation,
          duration: 1.2,
          ease: 'back.out(1.4)'
        },
        0
      )
    }

    if (rail) {
      tl.to(rail, { opacity: 1, strokeWidth: 6, duration: 0.3, ease: 'power2.out' }, 1.0).to(
        rail,
        { opacity: 0.75, strokeWidth: 4, duration: 0.6, ease: 'power2.inOut' },
        1.6
      )
    }

    for (const facet of composition.facets) {
      const stops = gradientStopEls(facet.gradientId)
      if (stops.length === 0) continue
      tl.to(
        stops,
        { attr: { offset: (i: number) => `${Math.min(100, Math.max(0, Number(stops[i]?.dataset.stopOffset) - 15))}%` }, duration: 0.6, ease: 'power2.out' },
        1.0
      ).to(stops, { attr: { offset: (i: number) => `${stops[i]?.dataset.stopOffset}%` }, duration: 1.2, ease: 'sine.inOut' }, 2.2)
    }

    if (nodes.length > 0) {
      tl.call(() => {
        nodes.slice(0, Math.min(2, nodes.length)).forEach((n) => activateNode(n, 0.5))
      }, undefined, 1.0)
    }

    idleTweens.push(tl as unknown as gsap.core.Tween)
  }

  function startFacetLockLoop() {
    const runLoop = () => {
      if (idleStopped) return
      runFacetLock()
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 14), runLoop))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 14), runLoop))
  }
```

- [ ] **Step 2: Wire `startFacetLockLoop()` into `startIdleTimelines()`**

Modify the `startIdleTimelines` function from Task 5:

```typescript
  function startIdleTimelines() {
    idleStopped = false
    startFacetDrift()
    startRailSweep()
    startBandShift()
    startGradientDrift()
    startNodePulse()
    startFacetLockLoop()
  }
```

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```
Watch the Hero for at least 30 seconds. Confirm:
- Every 8-14 seconds, the three facets visibly move into a precisely aligned position (edges meeting) with a distinct "snap" quality at the end (not a soft ease-out)
- The rail briefly brightens/thickens at the lock moment
- 1-2 nodes pulse at the lock moment
- After ~1-2 seconds holding the locked state, facets release back into independent drift
- The event is clearly the most visually notable moment in the idle cycle — distinctly more "designed" than the continuous drift

- [ ] **Step 4: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add Facet Lock signature idle event

Every 8-14s, the three facets animate to their authored lockTarget
with a power3.out approach and a back.out(1.2) mechanical-click
settle, the rail flashes, gradient stops briefly converge, and 1-2
nodes pulse — then everything releases back into independent idle
drift. Implements the spec's signature idle event requirement.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Pointer interaction — structure tension, void-aware, live capability tracking

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `sectionEl`, `facetEls` (prior tasks, same file)
- Produces: internal `reconcilePointerState(): void`, wired into both `reconcileTier()` and a new `pointerMql` change listener

Implements the spec's "Pointer interaction" section: restrained, structure-tension-only nudges on facet rotation/translate (no glow/halo/blob), the same document-space bounds caching and live-capability `MediaQueryList` pattern proven in the retired composable.

- [ ] **Step 1: Add document-space bounds caching and the pointer tracker**

Insert into the composable, after the `contentResizeObserver` block from Task 4:

```typescript
  // --- Pointer bounds cached in document space, not viewport space, since
  // the Hero moves relative to the viewport across the pre-pin/pinned/
  // post-pin scroll ranges. ---
  let cachedWidth = 0
  let cachedHeight = 0
  let cachedLeft = 0
  let cachedDocumentTop = 0

  function refreshPointerBounds() {
    const rect = sectionEl.getBoundingClientRect()
    cachedWidth = rect.width
    cachedHeight = rect.height
    cachedLeft = rect.left
    cachedDocumentTop = rect.top + window.scrollY
  }
  refreshPointerBounds()

  const rawPointer = { x: 0, y: 0 }
  const dampedPointer = { x: 0, y: 0 }

  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
    const currentTop = cachedDocumentTop - window.scrollY
    rawPointer.x = ((event.clientX - cachedLeft) / cachedWidth) * 2 - 1
    rawPointer.y = -(((event.clientY - currentTop) / cachedHeight) * 2 - 1)
  }

  // Structure tension: each facet's rotation/translate gets a small,
  // capped nudge toward the pointer — restrained per spec ("no glow, halo,
  // magnetic blob, huge deformation"). Applied as an additive offset on
  // top of (not replacing) the idle drift transform, via a separate CSS
  // custom property consumed by a second transform layer — simplest
  // correct approach is a small additional GSAP-driven x/y/rotation delta
  // applied directly, since GSAP's transform cache composes repeated
  // .to()/.set() calls on the same properties additively is NOT reliable;
  // instead pointer influence is applied to a dedicated wrapper transform
  // via CSS custom properties independent of the idle system's direct
  // x/y/rotation tweens.
  function pointerTick() {
    const t = 1 - Math.exp(-6 * gsap.ticker.deltaRatio(60) * (1 / 60))
    dampedPointer.x += (rawPointer.x - dampedPointer.x) * t
    dampedPointer.y += (rawPointer.y - dampedPointer.y) * t

    for (const facet of facetEls()) {
      const depthFactor = facet.dataset.blueprintId === 'plate-a' ? 1 : facet.dataset.blueprintId === 'plate-b' ? 0.7 : 0.5
      const dx = dampedPointer.x * 8 * depthFactor
      const dy = dampedPointer.y * -8 * depthFactor
      facet.style.setProperty('--pointer-tension-x', `${dx}px`)
      facet.style.setProperty('--pointer-tension-y', `${dy}px`)
    }
  }
```

- [ ] **Step 2: Add CSS for the pointer-tension custom properties**

Append to `app/assets/css/main.css`, immediately after the `.signal-architecture__*` rules added in Task 3:

```css
  [data-blueprint-group='facets'] > g {
    --pointer-tension-x: 0px;
    --pointer-tension-y: 0px;
    translate: var(--pointer-tension-x, 0px) var(--pointer-tension-y, 0px);
  }
```

Note: this `translate` CSS property composes with GSAP's own `x`/`y` tweens (which write to the `transform` CSS property, not `translate`) without conflict — SVG/CSS `translate` and `transform: translate(...)` are separate compositing layers per the CSS Transforms Level 2 spec, so idle-drift transforms (Task 5, via `transform`) and pointer tension (this task, via the standalone `translate` property) apply simultaneously without one overwriting the other.

- [ ] **Step 3: Add the pointer capability MediaQueryList and reconciler**

Insert immediately after Step 1's block:

```typescript
  // --- Pointer capability: dedicated MediaQueryList with its own change
  // listener, reconciled alongside (not only inside) tier changes. ---
  const pointerMql = window.matchMedia('(hover: hover) and (pointer: fine)')
  let isPointerActive = false

  function pointerShouldBeActive(): boolean {
    if (currentTier === 'mobile' || reducedMotion) return false
    return pointerMql.matches
  }

  function resetPointerTension() {
    for (const facet of facetEls()) {
      gsap.to(facet, { '--pointer-tension-x': '0px', '--pointer-tension-y': '0px', duration: 0.5, ease: 'power2.out' })
    }
    rawPointer.x = 0
    rawPointer.y = 0
    dampedPointer.x = 0
    dampedPointer.y = 0
  }

  function reconcilePointerState() {
    const shouldBeActive = pointerShouldBeActive()
    if (shouldBeActive && !isPointerActive) {
      isPointerActive = true
      refreshPointerBounds()
      sectionEl.addEventListener('pointermove', handlePointerMove, { passive: true })
      gsap.ticker.add(pointerTick)
    } else if (!shouldBeActive && isPointerActive) {
      isPointerActive = false
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
      resetPointerTension()
    }
  }

  reconcilePointerState()
  pointerMql.addEventListener('change', reconcilePointerState)
```

- [ ] **Step 4: Wire pointer reconciliation into tier changes**

Modify `reconcileTier()` (Task 4) to also refresh pointer bounds and state. Replace the existing body:

```typescript
  function reconcileTier() {
    const nextTier = getTier()
    if (nextTier === currentTier) {
      refreshPointerBounds()
      return
    }
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildFacets(currentTier)
    syncRunState()
    updateVoidClip()
    refreshPointerBounds()
    reconcilePointerState()
  }
```

- [ ] **Step 5: Wire cleanup**

Modify the composable's `return () => { ... }` cleanup (Task 4) to add pointer teardown:

```typescript
  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    contentResizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (isPointerActive) {
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
    }
    pointerMql.removeEventListener('change', reconcilePointerState)
  }
```

- [ ] **Step 6: Manual verification**

```bash
npm run dev
```
On a desktop browser (mouse, not touch):
- Move the mouse across the Hero — facets should show a small, smooth positional tension toward the cursor (plate-a moving most, plate-c least), clearly restrained (not a large deformation, no glow/halo effect).
- Move the mouse off the Hero section (or off-window) — tension eases back to zero within ~0.5s.
- Resize to mobile width — pointer tracking stops entirely (no listeners active; confirm via a temporary log, removed after).
- In DevTools, toggle a touch-device emulation — pointer tracking should not activate.

- [ ] **Step 7: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 8: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts app/assets/css/main.css
git commit -m "feat: add restrained pointer-driven structure tension

Facets receive a small, depth-weighted positional nudge toward the
damped pointer position via a dedicated CSS translate custom property
(composing cleanly with GSAP's own transform-based idle tweens),
gated by a live (hover: hover) and (pointer: fine) MediaQueryList
reconciled on both tier change and its own change event. No glow,
halo, or large deformation, per spec.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Reduced motion + entry choreography

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `facetById`, `composition`, `syncRunState`, `nodeEls`, `activateNode` (prior tasks, same file)
- Produces: composable now applies a static resting state under reduced motion, and sequences an entry timeline gated on `introReady` before starting idle motion

Implements the spec's reduced-motion (static "Lock"-equivalent resting frame, no idle timers) and entry choreography (structure fades/settles in, sequenced alongside Hero.vue's own headline reveal, only after which idle motion starts) — following the same `useIntroReady()` gating pattern already used by the retired composable and by `Hero.vue` itself.

- [ ] **Step 1: Add the reduced-motion static resting state**

Insert after the pointer wiring from Task 7 Step 3, before `reconcileTier`:

```typescript
  // --- Reduced motion: idle timelines never start, and every facet is set
  // directly to its authored lockTarget (the Lock phase is the spec's
  // designated "strongest single frame") with no animation. ---
  function applyReducedMotionRestingState() {
    for (const def of composition.facets) {
      const el = facetById(def.id)
      if (!el) continue
      gsap.set(el, { x: def.lockTarget.x, y: def.lockTarget.y, rotation: def.lockTarget.rotation })
    }
    const nodes = nodeEls()
    nodes.slice(0, Math.min(2, nodes.length)).forEach((n) => {
      n.dataset.active = 'true'
    })
  }

  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      stopIdleTimelines()
      isRunning = false
      applyReducedMotionRestingState()
    } else {
      syncRunState()
    }
    reconcilePointerState()
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  if (reducedMotion) {
    applyReducedMotionRestingState()
  }
```

- [ ] **Step 2: Add entry choreography gated on `introReady`**

Insert immediately after Step 1's block:

```typescript
  // --- Entry choreography: gated on introReady (the same page-load intro
  // gate Hero.vue's own headline reveal watches), sequenced alongside (not
  // blocking) that reveal. Uses the project's shared motionDuration/
  // motionEase tokens so timing matches the rest of the page, with a
  // refined per-facet stagger curve rather than uniform spacing. ---
  const { introReady } = useIntroReady()
  let entryTimeline: gsap.core.Timeline | null = null
  const stopIntroWatch = watch(
    introReady,
    (ready) => {
      if (!ready) return
      if (reducedMotion) return // resting state already applied above; no entry animation under reduced motion

      const facets = facetEls()
      const rail = railEl()
      const band = bandEl()

      gsap.set(facets, { opacity: 0, scale: 0.9 })
      if (rail) gsap.set(rail, { opacity: 0 })
      if (band) gsap.set(band, { opacity: 0 })

      entryTimeline = gsap.timeline()
      entryTimeline
        .to(facets, {
          opacity: (i, target) => Number(target.style.opacity) || composition.facets.find((f) => f.id === (target as SVGGElement).dataset.blueprintId)?.opacity || 0.3,
          scale: 1,
          duration: motionDuration.slow,
          ease: motionEase.standard,
          stagger: { each: motionStagger.loose, ease: 'power2.out' }
        })
        .to(rail ? [rail] : [], { opacity: 0.75, duration: motionDuration.editorial, ease: motionEase.standard }, '-=0.4')
        .to(band ? [band] : [], { opacity: 1, duration: motionDuration.editorial, ease: motionEase.standard }, '-=0.5')
        .call(() => {
          const nodes = nodeEls()
          nodes.slice(0, Math.min(2, nodes.length)).forEach((n) => activateNode(n, 0.5))
        })
        .call(() => {
          syncRunState() // starts idle motion (Task 5-6 systems) once entry completes
        })
    },
    { immediate: true }
  )
```

- [ ] **Step 3: Replace the unconditional `syncRunState()` call with the reduced-motion-aware version**

Find the `syncRunState()` call added in Task 4 Step 3 (immediately before the `return () => { ... }` cleanup) and replace it:

```typescript
  if (reducedMotion) {
    syncRunState() // no entry animation in this path — confirms idle stays stopped
  }
  // Otherwise, syncRunState() is called by the entry timeline's completion above.
```

- [ ] **Step 4: Wire `entryTimeline`/`stopIntroWatch` into cleanup**

Modify the composable's `return () => { ... }` cleanup (Task 7 Step 5) to add:

```typescript
  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    contentResizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (isPointerActive) {
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
    }
    pointerMql.removeEventListener('change', reconcilePointerState)
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    stopIntroWatch()
    entryTimeline?.kill()
  }
```

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```
- Load the homepage fresh (hard refresh) — confirm the Signal Architecture structure fades/scales in shortly after the page's intro overlay completes, staggered facet-by-facet, then the rail and band appear, then idle motion begins.
- In DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, then hard refresh — confirm facets appear immediately in their locked/aligned position with no animation and no idle motion ever starts.
- Toggle the reduced-motion emulation on/off without reloading — confirm idle motion stops/starts live.

- [ ] **Step 6: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 7: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add reduced-motion resting state and entry choreography

Under prefers-reduced-motion, facets are set directly to their
authored lockTarget (the spec's designated strongest single frame)
with no animation and no idle system. Otherwise, an introReady-gated
entry timeline fades/scales facets in with a per-facet stagger curve,
then the rail and band, then activates 1-2 nodes, before handing off
to idle motion — matching the entry-choreography pattern already used
by Hero.vue's own headline reveal.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Pinned 5-phase scroll choreography (Wake → Expansion → Lock → Release → Handoff)

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `facetById`, `composition`, `railEl`, `bandEl`, `PIN_DISTANCE_VH`, `currentTier`, `reducedMotion` (prior tasks, same file)
- Produces: composable now builds/rebuilds a pinned, scrubbed `ScrollTrigger` timeline driving the main structure through 5 authored phases

Implements the spec's "Pinned scroll choreography" table exactly: phase labels at 0/.2/.45/.7/.9/1, each facet driven through its authored per-phase `x`/`y`/`rotation`/`scale`/`opacity` targets from `kineticBlueprintPaths.ts`, rail/band participating in Expansion and Handoff, rebuilt on tier crossing and reduced-motion toggle.

- [ ] **Step 1: Add `buildScrollTimeline`**

Insert after the entry-choreography block from Task 8 Step 2, before the `if (reducedMotion) { syncRunState() ... }` block from Task 8 Step 3:

```typescript
  // --- Pinned scroll choreography (spec "Pinned scroll choreography").
  // One scrubbed timeline per the current tier's pin distance; rebuilt
  // whenever the tier crosses a breakpoint or reduced-motion toggles, so
  // distance/presence stays correct without a page reload. Every animated
  // value is transform (x/y/rotation/scale) / opacity / stroke-dashoffset
  // only — never a path `d` change. ---
  let scrollTimeline: gsap.core.Timeline | null = null
  let scrollTriggerInstance: ScrollTrigger | null = null

  function buildScrollTimeline() {
    scrollTriggerInstance?.kill()
    scrollTimeline?.kill()

    if (reducedMotion) {
      scrollTriggerInstance = null
      scrollTimeline = null
      return
    }

    const pinDistance = `+=${PIN_DISTANCE_VH[currentTier]}vh`
    const tl = gsap.timeline({ paused: true })

    // Phase labels at the spec's exact fractions.
    tl.addLabel('wake', 0)
      .addLabel('expansion', 0.2)
      .addLabel('lock', 0.45)
      .addLabel('release', 0.7)
      .addLabel('handoff', 0.9)
      .addLabel('end', 1)

    const order: ScrollPhaseName[] = ['wake', 'expansion', 'lock', 'release', 'handoff']

    for (const def of composition.facets) {
      const el = facetById(def.id)
      if (!el || !def.phases) continue
      for (const phaseName of order) {
        const target = def.phases[phaseName]
        if (!target) continue
        const vars: gsap.TweenVars = { duration: 0.2, ease: 'none' }
        if (typeof target.x === 'number') vars.x = target.x
        if (typeof target.y === 'number') vars.y = target.y
        if (typeof target.rotation === 'number') vars.rotation = target.rotation
        if (typeof target.scale === 'number') vars.scale = target.scale
        if (typeof target.opacity === 'number') vars.opacity = target.opacity
        tl.to(el, vars, phaseName)
      }
    }

    const rail = railEl()
    if (rail) {
      const length = rail.getTotalLength()
      rail.style.strokeDasharray = String(length)
      tl.fromTo(rail, { strokeDashoffset: length * 0.4 }, { strokeDashoffset: 0, duration: 0.25, ease: 'none' }, 'expansion')
      tl.to(rail, { opacity: 0, duration: 0.1, ease: 'none' }, 'handoff')
    }

    const band = bandEl()
    if (band) {
      tl.to(band, { scaleX: 1.04, transformOrigin: 'center', duration: 0.25, ease: 'none' }, 'expansion')
      tl.to(band, { y: 120, opacity: 0, duration: 0.1, ease: 'none' }, 'handoff')
    }

    scrollTimeline = tl
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: pinDistance,
      pin: true,
      scrub: 1,
      animation: scrollTimeline
    })
  }

  buildScrollTimeline()
```

- [ ] **Step 2: Add the `ScrollPhaseName` type import**

Modify the import block at the top of the file (from Task 3 Step 1) to also import the phase-name type:

```typescript
import {
  getComposition,
  PIN_DISTANCE_VH,
  type BlueprintTier,
  type FacetDef,
  type GradientDef,
  type ScrollPhaseName,
  type SignalComposition
} from './kineticBlueprintPaths'
```

- [ ] **Step 3: Wire `buildScrollTimeline()` into tier reconciliation and reduced-motion toggle**

Modify `reconcileTier()` (Task 7 Step 4) to also rebuild the scroll timeline:

```typescript
  function reconcileTier() {
    const nextTier = getTier()
    if (nextTier === currentTier) {
      refreshPointerBounds()
      return
    }
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildFacets(currentTier)
    syncRunState()
    updateVoidClip()
    refreshPointerBounds()
    reconcilePointerState()
    buildScrollTimeline()
  }
```

Modify `handleReducedMotionChange` (Task 8 Step 1) to also rebuild the scroll timeline:

```typescript
  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      stopIdleTimelines()
      isRunning = false
      applyReducedMotionRestingState()
    } else {
      syncRunState()
    }
    reconcilePointerState()
    buildScrollTimeline() // no pin at all when reducedMotion is true; rebuilt fresh when it turns false
  }
```

- [ ] **Step 4: Wire scroll-timeline teardown into cleanup**

Modify the composable's `return () => { ... }` cleanup (Task 8 Step 4) to add:

```typescript
  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    contentResizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (isPointerActive) {
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
    }
    pointerMql.removeEventListener('change', reconcilePointerState)
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    stopIntroWatch()
    entryTimeline?.kill()
    scrollTriggerInstance?.kill()
    scrollTimeline?.kill()
  }
```

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```
- Scroll down slowly through the Hero — confirm the section pins, and the facets visibly progress through Wake (settling to upright) → Expansion (scaling/spreading out) → Lock (snapping into aligned position — the composition's strongest visual moment) → Release (plate-c separating/drifting away) → Handoff (everything translating down/fading as the section releases).
- Scroll back up — confirm the sequence reverses smoothly with no jump cuts.
- Resize across a tier breakpoint mid-page (not mid-scroll — reload at each width) and repeat the scroll test at tablet and mobile widths — confirm pin distances differ (160vh/100vh/65vh) and the phase choreography still completes correctly.
- Confirm only one `ScrollTrigger` pin exists on the Hero at any time (open DevTools console and run `ScrollTrigger.getAll().length` after a couple of resizes — should stay stable, not grow).

- [ ] **Step 6: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 7: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add pinned 5-phase scroll choreography to Signal Architecture

Wake -> Expansion -> Lock -> Release -> Handoff, scrubbed against each
tier's exact pin distance (desktop 160vh, tablet 100vh, mobile 65vh).
Each facet is driven through its authored per-phase transform/opacity
targets from kineticBlueprintPaths.ts; the rail and band participate
in the Expansion and Handoff phases. Rebuilt on tier crossing and
reduced-motion toggle, matching the lifecycle discipline already
proven in the retired Kinetic Blueprint composable.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Final integration verification and scrim tuning in `Hero.vue`

**Files:**
- Modify (small, conditional): `app/components/home/Hero.vue`

**Interfaces:**
- Consumes: nothing new — this task only tunes an existing value based on visual verification
- Produces: nothing new — confirms the full system integrates correctly end-to-end

`Hero.vue` already mounts `<HomeHeroKineticBlueprint>` and already carries `data-hero-content` on its content wrapper (both from the prior Kinetic Blueprint integration task) — no structural change is needed there. This task is verification-only, with one conditional tuning step for the scrim.

- [ ] **Step 1: Full end-to-end manual verification**

```bash
npm run dev
```
Load the homepage and verify, in order:
1. Entry choreography plays once after the intro overlay completes (facets fade/scale in, staggered, then rail/band, then idle motion begins).
2. At rest, the Hero reads as visually strong even without scrolling or moving the mouse — a single screenshot should show a clearly dominant fractured-plate structure occupying most of the canvas, not "headline on empty white space."
3. Headline, subtext, and CTA row remain fully readable with no facet color directly beneath them (void clip working).
4. Idle motion (facet drift, rail sweep, gradient drift, node pulses) is clearly visible without needing to stare closely.
5. The Facet Lock signature event fires every 8-14 seconds and is visually the most notable idle moment.
6. Mouse movement produces a small, restrained structure-tension response — no glow/halo/blob.
7. Scrolling down pins the Hero and plays the 5-phase choreography; scrolling up reverses it.
8. `prefers-reduced-motion: reduce` (DevTools emulation) shows a static, fully-composed "locked" frame with no motion at all.
9. No console errors or hydration warnings at any point above.
10. Resize to tablet (768px) and mobile (375px) widths and repeat checks 2-3 and 7 — composition remains legible and the void clip still protects the content at each size.

- [ ] **Step 2: Tune the scrim opacity if needed**

Read the current scrim rule in `app/components/home/Hero.vue` (search for `radial-gradient` in the template — it's the `<div>` immediately after `<HomeHeroKineticBlueprint>`). If Step 1's checks 2-3 show the void clip alone keeps text fully readable without needing the scrim's extra contrast boost, reduce its opacity from `paper/0.25` to `paper/0.15` (do not remove the element entirely — it still guards against a future facet color/shape change accidentally drifting under the text). If checks 2-3 reveal any residual contrast issue near the void's edges, leave the scrim at `paper/0.25` unchanged. Either way this is a one-value tuning decision made from the Step 1 observations, not a structural change.

If a change is made:
```bash
git add app/components/home/Hero.vue
git commit -m "chore: tune Hero scrim opacity for Signal Architecture void clip

Verified the dynamic void clipPath alone keeps headline/subtext/CTA
readable; reduced the scrim's contrast boost accordingly while
keeping it in place as a guard against future structure changes.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

If no change is made, no commit is needed for this task — Step 1's verification alone completes it.

- [ ] **Step 3: Run the full verification suite**

```bash
npx nuxi typecheck
npm run lint
npm run build
```
Expected: all three succeed with no new errors introduced by this plan (pre-existing errors in unrelated experimental files under `app/components/home/hero-bg/` or `app/components/intro/` are out of scope and may remain).
