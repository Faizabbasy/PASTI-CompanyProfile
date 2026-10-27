<script setup lang="ts">
import gsap from 'gsap'
import type { GanttStep } from '~/composables/useFast'

// 01 HERO — FAST / Flexible Advanced Scheduling Technology / "Your
// Production. Your Rules." Copy left; the reconstructed Scheduling Board
// right (sample data). The board tells the product in three beats on
// entry: operations are placed → validation flags the one that overlaps
// planned maintenance → it is moved and the plan turns valid. A yellow
// playhead sweeps the headline once (the scheduling "now" line), a giant
// outline FAST sits behind as a watermark, and on desktop with a fine
// pointer the board tilts a few degrees toward the cursor (transform only).
// Reduced motion: the resolved board, static, no sweep, no tilt.
const { hero } = useFastPage()
const t = useT()
// Headline lines, split into the masked words the entrance animates.
const h1Lines = computed(() => [t('Your Production.'), t('Your Rules.')].map((l) => l.split(' ')))
const scrollTo = useFastScroll()
const stageRef = ref<HTMLElement | null>(null)
const step = ref<GanttStep>(0)
let timers: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches) {
    step.value = 3
    return
  }
  timers = [setTimeout(() => (step.value = 1), 700), setTimeout(() => (step.value = 2), 2300), setTimeout(() => (step.value = 3), 3900)]
})
onBeforeUnmount(() => timers.forEach(clearTimeout))

useGsapContext(() => {
  const stage = stageRef.value
  if (!stage) return
  const fades = stage.querySelectorAll<HTMLElement>('[data-fh-fade]')
  const words = stage.querySelectorAll<HTMLElement>('[data-fh-hword]')
  const sweep = stage.querySelector<HTMLElement>('[data-fh-sweep]')
  const board = stage.querySelector<HTMLElement>('[data-fh-board]')
  const tiltEl = stage.querySelector<HTMLElement>('[data-fh-tilt]')
  const mark = stage.querySelector<HTMLElement>('[data-fh-mark]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(fades, { autoAlpha: 0, y: 18 })
    gsap.set(words, { yPercent: 110 })
    gsap.set(sweep, { x: 0, autoAlpha: 0 })
    gsap.set(board, { clipPath: 'inset(0% 0% 100% 0% round 18px)' })
    gsap.set(mark, { yPercent: 18, autoAlpha: 0 })
    const tl = gsap.timeline({ delay: 0.2 })
    tl.to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 })
      .to(words, { yPercent: 0, duration: motionTier.cinematicMin + 0.1, ease: approvedEase.gsapPrimary, stagger: 0.08 }, 0.25)
      .to(sweep, { autoAlpha: 1, duration: 0.15 }, 0.75)
      .to(sweep, { x: () => sweep?.parentElement?.offsetWidth ?? 600, duration: 1.1, ease: approvedEase.gsapStandard }, 0.75)
      .to(sweep, { autoAlpha: 0, duration: 0.25 }, 1.6)
      .to(board, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapCinematic }, 0.15)
      .to(mark, { yPercent: 0, autoAlpha: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.1)

    let off = () => {}
    if (tiltEl && window.matchMedia('(pointer: fine)').matches && window.matchMedia(breakpointQuery.desktopUp).matches) {
      gsap.set(tiltEl, { transformPerspective: 1400 })
      const rx = gsap.quickTo(tiltEl, 'rotationX', { duration: 0.9, ease: approvedEase.gsapStandard })
      const ry = gsap.quickTo(tiltEl, 'rotationY', { duration: 0.9, ease: approvedEase.gsapStandard })
      const onMove = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect()
        ry(((e.clientX - r.left) / r.width - 0.5) * 7)
        rx(-((e.clientY - r.top) / r.height - 0.5) * 5)
      }
      const onLeave = () => { rx(0); ry(0) }
      stage.addEventListener('pointermove', onMove, { passive: true })
      stage.addEventListener('pointerleave', onLeave)
      off = () => {
        stage.removeEventListener('pointermove', onMove)
        stage.removeEventListener('pointerleave', onLeave)
      }
    }
    return () => { tl.kill(); off() }
  })
})

const stepLabel = computed(() => t(['Queue', 'Scheduled', 'Validated · 1 conflict', 'Adjusted · valid'][step.value]!))
</script>

