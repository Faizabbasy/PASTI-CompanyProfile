# Hero background — Responsive Spatial Surface ("Living Surface")

Date: 2026-09-11
Scope: the Hero's animated **background only** — `app/components/home/Hero.vue`'s
mounted background component and its supporting files. No other file in
`Hero.vue` changes beyond swapping that one mounted component.

## Locked / out of scope

Everything else in the current Hero is protected geometry and must not change,
including but not limited to: navbar, headline text/font/size/line-height/
tracking/position, subtext, CTA labels/position/styles, content max-width/
alignment/spacing/grid, section height, any other homepage section, the
existing GSAP entry timeline in `Hero.vue` (word-mask reveal, spotlight,
shine-sweep — **all three stay exactly as they are**, including the
cursor-spotlight duplicate and shine-sweep effect, which this task does NOT
remove, unlike the superseded 2026-09-10 spec).

## Current state (audited)

`Hero.vue` mounts `<HomeHeroBgThreeNucleusOrigin />` (`app/components/home/
hero-bg/HeroBgThreeNucleusOrigin.vue`) inside a `ClientOnly` wrapper at
`Hero.vue:133-135`. That component renders a "nucleus + radiating line
skeleton + faceted planes" object with its own GSAP formation timeline and a
pinned `ScrollTrigger` retraction — exactly the "centerpiece object floating
behind the text" pattern this task requires removing.

A prior spec (`2026-09-10-hero-k95-redesign-design.md`, a ribbon-object
redesign with a split asymmetric layout) was written but never implemented —
the team instead committed to the Nucleus/Origin object and only stripped its
dev picker panel. That spec is dead; this design does not build on it and
does not touch Hero's layout (still centered, per the locked-content rule
above).

The other 134 files under `app/components/home/hero-bg/` are unrelated
earlier experiments and are out of scope — left untouched.

## Replacement

`Hero.vue:133-135` changes from:
```
<ClientOnly>
  <HomeHeroBgThreeNucleusOrigin class="z-[3]" />
</ClientOnly>
```
to:
```
<ClientOnly>
  <HomeHeroLivingSurface class="z-[3]" />
</ClientOnly>
```
No other line in `Hero.vue` changes.

`HeroBgThreeNucleusOrigin.vue` is deleted (it becomes fully unused). The
other 134 `hero-bg/**` files are left in place — unrelated cleanup, out of
scope for this task.

## Files

**Created:**
- `app/components/home/HeroLivingSurface.vue` — mount wrapper: canvas +
  container, delegates all scene/lifecycle logic to the composable. Same
  shape as the deleted component (a `<div aria-hidden="true" class="pointer-
  events-none absolute inset-0 ...">` wrapping a `<canvas>`).
- `app/composables/motion/useHeroLivingSurface.ts` — scene setup (camera,
  oversized fullscreen plane, `ShaderMaterial`), uniform updates, pointer/
  scroll wiring, render loop, resize/visibility lifecycle, disposal.
- `app/composables/motion/usePointerVelocity.ts` — generic, reusable: raw
  pointer position → normalized (-1..1 per axis) → damped position (lerp
  toward target) → velocity (per-frame delta of damped position, smoothed)
  → direction (normalized velocity) → speed (clamped magnitude). Plain
  closures/typed objects updated per RAF tick — no Vue reactivity in the hot
  path.

**Modified:**
- `app/components/home/Hero.vue` — swap the one mounted background component
  tag (see Replacement above). Nothing else in this file changes.

**Deleted:**
- `app/components/home/hero-bg/HeroBgThreeNucleusOrigin.vue`

## Scene architecture

**Geometry**: one `PlaneGeometry` per depth band (see Depth treatment below),
subdivided (tier-dependent — see Responsive). 115–125% of the Hero's visible
camera frustum at rest is the *starting* overscan range, not a fixed/hard
maximum — see Dynamic overscan below for how the real per-band size is
computed. Refit on every resize. The plane(s) are Three.js objects
positioned behind Hero's DOM content; they never cause DOM overflow, since
sizing is computed entirely in camera/world space inside the WebGL canvas,
not via CSS transforms that could expand the container.

