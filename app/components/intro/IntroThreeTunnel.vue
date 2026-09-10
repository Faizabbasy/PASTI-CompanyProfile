<script setup lang="ts">
// 3D Intro — Tunnel dive. Camera flies forward through a tunnel of receding
// wireframe rings (brand navy/yellow alternating), speeding up toward the
// end, then the overlay fades to reveal the page — classic "flying through
// a portal into the site" opener, cheap because it's just N torus/ring
// meshes and a moving camera, no complex geometry.
import * as THREE from 'three'
import gsap from 'gsap'

const emit = defineEmits<{ complete: [] }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
let raf = 0

onMounted(() => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.z = 5

  const RING_COUNT = 22
  const rings: THREE.Mesh[] = []
  for (let i = 0; i < RING_COUNT; i++) {
    const geo = new THREE.TorusGeometry(1.6, 0.02, 8, 32)
    const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? '#FBBA00' : '#0B3954', transparent: true, opacity: 0.6 })
    const ring = new THREE.Mesh(geo, mat)
    ring.position.z = -i * 4
    ring.rotation.z = i * 0.15
    scene.add(ring)
    rings.push(ring)
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)

  function tick() {
    rings.forEach((ring, i) => {
      ring.rotation.z += 0.002 * (i % 2 === 0 ? 1 : -1)
    })
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })
  tl.to({}, { duration: 0.2 })
  tl.to(camera.position, { z: -RING_COUNT * 4 + 6, duration: 2.6, ease: 'power2.in' })
  tl.to(camera, { fov: 90, duration: 0.6, ease: 'power2.in', onUpdate: () => camera.updateProjectionMatrix() }, '-=0.6')

  onBeforeUnmount(() => {
    tl.kill()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    rings.forEach((r) => {
      r.geometry.dispose()
      ;(r.material as THREE.Material).dispose()
    })
    renderer.dispose()
  })
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] bg-navy-950">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
  </div>
</template>
