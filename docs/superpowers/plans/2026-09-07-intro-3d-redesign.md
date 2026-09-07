# Intro 3D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace PASTI's 2D preloader with a 6-phase "Blueprint → Dimensional
Object" sequence where the wordmark becomes a real Three.js-extruded 3D
object, while keeping the Hero and every other page untouched.

**Architecture:** New `useIntroScene.ts` composable (Three.js scene: extruded
"PASTI" `TextGeometry`, one directional key light + rim light, navy
`MeshPhysicalMaterial`, small emissive yellow dot mesh over the "i",
camera settle-rotation, collapse-exit animation) driven by a rewritten
`IntroOverlay.vue` that keeps phases 1-2 (construction grid, stroke-outline
build) from the current component and hands off to the WebGL scene for
phases 3-6. A `prefers-reduced-motion`/mobile/coarse-pointer gate (mirroring
`HeroScene.vue`'s exact gate) falls back to a CSS-only version of phases 3-6
with the same timing beats and no WebGL canvas.

**Tech Stack:** Vue 3 / Nuxt 4, Three.js (already a dependency), GSAP (already
a dependency), a one-time build-time font conversion using `fontkit` (dev
dependency, Node-only, not shipped to the browser) to produce a static
Manrope Extra Bold `typeface.json` for `TextGeometry`.

**Spec:** `docs/superpowers/specs/2026-09-07-intro-3d-redesign-design.md`

## Global Constraints

- Do not edit `app/components/home/Hero.vue`, `app/components/home/HeroScene.vue`,
  or any file outside the list in "Files" below.
- `useIntroReady.ts`'s public contract (`introReady` ref via `useIntroReady()`,
  `markIntroReady()` function) must not change signature or behavior — it's
  called once, at the start of the exit phase, exactly as today.
- `<LayoutIntroOverlay />`'s mount point/position in `app.vue` does not change.
- WebGL scene only runs when `pointer: fine` AND `min-width: 1024px` AND
  `prefers-reduced-motion: no-preference` all hold (exact gate from
  `HeroScene.vue:32-38`). Every other case uses the CSS fallback path.
- `prefers-reduced-motion: reduce` skips all motion (WebGL or CSS) and
  cross-fades directly to the Hero — matches current component's existing
  behavior (`IntroOverlay.vue:27,33-37` today).
- Navy `#0B3954` (`navy-700`), yellow `#FBBA00` (`yellow-500`) are the only
  brand colors used in the 3D material/lighting — no new palette introduced.
- Font: Manrope, weight 800 (Extra Bold) — matches `font-extrabold` used
  everywhere else on the site and the real logo's own weight.

---

## Task 1: Generate the Manrope Extra Bold typeface.json asset

**Files:**
- Create: `scripts/generate-intro-typeface.mjs` (one-time generator script,
  kept in the repo so the asset can be regenerated if the wordmark text or
  font ever changes — not part of the app's runtime bundle)
- Create: `public/fonts/manrope-extrabold.typeface.json` (generated output,
  committed as a static asset)
- Modify: `package.json` (add `fontkit` to `devDependencies`)

**Interfaces:**
- Produces: `public/fonts/manrope-extrabold.typeface.json`, a JSON file
  matching Three.js's `Font` data shape (`glyphs`, `familyName`, `ascender`,
  `descender`, `underlinePosition`, `underlineThickness`, `boundingBox`,
  `resolution`) as consumed by `three/examples/jsm/loaders/FontLoader.js`'s
  `Font` class. Task 2 loads this file via `fetch` + `FontLoader.parse()`.

This task's approach was fully validated in a throwaway script before this
plan was written: `fontkit` correctly instances Manrope's variable font
(`wght` axis, default 200, max 800) at weight 800, producing outlines with
~3.2x the stroke width of the unstyled default — confirmed via glyph bbox
comparison. The generated JSON was confirmed to load and extrude correctly
via Three.js's actual `Font`/`TextGeometry` classes (not a reimplementation),
rendering "PASTI" upright, correctly proportioned, with visible bevel/depth
under directional lighting.

- [ ] **Step 1: Install fontkit as a dev dependency**

```bash
npm install --save-dev fontkit
```

- [ ] **Step 2: Create the generator script**

Create `scripts/generate-intro-typeface.mjs`:

