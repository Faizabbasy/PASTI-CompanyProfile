<script setup lang="ts">
// 3D — Glass refraction blob. A completely different render treatment
// from HeroBgThreeHolographicBlob's hand-rolled fresnel shader: this uses
// THREE.MeshPhysicalMaterial's real transmission/IOR pipeline (actual
// light refraction through the mesh, sampling a PMREM-baked environment)
// so it reads as genuine glass/crystal rather than a shader illusion —
// distinctly more "premium material" than "iridescent effect". A soft
// internal displacement noise (applied to the geometry once, not
// per-frame) keeps the surface organic rather than a perfect sphere.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.02).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 6.5)

  const key = new THREE.DirectionalLight('#FFF6E0', 1.5)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#FBBA00', 0.6)
  rim.position.set(-3, -2, -4)
  scene.add(rim)

  // One-time organic displacement so the blob isn't a perfect icosphere —
  // baked into the geometry, not animated per-frame, since transmission
  // materials are expensive enough already without a vertex shader too.
  const geometry = new THREE.IcosahedronGeometry(1.6, 24)
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i)
    const n = v.clone().normalize()
    const bump = Math.sin(n.x * 4.2) * Math.cos(n.y * 3.6) * Math.sin(n.z * 4.8) * 0.09
    v.addScaledVector(n, bump)
    posAttr.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()

  const material = new THREE.MeshPhysicalMaterial({
    color: '#EAF1F4',
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 1.8,
    ior: 1.45,
    attenuationColor: new THREE.Color('#0B3954'),
    attenuationDistance: 1.4,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // A small yellow core light source suspended inside the glass, visible
  // through refraction as a warm glow at the blob's heart.
  const coreGeo = new THREE.SphereGeometry(0.18, 16, 16)
  const coreMat = new THREE.MeshBasicMaterial({ color: '#FBBA00' })
  const core = new THREE.Mesh(coreGeo, coreMat)
  scene.add(core)
  const coreLight = new THREE.PointLight('#FBBA00', 2.5, 4)
  scene.add(coreLight)

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

    mesh.rotation.y = t * 0.12
    mesh.rotation.x = Math.sin(t * 0.1) * 0.15

    // Core light drifts in a slow small orbit, visible through the glass
    // as a shifting internal glow.
    const orbitR = 0.35
    core.position.set(Math.cos(t * 0.5) * orbitR, Math.sin(t * 0.4) * orbitR * 0.7, Math.sin(t * 0.5) * orbitR)
    coreLight.position.copy(core.position)

    mesh.position.x += (pointer.x * 0.25 - mesh.position.x) * 0.04
    mesh.position.y += (pointer.y * 0.25 - mesh.position.y) * 0.04

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
    coreGeo.dispose()
    coreMat.dispose()
    envMap.dispose()
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
