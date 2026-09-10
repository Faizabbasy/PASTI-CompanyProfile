<script setup lang="ts">
// 3D Intro — Portal iris. A circular "iris" made of radiating wedge meshes
// (like a camera aperture / sci-fi portal) starts fully closed, opens
// outward revealing increasing brightness behind it, then the wedges snap
// fully open and fade — literally an aperture opening onto the site.
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
  camera.position.z = 5

  scene.add(new THREE.AmbientLight('#ffffff', 0.7))
  const key = new THREE.DirectionalLight('#ffffff', 0.8)
  key.position.set(1, 2, 3)
  scene.add(key)

  const BLADES = 14
  const blades: THREE.Mesh[] = []
  const group = new THREE.Group()
  for (let i = 0; i < BLADES; i++) {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(1.8, -0.35)
    shape.lineTo(1.8, 0.35)
    shape.closePath()
    const geo = new THREE.ShapeGeometry(shape)
    const mat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? '#0B3954' : '#082A3E',
      side: THREE.DoubleSide,
      roughness: 0.55
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.z = (i / BLADES) * Math.PI * 2
    group.add(mesh)
    blades.push(mesh)
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
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.4, onComplete: () => emit('complete') })
    }
  })

  tl.to({}, { duration: 0.4 })
  tl.to(group.rotation, { z: 0.5, duration: 1.4, ease: 'power2.inOut' })
  blades.forEach((blade, i) => {
    tl.to(blade.position, { x: () => Math.cos((i / BLADES) * Math.PI * 2) * 1.2, y: () => Math.sin((i / BLADES) * Math.PI * 2) * 1.2, duration: 0.9, ease: 'power3.in' }, '-=1')
  })
  tl.to(camera.position, { z: 2.2, duration: 0.9, ease: 'power2.in' }, '<')

  onBeforeUnmount(() => {
    tl.kill()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    blades.forEach((b) => {
      b.geometry.dispose()
      ;(b.material as THREE.Material).dispose()
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
