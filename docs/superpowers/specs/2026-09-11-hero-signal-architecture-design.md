# Hero Signal Architecture — Design Spec

**Status:** Supersedes `2026-09-11-hero-kinetic-blueprint-design.md` and its implementation plan. The Kinetic Blueprint system (all 9 tasks, already committed on `worktree-hero-kinetic-blueprint`) was rejected: it read as thin, decorative, background-like — a large headline on mostly empty white space with faint technical decoration. This spec replaces it entirely with a bolder, structurally-dominant visual identity.

## Context

Hero.vue's foreground (headline, subtext, CTA row, navbar, corner brackets, section height, container/max-width) is locked and untouched by this work. This spec covers only the visual identity layer that sits behind that content — previously "Kinetic Blueprint", now "Signal Architecture".

## Diagnosis: why Kinetic Blueprint failed

1. **Low visual mass.** Every element (construction lines, grid lines, registration marks, nodes) was thin (1-1.5px stroke) or tiny (3-5px radius), and even the three "mass" shapes only spanned ~300-400px against a 1600px-wide viewBox — roughly 20-25% canvas occupation.
2. **Low opacity ceiling.** Idle-state opacity ranged 0.06-0.2 across nearly every element — barely perceptible against a white/paper background.
3. **No dominant form.** Detail was spread evenly across the canvas (masses + lines + grid + registration + nodes, all roughly equal visual weight) rather than organized into a clear hierarchy the eye catches immediately.
4. Net effect: the system read as "technical blueprint wallpaper" rather than an authored, premium graphic identity.

## Design principles (from creative direction)

- One strong, memorable, large-scale graphic structure — not scattered decoration.
- Three-level hierarchy: **primary mass** (dominant), **secondary mass** (supporting/balancing), **micro detail** (supporting only, never the identity).
- Target visual occupation: primary + secondary combined ≈ 65-80% of the Hero canvas.
- Must read as strong even in a single frozen frame (no reliance on motion to "sell" the composition).
- Idle motion must move the main structure itself, not just small details.
- A periodic signature event — elegant, memorable, structurally meaningful.
- Pointer interaction stays secondary and subtle: local structure tension / segment offset / mask reveal amount / parallax. No glow, halo, magnetic blob, or large deformation.
- Character: high-end editorial motion design + architectural graphic design + premium agency identity. Not "technical blueprint."
- Palette stays within existing tokens (navy scale, yellow-500 accent, paper base) — explored boldly via gradients/multi-shade layering (see Color System below), not extended with colors outside the brand scale. Craft quality targets an Awwwards-tier feel achieved through GSAP/SVG timing, easing, and layering — not through WebGL/shaders (that technology stays out of scope; see Global Constraints).

## Composition map

### Primary mass — "The Fractured Plate" (3 facets + rail)

A single large navy structure, deliberately split into three overlapping facets so it reads as one large fractured plate rather than a basic geometric primitive, while remaining animatable as independent segments (required for the Facet Lock signature event). Combined occupation ≈ 55-65% of canvas.

- `plate-a` (gradient fill, opacity 0.42) — dominant facet, upper-left to center.
- `plate-b` (gradient fill, opacity 0.32) — second facet, overlapping plate-a's right edge, extending lower-right.
- `plate-c` (gradient fill, opacity 0.22) — small accent facet, separated slightly from a/b, upper-right — reads as a "freshly broken" fragment.
- `primary-rail` (stroke yellow-500, width 4, opacity 0.75) — one long diagonal line crossing through the plates, from lower-left to upper-right, reinforcing the diagonal directional pull of the whole composition. The single most saturated element in the composition — the eye's anchor point.

Exact fill treatment (gradients, not flat colors) is specified in **Color System** below.

The plate's overall footprint intentionally overlaps the center content area — the headline/subtext/CTA void is carved out of it via a dynamic clipPath (see below), producing the effect of content floating inside/against a large structure, not beside a small one.

### Secondary mass — "The Anchor Band"

One wide horizontal band along the bottom of the canvas, near/behind the CTA row, balancing the primary mass's diagonal weight. Contributes ≈ 10-15% occupation (bringing primary+secondary to the 65-80% target). Top edge is gently sloped (not a straight rect) to keep the "drawn structure" character rather than reading as a UI bar. Fill navy-700, opacity 0.28.

