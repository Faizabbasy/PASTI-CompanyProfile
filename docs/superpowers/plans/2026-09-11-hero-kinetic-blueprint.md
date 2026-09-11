# Hero Kinetic Blueprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero's Three.js "Living Surface" shader background with a 2D SVG+GSAP "Kinetic Blueprint" graphic motion identity system (precision grid, construction lines, diagonal/slash geometry, registration marks, yellow signal nodes), including a new pinned scroll choreography, idle motion, and full lifecycle/responsive discipline — while leaving all locked Hero foreground content untouched.

**Architecture:** One new Vue component (`HeroKineticBlueprint.vue`) mounts an inline SVG at the same z-index slot the Living Surface canvas occupies today. One new composable (`useHeroKineticBlueprint.ts`) owns all GSAP/ScrollTrigger logic — 4 independently-scheduled idle timescales, a pinned+scrubbed scroll timeline, live tier/pointer-capability reconciliation, and full cleanup — following the exact lifecycle patterns already proven in `useHeroLivingSurface.ts` (IntersectionObserver+visibilitychange pause, live reduced-motion listener, ResizeObserver-driven tier rebuild, idempotent start/stop). A small data module (`kineticBlueprintPaths.ts`) holds static per-tier path/coordinate constants, kept separate from animation logic. A prerequisite fix to the shared `useGsapContext` composable makes it actually invoke a returned cleanup function, since the current Living Surface's cleanup closure is silently dropped today.

**Tech Stack:** Vue 3 (`<script setup>`), Nuxt 4, GSAP 3.12 core + ScrollTrigger (already installed — no MorphSVGPlugin, no new dependency), inline SVG, Tailwind (scrim opacity only).

**Spec:** `docs/superpowers/specs/2026-09-11-hero-kinetic-blueprint-design.md`

## Global Constraints

- No Three.js, no WebGL, no shaders anywhere in the new code (spec Context).
- No SVG path `d` attribute is ever animated; all shape/state change uses `transform` (`scale`/`translate`/`rotate`), `clipPath`/`mask`, `stroke-dashoffset`, `opacity` only (spec "SVG animation technique constraint"). No MorphSVGPlugin or other paid GSAP plugin may be added to `package.json`.
- Locked/untouched: everything inside `data-hero-content` in `Hero.vue` (headline triad, subtext, CTA row, corner brackets), container/max-width, section height, navbar, existing entry timeline, section order, global palette (spec "Locked / out of scope").
- The only permitted change to `Hero.vue` besides the mount-point component swap is the scrim opacity: `paper/0.4` → `paper/0.25`, shape/size/position unchanged (spec "Scrim audit").
- Pin distances are exact per tier: desktop 160vh, tablet 100vh, mobile 65vh (spec "Responsive art direction").
- Pointer interaction capability must be re-evaluated on both a tier change AND a live `(hover: hover) and (pointer: fine)` `MediaQueryList` `change` event — never derived only once at setup or only inside the resize handler (spec "Pointer lifecycle").
- Pointer bounds are cached in document space (`documentTop = rect.top + window.scrollY`), never re-measured with `getBoundingClientRect()` inside the pointer/ticker hot path (spec "Performance / lifecycle strategy").
- Every observer/listener/timeline the composable creates must be released in its returned cleanup function — no WebGL context to lose, but the "release every acquired handle" discipline from `useHeroLivingSurface.ts` still applies.
- `ClientOnly` wraps the whole new component, matching the current pattern, to avoid SSR/hydration mismatch.

---

### Task 1: Fix `useGsapContext` to invoke a returned cleanup function

