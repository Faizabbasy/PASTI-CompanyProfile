# Hero Disassembly Handoff — Design

## Purpose

Upgrade the Hero → WhatWeDo scroll transition from "pin ends, page
continues" into a signature, non-generic moment: the Signal Architecture
facets and the Hero headline **disassemble** into fragments as the user
scrolls past the pin, and those same fragments **reconstruct** into
WhatWeDo's opening headline. Text and background move as one system, and
the two sections read as a single continuous machine rather than two
components that happen to be adjacent.

This spec also covers two related refinements requested alongside the
scroll transition: how the facet background feels "alive" at rest/on
hover (Section "Idle drift ↔ pointer handoff"), and making the header bar
full-bleed like Hero (Section "Header full-bleed").

This is a refinement of the existing Hero pin choreography
(`docs/superpowers/specs/2026-09-11-hero-signal-architecture-design.md`),
not a new background system. It reuses the existing `wake → expansion →
lock → release → handoff` scrubbed timeline, existing facet data, and the
existing per-word heading DOM structure already built for Hero's entrance
reveal.

## Non-goals

- No change to Hero's entrance choreography (word reveal, shine sweep,
  cursor spotlight) — untouched.
- No new visual system, no new facet shapes, no new color tokens.
- No layout, copy, or route changes.
- No coordination for any section other than Hero → WhatWeDo (the FAQ,
  Testimonials, etc. keep their current reveals).
- **No DOM/markup structure change to the header (`Header.vue`) or Hero's
  headline.** Element set, order, and nesting stay exactly as they are.
  Transform/opacity/style animation (including the word-fly-out below,
  and the header's width/shape via CSS) is not considered a structure
  change and is in scope.
- Idle drift changes apply to the facet background only. The headline,
  subtext, and CTA never move on their own while at rest — they only
  animate for their existing entrance, the disassembly exit below, and
  existing hover states (magnetic CTA, cursor spotlight).

## Current mechanism (recap)

- `useHeroKineticBlueprint.ts` builds one scrubbed GSAP timeline pinned to
  Hero's `<section>` (`ScrollTrigger`, `pin: true`, `scrub: 1`,
  `end: +=${PIN_DISTANCE_VH[tier]}vh`), with labels `wake(0) →
  expansion(0.2) → lock(0.45) → release(0.7) → handoff(0.9) → end(1)`.
  Only the three SVG facets (`plate-a/b/c`) animate on this timeline today
  (`x/y/rotation/scale/opacity`, all transform/opacity — never `d`).
- Hero's headline is wrapped per-word at mount
  (`allHeadingWords: HTMLElement[]`, via `wrapWord()`) for the entrance
  reveal. Those same wrapper elements are reused for disassembly — no new
  DOM wrapping pass.
- `WhatWeDo.vue` renders `HomeEditorialIntro`, whose intro sentence is
  already split per-word into `[data-intro-word]` spans, animated by its
  own `scrollTrigger: { trigger: el, start: 'top 85%' }` timeline
  (`yPercent: 120 → 0`).

## Word ↔ facet mapping

The headline is exactly three words ("Technology.", "Creativity.",
"Impact."), matching the three facets 1:1:

| Headline word | Facet   |
|---------------|---------|
| Technology.   | plate-a |
| Creativity.   | plate-b |
| Impact.       | plate-c |

Each word flies toward its paired facet's `handoff` position during
disassembly. This mapping is hard-coded (array index 0/1/2) — it does not
need to survive a copy change to a different word count; if the headline
copy ever changes to a different word count, this feature must be
revisited (documented as a code comment, not a runtime guard).

## Choreography

Extends the **existing** timeline; no second `ScrollTrigger` on Hero.

### Phase window: `release` (0.7) → `handoff` (0.9) → `end` (1.0)

