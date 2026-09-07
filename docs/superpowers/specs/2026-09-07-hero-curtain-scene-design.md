# Hero Motion Redesign — "Spatial Material Composition" (ICOMAT-benchmarked)

Status: approved by user, implementing.

## Context

`app/components/home/Hero.vue` currently renders text-only content (GSAP
word-mask reveal, cursor spotlight, shine sweep) with no animated background
— it fills `min-h-[100svh]` over the page's plain background.

Two dead files exist in the codebase and are **not mounted anywhere**:
`app/components/home/HeroScene.vue` and `app/composables/motion/useHeroScene.ts`
— a "Living Network" constellation scene (particle nodes, edges, orbit rings)
from an earlier iteration. `Hero.vue`'s template never references
`<HeroScene>`. Per user decision, these are dead code to be deleted, not
repurposed — their visual grammar (particle/node graph) is unrelated to this
redesign's target (large layered sheets), and keeping an unused ~1080-line
composable around serves no one.

The client wants the Hero's *background visual* redesigned to match the
premium/cinematic quality of [icomat.co.uk](https://www.icomat.co.uk)'s hero:
large layered material sheets, strong depth, slow monumental motion. This is
a from-scratch new scene, not a modification of the dead network scene.

**Scope is strictly the animated background.** Headline, subtext, CTAs, font,
copy, spacing, layout position of content, navigation, and every other
section are unchanged. The 3D/animated visual sits behind existing content
(`z-0` under the existing `z-10` content block).

## Non-goals / explicit exclusions

Per user's "anti-generic" requirement, the result must NOT read as: liquid,
fabric, jelly, waving cloth, generic wave, ribbon screensaver, a Three.js
tech demo, or generic AI-abstract background. If an implementation pass
still reads that way, it is not done — a correction pass is required before
reporting completion (see Verification).

## Approach

**New composable** `app/composables/motion/useHeroCurtainScene.ts` (Three.js
scene: geometry, material, lighting, camera, dispose lifecycle) following the
same `start()/stop()/dispose()/fit()`, deferred-build-via-`requestAnimationFrame`
shape already established in this codebase (`useIntroScene.ts` in the
intro-3d-redesign worktree, and the pattern the deleted `useHeroScene.ts`
also followed).

**Rebuilt component** `app/components/home/HeroScene.vue` — mount wrapper
reusing the proven gating pattern from the deleted file: WebGL enabled only
client-side post-hydration (`onMounted`, avoids SSR hydration mismatch),
`ResizeObserver` for `fit()`, `IntersectionObserver` to pause the render loop
when Hero scrolls out of view, full `dispose()` on unmount. This version is
**not** gated all-or-nothing behind `pointer: fine` + desktop width like the
intro overlay — mobile/tablet get a reframed lightweight WebGL scene, not a
CSS fallback (see Responsive).

`Hero.vue` gets one addition: `<HeroScene />` mounted as an absolutely
positioned layer behind the existing content div. No other change to
`Hero.vue`.

## Visual form — sheet geometry

**Silhouette-first, deterministic curvature.** Each sheet's macro shape comes
from an explicit, art-directed curve (e.g. a hand-tuned `CatmullRomCurve3` or
cubic Bézier profile per sheet — one large intentional arc per sheet, not a
repeating wave), extruded into a wide ribbon with slight thickness and a
beveled edge (so specular highlights can catch the edge face, not just the
front). Procedural noise is **never** the source of a sheet's shape.

Noise's only allowed role is **micro-surface deformation** — a tiny-amplitude
detail layered on top of the deterministic base shape (imperfection, not
form), injected via `onBeforeCompile` on `MeshPhysicalMaterial` (see
Material). If a sheet's silhouette is unclear or reads thin/flimsy at a
glance, the fix is bigger, simpler massing on the base curve — not more
surface detail. Silhouette must read correctly as a large deliberate shape
at a macro glance, before any material/lighting detail is considered.

Each sheet carries slight thickness (extruded, not a single-sided
`PlaneGeometry`) specifically so its edge is a readable, lit surface — an
engineered-material cue, not a flat card with a texture.

## Composition — 3 layers, clear roles

- **Foreground** — largest arc, closest to camera, deliberately framed
  partially off-screen (30-50% of frame covered), asymmetrical placement (not
  centered, not screen-filling symmetrically). Carries the most visual
  weight and the most surface/material detail (highest-fidelity shading,
  since it's closest and most scrutinized).
- **Midground** — establishes the composition's directional flow (the
  diagonal/sweep axis every layer's motion follows). Fills out the scene
  without competing with the foreground's dominance.
- **Background** — smallest visual importance, purely a depth cue. Distance
  is NOT communicated by opacity alone: darker/more desaturated navy tone,
  lower contrast, reduced specular/highlight intensity, and a touch of
  atmospheric depth (fog or fog-equivalent falloff) combine so the back
  layer reads as genuinely far away, not just "the same sheet, more
  see-through."

**Asymmetrical, intentional framing.** None of the three layers are
centered/symmetrical placeholders — camera framing and per-sheet placement
are art-directed so the composition reads as a considered shot, not a
centered product-render default.

## Motion

- **Camera**: near-static resting position, only a small-amplitude ambient
  drift (slow sine-based breathing), no scroll-reactive tilt.
- **Layer parallax**: all sheets share ONE directional flow (the same sweep
  axis, set by the midground's orientation) — parallax comes only from
  differences in speed, amplitude, and depth between layers, never from
  layers drifting toward different/random directions.
- **Light sweep**: one real, moving `THREE.DirectionalLight` (or `SpotLight`)
  — consistent with the material-sweep approach already validated for the
  intro-3d-redesign work. This must stay **restrained**: slow, subtle,
  low-intensity — its job is to help the eye read surface form and depth,
  not to be the scene's headline event. It is not a flashy sweep/shine
  gimmick.
- **Pointer interaction**, if present at all: very subtle (small parallax
  offset at most) — not a reactive/following effect.

## Material

Base: `MeshPhysicalMaterial` per sheet (navy-family colors, restrained
metalness/roughness/clearcoat — same tuning family already validated for
this project's hub-sphere material, "polished, not glossy-plastic, not
neon"). Three.js's own physically-based lighting pipeline is used as-is.

Micro-surface richness (brushed/satin/fine-fiber feel) is added via
`onBeforeCompile` shader injection into that same `MeshPhysicalMaterial` —
small procedural noise perturbing normal/roughness at a tiny scale. This is
an **extension**, not a replacement: the PBR lighting model stays intact,
noise only adds surface imperfection on top of it.

**Color discipline**: primary language is navy/deep-blue (varied per layer
for depth, see Composition). Yellow is accent-only — a thin rim/edge
highlight on a bevel, and the color of one small specular streak as the
light sweep crosses a sheet. No yellow fill, no yellow key light. The key
light itself stays neutral/cool (white-blue), matching the already-validated
key/rim light pairing from prior 3D work in this codebase.

## Responsive

- **Desktop**: full 3-layer composition, full micro-surface shader detail,
  highest DPR cap.
- **Tablet**: same 3-layer scene, DPR/detail scaled down (matches the
  general "reduced complexity, same scene graph" direction, not a separate
  code path).
- **Mobile**: **reframed, not cropped.** 2 layers (foreground + one merged
  mid/background), with the foreground's scale/angle/position re-tuned so it
  still reads as close-to-camera with real depth — not simply "hide the
  third desktop layer and keep the same camera." DPR capped lower, noise
  micro-detail reduced or off.
- **`prefers-reduced-motion: reduce`**: motion minimized — sheets settle to
  their resting composition and hold static; no light-sweep animation, no
  camera drift.

This scene is NOT gated behind a `pointer:fine` + min-width all-or-nothing
switch (unlike the intro overlay) — every viewport gets a real WebGL scene,
scaled per the tiers above.

## Performance guardrails (reused patterns)

- Deferred scene construction via `requestAnimationFrame` inside `onMounted`
  (avoids competing with the browser settling initial paint).
- `IntersectionObserver` pauses the render loop when the Hero scrolls out of
  view.
- `ResizeObserver` drives `fit()`.
- Full `dispose()` of all geometries/materials/renderer on unmount.
- DPR capped (tiered by viewport per Responsive).

## Files

**Deleted:**
- `app/components/home/HeroScene.vue` (current dead-code version)
- `app/composables/motion/useHeroScene.ts`

**New:**
- `app/composables/motion/useHeroCurtainScene.ts` — sheet geometry
  (deterministic curves, extrusion, bevel), material (`MeshPhysicalMaterial`
  + `onBeforeCompile` micro-noise), lighting (neutral key/rim + restrained
  moving sweep light), camera, parallax/motion, responsive tiers, dispose
  lifecycle.
- `app/components/home/HeroScene.vue` — mount wrapper (rebuilt from scratch,
  reusing the proven gating/observer/dispose pattern).

**Modified:**
- `app/components/home/Hero.vue` — add `<HeroScene />` behind existing
  content. No other change.

**Untouched:**
- Headline, subtext, CTA copy/markup/behavior in `Hero.vue`.
- `app/composables/useIntroReady.ts`, `app/app.vue`, every other
  section/page/component.

## Anti-generic verification (must pass before reporting done)

After first implementation pass, screenshot the result and self-check
against the target adjectives: **monumental, heavy, engineered, cinematic,
premium, art-directed**. Explicitly check it does NOT read as: liquid,
fabric, jelly, waving cloth, generic wave, ribbon screensaver, Three.js demo,
or generic AI-abstract background. If it still reads generic/flat/too light,
perform a correction pass (bigger/simpler massing, stronger silhouette,
reduced noise amplitude, more asymmetry) before the task is considered
complete.

Additional verification:
- `npm run dev`, visually confirm the 3-layer composition at desktop width:
  silhouette readability, depth differentiation (not opacity-only), light
  sweep restraint, asymmetrical framing.
- Resize to tablet/mobile widths: confirm the reframed (not cropped) 2-layer
  mobile composition.
- `prefers-reduced-motion: reduce` emulation: confirm sheets hold static.
- Browser console: zero errors/warnings across all viewport tiers.
- `npm run build`: confirm production build succeeds.
- Confirm Hero text/CTA content, spacing, and behavior are pixel-identical
  to before this change (diff against current `Hero.vue` template shows only
  the one `<HeroScene />` addition).
- Screenshot desktop/tablet/mobile framings for the final report.
