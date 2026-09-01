import * as THREE from 'three'
import gsap from 'gsap'

interface RibbonSpec {
  x: number
  y: number
  z: number
  rotZ: number
  length: number
  width: number
  curveAmount: number
  color: number
  parallax: number
}

interface RibbonBlade {
  mesh: THREE.Mesh
  basePos: THREE.Vector3
  baseRotZ: number
  phase: number
  amp: number
  delay: number
  parallax: number
}

const NAVY = 0x0b3954
const NAVY_LIGHT = 0x14507a
const YELLOW = 0xfbba00
const INK = 0x10202b
const STEEL = 0x2f6c94

/**
 * Builds one ribbon's flat, curved-blade geometry with a tapered arrow-fin
 * tail — a THREE.Shape outline pushed through ExtrudeGeometry. Matches the
 * "Corner cascade" mockup shape exactly (see the design mockup this was
 * validated against) so the two read as the same visual language.
 */
function makeRibbonGeometry(length: number, width: number, curveAmount: number, tailPinch: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  const segs = 28
  const topPts: THREE.Vector2[] = []
  const botPts: THREE.Vector2[] = []

  for (let i = 0; i <= segs; i++) {
    const p = i / segs
    const x = p * length
    const curve = Math.sin(p * Math.PI * 0.5) * curveAmount
    const w = width * (1 - tailPinch * Math.pow(p, 2.2))
    topPts.push(new THREE.Vector2(x, curve + w / 2))
    botPts.push(new THREE.Vector2(x, curve - w / 2))
  }

  shape.moveTo(topPts[0]!.x, topPts[0]!.y)
  topPts.forEach((pt) => shape.lineTo(pt.x, pt.y))

  const lastTop = topPts[topPts.length - 1]!
  const tip = botPts[botPts.length - 1]!
  shape.lineTo(tip.x + width * 0.55, (lastTop.y + tip.y) / 2)
  for (let i = botPts.length - 1; i >= 0; i--) shape.lineTo(botPts[i]!.x, botPts[i]!.y)
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width * 0.22,
    bevelEnabled: true,
    bevelThickness: width * 0.09,
    bevelSize: width * 0.07,
    bevelSegments: 6
  })
  geo.center()
  return geo
}

function ribbonMaterial(color: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.25,
    roughness: 0.32,
    clearcoat: 0.85,
    clearcoatRoughness: 0.16,
    reflectivity: 0.5,
    side: THREE.DoubleSide
  })
}

/**
 * Faint drifting dust-mote field threaded through the ribbon volume — a
 * cinematic depth cue (like motes catching a light beam), not a sparkle
 * effect. Kept low-count/low-opacity so it reads as atmosphere, never as
 * the focal point.
 */
function makeParticles(): THREE.Points {
  const count = 90
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xdcebf5,
    size: 0.035,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    sizeAttenuation: true
  })

  return new THREE.Points(geo, material)
}

/**
 * Sets up a Three.js scene rendering "Corner cascade": two stacks of six
 * ribbon blades each (bottom-left fanning up-right, top-right fanning
 * down-left), continuously swaying, plus a faint particle field for depth.
 * Each blade's tail is pulled fully outside the viewport frame while its
 * curved body/tip stays inside — the "flowing in from off-screen" read the
 * client asked for, rather than a shape that looks arbitrarily clipped by
 * the frame edge at common desktop breakpoints (1280–1920px, validated via
 * Playwright screenshots).
 *
 * Caller owns viewport/reduced-motion/pointer gating and lifecycle
 * (mount/unmount, resize, IntersectionObserver pause) — this composable
 * only owns the render loop and geometry once told to start.
 */
