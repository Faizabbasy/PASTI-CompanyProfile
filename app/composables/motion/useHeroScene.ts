import * as THREE from 'three'

/**
 * "Living Network" Hero scene — replaces the earlier ribbon/liquid-gradient
 * scene. A constellation of nodes/connections that assembles from scatter to
 * order on load, standing in for PASTI's positioning as a technology/
 * ecosystem connector (ties directly to OPEN's "One Procurement Ecosystem
 * Network"). Full-bleed behind the headline, white/paper ground with a very
 * soft navy/yellow mesh-gradient accent in the corners (not the old loud
 * liquid noise field — that fought the headline's contrast and read as
 * generic "abstract gradient" stock art).
 *
 * Design constraints carried over from the earlier ribbon scene and worth
 * keeping in mind for any future edit:
 * - `enabled`/mount gating and reduced-motion handling live in the
 *   consuming component (HeroScene.vue), not here.
 * - `camera.aspect` must be set explicitly on resize (frustum math doesn't
 *   auto-correct it).
 * - A node's world Z depth does NOT protect it from visually overlapping
 *   the 2D headline — only screen-space x/y do. The EXCLUDE_* elliptical
 *   zone below is the mechanism that keeps every node/line/pulse off the
 *   text column, at every viewport size, regardless of Z.
 */

const NAVY_BG = new THREE.Color(0x0b3954)
const NAVY_LIGHT_BG = new THREE.Color(0x2a7fb8)
const YELLOW_BG = new THREE.Color(0xfbba00)
const YELLOW_SOFT_BG = new THREE.Color(0xffd873)
const NAVY_DEEP_BG = new THREE.Color(0x051b28)
const PAPER_BG = new THREE.Color(0xf3f6f8)

const liquidBgVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/**
 * Light mesh gradient, white-dominant: a couple of very soft brand-color
 * blobs sitting in the corners, everything else stays paper-white so the
 * network scene and headline both read with full contrast. Deliberately NOT
 * the earlier loud liquid-noise field (see HANDOFF) — that fought the
 * network for attention and looked like generic stock "abstract gradient"
 * art rather than something built with intent.
 */
const liquidBgFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerVel;
  uniform vec2 uResolution;
  uniform float uEntrance;
  uniform float uScrollFade;
  uniform vec3 uNavyDeep, uNavy, uNavyLight, uYellow, uYellowSoft, uPaper;

  float blob(vec2 p, vec2 center, float radius) {
    float d = length(p - center) / radius;
    return smoothstep(1.0, 0.0, d);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.04;

    vec3 col = uPaper;

    vec2 c1 = vec2(-0.75, 0.5) + vec2(sin(t * 0.6), cos(t * 0.45)) * 0.05;
    vec2 c2 = vec2(0.8, -0.55) + vec2(cos(t * 0.5 + 1.6), sin(t * 0.55 + 1.0)) * 0.06;

    col = mix(col, uNavyLight, blob(p, c1, 0.9) * 0.16);
    col = mix(col, uYellowSoft, blob(p, c2, 0.85) * 0.16);

    float cursorDist = length(p - uPointer);
    float cursorGlow = smoothstep(0.5, 0.0, cursorDist) * (0.05 + uPointerVel * 0.04);
    col = mix(col, uYellowSoft, cursorGlow);

    float grain = fract(sin(dot(uv * uResolution.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.008;

    col = mix(uPaper, col, uEntrance);
    col = mix(col, uPaper, uScrollFade);
    gl_FragColor = vec4(col, 1.0);
  }
`

interface LiquidBgUniforms {
  [uniform: string]: THREE.IUniform
  uTime: { value: number }
  uPointer: { value: THREE.Vector2 }
  uPointerVel: { value: number }
  uResolution: { value: THREE.Vector2 }
  uEntrance: { value: number }
  uScrollFade: { value: number }
  uNavyDeep: { value: THREE.Color }
  uNavy: { value: THREE.Color }
  uNavyLight: { value: THREE.Color }
  uYellow: { value: THREE.Color }
  uYellowSoft: { value: THREE.Color }
  uPaper: { value: THREE.Color }
}

// Recolored for a WHITE background — the loud glow palette (pale yellow,
// light blue) tuned for additive blending over dark navy disappears on
// paper. These are fully-saturated, darker brand tones so nodes/edges read
// as solid ink-like marks, closer to a precise technical diagram than a
// glowing nebula.
const NAVY = new THREE.Color(0x0b3954)
const NAVY_LIGHT = new THREE.Color(0x134d6b)
const YELLOW = new THREE.Color(0xd99400)
const YELLOW_SOFT = new THREE.Color(0xfbba00)

interface Band {
  count: number
  z: number
  spread: number
  size: number
  hubChance: number
}

// Spread widened well past the visible frame (at camDist ~13, FOV 42, the
// visible half-width is roughly 8-9 world units at typical desktop aspect
// ratios) plus real margin, so the group's own idle rotation + cursor/
// scroll tilt never swings a screen edge past the last node and reveals
// bare background. Farther bands spread even wider since their parallax
// swing is larger. Node count kept deliberately modest (fewer, more
// curated nodes) so the scene reads as a composed constellation, not a
// particle-system demo — hub chance raised so the larger lit hub spheres
// carry the visual weight instead of density alone.
const BANDS: Band[] = [
  { count: 70, z: -1.5, spread: 13, size: 5.2, hubChance: 0.16 },
  { count: 66, z: -4.5, spread: 16, size: 3.6, hubChance: 0.1 },
  { count: 50, z: -8.0, spread: 19, size: 2.4, hubChance: 0.05 }
]

// Elliptical exclusion zone (world units) around the text column — clears
// both the centered headline/subtext/CTA block AND the small eyebrow-style
// label above it, whichever the consuming Hero.vue renders. Shifted up
// slightly (EXCLUDE_CY) since the block's vertical center sits a little
// above world-origin once the CTA row is included.
const EXCLUDE_X = 4.2
const EXCLUDE_Y = 2.5
const EXCLUDE_CY = 0.3

function isExcluded(x: number, y: number): boolean {
  const nx = x / EXCLUDE_X
  const ny = (y - EXCLUDE_CY) / EXCLUDE_Y
  return nx * nx + ny * ny < 1
}

// Eight cluster anchors: four close in, right against the text column's
// edges (so density ramps up immediately outside the exclusion zone
// instead of jumping straight to a far corner cluster and leaving the
// near-ring around the text sparse), plus four further out toward the
// frame's corners for overall mass.
const CLUSTER_ANCHORS = [
  { x: -0.32, y: 0.32 },
  { x: 0.34, y: 0.3 },
  { x: -0.3, y: -0.32 },
  { x: 0.32, y: -0.3 },
  { x: -0.68, y: 0.6 },
  { x: 0.7, y: 0.55 },
  { x: -0.62, y: -0.6 },
  { x: 0.65, y: -0.55 }
]

/**
 * Places a node's (x, y) home position. ~65% cluster-anchored (the
 * "arranged, deliberate mass" look), ~35% pure uniform across the whole
 * spread — the uniform fraction exists specifically to guarantee there's no
 * gap BETWEEN the cluster anchors (the mid-edges of the frame, not just its
 * corners), which pure clustering left thin no matter how wide the scatter
 * radius went.
 */
function placeNode(spread: number): [number, number] {
  let x = 0
  let y = 0
  let tries = 0
  const useCluster = Math.random() < 0.65
  do {
    if (useCluster) {
      const anchor = CLUSTER_ANCHORS[Math.floor(Math.random() * CLUSTER_ANCHORS.length)]!
      const ax = anchor.x * spread
      const ay = anchor.y * spread * 1.15
      // Sum of two uniforms approximates a bell curve without Box-Muller.
      const scatterR = spread * 0.62
      x = ax + (Math.random() + Math.random() - 1) * scatterR
      y = ay + (Math.random() + Math.random() - 1) * scatterR * 1.1
    } else {
      x = (Math.random() - 0.5) * spread * 2
      y = (Math.random() - 0.5) * spread * 1.15
    }
    tries++
  } while (isExcluded(x, y) && tries < 30)

  if (isExcluded(x, y)) {
    const ang = Math.atan2((y - EXCLUDE_CY) / EXCLUDE_Y, x / EXCLUDE_X)
    x = Math.cos(ang) * EXCLUDE_X * 1.35
    y = EXCLUDE_CY + Math.sin(ang) * EXCLUDE_Y * 1.35
  }
  return [x, y]
}

interface NetworkNode {
  home: THREE.Vector3
  pos: THREE.Vector3
  hub: boolean
  hasMesh: boolean
  phase: number
  speed: number
  band: number
  size: number
}

interface HubMeshEntry {
  mesh: THREE.Mesh
  node: NetworkNode
  spinSpeed: number
  baseScale: number
}

interface OrbitRingEntry {
  group: THREE.Group
  host: HubMeshEntry
  radius: number
  ringTilt: THREE.Euler
  satellites: { mesh: THREE.Mesh; offset: number }[]
  spinSpeed: number
}

interface DriftMeshEntry {
  mesh: THREE.Mesh
  speed: number
  phase: number
}

interface DataPacket {
  mesh: THREE.Mesh
  path: number[]
  segIdx: number
  segT: number
  speed: number
  startDelay: number
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// Slight overshoot-then-settle — reads as "directed" assembly rather than
// particles drifting to rest.
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export function useHeroScene(canvasRef: Ref<HTMLCanvasElement | null>, containerRef: Ref<HTMLElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let scene: THREE.Scene | undefined
  let bgScene: THREE.Scene | undefined
  let bgCamera: THREE.OrthographicCamera | undefined
  let bgMaterial: THREE.ShaderMaterial | undefined
  let bgUniforms: LiquidBgUniforms | undefined
  let networkGroup: THREE.Group | undefined
  let driftGroup: THREE.Group | undefined

  let nodes: NetworkNode[] = []
  let edges: [number, number][] = []
  let edgeDelay: number[] = []
  let hubMeshes: HubMeshEntry[] = []
  let orbitRings: OrbitRingEntry[] = []
  let driftMeshes: DriftMeshEntry[] = []
  let packets: DataPacket[] = []
  let adjacency: Record<number, number[]> = {}

  let nodeGeo: THREE.BufferGeometry | undefined
  let nodeMat: THREE.ShaderMaterial | undefined
  let nodePoints: THREE.Points | undefined
  let edgeGeo: THREE.BufferGeometry | undefined
  let edgeMat: THREE.LineBasicMaterial | undefined
  let edgeLines: THREE.LineSegments | undefined
  let pulseGeo: THREE.BufferGeometry | undefined
  let pulseMat: THREE.PointsMaterial | undefined
  let pulsePoints: THREE.Points | undefined
  let pulseTexture: THREE.CanvasTexture | undefined
  let pulseEdgeIdx: number[] = []
  let pulseState: { t: number; speed: number; delay: number }[] = []

  let hubMeshGeo: THREE.IcosahedronGeometry | undefined
  let hubMeshMat: THREE.MeshPhysicalMaterial | undefined
  let orbitRingGeo: THREE.TorusGeometry | undefined
  let orbitRingMat: THREE.MeshBasicMaterial | undefined
  let orbitDotGeo: THREE.SphereGeometry | undefined
  let orbitDotMat: THREE.MeshBasicMaterial | undefined
  let packetGeo: THREE.BoxGeometry | undefined
  let packetMat: THREE.MeshPhysicalMaterial | undefined
  let driftGeos: THREE.BufferGeometry[] = []
  let driftMat: THREE.MeshBasicMaterial | undefined

  let keyLight: THREE.DirectionalLight | undefined
  let rimLight: THREE.DirectionalLight | undefined
  let ambientLight: THREE.AmbientLight | undefined
  let pmremRenderTarget: THREE.WebGLRenderTarget | undefined

  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0
  let running = false

  let pointerX = 0
  let pointerY = 0
  let pointerVelocity = 0
  let lastPointerX = 0
  let lastPointerY = 0
  const pointerWorld = new THREE.Vector3(0, 0, 0)
  let scrollProgress = 0

  // Ramps 0 -> 1 once, via playEntrance() — drives both the network's
  // chaos-to-order assembly and the liquid background's fade-up-from-paper.
  let entranceProgress = 0
  let entranceStart: number | undefined
  const ENTRANCE_DUR = 2.6

  // Cinematic camera intro: starts pulled back/off-axis and settles into
  // its resting framing over the first ~1.8s of real elapsed time (not
  // gated on playEntrance, so it always plays once on mount).
  const CAM_INTRO_DUR = 1.8
  const CAM_START_OFFSET = new THREE.Vector3(2.6, 1.6, 5.5)

  function buildDriftShapes(parent: THREE.Group) {
    const specs: { geo: THREE.BufferGeometry; pos: [number, number, number]; speed: number; opacity: number }[] = [
      { geo: new THREE.IcosahedronGeometry(3.2, 0), pos: [-7, 3, -14], speed: 0.03, opacity: 0.1 },
      { geo: new THREE.TorusGeometry(2.6, 0.9, 8, 24), pos: [8, -2.5, -16], speed: 0.025, opacity: 0.11 },
      { geo: new THREE.OctahedronGeometry(2.4, 0), pos: [-5, -4, -18], speed: 0.035, opacity: 0.1 },
      { geo: new THREE.TorusKnotGeometry(1.8, 0.45, 64, 8), pos: [6.5, 3.5, -13], speed: 0.02, opacity: 0.12 },
      { geo: new THREE.IcosahedronGeometry(2.0, 0), pos: [0, -5.5, -20], speed: 0.028, opacity: 0.08 },
      { geo: new THREE.DodecahedronGeometry(2.2, 0), pos: [-8.5, -1, -17], speed: 0.022, opacity: 0.09 }
    ]
    driftMat = new THREE.MeshBasicMaterial({ color: 0x134d6b, wireframe: true, transparent: true, fog: true })
    driftGeos = specs.map((s) => s.geo)
    driftMeshes = specs.map((s) => {
      const mat = driftMat!.clone()
      mat.opacity = s.opacity
      const mesh = new THREE.Mesh(s.geo, mat)
      mesh.position.set(s.pos[0], s.pos[1], s.pos[2])
      parent.add(mesh)
      return { mesh, speed: s.speed, phase: Math.random() * Math.PI * 2 }
    })
  }

  function buildNetwork(parent: THREE.Group, renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    // Studio-style lighting for the lit hub spheres — the additive point-
    // sprite nodes don't need real lights (self-illuminating), but the hub
    // meshes do, so they read as actual 3D metal objects with reflections.
    keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(5, 6, 8)
    scene.add(keyLight)
    rimLight = new THREE.DirectionalLight(0x8fc6ff, 1.6)
    rimLight.position.set(-6, -3, -4)
    scene.add(rimLight)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
    scene.add(ambientLight)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color(0x081826)
    const envWarm = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffcf6b }))
    envWarm.position.set(5, 4, 3)
    envScene.add(envWarm)
    const envCool = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), new THREE.MeshBasicMaterial({ color: 0x2a7fb8 }))
    envCool.position.set(-5, -2, -3)
    envScene.add(envCool)
    const envTarget = pmrem.fromScene(envScene, 0.08)
    pmremRenderTarget = envTarget
    scene.environment = envTarget.texture
    pmrem.dispose()

    nodes = []
    BANDS.forEach((band, bi) => {
      for (let i = 0; i < band.count; i++) {
        const [x, y] = placeNode(band.spread)
        const home = new THREE.Vector3(x, y, band.z + (Math.random() - 0.5) * 1.2)
        nodes.push({
          home,
          pos: home.clone().multiplyScalar(0.05).add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 4)),
          hub: Math.random() < band.hubChance,
          hasMesh: false,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.6,
          band: bi,
          size: band.size
        })
      }
    })

    // Decide which hub nodes get a real lit 3D mesh BEFORE building the
    // point-sprite buffers, so those nodes' sprite size can be zeroed —
    // otherwise a hub double-renders as both a solid sphere and a glowing
    // dot at the same spot.
    const hubCandidates = nodes.filter((n) => n.hub)
    hubCandidates.sort((a, b) => b.home.length() - a.home.length())
    const HUB_MESH_COUNT = Math.min(22, hubCandidates.length)
    for (let i = 0; i < HUB_MESH_COUNT; i++) hubCandidates[i]!.hasMesh = true

    const positions = new Float32Array(nodes.length * 3)
    const colors = new Float32Array(nodes.length * 3)
    const sizes = new Float32Array(nodes.length)
    const phases = new Float32Array(nodes.length)
    const speeds = new Float32Array(nodes.length)

    nodes.forEach((n, i) => {
      const c = n.hub ? YELLOW : n.band === 0 ? NAVY_LIGHT : NAVY
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      sizes[i] = n.hasMesh ? 0 : n.hub ? n.size * 1.9 : n.size
      phases[i] = n.phase
      speeds[i] = n.speed
    })

    nodeGeo = new THREE.BufferGeometry()
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    nodeGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))

    // Normal alpha blending (not additive) — additive only brightens, which
    // does nothing useful against white. Cheap depth-of-field: nodes far
    // from a focal Z plane render larger/softer/lower-contrast (bokeh-
    // style), nodes near the focal plane stay crisp.
    nodeMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uFocalZ: { value: -1.5 } },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute float aSpeed;
        uniform float uTime;
        uniform float uFocalZ;
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vBlur;
        void main() {
          vColor = color;
          float pulse = 0.7 + 0.3 * sin(uTime * aSpeed + aPhase);
          vTwinkle = pulse;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float defocus = clamp(abs(position.z - uFocalZ) / 7.0, 0.0, 1.0);
          vBlur = defocus;
          float sizeBoost = 1.0 + defocus * 1.6;
          gl_PointSize = aSize * sizeBoost * (0.75 + pulse * 0.35) * (60.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vBlur;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float edgeInner = mix(0.15, -0.1, vBlur);
          float core = smoothstep(0.5, edgeInner, d);
          float contrast = mix(1.0, 0.55, vBlur);
          float alpha = core * (0.55 + vTwinkle * 0.45) * uOpacity * contrast;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    })
    nodePoints = new THREE.Points(nodeGeo, nodeMat)
    parent.add(nodePoints)

    // ---------- Lit hub spheres ----------
    // Solid metallic-gold, not glass — transmission relies on seeing a dark
    // surface through the material, which washes out against a white
    // ground. A polished metal clearcoat sphere keeps real specular
    // highlights/reflections while staying opaque and legible on paper.
    hubMeshGeo = new THREE.IcosahedronGeometry(1, 2)
    hubMeshMat = new THREE.MeshPhysicalMaterial({
      color: YELLOW,
      metalness: 0.75,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: YELLOW,
      emissiveIntensity: 0.06,
      fog: true
    })
    hubMeshes = []
    for (let i = 0; i < HUB_MESH_COUNT; i++) {
      const hn = hubCandidates[i]!
      const meshScale = 0.11 + (hn.band === 0 ? 0.05 : 0)
      const mesh = new THREE.Mesh(hubMeshGeo, hubMeshMat)
      mesh.scale.setScalar(meshScale)
      mesh.position.copy(hn.pos)
      parent.add(mesh)
      hubMeshes.push({ mesh, node: hn, spinSpeed: 0.15 + Math.random() * 0.25, baseScale: meshScale })
    }

    // ---------- Orbit rings on the two largest hubs ----------
    orbitRingGeo = new THREE.TorusGeometry(1, 0.012, 8, 64)
    orbitRingMat = new THREE.MeshBasicMaterial({ color: 0xd99400, transparent: true, opacity: 0.55, fog: true })
    orbitDotGeo = new THREE.SphereGeometry(0.045, 12, 12)
    orbitDotMat = new THREE.MeshBasicMaterial({ color: 0xd99400, fog: true })
    orbitRings = []
    const ringHostCandidates = hubMeshes.slice().sort((a, b) => b.baseScale - a.baseScale)
    const RING_HOST_COUNT = Math.min(2, ringHostCandidates.length)
    for (let i = 0; i < RING_HOST_COUNT; i++) {
      const host = ringHostCandidates[i]!
      const ringGroup = new THREE.Group()
      const ringRadius = host.baseScale * 2.6
      const ring = new THREE.Mesh(orbitRingGeo, orbitRingMat)
      ring.scale.setScalar(ringRadius)
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.6
      ring.rotation.y = (Math.random() - 0.5) * 0.6
      ringGroup.add(ring)
      const satellites: { mesh: THREE.Mesh; offset: number }[] = []
      const satelliteCount = 3
      for (let s = 0; s < satelliteCount; s++) {
        const dot = new THREE.Mesh(orbitDotGeo, orbitDotMat)
        ringGroup.add(dot)
        satellites.push({ mesh: dot, offset: (s / satelliteCount) * Math.PI * 2 })
      }
      parent.add(ringGroup)
      orbitRings.push({
        group: ringGroup,
        host,
        radius: ringRadius,
        ringTilt: ring.rotation.clone(),
        satellites,
        spinSpeed: 0.5 + Math.random() * 0.3
      })
    }

    // ---------- Connections (nearest-neighbor per node) ----------
    const K_NEAREST = 3
    edges = []
    const seen = new Set<string>()
    for (let i = 0; i < nodes.length; i++) {
      const dists: [number, number][] = []
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue
        if (nodes[j]!.band > nodes[i]!.band + 1) continue
        dists.push([nodes[i]!.home.distanceTo(nodes[j]!.home), j])
      }
      dists.sort((a, b) => a[0] - b[0])
      for (let k = 0; k < Math.min(K_NEAREST, dists.length); k++) {
        const [d, j] = dists[k]!
        if (d < 3.6) {
          const a = Math.min(i, j)
          const b = Math.max(i, j)
          const key = `${a}_${b}`
          if (!seen.has(key)) {
            seen.add(key)
            edges.push([a, b])
          }
        }
      }
    }

    // ---------- Data packets: travel multi-hop paths ----------
    adjacency = {}
    edges.forEach(([a, b]) => {
      ;(adjacency[a] ??= []).push(b)
      ;(adjacency[b] ??= []).push(a)
    })

    function randomPath(startIdx: number, hops: number): number[] {
      const path = [startIdx]
      let current = startIdx
      for (let h = 0; h < hops; h++) {
        const neighbors = adjacency[current]
        if (!neighbors || neighbors.length === 0) break
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]!
        path.push(next)
        current = next
      }
      return path
    }

    const PACKET_COUNT = 10
    packetGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09)
    packetMat = new THREE.MeshPhysicalMaterial({
      color: YELLOW,
      metalness: 0.6,
      roughness: 0.25,
      clearcoat: 0.8,
      emissive: YELLOW,
      emissiveIntensity: 0.15,
      fog: true
    })
    packets = []
    const nodeIdxPool = nodes.map((_, idx) => idx)
    for (let p = 0; p < PACKET_COUNT; p++) {
      const startIdx = nodeIdxPool[Math.floor(Math.random() * nodeIdxPool.length)]!
      const path = randomPath(startIdx, 3 + Math.floor(Math.random() * 3))
      const mesh = new THREE.Mesh(packetGeo, packetMat)
      mesh.visible = false
      parent.add(mesh)
      packets.push({ mesh, path, segIdx: 0, segT: 0, speed: 0.35 + Math.random() * 0.25, startDelay: p * 0.9 + Math.random() * 0.6 })
    }

    const edgePositions = new Float32Array(edges.length * 2 * 3)
    const edgeColors = new Float32Array(edges.length * 2 * 3)
    edgeGeo = new THREE.BufferGeometry()
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3))
    edgeGeo.setAttribute('color', new THREE.BufferAttribute(edgeColors, 3))
    edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false })
    edgeLines = new THREE.LineSegments(edgeGeo, edgeMat)
    parent.add(edgeLines)

    // ---------- Traveling energy pulses along a subset of edges ----------
    pulseEdgeIdx = edges
      .map((e, idx) => ({ idx, hub: nodes[e[0]]!.hub || nodes[e[1]]!.hub }))
      .filter((e) => e.hub)
      .map((e) => e.idx)
    const extra = edges.map((_, idx) => idx).filter((idx) => !pulseEdgeIdx.includes(idx))
    for (const idx of extra) {
      if (Math.random() < 0.06) pulseEdgeIdx.push(idx)
    }
    const pulseCount = pulseEdgeIdx.length
    const pulsePositions = new Float32Array(pulseCount * 3)
    pulseGeo = new THREE.BufferGeometry()
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3))

    const pulseCanvas = document.createElement('canvas')
    pulseCanvas.width = pulseCanvas.height = 64
    const pctx = pulseCanvas.getContext('2d')!
    const grad = pctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(217,148,0,1)')
    grad.addColorStop(1, 'rgba(217,148,0,0)')
    pctx.fillStyle = grad
    pctx.fillRect(0, 0, 64, 64)
    pulseTexture = new THREE.CanvasTexture(pulseCanvas)

    pulseMat = new THREE.PointsMaterial({
      map: pulseTexture,
      color: YELLOW,
      size: 12,
      sizeAttenuation: false,
      transparent: true,
      opacity: 1,
      depthWrite: false
    })
    pulsePoints = new THREE.Points(pulseGeo, pulseMat)
    parent.add(pulsePoints)
    pulseState = pulseEdgeIdx.map(() => ({ t: Math.random(), speed: 0.12 + Math.random() * 0.18, delay: Math.random() * 2 }))

    // Entrance progress per edge, staggered by distance from center.
    edgeDelay = edges.map(([a, b]) => {
      const mid = nodes[a]!.home.clone().add(nodes[b]!.home).multiplyScalar(0.5)
      return mid.length() * 0.06 + Math.random() * 0.3
    })
  }

  function buildScene() {
    if (!canvasRef.value || !containerRef.value) return

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.autoClear = false

    // Background pass: light mesh gradient rendered full-bleed via its own
    // orthographic scene/camera, drawn first each frame (see `loop()`) so
    // the network scene composites on top of it in the same canvas.
    bgScene = new THREE.Scene()
    bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const rect = containerRef.value.getBoundingClientRect()
    bgUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerVel: { value: 0 },
      uResolution: { value: new THREE.Vector2(Math.max(rect.width, 1), Math.max(rect.height, 1)) },
      uEntrance: { value: 0 },
      uScrollFade: { value: 0 },
      uNavyDeep: { value: NAVY_DEEP_BG.clone() },
      uNavy: { value: NAVY_BG.clone() },
      uNavyLight: { value: NAVY_LIGHT_BG.clone() },
      uYellow: { value: YELLOW_BG.clone() },
      uYellowSoft: { value: YELLOW_SOFT_BG.clone() },
      uPaper: { value: PAPER_BG.clone() }
    }
    bgMaterial = new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      vertexShader: liquidBgVertexShader,
      fragmentShader: liquidBgFragmentShader,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    })
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial))

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf3f6f8, 0.055)
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)

    networkGroup = new THREE.Group()
    scene.add(networkGroup)

    driftGroup = new THREE.Group()
    scene.add(driftGroup)
    buildDriftShapes(driftGroup)

    buildNetwork(networkGroup, renderer, scene)

    layoutScene()
  }

  /**
   * Sizes the renderer/camera to the container's actual pixel size. Node
   * placement itself doesn't need re-deriving per resize (BANDS/spread are
   * already wide enough to cover every supported aspect ratio — see the
   * comment on BANDS above), only the camera projection does.
   */
  function layoutScene() {
    if (!camera || !renderer || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function playEntrance() {
    entranceProgress = 0
    entranceStart = performance.now()
  }

  function fit() {
    if (!renderer || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    renderer.setSize(w, h, false)
    bgUniforms?.uResolution.value.set(w, h)
    layoutScene()
  }

  function updatePointerWorld() {
    if (!camera) return
    const vec = new THREE.Vector3(pointerX, pointerY, 0.5)
    vec.unproject(camera)
    const dir = vec.sub(camera.position).normalize()
    const dist = (0 - camera.position.z) / dir.z
    pointerWorld.copy(camera.position).add(dir.multiplyScalar(dist))
  }

  function tick(dt: number) {
    if (!networkGroup || !camera || !nodeGeo || !nodeMat || !edgeGeo || !pulseGeo) return
    elapsed += dt

    if (entranceStart !== undefined) {
      const t = Math.min((performance.now() - entranceStart) / 1100, 1)
      entranceProgress = t >= 1 ? 1 : easeOutCubic(t)
      if (t >= 1) entranceStart = undefined
    }

    // ---------- Drift shapes ----------
    for (const drift of driftMeshes) {
      drift.mesh.rotation.x += dt * drift.speed
      drift.mesh.rotation.y += dt * drift.speed * 0.7
      drift.mesh.position.y += Math.sin(elapsed * 0.08 + drift.phase) * dt * 0.15
    }

    // ---------- Data packets ----------
    for (const pkt of packets) {
      if (elapsed < pkt.startDelay) continue
      pkt.mesh.visible = true
      if (pkt.path.length < 2) {
        respawnPacket(pkt)
        continue
      }
      pkt.segT += dt * pkt.speed
      if (pkt.segT >= 1) {
        pkt.segT = 0
        pkt.segIdx++
        if (pkt.segIdx >= pkt.path.length - 1) {
          respawnPacket(pkt)
          continue
        }
      }
      const fromNode = nodes[pkt.path[pkt.segIdx]!]
      const toNode = nodes[pkt.path[pkt.segIdx + 1]!]
      if (fromNode && toNode) {
        pkt.mesh.position.lerpVectors(fromNode.pos, toNode.pos, pkt.segT)
        pkt.mesh.rotation.x += dt * 2.4
        pkt.mesh.rotation.y += dt * 1.8
      }
    }

    // ---------- Node positions (chaos-to-order entrance + idle wobble) ----------
    updatePointerWorld()
    const posAttr = nodeGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!
      const localDelay = n.home.length() * 0.045
      const localT = Math.max(0, Math.min(1, (elapsed >= 0 ? entranceElapsed() - localDelay : 0) / 1.4))
      const e = n.hub ? easeOutBack(localT) : easeOutCubic(localT)

      const wobbleX = Math.sin(elapsed * 0.18 + n.phase) * (0.08 + n.band * 0.02)
      const wobbleY = Math.cos(elapsed * 0.14 + n.phase * 1.3) * (0.06 + n.band * 0.02)
      const wobbleZ = Math.sin(elapsed * 0.11 + n.phase * 0.7) * (0.35 + n.band * 0.15)

      let tx = n.home.x + wobbleX
      let ty = n.home.y + wobbleY
      const tz = n.home.z + wobbleZ

      if (n.band === 0) {
        const dx = pointerWorld.x - n.home.x
        const dy = pointerWorld.y - n.home.y
        const d2 = dx * dx + dy * dy
        const pull = Math.exp(-d2 / 6.0) * 0.5
        tx += dx * pull * 0.15
        ty += dy * pull * 0.15
      }

      n.pos.x += (tx - n.pos.x) * e * 0.12 + (tx - n.pos.x) * (1 - e) * 0.02
      n.pos.y += (ty - n.pos.y) * e * 0.12 + (ty - n.pos.y) * (1 - e) * 0.02
      n.pos.z += (tz - n.pos.z) * 0.05

      posAttr.array[i * 3] = n.pos.x
      posAttr.array[i * 3 + 1] = n.pos.y
      posAttr.array[i * 3 + 2] = n.pos.z
    }
    posAttr.needsUpdate = true
    nodeMat.uniforms.uTime!.value = elapsed

    // ---------- Hub spheres: position sync, spin, entrance scale-pop ----------
    for (const hub of hubMeshes) {
      hub.mesh.position.copy(hub.node.pos)
      const hSpin = hub.spinSpeed * (1 + scrollProgress * 3)
      hub.mesh.rotation.y += dt * hSpin
      hub.mesh.rotation.x += dt * hSpin * 0.6
      const hLocalDelay = hub.node.home.length() * 0.045
      const hLocalT = Math.max(0, Math.min(1, (entranceElapsed() - hLocalDelay) / 1.4))
      const hScaleT = Math.max(0.001, easeOutBack(hLocalT))
      hub.mesh.scale.setScalar(hub.baseScale * hScaleT)
    }

    // ---------- Orbit rings ----------
    for (const orbit of orbitRings) {
      orbit.group.position.copy(orbit.host.node.pos)
      orbit.group.rotation.z += dt * orbit.spinSpeed
      for (const sat of orbit.satellites) {
        const ang = elapsed * orbit.spinSpeed * 1.3 + sat.offset
        const localPos = new THREE.Vector3(Math.cos(ang) * orbit.radius, Math.sin(ang) * orbit.radius, 0)
        localPos.applyEuler(orbit.ringTilt)
        sat.mesh.position.copy(localPos)
      }
    }

    // ---------- Edges ----------
    const ePosAttr = edgeGeo.attributes.position as THREE.BufferAttribute
    const eColAttr = edgeGeo.attributes.color as THREE.BufferAttribute
    for (let k = 0; k < edges.length; k++) {
      const [ai, bi] = edges[k]!
      const a = nodes[ai]!
      const b = nodes[bi]!
      const localT = Math.max(0, Math.min(1, (entranceElapsed() - edgeDelay[k]!) / 0.9))
      const alpha = easeOutCubic(localT)
      ePosAttr.array[k * 6] = a.pos.x
      ePosAttr.array[k * 6 + 1] = a.pos.y
      ePosAttr.array[k * 6 + 2] = a.pos.z
      if (alpha <= 0.001) {
        ePosAttr.array[k * 6 + 3] = a.pos.x
        ePosAttr.array[k * 6 + 4] = a.pos.y
        ePosAttr.array[k * 6 + 5] = a.pos.z
      } else {
        ePosAttr.array[k * 6 + 3] = a.pos.x + (b.pos.x - a.pos.x) * alpha
        ePosAttr.array[k * 6 + 4] = a.pos.y + (b.pos.y - a.pos.y) * alpha
        ePosAttr.array[k * 6 + 5] = a.pos.z + (b.pos.z - a.pos.z) * alpha
      }
      const pulse = 0.35 + 0.35 * Math.sin(elapsed * 0.6 + k * 0.7)
      const baseColor = a.hub || b.hub ? YELLOW_SOFT : NAVY_LIGHT
      const glowMix = baseColor.clone().multiplyScalar(pulse * alpha * 0.9 + 0.15 * alpha)
      eColAttr.array[k * 6] = glowMix.r
      eColAttr.array[k * 6 + 1] = glowMix.g
      eColAttr.array[k * 6 + 2] = glowMix.b
      eColAttr.array[k * 6 + 3] = glowMix.r
      eColAttr.array[k * 6 + 4] = glowMix.g
      eColAttr.array[k * 6 + 5] = glowMix.b
    }
    ePosAttr.needsUpdate = true
    eColAttr.needsUpdate = true

    // ---------- Traveling energy pulses ----------
    const pulsePosAttr = pulseGeo.attributes.position as THREE.BufferAttribute
    for (let p = 0; p < pulseEdgeIdx.length; p++) {
      const [ai, bi] = edges[pulseEdgeIdx[p]!]!
      const a = nodes[ai]!
      const b = nodes[bi]!
      const st = pulseState[p]!
      const edgeAlpha = Math.max(0, Math.min(1, (entranceElapsed() - edgeDelay[pulseEdgeIdx[p]!]!) / 0.9))
      if (edgeAlpha > 0.5 && elapsed > st.delay) {
        st.t = (st.t + dt * st.speed) % 1
        pulsePosAttr.array[p * 3] = a.pos.x + (b.pos.x - a.pos.x) * st.t
        pulsePosAttr.array[p * 3 + 1] = a.pos.y + (b.pos.y - a.pos.y) * st.t
        pulsePosAttr.array[p * 3 + 2] = a.pos.z + (b.pos.z - a.pos.z) * st.t
      } else {
        pulsePosAttr.array[p * 3] = a.pos.x
        pulsePosAttr.array[p * 3 + 1] = a.pos.y
        pulsePosAttr.array[p * 3 + 2] = a.pos.z - 50
      }
    }
    pulsePosAttr.needsUpdate = true

    // ---------- Group rotation: idle drift + cursor parallax + scroll bank ----------
    const autoRotY = Math.sin(elapsed * 0.06) * 0.32
    const autoRotX = Math.sin(elapsed * 0.04 + 1.3) * 0.13
    const targetRotY = autoRotY + pointerX * 0.16 + scrollProgress * 0.5
    const targetRotX = autoRotX - pointerY * 0.1 - scrollProgress * 0.22
    networkGroup.rotation.y += (targetRotY - networkGroup.rotation.y) * 0.025
    networkGroup.rotation.x += (targetRotX - networkGroup.rotation.x) * 0.025
    if (driftGroup) {
      driftGroup.rotation.y = networkGroup.rotation.y * 0.5
      driftGroup.rotation.x = networkGroup.rotation.x * 0.5
    }

    // ---------- Cinematic camera intro ----------
    const camIntroT = Math.min(1, elapsed / CAM_INTRO_DUR)
    const camIntroE = easeOutCubic(camIntroT)
    const introOffsetX = CAM_START_OFFSET.x * (1 - camIntroE)
    const introOffsetY = CAM_START_OFFSET.y * (1 - camIntroE)
    const introOffsetZExtra = CAM_START_OFFSET.z * (1 - camIntroE)
    const camDist = 13 + Math.sin(elapsed * 0.06) * 0.6 + introOffsetZExtra
    camera.position.set(introOffsetX, introOffsetY, camDist)
    camera.lookAt(0, 0, 0)

    // ---------- Liquid background uniforms ----------
    if (bgUniforms) {
      const dx = pointerX - lastPointerX
      const dy = pointerY - lastPointerY
      const instantVelocity = Math.min((Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 0.001)) * 0.2, 1)
      pointerVelocity += (instantVelocity - pointerVelocity) * 0.12
      lastPointerX = pointerX
      lastPointerY = pointerY

      bgUniforms.uTime.value = elapsed
      bgUniforms.uPointer.value.set(pointerX * 1.1, -pointerY * 1.1)
      bgUniforms.uPointerVel.value = pointerVelocity
      bgUniforms.uEntrance.value = Math.min(Math.max(entranceProgress, 0), 1)
      bgUniforms.uScrollFade.value = Math.min(scrollProgress * 1.3, 1)
    }
  }

  // Real elapsed time since playEntrance() fired (not the eased 0-1
  // progress) — the per-node/edge staggered-delay math above needs actual
  // seconds so `localDelay` (in real seconds) compares correctly.
  let entranceRealStart: number | undefined
  function entranceElapsed(): number {
    if (entranceRealStart === undefined) return 0
    return (performance.now() - entranceRealStart) / 1000
  }

  function respawnPacket(p: DataPacket) {
    const startIdx = Math.floor(Math.random() * nodes.length)
    const hops = 3 + Math.floor(Math.random() * 3)
    const path = [startIdx]
    let current = startIdx
    for (let h = 0; h < hops; h++) {
      const neighbors = adjacency[current]
      if (!neighbors || neighbors.length === 0) break
      current = neighbors[Math.floor(Math.random() * neighbors.length)]!
      path.push(current)
    }
    p.path = path
    p.segIdx = 0
    p.segT = 0
  }

  function loop(now: number) {
    if (!running) return
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    tick(dt)
    if (renderer) {
      renderer.clear()
      if (bgScene && bgCamera) renderer.render(bgScene, bgCamera)
      if (scene && camera) renderer.render(scene, camera)
    }
    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    if (!renderer) buildScene()
    running = true
    lastTime = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (rafId !== undefined) cancelAnimationFrame(rafId)
    rafId = undefined
  }

  function setPointer(x: number, y: number) {
    pointerX = x
    pointerY = y
  }

  function setScrollProgress(p: number) {
    scrollProgress = p
  }

  function dispose() {
    stop()
    nodeGeo?.dispose()
    nodeMat?.dispose()
    edgeGeo?.dispose()
    edgeMat?.dispose()
    pulseGeo?.dispose()
    pulseMat?.dispose()
    pulseTexture?.dispose()
    hubMeshGeo?.dispose()
    hubMeshMat?.dispose()
    orbitRingGeo?.dispose()
    orbitRingMat?.dispose()
    orbitDotGeo?.dispose()
    orbitDotMat?.dispose()
    packetGeo?.dispose()
    packetMat?.dispose()
    driftGeos.forEach((g) => g.dispose())
    driftMat?.dispose()
    bgMaterial?.dispose()
    pmremRenderTarget?.dispose()
    renderer?.dispose()

    renderer = undefined
    scene = undefined
    bgScene = undefined
    bgCamera = undefined
    bgMaterial = undefined
    bgUniforms = undefined
    camera = undefined
    networkGroup = undefined
    driftGroup = undefined
    nodes = []
    edges = []
    edgeDelay = []
    hubMeshes = []
    orbitRings = []
    driftMeshes = []
    packets = []
    adjacency = {}
    pulseEdgeIdx = []
    pulseState = []
    driftGeos = []
    keyLight = undefined
    rimLight = undefined
    ambientLight = undefined
    entranceProgress = 0
    entranceStart = undefined
    entranceRealStart = undefined
    pointerVelocity = 0
    lastPointerX = 0
    lastPointerY = 0
    elapsed = 0
  }

  // playEntrance() drives both the eased 0-1 entranceProgress (background
  // fade) and the real-time entranceRealStart (per-node stagger math).
  const originalPlayEntrance = playEntrance
  function playEntranceWrapped() {
    originalPlayEntrance()
    entranceRealStart = performance.now()
  }

  return { start, stop, dispose, fit, playEntrance: playEntranceWrapped, setPointer, setScrollProgress }
}
