<script setup lang="ts">
// 3D — Pinned dolly-through variant staged as a physical door/gate opening
// rather than a static hallway: two large corner-bracket "door" panels
// sit close to the camera and swing outward (rotating on hinges at the
// screen edges) as scroll progress advances, revealing the same receding
// corner-bracket frame sequence as HeroBgThreeWireGridDollyPinned behind
// them. Reads as "the grid physically opens for you as you scroll" rather
// than only a camera move — an extra layer of intentional choreography.
// Same pin (2 viewport-heights, scroll-scrubbed) + FogExp2 + floor/ceiling
// rail conventions as the other pinned dolly variants.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildCornerBrackets(width: number, height: number, z: number, armLength: number) {
  const hw = width / 2
  const hh = height / 2
  const corners: [number, number, number, number][] = [
    [-hw, -hh, 1, 1],
    [hw, -hh, -1, 1],
    [hw, hh, -1, -1],
    [-hw, hh, 1, -1]
  ]
  const points: THREE.Vector3[] = []
  for (const [cx, cy, dx, dy] of corners) {
    points.push(new THREE.Vector3(cx, cy, z), new THREE.Vector3(cx + armLength * dx, cy, z))
    points.push(new THREE.Vector3(cx, cy, z), new THREE.Vector3(cx, cy + armLength * dy, z))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

function buildDoorPanel(width: number, height: number) {
  const hw = width / 2
  const hh = height / 2
  const points = [
    new THREE.Vector3(0, -hh, 0), new THREE.Vector3(hw, -hh, 0),
    new THREE.Vector3(hw, -hh, 0), new THREE.Vector3(hw, hh, 0),
    new THREE.Vector3(hw, hh, 0), new THREE.Vector3(0, hh, 0),
    // A few internal cross-braces for a "gate" reading rather than a
    // blank panel outline.
    new THREE.Vector3(0, -hh, 0), new THREE.Vector3(hw, hh, 0),
    new THREE.Vector3(hw * 0.5, -hh, 0), new THREE.Vector3(hw * 0.5, hh, 0)
  ]
  return new THREE.BufferGeometry().setFromPoints(points)
}

function buildRail(width: number, y: number, z0: number, z1: number, divisions: number) {
  const points: THREE.Vector3[] = []
  const hw = width / 2
  points.push(new THREE.Vector3(-hw, y, z0), new THREE.Vector3(-hw, y, z1))
  points.push(new THREE.Vector3(hw, y, z0), new THREE.Vector3(hw, y, z1))
  for (let i = 0; i <= divisions; i++) {
    const z = z0 + ((z1 - z0) * i) / divisions
    points.push(new THREE.Vector3(-hw, y, z), new THREE.Vector3(hw, y, z))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const pinTarget = canvas.closest('section')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  const cameraStart = new THREE.Vector3(0, 0.35, 5)
  const cameraEnd = new THREE.Vector3(0, 0.1, -20)
  camera.position.copy(cameraStart)
  camera.lookAt(0, 0, -10)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')
  const paper = new THREE.Color('#F7F3EC')
  scene.fog = new THREE.FogExp2(paper.getHex(), 0.045)

  // Receding corner-bracket sequence, same as the base pinned variant.
  const frameGroup = new THREE.Group()
  const frameCount = 10
  const frameSpacing = 3.2
  for (let i = 0; i < frameCount; i++) {
    const z = -2 - i * frameSpacing
    const scale = 1 + i * 0.16
    const geo = buildCornerBrackets(4.2 * scale, 2.6 * scale, z, 0.85 * scale)
    const color = navy.clone().lerp(yellow, 0.1)
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })
    frameGroup.add(new THREE.LineSegments(geo, mat))
  }
  scene.add(frameGroup)

  const hallwayEnd = 5
  const hallwayStart = -(frameCount * frameSpacing) - 4
  const floorGeo = buildRail(16, -1.5, hallwayEnd, hallwayStart, 22)
  const floorMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.16 })
  scene.add(new THREE.LineSegments(floorGeo, floorMat))

  const ceilingGeo = buildRail(16, 3.2, hallwayEnd, hallwayStart, 22)
  const ceilingMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.08 })
  scene.add(new THREE.LineSegments(ceilingGeo, ceilingMat))

  // Two door panels hinged at the vertical centerline, positioned just in
  // front of the frame sequence. Closed (rotation 0) they read as a single
  // large gate blocking the hallway; as progress advances they swing open
  // around their hinge (rotation -> ±100°) to reveal the hallway beyond.
  const doorZ = 0.5
  const doorWidth = 2.6
  const doorHeight = 3.4
  const leftGeo = buildDoorPanel(doorWidth, doorHeight)
  const rightGeo = buildDoorPanel(doorWidth, doorHeight)
  const doorMatColor = yellow.clone().lerp(navy, 0.15)
  const leftMat = new THREE.LineBasicMaterial({ color: doorMatColor, transparent: true, opacity: 0.7 })
  const rightMat = new THREE.LineBasicMaterial({ color: doorMatColor, transparent: true, opacity: 0.7 })

  const leftHinge = new THREE.Group()
  leftHinge.position.set(0, -0.2, doorZ)
  const leftPanel = new THREE.LineSegments(leftGeo, leftMat)
  leftHinge.add(leftPanel)
  scene.add(leftHinge)

  const rightHinge = new THREE.Group()
  rightHinge.position.set(0, -0.2, doorZ)
  rightHinge.rotation.y = Math.PI
  const rightPanel = new THREE.LineSegments(rightGeo, rightMat)
  rightHinge.add(rightPanel)
  scene.add(rightHinge)

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
      }
    })
  } else {
    scrollState.progress = 1
  }

  const doorOpenAngle = (Math.PI / 180) * 100
  function tick() {
    const p = scrollState.progress
    // Door opens fast in the first 35% of the pinned scroll, then the
    // camera dolly takes over for the remaining travel through the now-
    // open hallway.
    const doorProgress = gsap.parseEase('power2.out')(Math.min(p / 0.35, 1))
    const dollyProgress = gsap.parseEase('power1.inOut')(Math.max((p - 0.3) / 0.7, 0))

    leftHinge.rotation.y = -doorOpenAngle * doorProgress
    rightHinge.rotation.y = Math.PI + doorOpenAngle * doorProgress
    leftMat.opacity = rightMat.opacity = 0.7 * (1 - doorProgress * 0.85)

    const dolly = new THREE.Vector3().lerpVectors(cameraStart, cameraEnd, dollyProgress)
    camera.position.x += (dolly.x + pointer.x * 0.2 - camera.position.x) * 0.08
    camera.position.y += (dolly.y - pointer.y * 0.06 - camera.position.y) * 0.08
    camera.position.z += (dolly.z - camera.position.z) * 0.08
    camera.lookAt(pointer.x * 0.3, camera.position.y - 0.1, camera.position.z - 8)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    scrollTrigger?.kill()
    frameGroup.children.forEach((child) => {
      const line = child as THREE.LineSegments
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    })
    floorGeo.dispose()
    floorMat.dispose()
    ceilingGeo.dispose()
    ceilingMat.dispose()
    leftGeo.dispose()
    rightGeo.dispose()
    leftMat.dispose()
    rightMat.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
