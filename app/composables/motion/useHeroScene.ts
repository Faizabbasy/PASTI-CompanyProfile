import * as THREE from 'three'
import gsap from 'gsap'

const NAVY = 0x0b3954
const NAVY_DEEP = 0x051b28
const NAVY_LIGHT = 0x1c5c86
const STEEL = 0x3d7fa8
const YELLOW = 0xfbba00

// Foreground ribbons sit close to the camera, so their world-space radius
// reads much larger on screen (perspective) than the same radius would
// farther back — needs a wider world-space clearance to still look clear
// of the text at the screen level. Shared between the base-curve clearance
// guard and the roll-up morph target's clamp so both agree on the same
// boundary.
const TEXT_CLEAR_X_FORE = 6.4
const TEXT_CLEAR_X = 4.6

/**
 * Large curved "ribbon" bands — thick tubular arcs running from close to
 * the camera back into depth, monumental and close-framed rather than a
 * distant decorative field. Built with TubeGeometry along a Catmull-Rom
 * curve per ribbon (not a flat plane) so it reads as a solid glossy band
 * with real cross-section, catching a moving specular highlight as it
 * curves.
 */
interface RibbonSpec {
  points: THREE.Vector3[]
  radius: number
  color: number
  layer: 'fore' | 'mid' | 'back'
  driftAmp: number
  driftSpeed: number
  driftPhase: number
  bobAmp: number
}

interface Ribbon {
  mesh: THREE.Mesh
  basePos: THREE.Vector3
  baseRot: THREE.Euler
  driftAmp: number
  driftSpeed: number
  driftPhase: number
  bobAmp: number
  parallax: number
}

/**
 * Builds a smooth arcing spine for one ribbon: starts near the camera
 * (large |z| toward NEAR) and sweeps back toward the background, with a
 * lateral curve so it reads as an arch/band rather than a straight beam.
 * `bulge` bows the curve sideways, `rise` lifts/drops it vertically across
 * its length — varying both per ribbon keeps the set from reading as
 * repeated copies of one shape. A high segment count keeps both this curve
 * and its roll-up morph target smooth under TubeGeometry's own Frenet-frame
 * interpolation, rather than reading faceted.
 */
function buildRibbonCurve(opts: {
  startX: number
  startY: number
  startZ: number
  endX: number
  endY: number
  endZ: number
  bulge: number
  rise: number
}): THREE.Vector3[] {
  const { startX, startY, startZ, endX, endY, endZ, bulge, rise } = opts
  const segments = 32
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = startX + (endX - startX) * t + Math.sin(t * Math.PI) * bulge
    const y = startY + (endY - startY) * t + Math.sin(t * Math.PI * 0.85) * rise
    const z = startZ + (endZ - startZ) * t
    points.push(new THREE.Vector3(x, y, z))
  }
  return points
}

/**
 * Builds the press-and-hold "roll up" variant of the same spine: same
 * point count as the base curve (required — morph targets need matching
 * vertex topology). Each point eases from its resting position toward a
 * tight vertical coil sitting above the ribbon's own top end, as if the
 * band were being reeled upward and spooled into a small roll — the
 * "naik ke atas terus roll" motion — rather than winding along its own
 * length in place (the earlier spiral-in-place version).
 */
