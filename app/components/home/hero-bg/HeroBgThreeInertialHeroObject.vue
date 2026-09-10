<script setup lang="ts">
// 3D — Inertial hero object. Inspired by Lusion's award-winning approach of
// rendering ONE hero object with genuine simulated mass rather than a scene
// full of things. The object does not snap to the cursor: pointer position
// sets a target orientation, and a spring-damper (angular "torque" toward
// the target, velocity damped each frame) integrates rotation over time —
// so fast pointer moves make it overshoot and settle back, reading as a
// gyroscope/pendulum with real inertia, not a tween. Single faceted
// torus-knot, clean studio three-point lighting, no noise/shader tricks.
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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 7)

  // Studio three-point lighting: key (yellow-tinted), fill (navy, cool), rim.
  const key = new THREE.DirectionalLight('#FBBA00', 1.4)
  key.position.set(3, 4, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight('#0B3954', 0.5)
  fill.position.set(-4, -1, 2)
  scene.add(fill)
  const rim = new THREE.DirectionalLight('#EAF1F4', 0.9)
  rim.position.set(-2, 3, -5)
  scene.add(rim)
  const ambient = new THREE.AmbientLight('#0B2A3D', 0.35)
  scene.add(ambient)

  const geometry = new THREE.TorusKnotGeometry(1.35, 0.42, 220, 24, 2, 3)
  const material = new THREE.MeshPhysicalMaterial({
    color: '#0B3954',
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

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

  // Angular spring-damper state: current angle/velocity per axis, driven
  // toward a pointer-derived target with a stiffness (torque) and damping
  // coefficient — the physical-mass illusion comes entirely from this.
  const angle = { x: 0.3, y: 0.4 }
  const velocity = { x: 0, y: 0 }
  const stiffness = 5.2
  const damping = 2.6

  const clock = new THREE.Clock()
  let lastTime = 0
  function tick() {
    const elapsed = clock.getElapsedTime()
    const dt = Math.min(elapsed - lastTime, 1 / 30)
    lastTime = elapsed
    const t = prefersReducedMotion ? 0 : elapsed

    const targetX = 0.3 + pointer.y * 0.6
    const targetY = 0.4 + pointer.x * 0.9 + (prefersReducedMotion ? 0 : t * 0.05)

    if (!prefersReducedMotion) {
      const accelX = (targetX - angle.x) * stiffness - velocity.x * damping
      const accelY = (targetY - angle.y) * stiffness - velocity.y * damping
      velocity.x += accelX * dt
      velocity.y += accelY * dt
      angle.x += velocity.x * dt
      angle.y += velocity.y * dt
    } else {
      angle.x = targetX
      angle.y = targetY
    }

    mesh.rotation.x = angle.x
    mesh.rotation.y = angle.y

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    geometry.dispose()
    material.dispose()
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

