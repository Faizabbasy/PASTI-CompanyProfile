import * as THREE from 'three'

/**
 * Hero curtain/sheet scene — three large, deterministically-curved
 * "material sheets" benchmarked against icomat.co.uk's hero: a spatial
 * material composition, not animated cloth. Each sheet's macro silhouette
 * comes from an explicit art-directed curve (never procedural noise —
 * noise is reserved for tiny-amplitude micro-surface detail layered on
 * top, added in a later step of this same file). Mirrors the
 * start()/stop()/dispose()/fit() lifecycle shape used elsewhere in this
 * codebase's Three.js composables (see the intro-3d-redesign work's
 * useIntroScene.ts for the same pattern).
 */

/** One sheet's art-directed shape + placement. Curvature values are
 * deliberately hand-tuned constants (see LAYER_PROFILES below), not
 * derived from noise or randomness — the whole point of "deterministic
 * curvature" per the design spec is that these numbers are chosen, not
 * generated. */
export interface SheetProfile {
  /** Curve control points in the sheet's local space (before width
   * extrusion), defining one large intentional arc. 4 points is enough
   * for a single clean bend — more points risk reading as a wave. */
  curvePoints: THREE.Vector3[]
  /** Width of the ribbon perpendicular to the curve's travel direction. */
  width: number
  /** Extrusion thickness (gives the sheet slight physical depth). */
  thickness: number
  /** Bevel size on the extruded edge, so specular highlights can catch
   * the side face — an "engineered material" cue per the design spec. */
  bevelSize: number
}

/**
 * Builds one sheet's geometry: a ribbon that follows `profile.curvePoints`
 * (the deterministic macro shape), given width and slight thickness with a
 * beveled edge. Implemented as a 2D cross-section shape (width x
 * thickness, beveled) extruded along the 3D curve — THREE.ExtrudeGeometry
 * with an `extrudePath` gives us exactly this: deterministic shape control
 * (the path) with real thickness/bevel (the cross-section), no noise
 * anywhere in the geometry itself.
 */
export function buildSheetGeometry(profile: SheetProfile): THREE.ExtrudeGeometry {
  const curve = new THREE.CatmullRomCurve3(profile.curvePoints, false, 'catmullrom', 0.5)

  const halfW = profile.width / 2
  const halfT = profile.thickness / 2
  const crossSection = new THREE.Shape()
  crossSection.moveTo(-halfW, -halfT)
  crossSection.lineTo(halfW, -halfT)
  crossSection.lineTo(halfW, halfT)
  crossSection.lineTo(-halfW, halfT)
  crossSection.closePath()

  const geometry = new THREE.ExtrudeGeometry(crossSection, {
    steps: 48,
    extrudePath: curve,
    bevelEnabled: true,
    bevelThickness: profile.bevelSize,
    bevelSize: profile.bevelSize,
    bevelSegments: 3
  })
  geometry.computeVertexNormals()
  return geometry
}

export interface SheetMaterialOptions {
  metalness: number
  roughness: number
  clearcoat: number
  clearcoatRoughness: number
  /** 0 disables the micro-noise normal perturbation entirely — used by
   * the mobile tier to cut shader cost. */
  microNoiseStrength: number
  /** Rim highlight color mixed in at grazing angles on the beveled edge
   * — this is the ONLY place yellow may appear on a sheet, per the
   * design spec's accent-only color discipline. 0 disables it (used by
   * the background layer, which must not carry the accent). */
  rimAccentColor: THREE.Color | null
  rimAccentStrength: number
}

/**
 * Builds one sheet's material: MeshPhysicalMaterial with Three.js's own
 * PBR lighting pipeline left fully intact (per the design spec — this is
 * an extension via onBeforeCompile, not a shader replacement). The
 * injected GLSL adds two things, both additive on top of the stock
 * physical shader:
 *  1. A tiny-amplitude 3D noise perturbation to the normal, for
 *     brushed/satin micro-surface richness — shape-changing noise is
 *     explicitly forbidden by the spec, so this only nudges shading, it
 *     never displaces geometry.
 *  2. A rim/fresnel-driven mix toward `rimAccentColor` (yellow), so the
 *     accent only ever shows as a thin edge highlight, never a fill.
 */
