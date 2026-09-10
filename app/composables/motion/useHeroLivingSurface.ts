// app/composables/motion/useHeroLivingSurface.ts
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export interface UseHeroLivingSurfaceOptions {
  sectionEl: Ref<HTMLElement | null>
}

// Exact existing PASTI palette values (tailwind.config.ts) — centralized
// here so the shader never diverges from the design system. No new colors.
const COLOR_NAVY_900 = new THREE.Color('#051B28')
const COLOR_NAVY_700 = new THREE.Color('#0B3954')
const COLOR_NAVY_500 = new THREE.Color('#1C5E7C')
const COLOR_PAPER = new THREE.Color('#FFFFFF')
const COLOR_YELLOW_500 = new THREE.Color('#FBBA00')

// Micro simplex noise — reused verbatim from the deleted
// HeroBgThreeNucleusOrigin.vue (itself reused from HeroBgThreeDistortedSphere),
// used here only as fragment-level grain and a small ambient-amplitude
// modulator, never as primary displacement (spec: "silhouette must not be
// defined by noise").
const NOISE_GLSL = `
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

const VERTEX_SHADER = `
${NOISE_GLSL}
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uPointerDirection;
uniform float uPointerStrength;
uniform float uScrollProgress;
uniform float uLayerSeparation;
uniform float uSurfaceTension;
uniform float uBandDepth; // 0 = near, 1 = far — per-mesh constant
uniform float uDeformAmplitude; // per-band displacement scale (near deforms most, far least)
varying float vElevation;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // --- Pointer term: directional, elongated falloff, not radial rings.
  // Near band gets full pointer influence; far band barely reacts — this
  // is part of what reads as "near is close to you, far is distant", not
  // just a duplicate layer at lower opacity. ---
  vec2 toPointer = uv - (uPointer * 0.5 + 0.5);
  float dist = length(toPointer);
  float dirBias = max(dot(normalize(toPointer + 1e-5), uPointerDirection), 0.0);
  float pointerFalloff = exp(-dist * 4.0) * (0.4 + 0.6 * dirBias);
  float pointerAmp = pointerFalloff * uPointerStrength * 0.06 * uSurfaceTension * uDeformAmplitude;
  pos.z += pointerAmp;

  // --- Scroll term: broad, low-frequency, larger wavelength than pointer.
  // Frequency/phase still differ per band (far uses a different phase/freq
  // than near) so bands visibly separate — move differently, not in
  // lockstep — as scroll progresses. Amplitude uses uDeformAmplitude (same
  // near=1.0/mid=0.6/far=0.3 scale as the pointer term above), NOT an
  // inverted band-depth mix: near must be the MOST spatially responsive
  // band on scroll too, matching "foreground reacts most, background feels
  // deeper/slower" — a far band that moved more than near (the old
  // mix(0.5,1.0,uBandDepth), which gave far up to 1.0 and near only 0.5)
  // was backwards from the intended depth hierarchy. ---
  float freq = mix(2.2, 1.3, uBandDepth);
  float phase = uScrollProgress * (3.14159 * mix(1.0, 1.6, uBandDepth));
  float scrollWave = sin(uv.x * freq + phase) * cos(uv.y * 1.6 - uBandDepth * 0.8);
  pos.z += scrollWave * uLayerSeparation * 0.12 * uDeformAmplitude;

  // --- Ambient term: slow, continuous, low amplitude, per-band phase offset
  // so bands don't breathe in lockstep. ---
  float ambient = snoise(vec3(uv * 1.5, uTime * 0.05 + uBandDepth * 10.0)) * 0.015 * uSurfaceTension;
  pos.z += ambient;

  vElevation = pos.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const FRAGMENT_SHADER = `
uniform vec3 uColorPaper;
uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorLight;
uniform vec3 uColorAccent;
uniform float uPointerStrength;
uniform float uDepth;
uniform float uBandDepth;
uniform float uBandOpacity;
uniform float uNavyMix;
uniform float uTime;
varying float vElevation;
varying vec2 vUv;

${NOISE_GLSL}

void main() {
  // Paper-dominant base: the Hero's existing background is white/paper, and
  // the foreground (navy headline, navy/paper CTAs) is locked and must not
  // read as recolored. So navy is a STRUCTURAL/DEPTH MODULATION on top of a
  // paper base here, never a fullscreen dark wash — uNavyMix (per-band, see
  // BAND_NAVY_MIX below) caps how far any band can pull away from paper
  // before compositing, which is the real lever on perceived brightness
  // (independent of uBandOpacity, which only controls how much of this
  // band's own gradient shows through to the band behind it).
  vec3 navyGradient = mix(uColorMid, uColorLight, smoothstep(0.0, 1.0, vUv.y + uDepth * 0.2));
  navyGradient = mix(navyGradient, uColorDeep, uBandDepth * 0.3);
  navyGradient = mix(navyGradient, uColorLight, clamp(vElevation * 2.5 + 0.15, 0.0, 0.35) * (1.0 - uBandDepth * 0.5));

  vec3 base = mix(uColorPaper, navyGradient, uNavyMix);

  // Thin fresnel-like edge falloff (screen-space approximation via uv distance to center).
  float edge = smoothstep(0.15, 0.55, length(vUv - 0.5));
  base = mix(base, uColorLight, edge * 0.04 * (1.0 - uBandDepth * 0.4) * uNavyMix);

  // Static-frequency micro grain, kept very subtle against the paper base.
  float grain = snoise(vec3(vUv * 220.0, 1.0)) * 0.012;
  base += grain;

  // Restrained yellow accent, gated by high pointer velocity only, strongest
  // on the near band (the band closest to the cursor's implied depth).
  float accentGate = smoothstep(0.6, 1.0, uPointerStrength) * (1.0 - uBandDepth * 0.7);
  base = mix(base, uColorAccent, accentGate * 0.035);

  gl_FragColor = vec4(base, uBandOpacity);
}
`

