# Hero Disassembly Handoff — Design

## Purpose

Upgrade the Hero → WhatWeDo scroll transition from "pin ends, page
continues" into a signature, non-generic moment: the Signal Architecture
facets and the Hero headline **disassemble** into fragments as the user
scrolls past the pin, and those same fragments **reconstruct** into
WhatWeDo's opening headline. Text and background move as one system, and
the two sections read as a single continuous machine rather than two
components that happen to be adjacent.

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

## Files touched

- `app/composables/motion/useHeroKineticBlueprint.ts` — add word-target
  tweens to the existing scrubbed timeline; compute and publish landing
  points on timeline (re)build.
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
