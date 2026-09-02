import * as THREE from 'three'

const NAVY = 0x0b3954
const NAVY_DEEP = 0x051b28
const NAVY_LIGHT = 0x1c5c86
const STEEL = 0x3d7fa8
const YELLOW = 0xfbba00

// The headline text is flat 2D HTML composited on top of the canvas, so
// what actually matters for clearance is screen-space position, not any
// single world-space x — the same world x projects to very different
// screen fractions depending on a pillar's depth. Every pillar's lane is
// therefore expressed as (and every frame, recomputed as) a fraction of
// the frustum's own half-width at its *current* z (1 = frame edge, 0 =
// dead center) — see laneFrac on PillarSpec/Pillar and its use in tick().
// The chosen lane fractions (0.86/1.02/1.2, see buildPillarSpecs) sit
// clear of the headline's longest line, which — because font-scaled
// heading text can run noticeably wider than the max-w-5xl container's
// nominal width — measured out to nearly the Hero's full viewport width
// on common desktop sizes, not just its middle fraction.

// Kept well short of the camera's own z (see cameraBase below), not just
// technically in front of it — the frustum is narrow close to the camera
// (a fixed FOV covers less world-width the shorter the distance gets), so
// a pillar allowed to wrap all the way up near the camera would need an
// enormous lane offset to still clear the text column right as it's
// largest on screen. Stopping the loop well before that keeps the
// frustum-at-NEAR_Z wide enough that a sane lane offset stays clear
// throughout the whole pass, not just at rest.
const NEAR_Z = 1.5
const FAR_Z = -34
const SPAN = NEAR_Z - FAR_Z

interface PillarSpec {
  side: -1 | 1
  laneFrac: number
  radius: number
  height: number
  color: number
  speed: number
  bowPhase: number
}

interface Pillar {
  mesh: THREE.Mesh
  side: -1 | 1
  // Fraction of the frustum's own half-width at this pillar's *current*
  // depth, not a fixed world-space x — recomputing position.x from this
  // every frame (see tick()) is what actually keeps every pillar clear of
  // the text column at every depth, since the same world-space x
  // otherwise projects to a shrinking screen fraction as a pillar drifts
  // toward the far end of the loop (a wide-open frustum makes any fixed x
  // look closer to center).
  laneFrac: number
  z: number
  speed: number
  bowPhase: number
  baseScaleY: number
}

/**
 * Builds one arch-shaped pillar: a short tube curving straight up from the
 * ground and back down — read as a gateway rib rather than a flat pole.
 * Vertical, with no lateral lean: any x-offset baked into the geometry
 * itself (rather than driven purely by the mesh's own position, which
 * tick() controls precisely for text clearance) would reintroduce exactly
 * the kind of untracked horizontal drift that let earlier pillars visually
 * cross the headline. Kept as reusable geometry per radius/height
 * combination (pillars share a handful of distinct sizes) rather than
 * one-off per instance, since the corridor needs many of them.
 */
function buildPillarGeometry(radius: number, height: number): THREE.TubeGeometry {
  const segments = 20
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = Math.sin(t * Math.PI * 0.5) * height
    points.push(new THREE.Vector3(0, y, 0))
  }
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4)
  return new THREE.TubeGeometry(curve, 24, radius, 10, false)
}

/**
 * Renders a corridor of repeating navy arch-pillars flanking the Hero's
 * centered text on both sides, receding into depth toward a vanishing
 * point — a "walking through a gateway" environment rather than a small
 * handful of hero-shaped objects. Idle motion is a continuous forward
 * drift: every pillar travels toward the camera and wraps back to the far
 * end once it passes, so the corridor reads as an unbroken, looping walk
 * rather than a fixed diorama. A slow-sweeping key light plus a yellow rim
 * light give each pillar's clearcoat surface a traveling specular
 * highlight; fog fades the far end into the page's own background so the
 * corridor has no visible hard edge.
 *
 * Caller owns viewport/reduced-motion/pointer gating and lifecycle
 * (mount/unmount, resize, IntersectionObserver pause) — this composable
 * only owns the render loop and geometry once told to start.
 */
