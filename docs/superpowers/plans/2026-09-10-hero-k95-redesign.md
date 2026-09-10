# Hero K95-Benchmarked Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Hero's centered layout + dev-picker/distorted-sphere background with a K95-benchmarked split-asymmetric Hero: existing headline/copy/CTA content preserved, a new custom-shader ribbon 3D scene as the primary visual identity (idle→active formation + micro-level damped pointer response), refined GSAP entry choreography, and the old spotlight/shine effects and 135-file background picker removed.

**Architecture:** `Hero.vue` owns layout + GSAP entry timeline (unchanged GSAP context/reduced-motion pattern already in the file). A new client-only mount wrapper `HeroRibbonScene.vue` hosts a `<canvas>` and delegates all Three.js setup/render-loop/disposal to `useHeroRibbonScene.ts`, which itself composes a new generic `usePointerDamping.ts` for the damped pointer vector. The ribbon's idle↔active interpolation is driven by a single exposed method the composable returns, called from `Hero.vue`'s GSAP timeline via `onUpdate`, so scene resolution and text reveal share one timeline (no cross-timeline drift).

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, GSAP 3.12 (`gsap.context`, `gsap.matchMedia`), Three.js 0.185 (`THREE.ShaderMaterial`, `THREE.TubeGeometry`, `THREE.CatmullRomCurve3`), Tailwind CSS. No test framework is present in this repo (no vitest/jest) — verification is manual: dev server + browser check (visual, console, Performance/Layout Shift where relevant) per the project's existing scope/verify/commit workflow.

**Spec:** `docs/superpowers/specs/2026-09-10-hero-k95-redesign-design.md`

## Global Constraints

