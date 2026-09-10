<script setup lang="ts">
// 3D — Cell cluster. Not a single blob like HeroBgThreeHolographicBlob —
// several smaller blobs (an organic "cell colony") drift independently,
// gently attract toward each other and toward the cursor when it comes
// close (a soft inverse-square-ish pull, not a hard snap), and separate
// again when they'd overlap too much, roughly approximating metaball
// behavior with simple mesh-scale/proximity cues rather than true
// isosurface blending (real metaballs would need marching-cubes, too
// heavy for a background layer) — a lava-lamp-like colony instead of one
// static hero shape.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Cell {
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
  pos: THREE.Vector3
  vel: THREE.Vector3
  baseRadius: number
  wanderPhase: THREE.Vector3
}

function buildCellShader(colorA: THREE.Color, colorB: THREE.Color) {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec3 p = position;
        float wobble = sin(p.x * 4.0 + uTime * 1.2) * cos(p.y * 4.0 + uTime * 0.9) * 0.035;
        p += normalize(p + 0.0001) * wobble;
        vNormal = normalize(normalMatrix * normalize(p));
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec3 n = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(n, vViewDir), 0.0), 2.4);
        vec3 color = mix(uColorA, uColorB, fresnel);
        float alpha = 0.55 + fresnel * 0.4;
        gl_FragColor = vec4(color, alpha);
      }
    `
  })
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

  const navy = new THREE.Color('#0B2A3D')
  const yellow = new THREE.Color('#FBBA00')

  const cellCount = 6
  const cells: Cell[] = []
  for (let i = 0; i < cellCount; i++) {
    const baseRadius = 0.45 + Math.random() * 0.5
    const geo = new THREE.IcosahedronGeometry(baseRadius, 6)
    const isAccent = i === 0
    const material = buildCellShader(isAccent ? yellow.clone() : navy.clone(), isAccent ? navy.clone() : yellow.clone())
    const mesh = new THREE.Mesh(geo, material)
    const angle = (i / cellCount) * Math.PI * 2
    const radius = 1.2 + Math.random() * 0.6
    const pos = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.6)
    mesh.position.copy(pos)
    scene.add(mesh)
    cells.push({
      mesh,
      material,
      pos,
      vel: new THREE.Vector3(),
      baseRadius,
      wanderPhase: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10)
    })
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

  const pointer = { x: 999, y: 999 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  function onPointerLeave() {
    pointer.x = 999
    pointer.y = 999
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  const pointerWorld = new THREE.Vector3()
  const clock = new THREE.Clock()

  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed
    const dt = 0.016

    pointerWorld.set(pointer.x * 2.4, pointer.y * 1.8, 0)

    if (!prefersReducedMotion) {
      cells.forEach((cell) => {
        cell.material.uniforms.uTime.value = t

        // Gentle wander so the cluster never fully settles.
        const wander = new THREE.Vector3(
          Math.sin(t * 0.3 + cell.wanderPhase.x) * 0.15,
          Math.cos(t * 0.25 + cell.wanderPhase.y) * 0.15,
          Math.sin(t * 0.2 + cell.wanderPhase.z) * 0.1
        )

        // Soft attraction toward cursor (falls off with distance), plus
        // mild mutual repulsion so cells don't fully overlap.
        const toPointer = pointerWorld.clone().sub(cell.pos)
        const pointerDist = toPointer.length()
        const attraction = pointerDist < 3.5 ? toPointer.normalize().multiplyScalar(0.35 / Math.max(pointerDist, 0.6)) : new THREE.Vector3()

        const repulsion = new THREE.Vector3()
        cells.forEach((other) => {
          if (other === cell) return
          const away = cell.pos.clone().sub(other.pos)
          const dist = away.length()
          const minDist = cell.baseRadius + other.baseRadius
          if (dist < minDist && dist > 0.001) {
            repulsion.add(away.normalize().multiplyScalar((minDist - dist) * 0.4))
          }
        })

        cell.vel.add(wander.multiplyScalar(dt))
        cell.vel.add(attraction.multiplyScalar(dt))
        cell.vel.add(repulsion.multiplyScalar(dt))
        cell.vel.multiplyScalar(0.94)
        cell.pos.add(cell.vel)

        // Soft pull back toward center so the cluster doesn't drift off
        // camera over time.
        cell.pos.multiplyScalar(0.997)

        cell.mesh.position.copy(cell.pos)
        cell.mesh.rotation.y = t * 0.15 + cell.wanderPhase.x
      })
    }

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    parent.removeEventListener('pointerleave', onPointerLeave)
    cells.forEach((cell) => {
      cell.mesh.geometry.dispose()
      cell.material.dispose()
    })
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
