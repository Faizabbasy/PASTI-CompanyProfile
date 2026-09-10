<script setup lang="ts">
// Shader — Z-depth tunnel flow. Inspired by Lusion / Immersive Garden's
// sense of a camera moving through true depth, "rooms" flying past rather
// than a flat plane of motion. Faked cheaply without any raymarching: UV is
// remapped to polar (radius, angle) around the screen center, then 1/radius
// stands in for inverse depth — concentric rings built from that pseudo-
// depth continuously scroll "toward camera" (radius decreasing over time),
// giving a genuine sense of flying through a corridor. Brand-palette bands
// alternate along depth, angle gets a light spiral twist for parallax feel.
// Cost: one polar transform, a couple of trig calls and a mod, per pixel.
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

        // Camera drifts gently off-axis with the pointer, like a subtle
        // steering input through the corridor rather than a direct warp.
        vec2 center = uPointer * 0.15 * aspect;
        vec2 p = uv - center;

        float radius = length(p) + 0.0001;
        float angle = atan(p.y, p.x);

        // Pseudo-depth: inverse radius so rings appear to accelerate toward
        // camera as radius shrinks, exactly like true perspective depth.
        float depth = 1.0 / radius;
        float t = uTime;

        float flow = depth * 0.9 - t * 1.6;
        float spiralAngle = angle + depth * 0.12 - t * 0.15;

        float rings = fract(flow);
        float ringLine = smoothstep(0.0, 0.06, rings) * smoothstep(1.0, 0.94, rings);

        float bandId = floor(flow);
        float bandPhase = fract(bandId * 0.31);
        vec3 bandColor = mix(uColorNavy, uColorNavy2, step(0.5, bandPhase));
        bandColor = mix(bandColor, uColorYellow, step(0.85, bandPhase) * 0.6);

        float spiralStripe = smoothstep(0.48, 0.5, fract(spiralAngle * 2.5));

        float vignette = smoothstep(1.3, 0.15, radius);
        float glow = exp(-radius * radius * 3.0);

        vec3 color = mix(uColorNavy, bandColor, vignette);
        color = mix(color, uColorPaper, ringLine * vignette * 0.6);
        color = mix(color, uColorYellow, spiralStripe * ringLine * vignette * 0.3);
        color = mix(color, uColorPaper, glow * 0.5);

        gl_FragColor = vec4(color, 0.92);
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
