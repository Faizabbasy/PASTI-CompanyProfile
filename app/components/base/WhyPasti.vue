<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// WHY PASTI (COMPRO rebuild 2026-10-07) — shared by /technology and
// /creative; each page passes its own COMPRO copy: a lead statement (Vision
// or Mission, p.27), the relevant Standards (p.28) and milestones (p.26) as a
// timeline whose Signal line draws across as it enters. Reduced motion: static.
interface WhyContent {
  leadLabel: string
  statement: string
  standards: { name: string; body: string }[]
  milestones: { year: string; text: string }[]
}
const props = defineProps<{ why: WhyContent }>()
const long = computed(() => props.why.statement.length > 140)
const sectionRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const items = section.querySelectorAll<HTMLElement>('[data-why-item]')
  const nodes = section.querySelectorAll<HTMLElement>('[data-why-node]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(items, { autoAlpha: 0, y: 28 })
    gsap.set(lineRef.value, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(nodes, { scale: 0 })
    const a = gsap.to(items, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08, scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    const tl = gsap.timeline({ scrollTrigger: { trigger: lineRef.value, start: 'top 85%', once: true } })
    tl.to(lineRef.value, { scaleX: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic })
      .to(nodes, { scale: 1, duration: 0.5, ease: approvedEase.gsapPrimary, stagger: 0.18 }, 0.2)
    return () => { a.kill(); tl.kill() }
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Why PASTI" meta="Est. 2020" />

      <div class="mt-14 grid gap-14 desktop:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <!-- Vision -->
        <div class="m-center desktop:col-span-6">
          <p data-why-item class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
            <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ why.leadLabel }}
          </p>
          <p data-why-item class="mt-6 font-display font-bold tracking-[-0.03em]" :class="long ? 'text-[clamp(22px,2.1vw,32px)] leading-[1.22]' : 'text-[clamp(26px,2.8vw,42px)] leading-[1.12]'">
            {{ why.statement.replace(/\.$/, '') }}<span class="text-pastiYellow-500">.</span>
          </p>
        </div>

        <!-- Standards -->
        <ol class="desktop:col-span-5 desktop:col-start-8">
          <li
            v-for="(st, i) in why.standards"
            :key="st.name"
            data-why-item
            class="grid grid-cols-[40px_1fr] gap-x-2 border-t border-[color:rgba(255,255,255,0.14)] py-6 last:border-b"
          >
            <span class="pt-1.5 font-mono text-[11px] text-pastiYellow-500">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <h3 class="font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-pureWhite">{{ st.name }}</h3>
              <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ st.body }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Milestones -->
      <div class="mt-20 desktop:mt-28">
        <p data-why-item class="m-center font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">Milestones</p>
        <div class="relative mt-8">
          <span ref="lineRef" aria-hidden="true" class="absolute left-0 right-0 top-[7px] hidden h-px bg-pastiYellow-500 tablet:block" />
          <ol class="grid gap-8 tablet:gap-6" :class="why.milestones.length === 3 ? 'tablet:grid-cols-3' : 'tablet:grid-cols-4'">
            <li v-for="m in why.milestones" :key="m.year" data-why-item class="relative pl-7 tablet:pl-0 tablet:pt-9">
              <span data-why-node aria-hidden="true" class="absolute left-0 top-1 block h-[15px] w-[15px] rounded-full border-2 border-pastiYellow-500 bg-slateNavy tablet:top-0" />
              <span aria-hidden="true" class="absolute bottom-[-2rem] left-[7px] top-6 w-px bg-[color:rgba(255,255,255,0.18)] tablet:hidden" />
              <p class="font-display text-[clamp(24px,2vw,32px)] font-extrabold leading-none tracking-[-0.04em] text-pureWhite">{{ m.year }}</p>
              <p class="mt-3 max-w-[28ch] text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ m.text }}</p>
            </li>
          </ol>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
