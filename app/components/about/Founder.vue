<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// LEADERSHIP — Operational Perspective, Amelia N. Fauziah, Co-Founder & COO
// (COMPRO 2025; owner 2026-10-08 replaced the CEO foreword with this page).
// Portrait is the COMPRO photo. The pull-quote is a sentence from her own
// text. Copy lives in useCompany().founder.
const { company } = useAbout()
const f = company.founder
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const items = section.querySelectorAll<HTMLElement>('[data-fd-item]')
  const frame = section.querySelector<HTMLElement>('[data-fd-frame]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(items, { autoAlpha: 0, y: 28 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    if (frame) tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0)
    tl.to(items, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, 0.2)
    return () => tl.kill()
  })
})
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Leadership" :meta="f.meta" />
      <div class="mt-14 grid items-start gap-12 desktop:mt-20 desktop:grid-cols-12 desktop:gap-14">
        <figure class="mx-auto w-full max-w-[420px] desktop:col-span-5 desktop:mx-0 desktop:max-w-none">
          <div data-fd-frame class="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surfaceNeutral">
            <img :src="f.photo" :alt="`${f.name}, ${f.role} of PASTI`" loading="lazy" draggable="false" class="h-full w-full object-cover object-top">
            <span class="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-slateNavy px-3 py-1.5">
              <LayoutBrandMark surface="dark" :height="10" />
              <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.25)]" />
              <span class="font-mono text-[10px] tracking-[0.14em] text-pureWhite">{{ f.role }}</span>
            </span>
          </div>
          <figcaption class="sr-only">{{ f.name }}, {{ f.role }}</figcaption>
        </figure>

        <div class="m-center desktop:col-span-7">
          <p data-fd-item class="m-center-row inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
            <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ f.eyebrow }}
          </p>
          <blockquote data-fd-item class="mt-6 font-display text-[clamp(26px,2.8vw,42px)] font-bold leading-[1.12] tracking-[-0.03em] text-slateNavy">
            <span aria-hidden="true" class="text-pastiYellow-500">“</span>{{ f.quote }}<span aria-hidden="true" class="text-pastiYellow-500">”</span>
          </blockquote>
          <div class="mt-10 space-y-5 border-t border-[color:rgba(3,60,89,0.14)] pt-8">
            <p v-for="(para, i) in f.foreword" :key="i" data-fd-item class="m-center max-w-[62ch] text-[16px] leading-relaxed text-[color:rgba(3,60,89,0.76)]">{{ para }}</p>
          </div>
          <div data-fd-item class="mt-8">
            <p class="font-display text-[20px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ f.name }}</p>
            <p class="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">{{ f.role }} · PT Hidup Pasti Bahagia</p>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
