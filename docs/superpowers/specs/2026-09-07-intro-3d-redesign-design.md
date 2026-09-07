# Intro / Preloader Redesign — "Blueprint → Dimensional Object"

Status: approved by user, implementing.

## Context

PASTI's current page-load preloader (`app/components/layout/IntroOverlay.vue`)
is a 2D GSAP sequence: construction grid → text-stroke outline of "PASTI" →
navy sweep bar fills the outline → rule + accent dot settle → aperture-close
exit into the Hero. It works and is already committed, but the client wants
something more premium, dimensional, and distinct from generic agency
preloaders — with the actual PASTI wordmark becoming a real 3D object at the
centerpiece.

This redesign keeps the existing 2D "construction field → outline build"
opening (phases 1-2 below reuse the current approach almost as-is — it
already reads as a genuine "brand under construction" moment and there's no
reason to discard working, on-brief work) and adds three new phases: the
wordmark lifts from flat outline into an extruded 3D object rendered via
Three.js, gets a one-shot light/material sweep, holds, then collapses/fades
into the Hero.

## Asset reality check (resolves a mismatch in the original brief)

The brief asked to preserve "a slash shape on the left" from the logo. After
auditing every PASTI logo asset in the repo (`public/images/pasti-logo.png`,
`.docs/LOGO/*`), the real logo is a wordmark ("PASTI") + a yellow accent dot
over the "i" — there is no slash element anywhere in the actual brand mark.
**Per user decision, the slash instruction is dropped** — nothing invents a
shape that isn't part of the real logo.

The brief also asked to prioritize an SVG/vector version of the logo if one
exists. **Only a PNG raster exists** (no SVG/AI in the repo). Per user
decision, the 3D wordmark is built by rendering the actual brand text
("PASTI", Manrope Extra Bold, the same face/weight the rest of the site's
`font-display` uses and the real logo itself uses) with Three.js's
`TextGeometry`, then extruding that — not by vectorizing the PNG. This is
more faithful to the brand than a traced-PNG outline would be (crisp,
scalable, exact letterforms) and avoids introducing vectorization artifacts.

## Approach

**New component, not a patch.** `IntroOverlay.vue` is rewritten from scratch.
The `useIntroReady` composable's contract (`introReady` ref, `markIntroReady()`
call) stays byte-for-byte identical — Hero.vue, Header.vue, and any other
consumer that gates its own entrance on `introReady` needs zero changes.

**New composable `app/composables/motion/useIntroScene.ts`** for the Three.js
wordmark scene, following `useHeroScene.ts`'s established shape:
`start()/stop()/dispose()/fit()` lifecycle, deferred build (scene construction
happens on a `requestAnimationFrame` callback inside `onMounted`, not
synchronously — same reasoning as `HeroScene.vue`: avoids competing with the
browser settling the reload). No shared state with the Hero scene — a second,
independent renderer/canvas that gets fully disposed before the Hero scene's
own canvas exists in any meaningful way (they don't run concurrently: intro
finishes and unmounts its canvas well before the Hero's WebGL scene becomes
visually relevant, though HeroScene.vue mounts and starts building on its own
schedule regardless).

**Mobile / reduced-motion / low-capability fallback.** Mirrors
`HeroScene.vue`'s exact gate: WebGL wordmark only runs when
`pointer: fine` AND `min-width: 1024px` AND `prefers-reduced-motion: no-preference`
all hold. Everything else (phones, tablets, coarse pointers, reduced motion)
gets a CSS/GSAP-only version of phases 3-5: no real extrusion, instead a
`transform: perspective()` + layered `box-shadow` fake-depth pop with the
same timing beats, so every visitor still gets a construction → build →
"dimensional" → hold → exit experience, just without true WebGL geometry on
constrained devices. `prefers-reduced-motion: reduce` collapses everything to
an instant cross-fade into the Hero (matches the current component's existing
behavior — not a regression).

## Phases (target ~4.5s total, matches the approved "~4-5s" duration choice)