```javascript
// One-time generator for the intro's 3D wordmark font data. Run manually
// with `node scripts/generate-intro-typeface.mjs` whenever the wordmark
// text or font changes — NOT part of the app's runtime build. Downloads
// Google Fonts' Manrope variable font, instances it at weight 800 (Extra
// Bold — matches font-extrabold used everywhere else on the site and the
// real logo's own weight), and converts its glyph outlines into the JSON
// shape Three.js's FontLoader/Font class expects (verified against
// three/examples/jsm/loaders/FontLoader.js's actual parsing code, not
// guessed): { glyphs: { "<char>": { o: "<outline commands>", ha:
// <advance> } }, familyName, ascender, descender, underlinePosition,
// underlineThickness, boundingBox: { yMin, yMax }, resolution }.
//
// Outline command format (space-separated, scaled by `resolution / unitsPerEm`):
//   m x y        moveTo
//   l x y        lineTo
//   q cpx cpy x y        quadraticCurveTo(cpx, cpy, x, y)
//   b cpx1 cpy1 cpx2 cpy2 x y   bezierCurveTo(...)
//
// fontkit's Path#scale(sx, sy) with NO y-flip matches Three.js's own Y
// convention directly — an earlier throwaway test that flipped Y produced
// upside-down/mirrored glyphs; removing the flip fixed it. Do not
// reintroduce a Y flip here.

import * as fontkitNs from 'fontkit'
import fs from 'node:fs'
import path from 'node:path'

const fontkit = fontkitNs.default ?? fontkitNs

const MANROPE_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf'
const WEIGHT = 800
const RESOLUTION = 1000
// Every character the intro's wordmark ("PASTI") and its CSS-fallback
// sibling need. Kept minimal deliberately — this typeface file only backs
// the intro, not general text rendering.
const CHARS = ['P', 'A', 'S', 'T', 'I', ' ']

const scriptDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
const tmpFontPath = path.join(scriptDir, '.manrope-tmp.ttf')
const outPath = path.join(scriptDir, '..', 'public', 'fonts', 'manrope-extrabold.typeface.json')

async function main() {
  console.log('Downloading Manrope variable font...')
  const res = await fetch(MANROPE_URL)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(tmpFontPath, buf)

  const variableFont = fontkit.openSync(tmpFontPath)
  const font = variableFont.getVariation({ wght: WEIGHT })
  const scale = RESOLUTION / font.unitsPerEm

  const glyphs = {}
  let globalYMin = Infinity
  let globalYMax = -Infinity

  for (const ch of CHARS) {
    const glyph = font.glyphForCodePoint(ch.codePointAt(0))
    if (!glyph.path || ch === ' ') {
      glyphs[ch] = { o: '', ha: Math.round(glyph.advanceWidth * scale) }
      continue
    }
    const scaledPath = glyph.path.scale(scale, scale)
    const parts = []
    for (const cmd of scaledPath.commands) {
      const a = cmd.args.map((n) => Math.round(n * 100) / 100)
      if (cmd.command === 'moveTo') parts.push(`m ${a[0]} ${a[1]}`)
      else if (cmd.command === 'lineTo') parts.push(`l ${a[0]} ${a[1]}`)
      else if (cmd.command === 'quadraticCurveTo') parts.push(`q ${a[0]} ${a[1]} ${a[2]} ${a[3]}`)
      else if (cmd.command === 'bezierCurveTo') parts.push(`b ${a[0]} ${a[1]} ${a[2]} ${a[3]} ${a[4]} ${a[5]}`)
      // closePath: intentionally omitted — Three.js's Font#createPath has
      // no explicit close command; the path closes implicitly on the next
      // 'm' or when the shape is consumed by ShapePath#toShapes().
    }
    glyphs[ch] = { o: parts.join('  '), ha: Math.round(glyph.advanceWidth * scale) }

    const bbox = scaledPath.bbox
    if (Number.isFinite(bbox.minY)) globalYMin = Math.min(globalYMin, bbox.minY)
    if (Number.isFinite(bbox.maxY)) globalYMax = Math.max(globalYMax, bbox.maxY)
  }

  const typeface = {
    glyphs,
    familyName: 'Manrope ExtraBold',
    ascender: Math.round(font.ascent * scale),
    descender: Math.round(font.descent * scale),
    underlinePosition: Math.round((font.underlinePosition ?? -100) * scale),
    underlineThickness: Math.round((font.underlineThickness ?? 50) * scale),
    boundingBox: { yMin: Math.round(globalYMin), yMax: Math.round(globalYMax) },
    resolution: RESOLUTION,
    original_font_information: { format_version: 1 }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(typeface))
  fs.unlinkSync(tmpFontPath)
  console.log('Written:', outPath)
  console.log('Glyphs:', Object.keys(glyphs).join(', '))
  console.log('boundingBox:', typeface.boundingBox)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 3: Run the generator**

```bash
node scripts/generate-intro-typeface.mjs
```

Expected output: `Written: <path>/public/fonts/manrope-extrabold.typeface.json`,
followed by `Glyphs: P, A, S, T, I,  ` and a `boundingBox` line with
`yMin` negative or near-zero and `yMax` a positive number roughly 700-750
(cap-height at resolution 1000 for Manrope Extra Bold).

- [ ] **Step 4: Verify the generated file is valid JSON with the expected glyphs**

```bash
node -e "const d = require('./public/fonts/manrope-extrabold.typeface.json'); console.log(Object.keys(d.glyphs)); console.log(typeof d.glyphs.P.o === 'string' && d.glyphs.P.o.length > 0)"
```

Expected: prints `[ 'P', 'A', 'S', 'T', 'I', ' ' ]` then `true`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-intro-typeface.mjs public/fonts/manrope-extrabold.typeface.json package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add Manrope Extra Bold typeface.json for the intro's 3D wordmark

One-time generator script (Node-only, not part of the runtime bundle)
instances Manrope's variable font at weight 800 via fontkit and
converts its glyph outlines to the JSON shape Three.js's
FontLoader/Font class expects, so the intro's TextGeometry can
extrude the real brand wordmark instead of a traced/approximated
shape.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `useIntroScene.ts` — build and light the 3D wordmark, no animation yet

**Files:**
- Create: `app/composables/motion/useIntroScene.ts`

**Interfaces:**
- Consumes: `public/fonts/manrope-extrabold.typeface.json` (Task 1).
- Produces: `useIntroScene(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>)`
  returning `{ start, stop, dispose, fit, playFormation, playExit }` — the
  first four match `useHeroScene`'s existing shape exactly (same names, same
  meaning) for consistency; `playFormation`/`playExit` are this scene's
  own entrance/exit triggers (analogous to `useHeroScene`'s `playEntrance`).
  This task builds `start/stop/dispose/fit` and the static scene (geometry,
  material, lights, camera at its resting pose) — `playFormation`/`playExit`
  are stubbed as no-ops here and implemented in Task 3.

- [ ] **Step 1: Write the composable's scene-building skeleton**

Create `app/composables/motion/useIntroScene.ts`:

```typescript
import * as THREE from 'three'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