export function useHeroScene(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let scene: THREE.Scene | undefined
  let group: THREE.Group | undefined
  let pillars: Pillar[] = []
  let keyLight: THREE.DirectionalLight | undefined
  let rimLight: THREE.DirectionalLight | undefined
  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let pointerX = 0
  let pointerY = 0
  let scrollProgress = 0
  // Ramps 0 -> 1 once, via playEntrance(); base visibility never depends
  // on it reaching 1 (only speed/opacity are scaled by it), so a missed or
  // delayed call still leaves a fully visible, if briefly slower, scene.
  let entranceProgress = 1
  const cameraBase = new THREE.Vector3(0, 0.6, 8.5)
  const FOV = 46

  /**
   * Visible half-width of the camera frustum at world-z `z`, given the
   * camera sits at cameraBase.z. Called every frame per pillar (see
   * tick()) to convert each pillar's fixed laneFrac into the actual
   * world-space x that keeps it at that same screen-space fraction
   * regardless of how the frustum's width changes with depth.
   */
  function frustumHalfWidthAt(z: number, aspect: number): number {
    const distance = cameraBase.z - z
    const halfHeight = distance * Math.tan((FOV * Math.PI) / 360)
    return halfHeight * aspect
  }

  function buildPillarSpecs(): PillarSpec[] {
    // Three lane depths per side (near/mid/far lateral offset) so the
    // corridor reads as a real gateway cross-section, not a flat wall of
    // repeated shapes — nearer lanes are taller/thicker, farther lanes
    // shorter/thinner, reinforcing the perspective read independent of
    // fog. 6 z-slots per lane per side = 36 pillars total, evenly spaced
    // through the loop span so the flow never looks sparse.
    //
    // Lane fractions are screen-space fractions of the frustum's own
    // half-width (see frustumHalfWidthAt), all comfortably above
    // TEXT_CLEAR_FRAC (0.42) — tick() recomputes each pillar's actual
    // world x from this fraction every frame at its current depth, so the
    // same screen-space clearance holds throughout the whole loop, not
    // just at one reference depth.
    const lanes = [
      { laneFrac: 0.82, radius: 0.22, height: 3.4, color: NAVY },
      { laneFrac: 0.9, radius: 0.16, height: 2.6, color: NAVY_LIGHT },
      { laneFrac: 0.97, radius: 0.11, height: 1.9, color: STEEL }
    ]
    const slotsPerLane = 9
    const specs: PillarSpec[] = []

    ;([-1, 1] as const).forEach((side) => {
      lanes.forEach((lane, laneIdx) => {
        for (let i = 0; i < slotsPerLane; i++) {
          specs.push({
            side,
            laneFrac: lane.laneFrac,
            radius: lane.radius,
            height: lane.height,
            color: laneIdx % 2 === 0 ? lane.color : NAVY_DEEP,
            speed: 0.85 + Math.random() * 0.35 - laneIdx * 0.12,
            bowPhase: Math.random() * Math.PI * 2
          })
        }
      })
    })

    return specs
  }

  function buildScene() {
    if (!canvasRef.value || !containerRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)

    const rect = containerRef.value.getBoundingClientRect()
    const aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1)

    camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 100)
    camera.position.copy(cameraBase)
    camera.lookAt(0, 0.6, -10)

    scene = new THREE.Scene()
    // Fog matches the Hero's own light background so the corridor's far
    // end dissolves into the page rather than showing a hard cutoff.
    scene.fog = new THREE.Fog(0xf3f6f8, 10, FAR_Z * -1 + 4)

    keyLight = new THREE.DirectionalLight(0xffffff, 1.3)
    keyLight.position.set(4, 6, 8)
    scene.add(keyLight)

    rimLight = new THREE.DirectionalLight(YELLOW, 0.3)
    rimLight.position.set(-5, -2, 4)
    scene.add(rimLight)

    scene.add(new THREE.HemisphereLight(0xdce8ef, NAVY_DEEP, 0.24))

    group = new THREE.Group()
    scene.add(group)

    // Cache geometry per distinct (radius, height) pair rather than
    // building one TubeGeometry per pillar instance — the corridor reuses
    // only 3 lane sizes, so 36 pillars share 3 geometries between them.
    const geoCache = new Map<string, THREE.TubeGeometry>()
    function geometryFor(radius: number, height: number): THREE.TubeGeometry {
      const key = `${radius}:${height}`
      let geo = geoCache.get(key)
      if (!geo) {
        geo = buildPillarGeometry(radius, height)
        geoCache.set(key, geo)
      }
      return geo
    }

    const specs = buildPillarSpecs()
    pillars = specs.map((spec, i) => {
      const material = new THREE.MeshPhysicalMaterial({
        color: spec.color,
        metalness: 0.45,
        roughness: 0.28,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        reflectivity: 0.45
      })

      const mesh = new THREE.Mesh(geometryFor(spec.radius, spec.height), material)
      // Spread initial z evenly through the loop span (offset by pillar
      // index so lanes don't all wrap in sync), rather than all starting
      // at the same depth — the corridor reads as already-flowing on the
      // very first frame instead of visibly assembling. x is set for real
      // in tick()'s first frame (from laneFrac), so the placeholder value
      // here never actually renders.
      const z = FAR_Z + ((i * 0.61803398875) % 1) * SPAN
      mesh.position.z = z
      mesh.rotation.y = spec.side > 0 ? Math.PI : 0
      group!.add(mesh)

      return {
        mesh,
        side: spec.side,
        laneFrac: spec.laneFrac,
        z,
        speed: spec.speed,
        bowPhase: spec.bowPhase,
        baseScaleY: 1
      }
    })

    fit()
  }

  /**
   * Cosmetic entrance: eases the corridor's forward speed and opacity up
   * from a slower, dimmer start rather than snapping straight to full
   * flow. Purely additive — the scene is already fully built and visible
   * before this is ever called.
   */
  function playEntrance() {
    entranceProgress = 0.3
    const start = performance.now()
    const duration = 1800
    function step() {
      const t = Math.min((performance.now() - start) / duration, 1)
      entranceProgress = 0.3 + (1 - Math.pow(1 - t, 3)) * 0.7
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  function fit() {
    if (!renderer || !camera || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function tick(dt: number) {
    if (!group || !camera || !keyLight || !rimLight) return
    // Narrowed to a const so the closures below (pillars.forEach) don't
    // need their own redundant undefined checks — TypeScript can't carry
    // the early-return narrowing through a nested function boundary for a
    // module-level `let`.
    const cam = camera
    elapsed += dt

    // Subtle camera drift toward the pointer — deliberately small
    // magnitudes so it reads as "alive" rather than an obvious follow —
    // plus a slow vertical breathe for a cinematic, handheld-adjacent
    // feel rather than a locked-off shot.
    const camTargetX = cameraBase.x + pointerX * 0.4
    const camTargetY = cameraBase.y + pointerY * 0.22 + Math.sin(elapsed * 0.12) * 0.08
    camera.position.x += (camTargetX - camera.position.x) * Math.min(dt * 1.4, 1)
    camera.position.y += (camTargetY - camera.position.y) * Math.min(dt * 1.4, 1)
    camera.lookAt(pointerX * 0.7, 0.6 + pointerY * 0.3, -10)

    // Scroll reaction: forward speed eases up and the corridor fades as
    // the Hero leaves the viewport, so the transition to the next section
    // reads as pulling away rather than an abrupt cut.
    const scrollSpeedBoost = 1 + scrollProgress * 0.7
    const scrollFade = 1 - scrollProgress * 0.9
    group.position.y = -scrollProgress * 1.1

    // Key light sweeps slowly across the corridor — a moving light source
    // reads as a glossy specular highlight traveling along each pillar's
    // clearcoat surface without needing a custom shader.
    keyLight.position.x = Math.sin(elapsed * 0.1) * 8
    keyLight.position.y = 5 + Math.cos(elapsed * 0.075) * 3
    keyLight.position.z = 6 + Math.sin(elapsed * 0.065) * 4

    rimLight.position.x = -6 + Math.cos(elapsed * 0.06) * 7
    rimLight.position.y = -2 + Math.sin(elapsed * 0.045) * 4
    rimLight.position.z = 4 + Math.cos(elapsed * 0.035) * 3

    const forwardSpeed = 1.6 * scrollSpeedBoost * entranceProgress

    pillars.forEach((p) => {
      p.z += forwardSpeed * p.speed * dt
      if (p.z > NEAR_Z) p.z -= SPAN
      p.mesh.position.z = p.z

      // Fade a pillar in as it enters the far end and out as it nears the
      // camera's near clip, so the wrap-around never reads as a visible
      // pop — combined with fog doing the same job visually at the far
      // end, this keeps both ends of the loop seamless.
      const depthT = (p.z - FAR_Z) / SPAN
      const edgeFade = Math.min(depthT * 4, 1, (1 - depthT) * 3)

      // Text-clearance guarantee, recomputed fresh every frame: x is
      // always laneFrac of the frustum's own half-width AT THIS PILLAR'S
      // CURRENT DEPTH, not a fixed world-space offset — the frustum is
      // narrower close to the camera and wider far away, so a fixed world
      // x drifts toward the screen's center (in fractional terms) as a
      // pillar recedes into the distance. Driving position.x from the
      // fraction directly, every single frame, is what actually keeps
      // every pillar at the same screen-space distance from the text
      // column regardless of depth — a one-time or fade-based clearance
      // check can't guarantee that on a scene where depth keeps changing.
      // The small sine sway rides on top of this as a fraction offset too,
      // so it can never be the thing that pushes a pillar back into the
      // text column.
      const halfWidthHere = frustumHalfWidthAt(p.z, cam.aspect)
      const sway = Math.sin(elapsed * 0.3 + p.bowPhase) * 0.015
      p.mesh.position.x = p.side * (p.laneFrac + sway) * halfWidthHere

      const mat = p.mesh.material as THREE.MeshPhysicalMaterial
      mat.transparent = true
      mat.opacity = Math.max(edgeFade, 0) * entranceProgress * scrollFade
    })
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

  function setPointer(x: number, y: number) {
    pointerX = x
    pointerY = y
  }

  function setScrollProgress(p: number) {
    scrollProgress = p
  }

  function dispose() {
    stop()
    const disposedGeometries = new Set<THREE.BufferGeometry>()
    pillars.forEach((p) => {
      if (!disposedGeometries.has(p.mesh.geometry)) {
        p.mesh.geometry.dispose()
        disposedGeometries.add(p.mesh.geometry)
      }
      ;(p.mesh.material as THREE.Material).dispose()
    })
    pillars = []
    renderer?.dispose()
    renderer = undefined
    scene = undefined
    camera = undefined
    group = undefined
    keyLight = undefined
    rimLight = undefined
    entranceProgress = 1
  }

  return { start, stop, dispose, fit, playEntrance, setPointer, setScrollProgress }
}
