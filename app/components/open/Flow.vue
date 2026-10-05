<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// END-TO-END ECOSYSTEM FLOW — the brief's 9-step storytelling flow.
// Integration / Governance / Auditability is drawn as the rail every step
// stands on, not a 10th step; e-Procurement is deliberately not a step or a
// hub. Desktop + motion: the stage pins and the steps travel sideways while
// the Signal line fills and each passed step is checked. Below desktop /
// reduced motion: a vertical flow with the line on the left.
const { flow, flowNote, foundation, modules } = useOpen()
const { scrollTo } = useOpenDemo()
const activeModule = useState<string>('open-active-module', () => 'e-procurement')

const stageRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const fillRef = ref<HTMLElement | null>(null)
const current = ref(0)

const moduleIndex = (id?: string) => modules.find((m) => m.id === id)?.index

const openModule = (id: string) => {
  activeModule.value = id
  scrollTo('solutions')
}

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
        end: () => `+=${distance() + window.innerHeight * 0.4}`,
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (fillRef.value) fillRef.value.style.transform = `scaleX(${self.progress})`
          current.value = Math.min(flow.length - 1, Math.floor(self.progress * flow.length))
        }
      }
    })
    tl.to({}, { duration: 0.08 }).to(track, { x: () => -distance(), duration: 1 }).to({}, { duration: 0.08 })
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      gsap.set(track, { clearProps: 'x' })
      current.value = 0
    }
  })

  // Below desktop: steps light up as they cross the middle of the screen.
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}`, () => {
    const items = track.querySelectorAll<HTMLElement>('[data-motion-card]')
    const triggers = Array.from(items).map((el, i) =>
      ScrollTrigger.create({ trigger: el, start: 'top 60%', onEnter: () => (current.value = i), onLeaveBack: () => (current.value = Math.max(0, i - 1)) })
    )
    return () => triggers.forEach((t) => t.kill())
  })

  mm.add(reducedMotionQuery.reduce, () => {
    current.value = flow.length - 1
  })
})
</script>

<template>
  <section id="ecosystem" class="surface-light relative overflow-hidden" style="--lift-x: 12%; --lift-y: 10%">
    <div ref="stageRef" class="relative flex flex-col py-24 tablet:py-32 desktop:h-[100svh] desktop:min-h-[760px] desktop:justify-center desktop:py-0">
      <BaseGridLines tone="light" />
      <div aria-hidden="true" class="open-glow pointer-events-none absolute -left-[12%] top-[30%] h-[40vw] max-h-[560px] w-[40vw] max-w-[560px] opacity-70" />

      <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="Ecosystem" meta="03 / 11" />
        <div class="mt-10 grid gap-6 desktop:mt-10 desktop:grid-cols-12 desktop:items-end">
          <OpenHeading class="desktop:col-span-8" eyebrow="OPEN End-to-End Ecosystem" before="From request to " mark="finance" />
          <p class="m-center max-w-[22rem] text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.65)] desktop:col-span-4 desktop:justify-self-end desktop:text-right">{{ flowNote }}</p>
        </div>
      </BaseContainer>

      <!-- Track: horizontal (desktop) / vertical (below) -->
      <div data-motion-canvas class="relative z-10 mt-12 desktop:mt-14 desktop:overflow-hidden">
        <div class="container-page desktop:max-w-none desktop:px-[max(4vw,calc((100vw-1440px)/2+4vw))]">
          <ol ref="trackRef" data-motion-track class="relative flex flex-col desktop:w-max desktop:flex-row">
            <!-- Signal line: vertical below desktop, horizontal on desktop -->
            <span aria-hidden="true" class="absolute bottom-10 left-[19px] top-6 w-px bg-[color:rgba(3,60,89,0.16)] desktop:hidden" />
            <span aria-hidden="true" class="motion-decorative absolute left-5 right-0 top-[19px] hidden h-px bg-[color:rgba(3,60,89,0.16)] desktop:block">
              <span ref="fillRef" class="absolute inset-0 origin-left scale-x-0 bg-pastiYellow-500" />
            </span>

            <li
              v-for="(s, i) in flow"
              :key="s.index"
              data-motion-card
              class="relative flex gap-4 pb-4 last:pb-0 desktop:w-[272px] desktop:shrink-0 desktop:flex-col desktop:gap-5 desktop:pb-0 desktop:pr-4"
            >
              <span
                class="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-[background-color,border-color,color,box-shadow] duration-500 ease-editorial"
                :class="i <= current ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy shadow-[0_0_0_6px_rgba(251,186,0,0.18)]' : 'border-[color:rgba(3,60,89,0.2)] bg-pureWhite text-[color:rgba(3,60,89,0.5)]'"
              >
                <svg v-if="i <= current" viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                <span v-else class="font-mono text-[11px] font-semibold">{{ s.index }}</span>
              </span>
              <article
                class="flex min-h-[124px] flex-1 flex-col rounded-[20px] border bg-pureWhite p-5 transition-[border-color,box-shadow,transform] duration-500 ease-editorial desktop:min-h-[200px] desktop:p-6"
                :class="i === current ? 'border-[color:rgba(251,186,0,0.6)] shadow-[0_30px_60px_-34px_rgba(3,60,89,0.6)] desktop:-translate-y-1' : 'border-[color:rgba(3,60,89,0.08)] shadow-[0_20px_44px_-34px_rgba(3,60,89,0.45)]'"
              >
                <span class="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.5)]">
                  {{ s.index }}<span class="h-1 w-1 rounded-full bg-pastiYellow-500" /><span class="h-px flex-1 bg-[color:rgba(3,60,89,0.12)]" />Step
                </span>
                <h3 class="mt-4 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-slateNavy tablet:text-[24px]">{{ s.label }}</h3>
                <div class="mt-auto flex items-end justify-between gap-3 pt-4">
                  <button
                    v-if="s.module"
                    type="button"
                    class="group inline-flex min-h-10 items-center gap-2 font-display text-[13px] font-semibold text-slateNavy"
                    @click="openModule(s.module)"
                  >
                    <span class="rounded-full bg-[color:rgba(3,60,89,0.07)] px-2 py-0.5 font-mono text-[11px]">{{ moduleIndex(s.module) }}</span>
                    See the module
                    <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  </button>
                  <span v-else />
                  <LayoutBrandMark surface="light" :height="9" class="mb-1.5 opacity-70" />
                </div>
              </article>
            </li>
          </ol>
        </div>
      </div>

      <!-- Foundation rail: what every step stands on -->
      <BaseContainer class="relative z-10 mt-12 desktop:mt-14">
        <div class="flex flex-col items-center gap-3 rounded-[18px] border border-[color:rgba(3,60,89,0.14)] bg-[color:rgba(255,255,255,0.7)] px-5 py-4 tablet:flex-row tablet:justify-between">
          <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Across every step</span>
          <span class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <template v-for="(f, i) in foundation" :key="f">
              <span v-if="i" aria-hidden="true" class="h-1 w-1 rounded-full bg-pastiYellow-500" />
              <span class="font-display text-[16px] font-bold text-slateNavy tablet:text-[18px]">{{ f }}</span>
            </template>
          </span>
        </div>
      </BaseContainer>
    </div>
  </section>
</template>
