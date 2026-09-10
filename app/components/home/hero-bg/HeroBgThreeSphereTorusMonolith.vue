<script setup lang="ts">
// 3D — Sphere → torus-knot → blade bloom. Third pass: stage 1 (sphere to
// torus-knot) keeps the quality-rebuild fixes — opaque MeshPhysicalMaterial,
// a procedural RoomEnvironment baked via PMREMGenerator for real reflections,
// ACES tone mapping, eased plateau stage timing, subtle camera dolly. Stage
// 2's target is no longer a static monolith: a cluster of 9 thin crystalline
// blades, each spinning freely and independently around the shared knot
// center (chaotic tumbling, distinct axes/speeds — the same "unsettled
// motion resolving into precision" quality as the Armillary variant's rings,
// but blades converging into a radial bloom instead of rings locking into
// fixed orbital planes) that decelerate and lock into a precise symmetric
// starburst arrangement, faceted tips catching the environment light.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

interface BladeRig {
  mesh: THREE.Mesh
  spinAxis: THREE.Vector3
  spinSpeed: number
  lockedRotation: THREE.Euler
  lockedPosition: THREE.Vector3
}

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

// Parametric torus-knot curve (p=2, q=3), sampled for target vertex positions.
function torusKnotPoint(t: number): THREE.Vector3 {
  const p = 2
  const q = 3
  const radius = 0.9
  const tubeRadius = 0.35
  const angle = t * Math.PI * 2
  const r = radius * (2 + Math.cos(q * angle))
  const x = r * Math.cos(p * angle)
  const y = r * Math.sin(p * angle)
  const z = radius * Math.sin(q * angle) * tubeRadius * 2
  return new THREE.Vector3(x, y, z).multiplyScalar(0.55)
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

  // Procedural studio environment baked once via PMREMGenerator — gives both
  // meshes real reflections/specular response for free, the single biggest
  // lever for "expensive vs. cheap" WebGL. No image asset needed.
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new RoomEnvironment()
  const envMap = pmrem.fromScene(envScene, 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  const cameraBasePos = new THREE.Vector3(0, 0.15, 7.2)
  camera.position.copy(cameraBasePos)

  // Restrained key + rim for directional shape definition on top of the
  // environment's ambient fill — not doing all the lighting work alone now.
  const key = new THREE.DirectionalLight('#FFF6E0', 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.7)
  rim.position.set(-3.5, -1.2, -4)
  scene.add(rim)

  // Sphere/knot mesh: same vertex count throughout stage 1, morph target
  // baked into a custom attribute and blended in onBeforeCompile so the
  // physical material still drives all real lighting/reflection.
  const geometry = new THREE.IcosahedronGeometry(1.55, 32)
  const basePositions = geometry.attributes.position!.array as Float32Array
  const vertexCount = geometry.attributes.position!.count

  const targetPositions = new Float32Array(vertexCount * 3)
  for (let i = 0; i < vertexCount; i++) {
    const t = i / vertexCount
    const knotPoint = torusKnotPoint(t)
    const ix = i * 3
    const jitter = new THREE.Vector3(basePositions[ix]!, basePositions[ix + 1]!, basePositions[ix + 2]!)
      .normalize()
      .multiplyScalar(0.2)
    targetPositions[ix] = knotPoint.x + jitter.x
    targetPositions[ix + 1] = knotPoint.y + jitter.y
    targetPositions[ix + 2] = knotPoint.z + jitter.z
  }
  geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3))

  const sphereUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uMorphProgress: { value: 0 }
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
    shader.uniforms.uMorphProgress = sphereUniforms.uMorphProgress

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      ${noiseGLSL}
      attribute vec3 aTargetPosition;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uMorphProgress;
      varying float vDisp;`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `float n = snoise(position * 1.4 + uTime * 0.15);
      float pointerInfluence = 1.0 - smoothstep(0.0, 1.6, distance(position.xy, uPointer * 1.6));
      float disp = (n * 0.16 + pointerInfluence * 0.1) * (1.0 - uMorphProgress);
      vDisp = disp;
      vec3 spherePos = position + normal * disp;
      vec3 transformed = mix(spherePos, aTargetPosition, uMorphProgress);`
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
  const mesh = new THREE.Mesh(geometry, sphereMaterial)
  scene.add(mesh)

  // Blade bloom crossfade target: 9 thin crystalline blades (elongated,
  // tapered BoxGeometry with pulled-in tips for a faceted knife-like
  // silhouette), each starting on an independent free-spin axis/speed —
  // chaotic tumbling, distinct per blade — then decelerating and locking
  // into a precise radial starburst around the shared center.
  const BLADE_COUNT = 9
  const bladeGeometry = new THREE.BoxGeometry(0.16, 1.5, 0.045, 1, 3, 1)
  const bladePos = bladeGeometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < bladePos.count; i++) {
    const y = bladePos.getY(i)
    const x = bladePos.getX(i)
    if (y > 0.5) {
      // Taper the top half toward a point for a blade-tip silhouette.
      const taper = 1 - (y - 0.5) * 1.1
      bladePos.setX(i, x * Math.max(0.08, taper))
    }
  }
  bladePos.needsUpdate = true
  bladeGeometry.computeVertexNormals()

  const bladeMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0B2A3D',
    emissive: '#FBBA00',
    emissiveIntensity: 0.16,
    metalness: 0.55,
    roughness: 0.16,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.35,
    transparent: true,
    opacity: 0
  })

  const bladeRigs: BladeRig[] = []
  for (let i = 0; i < BLADE_COUNT; i++) {
    const mat = bladeMaterial.clone()
    const mesh = new THREE.Mesh(bladeGeometry, mat)
    scene.add(mesh)

    const angle = (i / BLADE_COUNT) * Math.PI * 2
    const lockedPosition = new THREE.Vector3(Math.cos(angle) * 0.55, 0, Math.sin(angle) * 0.55)
    const lockedRotation = new THREE.Euler(0, -angle + Math.PI / 2, Math.PI / 2)

    mesh.position.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    mesh.visible = false

    bladeRigs.push({
      mesh,
      spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spinSpeed: 0.6 + Math.random() * 0.9,
      lockedRotation,
      lockedPosition
    })
  }

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
    sphereUniforms.uMorphProgress.value = stageState.stage1
    mesh.visible = stageState.stage2 < 0.999

    bladeRigs.forEach((rig) => {
      const mat = rig.mesh.material as THREE.MeshPhysicalMaterial
      mat.opacity = stageState.stage2
      rig.mesh.visible = stageState.stage2 > 0.001
      rig.mesh.scale.setScalar(Math.max(0.001, stageState.stage2))
    })

    camera.position.x = cameraBasePos.x - stageState.stage2 * 0.35
    camera.position.y = cameraBasePos.y + stageState.stage2 * 0.3
    camera.position.z = cameraBasePos.z - stageState.stage1 * 0.6 + stageState.stage2 * 0.2
    camera.lookAt(0, stageState.stage2 * 0.35, 0)
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
      mesh.rotation.y = elapsed * 0.055

      const s2 = stageState.stage2
      bladeRigs.forEach((rig) => {
        if (s2 < 0.999) {
          // Free chaotic tumble on the blade's own axis, decelerating as
          // stage 2 approaches completion — same settling quality as the
          // Armillary variant's ring spin-down, applied to blades instead.
          const spinAmount = rig.spinSpeed * (1 - s2) * 0.4
          rig.mesh.rotateOnAxis(rig.spinAxis, spinAmount * 0.016)
          rig.mesh.position.lerp(rig.lockedPosition, s2 * 0.08)
        } else {
          // Locked: settle exactly onto the target radial starburst pose.
          rig.mesh.rotation.set(rig.lockedRotation.x, rig.lockedRotation.y, rig.lockedRotation.z)
          rig.mesh.position.copy(rig.lockedPosition)
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
    geometry.dispose()
    sphereMaterial.dispose()
    bladeGeometry.dispose()
    bladeMaterial.dispose()
    bladeRigs.forEach((rig) => (rig.mesh.material as THREE.Material).dispose())
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
