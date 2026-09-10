<script setup lang="ts">
// Shader — Animated Voronoi cell field. A fullscreen quad whose fragment
// shader runs a classic 3x3-neighborhood Voronoi lookup (hashed cell
// centers drifting slowly via sine offsets) to get per-pixel distance to
// the nearest and second-nearest cell center; the difference between the
// two lights up thin cell-edge lines (organic circuit-board / cracked-glass
// look). Cheap: 9 hash lookups per pixel, no textures, no geometry beyond a
// single quad. Cursor brightens nearby edges via a radial falloff.
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

      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453123);
      }

      // Returns (distance to nearest cell center, distance to second nearest).
      vec2 voronoi(vec2 p, float t) {
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        float d1 = 8.0;
        float d2 = 8.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 seed = hash2(ip + neighbor);
            vec2 offset = neighbor + 0.5 + 0.5 * sin(t + seed * 6.2831) - fp;
            float d = dot(offset, offset);
            if (d < d1) {
              d2 = d1;
              d1 = d;
            } else if (d < d2) {
              d2 = d;
            }
          }
        }
        return vec2(sqrt(d1), sqrt(d2));
      }

      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (vUv - 0.5) * aspect;

        float t = uTime * 0.12;
        vec2 cellUv = uv * 3.5;
        vec2 dists = voronoi(cellUv, t);

        float edge = dists.y - dists.x;
        float edgeGlow = 1.0 - smoothstep(0.0, 0.12, edge);

        float pointerDist = length(uv - uPointer * 0.5 * aspect);
        float pointerBoost = exp(-pointerDist * pointerDist * 4.0);
        edgeGlow += edgeGlow * pointerBoost * 1.2;

        vec3 base = mix(uColorNavy, uColorNavy2, smoothstep(0.0, 1.0, dists.x));
        vec3 edgeColor = mix(uColorPaper, uColorYellow, pointerBoost);
        vec3 color = mix(base, edgeColor, clamp(edgeGlow, 0.0, 1.0));

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
