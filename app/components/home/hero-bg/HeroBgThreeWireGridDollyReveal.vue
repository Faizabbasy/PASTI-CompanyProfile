<script setup lang="ts">
// 3D — Precision architectural wire grid, deliberately NOT the noise-
// displaced "synthwave terrain" look shared by the other WireGrid variants.
// Built from real THREE.LineSegments on a perfectly flat, evenly spaced
// grid (no vertex noise at all) so every line stays razor-straight — reads
// as drafted/engineered rather than generated. The grid sits inside a
// series of receding "frames" (like looking down a hallway of picture
// frames), and scrolling the Hero section drives a scrubbed ScrollTrigger
// that dollies + tilts the camera further into that hallway, so the
// background genuinely advances with the page instead of looping on a
// timer. Cursor adds only a tiny secondary parallax on top.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildFrameLines(width: number, height: number, z: number) {
  const hw = width / 2
  const hh = height / 2
  const points = [
    new THREE.Vector3(-hw, -hh, z), new THREE.Vector3(hw, -hh, z),
    new THREE.Vector3(hw, -hh, z), new THREE.Vector3(hw, hh, z),
    new THREE.Vector3(hw, hh, z), new THREE.Vector3(-hw, hh, z),
    new THREE.Vector3(-hw, hh, z), new THREE.Vector3(-hw, -hh, z)
  ]
  return new THREE.BufferGeometry().setFromPoints(points)
}

function buildFloorGrid(width: number, depth: number, divisions: number, z0: number, z1: number) {
  const points: THREE.Vector3[] = []
  const hw = width / 2
  for (let i = 0; i <= divisions; i++) {
    const x = -hw + (width * i) / divisions
    points.push(new THREE.Vector3(x, 0, z0), new THREE.Vector3(x, 0, z1))
  }
  const rungCount = 10
  for (let i = 0; i <= rungCount; i++) {
    const z = z0 + ((z1 - z0) * i) / rungCount
    points.push(new THREE.Vector3(-hw, 0, z), new THREE.Vector3(hw, 0, z))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

useGsapContext(() => {
  if (!canvasRef.value || !rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  const cameraStart = new THREE.Vector3(0, 0.4, 4)
  const cameraEnd = new THREE.Vector3(0, 0.15, -6)
  camera.position.copy(cameraStart)
  camera.lookAt(0, 0, -10)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')

  // Receding rectangular "frames", evenly spaced — the architectural
  // hallway motif. Nearest frame tinted yellow (brand accent), the rest
  // fade toward navy as they recede.
  const frameGroup = new THREE.Group()
  const frameCount = 9
  const frameSpacing = 3.4
  for (let i = 0; i < frameCount; i++) {
    const z = -i * frameSpacing
    const scale = 1 + i * 0.18
    const geo = buildFrameLines(4.6 * scale, 2.8 * scale, z)
    const t = i / (frameCount - 1)
    const color = i === 0 ? yellow.clone() : navy.clone().lerp(yellow, 0.12)
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: THREE.MathUtils.lerp(0.55, 0.08, t)
    })
    frameGroup.add(new THREE.LineSegments(geo, mat))
  }
  scene.add(frameGroup)

  // Flat, undisplaced floor grid running the length of the hallway —
  // perfectly straight lines, no noise.
  const floorGeo = buildFloorGrid(16, frameCount * frameSpacing + 6, 20, 2, -(frameCount * frameSpacing) - 4)
  const floorMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.22 })
  const floor = new THREE.LineSegments(floorGeo, floorMat)
  floor.position.y = -1.4
  scene.add(floor)

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

  // Scroll progress through the Hero section drives how far the camera has
  // dollied into the hallway — locked to scroll position, not time.
  const scrollState = { progress: 0 }
  let scrollTrigger: ScrollTrigger | null = null
  if (!prefersReducedMotion) {
    scrollTrigger = ScrollTrigger.create({
      trigger: rootRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        scrollState.progress = self.progress
      }
    })
  }

  const clock = new THREE.Clock()
  const lookTarget = new THREE.Vector3()
  function tick() {
    clock.getElapsedTime()
    const dolly = new THREE.Vector3().lerpVectors(cameraStart, cameraEnd, scrollState.progress)
    camera.position.x += (dolly.x + pointer.x * 0.25 - camera.position.x) * 0.08
    camera.position.y += (dolly.y - pointer.y * 0.08 - camera.position.y) * 0.08
    camera.position.z += (dolly.z - camera.position.z) * 0.08
    lookTarget.set(pointer.x * 0.4, -pointer.y * 0.15, camera.position.z - 8)
    camera.lookAt(lookTarget)
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
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
