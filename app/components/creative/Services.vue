<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// CREATIVE SERVICES — sticky split. Desktop: the service index stays pinned
// (CSS sticky) on the left while large visual cards scroll on the right; the
// card in view drives the active title (Yellow marker + slide) and a big
// counter. Each card's image drifts inside its frame (parallax). Clicking a
// title scrolls to its card. Touch / small screens: stacked cards.
const { servicesEyebrow, servicesHeading, services } = useCreative()
const active = ref(0)
const sectionRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const pad = (n: number) => String(n).padStart(2, '0')

const goTo = (i: number) => {
  const el = cardRefs.value[i]
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { offset: -120, duration: 1.2 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

useGsapContext(() => {
  const section = sectionRef.value
  const cards = cardRefs.value
  if (!section || !cards.length) return
  const mm = gsap.matchMedia()
  const triggers = cards.map((card, i) =>
    ScrollTrigger.create({ trigger: card, start: 'top 55%', end: 'bottom 55%', onToggle: (self) => self.isActive && (active.value = i) })
  )
  mm.add(reducedMotionQuery.noPreference, () => {
    const tweens = cards.map((card) => {
      const img = card.querySelector<HTMLElement>('[data-cs-img]')
      const frame = card.querySelector<HTMLElement>('[data-cs-frame]')
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
      if (img) tl.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none' }, 0)
      if (frame) gsap.fromTo(frame, { clipPath: 'inset(18% 10% 18% 10% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: approvedEase.gsapPrimary, duration: motionTier.cinematicMax, scrollTrigger: { trigger: card, start: 'top 85%', once: true } })
      return tl
    })
    return () => tweens.forEach((t) => {
      t.scrollTrigger?.kill()
      t.kill()
    })
  })
  return () => triggers.forEach((t) => t.kill())
})
</script>

<template>
  <section id="creative-services" ref="sectionRef" class="surface-light relative py-24 tablet:py-32" style="--lift-x: 10%; --lift-y: 10%">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Services" :meta="`${pad(services.length)} disciplines`" />

      <div class="mt-14 grid gap-12 desktop:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <!-- Sticky index -->
        <div class="desktop:col-span-5">
          <div class="desktop:sticky desktop:top-28">
            <p class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
              <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ servicesEyebrow }}
            </p>
            <h2 class="mt-4 font-display text-[length:clamp(40px,5.4vw,84px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slateNavy">
              {{ servicesHeading }}<span class="text-pastiYellow-500">.</span>
            </h2>

            <div class="mt-10 hidden items-end gap-4 desktop:flex" aria-hidden="true">
              <span class="cs-count font-display text-[120px] font-extrabold leading-[0.8] tracking-[-0.06em]">{{ pad(active + 1) }}</span>
              <span class="mb-2 font-mono text-[12px] tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">/ {{ pad(services.length) }}</span>
            </div>

            <ol class="mt-8 hidden desktop:block">
              <li v-for="(s, i) in services" :key="s.index">
                <button
                  type="button"
                  class="group flex w-full items-center gap-4 border-t border-[color:rgba(3,60,89,0.12)] py-3.5 text-left"
                  :aria-current="active === i ? 'true' : undefined"
                  @click="goTo(i)"
                >
                  <span class="font-mono text-[11px] tabular-nums transition-colors" :class="active === i ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.4)]'">{{ s.index }}</span>
                  <span class="relative font-display text-[19px] font-bold tracking-[-0.01em] transition-[transform,color] duration-500 ease-editorial" :class="active === i ? 'translate-x-2 text-slateNavy' : 'text-[color:rgba(3,60,89,0.42)] group-hover:text-slateNavy'">
                    <span aria-hidden="true" class="absolute -inset-x-1 bottom-0.5 -z-10 h-[0.42em] origin-left rounded-[3px] bg-pastiYellow-500 transition-transform duration-500 ease-editorial" :class="active === i ? 'scale-x-100' : 'scale-x-0'" />
                    {{ s.title }}
                  </span>
                </button>
              </li>
            </ol>
          </div>
        </div>

        <!-- Visual cards -->
        <div class="flex flex-col gap-16 desktop:col-span-7 desktop:gap-28">
          <article v-for="(s, i) in services" :key="s.index" :ref="(el) => { if (el) cardRefs[i] = el as HTMLElement }" class="group/cs">
            <div data-cs-frame class="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-slateNavy">
              <img data-cs-img :src="s.image" :alt="`${s.title} — illustrative PASTI visual`" loading="lazy" :class="s.image.includes('/insights/') ? 'object-left' : 'object-top'" class="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover">
              <span class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slateNavy px-3 py-1.5">
                <LayoutBrandMark surface="dark" :height="10" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.25)]" />
                <span class="font-mono text-[10px] tracking-[0.14em] text-pureWhite">{{ s.index }}</span>
              </span>
              <span class="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial group-hover/cs:-rotate-45">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </div>
            <div class="mt-5 grid gap-3 tablet:grid-cols-[1fr_1.2fr] tablet:gap-8">
              <h3 class="font-display text-[length:clamp(26px,2.6vw,38px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-slateNavy">{{ s.title }}</h3>
              <p class="text-token-body text-[color:rgba(3,60,89,0.72)]">{{ s.body }}</p>
            </div>
          </article>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.cs-count {
  color: transparent;
  -webkit-text-stroke: 2px #033c59;
}
</style>
