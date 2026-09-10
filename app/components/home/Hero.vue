<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 02 — HERO.
const headline = 'Technology. Creativity. Impact.'
const subtext = 'We build technology and creative solutions for businesses ready to move forward.'
const ctaPrimary = { label: 'Explore our work', to: '#selected-work' }
const ctaSecondary = { label: 'Tell us about it' }

const { link: whatsappLink } = useWhatsapp()
const { introReady } = useIntroReady()
const { playTo } = useSectionCurtain()

function goToSelectedWork() {
  playTo(ctaPrimary.to)
}

const headingRef = ref<HTMLElement | null>(null)
const headingWrapRef = ref<HTMLElement | null>(null)
const spotlightRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)
const subtextRef = ref<HTMLElement | null>(null)
const ctaRowRef = ref<HTMLElement | null>(null)
const ctaPrimaryRef = ref<HTMLElement | null>(null)

useMagnetic(ctaPrimaryRef, { strength: 0.25 })

/** Wraps a word in the outer-clip / inner-translate mask structure, matching
 * Cuberto's own hero markup exactly (verified via their live DOM): the outer
 * span clips overflow with a negative margin, the inner span carries the
 * translateY reveal with matching positive padding — this compensates for
 * descenders (g, y, p) so they don't get clipped by the outer span's
 * overflow during the reveal. */
function wrapWord(word: string): { outer: HTMLSpanElement; inner: HTMLSpanElement } {
  const outer = document.createElement('span')
  outer.style.overflow = 'clip'
  outer.style.display = 'inline-block'
  outer.style.verticalAlign = 'top'
  outer.style.margin = '-0.2em'

  const inner = document.createElement('span')
  inner.style.display = 'inline-block'
  inner.style.padding = '0.2em'
  inner.textContent = word
  inner.dataset.revealEl = ''
  inner.dataset.revealKind = 'mask'

  outer.appendChild(inner)
  return { outer, inner }
}

useGsapContext(() => {
  watch(
    introReady,
    (ready, _oldValue, onCleanup) => {
      if (!ready) return

      const mm = gsap.matchMedia()
      onCleanup(() => mm.revert())

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([subtextRef.value, ctaRowRef.value].filter(Boolean), { opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const heading = headingRef.value
        if (!heading) return

        const allHeadingWords: HTMLElement[] = []
        const headingText = heading.textContent ?? ''
        heading.textContent = ''
        for (const part of headingText.split(/(\s+)/).filter(Boolean)) {
          if (/^\s+$/.test(part)) {
            heading.appendChild(document.createTextNode(part))
            continue
          }
          const { outer, inner } = wrapWord(part)
          heading.appendChild(outer)
          allHeadingWords.push(inner)
        }
        if (subtextRef.value) {
          subtextRef.value.dataset.revealEl = ''
          subtextRef.value.dataset.revealKind = 'scroll'
        }
        if (ctaRowRef.value) {
          ctaRowRef.value.dataset.revealEl = ''
          ctaRowRef.value.dataset.revealKind = 'scroll'
        }

        gsap.set(allHeadingWords, { yPercent: 120 })
        if (subtextRef.value) gsap.set(subtextRef.value, { opacity: 0, y: 12 })
        if (ctaRowRef.value) gsap.set(ctaRowRef.value, { opacity: 0, y: 12 })
        if (shineRef.value) gsap.set(shineRef.value, { opacity: 0, backgroundPosition: '130% 130%' })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.to(allHeadingWords, { yPercent: 0, duration: 0.9, stagger: 0.08 })
        tl.addLabel('shineStart')
        if (subtextRef.value) tl.to(subtextRef.value, { opacity: 1, y: 0, duration: 0.6 }, 'shineStart+=0.1')
        if (ctaRowRef.value) tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: 0.6 }, 'shineStart+=0.2')

        // Shine sweep: a one-off "kinclong" touch on the headline once its
        // own word reveal has settled — a diagonal light band travels
        // across the text toward the top-right. Positioned relative to the
        // 'shineStart' label on the SAME timeline as the reveal (not a
        // separate hardcoded-delay timeline), so it always starts right as
        // the reveal finishes.
        if (shineRef.value) {
          tl.to(
            shineRef.value,
            { opacity: 1, backgroundPosition: '-30% -30%', duration: 2.2, ease: 'cubic-bezier(0.65, 0, 0.35, 1)' },
            'shineStart'
          )
          tl.set(shineRef.value, { opacity: 0 })
        }

        return () => tl.kill()
      })
    },
    { immediate: true }
  )
})

useCursorSpotlight(headingWrapRef, spotlightRef, { radius: 110 })

