<script setup lang="ts">
// 3D — Refractive glass prism cluster. A handful of low-poly icosahedra
// with a physical glass-like material (transmission + roughness + IOR via
// MeshPhysicalMaterial) floating and slowly rotating, lit by a soft
// environment approximation (no external HDR asset — a simple gradient
// cube render target substitutes for env lighting so refraction highlights
// still read). Cursor tilts the whole cluster like a parallax card.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildGradientEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const size = 64
  const data = new Uint8Array(size * size * 3)
  const top = new THREE.Color('#EAF1F4')
  const bottom = new THREE.Color('#0B3954')
  for (let y = 0; y < size; y++) {
    const t = y / (size - 1)
    const c = top.clone().lerp(bottom, t)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3
      data[i] = Math.floor(c.r * 255)
      data[i + 1] = Math.floor(c.g * 255)
      data[i + 2] = Math.floor(c.b * 255)
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBFormat)
  tex.needsUpdate = true
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

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

  scene.environment = buildGradientEnvMap(renderer)

  const keyLight = new THREE.DirectionalLight('#ffffff', 1.4)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)
  scene.add(new THREE.AmbientLight('#ffffff', 0.4))

  const group = new THREE.Group()
  const shapes: THREE.Mesh[] = []
  const layout = [
    { geo: () => new THREE.IcosahedronGeometry(1, 0), pos: [-1.6, 0.4, 0], scale: 1 },
    { geo: () => new THREE.OctahedronGeometry(0.7, 0), pos: [1.5, -0.5, -0.5], scale: 1 },
    { geo: () => new THREE.IcosahedronGeometry(0.55, 0), pos: [0.3, 1.1, 0.6], scale: 1 }
  ]

  layout.forEach(({ geo, pos, scale }) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      metalness: 0,
      roughness: 0.05,
      transmission: 1,
      thickness: 1.2,
      ior: 1.4,
      envMapIntensity: 1.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      attenuationColor: new THREE.Color('#0B3954'),
      attenuationDistance: 1.5
    })
    const mesh = new THREE.Mesh(geo(), material)
    mesh.position.set(pos[0]!, pos[1]!, pos[2]!)
    mesh.scale.setScalar(scale)
    group.add(mesh)
    shapes.push(mesh)
  })

  scene.add(group)

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

    group.rotation.y += 0.0025
    shapes.forEach((mesh, i) => {
      mesh.rotation.x = t * 0.15 + i
      mesh.rotation.y = t * 0.12 + i * 0.5
      mesh.position.y += Math.sin(t * 0.6 + i * 2) * 0.0015
    })

    group.rotation.x += (pointer.y * 0.25 - group.rotation.x) * 0.04
    group.rotation.z += (-pointer.x * 0.15 - group.rotation.z) * 0.04

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    shapes.forEach((mesh) => {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    })
    scene.environment?.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-95">
    <div class="h-[110%] w-[110%]">
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>
  </div>
</template>