1. **Construction field** (~0.9s) — orthogonal grid draws in, crosshair
   markers snap onto intersections. Carried over from the current component
   essentially unchanged (it already serves this brief's "logo being
   constructed" requirement).
2. **Outline build** (~0.6s) — "PASTI" fades in as a text-stroke outline
   (transparent fill, navy stroke) over the construction field. Carried over
   from the current component.
3. **3D formation** (~1.3s) — the flat outline is swapped for the Three.js
   canvas: the same wordmark, now `TextGeometry`-extruded (shallow depth —
   "elegant, not thick" per brief), fades/scales up from flat, camera or
   object does a small settle-rotation (a few degrees, not a spin) so the
   extrusion depth actually reads before it stops. The 2D outline/canvas
   crossfade is timed so there's no visible "pop" between the two
   representations.
4. **Light / material moment** (~0.7s) — one directional light sweeps across
   the extruded surface (a moving light, not a moving highlight-texture —
   keeps it feeling like a real lit object rather than a CSS shine gimmick).
   Material: dark navy `MeshPhysicalMaterial` with restrained
   metalness/roughness/clearcoat (same "polished, not glossy-plastic, not
   neon" family already established for the Hero scene's hub spheres — reuses
   that tuning rather than inventing new material language). The yellow
   accent dot over the "i" is a separate small emissive mesh — the one point
   in the scene allowed to read as a genuine focal highlight.
5. **Brand hold** (~0.6s) — object settles to a frontal resting rotation,
   holds still. This is the "user catches the brand" beat — deliberately the
   longest static moment in the sequence.
6. **Exit** (~0.5s) — the 3D object scales/collapses slightly toward the
   camera while the whole overlay fades — replaces the current version's
   aperture-close panels with a depth-based collapse that fits the new 3D
   framing. Hero is already mounted behind the overlay throughout (unchanged
   architecture), so this is a fade/reveal, not a page transition.

## Integration points (unchanged, verified against current code)

- `useIntroReady.ts` — untouched. `markIntroReady()` still fires once, at the
  start of the exit phase (matches current behavior — Hero/Header start their
  own entrance animations as the intro begins leaving, not after it's fully
  gone).
- `app.vue` — untouched. `<LayoutIntroOverlay />` mount point and ordering
  stays exactly where it is.
- `Hero.vue` / `HeroScene.vue` — untouched. Neither file is edited by this
  work. `HeroScene.vue`'s own WebGL scene is a fully separate concern that
  already reacts to `introReady` on its own; nothing about how it's driven
  changes.

## Files

**New:**
- `app/composables/motion/useIntroScene.ts` — Three.js wordmark scene
  (extrusion, lighting, material, camera choreography, dispose lifecycle).

**Rewritten:**
- `app/components/layout/IntroOverlay.vue` — phases 1-2 (construction field,
  outline build) adapted from the current file; phases 3-6 replaced with the
  new WebGL/CSS-fallback formation, light moment, hold, and collapse-exit.

**Untouched:**
- `app/composables/useIntroReady.ts`
- `app/app.vue`
- `app/components/home/Hero.vue`
- `app/components/home/HeroScene.vue`
- Every other section/page/component.

## Font/extrusion dependency and fallback

`TextGeometry` needs a Three.js-format JSON font (via `FontLoader`), not the
webfont file directly, and Manrope doesn't ship one. Primary path: attempt to
generate a Manrope Extra Bold `typeface.json` (via `facetype.js`-equivalent
conversion) and commit it as a static asset — a one-time conversion, not a
runtime dependency.

**Fallback (per user decision):** if that conversion isn't achievable
precisely in this environment, hand-author the wordmark's letterforms as SVG
path data (matching the real logo's proportions — measured from
`public/images/pasti-logo.png`, same approach already used for the accent-dot
geometry work earlier in this project) and extrude that path data directly
via `THREE.ExtrudeGeometry`, bypassing `TextGeometry`/`FontLoader` entirely.
This keeps the 3D fully genuine (real extruded geometry, not a CSS fake)
regardless of which path is used — implementation decides between the two
based on how the typeface-json attempt goes, and the report at the end states
which one was actually used and why.

## Verification plan

So "no error to fix, ready for client approval" is a real claim, not an
assertion:

- `npm run dev`, hard refresh, visually confirm all 6 phases play in order at
  desktop width with a fine pointer.
- Resize/mobile-width + touch-emulation check: confirm the CSS fallback path
  triggers (no WebGL canvas mounted) and still completes a full, coherent
  sequence.
- `prefers-reduced-motion: reduce` emulation: confirm instant cross-fade,
  no motion.
- Browser console: zero errors/warnings across all three modes above.
- `npm run build`: confirm production build succeeds (catches type errors,
  missing asset paths, SSR/hydration issues the dev server may mask).
- Repeat-visit / internal navigation: confirm the intro does NOT re-trigger
  on client-side route changes (matches current behavior — mount-once,
  `useIntroReady` is a module-level ref).
- Screenshot each phase and the Hero handoff frame for the final report.
