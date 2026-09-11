<script setup lang="ts">
// Intro overlay — plays once on first load, then hands off to the page via
// markIntroReady(). Dev-only switcher (same pattern as Hero's background
// picker) lets us compare 20 intro directions grouped into 3D / 2D / Motion
// / Agency before picking one. In production this always plays the chosen
// intro; prefers-reduced-motion collapses straight through for every variant.
import { markIntroReady } from '~/composables/useIntroReady'

type IntroOption =
  | 'none'
  | '3d-shatter' | '3d-tunnel' | '3d-wordmark' | '3d-orbit' | '3d-portal'
  | '2d-typewriter' | '2d-maskwipe' | '2d-countergrid' | '2d-inkspread' | '2d-splitreveal'
  | 'motion-curtain' | 'motion-progress' | 'motion-pulse' | 'motion-crossfade' | 'motion-scan'
  | 'agency-logostack' | 'agency-marqueewipe' | 'agency-coordinates' | 'agency-slabreveal' | 'agency-glyphcycle'
  | '3d-portal-wordmark' | '2d-ink-splitreveal' | 'motion-curtain-pulse' | 'agency-slab-glyph'
  | 'agency-counter-logostack'

interface IntroItem {
  value: IntroOption
  label: string
}
interface IntroGroup {
  label: string
  options: IntroItem[]
}

const introGroups: IntroGroup[] = [
  {
    label: '3D',
    options: [
      { value: '3d-shatter', label: 'Shard shatter' },
      { value: '3d-tunnel', label: 'Tunnel dive' },
      { value: '3d-wordmark', label: 'Extruded wordmark' },
      { value: '3d-orbit', label: 'Orbiting rings' },
      { value: '3d-portal', label: 'Portal iris' },
      { value: '3d-portal-wordmark', label: 'Portal + wordmark bloom' }
    ]
  },
  {
    label: '2D',
    options: [
      { value: '2d-typewriter', label: 'Typewriter reveal' },
      { value: '2d-maskwipe', label: 'Mask wipe' },
      { value: '2d-countergrid', label: 'Counter + grid' },
      { value: '2d-inkspread', label: 'Ink spread logo' },
      { value: '2d-splitreveal', label: 'Split panel reveal' },
      { value: '2d-ink-splitreveal', label: 'Ink bloom + split panels' }
    ]
  },
  {
    label: 'Motion',
    options: [
      { value: 'motion-curtain', label: 'Curtain rise' },
      { value: 'motion-progress', label: 'Progress bar' },
      { value: 'motion-pulse', label: 'Pulse dot' },
      { value: 'motion-crossfade', label: 'Soft crossfade' },
      { value: 'motion-scan', label: 'Scan line reveal' },
      { value: 'motion-curtain-pulse', label: 'Curtain + pulse bloom' }
    ]
  },
  {
    label: 'Agency',
    options: [
      { value: 'agency-logostack', label: 'Logo stack cycle' },
      { value: 'agency-marqueewipe', label: 'Marquee wipe' },
      { value: 'agency-coordinates', label: 'Coordinates readout' },
      { value: 'agency-slabreveal', label: 'Slab reveal' },
      { value: 'agency-glyphcycle', label: 'Glyph cycle' },
      { value: 'agency-slab-glyph', label: 'Slab reveal + glyph decrypt' },
      { value: 'agency-counter-logostack', label: 'Counter grid' }
    ]
  },
  {
    label: 'Off',
    options: [{ value: 'none', label: 'No intro (skip)' }]
  }
]

const activeIntro = ref<IntroOption>('agency-counter-logostack')
const openGroup = ref('')
// Dev switcher panel disabled: the intro direction is decided
// ('agency-counter-logostack' — Counter grid, then Logo stack cycle), so
// the picker no longer needs to render even in dev. Flip back to
// `import.meta.dev` if comparing directions again becomes necessary.
const isDev = false
const replayKey = ref(0)

// Explicit visibility flag for the intro overlay — set to false the moment
// the intro's own 'complete' event fires, which removes it from the DOM
// via v-if. Deliberately NOT relying on the intro component's own GSAP
// fade-out (autoAlpha) to make it visually/interactively inert: if that
// component's timeline ever fails to reach its autoAlpha tween (an error
// mid-sequence, a killed tween, etc.), a `position: fixed; inset: 0` div
// left in the DOM at full opacity/pointer-events would silently block
// every click on the page underneath it — including this dev panel's own
// Replay button — while showing nothing wrong on screen.
const introVisible = ref(false)

function onIntroComplete() {
  introVisible.value = false
  markIntroReady()
}