/**
 * The intro's 3D wordmark scene: "PASTI" extruded from the real brand
 * typeface (see scripts/generate-intro-typeface.mjs for how
 * manrope-extrabold.typeface.json was produced), lit with a navy
 * MeshPhysicalMaterial body and a small emissive yellow dot mesh standing
 * in for the logo's accent dot over the "i". Mirrors useHeroScene.ts's
 * start/stop/dispose/fit lifecycle shape for consistency, but is otherwise
 * fully independent — no shared Three.js state with the Hero scene.
 */

const NAVY = new THREE.Color(0x0b3954)
const YELLOW = new THREE.Color(0xfbba00)

// Matches the site's font-extrabold + tracking-tight wordmark treatment
// (see IntroOverlay.vue's existing 2D outline/mark layers) — the 3D object
// should read as the same wordmark, just dimensional now.
const WORDMARK = 'PASTI'
const EXTRUDE_DEPTH = 0.16
const BEVEL_THICKNESS = 0.018
const BEVEL_SIZE = 0.01

export function useIntroScene(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let scene: THREE.Scene | undefined
  let wordGroup: THREE.Group | undefined
  let wordMesh: THREE.Mesh | undefined
  let dotMesh: THREE.Mesh | undefined
  let wordGeo: THREE.BufferGeometry | undefined
  let wordMat: THREE.MeshPhysicalMaterial | undefined
  let dotGeo: THREE.SphereGeometry | undefined
  let dotMat: THREE.MeshPhysicalMaterial | undefined
  let keyLight: THREE.DirectionalLight | undefined
  let rimLight: THREE.DirectionalLight | undefined
  let ambientLight: THREE.AmbientLight | undefined

  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let fontLoaded = false

  async function loadFont(): Promise<Font> {
    const res = await fetch('/fonts/manrope-extrabold.typeface.json')
    const data = await res.json()
    return new Font(data)
  }

  async function buildScene() {
    if (!canvasRef.value || !containerRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)

    keyLight = new THREE.DirectionalLight(0xffffff, 3)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)
    rimLight = new THREE.DirectionalLight(0x8fc6ff, 1.4)
    rimLight.position.set(-4, -2, -3)
    scene.add(rimLight)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
    scene.add(ambientLight)

    const font = await loadFont()
    fontLoaded = true

    wordGeo = new TextGeometry(WORDMARK, {
      font,
      size: 1,
      depth: EXTRUDE_DEPTH,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: BEVEL_THICKNESS,
      bevelSize: BEVEL_SIZE,
      bevelSegments: 3
    })
    wordGeo.computeBoundingBox()
    wordGeo.center()

    wordMat = new THREE.MeshPhysicalMaterial({
      color: NAVY,
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 0.5,
      clearcoatRoughness: 0.18
    })
    wordMesh = new THREE.Mesh(wordGeo, wordMat)

    wordGroup = new THREE.Group()
    wordGroup.add(wordMesh)

    // Accent dot: a small emissive sphere positioned above the "i" — the
    // typeface's own bounding box gives the wordmark's world-space width,
    // and the "i" is the last character, so its horizontal center is
    // derivable from the font's per-glyph advance widths summed up to that
    // point. Simpler and robust to font-metric quirks: position it via the
    // ACTUAL rendered geometry's bounding box right edge (the "i" is the
    // last glyph, so the mesh's own bounding box max.x is at/near the "i"'s
    // right edge) minus a small fixed offset tuned by eye against the real
    // logo's proportions once rendered — this exact offset is finalized in
    // Task 3's visual verification step, not guessed here.
    const bb = wordGeo.boundingBox!
    dotGeo = new THREE.SphereGeometry(0.055, 20, 20)
    dotMat = new THREE.MeshPhysicalMaterial({ color: YELLOW, metalness: 0.5, roughness: 0.25, emissive: YELLOW, emissiveIntensity: 0.35 })
    dotMesh = new THREE.Mesh(dotGeo, dotMat)
    dotMesh.position.set(bb.max.x - 0.08, bb.max.y + 0.14, EXTRUDE_DEPTH / 2)
    wordGroup.add(dotMesh)

    scene.add(wordGroup)

    fit()
  }

  function fit() {
    if (!renderer || !camera || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function tick(dt: number) {
    elapsed += dt
    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  function loop(now: number) {
    if (!running) return
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    tick(dt)
    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    running = true
    lastTime = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (rafId !== undefined) cancelAnimationFrame(rafId)
    rafId = undefined
  }

  function dispose() {
    stop()
    wordGeo?.dispose()
    wordMat?.dispose()
    dotGeo?.dispose()
    dotMat?.dispose()
    renderer?.dispose()
    renderer = undefined
    scene = undefined
    camera = undefined
    wordGroup = undefined
    wordMesh = undefined
    dotMesh = undefined
    keyLight = undefined
    rimLight = undefined
    ambientLight = undefined
    fontLoaded = false
    elapsed = 0
  }

  // Implemented in Task 3.
  function playFormation() {}
  function playExit(_onComplete: () => void) {}

  return { start, stop, dispose, fit, buildScene, playFormation, playExit }
}
```

Note: `buildScene` is exposed (unlike `useHeroScene`, which calls it
internally from `start()`) because it's `async` (font fetch) — the consuming
component needs to `await scene.buildScene()` before the first `fit()`/
`start()` makes sense, whereas `useHeroScene`'s scene has no async
dependency and can build synchronously inside `start()`.

- [ ] **Step 2: Write a throwaway visual smoke test**

Create a temporary test page to confirm the scene renders before wiring it
into the real intro flow (deleted at the end of this task once confirmed
working — this is a verification step, not a permanent test).

Create `app/pages/__intro-scene-test.vue`:

```vue
<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const scene = useIntroScene(canvasRef, containerRef)
  await scene.buildScene()
  scene.start()
})
</script>