### Micro detail

A small number of registration marks and signal nodes (far fewer than Kinetic Blueprint's system), placed at facet edges and the rail's endpoints only — never scattered across empty canvas area. Supporting role only.

### Negative-space void (headline/subtext/CTA protection)

Approved approach: **SVG `clipPath` with an inverted rect hole, `fill-rule: evenodd`.**

- The clipPath contains an outer rect covering the full `0 0 1600 900` viewBox and an inner rect (the "hole") sized to the union bounding box of `[data-hero-content]` (headline + subtext + CTA row together), converted from DOM pixels into viewBox coordinates, plus a 32px buffer on all sides, with a small corner radius (~8-12px).
- Applied to the primary mass group (`plate-a`/`plate-b`/`plate-c`) and, if it overlaps, the secondary band group.
- Recomputed by a `ResizeObserver` on `[data-hero-content]`, and once more after Hero.vue's existing entry word-reveal timeline completes (heading height changes as words animate in — the observer's own resize firing covers this, but an explicit recompute call right after the timeline's completion avoids a one-frame stale hole during the reveal).
- This is a coordinate-only recompute (rect x/y/width/height), not a path `d` change — compatible with the existing "no path `d` animation" constraint carried over from the Kinetic Blueprint plan.

## Color System

Palette stays within the existing navy/yellow/paper token scale — no colors are added outside it — but is applied far more boldly than Kinetic Blueprint's flat low-opacity fills, via SVG gradients:

- **`plate-a` gradient:** `linearGradient`, navy-900 → navy-500, angled along the facet's own diagonal (not a fixed 0°/90° axis) — reads as a large metal/glass surface catching light along its length.
- **`plate-b` gradient:** `linearGradient`, navy-700 → navy-300, angled in the opposite direction from plate-a's gradient — the two facets visibly "catch light" differently, reinforcing that they are distinct fractured surfaces rather than one flat shape.
- **`plate-c` gradient:** `radialGradient`, navy-500 → yellow-600, focal point at one corner of the facet — a small warm highlight on the accent fragment, the composition's only navy-to-yellow color transition, kept to this one small facet so it reads as an intentional accent rather than diluting the primary navy identity.
- **`primary-rail`:** solid yellow-500 stroke (opacity 0.75, see above) — the one fully-saturated brand-yellow element, functioning as the composition's focal accent and directional cue.
- **Micro detail nodes:** yellow-500, matching the rail, at full opacity when active (pulsing per the existing node-pulse mechanism) — small, sharp points of full-saturation color against the softer gradient plates.

**Gradient stop animation:** each gradient's stop `offset` values (not colors) shift subtly during idle drift (desynchronized with the facet's own transform drift, 10-18s, `sine.inOut`) and shift more decisively during the Facet Lock signature event (stops converge toward a tighter, more concentrated arrangement at the moment of lock, then relax back). This keeps the gradients reading as "alive" rather than a static paint job. Animating gradient `offset` is a numeric SVG attribute tween (GSAP handles this natively) — not a path `d` change, so it stays within the existing animation-technique constraint.

## Craft / Motion Quality Bar

The "Awwwards-tier" quality bar is targeted entirely through GSAP/SVG craft — not through WebGL or shaders, which stay out of scope (see Global Constraints). Concretely:

- **Custom easing per motion class**, not one generic ease reused everywhere: continuous facet drift uses a soft organic ease (`sine.inOut`); the Facet Lock's approach uses a decisive `power3.out`; the final few pixels of the lock itself use a small `back.out(1.2)` overshoot so the lock reads as a precise mechanical "click" rather than a soft drift-to-stop.
- **Depth layering via `filter: drop-shadow(...)`:** `plate-a` (nearest/dominant facet) carries a subtle SVG drop-shadow; `plate-b` a fainter one; `plate-c` and the rail none — a cheap, GPU-friendly depth cue that makes the 2D facets read as occupying layered space rather than sitting flat on one plane.
- **Refined entry-choreography stagger:** the entry timeline's stagger curve (Task-level detail, carried into the implementation plan) uses an eased stagger distribution rather than uniform linear spacing, so elements arrive with the same "authored, not templated" feel the rest of the motion system targets.