// Dev-only background switcher — lets us compare Hero background treatments
// live before picking one. Grouped into categories (3D / 2D / Motion /
// Agency, plus the earlier exploratory line-art set) so the picker stays
// usable with 20+ options. Persisted to sessionStorage so it survives HMR
// reloads while iterating. Stripped out entirely once a direction is chosen.
type HeroBgOption =
  | 'none'
  // earlier exploratory set
  | 'mesh' | 'lines' | 'noise'
  | 'explore-type-snap' | 'explore-weighted-drift' | 'explore-spotlight-sweep' | 'explore-grid-pulse' | 'explore-depth-drift'
  // Line-art, reimagined in 3D (same compositions as 'lines' variants above, rebuilt as living geometry)
  | 'lines-3d-curves-floating' | 'lines-3d-grid-constellation' | 'lines-3d-minimal-ribbon'
  // 3D (Three.js)
  | '3d-sphere' | '3d-particles' | '3d-glass' | '3d-fluid' | '3d-wiregrid'
  | '3d-volumetric' | '3d-holographic' | '3d-terrain' | '3d-shards' | '3d-depth-parallax'
  | '3d-blob-liquid-magnet' | '3d-blob-glass-refraction' | '3d-blob-cell-cluster'
  | '3d-inertial-object' | '3d-spotlit-installation' | '3d-zdepth-dolly' | '3d-mouse-monolith' | '3d-gridbreak-rhythm'
  | '3d-wiregrid-scansweep' | '3d-wiregrid-pulserings' | '3d-wiregrid-motes' | '3d-wiregrid-glitch' | '3d-wiregrid-comet'
  | '3d-wiregrid-dolly-reveal' | '3d-wiregrid-unfold' | '3d-wiregrid-scanline-locked'
  | '3d-wiregrid-dolly-pinned' | '3d-wiregrid-dolly-morph-gates' | '3d-wiregrid-dolly-door-open'
  | '3d-wiregrid-solid-portal-bloom' | '3d-wiregrid-solid-warp-collapse' | '3d-wiregrid-solid-illuminated-headline'
  | '3d-sphere-shatter-reform' | '3d-sphere-terrain-grid' | '3d-sphere-torus-monolith' | '3d-sphere-particle-depth'
  | '3d-sphere-liquid-crystal' | '3d-sphere-armillary' | '3d-sphere-folded-gem' | '3d-sphere-molecule-lattice'
  // 2D (canvas/SVG signature techniques)
  | '2d-liquid' | '2d-glitch' | '2d-contour' | '2d-kinetic' | '2d-aurora'
  | '2d-grain-mesh' | '2d-halftone' | '2d-flowfield' | '2d-chromatic-blobs' | '2d-typographic-noise'
  | '2d-type-stretch-snap' | '2d-cursor-glyph-distort' | '2d-rhythmic-gridbreak' | '2d-installation-spotlight' | '2d-zdepth-dolly'
  // Motion (quiet, "expensive" fillers)
  | 'motion-grain' | 'motion-orbs' | 'motion-rays' | 'motion-morph' | 'motion-grid'
  | 'motion-breathing' | 'motion-parallax-layers' | 'motion-zoom-vignette' | 'motion-magnetic-particles' | 'motion-temperature-drift'
  | 'motion-inertial-drift' | 'motion-spotlight-rig' | 'motion-rhythmic-pulse' | 'motion-depth-flythrough' | 'motion-engine-idle'
  // Agency (studio-site signature moves)
  | 'agency-marquee' | 'agency-blocks' | 'agency-spotlight' | 'agency-editorial' | 'agency-distort'
  | 'agency-index-grid' | 'agency-path-reveal' | 'agency-cropped-wordmark' | 'agency-scroll-choreography' | 'agency-chaos-to-order'
  | 'agency-rhythmic-gridbreak' | 'agency-installation-lighting' | 'agency-weighted-drift' | 'agency-room-dolly' | 'agency-trained-interaction'
  // Shader (full-screen custom GLSL)
  | 'shader-plasma' | 'shader-caustic' | 'shader-iridescent' | 'shader-voronoi' | 'shader-fog'
  | 'shader-inertial-warp' | 'shader-spotlit-volumetric' | 'shader-zdepth-tunnel' | 'shader-gridbreak-distortion' | 'shader-cursor-reveal'
  // Editorial (magazine/print-led typographic treatments)
  | 'editorial-masthead' | 'editorial-numerals' | 'editorial-collage' | 'editorial-marquee' | 'editorial-grid'
  | 'editorial-type-stretch' | 'editorial-rhythmic-caption' | 'editorial-spotlit-pullquote' | 'editorial-masthead-dolly' | 'editorial-weighted-kicker'
  // Interactive (cursor-reactivity as the main feature)
  | 'interactive-ripple' | 'interactive-swarm' | 'interactive-lens' | 'interactive-nodes' | 'interactive-magnifier'
  | 'interactive-inertial-object' | 'interactive-trained-activation' | 'interactive-velocity-distortion' | 'interactive-room-transition' | 'interactive-spotlight-rig'

interface BgOption {
  value: HeroBgOption
  label: string
}
interface BgGroup {
  label: string
  options: BgOption[]
}

