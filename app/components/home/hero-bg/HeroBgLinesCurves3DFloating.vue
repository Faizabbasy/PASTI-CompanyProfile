<script setup lang="ts">
// 3D reimagining of HeroBgLinesCurves — the flat SVG bezier curves, square,
// and circle from that sketch are rebuilt as real Three.js geometry
// occupying actual depth: the two big curves become TubeGeometry tubes
// (CatmullRomCurve3 sampled from the same control points, just in 3D),
// the square becomes a thin extruded frame, the circle becomes a torus —
// all lit by a PMREM environment + key/rim lights (same pipeline as the
// solid wire-grid rings) so they have real metal specular response
// instead of flat SVG strokes. Nothing here just "sits" — every piece
// has its own independent idle motion (slow bob, slight rotation drift,
// scale breathing) driven by phase-offset sine waves so the whole
// composition reads as continuously, quietly alive rather than a static
// render, plus gentle cursor-parallax on the whole group.
import * as THREE from 'three'
import gsap from 'gsap'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface LivingPart {
  object: THREE.Object3D
  basePos: THREE.Vector3
  bobAmount: number
  bobSpeed: number
  rotSpeed: THREE.Vector3
  phase: number
}

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

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 9)

  const navy = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')

  const key = new THREE.DirectionalLight('#FFF6E0', 1.4)
  key.position.set(4, 5, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.9)
  rim.position.set(-4, -2, -3)
  scene.add(rim)
  scene.add(new THREE.AmbientLight('#0B3954', 0.3))

  const livingParts: LivingPart[] = []
  function registerLiving(object: THREE.Object3D, opts: Partial<LivingPart> = {}) {
    livingParts.push({
      object,
      basePos: object.position.clone(),
      bobAmount: opts.bobAmount ?? 0.12,
      bobSpeed: opts.bobSpeed ?? 0.6,
      rotSpeed: opts.rotSpeed ?? new THREE.Vector3(0.05, 0.08, 0),
      phase: opts.phase ?? Math.random() * Math.PI * 2
    })
  }

  // Two flowing tubes, sampled from the same bezier control shapes as the
  // original SVG artwork, just extended into Z depth so they read as
  // ribbons floating in space rather than flat strokes.
  function buildTube(points: THREE.Vector3[], radius: number, color: THREE.Color, metalness: number, roughness: number) {
    const curve = new THREE.CatmullRomCurve3(points)
    const geo = new THREE.TubeGeometry(curve, 120, radius, 10, false)
    const mat = new THREE.MeshPhysicalMaterial({ color, metalness, roughness, clearcoat: 0.5, clearcoatRoughness: 0.3 })
    return new THREE.Mesh(geo, mat)
  }

  const group = new THREE.Group()

  const tube1 = buildTube(
    [
      new THREE.Vector3(-3.6, -1.2, -0.6), new THREE.Vector3(-1.2, 0.6, 0.4),
      new THREE.Vector3(0.6, -1.6, -0.2), new THREE.Vector3(2.4, 0.9, 0.6),
      new THREE.Vector3(3.8, 2.4, -0.4)
    ],
    0.045, navy.clone().lerp(yellow, 0.08), 0.6, 0.32
  )
  group.add(tube1)
  registerLiving(tube1, { bobAmount: 0.1, bobSpeed: 0.5, phase: 0 })

  const tube2 = buildTube(
    [
      new THREE.Vector3(-4.6, 1.6, 0.5), new THREE.Vector3(-2, 0.4, -0.3),
      new THREE.Vector3(0.4, 1.8, 0.5), new THREE.Vector3(2.6, -0.4, -0.2),
      new THREE.Vector3(4.4, 1, 0.5)
    ],
    0.03, navy, 0.5, 0.4
  )
  tube2.position.z = -1.2
  group.add(tube2)
  registerLiving(tube2, { bobAmount: 0.14, bobSpeed: 0.42, phase: 1.7 })

  // Square -> thin extruded rounded-corner frame, floating upper-left,
  // matching the original composition's placement.
  const squareShape = new THREE.Shape()
  const sq = 0.75
  const sr = 0.06
  squareShape.moveTo(-sq + sr, -sq)
  squareShape.lineTo(sq - sr, -sq)
  squareShape.quadraticCurveTo(sq, -sq, sq, -sq + sr)
  squareShape.lineTo(sq, sq - sr)
  squareShape.quadraticCurveTo(sq, sq, sq - sr, sq)
  squareShape.lineTo(-sq + sr, sq)
  squareShape.quadraticCurveTo(-sq, sq, -sq, sq - sr)
  squareShape.lineTo(-sq, -sq + sr)
  squareShape.quadraticCurveTo(-sq, -sq, -sq + sr, -sq)
  const squareHole = new THREE.Path()
  const isq = sq - 0.05
  squareHole.moveTo(-isq, -isq)
  squareHole.lineTo(isq, -isq)
  squareHole.lineTo(isq, isq)
  squareHole.lineTo(-isq, isq)
  squareHole.lineTo(-isq, -isq)
  squareShape.holes.push(squareHole)
  const squareGeo = new THREE.ExtrudeGeometry(squareShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 })
  const squareMat = new THREE.MeshPhysicalMaterial({ color: yellow, metalness: 0.5, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 })
  const square = new THREE.Mesh(squareGeo, squareMat)
  square.position.set(-2.4, 1.6, 0.8)
  group.add(square)
  registerLiving(square, { bobAmount: 0.16, bobSpeed: 0.55, rotSpeed: new THREE.Vector3(0.02, 0.15, 0.04), phase: 3.1 })

  // Circle -> torus, lower-right, echoing the original's accent circle.
  const torusGeo = new THREE.TorusGeometry(0.55, 0.045, 16, 48)
  const torusMat = new THREE.MeshPhysicalMaterial({ color: navy, metalness: 0.55, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25 })
  const torus = new THREE.Mesh(torusGeo, torusMat)
  torus.position.set(2.9, -1.4, -0.3)
  torus.rotation.x = Math.PI / 2.4
  group.add(torus)
  registerLiving(torus, { bobAmount: 0.13, bobSpeed: 0.48, rotSpeed: new THREE.Vector3(0.1, 0.02, 0.06), phase: 4.6 })

  // A short accent rod (the original's short diagonal accent stroke),
  // given a soft emissive glow so it reads as a highlight beat among the
  // more neutral navy pieces.
  const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 12)
  const rodMat = new THREE.MeshPhysicalMaterial({ color: yellow, metalness: 0.4, roughness: 0.3, emissive: yellow, emissiveIntensity: 0.25 })
  const rod = new THREE.Mesh(rodGeo, rodMat)
  rod.position.set(1.4, -1.9, 0.4)
  rod.rotation.z = Math.PI / 3.2
  group.add(rod)
  registerLiving(rod, { bobAmount: 0.1, bobSpeed: 0.65, rotSpeed: new THREE.Vector3(0, 0, 0.12), phase: 5.9 })

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
      livingParts.forEach((part) => {
        const t = elapsed * part.bobSpeed + part.phase
        part.object.position.y = part.basePos.y + Math.sin(t) * part.bobAmount
        part.object.position.x = part.basePos.x + Math.cos(t * 0.7) * part.bobAmount * 0.4
        part.object.rotation.x += part.rotSpeed.x * 0.01
        part.object.rotation.y += part.rotSpeed.y * 0.01
        part.object.rotation.z += part.rotSpeed.z * 0.01
      })
    }

    group.rotation.y += ((pointer.x * 0.18) - group.rotation.y) * 0.04
    group.rotation.x += ((-pointer.y * 0.1) - group.rotation.x) * 0.04

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    ;[tube1, tube2, square, torus, rod].forEach((mesh) => {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
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
