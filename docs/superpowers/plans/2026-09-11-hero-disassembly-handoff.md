# Hero Disassembly Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Hero → WhatWeDo scroll transition disassemble into
fragments that reconstruct into WhatWeDo's headline, make the Signal
Architecture facet background hand full control to the pointer while it's
active (instead of blending with the always-on idle drift), and make the
header bar full-bleed edge-to-edge like Hero.

**Architecture:** All three pieces extend existing systems in place —
no new ScrollTrigger, no new Three.js/canvas, no new idle-motion engine.
Task 1 changes `pointerTick()`'s target properties and adds a settle/leave
handback in `useHeroKineticBlueprint.ts`. Task 2 is a pure Tailwind class
change on `Header.vue`. Tasks 3-5 extend the existing pinned scroll
timeline with word-target tweens, add one small new shared-state
composable (`useHeroHandoff.ts`) for the Hero→WhatWeDo landing-point
handoff, and consume it from `WhatWeDo.vue`/`EditorialIntro.vue`.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, GSAP (+ ScrollTrigger), Tailwind
CSS. No test framework in this repo — verification is `vue-tsc --noEmit`,
a production build, and manual visual inspection in the dev server (per
project convention; there are no `.test.`/`.spec.` files anywhere in the
codebase).

**Spec:** `docs/superpowers/specs/2026-09-11-hero-disassembly-handoff-design.md`

## Global Constraints

- No DOM/markup structure change to `Header.vue` or Hero's headline —
  element set, order, and nesting stay exactly as-is. Class/style/transform
  changes are allowed.
- No new `ScrollTrigger` instance on Hero's `<section>` — extend the
  existing scrubbed timeline in `useHeroKineticBlueprint.ts`.
- No layout, copy, or route changes anywhere.
- Every animated value on facets/words stays limited to
  transform (x/y/rotation/scale) and opacity — never an SVG path `d`
  change (existing project rule, unchanged).
