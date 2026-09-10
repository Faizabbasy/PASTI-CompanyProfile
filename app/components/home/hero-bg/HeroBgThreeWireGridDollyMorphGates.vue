<script setup lang="ts">
// 3D — Pinned dolly-through variant where each receding "gate" the camera
// passes is a different precise geometric silhouette — rectangle, then
// hexagon, then circle — cycling as the hallway recedes, like passing
// through a sequence of architectural apertures rather than identical
// picture frames. Same pin + scrub mechanic as HeroBgThreeWireGridDollyPinned
// (Hero section locks for two viewport-heights while scroll drives dolly
// progress directly, then releases to the next section), same FogExp2
// atmospheric falloff and floor/ceiling rails for an enclosed-volume feel.
// All gate geometry is built from straight/arc line segments — no vertex
// noise anywhere.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildRectGate(width: number, height: number, z: number) {
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

function buildPolygonGate(radius: number, sides: number, z: number, rotation = 0) {
  const points: THREE.Vector3[] = []
  for (let i = 0; i < sides; i++) {
    const a0 = rotation + (i / sides) * Math.PI * 2
    const a1 = rotation + ((i + 1) / sides) * Math.PI * 2
    points.push(
      new THREE.Vector3(Math.cos(a0) * radius, Math.sin(a0) * radius * 0.72, z),
      new THREE.Vector3(Math.cos(a1) * radius, Math.sin(a1) * radius * 0.72, z)
    )
  }
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
  const cameraStart = new THREE.Vector3(0, 0.3, 4)
  const cameraEnd = new THREE.Vector3(0, 0.1, -24)
  camera.position.copy(cameraStart)
  camera.lookAt(0, 0, -10)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')
  const paper = new THREE.Color('#F7F3EC')
  scene.fog = new THREE.FogExp2(paper.getHex(), 0.042)

  const gateGroup = new THREE.Group()
  const gateCount = 12
  const gateSpacing = 3
  for (let i = 0; i < gateCount; i++) {
    const z = -i * gateSpacing
    const scale = 1 + i * 0.15
    const shapeIndex = i % 3
    let geo: THREE.BufferGeometry
    if (shapeIndex === 0) geo = buildRectGate(4.2 * scale, 2.6 * scale, z)
    else if (shapeIndex === 1) geo = buildPolygonGate(2.3 * scale, 6, z, Math.PI / 6)
    else geo = buildPolygonGate(2.1 * scale, 24, z)

    const color = i === 0 ? yellow.clone() : navy.clone().lerp(yellow, 0.1)
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: i === 0 ? 0.85 : 0.48 })
    gateGroup.add(new THREE.LineSegments(geo, mat))

    if (i === 0) {
      const glowGeo = buildRectGate(4.2 * scale * 1.08, 2.6 * scale * 1.08, z)
      const glowMat = new THREE.LineBasicMaterial({
        color: yellow,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      })
      gateGroup.add(new THREE.LineSegments(glowGeo, glowMat))
    }
  }
  scene.add(gateGroup)

  const hallwayEnd = 4
  const hallwayStart = -(gateCount * gateSpacing) - 4
  const floorGeo = buildRail(15, -1.4, hallwayEnd, hallwayStart, 22)
  const floorMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.15 })
  const floor = new THREE.LineSegments(floorGeo, floorMat)
  scene.add(floor)

  const ceilingGeo = buildRail(15, 3, hallwayEnd, hallwayStart, 22)
  const ceilingMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.07 })
  const ceiling = new THREE.LineSegments(ceilingGeo, ceilingMat)
  scene.add(ceiling)

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

  function tick() {
    const eased = gsap.parseEase('power1.inOut')(scrollState.progress)
    const dolly = new THREE.Vector3().lerpVectors(cameraStart, cameraEnd, eased)
    camera.position.x += (dolly.x + pointer.x * 0.2 - camera.position.x) * 0.08
    camera.position.y += (dolly.y - pointer.y * 0.06 - camera.position.y) * 0.08
    camera.position.z += (dolly.z - camera.position.z) * 0.08
    // Gentle roll synced to progress — barely perceptible, reinforces the
    // sense of continuous forward travel through varying apertures.
    camera.rotation.z = Math.sin(eased * Math.PI * 2) * 0.015
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
    gateGroup.children.forEach((child) => {
      const line = child as THREE.LineSegments
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    })
    floorGeo.dispose()
    floorMat.dispose()
    ceilingGeo.dispose()
    ceilingMat.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
