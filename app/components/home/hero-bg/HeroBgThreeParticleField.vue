<script setup lang="ts">
// 3D — GPU particle field. Thousands of points rendered as a single
// THREE.Points draw call, positions perturbed in a vertex shader (curl-like
// noise) so the whole field looks like it's flowing in 3D space, with a
// soft circular sprite (via fragment shader, no texture asset) and additive
// blending for a glowing dust look. Cursor creates a repulsion swirl.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 5)

  const COUNT = 1400
  const positions = new Float32Array(COUNT * 3)
  const seeds = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    const radius = 2.6 * Math.cbrt(Math.random())
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6
    positions[i * 3 + 2] = radius * Math.cos(phi) * 0.6
    seeds[i] = Math.random() * 1000
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector3(999, 999, 0) },
    uColor: { value: new THREE.Color('#0B3954') },
    uAccent: { value: new THREE.Color('#FBBA00') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime;
      uniform vec3 uPointer;
      attribute float aSeed;
      varying float vSeed;
      varying float vDist;
      void main() {
        vSeed = aSeed;
        vec3 p = position;
        p.x += sin(uTime * 0.2 + aSeed) * 0.15;
        p.y += cos(uTime * 0.15 + aSeed * 1.3) * 0.15;
        p.z += sin(uTime * 0.18 + aSeed * 0.7) * 0.15;

        float distToPointer = distance(p, uPointer);
        vDist = distToPointer;
        if (distToPointer < 1.4) {
          vec3 dir = normalize(p - uPointer);
          p += dir * (1.4 - distToPointer) * 0.6;
        }

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (18.0 / -mvPosition.z) * (0.6 + 0.4 * sin(uTime + aSeed));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      varying float vSeed;
      varying float vDist;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d) * 0.7;
        vec3 color = mix(uColor, uAccent, step(0.92, fract(vSeed * 0.13)));
        float glow = 1.0 - smoothstep(0.0, 1.4, vDist);
        gl_FragColor = vec4(color, alpha * (0.5 + glow * 0.5));
      }
    `
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointerTarget = new THREE.Vector3(999, 999, 0)
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    const vector = new THREE.Vector3(nx, ny, 0.5).unproject(camera)
    const dir = vector.sub(camera.position).normalize()
    const distance = -camera.position.z / dir.z
    pointerTarget.copy(camera.position).add(dir.multiplyScalar(distance))
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed
    uniforms.uPointer.value.lerp(pointerTarget, 0.08)
    points.rotation.y = elapsed * 0.04
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