<template>
  <div ref="containerRef" style="position: fixed; inset: 0; background: white">
    <canvas ref="canvasRef" style="width: 100%; height: 100%" />
  </div>
</template>
```

- [ ] **Step 3: Run dev server and visually verify**

```bash
npm run dev
```

Navigate to `http://localhost:3000/__intro-scene-test`. Expected: the
extruded navy "PASTI" wordmark renders centered, lit (visible specular
highlight/bevel edges), with a small yellow sphere near the top-right of the
"I". Check the browser console for zero errors.

If the wordmark doesn't appear: check the Network tab for a 404 on
`/fonts/manrope-extrabold.typeface.json` (confirms Task 1's output path is
wrong or the file wasn't committed to `public/`) before debugging anything
else — this was the most likely failure point when this approach was
validated during planning.

- [ ] **Step 4: Delete the throwaway test page**

```bash
rm app/pages/__intro-scene-test.vue
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/motion/useIntroScene.ts
git commit -m "$(cat <<'EOF'
Add useIntroScene composable: extruded 3D "PASTI" wordmark

Builds and lights the intro's 3D wordmark (TextGeometry extrusion
from the Manrope Extra Bold typeface data, navy MeshPhysicalMaterial,
key+rim+ambient lighting, emissive yellow accent dot). Mirrors
useHeroScene's start/stop/dispose/fit lifecycle shape. Entrance/exit
animation (playFormation/playExit) lands in the next commit — this
one only builds the static, lit scene.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Animate the wordmark — formation, light sweep, hold, exit

**Files:**
- Modify: `app/composables/motion/useIntroScene.ts`

**Interfaces:**
- Consumes: The scene built by Task 2 (`wordGroup`, `wordMesh`, `wordMat`,
  `dotMesh`, `keyLight`, `camera` — all already in scope in this file, no
  new file boundary crossed).
- Produces: `playFormation(): Promise<void>` — resolves once the formation +
  light-sweep + hold sequence completes (so the consuming component in Task
  5 knows when it's safe to call `markIntroReady()`/start the exit).
  `playExit(onComplete: () => void): void` — plays the collapse-exit and
  calls `onComplete` when the animation finishes (matches the current
  `IntroOverlay.vue`'s existing `exitTl.eventCallback` /
  `onComplete` pattern for its own exit timeline, so Task 5 wires it the
  same way).

- [ ] **Step 1: Replace the stub functions with real animation logic**

In `app/composables/motion/useIntroScene.ts`, replace:

```typescript
  // Implemented in Task 3.
  function playFormation() {}
  function playExit(_onComplete: () => void) {}
```

with:

```typescript
  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }
  function easeOutBack(t: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }

  const FORMATION_DUR = 1.3
  const LIGHT_SWEEP_DUR = 0.7
  const HOLD_DUR = 0.6
  const EXIT_DUR = 0.5

  /**
   * Phase 3+4+5 combined: the wordmark scales up from flat/small with a
   * settle-rotation (so the extrusion depth actually reads as the object
   * turns slightly), then the key light sweeps across it once, then it
   * holds still. Resolves once the hold completes — the caller uses that
   * to know when to trigger markIntroReady()/the exit phase.
   */
  function playFormation(): Promise<void> {
    if (!wordGroup || !wordMesh || !keyLight) return Promise.resolve()
    const group = wordGroup
    const light = keyLight

    group.scale.setScalar(0.01)
    group.rotation.y = -0.5
    group.rotation.x = 0.15

    const baseLightX = light.position.x
    const baseLightY = light.position.y
    light.position.set(-6, 6, 5)

    const formationStart = performance.now()

    return new Promise((resolve) => {
      function animate(now: number) {
        const t = Math.min((now - formationStart) / 1000, FORMATION_DUR + LIGHT_SWEEP_DUR + HOLD_DUR)

        if (t <= FORMATION_DUR) {
          const ft = easeOutBack(Math.min(t / FORMATION_DUR, 1))
          group.scale.setScalar(Math.max(0.01, ft))
          group.rotation.y = -0.5 * (1 - easeOutCubic(Math.min(t / FORMATION_DUR, 1)))
          group.rotation.x = 0.15 * (1 - easeOutCubic(Math.min(t / FORMATION_DUR, 1)))
        } else if (t <= FORMATION_DUR + LIGHT_SWEEP_DUR) {
          group.scale.setScalar(1)
          group.rotation.set(0, 0, 0)
          const lt = easeOutCubic(Math.min((t - FORMATION_DUR) / LIGHT_SWEEP_DUR, 1))
          light.position.x = -6 + (baseLightX - -6) * lt
          light.position.y = 6 + (baseLightY - 6) * lt
        } else {
          group.scale.setScalar(1)
          group.rotation.set(0, 0, 0)
          light.position.set(baseLightX, baseLightY, light.position.z)
        }

        if (t < FORMATION_DUR + LIGHT_SWEEP_DUR + HOLD_DUR) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(animate)
    })
  }

  /**
   * Phase 6: the wordmark scales/collapses slightly toward the camera
   * while fading — the composable only animates the 3D object itself; the
   * consuming component (IntroOverlay.vue) fades the whole overlay
   * container in lockstep via its own GSAP timeline, matching the current
   * component's existing exit-phase split (mesh-local animation here,
   * container-level fade in the Vue component).
   */
  function playExit(onComplete: () => void): void {
    if (!wordGroup || !wordMat || !dotMat) {
      onComplete()
      return
    }
    const group = wordGroup
    const mat = wordMat
    const dm = dotMat
    const exitStart = performance.now()
    const startOpacity = 1
    mat.transparent = true
    dm.transparent = true

    function animate(now: number) {
      const t = Math.min((now - exitStart) / 1000, EXIT_DUR)
      const e = easeOutCubic(t / EXIT_DUR)
      group.scale.setScalar(1 - e * 0.18)
      group.position.z = e * 0.6
      mat.opacity = startOpacity * (1 - e)
      dm.opacity = startOpacity * (1 - e)

      if (t < EXIT_DUR) {
        requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }
    requestAnimationFrame(animate)
  }
```

- [ ] **Step 2: Re-create the throwaway test page to verify the animation**

Create `app/pages/__intro-scene-test.vue` (same as Task 2 Step 2, plus
calling the new methods):

```vue
<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const scene = useIntroScene(canvasRef, containerRef)
  await scene.buildScene()
  scene.start()
  await scene.playFormation()
  setTimeout(() => {
    scene.playExit(() => console.log('exit complete'))
  }, 500)
})
</script>

