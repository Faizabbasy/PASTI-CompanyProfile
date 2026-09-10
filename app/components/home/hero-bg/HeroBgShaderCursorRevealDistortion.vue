<script setup lang="ts">
// Shader — Cursor-reveal distortion. Inspired by Active Theory's "engine,
// not a website" GLSL work: a hidden/near-invisible base pattern (thin fbm-
// noise contour lines at very low contrast) that only becomes visibly
// distorted within a radius around the cursor — a chromatic-aberration-style
// per-channel UV offset plus a ripple, both keyed off the same radius. The
// radius and distortion intensity are driven by cursor VELOCITY, computed
// in JS from pointer deltas each frame and smoothed into a uVelocity
// uniform — a fast flick tears the pattern open wide, idling lets it settle
// back to almost nothing. Cost: three noise samples (one per RGB channel
// offset) plus one radial falloff, per pixel.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

const noiseGLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
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
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const geometry = new THREE.PlaneGeometry(2, 2)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uVelocity: { value: 0 },
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
      uniform float uVelocity;
      uniform vec2 uResolution;
      uniform vec3 uColorNavy;
      uniform vec3 uColorNavy2;
      uniform vec3 uColorPaper;
      uniform vec3 uColorYellow;
      varying vec2 vUv;
      ${noiseGLSL}

      float contourLines(vec2 p, float t) {
        float n = snoise(vec3(p * 2.0, t));
        float lines = fract(n * 6.0);
        return smoothstep(0.0, 0.05, lines) * smoothstep(1.0, 0.95, lines);
      }

      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (vUv - 0.5) * aspect;

        float t = uTime * 0.05;

        vec2 toCursor = uv - uPointer * 0.5 * aspect;
        float dist = length(toCursor);

        // Velocity drives both reach and strength of the distortion field —
        // idling collapses it to almost nothing, a fast flick tears it open.
        float reach = 0.25 + uVelocity * 0.9;
        float reveal = exp(-dist * dist / (reach * reach + 0.001)) * clamp(uVelocity * 1.8, 0.0, 1.0);

        vec2 dir = normalize(toCursor + 0.0001);
        float ripple = sin(dist * 18.0 - t * 40.0) * reveal * 0.03;
        vec2 rippleOffset = dir * ripple;

        // Chromatic-aberration-style per-channel offset, scaled by reveal.
        float aberration = reveal * 0.02 * (0.4 + uVelocity);
        vec2 offR = vec2(aberration, 0.0);
        vec2 offB = vec2(-aberration, 0.0);

        float baseR = contourLines(uv + rippleOffset + offR, t);
        float baseG = contourLines(uv + rippleOffset, t);
        float baseB = contourLines(uv + rippleOffset + offB, t);

        // Base pattern is nearly invisible until reveal lifts its contrast.
        float baseAlpha = 0.03 + reveal * 0.6;
        vec3 lineTint = vec3(baseR, baseG, baseB);

        vec3 backdrop = mix(uColorNavy, uColorNavy2, 0.5 + 0.5 * uv.y);
        vec3 revealColor = mix(uColorPaper, uColorYellow, baseB * 0.5 + reveal * 0.3);

        vec3 color = mix(backdrop, backdrop + lineTint * 0.25, baseAlpha);
        color = mix(color, revealColor, reveal * (baseG * 0.6 + 0.15));

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
  let lastPointer = { x: 0, y: 0 }
  let lastMoveTime = performance.now()
  let rawVelocity = 0

  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

    const now = performance.now()
    const dt = Math.max(now - lastMoveTime, 1)
    const dx = pointer.x - lastPointer.x
    const dy = pointer.y - lastPointer.y
    const dist = Math.hypot(dx, dy)
    rawVelocity = (dist / dt) * 60
    lastPointer = { x: pointer.x, y: pointer.y }
    lastMoveTime = now
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  let smoothedVelocity = 0
  function tick() {
    uniforms.uTime.value = prefersReducedMotion ? 0 : clock.getElapsedTime()
    uniforms.uPointer.value.set(pointer.x, pointer.y)

    if (!prefersReducedMotion) {
      // Decay velocity toward zero between move events, smooth the spikes.
      rawVelocity *= 0.9
      smoothedVelocity += (Math.min(rawVelocity, 2.5) - smoothedVelocity) * 0.25
      uniforms.uVelocity.value = smoothedVelocity
    } else {
      uniforms.uVelocity.value = 0
    }

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