const bgGroups: BgGroup[] = [
  {
    label: '3D',
    options: [
      { value: '3d-sphere', label: 'Distorted sphere' },
      { value: '3d-particles', label: 'Particle field' },
      { value: '3d-glass', label: 'Glass prism' },
      { value: '3d-fluid', label: 'Fluid plane' },
      { value: '3d-wiregrid', label: 'Wire grid' },
      { value: '3d-volumetric', label: 'Volumetric light' },
      { value: '3d-holographic', label: 'Holographic blob' },
      { value: '3d-blob-liquid-magnet', label: 'Blob — liquid magnet (chases cursor)' },
      { value: '3d-blob-glass-refraction', label: 'Blob — glass refraction (real transmission)' },
      { value: '3d-blob-cell-cluster', label: 'Blob — cell cluster (multiple, drifting)' },
      { value: '3d-terrain', label: 'Terrain wave' },
      { value: '3d-shards', label: 'Chromatic shards' },
      { value: '3d-depth-parallax', label: 'Depth parallax field' },
      { value: '3d-inertial-object', label: 'Inertial hero object (Lusion)' },
      { value: '3d-spotlit-installation', label: 'Spotlit installation (Iventions)' },
      { value: '3d-zdepth-dolly', label: 'Z-depth camera dolly (Lusion)' },
      { value: '3d-mouse-monolith', label: 'Mouse-reveal monolith (Hubtown)' },
      { value: '3d-gridbreak-rhythm', label: 'Grid-break rhythm (Uncommon)' },
      { value: '3d-wiregrid-scansweep', label: 'Wire grid + scan sweep' },
      { value: '3d-wiregrid-pulserings', label: 'Wire grid + pulse rings' },
      { value: '3d-wiregrid-motes', label: 'Wire grid + particle motes' },
      { value: '3d-wiregrid-glitch', label: 'Wire grid + glitch burst' },
      { value: '3d-wiregrid-comet', label: 'Wire grid + comet streak' },
      { value: '3d-wiregrid-dolly-reveal', label: 'Wire grid — dolly through frames (scroll-locked)' },
      { value: '3d-wiregrid-unfold', label: 'Wire grid — unfold on scroll' },
      { value: '3d-wiregrid-scanline-locked', label: 'Wire grid — scanline locked to scroll' },
      { value: '3d-wiregrid-dolly-pinned', label: 'Wire grid — dolly, pinned + refined (recommended)' },
      { value: '3d-wiregrid-dolly-morph-gates', label: 'Wire grid — dolly through morphing gates (pinned)' },
      { value: '3d-wiregrid-dolly-door-open', label: 'Wire grid — door opens then dolly (pinned)' },
      { value: '3d-wiregrid-solid-portal-bloom', label: 'Wire grid — solid rings, portal bloom on arrival' },
      { value: '3d-wiregrid-solid-warp-collapse', label: 'Wire grid — solid rings, warp collapse on arrival' },
      { value: '3d-wiregrid-solid-illuminated-headline', label: 'Wire grid — solid rings, light spills onto headline' },
      { value: '3d-sphere-shatter-reform', label: 'Sphere → Shatter → Reform' },
      { value: '3d-sphere-terrain-grid', label: 'Sphere → Terrain → Grid' },
      { value: '3d-sphere-torus-monolith', label: 'Sphere → Torus → Blade bloom' },
      { value: '3d-sphere-particle-depth', label: 'Sphere → Particles → Depth field' },
      { value: '3d-sphere-liquid-crystal', label: 'Sphere → Liquid drop → Crystal spire' },
      { value: '3d-sphere-armillary', label: 'Sphere → Ring cluster → Armillary' },
      { value: '3d-sphere-folded-gem', label: 'Sphere → Folded plane → Faceted gem' },
      { value: '3d-sphere-molecule-lattice', label: 'Sphere → Molecule → Lattice' }
    ]
  },
  {
    label: '2D',
    options: [
      { value: '2d-liquid', label: 'Liquid metal' },
      { value: '2d-glitch', label: 'Glitch accent' },
      { value: '2d-contour', label: 'Marching contour' },
      { value: '2d-kinetic', label: 'Kinetic type' },
      { value: '2d-aurora', label: 'Aurora gradient' },
      { value: '2d-grain-mesh', label: 'Grain mesh gradient' },
      { value: '2d-halftone', label: 'Halftone dots' },
      { value: '2d-flowfield', label: 'Flow field lines' },
      { value: '2d-chromatic-blobs', label: 'Chromatic blobs' },
      { value: '2d-typographic-noise', label: 'Typographic noise' },
      { value: '2d-type-stretch-snap', label: 'Type stretch + snap (Mat Voyce)' },
      { value: '2d-cursor-glyph-distort', label: 'Cursor glyph distort (Active Theory)' },
      { value: '2d-rhythmic-gridbreak', label: 'Rhythmic grid break (Uncommon)' },
      { value: '2d-installation-spotlight', label: 'Installation spotlight (Iventions)' },
      { value: '2d-zdepth-dolly', label: 'Z-depth layer dolly (Lusion)' }
    ]
  },
  {
    label: 'Motion',
    options: [
      { value: 'motion-grain', label: 'Grain + sweep' },
      { value: 'motion-orbs', label: 'Floating orbs' },
      { value: 'motion-rays', label: 'Light rays' },
      { value: 'motion-morph', label: 'Shape morph' },
      { value: 'motion-grid', label: 'Magnetic grid' },
      { value: 'motion-breathing', label: 'Breathing glow' },
      { value: 'motion-parallax-layers', label: 'Parallax layers' },
      { value: 'motion-zoom-vignette', label: 'Slow zoom vignette' },
      { value: 'motion-magnetic-particles', label: 'Magnetic particles' },
      { value: 'motion-temperature-drift', label: 'Color temperature drift' },
      { value: 'motion-inertial-drift', label: 'Inertial drift (Lusion)' },
      { value: 'motion-spotlight-rig', label: 'Spotlight rig timeline (Iventions)' },
      { value: 'motion-rhythmic-pulse', label: 'Rhythmic pulse grid (Uncommon)' },
      { value: 'motion-depth-flythrough', label: 'Depth flythrough (Lusion)' },
      { value: 'motion-engine-idle', label: 'Engine idle HUD (Active Theory)' }
    ]
  },
  {
    label: 'Agency',
    options: [
      { value: 'agency-marquee', label: 'Marquee' },
      { value: 'agency-blocks', label: 'Split blocks' },
      { value: 'agency-spotlight', label: 'Spotlight mesh' },
      { value: 'agency-editorial', label: 'Editorial grid' },
      { value: 'agency-distort', label: 'Distort reveal' },
      { value: 'agency-index-grid', label: 'Index grid' },
      { value: 'agency-path-reveal', label: 'Path reveal' },
      { value: 'agency-cropped-wordmark', label: 'Cropped wordmark' },
      { value: 'agency-scroll-choreography', label: 'Scroll choreography' },
      { value: 'agency-chaos-to-order', label: 'Chaos to order' },
      { value: 'agency-rhythmic-gridbreak', label: 'Rhythmic grid break (Uncommon)' },
      { value: 'agency-installation-lighting', label: 'Installation lighting (Iventions)' },
      { value: 'agency-weighted-drift', label: 'Weighted object drift (Lusion)' },
      { value: 'agency-room-dolly', label: 'Room dolly (Immersive Garden)' },
      { value: 'agency-trained-interaction', label: 'Trained interaction (Active Theory)' }
    ]
  },
  {
    label: 'Shader',
    options: [
      { value: 'shader-plasma', label: 'Plasma' },
      { value: 'shader-caustic', label: 'Caustic light' },
      { value: 'shader-iridescent', label: 'Iridescent wave' },
      { value: 'shader-voronoi', label: 'Voronoi cells' },
      { value: 'shader-fog', label: 'Atmospheric fog' },
      { value: 'shader-inertial-warp', label: 'Inertial field warp (Lusion)' },
      { value: 'shader-spotlit-volumetric', label: 'Spotlit volumetric (Iventions)' },
      { value: 'shader-zdepth-tunnel', label: 'Z-depth tunnel (Lusion)' },
      { value: 'shader-gridbreak-distortion', label: 'Grid-break distortion (Uncommon)' },
      { value: 'shader-cursor-reveal', label: 'Cursor reveal distortion (Active Theory)' }
    ]
  },
  {
    label: 'Editorial',
    options: [
      { value: 'editorial-masthead', label: 'Masthead' },
      { value: 'editorial-numerals', label: 'Pull-quote numerals' },
      { value: 'editorial-collage', label: 'Collage fragments' },
      { value: 'editorial-marquee', label: 'Masthead marquee' },
      { value: 'editorial-grid', label: 'Asymmetric grid' },
      { value: 'editorial-type-stretch', label: 'Type stretch timeline (Mat Voyce)' },
      { value: 'editorial-rhythmic-caption', label: 'Rhythmic caption (Uncommon)' },
      { value: 'editorial-spotlit-pullquote', label: 'Spotlit pull-quote (Iventions)' },
      { value: 'editorial-masthead-dolly', label: 'Masthead dolly (Lusion)' },
      { value: 'editorial-weighted-kicker', label: 'Weighted kicker (Lusion)' }
    ]
  },
  {
    label: 'Interactive',
    options: [
      { value: 'interactive-ripple', label: 'Ripple grid' },
      { value: 'interactive-swarm', label: 'Magnetic particle swarm' },
      { value: 'interactive-lens', label: 'Distortion lens' },
      { value: 'interactive-nodes', label: 'Connected nodes' },
      { value: 'interactive-magnifier', label: 'Magnifier reveal' },
      { value: 'interactive-inertial-object', label: 'Inertial object (Lusion)' },
      { value: 'interactive-trained-activation', label: 'Trained activation (Active Theory)' },
      { value: 'interactive-velocity-distortion', label: 'Velocity distortion (Active Theory)' },
      { value: 'interactive-room-transition', label: 'Room transition (Immersive Garden)' },
      { value: 'interactive-spotlight-rig', label: 'Spotlight rig (Iventions)' }
    ]
  },
  {
    label: 'Earlier exploration',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mesh', label: 'Gradient mesh' },
      { value: 'lines', label: 'Line-art (curves)' },
      { value: 'noise', label: 'Noise + dots' },
      { value: 'explore-type-snap', label: 'Type snap (lite)' },
      { value: 'explore-weighted-drift', label: 'Weighted drift (lite)' },
      { value: 'explore-spotlight-sweep', label: 'Spotlight sweep (lite)' },
      { value: 'explore-grid-pulse', label: 'Grid pulse (lite)' },
      { value: 'explore-depth-drift', label: 'Depth drift (lite)' }
    ]
  },
  {
    label: 'Line-art — 3D',
    options: [
      { value: 'lines-3d-curves-floating', label: 'Curves — floating 3D tubes' },
      { value: 'lines-3d-grid-constellation', label: 'Grid — breathing 3D constellation' },
      { value: 'lines-3d-minimal-ribbon', label: 'Minimal — 3D ribbon with spring bead' }
    ]
  }
]

