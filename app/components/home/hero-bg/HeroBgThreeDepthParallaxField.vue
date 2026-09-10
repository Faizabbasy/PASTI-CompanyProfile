<script setup lang="ts">
// 3D — Depth parallax field. Several THREE.Points layers sit at different Z
// depths with different point sizes/densities/opacities (near layers:
// fewer, bigger, brighter; far layers: many, small, dim — mimicking
// atmospheric perspective). Instead of moving the particles, the CAMERA
// shifts a few hundredths of a unit toward the cursor, so parallax comes
// "for free" from perspective projection — each layer visibly drifts at a
// different rate relative to the others, which is what actually sells
// depth rather than a canned per-particle offset. Four draw calls, cheap.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildLayer(count: number, spread: number, depth: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6
    positions[i * 3 + 2] = depth + (Math.random() - 0.5) * 0.6
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  const baseCameraPos = new THREE.Vector3(0, 0, 6)
  camera.position.copy(baseCameraPos)

  const layerDefs = [
    { count: 40, spread: 7, depth: 2.5, size: 0.09, color: '#FBBA00', opacity: 0.95 },
    { count: 90, spread: 10, depth: 0, size: 0.05, color: '#EAF1F4', opacity: 0.75 },
    { count: 160, spread: 13, depth: -3, size: 0.03, color: '#155A82', opacity: 0.55 },
    { count: 240, spread: 17, depth: -6.5, size: 0.02, color: '#0B3954', opacity: 0.35 }
  ]

  const points: THREE.Points[] = []
  layerDefs.forEach((def) => {
    const geometry = buildLayer(def.count, def.spread, def.depth)
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(def.color),
      size: def.size,
      transparent: true,
      opacity: def.opacity,
      sizeAttenuation: true,
      depthWrite: false
    })
    const layer = new THREE.Points(geometry, material)
    scene.add(layer)
    points.push(layer)
  })

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
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed

    // Camera nudges toward the cursor (small offsets — this is a subtle
    // cue, not a swoop) plus a very slow autonomous drift so the scene
    // isn't inert when the pointer is idle.
    const targetX = baseCameraPos.x + pointer.x * 0.35 + Math.sin(t * 0.05) * 0.05
    const targetY = baseCameraPos.y + pointer.y * 0.22 + Math.cos(t * 0.04) * 0.04
    camera.position.x += (targetX - camera.position.x) * 0.04
    camera.position.y += (targetY - camera.position.y) * 0.04
    camera.lookAt(0, 0, -2)

    points.forEach((layer, i) => {
      layer.rotation.z = Math.sin(t * 0.02 + i) * 0.01
    })

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    points.forEach((layer) => {
      layer.geometry.dispose()
      ;(layer.material as THREE.Material).dispose()
    })
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