interface Band {
  mesh: THREE.Mesh
  geometry: THREE.PlaneGeometry
  material: THREE.ShaderMaterial
  depth: number // world-space Z offset
  depthT: number // 0 (near) .. 1 (far), drives uBandDepth + per-band scroll response
}

// near/mid/far — deliberately unequal spacing (near band closest to camera,
// far band furthest) so perspective scaling between bands is visible, not
// just three evenly-spaced translucent duplicates.
const BAND_DEPTHS_T = [0, 0.55, 1] as const
// Per-band base opacity: alpha-composited back-to-front so all three bands
// visually coexist (fix for the "opaque planes occlude each other" issue).
// Kept deliberately low across all three bands — this is NOT the lever for
// "near feels more present" (that's BAND_NAVY_MIX below); it only controls
// how much of a band's own gradient shows through to the band behind it,
// so three stacked bands never compound into a dark wash over the Hero.
const BAND_BASE_OPACITY = [0.55, 0.4, 0.3] as const
// Per-band navy mix: how far this band's fragment color is pulled from the
// paper base toward the navy gradient (see FRAGMENT_SHADER's uNavyMix). This
// is the real brightness lever — kept low on every band (max 0.22 on the
// near band) so the composited Hero background stays paper-dominant and the
// locked navy headline keeps full contrast against it, never reading as a
// fullscreen navy wash. Near is the most present structurally, far the most
// atmospheric/faint — same ordering as before, just at a brightness budget
// that preserves the existing Hero's perceived brightness.
const BAND_NAVY_MIX = [0.22, 0.14, 0.08] as const
// Per-band deformation amplitude multiplier — see Task-2-review fix #2:
// NEAR must be the most spatially responsive band (strongest reaction to
// both pointer AND scroll), far the most restrained, so depth reads as
// "foreground reacts most, background feels deeper/slower" rather than the
// reverse. Reused for both the pointer term (already correct pre-review)
// and now also the scroll term (previously inverted — see VERTEX_SHADER).
const BAND_DEFORM_AMPLITUDE = [1.0, 0.6, 0.3] as const

