<script setup lang="ts">
// 3D — Wireframe terrain grid, synthwave/HUD-inspired but restrained in
// color (brand navy/yellow, not neon). A wireframe plane recedes into the
// distance with perspective, vertices displaced by scrolling noise for a
// "terrain flying past" feel, plus a horizon glow plane behind it. Camera
// is static; only the shader's noise offset and a slow horizontal drift
// move, which is far cheaper than moving actual geometry per frame.
import * as THREE from 'three'

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

  const geometry = new THREE.PlaneGeometry(14, 20, 56, 80)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: 0 },
    uColor: { value: new THREE.Color('#0B3954') },
    uAccent: { value: new THREE.Color('#FBBA00') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    transparent: true,
    vertexShader: `
      uniform float uTime;
      varying float vDist;
      varying vec2 vUv;
      ${noiseGLSL}
      void main() {
        vUv = uv;
        vec3 p = position;
        float scroll = uTime * 0.5;
        float elevation = noise(vec2(p.x * 0.25, p.y * 0.2 + scroll)) * 0.9;
        p.z += elevation;
        vDist = 1.0 - clamp((p.y + 10.0) / 20.0, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      varying float vDist;
      varying vec2 vUv;
      void main() {
        vec3 color = mix(uAccent, uColor, vDist);
        float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        gl_FragColor = vec4(color, 0.5 * edgeFade * (1.0 - vDist * 0.6));
      }
    `
  })

  const grid = new THREE.Mesh(geometry, material)
  grid.rotation.x = -Math.PI / 2.15
  grid.position.set(0, -0.6, -6)
  scene.add(grid)

  const glowGeo = new THREE.PlaneGeometry(14, 4)
  const glowMat = new THREE.MeshBasicMaterial({
    color: '#FBBA00',
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide
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
    geometry.dispose()
    material.dispose()
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
