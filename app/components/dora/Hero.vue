<script setup lang="ts">
import gsap from 'gsap'
import type { VerifyStep } from '~/composables/useDora'

// 01 HERO — DORA / Document Recognition & Analysis / "Turn Documents Into
// Structured, Verifiable Data." Copy left; the reconstructed verification
// workspace right (synthetic letter, illustrative values). On entry it
// tells the product in one pass: the page is recognised (cyan scan) →
// fields land with confidence → the lower-confidence field is flagged →
// a person corrects it → verified. A cyan scan line crosses the headline
// once (the Signal), a giant outline DORA sits behind as a watermark.
// Reduced motion: the verified workspace, static.
const { hero } = useDoraPage()
const scrollTo = useFastScroll()
const stageRef = ref<HTMLElement | null>(null)
const step = ref<VerifyStep>(-1)
let timers: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches) {
    step.value = 4
    return
  }
  timers = [setTimeout(() => (step.value = 0), 2000), setTimeout(() => (step.value = 2), 3400), setTimeout(() => (step.value = 3), 5200), setTimeout(() => (step.value = 4), 6600)]
})
onBeforeUnmount(() => timers.forEach(clearTimeout))

useGsapContext(() => {
  const stage = stageRef.value
  if (!stage) return
  const fades = stage.querySelectorAll<HTMLElement>('[data-dh-fade]')
  const words = stage.querySelectorAll<HTMLElement>('[data-dh-hword]')
  const scan = stage.querySelector<HTMLElement>('[data-dh-scan]')
  const board = stage.querySelector<HTMLElement>('[data-dh-board]')
  const mark = stage.querySelector<HTMLElement>('[data-dh-mark]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(fades, { autoAlpha: 0, y: 18 })
    gsap.set(words, { yPercent: 110 })
    gsap.set(scan, { yPercent: 0, autoAlpha: 0 })
    gsap.set(board, { clipPath: 'inset(0% 0% 100% 0% round 18px)' })
    gsap.set(mark, { yPercent: 18, autoAlpha: 0 })
    const tl = gsap.timeline({ delay: 0.2 })
    tl.to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 })
      .to(words, { yPercent: 0, duration: motionTier.cinematicMin + 0.1, ease: approvedEase.gsapPrimary, stagger: 0.07 }, 0.25)
      .to(scan, { autoAlpha: 1, duration: 0.15 }, 0.85)
      .to(scan, { y: () => scan?.parentElement?.offsetHeight ?? 200, duration: 1.1, ease: approvedEase.gsapStandard }, 0.85)
      .to(scan, { autoAlpha: 0, duration: 0.25 }, 1.75)
      .to(board, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapCinematic }, 0.15)
      .to(mark, { yPercent: 0, autoAlpha: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.1)
    return () => tl.kill()
  })
})
</script>

<template>
  <section id="overview" ref="stageRef" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy pb-16 pt-28 text-pureWhite desktop:flex desktop:min-h-[100svh] desktop:flex-col desktop:justify-center desktop:pb-12 desktop:pt-32">
    <BaseGridLines tone="dark" />
    <!-- Ruled-paper texture: faint baselines across the hero. -->
    <div aria-hidden="true" class="dh-lines pointer-events-none absolute inset-0 opacity-60" />
    <div aria-hidden="true" class="pointer-events-none absolute -right-[12%] top-[8%] h-[75%] w-[60%] rounded-full" style="background: radial-gradient(closest-side, rgba(31, 214, 238, 0.12), transparent)" />
    <span data-dh-mark aria-hidden="true" class="dh-mark pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none font-display font-extrabold leading-none">DORA</span>

    <BaseContainer class="relative z-10 w-full">
      <div class="grid items-center gap-14 desktop:grid-cols-12 desktop:gap-10">
        <div class="m-center desktop:col-span-5">
          <div data-dh-fade><BaseHeroMarker surface="dark" :label="hero.eyebrow" meta="by PASTI Technology" /></div>
          <div data-dh-fade class="mt-8"><DoraMark surface="dark" :size="44" /></div>
          <p data-dh-fade class="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:rgba(255,255,255,0.62)]">{{ hero.full }}</p>
          <h1 class="hero-title hero-title--dark relative mt-7 !text-[clamp(36px,4.4vw,68px)]" aria-label="Turn Documents Into Structured, Verifiable Data.">
            <span aria-hidden="true" class="block"><span class="dh-hmask"><span data-dh-hword class="inline-block">Turn</span></span> <span class="dh-hmask"><span data-dh-hword class="inline-block">Documents</span></span> <span class="dh-hmask"><span data-dh-hword class="inline-block">Into</span></span> <span class="dh-hmask"><span data-dh-hword class="inline-block">Structured,</span></span> <span class="dh-hmask"><span data-dh-hword class="inline-block text-pastiYellow-500">Verifiable</span></span> <span class="dh-hmask"><span data-dh-hword class="inline-block text-pastiYellow-500">Data.</span></span></span>
            <!-- Signal: a recognition line crosses the headline once. -->
            <span data-dh-scan aria-hidden="true" class="pointer-events-none absolute -left-2 -right-2 top-0 h-[2px] rounded-full bg-doraCyan opacity-0 shadow-[0_0_22px_rgba(31,214,238,0.8)]" />
          </h1>
          <p data-dh-fade class="hero-lede hero-lede--dark m-center mt-6 desktop:max-w-[31rem]">{{ hero.body }}</p>
          <div data-dh-fade class="mt-9">
            <BaseHeroCtas
              surface="dark"
              :primary="{ label: 'Request a Demo' }"
              :secondary="{ label: 'Explore DORA', down: true }"
              @primary="scrollTo('demo')"
              @secondary="scrollTo('verification')"
            />
          </div>
          <ul data-dh-fade class="m-center-row mt-10 flex flex-wrap gap-2">
            <li v-for="(f, i) in hero.facts" :key="i" class="inline-flex items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.16)] px-3 py-1.5 font-display text-[12px] font-semibold text-[color:rgba(255,255,255,0.85)]">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-doraCyan" />{{ f }}
            </li>
          </ul>
        </div>

        <div class="desktop:col-span-7">
          <figure>
            <div data-dh-board class="shadow-[0_50px_100px_-40px_rgba(0,8,16,0.9)]"><DoraWorkspace :step="step" compact /></div>
            <figcaption class="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">
              <span>Recognise · extract · review · verify</span>
              <span>Synthetic sample · illustrative values</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.dh-hmask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
.dh-mark {
  font-size: clamp(140px, 30vw, 460px);
  letter-spacing: -0.06em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.07);
}
.dh-lines {
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 100% 34px;
  mask-image: linear-gradient(90deg, transparent, #000 30%, #000 70%, transparent);
}
</style>
