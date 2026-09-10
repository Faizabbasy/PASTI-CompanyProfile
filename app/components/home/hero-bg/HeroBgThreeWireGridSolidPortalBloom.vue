<script setup lang="ts">
// 3D — Solid/extruded evolution of HeroBgThreeWireGridDollyPinned. The
// hallway's corner-bracket frames are no longer flat LineSegments: each
// is a real extruded ring (TorusGeometry, squared into a rounded-rect
// profile via a custom Shape) with MeshPhysicalMaterial under a PMREM
// environment map + key/rim lighting, so they have genuine volume,
// bevel highlights, and specular response — reads as machined metal
// rings, not wireframe. Pin + scrub-driven dolly, corner registration
// marks, running kicker label, and arrival vignette are carried over
// unchanged from the wireframe version.
//
// End-of-scroll payoff (the reason for this variant): once dolly progress
// reaches 1, the final ring's emissive intensity ramps up and it slowly
// scales/breathes outward like a portal opening into light — a bloom-style
// "arrival" climax that then holds at a gentle idle pulse until the user
// scrolls on to the next section, rather than snapping to a static end
// frame.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

const borderProgress = ref(0)
const arrivalIntensity = ref(0)
const MARK_INSET = 3
const markLength = 4.5
const corners = [
  { id: 'tl', x: MARK_INSET, y: MARK_INSET, dx: 1, dy: 1, accent: true, delay: 0 },
  { id: 'tr', x: 100 - MARK_INSET, y: MARK_INSET, dx: -1, dy: 1, accent: false, delay: 0.04 },
  { id: 'bl', x: MARK_INSET, y: 100 - MARK_INSET, dx: 1, dy: -1, accent: false, delay: 0.08 },
  { id: 'br', x: 100 - MARK_INSET, y: 100 - MARK_INSET, dx: -1, dy: -1, accent: false, delay: 0.12 }
].map((c) => ({
  ...c,
  reveal: computed(() => Math.min(Math.max(borderProgress.value * 1.3 - c.delay, 0), 1))
}))
const depthReadout = ref('Z 000.0M')

