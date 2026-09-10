<script setup lang="ts">
// 3D — Grid-break rhythm. Inspired by Uncommon Studio's "confident grid
// that breaks at exactly the right moment": a perfectly uniform 3D grid of
// small cubes sits still, then a GSAP timeline drives a choreographed
// diagonal wipe — cells along an advancing diagonal front displace outward
// in Z and rotate, then return, with snappy power-based easing (no
// elastic/bounce) so it reads as precise art direction rather than random
// chaos. The wave loops on a deliberate rhythm, not noise-driven scatter.
import * as THREE from 'three'
import gsap from 'gsap'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(4, 3.5, 8)
  camera.lookAt(0, 0, 0)

  const key = new THREE.DirectionalLight('#EAF1F4', 1.1)
  key.position.set(3, 5, 4)
  scene.add(key)
  const ambient = new THREE.AmbientLight('#0B2A3D', 0.55)
  scene.add(ambient)

  const cols = 9
  const rows = 6
  const spacing = 0.62
  const cubeGeometry = new THREE.BoxGeometry(0.42, 0.42, 0.42)
  const baseMaterial = new THREE.MeshStandardMaterial({ color: '#0B3954', metalness: 0.35, roughness: 0.5 })
  const accentMaterial = new THREE.MeshStandardMaterial({ color: '#FBBA00', metalness: 0.35, roughness: 0.4 })

  const group = new THREE.Group()
  group.position.set(-((cols - 1) * spacing) / 2, -((rows - 1) * spacing) / 2, 0)
  scene.add(group)

  type Cell = { mesh: THREE.Mesh; col: number; row: number; baseZ: number }
  const cells: Cell[] = []
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const isAccent = (col + row) % 7 === 0
      const mesh = new THREE.Mesh(cubeGeometry, isAccent ? accentMaterial : baseMaterial)
      mesh.position.set(col * spacing, row * spacing, 0)
      group.add(mesh)
      cells.push({ mesh, col, row, baseZ: 0 })
    }
  }

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  // Choreographed diagonal-wipe timeline: a "front" value sweeps across
  // (col + row) space; each cell's displacement is driven by its distance
  // from the front, using a snappy expo/power ease — deliberate, not random.
  const wave = { front: -4 }
  const maxFront = cols + rows + 4
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.1 })
  if (!prefersReducedMotion) {
    tl.to(wave, { front: maxFront, duration: 3.2, ease: 'power2.inOut' })
  } else {
    wave.front = maxFront
  }

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()

    cells.forEach(({ mesh, col, row }) => {
      const diag = col + row
      const dist = wave.front - diag
      // Snappy pulse: strong near the front, falls off quickly behind and
      // ahead of it — power curve, not a soft bell, for a "snap" feel.
      const influence = Math.max(0, 1 - Math.abs(dist) / 2.2)
      const pulse = influence * influence * (3 - 2 * influence) // smoothstep, still crisp
      mesh.position.z = pulse * 1.4
      mesh.rotation.x = pulse * 0.6
      mesh.rotation.y = pulse * 0.6
      const scale = 1 + pulse * 0.25
      mesh.scale.setScalar(scale)
    })

    group.rotation.y = prefersReducedMotion ? -0.15 : -0.15 + Math.sin(elapsed * 0.06) * 0.05

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    tl.kill()
    cubeGeometry.dispose()
    baseMaterial.dispose()
    accentMaterial.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-90">
    <div class="h-[120%] w-[120%]">
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>
  </div>
</template>