**Dynamic overscan** (hard constraint — no fixed-edge case is acceptable):
overscan is not a constant; it is computed at setup and on every resize from:
- current camera FOV and aspect ratio (determines the base visible frustum
  at each band's depth),
- maximum possible pointer displacement (the shader's clamped max
  displacement magnitude, converted to world-space units at that depth),
- maximum possible scroll-depth displacement (the largest offset any band
  reaches across `uScrollProgress` 0→1, including any per-band parallax
  offset — see Depth treatment),
- maximum camera movement (the largest `uCameraProgress`-driven camera
  translation/FOV change across the scroll range).

The plane size for each band = base frustum-at-depth + sum of the above
displacement/movement budgets + a small fixed safety margin. This must be
computed once analytically (not tuned by eyeballing a fixed percentage) so
that no combination of pointer position, scroll position, and viewport size
can ever expose a plane edge. The 115–125% figure from the original brief is
the expected *result* of this computation at a typical desktop viewport, not
an input to hardcode.

**Material**: custom `ShaderMaterial` (vertex + fragment), no
post-processing, no bloom.

**Depth treatment** (hard constraint — must read as real spatial depth, not
a flat plane with displacement): a single fullscreen plane with only
vertex displacement is not sufficient on its own to produce foreground/mid/
background separation, perspective evolution, or a "camera entering the
material" read as scroll progresses — displacement alone reads as relief on
a flat surface, not depth. The scene therefore uses a small number of
depth bands (2–3 planes, e.g. `near`/`mid`/`far`), each:
- positioned at a different world-space Z,
- using the same shared shader (uniforms driven per-instance via
  per-mesh uniform overrides, not duplicated shader code),
- given a distinct `uLayerSeparation`-driven offset/scale/opacity response
  to `uScrollProgress`, so bands visibly separate (move at different
  rates, offset directionally) as scroll progresses — this is what produces
  perspective evolution and spatial opening, not a single band's
  displacement amplitude alone,
- composited back-to-front, still all within the one WebGL canvas — no new
  DOM elements, no change to Hero's layout or element count.

This stays a single background canvas / single mounted component
(`HeroLivingSurface.vue`) — "multi-band" here means multiple meshes inside
one Three.js scene, not multiple canvases or DOM layers.

**Vertex shader** — low-amplitude displacement, three additive terms:
1. Pointer term: directional falloff from `uPointer`, biased along
   `uPointerDirection`, scaled by `uPointerStrength` (derived from damped
   velocity magnitude). Elongated (dot-product bias), not a symmetric
   ripple/radial ring.
2. Scroll term: broader, lower-frequency displacement driven by
   `uScrollProgress`/`uDepth`/`uLayerSeparation` — this is what produces the
   "moving into the material" read as scroll progresses, distinct in
   character (larger wavelength, slower) from the pointer term so the two
   inputs stay visually legible as separate channels of the same surface.
3. Ambient term: `uTime`-driven, very low amplitude, low frequency,
   continuous — the idle "barely alive" breathing. Runs independent of
   pointer/scroll.

Noise (a single simplex/hash function, reused from the existing codebase
pattern in the deleted component) is used only as fragment-level micro grain
and as a small modulation on the ambient term's amplitude — never as the
primary displacement driver, per the "silhouette must not be defined by
noise" constraint.

**Fragment shader** — restrained material look:
- Base tonal gradient across the surface built from the centralized navy/
  paper constants (see Color source below), modulated gently by depth
  (`uDepth`) and the vertex displacement's local normal/height for soft
  lighting variation.
- Thin fresnel-like edge falloff for a sense of material thickness/light
  response — subtle, no glow.
- Static-frequency micro grain, low amplitude.
- Yellow accent limited to a very low-opacity highlight term gated by
  `uPointerStrength` at high velocity only — never a wash, never covers a
  meaningful surface area.
- Optional chromatic offset: only active above a `uPointerStrength`
  threshold, amplitude tuned to be almost imperceptible (a fractional-pixel
  RGB channel offset), per the spec's "almost imperceptible" requirement.

**Uniforms**: `uTime, uResolution, uPointer, uPointerVelocity,
uPointerDirection, uPointerStrength, uScrollProgress, uDepth,
uLayerSeparation, uCameraProgress, uNoiseScale, uSurfaceTension,
uRelaxation, uReducedMotion`. Every uniform maps to a specific visual role
described above — none are speculative.

## Color source

All shader colors are centralized as `THREE.Color` constants at the top of
`useHeroLivingSurface.ts`, mirrored 1:1 from the exact existing values in
`tailwind.config.ts` (navy-700 `#0B3954`, navy-500 `#1C5E7C`, yellow-500
`#FBBA00`, paper `#FFFFFF`, plus any additional navy step the gradient needs
— chosen from the existing navy scale, never a new/approximated value). No
new palette, no runtime CSS-variable plumbing introduced for this (the
project doesn't currently expose Tailwind theme values as CSS custom
properties) — if a shared design-token runtime source gets built later, this
composable migrates to it without changing visual output.

## Pointer data flow

```
pointermove (listener scoped to the Hero <section>, passive)
  → raw client coords
  → normalized to (-1..1) per axis relative to Hero section bounds
  → usePointerVelocity: exponential damping toward normalized target each RAF tick
  → velocity = per-tick delta of damped position (smoothed, not raw)
  → direction = normalize(velocity)
  → strength = clamp(length(velocity), 0, max)
  → written directly into uPointer / uPointerVelocity / uPointerDirection / uPointerStrength uniforms (mutated in place, no allocation)
```

Idle relaxation is inherent to the damping: when input stops, the damped
position stops moving, velocity decays toward 0 through the same lerp (no
separate "relax" animation, no snap, no bounce) — satisfying the "gradual
relax" requirement without extra state machinery.

On mobile (`max-width: 767px`, matching the existing codebase convention),
the pointer listener is never attached — the uniforms simply stay at their
resting values.

## Scroll data flow

One `ScrollTrigger`, scoped to the Hero `<section>` element (matching the
existing project convention of passing an explicit `trigger`/scope — see
[[pasti_gotchas]] on ScrollTrigger scoping):

```js
ScrollTrigger.create({
  trigger: heroSectionEl,
  start: 'top top',
  end: 'bottom top',
  scrub: true,
  onUpdate: (self) => { /* write uScrollProgress + derived uniforms */ }
})
```

**Not pinned** — no `pin: true`, no scroll hijack, no artificial scroll
container. Native scroll behavior is completely unaffected; the Hero section
scrolls at its normal height and rate. `uScrollProgress` (0→1 across that
natural scroll span) drives `uDepth`, `uLayerSeparation`, and
`uCameraProgress` via simple derived mappings (e.g. staged easing curves
matching the 0/15/30/50/70/90/100% character bands described in the task,
implemented as smoothstep-based remaps of `uScrollProgress`, not as five
separate ScrollTriggers).

Scrolling backward simply reverses `uScrollProgress` — the shader is a pure
function of the uniform, so backward scroll naturally un-does the depth
journey with no extra state.

## Lifecycle & performance

Mirrors the lifecycle pattern already proven in the deleted component:

- `ClientOnly` mount (unchanged in `Hero.vue`) — no hydration mismatch.
- `ResizeObserver` on the canvas's parent — updates camera + plane refit +
  renderer size; no DOM reads inside the render loop itself (bounds cached
  by the observer callback, not re-read per frame).
- `IntersectionObserver` on the Hero section — pauses the RAF loop when
  scrolled out of view.
- `visibilitychange` listener — pauses the RAF loop when the tab is hidden.
- `matchMedia('(prefers-reduced-motion: reduce)')` `change` listener — live
  toggles between the normal and reduced-motion branches for the lifetime of
  the mount (see Reduced motion below); removed in cleanup.
- DPR capped: 2 on desktop, 1.5 on tablet (`isTabletViewport()`), 1 on
  mobile.
- Single RAF loop; no duplicate loops across HMR/remount (loop id tracked
  and cancelled in the returned cleanup, same as the deleted component).
- No per-frame allocation: pointer/velocity/direction live in
  pre-allocated `THREE.Vector2`/scalar holders mutated in place; uniform
  values are written directly, never replaced with new objects.
- Full disposal in the composable's returned cleanup (`useGsapContext`
  pattern): every band's `geometry.dispose()` and `material.dispose()`
  (materials are per-band instances or shared-program uniform-override
  instances — either way, each is disposed individually), `renderer.
  dispose()`, `ScrollTrigger.kill()`, observers disconnected, listeners
  removed (including the `matchMedia` change listener above).

