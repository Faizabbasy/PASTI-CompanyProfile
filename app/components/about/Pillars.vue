<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// BRAND PILLARS — five expanding panels (brand guide §02). Desktop: hovering
// / focusing / clicking a panel widens it to show its meaning, visual
// translation and its own animated glyph; the others collapse to a vertical
// name. Touch / small screens: an accordion with the same content.
const { pillars } = useAbout()
const active = ref(0)
const { setState } = useCustomCursor()

const sectionRef = ref<HTMLElement | null>(null)
useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const panels = section.querySelectorAll<HTMLElement>('[data-pl-panel]')
  const heads = section.querySelectorAll<HTMLElement>('[data-pl-head]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(heads, { yPercent: 110 })
    gsap.set(panels, { autoAlpha: 0, y: 60 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    tl.to(heads, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 })
      .to(panels, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.08 }, '-=0.4')
    return () => tl.kill()
  })
  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(heads, { yPercent: 0 })
    gsap.set(panels, { autoAlpha: 1, y: 0 })
  })
})
</script>

<template>
  <section ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 15%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Brand pillars" :meta="`${String(pillars.length).padStart(2, '0')} principles`" />
      <div class="mt-14 flex flex-wrap items-end justify-between gap-6 desktop:mt-20">
        <div class="overflow-hidden pb-2">
          <h2 data-pl-head class="font-display text-[length:clamp(40px,6.4vw,104px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slateNavy">
            How PASTI behaves<span class="text-pastiYellow-500">.</span>
          </h2>
        </div>
        <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]"><span class="hidden desktop:inline">Hover a pillar</span><span class="desktop:hidden">Tap a pillar</span></p>
      </div>

      <!-- Desktop: expanding panels -->
      <div class="mt-12 hidden h-[560px] gap-3 desktop:flex" role="tablist" aria-label="Brand pillars">
        <button
          v-for="(p, i) in pillars"
          :key="p.index"
          data-pl-panel
          type="button"
          role="tab"
          :aria-selected="active === i"
          class="pl-panel group relative min-w-0 overflow-hidden rounded-[22px] text-left transition-[flex-grow,background-color] duration-700 ease-editorial"
          :class="active === i ? 'flex-[4.2] bg-slateNavy' : 'flex-1 bg-pureWhite hover:bg-surfaceNeutral'"
          :style="{ boxShadow: active === i ? '0 40px 80px -40px rgba(3,60,89,0.65)' : 'inset 0 0 0 1px rgba(3,60,89,0.12)' }"
          @mouseenter="active = i; setState('link')"
          @mouseleave="setState('default')"
          @focus="active = i"
          @click="active = i"
        >
          <!-- Collapsed label -->
          <span
            class="absolute inset-0 flex flex-col items-center justify-between py-7 transition-opacity duration-300"
            :class="active === i ? 'pointer-events-none opacity-0' : 'opacity-100 delay-200'"
          >
            <span class="font-mono text-[12px] tabular-nums text-[color:rgba(3,60,89,0.5)]">{{ p.index }}</span>
            <span class="font-display text-[26px] font-bold tracking-[-0.02em] text-slateNavy [writing-mode:vertical-rl] rotate-180">{{ p.name }}</span>
            <span class="h-2 w-2 rounded-full bg-pastiYellow-500" />
          </span>

          <!-- Expanded content -->
          <span
            class="absolute inset-0 flex flex-col justify-between p-9 text-pureWhite transition-[opacity,transform] duration-500 ease-editorial"
            :class="active === i ? 'translate-y-0 opacity-100 delay-200' : 'pointer-events-none translate-y-6 opacity-0'"
          >
            <span class="flex items-start justify-between gap-6">
              <span class="font-display text-[length:clamp(90px,10vw,160px)] font-extrabold leading-[0.8] tracking-[-0.06em] pl-ghost">{{ p.index }}</span>
              <AboutPillarGlyph :index="i" :active="active === i" class="h-28 w-28 shrink-0" />
            </span>
            <span class="block">
              <span class="block font-display text-[length:clamp(44px,4.4vw,72px)] font-extrabold leading-none tracking-[-0.045em]">{{ p.name }}<span class="text-pastiYellow-500">.</span></span>
              <span class="mt-5 grid max-w-[46rem] grid-cols-2 gap-8 border-t border-[color:rgba(255,255,255,0.16)] pt-5">
                <span class="block">
                  <span class="block font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Meaning</span>
                  <span class="mt-2 block text-token-body text-[color:rgba(255,255,255,0.85)]">{{ p.meaning }}</span>
                </span>
                <span class="block">
                  <span class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">In design</span>
                  <span class="mt-2 block text-token-body text-[color:rgba(255,255,255,0.65)]">{{ p.visual }}</span>
                </span>
              </span>
            </span>
          </span>
        </button>
      </div>

      <!-- Touch / small screens: accordion -->
      <ul class="mt-10 desktop:hidden">
        <li v-for="(p, i) in pillars" :key="p.index" data-pl-panel class="border-t border-[color:rgba(3,60,89,0.16)] last:border-b">
          <button type="button" class="flex w-full items-center gap-4 py-5 text-left" :aria-expanded="active === i" @click="active = active === i ? -1 : i">
            <span class="font-mono text-[12px] tabular-nums" :class="active === i ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.45)]'">{{ p.index }}</span>
            <span class="flex-1 font-display text-[30px] font-extrabold tracking-[-0.03em] text-slateNavy">{{ p.name }}</span>
            <span class="grid h-11 w-11 place-items-center rounded-full transition-[transform,background-color,color] duration-300" :class="active === i ? 'rotate-45 bg-pastiYellow-500 text-slateNavy' : 'bg-slateNavy text-pureWhite'">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
            </span>
          </button>
          <div class="grid transition-[grid-template-rows] duration-500 ease-editorial" :class="active === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <div class="mb-6 flex gap-5 rounded-[18px] bg-slateNavy p-5 text-pureWhite">
                <AboutPillarGlyph :index="i" :active="active === i" class="h-16 w-16 shrink-0" />
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Meaning</p>
                  <p class="mt-1.5 text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.85)]">{{ p.meaning }}</p>
                  <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">In design</p>
                  <p class="mt-1.5 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.65)]">{{ p.visual }}</p>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
.pl-ghost {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.28);
}
</style>
