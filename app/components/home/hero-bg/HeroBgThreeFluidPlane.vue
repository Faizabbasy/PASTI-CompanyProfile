<script setup lang="ts">
// 3D — Fluid-like ripple plane. A high-segment plane mesh viewed near
// edge-on, displaced vertically by layered noise + a cursor-driven ripple
// (distance-based sine falloff, so moving the pointer sends a visible wave
// pulse outward). Rendered with flat shading and a rim-lit gradient for a
// "liquid metal sheet" look. Cheap: one plane, one shader, no post-processing.
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
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 2.4, 3.2)
  camera.lookAt(0, 0, 0)

  const geometry = new THREE.PlaneGeometry(8, 8, 120, 120)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(999, 999) },
    uRippleStart: { value: -10 },
    uColorA: { value: new THREE.Color('#0B3954') },
    uColorB: { value: new THREE.Color('#FBBA00') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uRippleStart;
      varying float vElevation;
      ${noiseGLSL}
      void main() {
        vec3 p = position;
        float base = noise(p.xy * 0.35 + uTime * 0.06) * 0.35;

        float d = distance(p.xy, uPointer);
        float rippleAge = uTime - uRippleStart;
        float ripple = 0.0;
        if (rippleAge > 0.0 && rippleAge < 2.2) {
          float wave = sin(d * 2.4 - rippleAge * 5.0) * exp(-rippleAge * 1.4) * exp(-d * 0.3);
          ripple = wave * 0.4;
        }

        float elevation = base + ripple;
        vElevation = elevation;
        p.z += elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vElevation;
      void main() {
        vec3 color = mix(uColorA, uColorB, smoothstep(-0.3, 0.5, vElevation));
        float alpha = smoothstep(-0.5, 0.6, vElevation) * 0.4 + 0.25;
        gl_FragColor = vec4(color, alpha);
      }
    `
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2.6
  scene.add(mesh)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let lastRippleTime = -10

  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObject(mesh)[0]
    if (hit) {
      uniforms.uPointer.value.set(hit.point.x, hit.point.y)
      const now = uniforms.uTime.value
      if (now - lastRippleTime > 0.3) {
        uniforms.uRippleStart.value = now
        lastRippleTime = now
      }
    }
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  function tick() {
    uniforms.uTime.value = prefersReducedMotion ? 0 : clock.getElapsedTime()
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