<template>
  <div ref="containerRef" style="position: fixed; inset: 0; background: white">
    <canvas ref="canvasRef" style="width: 100%; height: 100%" />
  </div>
</template>
```

- [ ] **Step 3: Run dev server and visually verify the full sequence**

```bash
npm run dev
```

Navigate to `http://localhost:3000/__intro-scene-test`. Expected: the
wordmark scales up from tiny with a slight rotation settle (~1.3s), the
light visibly sweeps across the surface catching different facets (~0.7s),
it holds still (~0.6s), then after the 500ms `setTimeout` it collapses
slightly and fades (~0.5s), and `"exit complete"` logs to the console. Zero
console errors throughout.

- [ ] **Step 4: Delete the throwaway test page**

```bash
rm app/pages/__intro-scene-test.vue
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/motion/useIntroScene.ts
git commit -m "$(cat <<'EOF'
Add formation/light-sweep/hold/exit animation to useIntroScene

playFormation() scales the wordmark up from flat with a settle-
rotation, sweeps the key light across its surface, then holds;
resolves once the hold completes so the caller knows when to
advance. playExit() collapses/fades the wordmark toward the camera.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: CSS-only fallback for reduced-capability devices

**Files:**
- Modify: `app/components/layout/IntroOverlay.vue` (this task adds the
  fallback markup/animation directly in the component being rewritten in
  Task 5 — sequenced here first so Task 5 can wire both paths together
  in one coherent pass; if executing tasks independently, this task's
  changes land in the same file Task 5 also modifies, so run them in order)

**Interfaces:**
- Produces: A CSS/GSAP-only visual stand-in for phases 3-6, gated by the
  same `shouldEnableWebGL` check Task 5 defines, with matching phase
  durations (`FORMATION_DUR`/`LIGHT_SWEEP_DUR`/`HOLD_DUR`/`EXIT_DUR` — reuse
  the exact same numbers as Task 3's WebGL version: 1.3s/0.7s/0.6s/0.5s) so
  the two paths feel like the same intro at different fidelity, not two
  different intros.

This task is written as part of Task 5's full component rewrite (below) —
see Task 5 Step 1's template/script for the fallback markup and the
`mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (pointer: fine)', ...)`
/ else-branch split via GSAP's `matchMedia`.

- [ ] **Step 1: No standalone action — proceed to Task 5, which implements this inline.**

---

## Task 5: Rewrite `IntroOverlay.vue` — wire phases 1-2 (kept) to phases 3-6 (new)

**Files:**
- Modify: `app/components/layout/IntroOverlay.vue` (full rewrite)

**Interfaces:**
- Consumes: `useIntroScene` (Task 2/3), `useGsapContext` (existing,
  unchanged), `markIntroReady` (existing, unchanged, from `useIntroReady.ts`).
- Produces: Same public surface as today — a component with no props/emits,
  mounted once in `app.vue`, that calls `markIntroReady()` exactly once.

- [ ] **Step 1: Rewrite the component**

Replace the full contents of `app/components/layout/IntroOverlay.vue` with:

