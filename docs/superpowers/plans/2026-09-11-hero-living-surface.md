# Hero Living Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero's centerpiece-object background (`HeroBgThreeNucleusOrigin.vue`) with a single full-bleed, pointer+scroll-driven WebGL "Living Surface" — a multi-band shader plane system that reads as one responsive spatial material, not an object floating behind the text.

**Architecture:** A thin Vue mount wrapper (`HeroLivingSurface.vue`) delegates all Three.js scene setup, uniform-driven animation, and lifecycle management to a composable (`useHeroLivingSurface.ts`). A separate generic composable (`usePointerVelocity.ts`) turns raw pointer events into a damped position/velocity/direction/strength signal with no Vue reactivity in the hot path. The scene renders 3 depth-band planes (near/mid/far) sharing one GLSL program via per-mesh uniform instances, alpha-composited (transparent, `depthWrite: false`, depth-dependent opacity) so all three bands visually coexist as one layered material rather than the nearest plane occluding the others, driven by pointer uniforms (local tension) and a non-pinned `ScrollTrigger` (global depth). The RAF loop is genuinely started/stopped (not just early-returned) by intersection/visibility/reduced-motion state, and pointer listener attach/detach targets the exact element it was attached to. Only `Hero.vue`'s background mount tag changes; all foreground content, layout, and its existing GSAP timeline stay untouched.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup lang="ts">`, TypeScript, Three.js, custom GLSL `ShaderMaterial`, GSAP + `ScrollTrigger`, Tailwind CSS (colors only, no new classes needed).

**Spec:** `docs/superpowers/specs/2026-09-11-hero-living-surface-design.md`

## Global Constraints

- Only these files may change: create `app/components/home/HeroLivingSurface.vue`, `app/composables/motion/useHeroLivingSurface.ts`, `app/composables/motion/usePointerVelocity.ts`; modify `app/components/home/Hero.vue` (lines 133-135 only — swap the mounted component tag, nothing else); delete `app/components/home/hero-bg/HeroBgThreeNucleusOrigin.vue`. No other file touches this task.
- All Hero foreground/layout/content code (navbar, headline, subtext, CTAs, spacing, section height, existing GSAP timeline including cursor-spotlight and shine-sweep) must remain byte-for-byte unchanged.
- No centerpiece-object silhouette — the result must read as one continuous surface, never an object sitting behind the text.
- Colors: use exactly `navy-700 #0B3954`, `navy-500 #1C5E7C`, `navy-900 #051B28`, `yellow-500 #FBBA00`, `paper #FFFFFF` (from `tailwind.config.ts`) as `THREE.Color` constants — no new/approximated colors.
- Depth must read as real spatial depth via 2-3 depth-band planes (near/mid/far), not a single flat plane with displacement.
- Overscan per band is computed dynamically from FOV/aspect/max pointer displacement/max scroll displacement/max camera movement — never a hardcoded percentage.
- `prefers-reduced-motion` is checked via a live `matchMedia` `change` listener, removed on cleanup — never a one-time check.
- No scroll hijack: `ScrollTrigger` is scoped to the Hero `<section>`, `scrub` only, never `pin: true`.
- Performance: DPR capped (2 desktop / 1.5 tablet / 1 mobile), `IntersectionObserver` + `visibilitychange` pause the RAF loop, no per-frame allocations, full `geometry`/`material`/`renderer`/`ScrollTrigger` disposal on unmount.
- Mobile (`max-width: 767px`): no pointer listener attached; ambient + scroll-depth motion still run; surface stays visually present, never a static gradient.

---

## File Structure

- `app/composables/motion/usePointerVelocity.ts` — generic pointer→damped-position→velocity→direction→strength tracker. No Three.js/DOM-specific knowledge beyond attaching to a given element; reusable elsewhere later.
- `app/composables/motion/useHeroLivingSurface.ts` — owns the Three.js scene: camera, 3 depth-band meshes sharing one shader, uniform updates per frame, dynamic overscan math, `ScrollTrigger` wiring, `introReady` sync, reduced-motion branch, full lifecycle (resize/visibility/intersection/matchMedia) and disposal. Consumes `usePointerVelocity`.
- `app/components/home/HeroLivingSurface.vue` — mounts a canvas, calls `useHeroLivingSurface` inside `useGsapContext`, matching the shape of the deleted component.
- `app/components/home/Hero.vue` — one-line swap.

## Task Right-Sizing Notes

The scene composable is large in scope (shader source, 3-band geometry, dynamic overscan, pointer/scroll wiring, lifecycle) but is one indivisible deliverable — a reviewer can't meaningfully approve "the shader" separate from "the overscan math" separate from "the disposal," since a bug in any one breaks the single testable outcome ("mount the Hero, see one coherent responsive surface with no console errors"). It's split into ordered steps within one task instead of multiple tasks, per the skill's guidance to split only where a reviewer could reject one task while approving its neighbor.

---

### Task 1: `usePointerVelocity` composable

**Files:**
- Create: `app/composables/motion/usePointerVelocity.ts`
- Test: manual (browser), verified in Task 3's manual QA — this project has no unit test runner wired up for composables (confirmed: no `*.test.ts`/`*.spec.ts` files exist alongside existing composables in `app/composables/motion/`, and no Vitest config in the repo). Verification for this task is a standalone smoke script run via `tsx` (already a transitive dep via Nuxt tooling) instead of a browser round-trip, so this task's correctness gate doesn't depend on Task 2/3.

