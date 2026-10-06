<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// ENTERPRISE PROBLEM → SOLUTION — deep navy structural section. Six temporary
// problem statements (brief framing, not research findings) sit in a ruled
// table; each is paired with the confirmed goal that answers it. On entry the
// broken dashed links become one solid yellow connection, row by row, and
// the answers light up. Reduced motion: connected from the start.
const { problems, solutionHeadline, positioning } = useEcorporate()
const words = solutionHeadline.split(' ')
const head = `${words.slice(0, 2).join(' ')} `
const mark = words.slice(2).join(' ')

const sectionRef = ref<HTMLElement | null>(null)
const connected = ref(false)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    connected.value = true
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    const st = ScrollTrigger.create({ trigger: section.querySelector('[data-ep-table]'), start: 'top 62%', once: true, onEnter: () => (connected.value = true) })
    return () => st.kill()
  })
})
</script>

<template>
  <section id="problem" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <div aria-hidden="true" class="ec-dots--dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,#000,transparent_60%)]" />
    <BaseGridLines tone="dark" edge="top" />
    <EcorpMarks surface="dark" label="02 / 12 · Fragmented → connected" />
    <!-- Background numeral: six fragments become one environment -->
    <div aria-hidden="true" class="pointer-events-none absolute right-[3vw] top-[6%] hidden h-[clamp(160px,22vw,340px)] w-[clamp(220px,30vw,460px)] desktop:block">
      <span class="ep-num ec-outline ec-outline--dark absolute inset-0 text-right text-[length:clamp(160px,22vw,340px)]" :class="{ 'ep-num--out': connected }">06</span>
      <span class="ep-num absolute inset-0 text-right font-display text-[length:clamp(160px,22vw,340px)] font-extrabold leading-[0.8] tracking-[-0.05em] text-[color:rgba(251,186,0,0.14)]" :class="{ 'ep-num--out': !connected }">01</span>
    </div>
    <BaseContainer class="relative z-10">
      <BaseSectionMark label="Problem → Solution" meta="02 / 12" />

      <div class="mt-12 grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <EcorpHeading class="desktop:col-span-7" surface="dark" eyebrow="From fragmented to connected" :before="head" :mark="mark" />
        <p class="m-center max-w-[30rem] text-[16px] leading-relaxed text-[color:rgba(255,255,255,0.72)] desktop:col-span-5 desktop:justify-self-end">{{ positioning[2] }}</p>
      </div>

      <div data-ep-table class="mt-14 border-t border-[color:rgba(255,255,255,0.16)]" :class="{ 'ep-on': connected }">
        <!-- Column heads (desktop) -->
        <div class="hidden grid-cols-12 gap-6 border-b border-[color:rgba(255,255,255,0.1)] py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)] desktop:grid">
          <span class="col-span-5">Fragmented operations</span>
          <span class="col-span-2" />
          <span class="col-span-5">With e-CORPORATE</span>
        </div>
        <ul>
          <li
            v-for="(p, i) in problems"
            :key="p.problem"
            class="ep-row grid gap-2 border-b border-[color:rgba(255,255,255,0.1)] py-5 desktop:grid-cols-12 desktop:items-center desktop:gap-6"
            :style="{ '--d': `${i * 110}ms` }"
          >
            <p class="flex items-center gap-3 font-display text-[17px] font-semibold text-[color:rgba(255,255,255,0.58)] desktop:col-span-5 desktop:text-[19px]">
              <span aria-hidden="true" class="font-mono text-[11px] text-[color:rgba(255,255,255,0.4)]">{{ String(i + 1).padStart(2, '0') }}</span>{{ p.problem }}
            </p>
            <!-- Link: dashed + broken → solid yellow -->
            <span aria-hidden="true" class="relative hidden h-px desktop:col-span-2 desktop:block">
              <span class="absolute inset-0 border-t border-dashed border-[color:rgba(255,255,255,0.28)]" />
              <span class="ep-link absolute inset-y-0 left-0 -mt-px h-[2px] w-full origin-left bg-pastiYellow-500" />
              <span class="ep-end absolute -right-1 -top-[3px] h-2 w-2 bg-pastiYellow-500" />
            </span>
            <p class="ep-answer flex items-center gap-3 pl-8 font-display text-[17px] font-bold desktop:col-span-5 desktop:pl-0 desktop:text-[19px]">
              <span aria-hidden="true" class="grid h-5 w-5 shrink-0 place-items-center bg-pastiYellow-500 text-slateNavy">
                <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M3 8.5l3 3 7-7" /></svg>
              </span>
              <span class="sr-only">Answered by: </span>{{ p.answer }}
            </p>
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.ep-num {
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.ep-num--out {
  opacity: 0;
  transform: translateY(14%);
}
.ep-link {
  transform: scaleX(0);
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms);
}
.ep-end {
  opacity: 0;
  transition: opacity 0.3s ease calc(var(--d, 0ms) + 500ms);
}
.ep-answer {
  opacity: 0.35;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--d, 0ms) + 300ms);
}
.ep-on .ep-link {
  transform: scaleX(1);
}
.ep-on .ep-end,
.ep-on .ep-answer {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .ep-link,
  .ep-end,
  .ep-answer,
  .ep-num {
    transition: none;
  }
}
</style>