```vue
<script setup lang="ts">
import gsap from 'gsap'

/**
 * PASTI's page-load preloader — "Blueprint → Dimensional Object": the
 * construction-grid and stroke-outline phases from the original 2D
 * version are kept (they already read as "the brand under construction"),
 * then the flat outline hands off to a Three.js scene where the wordmark
 * becomes a real extruded 3D object, gets a one-shot light sweep, holds,
 * then collapses/fades into the Hero (already mounted behind this overlay
 * throughout — see app.vue).
 *
 * Two rendering paths, chosen once on mount and never switched mid-play:
 * - WebGL path: pointer:fine AND min-width:1024px AND
 *   prefers-reduced-motion:no-preference (exact gate mirrored from
 *   HeroScene.vue) — the real Three.js extrusion.
 * - CSS path: everything else except reduced-motion — a
 *   perspective()+box-shadow fake-depth pop hitting the same timing beats,
 *   so mobile/coarse-pointer visitors still get a construction → build →
 *   "dimensional" → hold → exit experience, just without WebGL.
 * - prefers-reduced-motion: reduce collapses straight to an instant
 *   cross-fade — matches the original component's existing behavior.
 */

const overlayRef = ref<HTMLElement | null>(null)
const horizonRef = ref<HTMLElement | null>(null)
const verticalsRef = ref<HTMLElement | null>(null)
const crosshairsRef = ref<HTMLElement | null>(null)
const outlineTextRef = ref<HTMLElement | null>(null)
const canvasWrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cssWordRef = ref<HTMLElement | null>(null)
const cssDotRef = ref<HTMLElement | null>(null)

const prefersReducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function shouldUseWebGL(): boolean {
  return (
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

// Shared timing beats between the WebGL and CSS paths — see
// useIntroScene.ts's FORMATION_DUR/LIGHT_SWEEP_DUR/HOLD_DUR/EXIT_DUR,
// duplicated here (not imported) because the CSS path's GSAP timeline
// needs these as plain numbers at markup-authoring time, and importing
// them from the composable would create a coupling that doesn't buy
// anything — both are tuned together by eye, not derived from each other.
const FORMATION_DUR = 1.3
const LIGHT_SWEEP_DUR = 0.7
const HOLD_DUR = 0.6
const EXIT_DUR = 0.5

useGsapContext(() => {
  const overlay = overlayRef.value
  if (!overlay) return

  if (prefersReducedMotion) {
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' })
    markIntroReady()
    return
  }

  const horizonLines = horizonRef.value ? Array.from(horizonRef.value.children) : []
  const verticalLines = verticalsRef.value ? Array.from(verticalsRef.value.children) : []
  const crosshairs = crosshairsRef.value ? Array.from(crosshairsRef.value.children) : []
  const useWebGL = shouldUseWebGL()

  gsap.set(horizonLines, { scaleX: 0 })
  gsap.set(verticalLines, { scaleY: 0 })
  gsap.set(crosshairs, { autoAlpha: 0, scale: 0 })
  gsap.set(outlineTextRef.value, { autoAlpha: 0 })
  gsap.set(canvasWrapRef.value, { autoAlpha: 0 })
  if (cssWordRef.value) gsap.set(cssWordRef.value, { autoAlpha: 0, scale: 0.01, rotateY: -25, rotateX: 8 })
  if (cssDotRef.value) gsap.set(cssDotRef.value, { autoAlpha: 0 })

  const tl = gsap.timeline({ delay: 0.2 })

  // PHASE 1 — construction field (kept from the original 2D version).
  tl.addLabel('field')
    .to(horizonLines, { scaleX: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 'field')
    .to(verticalLines, { scaleY: 1, duration: 0.4, stagger: 0.05, ease: 'power3.out' }, 'field+=0.1')
    .to(crosshairs, { autoAlpha: 1, scale: 1, duration: 0.25, stagger: 0.03, ease: 'back.out(3)' }, 'field+=0.35')

    // PHASE 2 — outline build (kept from the original 2D version).
    .addLabel('build', 'field+=0.75')
    .to(outlineTextRef.value, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 'build')

    // Hand off from the flat outline to the dimensional object: outline
    // fades out as the canvas/CSS wordmark fades in, construction lines
    // clear away — no visible "pop" between representations.
    .addLabel('handoff', 'build+=0.6')
    .to(outlineTextRef.value, { autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, 'handoff')
    .to([...horizonLines, ...verticalLines, ...crosshairs], { autoAlpha: 0, duration: 0.3 }, 'handoff')
    .set([...horizonLines, ...verticalLines, ...crosshairs], { display: 'none' }, 'handoff+=0.3')
    .to(canvasWrapRef.value, { autoAlpha: 1, duration: 0.3 }, 'handoff+=0.1')

  if (useWebGL) {
    tl.call(
      () => {
        void runWebGLSequence()
      },
      undefined,
      'handoff+=0.1'
    )
  } else {
    // PHASES 3-5 (CSS fallback) — perspective/shadow fake-depth pop,
    // light-sweep stand-in via a filter/opacity pulse, then hold.
    tl.addLabel('formation', 'handoff+=0.1')
      .to(cssWordRef.value, { autoAlpha: 1, scale: 1, rotateY: 0, rotateX: 0, duration: FORMATION_DUR, ease: 'back.out(1.4)' }, 'formation')
      .addLabel('light', `formation+=${FORMATION_DUR}`)
      .to(cssWordRef.value, { filter: 'brightness(1.35)', duration: LIGHT_SWEEP_DUR / 2, ease: 'power2.out' }, 'light')
      .to(cssWordRef.value, { filter: 'brightness(1)', duration: LIGHT_SWEEP_DUR / 2, ease: 'power2.in' }, `light+=${LIGHT_SWEEP_DUR / 2}`)
      .to(cssDotRef.value, { autoAlpha: 1, duration: 0.3 }, 'light')
      .addLabel('hold', `light+=${LIGHT_SWEEP_DUR}`)
      .to({}, { duration: HOLD_DUR }, 'hold')
      .call(() => exitOverlay(), undefined, `hold+=${HOLD_DUR}`)
  }

  async function runWebGLSequence() {
    const scene = useIntroScene(canvasRef, canvasWrapRef)
    await scene.buildScene()
    scene.start()
    await scene.playFormation()
    exitOverlay(scene)
  }

  // Renamed from an earlier draft's `playExit` to `exitOverlay` — this
  // function drives the OVERLAY's exit (container fade + which mesh/CSS
  // animation to trigger), while `scene.playExit` (from useIntroScene,
  // Task 3) drives only the 3D object's own collapse animation. Same verb,
  // different scope; distinct names avoid a reader confusing the two.
  function exitOverlay(scene?: ReturnType<typeof useIntroScene>) {
    markIntroReady()

    const finishExit = () => {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => gsap.set(overlay, { pointerEvents: 'none' })
      })
    }

    if (scene) {
      scene.playExit(() => {
        finishExit()
        scene.dispose()
      })
    } else {
      gsap
        .timeline()
        .to(cssWordRef.value, { scale: 0.85, z: 40, autoAlpha: 0, duration: EXIT_DUR, ease: 'power2.in' })
        .add(finishExit, '<')
    }
  }
})
</script>

<template>
  <div
    ref="overlayRef"
    aria-hidden="true"
    class="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-paper"
  >
    <!-- Construction field: unchanged from the original 2D version. -->
    <div ref="horizonRef" class="pointer-events-none absolute inset-0 flex flex-col items-stretch justify-center gap-24 md:gap-32">
      <span class="h-px w-full bg-navy-200" />
      <span class="h-px w-full bg-navy-200" />
    </div>
    <div ref="verticalsRef" class="pointer-events-none absolute inset-0 flex items-stretch justify-center gap-16 md:gap-24">
      <span class="w-px origin-center bg-navy-200" />
      <span class="w-px origin-center bg-navy-200" />
      <span class="w-px origin-center bg-navy-200" />
    </div>
    <div ref="crosshairsRef" class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <span
        v-for="(pos, i) in [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1]
        ]"
        :key="i"
        class="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-500"
        :style="{ left: `calc(50% + ${pos[0] * 8}rem)`, top: `calc(50% + ${pos[1] * 3.5}rem)` }"
      />
    </div>

    <!-- Outline build: unchanged from the original 2D version — capital
         "I" (not lowercase), matching the real logo's letterform height. -->
    <p
      ref="outlineTextRef"
      aria-hidden="true"
      class="pointer-events-none absolute select-none whitespace-nowrap font-display text-[clamp(4.5rem,13vw,9.5rem)] font-extrabold leading-none tracking-tight text-transparent"
      style="-webkit-text-stroke: 2px #0b3954"
    >
      PASTI
    </p>

    <!-- Dimensional object: the WebGL canvas when useWebGL is true, the
         CSS fallback wordmark otherwise. Both live in this same wrapper so
         the single handoff fade (in the script above) covers whichever
         one is actually active. canvasWrapRef doubles as useIntroScene's
         `containerRef` argument (the element it measures for sizing/
         aspect ratio via ResizeObserver-less getBoundingClientRect calls
         in fit()) — this is the WebGL path's sizing container regardless
         of which path is actually active, since the CSS path never reads
         it. -->
    <div ref="canvasWrapRef" class="relative flex h-[13vw] max-h-40 min-h-24 w-full items-center justify-center" style="perspective: 900px">
      <canvas ref="canvasRef" class="h-full w-full" />
      <p
        ref="cssWordRef"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 flex select-none items-center justify-center whitespace-nowrap font-display text-[clamp(4.5rem,13vw,9.5rem)] font-extrabold leading-none tracking-tight text-navy-700"
        style="transform-style: preserve-3d; text-shadow: 0 2px 0 #082a3e, 0 4px 0 #082a3e, 0 6px 8px rgba(11, 57, 84, 0.35)"
      >
        PASTI
        <span
          ref="cssDotRef"
          class="absolute block rounded-full bg-yellow-500"
          style="width: 0.16em; height: 0.16em; right: 0.02em; top: -0.02em; box-shadow: 0 2px 4px rgba(251, 186, 0, 0.5)"
        />
      </p>
    </div>
  </div>
</template>
```

