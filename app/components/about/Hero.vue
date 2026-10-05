<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// ABOUT HERO — on the shared page-hero system (2026-10-05: light ground,
// title scale, marker and CTAs shared with the homepage hero). The brand promise performed. "complexity" enters as scattered,
// tilted letters over a scattered stroke field; scrolling (a short pin)
// straightens every letter and aligns the whole field into the precision
// grid, while "certainty." gets its PASTI Yellow marker. The pointer orders
// the field locally at any time. Reduced motion: everything already ordered.
const { eyebrow, promise, essence, positioning, companyName } = useAbout()

// "We turn complexity into certainty." → lead / scrambled word / tail.
const lead = 'We turn'
const chaosWord = 'complexity'
const tail = 'into certainty'
void promise

const { link: whatsappLink } = useWhatsapp()
const toManifesto = () => {
  const el = document.getElementById('about-manifesto')
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

const rootRef = ref<HTMLElement | null>(null)
const order = ref(0)
const pct = computed(() => Math.round(order.value * 100))

// Deterministic per-letter scatter (SSR-safe: no Math.random).
const scatter = [...chaosWord].map((ch, i) => {
  const r = (n: number) => {
    const s = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453
    return s - Math.floor(s)
  }
  return { ch, rot: (r(1) - 0.5) * 70, y: (r(2) - 0.5) * 0.7, x: (r(3) - 0.5) * 0.25 }
})

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const letters = root.querySelectorAll<HTMLElement>('[data-ah-letter]')
  const marker = root.querySelector<HTMLElement>('[data-ah-marker]')
  const words = root.querySelectorAll<HTMLElement>('[data-ah-word]')
  const fades = root.querySelectorAll<HTMLElement>('[data-ah-fade]')
  const mm = gsap.matchMedia()

  const apply = (k: number) => {
    order.value = k
    letters.forEach((el, i) => {
      const s = scatter[i]!
      gsap.set(el, { rotation: s.rot * (1 - k), yPercent: s.y * 100 * (1 - k), xPercent: s.x * 100 * (1 - k), opacity: 0.55 + 0.45 * k })
    })
    if (marker) gsap.set(marker, { scaleX: Math.max(0, (k - 0.55) / 0.45) })
  }

  mm.add(reducedMotionQuery.reduce, () => {
    apply(1)
    gsap.set([...words, ...fades], { yPercent: 0, autoAlpha: 1 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    apply(0)
    gsap.set(words, { yPercent: 115 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    const intro = gsap.timeline({ delay: 0.25 })
    intro
      .to(words, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.08 })
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, '-=0.7')

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: '+=90%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => apply(self.progress)
    })
    return () => {
      intro.kill()
      st.kill()
    }
  })
})
</script>

<template>
  <section ref="rootRef" class="surface-light relative isolate flex min-h-[100svh] flex-col overflow-hidden pb-10 pt-28 desktop:pt-32" style="--lift-x: 80%; --lift-y: 20%">
    <AboutOrderField :order="order" />
    <!-- Keep the copy side calm over the field. -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(246,249,251,0.92)_0%,rgba(246,249,251,0.6)_45%,rgba(246,249,251,0)_75%)]" />

    <BaseContainer class="pointer-events-none relative z-10 flex flex-1 flex-col">
      <div class="m-center flex flex-1 flex-col justify-center py-12">
        <div data-ah-fade><BaseHeroMarker :label="eyebrow" meta="Brand foundation" /></div>
        <h1 class="hero-title m-center mt-6 desktop:mt-[3svh]" :aria-label="promise">
          <span class="ah-mask block" aria-hidden="true"><span data-ah-word class="inline-block">{{ lead }}</span></span>
          <span class="block py-[0.06em]" aria-hidden="true">
            <span data-ah-fade class="inline-block">
              <span v-for="(l, i) in scatter" :key="i" data-ah-letter class="inline-block will-change-transform">{{ l.ch }}</span>
            </span>
          </span>
          <span class="ah-mask block" aria-hidden="true">
            <span data-ah-word class="relative inline-block">
              {{ tail.split(' ')[0] }}
              <span class="relative inline-block">
                <span data-ah-marker class="absolute -inset-x-[0.04em] bottom-[0.08em] -z-10 h-[0.36em] origin-left scale-x-0 rounded-[4px] bg-pastiYellow-500" />{{ tail.split(' ')[1] }}</span><span class="text-pastiYellow-500">.</span>
            </span>
          </span>
        </h1>
        <div data-ah-fade class="pointer-events-auto mt-8 desktop:mt-[4.5svh]">
          <BaseHeroCtas
            :primary="{ label: 'Work with us', href: whatsappLink }"
            :secondary="{ label: 'How PASTI works', down: true }"
            @secondary="toManifesto"
          />
        </div>
      </div>

      <div class="m-center grid gap-6 border-t border-[color:rgba(3,60,89,0.16)] pt-6 tablet:grid-cols-3 desktop:grid-cols-12 desktop:items-end">
        <div data-ah-fade class="desktop:col-span-3">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.5)]">Brand essence</p>
          <p class="mt-1.5 font-display text-[16px] font-bold text-slateNavy">{{ essence }}</p>
        </div>
        <div data-ah-fade class="desktop:col-span-4">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.5)]">Positioning</p>
          <p class="mt-1.5 font-display text-[16px] font-bold text-slateNavy">{{ positioning }}</p>
        </div>
        <div data-ah-fade class="desktop:col-span-3">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.5)]">Company</p>
          <p class="mt-1.5 flex items-center gap-2.5 font-display text-[16px] font-bold text-slateNavy"><LayoutBrandMark surface="light" :height="12" />{{ companyName }}</p>
        </div>
        <!-- Live readout of the order state -->
        <div data-ah-fade class="flex items-center gap-3 desktop:col-span-2 desktop:justify-end" aria-hidden="true">
          <span class="relative block h-[3px] w-20 overflow-hidden rounded-full bg-[color:rgba(3,60,89,0.12)]">
            <span class="absolute inset-0 origin-left bg-pastiYellow-500" :style="{ transform: `scaleX(${order})` }" />
          </span>
          <span class="font-mono text-[11px] tabular-nums tracking-[0.12em] text-slateNavy">{{ String(pct).padStart(3, '0') }}% certain</span>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.ah-mask {
  overflow: clip;
  padding: 0.06em 0.04em 0.12em;
  margin: -0.06em -0.04em -0.12em;
}
</style>