- `prefers-reduced-motion: reduce` must fully skip every new animation
  path added by this plan (idle/pointer handoff, disassembly, header stays
  unaffected since it's non-motion CSS).
- Verify every task with: `npx vue-tsc --noEmit` (must pass with zero new
  errors) and a visual check via `npm run dev` at 1920×1080 and 375×812.

---

## File Structure

- **Modify** `app/composables/motion/useHeroKineticBlueprint.ts` — idle
  drift ↔ pointer handoff (Task 1), word-target disassembly tweens +
  landing-point publishing (Task 4).
- **Modify** `app/components/layout/Header.vue` — full-bleed class changes
  (Task 2).
- **Create** `app/composables/motion/useHeroHandoff.ts` — shared
  landing-point singleton, pattern-matched to `useSectionCurtain.ts`
  (Task 3).
- **Modify** `app/components/home/Hero.vue` — expose heading words ref,
  pass subtext/CTA refs down to the background component (Task 4).
- **Modify** `app/components/home/HeroKineticBlueprint.vue` — accept and
  forward the new props to the composable (Task 4).
- **Modify** `app/components/home/EditorialIntro.vue` — read landing
  points, extend the three accent words' reveal tween (Task 5).
- **Modify** `app/components/home/WhatWeDo.vue` — opt into the
  reconstruction via the new `reconstruct-from-hero` prop (Task 5).

---

### Task 1: Idle drift hands off to pointer control

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts:181-201` (`startFacetDrift`), `:436-448` (`pointerTick`), `:450-486` (pointer capability block)

**Interfaces:**
- Consumes: existing `facetEls()`, `dampedPointer`, `rawPointer`,
  `isPointerActive`, `pointerShouldBeActive()`, `handlePointerMove`,
  `reconcilePointerState()` — all already defined earlier in the same
  file, unchanged signatures.
- Produces: `pointerTick()` now writes GSAP `x/y/rotation` directly on
  each facet (instead of `--pointer-tension-x/-y` CSS custom properties);
  a new `armDriftHandback()` function that schedules drift to resume after
  the pointer settles or leaves. No other task depends on new exports from
  this task — it's self-contained behavior change within the composable.

This task changes how `pointerTick()` applies pointer influence so it
takes over the same `x/y/rotation` GSAP-tracked properties `startFacetDrift()`
uses (via `overwrite: 'auto'`), instead of writing separate CSS custom
properties that only blend additively via `translate` in CSS. It also adds
a handback so drift resumes smoothly (from current position, not origin)
once the pointer stops moving or leaves.

- [ ] **Step 1: Read the current CSS consumer of `--pointer-tension-*` to confirm removal is safe**

Run this to find every place the custom properties are read:

```bash
grep -rn "pointer-tension" app/assets/css/main.css app/components/home/hero-bg 2>/dev/null
```

Expected: matches only in `main.css` under the `signal-architecture__facet`
rule (or similar) as a `translate: var(--pointer-tension-x, 0) var(--pointer-tension-y, 0)`
or equivalent — confirm there is exactly one CSS consumer so removing the
JS writer doesn't leave dead-but-harmless CSS (harmless is fine; just
confirm no *other* JS depends on reading these properties back, e.g. via
`getComputedStyle`). Search:

```bash
grep -rn "getPropertyValue('--pointer-tension" app/
```

Expected: no matches (confirms nothing reads the value back in JS).

- [ ] **Step 2: Change `pointerTick()` to drive GSAP `x/y/rotation` with overwrite**

Replace the current body of `pointerTick()`:

```ts
  function pointerTick() {
    const t = 1 - Math.exp(-6 * gsap.ticker.deltaRatio(60) * (1 / 60))
    dampedPointer.x += (rawPointer.x - dampedPointer.x) * t
    dampedPointer.y += (rawPointer.y - dampedPointer.y) * t

    for (const facet of facetEls()) {
      const depthFactor = facet.dataset.blueprintId === 'plate-a' ? 1 : facet.dataset.blueprintId === 'plate-b' ? 0.7 : 0.5
      const dx = dampedPointer.x * 16 * depthFactor
      const dy = dampedPointer.y * -16 * depthFactor
      facet.style.setProperty('--pointer-tension-x', `${dx}px`)
      facet.style.setProperty('--pointer-tension-y', `${dy}px`)
    }
  }
```

with:

```ts
  // Pointer control takes over the same x/y/rotation properties idle
  // drift animates. `overwrite: 'auto'` is what hands control away from
  // any in-flight drift tween on the same facet without a separate pause
  // call — GSAP kills the conflicting tween on those properties for us.
  // A short duration (not a hard `gsap.set`) keeps the follow feeling
  // smoothed rather than snapping to the damped pointer position every
  // tick.
  function pointerTick() {
    const t = 1 - Math.exp(-6 * gsap.ticker.deltaRatio(60) * (1 / 60))
    dampedPointer.x += (rawPointer.x - dampedPointer.x) * t
    dampedPointer.y += (rawPointer.y - dampedPointer.y) * t

    for (const facet of facetEls()) {
      const depthFactor = facet.dataset.blueprintId === 'plate-a' ? 1 : facet.dataset.blueprintId === 'plate-b' ? 0.7 : 0.5
      const dx = dampedPointer.x * 28 * depthFactor
      const dy = dampedPointer.y * -28 * depthFactor
      const rot = dampedPointer.x * 2.5 * depthFactor
      gsap.to(facet, { x: dx, y: dy, rotation: rot, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
    }
  }
```

- [ ] **Step 3: Remove the now-unused `--pointer-tension-*` CSS**

Find and delete the CSS rule from Step 1 in `app/assets/css/main.css` (the
`translate: var(--pointer-tension-x, 0px) var(--pointer-tension-y, 0px)`
declaration and its surrounding comment, if the comment only describes
this mechanism). Do not remove anything else in that rule block if it also
sets unrelated properties — only delete the `translate`/custom-property
lines and their now-stale comment.

- [ ] **Step 4: Pause drift while pointer control is active, resume on settle/leave**

Find `startFacetDrift()` and change its scheduling so a facet's next
scheduled drift tween checks a new `pointerControlActive` flag before
firing, and add the settle/leave handback. Add this state near the other
pointer state (`let isPointerActive = false`):

```ts
  // True for as long as the pointer is actively driving facet position
  // (see pointerTick()). Idle drift checks this before scheduling its
  // next leg so the two systems hand off cleanly instead of blending.
  let pointerControlActive = false
  let driftHandbackCall: gsap.core.Tween | null = null

  // Arms a delayed resume of idle drift once the pointer stops moving.
  // Re-armed on every pointermove so drift only resumes after a real
  // settle, not mid-movement.
  function armDriftHandback() {
    driftHandbackCall?.kill()
    driftHandbackCall = gsap.delayedCall(0.9, () => {
      pointerControlActive = false
    })
  }
```

Update `handlePointerMove` to set `pointerControlActive = true` and call
`armDriftHandback()` on every move — find:

```ts
  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
```

and add right after that guard:

```ts
    pointerControlActive = true
    armDriftHandback()
```

Add a `pointerleave` handback alongside the existing `pointermove`
listener wiring in `reconcilePointerState()` — find:

```ts
      sectionEl.addEventListener('pointermove', handlePointerMove, { passive: true })
      gsap.ticker.add(pointerTick)
```

and change to:

```ts
      sectionEl.addEventListener('pointermove', handlePointerMove, { passive: true })
      sectionEl.addEventListener('pointerleave', handlePointerLeave, { passive: true })
      gsap.ticker.add(pointerTick)
```

and the matching removal branch — find:

```ts
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
      resetPointerTension()
```

change to:

```ts
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      sectionEl.removeEventListener('pointerleave', handlePointerLeave)
      gsap.ticker.remove(pointerTick)
      driftHandbackCall?.kill()
      pointerControlActive = false
```

Add the new `handlePointerLeave` function next to `handlePointerMove`:

```ts
  function handlePointerLeave() {
    driftHandbackCall?.kill()
    pointerControlActive = false
  }
```

Delete the old `resetPointerTension()` function entirely (it only reset
the now-removed `--pointer-tension-*` properties) and remove its call site
inside `reconcilePointerState()`'s deactivation branch (already replaced
above — confirm `resetPointerTension()` has no remaining callers with
`grep -n "resetPointerTension" app/composables/motion/useHeroKineticBlueprint.ts`,
expected: no matches after this edit).

- [ ] **Step 5: Gate `startFacetDrift()`'s reschedule on `pointerControlActive`**

Find `startFacetDrift()`'s `runDrift` inner function:

```ts
      const runDrift = () => {
        if (idleStopped) return
        const distance = gsap.utils.random(28, 55)
```

Change the guard to also check pointer control, and resume from the
facet's *current* transform rather than a fresh random leg when handback
happens — this reads as one continuous motion instead of a snap:

```ts
      const runDrift = () => {
        if (idleStopped) return
        if (pointerControlActive) {
          // Pointer has control — check back shortly instead of
          // scheduling a drift leg now, so drift resumes as soon as
          // control is handed back rather than staying paused forever.
          idleDelayedCalls.push(gsap.delayedCall(0.3, runDrift))
          return
        }
        const distance = gsap.utils.random(28, 55)
```

(The rest of `runDrift`'s body — computing `angleRad` and calling
`gsap.to(facet, { x: ..., y: ..., ... })` — stays exactly as it is; GSAP's
relative-to-current-value tweening already means resuming from wherever
`pointerTick()` last left the facet works with no extra code, since the
tween targets are absolute `x`/`y` values computed fresh each call, not
deltas.)

- [ ] **Step 6: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: no new errors (there may be pre-existing unrelated errors in the
repo — compare the error count/list before and after this task's edit if
any appear).

- [ ] **Step 7: Visual verification**

Run: `npm run dev`, open the homepage in a desktop browser (fine pointer).

- Move the mouse across the Hero section: facets should visibly and
  smoothly follow the cursor (stronger for `plate-a`, weaker for
  `plate-c`), with no visible jitter or fighting between two motions.
- Stop moving the mouse (keep it still inside Hero) for ~1-2 seconds:
  facets should resume their idle wander from wherever they currently are
  — no snap back to a resting position.
- Move the mouse out of the Hero section entirely: same resume-from-current-position
  behavior.
- Resize the browser to a mobile width (or use dev tools device emulation
  with touch) and confirm idle drift still runs but no pointer-follow
  activates (unchanged from current behavior — `pointerShouldBeActive()`
  already excludes `mobile` tier).
- In OS/browser settings enable "reduce motion", reload: facets should sit
  static at their `lockTarget` (existing `applyReducedMotionRestingState()`
  behavior, unchanged by this task).

- [ ] **Step 8: Commit**

```bash
git add app/composables/motion/useHeroKineticBlueprint.ts app/assets/css/main.css
git commit -m "$(cat <<'EOF'
feat: hand facet idle drift off to pointer control on movement

Idle drift now pauses while a fine pointer is actively moving over Hero
(pointerTick drives the same x/y/rotation GSAP properties via
overwrite: 'auto' instead of a separately-blended CSS custom property),
and resumes from the facet's current position once the pointer settles
or leaves, instead of the two motion sources blending simultaneously.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Header full-bleed

**Files:**
- Modify: `app/components/layout/Header.vue:148-152`

**Interfaces:**
- Consumes: nothing new — existing `activated` ref, existing template
  structure.
- Produces: nothing consumed by other tasks — fully independent, can be
  done in parallel with Task 1 or Tasks 3-5.

- [ ] **Step 1: Change the outer `<header>` and inner bar classes**

Find in `app/components/layout/Header.vue`:

```html
  <header ref="headerRef" class="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
    <div
      class="container-page rounded-2xl border border-navy-900/10 bg-paper shadow-[0_8px_30px_-12px_rgba(11,22,32,0.18)] transition-[height] duration-500 ease-editorial"
      :class="activated ? 'h-14 md:h-16' : 'h-16 md:h-20'"
    >
```

Replace with:

```html
  <header
    ref="headerRef"
    class="fixed inset-x-0 top-0 z-50 border-b border-navy-900/10 bg-paper shadow-[0_8px_30px_-12px_rgba(11,22,32,0.18)] transition-[height] duration-500 ease-editorial"
    :class="activated ? 'h-14 md:h-16' : 'h-16 md:h-20'"
  >
    <div class="container-page h-full">
```

This moves the height/background/border/shadow/transition classes from
the inner `container-page` div onto the outer `<header>` itself (so the
bar's visual chrome spans full width), and keeps `container-page` only on
the inner wrapper for horizontal content alignment. The `rounded-2xl` pill
shape and the `px-4 pt-4 md:px-6 md:pt-5` outer inset are dropped entirely
— no rounding, no gap from the viewport edges, flush at `top: 0`.

Since the closing structure now has one extra wrapping `<div>` level
change, update the closing tags: find the end of this block later in the
same file —

```html
      <div ref="progressRef" class="h-px w-full origin-left rounded-b-2xl bg-yellow-500" aria-hidden="true" />
    </div>
  </header>
```

Replace with:

```html
      <div ref="progressRef" class="h-px w-full origin-left bg-yellow-500" aria-hidden="true" />
    </div>
  </header>
```

(only removing `rounded-b-2xl`, since there's no longer a rounded card to
match the bottom corners of — the `</div></header>` nesting itself is
unchanged, one div, one header, same as before).

- [ ] **Step 2: Confirm no other file depends on the header's rounded/inset shape**

Run: `grep -rn "headerRef\|LayoutHeader" app/ --include=*.vue -l`
Expected: only `app/components/layout/Header.vue` itself and whichever
layout file mounts it (e.g. `app/layouts/default.vue`) — confirm the
mounting file doesn't add its own spacing that assumed the header was
inset (e.g. a top-margin on `<main>` sized to the old pill's gap). If such
spacing exists, leave it as-is — the header's height classes are
unchanged (`h-14 md:h-16` / `h-16 md:h-20`), so any existing top-offset
sizing for page content remains correct.

- [ ] **Step 3: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: no new errors (this task is template-only; a Vue template
structural error would surface as a compile error here).

- [ ] **Step 4: Visual verification**

Run: `npm run dev`, open homepage.

- Confirm the header bar's background/border/shadow now touch both the
  left and right edges of the viewport (no visible margin/gap), at
  1920×1080, 1440×900, and 375×812.
- Confirm the logo, nav links, and CTA button still align horizontally
  with Hero's headline/content column (same left/right inset as Hero's
  `BaseContainer`) — they should not have shifted closer to the viewport
  edge than before.
- Scroll down: confirm the existing `activated` height-shrink transition,
  hide-on-scroll-down/show-on-scroll-up behavior, and the yellow scroll-progress
  bar under the header still work exactly as before this change.

- [ ] **Step 5: Commit**

```bash
git add app/components/layout/Header.vue
git commit -m "$(cat <<'EOF'
style: make header bar full-bleed edge-to-edge like Hero

Move the bar's background/border/shadow/height classes from the inset
container-page div onto the header element itself and drop the outer
padding and rounded pill shape, so the nav bar spans the full viewport
width while its content stays aligned to Hero's content column.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `useHeroHandoff` shared landing-point state

**Files:**
- Create: `app/composables/motion/useHeroHandoff.ts`

**Interfaces:**
- Consumes: nothing (pure module-level state, no imports beyond Vue's `ref`).
- Produces (consumed by Task 4 and Task 5):
  ```ts
  export interface HandoffLandingPoint {
    xVw: number
    yVh: number
    rotation: number
  }

  export function useHeroHandoff(): {
    landingPoints: Readonly<Ref<[HandoffLandingPoint, HandoffLandingPoint, HandoffLandingPoint] | null>>
    setLandingPoints: (points: [HandoffLandingPoint, HandoffLandingPoint, HandoffLandingPoint]) => void
  }
  ```

This is the data bridge between Hero (writer) and WhatWeDo/EditorialIntro
(reader) described in the spec's "Word ↔ facet mapping" / "Reconstruction
on WhatWeDo" sections — a module-level singleton, same pattern as
`app/composables/useSectionCurtain.ts`.

- [ ] **Step 1: Read `useSectionCurtain.ts` for the exact pattern to match**

Run: `cat app/composables/useSectionCurtain.ts` (already read during
brainstorming — module-level `ref`, a getter returning `readonly(...)`, a
setter function, all exported from one `use*()` function call).

- [ ] **Step 2: Write the composable**

Create `app/composables/motion/useHeroHandoff.ts`:

```ts
// app/composables/motion/useHeroHandoff.ts
//
// Module-level singleton bridging Hero's disassembly exit to WhatWeDo's
// entrance reveal (see docs/superpowers/specs/2026-09-11-hero-disassembly-handoff-design.md,
// "Word ↔ facet mapping" and "Reconstruction on WhatWeDo"). Hero computes
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
```

- [ ] **Step 3: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: no new errors. This file has no consumers yet, so it should
compile standalone with zero errors (Nuxt auto-imports `ref`/`readonly`
project-wide — confirm by checking another composable in the same
directory doesn't import them explicitly, e.g.
`grep -n "^import" app/composables/motion/useScrollReveal.ts` should show
no Vue reactivity imports).

- [ ] **Step 4: Commit**

```bash
git add app/composables/motion/useHeroHandoff.ts
git commit -m "$(cat <<'EOF'
feat: add useHeroHandoff shared landing-point state

Module-level singleton (pattern-matched to useSectionCurtain) that will
carry Hero's disassembled headline word positions to WhatWeDo's entrance
reveal, so the two components share only three viewport-relative
coordinates instead of reaching into each other's DOM or ScrollTrigger.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Hero disassembly — word-target tweens + landing-point publish

**Files:**
- Modify: `app/composables/motion/useHeroKineticBlueprint.ts` (the `buildScrollTimeline()` function — locate by the `tl.addLabel('wake', 0)` chain)
- Modify: `app/components/home/Hero.vue` (expose `headingWordsRef`, pass `subtextRef`/`ctaRowRef` down)
- Modify: `app/components/home/HeroKineticBlueprint.vue` (accept and forward the three new props)

**Interfaces:**
- Consumes: `useHeroHandoff()` (from Task 3) — `setLandingPoints`.
  Also consumes the Hero component's per-word wrapper elements and its
  existing `subtextRef`/`ctaRowRef`, which Task 4 Step 1-3 below expose
  via new options on `useHeroKineticBlueprint`'s existing options
  parameter.
- Produces: nothing new consumed by later tasks beyond what Task 3 already
  defined — Task 5 only depends on `useHeroHandoff`, not on anything from
  this task directly.

The existing `useHeroKineticBlueprint(svgEl, options)` signature only
receives `sectionEl`/`contentEl`. This task adds three options,
`headingWords`/`subtextEl`/`ctaRowEl`, so the composable can read (not
create) Hero's existing per-word heading wrapper elements and its
subtext/CTA refs — reusing the DOM Hero already builds for its entrance
reveal (`allHeadingWords`, `subtextRef`, `ctaRowRef` in `Hero.vue`), per
the spec's "reuses the existing per-word heading DOM structure" note.
This does not change Hero's markup — it exposes existing internal
references through refs that already exist in `Hero.vue`'s
`<script setup>`.

- [ ] **Step 1: Expose Hero's heading words to the composable via a ref**

In `app/components/home/Hero.vue`, find:

```ts
const headingRef = ref<HTMLElement | null>(null)
```

Add a new ref right after it:

```ts
const headingWordsRef = ref<HTMLElement[]>([])
```

`subtextRef` and `ctaRowRef` already exist a few lines below — no new refs
needed for those; they're reused as-is in Step 2.

Find where `allHeadingWords` is populated (inside the
`mm.add('(prefers-reduced-motion: no-preference)', ...)` block):

```ts
        const allHeadingWords: HTMLElement[] = []
```

Leave that line as-is (it's still used locally for the entrance tween),
and find the end of the word-building loop:

```ts
          const { outer, inner } = wrapWord(part)
          heading.appendChild(outer)
          allHeadingWords.push(inner)
        }
```

Add one line right after that closing `}`:

```ts
        headingWordsRef.value = allHeadingWords
```

This publishes the same array Hero already builds for its own entrance
animation — no new DOM creation, just exposing the reference.

- [ ] **Step 2: Pass `headingWordsRef` into the composable's options**

In `app/components/home/HeroKineticBlueprint.vue`, find:

```ts
useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  contentRef.value = sectionRef.value?.querySelector('[data-hero-content]') ?? null
  return useHeroKineticBlueprint(svgRef, { sectionEl: sectionRef, contentEl: contentRef })
})
```

`HeroKineticBlueprint.vue` currently has no way to receive
`headingWordsRef`/`subtextRef`/`ctaRowRef` from its parent (`Hero.vue`) —
add props for all three:

```ts
const props = defineProps<{
  headingWords?: HTMLElement[]
  subtextEl?: HTMLElement | null
  ctaRowEl?: HTMLElement | null
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  contentRef.value = sectionRef.value?.querySelector('[data-hero-content]') ?? null
  return useHeroKineticBlueprint(svgRef, {
    sectionEl: sectionRef,
    contentEl: contentRef,
    headingWords: computed(() => props.headingWords ?? []),
    subtextEl: computed(() => props.subtextEl ?? null),
    ctaRowEl: computed(() => props.ctaRowEl ?? null)
  })
})
```

In `Hero.vue`'s template, find:

```html
    <ClientOnly>
      <HomeHeroKineticBlueprint class="z-[3]" />
    </ClientOnly>
```

Change to:

```html
    <ClientOnly>
      <HomeHeroKineticBlueprint
        class="z-[3]"
        :heading-words="headingWordsRef"
        :subtext-el="subtextRef"
        :cta-row-el="ctaRowRef"
      />
    </ClientOnly>
```

`subtextRef` and `ctaRowRef` are the existing refs already bound to the
`<p ref="subtextRef">` and `<div ref="ctaRowRef">` elements in this same
template — passing them through avoids the composable ever needing to
guess at a DOM selector for "the subtext" or "the CTA row".

Note: `headingWordsRef` is only populated once the entrance reveal's
`watch(introReady, ...)` handler runs (client-only, after `introReady`
flips true), so it starts as `[]` and updates later — this is fine because
`useHeroKineticBlueprint` reads it lazily inside `buildScrollTimeline()`
(Step 4 below), which is itself only ever invoked after mount, and is
re-invoked on every tier change, by which point `headingWordsRef` is
already populated for any realistic scroll interaction (a user cannot
scroll past Hero's pin before its own entrance has resolved, since the
entrance plays immediately on load). `subtextRef`/`ctaRowRef` are already
populated as soon as `Hero.vue` mounts (they're plain template refs, not
gated on `introReady`), so they're always available.

- [ ] **Step 3: Update `UseHeroKineticBlueprintOptions` and read the new option**

In `app/composables/motion/useHeroKineticBlueprint.ts`, find:

```ts
export interface UseHeroKineticBlueprintOptions {
  sectionEl: Ref<HTMLElement | null>
  contentEl: Ref<HTMLElement | null>
}
```

Change to:

```ts
export interface UseHeroKineticBlueprintOptions {
  sectionEl: Ref<HTMLElement | null>
  contentEl: Ref<HTMLElement | null>
  headingWords?: Ref<HTMLElement[]>
  subtextEl?: Ref<HTMLElement | null>
  ctaRowEl?: Ref<HTMLElement | null>
}
```

Find where `contentEl` is read near the top of the function:

```ts
  const sectionEl = options.sectionEl.value ?? svg.closest('section') ?? svg.parentElement!
  const contentEl = options.contentEl.value ?? sectionEl.querySelector('[data-hero-content]')
```

Add right after:

```ts
  const headingWordsOption = options.headingWords
  const subtextElOption = options.subtextEl
  const ctaRowElOption = options.ctaRowEl
```

- [ ] **Step 4: Add word-target tweens and landing-point publish to `buildScrollTimeline()`**

Add the import at the top of the file, alongside the existing imports:

```ts
import { useHeroHandoff, type HandoffLandingPoint } from './useHeroHandoff'
```

Find the phase-tween loop inside `buildScrollTimeline()`:

```ts
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
```

Add immediately after that loop, still inside `buildScrollTimeline()`,
before `scrollTimeline = tl`:

```ts
    // Disassembly: each headline word flies toward its paired facet's
    // handoff position during release→handoff, at a fraction of the
    // facet's own displacement so it reads as "drawn toward" the facet
    // rather than overlapping it exactly. Word i pairs with
    // composition.facets[i] — the headline is always exactly three words
    // ("Technology." / "Creativity." / "Impact."), matching the three
    // authored facets 1:1 (see spec "Word ↔ facet mapping"). If the
    // headline copy ever changes word count, this pairing must be
    // revisited — it is intentionally index-based, not name-based.
    const words = headingWordsOption?.value ?? []
    for (let i = 0; i < words.length && i < composition.facets.length; i++) {
      const word = words[i]
      const facetHandoff = composition.facets[i]?.phases?.handoff
      if (!word || !facetHandoff) continue
      tl.to(
        word,
        {
          x: (facetHandoff.x ?? 0) * 0.35,
          y: (facetHandoff.y ?? 0) * 0.6,
          rotation: (facetHandoff.rotation ?? 0) * 2,
          duration: 0.2,
          ease: 'none'
        },
        'release'
      )
      tl.to(word, { opacity: 0, duration: 0.2, ease: 'none' }, 'release')
    }

    // Subtext/CTA: simple fade + slight scale-down, finished before the
    // words/facets fully scatter (they're supporting copy, not part of
    // the disassembly identity). Uses the exact elements Hero.vue already
    // has refs to (passed through via options) rather than guessing at a
    // selector.
    const subtextAndCta = [subtextElOption?.value, ctaRowElOption?.value].filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    )
    if (subtextAndCta.length > 0) {
      tl.to(subtextAndCta, { opacity: 0, scale: 0.96, duration: 0.15, ease: 'none' }, 0.71)
    }

    // Publish landing points for WhatWeDo to read (see useHeroHandoff).
    // Computed once per timeline build (tier change), not per scroll
    // frame — viewport-relative so it stays correct regardless of either
    // section's own layout/scroll offset.
    if (words.length === 3 && !reducedMotion) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const points = words.map((word, i): HandoffLandingPoint => {
        const facetHandoff = composition.facets[i]?.phases?.handoff
        const rect = word.getBoundingClientRect()
        const landedX = rect.left + (facetHandoff?.x ?? 0) * 0.35
        const landedY = rect.top + (facetHandoff?.y ?? 0) * 0.6
        return {
          xVw: (landedX / viewportWidth) * 100,
          yVh: (landedY / viewportHeight) * 100,
          rotation: (facetHandoff?.rotation ?? 0) * 2
        }
      }) as [HandoffLandingPoint, HandoffLandingPoint, HandoffLandingPoint]
      useHeroHandoff().setLandingPoints(points)
    }
```

- [ ] **Step 5: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: no new errors. Pay attention to the `subtextAndCta` selector
casts and the `points as [...]` assertion — if `vue-tsc` flags the tuple
assertion, confirm `words.length === 3` is checked immediately before it
(it is, in the `if` guard above).

- [ ] **Step 6: Visual verification**

Run: `npm run dev`, open homepage at 1920×1080.

- Scroll slowly through Hero's pinned range. Around 70-90% through the
  pin, confirm each headline word visibly translates/rotates and fades
  toward roughly where its paired facet is heading (Technology. → plate-a's
  direction, Creativity. → plate-b's, Impact. → plate-c's).
- Confirm subtext and the CTA row fade out slightly before the words
  finish scattering (not all elements vanishing at the same instant).
- Confirm no layout shift and no console errors during the scroll.
- Enable reduced motion, reload, scroll: confirm Hero shows no pin, no
  disassembly, headline stays in its static reduced-motion state
  (existing behavior, unaffected since `!reducedMotion` guards the new
  landing-point publish and `buildScrollTimeline()` already returns early
  under reduced motion before reaching this new code).

- [ ] **Step 7: Commit**

```bash
git add app/components/home/Hero.vue app/components/home/HeroKineticBlueprint.vue app/composables/motion/useHeroKineticBlueprint.ts
git commit -m "$(cat <<'EOF'
feat: disassemble Hero headline words toward their paired facet on exit

Each headline word now flies toward its paired Signal Architecture
facet's handoff position during the existing release→handoff scroll
phase, and Hero publishes each word's landed viewport position via
useHeroHandoff for WhatWeDo's entrance to pick up next.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: WhatWeDo reconstructs from Hero's landing points

**Files:**
- Modify: `app/components/home/EditorialIntro.vue`

**Interfaces:**
- Consumes: `useHeroHandoff()` from Task 3 —
  `landingPoints: Readonly<Ref<[HandoffLandingPoint, HandoffLandingPoint, HandoffLandingPoint] | null>>`.
- Produces: nothing consumed further — this is the final task.

`EditorialIntro.vue` is shared by both WhatWeDo and WhyPasti (per its own
comment: "originally built for Why PASTI and reused here for What We
Build"). Only the instance rendered by `HomeWhatWeDo` should read Hero's
landing points — WhyPasti's usage must keep its current plain reveal. Add
an opt-in prop so this is explicit rather than inferred.

- [ ] **Step 1: Add an opt-in prop**

In `app/components/home/EditorialIntro.vue`, find:

```ts
const props = defineProps<{
  label: string
  segments: { text: string; accent?: boolean }[]
}>()
```

Change to:

```ts
const props = defineProps<{
  label: string
  segments: { text: string; accent?: boolean }[]
  /** Opt-in: start accent words from Hero's disassembled landing points
   *  instead of a plain yPercent reveal (see useHeroHandoff). Only the
   *  WhatWeDo instance of this component passes this. */
  reconstructFromHero?: boolean
}>()
```

- [ ] **Step 2: Read landing points and compute per-word starting offsets at mount**

Find the reduced-motion-aware GSAP block:

```ts
useGsapContext(() => {
  const el = introRef.value
  const line = lineRef.value
  if (!el) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-word]'))
    const accentWords = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-accent]'))

    gsap.set(words, { yPercent: 120 })
    gsap.set(accentWords, { color: 'currentColor' })
    if (line) gsap.set(line, { scaleY: 0, transformOrigin: '0% 0%' })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none restart reverse' }
    })

    tl.to(words, { yPercent: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base })
    if (line) tl.to(line, { scaleY: 1, duration: motionDuration.slow, ease: spatialEase.settle }, 0.1)
    tl.to(accentWords, { color: '#eab308', duration: motionDuration.medium, ease: motionEase.standard, stagger: motionStagger.loose }, '-=0.3')

    return () => tl.kill()
  })
```

Replace with:

```ts
  const { landingPoints } = useHeroHandoff()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-word]'))
    const accentWords = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-accent]'))

    gsap.set(words, { yPercent: 120 })
    gsap.set(accentWords, { color: 'currentColor' })
    if (line) gsap.set(line, { scaleY: 0, transformOrigin: '0% 0%' })

    // Reconstruction: if this instance opted in and Hero already
    // published landing points (see useHeroHandoff), start each accent
    // word from Hero's landed position instead of the plain yPercent
    // reveal, so it visually continues from where Hero's disassembled
    // word settled. Falls back to the plain reveal (points is null) when
    // Hero hasn't run yet — e.g. reduced motion was on when Hero mounted,
    // or this is WhyPasti's non-opted-in instance.
    const points = props.reconstructFromHero ? landingPoints.value : null
    if (points) {
      accentWords.forEach((word, i) => {
        const point = points[i]
        if (!point) return
        const rect = word.getBoundingClientRect()
        const targetLeft = (point.xVw / 100) * window.innerWidth
        const targetTop = (point.yVh / 100) * window.innerHeight
        gsap.set(word, { x: targetLeft - rect.left, y: targetTop - rect.top, rotation: point.rotation, opacity: 0 })
      })
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none restart reverse' }
    })

    tl.to(words, { yPercent: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base })
    if (points) {
      tl.to(accentWords, { x: 0, y: 0, rotation: 0, opacity: 1, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.loose }, '<')
    }
    if (line) tl.to(line, { scaleY: 1, duration: motionDuration.slow, ease: spatialEase.settle }, 0.1)
    tl.to(accentWords, { color: '#eab308', duration: motionDuration.medium, ease: motionEase.standard, stagger: motionStagger.loose }, '-=0.3')

    return () => tl.kill()
  })
