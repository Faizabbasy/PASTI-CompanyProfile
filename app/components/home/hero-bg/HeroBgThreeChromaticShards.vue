<script setup lang="ts">
// 3D — Chromatic glass shards. A small cluster of elongated, flattened
// tetrahedra (custom BufferGeometry, not a stock primitive) with a
// refractive-looking custom shader: fresnel rim + a faked chromatic
// aberration achieved by sampling the same gradient ramp at three slightly
// offset fresnel exponents per channel (no post-process pass, no scene
// render-to-texture — just per-channel offset in the fragment shader).
// Shards counter-rotate slowly around a shared center so they catch
// "light" at different times, like a suspended crystal cluster.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function buildShardGeometry(length: number, width: number, thickness: number): THREE.BufferGeometry {
  // A thin flattened tetrahedron: two apex points stretched along Y, and
  // two side points offset in X/Z, forming an elongated shard silhouette.
  const positions = new Float32Array([
    0, length * 0.5, 0,
    0, -length * 0.5, 0,
    width * 0.5, 0, thickness * 0.5,
    -width * 0.5, 0, -thickness * 0.5
  ])
  const indices = [
    0, 2, 1,
    0, 1, 3,
    0, 3, 2,
    1, 2, 3
  ]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 6.5)

  const group = new THREE.Group()
  scene.add(group)

  const shardConfigs = [
    { length: 2.2, width: 0.55, thickness: 0.18, pos: [-1.3, 0.3, 0.2], tilt: 0.4, speed: 0.09 },
    { length: 1.6, width: 0.4, thickness: 0.14, pos: [1.1, -0.4, -0.3], tilt: -0.6, speed: -0.13 },
    { length: 1.9, width: 0.48, thickness: 0.16, pos: [0.2, 1.0, 0.5], tilt: 1.1, speed: 0.11 },
    { length: 1.3, width: 0.32, thickness: 0.12, pos: [-0.4, -1.1, -0.2], tilt: -1.3, speed: -0.08 },
    { length: 1.5, width: 0.36, thickness: 0.13, pos: [1.5, 0.9, 0.1], tilt: 2.0, speed: 0.16 }
  ]

  const shardUniforms = {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#0B3954') },
    uColorB: { value: new THREE.Color('#FBBA00') },
    uColorRim: { value: new THREE.Color('#EAF1F4') }
  }

  const shards: { mesh: THREE.Mesh; speed: number; basePos: THREE.Vector3 }[] = []

  shardConfigs.forEach((cfg, i) => {
    const geometry = buildShardGeometry(cfg.length, cfg.width, cfg.thickness)
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: shardUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorRim;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        float fresnelAt(float ex) {
          return pow(1.0 - max(dot(normalize(vNormal), vViewDir), 0.0), ex);
        }

        void main() {
          // Faked chromatic aberration: sample the rim/base mix at three
          // slightly different fresnel exponents per channel so the edges
          // separate into a subtle RGB fringe, like real dispersion.
          float fr = fresnelAt(1.8);
          float fg = fresnelAt(2.1);
          float fb = fresnelAt(2.5);

          vec3 base = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uTime * 0.2 + vNormal.x * 3.0));

          float r = mix(base.r, uColorRim.r, fr);
          float g = mix(base.g, uColorRim.g, fg);
          float b = mix(base.b, uColorRim.b, fb);

          vec3 color = vec3(r, g, b);
          float alpha = 0.45 + fg * 0.45;
          gl_FragColor = vec4(color, alpha);
        }
      `
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(cfg.pos[0]!, cfg.pos[1]!, cfg.pos[2]!)
    mesh.rotation.z = cfg.tilt
    mesh.rotation.x = i * 0.4
    group.add(mesh)
    shards.push({ mesh, speed: cfg.speed, basePos: mesh.position.clone() })
  })

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
    shardUniforms.uTime.value = t

    group.rotation.y += 0.0018
    shards.forEach(({ mesh, speed, basePos }) => {
      mesh.rotation.y = t * speed
      mesh.rotation.x = basePos.x * 0.1 + Math.sin(t * 0.15 + basePos.y) * 0.1
      mesh.position.y = basePos.y + Math.sin(t * 0.3 + basePos.x) * 0.06
    })

    group.rotation.x += (pointer.y * 0.15 - group.rotation.x) * 0.03
    group.rotation.z += (-pointer.x * 0.1 - group.rotation.z) * 0.03

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    shards.forEach(({ mesh }) => {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    })
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-90">
    <div class="h-[115%] w-[115%]">
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>
  </div>
</template>
