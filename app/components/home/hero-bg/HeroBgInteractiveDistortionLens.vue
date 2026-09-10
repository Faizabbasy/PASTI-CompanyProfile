<script setup lang="ts">
// Interactive — Distortion lens. A fullscreen shader plane renders a soft
// procedural noise/gradient base in brand tones; a fragment-shader "lens"
// centered on an eased pointer uniform bends nearby UVs outward through a
// radial refraction curve (magnification-style barrel distortion) before
// sampling the base pattern, plus a faint fresnel-like rim highlight at the
// lens edge — like glass sliding over the surface. Position lags the raw
// pointer via simple exponential easing each frame for a weighted, physical
// feel rather than 1:1 tracking.
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
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  const geometry = new THREE.PlaneGeometry(2, 2)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uLensRadius: { value: 0.16 },
    uColorA: { value: new THREE.Color('#0B2A3D') },
    uColorB: { value: new THREE.Color('#0B3954') },
    uColorC: { value: new THREE.Color('#FBBA00') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uAspect;
      uniform float uLensRadius;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          v += amp * noise(p);
          p *= 2.02;
          amp *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        vec2 aspectUv = vec2(uv.x * uAspect, uv.y);
        vec2 pointerAspect = vec2(uPointer.x * uAspect, uPointer.y);

        vec2 toCenter = aspectUv - pointerAspect;
        float dist = length(toCenter);

        vec2 distortedUv = uv;
        float rim = 0.0;
        if (dist < uLensRadius) {
          float t = dist / uLensRadius;
          // Barrel/magnify curve: pull samples inward near the lens center.
          float bend = mix(0.35, 1.0, smoothstep(0.0, 1.0, t));
          vec2 dir = dist > 0.0001 ? toCenter / dist : vec2(0.0);
          vec2 warped = pointerAspect + dir * dist * bend;
          distortedUv = vec2(warped.x / uAspect, warped.y);
          rim = smoothstep(0.75, 1.0, t) * (1.0 - t);
        }

        vec2 p = distortedUv * vec2(uAspect, 1.0) * 3.4 + uTime * 0.02;
        float n = fbm(p);
        float n2 = fbm(p * 1.7 + 4.2);

        vec3 base = mix(uColorA, uColorB, smoothstep(0.2, 0.8, n));
        base = mix(base, uColorC, smoothstep(0.72, 0.95, n2) * 0.5);

        base += rim * 0.35;

        gl_FragColor = vec4(base, 1.0);
      }
    `
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    uniforms.uAspect.value = clientWidth / Math.max(1, clientHeight)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const target = { x: 0.5, y: 0.5 }
  const eased = { x: 0.5, y: 0.5 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    target.x = (e.clientX - rect.left) / rect.width
    target.y = 1 - (e.clientY - rect.top) / rect.height
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed

    // Spring-lag easing toward the raw pointer target — kept active under
    // reduced motion too, since it only runs in response to user input.
    eased.x += (target.x - eased.x) * 0.09
    eased.y += (target.y - eased.y) * 0.09
    uniforms.uPointer.value.set(eased.x, eased.y)

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
