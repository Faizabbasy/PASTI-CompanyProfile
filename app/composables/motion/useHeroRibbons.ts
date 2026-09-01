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
}

interface RibbonBlade {
  mesh: THREE.Mesh
  basePos: THREE.Vector3
  baseRotZ: number
  phase: number
  amp: number
  delay: number
}

const NAVY = 0x0b3954
const NAVY_LIGHT = 0x14507a
const YELLOW = 0xfbba00
const INK = 0x10202b

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
    metalness: 0.2,
    roughness: 0.38,
    clearcoat: 0.7,
    clearcoatRoughness: 0.22,
    side: THREE.DoubleSide
  })
}

/**
 * Sets up a Three.js scene rendering "Corner cascade": two stacks of four
 * ribbon blades each (bottom-left fanning up-right, top-right fanning
 * down-left), continuously swaying — validated in a standalone mockup
 * before being wired into Hero.vue. Scene coordinates/camera match the
 * mockup 1:1 so the composition reads identically in production.
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
  let blades: RibbonBlade[] = []
  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let pointerX = 0
  let pointerY = 0

  function buildScene() {
    if (!canvasRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)

    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 9)

    scene = new THREE.Scene()

    const key = new THREE.DirectionalLight(0xffffff, 1.3)
    key.position.set(3, 4, 5)
    scene.add(key)

    const rim = new THREE.DirectionalLight(YELLOW, 0.9)
    rim.position.set(-3, -2, 2)
    scene.add(rim)

    const fill = new THREE.DirectionalLight(0xdfe9ee, 0.55)
    fill.position.set(-2, 3, 4)
    scene.add(fill)

    scene.add(new THREE.HemisphereLight(0xffffff, NAVY, 0.55))
    scene.add(new THREE.AmbientLight(0x9fb2bd, 0.4))

    group = new THREE.Group()
    scene.add(group)

    const colors = [NAVY, NAVY_LIGHT, YELLOW, INK, 0x2f6c94]
    const count = 4
    const specs: RibbonSpec[] = []

    // Bottom-left stack, fanning up and to the right toward the headline.
    for (let i = 0; i < count; i++) {
      const p = i / (count - 1)
      specs.push({
        x: -5.4 + p * 0.5,
        y: -3.6 + p * 1.0,
        z: -p * 1.7,
        rotZ: -0.1 - p * 0.45,
        length: 6.5 + p * 0.8,
        width: 1.0 - p * 0.1,
        curveAmount: 0.9 + p * 0.9,
        color: colors[i % colors.length]!
      })
    }

    // Top-right stack, mirrored: fanning down and to the left toward the headline.
    for (let i = 0; i < count; i++) {
      const p = i / (count - 1)
      specs.push({
        x: 5.4 - p * 0.5,
        y: 3.6 - p * 1.0,
        z: -p * 1.7,
        rotZ: Math.PI - 0.1 - p * 0.45,
        length: 6.5 + p * 0.8,
        width: 1.0 - p * 0.1,
        curveAmount: 0.9 + p * 0.9,
        color: colors[(i + 2) % colors.length]!
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
        phase: i * 0.8,
        amp: 0.05 + (i % 4) * 0.015,
        delay: i < count ? i * 0.08 : 0.25 + (i - count) * 0.08
      }
    })

    fit()
  }

  function playEntrance() {
    blades.forEach((b) => {
      gsap.to(b.mesh.scale, { x: 1, y: 1, z: 1, duration: 1.1, delay: 0.15 + b.delay, ease: 'power3.out' })
    })
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
    if (!group) return
    elapsed += dt
    group.rotation.y = pointerX * 0.06

    blades.forEach((b) => {
      b.mesh.rotation.z = b.baseRotZ + Math.sin(elapsed * 0.4 + b.phase) * b.amp
      b.mesh.position.y = b.basePos.y + Math.sin(elapsed * 0.3 + b.phase) * 0.13
      b.mesh.position.x = b.basePos.x + Math.cos(elapsed * 0.25 + b.phase) * 0.1
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

  function dispose() {
    stop()
    blades.forEach((b) => {
      b.mesh.geometry.dispose()
      ;(b.mesh.material as THREE.Material).dispose()
    })
    blades = []
    renderer?.dispose()
    renderer = undefined
    scene = undefined
    camera = undefined
    group = undefined
  }

  return { start, stop, dispose, fit, playEntrance, setPointer }
}