**Design note carried over from earlier work this session:** the accent dot
position (`right: 0.02em; top: -0.02em` on `cssDotRef`) is a starting value,
not a final measurement — Step 3 below verifies it visually against the real
logo's proportions and adjusts if needed, the same way the standalone 2D
dot's position was iteratively verified earlier in this project. Do not skip
that visual check.

- [ ] **Step 2: Run dev server and verify the WebGL path**

```bash
npm run dev
```

Open `http://localhost:3000` in a desktop-width browser window with a real
mouse (satisfies `pointer: fine` + `min-width: 1024px`). Hard refresh.
Expected: construction grid draws in, "PASTI" outline fades in, outline
fades out as the 3D wordmark fades in and animates through formation/light
sweep/hold, then collapses and fades to reveal the Hero. Zero console
errors. Confirm `useIntroReady`'s `introReady` flips true (Hero/Header
entrance animations should play, not sit static) by checking the Hero's
headline reveal happens.

- [ ] **Step 3: Verify the accent dot position against the real logo**

With the WebGL path playing (or paused via DevTools during the hold phase),
compare the yellow dot's position/size on the extruded "I" against
`public/images/pasti-logo.png` opened side-by-side. Adjust
`useIntroScene.ts`'s `dotMesh.position.set(...)` offset (currently
`bb.max.x - 0.08, bb.max.y + 0.14, ...`) if it doesn't read as sitting
correctly above/right of the "I" the way the real logo's dot does. Re-run
Step 2 after any adjustment.

