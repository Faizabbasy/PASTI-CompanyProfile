<script setup lang="ts">
// 3D — Mouse-reveal monolith. Inspired by Unseen Studio's Hubtown site: a
// tall glowing monolith stands on a reflective plane, dim/dark by default.
// The "reflection" is a cheap trick — a second mesh mirrored below the
// horizon with reduced opacity and a fresnel fade, no reflection probe or
// render target needed. Cursor movement drives a point light that hugs the
// pointer near the monolith, revealing rim-light/bloom around its edges as
// if discovering the object in the dark — an interaction cue, not ambient
// lighting.
import * as THREE from 'three'

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
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0.3, 8)
  camera.lookAt(0, 0, 0)

  const ambient = new THREE.AmbientLight('#0B2A3D', 0.15)
  scene.add(ambient)

  // The monolith: tall faceted slab, dark self-illuminated base so it's
  // visible even before the reveal light arrives, brightened by emissive.
  const monolithGeometry = new THREE.BoxGeometry(0.9, 3.6, 0.5)
  const monolithMaterial = new THREE.MeshStandardMaterial({
    color: '#0B2A3D',
    emissive: '#0B3954',
    emissiveIntensity: 0.4,
    metalness: 0.5,
    roughness: 0.3
  })
  const monolith = new THREE.Mesh(monolithGeometry, monolithMaterial)
  monolith.position.y = 0.4
  scene.add(monolith)

  // Fake reflection: mirrored duplicate below the horizon, dimmed + faded.
  const reflection = new THREE.Mesh(
    monolithGeometry,
    new THREE.MeshBasicMaterial({ color: '#0B3954', transparent: true, opacity: 0.18 })
  )
  reflection.scale.y = -1
  reflection.position.y = -1.6
  scene.add(reflection)

  // Reflective ground plane (dark, low-roughness clearcoat feel via
  // standard material) sitting exactly at the horizon line.
  const floorGeometry = new THREE.PlaneGeometry(24, 24)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#081F2C', metalness: 0.6, roughness: 0.15 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.6
  scene.add(floor)

  // Reveal light: follows the pointer in world space near the monolith,
  // off by default, warms up on interaction. This IS the reveal.
  const revealLight = new THREE.PointLight('#FBBA00', 0, 8, 2)
  revealLight.position.set(0, 0.5, 2)
  scene.add(revealLight)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0, y: 0, active: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    pointer.active = 1
  }
  function onPointerLeave() {
    pointer.active = 0
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  const targetIntensity = { value: 0 }
  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed

    const desired = prefersReducedMotion ? 14 : pointer.active * 22
    targetIntensity.value += (desired - targetIntensity.value) * 0.06
    revealLight.intensity = targetIntensity.value

    revealLight.position.x += (pointer.x * 3.5 - revealLight.position.x) * 0.08
    revealLight.position.y += (pointer.y * 2 + 0.3 - revealLight.position.y) * 0.08

    monolith.rotation.y = Math.sin(t * 0.05) * 0.05

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    parent.removeEventListener('pointerleave', onPointerLeave)
    monolithGeometry.dispose()
    monolithMaterial.dispose()
    ;(reflection.material as THREE.Material).dispose()
    floorGeometry.dispose()
    floorMaterial.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