- Only these files may change: `app/components/home/Hero.vue`, `app/components/home/HeroRibbonScene.vue` (new), `app/composables/motion/useHeroRibbonScene.ts` (new), `app/composables/motion/usePointerDamping.ts` (new), `app/components/home/hero-bg/**` (deleted). No nav, no other section, no route/global scroll/transition changes.
- Headline text stays exactly `"Technology. Creativity. Impact."`; subtext stays the existing copy; CTA labels stay exactly `"Explore our work"` and `"Tell us about it"`; CTA behaviors (`useSectionCurtain().playTo`, WhatsApp link) unchanged.
- No font-family change.
- Ribbon material: custom `THREE.ShaderMaterial` only — never `MeshPhysicalMaterial`/`MeshStandardMaterial`. No bloom/post-processing, no emissive/neon color, no HDR env reflections, no glossy specular. Palette restricted to the existing PASTI navy/paper tones (e.g. `#0B3954` navy family — no new brand colors, no yellow/accent unless it's the existing brand yellow used sparingly).
- No per-frame `BufferGeometry`/`Float32Array` allocation in the render loop — reuse buffers, write into `geometry.attributes.position.array` and set `needsUpdate = true`.
- Pointer-driven displacement must be clamped to a small max magnitude and must never visibly alter the ribbon's overall silhouette; it only starts after entry `formationProgress` reaches 1.
- `prefers-reduced-motion: reduce` → ribbon set directly to active formation (no tween), pointer damping and ambient idle motion disabled, single static render acceptable.
- Mobile (no fine pointer) → pointer damping layer never activated.
- `ClientOnly` mount, capped `devicePixelRatio` (max 2), `IntersectionObserver` pause off-screen, `visibilitychange` pause when tab hidden, full resource disposal on unmount, no duplicate GSAP timelines.
- No new npm dependencies — `three` and `gsap` are already installed (`three@^0.185.1`, `gsap@^3.12.7`).

---

## File Structure

- **Delete:** `app/components/home/hero-bg/` (135 files) — exploratory background components, no longer referenced after Task 2.
- **Modify:** `app/components/home/Hero.vue` — remove dev picker state/UI/all conditional `<Home...Bg...>` renders and the spotlight/shine refs+DOM+timeline steps; replace centered layout with split-asymmetric layout; mount `HeroRibbonScene.vue` in the right column; extend the GSAP timeline to drive ribbon formation via a label-synced callback.
- **Create:** `app/composables/motion/usePointerDamping.ts` — generic pointer-position damping composable (raw pointer → normalized → exponential lerp toward target), reusable beyond Hero.
- **Create:** `app/composables/motion/useHeroRibbonScene.ts` — Three.js scene/camera/renderer/ribbon-geometry/shader-material/render-loop/lifecycle, returns a small imperative API (`mount`, `setFormationProgress`, `dispose`) consumed by the mount wrapper.
- **Create:** `app/components/home/HeroRibbonScene.vue` — thin `<canvas>` mount wrapper: owns the `canvasRef`, calls `useHeroRibbonScene`, exposes `setFormationProgress` to its parent via `defineExpose` so `Hero.vue`'s timeline can drive it.

---

## Task 1: Delete the dev-only background picker and its 135 experimental components

**Files:**
- Delete: `app/components/home/hero-bg/` (all 135 files)
- Modify: `app/components/home/Hero.vue:126–368` (the `HeroBgOption` type, `bgGroups`, `activeBg`/`openGroup`/`isDev` state, the `onMounted` sessionStorage sync block) and `:371–547` (the `<ClientOnly>` block of ~135 conditional renders, the scrim div can stay for now, and the dev picker panel `<div v-if="isDev">...</div>`)

**Purpose:** Remove the exploratory comparison tooling now that a direction is committed, per spec's "Removed" and "Definition of done" sections. This must land first and cleanly so later tasks build the new scene into a simplified `Hero.vue` rather than fighting the picker's conditionals.

**Interfaces:**
- Consumes: nothing (pure deletion)
- Produces: a `Hero.vue` with no `activeBg`/`bgGroups`/picker markup, ready for Task 2+ to add the new layout/scene into. `useIntroReady`, `useSectionCurtain`, `useMagnetic`, `useCursorSpotlight`, `useWhatsapp` imports/usages at the top of the script remain untouched at this stage (cursor spotlight and shine are removed in Task 4, not here).

- [ ] **Step 1: Delete the hero-bg directory**

```bash
git rm -r app/components/home/hero-bg
```

- [ ] **Step 2: Remove the `HeroBgOption` type union and `bgGroups`/`BgOption`/`BgGroup` declarations from `Hero.vue`**

Open `app/components/home/Hero.vue` and delete the entire block from the `// Dev-only background switcher...` comment through the closing `]` of `bgGroups` (originally lines ~126–353).

- [ ] **Step 3: Remove the `activeBg`/`openGroup`/`isDev` state and the `onMounted` sessionStorage sync**

Delete this block (originally lines ~355–368):

```ts
const activeBg = ref<HeroBgOption>('3d-sphere')
const openGroup = ref<string>('3D')
const isDev = import.meta.dev

onMounted(() => {
  if (import.meta.dev) {
    const stored = sessionStorage.getItem('hero-bg-preview-v2')
    const allValues = bgGroups.flatMap((g) => g.options.map((o) => o.value))
    if (stored && allValues.includes(stored as HeroBgOption)) {
      activeBg.value = stored as HeroBgOption
    }
    watch(activeBg, (value) => sessionStorage.setItem('hero-bg-preview-v2', value))
  }
})
```

- [ ] **Step 4: Remove the `<ClientOnly>` block of conditional background renders from the template**

In the `<template>`, delete the entire `<ClientOnly>...</ClientOnly>` block (originally lines ~376–512) that lists all `<Home...Bg...>` components. Leave the scrim `<div aria-hidden="true" class="pointer-events-none absolute inset-0 z-[5] ...">` — it stays for now and will be repositioned/reused in Task 3.

- [ ] **Step 5: Remove the dev picker panel markup**

Delete the `<div v-if="isDev" class="fixed bottom-4 right-4 ...">...</div>` block (originally lines ~521–547) that rendered the group/option picker buttons.

- [ ] **Step 6: Verify the file still parses and the dev server boots**

Run: `npm run dev` (or the project's existing dev script — check `package.json` `scripts.dev` if unsure)
Expected: server starts with no TypeScript/Vue compile errors referencing `Hero.vue`. Visiting the homepage may look broken/incomplete at this point (no background, layout not yet updated) — that's expected, Task 3 fixes layout.

**Verification:**
- `git status` shows `app/components/home/hero-bg/` fully deleted and no dangling imports/usages of `HomeHeroBg*` component names remain in `Hero.vue` (`grep -n "HomeHeroBg" app/components/home/Hero.vue` returns nothing).
- Dev server compiles without errors.

**Regression check:**
- Confirm no other file in the repo imports from `hero-bg/` before deleting: `grep -rn "hero-bg" app/ --include=*.vue --include=*.ts` (excluding `Hero.vue` itself) should return nothing.
- Confirm the page still loads (even if visually incomplete) with no console errors about missing components.

- [ ] **Step 7: Commit**

```bash
git add -A app/components/home/hero-bg app/components/home/Hero.vue
git commit -m "Remove Hero dev background picker and 135 experimental backgrounds"
```

---

## Task 2: Build `usePointerDamping` — generic damped pointer composable

**Files:**
- Create: `app/composables/motion/usePointerDamping.ts`

**Purpose:** Provide a reusable, generic (not Hero-specific) composable that turns raw pointer movement into a normalized, exponentially-damped 2D vector — the spec's "pointer only gives life, never controls the object" requirement, isolated as its own unit so `useHeroRibbonScene.ts` can consume it without owning pointer-event wiring itself.

**Interfaces:**
- Consumes: nothing from other new files (only Vue reactivity + DOM APIs).
- Produces: `usePointerDamping(target: Ref<HTMLElement | null>, options?: { damping?: number }): { current: { x: number; y: number }; update: () => void; isActive: Ref<boolean> }` — `current` is a plain (non-reactive, mutated-in-place) object read once per frame by the render loop; `update()` advances the damped value one step and must be called once per rendered frame; `isActive` reflects whether a fine pointer is present (false on touch-only devices, matching `(pointer: fine)` media query — same convention `useMagnetic.ts` already uses).

- [ ] **Step 1: Create the composable file with the damping implementation**

```ts
import type { Ref } from 'vue'

interface PointerDampingOptions {
  /** 0–1 lerp factor applied per update() call; smaller = smoother/slower settle. */
  damping?: number
}

/**
 * Tracks pointer position over a target element as a normalized (-1..1 per
 * axis) vector, exponentially damped toward the latest raw position. Never
 * jumps straight to the raw position — callers get a smoothed value via
 * `current`, advanced one step per `update()` call (call once per rendered
 * frame from your own rAF loop). Inactive entirely on devices without a
 * fine pointer (touch), matching the convention in useMagnetic.ts.
 */
export function usePointerDamping(target: Ref<HTMLElement | null>, options: PointerDampingOptions = {}) {
  const { damping = 0.08 } = options

  const raw = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  const isActive = ref(false)

  if (!import.meta.client) {
    return { current, update: () => {}, isActive }
  }

  onMounted(() => {
    const el = target.value
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    isActive.value = true

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      raw.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      raw.y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    }

    const handleLeave = () => {
      raw.x = 0
      raw.y = 0
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)

    onBeforeUnmount(() => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
    })
  })

  function update() {
    current.x += (raw.x - current.x) * damping
    current.y += (raw.y - current.y) * damping
  }

  return { current, update, isActive }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx nuxi typecheck` (or `npm run typecheck` if defined in `package.json` — check first with `grep typecheck package.json`)
Expected: no new errors originating from `usePointerDamping.ts`.

**Verification:**
- File compiles with no TS errors.
- Manual smoke check deferred to Task 5 (once wired into the ribbon scene, moving the mouse over the Hero should produce smoothly-trailing, not instant, values — verified visually there).

**Regression check:**
- This is a new, unreferenced file at this point — no existing behavior can regress. Confirm `npm run dev` still boots clean (no import-cycle or syntax issues).

- [ ] **Step 3: Commit**

```bash
git add app/composables/motion/usePointerDamping.ts
git commit -m "Add usePointerDamping composable for damped pointer tracking"
```

---

## Task 3: Build `useHeroRibbonScene` — ribbon geometry, shader material, and render loop

**Files:**
- Create: `app/composables/motion/useHeroRibbonScene.ts`

**Purpose:** The core of the new visual identity: a single continuous ribbon (Catmull-Rom curve → tube geometry) that can interpolate between an `idle` and `active` control-point formation, rendered with a restrained custom `ShaderMaterial` (fresnel + subtle length gradient, no neon/glow), with pointer-driven micro-displacement layered on top only after the formation resolves. Isolated from Vue/DOM mounting concerns (those live in `HeroRibbonScene.vue`, Task 5) so the Three.js logic is independently readable and testable-by-inspection.

**Interfaces:**
- Consumes: `usePointerDamping` from `app/composables/motion/usePointerDamping.ts` (`{ current: { x: number; y: number }, update: () => void, isActive: Ref<boolean> }`).
- Produces: `useHeroRibbonScene(canvas: Ref<HTMLCanvasElement | null>, container: Ref<HTMLElement | null>): { setFormationProgress: (t: number) => void, pause: () => void, resume: () => void, dispose: () => void }` — consumed by `HeroRibbonScene.vue` (Task 5), which in turn exposes `setFormationProgress` to `Hero.vue`'s GSAP timeline (Task 6).

- [ ] **Step 1: Create the file with control-point data, curve builder, and buffer-reuse update function**

```ts
import * as THREE from 'three'
import type { Ref } from 'vue'
import { usePointerDamping } from './usePointerDamping'

const TUBE_SEGMENTS = 220
const RADIAL_SEGMENTS = 8
const TUBE_RADIUS = 0.045
const CONTROL_POINT_COUNT = 7

// Loose, dispersed resting formation — the ribbon before the Hero has
// resolved. Control points spread wide with irregular depth.
const IDLE_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(-1.6, 0.9, -0.4),
  new THREE.Vector3(-0.7, -0.6, 0.5),
  new THREE.Vector3(0.4, 1.1, -0.7),
  new THREE.Vector3(1.3, -0.3, 0.3),
  new THREE.Vector3(0.2, -1.0, -0.5),
  new THREE.Vector3(-1.0, 0.4, 0.6),
  new THREE.Vector3(1.6, 0.7, -0.2)
]

// Resolved, composed formation — a single controlled sweep with a clear,
// recognizable silhouette. This is what the entry timeline settles into.
const ACTIVE_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(-1.4, 0.6, 0),
  new THREE.Vector3(-0.7, 0.15, 0.15),
  new THREE.Vector3(0, -0.2, 0),
  new THREE.Vector3(0.7, 0.05, -0.15),
  new THREE.Vector3(1.1, 0.5, 0),
  new THREE.Vector3(0.6, 0.85, 0.1),
  new THREE.Vector3(-0.2, 0.6, -0.05)
]

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorEnd;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  // Cheap hash-based grain, sampled per-fragment — not a texture lookup.
  float grain(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 base = mix(uColor, uColorEnd, vUv.x);

    float fresnel = pow(1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0), 2.0);
    fresnel *= 0.22; // restrained — a thin rim, not a glow

    float n = (grain(vUv * 400.0) - 0.5) * 0.03;

    vec3 color = base + fresnel + n;
    gl_FragColor = vec4(color, 1.0);
  }
`

function buildCurve(points: THREE.Vector3[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4)
}

/** Linearly interpolates two same-length control-point arrays into `out` (reused, no allocation). */
function lerpControlPoints(idle: THREE.Vector3[], active: THREE.Vector3[], t: number, out: THREE.Vector3[]) {
  for (let i = 0; i < out.length; i++) {
    out[i].lerpVectors(idle[i], active[i], t)
  }
}

export function useHeroRibbonScene(canvas: Ref<HTMLCanvasElement | null>, container: Ref<HTMLElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let mesh: THREE.Mesh | undefined
  let geometry: THREE.TubeGeometry | undefined
  let material: THREE.ShaderMaterial | undefined
  let raf = 0
  let running = false
  let disposed = false

  const workingPoints: THREE.Vector3[] = Array.from({ length: CONTROL_POINT_COUNT }, () => new THREE.Vector3())
  const displacedPoints: THREE.Vector3[] = Array.from({ length: CONTROL_POINT_COUNT }, () => new THREE.Vector3())
  const scratchVec = new THREE.Vector3()

  let formationProgress = 0
  let clock: THREE.Clock | undefined

  const pointer = usePointerDamping(container, { damping: 0.06 })

  function resize() {
    if (!renderer || !camera || !container.value) return
    const { clientWidth: width, clientHeight: height } = container.value
    if (width === 0 || height === 0) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  /** Rewrites the existing tube geometry's position buffer in place — no new geometry/allocation per call. */
  function updateGeometryFromPoints(points: THREE.Vector3[]) {
    if (!geometry) return
    const curve = buildCurve(points)
    const freshGeometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false)
    const src = freshGeometry.attributes.position.array
    const dst = geometry.attributes.position.array as Float32Array
    dst.set(src)
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    freshGeometry.dispose()
  }

  function setFormationProgress(t: number) {
    formationProgress = THREE.MathUtils.clamp(t, 0, 1)
    lerpControlPoints(IDLE_POINTS, ACTIVE_POINTS, formationProgress, workingPoints)
    applyPointerDisplacement()
  }

  /** Applies clamped pointer-driven micro-displacement on top of the current formation. Only meaningful once formationProgress is 1 — earlier, the displacement magnitude is scaled down so it never masks the entry resolve. */
  function applyPointerDisplacement() {
    const maxDisplacement = 0.06 // small on purpose: life, not control
    const influence = formationProgress * maxDisplacement

    for (let i = 0; i < workingPoints.length; i++) {
      scratchVec.set(pointer.current.x, pointer.current.y, 0)
      scratchVec.multiplyScalar(influence * (0.4 + 0.6 * (i / (workingPoints.length - 1))))
      displacedPoints[i].copy(workingPoints[i]).add(scratchVec)
    }

    updateGeometryFromPoints(displacedPoints)
  }

  function animate() {
    if (!running || disposed) return
    raf = requestAnimationFrame(animate)

    pointer.update()

    const t = clock ? clock.getElapsedTime() : 0
    if (mesh) {
      // Slow ambient life — a long, low-amplitude breathing rotation, never a bounce.
      mesh.rotation.y = Math.sin(t * 0.12) * 0.08
      mesh.rotation.x = Math.cos(t * 0.09) * 0.04
    }

    if (formationProgress >= 1 && pointer.isActive.value) {
      applyPointerDisplacement()
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  function pause() {
    running = false
    cancelAnimationFrame(raf)
  }

  function resume() {
    if (running || disposed) return
    running = true
    if (!clock) clock = new THREE.Clock()
    raf = requestAnimationFrame(animate)
  }

  function setup() {
    if (!canvas.value || !container.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20)
    camera.position.set(0, 0, 4.2)

    lerpControlPoints(IDLE_POINTS, ACTIVE_POINTS, 0, workingPoints)
    displacedPoints.forEach((p, i) => p.copy(workingPoints[i]))

    const curve = buildCurve(displacedPoints)
    geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false)

    material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#0B3954') },
        uColorEnd: { value: new THREE.Color('#123A5C') }
      },
      vertexShader,
      fragmentShader
    })

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    resize()
    resume()
  }

  function dispose() {
    disposed = true
    pause()
    geometry?.dispose()
    material?.dispose()
    renderer?.dispose()
    scene = undefined
    camera = undefined
    mesh = undefined
    geometry = undefined
    material = undefined
    renderer = undefined
  }

  return { setup, setFormationProgress, resize, pause, resume, dispose }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx nuxi typecheck`
Expected: no new errors from `useHeroRibbonScene.ts`. If `THREE.CatmullRomCurve3`/`TubeGeometry` types complain about the tension argument, confirm against the installed `@types/three@^0.185.4` signature and adjust the call to match (types are the source of truth, not this plan).

**Verification:**
- File compiles with no TS errors.
- Full visual verification happens in Task 5 once mounted — this task is not independently renderable (no DOM to mount into yet), so verification here is compile-only plus a careful read-through confirming: no `new THREE.Vector3()` or `new Float32Array()` inside `animate()`/`applyPointerDisplacement()`'s hot path (the per-call `new THREE.TubeGeometry(...)` inside `updateGeometryFromPoints` is a known, accepted cost — flag in Task 5's verification whether it needs to move to a manual buffer-write approach if profiling shows jank; the spec requires *benchmarking*, not a premature micro-optimization guess).

**Regression check:**
- New, unreferenced file — nothing can regress yet. Confirm `npm run dev` still boots clean.

- [ ] **Step 3: Commit**

```bash
git add app/composables/motion/useHeroRibbonScene.ts
git commit -m "Add useHeroRibbonScene: ribbon geometry, shader material, render loop"
```

---

## Task 4: Build `HeroRibbonScene.vue` — mount wrapper with visibility/resize lifecycle

**Files:**
- Create: `app/components/home/HeroRibbonScene.vue`

**Purpose:** The DOM/lifecycle glue: owns the `<canvas>` and its sizing container, wires `IntersectionObserver` (pause off-screen) and `visibilitychange` (pause when tab hidden), a `ResizeObserver` for responsive canvas sizing, and exposes `setFormationProgress` so `Hero.vue` can drive the entry animation. This is the file `Hero.vue` actually imports — it is the only new file that touches the DOM directly for the scene.

**Interfaces:**
- Consumes: `useHeroRibbonScene` from `app/composables/motion/useHeroRibbonScene.ts` (`{ setup, setFormationProgress, resize, pause, resume, dispose }`).
- Produces: a component exposing (via `defineExpose`) `setFormationProgress(t: number): void`, consumed by `Hero.vue` (Task 6) through a template ref.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import { useHeroRibbonScene } from '~/composables/motion/useHeroRibbonScene'

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const scene = useHeroRibbonScene(canvasRef, containerRef)

let intersectionObserver: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined

function handleVisibilityChange() {
  if (document.hidden) {
    scene.pause()
  } else {
    scene.resume()
  }
}

onMounted(() => {
  scene.setup()

  if (containerRef.value) {
    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          scene.resume()
        } else {
          scene.pause()
        }
      },
      { threshold: 0 }
    )
    intersectionObserver.observe(containerRef.value)

    resizeObserver = new ResizeObserver(() => scene.resize())
    resizeObserver.observe(containerRef.value)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  scene.dispose()
})

defineExpose({
  setFormationProgress: (t: number) => scene.setFormationProgress(t)
})
</script>

<template>
  <div ref="containerRef" class="relative h-full w-full min-h-[320px]" aria-hidden="true">
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx nuxi typecheck`
Expected: no new errors from `HeroRibbonScene.vue`.

**Verification:**
- File compiles with no TS errors.
- Full render verification happens once mounted into `Hero.vue` (Task 5/6) — this component is not independently viewable before that.

**Regression check:**
- New, unreferenced file — nothing can regress yet. Confirm `npm run dev` still boots clean.

- [ ] **Step 3: Commit**

```bash
git add app/components/home/HeroRibbonScene.vue
git commit -m "Add HeroRibbonScene mount wrapper with visibility/resize lifecycle"
```

---

## Task 5: Wire the ribbon scene into `Hero.vue`'s layout (split-asymmetric composition)

**Files:**
- Modify: `app/components/home/Hero.vue` (template section, post-Task-1 state)

**Purpose:** Replace the now-empty centered layout (left over from Task 1's deletion) with the spec's split-asymmetric composition: left column for utility label + headline + subtext + CTA row (left-aligned, constrained width), right column hosting `<HomeHeroRibbonScene>` with reserved dimensions (no CLS) and generous surrounding negative space, plus a minimal scroll-cue element near the bottom of the Hero. This task focuses on layout/markup only — the entry timeline wiring to `setFormationProgress` happens in Task 6.

**Interfaces:**
- Consumes: `HeroRibbonScene.vue` (auto-imported by Nuxt as `<HomeHeroRibbonScene>` per the existing `Home*` naming convention already used for `HomeHeroBg*` components) — specifically its exposed `setFormationProgress` via a template ref, held for Task 6.
- Produces: a `Hero.vue` template with `heroSceneRef` (template ref to `<HomeHeroRibbonScene>`) available for Task 6's timeline code.

- [ ] **Step 1: Add a template ref for the scene component**

In the `<script setup>` block, alongside the other `ref<HTMLElement | null>` declarations, add:

```ts
const heroSceneRef = ref<InstanceType<typeof import('./HeroRibbonScene.vue').default> | null>(null)
```

- [ ] **Step 2: Replace the template's content wrapper with the split layout**

Replace the existing `<BaseContainer>...</BaseContainer>` block (the one wrapping `data-hero-content`) with:

```vue
    <BaseContainer>
      <div class="relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-8">
        <div data-hero-content class="flex max-w-xl flex-col items-start text-left">
          <span class="font-mono text-xs uppercase tracking-[0.2em] text-muted">PASTI — Studio</span>

          <div ref="headingWrapRef" class="relative mt-6 max-w-xl">
            <h1 ref="headingRef" class="font-extrabold leading-[1.04] tracking-tight text-display-lg md:text-display-xl">
              {{ headline }}
            </h1>
          </div>

          <p ref="subtextRef" class="mt-6 max-w-md text-body-lg text-muted">
            {{ subtext }}
          </p>

          <div ref="ctaRowRef" class="mt-8 flex flex-col items-start gap-4 sm:flex-row">
            <div ref="ctaPrimaryRef" class="inline-block">
              <a :href="ctaPrimary.to" class="btn-primary" @click.prevent="goToSelectedWork">
                {{ ctaPrimary.label }}
              </a>
            </div>
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="btn-outline">
              {{ ctaSecondary.label }}
            </a>
          </div>
        </div>

        <div class="relative aspect-square w-full max-w-[420px] justify-self-center md:justify-self-end">
          <ClientOnly>
            <HomeHeroRibbonScene ref="heroSceneRef" class="h-full w-full" />
          </ClientOnly>
        </div>
      </div>

      <div class="pointer-events-none absolute inset-x-0 bottom-8 z-10 hidden justify-center md:flex">
        <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-muted/70">Scroll</span>
      </div>
    </BaseContainer>
```

Note: `spotlightRef`/`shineRef` elements and the scrim `<div>` are intentionally left as-is here — they're removed in Task 6 along with their timeline steps, to keep this task's diff focused on layout only.

- [ ] **Step 3: Run the dev server and visually check the layout**

Run: `npm run dev`, open the homepage.
Expected: headline/subtext/CTA appear left-aligned in a constrained column; an empty (or blank-canvas) square area appears to the right at desktop widths; on narrow viewports the two stack vertically; no console errors about `HomeHeroRibbonScene` being unresolved.

**Verification:**
- Desktop viewport (≥768px): two-column grid visible, text left, scene area right, clear negative space around the scene box (it does not touch the column edges edge-to-edge because of the `max-w-[420px]` cap).
- Mobile viewport (<768px): single column, text above scene area, scroll cue hidden (per `hidden md:flex`).
- No layout shift when the canvas mounts (the `aspect-square` + `max-w` on the container reserves space before the `ClientOnly` content resolves).

**Regression check:**
- CTA click behavior unchanged: "Explore our work" still calls `goToSelectedWork()`/`playTo`; "Tell us about it" still links to `whatsappLink`.
- `useMagnetic(ctaPrimaryRef, ...)` still applies (the ref and its element structure are preserved).
- Headline text content and DOM structure needed by the existing `wrapWord` word-reveal logic in the timeline (Task 6 territory, but don't break it here) is untouched — `headingRef`/`headingWrapRef` still point at the same elements.

- [ ] **Step 4: Commit**

```bash
git add app/components/home/Hero.vue
git commit -m "Recompose Hero into split-asymmetric layout with ribbon scene mount"
```

---

## Task 6: Refine the GSAP entry timeline — remove spotlight/shine, sync ribbon formation

**Files:**
- Modify: `app/components/home/Hero.vue:18–124` (script: refs, `wrapWord`, `useGsapContext`/`watch(introReady, ...)` block) and the leftover `spotlightRef`/`shineRef` template elements + scrim positioning from Task 5

**Purpose:** Finish the spec's motion requirements: remove the yellow cursor-spotlight duplicate and diagonal shine-sweep entirely; keep and re-sequence the existing masked word-reveal for the headline; add a small utility-label reveal step before the headline; and drive `heroSceneRef`'s `setFormationProgress(0→1)` from the same timeline (via a GSAP `onUpdate` proxy object), so text and ribbon resolution read as one coordinated event as required by the spec.

**Interfaces:**
- Consumes: `heroSceneRef.value.setFormationProgress(t: number): void` (from Task 5's template ref, backed by Task 4's `defineExpose`).
- Produces: final `Hero.vue` state satisfying the spec's Motion and Removed sections.

- [ ] **Step 1: Remove `spotlightRef`/`shineRef` declarations and their `useCursorSpotlight` call**

Delete these lines from the script:

```ts
const spotlightRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)
```

and later:

```ts
useCursorSpotlight(headingWrapRef, spotlightRef, { radius: 110 })
```

If `useCursorSpotlight` is not used anywhere else in this file after removal, also remove its usage — but do not delete the composable file itself (out of scope; it may be used elsewhere in the codebase — confirm with `grep -rn "useCursorSpotlight" app/` before assuming it's Hero-only).

- [ ] **Step 2: Remove the `spotlightRef`/`shineRef` template elements**

In the template (inside the `headingWrapRef` div from Task 5), the two duplicate `<h1>` elements for spotlight and shine are not present in Task 5's new markup — confirm they were not re-added. If Task 5 was implemented exactly as written, this step is already satisfied; otherwise remove any leftover `<h1 ref="spotlightRef" ...>` / `<h1 ref="shineRef" ...>` blocks now.

- [ ] **Step 3: Rewrite the `useGsapContext` timeline block**

Replace the full `useGsapContext(() => { ... })` block with:

```ts
useGsapContext(() => {
  watch(
    introReady,
    (ready, _oldValue, onCleanup) => {
      if (!ready) return

      const mm = gsap.matchMedia()
      onCleanup(() => mm.revert())

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([subtextRef.value, ctaRowRef.value].filter(Boolean), { opacity: 1, y: 0 })
        heroSceneRef.value?.setFormationProgress(1)
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const heading = headingRef.value
        if (!heading) return

        const allHeadingWords: HTMLElement[] = []
        const headingText = heading.textContent ?? ''
        heading.textContent = ''
        for (const part of headingText.split(/(\s+)/).filter(Boolean)) {
          if (/^\s+$/.test(part)) {
            heading.appendChild(document.createTextNode(part))
            continue
          }
          const { outer, inner } = wrapWord(part)
          heading.appendChild(outer)
          allHeadingWords.push(inner)
        }
        if (subtextRef.value) {
          subtextRef.value.dataset.revealEl = ''
          subtextRef.value.dataset.revealKind = 'scroll'
        }
        if (ctaRowRef.value) {
          ctaRowRef.value.dataset.revealEl = ''
          ctaRowRef.value.dataset.revealKind = 'scroll'
        }

        gsap.set(allHeadingWords, { yPercent: 120 })
        if (subtextRef.value) gsap.set(subtextRef.value, { opacity: 0, y: 12 })
        if (ctaRowRef.value) gsap.set(ctaRowRef.value, { opacity: 0, y: 12 })
        if (utilityLabelRef.value) gsap.set(utilityLabelRef.value, { opacity: 0, y: 8 })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        const formationProxy = { t: 0 }

        if (utilityLabelRef.value) {
          tl.to(utilityLabelRef.value, { opacity: 1, y: 0, duration: 0.5 })
        }

        tl.addLabel('headlineStart', utilityLabelRef.value ? '-=0.2' : 0)
        tl.to(allHeadingWords, { yPercent: 0, duration: 0.9, stagger: 0.08 }, 'headlineStart')

        tl.addLabel('settleStart')
        if (subtextRef.value) tl.to(subtextRef.value, { opacity: 1, y: 0, duration: 0.6 }, 'settleStart+=0.1')
        if (ctaRowRef.value) tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: 0.6 }, 'settleStart+=0.2')

        // Ribbon resolves from idle to active in step with the text settling —
        // one coordinated event, not a separate animation.
        tl.to(
          formationProxy,
          {
            t: 1,
            duration: 1.1,
            ease: 'power2.inOut',
            onUpdate: () => heroSceneRef.value?.setFormationProgress(formationProxy.t)
          },
          'settleStart'
        )

        return () => tl.kill()
      })
    },
    { immediate: true }
  )
})
```

- [ ] **Step 4: Add the `utilityLabelRef` ref and wire it to the label added in Task 5's template**

In the script, add near the other refs:

```ts
const utilityLabelRef = ref<HTMLElement | null>(null)
```

In the template from Task 5, update the utility label span to bind this ref:

```vue
<span ref="utilityLabelRef" class="font-mono text-xs uppercase tracking-[0.2em] text-muted">PASTI — Studio</span>
```

- [ ] **Step 5: Remove the scrim div left over from Task 1, or confirm its z-index still makes sense**

The scrim (`<div aria-hidden="true" class="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(...)]" />`) was written for a full-bleed background that no longer exists post-split-layout. Since the ribbon scene is now confined to its own right-column box (not full-bleed), delete this scrim div entirely — it has no background left to soften.

- [ ] **Step 6: Run the dev server and visually verify the full sequence**

Run: `npm run dev`, open the homepage, reload with DevTools open (Console tab visible).
Expected: on load, utility label fades/slides in first, then headline words mask-reveal, then subtext/CTA settle in while the ribbon visibly resolves from its looser idle shape into its composed active shape over roughly the same ~1s window. No yellow spotlight or diagonal shine visible anywhere. No console errors.

**Verification:**
- `grep -n "spotlightRef\|shineRef\|useCursorSpotlight\|hero-shine\|cursor-spotlight" app/components/home/Hero.vue` returns nothing (confirms full removal).
- Visually: utility label → headline → subtext/CTA → ribbon resolve read as one coordinated sequence, not simultaneous/disconnected.
- Toggle OS-level "reduce motion" (or emulate via Chrome DevTools Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce"), reload: content appears immediately at final state, ribbon is static in its active formation (not looser/idle), no animation plays.

**Regression check:**
- `useMagnetic` on the CTA still works (hover/move near the primary CTA button).
- `useSectionCurtain().playTo` and the WhatsApp link both still fire correctly from their respective CTAs.
- No duplicate timelines fire on Hot Module Reload during dev (watch console for repeated GSAP warnings when saving this file again).

- [ ] **Step 7: Commit**

```bash
git add app/components/home/Hero.vue
git commit -m "Refine Hero entry timeline: remove spotlight/shine, sync ribbon formation"
```

---

## Task 7: Mobile/tablet pointer-damping clamp and reduced-segment fallback

**Files:**
- Modify: `app/composables/motion/useHeroRibbonScene.ts` (formation/displacement magnitude and segment count by viewport)

**Purpose:** Satisfy the spec's Responsive section precisely: tablet gets a smaller pointer-displacement clamp; mobile disables pointer damping entirely (already true by construction, since `usePointerDamping` only activates on `(pointer: fine)`) and may reduce tube segment count for perf, while keeping the ribbon visually present and recognizable — never collapsing to a flat/static image on mobile (ambient idle motion must still run).

**Interfaces:**
- Consumes: nothing new.
- Produces: no new exported API — internal tuning only, `useHeroRibbonScene`'s public shape (`setup`, `setFormationProgress`, `resize`, `pause`, `resume`, `dispose`) is unchanged, so Tasks 4–6 need no further edits.

- [ ] **Step 1: Add a viewport-tier helper and apply it to segment count and max displacement**

In `useHeroRibbonScene.ts`, replace the module-level constants and `applyPointerDisplacement`'s hardcoded `maxDisplacement` with viewport-aware values computed once in `setup()`:

```ts
function getViewportTier(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

const TUBE_SEGMENTS_BY_TIER: Record<ReturnType<typeof getViewportTier>, number> = {
  desktop: 220,
  tablet: 220,
  mobile: 140
}

const MAX_DISPLACEMENT_BY_TIER: Record<ReturnType<typeof getViewportTier>, number> = {
  desktop: 0.06,
  tablet: 0.03,
  mobile: 0 // no fine pointer on mobile — usePointerDamping.isActive is already false here, this is a defensive floor
}
```

Remove the top-level `const TUBE_SEGMENTS = 220` constant and instead compute `const tier = getViewportTier()` and `const tubeSegments = TUBE_SEGMENTS_BY_TIER[tier]` once inside `setup()`, threading `tubeSegments` into the `new THREE.TubeGeometry(curve, tubeSegments, TUBE_RADIUS, RADIAL_SEGMENTS, false)` call (both the initial one in `setup()` and the one inside `updateGeometryFromPoints`, which needs `tubeSegments` captured in its closure — move `updateGeometryFromPoints` to be defined inside `setup()`, or hoist `tubeSegments` to a module-scope-adjacent `let` set at the top of `setup()` before any function using it is called).

In `applyPointerDisplacement`, replace the hardcoded `const maxDisplacement = 0.06` with `const maxDisplacement = MAX_DISPLACEMENT_BY_TIER[tier]` (same closure consideration — `tier` must be accessible where `applyPointerDisplacement` is defined).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx nuxi typecheck`
Expected: no new errors.

- [ ] **Step 3: Manually verify at three widths**

Run: `npm run dev`, open the homepage in Chrome DevTools device toolbar.
Expected:
- At ≥1024px (desktop): ribbon responds to pointer with the full (0.06) clamp — move the mouse near the scene box, the ribbon should shift very slightly, never dramatically.
- At 768–1023px (tablet, use a touch-disabled emulated device so `pointer: fine` still matches, e.g. "Responsive" mode with a mouse): displacement is visibly smaller than desktop.
- At <768px (mobile, e.g. "iPhone 14"): no pointer displacement occurs (touch has no `pointermove` in the same way, and `pointer: fine` doesn't match on real touch devices); ribbon still visibly present with its slow ambient rotation running.

**Verification:**
- Segment count and displacement clamp visibly differ by tier per the manual check above.
- No console errors when resizing the window across breakpoints (triggers `ResizeObserver` → `scene.resize()`).

**Regression check:**
- Desktop behavior from Task 6 is unchanged (0.06 clamp, 220 segments — same values as before this task, just now expressed via the tier map instead of a hardcoded constant).
- `setFormationProgress` entry animation still plays correctly at all three tested widths (Task 6's timeline is untouched by this task).

- [ ] **Step 4: Commit**

```bash
git add app/composables/motion/useHeroRibbonScene.ts
git commit -m "Tune Hero ribbon segment count and pointer clamp per viewport tier"
```

---

## Task 8: Production build, console/leak audit, and final K95 comparison pass

**Files:** None modified — verification-only task. May produce follow-up fix commits to any of the files above if issues are found.

**Purpose:** The spec's "Mandatory reference check" and "Definition of done" require an explicit compare-and-correct pass, not just "code compiles." This task runs the production build, checks for the specific failure modes the spec calls out (CLS, hydration mismatch, WebGL leaks, duplicate timelines), and does a side-by-side visual comparison against K95 to catch any remaining mismatch — with at least one correction pass if something's off.

**Interfaces:**
- Consumes: the fully-wired Hero from Tasks 1–7.
- Produces: a corrected, production-verified Hero; no new files.

- [ ] **Step 1: Run a production build**

Run: `npm run build` (check `package.json` for the exact script name if different)
Expected: build succeeds with no errors. Note any warnings related to `Hero.vue`, `HeroRibbonScene.vue`, or the two new composables.

- [ ] **Step 2: Run the production build locally and check for hydration/console errors**

Run: `npm run preview` (or the project's equivalent — check `package.json`)
Expected: opening the homepage shows no hydration mismatch warnings in the console, no WebGL context errors, no 404s for removed `hero-bg` assets.

- [ ] **Step 3: Check for Cumulative Layout Shift on the Hero**

In Chrome DevTools, open the Performance panel, record a page load of the homepage.
Expected: no layout-shift entries attributable to the Hero's canvas mounting (the `aspect-square`/`max-w` reservation from Task 5 should prevent this). If a shift is found, fix by tightening the reserved-space CSS on the scene container in `Hero.vue`.

- [ ] **Step 4: Check for WebGL/GSAP resource leaks across route navigation**

Navigate from the homepage to another route and back to the homepage 3–4 times (or trigger a Hot Module Reload during dev by saving `Hero.vue`).
Expected: no accumulating WebGL context warnings ("too many active WebGL contexts") in the console, no duplicate/stacking GSAP timeline console warnings. If leaks are found, verify `HeroRibbonScene.vue`'s `onBeforeUnmount` (Task 4) is actually firing and `dispose()` is being called — add a temporary `console.log` to confirm during debugging, then remove it before committing any fix.

- [ ] **Step 5: Side-by-side comparison against K95's Hero**

Open https://k95.it/en in one window and the local homepage in another. Compare specifically:
- Composition balance (text column vs. object placement vs. negative space proportion)
- Motion pacing (does the entry feel similarly unhurried/deliberate, or rushed?)
- Pointer response feel (does the ribbon feel "alive" without feeling "controlled," matching K95's damped character?)
- Overall restraint (confirm nothing reads as glowing/neon/glossy — if the shader looks more "sci-fi" than intended, reduce the fresnel `pow`/multiplier values and grain amplitude in `useHeroRibbonScene.ts`'s fragment shader)

Document at least one concrete mismatch found (there will likely be at least one, given this is a first pass) and make one correction — e.g., adjusting timeline durations, easing, displacement clamp, or shader restraint values.

**Verification:**
- Production build passes.
- No console errors in preview mode.
- No CLS detected in the Performance panel.
- No resource-leak warnings across repeated navigation/HMR.
- At least one K95-comparison correction identified and applied, with a brief note of what changed and why.

**Regression check:**
- Re-run the full manual check from Task 6 Step 6 and Task 7 Step 3 after any corrective changes in this task, to confirm the fix didn't reintroduce a regression elsewhere (e.g., tightening the shader shouldn't break the fresnel effect entirely; adjusting timeline timing shouldn't desync the ribbon-formation `onUpdate` from the text reveal).

- [ ] **Step 6: Commit any corrective changes**

```bash
git add -A
git commit -m "Correct Hero visual/motion details after K95 comparison pass"
```

(If no corrections were needed — unlikely but possible — skip this commit and note in the final report that the comparison pass found no issues.)

---

## Self-Review Notes

- **Spec coverage:** Layout (Task 5), 3D scene idle/active + shader restraint + buffer reuse (Task 3), pointer damping generic composable (Task 2) + clamp/silhouette-safety (Task 3/7), motion/entry choreography + removal of spotlight/shine (Task 6), dev-picker/135-file cleanup (Task 1), responsive tiers (Task 7), reduced motion (Task 6 Step 3's `matchMedia` branch), perf/lifecycle safeguards — `ClientOnly`/DPR cap/IntersectionObserver/visibilitychange/disposal/resize (Task 4) — and no-CLS/no-per-frame-allocation/final comparison (Task 8). All spec sections have a corresponding task.
- **Placeholder scan:** No TBD/TODO markers; all steps include literal code or exact commands.
- **Type consistency:** `useHeroRibbonScene` returns `{ setup, setFormationProgress, resize, pause, resume, dispose }` consistently across Tasks 3, 4, 7. `HeroRibbonScene.vue` exposes `{ setFormationProgress }` consistently across Tasks 4, 5, 6. `usePointerDamping` returns `{ current, update, isActive }` consistently across Tasks 2 and 3.