## Responsive

- **Desktop**: full pointer velocity/direction influence, full plane
  subdivision, DPR ≤ 2, full scroll-depth range.
- **Tablet** (`isTabletViewport()`): pointer influence scaled down via
  `tabletScaled()`, reduced subdivision, DPR ≤ 1.5, scroll-depth amplitude
  reduced slightly.
- **Mobile** (`max-width: 767px`): no pointer listener attached at all (no
  hover input); ambient idle motion and scroll-depth transition still run;
  lowest subdivision; DPR ≤ 1. The surface stays visually present and
  intentional — never swapped for a static gradient/image.

## Reduced motion

Under `prefers-reduced-motion: reduce`, checked via a `matchMedia('(prefers-
reduced-motion: reduce)')` listener (`change` event) set up at mount and
removed in cleanup — not a one-time check at setup. The OS-level setting can
change mid-session (a real, if rare, path: user opens system settings while
the tab is open), and the surface must respond to that live, switching
between the two branches below without a remount:

- No RAF loop for ambient/idle motion.
- Pointer deformation disabled entirely (uniforms held at rest values).
- Large scroll-depth shift disabled — `uScrollProgress`-driven depth is
  clamped to a small/resolved value rather than animating across the full
  range; a single static render of the "resolved" surface state is shown.