export function buildSheetMaterial(tint: THREE.Color, options: SheetMaterialOptions): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: options.metalness,
    roughness: options.roughness,
    clearcoat: options.clearcoat,
    clearcoatRoughness: options.clearcoatRoughness,
    fog: true
  })

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMicroNoiseStrength = { value: options.microNoiseStrength }
    shader.uniforms.uRimAccentColor = { value: options.rimAccentColor ?? new THREE.Color(0x000000) }
    shader.uniforms.uRimAccentStrength = { value: options.rimAccentColor ? options.rimAccentStrength : 0 }

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uMicroNoiseStrength;
        uniform vec3 uRimAccentColor;
        uniform float uRimAccentStrength;

        // Cheap hash-based 3D noise — micro-surface imperfection only,
        // amplitude is kept tiny by uMicroNoiseStrength (typically < 0.05).
        float hash3(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          float n = hash3(vWorldPosition * 40.0) - 0.5;
          normal = normalize(normal + vec3(n, n, n) * uMicroNoiseStrength);
        }`
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        {
          float fresnel = pow(1.0 - max(dot(normalize(vViewPosition), normal), 0.0), 3.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uRimAccentColor, fresnel * uRimAccentStrength);
        }`
      )

    // vWorldPosition isn't declared in the stock fragment shader — add it
    // and populate it from the vertex shader so the noise hash has a
    // stable world-space input (screen-space would make the noise swim
    // as the camera drifts, which reads as animated texture, not a
    // static material imperfection).
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vWorldPosition;`
    )
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPosition;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vWorldPosition = worldPosition.xyz;`
      )
  }

  return material
}

// Navy family: lighter/more saturated toward the viewer (foreground),
// progressively darker + desaturated toward the back (background) — per
// the design spec, background depth must NOT come from opacity alone.
const NAVY_FOREGROUND = new THREE.Color(0x123a56)
const NAVY_MIDGROUND = new THREE.Color(0x0c2b42)
const NAVY_BACKGROUND = new THREE.Color(0x081b29)
const YELLOW_ACCENT = new THREE.Color(0xd99400)

interface LayerConfig {
  role: 'foreground' | 'midground' | 'background'
  profile: SheetProfile
  materialOptions: SheetMaterialOptions
  /** Base position offset (world units) — this is what makes the
   * foreground read as "partially off-screen, 30-50% of frame" per the
   * design spec: it's placed off-center and scaled large, not centered
   * and shrunk. */
  position: THREE.Vector3
  rotation: THREE.Euler
  /** Parallax speed multiplier — all layers move along the SAME
   * direction (set once, scene-wide, in buildScene), differing only in
   * speed/amplitude/depth, per the "one directional flow" constraint. */
  parallaxSpeed: number
  parallaxAmplitude: number
}

/**
 * Desktop/tablet: 3 layers. Foreground is the largest, closest, and most
 * off-center (asymmetrical framing, not a centered product-render
 * default). Midground's curve orientation sets the shared diagonal sweep
 * axis every layer's parallax follows. Background is smallest, darkest,
 * flattest (lowest clearcoat/metalness) — a depth cue, not a competing
 * subject.
 */
