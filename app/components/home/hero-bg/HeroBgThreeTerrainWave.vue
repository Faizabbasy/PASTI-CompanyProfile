<script setup lang="ts">
// 3D — Procedural terrain/dune field. A large, high-segment plane displaced
// in the vertex shader by three octaves of value noise at different
// frequencies/amplitudes (not a flat ripple — the layering reads as an
// abstract dune-field / landscape). Viewed from a low, near-horizon camera
// for the "landscape hero" framing, with gradient-lit shading faked from
// the displaced normal (finite-difference, no real lights needed) plus a
// thin wireframe overlay pass for definition. One plane, one draw call.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

const noiseGLSL = `
vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.0+2.0*fract(sin(p)*43758.5453123);}
float vnoise(vec2 p){
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
float terrain(vec2 p){
  float h = 0.0;
  h += vnoise(p*0.5)*0.6;
  h += vnoise(p*1.1+17.0)*0.3;
  h += vnoise(p*2.4+41.0)*0.12;
  return h;
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
  camera.position.set(0, 0.9, 3.4)
  camera.lookAt(0, 0.1, -4)

  const geometry = new THREE.PlaneGeometry(14, 14, 160, 160)
  const uniforms = {
    uTime: { value: 0 },
    uColorLow: { value: new THREE.Color('#0B2A3D') },
    uColorMid: { value: new THREE.Color('#0B3954') },
    uColorHigh: { value: new THREE.Color('#FBBA00') },
    uColorRim: { value: new THREE.Color('#EAF1F4') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: `
      uniform float uTime;
      varying float vHeight;
      varying vec3 vNormalW;
      ${noiseGLSL}
      void main() {
        vec2 p = position.xy * 0.5 + vec2(0.0, uTime * 0.03);
        float h = terrain(p);

        // Finite-difference normal so the surface shades like real terrain
        // without needing a lit material or extra lights.
        float eps = 0.06;
        float hx = terrain(p + vec2(eps, 0.0));
        float hy = terrain(p + vec2(0.0, eps));
        vec3 tangentX = vec3(eps, 0.0, (hx - h) * 1.4);
        vec3 tangentY = vec3(0.0, eps, (hy - h) * 1.4);
        vNormalW = normalize(cross(tangentX, tangentY));

        vHeight = h;
        vec3 newPosition = position + vec3(0.0, 0.0, h * 0.9);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorLow;
      uniform vec3 uColorMid;
      uniform vec3 uColorHigh;
      uniform vec3 uColorRim;
      varying float vHeight;
      varying vec3 vNormalW;
      void main() {
        vec3 lightDir = normalize(vec3(0.4, 0.5, 0.8));
        float diff = clamp(dot(vNormalW, lightDir), 0.0, 1.0);

        vec3 base = mix(uColorLow, uColorMid, smoothstep(-0.3, 0.2, vHeight));
        base = mix(base, uColorHigh, smoothstep(0.25, 0.55, vHeight) * 0.5);
        vec3 color = mix(base * 0.6, base, diff);
        color = mix(color, uColorRim, pow(diff, 8.0) * 0.3);

        float alpha = 0.6 + diff * 0.25;
        gl_FragColor = vec4(color, alpha);
      }
    `
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2.15
  mesh.position.y = -0.6
  mesh.position.z = -3
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