<template>
  <section id="overview" ref="stageRef" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy pb-16 pt-28 text-pureWhite desktop:flex desktop:min-h-[100svh] desktop:flex-col desktop:justify-center desktop:pb-12 desktop:pt-32">
    <BaseGridLines tone="dark" />
    <!-- Time ruler texture: faint hour ticks across the hero. -->
    <div aria-hidden="true" class="fh-ticks pointer-events-none absolute inset-0 opacity-60" />
    <div aria-hidden="true" class="pointer-events-none absolute -right-[12%] top-[8%] h-[75%] w-[60%] rounded-full" style="background: radial-gradient(closest-side, rgba(251, 186, 0, 0.13), transparent)" />
    <!-- Watermark: giant outline FAST along the bottom edge. -->
    <span data-fh-mark aria-hidden="true" class="fh-mark pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none font-display font-extrabold leading-none">FAST</span>

    <BaseContainer class="relative z-10 w-full">
      <div class="grid items-center gap-14 desktop:grid-cols-12 desktop:gap-10">
        <div class="m-center desktop:col-span-5">
          <div data-fh-fade><BaseHeroMarker surface="dark" :label="hero.eyebrow" :meta="t('by PASTI Technology')" /></div>
          <div data-fh-fade class="mt-8"><FastMark surface="dark" :size="44" /></div>
          <p data-fh-fade class="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:rgba(255,255,255,0.62)]">{{ hero.full }}</p>
          <h1 class="hero-title hero-title--dark relative mt-7" :aria-label="`${t('Your Production.')} ${t('Your Rules.')}`">
            <span aria-hidden="true" class="block">
              <template v-for="(line, li) in h1Lines" :key="li">
                <template v-for="(w, wi) in line" :key="wi"><span class="fh-hmask"><span data-fh-hword class="inline-block" :class="li === 1 ? 'text-pastiYellow-500' : ''">{{ w }}</span></span>{{ wi < line.length - 1 ? ' ' : '' }}</template>
                <br v-if="li === 0">
              </template>
            </span>
            <!-- Playhead: the scheduling "now" line sweeps the headline once. -->
            <span data-fh-sweep aria-hidden="true" class="pointer-events-none absolute -bottom-2 -top-2 left-0 w-[3px] rounded-full bg-pastiYellow-500 opacity-0 shadow-[0_0_24px_rgba(251,186,0,0.7)]" />
          </h1>
          <p data-fh-fade class="hero-lede hero-lede--dark m-center mt-6 desktop:max-w-[30rem]">{{ hero.body }}</p>
          <div data-fh-fade class="mt-9">
            <BaseHeroCtas
              surface="dark"
              :primary="{ label: t('Request a Demo') }"
              :secondary="{ label: t('Explore FAST'), down: true }"
              @primary="scrollTo('demo')"
              @secondary="scrollTo('scheduling')"
            />
          </div>
          <ul data-fh-fade class="m-center-row mt-10 flex flex-wrap gap-2">
            <li v-for="(f, i) in hero.facts" :key="i" class="inline-flex items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.16)] px-3 py-1.5 font-display text-[12px] font-semibold text-[color:rgba(255,255,255,0.85)]">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ f }}
            </li>
          </ul>
        </div>

        <div data-fh-tilt class="desktop:col-span-7 [transform-style:preserve-3d]">
          <figure data-fh-board class="overflow-hidden rounded-[18px] bg-pureWhite text-slateNavy shadow-[0_50px_100px_-40px_rgba(0,8,16,0.9)] ring-1 ring-[color:rgba(255,255,255,0.18)]">
            <div class="flex items-center gap-1.5 border-b border-[color:rgba(3,60,89,0.1)] bg-surfaceNeutral px-4 py-2.5" aria-hidden="true">
              <span class="h-2.5 w-2.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" />
              <span class="h-2.5 w-2.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" />
              <span class="h-2.5 w-2.5 rounded-full bg-pastiYellow-500" />
              <span class="ml-3 h-5 flex-1 truncate rounded-full bg-pureWhite px-3 font-mono text-[10px] leading-5 text-[color:rgba(3,60,89,0.45)]">fast · {{ t('scheduling board') }}</span>
            </div>
            <div class="px-1 pb-3 pt-4 tablet:px-3">
              <FastGantt :step="step" compact view="day" :now="9" />
            </div>
            <figcaption class="flex items-center justify-between gap-3 border-t border-[color:rgba(3,60,89,0.08)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">
              <span class="inline-flex items-center gap-2" aria-live="polite">
                <span class="h-1.5 w-1.5 rounded-full" :class="step === 2 ? 'bg-[#C2412D]' : step === 3 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.35)]'" />{{ stepLabel }}
              </span>
              <span>{{ t('Illustrative sample data') }}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.fh-hmask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
.fh-mark {
  font-size: clamp(140px, 30vw, 460px);
  letter-spacing: -0.06em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.07);
}
.fh-ticks {
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 7.5% 100%;
  mask-image: linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent);
}
</style>
