<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// JOURNEY — the five COMPRO 2025 milestones (p.26) as a timeline. Desktop: a
// horizontal Signal rail that fills with the scroll and lights each year as
// it passes. Below desktop: a vertical rail. Reduced motion: fully lit.
const { company } = useAbout()
const items = company.milestones
const sectionRef = ref<HTMLElement | null>(null)
const lit = ref(-1)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rail = section.querySelector<HTMLElement>('[data-jr-rail]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    if (rail) gsap.set(rail, { scaleX: 1, scaleY: 1 })
    lit.value = items.length - 1
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section.querySelector('[data-jr-list]'),
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: 0.5,
        onUpdate: (self) => (lit.value = self.progress < 0.02 ? -1 : Math.min(items.length - 1, Math.floor(self.progress * items.length)))
      }
    })
    if (rail) tl.fromTo(rail, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: 'none' })
    return () => { tl.scrollTrigger?.kill(); tl.kill() }
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Journey" meta="2020 → today" />
      <div class="m-center mt-14 desktop:mt-20">
        <p class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
          <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />The milestones
        </p>
        <h2 class="hero-title hero-title--dark mt-4">Our journey<span class="text-pastiYellow-500">.</span></h2>
      </div>

      <ol data-jr-list class="relative mt-14 grid desktop:mt-20 desktop:grid-cols-5 desktop:gap-6">
        <span aria-hidden="true" class="absolute bottom-6 left-[11px] top-3 w-px bg-[color:rgba(255,255,255,0.16)] desktop:bottom-auto desktop:left-0 desktop:right-0 desktop:top-[11px] desktop:h-px desktop:w-auto" />
        <span data-jr-rail aria-hidden="true" class="absolute bottom-6 left-[10px] top-3 w-[2px] origin-top bg-pastiYellow-500 desktop:bottom-auto desktop:left-0 desktop:right-0 desktop:top-[10px] desktop:h-[2px] desktop:w-auto desktop:origin-left" />
        <li v-for="(m, i) in items" :key="m.year" class="relative flex gap-6 pb-12 desktop:block desktop:pb-0">
          <span
            aria-hidden="true"
            class="relative z-10 mt-0.5 block h-6 w-6 shrink-0 rounded-full border-2 transition-[background-color,border-color,transform] duration-500 ease-editorial"
            :class="i <= lit ? 'scale-110 border-pastiYellow-500 bg-pastiYellow-500' : 'border-[color:rgba(255,255,255,0.3)] bg-slateNavy'"
          />
          <div class="desktop:mt-8">
            <p class="font-display text-[clamp(26px,2.2vw,36px)] font-extrabold leading-none tracking-[-0.04em] transition-colors duration-500" :class="i <= lit ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.4)]'">{{ m.year }}</p>
            <p class="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ m.text }}</p>
          </div>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>
