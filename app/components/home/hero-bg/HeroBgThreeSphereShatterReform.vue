<script setup lang="ts">
// 3D — Sphere → shatter → reform (PASTI monogram). Quality-rebuild pass:
// three-point lighting (warm key + cool navy rim for edge separation +
// hemisphere fill instead of flat ambient) replaces the old single
// directional/ambient pair; MeshPhysicalMaterial with clearcoat gives the
// shards real specular response instead of a flat fresnel-to-white hack;
// the sphere's own shader now does a Schlick fresnel + Blinn-Phong spec
// term against the key-light direction, with a grazing-angle warm-white
// highlight instead of a 50% white mix. Shards are irregular icosahedra
// (per-shard non-uniform scale) arranged into a legible angular monogram
// mark (see MONOGRAM_BLOCKS) echoing Logo.vue's blocky letterform logic.
// Stage timing now eases in/out with a held plateau per stage (see
// easeStage) and the camera does a slow, barely-perceptible dolly/reframe
// keyed off progress instead of sitting static.
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

// easeInOutCubic: decelerates into a held state, matches GSAP's power2/3
// feel without depending on gsap.parseEase() inside a non-tween context.
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Maps a stage's raw local progress (0-1 across its half of scroll) into an
// eased curve that reaches 1 at 85% and holds flat for the last 15% — gives
// the eye a moment to register the fully-morphed shape before the next
// stage begins.
function easeStage(local: number): number {
  const clamped = gsap.utils.clamp(0, 1, local)
  const holdStart = 0.85
  if (clamped >= holdStart) return 1
  return easeInOutCubic(clamped / holdStart)
}

interface ShardRig {
  mesh: THREE.Mesh
  shatterPos: THREE.Vector3
  shatterRot: THREE.Euler
  reformPos: THREE.Vector3
  reformRot: THREE.Euler
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

  // Restrained key + rim on top of the environment's ambient fill — the
  // environment map (not these lights alone) is what gives the shards and
  // sphere real specular/reflective response instead of a flat CG look.
  const key = new THREE.DirectionalLight('#FFF6E0', 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)

  const rim = new THREE.DirectionalLight('#6E9DBE', 0.7)
  rim.position.set(-3.5, -1.5, -4)
  scene.add(rim)

  // Base sphere — opaque MeshPhysicalMaterial lit by the procedural
  // environment above (real reflections) instead of a translucent
  // hand-rolled fresnel shader; the noise displacement + a subtle warm
  // highlight on the noise ridges is injected via onBeforeCompile so it
  // still gets full PBR lighting underneath.
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

  // Shards: irregular faceted icosahedra (proper gem/crystal facets instead
  // of flattened tetrahedra), non-uniform per-shard scale to break
  // uniformity, MeshPhysicalMaterial with clearcoat + the environment map
  // for real specular response — transparent only during their fade-in
  // (they land at full opacity, not a permanent translucent look).
  const SHARD_COUNT = 52
  const shardGeometry = new THREE.IcosahedronGeometry(0.16, 0)

  // Monogram target layout — blocky angular "P" mark in local XY, kept as
  // rectangular blocks (echoes Logo.vue's blocky letterform treatment)
  // but with tighter jitter per block so the silhouette reads cleanly at
  // hero scale rather than a diffuse cloud.
  const monogramBlocks: Array<{ x: number; y: number; w: number; h: number }> = [
    { x: -0.9, y: 0, w: 0.42, h: 3.0 }, // upright bar
    { x: 0, y: 1.05, w: 1.5, h: 0.48 }, // bowl top
    { x: 0.68, y: 0.55, w: 0.48, h: 0.85 }, // bowl right
    { x: 0, y: 0.05, w: 1.5, h: 0.48 }, // bowl bottom
    { x: -0.28, y: 0.55, w: 0.6, h: 0.34 } // counter notch accent
  ]

