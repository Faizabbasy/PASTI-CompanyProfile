<script setup lang="ts">
// 3D reimagining of HeroBgLinesGrid — the flat blueprint grid + bounding
// square + accent path becomes a real depth-layered scene: a thin wire
// grid plane recedes into Z (built the same precise, undisplaced way as
// the pinned wire-grid hallway — straight LineSegments, no noise), the
// bounding square becomes an extruded frame floating just in front of it,
// and every corner/joint of the composition gets a small emissive "node"
// that breathes (pulses brightness) on its own independent cycle — like a
// quiet sensor network or constellation map rather than a static spec
// sheet. The whole thing drifts almost imperceptibly and answers cursor
// movement with a slight parallax tilt, so it never reads as a frozen
// diagram.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildGridLines(width: number, height: number, divisionsX: number, divisionsY: number) {
  const points: THREE.Vector3[] = []
  const hw = width / 2
  const hh = height / 2
  for (let i = 0; i <= divisionsX; i++) {
    const x = -hw + (width * i) / divisionsX
    points.push(new THREE.Vector3(x, -hh, 0), new THREE.Vector3(x, hh, 0))
  }
  for (let i = 0; i <= divisionsY; i++) {
    const y = -hh + (height * i) / divisionsY
    points.push(new THREE.Vector3(-hw, y, 0), new THREE.Vector3(hw, y, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 10)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')

  const key = new THREE.DirectionalLight('#FFF6E0', 1.2)
  key.position.set(3, 4, 6)
  scene.add(key)
  scene.add(new THREE.AmbientLight('#0B3954', 0.3))

  const group = new THREE.Group()

  // Receding grid plane — deliberately flat/undistorted, faint, sitting
  // behind everything else as a "spec sheet" backdrop.
  const gridGeo = buildGridLines(9, 6, 9, 6)
  const gridMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.22 })
  const grid = new THREE.LineSegments(gridGeo, gridMat)
  grid.position.z = -1.4
  group.add(grid)

  // Bounding square -> extruded frame, matching the original's central
  // rect motif, floating just in front of the grid.
  const shape = new THREE.Shape()
  const s = 1.6
  shape.moveTo(-s, -s)
  shape.lineTo(s, -s)
  shape.lineTo(s, s)
  shape.lineTo(-s, s)
  shape.lineTo(-s, -s)
  const hole = new THREE.Path()
  const isz = s - 0.08
  hole.moveTo(-isz, -isz)
  hole.lineTo(isz, -isz)
  hole.lineTo(isz, isz)
  hole.lineTo(-isz, isz)
  hole.lineTo(-isz, -isz)
  shape.holes.push(hole)
  const frameGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 })
  const frameMat = new THREE.MeshPhysicalMaterial({ color: navy, metalness: 0.6, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25 })
  const frame = new THREE.Mesh(frameGeo, frameMat)
  group.add(frame)

  // Accent path -> an angled tube echoing the original's yellow L-shaped
  // stroke, running from the frame's corner out to a node.
  const accentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.9, 0.9, 0.3),
    new THREE.Vector3(3, 0.9, 0.3),
    new THREE.Vector3(3, -0.6, 0.3)
  ])
  const accentGeo = new THREE.TubeGeometry(accentCurve, 32, 0.035, 8, false)
  const accentMat = new THREE.MeshPhysicalMaterial({ color: yellow, metalness: 0.5, roughness: 0.3, emissive: yellow, emissiveIntensity: 0.2 })
  const accent = new THREE.Mesh(accentGeo, accentMat)
  group.add(accent)

  // Breathing nodes at each significant joint — small emissive spheres
  // that pulse brightness independently, the "constellation" signature.
  interface Node {
    mesh: THREE.Mesh
    material: THREE.MeshPhysicalMaterial
    baseIntensity: number
    pulseSpeed: number
    phase: number
  }
  const nodes: Node[] = []
  const nodePositions: [number, number, number, boolean][] = [
    [-s, -s, 0.05, false], [s, -s, 0.05, false], [s, s, 0.05, false], [-s, s, 0.05, false],
    [3, -0.6, 0.3, true], [-3.2, 1.8, -1, false], [3.4, 2, -1, false]
  ]
  for (const [x, y, z, accented] of nodePositions) {
    const nodeGeo = new THREE.SphereGeometry(accented ? 0.07 : 0.05, 16, 16)
    const color = accented ? yellow : navy
    const material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.4,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.4
    })
    const mesh = new THREE.Mesh(nodeGeo, material)
    mesh.position.set(x, y, z)
    group.add(mesh)
    nodes.push({
      mesh,
      material,
      baseIntensity: 0.4,
      pulseSpeed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2
    })
  }

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
  function tick() {
    const elapsed = prefersReducedMotion ? 0 : clock.getElapsedTime()

    if (!prefersReducedMotion) {
      nodes.forEach((node) => {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * node.pulseSpeed + node.phase)
        node.material.emissiveIntensity = node.baseIntensity + pulse * 0.9
      })
      group.rotation.z = Math.sin(elapsed * 0.08) * 0.02
    }

    group.rotation.y += (pointer.x * 0.15 - group.rotation.y) * 0.04
    group.rotation.x += (-pointer.y * 0.08 - group.rotation.x) * 0.04

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    gridGeo.dispose()
    gridMat.dispose()
    frameGeo.dispose()
    frameMat.dispose()
    accentGeo.dispose()
    accentMat.dispose()
    nodes.forEach((n) => {
      n.mesh.geometry.dispose()
      n.material.dispose()
    })
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