function buildRollUpCurve(basePoints: THREE.Vector3[], coilRadius: number, turns: number, phase: number, minAbsX: number): THREE.Vector3[] {
  // Reel toward whichever endpoint sits higher, so the roll reads as
  // "gathering upward" regardless of which end of the curve is index 0.
  const first = basePoints[0]!
  const last = basePoints[basePoints.length - 1]!
  const reelTarget = first.y >= last.y ? first : last
  // Capped well below the fixed transparent header band — without this,
  // a ribbon whose top end already sits high (the foreground ribbons
  // nearest the camera) spools up into a coil that visually collides with
  // the navbar even though the navbar's own z-index keeps it clickable.
  // The coil's own radius adds further screen-space reach on top of this
  // center point, so the cap sits well below the header, not just below
  // frame-top.
  const MAX_SPOOL_Y = 0.6
  const spoolCenter = new THREE.Vector3(reelTarget.x, Math.min(reelTarget.y + 2.4, MAX_SPOOL_Y), reelTarget.z)

  return basePoints.map((p, i) => {
    const t = i / (basePoints.length - 1)
    // proximityToReel is 1 at the reel end itself and 0 at the far end —
    // gather must be highest (fully at spoolCenter) right at the reel end
    // and ease down toward the far end, which stays closer to its
    // original position. Points nearer the reel end gather in faster
    // (their gather rises toward 1 sooner as press progresses further)
    // so the coil reads as spooling from that end rather than every point
    // converging at once.
    const proximityToReel = reelTarget === first ? 1 - t : t
    const gather = Math.pow(proximityToReel, 0.6)

    const angle = proximityToReel * Math.PI * 2 * turns + phase
    const spin = new THREE.Vector3(Math.cos(angle) * coilRadius, Math.sin(angle) * coilRadius * 0.4, Math.sin(angle) * coilRadius * 0.6)

    const point = new THREE.Vector3().lerpVectors(p, spoolCenter, gather).add(spin.multiplyScalar(gather))

    // Same hard clamp as the base-curve guard below: whatever the spool
    // and spin math produce, no point is allowed to end up closer to the
    // z-axis than the text-clearance boundary.
    if (Math.abs(point.x) < minAbsX) {
      point.x = (point.x >= 0 ? 1 : -1) * minAbsX
    }
    return point
  })
}

