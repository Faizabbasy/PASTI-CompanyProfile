<script setup lang="ts">
// 3D — Enhanced wireframe terrain grid (same noise-displaced plane, horizon
// glow, and cursor-driven camera drift as HeroBgThreeWireGrid) with three
// polish passes: a 3-stop navy->navy->yellow gradient for more depth, a
// second additive-blended "halo" copy of the grid sitting just behind the
// main mesh to fake a cheap bloom without a post-process pass, and softer
// smoothstep falloff at both the horizon and screen edges. On top of that
// base, an irregular-timed uGlitch uniform (0 normally) drives a brief
// 150-250ms "digital hiccup": UV jitter plus a quick yellow channel-split
// flash, snapping straight back to clean. Timed with randomized GSAP
// repeatDelay so it reads as a deliberate tech signature, not a bug.
import * as THREE from 'three'
import gsap from 'gsap'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

const noiseGLSL = `
vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.0+2.0*fract(sin(p)*43758.5453123);}
float noise(vec2 p){
  const float K1=0.366025404;
  const float K2=0.211324865;
  vec2 i=floor(p+(p.x+p.y)*K1);
  vec2 a=p-i+(i.x+i.y)*K2;
  vec2 o=(a.x>a.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec2 b=a-o+K2;
  vec2 c=a-1.0+2.0*K2;
  vec3 h=max(0.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.0);
  vec3 n=h*h*h*h*vec3(dot(a,hash(i+0.0)),dot(b,hash(i+o)),dot(c,hash(i+1.0)));
  return dot(n,vec3(70.0));
}
`

const gridVertexShader = `
  uniform float uTime;
  uniform float uGlitch;
  varying float vDist;
  varying vec2 vUv;
  ${noiseGLSL}
  void main() {
    vec2 jitterUv = uv;
    if (uGlitch > 0.001) {
      float band = step(0.5, fract(uv.y * 40.0 + uTime * 30.0));
      jitterUv.x += (band - 0.5) * uGlitch * 0.06;
    }
    vUv = jitterUv;
    vec3 p = position;
    float scroll = uTime * 0.5;
    float elevation = noise(vec2(p.x * 0.25, p.y * 0.2 + scroll)) * 0.9;
    p.z += elevation;
    p.x += uGlitch * (noise(vec2(p.y * 1.3, uTime * 10.0)) * 0.25);
    vDist = 1.0 - clamp((p.y + 10.0) / 20.0, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

// Three-stop gradient, softer edge fade, plus a channel-split flash: when
// uGlitch is active the accent color is pushed toward pure yellow and
// alpha briefly spikes for a sharp digital flash read.
const gridFragmentShader = `
  uniform vec3 uFar;
  uniform vec3 uMid;
  uniform vec3 uNear;
  uniform float uGlitch;
  varying float vDist;
  varying vec2 vUv;

  void main() {
    vec3 color = vDist > 0.5
      ? mix(uMid, uFar, (vDist - 0.5) * 2.0)
      : mix(uNear, uMid, vDist * 2.0);

    float edgeFadeX = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x);
    float horizonFade = smoothstep(0.0, 0.35, 1.0 - vDist);
    float baseAlpha = 0.5 * edgeFadeX * mix(0.55, 1.0, horizonFade);

    color = mix(color, uNear, uGlitch * 0.7);
    float alpha = baseAlpha + uGlitch * edgeFadeX * 0.5;

    gl_FragColor = vec4(color, alpha);
  }
`

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.set(0, 1.6, 2.6)
  camera.lookAt(0, 0.2, -4)

  const geometry = new THREE.PlaneGeometry(14, 20, 72, 100)
  const uniforms = {
    uTime: { value: 0 },
    uFar: { value: new THREE.Color('#0B2A3D') },
    uMid: { value: new THREE.Color('#0B3954') },
    uNear: { value: new THREE.Color('#FBBA00') },
    uGlitch: { value: 0 }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    transparent: true,
    depthWrite: false,
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader
  })

  const grid = new THREE.Mesh(geometry, material)
  grid.rotation.x = -Math.PI / 2.15
  grid.position.set(0, -0.6, -6)
  scene.add(grid)

  // Halo pass: a slightly scaled-up, more transparent duplicate rendered
  // additively just behind the main grid so lines read as gently glowing
  // rather than flat and thin — a cheap fake-bloom trick, no post-process.
  const haloMaterial = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: gridVertexShader,
    fragmentShader: `
      uniform vec3 uFar;
      uniform vec3 uMid;
      uniform vec3 uNear;
      uniform float uGlitch;
      varying float vDist;
      varying vec2 vUv;
      void main() {
        vec3 color = vDist > 0.5
          ? mix(uMid, uFar, (vDist - 0.5) * 2.0)
          : mix(uNear, uMid, vDist * 2.0);
        float edgeFadeX = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        color = mix(color, uNear, uGlitch * 0.6);
        gl_FragColor = vec4(color, 0.14 * edgeFadeX + uGlitch * 0.25);
      }
    `
  })
  const halo = new THREE.Mesh(geometry, haloMaterial)
  halo.rotation.x = grid.rotation.x
  halo.position.copy(grid.position)
  halo.scale.set(1.035, 1.035, 1.035)
  scene.add(halo)

  const glowGeo = new THREE.PlaneGeometry(14, 4)
  const glowMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color('#FBBA00') } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float fade = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.4, vUv.y);
        float sideFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        gl_FragColor = vec4(uColor, 0.07 * fade * sideFade);
      }
    `
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.set(0, 0.4, -12)
  scene.add(glow)

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

  // Glitch burst: a short flicker timeline (150-250ms) toggles uGlitch a
  // few times then snaps to 0, gated behind a randomized repeatDelay
  // (6-9s) via onRepeat so bursts land on an irregular-but-deliberate
  // rhythm instead of a fixed metronome.
  let glitchTimeline: gsap.core.Timeline | null = null
  if (!prefersReducedMotion) {
    glitchTimeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 6,
      onRepeat: () => {
        if (glitchTimeline) glitchTimeline.repeatDelay(6 + Math.random() * 3)
      }
    })
    glitchTimeline
      .to(uniforms.uGlitch, { value: 1, duration: 0.04, ease: 'none' })
      .to(uniforms.uGlitch, { value: 0.2, duration: 0.05, ease: 'none' })
      .to(uniforms.uGlitch, { value: 0.9, duration: 0.04, ease: 'none' })
      .to(uniforms.uGlitch, { value: 0, duration: 0.09, ease: 'none' })
  }

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03
    camera.lookAt(0, 0.2, -4)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    glitchTimeline?.kill()
    geometry.dispose()
    material.dispose()
    haloMaterial.dispose()
    glowGeo.dispose()
    glowMat.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