**Files:**
- Modify: `app/composables/motion/useGsapContext.ts`
- Test: manual (no existing test harness for composables in this repo — verified via the reproduction steps below, matching how `useHeroLivingSurface.ts`'s lifecycle is already manually verified per its own commit history)

**Interfaces:**
- Consumes: nothing new
- Produces: `useGsapContext(setup: (ctx: gsap.Context) => void | (() => void))` — widened signature. Existing call sites that return `undefined` (implicitly, via early-exit `return` or no return statement) are unaffected. A call site that returns a plain cleanup function now has that function invoked once, after `ctx.revert()`, when the component unmounts.

This is a prerequisite bugfix: `HeroLivingSurface.vue` already does `useGsapContext(() => { ...; return useHeroLivingSurface(...) })`, expecting the returned closure (which calls `renderer.dispose()`, `forceContextLoss()`, disconnects observers, etc.) to run on unmount. Today it does not — `useGsapContext` only calls `ctx.revert()`, which kills GSAP-context-tracked tweens/ScrollTriggers but has no knowledge of a plain returned JS function. `HeroKineticBlueprint.vue` (Task 6) will use this same `useGsapContext(() => { ...; return cleanup })` pattern and needs it to actually work.

- [ ] **Step 1: Read the current file to confirm the exact lines to change**

Already read in full above — current content:

```typescript
import gsap from 'gsap'

/**
 * Scopes a GSAP setup function to a gsap.context() tied to the calling
 * component's lifetime, so every tween/ScrollTrigger it creates is killed
 * automatically on unmount — required to avoid duplicate ScrollTrigger
 * instances across route re-entry and HMR.
 */
export function useGsapContext(setup: (ctx: gsap.Context) => void) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined

  onMounted(() => {
    ctx = gsap.context(setup)
  })

  onBeforeUnmount(() => {
    ctx?.revert()
  })
}
```

- [ ] **Step 2: Widen the signature and capture/invoke the returned cleanup**

Replace the full file contents with:

```typescript
import gsap from 'gsap'

/**
 * Scopes a GSAP setup function to a gsap.context() tied to the calling
 * component's lifetime, so every tween/ScrollTrigger it creates is killed
 * automatically on unmount — required to avoid duplicate ScrollTrigger
 * instances across route re-entry and HMR.
 *
 * `setup` may optionally return a plain cleanup function for resources
 * gsap.context() cannot track on its own (e.g. a WebGL renderer, a
 * ResizeObserver, a raw event listener). That function is invoked once on
 * unmount, after `ctx.revert()`. Most existing callers return nothing
 * (undefined), which is a no-op here — this is purely additive.
 */
export function useGsapContext(setup: (ctx: gsap.Context) => void | (() => void)) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined
  let extraCleanup: (() => void) | undefined

  onMounted(() => {
    ctx = gsap.context(() => {
      extraCleanup = setup(ctx as gsap.Context) ?? undefined
    })
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    extraCleanup?.()
  })
}
```

Note: `gsap.context(fn)` calls `fn` synchronously and passes it the same `gsap.Context` instance being constructed — wrapping `setup` in an inner arrow function here (rather than passing `setup` directly to `gsap.context`) is what lets us capture `setup`'s return value into `extraCleanup`, since `gsap.context()` itself discards its callback's return value.

- [ ] **Step 3: Verify no existing consumer's TypeScript types break**

Run:
```bash
npx nuxi typecheck
```
Expected: no new errors. Every existing `useGsapContext(() => { ...; return })` or `useGsapContext(() => { ... })` call site returns `void`/`undefined`, which satisfies the widened `void | (() => void)` return type.

- [ ] **Step 4: Manual smoke test — confirm existing behavior is unchanged**

Run the dev server and load the homepage:
```bash
npm run dev
```
Navigate to `/`, confirm the Hero's existing entry animation (word-mask reveal, spotlight, shine) still plays normally, and no console errors appear. This confirms the widened `useGsapContext` didn't regress any current consumer (Hero.vue's own `useGsapContext` call returns nothing, so this only needs to show nothing broke).

- [ ] **Step 5: Commit**

```bash
git add app/composables/motion/useGsapContext.ts
git commit -m "fix: invoke useGsapContext setup's returned cleanup function on unmount

The Living Surface composable's cleanup closure (forceContextLoss,
observer teardown) was silently discarded because useGsapContext only
called ctx.revert(), which gsap.context() cannot use to track a plain
returned function. Prerequisite for the Kinetic Blueprint composable,
which relies on the same pattern.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Author static path/coordinate data (`kineticBlueprintPaths.ts`)

**Files:**
- Create: `app/composables/motion/kineticBlueprintPaths.ts`

**Interfaces:**
- Consumes: nothing (pure data module)
- Produces:
  - `export type BlueprintTier = 'desktop' | 'tablet' | 'mobile'`
  - `export interface BlueprintPhaseState { transform?: string; opacity?: number; strokeDashoffset?: number }`
  - `export interface BlueprintElementDef { id: string; d?: string; detail?: 'primary' | 'secondary'; role?: 'guide'; idle?: BlueprintPhaseState; phases?: Partial<Record<'calibration' | 'construction' | 'convergence' | 'resolution' | 'handoff', BlueprintPhaseState>> }`
  - `export interface BlueprintComposition { viewBox: string; masses: BlueprintElementDef[]; constructionLines: BlueprintElementDef[]; gridLines: BlueprintElementDef[]; registrationMarks: BlueprintElementDef[]; nodes: BlueprintElementDef[] }`
  - `export const PIN_DISTANCE_VH: Record<BlueprintTier, number>` → `{ desktop: 160, tablet: 100, mobile: 65 }`
  - `export function getComposition(tier: BlueprintTier): BlueprintComposition`

This module is pure data — no GSAP, no DOM APIs — so it is trivially readable/reviewable independent of animation logic, and the composable (Task 3+) imports from it rather than inlining coordinates.

- [ ] **Step 1: Write the file**

```typescript
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
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npx nuxi typecheck
```
Expected: no errors in this file (pure data + types, no runtime dependencies).

- [ ] **Step 3: Commit**

```bash
git add app/composables/motion/kineticBlueprintPaths.ts
git commit -m "feat: add static composition data for Hero Kinetic Blueprint

Fixed-d SVG paths and per-phase transform/opacity targets for the 3
major masses, construction lines, grid lines, registration marks, and
signal nodes, per tier (desktop/tablet share geometry with element
filtering; mobile has its own repositioned coordinate set).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Composable skeleton — tier detection, element building, SVG ref wiring

**Files:**
- Create: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `getComposition`, `PIN_DISTANCE_VH`, `BlueprintTier`, `BlueprintComposition`, `BlueprintElementDef` from `kineticBlueprintPaths.ts` (Task 2)
- Produces:
  - `export interface UseHeroKineticBlueprintOptions { sectionEl: Ref<HTMLElement | null> }`
  - `export function useHeroKineticBlueprint(svgEl: Ref<SVGSVGElement | null>, options: UseHeroKineticBlueprintOptions): () => void`
  - Internal (not exported, but relied on by later tasks in this same file): `getTier(): BlueprintTier`, `buildElements(tier): void`, `applyTier(tier): void`

This task establishes the file's skeleton and the tier/element-building foundation that every later task (idle motion, scroll, pointer, reduced motion) attaches to. It intentionally does not yet add animation — just enough that mounting the component renders the correct static composition per tier with no console errors.

- [ ] **Step 1: Write the composable skeleton**

```typescript
// app/composables/motion/useHeroKineticBlueprint.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getComposition,
  PIN_DISTANCE_VH,
  type BlueprintComposition,
  type BlueprintElementDef,
  type BlueprintTier
} from './kineticBlueprintPaths'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export interface UseHeroKineticBlueprintOptions {
  sectionEl: Ref<HTMLElement | null>
}

export function useHeroKineticBlueprint(
  svgEl: Ref<SVGSVGElement | null>,
  options: UseHeroKineticBlueprintOptions
): () => void {
  if (!import.meta.client || !svgEl.value) return () => {}

  const svg = svgEl.value
  const sectionEl = options.sectionEl.value ?? svg.closest('section') ?? svg.parentElement!

  // --- Responsive tier: re-evaluated live (never captured once), matching
  // the pattern in useHeroLivingSurface.ts. Desktop >=1024px, tablet
  // 640-1023px, mobile <640px per spec "Responsive art direction". ---
  function getTier(): BlueprintTier {
    if (window.matchMedia('(max-width: 639px)').matches) return 'mobile'
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet'
    return 'desktop'
  }
  let currentTier: BlueprintTier = getTier()

  const NS = 'http://www.w3.org/2000/svg'

  function makePath(def: BlueprintElementDef, extraClass: string): SVGGElement {
    const g = document.createElementNS(NS, 'g')
    g.dataset.blueprintId = def.id
    if (def.role) g.dataset.role = def.role
    if (def.idle?.transform) g.style.transform = def.idle.transform
    if (typeof def.idle?.opacity === 'number') g.style.opacity = String(def.idle.opacity)

    const path = document.createElementNS(NS, 'path')
    path.setAttribute('d', def.d)
    path.setAttribute('class', extraClass)
    if (typeof def.idle?.strokeDashoffset === 'number') {
      const length = path.getTotalLength?.() ?? 0
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(def.idle.strokeDashoffset)
    }
    g.appendChild(path)
    return g
  }

  // Groups holding each element category, rebuilt on a tier crossing.
  const massesGroup = document.createElementNS(NS, 'g')
  massesGroup.dataset.blueprintGroup = 'masses'
  const linesGroup = document.createElementNS(NS, 'g')
  linesGroup.dataset.blueprintGroup = 'lines'
  const gridGroup = document.createElementNS(NS, 'g')
  gridGroup.dataset.blueprintGroup = 'grid'
  const registrationGroup = document.createElementNS(NS, 'g')
  registrationGroup.dataset.blueprintGroup = 'registration'
  const nodesGroup = document.createElementNS(NS, 'g')
  nodesGroup.dataset.blueprintGroup = 'nodes'
  svg.append(massesGroup, gridGroup, linesGroup, registrationGroup, nodesGroup)

  let composition: BlueprintComposition = getComposition(currentTier)

  // Tracks the tier `buildElements` last ran for, so a resize that doesn't
  // cross a tier boundary never rebuilds the DOM (mirrors
  // useHeroLivingSurface.ts's `builtSegments` guard).
  let builtTier: BlueprintTier | null = null

  function shouldInclude(def: BlueprintElementDef, tier: BlueprintTier): boolean {
    if (tier === 'desktop') return true
    // Tablet and mobile both skip 'secondary' elements — tablet reuses
    // desktop's coordinate set (see kineticBlueprintPaths.ts), mobile has
    // its own set that only defines primary-tier elements to begin with.
    return def.detail !== 'secondary'
  }

  function clearGroup(group: SVGGElement) {
    group.replaceChildren()
  }

  function buildElements(tier: BlueprintTier) {
    if (builtTier === tier) return
    builtTier = tier
    composition = getComposition(tier)

    clearGroup(massesGroup)
    clearGroup(linesGroup)
    clearGroup(gridGroup)
    clearGroup(registrationGroup)
    clearGroup(nodesGroup)

    for (const def of composition.masses) {
      if (!shouldInclude(def, tier)) continue
      massesGroup.appendChild(makePath(def, 'kinetic-blueprint__mass'))
    }
    for (const def of composition.constructionLines) {
      if (!shouldInclude(def, tier)) continue
      linesGroup.appendChild(makePath(def, 'kinetic-blueprint__line'))
    }
    for (const def of composition.gridLines) {
      if (!shouldInclude(def, tier)) continue
      gridGroup.appendChild(makePath(def, 'kinetic-blueprint__grid'))
    }
    for (const def of composition.registrationMarks) {
      if (!shouldInclude(def, tier)) continue
      registrationGroup.appendChild(makePath(def, 'kinetic-blueprint__registration'))
    }
    for (const def of composition.nodes) {
      if (!shouldInclude(def, tier)) continue
      nodesGroup.appendChild(makePath(def, 'kinetic-blueprint__node'))
    }
  }

  buildElements(currentTier)

  return () => {
    // Cleanup body filled in by later tasks (ResizeObserver, IntersectionObserver,
    // ScrollTrigger, idle timelines, pointer listeners all disconnect here).
  }
}
```

- [ ] **Step 2: Create the mount component so the composable can be exercised in the browser**

Create `app/components/home/HeroKineticBlueprint.vue`:

```vue
<script setup lang="ts">
const svgRef = ref<SVGSVGElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  return useHeroKineticBlueprint(svgRef, { sectionEl: sectionRef })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg ref="svgRef" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
      <!-- Element groups are appended imperatively by useHeroKineticBlueprint. -->
    </svg>
  </div>
</template>
```

- [ ] **Step 3: Add minimal stroke/fill CSS for the element classes**

Add to `app/assets/css/main.css` (append near the existing `.hero-shine`/`.cursor-spotlight` utilities so Hero-specific custom CSS stays grouped):

```css
.kinetic-blueprint__mass {
  fill: theme(colors.navy.700);
  stroke: theme(colors.navy.500);
  stroke-width: 1;
}
.kinetic-blueprint__line,
.kinetic-blueprint__grid {
  fill: none;
  stroke: theme(colors.navy.700);
  stroke-width: 1;
}
.kinetic-blueprint__registration {
  fill: none;
  stroke: theme(colors.navy.700);
  stroke-width: 1.5;
}
.kinetic-blueprint__node {
  fill: theme(colors.navy.700);
  transition: fill 0.3s ease;
}
.kinetic-blueprint__node[data-active='true'] {
  fill: theme(colors.yellow.500);
}
```

Per-element `fill-opacity`/`opacity` is set inline (via the `<g>` wrapper's `style.opacity`, already wired in `makePath`) rather than in this stylesheet, since those values are per-element data from `kineticBlueprintPaths.ts`, not a shared style rule.

- [ ] **Step 4: Temporarily mount the new component standalone to verify rendering**

This step is a manual verification only — it does not wire the component into `Hero.vue` yet (that's Task 8, gated on the full composable being complete). Temporarily add `<HomeHeroKineticBlueprint class="fixed inset-0 z-50" />` to any page (e.g. `app/pages/index.vue`, added and then removed after verifying), run `npm run dev`, and open the homepage in a browser. Confirm:
- No console errors
- The SVG renders with visible `<g>` groups for masses/lines/grid/registration/nodes at desktop width
- Resizing the browser to <640px width and reloading shows the mobile composition's fewer elements

Remove the temporary mount line after verifying — do not commit it.

- [ ] **Step 5: Typecheck and lint**

Run:
```bash
npx nuxi typecheck
npm run lint
```
Expected: no errors. (If the project's ESLint config flags `SVGSVGElement`/`SVGGElement` DOM types as needing explicit import, they are global lib.dom types in TS and require no import — confirm this is the case if lint complains.)

- [ ] **Step 6: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts app/components/home/HeroKineticBlueprint.vue app/assets/css/main.css
git commit -m "feat: add Hero Kinetic Blueprint composable skeleton and mount component

Tier detection, per-tier element building (desktop/tablet/mobile), and
SVG group wiring. No animation yet — later tasks add idle motion, the
pinned scroll timeline, pointer interaction, and reduced-motion static
state.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Idle motion system — 4 independent timescales (A–D)

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `massesGroup`, `linesGroup`, `gridGroup`, `nodesGroup`, `composition`, `currentTier` (all defined in Task 3, same file/closure)
- Produces: internal `startIdleTimelines(): void` and `stopIdleTimelines(): void` (used by Task 5's visibility pause and Task 7's reduced-motion toggle), plus module-scope arrays `idleTweens: gsap.core.Tween[]`, `idleDelayedCalls: gsap.core.Tween[]` that later tasks' cleanup function iterates to kill.

Implements idle timescales A (constant micro), B (slow structural, non-looping), C (occasional events), and D (signature moment), per spec "Idle motion system". All scheduling happens via plain GSAP calls, not `gsap.context()`-tracked recursion — per the `HeroBgThreeWireGridCometStreak.vue` precedent already in this codebase, `gsap.context()` cannot auto-capture tweens spawned recursively from callbacks, so every self-rescheduling call explicitly stores its handle and checks a `cancelled`/`stopped` flag before rescheduling.

- [ ] **Step 1: Add idle-system state and the A (constant micro) timescale**

Insert into `useHeroKineticBlueprint.ts`, after `buildElements(currentTier)` and before the `return () => { ... }` cleanup:

```typescript
  // --- Idle motion system (spec "Idle motion system") — 4 independently
  // scheduled timescales so no obvious repeat point emerges. `idleStopped`
  // gates every self-rescheduling callback (C, D, and B's chain) so
  // stopIdleTimelines() can halt the whole system without individually
  // tracking every future scheduled call. ---
  let idleStopped = false
  const idleTweens: gsap.core.Tween[] = []
  const idleDelayedCalls: gsap.core.Tween[] = []

  function activeMasses(): SVGGElement[] {
    return Array.from(massesGroup.children) as SVGGElement[]
  }
  function activeLines(): SVGGElement[] {
    return Array.from(linesGroup.children) as SVGGElement[]
  }
  function activeGridLines(): SVGGElement[] {
    return Array.from(gridGroup.children) as SVGGElement[]
  }
  function activeNodes(): SVGGElement[] {
    return Array.from(nodesGroup.children) as SVGGElement[]
  }

  function startTimescaleA() {
    // Grid-line drift: ±1-2px, 3-6s, repeat:-1 yoyo, staggered start delays.
    for (const grid of activeGridLines()) {
      const dx = gsap.utils.random(-2, 2)
      const dy = gsap.utils.random(-1, 1)
      idleTweens.push(
        gsap.to(grid, {
          x: `+=${dx}`,
          y: `+=${dy}`,
          duration: gsap.utils.random(3, 6),
          delay: gsap.utils.random(0, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      )
    }
    // Node scale pulses: 1 <-> 1.08.
    for (const node of activeNodes()) {
      idleTweens.push(
        gsap.to(node, {
          scale: 1.08,
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
```

- [ ] **Step 2: Add timescale B (slow structural, non-looping chain)**

Append immediately after `startTimescaleA`:

```typescript
  function startTimescaleB() {
    const masses = activeMasses()
    if (masses.length === 0) return

    // Left mass slides along its own diagonal axis (10-20px), then chains to
    // a freshly-randomized next move rather than repeating — this is what
    // keeps timescale B from ever reading as a fixed-period loop.
    const leftMass = masses.find((m) => m.dataset.blueprintId === 'mass-left')
    if (leftMass) {
      const runSlide = () => {
        if (idleStopped) return
        const distance = gsap.utils.random(10, 20)
        const angleRad = gsap.utils.random(15, 20) * (Math.PI / 180)
        idleTweens.push(
          gsap.to(leftMass, {
            x: `+=${Math.sin(angleRad) * distance}`,
            y: `+=${Math.cos(angleRad) * distance}`,
            duration: gsap.utils.random(5, 12),
            ease: 'sine.inOut',
            onComplete: runSlide
          })
        )
      }
      runSlide()
    }

    // One long construction line's stroke-dashoffset extends/retracts.
    const longLine = activeLines()[0]?.querySelector('path')
    if (longLine) {
      const length = longLine.getTotalLength()
      longLine.style.strokeDasharray = String(length)
      const runDraw = () => {
        if (idleStopped) return
        idleTweens.push(
          gsap.to(longLine, {
            strokeDashoffset: gsap.utils.random(0, length * 0.4),
            duration: gsap.utils.random(5, 12),
            ease: 'sine.inOut',
            onComplete: runDraw
          })
        )
      }
      runDraw()
    }
  }
```

- [ ] **Step 3: Add timescale C (occasional events) and D (signature moment)**

Append immediately after `startTimescaleB`:

```typescript
  function activateNode(node: SVGGElement, duration = 0.4) {
    node.dataset.active = 'true'
    idleTweens.push(
      gsap.to(node, {
        scale: 1.3,
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

  function drawRandomLine() {
    const lines = activeLines()
    const target = lines[Math.floor(Math.random() * lines.length)]?.querySelector('path')
    if (!target) return
    const length = target.getTotalLength()
    target.style.strokeDasharray = String(length)
    idleTweens.push(gsap.fromTo(target, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }))
  }

  function startTimescaleC() {
    const runEvent = () => {
      if (idleStopped) return
      const nodes = activeNodes()
      const choice = Math.floor(gsap.utils.random(0, 3))
      if (choice === 0) drawRandomLine()
      else if (choice === 1 && nodes.length > 0) activateNode(nodes[Math.floor(Math.random() * nodes.length)]!)
      else if (nodes.length > 0) activateNode(nodes[Math.floor(Math.random() * nodes.length)]!, 0.6)

      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(3, 7), runEvent))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(3, 7), runEvent))
  }

  // Signature-moment variants (spec: "3-4 pre-authored variants" so repeats
  // aren't identical) — each picks a small set of lines + one node to
  // converge toward, then retract. Indices are defensive-checked against
  // the current tier's actual element count since mobile has fewer lines.
  const signatureVariants: Array<() => void> = [
    () => runSignature([0, 1], 0),
    () => runSignature([1, 2], 1),
    () => runSignature([0], 0)
  ]

  function runSignature(lineIndices: number[], nodeIndex: number) {
    const lines = activeLines()
      .map((g) => g.querySelector('path'))
      .filter((p): p is SVGPathElement => !!p)
    const nodes = activeNodes()
    const selectedLines = lineIndices.map((i) => lines[i]).filter((p): p is SVGPathElement => !!p)
    const node = nodes[nodeIndex] ?? nodes[0]
    if (selectedLines.length === 0 && !node) return

    const tl = gsap.timeline()
    for (const line of selectedLines) {
      const length = line.getTotalLength()
      line.style.strokeDasharray = String(length)
      tl.fromTo(line, { strokeDashoffset: length, opacity: 0.4 }, { strokeDashoffset: 0, opacity: 0.8, duration: 0.9, ease: 'power2.out' }, 0)
    }
    if (node) {
      tl.call(() => activateNode(node, 0.6), undefined, 0.7)
    }
    tl.to(
      selectedLines,
      { opacity: 0.15, duration: 1.2, ease: 'power2.in' },
      1.6
    )
    idleTweens.push(tl as unknown as gsap.core.Tween)
  }

  function startTimescaleD() {
    const runSignatureMoment = () => {
      if (idleStopped) return
      const variant = signatureVariants[Math.floor(Math.random() * signatureVariants.length)]
      variant?.()
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 15), runSignatureMoment))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 15), runSignatureMoment))
  }

  function startIdleTimelines() {
    idleStopped = false
    startTimescaleA()
    startTimescaleB()
    startTimescaleC()
    startTimescaleD()
  }

  function stopIdleTimelines() {
    idleStopped = true
    for (const tween of idleTweens.splice(0)) tween.kill()
    for (const call of idleDelayedCalls.splice(0)) call.kill()
  }
```

- [ ] **Step 2: Call `startIdleTimelines()` at setup and kill everything in cleanup**

Modify the existing `return () => { ... }` block at the end of the composable:

```typescript
  startIdleTimelines()

  return () => {
    stopIdleTimelines()
  }
```

(Later tasks append more to both the setup section above this `return` and to the cleanup function body — this task's version is intentionally minimal.)

- [ ] **Step 3: Manual verification**

Re-add the temporary mount from Task 3 Step 4, run `npm run dev`, and observe the Hero background for at least 20 seconds. Confirm:
- Grid lines and nodes show constant subtle motion (timescale A)
- The left mass visibly drifts over several seconds without snapping back (timescale B)
- At least one line-draw or node-flash event occurs within any 10-second window (timescale C)
- No two consecutive observation windows look identical (no obvious short loop)

Remove the temporary mount again after verifying.

- [ ] **Step 4: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add 4-timescale idle motion system to Kinetic Blueprint composable

Constant micro drift/pulse (A), non-looping slow structural motion (B),
self-rescheduling occasional events (C), and a signature-moment
timeline with 3 variants (D) — all independently scheduled per spec so
the idle system never reads as a short, detectable loop.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Lifecycle discipline — visibility pause, resize/tier rebuild, cleanup

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `stopIdleTimelines`, `startIdleTimelines`, `buildElements`, `getTier` (Tasks 3–4, same file)
- Produces: composable's cleanup function now fully disconnects all observers/listeners created in this task

Mirrors `useHeroLivingSurface.ts`'s proven pattern: an `IntersectionObserver` + `document.visibilitychange` genuinely stop/start (not skip-inside) the idle system, and a `ResizeObserver` triggers `buildElements` only on an actual tier crossing.

- [ ] **Step 1: Add visibility/intersection pausing**

Insert after the `startIdleTimelines()` call from Task 4 Step 2, replacing that block:

```typescript
  // --- Visibility / intersection pausing: genuinely stop/start idle
  // timelines, mirroring useHeroLivingSurface.ts's syncLoopState pattern. ---
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

Note: `reducedMotion` is referenced here but not yet declared — Task 7 adds it. For this task alone, temporarily declare a local `const reducedMotion = false` directly above this block; Task 7 Step 1 removes that temporary line when it adds the real live-tracked variable.

- [ ] **Step 2: Add resize/tier-crossing rebuild**

Insert immediately after the intersection/visibility block from Step 1:

```typescript
  // --- Resize: rebuild the element set only on an actual tier crossing.
  // viewBox + preserveAspectRatio (set in HeroKineticBlueprint.vue's
  // template) absorbs same-tier resizes with zero JS. ---
  function reconcileTier() {
    const nextTier = getTier()
    if (nextTier === currentTier) return
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildElements(currentTier)
    syncRunState()
  }

  const resizeObserver = new ResizeObserver(() => reconcileTier())
  resizeObserver.observe(sectionEl)
```

- [ ] **Step 3: Start the system and wire full cleanup**

Replace the `startIdleTimelines()` / `return () => { stopIdleTimelines() }` block from Task 4 Step 2 with:

```typescript
  syncRunState()

  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
```

- [ ] **Step 4: Manual verification**

With the temporary mount from Task 3 Step 4 re-added:
- Scroll the Hero out of the viewport, wait a few seconds, open DevTools Performance/Rendering panel or add a temporary `console.log` inside `startTimescaleA`/`stopIdleTimelines` to confirm idle tweens actually stop when offscreen and resume when scrolled back into view.
- Switch to another browser tab for a few seconds and back — confirm the same pause/resume behavior via `document.visibilitychange`.
- Resize the browser window across the 640px and 1024px breakpoints — confirm the element set changes (fewer elements below 640px) with no console errors, and idle motion resumes correctly afterward.

Remove any temporary `console.log` statements and the temporary mount before committing.

- [ ] **Step 5: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 6: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add visibility pause and tier-crossing rebuild to Kinetic Blueprint

IntersectionObserver + visibilitychange genuinely stop/start idle
timelines when the Hero is offscreen or the tab is hidden; ResizeObserver
rebuilds the element set only on an actual tier crossing, matching the
lifecycle discipline already proven in useHeroLivingSurface.ts.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Pointer interaction with live capability + scroll-safe bounds

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `sectionEl`, `activeLines`, `activeNodes` (prior tasks, same file)
- Produces: internal `reconcilePointerState(): void`, wired into both `reconcileTier()` (Task 5) and a new `pointerMql` change listener

Implements spec "Pointer lifecycle" and "Performance / lifecycle strategy" pointer-bounds requirements exactly: a dedicated `MediaQueryList` with its own `change` listener (not only checked on resize), document-space bounds caching, and `gsap.ticker`-driven updates instead of raw `mousemove` handling every frame.

- [ ] **Step 1: Add document-space bounds caching**

Insert into the composable, after the `reconcileTier`/`resizeObserver` block from Task 5:

```typescript
  // --- Pointer bounds cached in document space, not viewport space, since
  // the Hero moves relative to the viewport across the pre-pin/pinned/
  // post-pin scroll ranges (spec "Performance / lifecycle strategy"). ---
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
```

- [ ] **Step 2: Add the raw pointer target tracker and damped nudge state**

Insert immediately after Step 1's block:

```typescript
  // Raw normalized pointer position (-1..1), updated only by the listener.
  const rawPointer = { x: 0, y: 0 }
  // Damped pointer position consumed by the gsap.ticker callback.
  const dampedPointer = { x: 0, y: 0 }

  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
    const currentTop = cachedDocumentTop - window.scrollY
    rawPointer.x = ((event.clientX - cachedLeft) / cachedWidth) * 2 - 1
    rawPointer.y = -(((event.clientY - currentTop) / cachedHeight) * 2 - 1)
  }

  // Elements currently nudged by pointer proximity, so they can be eased
  // back to baseline on detach (spec: "tween any pointer-nudged elements
  // back to their idle-timeline baseline").
  let nudgedElements: SVGGElement[] = []

  function pointerTick() {
    const t = 1 - Math.exp(-8 * gsap.ticker.deltaRatio(60) * (1 / 60))
    dampedPointer.x += (rawPointer.x - dampedPointer.x) * t
    dampedPointer.y += (rawPointer.y - dampedPointer.y) * t

    // Nudge the 2-3 nearest lines/nodes toward the pointer, capped magnitude.
    const candidates = [...activeLines(), ...activeNodes()]
    const withDistance = candidates
      .map((el) => {
        const cx = el.getBBox().x + el.getBBox().width / 2
        const cy = el.getBBox().y + el.getBBox().height / 2
        const px = (dampedPointer.x * 0.5 + 0.5) * 1600
        const py = (dampedPointer.y * -0.5 + 0.5) * 900
        return { el, dist: Math.hypot(cx - px, cy - py) }
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)

    nudgedElements = withDistance.map((c) => c.el)
    for (const { el, dist } of withDistance) {
      const influence = Math.max(0, 1 - dist / 400)
      const dx = dampedPointer.x * 6 * influence
      const dy = dampedPointer.y * -6 * influence
      el.style.setProperty('--pointer-nudge-x', `${dx}px`)
      el.style.setProperty('--pointer-nudge-y', `${dy}px`)
      el.style.translate = `var(--pointer-nudge-x, 0px) var(--pointer-nudge-y, 0px)`
    }
  }
```

- [ ] **Step 3: Add the pointer capability MediaQueryList and reconciler**

Insert immediately after Step 2's block:

```typescript
  // --- Pointer capability: dedicated MediaQueryList with its own change
  // listener, reconciled alongside (not only inside) tier changes — a
  // tablet can gain a mouse/trackpad with zero resize event (spec "Pointer
  // lifecycle"). ---
  const pointerMql = window.matchMedia('(hover: hover) and (pointer: fine)')
  let isPointerActive = false

  function pointerShouldBeActive(): boolean {
    if (currentTier === 'mobile') return false
    return pointerMql.matches
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
      // Ease nudged elements back to baseline so nothing is left visually
      // offset with no system driving it back.
      for (const el of nudgedElements) {
        gsap.to(el, { '--pointer-nudge-x': '0px', '--pointer-nudge-y': '0px', duration: 0.5, ease: 'power2.out' })
      }
      nudgedElements = []
      rawPointer.x = 0
      rawPointer.y = 0
      dampedPointer.x = 0
      dampedPointer.y = 0
    }
    // If state is unchanged: no-op — idempotent, matching usePointerVelocity's
    // start()/stop() guard pattern, so the two independent triggers below
    // (tier reconciliation and the pointerMql change event) can never
    // produce duplicate listeners/ticker callbacks even if they fire close
    // together.
  }

  pointerMql.addEventListener('change', reconcilePointerState)
```

- [ ] **Step 4: Wire pointer reconciliation into tier changes and initial setup**

Modify `reconcileTier()` (added in Task 5 Step 2) to also call `reconcilePointerState()`, and modify `refreshPointerBounds()`'s call site to also run on resize. Replace the existing `reconcileTier` function body:

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
    buildElements(currentTier)
    syncRunState()
    refreshPointerBounds()
    reconcilePointerState()
  }
```

And immediately after `refreshPointerBounds()`'s initial call (Step 1) — i.e. right before the `pointerMql.addEventListener('change', ...)` line added in Step 3 is a fine place — add the initial reconciliation call at the very end of that block:

```typescript
  reconcilePointerState() // initial pointer-state evaluation at setup
```

- [ ] **Step 5: Add `--pointer-nudge-x`/`--pointer-nudge-y` custom property defaults and update cleanup**

Add to `app/assets/css/main.css`, alongside the rules added in Task 3 Step 3:

```css
.kinetic-blueprint__mass,
.kinetic-blueprint__line,
.kinetic-blueprint__node {
  --pointer-nudge-x: 0px;
  --pointer-nudge-y: 0px;
}
```

Update the composable's cleanup function (from Task 5 Step 3) to also remove the pointer listener/ticker/MediaQueryList listener:

```typescript
  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (isPointerActive) {
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
    }
    pointerMql.removeEventListener('change', reconcilePointerState)
  }
```

- [ ] **Step 6: Manual verification**

With the temporary mount re-added:
- Move the mouse over the Hero on desktop — confirm the 2-3 nearest lines/nodes visibly (subtly) shift toward the pointer, damped smoothly, with no jump.
- Scroll the page down partway (before any pin exists yet — that's Task 8) and move the mouse again — confirm pointer nudging still targets the correct elements (no offset drift), verifying the document-space bounds math.
- In Chrome DevTools, toggle device toolbar to a touch device emulation and reload — confirm pointer nudging does not activate (or, using the "no touch, mouse only" combination if available, confirm capability changes without a resize correctly toggle it — this can also be verified by pasting `window.matchMedia('(hover: hover) and (pointer: fine)').matches` into the console and manually confirming the value used).
- Resize across the mobile breakpoint — confirm pointer interaction detaches at <640px width with no console errors about duplicate listeners.

Remove the temporary mount afterward.

- [ ] **Step 7: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 8: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts app/assets/css/main.css
git commit -m "feat: add pointer interaction with live capability tracking to Kinetic Blueprint

Dedicated (hover:hover)/(pointer:fine) MediaQueryList with its own
change listener, reconciled independently of tier changes so a device
gaining/losing a fine pointer mid-session (not just a resize) attaches
or detaches correctly. Pointer bounds cached in document space and
updated only via gsap.ticker, never per-mousemove getBoundingClientRect.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Reduced motion + entry choreography

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `useIntroReady` (existing composable), `motionDuration`, `motionEase` (existing `motionTokens.ts`), `stopIdleTimelines`, `syncRunState`, `reconcilePointerState` (prior tasks, same file)
- Produces: live-tracked `reducedMotion` variable consumed by `syncRunState` (replacing Task 5's temporary hardcoded `const reducedMotion = false`)

- [ ] **Step 1: Replace the temporary `reducedMotion` constant with a live-tracked variable**

Remove the `const reducedMotion = false` line added temporarily in Task 5 Step 1. Add, near the top of the composable (right after `let currentTier: BlueprintTier = getTier()`):

```typescript
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches
```

- [ ] **Step 2: Author the static "idle-settled" resting state applied under reduced motion**

Insert after the pointer-related code from Task 6 (anywhere before the final `return`):

```typescript
  // --- Reduced motion: idle timelines never start, no ScrollTrigger pin
  // (added in Task 8) is created, and a single static fully-composed frame
  // is shown instead — approximating the Convergence/Resolution visual
  // target, expressed directly via each element's `idle` values already
  // applied by `makePath`, so no extra GSAP .set() work is needed beyond
  // nudging opacity slightly up for a couple of key nodes. ---
  function applyReducedMotionRestingState() {
    const nodes = activeNodes()
    // 2-3 active yellow nodes, per spec.
    nodes.slice(0, Math.min(3, nodes.length)).forEach((node) => {
      node.dataset.active = 'true'
    })
  }

  function handleReducedMotionChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      stopIdleTimelines()
      isRunning = false
      applyReducedMotionRestingState()
      reconcilePointerState() // pointerShouldBeActive() does not check reducedMotion directly; guarded below
    } else {
      syncRunState()
      reconcilePointerState()
    }
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  if (reducedMotion) {
    applyReducedMotionRestingState()
  }
```

Note the syntax error in the draft above (`function handleReducedMotionChange = (e) => {}` mixes function-declaration and arrow-assignment syntax) — write it correctly as:

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
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  if (reducedMotion) {
    applyReducedMotionRestingState()
  }
```

- [ ] **Step 3: Also gate `pointerShouldBeActive()` on `reducedMotion`**

Modify the function from Task 6 Step 3:

```typescript
  function pointerShouldBeActive(): boolean {
    if (currentTier === 'mobile' || reducedMotion) return false
    return pointerMql.matches
  }
```

- [ ] **Step 4: Add entry choreography gated on `introReady`**

Insert after the reduced-motion block from Step 2:

```typescript
  // --- Entry choreography: gated on introReady, sequenced alongside (not
  // blocking) Hero.vue's own headline reveal. Uses existing motionDuration/
  // motionEase tokens so the timing language matches the rest of the page. ---
  const { introReady } = useIntroReady()
  let entryTimeline: gsap.core.Timeline | null = null
  const stopIntroWatch = watch(
    introReady,
    (ready) => {
      if (!ready) return
      if (reducedMotion) return // resting state already applied above; no entry animation under reduced motion

      entryTimeline = gsap.timeline()
      entryTimeline
        .from(activeGridLines(), { opacity: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base })
        .from(activeMasses(), { opacity: 0, scale: 0.92, duration: motionDuration.slow, ease: motionEase.standard, transformOrigin: 'center' }, '-=0.3')
        .from(
          activeLines().map((g) => g.querySelector('path')).filter(Boolean),
          { opacity: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base },
          '-=0.4'
        )
        .call(() => {
          const nodes = activeNodes()
          nodes.slice(0, Math.min(3, nodes.length)).forEach((node) => activateNode(node, 0.5))
        })
        .call(() => {
          syncRunState() // starts idle timelines A-D once entry completes
        })
    },
    { immediate: true }
  )
```

Add `motionStagger` to the existing `motionTokens.ts` import at the top of the file (introduce the import statement if not already present):

```typescript
import { motionDuration, motionEase, motionStagger } from './motionTokens'
```

- [ ] **Step 5: Prevent `syncRunState()`'s earlier unconditional call from double-starting idle timelines**

Since entry choreography now calls `syncRunState()` itself once the entry timeline completes, the earlier unconditional `syncRunState()` call (Task 5 Step 3, right before the `return`) must only run when there is no entry animation to wait for — i.e., under reduced motion (where Step 2's `if (reducedMotion) return` inside the watcher means `syncRunState` is never called by the entry path). Replace that call:

```typescript
  if (reducedMotion) {
    syncRunState() // no entry animation in this path — start (or rather, confirm not-started) idle state immediately
  }
  // Otherwise, syncRunState() is called by the entry timeline's completion above.
```

- [ ] **Step 6: Update cleanup to kill the entry timeline and remove the reduced-motion listener**

```typescript
  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
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

- [ ] **Step 7: Manual verification**

With the temporary mount re-added: reload the page and confirm the entry sequence plays (grid fades in, masses scale/fade in, lines draw, nodes flash, then idle motion begins) once `introReady` flips true. Then, in DevTools, enable "Emulate CSS media feature prefers-reduced-motion: reduce", reload, and confirm a static composed frame appears immediately with no animation and 2-3 nodes shown active (yellow). Toggle the emulation off/on again while the page is open (no reload) to confirm the live listener correctly switches between the two states without a remount.

Remove the temporary mount afterward.

- [ ] **Step 8: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 9: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add reduced-motion static state and entry choreography to Kinetic Blueprint

Live prefers-reduced-motion listener shows a composed static frame with
2-3 active nodes instead of continuous animation; entry sequence (grid
-> masses -> lines -> nodes -> idle start) gated on the existing
introReady ref, using the shared motionDuration/motionEase/motionStagger
tokens.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Pinned scroll choreography (5 phases, per-tier pin distance)

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts`

**Interfaces:**
- Consumes: `PIN_DISTANCE_VH`, `composition.masses`/`.constructionLines` with their `.phases` data (Task 2), `currentTier`, `reconcileTier` (prior tasks, same file)
- Produces: internal `scrollTriggerInstance: ScrollTrigger | null`, rebuilt on tier crossing

Implements spec "Scroll choreography" — one scrubbed, pinned `ScrollTrigger` per tier's exact distance, with 5 labeled phases, built exclusively from `transform`/`opacity`/`stroke-dashoffset` tweens (no path `d` morphing, no MorphSVGPlugin), fully reversible by construction since GSAP scrub ties timeline progress directly to scroll progress.

- [ ] **Step 1: Build the scroll timeline construction function**

Insert into the composable, after the entry-choreography block from Task 7 (before the final `return`):

```typescript
  // --- Pinned scroll choreography (spec "Scroll choreography"). One
  // scrubbed timeline per the current tier's pin distance; rebuilt whenever
  // the tier crosses a breakpoint so distance stays correct without a page
  // reload. Every animated value is transform/opacity/strokeDashoffset only
  // — never a path `d` change (spec "SVG animation technique constraint"). ---
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

    const massEls = activeMasses()
    const lineEls = activeLines()
    const guideEls = [...massEls, ...lineEls, ...activeGridLines(), ...activeRegistrationMarks()].filter(
      (el) => el.dataset.role === 'guide'
    )

    function massById(id: string): SVGGElement | undefined {
      return massEls.find((el) => el.dataset.blueprintId === id)
    }

    // Phase labels at 0/.2/.45/.7/.9/1 (spec exact fractions).
    tl.addLabel('calibration', 0)
      .addLabel('construction', 0.2)
      .addLabel('convergence', 0.45)
      .addLabel('resolution', 0.7)
      .addLabel('handoff', 0.9)
      .addLabel('end', 1)

    // Drive each mass through its authored per-phase transform/opacity
    // targets (from kineticBlueprintPaths.ts), one segment per phase
    // transition, so scrub position always corresponds to an interpolated
    // point between two authored states — never a jump.
    for (const def of composition.masses) {
      const el = massById(def.id)
      if (!el || !def.phases) continue
      const order: Array<keyof NonNullable<typeof def.phases>> = [
        'calibration',
        'construction',
        'convergence',
        'resolution',
        'handoff'
      ]
      let cursor = 0
      for (const phaseName of order) {
        const target = def.phases[phaseName]
        if (!target) continue
        tl.to(
          el,
          {
            opacity: target.opacity,
            // Apply transform via a CSS custom property pair consumed by a
            // fixed transform string, since GSAP can tween `x`/`y`/`scale`
            // directly on SVG elements without touching `d`.
            duration: 0.2,
            ease: 'none'
          },
          phaseName
        )
        cursor += 1
      }
    }

    // Secondary/guide elements fade out specifically during Resolution
    // (70-90%), per spec.
    if (guideEls.length > 0) {
      tl.to(guideEls, { opacity: 0, duration: 0.2, ease: 'none' }, 'resolution')
    }

    // Idle-mix crossfade during Calibration (0-20%): idle timelines' visual
    // influence reduces without killing them, so scrolling back up resumes
    // idle motion smoothly. Represented as a CSS custom property read by
    // idle tweens' targets — simplest correct implementation is to scale
    // down the opacity of non-key nodes during this phase.
    const nodeEls = activeNodes()
    const keyNodeIds = new Set(['node-1', 'node-2', 'node-5'])
    const nonKeyNodes = nodeEls.filter((n) => !keyNodeIds.has(n.dataset.blueprintId ?? ''))
    if (nonKeyNodes.length > 0) {
      tl.to(nonKeyNodes, { opacity: 0.3, duration: 0.2, ease: 'none' }, 'calibration')
    }

    // Handoff (90-100%): bottom band + a couple of lines already animate
    // downward via their authored 'handoff' phase target above (mass-bottom
    // translateY). No additional work needed here beyond what the per-mass
    // loop already applied.

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

  function activeRegistrationMarks(): SVGGElement[] {
    return Array.from(registrationGroup.children) as SVGGElement[]
  }
```

- [ ] **Step 2: Apply mass transform targets via a real transform string, not just opacity**

The Step 1 draft above only tweens `opacity` per phase for masses — the spec requires `transform` (`scale`/`translate`/`rotate`) to actually move/scale each mass per phase. Replace the per-mass loop inside `buildScrollTimeline()` with:

```typescript
    for (const def of composition.masses) {
      const el = massById(def.id)
      if (!el || !def.phases) continue
      const order: Array<keyof NonNullable<typeof def.phases>> = [
        'calibration',
        'construction',
        'convergence',
        'resolution',
        'handoff'
      ]
      for (const phaseName of order) {
        const target = def.phases[phaseName]
        if (!target) continue
        const vars: gsap.TweenVars = { duration: 0.2, ease: 'none' }
        if (typeof target.opacity === 'number') vars.opacity = target.opacity
        if (target.transform) {
          // GSAP can't tween a raw CSS transform string target directly on
          // an SVG <g> alongside x/y/scale shorthand reliably across
          // browsers, so instead parse the authored transform string's
          // translate/scale components into GSAP's own x/y/scale props,
          // which it tweens natively via its internal CSSPlugin-equivalent
          // SVG transform handling.
          const translateMatch = target.transform.match(/translate\(([-.\d]+)px,\s*([-.\d]+)px\)/)
          const scaleMatch = target.transform.match(/scale\(([-.\d]+)\)/)
          if (translateMatch) {
            vars.x = Number(translateMatch[1])
            vars.y = Number(translateMatch[2])
          }
          if (scaleMatch) {
            vars.scale = Number(scaleMatch[1])
          }
        }
        tl.to(el, vars, phaseName)
      }
    }
```

This keeps `kineticBlueprintPaths.ts`'s data human-authorable as CSS transform strings (Task 2) while letting GSAP tween the underlying numeric `x`/`y`/`scale` properties it needs for smooth SVG transform interpolation — still strictly transform-only, never `d`.

- [ ] **Step 3: Call `buildScrollTimeline()` at setup and on every tier change**

Modify `reconcileTier()` (from Task 6 Step 4) to also rebuild the scroll timeline:

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
    buildElements(currentTier)
    syncRunState()
    refreshPointerBounds()
    reconcilePointerState()
    buildScrollTimeline()
  }
```

Call `buildScrollTimeline()` once at initial setup — insert right after the entry-choreography `watch()` call from Task 7 Step 4, before the final `if (reducedMotion) { syncRunState() }` block:

```typescript
  buildScrollTimeline()
```

Also call it from `handleReducedMotionChange` (Task 7 Step 2) so toggling reduced motion live tears down/rebuilds the pin correctly:

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

- [ ] **Step 4: Update cleanup**

```typescript
  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
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

With the temporary mount re-added (use a real page context this time, e.g. temporarily swap it into `Hero.vue`'s existing mount point directly for this test only, then revert — since pin behavior needs the page's actual scroll container):
- Scroll down slowly through the Hero — confirm it pins (headline stays fixed) and the background composition visibly evolves through the 5 phases as you scroll, ending with the bottom band animating downward near 90-100%.
- Scroll back up — confirm the reverse plays smoothly with no jump cuts or flashes (GSAP scrub ties directly to scroll position, so this should be automatic).
- Resize the browser across a tier breakpoint while scrolled partway through the pin — confirm no console errors and the ScrollTrigger rebuilds cleanly (scroll position may reset, which is acceptable given a tier change is a rare mid-scroll event).
- Confirm `document.querySelectorAll('.gsap-marker-start, .gsap-marker-end')` or (simpler) `ScrollTrigger.getAll().length` in the console reports exactly 1 instance for the Hero after multiple resizes — never more (would indicate a duplicate).

Revert any temporary edit to `Hero.vue` after verifying — Task 9 does the real, permanent mount-point swap.

- [ ] **Step 6: Typecheck**

```bash
npx nuxi typecheck
```

- [ ] **Step 7: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "feat: add pinned 5-phase scroll choreography to Kinetic Blueprint

Single scrubbed ScrollTrigger per tier's exact pin distance
(160vh/100vh/65vh), driving transform/opacity-only tweens through
Calibration/Construction/Convergence/Resolution/Handoff phase labels.
No path d morphing; rebuilt on tier crossing and on reduced-motion
toggle (no pin at all when reduced motion is active).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Wire into `Hero.vue`, adjust scrim, remove Living Surface

**Files:**
- Modify: `app/components/home/Hero.vue:135-144`
- Delete: `app/components/home/HeroLivingSurface.vue`
- Delete: `app/composables/motion/useHeroLivingSurface.ts`

**Interfaces:**
- Consumes: `HomeHeroKineticBlueprint` (auto-imported from `app/components/home/HeroKineticBlueprint.vue`, Task 3)
- Produces: nothing new — this is the final integration swap

- [ ] **Step 1: Swap the mount point in `Hero.vue`**

Change (currently lines 135-137):

```html
    <ClientOnly>
      <HomeHeroLivingSurface class="z-[3]" />
    </ClientOnly>
```

to:

```html
    <ClientOnly>
      <HomeHeroKineticBlueprint class="z-[3]" />
    </ClientOnly>
```

Also update the preceding comment (currently lines 129-134) to describe the new system instead of the Living Surface:

```html
    <!-- Background treatment — Kinetic Blueprint, a 2D SVG/GSAP graphic
         motion identity system (see
         docs/superpowers/specs/2026-09-11-hero-kinetic-blueprint-design.md).
         Wrapped in ClientOnly so server + first client paint agree (both
         render nothing here) — avoids a hydration mismatch. -->
```

- [ ] **Step 2: Reduce the scrim opacity**

Change (currently line 143):

```html
      class="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,theme(colors.paper/0.4),transparent_70%)]"
```

to:

```html
      class="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,theme(colors.paper/0.25),transparent_70%)]"
```

Per spec "Scrim audit": shape/size/position (`60% 50% at 50% 45%`, `transparent 70%`) unchanged — opacity only, `0.4` → `0.25`.

- [ ] **Step 3: Delete the Living Surface files**

```bash
git rm app/components/home/HeroLivingSurface.vue app/composables/motion/useHeroLivingSurface.ts
```

- [ ] **Step 4: Check for any other references to the deleted files**

```bash
grep -rn "HeroLivingSurface\|useHeroLivingSurface" app/ --include="*.vue" --include="*.ts"
```

Expected: no matches remain (the only prior references were `Hero.vue`'s mount, now replaced, and the composable's own definition, now deleted).

- [ ] **Step 5: Evaluate whether the `three` dependency can be removed**

```bash
grep -rln "from 'three'\|from \"three\"" app/ --include="*.vue" --include="*.ts"
```

If this returns matches only inside `app/components/home/hero-bg/*.vue` (the already-documented 135 unused/never-mounted experimental files) and nowhere else, `three` is no longer used by any live code path. Per the spec, this removal is evaluated but not required — leave `three` in `package.json` unless the user explicitly confirms the `hero-bg/` experimental files should also be deleted, since removing the dependency while those files still import it would break their (currently inert, unbuilt) type-checking. Report the finding; do not remove the dependency in this task.

- [ ] **Step 6: Full manual verification against the spec's acceptance checklist**

Run the dev server and, on the live homepage (not a temporary standalone mount), verify each item from the spec's "Testing / acceptance" section:
- Pause animation (reduced-motion emulation) and screenshot at 1440×900 and 1920×1080 — composed/premium, not empty
- Watch idle for 15s — visible evolution
- Watch idle for 20s — no detectable short loop
- Scroll down and back up through the full pin range — no jump cuts
- Reduced-motion mode — full static composed frame, headline fully legible against the `paper/0.25` scrim
- Test desktop/tablet/mobile viewport widths — each intentionally art-directed
- Check browser console — no errors, no layout shift, no hydration mismatch
- Reload the page multiple times (HMR-equivalent via full reload, since this is the most reliable way to check for duplicate-instance bugs in a manual pass) — `ScrollTrigger.getAll().length` stays at 1 for the Hero each time
- Resize across tier breakpoints — pointer interaction attaches/detaches with no duplicate-listener console warnings
- Test pointer movement before scrolling, mid-pin, and after the pin releases — proximity mapping stays accurate

- [ ] **Step 7: Typecheck, lint, and build**

```bash
npx nuxi typecheck
npm run lint
npm run build
```
Expected: all three succeed with no errors. The production build in particular will surface any SSR-related issue with the new component that dev mode might mask.

- [ ] **Step 8: Commit**

```bash
git add app/components/home/Hero.vue
git commit -m "feat: mount Hero Kinetic Blueprint, retire Living Surface shader background

Swaps the Hero's background from the Three.js Living Surface shader to
the new 2D SVG/GSAP Kinetic Blueprint system at the same z-index mount
point. Reduces the existing text-legibility scrim from paper/0.4 to
paper/0.25 (shape/position unchanged) so the new composition's
grid/registration layer keeps visible presence behind the headline in
a static screenshot, per the design spec's scrim audit.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Context/locked foreground → Task 9 Steps 1-2 (only mount point + scrim opacity touched), Global Constraints. ✓
- Brand geometry note → Task 2 (new diagonal masses authored from scratch). ✓
- Visual composition (zones, masses, nodes) → Task 2 data, Task 3 rendering. ✓
- Scrim audit → Task 9 Step 2. ✓
- Idle motion (A-D) → Task 4. ✓
- Pointer interaction (secondary) → Task 6. ✓
- Scroll choreography (5 phases, pinned+scrubbed) → Task 8. ✓
- SVG animation technique constraint (no morph, no MorphSVGPlugin) → Task 8 Steps 1-2 use only transform/opacity/strokeDashoffset; Global Constraints states the rule explicitly. ✓
- Responsive art direction (tiers, pin distances) → Task 2 (`PIN_DISTANCE_VH`), Task 3 (`getTier`/`shouldInclude`), Task 8 (per-tier pin). ✓
- Pointer lifecycle (MediaQueryList change listener, not resize-only) → Task 6 Steps 3-4. ✓
- Reduced motion (live listener, static composed frame, no pin) → Task 7. ✓
- Entry choreography → Task 7 Step 4. ✓
- Files list → Tasks 2, 3, 9 create/modify/delete exactly the files named in the spec. ✓
- Performance/lifecycle strategy (visibility pause, resize, cleanup, document-space bounds, ClientOnly) → Task 5 (visibility/resize/cleanup), Task 6 (bounds), Task 3 Step 2 (ClientOnly via existing pattern). ✓
- Testing/acceptance checklist → Task 9 Step 6 walks every listed item. ✓
- Prerequisite `useGsapContext` cleanup bug (found during planning, user-approved fix) → Task 1. ✓

No spec requirement found without a corresponding task.

**Placeholder scan:** No TBD/TODO markers. One drafting artifact was caught and corrected in place: Task 7 Step 2 initially showed an invalid `function handleReducedMotionChange = (e) => {}` hybrid syntax before immediately being corrected to a valid `const handleReducedMotionChange = (e) => {}` arrow assignment — the corrected version is what the step instructs the implementer to write.

**Type consistency:** `useHeroKineticBlueprint(svgEl: Ref<SVGSVGElement | null>, options: UseHeroKineticBlueprintOptions): () => void` — signature is consistent between Task 3 (declaration) and Task 3 Step 2 (`HeroKineticBlueprint.vue`'s call site). `getComposition(tier: BlueprintTier): BlueprintComposition` — consistent between Task 2 (declaration) and Task 3 (`buildElements` call site) and Task 8 (`composition.masses`/`.constructionLines` field access). `PIN_DISTANCE_VH: Record<BlueprintTier, number>` — consistent between Task 2 (declaration) and Task 8 (`PIN_DISTANCE_VH[currentTier]`). `activeMasses`/`activeLines`/`activeGridLines`/`activeNodes`/`activeRegistrationMarks` naming is consistent everywhere they're called across Tasks 4, 6, 7, 8 (the Task 8 draft's initial omission of `activeRegistrationMarks` was corrected in Step 1 by defining it inline in the same task rather than leaving a dangling reference).
