<script setup lang="ts">
// 3D — Refined, pinned version of the "dolly through frames" wire grid.
// Quality pass over HeroBgThreeWireGridDollyReveal: (1) the Hero section
// now pins in place (ScrollTrigger pin: true) for two viewport-heights of
// scroll — the header stays put, untouched, and the page genuinely holds
// on the Hero while the dolly plays out, only releasing to the section
// below once the camera reaches the final frame; (2) real exponential fog
// (THREE.FogExp2) replaces flat per-frame opacity falloff, so distant
// frames dissolve into the background atmospherically instead of just
// getting fainter in a straight line; (3) frames are drafting-style
// corner brackets (four L-shaped corners) instead of full rectangles —
// reads as a precise architectural viewfinder rather than a picture-frame
// hallway, and leaves the frame interiors clean; (4) the nearest frame
// carries a soft yellow corner glow (a second, larger additive-blended
// bracket) so the "gate" the camera is about to pass through always reads
// as the focal point; (5) thin floor + ceiling rails (not just a floor
// grid) so the hallway reads as a fully enclosed volume, reinforcing the
// dolly-through depth.
//
// Ornamentation pass — the plain hallway read as too bare, so four
// restrained (still architectural, not noisy) accents were added: (6) a
// diagonal brace on every third frame, alternating corners, breaking the
// pure-rectilinear rhythm without turning into clutter; (7) small
// technical-drawing "tick" annotations (a short leader line + dot, like a
// dimension callout) scattered at a handful of fixed points along the
// hallway walls; (8) a field of faint drifting motes between the frames
// for depth/parallax, slowly cycling forward as scroll advances rather
// than looping on a timer; (9) a slow pulse on the focal frame's glow,
// tied to a gentle repeating GSAP tween so the "gate" feels alive even
// when the user pauses mid-scroll.
//
// Border/viewport-edge pass, v2 — the first pass (a full 4-side SVG
// rectangle "drawing itself" plus a light sweep around it) read as a
// generic UI/template border once built, so it was replaced entirely:
// (10) four corner registration marks (percentage-based SVG, viewBox
// 0-100) styled like print crop marks / a professional camera
// viewfinder — deliberately NOT a frame that encloses the headline, just
// four independent corner ticks that draw themselves in on a slight
// stagger (top-left first, accented yellow as the "primary" mark;
// the other three trail behind in navy); (11) a running kicker label
// bottom-left carrying real brand copy ("PASTI — Technology. Creativity.
// Impact.") plus a live depth readout (the camera's world-space Z
// position through the hallway, formatted like rangefinder telemetry)
// styled off the existing `eyebrow` type scale so it reads as authored
// Hero copy, not a generated HUD widget; (12) the same vignette + tiny
// RGB-channel offset (cheap chromatic aberration via two tinted inset
// box-shadows) arrival cue as before, silent until the final ~25% of
// scroll progress and landing at full strength exactly as the camera
// reaches the last frame — a cinematic "arrival" cue, not a constant one.
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

// pathLength="100" on the border <rect> makes stroke-dasharray/dashoffset
// a plain 0-100 percentage instead of a computed perimeter constant.
const borderProgress = ref(0)
const arrivalIntensity = ref(0)

// Four corner registration marks (viewBox is 0-100 in both axes, so these
// are percentages, not pixels — stays crisp at any Hero size). Each has
// its own staggered reveal so top-left leads and bottom-right trails
// slightly, avoiding the "four identical elements popping at once" look.
const MARK_INSET = 3
const markLength = 4.5
const corners = [
  { id: 'tl', x: MARK_INSET, y: MARK_INSET, dx: 1, dy: 1, accent: true, delay: 0 },
  { id: 'tr', x: 100 - MARK_INSET, y: MARK_INSET, dx: -1, dy: 1, accent: false, delay: 0.04 },
  { id: 'bl', x: MARK_INSET, y: 100 - MARK_INSET, dx: 1, dy: -1, accent: false, delay: 0.08 },
  { id: 'br', x: 100 - MARK_INSET, y: 100 - MARK_INSET, dx: -1, dy: -1, accent: false, delay: 0.12 }
].map((c) => ({
  ...c,
  reveal: computed(() => Math.min(Math.max(borderProgress.value * 1.3 - c.delay, 0), 1))
}))

