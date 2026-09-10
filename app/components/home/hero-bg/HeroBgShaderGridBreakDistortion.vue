<script setup lang="ts">
// Shader — Grid that breaks on cue. Inspired by Uncommon Studio's confident
// grid systems that break at exactly the right moment: a full-screen shader
// draws a precise thin-line grid (cheap fract/abs edge test), and a GSAP
// timeline (JS-driven uBandPos/uBandStrength uniforms, not per-frame random
// noise) sweeps a traveling band across the screen on a deliberate rhythm.
// Grid lines caught inside the band get sharply displaced/glitched — a UV
// shift keyed off a coarse hash of the local cell, not smooth noise, so it
// reads as a precise mechanical break — then snap back as the band passes.
// Cost: one grid edge test plus one band falloff and a hash, per pixel.
import gsap from 'gsap'
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
    uBandPos: { value: -0.8 },
    uBandStrength: { value: 0 },
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
      uniform float uBandPos;
      uniform float uBandStrength;
      uniform vec2 uResolution;
      uniform vec3 uColorNavy;
      uniform vec3 uColorNavy2;
      uniform vec3 uColorPaper;
      uniform vec3 uColorYellow;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
      }

      float gridLines(vec2 uv, float cells, float thickness) {
        vec2 g = abs(fract(uv * cells) - 0.5);
        vec2 d = fwidth(uv * cells) * thickness;
        vec2 line = smoothstep(0.5 - d, 0.5, g);
        return max(line.x, line.y);
      }

      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (vUv - 0.5) * aspect;

        float cells = 14.0;

        // Traveling band on a GSAP-driven position; falloff is a hard-ish
        // cosine lobe so the break reads as a precise pass, not a smear.
        float distToBand = abs(uv.x - uBandPos);
        float bandMask = smoothstep(0.22, 0.0, distToBand) * uBandStrength;

        vec2 cellId = floor(uv * cells);
        float jitterSeed = hash(cellId + floor(uTime * 6.0));
        vec2 glitchOffset = vec2(jitterSeed - 0.5, hash(cellId.yx + 3.1) - 0.5) * 0.06;

        vec2 distortedUv = uv + glitchOffset * bandMask;

        float grid = gridLines(distortedUv, cells, 1.4);

        float pointerDist = length(uv - uPointer * 0.5 * aspect);
        float pointerGlow = exp(-pointerDist * pointerDist * 5.0) * 0.4;

        vec3 base = mix(uColorNavy, uColorNavy2, 0.5 + 0.5 * uv.y);
        vec3 lineColor = mix(uColorPaper, uColorYellow, bandMask);
        vec3 color = mix(base, lineColor, grid * (0.5 + bandMask * 0.5));
        color = mix(color, uColorYellow, bandMask * 0.06);
        color += uColorPaper * pointerGlow * 0.15;

        gl_FragColor = vec4(color, 0.9);
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

  // Deliberate rhythmic sweep: band travels across, punches strength up for
  // an instant right as it crosses center, then snaps back down — precise
  // and metronomic, matching a confident grid-system break, not chaos.
  const bandState = { pos: -0.9, strength: 0 }
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })
  if (!prefersReducedMotion) {
    tl.set(bandState, { pos: -0.9, strength: 0 })
      .to(bandState, { pos: 0.9, duration: 2.2, ease: 'power1.inOut' })
      .to(bandState, { strength: 1, duration: 0.18, ease: 'power2.out' }, 0.85)
      .to(bandState, { strength: 0, duration: 0.5, ease: 'power2.in' }, 1.05)
  }

  const clock = new THREE.Clock()
  function tick() {
    uniforms.uTime.value = prefersReducedMotion ? 0 : clock.getElapsedTime()
    uniforms.uPointer.value.set(pointer.x, pointer.y)
    uniforms.uBandPos.value = bandState.pos
    uniforms.uBandStrength.value = bandState.strength
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    tl.kill()
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