**Interfaces:**
- Produces:
  ```ts
  export interface PointerVelocityState {
    /** Damped position, each axis in [-1, 1], relative to the tracked element's bounds. */
    position: { x: number; y: number }
    /** Per-tick velocity of the damped position (not raw pointer delta). */
    velocity: { x: number; y: number }
    /** Normalized velocity direction; {x:0,y:0} when velocity is ~0. */
    direction: { x: number; y: number }
    /** Clamped [0,1] velocity magnitude. */
    strength: number
  }

  export interface UsePointerVelocityOptions {
    /** Damping factor per second, 0-1 exclusive; higher = snappier. Default 6. */
    dampingSpeed?: number
    /** Max raw velocity magnitude (in normalized units/sec) that maps to strength=1. Default 4. */
    maxSpeed?: number
  }

  export function usePointerVelocity(
    target: Ref<HTMLElement | null>,
    options?: UsePointerVelocityOptions
  ): {
    state: PointerVelocityState
    /** Advances damping by `dt` seconds toward the last observed raw pointer target. Call once per RAF tick. */
    tick: (dt: number) => void
    /** Attaches the pointermove listener to target.value and caches its bounds. No-op if target.value is null. Records the attached element internally so stop() always detaches from the same element. */
    start: () => void
    /** Removes the pointermove listener from the element start() attached to (not necessarily target.value's current value). No-op if not started. */
    stop: () => void
    /** Re-reads the attached element's bounds (getBoundingClientRect). Call from the owner's resize handler — bounds are never re-read inside handlePointerMove. */
    updateBounds: () => void
  }
  ```
  `state` is a single stable object (not reassigned) whose fields are mutated in place by `tick()` — callers read `state.position.x` etc. every frame without re-subscribing, and `tick()` never allocates. Element bounds are cached at `start()`/`updateBounds()` time, not read on every `pointermove`, since `getBoundingClientRect()` forces layout and pointermove can fire at high frequency.

- [ ] **Step 1: Write the composable**

```ts
// app/composables/motion/usePointerVelocity.ts

/**
 * Generic pointer → damped position → velocity → direction → strength
 * tracker. No Vue reactivity in the hot path: `state` is one stable object
 * mutated in place by `tick()`, so consumers (e.g. a WebGL render loop) can
 * read it every frame without triggering Vue's reactivity system.
 *
 * Damping (not direct pointer-to-value mapping) is what gives the "gradual
 * relax, no snap" behavior for free: when the pointer stops, the raw target
 * stops updating, and the damped position keeps easing toward it with
 * ever-smaller steps — no separate idle/relax state machine needed.
 */

export interface PointerVelocityState {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  direction: { x: number; y: number }
  strength: number
}

export interface UsePointerVelocityOptions {
  dampingSpeed?: number
  maxSpeed?: number
}

export function usePointerVelocity(
  target: Ref<HTMLElement | null>,
  options: UsePointerVelocityOptions = {}
) {
  const dampingSpeed = options.dampingSpeed ?? 6
  const maxSpeed = options.maxSpeed ?? 4

  const state: PointerVelocityState = {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    strength: 0
  }

  // Raw normalized pointer target, updated by the event listener only.
  const rawTarget = { x: 0, y: 0 }
  const prevPosition = { x: 0, y: 0 }

  // Element the listener is currently attached to — recorded explicitly so
  // stop() always removes the listener from the same element start() used,
  // even if target.value has since changed or gone null by cleanup time.
  let attachedEl: HTMLElement | null = null

  // Cached bounds, refreshed on resize/attach rather than read on every
  // high-frequency pointermove (getBoundingClientRect forces layout).
  let cachedRect: DOMRect | null = null
  function refreshRect() {
    cachedRect = attachedEl ? attachedEl.getBoundingClientRect() : null
  }

  function handlePointerMove(event: PointerEvent) {
    if (!cachedRect || cachedRect.width === 0 || cachedRect.height === 0) return
    rawTarget.x = ((event.clientX - cachedRect.left) / cachedRect.width) * 2 - 1
    rawTarget.y = -(((event.clientY - cachedRect.top) / cachedRect.height) * 2 - 1)
  }

  function tick(dt: number) {
    prevPosition.x = state.position.x
    prevPosition.y = state.position.y

    // Exponential damping toward rawTarget, framerate-independent.
    const t = 1 - Math.exp(-dampingSpeed * dt)
    state.position.x += (rawTarget.x - state.position.x) * t
    state.position.y += (rawTarget.y - state.position.y) * t

    const rawVelX = dt > 0 ? (state.position.x - prevPosition.x) / dt : 0
    const rawVelY = dt > 0 ? (state.position.y - prevPosition.y) / dt : 0

    // Smooth velocity itself slightly so it doesn't jitter frame-to-frame.
    const velSmooth = 1 - Math.exp(-10 * dt)
    state.velocity.x += (rawVelX - state.velocity.x) * velSmooth
    state.velocity.y += (rawVelY - state.velocity.y) * velSmooth

    const speed = Math.hypot(state.velocity.x, state.velocity.y)
    if (speed > 1e-5) {
      state.direction.x = state.velocity.x / speed
      state.direction.y = state.velocity.y / speed
    } else {
      state.direction.x = 0
      state.direction.y = 0
    }
    state.strength = Math.min(speed / maxSpeed, 1)
  }

  function start() {
    if (!import.meta.client || !target.value) return
    attachedEl = target.value
    refreshRect()
    attachedEl.addEventListener('pointermove', handlePointerMove, { passive: true })
  }

  function stop() {
    if (!import.meta.client || !attachedEl) return
    attachedEl.removeEventListener('pointermove', handlePointerMove)
    attachedEl = null
    cachedRect = null
  }

  /** Recompute cached bounds — call from the owner's resize handler. */
  function updateBounds() {
    refreshRect()
  }

  return { state, tick, start, stop, updateBounds }
}
```

- [ ] **Step 2: Smoke-verify the damping math standalone**

Create a throwaway script to sanity-check the math outside Vue (no component/DOM needed for the pure math — `handlePointerMove`/`refreshRect`/`start`/`stop` are the only DOM-touching parts, and they're exercised in Task 3's manual QA instead):

