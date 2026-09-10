<script setup lang="ts">
// 3D Intro — Orbiting rings converge. Three tilted rings orbit a center
// point at different speeds/axes, spiraling inward and aligning into a
// flat concentric "target" formation right as the intro completes (echoes
// a logo-mark forming), then scale-punch out. Small mesh count (3 torus +
// 1 core sphere), cheap.
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
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 6

  scene.add(new THREE.AmbientLight('#ffffff', 0.6))
  const key = new THREE.DirectionalLight('#ffffff', 1)
  key.position.set(2, 3, 4)
  scene.add(key)

  const colors = ['#0B3954', '#FBBA00', '#1C5E7C']
  const rings = colors.map((color, i) => {
    const geo = new THREE.TorusGeometry(1.4 - i * 0.15, 0.035, 12, 64)
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = Math.random() * Math.PI
    mesh.rotation.y = Math.random() * Math.PI
    scene.add(mesh)
    return mesh
  })

  const coreGeo = new THREE.SphereGeometry(0.18, 24, 24)
  const coreMat = new THREE.MeshStandardMaterial({ color: '#FBBA00', roughness: 0.2, emissive: '#FBBA00', emissiveIntensity: 0.3 })
  const core = new THREE.Mesh(coreGeo, coreMat)
  gsap.set(core.scale, { x: 0, y: 0, z: 0 })
  scene.add(core)

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)

  let spin = true
  function tick() {
    if (spin) {
      rings.forEach((ring, i) => {
        ring.rotation.z += 0.01 * (i % 2 === 0 ? 1 : -1)
      })
    }
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })

  tl.to({}, { duration: 0.3 })
  rings.forEach((ring, i) => {
    tl.to(ring.rotation, { x: 0, y: 0, duration: 1.1, ease: 'power3.inOut' }, 0.3 + i * 0.1)
  })
  tl.call(() => (spin = false), [], '-=0.2')
  tl.to(core.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.3')
  tl.to({}, { duration: 0.4 })
  tl.to([...rings.map((r) => r.scale), core.scale], { x: 1.6, y: 1.6, z: 1.6, duration: 0.5, ease: 'power2.in' })
  tl.to(
    [...rings.map((r) => (r.material as THREE.MeshStandardMaterial)), coreMat],
    { opacity: 0, transparent: true, duration: 0.4 },
    '<'
  )

  onBeforeUnmount(() => {
    tl.kill()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    rings.forEach((r) => {
      r.geometry.dispose()
      ;(r.material as THREE.Material).dispose()
    })
    coreGeo.dispose()
    coreMat.dispose()
    renderer.dispose()
  })
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] bg-paper">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
  </div>
</template>
