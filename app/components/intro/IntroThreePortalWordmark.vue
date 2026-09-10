<script setup lang="ts">
// 3D Intro — Portal + wordmark. Combines the aperture-iris mechanic with a
// dramatic wordmark payoff: the iris blades open onto darkness, the camera
// pushes through, and "PASTI" erupts out of the portal at large scale with
// a light-bloom sweep — a more premium, cinematic escalation of the plain
// portal-only variant, closing on brand rather than just fading to empty.
import * as THREE from 'three'
import gsap from 'gsap'

const emit = defineEmits<{ complete: [] }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)
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
  const key = new THREE.DirectionalLight('#ffffff', 0.9)
  key.position.set(1, 2, 3)
  scene.add(key)

  const BLADES = 16
  const blades: THREE.Mesh[] = []
  const group = new THREE.Group()
  for (let i = 0; i < BLADES; i++) {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(2, -0.32)
    shape.lineTo(2, 0.32)
    shape.closePath()
    const geo = new THREE.ShapeGeometry(shape)
    const mat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? '#0B3954' : '#082A3E',
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.15
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

  gsap.set(wordRef.value, { opacity: 0, scale: 0.7, filter: 'blur(14px)' })
  if (shineRef.value) gsap.set(shineRef.value, { opacity: 0, backgroundPosition: '150% 150%' })

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', onComplete: () => emit('complete') })
    }
  })

  tl.to({}, { duration: 0.3 })
  tl.to(group.rotation, { z: 0.6, duration: 1.5, ease: 'power2.inOut' })
  blades.forEach((blade, i) => {
    tl.to(
      blade.position,
      { x: () => Math.cos((i / BLADES) * Math.PI * 2) * 1.4, y: () => Math.sin((i / BLADES) * Math.PI * 2) * 1.4, duration: 1, ease: 'power3.in' },
      '-=1.1'
    )
  })
  tl.to(camera.position, { z: 1.6, duration: 1, ease: 'power2.in' }, '<')
  tl.to(wordRef.value, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power4.out' }, '-=0.5')
  if (shineRef.value) {
    tl.to(shineRef.value, { opacity: 1, backgroundPosition: '-50% -50%', duration: 1, ease: 'cubic-bezier(0.65, 0, 0.35, 1)' }, '-=0.35')
  }
  tl.to({}, { duration: 0.7 })

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
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-navy-950">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
    <div class="relative">
      <span
        ref="wordRef"
        class="block font-display text-[clamp(3.5rem,10vw,9rem)] font-extrabold tracking-tight text-paper"
      >PASTI</span>
      <span
        ref="shineRef"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.95)_50%,transparent_65%)] bg-[length:250%_250%] bg-clip-text font-display text-[clamp(3.5rem,10vw,9rem)] font-extrabold tracking-tight text-transparent [-webkit-text-fill-color:transparent]"
      >PASTI</span>
    </div>
  </div>
</template>