1. **`release` → `handoff` (0.7–0.9): Disassembly.**
   - Facets: unchanged (existing `release`/`handoff` phase values already
     scatter them — see `kineticBlueprintPaths.ts`).
   - Headline words: each word's wrapper animates from its resting
     transform to a translate/rotate/scale/opacity target derived from its
     paired facet's `handoff` phase values (scaled down — words travel a
     fraction of the facet's full displacement, e.g. 35%, so they read as
     "drawn toward" the facet rather than overlapping it exactly).
     Concretely, for word `i` paired with facet `f`:
     `x = f.phases.handoff.x * 0.35`, `y = f.phases.handoff.y * 0.6`,
     `rotation = f.phases.handoff.rotation * 2`, `opacity: 1 → 0`.
   - Subtext and CTA row: simple fade + slight scale-down
     (`opacity: 1→0, scale: 1→0.96`), completing by `release` + 0.1 (i.e.
     finished before facets/words fully scatter) — they are supporting
     copy, not part of the disassembly identity, so they exit cleanly and
     early rather than competing for attention.
   - Easing: `none` (scrubbed), consistent with the rest of the timeline.

2. **`handoff` → `end` (0.9–1.0): Falloff.**
   - Existing facet handoff values already carry opacity down (plate-c
     hits 0 opacity). No new work here — this window exists so the last
     10% of scroll settles rather than cutting abruptly at `handoff`.

### Reconstruction on WhatWeDo

WhatWeDo's own reveal is **not** driven by Hero's ScrollTrigger (it keeps
its own `trigger: el, start: 'top 85%'`). Instead of the current generic
`yPercent: 120 → 0` per word, its three intro words that carry the
`accent: true` flag (the three emphasized phrases: "technology and
creativity", "real business challenges", "measurable impact.") each start
from the **screen position** where the corresponding Hero word/facet
landed, rather than from `yPercent: 120`.

- **Data contract**: a new composable `useHeroHandoff.ts` exports a
  module-level singleton (same pattern as `useSectionCurtain.ts`):
  ```ts
  interface HandoffLandingPoint { xVw: number; yVh: number; rotation: number }
  const landingPoints = ref<[HandoffLandingPoint, HandoffLandingPoint, HandoffLandingPoint] | null>(null)
  ```
  Hero's composable computes each word's final on-screen position (in
  viewport-relative units, so it's independent of each component's own
  layout) once, when the scroll timeline is built/rebuilt (tier change,
  not per-frame), and writes it via `setLandingPoints()`. WhatWeDo reads it
  via `getLandingPoints()` inside its own `onMounted`/GSAP context.
  - Viewport-relative units are required because Hero and WhatWeDo are
    different DOM subtrees at different scroll offsets — a fixed pixel
    handoff would break the moment either section's height changes.
  - If `landingPoints` is `null` (WhatWeDo mounted before Hero's client-only
    composable ran, or JS disabled/slow) WhatWeDo falls back to its current
    `yPercent: 120 → 0` — this is a progressive enhancement, not a required
    dependency.
- WhatWeDo's three accent words animate `x/y/rotation → 0` (from the
  landing point, converted to a local transform offset at mount time via
  `getBoundingClientRect()`) simultaneously with the existing
  `yPercent`/color animation, same timeline, same trigger. Non-accent
  words are unaffected (keep current `yPercent` reveal only).
- This keeps the two components loosely coupled: Hero never touches
  WhatWeDo's DOM, WhatWeDo never touches Hero's ScrollTrigger. The only
  shared thing is three small position readings.

## Reduced motion / fallback

- `prefers-reduced-motion: reduce`: Hero's existing `mm.add(...)` reduced
  path already skips the scrubbed timeline entirely (`buildScrollTimeline`
  returns early when `reducedMotion` is true) — disassembly simply does not
  run, headline stays in its resting entrance state. `setLandingPoints` is
  never called in this path, so WhatWeDo naturally takes its fallback
  (plain `yPercent` reveal, no landing-point offset). No extra branching
  needed beyond "don't call setLandingPoints when reducedMotion is true."