export function useHeroLivingSurface(
  canvasEl: Ref<HTMLCanvasElement | null>,
  options: UseHeroLivingSurfaceOptions
): () => void {
  if (!import.meta.client || !canvasEl.value) return () => {}

  const canvas = canvasEl.value
  const parent = canvas.parentElement!
  const sectionEl = options.sectionEl.value ?? parent.closest('section') ?? parent

  // --- Responsive tier: must be re-evaluated live, not captured once at
  // setup, since the viewport can cross the mobile/tablet/desktop
  // breakpoints during an ordinary window resize without a remount. All
  // tier-dependent behavior (pointer listener attach/removal, DPR cap,
  // pointer influence/maxSpeed, geometry subdivision) is re-derived from
  // `currentTier` inside the resize handler below, never read once and
  // frozen in a `const`. ---
  type Tier = 'mobile' | 'tablet' | 'desktop'
  function getTier(): Tier {
    if (window.matchMedia('(max-width: 767px)').matches) return 'mobile'
    if (isTabletViewport()) return 'tablet'
    return 'desktop'
  }
  let currentTier: Tier = getTier()

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches

  // Hoisted early so every handler below (registered before its own later
  // usage sites) can close over these without a forward-reference.
  let scrollProgress = 0
  const surfaceTensionProxy = { value: 0 }
  let scrollTriggerInstance: ScrollTrigger | null = null

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  const CAMERA_REST_Z = 5
  camera.position.set(0, 0, CAMERA_REST_Z)

  // Max possible per-uniform displacement magnitudes, matching the shader's
  // own coefficients above — used to compute dynamic overscan analytically
  // rather than guessing a fixed percentage (spec: Dynamic overscan).
  // Both the pointer term (pointerAmp's 0.06 coefficient) and the scroll
  // term (scrollWave's 0.12 coefficient) are now scaled by the SAME
  // uDeformAmplitude per band (near=1.0/mid=0.6/far=0.3 — see the fixed
  // scroll term above), so both max out on the near band, not split across
  // two different bands as before. Kept as named constants here so overscan
  // math and the shader can't silently drift apart if either is tuned later.
  const MAX_POINTER_DISPLACEMENT = 0.06 // uDeformAmplitude maxes out at 1.0 (near band)
  const MAX_SCROLL_DISPLACEMENT = 0.12 // uDeformAmplitude maxes out at 1.0 (near band); uLayerSeparation is a pure scrollProgress signal (maxing at 1.0 for every band), so this is the shader's true max scroll displacement per band once scaled by deformAmplitude below — was mix(0.5,1.0,uBandDepth) maxing on far, then briefly a depth-weighted uLayerSeparation compressing the near:far ratio; both fixed to match the corrected scroll term
  const MAX_CAMERA_Z_SHIFT = 0.6 // see uCameraProgress camera dolly below

  function segmentsFor(tier: Tier): number {
    return tier === 'mobile' ? 24 : tier === 'tablet' ? 40 : 64
  }

  const bands: Band[] = []
  // Tracks the segment count bands were last built with, so a tier change
  // that doesn't change segment count (there isn't one currently, since
  // each tier maps to a distinct value, but this guards against a future
  // tuning change collapsing two tiers to the same count) doesn't trigger
  // an unnecessary rebuild — see `applyTier` below, which only calls
  // `createBands()` when `segmentsFor(tier)` actually differs from this.
  let builtSegments = -1

  function createBands(segments: number) {
    for (const b of bands) {
      scene.remove(b.mesh)
      b.geometry.dispose()
      b.material.dispose()
    }
    bands.length = 0
    builtSegments = segments

    BAND_DEPTHS_T.forEach((depthT, i) => {
      const geometry = new THREE.PlaneGeometry(1, 1, segments, segments)
      // transparent + depthWrite:false is the fix for bands occluding each
      // other: with three opaque planes, the near plane fully hides mid/far
      // regardless of z-order. Alpha blending with depthWrite disabled lets
      // all three composite back-to-front (render order below) so the
      // viewer genuinely sees three coexisting depth layers, not one.
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uPointerDirection: { value: new THREE.Vector2(0, 0) },
          uPointerStrength: { value: 0 },
          uScrollProgress: { value: 0 },
          uLayerSeparation: { value: 0 },
          uSurfaceTension: { value: 0 },
          uBandDepth: { value: depthT },
          uDepth: { value: depthT },
          uBandOpacity: { value: BAND_BASE_OPACITY[i] },
          uDeformAmplitude: { value: BAND_DEFORM_AMPLITUDE[i] },
          uNavyMix: { value: BAND_NAVY_MIX[i] },
          uColorPaper: { value: COLOR_PAPER },
          uColorDeep: { value: COLOR_NAVY_900 },
          uColorMid: { value: COLOR_NAVY_700 },
          uColorLight: { value: COLOR_NAVY_500 },
          uColorAccent: { value: COLOR_YELLOW_500 }
        }
      })
      const mesh = new THREE.Mesh(geometry, material)
      // near = closest to camera (largest Z, i.e. least negative), far =
      // furthest back. Unequal spacing (see BAND_DEPTHS_T) so perspective
      // scale differs visibly between bands.
      const worldZ = -depthT * 1.6
      mesh.position.z = worldZ
      // Explicit back-to-front render order (far renders first) so alpha
      // blending composites correctly regardless of Three.js's default
      // transparent-object sort, which is a supplementary safeguard here.
      mesh.renderOrder = BAND_DEPTHS_T.length - i
      scene.add(mesh)
      bands.push({ mesh, geometry, material, depth: worldZ, depthT })
    })
  }
  // Initial build at the current tier's segment count. `applyTier` below
  // (called once at setup, further down) will see `segmentsFor(currentTier)
  // === builtSegments` and correctly skip rebuilding here — this call exists
  // only so `bands` is populated before `fitBands()`/`applyTier` need it.
  createBands(segmentsFor(currentTier))

  // --- Dynamic overscan: fit each band's plane to its own frustum at its
  // depth, plus displacement/camera budgets, so no edge is ever exposed. ---
  function fitBands() {
    const { clientWidth, clientHeight } = parent
    if (clientWidth === 0 || clientHeight === 0) return
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()

    const vFovRad = (camera.fov * Math.PI) / 180

    for (const band of bands) {
      // Distance from camera to this band's plane.
      const distance = camera.position.z - band.depth
      const frustumHeight = 2 * Math.tan(vFovRad / 2) * distance
      const frustumWidth = frustumHeight * camera.aspect

      // Displacement/camera budgets converted to world units at this depth,
      // plus a small fixed safety margin — analytically sized, not eyeballed.
      // Uses this band's own uDeformAmplitude for BOTH the pointer and
      // scroll budget (matching the corrected VERTEX_SHADER, where both
      // terms now share the same near=1.0/mid=0.6/far=0.3 amplitude scale)
      // so each band gets an accurately sized overscan rather than a shared
      // worst case — and, since near is now the largest-amplitude band on
      // both axes, near also gets the largest overscan budget, correctly
      // reflecting that it's the band with the most possible displacement.
      const deformAmplitude = BAND_DEFORM_AMPLITUDE[BAND_DEPTHS_T.indexOf(band.depthT as typeof BAND_DEPTHS_T[number])] ?? 1
      const displacementBudget =
        (MAX_POINTER_DISPLACEMENT + MAX_SCROLL_DISPLACEMENT) * deformAmplitude + MAX_CAMERA_Z_SHIFT
      const safetyMargin = 0.15

      const width = frustumWidth + (displacementBudget + safetyMargin) * 2
      const height = frustumHeight + (displacementBudget + safetyMargin) * 2

      band.mesh.scale.set(width, height, 1)
    }
  }

  function dprFor(tier: Tier): number {
    return tier === 'mobile' ? 1 : tier === 'tablet' ? 1.5 : Math.min(window.devicePixelRatio, 2)
  }

  // --- Pointer wiring (Task 1's composable). Declared before `applyTier`/
  // `resize` below since both need to attach/detach it live as the tier
  // changes — `maxSpeed` is re-set per tier via the options object's
  // mutable fields rather than recreating the composable instance, so
  // there's exactly one `usePointerVelocity` instance for this scene's
  // whole lifetime (no duplicate listeners from ever calling it twice). ---
  const sectionRef = ref<HTMLElement | null>(sectionEl as HTMLElement)
  const pointerOptions = { dampingSpeed: 6, maxSpeed: currentTier === 'tablet' ? 6 : 4 }
  const pointer = usePointerVelocity(sectionRef, pointerOptions)

  // --- Applies every tier-dependent behavior for `tier`: DPR, pointer
  // listener attach/detach, pointer maxSpeed, and geometry subdivision
  // (rebuilt only when segmentsFor(tier) actually differs from what bands
  // were last built with — never on every resize). Called once at setup
  // and again only when resize() below detects the tier has actually
  // changed, so crossing breakpoints mid-session updates everything live
  // without duplicating listeners or rebuilding geometry needlessly.
  //
  // Returns whether a geometry rebuild happened, so the caller (resize(),
  // and the initial setup call further down) can resync uniforms on the
  // freshly-created bands afterward. This function itself does NOT call
  // renderFrame() — it's declared and first invoked before `renderFrame`
  // exists further down in this file. The resync happens at each call site
  // instead, once `renderFrame` is available (see the tier-change branch
  // in `resize()` below). ---
  function applyTier(tier: Tier): boolean {
    const { clientWidth, clientHeight } = parent
    if (clientWidth > 0 && clientHeight > 0) {
      renderer.setPixelRatio(dprFor(tier))
      renderer.setSize(clientWidth, clientHeight)
    }

    const segments = segmentsFor(tier)
    let rebuilt = false
    if (segments !== builtSegments) {
      createBands(segments) // disposes the old geometry/material internally
      rebuilt = true
    }

    pointerOptions.maxSpeed = tier === 'tablet' ? 6 : 4
    const pointerShouldRun = tier !== 'mobile' && !reducedMotion
    // pointer.start()/stop() are both idempotent-safe (start() no-ops if
    // already attached to the same element; stop() no-ops if not attached)
    // so calling start() every time the tier stays non-mobile, or stop()
    // every time it's mobile, never creates a duplicate listener.
    if (pointerShouldRun) {
      pointer.start()
    } else {
      pointer.stop()
    }

    fitBands()
    return rebuilt
  }

  // `resize` is declared as a mutable `let` (a no-op placeholder for now)
  // and its real body assigned further down, right after `renderFrame`
  // exists — its tier-change branch needs `renderFrame()` to resync
  // freshly-rebuilt bands' uniforms under reduced motion. See the resync
  // comment at that assignment.
  let resize: () => void = () => {}

  applyTier(currentTier) // initial tier-dependent setup (DPR, pointer attach, fitBands) — bands are fresh from createBands() above so there is nothing to resync yet at this point
  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(parent)
  resizeObserver.observe(sectionEl)

  // --- RAF lifecycle: a single loop that is genuinely started and stopped
  // (not left running with an early-return body) by intersection/tab
  // visibility/reduced-motion state. `raf` is 0 whenever no loop is
  // scheduled, which doubles as the "is running" flag. ---
  let raf = 0
  let elapsed = 0
  const clock = new THREE.Clock()

  // Camera dolly driven by scroll (bounded by MAX_CAMERA_Z_SHIFT above).
  function cameraProgressZ(p: number): number {
    return CAMERA_REST_Z - THREE.MathUtils.smoothstep(p, 0, 1) * MAX_CAMERA_Z_SHIFT
  }

  function renderFrame() {
    const dt = Math.min(clock.getDelta(), 1 / 30)
    elapsed += dt // single accumulator — clock.getDelta() is the only clock read per frame

    if (!reducedMotion) pointer.tick(dt)

    camera.position.z = cameraProgressZ(scrollProgress)

    for (const band of bands) {
      const u = band.material.uniforms
      u.uTime!.value = elapsed
      u.uScrollProgress!.value = scrollProgress
      u.uLayerSeparation!.value = scrollProgress
      u.uDepth!.value = band.depthT + scrollProgress * 0.15
      u.uSurfaceTension!.value = surfaceTensionProxy.value
      if (!reducedMotion) {
        u.uPointer!.value.set(pointer.state.position.x, pointer.state.position.y)
        u.uPointerDirection!.value.set(pointer.state.direction.x, pointer.state.direction.y)
        u.uPointerStrength!.value = pointer.state.strength
      }
    }

    renderer.render(scene, camera)
  }

  // Real body of `resize` (declared as a no-op `let` above, before
  // `renderFrame` existed) — assigned here now that `renderFrame` is
  // available, since a tier change's geometry rebuild needs it to resync
  // uniforms on the freshly-created bands. Fix: under reduced motion there
  // is no continuous RAF loop to pick up the new bands' default (zeroed)
  // uniforms on its own, so a rebuild must explicitly push one resolved
  // frame afterward — never restarting the continuous loop.
  resize = () => {
    const nextTier = getTier()
    if (nextTier !== currentTier) {
      currentTier = nextTier
      const rebuilt = applyTier(currentTier) // covers DPR + geometry + pointer attach/detach + fitBands
      if (rebuilt && reducedMotion) {
        // New bands' materials start with default (zeroed) uniforms; with
        // no RAF loop running under reduced motion, nothing else will ever
        // push the current resolved surface-tension/scroll state into them.
        // One renderFrame() call resyncs every uniform (uTime, uScrollProgress,
        // uLayerSeparation, uDepth, uSurfaceTension, and — since reducedMotion
        // is true — it skips the pointer uniforms, which is correct, they
        // stay at rest) from the existing scrollProgress/surfaceTensionProxy/
        // elapsed state, without scheduling any further frames.
        renderFrame()
      }
    } else {
      const { clientWidth, clientHeight } = parent
      if (clientWidth > 0 && clientHeight > 0) {
        renderer.setPixelRatio(dprFor(currentTier))
        renderer.setSize(clientWidth, clientHeight)
      }
      fitBands()
    }
    pointer.updateBounds()
  }

  function tick() {
    raf = requestAnimationFrame(tick)
    renderFrame()
  }

  function startLoop() {
    if (raf !== 0) return // already running — never schedule a duplicate loop
    clock.start()
    raf = requestAnimationFrame(tick)
  }

  function stopLoop() {
    if (raf === 0) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  // --- Visibility / intersection pausing: genuinely stop/start the loop,
  // don't just skip rendering inside it. ---
  let isVisible = true
  let isTabVisible = document.visibilityState === 'visible'
  function syncLoopState() {
    const shouldRun = isVisible && isTabVisible && !reducedMotion
    if (shouldRun) startLoop()
    else stopLoop()
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      syncLoopState()
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(sectionEl)

  const handleVisibilityChange = () => {
    isTabVisible = document.visibilityState === 'visible'
    syncLoopState()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // --- Live reduced-motion listener (spec: not a one-time check). Reduced
  // motion means: no continuous RAF loop, pointer deformation disabled,
  // scroll-depth clamped small, one resolved static frame rendered instead
  // of continuous animation. Toggling it live cleanly switches between the
  // animated and static execution paths without a remount. ---
  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      pointer.stop()
      surfaceTensionProxy.value = 0.35
      scrollProgress = Math.min(scrollProgress, 0.2)
      stopLoop()
      renderFrame() // one resolved static frame, no further RAF scheduling
    } else {
      if (currentTier !== 'mobile') pointer.start()
      scrollProgress = scrollTriggerInstance?.progress ?? scrollProgress
      renderFrame()
      syncLoopState()
    }
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  // --- Entry choreography: ramp uSurfaceTension in sync with introReady,
  // timed off the existing motionDuration.slow token (Hero's own reveal
  // duration) rather than hooking into Hero.vue's timeline object. ---
  const { introReady } = useIntroReady()
  let tensionTween: gsap.core.Tween | null = null
  const stopIntroWatch = watch(
    introReady,
    (ready) => {
      if (!ready) return
      if (reducedMotion) {
        surfaceTensionProxy.value = 0.35
        renderFrame()
        return
      }
      tensionTween = gsap.to(surfaceTensionProxy, {
        value: 0.35,
        duration: motionDuration.slow,
        ease: motionEase.standard
      })
    },
    { immediate: true }
  )

  // --- Scroll: non-pinned ScrollTrigger scoped to the Hero section. ---
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      scrollProgress = reducedMotion ? Math.min(self.progress, 0.2) : self.progress
      if (reducedMotion) renderFrame() // reduced motion: update the static frame on scroll, no RAF loop
    }
  })

  // --- Start: either the continuous loop, or one static frame under
  // reduced motion. No per-frame allocation anywhere above: all scratch
  // objects are created once at setup; uniforms are mutated in place. ---
  if (reducedMotion) {
    renderFrame()
  } else {
    syncLoopState()
  }

  return () => {
    stopLoop()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    pointer.stop()
    stopIntroWatch()
    tensionTween?.kill()
    scrollTriggerInstance?.kill()
    for (const band of bands) {
      band.geometry.dispose()
      band.material.dispose()
    }
    renderer.dispose()
    // renderer.dispose() only frees Three.js-side resources — it does not
    // release the underlying WebGL context back to the browser/GPU driver.
    // Without forceContextLoss(), every remount (HMR during development,
    // or any future SPA navigation back to this component) leaks a WebGL
    // context; browsers cap the number of live contexts, and once that cap
    // is hit the next context creation is silently dropped by the driver
    // (surfaces as "WebGL: CONTEXT_LOST_WEBGL" / a D3D11 allocation error
    // on Windows/ANGLE), leaving the canvas blank with no error the user
    // can act on. This call actually returns the context to the pool.
    renderer.forceContextLoss()
  }
}