function buildDesktopLayers(): LayerConfig[] {
  return [
    {
      role: 'background',
      profile: {
        curvePoints: [
          new THREE.Vector3(-6, 3.5, -9),
          new THREE.Vector3(-2, 1.5, -9.5),
          new THREE.Vector3(2.5, -1, -9),
          new THREE.Vector3(6.5, -3, -8.5)
        ],
        width: 5.5,
        thickness: 0.12,
        bevelSize: 0.02
      },
      materialOptions: {
        metalness: 0.35,
        roughness: 0.75,
        clearcoat: 0.15,
        clearcoatRoughness: 0.6,
        microNoiseStrength: 0.015,
        rimAccentColor: null,
        rimAccentStrength: 0
      },
      position: new THREE.Vector3(1, -0.5, 0),
      rotation: new THREE.Euler(0, 0.1, -0.05),
      parallaxSpeed: 0.4,
      parallaxAmplitude: 0.06
    },
    {
      role: 'midground',
      profile: {
        curvePoints: [
          new THREE.Vector3(-7, 4, -4),
          new THREE.Vector3(-1.5, 0.5, -4.8),
          new THREE.Vector3(3, -2.5, -4.2),
          new THREE.Vector3(8, -5, -3.5)
        ],
        width: 6.5,
        thickness: 0.16,
        bevelSize: 0.03
      },
      materialOptions: {
        metalness: 0.55,
        roughness: 0.45,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
        microNoiseStrength: 0.025,
        rimAccentColor: YELLOW_ACCENT,
        rimAccentStrength: 0.12
      },
      position: new THREE.Vector3(-0.8, 0.3, 0),
      rotation: new THREE.Euler(0, -0.08, 0.04),
      parallaxSpeed: 0.7,
      parallaxAmplitude: 0.1
    },
    {
      role: 'foreground',
      profile: {
        curvePoints: [
          new THREE.Vector3(-9, 6, 1.5),
          new THREE.Vector3(-2, 1, 0.8),
          new THREE.Vector3(4, -3.5, 1.2),
          new THREE.Vector3(10, -7, 2)
        ],
        width: 8,
        thickness: 0.22,
        bevelSize: 0.045
      },
      materialOptions: {
        metalness: 0.65,
        roughness: 0.3,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        microNoiseStrength: 0.035,
        rimAccentColor: YELLOW_ACCENT,
        rimAccentStrength: 0.22
      },
      position: new THREE.Vector3(-3.2, -1.2, 0),
      rotation: new THREE.Euler(0, 0.15, 0.02),
      parallaxSpeed: 1,
      parallaxAmplitude: 0.16
    }
  ].map((layer, i) => ({ ...layer, materialOptions: { ...layer.materialOptions }, __tint: [NAVY_BACKGROUND, NAVY_MIDGROUND, NAVY_FOREGROUND][i]! })) as (LayerConfig & { __tint: THREE.Color })[]
}

/**
 * Mobile: reframed, not cropped, per the design spec. 2 layers — the
 * background layer is dropped and the foreground/midground are
 * re-angled/re-scaled (not just repositioned) so the composition still
 * reads as close-to-camera with real depth on a narrow viewport, rather
 * than "the desktop foreground sheet, alone."
 */
