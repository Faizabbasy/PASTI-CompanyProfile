<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// SELECTED CREATIVE WORK (COMPRO rebuild 2026-10-07, owner-approved proof):
// 1) OCTO Mobile's performance-marketing strategy as the featured case —
//    challenge, game plan, acquisition funnel and marketing playbook from
//    COMPRO pp.18–19 (translated; the simulated results are NOT shown);
// 2) the Pertamina campaign + the BSI UI/UX testimonial;
// 3) UI/UX work from the technology projects, linking into /work.
const { work } = useCreative()
const f = work.feature
const sectionRef = ref<HTMLElement | null>(null)
const { setState } = useCustomCursor()

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const items = section.querySelectorAll<HTMLElement>('[data-cwk-item]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(items, { autoAlpha: 0, y: 32 })
    const b = ScrollTrigger.batch(items, { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }) })
    return () => b.forEach((t) => t.kill())
  })
})
</script>

<template>
  <section id="creative-work" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Selected work" meta="Creative" />
      <div class="m-center mt-14 desktop:mt-20">
        <p data-cwk-item class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
          <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Proof of craft
        </p>
        <h2 data-cwk-item class="hero-title mt-4">Selected creative work<span class="text-pastiYellow-500">.</span></h2>
      </div>

      <!-- Featured: OCTO performance-marketing strategy -->
      <article class="mt-14 grid gap-10 desktop:mt-20 desktop:grid-cols-12 desktop:gap-12">
        <div data-cwk-item class="desktop:col-span-5">
          <div class="relative mx-auto aspect-[4/5] max-w-[420px] overflow-hidden rounded-[24px] bg-slateNavy shadow-[0_40px_80px_-40px_rgba(3,60,89,0.6)] desktop:sticky desktop:top-28 desktop:max-w-none">
            <img :src="f.image" :alt="f.title" loading="lazy" draggable="false" class="h-full w-full object-cover object-top">
            <span class="absolute left-3 top-3 rounded-full bg-pastiYellow-500 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slateNavy">Case study</span>
          </div>
        </div>
        <div class="min-w-0 desktop:col-span-7">
          <div data-cwk-item class="m-center">
            <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-cobalt">{{ f.category }}</p>
            <h3 class="mt-2 font-display text-[clamp(28px,3vw,44px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-slateNavy">{{ f.title }}</h3>
          </div>

          <div data-cwk-item class="mt-8 border-t border-[color:rgba(3,60,89,0.14)] pt-6">
            <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">Challenge</h4>
            <ol class="mt-4 space-y-3">
              <li v-for="(c, i) in f.challenge" :key="i" class="grid grid-cols-[28px_1fr] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.8)]">
                <span class="pt-[3px] font-mono text-[10px] text-[color:rgba(3,60,89,0.4)]">{{ String(i + 1).padStart(2, '0') }}</span>{{ c }}
              </li>
            </ol>
          </div>

          <div data-cwk-item class="mt-8 rounded-[18px] bg-slateNavy p-6 text-pureWhite">
            <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Game plan</h4>
            <p class="mt-3 text-[16px] font-semibold leading-relaxed">{{ f.gamePlan }}</p>
          </div>

          <div data-cwk-item class="mt-8">
            <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">Acquisition funnel</h4>
            <ol class="mt-4 grid gap-2 tablet:grid-cols-4">
              <li v-for="(s, i) in f.funnel" :key="s.stage" class="relative rounded-[14px] p-4 ring-1 ring-[color:rgba(3,60,89,0.14)]" :class="i === f.funnel.length - 1 ? 'bg-pastiYellow-500 ring-pastiYellow-500' : 'bg-pureWhite'">
                <span class="font-mono text-[10px] text-[color:rgba(3,60,89,0.5)]">{{ String(i + 1).padStart(2, '0') }}</span>
                <p class="mt-1 font-display text-[17px] font-bold text-slateNavy">{{ s.stage }}</p>
                <p class="mt-1.5 text-[13px] leading-snug text-[color:rgba(3,60,89,0.75)]">{{ s.text }}</p>
              </li>
            </ol>
          </div>

          <div data-cwk-item class="mt-8">
            <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">Marketing playbook</h4>
            <ul class="mt-4 space-y-2.5">
              <li v-for="(p, i) in f.playbook" :key="i" class="grid grid-cols-[28px_1fr] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.8)]">
                <span aria-hidden="true" class="mt-[9px] h-px w-3 bg-pastiYellow-500" />{{ p }}
              </li>
            </ul>
          </div>
        </div>
      </article>

      <!-- Campaign + testimonial -->
      <div class="mt-20 grid gap-6 desktop:mt-28 desktop:grid-cols-12">
        <NuxtLink
          :to="work.campaign.to"
          data-cwk-item
          class="group grid overflow-hidden rounded-[24px] bg-pureWhite ring-1 ring-[color:rgba(3,60,89,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slateNavy tablet:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] desktop:col-span-7"
          @mouseenter="setState('view', 'View')"
          @mouseleave="setState('default')"
        >
          <div class="aspect-[4/5] overflow-hidden bg-slateNavy tablet:aspect-auto">
            <img :src="work.campaign.image" :alt="work.campaign.title" loading="lazy" draggable="false" class="h-full w-full object-cover object-top transition-transform duration-700 ease-editorial group-hover:scale-[1.04]">
          </div>
          <div class="flex flex-col justify-between gap-6 p-6 tablet:p-8">
            <div class="m-center">
              <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-cobalt">{{ work.campaign.category }}</p>
              <h3 class="mt-2 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] text-slateNavy">{{ work.campaign.title }}</h3>
              <p class="mt-3 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ work.campaign.description }}</p>
            </div>
            <span class="inline-flex items-center gap-2 text-[14px] font-semibold text-slateNavy">View in Work
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
          </div>
        </NuxtLink>

        <figure data-cwk-item class="flex flex-col justify-between rounded-[24px] bg-slateNavy p-7 text-pureWhite tablet:p-9 desktop:col-span-5">
          <div>
            <span aria-hidden="true" class="block font-display text-[72px] font-extrabold leading-[0.6] text-pastiYellow-500">“</span>
            <blockquote class="mt-4 text-[17px] leading-relaxed text-[color:rgba(255,255,255,0.88)]">{{ work.testimonial.quote }}</blockquote>
          </div>
          <figcaption class="mt-8 border-t border-[color:rgba(255,255,255,0.14)] pt-5">
            <p class="font-display text-[17px] font-bold">{{ work.testimonial.name }}</p>
            <p class="mt-1 text-[13px] text-[color:rgba(255,255,255,0.6)]">{{ work.testimonial.role }}</p>
          </figcaption>
        </figure>
      </div>

      <!-- UI/UX & digital experience -->
      <div class="mt-20 desktop:mt-28">
        <div data-cwk-item class="m-center-row flex items-end justify-between gap-6 border-b border-[color:rgba(3,60,89,0.14)] pb-5">
          <h3 class="font-display text-[clamp(22px,2.2vw,32px)] font-bold tracking-[-0.02em] text-slateNavy">UI/UX &amp; digital experience</h3>
          <p class="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.5)] tablet:block">Brand Identity &amp; UI/UX Design</p>
        </div>
        <ul class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 desktop:grid-cols-4 desktop:gap-6">
          <li v-for="u in work.uiux" :key="u.title" data-cwk-item>
            <NuxtLink
              :to="u.to"
              class="group block rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slateNavy"
              @mouseenter="setState('view', 'View')"
              @mouseleave="setState('default')"
            >
              <div class="aspect-[4/5] overflow-hidden rounded-[18px] bg-slateNavy">
                <img :src="u.image" :alt="u.title" loading="lazy" draggable="false" class="h-full w-full object-cover object-top transition-transform duration-700 ease-editorial group-hover:scale-[1.05]">
              </div>
              <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-cobalt">{{ u.category }}</p>
              <p class="mt-1 font-display text-[17px] font-bold leading-snug text-slateNavy">{{ u.title }} <span aria-hidden="true">↗</span></p>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>
