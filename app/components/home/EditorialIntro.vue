<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Shared "eyebrow label + keyword-highlighted intro sentence" treatment,
// originally built for Why PASTI and reused here for What We Build so both
// sections read as one consistent editorial system instead of two
// independently patched-up blocks. Segments carry `accent: true` on the
// phrases that should highlight — split into a per-word list so the
// template only needs one plain v-for (unlike useMaskedReveal, which
// rebuilds from plain textContent and would strip any markup).
const props = defineProps<{
  label: string
  segments: { text: string; accent?: boolean }[]
  /** Opt-in: start accent words from Hero's disassembled landing points
   *  instead of a plain yPercent reveal (see useHeroHandoff). Only the
   *  WhatWeDo instance of this component passes this. */
  reconstructFromHero?: boolean
}>()

const introWords = props.segments.flatMap((segment) =>
  segment.text.split(' ').map((word) => ({ word, accent: !!segment.accent }))
)

const labelRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)

useMaskedReveal(labelRef, { by: 'word', blur: true })

useGsapContext(() => {
  const el = introRef.value
  const line = lineRef.value
  if (!el) return

  const mm = gsap.matchMedia()
  const { landingPoints } = useHeroHandoff()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-word]'))
    const accentWords = Array.from(el.querySelectorAll<HTMLElement>('[data-intro-accent]'))

    gsap.set(words, { yPercent: 120 })
    gsap.set(accentWords, { color: 'currentColor' })
    if (line) gsap.set(line, { scaleY: 0, transformOrigin: '0% 0%' })

    // Reconstruction: if this instance opted in and Hero already
    // published landing points (see useHeroHandoff), start each accent
    // word from Hero's landed position instead of the plain yPercent
    // reveal, so it visually continues from where Hero's disassembled
    // word settled. Falls back to the plain reveal (points is null) when
    // Hero hasn't run yet — e.g. reduced motion was on when Hero mounted,
    // or this is WhyPasti's non-opted-in instance.
    const points = props.reconstructFromHero ? landingPoints.value : null
    if (points) {
      accentWords.forEach((word, i) => {
        const point = points[i]
        if (!point) return
        const rect = word.getBoundingClientRect()
        const targetLeft = (point.xVw / 100) * window.innerWidth
        const targetTop = (point.yVh / 100) * window.innerHeight
        gsap.set(word, { x: targetLeft - rect.left, y: targetTop - rect.top, rotation: point.rotation, opacity: 0 })
      })
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none restart reverse' }
    })

    tl.to(words, { yPercent: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base })
    if (points) {
      tl.to(accentWords, { x: 0, y: 0, rotation: 0, opacity: 1, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.loose }, '<')
    }
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
  <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
    <div class="md:col-span-3">
      <p ref="labelRef" class="font-display text-2xl font-bold uppercase tracking-wide text-navy-700 md:text-3xl">
        {{ label }}
      </p>
      <slot name="below-label" />
    </div>

    <div class="relative pl-6 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
      <!-- Editorial line accent, growing top-down as the intro reveals —
           the same "structural line" language used elsewhere on the
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
</template>
