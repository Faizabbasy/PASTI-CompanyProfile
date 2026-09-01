import * as THREE from 'three'
import gsap from 'gsap'

interface ShardSpec {
  geometry: THREE.BufferGeometry
  x: number
  y: number
  z: number
  scale: number
  color: number
  rotSpeedX: number
  rotSpeedY: number
  rotSpeedZ: number
  floatAmp: number
  floatSpeed: number
  floatPhase: number
  parallax: number
}

interface Shard {
  mesh: THREE.Mesh
  basePos: THREE.Vector3
  targetScale: number
  rotSpeedX: number
  rotSpeedY: number
  rotSpeedZ: number
  floatAmp: number
  floatSpeed: number
  floatPhase: number
  parallax: number
  delay: number
}

const NAVY = 0x0b3954
const NAVY_LIGHT = 0x1c5c86
const YELLOW = 0xfbba00
const INK = 0x0e1b24
const STEEL = 0x3d7fa8

/**
 * Builds a small library of faceted, low-poly gem shapes (not spheres/cubes)
 * so the field reads as deliberate "cut crystal" geometry rather than stock
 * primitives — the Awwwards-style floating-shard look. Each shape is a
 * distorted/truncated polyhedron pushed slightly off-regular so facets catch
 * light unevenly, like a real cut gem.
 */
function buildShapeLibrary(): THREE.BufferGeometry[] {
  const shapes: THREE.BufferGeometry[] = []

  const ico = new THREE.IcosahedronGeometry(1, 0)
  jitterVertices(ico, 0.12)
  shapes.push(ico)

  const octa = new THREE.OctahedronGeometry(1, 0)
  jitterVertices(octa, 0.14)
  shapes.push(octa)

  const tetra = new THREE.TetrahedronGeometry(1.15, 0)
  jitterVertices(tetra, 0.1)
  shapes.push(tetra)

  const dode = new THREE.DodecahedronGeometry(0.95, 0)
  jitterVertices(dode, 0.08)
  shapes.push(dode)

  shapes.forEach((geo) => geo.computeVertexNormals())
  return shapes
}

function jitterVertices(geo: THREE.BufferGeometry, amount: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + (Math.random() - 0.5) * amount
    const y = pos.getY(i) + (Math.random() - 0.5) * amount
    const z = pos.getZ(i) + (Math.random() - 0.5) * amount
    pos.setXYZ(i, x, y, z)
  }
  pos.needsUpdate = true
}

function shardMaterial(color: number, glass: boolean): THREE.MeshPhysicalMaterial {
  if (glass) {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.05,
      roughness: 0.06,
      transmission: 0.82,
      thickness: 1.4,
      ior: 1.4,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide
    })
  }
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    reflectivity: 0.6,
    side: THREE.DoubleSide
  })
}

/**
 * Faint drifting dust-mote field for atmosphere/depth — low-count,
 * low-opacity, never the focal point.
 */
function makeParticles(): THREE.Points {
  const count = 70
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xdcebf5,
    size: 0.03,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    sizeAttenuation: true
  })

  return new THREE.Points(geo, material)
}

