<script setup lang="ts">
import gsap from 'gsap'

// INSIGHTS MASTHEAD — the word "Insights." set huge, its letters filled with
// the article posters (background-clip: text). The fill cross-fades from
// poster to poster and pans with the pointer, so the masthead itself is a
// window onto the issue. A navy outline keeps it legible at all times.
// Reduced motion: one static fill.
const { articles } = useInsights()
const count = articles.length
const topics = Array.from(new Set(articles.map((a) => a.page?.topic).filter(Boolean)))
const pad = (n: number) => String(n).padStart(2, '0')

const rootRef = ref<HTMLElement | null>(null)
const shown = ref(0)
const pan = ref({ x: 50, y: 50 })

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const fades = root.querySelectorAll<HTMLElement>('[data-im-fade]')
  const word = root.querySelector<HTMLElement>('[data-im-word]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => gsap.set([word, ...fades], { autoAlpha: 1, yPercent: 0, y: 0 }))
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(word, { yPercent: 105 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    const tl = gsap.timeline({ delay: 0.2 })
    tl.to(word, { yPercent: 0, duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapPrimary })
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, '-=0.7')
    const cycle = window.setInterval(() => (shown.value = (shown.value + 1) % count), 2600)
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      pan.value = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }
    }
    root.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      tl.kill()
      window.clearInterval(cycle)
      root.removeEventListener('pointermove', onMove)
    }
  })
})
</script>

<template>
  <section ref="rootRef" class="surface-light relative overflow-hidden pb-14 pt-28 desktop:pt-32" style="--lift-x: 50%; --lift-y: 0%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <div data-im-fade class="flex items-center justify-between gap-4 border-b border-[color:rgba(3,60,89,0.16)] pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
        <span class="inline-flex items-center gap-2.5"><LayoutBrandMark surface="light" :height="12" /><span aria-hidden="true" class="h-3 w-px bg-[color:rgba(3,60,89,0.3)]" />The PASTI Journal</span>
        <span>{{ pad(count) }} articles · {{ pad(topics.length) }} topics</span>
      </div>

      <h1 class="im-mask relative mt-6 select-none font-display text-[length:clamp(84px,19vw,330px)] font-extrabold leading-[0.86] tracking-[-0.065em]" aria-label="Insights">
        <span data-im-word class="relative block" aria-hidden="true">
          <span class="im-outline block">Insights<span class="text-pastiYellow-500" style="-webkit-text-stroke: 0">.</span></span>
          <span
            v-for="(a, i) in articles"
            :key="a.index"
            class="im-fill absolute inset-0 block transition-opacity duration-1000 ease-editorial"
            :class="i === shown ? 'opacity-100' : 'opacity-0'"
            :style="{ backgroundImage: `linear-gradient(rgba(3,60,89,0.42),rgba(3,60,89,0.42)), url(${a.image})`, backgroundPosition: `0 0, ${55 + pan.x * 0.4}% ${pan.y}%` }"
          >Insights</span>
        </span>
      </h1>

      <div class="mt-16 grid gap-6 desktop:grid-cols-12 desktop:items-end">
        <p data-im-fade class="max-w-[46ch] text-token-body-large text-[color:rgba(3,60,89,0.72)] desktop:col-span-6">
          Perspectives on technology, creative, and business — from the work we do with our clients every day.
        </p>
        <p data-im-fade class="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)] desktop:col-span-6 desktop:justify-end">
          <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />
          Now showing · <span class="text-slateNavy">{{ articles[shown]?.title }}</span>
        </p>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.im-mask {
  overflow: clip;
  padding-bottom: 0.2em;
  margin-bottom: -0.14em;
}
.im-outline {
  color: #033c59;
}
.im-fill {
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  background-size:
    100% 100%,
    240% auto;
  transition-property: opacity, background-position;
}
</style>
