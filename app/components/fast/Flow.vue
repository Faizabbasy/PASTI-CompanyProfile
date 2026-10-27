<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 04 HOW FAST WORKS — the blueprint's operational flow, nine stations on
// one line (desktop) or a vertical track (below desktop). A yellow fill
// travels the line with scroll (scrubbed, no pin) and lights each station
// it passes; the last station loops back to "Schedule & validate".
// Reduced motion: the whole line is drawn and every station lit.
if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

const { flow } = useFastPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const lit = ref(-1)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const fillX = section.querySelector<HTMLElement>('[data-fl-fill-x]')
  const fillY = section.querySelector<HTMLElement>('[data-fl-fill-y]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    lit.value = flow.steps.length - 1
    gsap.set(fillX, { scaleX: 1 })
    gsap.set(fillY, { scaleY: 1 })
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    const track = section.querySelector<HTMLElement>('[data-fl-track]')
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(fillX, { scaleX: self.progress })
        gsap.set(fillY, { scaleY: self.progress })
        lit.value = Math.min(flow.steps.length - 1, Math.floor(self.progress * flow.steps.length + 0.15) - 1)
      }
    })
    return () => st.kill()
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy desktop:-mt-12 desktop:rounded-t-[48px] py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="dark" label="FAST" meta="04 / 12" class="mb-12 desktop:mb-16" />
      <div><FastHeading surface="dark" :eyebrow="flow.eyebrow" :title="flow.headline" :lede="flow.lede" /></div>

      <div data-fl-track class="relative mt-16">
        <!-- Desktop rail -->
        <div aria-hidden="true" class="absolute left-0 right-0 top-[18px] hidden h-[2px] bg-[color:rgba(255,255,255,0.14)] desktop:block">
          <span data-fl-fill-x class="block h-full origin-left scale-x-0 bg-pastiYellow-500" />
        </div>
        <!-- Mobile track -->
        <div aria-hidden="true" class="absolute bottom-0 left-[17px] top-0 w-[2px] bg-[color:rgba(255,255,255,0.14)] desktop:hidden">
          <span data-fl-fill-y class="block h-full w-full origin-top scale-y-0 bg-pastiYellow-500" />
        </div>

        <ol class="relative grid gap-7 desktop:grid-cols-9 desktop:gap-4">
          <li v-for="(s, i) in flow.steps" :key="i" class="relative flex gap-4 desktop:block">
            <span
              class="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 font-mono text-[11px] font-semibold tabular-nums transition-[background-color,border-color,color] duration-500 ease-editorial"
              :class="i <= lit ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(255,255,255,0.25)] bg-slateNavy text-[color:rgba(255,255,255,0.65)]'"
            >{{ pad(i + 1) }}</span>
            <span class="block desktop:mt-5">
              <span class="block font-display text-[16px] font-bold leading-tight tracking-[-0.01em] desktop:text-[15px]">{{ s.name }}</span>
              <span class="mt-1.5 block text-[13px] leading-snug text-[color:rgba(255,255,255,0.65)]">{{ s.body }}</span>
            </span>
          </li>
        </ol>

        <!-- Loop back -->
        <p class="mt-10 inline-flex items-center gap-3 rounded-full border border-[color:rgba(255,255,255,0.16)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.7)] max-desktop:ml-0">
          <svg viewBox="0 0 16 16" class="h-4 w-4 text-pastiYellow-500" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M13 5a5 5 0 1 0 1 4" /><path d="M13 1.5V5H9.5" /></svg>
          {{ t('09 → 04 · the loop that keeps the plan executable') }}
        </p>
      </div>
    </BaseContainer>
  </section>
</template>
