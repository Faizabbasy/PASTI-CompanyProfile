<script setup lang="ts">
// 3D — Sphere → terrain → grid. Second quality pass: added a procedural
// RoomEnvironment baked via PMREMGenerator to scene.environment (cheap real
// reflections, no image asset) and the sphere stage now renders fully
// opaque instead of the old flat 0.85 alpha — only once it has flattened
// into terrain and the wire-grid overlay is taking over does it fade toward
// the atmospheric "line art over dark void" look that end state wants (that
// terrain/wire transparency is intentional, not the same flaw as a
// translucent solid object). Terrain displacement is layered 3-octave noise
// for genuine topography instead of one flat noise call; the stage-2 wire
// grid uses the shell-shader glow-line technique from
// HeroBgThreeWireGridScanSweep.vue instead of `wireframe: true`'s thin
// aliased 1px lines. Stage timing eases into a held plateau per stage and
// the camera does a slow dolly/reframe keyed off progress; FOV opened up
// and pulled back for a considered "shot" instead of a tight crop.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

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
  h += vnoise(p*0.5)*0.55;
  h += vnoise(p*1.1+17.0)*0.28;
  h += vnoise(p*2.4+41.0)*0.14;
  h += vnoise(p*4.7+73.0)*0.06;
  return h;
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

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const pinTarget = canvas.closest('section')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()

  // Procedural studio environment for a cheap reflective read on the sphere
  // stage (assigned to scene.environment; the custom shader below also
  // samples it directly for the sphere-stage reflection term).
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new RoomEnvironment()
  const envMap = pmrem.fromScene(envScene, 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  const cameraBasePos = new THREE.Vector3(0, 0.2, 7.2)
  camera.position.copy(cameraBasePos)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const key = new THREE.DirectionalLight('#FFF6E0', 1.05)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#6E9DBE', 0.65)
  rim.position.set(-3.5, -1.5, -4)
  scene.add(rim)

  // Base sphere geometry — icosahedron, radius/subdivision matches base.
  const geometry = new THREE.IcosahedronGeometry(1.6, 24)
  const basePositions = geometry.attributes.position!.array as Float32Array
  const vertexCount = geometry.attributes.position!.count

  // Precompute stage-1 terrain target per vertex: flatten toward XY plane,
  // scaled wide, with layered-noise Z (3 octaves, CPU-side hash approx of
  // the terrain() GLSL function above, evaluated once at setup).
  function cpuHash(px: number, py: number): number {
    const s = Math.sin(px * 127.1 + py * 311.7) * 43758.5453123
    return (s - Math.floor(s)) * 2 - 1
  }
  function cpuTerrain(x: number, y: number): number {
    return (
      cpuHash(x * 0.5, y * 0.5) * 0.55 +
      cpuHash(x * 1.1 + 17.0, y * 1.1 + 17.0) * 0.28 +
      cpuHash(x * 2.4 + 41.0, y * 2.4 + 41.0) * 0.14 +
      cpuHash(x * 4.7 + 73.0, y * 4.7 + 73.0) * 0.06
    )
  }

  const targetPositions = new Float32Array(vertexCount * 3)
  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3
    const vx = basePositions[ix]!
    const vy = basePositions[ix + 1]!
    const flatX = vx * 2.2
    const flatY = vy * 1.1
    const height = cpuTerrain(flatX * 0.4, flatY * 0.4) * 1.0
    targetPositions[ix] = flatX
    targetPositions[ix + 1] = flatY - 0.4
    targetPositions[ix + 2] = height
  }
  geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3))

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color('#0B3954') },
    uColorB: { value: new THREE.Color('#FBBA00') },
    uMorphProgress: { value: 0 },
    uWireMix: { value: 0 },
    uLightDir: { value: key.position.clone().normalize() }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      ${noiseGLSL}
      attribute vec3 aTargetPosition;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uMorphProgress;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vDisp;
      varying float vHeight;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        float n = terrain(position.xz);
        float pointerInfluence = 1.0 - smoothstep(0.0, 1.6, distance(position.xy, uPointer * 1.6));
        float disp = n * 0.18 * (1.0 - uMorphProgress) + pointerInfluence * 0.12 * (1.0 - uMorphProgress);
        vDisp = disp;
        vec3 spherePos = position + normal * disp;
        vec3 morphed = mix(spherePos, aTargetPosition, uMorphProgress);
        vHeight = aTargetPosition.z;
        vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uMorphProgress;
      uniform float uWireMix;
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vDisp;
      varying float vHeight;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vViewDir);
        vec3 l = normalize(uLightDir);
        float cosTheta = clamp(dot(n, v), 0.0, 1.0);
        float fresnel = 0.04 + (1.0 - 0.04) * pow(1.0 - cosTheta, 5.0);
        vec3 halfDir = normalize(l + v);
        float spec = pow(max(dot(n, halfDir), 0.0), 40.0);

        vec3 sphereColor = mix(uColorA, uColorB, smoothstep(-0.1, 0.25, vDisp));
        sphereColor += vec3(0.98, 0.95, 0.88) * fresnel * 0.3 + vec3(1.0) * spec * 0.5;

        vec3 terrainColor = mix(uColorA, uColorB, smoothstep(-0.4, 0.5, vHeight));
        terrainColor += vec3(1.0) * spec * 0.35;

        vec3 color = mix(sphereColor, terrainColor, uMorphProgress);
        // Sphere stage renders fully opaque (solid, expensive-reading
        // object) — only the terrain stage, once it's flattened and the
        // wire-grid overlay is taking over, fades toward the atmospheric
        // "line art over dark void" look that stage is going for.
        float alpha = mix(1.0, 0.5, uMorphProgress) * (1.0 - uWireMix * 0.55);
        gl_FragColor = vec4(color, alpha);
      }
    `
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Stage-2 wire-grid overlay: same final terrain vertex positions as the
  // solid mesh, but rendered with a UV-threshold "thick glow line" shader
  // (same technique as HeroBgThreeWireGridScanSweep.vue) instead of
  // wireframe:true's thin aliased GL lines. UVs are derived from the plane
  // grid's row/col index baked in at setup.
  const wireGeometry = new THREE.BufferGeometry()
  wireGeometry.setAttribute('position', new THREE.BufferAttribute(targetPositions.slice(), 3))
  wireGeometry.setIndex(geometry.getIndex())
  wireGeometry.setAttribute('uv', geometry.attributes.uv!.clone())

  const wireUniforms = {
    uColor: { value: new THREE.Color('#FBBA00') },
    uColorFar: { value: new THREE.Color('#0B2A3D') },
    uOpacity: { value: 0 },
    uLineWidth: { value: 0.045 },
    uCells: { value: 22.0 }
  }
  const wireVertex = `
    varying vec2 vUv;
    varying float vHeight;
    void main() {
      vUv = uv;
      vHeight = position.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  // Threshold band around grid UV lines — thicker-reading than 1px
  // wireframe, matches the WireGridScanSweep glow-line quality bar.
  const wireFragment = `
    uniform vec3 uColor;
    uniform vec3 uColorFar;
    uniform float uOpacity;
    uniform float uLineWidth;
    uniform float uCells;
    varying vec2 vUv;
    varying float vHeight;
    void main() {
      vec2 grid = fract(vUv * uCells);
      float lineX = smoothstep(uLineWidth, 0.0, min(grid.x, 1.0 - grid.x));
      float lineY = smoothstep(uLineWidth, 0.0, min(grid.y, 1.0 - grid.y));
      float line = max(lineX, lineY);
      if (line < 0.02) discard;
      vec3 color = mix(uColorFar, uColor, smoothstep(-0.5, 0.6, vHeight));
      gl_FragColor = vec4(color, line * uOpacity);
    }
  `
  const wireMaterial = new THREE.ShaderMaterial({
    uniforms: wireUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: wireVertex,
    fragmentShader: wireFragment
  })
  const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial)
  scene.add(wireMesh)

  // Additive halo duplicate for a cheap glow read on the grid lines.
  const haloMaterial = new THREE.ShaderMaterial({
    uniforms: wireUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: wireVertex,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uLineWidth;
      uniform float uCells;
      varying vec2 vUv;
      void main() {
        vec2 grid = fract(vUv * uCells);
        float lineX = smoothstep(uLineWidth * 2.2, 0.0, min(grid.x, 1.0 - grid.x));
        float lineY = smoothstep(uLineWidth * 2.2, 0.0, min(grid.y, 1.0 - grid.y));
        float line = max(lineX, lineY);
        gl_FragColor = vec4(uColor, line * uOpacity * 0.35);
      }
    `
  })
  const haloMesh = new THREE.Mesh(wireGeometry, haloMaterial)
  scene.add(haloMesh)

  const glowGeometry = new THREE.PlaneGeometry(6, 2)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: '#FBBA00',
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  glow.position.set(0, -0.4, -1.5)
  scene.add(glow)

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
    uniforms.uMorphProgress.value = stageState.stage1
    uniforms.uWireMix.value = stageState.stage2
    wireUniforms.uOpacity.value = stageState.stage2 * 0.85
    glowMaterial.opacity = stageState.stage2 * 0.12
    wireMesh.visible = stageState.stage2 > 0.001
    haloMesh.visible = stageState.stage2 > 0.001

    camera.position.x = cameraBasePos.x + stageState.stage2 * 0.3
    camera.position.y = cameraBasePos.y + stageState.stage1 * 0.2 - stageState.stage2 * 0.1
    camera.position.z = cameraBasePos.z - stageState.stage1 * 0.35
    camera.lookAt(0, -stageState.stage1 * 0.15, 0)
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
    // Reduced motion: render the fully-morphed wire-grid terrain statically.
    stageState.stage1 = 1
    stageState.stage2 = 1
    applyStages()
  }

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed
    uniforms.uPointer.value.set(pointer.x, pointer.y)
    if (!prefersReducedMotion && stageState.stage1 < 0.01) {
      mesh.rotation.y = elapsed * 0.06
      mesh.rotation.x = Math.sin(elapsed * 0.08) * 0.12
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
    material.dispose()
    wireGeometry.dispose()
    wireMaterial.dispose()
    haloMaterial.dispose()
    glowGeometry.dispose()
    glowMaterial.dispose()
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
