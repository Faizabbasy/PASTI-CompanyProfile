<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// PERSONALITY (brand guide §03) — "PASTI is" as solid chips that pop in,
// "PASTI is not" as outlined chips that get struck through one by one, and
// the personality spectrum as five tracks whose Yellow handle slides to its
// bias. Chips react to hover; the spectrum handle follows the pointer while
// hovering a track and springs back to the brand's position on leave.
const { personalityIs, personalityIsNot, spectrum } = useAbout()
const sectionRef = ref<HTMLElement | null>(null)
const preview = ref<Record<number, number | null>>({})
// Handles rest at the left pole until the section is revealed, then slide
// (CSS transition) to the brand's bias.
const armed = ref(false)

const onTrackMove = (i: number, e: PointerEvent) => {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  preview.value = { ...preview.value, [i]: Math.min(10, Math.max(0, ((e.clientX - r.left) / r.width) * 10)) }
}
const onTrackLeave = (i: number) => {
  preview.value = { ...preview.value, [i]: null }
}
const handlePos = (i: number) => {
  if (!armed.value) return 0
  const p = preview.value[i]
  // Bias counts toward pole A (left), so the handle sits at (10 - bias)/10.
  return p ?? 10 - spectrum[i]!.bias
}

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const isChips = section.querySelectorAll<HTMLElement>('[data-ps-is]')
  const notChips = section.querySelectorAll<HTMLElement>('[data-ps-not]')
  const strikes = section.querySelectorAll<HTMLElement>('[data-ps-strike]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set([...isChips, ...notChips], { autoAlpha: 1, scale: 1, y: 0 })
    gsap.set(strikes, { scaleX: 1 })
    armed.value = true
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(isChips, { autoAlpha: 0, scale: 0.6 })
    gsap.set(notChips, { autoAlpha: 0, y: 14 })
    gsap.set(strikes, { scaleX: 0, transformOrigin: 'left center' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 65%', once: true } })
    tl.to(isChips, { autoAlpha: 1, scale: 1, duration: motionTier.standardMax, ease: approvedEase.gsapPrimary, stagger: 0.06 })
      .to(notChips, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.05 }, '-=0.2')
      .to(strikes, { scaleX: 1, duration: motionTier.standardMax, ease: approvedEase.gsapPrimary, stagger: 0.08 }, '-=0.1')
      .call(() => { armed.value = true }, undefined, '-=0.9')
    return () => tl.kill()
  })
})
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Personality" meta="Confident · never cold" />

      <div class="mt-14 grid gap-16 desktop:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <!-- Is / is not -->
        <div class="desktop:col-span-7">
          <h2 class="m-center font-display text-[length:clamp(36px,4.4vw,64px)] font-extrabold leading-[0.98] tracking-[-0.04em] text-slateNavy">PASTI is<span class="text-pastiYellow-500">.</span></h2>
          <ul class="m-center-row mt-6 flex flex-wrap gap-2.5">
            <li
              v-for="w in personalityIs"
              :key="w"
              data-ps-is
              class="cursor-default rounded-full bg-slateNavy px-5 py-2.5 font-display text-[15px] font-bold text-pureWhite transition-[transform,background-color,color] duration-300 ease-editorial hover:-translate-y-1 hover:bg-pastiYellow-500 hover:text-slateNavy tablet:text-[17px]"
            >
              {{ w }}
            </li>
          </ul>

          <h3 class="m-center mt-14 font-display text-[length:clamp(28px,3vw,44px)] font-extrabold leading-none tracking-[-0.035em] text-[color:rgba(3,60,89,0.45)]">PASTI is not</h3>
          <ul class="m-center-row mt-6 flex flex-wrap gap-2.5">
            <li
              v-for="w in personalityIsNot"
              :key="w"
              data-ps-not
              class="relative rounded-full border border-[color:rgba(3,60,89,0.2)] px-5 py-2.5 font-display text-[15px] font-semibold text-[color:rgba(3,60,89,0.45)] tablet:text-[17px]"
            >
              {{ w }}
              <span data-ps-strike aria-hidden="true" class="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-pastiYellow-500" />
            </li>
          </ul>
        </div>

        <!-- Spectrum -->
        <div class="desktop:col-span-5">
          <p class="m-center font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">Personality spectrum</p>
          <ul class="mt-6 flex flex-col gap-7">
            <li v-for="(s, i) in spectrum" :key="s.a">
              <div class="flex justify-between font-display text-[14px] font-bold">
                <span class="text-slateNavy">{{ s.a }}</span>
                <span class="text-[color:rgba(3,60,89,0.45)]">{{ s.b }}</span>
              </div>
              <div
                class="relative mt-3 h-8 cursor-ew-resize"
                @pointermove="onTrackMove(i, $event)"
                @pointerleave="onTrackLeave(i)"
              >
                <span class="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                  <span v-for="n in 11" :key="n" class="h-1.5 w-1.5 rounded-full" :class="n - 1 <= 10 - s.bias ? 'bg-slateNavy' : 'bg-[color:rgba(3,60,89,0.15)]'" />
                </span>
                <span
                  data-ps-handle
                  class="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-pureWhite bg-pastiYellow-500 shadow-[0_6px_16px_-4px_rgba(3,60,89,0.5)] transition-[left] duration-700 ease-editorial"
                  :style="{ left: `${(handlePos(i) / 10) * 100}%` }"
                />
              </div>
            </li>
          </ul>
          <p class="mt-8 text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.6)]">
            Confident and sophisticated, without becoming cold or pretentious.
          </p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
