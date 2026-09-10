<script setup lang="ts">
// 3D — "Nucleus / Origin System", the Hero's brand identity object (see
// .docs/context/LARGE_SCALE_MOTION_PLAN.md section 1). Not a re-skin of the
// old distorted sphere — a deterministic formation timeline built from
// discrete parts (nucleus point -> line skeleton -> faceted planes -> noise
// distortion -> convergence), arriving at one resolved idle state, then
// partially reversing on scroll-exit ("retracting into its origin").
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

// Reused verbatim from the old sphere shader (HeroBgThreeDistortedSphere) —
// only the amplitude changes (much smaller here: texture, not shape driver).
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

/** Deterministic (not Math.random()) spherical direction for skeleton line
 * `i` of `count` — a fixed Fibonacci-sphere distribution so the structure
 * is identical every load, per the plan's "precision, not chaos" brief. */
function fibonacciDirection(i: number, count: number): THREE.Vector3 {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (i / (count - 1)) * 2
  const radius = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = goldenAngle * i
  return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 767px)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const pinTarget = canvas.closest('section')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  const cameraRestZ = 6
  const cameraExitZ = 7.4
  camera.position.set(0, 0, cameraRestZ)

  const navyLine = new THREE.Color('#1C5E7C')
  const navyPlane = new THREE.Color('#0B3954')
  const yellow = new THREE.Color('#FBBA00')

  // Fewer parts on mobile/reduced-power — brand identity still plays, just
  // lighter (6 instead of 12), per the mobile adaptation note.
  const partCount = isMobile ? 6 : 12
  const structureRadius = 1.7

  // --- Nucleus: small yellow mesh, always at local origin. ---
  const nucleus = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.09, 1),
    new THREE.MeshBasicMaterial({ color: yellow })
  )
  scene.add(nucleus)

  // --- Line skeleton: fixed count, deterministic angles radiating out. ---
  const lineDirections = Array.from({ length: partCount }, (_, i) => fibonacciDirection(i, partCount))
  const lineGeometries: THREE.BufferGeometry[] = []
  const lineSegments: THREE.LineSegments[] = []
  for (const dir of lineDirections) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(structureRadius)])
    const mat = new THREE.LineBasicMaterial({ color: navyLine, transparent: true, opacity: 0 })
    const line = new THREE.LineSegments(geo, mat)
    lineGeometries.push(geo)
    lineSegments.push(line)
    scene.add(line)
  }

  // --- Faceted planes: individual triangles, one per skeleton direction,
  // angled to face outward from the nucleus — NOT one subdivided mesh, so
  // each can have its own entrance timing and vertex-level noise. ---
  const planeUniformsList: { uAmp: { value: number } }[] = []
  const planeMeshes: THREE.Mesh[] = []
  const planeGeometries: THREE.BufferGeometry[] = []
  for (const dir of lineDirections) {
    const tip = dir.clone().multiplyScalar(structureRadius)
    const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const side = new THREE.Vector3().crossVectors(dir, up).normalize().multiplyScalar(0.62)
    const base1 = tip.clone().multiplyScalar(0.45).add(side)
    const base2 = tip.clone().multiplyScalar(0.45).sub(side)

    const geo = new THREE.BufferGeometry().setFromPoints([base1, base2, tip])
    geo.computeVertexNormals()

    const uniforms = { uAmp: { value: 0 }, uSeed: { value: Math.random() * 10 } }
    planeUniformsList.push(uniforms)

    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: `
        uniform float uAmp;
        uniform float uSeed;
        varying float vFace;
        ${noiseGLSL}
        void main() {
          float n = snoise(position * 2.2 + uSeed);
          vec3 displaced = position + normal * n * uAmp;
          vFace = n;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vFace;
        void main() {
          gl_FragColor = vec4(uColor, 0.55 + vFace * 0.1);
        }
      `
    })
    mat.uniforms.uColor = { value: navyPlane }

    const mesh = new THREE.Mesh(geo, mat)
    mesh.scale.setScalar(0.001)
    planeMeshes.push(mesh)
    planeGeometries.push(geo)
    scene.add(mesh)
  }

  const structureGroup = new THREE.Group()
  structureGroup.add(...lineSegments, ...planeMeshes)
  scene.add(structureGroup)

  const ambient = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambient)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  let isVisible = true
  const intersectionObserver = new IntersectionObserver(
    (entries) => { isVisible = entries[0]?.isIntersecting ?? true },
    { threshold: 0 }
  )
  intersectionObserver.observe(parent)

  let isTabVisible = document.visibilityState === 'visible'
  const handleVisibilityChange = () => { isTabVisible = document.visibilityState === 'visible' }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // --- Formation timeline: one gsap.timeline(), nucleus -> lines -> planes
  // -> noise -> convergence -> resolved idle state. Runs in parallel with,
  // synced to, Hero.vue's own headline reveal (both start from
  // watch(introReady, ...) there); this component owns only its own
  // formation, not a loading gate. ---
  let formationTl: gsap.core.Timeline | null = null
  let breatheTween: gsap.core.Tween | null = null
  let breatheProxy = { amp: 0 }

  if (prefersReducedMotion) {
    // Resolved impact state immediately: no formation sequence, idle
    // breathing off.
    gsap.set(nucleus.scale, { setScalar: 1 })
    lineSegments.forEach((line) => gsap.set(line.material, { opacity: 0.55 }))
    planeMeshes.forEach((mesh) => gsap.set(mesh.scale, { setScalar: 1 }))
  } else {
    gsap.set(nucleus.scale, { setScalar: 0 })

    const speedScale = isMobile ? 0.6 : 1
    formationTl = gsap.timeline({ delay: 0.3 * speedScale })

    // (a) nucleus
    formationTl.to(nucleus.scale, { x: 1, y: 1, z: 1, duration: 0.5 * speedScale, ease: spatialEase.enter })

    // (b) lines, stagger one-by-one
    formationTl.to(
      lineSegments.map((l) => l.material),
      { opacity: 0.55, duration: 0.35 * speedScale, stagger: 0.06 * speedScale, ease: spatialEase.enter },
      '-=0.1'
    )

    // (c) planes, stagger, starting after lines mostly finish
    formationTl.to(
      planeMeshes.map((m) => m.scale),
      { x: 1, y: 1, z: 1, duration: 0.45 * speedScale, stagger: 0.05 * speedScale, ease: spatialEase.enter },
      '-=0.25'
    )

    // (d) noise amplitude 0 -> small
    formationTl.to(
      planeUniformsList.map((u) => u.uAmp),
      { value: 0.045, duration: 0.5 * speedScale, ease: spatialEase.settle },
      '-=0.2'
    )

    // (e) convergence: group scales in slightly, binding structure to origin
    formationTl.fromTo(
      structureGroup.scale,
      { x: 1.12, y: 1.12, z: 1.12 },
      { x: 1, y: 1, z: 1, duration: 0.5 * speedScale, ease: spatialEase.settle },
      '-=0.35'
    )

    // (f) resolved idle state: very subtle continuous noise breathing.
    formationTl.call(() => {
      breatheTween = gsap.to(breatheProxy, {
        amp: 1,
        duration: 3.2,
        ease: spatialEase.drift,
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          for (const u of planeUniformsList) u.uAmp.value = 0.045 + breatheProxy.amp * 0.015
        }
      })
    })
  }

  // --- Scroll exit pin: structure partially retracts toward the nucleus
  // (stops at convergence, not a bare point) while the camera dollies out —
  // "retracting into its origin", not exploding/vanishing. Disabled on
  // mobile per the global pin scope rule. ---
  let scrollTrigger: ScrollTrigger | null = null
  if (!prefersReducedMotion && !isMobile && pinTarget) {
    scrollTrigger = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: `+=${window.innerHeight * 0.9}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress
        const retract = 1 - p * 0.55
        structureGroup.scale.setScalar(retract)
        camera.position.z = THREE.MathUtils.lerp(cameraRestZ, cameraExitZ, p)
        for (const line of lineSegments) (line.material as THREE.LineBasicMaterial).opacity = 0.55 * (1 - p * 0.4)
      }
    })
  }

  const clock = new THREE.Clock()
  function tick() {
    raf = requestAnimationFrame(tick)
    if (!isVisible || !isTabVisible) return

    const elapsed = clock.getElapsedTime()
    structureGroup.rotation.y = elapsed * 0.05
    nucleus.rotation.y = elapsed * 0.3
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    formationTl?.kill()
    breatheTween?.kill()
    scrollTrigger?.kill()
    nucleus.geometry.dispose()
    ;(nucleus.material as THREE.Material).dispose()
    lineGeometries.forEach((g) => g.dispose())
    lineSegments.forEach((l) => (l.material as THREE.Material).dispose())
    planeGeometries.forEach((g) => g.dispose())
    planeMeshes.forEach((m) => (m.material as THREE.Material).dispose())
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-90">
    <div class="h-[120%] w-[120%]">
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>
  </div>
</template>
