<script setup lang="ts">
// 3D Intro — Shard shatter. A flat plane (standing in for the PASTI
// wordmark/logo) is sliced into a small grid of shard meshes that start
// assembled, explode outward with individual rotation/velocity, then the
// whole rig fades as the overlay lifts — inverse of the classic "shatter on
// impact" but used as a reveal: order emerging from a held-together plane
// breaking apart to let the page through.
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

  const light = new THREE.DirectionalLight('#ffffff', 1.2)
  light.position.set(2, 3, 4)
  scene.add(light)
  scene.add(new THREE.AmbientLight('#ffffff', 0.5))

  const COLS = 6
  const ROWS = 4
  const shards: THREE.Mesh[] = []
  const group = new THREE.Group()
  const w = 4.4
  const h = 2.6

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const geo = new THREE.PlaneGeometry(w / COLS, h / ROWS)
      const mat = new THREE.MeshStandardMaterial({
        color: (x + y) % 2 === 0 ? '#0B3954' : '#FBBA00',
        side: THREE.DoubleSide,
        roughness: 0.5
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(-w / 2 + (x + 0.5) * (w / COLS), h / 2 - (y + 0.5) * (h / ROWS), 0)
      group.add(mesh)
      shards.push(mesh)
    }
  }
  scene.add(group)

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)

  function tick() {
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, {
        autoAlpha: 0,
        duration: 0.5,
        onComplete: () => emit('complete')
      })
    }
  })

  tl.set(group.scale, { x: 0.9, y: 0.9 })
  tl.to(group.scale, { x: 1, y: 1, duration: 0.6, ease: 'power2.out' })
  tl.to({}, { duration: 0.5 })
  shards.forEach((mesh, i) => {
    tl.to(
      mesh.position,
      {
        x: `+=${(Math.random() - 0.5) * 8}`,
        y: `+=${(Math.random() - 0.5) * 6}`,
        z: `+=${Math.random() * 4}`,
        duration: 0.9,
        ease: 'power2.in'
      },
      0.9 + i * 0.005
    )
    tl.to(
      mesh.rotation,
      { x: Math.random() * 4, y: Math.random() * 4, duration: 0.9, ease: 'power2.in' },
      '<'
    )
    tl.to((mesh.material as THREE.MeshStandardMaterial), { opacity: 0, duration: 0.5 }, '<0.3')
  })

  onBeforeUnmount(() => {
    tl.kill()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    shards.forEach((m) => {
      m.geometry.dispose()
      ;(m.material as THREE.Material).dispose()
    })
    renderer.dispose()
  })
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-paper">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
    <span class="relative font-display text-2xl font-extrabold tracking-tight text-navy-900">PASTI</span>
  </div>
</template>