- If `landingPoints` is stale from a previous tier (e.g. resize
  desktop→mobile), Hero recomputes and overwrites on every
  `buildScrollTimeline()` call (already invoked on tier change per the
  existing resize-tracking code) — WhatWeDo reads fresh values at its own
  mount/first-reveal time, so no explicit invalidation event is needed for
  the common case. Edge case (resize happens *after* WhatWeDo has already
  revealed and its GSAP timeline already ran) is accepted as out of scope:
  the reveal is one-shot and already-played, matching existing behavior
  for every other reveal on the page under resize.

## Performance

- No new `ScrollTrigger`, no new RAF loop, no new Three.js/canvas work.
  Word transforms are added to the *same* scrubbed timeline tween calls
  already running for facets (`tl.to(...)` per phase) — cost is a handful
  of extra tweened elements, not a new system.
- `getLandingPoints()`/`getBoundingClientRect()` reads happen once per
  WhatWeDo mount (not per frame) — no layout thrashing.

## Idle drift ↔ pointer handoff

Current behavior (`useHeroKineticBlueprint.ts`): `startFacetDrift()` runs
a continuous, always-on random wander on every facet (re-scheduling every
5-10s, independent of the pointer) for as long as Hero is visible.
Separately, `pointerTick()` writes a small pointer-following nudge to
`--pointer-tension-x/-y` custom properties, composed via CSS `translate`
so it never fights the drift's GSAP `x/y` transform tweens — the two
sources of motion currently run simultaneously and blend.

**Keep** the always-on idle drift loop exactly as-is as the resting/no-
cursor baseline — this is confirmed as wanted, not a bug. **Change** what
happens once a fine pointer is actively present and moving over Hero:
drift should stop driving `x/y/rotation/scale`, handing full control to
the pointer, rather than the current blend of both.

- Add a third state alongside the existing `isRunning`/idle system:
  `pointerControlActive` (client-only, `fine` pointer + Hero intersecting,
  same gate `pointerShouldBeActive()` already computes).