- Hero readability unaffected (no change to scrim/contrast treatment).

## Entry choreography sync

No changes to `Hero.vue`'s existing GSAP timeline (word-mask reveal,
spotlight, shine-sweep untouched, per Locked/out of scope). The surface
independently `watch()`es the existing `introReady` ref (same composable
Hero.vue already uses) and ramps its own `uSurfaceTension`/ambient-intensity
uniform from a calm low value up to resting active value over a duration
matched to `motionTokens.ts`'s existing slow/medium duration constants —
loosely synced by timing, not by hooking into Hero's timeline object or
adding a shared label. Pointer-driven deformation only becomes fully active
once this internal ramp completes, so the surface doesn't visibly react to
the pointer while the headline is still revealing.

## Definition of done

- All Hero foreground/layout/content code must remain unchanged except the
  single background component mount replacement (`Hero.vue:133-135`, see
  Replacement above). This covers: navbar, headline (text/font/size/
  line-height/tracking/position), subtext, CTA labels/position/styles,
  content max-width/alignment/spacing/grid, section height, every other
  homepage section, and the existing Hero GSAP timeline (mask reveal,
  cursor spotlight, shine-sweep).
- `HeroBgThreeNucleusOrigin.vue` deleted; `HeroLivingSurface.vue` mounted in
  its place via the same `ClientOnly` wrapper.
- No centerpiece object silhouette — the background reads as one continuous
  responsive surface, not an object sitting behind the text.
- Pointer produces directional, damped, velocity-scaled local deformation
  that relaxes gradually with no snap/bounce.
- Scroll drives global depth/layer-separation/camera-progress uniforms via
  a non-pinned, non-hijacking `ScrollTrigger` scoped to the Hero section;
  native scroll (including backward scroll) works normally.
- Depth reads as real spatial depth (foreground/mid/background separation,
  perspective evolution, camera-entering-material feel) via the multi-band
  treatment — not a flat plane with displacement.
- Colors are the exact existing navy/yellow/paper values, centralized as
  constants — no new palette, no approximation.
- Overscan is computed dynamically per band from FOV/aspect/max pointer
  displacement/max scroll-depth displacement/max camera movement (115–125%
  is the expected desktop result, not a hardcoded constant) — no viewport
  size, pointer position, or scroll position exposes a plane edge.
- Mobile: no pointer dependency, ambient + scroll-depth motion intentional
  and present, lowest-tier subdivision/DPR.
- Reduced motion: responds live to `prefers-reduced-motion` changes via a
  `matchMedia` listener (not a one-time setup check); shows a static
  resolved frame with no ambient/pointer/large-scroll animation while
  active.
- No per-frame allocation, no duplicate RAF loops, full resource disposal,
  no WebGL leaks, no hydration mismatch, no console errors.
- Production build + typecheck pass.

## Out of scope

- Any layout change to Hero (stays centered, as currently implemented).
- Removing/altering the cursor-spotlight duplicate or shine-sweep effect
  (unlike the superseded 2026-09-10 spec, this task keeps them).
- Deleting the other 134 files under `app/components/home/hero-bg/`.
- Any change to any other homepage section, navigation, or global systems.
