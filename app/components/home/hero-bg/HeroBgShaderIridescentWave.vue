<script setup lang="ts">
// Shader — Iridescent interference waves. A fullscreen quad whose fragment
// shader computes a slowly drifting "thickness" field from two overlaid sine
// wave bands (like thin-film interference on oil or soap film), then maps
// thickness to a fresnel-ish angle term to mix between the brand colors —
// no real physical thin-film math, just a cheap analytic approximation that
// reads as iridescent within a restrained navy/yellow/paper palette. Cursor
// adds a soft local highlight bloom. One draw call, pure math, no textures.
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
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const geometry = new THREE.PlaneGeometry(2, 2)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uColorNavy: { value: new THREE.Color('#0B2A3D') },
    uColorNavy2: { value: new THREE.Color('#0B3954') },
    uColorPaper: { value: new THREE.Color('#EAF1F4') },
    uColorYellow: { value: new THREE.Color('#FBBA00') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform vec3 uColorNavy;
      uniform vec3 uColorNavy2;
      uniform vec3 uColorPaper;
      uniform vec3 uColorYellow;
      varying vec2 vUv;

      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (vUv - 0.5) * aspect;

        float t = uTime * 0.035;

        // Two slow, angled sine bands standing in for interference thickness.
        float bandA = sin(uv.x * 3.2 + uv.y * 1.6 + t * 2.0);
        float bandB = sin(uv.x * -2.1 + uv.y * 2.8 - t * 1.4 + 1.7);
        float thickness = 0.5 + 0.25 * bandA + 0.25 * bandB;

        // Fresnel-like angle term from a fake "view" gradient across the plane.
        float fresnel = pow(1.0 - abs(uv.y * 0.6 + uv.x * 0.2), 1.5);

        vec3 colorLow = mix(uColorNavy, uColorNavy2, fresnel);
        vec3 colorHigh = mix(uColorPaper, uColorYellow, fresnel * 0.6);
        vec3 color = mix(colorLow, colorHigh, smoothstep(0.25, 0.85, thickness));

        float pointerDist = length(uv - uPointer * 0.5 * aspect);
        float bloom = exp(-pointerDist * pointerDist * 6.0) * 0.5;
        color = mix(color, uColorPaper, bloom);

        gl_FragColor = vec4(color, 0.88);
      }
    `
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    uniforms.uResolution.value.set(clientWidth, clientHeight)
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
    uniforms.uTime.value = prefersReducedMotion ? 0 : clock.getElapsedTime()
    uniforms.uPointer.value.set(pointer.x, pointer.y)
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-85">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