const activeBg = ref<HeroBgOption>('3d-sphere')
const openGroup = ref<string>('3D')
const isDev = import.meta.dev

onMounted(() => {
  if (import.meta.dev) {
    const stored = sessionStorage.getItem('hero-bg-preview-v2')
    const allValues = bgGroups.flatMap((g) => g.options.map((o) => o.value))
    if (stored && allValues.includes(stored as HeroBgOption)) {
      activeBg.value = stored as HeroBgOption
    }
    watch(activeBg, (value) => sessionStorage.setItem('hero-bg-preview-v2', value))
  }
})
</script>

<template>
  <BaseSection as="section" class="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24 md:pt-28">
    <!-- Background treatment (dev-switchable, see activeBg below). Wrapped
         in ClientOnly so server + first client paint agree (both render
         nothing here) — avoids a hydration mismatch on the WebGL canvas. -->
    <ClientOnly>
      <!-- 3D -->
      <HomeHeroBgThreeDistortedSphere v-if="activeBg === '3d-sphere'" class="z-[3]" />
      <HomeHeroBgThreeParticleField v-else-if="activeBg === '3d-particles'" class="z-[3]" />
      <HomeHeroBgThreeGlassPrism v-else-if="activeBg === '3d-glass'" class="z-[3]" />
      <HomeHeroBgThreeFluidPlane v-else-if="activeBg === '3d-fluid'" class="z-[3]" />
      <HomeHeroBgThreeWireGrid v-else-if="activeBg === '3d-wiregrid'" class="z-[3]" />
      <HomeHeroBgThreeVolumetricLight v-else-if="activeBg === '3d-volumetric'" class="z-[3]" />
      <HomeHeroBgThreeHolographicBlob v-else-if="activeBg === '3d-holographic'" class="z-[3]" />
      <HomeHeroBgThreeBlobLiquidMagnet v-else-if="activeBg === '3d-blob-liquid-magnet'" class="z-[3]" />
      <HomeHeroBgThreeBlobGlassRefraction v-else-if="activeBg === '3d-blob-glass-refraction'" class="z-[3]" />
      <HomeHeroBgThreeBlobCellCluster v-else-if="activeBg === '3d-blob-cell-cluster'" class="z-[3]" />
      <HomeHeroBgThreeTerrainWave v-else-if="activeBg === '3d-terrain'" class="z-[3]" />
      <HomeHeroBgThreeChromaticShards v-else-if="activeBg === '3d-shards'" class="z-[3]" />
      <HomeHeroBgThreeDepthParallaxField v-else-if="activeBg === '3d-depth-parallax'" class="z-[3]" />
      <HomeHeroBgThreeInertialHeroObject v-else-if="activeBg === '3d-inertial-object'" class="z-[3]" />
      <HomeHeroBgThreeSpotlitInstallation v-else-if="activeBg === '3d-spotlit-installation'" class="z-[3]" />
      <HomeHeroBgThreeZDepthCameraDolly v-else-if="activeBg === '3d-zdepth-dolly'" class="z-[3]" />
      <HomeHeroBgThreeMouseRevealMonolith v-else-if="activeBg === '3d-mouse-monolith'" class="z-[3]" />
      <HomeHeroBgThreeGridBreakRhythm v-else-if="activeBg === '3d-gridbreak-rhythm'" class="z-[3]" />
      <HomeHeroBgThreeWireGridScanSweep v-else-if="activeBg === '3d-wiregrid-scansweep'" class="z-[3]" />
      <HomeHeroBgThreeWireGridPulseRings v-else-if="activeBg === '3d-wiregrid-pulserings'" class="z-[3]" />
      <HomeHeroBgThreeWireGridParticleMotes v-else-if="activeBg === '3d-wiregrid-motes'" class="z-[3]" />
      <HomeHeroBgThreeWireGridGlitchBurst v-else-if="activeBg === '3d-wiregrid-glitch'" class="z-[3]" />
      <HomeHeroBgThreeWireGridCometStreak v-else-if="activeBg === '3d-wiregrid-comet'" class="z-[3]" />
      <HomeHeroBgThreeWireGridDollyReveal v-else-if="activeBg === '3d-wiregrid-dolly-reveal'" class="z-[3]" />
      <HomeHeroBgThreeWireGridUnfold v-else-if="activeBg === '3d-wiregrid-unfold'" class="z-[3]" />
      <HomeHeroBgThreeWireGridScanlineLocked v-else-if="activeBg === '3d-wiregrid-scanline-locked'" class="z-[3]" />
      <HomeHeroBgThreeWireGridDollyPinned v-else-if="activeBg === '3d-wiregrid-dolly-pinned'" class="z-[3]" />
      <HomeHeroBgThreeWireGridDollyMorphGates v-else-if="activeBg === '3d-wiregrid-dolly-morph-gates'" class="z-[3]" />
      <HomeHeroBgThreeWireGridDollyDoorOpen v-else-if="activeBg === '3d-wiregrid-dolly-door-open'" class="z-[3]" />
      <HomeHeroBgThreeWireGridSolidPortalBloom v-else-if="activeBg === '3d-wiregrid-solid-portal-bloom'" class="z-[3]" />
      <HomeHeroBgThreeWireGridSolidWarpCollapse v-else-if="activeBg === '3d-wiregrid-solid-warp-collapse'" class="z-[3]" />
      <HomeHeroBgThreeWireGridSolidIlluminatedHeadline v-else-if="activeBg === '3d-wiregrid-solid-illuminated-headline'" class="z-[3]" />
      <HomeHeroBgThreeSphereShatterReform v-else-if="activeBg === '3d-sphere-shatter-reform'" class="z-[3]" />
      <HomeHeroBgThreeSphereTerrainGrid v-else-if="activeBg === '3d-sphere-terrain-grid'" class="z-[3]" />
      <HomeHeroBgThreeSphereTorusMonolith v-else-if="activeBg === '3d-sphere-torus-monolith'" class="z-[3]" />
      <HomeHeroBgThreeSphereParticleDepth v-else-if="activeBg === '3d-sphere-particle-depth'" class="z-[3]" />
      <HomeHeroBgThreeSphereLiquidCrystal v-else-if="activeBg === '3d-sphere-liquid-crystal'" class="z-[3]" />
      <HomeHeroBgThreeSphereArmillary v-else-if="activeBg === '3d-sphere-armillary'" class="z-[3]" />
      <HomeHeroBgThreeSphereFoldedGem v-else-if="activeBg === '3d-sphere-folded-gem'" class="z-[3]" />
      <HomeHeroBgThreeSphereMoleculeLattice v-else-if="activeBg === '3d-sphere-molecule-lattice'" class="z-[3]" />
      <!-- 2D -->
      <HomeHeroBgTwoLiquidMetal v-else-if="activeBg === '2d-liquid'" class="z-[3]" />
      <HomeHeroBgTwoGlitchAccent v-else-if="activeBg === '2d-glitch'" class="z-[3]" />
      <HomeHeroBgTwoMarchingContour v-else-if="activeBg === '2d-contour'" class="z-[3]" />
      <HomeHeroBgTwoKineticType v-else-if="activeBg === '2d-kinetic'" class="z-[3]" />
      <HomeHeroBgTwoAuroraGradient v-else-if="activeBg === '2d-aurora'" class="z-[3]" />
      <HomeHeroBgTwoGrainMeshGradient v-else-if="activeBg === '2d-grain-mesh'" class="z-[3]" />
      <HomeHeroBgTwoHalftoneDots v-else-if="activeBg === '2d-halftone'" class="z-[3]" />
      <HomeHeroBgTwoFlowFieldLines v-else-if="activeBg === '2d-flowfield'" class="z-[3]" />
      <HomeHeroBgTwoChromaticBlobs v-else-if="activeBg === '2d-chromatic-blobs'" class="z-[3]" />
      <HomeHeroBgTwoTypographicNoise v-else-if="activeBg === '2d-typographic-noise'" class="z-[3]" />
      <HomeHeroBgTwoTypeStretchSnap v-else-if="activeBg === '2d-type-stretch-snap'" class="z-[3]" />
      <HomeHeroBgTwoCursorDrivenGlyphDistort v-else-if="activeBg === '2d-cursor-glyph-distort'" class="z-[3]" />
      <HomeHeroBgTwoRhythmicGridBreak v-else-if="activeBg === '2d-rhythmic-gridbreak'" class="z-[3]" />
      <HomeHeroBgTwoInstallationSpotlight v-else-if="activeBg === '2d-installation-spotlight'" class="z-[3]" />
      <HomeHeroBgTwoZDepthLayerDolly v-else-if="activeBg === '2d-zdepth-dolly'" class="z-[3]" />
      <!-- Motion -->
      <HomeHeroBgMotionGrain v-else-if="activeBg === 'motion-grain'" class="z-[3]" />
      <HomeHeroBgMotionOrbs v-else-if="activeBg === 'motion-orbs'" class="z-[3]" />
      <HomeHeroBgMotionRays v-else-if="activeBg === 'motion-rays'" class="z-[3]" />
      <HomeHeroBgMotionShapeMorph v-else-if="activeBg === 'motion-morph'" class="z-[3]" />
      <HomeHeroBgMotionMagneticGrid v-else-if="activeBg === 'motion-grid'" class="z-[3]" />
      <HomeHeroBgMotionBreathingGlow v-else-if="activeBg === 'motion-breathing'" class="z-[3]" />
      <HomeHeroBgMotionParallaxLayers v-else-if="activeBg === 'motion-parallax-layers'" class="z-[3]" />
      <HomeHeroBgMotionSlowZoomVignette v-else-if="activeBg === 'motion-zoom-vignette'" class="z-[3]" />
      <HomeHeroBgMotionMagneticParticles v-else-if="activeBg === 'motion-magnetic-particles'" class="z-[3]" />
      <HomeHeroBgMotionColorTemperatureDrift v-else-if="activeBg === 'motion-temperature-drift'" class="z-[3]" />
      <HomeHeroBgMotionInertialDrift v-else-if="activeBg === 'motion-inertial-drift'" class="z-[3]" />
      <HomeHeroBgMotionSpotlightRigTimeline v-else-if="activeBg === 'motion-spotlight-rig'" class="z-[3]" />
      <HomeHeroBgMotionRhythmicPulseGrid v-else-if="activeBg === 'motion-rhythmic-pulse'" class="z-[3]" />
      <HomeHeroBgMotionDepthFlythrough v-else-if="activeBg === 'motion-depth-flythrough'" class="z-[3]" />
      <HomeHeroBgMotionEngineIdle v-else-if="activeBg === 'motion-engine-idle'" class="z-[3]" />
      <!-- Agency -->
      <HomeHeroBgAgencyMarquee v-else-if="activeBg === 'agency-marquee'" class="z-[3]" />
      <HomeHeroBgAgencySplitBlocks v-else-if="activeBg === 'agency-blocks'" class="z-[3]" />
      <HomeHeroBgAgencySpotlightMesh v-else-if="activeBg === 'agency-spotlight'" class="z-[3]" />
      <HomeHeroBgAgencyEditorialGrid v-else-if="activeBg === 'agency-editorial'" class="z-[3]" />
      <HomeHeroBgAgencyDistortReveal v-else-if="activeBg === 'agency-distort'" class="z-[3]" />
      <HomeHeroBgAgencyIndexGrid v-else-if="activeBg === 'agency-index-grid'" class="z-[3]" />
      <HomeHeroBgAgencyPathReveal v-else-if="activeBg === 'agency-path-reveal'" class="z-[3]" />
      <HomeHeroBgAgencyCroppedWordmark v-else-if="activeBg === 'agency-cropped-wordmark'" class="z-[3]" />
      <HomeHeroBgAgencyScrollChoreography v-else-if="activeBg === 'agency-scroll-choreography'" class="z-[3]" />
      <HomeHeroBgAgencyChaosToOrder v-else-if="activeBg === 'agency-chaos-to-order'" class="z-[3]" />
      <HomeHeroBgAgencyRhythmicGridBreak v-else-if="activeBg === 'agency-rhythmic-gridbreak'" class="z-[3]" />
      <HomeHeroBgAgencyInstallationLighting v-else-if="activeBg === 'agency-installation-lighting'" class="z-[3]" />
      <HomeHeroBgAgencyWeightedObjectDrift v-else-if="activeBg === 'agency-weighted-drift'" class="z-[3]" />
      <HomeHeroBgAgencyRoomDolly v-else-if="activeBg === 'agency-room-dolly'" class="z-[3]" />
      <HomeHeroBgAgencyCursorTrainedInteraction v-else-if="activeBg === 'agency-trained-interaction'" class="z-[3]" />
      <!-- Shader -->
      <HomeHeroBgShaderPlasma v-else-if="activeBg === 'shader-plasma'" class="z-[3]" />
      <HomeHeroBgShaderCausticLight v-else-if="activeBg === 'shader-caustic'" class="z-[3]" />
      <HomeHeroBgShaderIridescentWave v-else-if="activeBg === 'shader-iridescent'" class="z-[3]" />
      <HomeHeroBgShaderVoronoiCells v-else-if="activeBg === 'shader-voronoi'" class="z-[3]" />
      <HomeHeroBgShaderAtmosphericFog v-else-if="activeBg === 'shader-fog'" class="z-[3]" />
      <HomeHeroBgShaderInertialFieldWarp v-else-if="activeBg === 'shader-inertial-warp'" class="z-[3]" />
      <HomeHeroBgShaderSpotlitVolumetric v-else-if="activeBg === 'shader-spotlit-volumetric'" class="z-[3]" />
      <HomeHeroBgShaderZDepthTunnel v-else-if="activeBg === 'shader-zdepth-tunnel'" class="z-[3]" />
      <HomeHeroBgShaderGridBreakDistortion v-else-if="activeBg === 'shader-gridbreak-distortion'" class="z-[3]" />
      <HomeHeroBgShaderCursorRevealDistortion v-else-if="activeBg === 'shader-cursor-reveal'" class="z-[3]" />
      <!-- Editorial -->
      <HomeHeroBgEditorialMasthead v-else-if="activeBg === 'editorial-masthead'" class="z-[3]" />
      <HomeHeroBgEditorialPullQuoteNumerals v-else-if="activeBg === 'editorial-numerals'" class="z-[3]" />
      <HomeHeroBgEditorialCollageFragments v-else-if="activeBg === 'editorial-collage'" class="z-[3]" />
      <HomeHeroBgEditorialMastheadMarquee v-else-if="activeBg === 'editorial-marquee'" class="z-[3]" />
      <HomeHeroBgEditorialAsymmetricGrid v-else-if="activeBg === 'editorial-grid'" class="z-[3]" />
      <HomeHeroBgEditorialTypeStretchTimeline v-else-if="activeBg === 'editorial-type-stretch'" class="z-[3]" />
      <HomeHeroBgEditorialRhythmicCaption v-else-if="activeBg === 'editorial-rhythmic-caption'" class="z-[3]" />
      <HomeHeroBgEditorialSpotlitPullQuote v-else-if="activeBg === 'editorial-spotlit-pullquote'" class="z-[3]" />
      <HomeHeroBgEditorialMastheadDolly v-else-if="activeBg === 'editorial-masthead-dolly'" class="z-[3]" />
      <HomeHeroBgEditorialWeightedKicker v-else-if="activeBg === 'editorial-weighted-kicker'" class="z-[3]" />
      <!-- Interactive -->
      <HomeHeroBgInteractiveRippleGrid v-else-if="activeBg === 'interactive-ripple'" class="z-[3]" />
      <HomeHeroBgInteractiveMagneticParticleSwarm v-else-if="activeBg === 'interactive-swarm'" class="z-[3]" />
      <HomeHeroBgInteractiveDistortionLens v-else-if="activeBg === 'interactive-lens'" class="z-[3]" />
      <HomeHeroBgInteractiveConnectedNodes v-else-if="activeBg === 'interactive-nodes'" class="z-[3]" />
      <HomeHeroBgInteractiveMagnifierReveal v-else-if="activeBg === 'interactive-magnifier'" class="z-[3]" />
      <HomeHeroBgInteractiveInertialObject v-else-if="activeBg === 'interactive-inertial-object'" class="z-[3]" />
      <HomeHeroBgInteractiveTrainedActivation v-else-if="activeBg === 'interactive-trained-activation'" class="z-[3]" />
      <HomeHeroBgInteractiveVelocityDistortion v-else-if="activeBg === 'interactive-velocity-distortion'" class="z-[3]" />
      <HomeHeroBgInteractiveRoomTransition v-else-if="activeBg === 'interactive-room-transition'" class="z-[3]" />
      <HomeHeroBgInteractiveSpotlightRig v-else-if="activeBg === 'interactive-spotlight-rig'" class="z-[3]" />
      <!-- Earlier exploration -->
      <HomeHeroBgMesh v-else-if="activeBg === 'mesh'" class="z-[3]" />
      <HomeHeroBgLinesCurves v-else-if="activeBg === 'lines'" class="z-[3]" />
      <HomeHeroBgNoise v-else-if="activeBg === 'noise'" class="z-[3]" />
      <HomeHeroBgExploreTypeSnapLite v-else-if="activeBg === 'explore-type-snap'" class="z-[3]" />
      <HomeHeroBgExploreWeightedDriftLite v-else-if="activeBg === 'explore-weighted-drift'" class="z-[3]" />
      <HomeHeroBgExploreSpotlightSweepLite v-else-if="activeBg === 'explore-spotlight-sweep'" class="z-[3]" />
      <HomeHeroBgExploreGridPulseLite v-else-if="activeBg === 'explore-grid-pulse'" class="z-[3]" />
      <HomeHeroBgExploreDepthDriftLite v-else-if="activeBg === 'explore-depth-drift'" class="z-[3]" />
      <!-- Line-art, reimagined in 3D -->
      <HomeHeroBgLinesCurves3DFloating v-else-if="activeBg === 'lines-3d-curves-floating'" class="z-[3]" />
      <HomeHeroBgLinesGrid3DConstellation v-else-if="activeBg === 'lines-3d-grid-constellation'" class="z-[3]" />
      <HomeHeroBgLinesMinimal3DRibbon v-else-if="activeBg === 'lines-3d-minimal-ribbon'" class="z-[3]" />
    </ClientOnly>

    <!-- Scrim: soft light pool behind the headline/CTA text, sits above the
         background treatment so text stays readable. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,theme(colors.paper/0.4),transparent_70%)]"
    />

    <div
      v-if="isDev"
      class="fixed bottom-4 right-4 z-50 flex max-h-[80vh] w-64 flex-col overflow-y-auto rounded-2xl border border-navy-100 bg-paper/95 p-2 text-xs shadow-lg backdrop-blur"
    >
      <div v-for="group in bgGroups" :key="group.label" class="mb-1">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-2 py-1.5 font-display font-semibold text-navy-700 hover:bg-navy-50"
          @click="openGroup = openGroup === group.label ? '' : group.label"
        >
          {{ group.label }}
          <span class="text-navy-400">{{ openGroup === group.label ? '−' : '+' }}</span>
        </button>
        <div v-if="openGroup === group.label" class="mt-1 flex flex-col gap-0.5 pl-2">
          <button
            v-for="opt in group.options"
            :key="opt.value"
            type="button"
            class="rounded-lg px-2 py-1.5 text-left font-body transition-colors"
            :class="activeBg === opt.value ? 'bg-navy-700 text-paper' : 'text-navy-700 hover:bg-navy-50'"
            @click="activeBg = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
    <BaseContainer>
      <div data-hero-content class="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div ref="headingWrapRef" class="relative max-w-4xl md:max-w-none">
          <h1 ref="headingRef" class="font-extrabold leading-[1.04] tracking-tight text-display-lg md:text-display-xl">
            {{ headline }}
          </h1>
          <h1
            ref="spotlightRef"
            class="pointer-events-none absolute inset-0 font-extrabold leading-[1.04] tracking-tight text-yellow-500 text-display-lg cursor-spotlight md:text-display-xl"
            aria-hidden="true"
          >
            {{ headline }}
          </h1>
          <h1
            ref="shineRef"
            class="pointer-events-none absolute inset-0 font-extrabold leading-[1.04] tracking-tight text-display-lg hero-shine md:text-display-xl"
            aria-hidden="true"
          >
            {{ headline }}
          </h1>
        </div>

        <p ref="subtextRef" class="mt-6 max-w-2xl text-body-lg text-muted">
          {{ subtext }}
        </p>

        <div ref="ctaRowRef" class="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <div ref="ctaPrimaryRef" class="inline-block">
            <a :href="ctaPrimary.to" class="btn-primary" @click.prevent="goToSelectedWork">
              {{ ctaPrimary.label }}
            </a>
          </div>
          <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="btn-outline">
            {{ ctaSecondary.label }}
          </a>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
