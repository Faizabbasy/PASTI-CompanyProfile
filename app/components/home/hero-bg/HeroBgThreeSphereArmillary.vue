<script setup lang="ts">
// 3D — Sphere → ring cluster → armillary. Same scroll-lock skeleton and
// quality bar as the other Sphere-morph variants (opaque MeshPhysicalMaterial,
// procedural RoomEnvironment via PMREMGenerator for real reflections, eased
// plateau stage timing, subtle camera dolly) — new shapes only. Stage 1
// (crossfade): the sphere shrinks/fades while 3 independent torus rings
// (built once, each on a different rotation axis) fade/scale in around the
// same center, spinning slowly on their own axes like a gyroscope spinning
// up. Stage 2 (same ring objects, no crossfade — just settle their spin):
// the rings decelerate from their independent chaotic spin into a locked,
// precise armillary-sphere arrangement (fixed relative angles, like a
// classical astronomical instrument), with a small glowing core sphere
// appearing at the shared center once they've locked.
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
  vec4 norm=1.79284291400159-0.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
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

interface RingRig {
  mesh: THREE.Mesh
  lockedRotation: THREE.Euler
  spinAxis: THREE.Vector3
  spinSpeed: number
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const pinTarget = canvas.closest('section')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const scene = new THREE.Scene()

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new RoomEnvironment()
  const envMap = pmrem.fromScene(envScene, 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  const cameraBasePos = new THREE.Vector3(0, 0.15, 7.4)
  camera.position.copy(cameraBasePos)

  const key = new THREE.DirectionalLight('#FFF6E0', 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.7)
  rim.position.set(-3.5, -1.2, -4)
  scene.add(rim)

  // Base sphere — same displacement technique as the other variants.
  const sphereGeometry = new THREE.IcosahedronGeometry(1.55, 32)
  const sphereUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) }
  }
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: '#123A54',
    metalness: 0.35,
    roughness: 0.28,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
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

  // Three armillary rings, each a thin torus on a distinct axis. Locked
  // target rotations echo a classical armillary sphere's equatorial,
  // meridian, and ecliptic bands.
  const ringGeometry = new THREE.TorusGeometry(1.7, 0.045, 24, 96)
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0B2A3D',
    metalness: 0.65,
    roughness: 0.2,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.3,
    transparent: true,
    opacity: 0
  })

  const ringConfigs: Array<{ locked: THREE.Euler; axis: THREE.Vector3; speed: number }> = [
    { locked: new THREE.Euler(0, 0, 0), axis: new THREE.Vector3(1, 0.3, 0).normalize(), speed: 1.4 },
    { locked: new THREE.Euler(Math.PI / 2, 0, 0), axis: new THREE.Vector3(0.2, 1, 0.4).normalize(), speed: -1.1 },
    { locked: new THREE.Euler(Math.PI / 3.2, Math.PI / 2.4, 0), axis: new THREE.Vector3(0.5, 0.2, 1).normalize(), speed: 0.9 }
  ]

  const ringRigs: RingRig[] = ringConfigs.map((cfg, i) => {
    const mat = ringMaterial.clone()
    const mesh = new THREE.Mesh(ringGeometry, mat)
    mesh.scale.setScalar(0.6 - i * 0.08)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    scene.add(mesh)
    return { mesh, lockedRotation: cfg.locked, spinAxis: cfg.axis, spinSpeed: cfg.speed }
  })

  // Small glowing core, revealed once the rings lock into formation.
  const coreGeometry = new THREE.SphereGeometry(0.22, 32, 32)
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0B2A3D',
    emissive: '#FBBA00',
    emissiveIntensity: 0,
    metalness: 0.3,
    roughness: 0.15,
    clearcoat: 0.9,
    envMapIntensity: 1.2,
    transparent: true,
    opacity: 0
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  scene.add(core)

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

  const stageState = { stage1: 0, stage2: 0 }
  function applyStages() {
    const s1 = stageState.stage1
    const s2 = stageState.stage2

    sphere.visible = s1 < 0.999
    sphere.scale.setScalar(1 - s1 * 0.4)

    ringRigs.forEach((rig, i) => {
      const mat = rig.mesh.material as THREE.MeshPhysicalMaterial
      mat.opacity = s1
      rig.mesh.visible = s1 > 0.001
      const targetScale = 0.85 - i * 0.16
      rig.mesh.scale.setScalar(THREE.MathUtils.lerp(0.6 - i * 0.08, targetScale, s1))
    })

    coreMaterial.opacity = s2
    coreMaterial.emissiveIntensity = s2 * 0.6
    core.visible = s2 > 0.001
    core.scale.setScalar(Math.max(0.001, s2))

    camera.position.x = cameraBasePos.x + s2 * 0.3
    camera.position.y = cameraBasePos.y - s1 * 0.1
    camera.position.z = cameraBasePos.z - s1 * 0.6 + s2 * 0.3
    camera.lookAt(0, 0, 0)
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
      const s2 = stageState.stage2
      ringRigs.forEach((rig) => {
        if (s2 < 0.999) {
          // Free spin on the ring's own axis, decelerating as stage 2
          // approaches completion.
          const spinAmount = rig.spinSpeed * (1 - s2) * 0.35
          rig.mesh.rotateOnAxis(rig.spinAxis, spinAmount * 0.016)
        } else {
          // Locked: settle exactly onto the target armillary rotation.
          rig.mesh.rotation.set(rig.lockedRotation.x, rig.lockedRotation.y, rig.lockedRotation.z)
        }
      })
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
    ringGeometry.dispose()
    ringMaterial.dispose()
    ringRigs.forEach((rig) => (rig.mesh.material as THREE.Material).dispose())
    coreGeometry.dispose()
    coreMaterial.dispose()
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