- On `pointermove` inside Hero (already detected by the existing
  `handlePointerMove`/`isPointerActive` wiring): call
  `stopIdleTimelines()`'s drift-only counterpart — pause just
  `startFacetDrift()`'s in-flight tweens (fade their control via
  `gsap.to(facet, { x: currentX, y: currentY, ... , overwrite: 'auto' })`
  is unnecessary; simplest correct approach is killing the specific
  in-flight drift tween per facet with `overwrite: 'auto'` the moment
  `pointerTick()` starts writing `x/y/rotation` for that facet directly,
  since both would otherwise animate the same GSAP-tracked properties).
  Concretely: `pointerTick()` moves from writing the CSS custom
  properties (`--pointer-tension-*`) to writing the facet's GSAP
  `x/y/rotation` directly via `gsap.to(facet, { x, y, rotation, duration:
  0.4, ease: 'power2.out', overwrite: 'auto' })` once pointer control is
  active — `overwrite: 'auto'` is what hands control away from any
  in-flight drift tween on the same facet without an explicit pause call.
  Gradient drift and the periodic Facet Lock idle event are unaffected
  (they don't animate x/y/rotation) and keep running underneath.
- After the pointer stops moving for a short settle window (reuse the
  existing damping — `dampedPointer` already approaches the last raw
  position asymptotically, so "stopped" is detected via a
  `gsap.delayedCall` reset on every `pointermove`, cleared and
  re-armed each time, similar to the header's existing dead-zone pattern)
  or the pointer leaves the section (`pointerleave`, already partially
  covered by `reconcilePointerState`'s capability checks — add an
  explicit `pointerleave` listener alongside `pointermove`), resume
  `startFacetDrift()` for the affected facets from their current
  position (not reset to origin) so the handback reads as one continuous
  motion, not a snap.
- Depth-factor per facet (`plate-a` strongest, `plate-c` weakest) already
  established for pointer tension carries over unchanged — it makes the
  full pointer-follow feel layered/dimensional rather than all three
  facets moving in lockstep.
- Mobile / coarse pointer / reduced-motion: unaffected — idle drift is the
  only motion in those modes today (pointer control never activates),
  same as current behavior.

This keeps the "always alive" baseline the user wants, but resolves the
double-motion-source blending into a clean handoff: idle when untouched,
fully cursor-driven when touched, idle again once released.

## Header full-bleed

`Header.vue`'s `<header>` currently has outer inset padding
(`px-4 pt-4 md:px-6 md:pt-5`) around an inner `container-page` bar with
`rounded-2xl` — a floating pill inset from the viewport edges. Change it
to span edge-to-edge like Hero's `<section>`, while keeping the same
inner content constrained to `container-page` (same width as Hero's
`BaseContainer`), so the nav bar's content column lines up with Hero's
content column, but the bar itself (background, border, shadow) reaches
both viewport edges.

- Remove `px-4 md:px-6` and the pill's `rounded-2xl` /
  `border`/`shadow` from the outer `<header>` — those move (or are
  dropped) so the visible bar is a full-width strip, not an inset card.
  `pt-4 md:pt-5` (top offset) is dropped too since a full-bleed bar sits
  flush at `top: 0`.
- The inner `container-page` div keeps its own horizontal padding
  (`px-gutter`, from the `container-page` utility) so logo/nav/CTA still
  align with Hero's content edges — only the outer chrome (background,
  border, corner radius) becomes edge-to-edge, not the content.
- This is a Tailwind class change on the existing elements only — no
  element added, removed, or reordered, consistent with the "no header
  structure change" non-goal above.
- Scroll behavior (`activated` height flip, hide-on-scroll-down,
  scroll-progress bar) is untouched; only the outer shape/width changes.

## Files touched

- `app/composables/motion/useHeroKineticBlueprint.ts` — add word-target
  tweens to the existing scrubbed timeline; compute and publish landing
  points on timeline (re)build; change `pointerTick()`/idle-drift
  interaction per "Idle drift ↔ pointer handoff" above.
- `app/composables/motion/useHeroHandoff.ts` (new) — tiny shared
  singleton, pattern-matched to `useSectionCurtain.ts`. This is the one
  new file; justified because Hero and WhatWeDo are separate components
  with no existing shared state channel, and a prop/emit chain would
  require threading through `index.vue` for two unrelated sibling
  components.
- `app/components/home/Hero.vue` — no structural change; word wrapper refs
  already exist and are reused as-is by the composable.
- `app/components/home/WhatWeDo.vue` / `EditorialIntro.vue` — read landing
  points, extend the three accent words' reveal tween with an `x/y/rotation`
  starting offset.
- `app/components/layout/Header.vue` — Tailwind class changes only, per
  "Header full-bleed" above.

## Testing / verification

- Visual: scroll Hero → WhatWeDo at 1920×1080, 1440×900, 375×812; confirm
  words visibly travel toward facet positions and WhatWeDo's accent words
  visually continue from roughly where they landed (approximate continuity,
  not pixel-perfect — GSAP scrub timing differs slightly between the two
  independent triggers).
- Confirm `prefers-reduced-motion: reduce` shows Hero static and WhatWeDo's
  plain fallback reveal, no console errors.
- Confirm no new hydration mismatch (landing point computation is
  client-only, guarded by existing `import.meta.client` checks already in
  both composables).
- Confirm tier change (resize desktop↔mobile) rebuilds landing points
  without stale positions on next full page load.
- Move the cursor into Hero and confirm facets stop independent drifting
  and instead track pointer position smoothly; stop moving the cursor and
  confirm drift resumes from the current position (no snap back to
  origin); move the cursor out of the section and confirm the same
  resume behavior.
- Confirm header bar visually spans full viewport width at all three
  breakpoints, with logo/nav/CTA still aligned to the same left/right
  edges as Hero's content (BaseContainer).
