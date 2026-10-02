<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// CASE FILES — the three case studies with real Brief / Result copy (from
// pastipeople.id/portfolio). There is no matching project imagery, so each
// is a "file": a typographic cover (client mark on navy / yellow) + a tab
// that opens the brief and result. One open at a time; the open file's
// cover flips to yellow and its mark scales up.
const { caseFiles } = useWorkPortfolio()
const open = ref(0)
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-cf-row]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rows, { autoAlpha: 0, x: -40 })
    const tl = gsap.to(rows, { autoAlpha: 1, x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.1, scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    return () => tl.kill()
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Case files" meta="Brief → Result" />
      <h2 class="m-center mt-12 font-display text-[length:clamp(40px,6vw,96px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-pureWhite desktop:mt-16">
        From brief <span class="text-pastiYellow-500">to result.</span>
      </h2>

      <ol class="mt-12 border-b border-[color:rgba(255,255,255,0.14)]">
        <li v-for="(c, i) in caseFiles" :key="c.index" data-cf-row class="border-t border-[color:rgba(255,255,255,0.14)]">
          <button type="button" class="group flex w-full items-center gap-5 py-6 text-left tablet:gap-8" :aria-expanded="open === i" @click="open = open === i ? -1 : i">
            <span
              class="grid h-16 w-16 shrink-0 place-items-center rounded-[14px] font-display font-extrabold tracking-[-0.04em] transition-[background-color,color,transform] duration-500 ease-editorial tablet:h-20 tablet:w-20"
              :class="open === i ? 'scale-105 bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(255,255,255,0.08)] text-pureWhite group-hover:bg-[color:rgba(255,255,255,0.14)]'"
              :style="{ fontSize: c.mark.length > 2 ? '16px' : '24px' }"
            >{{ c.mark }}</span>
            <span class="min-w-0 flex-1">
              <span class="block font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.5)]">File {{ c.index }} · {{ c.date }}</span>
              <span class="mt-1 block font-display text-[clamp(24px,3.2vw,48px)] font-extrabold leading-[1.05] tracking-[-0.035em]">{{ c.client }}</span>
            </span>
            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300" :class="open === i ? 'rotate-45 bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(255,255,255,0.1)] text-pureWhite'">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
            </span>
          </button>
          <div class="grid transition-[grid-template-rows] duration-500 ease-editorial" :class="open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <div class="grid gap-6 pb-8 tablet:grid-cols-2 tablet:gap-10 tablet:pl-28">
                <div class="rounded-[18px] bg-[color:rgba(255,255,255,0.06)] p-6 ring-1 ring-[color:rgba(255,255,255,0.1)]">
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">The brief</p>
                  <p class="mt-3 text-token-body leading-relaxed text-[color:rgba(255,255,255,0.85)]">{{ c.brief }}</p>
                </div>
                <div class="rounded-[18px] bg-pastiYellow-500 p-6 text-slateNavy">
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em]">The result</p>
                  <p class="mt-3 font-display text-[18px] font-bold leading-snug">{{ c.result }}</p>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>
