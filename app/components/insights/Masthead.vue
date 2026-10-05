<script setup lang="ts">
import gsap from 'gsap'

// INSIGHTS MASTHEAD — on the shared page-hero system (2026-10-05: light
// ground, title scale, marker and CTAs shared with the homepage hero; the
// word is no longer set at poster size). The word "Insights.", its letters filled with
// the article posters (background-clip: text). The fill cross-fades from
// poster to poster and pans with the pointer, so the masthead itself is a
// window onto the issue. A navy outline keeps it legible at all times.
// Reduced motion: one static fill.
const { articles } = useInsights()
const count = articles.length
const topics = Array.from(new Set(articles.map((a) => a.page?.topic).filter(Boolean)))
const pad = (n: number) => String(n).padStart(2, '0')

const { link: whatsappLink } = useWhatsapp()
const toContents = () => {
  const el = document.getElementById('insights-contents')
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

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
  <section ref="rootRef" class="surface-light relative isolate overflow-hidden pb-16 pt-28 desktop:flex desktop:min-h-[100svh] desktop:items-center desktop:pb-12 desktop:pt-32" style="--lift-x: 50%; --lift-y: 0%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10 w-full">
      <div class="grid items-center gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-7">
          <div data-im-fade><BaseHeroMarker label="The PASTI Journal" :meta="`${pad(count)} articles · ${pad(topics.length)} topics`" /></div>

          <h1 class="hero-title hero-title--word im-mask relative mt-6 select-none desktop:mt-[3svh]" aria-label="Insights">
            <span data-im-word class="relative inline-block" aria-hidden="true">
              <span class="im-outline block">Insights<span class="text-pastiYellow-500">.</span></span>
              <span
                v-for="(a, i) in articles"
                :key="a.index"
                class="im-fill absolute inset-0 block transition-opacity duration-1000 ease-editorial"
                :class="i === shown ? 'opacity-100' : 'opacity-0'"
                :style="{ backgroundImage: `linear-gradient(rgba(3,60,89,0.42),rgba(3,60,89,0.42)), url(${a.image})`, backgroundPosition: `0 0, ${55 + pan.x * 0.4}% ${pan.y}%` }"
              >Insights</span>
            </span>
          </h1>

          <p data-im-fade class="hero-lede m-center mt-6 desktop:mt-[3svh]">
            Perspectives on technology, creative, and business — from the work we do with our clients every day.
          </p>

          <div data-im-fade class="mt-8 desktop:mt-[4svh]">
            <BaseHeroCtas
              :primary="{ label: 'Read the issue' }"
              :secondary="{ label: 'Tell us about it', href: whatsappLink }"
              @primary="toContents"
            />
          </div>
        </div>

        <!-- Centerpiece: the issue's posters, cycling with the masthead fill. -->
        <div data-im-fade class="mx-auto w-full max-w-[320px] desktop:col-span-4 desktop:col-start-9 desktop:max-w-[340px] desktop:justify-self-end">
          <div class="relative aspect-[4/5]">
            <img
              v-for="(a, i) in articles"
              :key="a.index"
              :src="a.image"
              :alt="i === shown ? a.title : ''"
              draggable="false"
              loading="lazy"
              class="absolute inset-0 h-full w-full rounded-[22px] object-cover object-left shadow-[0_40px_80px_-36px_rgba(3,60,89,0.6)] ring-[5px] ring-pureWhite transition-[opacity,transform] duration-1000 ease-editorial"
              :class="i === shown ? 'rotate-[-4deg] opacity-100' : i === (shown + 1) % count ? 'translate-x-[6%] rotate-[5deg] scale-[0.94] opacity-60' : 'rotate-0 scale-90 opacity-0'"
              :style="{ zIndex: i === shown ? 3 : i === (shown + 1) % count ? 2 : 1 }"
            >
          </div>
          <p class="m-center-row mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />
            <span class="min-w-0 truncate">Now showing · <span class="text-slateNavy">{{ articles[shown]?.title }}</span></span>
          </p>
        </div>
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
