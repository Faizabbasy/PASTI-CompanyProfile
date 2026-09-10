<script setup lang="ts">
// 3D — Sphere → molecule → lattice. Same scroll-lock skeleton and quality
// bar as the other Sphere-morph variants (opaque MeshPhysicalMaterial,
// procedural RoomEnvironment via PMREMGenerator for real reflections, eased
// plateau stage timing, subtle camera dolly) — new shapes only. Stage 1
// (crossfade): the sphere fades/shrinks while ~18 small glowing "atom"
// spheres — connected by thin cylindrical "bonds" — fade/scale in, each
// orbiting a shared center on its own independent elliptical path, like a
// molecule under Brownian motion. Stage 2 (same atom/bond objects, no
// crossfade — their orbital motion decelerates and locks): the atoms settle
// from free orbits into a precise cubic lattice grid (3x3x2 point
// arrangement), bonds straightening into a rigid crystalline structure —
// "chaos of matter" resolving into "order of structure".
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

interface AtomRig {
  mesh: THREE.Mesh
  orbitCenter: THREE.Vector3
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  orbitTilt: number
  latticeTarget: THREE.Vector3
}

const ATOM_COUNT = 18
const LATTICE_SPACING = 0.85

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
  const cameraBasePos = new THREE.Vector3(0, 0.1, 7.6)
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

  // Atoms: small glowing spheres, each with an independent orbit and a
  // fixed target position in a 3x3x2 cubic lattice grid.
  const atomGeometry = new THREE.SphereGeometry(0.09, 20, 20)
  const atomMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0B2A3D',
    emissive: '#FBBA00',
    emissiveIntensity: 0.4,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 0.8,
    envMapIntensity: 1.3,
    transparent: true,
    opacity: 0
  })

  const latticePoints: THREE.Vector3[] = []
  for (let ix = 0; ix < 3; ix++) {
    for (let iy = 0; iy < 3; iy++) {
      for (let iz = 0; iz < 2; iz++) {
        latticePoints.push(
          new THREE.Vector3(
            (ix - 1) * LATTICE_SPACING,
            (iy - 1) * LATTICE_SPACING,
            (iz - 0.5) * LATTICE_SPACING
          )
        )
      }
    }
  }

  const atomRigs: AtomRig[] = []
  for (let i = 0; i < ATOM_COUNT; i++) {
    const mat = atomMaterial.clone()
    const mesh = new THREE.Mesh(atomGeometry, mat)
    scene.add(mesh)
    atomRigs.push({
      mesh,
      orbitCenter: new THREE.Vector3(0, 0, 0),
      orbitRadius: 0.7 + Math.random() * 1.1,
      orbitSpeed: 0.3 + Math.random() * 0.5,
      orbitPhase: Math.random() * Math.PI * 2,
      orbitTilt: Math.random() * Math.PI,
      latticeTarget: latticePoints[i % latticePoints.length]!.clone()
    })
  }

  // Bonds: thin cylinders connecting each atom to the shared center,
  // scaled/oriented per-frame to track the atom's current position.
  const bondGeometry = new THREE.CylinderGeometry(0.012, 0.012, 1, 6)
  const bondMaterial = new THREE.MeshPhysicalMaterial({
    color: '#6E9DBE',
    metalness: 0.4,
    roughness: 0.3,
    envMapIntensity: 1,
    transparent: true,
    opacity: 0
  })
  const bondMeshes = atomRigs.map(() => {
    const mesh = new THREE.Mesh(bondGeometry, bondMaterial.clone())
    scene.add(mesh)
    return mesh
  })

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

  const bondHelperVec = new THREE.Vector3()
  const bondHelperQuat = new THREE.Quaternion()
  const bondUpAxis = new THREE.Vector3(0, 1, 0)

  const stageState = { stage1: 0, stage2: 0 }
  function applyStages() {
    const s1 = stageState.stage1
    const s2 = stageState.stage2

    sphere.visible = s1 < 0.999
    sphere.scale.setScalar(1 - s1 * 0.35)

    atomRigs.forEach((rig, i) => {
      const mat = rig.mesh.material as THREE.MeshPhysicalMaterial
      mat.opacity = s1
      rig.mesh.visible = s1 > 0.001
      rig.mesh.scale.setScalar(THREE.MathUtils.lerp(0.6, 1, s1))
      ;(bondMeshes[i]!.material as THREE.MeshPhysicalMaterial).opacity = s1 * 0.6
      bondMeshes[i]!.visible = s1 > 0.001
    })

    camera.position.x = cameraBasePos.x + s2 * 0.3
    camera.position.y = cameraBasePos.y - s1 * 0.1
    camera.position.z = cameraBasePos.z - s1 * 0.5 + s2 * 0.3
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
      atomRigs.forEach((rig, i) => {
        // Free orbit position (decelerates in amplitude as s2 rises).
        const orbitAngle = elapsed * rig.orbitSpeed + rig.orbitPhase
        const orbitPos = new THREE.Vector3(
          Math.cos(orbitAngle) * rig.orbitRadius,
          Math.sin(orbitAngle) * rig.orbitRadius * Math.cos(rig.orbitTilt),
          Math.sin(orbitAngle) * rig.orbitRadius * Math.sin(rig.orbitTilt)
        )
        const finalPos = orbitPos.lerp(rig.latticeTarget, s2)
        rig.mesh.position.copy(finalPos)

        // Bond: stretch/orient a thin cylinder from origin to the atom.
        const bond = bondMeshes[i]!
        bondHelperVec.copy(finalPos)
        const dist = bondHelperVec.length()
        bond.position.copy(finalPos).multiplyScalar(0.5)
        bond.scale.set(1, Math.max(0.001, dist), 1)
        bondHelperQuat.setFromUnitVectors(bondUpAxis, bondHelperVec.normalize())
        bond.quaternion.copy(bondHelperQuat)
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
    atomGeometry.dispose()
    atomMaterial.dispose()
    atomRigs.forEach((rig) => (rig.mesh.material as THREE.Material).dispose())
    bondGeometry.dispose()
    bondMaterial.dispose()
    bondMeshes.forEach((mesh) => (mesh.material as THREE.Material).dispose())
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