// A rounded-rectangle Shape extruded into a ring cross-section, so the
// frame reads as a machined rounded-square torus rather than a plain
// circular ring — matches the rectangular corner-bracket footprint used
// throughout the rest of the Hero background set.
function buildRoundedRectRingGeometry(width: number, height: number, thickness: number, radius: number) {
  const hw = width / 2
  const hh = height / 2
  const outer = new THREE.Shape()
  outer.moveTo(-hw + radius, -hh)
  outer.lineTo(hw - radius, -hh)
  outer.quadraticCurveTo(hw, -hh, hw, -hh + radius)
  outer.lineTo(hw, hh - radius)
  outer.quadraticCurveTo(hw, hh, hw - radius, hh)
  outer.lineTo(-hw + radius, hh)
  outer.quadraticCurveTo(-hw, hh, -hw, hh - radius)
  outer.lineTo(-hw, -hh + radius)
  outer.quadraticCurveTo(-hw, -hh, -hw + radius, -hh)

  const ihw = hw - thickness
  const ihh = hh - thickness
  const ir = Math.max(radius - thickness, 0.02)
  const hole = new THREE.Path()
  hole.moveTo(-ihw + ir, -ihh)
  hole.lineTo(ihw - ir, -ihh)
  hole.quadraticCurveTo(ihw, -ihh, ihw, -ihh + ir)
  hole.lineTo(ihw, ihh - ir)
  hole.quadraticCurveTo(ihw, ihh, ihw - ir, ihh)
  hole.lineTo(-ihw + ir, ihh)
  hole.quadraticCurveTo(-ihw, ihh, -ihw, ihh - ir)
  hole.lineTo(-ihw, -ihh + ir)
  hole.quadraticCurveTo(-ihw, -ihh, -ihw + ir, -ihh)
  outer.holes.push(hole)

  return new THREE.ExtrudeGeometry(outer, { depth: thickness * 1.4, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 8 })
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const pinTarget = canvas.closest('section')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  const cameraStart = new THREE.Vector3(0, 0.4, 4)
  const cameraEnd = new THREE.Vector3(0, 0.1, -22)
  camera.position.copy(cameraStart)
  camera.lookAt(0, 0, -10)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')
  const paper = new THREE.Color('#F7F3EC')
  scene.fog = new THREE.FogExp2(paper.getHex(), 0.022)

  const key = new THREE.DirectionalLight('#FFF6E0', 1.3)
  key.position.set(3, 4, -4)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.8)
  rim.position.set(-3, -1.5, -18)
  scene.add(rim)
  scene.add(new THREE.AmbientLight('#0B3954', 0.25))

  const frameCount = 11
  const frameSpacing = 3.2
  const rings: { mesh: THREE.Mesh; material: THREE.MeshPhysicalMaterial; isFocal: boolean }[] = []
  const ringGroup = new THREE.Group()

  for (let i = 0; i < frameCount; i++) {
    const z = -i * frameSpacing
    const scale = 1 + i * 0.16
    const geo = buildRoundedRectRingGeometry(4.4 * scale, 2.7 * scale, 0.14 * scale, 0.4 * scale)
    const isFocal = i === 0
    const color = isFocal ? yellow.clone() : navy.clone().lerp(yellow, 0.12)
    const material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.7,
      roughness: 0.28,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      emissive: isFocal ? yellow.clone() : new THREE.Color('#000000'),
      emissiveIntensity: isFocal ? 0.15 : 0,
      transparent: true,
      opacity: isFocal ? 1 : THREE.MathUtils.lerp(0.95, 0.5, (i) / (frameCount - 1))
    })
    const mesh = new THREE.Mesh(geo, material)
    mesh.position.z = z
    ringGroup.add(mesh)
    rings.push({ mesh, material, isFocal })
  }
  scene.add(ringGroup)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0, y: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
  }
  parent.addEventListener('pointermove', onPointerMove)

  const scrollState = { progress: 0 }
  let scrollTrigger: ScrollTrigger | null = null
  if (!prefersReducedMotion && pinTarget) {
    scrollTrigger = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: `+=${window.innerHeight * 2}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        scrollState.progress = self.progress
        borderProgress.value = Math.min(self.progress * 1.15, 1)
        arrivalIntensity.value = Math.max((self.progress - 0.75) / 0.25, 0)
        const depthMeters = Math.abs(
          THREE.MathUtils.lerp(cameraStart.z, cameraEnd.z, gsap.parseEase('power1.inOut')(self.progress))
        )
        depthReadout.value = `Z ${depthMeters.toFixed(1).padStart(5, '0')}M`
      }
    })
  } else {
    scrollState.progress = 1
    borderProgress.value = 1
  }

  // Portal-bloom payoff: once dolly progress crosses ~0.92, the focal
  // ring's emissive intensity and scale ramp up together, then settle
  // into a slow idle breathing pulse — held state, not a one-shot flash.
  const focalRing = rings.find((r) => r.isFocal)!
  let idlePulse: gsap.core.Tween | null = null
  let arrivedOnce = false

  function tick() {
    const eased = gsap.parseEase('power1.inOut')(scrollState.progress)
    const dolly = new THREE.Vector3().lerpVectors(cameraStart, cameraEnd, eased)
    camera.position.x += (dolly.x + pointer.x * 0.2 - camera.position.x) * 0.08
    camera.position.y += (dolly.y - pointer.y * 0.06 - camera.position.y) * 0.08
    camera.position.z += (dolly.z - camera.position.z) * 0.08
    camera.lookAt(pointer.x * 0.35, camera.position.y - 0.12, camera.position.z - 8)

    const arrival = THREE.MathUtils.smoothstep(scrollState.progress, 0.92, 1)
    focalRing.material.emissiveIntensity = 0.15 + arrival * 1.6
    focalRing.mesh.scale.setScalar(1 + arrival * 0.12)

    if (arrival > 0.98 && !arrivedOnce && !prefersReducedMotion) {
      arrivedOnce = true
      idlePulse = gsap.to(focalRing.material, {
        emissiveIntensity: 2.1,
        duration: 1.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      })
    } else if (arrival <= 0.98 && arrivedOnce) {
      arrivedOnce = false
      idlePulse?.kill()
      idlePulse = null
    }

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    scrollTrigger?.kill()
    idlePulse?.kill()
    rings.forEach((r) => {
      r.mesh.geometry.dispose()
      r.material.dispose()
    })
    envMap.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-95">
    <canvas ref="canvasRef" class="h-full w-full" />

    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g v-for="corner in corners" :key="corner.id" :stroke="corner.accent ? '#FBBA00' : '#071F2E'" fill="none">
        <line
          vector-effect="non-scaling-stroke"
          :x1="corner.x" :y1="corner.y"
          :x2="corner.x + corner.dx * markLength" :y2="corner.y"
          pathLength="1" stroke-width="1.5"
          :stroke-dasharray="1" :stroke-dashoffset="1 - corner.reveal.value"
          :opacity="corner.accent ? 0.9 : 0.55"
        />
        <line
          vector-effect="non-scaling-stroke"
          :x1="corner.x" :y1="corner.y"
          :x2="corner.x" :y2="corner.y + corner.dy * markLength"
          pathLength="1" stroke-width="1.5"
          :stroke-dasharray="1" :stroke-dashoffset="1 - corner.reveal.value"
          :opacity="corner.accent ? 0.9 : 0.55"
        />
        <circle
          :cx="corner.x + corner.dx * 1.4" :cy="corner.y + corner.dy * 1.4" r="0.5"
          :fill="corner.accent ? '#FBBA00' : '#071F2E'"
          :opacity="corner.reveal.value > 0.1 ? (corner.accent ? 0.9 : 0.5) : 0"
        />
      </g>
    </svg>

    <div class="absolute bottom-6 left-6 flex items-center gap-3 font-body text-eyebrow uppercase text-ink/70 md:bottom-8 md:left-8">
      <span class="tracking-[0.14em]">PASTI — Technology. Creativity. Impact.</span>
      <span class="tabular-nums tracking-[0.08em] text-yellow-600">{{ depthReadout }}</span>
    </div>

    <div
      class="absolute inset-0"
      :style="{ opacity: arrivalIntensity, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(7,31,46,0.35) 100%)' }"
    />
    <div
      class="absolute inset-0 mix-blend-screen"
      :style="{ opacity: arrivalIntensity * 0.6, boxShadow: 'inset 6px 0 8px -4px rgba(255,60,60,0.4), inset -6px 0 8px -4px rgba(60,180,255,0.4)' }"
    />
  </div>
</template>
