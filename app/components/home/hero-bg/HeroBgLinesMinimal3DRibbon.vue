<script setup lang="ts">
// 3D reimagining of HeroBgLinesMinimal — the single flowing SVG stroke
// with a traveling accent dot becomes one continuous metal ribbon
// (TubeGeometry along the same S-curve, just extended into Z) with a
// glowing bead that travels along it exactly as the original dot did
// (curve.getPointAt(progress)), except the bead now has real spring-lag
// physics: it target-chases the ideal point on the curve rather than
// snapping straight to it, so it trails and settles like a bead on a
// wire — a small kinetic-sculpture touch that reads as physically real
// instead of purely procedural. The ribbon itself has a very slow
// continuous undulation (per-vertex sine displacement in the shader) so
// it never looks like a frozen metal rod, and the whole piece answers
// cursor movement with a gentle parallax tilt.
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
  renderer.toneMappingExposure = 1.1

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 9.5)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')

  const key = new THREE.DirectionalLight('#FFF6E0', 1.4)
  key.position.set(4, 4, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.8)
  rim.position.set(-4, -2, -3)
  scene.add(rim)
  scene.add(new THREE.AmbientLight('#0B3954', 0.3))

  const group = new THREE.Group()

  // Same S-curve as the original SVG path, scaled into 3D units, with a
  // little Z wander so it reads as a ribbon in space rather than a flat
  // plane facing the camera.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.6, 0.3, -0.4), new THREE.Vector3(-2.6, -0.9, 0.5),
    new THREE.Vector3(-0.6, 1.1, -0.5), new THREE.Vector3(1.2, -0.6, 0.6),
    new THREE.Vector3(2.6, 1, -0.3), new THREE.Vector3(4.4, 0.2, 0.4)
  ])

  const tubeGeo = new THREE.TubeGeometry(curve, 200, 0.055, 12, false)
  const tubeMat = new THREE.MeshPhysicalMaterial({
    color: navy,
    metalness: 0.65,
    roughness: 0.28,
    clearcoat: 0.55,
    clearcoatRoughness: 0.2
  })

  // Slow per-vertex undulation via onBeforeCompile — displaces along the
  // tube's local normal by a small sine wave keyed off vertex position and
  // uTime, so the ribbon appears to gently flex rather than sit rigid.
  const uniforms = { uTime: { value: 0 } }
  tubeMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uTime;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\n
        float wave = sin(position.x * 0.6 + uTime * 0.8) * 0.06;
        transformed += normal * wave;`
      )
  }

  const tube = new THREE.Mesh(tubeGeo, tubeMat)
  group.add(tube)

  // Traveling bead — spring-chases the ideal curve position instead of
  // snapping to it directly, so it reads as a physical object with
  // inertia rather than a value tied 1:1 to a progress uniform.
  const beadGeo = new THREE.SphereGeometry(0.13, 24, 24)
  const beadMat = new THREE.MeshPhysicalMaterial({
    color: yellow,
    metalness: 0.5,
    roughness: 0.25,
    emissive: yellow,
    emissiveIntensity: 0.5,
    clearcoat: 0.6
  })
  const bead = new THREE.Mesh(beadGeo, beadMat)
  const beadStart = curve.getPointAt(0)
  bead.position.copy(beadStart)
  group.add(bead)

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
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  const beadVelocity = new THREE.Vector3()
  const beadTarget = new THREE.Vector3()
  const BEAD_CYCLE_SECONDS = 14

  function tick() {
    const elapsed = prefersReducedMotion ? 0 : clock.getElapsedTime()
    uniforms.uTime.value = elapsed

    if (!prefersReducedMotion) {
      const progress = (elapsed % BEAD_CYCLE_SECONDS) / BEAD_CYCLE_SECONDS
      curve.getPointAt(progress, beadTarget)
      // Critically-damped spring toward the ideal point: bead trails
      // slightly behind fast curve sections and settles into straighter
      // ones, instead of moving at perfectly uniform curve-parameter speed.
      const springStrength = 6
      const damping = 4.2
      const toTarget = beadTarget.clone().sub(bead.position)
      beadVelocity.addScaledVector(toTarget, springStrength * 0.016)
      beadVelocity.multiplyScalar(1 - damping * 0.016)
      bead.position.addScaledVector(beadVelocity, 0.016)
    }

    group.rotation.y += (pointer.x * 0.16 - group.rotation.y) * 0.04
    group.rotation.x += (-pointer.y * 0.09 - group.rotation.x) * 0.04

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    tubeGeo.dispose()
    tubeMat.dispose()
    beadGeo.dispose()
    beadMat.dispose()
    envMap.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