/**
 * Renders a symmetric field of floating, slowly tumbling faceted crystal
 * shards flanking the Hero's centered text — two clusters (left, right)
 * whose outermost members sit well inside the camera frustum at every
 * common desktop width, so nothing reads as arbitrarily clipped. Position
 * spread is expressed as a fraction of the frustum's visible half-width/
 * height at each shard's own depth (computed from actual camera FOV/z),
 * not hand-tuned world units — so the composition self-corrects across
 * aspect ratios instead of needing re-tuning per breakpoint.
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
  let particles: THREE.Points | undefined
  let shards: Shard[] = []
  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false
  let pointerX = 0
  let pointerY = 0
  let scrollProgress = 0
  const cameraBase = new THREE.Vector3(0, 0, 10)
  const FOV = 42

  /** Visible half-height/width of the frustum at world-z `z`, given the camera sits at cameraBase.z. */
  function frustumHalfExtents(z: number) {
    const distance = cameraBase.z - z
    const halfHeight = distance * Math.tan((FOV * Math.PI) / 360)
    return { halfHeight, halfWidth: halfHeight } // aspect applied by caller
  }

  function buildScene() {
    if (!canvasRef.value || !containerRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)

    const rect = containerRef.value.getBoundingClientRect()
    const aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1)

    camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 100)
    camera.position.copy(cameraBase)

    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0b3954, 10, 22)

    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 5, 6)
    scene.add(key)

    const rim = new THREE.DirectionalLight(YELLOW, 1.3)
    rim.position.set(-4, -3, 3)
    scene.add(rim)

    const fill = new THREE.DirectionalLight(0xdfe9ee, 0.6)
    fill.position.set(-3, 3, 5)
    scene.add(fill)

    scene.add(new THREE.HemisphereLight(0xffffff, NAVY, 0.5))
    scene.add(new THREE.AmbientLight(0x9fb2bd, 0.35))

    group = new THREE.Group()
    scene.add(group)

    particles = makeParticles()
    scene.add(particles)

    const shapeLib = buildShapeLibrary()
    const palette = [NAVY, NAVY_LIGHT, YELLOW, INK, STEEL]
    const specs: ShardSpec[] = []

    // Four quadrant slots (top-left, bottom-left, top-right, bottom-right),
    // each holding a small number of shards placed on their own fixed grid
    // cell — not randomly scattered within a shared region — so shapes sit
    // clearly apart from each other instead of overlapping into a single
    // blob. fx/fy are fractions of the frustum half-extents at each shard's
    // own depth, so every position is guaranteed inside the visible frame
    // regardless of aspect ratio; fx stays well clear of center so nothing
    // crosses into the headline's text column, fy stays clear of the
    // vertical mid-band where the headline sits.
    const quadrants = [
      { sideX: -1, sideY: 1 },
      { sideX: -1, sideY: -1 },
      { sideX: 1, sideY: 1 },
      { sideX: 1, sideY: -1 }
    ]

    // Each quadrant gets 3 shards on a diagonal ladder running from the
    // outer frame edge toward (but never reaching) the text column, spaced
    // far enough apart on both axes that their bounding spheres can't touch
    // even at max scale. The nearest-to-center slot still sits clear of the
    // headline's max-width column and the CTA row's vertical band.
    const slotOffsets = [
      { dx: 0, dy: 0, dz: 0 },
      { dx: 0.22, dy: 0.24, dz: -1.8 },
      { dx: 0.06, dy: 0.5, dz: -3.4 }
    ]

    let globalIndex = 0
    quadrants.forEach(({ sideX, sideY }) => {
      slotOffsets.forEach((slot, slotIndex) => {
        const z = -2 - slot.dz * -1 - slotIndex * 0.6
        const { halfHeight, halfWidth } = frustumHalfExtents(z)

        const fx = 0.66 + slot.dx
        const fy = 0.58 + slot.dy

        const geo = shapeLib[globalIndex % shapeLib.length]!
        const scale = 0.4 + (globalIndex % 3) * 0.12

        specs.push({
          geometry: geo,
          x: sideX * fx * halfWidth,
          y: sideY * fy * halfHeight,
          z,
          scale,
          color: palette[globalIndex % palette.length]!,
          rotSpeedX: 0.05 + Math.random() * 0.09,
          rotSpeedY: 0.04 + Math.random() * 0.08,
          rotSpeedZ: (Math.random() - 0.5) * 0.05,
          floatAmp: 0.12 + Math.random() * 0.16,
          floatSpeed: 0.18 + Math.random() * 0.16,
          floatPhase: Math.random() * Math.PI * 2,
          parallax: 0.35 + slotIndex * 0.2
        })
        globalIndex++
      })
    })

    shards = specs.map((spec, i) => {
      const glass = i % 3 === 1
      const mesh = new THREE.Mesh(spec.geometry, shardMaterial(spec.color, glass))
      mesh.position.set(spec.x, spec.y, spec.z)
      mesh.scale.setScalar(0.001)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      group!.add(mesh)

      return {
        mesh,
        basePos: mesh.position.clone(),
        targetScale: spec.scale,
        rotSpeedX: spec.rotSpeedX,
        rotSpeedY: spec.rotSpeedY,
        rotSpeedZ: spec.rotSpeedZ,
        floatAmp: spec.floatAmp,
        floatSpeed: spec.floatSpeed,
        floatPhase: spec.floatPhase,
        parallax: spec.parallax,
        delay: i * 0.05
      }
    })

    fit()
  }

  function playEntrance() {
    shards.forEach((s) => {
      const target = s.targetScale
      gsap.to(s.mesh.scale, { x: target, y: target, z: target, duration: 1.3, delay: 0.1 + s.delay, ease: 'back.out(1.4)' })
    })
    if (particles) {
      gsap.fromTo(particles.material, { opacity: 0 }, { opacity: 0.14, duration: 2.2, delay: 0.5, ease: 'power1.out' })
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

    // Cursor parallax: group rotation plus a camera offset so the field
    // reads as real depth, not a flat rotating sticker.
    const targetRotY = pointerX * 0.16
    const targetRotX = -pointerY * 0.08
    group.rotation.y += (targetRotY - group.rotation.y) * Math.min(dt * 2.6, 1)
    group.rotation.x += (targetRotX - group.rotation.x) * Math.min(dt * 2.6, 1)

    const camTargetX = cameraBase.x + pointerX * 0.4
    const camTargetY = cameraBase.y + pointerY * 0.25
    camera.position.x += (camTargetX - camera.position.x) * Math.min(dt * 2.2, 1)
    camera.position.y += (camTargetY - camera.position.y) * Math.min(dt * 2.2, 1)
    camera.lookAt(0, 0, 0)

    // Scroll reaction: as the Hero scrolls out of view, the whole field
    // drifts apart and rotates — feels alive rather than idling.
    group.position.y = -scrollProgress * 1.4
    group.rotation.z = scrollProgress * 0.1

    shards.forEach((s) => {
      s.mesh.rotation.x += s.rotSpeedX * dt
      s.mesh.rotation.y += s.rotSpeedY * dt
      s.mesh.rotation.z += s.rotSpeedZ * dt

      const float = Math.sin(elapsed * s.floatSpeed + s.floatPhase) * s.floatAmp
      s.mesh.position.y = s.basePos.y + float * s.parallax
      s.mesh.position.x = s.basePos.x + Math.cos(elapsed * s.floatSpeed * 0.7 + s.floatPhase) * 0.08 * s.parallax
    })

    if (particles) {
      particles.rotation.y = elapsed * 0.012
      particles.rotation.x = Math.sin(elapsed * 0.04) * 0.03
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
    shards.forEach((s) => {
      ;(s.mesh.material as THREE.Material).dispose()
    })
    shards = []
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