// Both sessionStorage restore and prefers-reduced-motion detection need
// `window`, which doesn't exist during SSR — reading them synchronously in
// <script setup> would make the client's first render disagree with the
// server's SSR output (server always sees 'none' / no-reduced-motion),
// causing a hydration mismatch. Server and first client paint both render
// nothing here; the real intro (if any) starts one tick after mount.
const mounted = ref(false)
const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (isDev) {
    const stored = sessionStorage.getItem('intro-preview')
    const allValues = introGroups.flatMap((g) => g.options.map((o) => o.value))
    if (stored && allValues.includes(stored as IntroOption)) {
      activeIntro.value = stored as IntroOption
    }
    watch(activeIntro, (value) => {
      sessionStorage.setItem('intro-preview', value)
      replayKey.value++
      introVisible.value = value !== 'none' && !prefersReducedMotion.value
    })
  }

  mounted.value = true

  if (activeIntro.value === 'none' || prefersReducedMotion.value) {
    markIntroReady()
  } else {
    introVisible.value = true
    // Safety net: if the chosen intro component fails to emit 'complete'
    // for any reason (a thrown error mid-timeline, a WebGL context that
    // never initializes, etc.), the header/hero entrance AND this overlay
    // itself would otherwise stay stuck forever — the overlay blocking
    // every click on the page underneath it. Cap the wait so the page is
    // always usable even if a specific intro is broken.
    setTimeout(() => onIntroComplete(), 12000)
  }
})

function replay() {
  introVisible.value = true
  replayKey.value++
}

</script>

<template>
  <div>
    <template v-if="mounted && introVisible">
      <IntroThreeShatter v-if="activeIntro === '3d-shatter'" :key="replayKey" @complete="onIntroComplete" />
      <IntroThreeTunnel v-else-if="activeIntro === '3d-tunnel'" :key="replayKey" @complete="onIntroComplete" />
      <IntroThreeWordmark v-else-if="activeIntro === '3d-wordmark'" :key="replayKey" @complete="onIntroComplete" />
      <IntroThreeOrbit v-else-if="activeIntro === '3d-orbit'" :key="replayKey" @complete="onIntroComplete" />
      <IntroThreePortal v-else-if="activeIntro === '3d-portal'" :key="replayKey" @complete="onIntroComplete" />
      <IntroThreePortalWordmark v-else-if="activeIntro === '3d-portal-wordmark'" :key="replayKey" @complete="onIntroComplete" />
      <IntroTwoTypewriter v-else-if="activeIntro === '2d-typewriter'" :key="replayKey" @complete="onIntroComplete" />
      <IntroTwoMaskWipe v-else-if="activeIntro === '2d-maskwipe'" :key="replayKey" @complete="onIntroComplete" />
      <IntroTwoCounterGrid v-else-if="activeIntro === '2d-countergrid'" :key="replayKey" @complete="onIntroComplete" />
      <IntroTwoInkSpread v-else-if="activeIntro === '2d-inkspread'" :key="replayKey" @complete="onIntroComplete" />
      <IntroTwoSplitReveal v-else-if="activeIntro === '2d-splitreveal'" :key="replayKey" @complete="onIntroComplete" />
      <IntroTwoInkSplitReveal v-else-if="activeIntro === '2d-ink-splitreveal'" :key="replayKey" @complete="onIntroComplete" />
      <IntroMotionCurtain v-else-if="activeIntro === 'motion-curtain'" :key="replayKey" @complete="onIntroComplete" />
      <IntroMotionProgress v-else-if="activeIntro === 'motion-progress'" :key="replayKey" @complete="onIntroComplete" />
      <IntroMotionPulse v-else-if="activeIntro === 'motion-pulse'" :key="replayKey" @complete="onIntroComplete" />
      <IntroMotionCrossfade v-else-if="activeIntro === 'motion-crossfade'" :key="replayKey" @complete="onIntroComplete" />
      <IntroMotionScan v-else-if="activeIntro === 'motion-scan'" :key="replayKey" @complete="onIntroComplete" />
      <IntroMotionCurtainPulse v-else-if="activeIntro === 'motion-curtain-pulse'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencyLogoStack v-else-if="activeIntro === 'agency-logostack'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencyMarqueeWipe v-else-if="activeIntro === 'agency-marqueewipe'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencyCoordinates v-else-if="activeIntro === 'agency-coordinates'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencySlabReveal v-else-if="activeIntro === 'agency-slabreveal'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencyGlyphCycle v-else-if="activeIntro === 'agency-glyphcycle'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencySlabGlyph v-else-if="activeIntro === 'agency-slab-glyph'" :key="replayKey" @complete="onIntroComplete" />
      <IntroAgencyCounterLogoStack v-else-if="activeIntro === 'agency-counter-logostack'" :key="replayKey" @complete="onIntroComplete" />
    </template>

    <div
      v-if="isDev"
      class="fixed bottom-4 left-4 z-[100] flex max-h-[80vh] w-64 flex-col overflow-y-auto rounded-2xl border border-navy-100 bg-paper/95 p-2 text-xs shadow-lg backdrop-blur"
    >
      <div class="mb-1 flex items-center justify-between px-2 py-1">
        <span class="font-display font-semibold text-navy-700">
          Intro preview
          <span v-if="activeIntro !== 'none'" class="ml-1 font-normal text-navy-400">(auto-plays on select)</span>
        </span>
        <button type="button" class="rounded-full bg-navy-700 px-2 py-1 text-paper" @click="replay">Replay</button>
      </div>
      <div v-for="group in introGroups" :key="group.label" class="mb-1">
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
            :class="activeIntro === opt.value ? 'bg-navy-700 text-paper' : 'text-navy-700 hover:bg-navy-50'"
            @click="activeIntro = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