// Live "depth" readout in the running label — the camera's world-space Z
// position through the hallway, formatted like a rangefinder/telemetry
// value rather than a plain percentage, reinforcing the precision-
// instrument read established by the corner marks and tick annotations.
const depthReadout = ref('Z 000.0M')

function buildCornerBrackets(width: number, height: number, z: number, armLength: number) {
  const hw = width / 2
  const hh = height / 2
  const corners: [number, number, number, number][] = [
    [-hw, -hh, 1, 1],
    [hw, -hh, -1, 1],
    [hw, hh, -1, -1],
    [-hw, hh, 1, -1]
  ]
  const points: THREE.Vector3[] = []
  for (const [cx, cy, dx, dy] of corners) {
    points.push(new THREE.Vector3(cx, cy, z), new THREE.Vector3(cx + armLength * dx, cy, z))
    points.push(new THREE.Vector3(cx, cy, z), new THREE.Vector3(cx, cy + armLength * dy, z))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

function buildRail(width: number, y: number, z0: number, z1: number, divisions: number) {
  const points: THREE.Vector3[] = []
  const hw = width / 2
  points.push(new THREE.Vector3(-hw, y, z0), new THREE.Vector3(-hw, y, z1))
  points.push(new THREE.Vector3(hw, y, z0), new THREE.Vector3(hw, y, z1))
  for (let i = 0; i <= divisions; i++) {
    const z = z0 + ((z1 - z0) * i) / divisions
    points.push(new THREE.Vector3(-hw, y, z), new THREE.Vector3(hw, y, z))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

// A single diagonal brace across one corner of a frame — breaks the
// pure-rectilinear rhythm on select frames only (every third), like a
// structural gusset in a real drafted truss rather than decoration for
// its own sake.
function buildDiagonalBrace(width: number, height: number, z: number, corner: 1 | -1) {
  const hw = (width / 2) * 0.55
  const hh = (height / 2) * 0.55
  const points =
    corner === 1
      ? [new THREE.Vector3(-hw, -hh, z), new THREE.Vector3(hw * 0.4, hh * 0.4, z)]
      : [new THREE.Vector3(hw, hh, z), new THREE.Vector3(-hw * 0.4, -hh * 0.4, z)]
  return new THREE.BufferGeometry().setFromPoints(points)
}

// A short leader line + dot, like a dimension/callout mark on a technical
// drawing — cheap ornamentation that reinforces the "precision drafting"
// read rather than adding visual noise.
function buildTickMark(x: number, y: number, z: number, direction: 1 | -1) {
  const legLength = 0.35
  const points = [
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(x + legLength * direction, y + legLength * 0.6, z)
  ]
  return new THREE.BufferGeometry().setFromPoints(points)
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
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  const cameraStart = new THREE.Vector3(0, 0.4, 4)
  const cameraEnd = new THREE.Vector3(0, 0.1, -22)
  camera.position.copy(cameraStart)
  camera.lookAt(0, 0, -10)

  // Darker, more saturated navy than the brand's usual #0B3954 — against
  // the light paper background the lines need real weight to read as a
  // deliberate architectural drawing rather than a faint watermark.
  const navy = new THREE.Color('#071F2E')
  const yellow = new THREE.Color('#FBBA00')
  const paper = new THREE.Color('#F7F3EC')

  // Fog dissolves distant frames into the page background atmospherically
  // instead of a flat opacity ramp — density lowered from the initial pass
  // so frames stay legible much further down the hallway before fading.
  scene.fog = new THREE.FogExp2(paper.getHex(), 0.022)

  const frameGroup = new THREE.Group()
  const frameCount = 11
  const frameSpacing = 3.2
  const armLength = 0.9
  let focalFrameGlowMat: THREE.LineBasicMaterial | null = null
  for (let i = 0; i < frameCount; i++) {
    const z = -i * frameSpacing
    const scale = 1 + i * 0.16
    const geo = buildCornerBrackets(4.4 * scale, 2.7 * scale, z, armLength * scale)
    const color = i === 0 ? yellow.clone() : navy.clone().lerp(yellow, 0.16)
    const opacity = i === 0 ? 1 : THREE.MathUtils.lerp(0.95, 0.55, (i - 1) / (frameCount - 2))
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    frameGroup.add(new THREE.LineSegments(geo, mat))

    // A second, very slightly offset copy of every bracket to fake a
    // heavier stroke weight — THREE.LineBasicMaterial ignores linewidth on
    // most platforms, so thickness has to come from stacked geometry
    // instead. Cheap (same buffer, tiny scale bump) and reads as a bolder,
    // more confident line rather than a thin wireframe hairline.
    const boldMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity * 0.6 })
    const boldLine = new THREE.LineSegments(geo, boldMat)
    boldLine.scale.setScalar(1.004)
    frameGroup.add(boldLine)

    // Focal glow on the nearest frame only: a slightly larger, additively
    // blended duplicate so the "gate" the camera is heading through always
    // reads as the bright point of interest.
    let focalGlow: THREE.LineSegments | null = null
    if (i === 0) {
      const glowGeo = buildCornerBrackets(4.4 * scale * 1.08, 2.7 * scale * 1.08, z, armLength * scale * 1.4)
      const glowMat = new THREE.LineBasicMaterial({
        color: yellow,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      })
      focalGlow = new THREE.LineSegments(glowGeo, glowMat)
      frameGroup.add(focalGlow)
    }

    // Diagonal brace on every third frame, alternating which corner it
    // spans — a structural accent so the hallway isn't purely rectilinear
    // brackets repeating in lockstep.
    if (i % 3 === 1) {
      const braceGeo = buildDiagonalBrace(4.4 * scale, 2.7 * scale, z, i % 6 === 1 ? 1 : -1)
      const braceMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity * 0.7 })
      frameGroup.add(new THREE.LineSegments(braceGeo, braceMat))
    }

    if (i === 0) focalFrameGlowMat = focalGlow!.material as THREE.LineBasicMaterial
  }
  scene.add(frameGroup)

  // Scattered technical-drawing tick marks along the hallway walls — fixed
  // world-space positions the camera dollies past, not attached to any one
  // frame, so they read as environment detail rather than UI chrome.
  const tickGroup = new THREE.Group()
  const tickPositions: [number, number, number, 1 | -1][] = [
    [-3.6, 0.6, -2, -1], [3.4, -0.4, -5, 1], [-3.1, 1.1, -9, -1],
    [3.6, 0.3, -13, 1], [-2.8, -0.6, -17, -1], [3.2, 1.2, -21, 1],
    [-3.4, 0.2, -25, -1], [3.0, -0.9, -29, 1]
  ]
  const tickColor = navy.clone().lerp(yellow, 0.25)
  for (const [tx, ty, tz, dir] of tickPositions) {
    const tickGeo = buildTickMark(tx, ty, tz, dir)
    const tickMat = new THREE.LineBasicMaterial({ color: tickColor, transparent: true, opacity: 0.5 })
    tickGroup.add(new THREE.LineSegments(tickGeo, tickMat))

    const dotGeo = new THREE.CircleGeometry(0.03, 10)
    const dotMat = new THREE.MeshBasicMaterial({ color: tickColor, transparent: true, opacity: 0.6 })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(tx, ty, tz)
    tickGroup.add(dot)
  }
  scene.add(tickGroup)

  // Faint drifting motes between the frames — pure depth/parallax
  // ornamentation, no simulation needed: a static point cloud that the
  // camera simply dollies through, brightening slightly near the focal
  // frame via vertex-distance-independent flat opacity.
  const moteCount = 140
  const motePositions = new Float32Array(moteCount * 3)
  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3] = (Math.random() - 0.5) * 12
    motePositions[i * 3 + 1] = Math.random() * 3.8 - 1.3
    motePositions[i * 3 + 2] = -Math.random() * (frameCount * frameSpacing + 4)
  }
  const moteGeo = new THREE.BufferGeometry()
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3))
  const moteMat = new THREE.PointsMaterial({
    color: yellow.clone().lerp(navy, 0.3),
    size: 0.035,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  })
  const motes = new THREE.Points(moteGeo, moteMat)
  scene.add(motes)

  const hallwayEnd = 4
  const hallwayStart = -(frameCount * frameSpacing) - 4
  const floorGeo = buildRail(16, -1.5, hallwayEnd, hallwayStart, 22)
  const floorMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.4 })
  const floor = new THREE.LineSegments(floorGeo, floorMat)
  scene.add(floor)

  const ceilingGeo = buildRail(16, 3.2, hallwayEnd, hallwayStart, 22)
  const ceilingMat = new THREE.LineBasicMaterial({ color: navy, transparent: true, opacity: 0.22 })
  const ceiling = new THREE.LineSegments(ceilingGeo, ceilingMat)
  scene.add(ceiling)

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
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
  }
  parent.addEventListener('pointermove', onPointerMove)

  // Pin the whole Hero section for two viewport-heights of scroll: the
  // header and page stay locked in place while the user's scroll speed
  // directly drives dolly progress (scrub, not a timed autoplay). Once
  // progress reaches 1 the section unpins and normal scrolling to the next
  // section resumes.
  const scrollState = { progress: 0 }
  let scrollTrigger: ScrollTrigger | null = null
  if (!prefersReducedMotion && pinTarget) {
    scrollTrigger = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: `+=${window.innerHeight * 2}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        scrollState.progress = self.progress
        // Corner marks finish drawing slightly ahead of the camera dolly
        // so they always feel "ready" rather than trailing behind it;
        // arrival vignette/chromatic edge only ramps in the last quarter.
        borderProgress.value = Math.min(self.progress * 1.15, 1)
        arrivalIntensity.value = Math.max((self.progress - 0.75) / 0.25, 0)
        const depthMeters = Math.abs(
          THREE.MathUtils.lerp(cameraStart.z, cameraEnd.z, gsap.parseEase('power1.inOut')(self.progress))
        )
        depthReadout.value = `Z ${depthMeters.toFixed(1).padStart(5, '0')}M`
      }
    })
  } else {
    scrollState.progress = 1
  }

  // Slow breathing pulse on the focal frame's glow so the "gate" still
  // feels alive when the user pauses mid-scroll, instead of going static.
  let pulseTween: gsap.core.Tween | null = null
  if (!prefersReducedMotion && focalFrameGlowMat) {
    pulseTween = gsap.to(focalFrameGlowMat, {
      opacity: 0.85,
      duration: 1.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
  }

  const clock = new THREE.Clock()
  const lookTarget = new THREE.Vector3()
  function tick() {
    clock.getElapsedTime()
    const eased = gsap.parseEase('power1.inOut')(scrollState.progress)
    const dolly = new THREE.Vector3().lerpVectors(cameraStart, cameraEnd, eased)
    camera.position.x += (dolly.x + pointer.x * 0.2 - camera.position.x) * 0.08
    camera.position.y += (dolly.y - pointer.y * 0.06 - camera.position.y) * 0.08
    camera.position.z += (dolly.z - camera.position.z) * 0.08
    lookTarget.set(pointer.x * 0.35, -pointer.y * 0.12, camera.position.z - 8)
    camera.lookAt(lookTarget)
    // Motes drift very slowly forward past the camera and wrap back to the
    // far end of the hallway once they pass it — a cheap, non-simulated
    // loop that reads as ambient dust rather than a repeating pattern.
    if (!prefersReducedMotion) {
      const posAttr = moteGeo.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < moteCount; i++) {
        const zIndex = i * 3 + 2
        posAttr.array[zIndex] = (posAttr.array[zIndex] as number) + 0.01
        if ((posAttr.array[zIndex] as number) > camera.position.z + 2) {
          posAttr.array[zIndex] = camera.position.z - frameCount * frameSpacing
        }
      }
      posAttr.needsUpdate = true
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
    pulseTween?.kill()
    frameGroup.children.forEach((child) => {
      const line = child as THREE.LineSegments
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    })
    tickGroup.children.forEach((child) => {
      const mesh = child as THREE.LineSegments | THREE.Mesh
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    })
    moteGeo.dispose()
    moteMat.dispose()
    floorGeo.dispose()
    floorMat.dispose()
    ceilingGeo.dispose()
    ceilingMat.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />

    <!-- Corner registration marks — like a print crop mark / professional
         viewfinder, not a UI rectangle. Each mark draws its two short legs
         independently via SVG stroke-dashoffset, staggered slightly so
         top-left leads and bottom-right trails, all keyed to scroll
         progress. Deliberately not a full frame: marks a viewfinder,
         doesn't enclose the headline. -->
    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g v-for="corner in corners" :key="corner.id" :stroke="corner.accent ? '#FBBA00' : '#071F2E'" fill="none">
        <line
          vector-effect="non-scaling-stroke"
          :x1="corner.x" :y1="corner.y"
          :x2="corner.x + corner.dx * markLength" :y2="corner.y"
          pathLength="1"
          stroke-width="1.5"
          :stroke-dasharray="1"
          :stroke-dashoffset="1 - corner.reveal.value"
          :opacity="corner.accent ? 0.9 : 0.55"
        />
        <line
          vector-effect="non-scaling-stroke"
          :x1="corner.x" :y1="corner.y"
          :x2="corner.x" :y2="corner.y + corner.dy * markLength"
          pathLength="1"
          stroke-width="1.5"
          :stroke-dasharray="1"
          :stroke-dashoffset="1 - corner.reveal.value"
          :opacity="corner.accent ? 0.9 : 0.55"
        />
        <circle
          :cx="corner.x + corner.dx * 1.4" :cy="corner.y + corner.dy * 1.4" r="0.5"
          :fill="corner.accent ? '#FBBA00' : '#071F2E'"
          :opacity="corner.reveal.value > 0.1 ? (corner.accent ? 0.9 : 0.5) : 0"
        />
      </g>
    </svg>

    <!-- Running kicker label (bottom-left) — brand copy, not decoration:
         reads out the section name and a live "depth" readout tied to the
         same dolly progress the camera uses, styled off the eyebrow type
         scale already used elsewhere in Hero so it reads as authored UI,
         not a generated HUD widget. -->
    <div class="absolute bottom-6 left-6 flex items-center gap-3 font-body text-eyebrow uppercase text-ink/70 md:bottom-8 md:left-8">
      <span class="tracking-[0.14em]">PASTI — Technology. Creativity. Impact.</span>
      <span class="tabular-nums tracking-[0.08em] text-yellow-600">{{ depthReadout }}</span>
    </div>

    <!-- Arrival cue: vignette + faint chromatic-edge offset, both silent
         until the final quarter of scroll progress, at full strength only
         once the camera reaches the last frame. -->
    <div
      class="absolute inset-0"
      :style="{
        opacity: arrivalIntensity,
        background:
          'radial-gradient(ellipse at center, transparent 55%, rgba(7,31,46,0.35) 100%)'
      }"
    />
    <div
      class="absolute inset-0 mix-blend-screen"
      :style="{
        opacity: arrivalIntensity * 0.6,
        boxShadow: 'inset 6px 0 8px -4px rgba(255,60,60,0.4), inset -6px 0 8px -4px rgba(60,180,255,0.4)'
      }"
    />
  </div>
</template>