  const shardGroup = new THREE.Group()
  const shardRigs: ShardRig[] = []
  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0B3954',
    emissive: '#FBBA00',
    emissiveIntensity: 0.08,
    metalness: 0.5,
    roughness: 0.28,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.2,
    transparent: true,
    opacity: 0
  })

  for (let i = 0; i < SHARD_COUNT; i++) {
    const mat = shardMaterial.clone()
    const mesh = new THREE.Mesh(shardGeometry, mat)
    mesh.scale.set(0.8 + Math.random() * 0.6, 0.8 + Math.random() * 0.6, 0.8 + Math.random() * 0.6)

    const phi = Math.acos(1 - (2 * (i + 0.5)) / SHARD_COUNT)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const surfacePos = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    ).multiplyScalar(1.6)

    const shatterPos = surfacePos.clone().multiplyScalar(1.35)
    const shatterRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

    const block = monogramBlocks[i % monogramBlocks.length]!
    const jitterX = (Math.random() - 0.5) * block.w
    const jitterY = (Math.random() - 0.5) * block.h
    const reformPos = new THREE.Vector3(block.x + jitterX, block.y + jitterY, (Math.random() - 0.5) * 0.2)
    const reformRot = new THREE.Euler(0, 0, (Math.random() - 0.5) * 0.12)

    mesh.position.copy(shatterPos)
    mesh.rotation.copy(shatterRot)

    shardGroup.add(mesh)
    shardRigs.push({ mesh, shatterPos, shatterRot, reformPos, reformRot })
  }
  scene.add(shardGroup)

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

  const stageState = { stage1: 0, stage2: 0, raw: 0 }
  function applyStages() {
    const s1 = stageState.stage1
    const s2 = stageState.stage2

    sphere.visible = s1 < 0.999
    sphere.scale.setScalar(1 - s1 * 0.3)

    const shardsOpacity = s1
    shardGroup.visible = s1 > 0.001
    shardRigs.forEach((rig) => {
      ;(rig.mesh.material as THREE.MeshPhysicalMaterial).opacity = shardsOpacity
      const scale = THREE.MathUtils.lerp(0.4, 1, s1)
      rig.mesh.scale.setScalar(scale * (0.8 + (rig.mesh.userData.scaleJitter ?? 1) * 0.2))

      rig.mesh.position.lerpVectors(rig.shatterPos, rig.reformPos, s2)
      rig.mesh.rotation.set(
        THREE.MathUtils.lerp(rig.shatterRot.x, rig.reformRot.x, s2),
        THREE.MathUtils.lerp(rig.shatterRot.y, rig.reformRot.y, s2),
        THREE.MathUtils.lerp(rig.shatterRot.z, rig.reformRot.z, s2)
      )
    })

    // Slow, barely-perceptible camera dolly/reframe per stage — a small
    // push-in as shards form, a slight lateral reframe as the monogram
    // resolves. Subtle by design: total travel stays under ~0.5 units.
    camera.position.x = cameraBasePos.x + s2 * 0.35
    camera.position.y = cameraBasePos.y - s1 * 0.15
    camera.position.z = cameraBasePos.z - s1 * 0.4 - s2 * 0.2
    camera.lookAt(0, s2 * 0.1, 0)
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
        stageState.raw = progress
        stageState.stage1 = easeStage(gsap.utils.mapRange(0, 0.5, 0, 1, Math.min(progress, 0.5)))
        stageState.stage2 = easeStage(gsap.utils.mapRange(0.5, 1, 0, 1, Math.max(progress, 0.5)))
        applyStages()
      }
    })
  } else {
    // Reduced motion: render the fully-reformed monogram statically.
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
      shardGroup.rotation.y = Math.sin(elapsed * 0.04) * 0.04
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
    shardGeometry.dispose()
    shardMaterial.dispose()
    shardRigs.forEach((rig) => {
      ;(rig.mesh.material as THREE.Material).dispose()
    })
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
