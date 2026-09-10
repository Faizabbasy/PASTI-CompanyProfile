<script setup lang="ts">
// Shader — Inertial field warp. Inspired by Lusion's signature sense of
// "real weight": rather than the shader reading the raw pointer position
// (which would feel weightless/instant), JS integrates a damped spring each
// frame — pointer moves set a target, and velocity/damping physics chase it,
// overshooting and settling like a mass on a spring. Only the settled
// impulse position + its current "energy" (speed) are passed to the shader
// as uniforms, which use them to bend a domain-warped fbm noise field
// locally. Cheap: same handful of noise taps as the other shaders, all the
// "physics" cost is a few scalar ops per frame in JS, not per pixel.
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
float fbm(vec3 p){
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
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
    uImpulse: { value: new THREE.Vector2(0, 0) },
    uEnergy: { value: 0 },
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
      uniform vec2 uImpulse;
      uniform float uEnergy;
      uniform vec2 uResolution;
      uniform vec3 uColorNavy;
      uniform vec3 uColorNavy2;
      uniform vec3 uColorPaper;
      uniform vec3 uColorYellow;
      varying vec2 vUv;
      ${noiseGLSL}
      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (vUv - 0.5) * aspect;

        float t = uTime * 0.05;

        // Localized warp centered on the spring-settled impulse position,
        // strength driven by its current "energy" (speed), not raw distance
        // to the cursor — this is what makes it feel weighted, not magnetic.
        vec2 toImpulse = uv - uImpulse * 0.5 * aspect;
        float impulseDist = length(toImpulse);
        float falloff = exp(-impulseDist * impulseDist * 2.4);
        vec2 push = normalize(toImpulse + 0.0001) * falloff * uEnergy * 0.35;

        vec2 warpUv = uv * 1.6 + push;
        vec2 warp = vec2(
          fbm(vec3(warpUv, t)),
          fbm(vec3(warpUv + 4.2, t))
        ) * 0.55;

        float n = fbm(vec3(warpUv + warp, t * 1.2));
        n = n * 0.5 + 0.5;

        vec3 color = mix(uColorNavy, uColorNavy2, smoothstep(0.0, 0.5, n));
        color = mix(color, uColorPaper, smoothstep(0.45, 0.75, n));
        color = mix(color, uColorYellow, smoothstep(0.78, 1.0, n) * 0.7);
        color = mix(color, uColorYellow, falloff * clamp(uEnergy, 0.0, 1.0) * 0.35);

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

  // Damped spring: impulse chases pointer with stiffness/damping, so a
  // quick flick overshoots and settles rather than tracking instantly.
  const impulse = { x: 0, y: 0 }
  const velocity = { x: 0, y: 0 }
  const stiffness = 6.0
  const damping = 3.2

  const clock = new THREE.Clock()
  let lastTime = 0
  function tick() {
    const elapsed = clock.getElapsedTime()
    const dt = Math.min(elapsed - lastTime, 1 / 30)
    lastTime = elapsed
    uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed

    if (!prefersReducedMotion) {
      const accelX = (pointer.x - impulse.x) * stiffness - velocity.x * damping
      const accelY = (pointer.y - impulse.y) * stiffness - velocity.y * damping
      velocity.x += accelX * dt
      velocity.y += accelY * dt
      impulse.x += velocity.x * dt
      impulse.y += velocity.y * dt
      const speed = Math.hypot(velocity.x, velocity.y)
      uniforms.uEnergy.value += (Math.min(speed, 1.4) - uniforms.uEnergy.value) * 0.15
    } else {
      impulse.x = pointer.x
      impulse.y = pointer.y
      uniforms.uEnergy.value = 0
    }

    uniforms.uPointer.value.set(pointer.x, pointer.y)
    uniforms.uImpulse.value.set(impulse.x, impulse.y)
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
