<script setup lang="ts">
// 3D — Precision wire grid that starts perfectly flat (facing the camera
// like a printed diagram, rotation.x = 0) and "unfolds" into full
// perspective as the user scrolls the Hero section — an origami-style
// reveal rather than the generic "terrain flying past" look. The grid
// itself is a plain, undistorted THREE.PlaneGeometry rendered wireframe
// (no vertex noise), so lines stay perfectly straight throughout — the
// unfold comes purely from rotating/receding the whole mesh, tied to
// scroll progress via a scrubbed ScrollTrigger. A thin accent line marks
// the fold's leading edge and brightens as the unfold completes.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value || !rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0.2, 5)
  camera.lookAt(0, 0, -2)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')

  const geometry = new THREE.PlaneGeometry(9, 9, 18, 18)
  const material = new THREE.MeshBasicMaterial({
    color: navy,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  })
  const grid = new THREE.Mesh(geometry, material)
  // Fold pivot sits at the grid's near edge so it hinges toward the
  // camera as it flattens/unfolds, rather than spinning around its center.
  grid.geometry.translate(0, 4.5, 0)
  const pivot = new THREE.Group()
  pivot.position.set(0, -1.1, -1)
  pivot.add(grid)
  scene.add(pivot)

  // Leading-edge accent: a single bright line at the hinge, the visual
  // "spine" of the fold.
  const edgeGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-4.5, 0, 0),
    new THREE.Vector3(4.5, 0, 0)
  ])
  const edgeMat = new THREE.LineBasicMaterial({ color: yellow, transparent: true, opacity: 0.6 })
  const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat)
  pivot.add(edgeLine)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  }
  parent.addEventListener('pointermove', onPointerMove)

  // Unfold driven by scroll progress: flat (rotation 0, close, dim) at the
  // top of the section, fully unfolded (rotated to receding perspective,
  // pushed back, brighter) by the time the section scrolls past.
  const FLAT_ROTATION = 0
  const UNFOLDED_ROTATION = -Math.PI / 2.3
  const unfoldState = { progress: prefersReducedMotion ? 1 : 0 }
  let scrollTrigger: ScrollTrigger | null = null
  if (!prefersReducedMotion) {
    scrollTrigger = ScrollTrigger.create({
      trigger: rootRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        unfoldState.progress = self.progress
      }
    })
  }

  const clock = new THREE.Clock()
  function tick() {
    clock.getElapsedTime()
    const p = unfoldState.progress
    const eased = gsap.parseEase('power2.inOut')(p)
    pivot.rotation.x = THREE.MathUtils.lerp(FLAT_ROTATION, UNFOLDED_ROTATION, eased)
    pivot.position.z = THREE.MathUtils.lerp(-1, -5, eased)
    material.opacity = THREE.MathUtils.lerp(0.18, 0.42, eased)
    edgeMat.opacity = THREE.MathUtils.lerp(0.3, 0.75, eased)
    camera.position.x += (pointer.x * 0.3 - camera.position.x) * 0.06
    camera.lookAt(0, -0.2, -3)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    scrollTrigger?.kill()
    geometry.dispose()
    material.dispose()
    edgeGeo.dispose()
    edgeMat.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
