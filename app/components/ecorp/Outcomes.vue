<script setup lang="ts">
import gsap from 'gsap'

// BUSINESS OUTCOMES — the brief's six NON-NUMERIC outcomes only (no metrics,
// no counters). Set as one large typographic stack: each line sits as a
// faint ghost and fills with solid navy as it crosses the viewport
// (clip-path scrubbed per line — one paint per line, no layout). The yellow
// square at the end of a line marks it "reached".
// Reduced motion: every line shown filled.
const { outcomes } = useEcorporate()

const sectionRef = ref<HTMLElement | null>(null)
useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-eo-row]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const tweens = Array.from(rows).map((row) => {
      const fill = row.querySelector<HTMLElement>('[data-eo-fill]')
      const dot = row.querySelector<HTMLElement>('[data-eo-dot]')
      gsap.set(fill, { clipPath: 'inset(0 100% 0 0)' })
      gsap.set(dot, { scale: 0 })
      return gsap
        .timeline({ scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 48%', scrub: 0.5 } })
        .to(fill, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 1 })
        .to(dot, { scale: 1, ease: approvedEase.gsapStandard, duration: 0.25 }, 0.8)
    })
    return () => {
      tweens.forEach((t) => {
        t.scrollTrigger?.kill()
        t.kill()
      })
      rows.forEach((row) => gsap.set(row.querySelectorAll('[data-eo-fill], [data-eo-dot]'), { clearProps: 'all' }))
    }
  })
})
</script>

<template>
  <section id="outcomes" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 10%">
    <BaseGridLines tone="light" />
    <EcorpMarks label="10 / 12 · Non-numeric outcomes" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Business outcomes" meta="10 / 12" />
      <EcorpHeading class="mt-12" size="md" eyebrow="Business outcomes" before="What a connected enterprise " mark="works towards" />

      <ul class="mt-14 border-t border-[color:rgba(3,60,89,0.14)]">
        <li v-for="(o, i) in outcomes" :key="o" data-eo-row class="flex items-center gap-4 border-b border-[color:rgba(3,60,89,0.14)] py-4 tablet:gap-8 tablet:py-5">
          <span class="w-7 shrink-0 font-mono text-[11px] tabular-nums text-[color:rgba(3,60,89,0.45)] tablet:w-10">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="relative min-w-0 flex-1 font-display text-[length:clamp(30px,6vw,96px)] font-extrabold leading-[1] tracking-[-0.045em]">
            <span class="block text-[color:rgba(3,60,89,0.12)]">{{ o }}</span>
            <span data-eo-fill aria-hidden="true" class="absolute inset-0 block text-slateNavy">{{ o }}</span>
          </span>
          <span data-eo-dot aria-hidden="true" class="h-3 w-3 shrink-0 bg-pastiYellow-500 tablet:h-4 tablet:w-4" />
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>