/**
 * Renders a small set of large, curved glossy ribbon bands sweeping from
 * near the camera into deep background, framing the Hero's centered text
 * with a monumental, immersive 3D environment rather than a distant
 * decorative effect. Idle motion is a slow forward/backward drift along
 * the camera axis (a "walking closer, drifting back" ambient breathing)
 * rather than rotation, plus subtle pointer parallax. Press-and-hold winds
 * each ribbon up into a tight vertical coil above its own top end and
 * releases back smoothly — no per-frame geometry rebuild, driven by a
 * precomputed morph target. Dark navy/ink surfaces with strong specular
 * response and a slow-traveling highlight (via animated light positions)
 * give the glossy/metallic read; a low-intensity yellow rim light ties the
 * accent back to the PASTI palette without a constant emissive tint
 * washing out the navy base color.
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
  let ribbons: Ribbon[] = []
  let keyLight: THREE.DirectionalLight | undefined
  let rimLight: THREE.DirectionalLight | undefined
  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let pointerX = 0
  let pointerY = 0
  let scrollProgress = 0
  // Starts at 1 (fully visible) rather than 0 — playEntrance() is a cosmetic
  // fade-in on top of this, not the gate for base visibility. Gating base
  // visibility on an intro-timeline callback firing meant any failure/race
  // in that timeline (a separate composable's ready-flag) left the scene
  // permanently invisible even though it was rendering correctly.
  let entranceProgress = 1
  // 0 = resting arc shape, 1 = fully rolled up (press-and-hold shape).
  // Driven by a GSAP tween in setPressed() rather than snapping instantly,
  // so the roll winds up/unwinds smoothly rather than popping.
  let pressProgress = 0
  let pressTween: gsap.core.Tween | undefined
  const cameraBase = new THREE.Vector3(0, 0.4, 9.5)
  const FOV = 38

  // The fixed header sits on top of the Hero at up to ~84px tall while
  // fully transparent — nothing in the scene should visually rise into
  // that screen-space band, or it collides with the logo/nav.
  const HEADER_CLEARANCE_PX = 140

  function frustumHalfExtents(z: number) {
    const distance = cameraBase.z - z
    const halfHeight = distance * Math.tan((FOV * Math.PI) / 360)
    const aspect = camera?.aspect ?? 1
    return { halfHeight, halfWidth: halfHeight * aspect }
  }

  function buildRibbonSpecs(): RibbonSpec[] {
    // Six ribbons across three depth bands so foreground/mid/background
    // parallax reads clearly. Every curve's endpoints AND midpoint stay
    // outside a fixed text-clearance half-width (TEXT_CLEAR_X) around the
    // z-axis, so the band frames the headline from the left/right/corners
    // rather than crossing directly over it — clipping through the frame
    // edges (per the reference's "object cropped by viewport" framing) is
    // fine, clipping through the text column is not.
    const specs: RibbonSpec[] = [
      {
        points: buildRibbonCurve({ startX: -9.5, startY: -4.5, startZ: 6.5, endX: -7.8, endY: 2.6, endZ: -8, bulge: -1.6, rise: 0.4 }),
        radius: 0.6,
        color: NAVY,
        layer: 'fore',
        driftAmp: 2.4,
        driftSpeed: 0.1,
        driftPhase: 0,
        bobAmp: 0.12
      },
      {
        points: buildRibbonCurve({ startX: 10, startY: 2.7, startZ: 7, endX: 8.1, endY: -4.4, endZ: -8, bulge: 1.8, rise: -0.3 }),
        radius: 0.54,
        color: NAVY_DEEP,
        layer: 'fore',
        driftAmp: 2.2,
        driftSpeed: 0.09,
        driftPhase: 1.4,
        bobAmp: 0.11
      },
      {
        points: buildRibbonCurve({ startX: -6.4, startY: 5, startZ: -1, endX: -5.6, endY: -5.4, endZ: -12, bulge: -1.4, rise: 0.5 }),
        radius: 0.38,
        color: NAVY_LIGHT,
        layer: 'mid',
        driftAmp: 1.6,
        driftSpeed: 0.12,
        driftPhase: 2.6,
        bobAmp: 0.09
      },
      {
        points: buildRibbonCurve({ startX: 6.8, startY: -5, startZ: -1.5, endX: 5.9, endY: 5.2, endZ: -12.5, bulge: 1.3, rise: -0.4 }),
        radius: 0.36,
        color: STEEL,
        layer: 'mid',
        driftAmp: 1.6,
        driftSpeed: 0.11,
        driftPhase: 3.8,
        bobAmp: 0.09
      },
      {
        points: buildRibbonCurve({ startX: -5.2, startY: -5.5, startZ: -10, endX: -4.6, endY: 5.8, endZ: -20, bulge: -1.4, rise: 0.3 }),
        radius: 0.24,
        color: NAVY_DEEP,
        layer: 'back',
        driftAmp: 1,
        driftSpeed: 0.08,
        driftPhase: 5,
        bobAmp: 0.06
      },
      {
        points: buildRibbonCurve({ startX: 5.4, startY: 5.6, startZ: -10.5, endX: 4.8, endY: -5.6, endZ: -20.5, bulge: 1.3, rise: -0.3 }),
        radius: 0.22,
        color: NAVY_LIGHT,
        layer: 'back',
        driftAmp: 1,
        driftSpeed: 0.085,
        driftPhase: 6.1,
        bobAmp: 0.06
      }
    ]

    // Safety check (dev-time only cost, negligible): every ribbon must stay
    // outside the text clearance column, using a wider margin for the
    // foreground layer since its on-screen size is larger at the same
    // world-space radius. Kept as a guard rather than a silent visual
    // assumption, since a future tuning pass could easily reintroduce a
    // curve that drifts back across the text.
    specs.forEach((spec) => {
      const clear = spec.layer === 'fore' ? TEXT_CLEAR_X_FORE : TEXT_CLEAR_X
      spec.points.forEach((p) => {
        if (Math.abs(p.x) < clear && p.z > -12) {
          console.warn('[HeroScene] ribbon point drifts into text clearance column', p)
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
    camera.lookAt(0, 0.3, -6)

    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xf3f6f8, 14, 30)

    // Key light drives the traveling specular streak — its position is
    // animated in tick() rather than using a custom shader, which stays
    // cheap while still reading as a highlight sliding across each ribbon's
    // glossy surface as the light sweeps past it.
    keyLight = new THREE.DirectionalLight(0xffffff, 1.1)
    keyLight.position.set(4, 6, 8)
    scene.add(keyLight)

    rimLight = new THREE.DirectionalLight(YELLOW, 0.25)
    rimLight.position.set(-5, -2, 4)
    scene.add(rimLight)

    scene.add(new THREE.HemisphereLight(0xdce8ef, NAVY_DEEP, 0.22))

    group = new THREE.Group()
    scene.add(group)

    const specs = buildRibbonSpecs()
    ribbons = specs.map((spec, i) => {
      const curve = new THREE.CatmullRomCurve3(spec.points, false, 'catmullrom', 0.5)
      const tubularSegments = 80
      const radialSegments = 12
      const geo = new THREE.TubeGeometry(curve, tubularSegments, spec.radius, radialSegments, false)

      // Roll-up morph target: same tubular/radial segment counts as the
      // base geometry (required — morph targets need matching vertex
      // topology), built from the reeled-in variant of the same spine.
      // Assigning it as morphAttributes.position lets pressProgress drive
      // the press-and-hold "ribbon rolls up" shape purely via
      // morphTargetInfluences, with no per-frame geometry rebuild.
      const clear = spec.layer === 'fore' ? TEXT_CLEAR_X_FORE : TEXT_CLEAR_X
      // Foreground ribbons carry the largest tube radius and sit closest to
      // the camera, so the same coilRadius multiplier reads far larger on
      // screen than it does for mid/back ribbons — a smaller multiplier
      // keeps their rolled-up coil compact enough to clear the header.
      const coilMultiplier = spec.layer === 'fore' ? 0.7 : 1.5
      const rollPoints = buildRollUpCurve(spec.points, spec.radius * coilMultiplier, 5, i * 1.7, clear)
      const rollCurveObj = new THREE.CatmullRomCurve3(rollPoints, false, 'catmullrom', 0.5)
      const rollGeo = new THREE.TubeGeometry(rollCurveObj, tubularSegments, spec.radius, radialSegments, false)
      geo.morphAttributes.position = [rollGeo.attributes.position as THREE.BufferAttribute]
      rollGeo.dispose()

      // No constant emissive tint — an always-on emissive color washes the
      // whole surface with yellow regardless of light position, which read
      // as a flat brownish tone instead of navy. The yellow accent comes
      // only from rimLight's reflected specular (position-dependent, so it
      // can read as a moving streak), keeping the base surface color true
      // navy/steel.
      const material = new THREE.MeshPhysicalMaterial({
        color: spec.color,
        metalness: 0.4,
        roughness: 0.32,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        reflectivity: 0.4
      })

      const mesh = new THREE.Mesh(geo, material)
      mesh.morphTargetInfluences = [0]
      const basePos = new THREE.Vector3(0, 0, 0)
      mesh.position.copy(basePos)
      group!.add(mesh)

      const parallax = spec.layer === 'fore' ? 1 : spec.layer === 'mid' ? 0.6 : 0.32

      return {
        mesh,
        basePos,
        baseRot: mesh.rotation.clone(),
        driftAmp: spec.driftAmp,
        driftSpeed: spec.driftSpeed,
        driftPhase: spec.driftPhase,
        bobAmp: spec.bobAmp,
        parallax
      }
    })

    fit()
  }

  /**
   * Optional cosmetic entrance: eases the scene from a dimmed start up to
   * full presence, so it feels like it's settling in rather than snapping
   * on. Purely additive — base visibility does not depend on this ever
   * being called (see entranceProgress above).
   */
  function playEntrance() {
    entranceProgress = 0.4
    gsap.to(
      { t: 0 },
      {
        t: 1,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: function () {
          entranceProgress = (this.targets()[0] as { t: number }).t
        }
      }
    )
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
    elapsed += dt

    // Subtle camera drift toward the pointer — deliberately small
    // magnitudes so it reads as "alive" rather than an obvious follow.
    const camTargetX = cameraBase.x + pointerX * 0.35
    const camTargetY = cameraBase.y + pointerY * 0.2
    camera.position.x += (camTargetX - camera.position.x) * Math.min(dt * 1.4, 1)
    camera.position.y += (camTargetY - camera.position.y) * Math.min(dt * 1.4, 1)
    camera.lookAt(pointerX * 0.6, 0.3 + pointerY * 0.3, -6)

    // Scroll reaction: the whole ribbon environment fades and drifts back
    // slightly as the Hero leaves the viewport, so the transition to the
    // next section doesn't feel abrupt.
    const scrollFade = 1 - scrollProgress * 0.9
    group.position.y = -scrollProgress * 0.9

    // Key light sweeps slowly across the scene — this is the "highlight
    // traveling along the surface" effect: a moving light source reads as
    // a glossy specular streak sliding across each ribbon's curved tube
    // without needing a custom shader.
    keyLight.position.x = Math.sin(elapsed * 0.11) * 7
    keyLight.position.y = 4 + Math.cos(elapsed * 0.08) * 3
    keyLight.position.z = 6 + Math.sin(elapsed * 0.07) * 3

    // Rim light sweeps on its own slower, out-of-phase path — this is what
    // reads as the yellow specular streak gliding along the ribbon
    // surfaces over time, independent of the white key light's highlight.
    rimLight.position.x = -5 + Math.cos(elapsed * 0.065) * 6
    rimLight.position.y = -2 + Math.sin(elapsed * 0.05) * 4
    rimLight.position.z = 4 + Math.cos(elapsed * 0.04) * 2.5

    ribbons.forEach((r) => {
      // Idle motion: a slow forward/backward drift along the camera axis
      // (z), like the ribbon is walking closer then drifting back —
      // "zoom in / zoom out" rather than rotating. A slight vertical bob
      // and pointer parallax layer on top, scaled by depth so foreground
      // ribbons move more than background ones.
      const drift = Math.sin(elapsed * r.driftSpeed + r.driftPhase) * r.driftAmp
      const bob = Math.sin(elapsed * r.driftSpeed * 1.3 + r.driftPhase) * r.bobAmp

      r.mesh.position.z = r.basePos.z + drift * (1 - pressProgress)
      r.mesh.position.y = r.basePos.y + bob + pointerY * 0.12 * r.parallax + pressProgress * 0.5 * r.parallax
      r.mesh.position.x = r.basePos.x + pointerX * 0.18 * r.parallax * (1 - pressProgress)

      if (r.mesh.morphTargetInfluences) r.mesh.morphTargetInfluences[0] = pressProgress

      const mat = r.mesh.material as THREE.MeshPhysicalMaterial
      mat.opacity = 1
      mat.transparent = scrollFade < 1
      if (mat.transparent) mat.opacity = Math.max(scrollFade, 0)
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

  /**
   * Drives the press-and-hold "roll up" transformation: eases
   * pressProgress toward 1 while held, back toward 0 on release. Called
   * from pointerdown/pointerup in HeroScene.vue; safe to call repeatedly
   * (each call kills the in-flight tween so a fast press/release/press
   * doesn't queue up stale tweens fighting each other).
   */
  function setPressed(pressed: boolean) {
    pressTween?.kill()
    pressTween = gsap.to(
      { v: pressProgress },
      {
        v: pressed ? 1 : 0,
        duration: pressed ? 1.1 : 0.8,
        ease: pressed ? 'power2.out' : 'power2.inOut',
        onUpdate: function () {
          pressProgress = (this.targets()[0] as { v: number }).v
        }
      }
    )
  }

  function dispose() {
    stop()
    pressTween?.kill()
    gsap.killTweensOf(ribbons.map((r) => r.mesh.material))
    ribbons.forEach((r) => {
      r.mesh.geometry.dispose()
      ;(r.mesh.material as THREE.Material).dispose()
    })
    ribbons = []
    renderer?.dispose()
    renderer = undefined
    scene = undefined
    camera = undefined
    group = undefined
    keyLight = undefined
    rimLight = undefined
    entranceProgress = 1
    pressProgress = 0
  }

  return { start, stop, dispose, fit, playEntrance, setPointer, setScrollProgress, setPressed }
}
