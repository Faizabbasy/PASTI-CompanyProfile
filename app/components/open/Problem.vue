<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// PROBLEM → SOLUTION — one composition that changes state, told with the
// brief's own mental model. State A: "e-Procurement digitizes the procurement
// process." — the ecosystem's parts are digital but scattered. State B:
// "OPEN connects the entire procurement ecosystem." — the same parts lock
// into one frame, each checked. Desktop + motion: a short pin scrubs A → B.
// Below desktop / reduced motion: the connected state, both lines stacked.
const { mentalModel, ecosystemParts, problemBody } = useOpen()

const sectionRef = ref<HTMLElement | null>(null)

// "OPEN connects…" → "OPEN" sits on the yellow marker.
const connectsHead = mentalModel.connects.split(' ')[0]
const connectsRest = mentalModel.connects.slice(connectsHead!.length)

// Deterministic scatter (SSR-safe): x/y in px, rotation in deg.
const scatter = [
  [-40, -70, -12], [30, -96, 8], [90, -50, 14],
  [-50, 20, 9], [10, 40, -6], [80, 16, -15],
  [-30, 90, 5], [40, 110, -10], [70, 80, 11]
]

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const mm = gsap.matchMedia()
  const chips = section.querySelectorAll<HTMLElement>('[data-pr-chip]')
  const checks = section.querySelectorAll<HTMLElement>('[data-pr-check]')
  const frame = section.querySelector<HTMLElement>('[data-pr-frame]')
  const lineA = section.querySelector<HTMLElement>('[data-pr-a]')
  const lineB = section.querySelector<HTMLElement>('[data-pr-b]')
  const stage = section.querySelector<HTMLElement>('[data-pr-stage]')

  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    gsap.set(lineB, { yPercent: 105 })
    chips.forEach((c, i) => {
      const [x, y, r] = scatter[i] ?? [0, 0, 0]
      gsap.set(c, { x, y, rotation: r, opacity: 0.55 })
    })
    gsap.set(checks, { scale: 0, transformOrigin: 'center' })
    gsap.set(frame, { opacity: 0, scale: 1.06 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: stage, start: 'top top', end: '+=120%', scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
    })
    tl.to({}, { duration: 0.15 })
      .to(chips, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: approvedEase.gsapStandard, stagger: 0.03 })
      .to(lineA, { yPercent: -105, duration: 0.35, ease: approvedEase.gsapStandard }, '-=0.7')
      .to(lineB, { yPercent: 0, duration: 0.35, ease: approvedEase.gsapStandard }, '<')
      .to(frame, { opacity: 1, scale: 1, duration: 0.5, ease: approvedEase.gsapStandard }, '-=0.3')
      .to(checks, { scale: 1, duration: 0.3, ease: approvedEase.gsapStandard, stagger: 0.03 }, '-=0.4')
      .to({}, { duration: 0.2 })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      gsap.set([chips, checks, frame, lineA, lineB], { clearProps: 'all' })
    }
  })
})
</script>

<template>
  <section ref="sectionRef" class="surface-light relative overflow-hidden" style="--lift-x: 15%; --lift-y: 80%">
    <div data-pr-stage class="relative flex flex-col justify-center py-24 tablet:py-32 desktop:h-[100svh] desktop:min-h-[680px] desktop:py-0">
      <BaseGridLines tone="light" />
      <div aria-hidden="true" class="open-glow pointer-events-none absolute -right-[10%] top-[10%] h-[44vw] max-h-[620px] w-[44vw] max-w-[620px] opacity-80" />
      <span aria-hidden="true" class="open-ghost absolute -bottom-[4%] -left-[2%] hidden desktop:block text-[length:clamp(160px,30vw,460px)]">OPEN</span>

      <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="The shift" meta="02 / 11" />

        <div class="mt-12 grid items-center gap-14 desktop:mt-14 desktop:grid-cols-12 desktop:gap-8">
          <div class="m-center desktop:col-span-5">
            <p class="m-center-row inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
              <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Problem → Solution
            </p>
            <!-- Desktop: A swaps to B. Below desktop: both lines, stacked. -->
            <div class="relative mt-5 hidden overflow-hidden pb-3 desktop:block">
              <h2 data-pr-a class="font-display text-[length:clamp(36px,3.6vw,58px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-[color:rgba(3,60,89,0.42)]">{{ mentalModel.digitizes }}</h2>
              <h2 data-pr-b aria-hidden="true" class="absolute inset-x-0 top-0 isolate font-display text-[length:clamp(36px,3.6vw,58px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-slateNavy">
                <span class="relative inline-block"><span aria-hidden="true" class="absolute -inset-x-[0.06em] bottom-[0.08em] -z-10 h-[0.38em] rounded-[4px] bg-pastiYellow-500" />{{ connectsHead }}</span>{{ connectsRest }}
              </h2>
            </div>
            <div class="mt-5 desktop:hidden">
              <p class="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.02em] text-[color:rgba(3,60,89,0.45)] tablet:text-[28px]">{{ mentalModel.digitizes }}</p>
              <h2 class="isolate mt-4 font-display text-[34px] font-extrabold leading-[1.04] tracking-[-0.035em] text-slateNavy tablet:text-[44px]">
                <span class="relative inline-block"><span aria-hidden="true" class="absolute -inset-x-[0.06em] bottom-[0.08em] -z-10 h-[0.38em] rounded-[4px] bg-pastiYellow-500" />{{ connectsHead }}</span>{{ connectsRest }}
              </h2>
            </div>
            <p class="m-center mt-6 max-w-[28rem] text-[16px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ problemBody }}</p>
          </div>

          <div class="relative desktop:col-span-6 desktop:col-start-7">
            <div data-pr-frame aria-hidden="true" class="absolute -inset-x-2.5 -inset-y-5 rounded-[24px] border border-dashed border-[color:rgba(3,60,89,0.28)] bg-[color:rgba(255,255,255,0.5)] tablet:-inset-6 tablet:rounded-[28px]">
              <span class="absolute -top-4 left-5 inline-flex items-center gap-2 rounded-full bg-slateNavy py-1.5 pl-1.5 pr-3.5 shadow-[0_14px_30px_-14px_rgba(3,60,89,0.8)]">
                <OpenMark :size="22" />
                <span class="font-display text-[12px] font-extrabold tracking-[0.04em] text-pureWhite">OPEN ecosystem</span>
              </span>
            </div>
            <ul class="relative grid grid-cols-2 gap-2.5 tablet:grid-cols-3 tablet:gap-3">
              <li
                v-for="p in ecosystemParts"
                :key="p"
                data-pr-chip
                class="flex min-h-[58px] items-center justify-between gap-2 rounded-[16px] border border-[color:rgba(3,60,89,0.08)] bg-pureWhite px-4 py-3 shadow-[0_18px_40px_-26px_rgba(3,60,89,0.55)] tablet:min-h-[72px]"
              >
                <span class="font-display text-[14px] font-bold leading-tight text-slateNavy tablet:text-[16px]">{{ p }}</span>
                <span data-pr-check class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy">
                  <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </BaseContainer>
    </div>
  </section>
</template>