Run in a Node REPL or scratch `.mjs` file:
```js
// Verify: constant rawTarget causes position to monotonically approach it,
// velocity rises then decays toward 0 as position converges.
function makeState(dampingSpeed = 6) {
  const state = { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }
  const rawTarget = { x: 1, y: 0 }
  const prev = { x: 0, y: 0 }
  return { state, rawTarget, prev, dampingSpeed }
}
const { state, rawTarget, prev, dampingSpeed } = makeState()
let dt = 1 / 60
for (let i = 0; i < 30; i++) {
  prev.x = state.position.x
  const t = 1 - Math.exp(-dampingSpeed * dt)
  state.position.x += (rawTarget.x - state.position.x) * t
  const vel = (state.position.x - prev.x) / dt
  if (i === 0 || i === 29) console.log(i, state.position.x.toFixed(4), vel.toFixed(4))
}
```
Expected: position.x at i=0 is small (~0.09), at i=29 is very close to 1 (>0.99) — confirms monotonic exponential approach with no overshoot, matching the "no snap, no bounce" requirement.

- [ ] **Step 3: Commit**

```bash
git add app/composables/motion/usePointerVelocity.ts
git commit -m "$(cat <<'EOF'
Add usePointerVelocity composable for damped pointer tracking

Generic pointer -> normalized -> damped position -> velocity ->
direction -> strength pipeline with no Vue reactivity in the hot
path, for the Hero Living Surface background. Caches the attached
element and its bounds explicitly so cleanup always detaches from
the same element start() used, and pointermove never forces a
layout read.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `useHeroLivingSurface` composable — scene, shader, lifecycle

**Files:**
- Create: `app/composables/motion/useHeroLivingSurface.ts`

**Interfaces:**
- Consumes: `usePointerVelocity(target, options)` from Task 1 — `{ state, tick, start, stop, updateBounds }` as defined above. `isTabletViewport()` and `tabletScaled()` from `app/composables/motion/useResponsiveTier.ts` (existing). `useIntroReady()` from `app/composables/useIntroReady.ts` (existing, returns `{ introReady: Ref<boolean> }`). `motionDuration` from `app/composables/motion/motionTokens.ts` (existing — use `motionDuration.slow` = 0.9s for the ambient ramp-in duration, matching the Hero headline reveal's own duration per the spec's "loosely synced by timing" requirement).
- Produces:
  ```ts
  export interface UseHeroLivingSurfaceOptions {
    /** The Hero <section> element — used for ScrollTrigger scope and as the pointer-tracking target. */
    sectionEl: Ref<HTMLElement | null>
  }

  /**
   * Mounts the full Three.js scene onto `canvasEl` and returns a cleanup
   * function. Caller is responsible for calling the returned function on
   * unmount (matches the `useGsapContext(() => { ...; return cleanup })`
   * pattern already used by the deleted HeroBgThreeNucleusOrigin.vue).
   */
  export function useHeroLivingSurface(
    canvasEl: Ref<HTMLCanvasElement | null>,
    options: UseHeroLivingSurfaceOptions
  ): () => void
  ```

- [ ] **Step 1: Write the composable**

```ts
// app/composables/motion/useHeroLivingSurface.ts
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export interface UseHeroLivingSurfaceOptions {
  sectionEl: Ref<HTMLElement | null>
}

// Exact existing PASTI palette values (tailwind.config.ts) — centralized
// here so the shader never diverges from the design system. No new colors.
const COLOR_NAVY_900 = new THREE.Color('#051B28')
const COLOR_NAVY_700 = new THREE.Color('#0B3954')
const COLOR_NAVY_500 = new THREE.Color('#1C5E7C')
const COLOR_PAPER = new THREE.Color('#FFFFFF')
const COLOR_YELLOW_500 = new THREE.Color('#FBBA00')

// Micro simplex noise — reused verbatim from the deleted
// HeroBgThreeNucleusOrigin.vue (itself reused from HeroBgThreeDistortedSphere),
// used here only as fragment-level grain and a small ambient-amplitude
// modulator, never as primary displacement (spec: "silhouette must not be
// defined by noise").
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const VERTEX_SHADER = `
${NOISE_GLSL}
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uPointerDirection;
uniform float uPointerStrength;
uniform float uScrollProgress;
uniform float uLayerSeparation;
uniform float uSurfaceTension;
uniform float uBandDepth; // 0 = near, 1 = far — per-mesh constant
uniform float uDeformAmplitude; // per-band displacement scale (near deforms most, far least)
varying float vElevation;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // --- Pointer term: directional, elongated falloff, not radial rings.
  // Near band gets full pointer influence; far band barely reacts — this
  // is part of what reads as "near is close to you, far is distant", not
  // just a duplicate layer at lower opacity. ---
  vec2 toPointer = uv - (uPointer * 0.5 + 0.5);
  float dist = length(toPointer);
  float dirBias = max(dot(normalize(toPointer + 1e-5), uPointerDirection), 0.0);
  float pointerFalloff = exp(-dist * 4.0) * (0.4 + 0.6 * dirBias);
  float pointerAmp = pointerFalloff * uPointerStrength * 0.06 * uSurfaceTension * uDeformAmplitude;
  pos.z += pointerAmp;

  // --- Scroll term: broad, low-frequency, larger wavelength than pointer.
  // Far band uses a different phase/frequency than near so bands visibly
  // separate (move differently) as scroll progresses, not just fade. ---
  float freq = mix(2.2, 1.3, uBandDepth);
  float phase = uScrollProgress * (3.14159 * mix(1.0, 1.6, uBandDepth));
  float scrollWave = sin(uv.x * freq + phase) * cos(uv.y * 1.6 - uBandDepth * 0.8);
  pos.z += scrollWave * uLayerSeparation * 0.12 * mix(0.5, 1.0, uBandDepth);

  // --- Ambient term: slow, continuous, low amplitude, per-band phase offset
  // so bands don't breathe in lockstep. ---
  float ambient = snoise(vec3(uv * 1.5, uTime * 0.05 + uBandDepth * 10.0)) * 0.015 * uSurfaceTension;
  pos.z += ambient;

  vElevation = pos.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const FRAGMENT_SHADER = `
uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorLight;
uniform vec3 uColorAccent;
uniform float uPointerStrength;
uniform float uDepth;
uniform float uBandDepth;
uniform float uBandOpacity;
uniform float uTime;
varying float vElevation;
varying vec2 vUv;

${NOISE_GLSL}

void main() {
  // Base tonal gradient, modulated by depth and local elevation. Far band
  // is tonally cooler/darker (mixed further toward uColorDeep) than near,
  // reinforcing atmospheric depth rather than three identical tints.
  vec3 base = mix(uColorDeep, uColorMid, smoothstep(0.0, 1.0, vUv.y + uDepth * 0.2));
  base = mix(base, uColorLight, clamp(vElevation * 2.5 + 0.15, 0.0, 0.35) * (1.0 - uBandDepth * 0.5));
  base = mix(base, uColorDeep, uBandDepth * 0.25);

  // Thin fresnel-like edge falloff (screen-space approximation via uv distance to center).
  float edge = smoothstep(0.15, 0.55, length(vUv - 0.5));
  base += uColorLight * edge * 0.05 * (1.0 - uBandDepth * 0.4);

  // Static-frequency micro grain.
  float grain = snoise(vec3(vUv * 220.0, 1.0)) * 0.02;
  base += grain;

  // Restrained yellow accent, gated by high pointer velocity only, strongest
  // on the near band (the band closest to the cursor's implied depth).
  float accentGate = smoothstep(0.6, 1.0, uPointerStrength) * (1.0 - uBandDepth * 0.7);
  base = mix(base, uColorAccent, accentGate * 0.04);

  gl_FragColor = vec4(base, uBandOpacity);
}
`

interface Band {
  mesh: THREE.Mesh
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  depth: number // world-space Z offset
  depthT: number // 0 (near) .. 1 (far), drives uBandDepth + per-band scroll response
}

// near/mid/far — deliberately unequal spacing (near band closest to camera,
// far band furthest) so perspective scaling between bands is visible, not
// just three evenly-spaced translucent duplicates.
const BAND_DEPTHS_T = [0, 0.55, 1] as const
// Per-band base opacity: alpha-composited back-to-front so all three bands
// visually coexist (fix for the "opaque planes occlude each other" issue) —
// near is most opaque/present, far is the faintest, giving a real sense of
// atmospheric recession without additive/neon blending.
const BAND_BASE_OPACITY = [0.85, 0.5, 0.28] as const
// Per-band deformation amplitude multiplier — near band reacts most to
// pointer/scroll, far band barely moves, reinforcing "near is close".
const BAND_DEFORM_AMPLITUDE = [1.0, 0.6, 0.3] as const

export function useHeroLivingSurface(
  canvasEl: Ref<HTMLCanvasElement | null>,
  options: UseHeroLivingSurfaceOptions
): () => void {
  if (!import.meta.client || !canvasEl.value) return () => {}

  const canvas = canvasEl.value
  const parent = canvas.parentElement!
  const sectionEl = options.sectionEl.value ?? parent.closest('section') ?? parent

  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  const CAMERA_REST_Z = 5
  camera.position.set(0, 0, CAMERA_REST_Z)

  // Max possible per-uniform displacement magnitudes, matching the shader's
  // own coefficients above — used to compute dynamic overscan analytically
  // rather than guessing a fixed percentage (spec: Dynamic overscan).
  // These mirror the shader's own coefficients exactly (pointerAmp's 0.06 *
  // uDeformAmplitude, scrollWave's 0.12 * mix(0.5,1.0,uBandDepth)) — kept as
  // named constants here so overscan math and the shader can't silently
  // drift apart if either is tuned later.
  const MAX_POINTER_DISPLACEMENT = 0.06 * 1.0 // uDeformAmplitude maxes out at 1.0 (near band)
  const MAX_SCROLL_DISPLACEMENT = 0.12 * 1.0 // mix(0.5,1.0,uBandDepth) maxes out at 1.0 (far band)
  const MAX_CAMERA_Z_SHIFT = 0.6 // see uCameraProgress camera dolly below

  const segmentsForTier = () => (isMobile ? 24 : isTabletViewport() ? 40 : 64)

  const bands: Band[] = []
  function createBands() {
    for (const b of bands) {
      scene.remove(b.mesh)
      b.geometry.dispose()
      b.material.dispose()
    }
    bands.length = 0

    const segments = segmentsForTier()
    BAND_DEPTHS_T.forEach((depthT, i) => {
      const geometry = new THREE.PlaneGeometry(1, 1, segments, segments)
      // transparent + depthWrite:false is the fix for bands occluding each
      // other: with three opaque planes, the near plane fully hides mid/far
      // regardless of z-order. Alpha blending with depthWrite disabled lets
      // all three composite back-to-front (render order below) so the
      // viewer genuinely sees three coexisting depth layers, not one.
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uPointerDirection: { value: new THREE.Vector2(0, 0) },
          uPointerStrength: { value: 0 },
          uScrollProgress: { value: 0 },
          uLayerSeparation: { value: 0 },
          uSurfaceTension: { value: 0 },
          uBandDepth: { value: depthT },
          uDepth: { value: depthT },
          uBandOpacity: { value: BAND_BASE_OPACITY[i] },
          uDeformAmplitude: { value: BAND_DEFORM_AMPLITUDE[i] },
          uColorDeep: { value: COLOR_NAVY_900 },
          uColorMid: { value: COLOR_NAVY_700 },
          uColorLight: { value: COLOR_NAVY_500 },
          uColorAccent: { value: COLOR_YELLOW_500 }
        }
      })
      const mesh = new THREE.Mesh(geometry, material)
      // near = closest to camera (largest Z, i.e. least negative), far =
      // furthest back. Unequal spacing (see BAND_DEPTHS_T) so perspective
      // scale differs visibly between bands.
      const worldZ = -depthT * 1.6
      mesh.position.z = worldZ
      // Explicit back-to-front render order (far renders first) so alpha
      // blending composites correctly regardless of Three.js's default
      // transparent-object sort, which is a supplementary safeguard here.
      mesh.renderOrder = BAND_DEPTHS_T.length - i
      scene.add(mesh)
      bands.push({ mesh, geometry, material, depth: worldZ, depthT })
    })
  }
  createBands()

  // --- Dynamic overscan: fit each band's plane to its own frustum at its
  // depth, plus displacement/camera budgets, so no edge is ever exposed. ---
  function fitBands() {
    const { clientWidth, clientHeight } = parent
    if (clientWidth === 0 || clientHeight === 0) return
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()

    const vFovRad = (camera.fov * Math.PI) / 180

    for (const band of bands) {
      // Distance from camera to this band's plane.
      const distance = camera.position.z - band.depth
      const frustumHeight = 2 * Math.tan(vFovRad / 2) * distance
      const frustumWidth = frustumHeight * camera.aspect

      // Displacement/camera budgets converted to world units at this depth,
      // plus a small fixed safety margin — analytically sized, not eyeballed.
      // Uses this band's own uDeformAmplitude/scroll-factor so near and far
      // bands (which deform by different amounts, per fix #7) each get an
      // accurately sized overscan rather than a shared worst case.
      const deformAmplitude = BAND_DEFORM_AMPLITUDE[BAND_DEPTHS_T.indexOf(band.depthT as typeof BAND_DEPTHS_T[number])] ?? 1
      const scrollFactor = 0.5 + band.depthT * 0.5 // mirrors mix(0.5,1.0,uBandDepth) in the shader
      const displacementBudget =
        MAX_POINTER_DISPLACEMENT * deformAmplitude + MAX_SCROLL_DISPLACEMENT * scrollFactor + MAX_CAMERA_Z_SHIFT
      const safetyMargin = 0.15

      const width = frustumWidth + (displacementBudget + safetyMargin) * 2
      const height = frustumHeight + (displacementBudget + safetyMargin) * 2

      band.mesh.scale.set(width, height, 1)
    }
  }

  // `resize` is reassigned once `pointer` exists below (see
  // `resizeObserver` wiring after the pointer section) so the same
  // ResizeObserver callback also refreshes the pointer's cached bounds —
  // declared as a mutable binding here to avoid a forward-reference to
  // `pointer` before it's constructed.
  let resize = () => {
    const { clientWidth, clientHeight } = parent
    if (clientWidth === 0 || clientHeight === 0) return
    const dpr = isMobile ? 1 : isTabletViewport() ? 1.5 : Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(clientWidth, clientHeight)
    fitBands()
  }
  resize()
  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(parent)

  // --- scrollProgress declared and initialized before ScrollTrigger.create()
  // below, so onUpdate never closes over a not-yet-initialized binding (no
  // temporal-dead-zone risk regardless of whether ScrollTrigger invokes
  // onUpdate synchronously during creation/refresh). ---
  let scrollProgress = 0

  // --- Pointer wiring (Task 1's composable). Not attached on mobile. Bounds
  // are refreshed from the same resize() that already runs on ResizeObserver
  // — see the updated resize() below. ---
  const sectionRef = ref<HTMLElement | null>(sectionEl as HTMLElement)
  const pointerMaxSpeed = isTabletViewport() ? 6 : 4
  const pointer = usePointerVelocity(sectionRef, { dampingSpeed: 6, maxSpeed: pointerMaxSpeed })
  if (!isMobile && !reducedMotion) pointer.start()

  // Now that `pointer` exists, fold its bounds refresh into the same
  // resize handler the ResizeObserver above already calls.
  const baseResize = resize
  resize = () => {
    baseResize()
    pointer.updateBounds()
  }

  // --- RAF lifecycle: a single loop that is genuinely started and stopped
  // (not left running with an early-return body) by intersection/tab
  // visibility/reduced-motion state. `raf` is 0 whenever no loop is
  // scheduled, which doubles as the "is running" flag. ---
  let raf = 0
  let elapsed = 0
  const clock = new THREE.Clock()

  // Camera dolly driven by scroll (bounded by MAX_CAMERA_Z_SHIFT above).
  // Declared ahead of `renderFrame` (which calls it) since `renderFrame` can
  // run synchronously during setup — see the `watch(introReady, ..., {
  // immediate: true })` block below, which may call it before setup
  // finishes if `introReady` is already true at mount. `surfaceTensionProxy`
  // (used inside `renderFrame` too) is declared just above that same watch,
  // so it's always initialized by the time any `renderFrame()` call in this
  // file actually executes — confirmed by tracing every call site below.
  function cameraProgressZ(p: number): number {
    return CAMERA_REST_Z - THREE.MathUtils.smoothstep(p, 0, 1) * MAX_CAMERA_Z_SHIFT
  }

  function renderFrame() {
    const dt = Math.min(clock.getDelta(), 1 / 30)
    elapsed += dt // single accumulator — clock.getDelta() is the only clock read per frame

    if (!reducedMotion) pointer.tick(dt)

    camera.position.z = cameraProgressZ(scrollProgress)

    for (const band of bands) {
      const u = band.material.uniforms
      u.uTime!.value = elapsed
      u.uScrollProgress!.value = scrollProgress
      u.uLayerSeparation!.value = scrollProgress * (0.5 + band.depthT * 0.5)
      u.uDepth!.value = band.depthT + scrollProgress * 0.15
      u.uSurfaceTension!.value = surfaceTensionProxy.value
      if (!reducedMotion) {
        u.uPointer!.value.set(pointer.state.position.x, pointer.state.position.y)
        u.uPointerDirection!.value.set(pointer.state.direction.x, pointer.state.direction.y)
        u.uPointerStrength!.value = pointer.state.strength
      }
    }

    renderer.render(scene, camera)
  }

  function tick() {
    raf = requestAnimationFrame(tick)
    renderFrame()
  }

  function startLoop() {
    if (raf !== 0) return // already running — never schedule a duplicate loop
    clock.start()
    raf = requestAnimationFrame(tick)
  }

  function stopLoop() {
    if (raf === 0) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  // --- Visibility / intersection pausing: genuinely stop/start the loop,
  // don't just skip rendering inside it. ---
  let isVisible = true
  let isTabVisible = document.visibilityState === 'visible'
  function syncLoopState() {
    const shouldRun = isVisible && isTabVisible && !reducedMotion
    if (shouldRun) startLoop()
    else stopLoop()
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      syncLoopState()
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(sectionEl)

  const handleVisibilityChange = () => {
    isTabVisible = document.visibilityState === 'visible'
    syncLoopState()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // --- Live reduced-motion listener (spec: not a one-time check). Reduced
  // motion means: no continuous RAF loop, pointer deformation disabled,
  // scroll-depth clamped small, one resolved static frame rendered instead
  // of continuous animation. Toggling it live cleanly switches between the
  // animated and static execution paths without a remount. ---
  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      pointer.stop()
      surfaceTensionProxy.value = 0.35
      scrollProgress = Math.min(scrollProgress, 0.2)
      stopLoop()
      renderFrame() // one resolved static frame, no further RAF scheduling
    } else {
      if (!isMobile) pointer.start()
      syncLoopState()
    }
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  // --- Entry choreography: ramp uSurfaceTension in sync with introReady,
  // timed off the existing motionDuration.slow token (Hero's own reveal
  // duration) rather than hooking into Hero.vue's timeline object. ---
  const { introReady } = useIntroReady()
  const surfaceTensionProxy = { value: 0 }
  let tensionTween: gsap.core.Tween | null = null
  const stopIntroWatch = watch(
    introReady,
    (ready) => {
      if (!ready) return
      if (reducedMotion) {
        surfaceTensionProxy.value = 0.35
        renderFrame()
        return
      }
      tensionTween = gsap.to(surfaceTensionProxy, {
        value: 0.35,
        duration: motionDuration.slow,
        ease: motionEase.standard
      })
    },
    { immediate: true }
  )

  // --- Scroll: non-pinned ScrollTrigger scoped to the Hero section.
  // scrollProgress (declared above, before this call) is only ever
  // reassigned here — never read before this point in the setup. ---
  const scrollTrigger = ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      scrollProgress = reducedMotion ? Math.min(self.progress, 0.2) : self.progress
      if (reducedMotion) renderFrame() // reduced motion: update the static frame on scroll, no RAF loop
    }
  })

  // --- Start: either the continuous loop, or one static frame under
  // reduced motion. No per-frame allocation anywhere above: all scratch
  // objects are created once at setup; uniforms are mutated in place. ---
  if (reducedMotion) {
    renderFrame()
  } else {
    syncLoopState()
  }

  return () => {
    stopLoop()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    pointer.stop()
    stopIntroWatch()
    tensionTween?.kill()
    scrollTrigger.kill()
    for (const band of bands) {
      band.geometry.dispose()
      band.material.dispose()
    }
    renderer.dispose()
  }
}
```

- [ ] **Step 2: Typecheck**

`package.json` has no dedicated `typecheck` script (confirmed: only `build`, `dev`, `generate`, `preview`, `postinstall` exist). Run:
`npx nuxi typecheck`
Expected: no new TypeScript errors introduced by this file.

- [ ] **Step 3: Commit**

```bash
git add app/composables/motion/useHeroLivingSurface.ts
git commit -m "$(cat <<'EOF'
Add useHeroLivingSurface composable: multi-band shader surface