export function useHeroRibbons(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let scene: THREE.Scene | undefined
  let group: THREE.Group | undefined
  let particles: THREE.Points | undefined
  let blades: RibbonBlade[] = []
  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let pointerX = 0
  let pointerY = 0
  let scrollProgress = 0
  const cameraBase = new THREE.Vector3(0, 0, 9.5)

  function buildScene() {
    if (!canvasRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)

    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.copy(cameraBase)

    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0b3954, 8, 17)

    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(3, 4, 5)
    scene.add(key)

    const rim = new THREE.DirectionalLight(YELLOW, 1.1)
    rim.position.set(-3, -2, 3)
    scene.add(rim)

    const fill = new THREE.DirectionalLight(0xdfe9ee, 0.55)
    fill.position.set(-2, 3, 4)
    scene.add(fill)

    scene.add(new THREE.HemisphereLight(0xffffff, NAVY, 0.55))
    scene.add(new THREE.AmbientLight(0x9fb2bd, 0.4))

    group = new THREE.Group()
    scene.add(group)

    particles = makeParticles()
    scene.add(particles)

    const colors = [NAVY, NAVY_LIGHT, YELLOW, INK, STEEL, NAVY_LIGHT]
    const count = 6
    const specs: RibbonSpec[] = []

    // Bottom-left stack: anchors sit just inside the visible frustum, and
    // each blade's own length/curve carries its tail out past the frame
    // edge — so the anchor (and therefore the body/tip) reads fully inside
    // the viewport while the tail still feels like it flows in from
    // off-screen, at common desktop breakpoints (1280–1920px, verified via
    // Playwright screenshots).
    for (let i = 0; i < count; i++) {
      const p = i / (count - 1)
      specs.push({
        x: -5.15 + p * 0.4,
        y: -4.0 + p * 0.65,
        z: -p * 1.7,
        rotZ: 0.1 - p * 0.4,
        length: 7.0 + p * 0.8,
        width: 1.0 - p * 0.09,
        curveAmount: 1.15 + p * 0.85,
        color: colors[i % colors.length]!,
        parallax: 0.4 + p * 0.5
      })
    }

    // Top-right stack, mirrored.
    for (let i = 0; i < count; i++) {
      const p = i / (count - 1)
      specs.push({
        x: 5.15 - p * 0.4,
        y: 4.0 - p * 0.65,
        z: -p * 1.7,
        rotZ: Math.PI + 0.1 - p * 0.4,
        length: 7.0 + p * 0.8,
        width: 1.0 - p * 0.09,
        curveAmount: 1.15 + p * 0.85,
        color: colors[(i + 3) % colors.length]!,
        parallax: 0.4 + p * 0.5
      })
    }

    blades = specs.map((spec, i) => {
      const geo = makeRibbonGeometry(spec.length, spec.width, spec.curveAmount, 0.6)
      const mesh = new THREE.Mesh(geo, ribbonMaterial(spec.color))
      mesh.position.set(spec.x, spec.y, spec.z)
      mesh.rotation.z = spec.rotZ
      mesh.scale.setScalar(0.001)
      group!.add(mesh)

      return {
        mesh,
        basePos: mesh.position.clone(),
        baseRotZ: spec.rotZ,
        phase: i * 0.7,
        amp: 0.05 + (i % 6) * 0.012,
        delay: i < count ? i * 0.07 : 0.22 + (i - count) * 0.07,
        parallax: spec.parallax
      }
    })

    fit()
  }

  function playEntrance() {
    blades.forEach((b) => {
      gsap.to(b.mesh.scale, { x: 1, y: 1, z: 1, duration: 1.2, delay: 0.15 + b.delay, ease: 'power3.out' })
    })
    if (particles) {
      gsap.fromTo(particles.material, { opacity: 0 }, { opacity: 0.16, duration: 2, delay: 0.6, ease: 'power1.out' })
    }
  }

  function fit() {
    if (!renderer || !camera || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function tick(dt: number) {
    if (!group || !camera) return
    elapsed += dt

    // Cursor parallax: subtle group rotation plus a small camera offset, so
    // the scene reads as real depth rather than a flat rotating sticker.
    const targetRotY = pointerX * 0.11
    const targetRotX = -pointerY * 0.05
    group.rotation.y += (targetRotY - group.rotation.y) * Math.min(dt * 3, 1)
    group.rotation.x += (targetRotX - group.rotation.x) * Math.min(dt * 3, 1)

    const camTargetX = cameraBase.x + pointerX * 0.35
    const camTargetY = cameraBase.y + pointerY * 0.22
    camera.position.x += (camTargetX - camera.position.x) * Math.min(dt * 2.4, 1)
    camera.position.y += (camTargetY - camera.position.y) * Math.min(dt * 2.4, 1)
    camera.lookAt(0, 0, 0)

    // Scroll reaction: as the Hero scrolls out of view, the whole cascade
    // drifts further apart and rotates slightly — feels like the ribbons
    // are being left behind, not just idling.
    group.position.y = -scrollProgress * 1.6
    group.rotation.z = scrollProgress * 0.12

    blades.forEach((b) => {
      const sway = elapsed * (0.28 + b.parallax * 0.18)
      b.mesh.rotation.z = b.baseRotZ + Math.sin(sway + b.phase) * b.amp
      b.mesh.position.y = b.basePos.y + Math.sin(elapsed * 0.3 + b.phase) * 0.13 * b.parallax
      b.mesh.position.x = b.basePos.x + Math.cos(elapsed * 0.22 + b.phase) * 0.1 * b.parallax
    })

    if (particles) {
      particles.rotation.y = elapsed * 0.015
      particles.rotation.x = Math.sin(elapsed * 0.05) * 0.03
    }
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
    blades.forEach((b) => {
      b.mesh.geometry.dispose()
      ;(b.mesh.material as THREE.Material).dispose()
    })
    blades = []
    particles?.geometry.dispose()
    ;(particles?.material as THREE.Material | undefined)?.dispose()
    particles = undefined
    renderer?.dispose()
    renderer = undefined
    scene = undefined
    camera = undefined
    group = undefined
  }

  return { start, stop, dispose, fit, playEntrance, setPointer, setScrollProgress }
}