```

Note: `accentWords` already receives its `yPercent: 0` reveal from the
first `words` tween (accent words are a subset of `words` — both
selectors match overlapping DOM, confirmed by `[data-intro-word]` and
`[data-intro-accent]` both being set on the same inner span per the
template's `v-for`). The new `x/y/rotation/opacity` tween runs in
parallel (`'<'` position) so accent words reveal their vertical mask
*and* fly in from Hero's landing point at the same time.

- [ ] **Step 3: Pass the opt-in prop from WhatWeDo only**

In `app/components/home/WhatWeDo.vue`, find:

```html
        <HomeEditorialIntro :label="label" :segments="introSegments" />
```

Change to:

```html
        <HomeEditorialIntro :label="label" :segments="introSegments" reconstruct-from-hero />
```

Confirm `app/components/home/WhyPasti.vue` (or wherever else
`EditorialIntro`/`HomeEditorialIntro` is used) is **not** changed — run:

```bash
grep -rn "HomeEditorialIntro" app/components app/pages
```

Expected: two usages — `WhatWeDo.vue` (now with the new prop) and one
other (WhyPasti or similar) with no `reconstruct-from-hero` prop, left
untouched.

- [ ] **Step 4: Typecheck**

Run: `npx vue-tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Visual verification**

Run: `npm run dev`, open homepage at 1920×1080.