function buildMobileLayers(): LayerConfig[] {
  return [
    {
      role: 'midground',
      profile: {
        curvePoints: [
          new THREE.Vector3(-5, 4.5, -3.5),
          new THREE.Vector3(-1, 1, -4),
          new THREE.Vector3(2, -2, -3.5),
          new THREE.Vector3(5.5, -4.5, -3)
        ],
        width: 5,
        thickness: 0.14,
        bevelSize: 0.025
      },
      materialOptions: {
        metalness: 0.5,
        roughness: 0.5,
        clearcoat: 0.4,
        clearcoatRoughness: 0.3,
        microNoiseStrength: 0,
        rimAccentColor: YELLOW_ACCENT,
        rimAccentStrength: 0.1
      },
      position: new THREE.Vector3(0.6, 0.2, 0),
      rotation: new THREE.Euler(0, -0.1, 0.05),
      parallaxSpeed: 0.6,
      parallaxAmplitude: 0.08
    },
    {
      role: 'foreground',
      profile: {
        curvePoints: [
          new THREE.Vector3(-6, 5.5, 1),
          new THREE.Vector3(-1.2, 1.2, 0.5),
          new THREE.Vector3(2.5, -3, 0.8),
          new THREE.Vector3(6.5, -6, 1.3)
        ],
        width: 6,
        thickness: 0.2,
        bevelSize: 0.04
      },
      materialOptions: {
        metalness: 0.6,
        roughness: 0.35,
        clearcoat: 0.75,
        clearcoatRoughness: 0.15,
        microNoiseStrength: 0,
        rimAccentColor: YELLOW_ACCENT,
        rimAccentStrength: 0.2
      },
      position: new THREE.Vector3(-2, -1.5, 0),
      rotation: new THREE.Euler(0, 0.18, 0.03),
      parallaxSpeed: 1,
      parallaxAmplitude: 0.12
    }
  ].map((layer, i) => ({ ...layer, materialOptions: { ...layer.materialOptions }, __tint: [NAVY_MIDGROUND, NAVY_FOREGROUND][i]! })) as (LayerConfig & { __tint: THREE.Color })[]
}

interface SheetInstance {
  mesh: THREE.Mesh
  config: LayerConfig & { __tint: THREE.Color }
  basePosition: THREE.Vector3
}