## Idle motion

Motion targets the primary structure itself, with amplitudes large enough to read clearly (a major change from Kinetic Blueprint's near-imperceptible amplitudes):

- **Facet drift (continuous):** `plate-a`, `plate-b`, `plate-c` each run an independent slow translate+rotate drift — 15-30px translate, ±0.5-1.5° rotate, 8-16s duration, `sine.inOut`, desynchronized start delays — so the structure reads as slowly "breathing," never static.
- **Rail sweep (periodic):** `primary-rail`'s `stroke-dashoffset` redraws every ~10-14s (not a one-way loop — draws, holds, redraws), reading as a measurement/calibration action.
- **Secondary band micro-shift:** independent slow horizontal drift, ±10-15px, 12-20s.
- **Micro detail:** small opacity/scale pulses on the reduced node set, same mechanism as Kinetic Blueprint's timescale A but applied to far fewer elements.
- **Gradient stop drift:** each facet's gradient `offset` stops shift subtly (10-18s, `sine.inOut`, desynchronized from that facet's own transform drift) per the Color System section above.

## Signature idle event — "Facet Lock"

Every 8-14 seconds (3 pre-authored timing/target variants so repeats are not identical, matching Kinetic Blueprint's variant-pool pattern):

1. `plate-a`/`plate-b`/`plate-c` animate from their current drifted position to a precise aligned target where their edges meet exactly and rotation returns to 0°, using the two-stage ease from the Craft/Motion Quality Bar (`power3.out` approach, `back.out(1.2)` overshoot on the final settle) — "the system locks into its strongest state" with a mechanical "click," not a soft drift-to-stop.
2. At the moment of lock: `primary-rail` flashes (opacity + stroke-width bump, 0.3s), each facet's gradient stops converge toward their tighter "locked" arrangement, and 1-2 yellow-500 nodes near the facet junction pulse — marking the moment as the intended signature beat.
3. Hold the locked state ~0.6-1s.
4. Release back into independent idle drift over 1.5-2s (`sine.inOut`), gradients relaxing back to their idle drift ranges, resuming the continuous drift cycle from new baseline positions.

This reuses the same `idleStopped`-gated self-rescheduling pattern already proven in the (retired) Kinetic Blueprint composable, applied to facet transforms instead of line/node opacity.

## Pointer interaction

Secondary and restrained, per creative direction (no glow/halo/blob/large deformation):

- Damped pointer position (same exponential-damping approach as before) nudges facet rotation/translate by a small capped amount (structure tension), and slightly adjusts the void clipPath's buffer/offset (mask reveal amount) rather than moving unrelated line/node elements.
- Same live-capability lifecycle as before: dedicated `(hover: hover) and (pointer: fine)` `MediaQueryList`, reconciled on both tier change and its own `change` event; disabled entirely on mobile tier.
- Bounds cached in document space, refreshed on resize/tier change — not measured in the pointer/ticker hot path.

## Pinned scroll choreography

Pin distances unchanged from the Kinetic Blueprint plan (desktop 160vh, tablet 100vh, mobile 65vh), scrubbed timeline, rebuilt on tier crossing.

| Phase | Range | Behavior |
|---|---|---|
| Structure Wake | 0-20% | Idle drift eases to a stop; facets move toward an upright "wake" orientation (rotation trending to 0°); micro detail (registration marks, secondary nodes) fades/simplifies. |
| Expansion | 20-45% | `plate-a`/`plate-b` scale up (1.0 → 1.12) and translate outward, enlarging the composition's reach; rail extends via `stroke-dashoffset` reveal; secondary band widens slightly. |
| Lock | 45-70% | Facets move into the same precisely-aligned state as the idle signature event, but scroll-scrubbed rather than timed — the composition's strongest visual moment, tied to scroll position. |
| Release | 70-90% | `plate-c` separates and translates away (downward); remaining guide/micro detail fades out; primary structure begins tracking downward with scroll direction. |
| Handoff | 90-100% | All major elements (`plate-a`/`plate-b`, rail, secondary band) translate further down and partially fade, visually handing off to the next section; Hero unpins at 100%. |

Scrolling back up reverses the same scrubbed timeline (no separate reverse-authored states, matching the existing ScrollTrigger `scrub` pattern).

## Reduced motion

Same approach as the retired Kinetic Blueprint composable: a live `(prefers-reduced-motion: reduce)` listener applies a static "resting" composition (facets in their aligned Lock-phase-equivalent position, since that is the strongest single frame) with no idle timers, no signature event, and no pinned scroll timeline created at all. Toggling the media query live (no remount) switches between static and full-motion states.

## Global constraints (carried over from Kinetic Blueprint plan, still binding)

- No Three.js, no WebGL, no shaders.
- No SVG path `d` attribute is ever animated; all motion uses `transform` (`translate`/`rotate`/`scale`), the clipPath hole's rect coordinates, gradient stop `offset` values, `stroke-dashoffset`, `opacity`, and CSS `filter: drop-shadow(...)` only. No MorphSVGPlugin or other paid GSAP plugin.
- Locked/untouched: everything inside `data-hero-content` (headline, subtext, CTA row, corner brackets), container/max-width, section height, navbar, existing entry timeline, section order, base palette tokens (navy/yellow/paper scale itself — usage is bolder, values are not new).
- `ClientOnly` wraps the whole component, matching the existing pattern, to avoid SSR/hydration mismatch.
- Every observer/listener/timeline created must be released in the composable's returned cleanup function.

## Files to modify

- **Rewrite (replace contents):** `app/composables/motion/kineticBlueprintPaths.ts` — new facet/rail/band path data per tier (desktop/tablet/mobile), replacing the old masses/constructionLines/gridLines/registrationMarks/nodes data entirely. Filename kept as-is to avoid an unnecessary rename churn across the file that already imports it; only its exported shapes/content change.
- **Rewrite (large):** `app/composables/motion/useHeroKineticBlueprint.ts` — keep the proven lifecycle scaffolding (tier detection, `IntersectionObserver`/`visibilitychange` pause, `ResizeObserver` tier-crossing rebuild, pointer `MediaQueryList` reconciliation, live reduced-motion listener, pinned `ScrollTrigger` construction/teardown) but replace the idle/scroll/signature-event bodies for the new facet-based structure, and add the `data-hero-content` bounding-box tracking that drives the void clipPath.
- **Modify (small):** `app/components/home/HeroKineticBlueprint.vue` — add the `<clipPath>` element, the `<linearGradient>`/`<radialGradient>` `<defs>` for `plate-a`/`plate-b`/`plate-c`, and adjust SVG group structure for facets/rail/band instead of masses/lines/grid/registration/nodes.
- **Modify (small):** `app/components/home/Hero.vue` — no foreground changes; confirm `data-hero-content` remains a stable ref target the composable can read via `getBoundingClientRect()`. Scrim opacity may be reduced further (from the Kinetic Blueprint-era `paper/0.25`) once the void clipPath is doing the actual protection work, but this is an implementation-time tuning decision, not a locked requirement.
- **Modify (small):** `app/assets/css/main.css` — replace `.kinetic-blueprint__*` utility classes with fill/stroke rules for the new facet/rail/band/micro-detail element classes, plus the `filter: drop-shadow(...)` depth-layering rules for `plate-a`/`plate-b` from the Craft/Motion Quality Bar.
- **No change:** everything else in the retired Kinetic Blueprint plan not listed above (idle lifecycle patterns, pointer lifecycle patterns, reduced-motion listener pattern) carries over conceptually but is reimplemented against the new element set — there is no file this spec leaves as pure legacy code to keep unmodified, since Task 2 (path data) and most of Tasks 4/7/8 (idle, entry, scroll) in the old plan are being replaced outright per the "replace totally" decision.

## Out of scope / explicitly rejected approaches

- CSS `mask-image` per-element radial gradients for the void (rejected: heavier recompute cost across many elements, inconsistent SVG masking behavior across browsers) — clipPath evenodd hole was chosen instead.
- Per-element path `d` boolean intersection cutting (rejected: violates the no-path-morph constraint, requires a geometry library not in the stack, high complexity for marginal visual gain over the clipPath approach).
