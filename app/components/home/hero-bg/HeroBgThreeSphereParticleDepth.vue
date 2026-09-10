<script setup lang="ts">
// 3D — Sphere → particles → depth field. Second quality pass: the sphere
// stage is now an opaque MeshPhysicalMaterial lit by a procedural
// RoomEnvironment baked via PMREMGenerator (real reflections instead of a
// translucent hand-rolled fresnel shader — transparency is the single
// biggest thing that makes WebGL objects read as cheap). Particles use a
// procedural canvas-generated soft radial-gradient sprite instead of
// default hard-edged square GL points, with per-particle varied base size
// and depth-based size/opacity falloff (farther particles shrink and dim)
// approximating fog without a real fog pass. Stage timing eases into a held
// plateau per stage and the camera does a slow dolly/reframe keyed off
// progress instead of sitting static; FOV opened up and pulled back so the
// object reads as a considered shot rather than a tight crop.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

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

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeStage(local: number): number {
  const clamped = gsap.utils.clamp(0, 1, local)
  const holdStart = 0.85
  if (clamped >= holdStart) return 1
  return easeInOutCubic(clamped / holdStart)
}

const PARTICLE_COUNT = 1000

// Procedural soft-circle sprite: radial gradient on a small canvas, used as
// PointsMaterial.map so particles read as soft dots instead of hard-edged
// default GL points.
function createParticleSprite(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const pinTarget = canvas.closest('section')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new RoomEnvironment()
  const envMap = pmrem.fromScene(envScene, 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  const cameraBasePos = new THREE.Vector3(0, 0.1, 7.4)
  camera.position.copy(cameraBasePos)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const key = new THREE.DirectionalLight('#FFF6E0', 1.05)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.65)
  rim.position.set(-3.5, -1.5, -4)
  scene.add(rim)

  // Base sphere — opaque MeshPhysicalMaterial (real environment reflections
  // via the PMREM above) instead of a translucent hand-rolled fresnel
  // shader; the noise displacement + subtle warm highlight on the noise
  // ridges is now injected via onBeforeCompile so it still gets real PBR
  // lighting underneath.
  const sphereGeometry = new THREE.IcosahedronGeometry(1.55, 32)
  const sphereUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) }
  }
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: '#123A54',
    metalness: 0.35,
    roughness: 0.26,
    clearcoat: 0.85,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.15
  })
  sphereMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = sphereUniforms.uTime
    shader.uniforms.uPointer = sphereUniforms.uPointer

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      ${noiseGLSL}
      uniform float uTime;
      uniform vec2 uPointer;
      varying float vDisp;`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `float n = snoise(position * 1.4 + uTime * 0.15);
      float pointerInfluence = 1.0 - smoothstep(0.0, 1.6, distance(position.xy, uPointer * 1.6));
      float disp = n * 0.16 + pointerInfluence * 0.1;
      vDisp = disp;
      vec3 transformed = position + normal * disp;`
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      varying float vDisp;`
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.9, 1.55, 0.55), smoothstep(-0.05, 0.2, vDisp) * 0.5);`
    )
  }
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphere)

  // Particle cloud: positions ON sphere surface (stage-1 target / stage-2
  // origin) plus a separate spread-field target (stage-2 destination), each
  // with a varied base size and a stored depth for size/opacity falloff.
  const surfacePositions = new Float32Array(PARTICLE_COUNT * 3)
  const spreadPositions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const baseSizes = new Float32Array(PARTICLE_COUNT)
  const colorA = new THREE.Color('#FBBA00')
  const colorB = new THREE.Color('#EAF1F4')

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = i * 3
    const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const jitter = 1 + (Math.random() - 0.5) * 0.06
    const r = 1.6 * jitter
    surfacePositions[ix] = Math.sin(phi) * Math.cos(theta) * r
    surfacePositions[ix + 1] = Math.sin(phi) * Math.sin(theta) * r
    surfacePositions[ix + 2] = Math.cos(phi) * r

    spreadPositions[ix] = (Math.random() - 0.5) * 12
    spreadPositions[ix + 1] = (Math.random() - 0.5) * 8
    spreadPositions[ix + 2] = (Math.random() - 0.5) * 14 - 2

    const mixT = Math.random()
    const c = colorA.clone().lerp(colorB, mixT)
    colors[ix] = c.r
    colors[ix + 1] = c.g
    colors[ix + 2] = c.b

    // Varied base size — small variance so the cloud reads as organic
    // rather than uniform dots.
    baseSizes[i] = 0.55 + Math.random() * 0.9
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(surfacePositions.slice(), 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  particleGeometry.setAttribute('aBaseSize', new THREE.BufferAttribute(baseSizes, 1))

  const sprite = createParticleSprite()
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    map: sprite,
    alphaMap: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  // Depth-based size attenuation via onBeforeCompile: scale gl_PointSize by
  // the per-particle aBaseSize attribute and fade far particles for a cheap
  // fog-like falloff, cheaper than a real THREE.Fog pass on additive points.
  particleMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      attribute float aBaseSize;
      varying float vFogFactor;`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <fog_vertex>',
      `#include <fog_vertex>
      vFogFactor = smoothstep(12.0, 2.0, -mvPosition.z);`
    )
    shader.vertexShader = shader.vertexShader.replace(
      'gl_PointSize = size;',
      'gl_PointSize = size * aBaseSize;'
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      varying float vFogFactor;`
    )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `gl_FragColor.a *= mix(0.25, 1.0, vFogFactor);
      #include <dithering_fragment>`
    )
  }
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
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

  const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute
  const stageState = { stage1: 0, stage2: 0 }
  function applyStages() {
    sphere.visible = stageState.stage1 < 0.999
    sphere.scale.setScalar(1 - stageState.stage1 * 0.25)

    particles.visible = stageState.stage1 > 0.001

    const s2 = stageState.stage2
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3
      arr[ix] = THREE.MathUtils.lerp(surfacePositions[ix]!, spreadPositions[ix]!, s2)
      arr[ix + 1] = THREE.MathUtils.lerp(surfacePositions[ix + 1]!, spreadPositions[ix + 1]!, s2)
      arr[ix + 2] = THREE.MathUtils.lerp(surfacePositions[ix + 2]!, spreadPositions[ix + 2]!, s2)
    }
    posAttr.needsUpdate = true
    particleMaterial.opacity = Math.max(0.15, stageState.stage1) * (1 - s2 * 0.1)

    camera.position.x = cameraBasePos.x + s2 * 0.3
    camera.position.y = cameraBasePos.y - stageState.stage1 * 0.1
    camera.position.z = cameraBasePos.z - stageState.stage1 * 0.3 + s2 * 0.5
    camera.lookAt(0, 0, -s2 * 0.5)
  }

  let scrollTrigger: ScrollTrigger | undefined
  if (!prefersReducedMotion && pinTarget) {
    scrollTrigger = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: `+=${window.innerHeight * 2}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        stageState.stage1 = easeStage(gsap.utils.mapRange(0, 0.5, 0, 1, Math.min(progress, 0.5)))
        stageState.stage2 = easeStage(gsap.utils.mapRange(0.5, 1, 0, 1, Math.max(progress, 0.5)))
        applyStages()
      }
    })
  } else {
    // Reduced motion: render the fully-expanded particle depth field statically.
    stageState.stage1 = 1
    stageState.stage2 = 1
    applyStages()
  }

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    sphereUniforms.uTime.value = prefersReducedMotion ? 0 : elapsed
    sphereUniforms.uPointer.value.set(pointer.x, pointer.y)
    if (!prefersReducedMotion) {
      sphere.rotation.y = elapsed * 0.06
      particles.rotation.y = elapsed * 0.015
    }
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    scrollTrigger?.kill()
    sphereGeometry.dispose()
    sphereMaterial.dispose()
    particleGeometry.dispose()
    particleMaterial.dispose()
    sprite.dispose()
    envMap.dispose()
    envScene.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    style="mask-image: radial-gradient(circle at center, black 55%, transparent 92%); -webkit-mask-image: radial-gradient(circle at center, black 55%, transparent 92%)"
  >
    <div class="h-[120%] w-[120%]">
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>
  </div>
</template>
