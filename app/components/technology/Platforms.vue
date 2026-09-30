<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// PASTI'S OWN PLATFORMS — OPEN and e-CORPORATE (client-approved positioning,
// usePlatforms). Two large dark cards; on desktop they tilt toward the
// pointer and the cover image zooms; both keep the honest "Coming soon" state.
const { platforms } = usePlatforms()

const sectionRef = ref<HTMLElement | null>(null)
const cardRefs = platforms.map(() => ref<HTMLElement | null>(null))
cardRefs.forEach((r) => useCardTilt(r, { strength: 4, lift: 1.01 }))

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const heads = section.querySelectorAll<HTMLElement>('[data-tp-head]')
  const cards = section.querySelectorAll<HTMLElement>('[data-tp-card]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(heads, { yPercent: 110 })
    gsap.set(cards, { clipPath: 'inset(100% 0% 0% 0% round 24px)' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    tl.to(heads, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 })
      .to(cards, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: motionTier.cinematicMax, ease: approvedEase.gsapPrimary, stagger: 0.15 }, '-=0.4')
      .set(cards, { clipPath: 'none' })
    return () => tl.kill()
  })
  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(heads, { yPercent: 0 })
    gsap.set(cards, { clipPath: 'none' })
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Platforms" meta="Built by PASTI" />

      <div class="mt-14 overflow-hidden pb-2 desktop:mt-20">
        <h2 data-tp-head class="font-display text-[length:clamp(40px,6vw,96px)] font-extrabold text-pureWhite leading-[0.95] tracking-[-0.045em]">
          Our own <span class="text-pastiYellow-500">platforms.</span>
        </h2>
      </div>

      <div class="mt-12 grid gap-6 desktop:mt-16 desktop:grid-cols-2 desktop:gap-8">
        <div v-for="(p, i) in platforms" :key="p.name" :ref="(el) => { cardRefs[i]!.value = el as HTMLElement | null }" style="transform-style: preserve-3d">
          <article data-tp-card class="group/pf relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[color:rgba(255,255,255,0.1)] bg-[linear-gradient(160deg,#0a4a6b_0%,#04354f_100%)]">
            <div class="relative aspect-[16/10] overflow-hidden">
              <img :src="p.image" :alt="`${p.name} platform`" loading="lazy" class="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover/pf:scale-105">
              <span class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slateNavy px-3 py-1.5">
                <LayoutBrandMark surface="dark" :height="10" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.25)]" />
                <span class="font-mono text-[10px] tracking-[0.14em] text-pureWhite">{{ p.index }}</span>
              </span>
            </div>
            <div class="flex flex-1 flex-col p-6 tablet:p-8">
              <p class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.55)]">
                <span class="h-1.5 w-1.5 rounded-full bg-cobalt" />{{ p.character }}
              </p>
              <h3 class="mt-3 font-display text-[length:clamp(36px,4vw,60px)] font-extrabold text-pureWhite leading-none tracking-[-0.04em]">{{ p.name }}</h3>
              <p class="mt-4 max-w-[46ch] text-token-body text-[color:rgba(255,255,255,0.7)]">{{ p.positioning }}</p>
              <span v-if="p.comingSoon" class="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.18)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.65)]">
                <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Coming soon
              </span>
            </div>
          </article>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
