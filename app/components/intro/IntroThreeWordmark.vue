<script setup lang="ts">
// 3D Intro — Extruded wordmark. "PASTI" rendered as extruded 3D text
// (THREE.TextGeometry needs a loaded font JSON — to avoid an extra asset
// dependency, this builds the letterforms as extruded boxes/shapes
// approximating a blocky wordmark instead), rotating in from behind the
// camera with a spotlight sweep, settling face-on, then the camera pushes
// through it as the overlay fades — a "the brand IS the scene" opener.
import * as THREE from 'three'
import gsap from 'gsap'

const emit = defineEmits<{ complete: [] }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
let raf = 0

// Simple 5x7 dot-matrix-style letterforms for P A S T I, built as boxes —
// avoids needing an external font JSON for THREE.TextGeometry.
const LETTER_PATTERNS: Record<string, number[][]> = {
  P: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0]
  ],
  A: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1]
  ],
  S: [
    [0, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 0]
  ],
  T: [
    [1, 1, 1, 1],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0]
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1]
  ]
}

onMounted(() => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 9)

  const key = new THREE.DirectionalLight('#ffffff', 1.3)
  key.position.set(3, 4, 6)
  scene.add(key)
  scene.add(new THREE.AmbientLight('#ffffff', 0.5))

  const group = new THREE.Group()
  const cubeGeo = new THREE.BoxGeometry(0.34, 0.34, 0.34)
  const boxes: THREE.Mesh[] = []
  let cursorX = 0
  const word = ['P', 'A', 'S', 'T', 'I']
  word.forEach((letter) => {
    const pattern = LETTER_PATTERNS[letter]!
    const cols = pattern[0]!.length
    pattern.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (!cell) return
        const mat = new THREE.MeshStandardMaterial({ color: '#0B3954', roughness: 0.4 })
        const mesh = new THREE.Mesh(cubeGeo, mat)
        mesh.position.set(cursorX + rx * 0.36, (3 - ry) * 0.36, 0)
        group.add(mesh)
        boxes.push(mesh)
      })
    })
    cursorX += (cols + 1) * 0.36
  })
  group.position.x = -cursorX / 2
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

  gsap.set(
    boxes.map((b) => b.position),
    { z: () => (Math.random() - 0.5) * 20 }
  )
  gsap.set(
    boxes.map((b) => b.material as THREE.MeshStandardMaterial),
    { opacity: 0, transparent: true }
  )
  gsap.set(group.rotation, { y: -0.6 })

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })

  boxes.forEach((b, i) => {
    tl.to(b.position, { z: 0, duration: 1, ease: 'power3.out' }, i * 0.008)
    tl.to(b.material as THREE.MeshStandardMaterial, { opacity: 1, duration: 0.6 }, '<')
  })
  tl.to(group.rotation, { y: 0, duration: 1, ease: 'power2.out' }, 0.2)
  tl.to({}, { duration: 0.5 })
  tl.to(camera.position, { z: 2, duration: 0.7, ease: 'power2.in' })

  onBeforeUnmount(() => {
    tl.kill()
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    cubeGeo.dispose()
    boxes.forEach((b) => (b.material as THREE.Material).dispose())
    renderer.dispose()
  })
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] bg-paper">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
  </div>
</template>