export function useHeroCurtainScene(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLElement | null>,
  tier: Ref<'desktop' | 'tablet' | 'mobile'>
) {
  let renderer: THREE.WebGLRenderer | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let scene: THREE.Scene | undefined
  let sheetGroup: THREE.Group | undefined
  let sheets: SheetInstance[] = []
  let keyLight: THREE.DirectionalLight | undefined
  let rimLight: THREE.DirectionalLight | undefined
  let ambientLight: THREE.AmbientLight | undefined
  let sweepLight: THREE.DirectionalLight | undefined

  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let reducedMotion = false

  let pointerX = 0
  let pointerY = 0

  // Shared directional flow: every layer's parallax drift moves along
  // this single normalized axis (a diagonal, matching the midground
  // curve's own orientation) — per the "one directional flow" constraint,
  // layers never drift toward different directions, only at different
  // speed/amplitude.
  const FLOW_DIRECTION = new THREE.Vector2(1, -0.4).normalize()

  function buildScene() {
    if (!canvasRef.value || !containerRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    const dprCap = tier.value === 'desktop' ? 1.75 : tier.value === 'tablet' ? 1.5 : 1.25
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap))

    scene = new THREE.Scene()
    // Atmospheric falloff — contributes to background layers reading as
    // genuinely farther away (combined with their darker/desaturated
    // tint and lower clearcoat set in the layer configs), not opacity.
    scene.fog = new THREE.FogExp2(0x081b29, 0.045)

    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    // Off-center, slightly elevated resting position — an intentional
    // asymmetrical framing rather than a dead-center default shot.
    camera.position.set(0.6, 0.4, 9)
    camera.lookAt(-0.4, -0.2, 0)

    keyLight = new THREE.DirectionalLight(0xdbe8f5, 1.6)
    keyLight.position.set(4, 5, 6)
    scene.add(keyLight)
    rimLight = new THREE.DirectionalLight(0x6f9fc9, 0.9)
    rimLight.position.set(-5, -2, -3)
    scene.add(rimLight)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    // The one restrained, real moving light — its position sweeps slowly
    // across the composition (set in tick()). Kept deliberately low
    // intensity: it helps read form/depth, it is not the scene's
    // headline event, per the design spec.
    sweepLight = new THREE.DirectionalLight(0xffffff, 0.55)
    sweepLight.position.set(-6, 3, 4)
    scene.add(sweepLight)

    sheetGroup = new THREE.Group()
    scene.add(sheetGroup)

    const layers = tier.value === 'mobile' ? buildMobileLayers() : buildDesktopLayers()
    sheets = layers.map((config) => {
      const geometry = buildSheetGeometry(config.profile)
      const material = buildSheetMaterial(config.__tint, config.materialOptions)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(config.position)
      mesh.rotation.copy(config.rotation)
      sheetGroup!.add(mesh)
      return { mesh, config, basePosition: config.position.clone() }
    })

    layoutScene()
  }

  function layoutScene() {
    if (!camera || !renderer || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function fit() {
    if (!renderer || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    renderer.setSize(w, h, false)
    layoutScene()
  }

  function tick(dt: number) {
    if (!sheetGroup || !camera || !sweepLight) return
    if (!reducedMotion) elapsed += dt

    // Camera: near-static, small-amplitude ambient drift only — no
    // scroll-reactive tilt, per the design spec.
    if (!reducedMotion) {
      camera.position.x = 0.6 + Math.sin(elapsed * 0.05) * 0.12
      camera.position.y = 0.4 + Math.cos(elapsed * 0.04) * 0.08
      camera.lookAt(-0.4, -0.2, 0)
    }

    // Sheets: same-direction parallax drift, differing only by each
    // layer's own speed/amplitude (never direction) — the mechanism the
    // spec requires for "one directional flow."
    for (const sheet of sheets) {
      if (reducedMotion) {
        sheet.mesh.position.copy(sheet.basePosition)
        continue
      }
      const t = elapsed * sheet.config.parallaxSpeed * 0.05
      const offset = Math.sin(t) * sheet.config.parallaxAmplitude
      sheet.mesh.position.x = sheet.basePosition.x + FLOW_DIRECTION.x * offset
      sheet.mesh.position.y = sheet.basePosition.y + FLOW_DIRECTION.y * offset
    }

    // Restrained light sweep: the sweep light's position slowly orbits
    // the composition. Slow period (120s) and modest radius keep it
    // subtle — a depth/form aid, not an event.
    if (!reducedMotion) {
      const sweepT = elapsed * ((Math.PI * 2) / 120)
      sweepLight.position.set(Math.cos(sweepT) * 7, 3 + Math.sin(sweepT * 0.6) * 1.5, Math.sin(sweepT) * 6)
    }

    // Pointer: very subtle offset only, per the design spec — not a
    // reactive/following effect.
    sheetGroup.rotation.y += (pointerX * 0.02 - sheetGroup.rotation.y) * 0.02
    sheetGroup.rotation.x += (-pointerY * 0.015 - sheetGroup.rotation.x) * 0.02
  }

  function loop(now: number) {
    if (!running) return
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    tick(dt)
    if (renderer && scene && camera) renderer.render(scene, camera)
    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    if (!renderer) buildScene()
    running = true
    lastTime = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (rafId !== undefined) cancelAnimationFrame(rafId)
    rafId = undefined
  }

  function playEntrance() {
    // Sheets are already in their resting composition on build (no
    // chaos-to-order assembly for this scene, per the design spec's
    // "near-static, monumental" motion target) — playEntrance exists so
    // HeroScene.vue's mount sequencing matches the established
    // introReady-gated pattern used elsewhere, but here it's a no-op
    // hook reserved for a future fade-in if the visual QA pass calls
    // for one.
  }

  function setPointer(x: number, y: number) {
    pointerX = x
    pointerY = y
  }

  function setReducedMotion(reduced: boolean) {
    reducedMotion = reduced
  }

  function dispose() {
    stop()
    for (const sheet of sheets) {
      sheet.mesh.geometry.dispose()
      ;(sheet.mesh.material as THREE.Material).dispose()
    }
    sheets = []
    renderer?.dispose()
    renderer = undefined
    scene = undefined
    camera = undefined
    sheetGroup = undefined
    keyLight = undefined
    rimLight = undefined
    ambientLight = undefined
    sweepLight = undefined
    elapsed = 0
  }

  return { start, stop, dispose, fit, playEntrance, setPointer, setReducedMotion }
}
