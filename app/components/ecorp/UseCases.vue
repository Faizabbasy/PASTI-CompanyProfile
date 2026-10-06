<script setup lang="ts">
import gsap from 'gsap'

// USE CASES — six TEMPORARY example scenarios (illustrative; not client
// implementations — said on the page and flagged in the data).
// Desktop + motion: the stage pins and the scenario panels travel sideways
// with scroll (one transform on the track, scrubbed); the panel nearest the
// centre becomes active and its process chain lights step by step. A
// scrubbed progress rule + counter track the journey.
// Below desktop: native swipe rail with the site's snap controls.
// Reduced motion (desktop): the shared [data-motion-*] rules stack the
// panels vertically — every scenario reachable without the pin.
const { useCases, useCaseNote } = useEcorporate()

const railRef = ref<HTMLElement | null>(null)
const { active: railActive, touched, go, next, prev } = useSnapRail(railRef)

const stageRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const current = ref(0)
const pad = (n: number) => String(n).padStart(2, '0')

useGsapContext(() => {
  const stage = stageRef.value
  const track = trackRef.value
  if (!stage || !track) return
  const mm = gsap.matchMedia()
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    const distance = () => Math.max(0, track.scrollWidth - track.parentElement!.clientWidth)
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressRef.value) progressRef.value.style.transform = `scaleX(${self.progress})`
          current.value = Math.min(useCases.length - 1, Math.round(self.progress * (useCases.length - 1)))
        }
      }
    })
    tl.to(track, { x: () => -distance() })
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      gsap.set(track, { clearProps: 'x' })
      current.value = 0
    }
  })
  mm.add(reducedMotionQuery.reduce, () => {
    current.value = -1 // every chain shown complete
  })
})

const stepOn = (panel: number) => current.value === -1 || panel === current.value
</script>