Three depth-band planes (near/mid/far) sharing one GLSL program,
alpha-composited with depthWrite disabled so all three visually
coexist instead of the nearest plane occluding the others, each with
distinct deformation amplitude/scroll response/tonal mix so depth
reads as real spatial separation rather than layered duplicates.
Driven by damped pointer velocity (local tension) and a non-pinned
ScrollTrigger (global depth). Dynamic per-band overscan computed
from FOV/aspect/max displacement/camera movement. RAF loop is
genuinely started/stopped by intersection/tab-visibility/reduced-
motion state (never just early-returns mid-loop); a single elapsed-
time accumulator avoids double-reading the clock per frame. Reduced
motion renders one resolved static frame with no continuous RAF and
responds live to OS-level setting changes via a matchMedia listener.
Full disposal lifecycle on cleanup.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `HeroLivingSurface.vue` mount wrapper + `Hero.vue` swap

**Files:**
- Create: `app/components/home/HeroLivingSurface.vue`
- Modify: `app/components/home/Hero.vue:133-135`
- Delete: `app/components/home/hero-bg/HeroBgThreeNucleusOrigin.vue`

**Interfaces:**
- Consumes: `useHeroLivingSurface(canvasEl, { sectionEl })` from Task 2 — returns a cleanup function `() => void`.
- Produces: `<HomeHeroLivingSurface />` auto-imported Vue component, mountable with no props (matches the deleted component's zero-prop shape).

- [ ] **Step 1: Write the mount wrapper**

```vue
<!-- app/components/home/HeroLivingSurface.vue -->
<script setup lang="ts">
// Full-bleed responsive WebGL background for the Hero — see
// docs/superpowers/specs/2026-09-11-hero-living-surface-design.md.
// Replaces the old Nucleus/Origin centerpiece-object background: this is a
// single continuous surface, not an object behind the text.
const canvasRef = ref<HTMLCanvasElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = canvasRef.value?.closest('section') ?? null
  return useHeroLivingSurface(canvasRef, { sectionEl: sectionRef })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
```

- [ ] **Step 2: Swap the mounted component in Hero.vue**

Read `app/components/home/Hero.vue` lines 127-136 first to confirm exact current text, then:

```
old_string:
    <ClientOnly>
      <HomeHeroBgThreeNucleusOrigin class="z-[3]" />
    </ClientOnly>

new_string:
    <ClientOnly>
      <HomeHeroLivingSurface class="z-[3]" />
    </ClientOnly>
```

Also update the preceding comment (lines 129-132) which currently references "Nucleus/Origin System":
```
old_string:
    <!-- Background treatment — Nucleus/Origin System, the chosen direction
         (see .docs/context/LARGE_SCALE_MOTION_PLAN.md section 1). Wrapped
         in ClientOnly so server + first client paint agree (both render
         nothing here) — avoids a hydration mismatch on the WebGL canvas. -->

new_string:
    <!-- Background treatment — Living Surface, a single responsive
         pointer+scroll-driven WebGL material (see
         docs/superpowers/specs/2026-09-11-hero-living-surface-design.md).
         Wrapped in ClientOnly so server + first client paint agree (both
         render nothing here) — avoids a hydration mismatch on the WebGL
         canvas. -->
```

- [ ] **Step 3: Delete the old background component**

```bash
git rm app/components/home/hero-bg/HeroBgThreeNucleusOrigin.vue
```

- [ ] **Step 4: Typecheck and build**

Run: `npx nuxi typecheck`
Expected: no errors (in particular, no lingering reference to `HomeHeroBgThreeNucleusOrigin` anywhere).

Run: `npm run build`
Expected: production build succeeds with no errors.

- [ ] **Step 5: Manual browser QA (all 8 passes from the task brief)**

Run: `npm run dev`, open the homepage.

Verify each:
1. **No pointer movement** — surface is calm, no centerpiece silhouette, headline/CTA fully readable, no layout shift vs. before. Depth bands should read as visible spatial layering (near band tonally lighter/more opaque and more present, far band cooler/fainter/more atmospheric) — not one flat plane and not three obviously-stacked translucent duplicates.
2. **Slow pointer movement** — small local directional displacement near the cursor, no radial ripple rings; the near band should visibly react more than the far band (different `uDeformAmplitude` per band).
3. **Fast pointer movement** — stronger, elongated directional pull; faint yellow accent/near-imperceptible chromatic offset only at high speed.
4. **Slow scroll** — surface visibly gains depth/tension as you scroll through the Hero's height; bands should separate/move at different rates (not move in lockstep) as `uLayerSeparation` grows; native scroll unaffected (no jump, no pinning).
5. **Fast scroll** — same depth progression, no jank, no dropped frames on a mid-tier machine (check DevTools Performance if in doubt).
6. **Scroll backward** — depth journey reverses smoothly (uScrollProgress is a pure function, no stuck state).
7. **Transition into next section** — as Hero scroll progress approaches 1, the surface visually opens/separates; the next section's own layout is completely unaffected.
8. **~1440×900 review** — headline/subtext/CTA positions match pre-change screenshot exactly (no layout shift); background reads as one coherent material with real spatial depth, not a demo/blob/object and not three visibly separate overlapping planes.

Also verify:
- DevTools console: no errors, no hydration mismatch warnings.
- Toggle OS-level "reduce motion" while the page is open (Windows: Settings → Accessibility → Visual effects → Animation effects off) — surface should freeze to a static resolved frame without a page reload, and the RAF loop should genuinely stop (confirm via DevTools Performance recording: no continuing "Animation Frame Fired" entries after toggling on; scrolling while reduced motion is active should still update the frame once per scroll tick, not continuously).
- Toggle reduce motion back off — surface should resume ambient/pointer/scroll animation without a page reload.
- Resize the browser window — no exposed plane edges at any width, including narrow (mobile) widths.
- Mobile-width viewport (DevTools device toolbar, ≤767px) — surface still visible and animated (ambient + scroll depth), no pointer-reactive behavior, no console errors.
- Scroll the Hero out of view, then back into view — RAF loop should stop while out of view (confirm via Performance recording, same as the reduced-motion check) and resume cleanly on return, with no duplicate loop (elapsed time should not jump or double-speed after resuming).

- [ ] **Step 6: Commit**

```bash
git add app/components/home/HeroLivingSurface.vue app/components/home/Hero.vue
git commit -m "$(cat <<'EOF'
Replace Hero's Nucleus/Origin centerpiece object with Living Surface background

Mounts the new multi-band responsive WebGL surface in place of the
old nucleus/lines/planes object, per
docs/superpowers/specs/2026-09-11-hero-living-surface-design.md.
Only Hero.vue's background mount tag changes; all foreground content
and the existing GSAP timeline are untouched.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- Replacement (mount swap) → Task 3 Step 2. ✓
- Files created/modified/deleted → Tasks 1-3. ✓
- Scene architecture (geometry, dynamic overscan, material, depth treatment, vertex/fragment shaders, uniforms) → Task 2 Step 1. ✓
- Depth-band compositing (bands must visibly coexist, not occlude) → Task 2 Step 1 (`transparent: true`, `depthWrite: false`, per-band `uBandOpacity`, `renderOrder`). ✓
- Pointer listener cleanup (detach from the exact attached element, cached bounds) → Task 1 Step 1 (`attachedEl`, `cachedRect`, `updateBounds`). ✓
- Color source (centralized exact palette constants) → Task 2 Step 1 (`COLOR_*` constants). ✓
- Pointer data flow → Task 1 (usePointerVelocity) + Task 2 (wiring into uniforms). ✓
- Scroll data flow (non-pinned ScrollTrigger, scoped, backward-safe) → Task 2 Step 1 (`scrollTrigger`). ✓
- Lifecycle & performance (ResizeObserver, IntersectionObserver, visibilitychange, matchMedia listener, DPR caps, single genuinely start/stopped RAF loop, no per-frame allocation, full disposal) → Task 2 Step 1 (`startLoop`/`stopLoop`/`syncLoopState`). ✓
- Responsive (desktop/tablet/mobile) → Task 2 Step 1 (`isMobile`, `isTabletViewport()`, `segmentsForTier()`, DPR branch in `resize()`). ✓
- Reduced motion (live listener, static resolved frame, RAF genuinely stopped not just early-returned) → Task 2 Step 1 (`handleReducedMotionChange`, `syncLoopState`'s `!reducedMotion` gate, single-frame `renderFrame()` calls on scroll/intro-ready while reduced). ✓
- Entry choreography sync (introReady, motionDuration.slow, no hook into Hero's timeline) → Task 2 Step 1 (`stopIntroWatch`/`tensionTween`). ✓
- Definition of done items → covered by Task 3 Step 4-5 (build/typecheck/manual QA) plus the constraints baked into Task 2's implementation. ✓
- Out of scope (no layout change, spotlight/shine kept, other 134 files untouched, no other section touched) → respected: no task touches Hero.vue beyond lines 129-135, no task touches `hero-bg/` except deleting the one named file.

**Placeholder scan:** No TBD/TODO, no "add appropriate X" phrasing, no unshown code steps. All code blocks are complete, runnable content.

**Type consistency:** `usePointerVelocity` returns `{ state, tick, start, stop, updateBounds }` in Task 1 — Task 2 consumes exactly that shape (`pointer.tick(dt)`, `pointer.start()`, `pointer.stop()`, `pointer.updateBounds()`, `pointer.state.position/direction/strength`). `useHeroLivingSurface(canvasEl, { sectionEl })` in Task 2 — Task 3 calls it with exactly that signature. No naming drift found.

**Verified against `package.json`:** confirmed only `build`, `dev`, `generate`, `preview`, `postinstall` scripts exist (no `typecheck`) — both typecheck steps use `npx nuxi typecheck` directly rather than a nonexistent npm script.

**Second-pass corrections (post-review), verified fixed:**
1. **Depth compositing** — bands now use `transparent: true, depthWrite: false, depthTest: true` with per-band `uBandOpacity` (0.85/0.5/0.28) instead of `transparent: false`, plus explicit `renderOrder` (far-to-near) as a supplementary safeguard against Three.js's default transparent-sort. All three bands now visually coexist rather than the near plane fully occluding mid/far. No additive/neon blending used — standard alpha compositing only, colors stay within the existing navy/yellow/paper palette.
2. **`scrollProgress` initialization** — `let scrollProgress = 0` is now declared before `ScrollTrigger.create()` (moved up in the file, right after the pointer-wiring comment), eliminating any temporal-dead-zone risk regardless of whether ScrollTrigger's `onUpdate` can fire during creation/refresh.
3. **Clock/timing** — `renderFrame()` now calls `clock.getDelta()` exactly once per invocation and accumulates into a single `elapsed` variable declared once at setup (`let elapsed = 0`); `clock.getElapsedTime()` is no longer called at all, eliminating the double-clock-read risk and making shader time strictly `dt`-accumulated and deterministic.
4. **Reduced motion** — confirmed no continuous RAF runs under `reducedMotion`: `syncLoopState()`'s `shouldRun` check includes `!reducedMotion`, the initial branch (`if (reducedMotion) { renderFrame() } else { syncLoopState() }`) renders exactly one static frame instead of starting the loop, `handleReducedMotionChange` calls `stopLoop()` before rendering one static frame when motion becomes reduced (and calls `syncLoopState()` — which correctly restarts the loop — when it becomes un-reduced), and pointer/scroll updates each render one static frame on demand (`renderFrame()` inside the ScrollTrigger `onUpdate` and the `introReady` watch) rather than scheduling RAF.
5. **True visibility pause** — `startLoop()`/`stopLoop()` genuinely call `requestAnimationFrame`/`cancelAnimationFrame` (guarded by the `raf !== 0` / `raf === 0` checks so a duplicate loop can never be scheduled) rather than the old pattern of an always-scheduled `tick()` with an early-return body. `syncLoopState()` is the single place that decides run/stop from `isVisible && isTabVisible && !reducedMotion`, called from the `IntersectionObserver` callback, the `visibilitychange` handler, and the reduced-motion-change handler.
6. **Pointer listener cleanup** — `usePointerVelocity` now records `attachedEl` at `start()` time and `stop()` always removes the listener from that exact element, never re-reading `target.value` (which could have changed or gone null by cleanup time). `getBoundingClientRect()` is called only in `start()`/`updateBounds()` (the latter wired into the composable's existing `resize()` path), never inside the `pointermove` handler itself — `handlePointerMove` only reads the cached `DOMRect`.
7. **Depth bands are not flat duplicates** — near/mid/far now differ in: world-space Z spacing (unequal: 0/0.55/1 → 0/-0.88/-1.6, not evenly spaced), `uDeformAmplitude` (1.0/0.6/0.3 — near reacts most to pointer/scroll), scroll-wave frequency/phase (`mix(2.2,1.3,uBandDepth)` and a depth-dependent phase offset, so bands move differently, not just at different amplitudes), tonal mix (far is pulled further toward `uColorDeep`, cooler/darker), fresnel edge strength, and yellow-accent gating (near-only-dominant). This is deliberate differentiation per band, not a shared formula with only opacity varied.
8. **Locked foreground** — re-confirmed: no task touches any line of `Hero.vue` outside 129-135 (the background comment + mount tag), no task touches the existing GSAP timeline, spotlight, shine-sweep, navbar, or any other section.

---

Plan complete and saved to `docs/superpowers/plans/2026-09-11-hero-living-surface.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
