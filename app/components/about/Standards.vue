<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// WHAT WE STAND FOR — the four COMPRO 2025 "Standards We Live By" (p.28).
// These are PASTI's public values; the brand-guide pillars further down are
// framed as working principles ("How we work") so the two don't compete.
const { company } = useAbout()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const cards = section.querySelectorAll<HTMLElement>('[data-st-card]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(cards, { autoAlpha: 0, y: 36 })
    const b = ScrollTrigger.batch(cards, { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.1 }) })
    return () => b.forEach((t) => t.kill())
  })
})
</script>

<template>
  <section ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 20%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Standards" :meta="`${pad(company.standards.length)} we live by`" />
      <div class="m-center mt-14 desktop:mt-20">
        <p class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
          <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Our values
        </p>
        <h2 class="hero-title mt-4">What we stand for<span class="text-pastiYellow-500">.</span></h2>
      </div>

      <ol class="mt-12 grid gap-4 tablet:grid-cols-2 desktop:mt-16 desktop:gap-5">
        <li
          v-for="(s, i) in company.standards"
          :key="s.name"
          data-st-card
          class="group relative overflow-hidden rounded-[24px] bg-pureWhite p-7 ring-1 ring-[color:rgba(3,60,89,0.1)] transition-[transform,box-shadow] duration-500 ease-editorial hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_rgba(3,60,89,0.45)] tablet:p-9"
        >
          <span aria-hidden="true" class="st-num pointer-events-none absolute -right-2 -top-6 font-display text-[140px] font-extrabold leading-none tracking-[-0.06em]">{{ pad(i + 1) }}</span>
          <span aria-hidden="true" class="block h-[3px] w-10 origin-left bg-pastiYellow-500 transition-transform duration-500 ease-editorial group-hover:scale-x-150" />
          <h3 class="relative mt-6 font-display text-[clamp(26px,2.4vw,34px)] font-extrabold tracking-[-0.03em] text-slateNavy">{{ s.name }}</h3>
          <p class="relative mt-3 max-w-[48ch] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ s.body }}</p>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>

<style scoped>
.st-num {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(3, 60, 89, 0.1);
}
</style>
