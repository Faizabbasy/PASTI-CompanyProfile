<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// VISION & MISSION (COMPRO 2025 p.27). Two statements on navy: Vision large,
// Mission as the supporting paragraph; a yellow rule draws between them.
const { company } = useAbout()
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const items = section.querySelectorAll<HTMLElement>('[data-vm-item]')
  const rule = section.querySelector<HTMLElement>('[data-vm-rule]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(items, { autoAlpha: 0, y: 28 })
    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    tl.to(items, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.12 })
      .to(rule, { scaleX: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.2)
    return () => tl.kill()
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Vision & mission" meta="Why we exist" />
      <div class="mt-14 grid gap-12 desktop:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <div class="m-center desktop:col-span-7">
          <p data-vm-item class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
            <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Vision
          </p>
          <p data-vm-item class="mt-6 font-display text-[clamp(28px,3.2vw,48px)] font-bold leading-[1.1] tracking-[-0.035em]">
            {{ company.vision.replace(/\.$/, '') }}<span class="text-pastiYellow-500">.</span>
          </p>
        </div>
        <div class="desktop:col-span-4 desktop:col-start-9 desktop:self-end">
          <span data-vm-rule aria-hidden="true" class="block h-[2px] w-16 bg-pastiYellow-500 max-desktop:mx-auto" />
          <p data-vm-item class="m-center mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">Mission</p>
          <p data-vm-item class="m-center mt-4 text-token-body-large leading-relaxed text-[color:rgba(255,255,255,0.8)]">{{ company.mission }}</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
