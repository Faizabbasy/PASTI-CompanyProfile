# Hero redesign — K95-benchmarked visual/motion direction

Date: 2026-09-10
Scope: `app/components/home/Hero.vue` and its supporting files only. No other
section, route, navigation, or global system changes.

## Reference

K95 studio homepage Hero (https://k95.it/en), described by the user as:
minimal editorial composition, one dominant interactive 3D/WebGL object as
the primary visual identity (not decoration), large negative space, damped
non-literal pointer response, slow/ambient continuous motion with no
bounce, restrained editorial typography, small utility/metadata labels, a
scroll cue. K95 exposes two selectable visual states (Rings / Spiral) where
switching state is part of the interaction design, not a plain toggle.

This spec adapts that *character* — composition, motion language, spatial
balance, interaction restraint — to PASTI's existing Hero content. It does
not copy K95's geometry, text, or assets.

## Preserved content (unchanged)

- Headline: "Technology. Creativity. Impact."
- Subtext: existing copy, unchanged.
- CTA 1: "Explore our work" → same behavior (`useSectionCurtain().playTo`).
- CTA 2: "Tell us about it" → same WhatsApp link behavior.
- Brand font (no font-family change).
- Global nav, scroll system, page transitions, route structure: untouched.

## Removed

- Dev-only background picker (`activeBg` state, `bgGroups`, the picker
  panel UI, all conditional `<Home...>` renders) from `Hero.vue`.
- All 135 files under `app/components/home/hero-bg/`.
- Cursor-follow yellow spotlight duplicate of the headline.
- Diagonal "shine sweep" effect.

Rationale: both effects read as decorative/SaaS-y against K95's restrained
character, and the picker's job (comparing directions) is done — this spec
commits to one direction.

## Layout

Split asymmetric composition inside the existing `min-h-[100svh]` Hero
section:

- **Left column**: small utility label (mono, e.g. a short kicker line) →
  headline → subtext → CTA row. Left-aligned, constrained max-width (not
  full viewport width) so the headline reads as editorial column, not a
  centered banner.
- **Right column**: the ribbon 3D scene, given a clear reserved canvas
  area (explicit width/height/aspect via CSS, not intrinsic-from-content)
  so there's no CLS. Generous negative space around it — it must not fill
  the column edge-to-edge.
- Below/near the bottom of the Hero: a small scroll-cue element (existing
  scroll affordance pattern if one exists in the codebase; otherwise a
  minimal text+line indicator), consistent with K95's restrained utility
  elements.
- On narrower viewports the two columns stack (text above, scene below or
  behind at reduced complexity — see Responsive).

This replaces the current centered `max-w-5xl mx-auto text-center` content
block.

## 3D scene — ribbon system

New component `app/components/home/HeroRibbonScene.vue` (mount wrapper,
client-only) backed by composable `app/composables/motion/useHeroRibbonScene.ts`
(scene setup, geometry, material, render loop, disposal).

**Form**: a single continuous abstract ribbon/line built from a
`CatmullRomCurve3` through a fixed number of control points, extruded via
`TubeGeometry`. Not a sphere, not a particle field, not a blob. Clear,
recognizable silhouette; restrained camera framing (controlled FOV/distance,
not full-bleed).

**Two formations, one object**:
- `idle` control points: a looser, more dispersed curve — the resting
  state before the Hero has been seen.
- `active` control points: a more resolved, composed curve — the state the
  ribbon settles into as part of the Hero entry choreography.
- A single scalar `formationProgress` (0→1) interpolates control points
  between `idle` and `active` per-frame. This progress is driven once by
  the GSAP entry timeline (see Motion), not by continuous reactive props.

**Geometry update performance** (hard constraint):
- Do NOT dispose/recreate `TubeGeometry` (or its underlying
  `BufferGeometry`) every frame.
- Maintain the tube's position buffer once at a fixed segment/radial count;
  each frame (or each timeline tick while `formationProgress` is
  animating), recompute the interpolated curve control points and write
  updated vertex positions directly into the existing buffer
  (`geometry.attributes.position.array`, then
  `needsUpdate = true`), reusing the same `Float32Array` — no per-frame
  allocation.
- Once `formationProgress` reaches 1 and pointer-driven micro-displacement
  takes over, the same buffer-reuse approach applies: displacement is
  computed into scratch vectors held outside the render loop (allocated
  once at setup), not allocated per frame.
- Keep tube segment/radial count modest (tuned during implementation to a
  value that stays smooth on mid-tier hardware — no fixed number mandated
  here, but it must be benchmarked, not guessed).

**Material — custom GLSL, restrained** (hard constraint):
- Custom `ShaderMaterial` (vertex + fragment), not `MeshPhysicalMaterial`.
- Fragment shader: a thin fresnel rim term + a subtle gradient along the
  tube's length parameter. Optionally a very low-amplitude surface grain/
  noise for material believability.
- Explicitly forbidden: bloom/glow post-processing, neon/emissive-heavy
  color, holographic iridescence, glossy CGI specular highlights, HDR
  environment reflections. The result must read as matte/restrained, in
  the existing PASTI palette (navy/paper tones — no new brand colors).
- If in doubt during implementation, under-do the shader effect rather
  than over-do it — restraint is the requirement, not a stretch goal.

**Pointer response — micro-level only** (hard constraint):
- Reuses a new generic composable `app/composables/motion/usePointerDamping.ts`:
  raw pointer position → normalized (-1..1 per axis) → exponential
  damping/lerp toward that target each frame (not a spring with overshoot;
  no bounce).
- The damped pointer vector feeds a small per-control-point displacement
  on top of the resolved `active` formation — clamped to a small maximum
  magnitude (tuned in implementation, but must be small enough that the
  ribbon's overall silhouette and recognizable shape never visibly change
  because of the cursor).
- Pointer influence only starts after `formationProgress` reaches 1
  (i.e., after entry choreography resolves) — see Motion.
- Effect: the object should read as "alive" when the pointer moves near
  it, never as "controlled by" or "chasing" the pointer.
- On touch/no-pointer devices, this layer is simply not activated (see
  Responsive).

**Ambient idle motion**: independent of pointer, the ribbon has a slow,
continuous, non-random motion (e.g. a slow rotation or gentle
control-point breathing on a long sine cycle) so it has "life" even
without interaction — consistent with K95's continuous ambient character.
This must be subtle and slow; no bounce, no easing overshoot.

## Motion — Hero entry choreography

Refine the existing GSAP timeline in `Hero.vue` (built on
`useIntroReady()` gating, same `gsap.matchMedia()` reduced-motion split
already in place):

1. Utility label (new small mono element) reveals first.
2. Headline: keep the existing word-by-word mask reveal
   (`wrapWord`/`yPercent` technique) — this part of the current
   implementation already fits K95-like masked-reveal character and is
   preserved, just re-sequenced.
3. Subtext, then CTA row, staggered after the headline settles (as today).
4. Ribbon `formationProgress` animates 0→1 on the same timeline, sharing a
   label with the text choreography (analogous to the existing
   `shineStart` label pattern) so scene resolution and text reveal read as
   one coordinated event, not two unrelated animations.
5. Remove the spotlight and shine-sweep steps entirely (see Removed).

No plain opacity-only fade may serve as the primary entrance for headline
or scene — masked/transform-driven reveal only, per the existing pattern.

## Cursor / micro-interaction

- Reuse existing `useMagnetic` for CTA 1 (already applied) — keep as is.
- If the project's custom cursor system (`useCustomCursor`) supports
  contextual states, add a Hero-only state while the pointer is over the
  ribbon's canvas area (e.g. subtle enlarge). Do not modify the global
  cursor system's architecture — only add a Hero-scoped state hook if the
  existing composable already supports that extension point; otherwise
  skip this rather than rebuilding cursor infrastructure.
- No difference/invert blend mode work is required unless trivially
  available from the existing cursor composable.

## Responsive

- **Desktop** (existing `md`/`lg` breakpoints): full split layout, full
  pointer damping, full ambient motion.
- **Tablet**: reduced pointer displacement clamp (smaller max magnitude)
  if pointer/hover is available; scene may drop grain/fresnel detail if
  needed for perf, geometry unchanged.
- **Mobile**: stacked layout (text first, scene below or as a smaller
  contained element — not full-bleed background); pointer damping layer
  disabled entirely (no hover); ambient idle motion still runs but at
  reduced segment count if needed; the ribbon's visual identity must
  remain recognizable, not collapse into a flat static image.

## Reduced motion

Within the existing `gsap.matchMedia('(prefers-reduced-motion: reduce)')`
branch:

- Text content sets to final state immediately (as today).
- Ribbon: skip the idle→active tween — set `formationProgress = 1`
  directly (no animation).
- Disable pointer damping entirely.
- Disable ambient idle motion, or reduce to an imperceptibly slow single
  static render (no continuous rAF loop required to satisfy "reduced
  motion" — a single static frame of the resolved active formation is
  acceptable and preferable for battery/CPU).

## Performance & lifecycle safeguards

- `ClientOnly` mount (as today) — no hydration mismatch.
- Explicit reserved canvas dimensions via CSS — no CLS.
- `devicePixelRatio` capped at 2.
- Render loop paused via `IntersectionObserver` when the Hero section is
  scrolled out of view, and via the `visibilitychange` event when the tab
  is hidden.
- All Three.js resources (`geometry`, `material`, `renderer`) explicitly
  disposed in `onScopeDispose`/`onUnmounted`.
- Resize handled via `ResizeObserver` (or existing project pattern),
  updating camera/renderer without leaking listeners.
- No per-frame allocation in the render loop (see Geometry update
  performance above) — this is the primary perf risk given the
  idle↔active morph requirement, and is treated as a hard constraint, not
  a nice-to-have.
- One GSAP timeline instance per Hero mount; killed on cleanup — no
  duplicate timelines on HMR/remount.

## Out of scope

- Any change to navigation, What We Do, Services, Selected Work, Why
  PASTI, Insights, Platforms, FAQ, footer, route structure, global page
  transitions, or Lenis scroll configuration.
- Rebuilding the site-wide custom cursor system.
- A literal two-state visual selector UI (Rings/Spiral equivalent) — the
  idle/active formation is internal, driven by entry timeline + pointer,
  not a user-facing toggle.

## Files

**Created**:
- `app/components/home/HeroRibbonScene.vue`
- `app/composables/motion/useHeroRibbonScene.ts`
- `app/composables/motion/usePointerDamping.ts`

**Modified**:
- `app/components/home/Hero.vue` (layout, entry timeline, scene mount,
  picker removal)

**Deleted**:
- `app/components/home/hero-bg/**` (135 files)

## Definition of done

- Only Hero-related files touched (per Files section above).
- Headline/subtext/CTA copy unchanged.
- Dev background picker and all 135 experimental background components
  removed.
- Ribbon scene renders with idle→active entry resolution and damped,
  clamped pointer micro-interaction — silhouette recognizable and stable.
- Spotlight and shine-sweep effects removed.
- No CLS, no hydration mismatch, no console errors.
- Reduced-motion path verified (text final-state immediate, ribbon static
  active formation, no pointer/idle animation).
- Mobile: usable, stacked layout, no cursor-dependent behavior, ribbon
  still visually present (not collapsed to nothing).
- No per-frame geometry allocation in the render loop.
- Production build passes.