- [ ] **Step 4: Verify the CSS fallback path**

In Chrome DevTools, toggle device toolbar to a mobile viewport (e.g. iPhone
12, 390px width) — this fails the `min-width: 1024px` check, forcing the CSS
path. Hard refresh. Expected: same construction grid → outline build →
handoff sequence, then the CSS wordmark pops in with a perspective
scale/rotate settle, brightens once (light-sweep stand-in), holds, then
scales down and fades. No WebGL canvas should be present in the Elements
panel during this run (confirms the gate actually skipped WebGL, not just
that it happened to look similar). Zero console errors.

- [ ] **Step 5: Verify prefers-reduced-motion**

In Chrome DevTools, open the Rendering tab (Cmd/Ctrl+Shift+P → "Show
Rendering"), set "Emulate CSS media feature prefers-reduced-motion" to
"reduce". Hard refresh. Expected: no construction grid, no outline, no 3D
object — the overlay should simply not be visible (instant, matches current
component's existing reduced-motion behavior) and the Hero should be fully
interactive immediately.

- [ ] **Step 6: Verify no re-trigger on internal navigation**

With the WebGL or CSS path from Step 2/4 still active in the browser tab,
click through to another page (e.g. the "Work" nav link) and back to the
home page via the browser back button or another internal link. Expected:
the intro does NOT replay — it only ever plays once per hard page load
(confirms `useIntroReady`'s module-level ref state is respected, unchanged
from current behavior).

- [ ] **Step 7: Commit**

```bash
git add app/components/layout/IntroOverlay.vue
git commit -m "$(cat <<'EOF'
Rewrite IntroOverlay.vue for the 3D wordmark redesign

Keeps the construction-field and outline-build phases from the
original 2D version, then hands off to either the Three.js extruded
wordmark (desktop, fine pointer, motion allowed — mirrors
HeroScene.vue's exact enable gate) or a CSS/GSAP fallback with
matching timing beats (mobile, coarse pointer, or otherwise gated
out). prefers-reduced-motion still collapses straight to the Hero,
unchanged from the original component's behavior.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Production build, cross-check, and final report

**Files:** None modified — verification only.

**Interfaces:** N/A.

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors, no missing-asset
warnings (confirms `public/fonts/manrope-extrabold.typeface.json` is
correctly included in the output), no Vue compiler warnings about the
rewritten `IntroOverlay.vue`.

- [ ] **Step 2: Serve the production build and re-run the three verification passes**

```bash
npm run preview
```

Repeat Task 5 Steps 2, 4, and 5 (WebGL path, CSS fallback path,
reduced-motion path) against the production build at whatever port
`npm run preview` reports. This catches anything the dev server's looser
module resolution/HMR might have masked (the spec's verification plan calls
this out explicitly as a requirement, not optional).

- [ ] **Step 3: Confirm Hero.vue and HeroScene.vue are unmodified**

```bash
git diff --stat master -- app/components/home/Hero.vue app/components/home/HeroScene.vue
```

Expected: empty output (no changes) — if this task's or any earlier task's
work touched either file, that's a global-constraint violation to fix before
proceeding.

- [ ] **Step 4: Take verification screenshots for the report**

Using the running preview server, capture: (a) the construction-field phase,
(b) the outline-build phase, (c) the 3D formation mid-animation (visible
rotation/depth), (d) the light-sweep moment, (e) the brand-hold frame, (f)
the exit/collapse mid-animation, (g) the Hero fully revealed after handoff —
seven frames total, desktop WebGL path. Save these as ordinary local files
(not committed to the repo) to attach to the final report.

- [ ] **Step 5: Write the final report**

Using the "REPORT YANG SAYA MAU" structure from the original request,
produce a written summary covering: final concept, tech stack used, the 6
phases, files created, files modified, how the real logo's fidelity was
preserved (Manrope Extra Bold extrusion matching the actual brand
wordmark/weight, yellow accent dot position verified against
`pasti-logo.png`), how the 3D was implemented (Three.js `TextGeometry`
extrusion via a generated typeface asset — not a CSS fake, not a traced
PNG), how the Hero handoff works (fade/collapse into the already-mounted
Hero, `markIntroReady()` timing unchanged), and what was done for
mobile/performance (the `HeroScene.vue`-mirrored enable gate, CSS fallback
path, disposal on exit). Do not commit anything for this step — it's the
chat-facing deliverable, not a repo artifact.

