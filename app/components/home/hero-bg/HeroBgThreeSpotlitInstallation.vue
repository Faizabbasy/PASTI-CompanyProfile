<script setup lang="ts">
// 3D — Spotlit gallery installation. Inspired by Iventions' award-winning
// lighting craft: a single object staged like a museum piece, lit by ONE
// dominant THREE.SpotLight with shadow-mapped falloff against an otherwise
// dark scene (no fill/ambient beyond a whisper), high contrast. The rig
// itself subtly sways/breathes — GSAP drives a slow deliberate timeline for
// intensity and angle (not randomised jitter), like a real spotlight rig
// easing between cues. Moody, restrained, one hero form.
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
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
  camera.position.set(0, 0.6, 7.5)
  camera.lookAt(0, 0, 0)

  // Dim ambient so the spotlight reads as the sole source of truth.
  const ambient = new THREE.AmbientLight('#0B2A3D', 0.12)
  scene.add(ambient)

  const spot = new THREE.SpotLight('#EAF1F4', 0)
  spot.position.set(1.4, 4.2, 3.2)
  spot.angle = 0.32
  spot.penumbra = 0.55
  spot.decay = 1.6
  spot.distance = 14
  spot.castShadow = true
  spot.shadow.mapSize.set(1024, 1024)
  spot.shadow.bias = -0.001
  scene.add(spot)
  scene.add(spot.target)

  // Hero pedestal object: faceted dodecahedron reads as a "gallery piece".
  const geometry = new THREE.DodecahedronGeometry(1.5, 0)
  const material = new THREE.MeshStandardMaterial({
    color: '#0B3954',
    metalness: 0.4,
    roughness: 0.35
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  // Ground plinth catches the shadow, sells the "installation" staging.
  const floorGeometry = new THREE.PlaneGeometry(20, 20)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#0B2A3D', roughness: 0.9, metalness: 0 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.9
  floor.receiveShadow = true
  scene.add(floor)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  // GSAP-paced lighting cue timeline: slow deliberate rise, hold, drift of
  // angle/intensity — a "rig operator" pacing, not random flicker.
  const lightState = { intensity: 0, angleOffset: 0 }
  const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
  if (!prefersReducedMotion) {
    tl.to(lightState, { intensity: 26, duration: 4 })
      .to(lightState, { angleOffset: 0.8, duration: 6 }, '<')
      .to(lightState, { intensity: 18, duration: 5 })
      .to(lightState, { angleOffset: -0.6, duration: 7 }, '<')
  } else {
    lightState.intensity = 22
  }

  const basePos = spot.position.clone()
  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed

    spot.intensity = prefersReducedMotion ? 22 : lightState.intensity
    spot.position.x = basePos.x + lightState.angleOffset + Math.sin(t * 0.12) * 0.15
    spot.position.z = basePos.z + Math.cos(t * 0.09) * 0.2
    spot.target.position.set(0, 0, 0)

    mesh.rotation.y = t * 0.06

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    tl.kill()
    geometry.dispose()
    material.dispose()
    floorGeometry.dispose()
    floorMaterial.dispose()
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