<template>
  <section id="use-cases" class="surface-light relative overflow-hidden" style="--lift-x: 88%; --lift-y: 80%">
    <!-- ===== Desktop: pinned horizontal story ===== -->
    <div ref="stageRef" class="uc-stage relative hidden flex-col justify-center desktop:flex desktop:h-[100svh] desktop:min-h-[760px]" data-motion-canvas>
      <div aria-hidden="true" class="ec-dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,transparent,#000_30%,#000_70%,transparent)]" />
      <BaseGridLines tone="light" />
      <EcorpMarks label="06 / 12 · Example scenarios" />

      <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="Use cases" meta="06 / 12" />
        <div class="mt-8 flex items-end justify-between gap-10">
          <EcorpHeading eyebrow="Use cases" before="Where it " mark="fits in" />
          <div class="flex w-64 shrink-0 flex-col items-end gap-3 pb-2">
            <span class="font-display text-token-body-large font-semibold tabular-nums text-slateNavy">{{ pad(Math.max(current, 0) + 1) }}<span class="text-[color:rgba(3,60,89,0.35)]"> / {{ pad(useCases.length) }}</span></span>
            <span class="relative block h-[3px] w-full overflow-hidden bg-[color:rgba(3,60,89,0.12)]"><span ref="progressRef" class="absolute inset-0 origin-left scale-x-0 bg-pastiYellow-500" /></span>
            <span class="max-w-[16rem] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">{{ useCaseNote }}</span>
          </div>
        </div>
      </BaseContainer>

      <div class="uc-clip relative z-10 mt-10 overflow-hidden">
        <ol ref="trackRef" data-motion-track class="flex w-max gap-6 px-[max(4vw,calc((100vw-1440px)/2+4vw))]" aria-label="Example scenarios">
          <li
            v-for="(u, i) in useCases"
            :key="u.id"
            data-motion-card
            class="relative flex h-[min(40svh,370px)] w-[min(600px,42vw)] shrink-0 flex-col border bg-pureWhite p-8 transition-[border-color,box-shadow] duration-500"
            :class="i === current ? 'border-slateNavy shadow-[0_50px_100px_-60px_rgba(3,60,89,0.8)]' : 'border-[color:rgba(3,60,89,0.14)]'"
          >
            <span aria-hidden="true" class="ec-outline absolute -right-2 -top-6 text-[150px]">{{ pad(i + 1) }}</span>
            <div class="relative flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.5)]">
              <span class="flex items-center gap-2"><span aria-hidden="true" class="h-1.5 w-1.5" :class="i === current ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.3)]'" />Scenario {{ pad(i + 1) }}</span>
              <LayoutBrandMark surface="light" :height="10" />
            </div>
            <h3 class="relative mt-6 max-w-[80%] font-display text-[length:clamp(26px,2.4vw,38px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-slateNavy">{{ u.title }}</h3>
            <p class="relative mt-3 max-w-[30rem] text-[16px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ u.body }}</p>

            <!-- Process chain: lights step by step on the active panel -->
            <ol class="relative mt-auto grid gap-0" :style="{ gridTemplateColumns: `repeat(${u.steps.length}, minmax(0, 1fr))` }" :aria-label="`${u.title} steps`">
              <li v-for="(s, si) in u.steps" :key="s" class="relative pt-5">
                <span aria-hidden="true" class="absolute left-0 right-0 top-[7px] h-[2px] bg-[color:rgba(3,60,89,0.12)]" />
                <span
                  aria-hidden="true"
                  class="absolute left-0 top-[7px] h-[2px] w-full origin-left bg-pastiYellow-500 transition-transform duration-500 ease-editorial"
                  :class="stepOn(i) ? 'scale-x-100' : 'scale-x-0'"
                  :style="{ transitionDelay: stepOn(i) ? `${si * 160}ms` : '0ms' }"
                />
                <span
                  aria-hidden="true"
                  class="absolute left-0 top-0 h-4 w-4 border-2 transition-colors duration-300"
                  :class="stepOn(i) ? 'border-pastiYellow-500 bg-pastiYellow-500' : 'border-[color:rgba(3,60,89,0.25)] bg-pureWhite'"
                  :style="{ transitionDelay: stepOn(i) ? `${si * 160}ms` : '0ms' }"
                />
                <span class="block pr-2 font-display text-[14px] font-bold text-slateNavy">{{ s }}</span>
              </li>
            </ol>
          </li>
        </ol>
      </div>
    </div>

    <!-- ===== Below desktop: swipe rail ===== -->
    <div class="relative py-24 tablet:py-32 desktop:hidden">
      <BaseGridLines tone="light" />
      <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="Use cases" meta="06 / 12" />
        <EcorpHeading class="mt-12" eyebrow="Use cases" before="Where it " mark="fits in" />
        <p class="m-center mt-4 max-w-[22rem] font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">{{ useCaseNote }}</p>
      </BaseContainer>
      <ul ref="railRef" aria-label="Example scenarios" class="snap-rail relative z-10 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-gutter px-gutter pb-2">
        <li v-for="(u, i) in useCases" :key="u.id" class="flex w-[80vw] max-w-[380px] shrink-0 snap-start flex-col border border-[color:rgba(3,60,89,0.14)] bg-pureWhite p-6">
          <div class="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.5)]">
            <span>Scenario {{ pad(i + 1) }}</span>
            <LayoutBrandMark surface="light" :height="9" class="opacity-70" />
          </div>
          <h3 class="mt-6 font-display text-[23px] font-bold leading-[1.12] tracking-[-0.02em] text-slateNavy">{{ u.title }}</h3>
          <p class="mt-3 text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.7)]">{{ u.body }}</p>
          <ol class="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2 pt-8" :aria-label="`${u.title} steps`">
            <li v-for="(s, si) in u.steps" :key="s" class="flex items-center gap-2 font-display text-[12px] font-bold text-slateNavy">
              <span aria-hidden="true" class="h-2.5 w-2.5" :class="si === u.steps.length - 1 ? 'bg-pastiYellow-500' : 'border border-slateNavy'" />{{ s }}
              <span v-if="si < u.steps.length - 1" aria-hidden="true" class="h-px w-4 bg-[color:rgba(3,60,89,0.3)]" />
            </li>
          </ol>
        </li>
      </ul>
      <BaseContainer class="relative z-10 mt-6">
        <BaseSnapControls :count="useCases.length" :active="railActive" :touched="touched" noun="scenario" @go="go" @prev="prev" @next="next" />
      </BaseContainer>
    </div>
  </section>
</template>

<style scoped>
/* Reduced motion (desktop): no pin — let the stacked panels set the height. */
[data-reduced-motion='true'] .uc-stage {
  height: auto;
  padding: 7rem 0;
}
[data-reduced-motion='true'] .uc-clip {
  overflow: visible;
}
</style>
