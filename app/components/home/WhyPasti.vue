<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 07 — WHY PASTI.
const label = 'Why PASTI'

// The intro sentence is authored as phrase segments rather than one plain
// string so specific phrases can carry an accent highlight — flattened
// into a per-word list below so the template only needs one plain v-for
// (unlike useMaskedReveal, which strips all child elements and rebuilds
// from plain textContent, this markup needs to survive intact).
const introSegments: { text: string; accent?: boolean }[] = [
  { text: 'We combine' },
  { text: 'technology and creativity', accent: true },
  { text: 'to help businesses turn challenges into' },
  { text: 'scalable solutions,', accent: true },
  { text: 'meaningful experiences', accent: true },
  { text: 'and' },
  { text: 'measurable impact.', accent: true }
]

const introWords = introSegments.flatMap((segment) =>
  segment.text.split(' ').map((word) => ({ word, accent: !!segment.accent }))
)

const { metrics } = useWhyPasti()

const labelRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)

useMaskedReveal(labelRef, { by: 'word', blur: true })

// Custom word-mask reveal for the intro sentence — built by hand (rather
// than useMaskedReveal) so the accent <span> wrapping specific phrases
// survives the DOM rebuild instead of being flattened to plain text.
// Highlighted words fade into their accent color slightly after the
// slide-up settles, giving the sentence a second, slower beat instead of
// revealing as one flat block.
useGsapContext(() => {
  const el = introRef.value
  const line = lineRef.value
  if (!el) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-word]'))
    const accentWords = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-accent]'))

    gsap.set(words, { yPercent: 120 })
    gsap.set(accentWords, { color: 'currentColor' })
    if (line) gsap.set(line, { scaleY: 0, transformOrigin: '0% 0%' })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none restart reverse' }
    })

    tl.to(words, { yPercent: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base })
    if (line) tl.to(line, { scaleY: 1, duration: motionDuration.slow, ease: spatialEase.settle }, 0.1)
    tl.to(accentWords, { color: '#eab308', duration: motionDuration.medium, ease: motionEase.standard, stagger: motionStagger.loose }, '-=0.3')

    return () => tl.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    const words = el.querySelectorAll<HTMLElement>('[data-intro-word]')
    const accentWords = el.querySelectorAll<HTMLElement>('[data-intro-accent]')
    gsap.set(words, { yPercent: 0 })
    gsap.set(accentWords, { color: '#eab308' })
    if (line) gsap.set(line, { scaleY: 1 })
  })
})
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <p ref="labelRef" class="eyebrow text-base font-bold tracking-wider md:col-span-3 md:text-lg">
          {{ label }}
        </p>

        <div class="relative pl-6 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
          <!-- Editorial line accent, growing top-down as the intro reveals
               — the same "structural line" language used elsewhere on the
               homepage (WhatWeDo's drawn grid, FAQ's dividers). -->
          <span
            ref="lineRef"
            aria-hidden="true"
            class="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-yellow-500 via-navy-300 to-transparent"
          />

          <p ref="introRef" class="text-display-sm font-medium leading-snug text-ink">
            <template v-for="(item, i) in introWords" :key="i"><span class="inline-block -my-[0.2em] overflow-clip align-top"><span
              data-intro-word
              :data-intro-accent="item.accent ? '' : null"
              class="inline-block py-[0.2em]"
              :class="item.accent ? 'font-semibold' : ''"
            >{{ item.word }}</span></span>{{ i < introWords.length - 1 ? ' ' : '' }}</template>
          </p>
        </div>
      </div>

      <div class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
        <HomeWhyPastiMetric
          v-for="(metric, i) in metrics"
          :key="metric.index"
          :metric="metric"
          :tone="i % 2 === 0 ? 'navy' : 'yellow'"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
