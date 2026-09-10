<script setup lang="ts">
// 3D — Precision, perfectly flat wire grid (straight LineSegments, zero
// vertex noise — deliberately avoiding the noise-displaced "terrain" look
// shared by the other WireGrid variants). Camera stays fixed; the only
// motion is a bright scan-band whose vertical position is locked directly
// to how far the user has scrolled through the Hero section (a scrubbed
// ScrollTrigger driving a single uScan uniform read in the fragment
// shader) — not a looping timer. Scrolling down visibly sweeps the scan
// line up through the grid and sharpens/brightens the whole grid as it
// passes, so the background reads as responding to the page, not idling.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

const gridFragmentShader = `
  uniform vec3 uLine;
  uniform vec3 uAccent;
  uniform float uScan;
  varying vec2 vUv;

  void main() {
    float edgeFadeX = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float edgeFadeY = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
    float fade = edgeFadeX * edgeFadeY;

    float scanDist = abs(vUv.y - uScan);
    float band = smoothstep(0.09, 0.0, scanDist);
    float sharpen = smoothstep(0.22, 0.0, scanDist);

    vec3 color = mix(uLine, uAccent, band);
    float alpha = fade * mix(0.32, 0.85, sharpen);

    gl_FragColor = vec4(color, alpha);
  }
`

const gridVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

useGsapContext(() => {
  if (!canvasRef.value || !rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0.9, 3.4)
  camera.lookAt(0, 0.1, -4)

  const uniforms = {
    uLine: { value: new THREE.Color('#0B3954') },
    uAccent: { value: new THREE.Color('#FBBA00') },
    uScan: { value: prefersReducedMotion ? 0.5 : 0 }
  }

  // Perfectly flat grid, no displacement — high segment count so the
  // wireframe reads as a dense, precise drafting grid rather than a
  // coarse terrain mesh.
  const geometry = new THREE.PlaneGeometry(14, 18, 64, 90)
  const material = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    transparent: true,
    depthWrite: false,
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader
  })
  const grid = new THREE.Mesh(geometry, material)
  grid.rotation.x = -Math.PI / 2.1
  grid.position.set(0, -0.7, -6)
  scene.add(grid)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  }
  parent.addEventListener('pointermove', onPointerMove)

  // Scan position locked to scroll progress through the Hero section —
  // travels from the horizon (0) to the camera (1) exactly as far as the
  // user has scrolled, with no autonomous animation of its own.
  let scrollTrigger: ScrollTrigger | null = null
  if (!prefersReducedMotion) {
    scrollTrigger = ScrollTrigger.create({
      trigger: rootRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        uniforms.uScan.value = self.progress
      }
    })
  }

  function tick() {
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.04
    camera.lookAt(0, 0.1, -4)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    scrollTrigger?.kill()
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-75">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
