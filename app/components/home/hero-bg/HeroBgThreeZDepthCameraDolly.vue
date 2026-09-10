<script setup lang="ts">
// 3D — Z-depth camera dolly. Inspired by Lusion's true-Z-axis camera moves
// and Immersive Garden's Cartier "rooms you fly through" staging. Four
// simple geometric forms sit at very different Z depths along a path; the
// CAMERA (not the objects) continuously dollies forward on a slow idle
// loop, so nearer objects sweep past faster than distant ones purely from
// perspective — real parallax from true 3D depth, not a faked scroll
// offset. Objects recycle behind the camera to loop seamlessly.
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
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0, 0)

  const key = new THREE.DirectionalLight('#EAF1F4', 1.1)
  key.position.set(2, 3, 4)
  scene.add(key)
  const ambient = new THREE.AmbientLight('#0B2A3D', 0.5)
  scene.add(ambient)

  const shapeDefs = [
    { geo: () => new THREE.IcosahedronGeometry(0.7, 0), color: '#FBBA00' },
    { geo: () => new THREE.TorusGeometry(0.6, 0.22, 16, 48), color: '#EAF1F4' },
    { geo: () => new THREE.OctahedronGeometry(0.8, 0), color: '#0B3954' },
    { geo: () => new THREE.BoxGeometry(0.9, 0.9, 0.9), color: '#FBBA00' }
  ]

  const totalDepth = 60
  const objectCount = 14
  const meshes: THREE.Mesh[] = []
  for (let i = 0; i < objectCount; i++) {
    const def = shapeDefs[i % shapeDefs.length]!
    const geometry = def.geo()
    const material = new THREE.MeshStandardMaterial({ color: def.color, metalness: 0.3, roughness: 0.5 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      -(i / objectCount) * totalDepth
    )
    mesh.userData.spinSpeed = 0.1 + Math.random() * 0.2
    scene.add(mesh)
    meshes.push(mesh)
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

  const pointer = { x: 0, y: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  parent.addEventListener('pointermove', onPointerMove)

  const dollySpeed = 3.2 // units per second, continuous forward travel
  const clock = new THREE.Clock()
  function tick() {
    const delta = prefersReducedMotion ? 0 : clock.getDelta()
    const elapsed = clock.getElapsedTime()

    camera.position.z -= delta * dollySpeed
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.03
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 8)

    // Recycle any object that has passed behind the camera back to the
    // far end of the path, so the flythrough loops without a visible seam.
    meshes.forEach((mesh) => {
      if (mesh.position.z > camera.position.z + 3) {
        mesh.position.z -= totalDepth
        mesh.position.x = (Math.random() - 0.5) * 6
        mesh.position.y = (Math.random() - 0.5) * 4
      }
      const spin = mesh.userData.spinSpeed as number
      mesh.rotation.x = elapsed * spin
      mesh.rotation.y = elapsed * spin * 0.7
    })

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    meshes.forEach((mesh) => {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
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

