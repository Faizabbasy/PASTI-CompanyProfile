<script setup lang="ts">
// 3D — Sphere → liquid drop → crystal spire. Same scroll-lock skeleton and
// quality bar as the other Sphere-morph variants (opaque MeshPhysicalMaterial
// throughout, a procedural RoomEnvironment baked via PMREMGenerator for real
// reflections, eased plateau stage timing, subtle camera dolly) — new shapes
// only. Stage 1 (vertex blend, same vertex count): the icosahedron elongates
// downward and its surface adopts a slow, heavy sine-wave ripple — reads as
// gravity pulling it into a hanging liquid-metal droplet, tapering to a
// point. Stage 2 (crossfade): the droplet fades out while a tall faceted
// crystal spire (a custom low-poly cone-like BufferGeometry with irregular
// facet offsets, not a smooth CylinderGeometry) fades/grows in, lit from
// within via emissive intensity ramping up — the liquid "finishes cooling"
// into a hard, glowing crystal.
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

// Builds a low-poly faceted spire: a stack of rings shrinking toward a tip,
// each ring's vertices given a small irregular radial offset so it reads as
// a cut/faceted crystal rather than a smooth cone.
function buildSpireGeometry(): THREE.BufferGeometry {
  const rings = 7
  const segments = 7
  const height = 3.4
  const positions: number[] = []
  const indices: number[] = []
  const ringVerts: number[][] = []

  for (let r = 0; r <= rings; r++) {
    const t = r / rings
    const y = -height / 2 + t * height
    const radius = (1 - t) * 0.55 * (0.85 + 0.3 * Math.sin(t * 9.0))
    const verts: number[] = []
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2 + t * 0.6
      const facetJitter = 1 + (Math.sin(s * 12.9898 + r * 78.233) * 0.5) * 0.18
      const x = Math.cos(angle) * radius * facetJitter
      const z = Math.sin(angle) * radius * facetJitter
      verts.push(positions.length / 3)
      positions.push(x, y, z)
    }
    ringVerts.push(verts)
  }

  for (let r = 0; r < rings; r++) {
    const a = ringVerts[r]!
    const b = ringVerts[r + 1]!
    for (let s = 0; s < segments; s++) {
      const s2 = (s + 1) % segments
      indices.push(a[s]!, b[s]!, a[s2]!)
      indices.push(a[s2]!, b[s]!, b[s2]!)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
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
  const cameraBasePos = new THREE.Vector3(0, 0.1, 7.2)
  camera.position.copy(cameraBasePos)

  const key = new THREE.DirectionalLight('#FFF6E0', 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.7)
  rim.position.set(-3.5, -1.2, -4)
  scene.add(rim)

  // Sphere/droplet mesh: same vertex count throughout stage 1. Target
  // positions elongate the sphere downward into a teardrop taper.
  const geometry = new THREE.IcosahedronGeometry(1.55, 32)
  const basePositions = geometry.attributes.position!.array as Float32Array
  const vertexCount = geometry.attributes.position!.count

  const targetPositions = new Float32Array(vertexCount * 3)
  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const bx = basePositions[ix]!
    const by = basePositions[ix + 1]!
    const bz = basePositions[ix + 2]!
    // Normalize y into 0 (bottom) - 1 (top) across the sphere's own extent,
    // then taper radius toward the bottom for a hanging-droplet silhouette.
    const t = THREE.MathUtils.clamp((by + 1.55) / 3.1, 0, 1)
    const taper = THREE.MathUtils.lerp(0.15, 1.05, Math.pow(t, 0.7))
    const stretchedY = (t - 0.5) * 3.6
    targetPositions[ix] = bx * taper
    targetPositions[ix + 1] = stretchedY
    targetPositions[ix + 2] = bz * taper
  }
  geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3))

  const sphereUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uMorphProgress: { value: 0 }
  }

  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: '#123A54',
    metalness: 0.5,
    roughness: 0.18,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.3
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
      `float n = snoise(position * 1.3 + uTime * 0.12);
      float pointerInfluence = 1.0 - smoothstep(0.0, 1.6, distance(position.xy, uPointer * 1.6));
      // Slow heavy ripple that grows more pronounced as it liquefies —
      // reads as viscous surface tension rather than the sphere's own
      // fine noise displacement.
      float liquidWave = sin(position.y * 3.0 + uTime * 0.6) * 0.05 * uMorphProgress;
      float disp = (n * 0.14 + pointerInfluence * 0.09) * (1.0 - uMorphProgress) + liquidWave;
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
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.9, 1.55, 0.55), smoothstep(-0.03, 0.15, vDisp) * 0.45);`
    )
  }
  const mesh = new THREE.Mesh(geometry, sphereMaterial)
  scene.add(mesh)

  // Crystal spire crossfade target: faceted low-poly spire, emissive glow
  // ramping in as it "finishes cooling" from liquid to solid crystal.
  const spireGeometry = buildSpireGeometry()
  const spireMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0B2A3D',
    emissive: '#FBBA00',
    emissiveIntensity: 0,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.15,
    thickness: 0.6,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.4
  })
  const spire = new THREE.Mesh(spireGeometry, spireMaterial)
  spire.scale.setScalar(0.001)
  spire.visible = false
  scene.add(spire)

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

    spireMaterial.emissiveIntensity = stageState.stage2 * 0.55
    spire.visible = stageState.stage2 > 0.001
    spire.scale.setScalar(Math.max(0.001, stageState.stage2))

    camera.position.x = cameraBasePos.x + stageState.stage2 * 0.3
    camera.position.y = cameraBasePos.y - stageState.stage1 * 0.15 + stageState.stage2 * 0.1
    camera.position.z = cameraBasePos.z - stageState.stage1 * 0.5 + stageState.stage2 * 0.2
    camera.lookAt(0, stageState.stage1 * -0.2, 0)
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
      mesh.rotation.y = elapsed * 0.05
      spire.rotation.y = elapsed * 0.06
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
    spireGeometry.dispose()
    spireMaterial.dispose()
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