- Scroll from Hero through the disassembly into WhatWeDo. Confirm
  WhatWeDo's three accent-highlighted phrases ("technology and
  creativity", "real business challenges", "measurable impact.") visually
  arrive from roughly the direction/position where Hero's corresponding
  word flew off to — approximate continuity is the bar (per spec:
  "not pixel-perfect — GSAP scrub timing differs slightly between the two
  independent triggers"), not an exact handoff.
- Scroll to the section using `EditorialIntro` without
  `reconstruct-from-hero` (e.g. Why PASTI) directly (skip Hero, e.g. via
  browser back/forward or a direct anchor link) and confirm it still uses
  the plain `yPercent` reveal with no landing-point offset, no console
  errors.
- Reload with reduced motion enabled: confirm WhatWeDo's accent words
  show immediately in their resting state (existing reduced-motion branch
  of `EditorialIntro.vue`, unaffected by this task since it only touches
  the `no-preference` branch).
- Resize desktop → mobile width and reload: confirm no console errors
  (landing points will be tablet/mobile-tier facet positions, still valid
  viewport-relative coordinates).

- [ ] **Step 6: Commit**

```bash
git add app/components/home/EditorialIntro.vue app/components/home/WhatWeDo.vue
git commit -m "$(cat <<'EOF'
feat: reconstruct WhatWeDo's accent words from Hero's disassembly landing points

WhatWeDo opts into useHeroHandoff via a new reconstructFromHero prop on
EditorialIntro, so its three accent-highlighted phrases fly in from
wherever Hero's corresponding headline word landed during disassembly,
instead of a generic yPercent-only reveal. WhyPasti's EditorialIntro
usage is unaffected (prop not passed, falls back to the plain reveal).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Final Verification

- [ ] **Run a full production build**

```bash
npm run build
```

Expected: build succeeds with no new errors or warnings introduced by
this plan's changes.

- [ ] **Full end-to-end visual pass**

Run `npm run dev`, and on the homepage:

1. Confirm the header bar is full-bleed edge-to-edge at 1920×1080,
   1440×900, and 375×812, with content still aligned to Hero's column.
2. With a fine pointer, move the cursor across Hero and confirm facets
   track the cursor smoothly; stop moving and confirm idle drift resumes
   from the current position; leave the section and confirm the same.
3. Scroll through Hero's full pin range and confirm the wake → expansion →
   lock → release → handoff choreography still plays correctly, now with
   headline words visibly disassembling toward their paired facets in the
   release → handoff window, and subtext/CTA fading out slightly earlier.
4. Continue scrolling into WhatWeDo and confirm its accent words arrive
   from approximately Hero's landing points.
5. Toggle `prefers-reduced-motion: reduce` and repeat steps 2-4: Hero
   should show no pin, no pointer-follow, no disassembly, and WhatWeDo
   should show its plain immediate-reveal state — no console errors in
   any of these states.
6. Confirm no regressions on Why PASTI's own `EditorialIntro` reveal (not
   using `reconstruct-from-hero`).
