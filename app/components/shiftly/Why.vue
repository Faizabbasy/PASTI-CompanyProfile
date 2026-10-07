<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// WHY SHIFTLY — "Different by Design. Better by Experience." (deck slide 5,
// SHIFTLY's own column only — no competitor comparison) with slide 2's
// "Your system. Your brand. Your rules." as the closing statement. Eight
// differentiators as a numbered list. No superiority claims, and no bars or
// scores that could read as a rating.
const { why } = useShiftly()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-wy-row]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rows, { autoAlpha: 0, y: 16 })
    const b = ScrollTrigger.batch(rows, {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.06 })
    })
    return () => b.forEach((t) => t.kill())
  })
})
</script>

<template>
  <section id="why" ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Why SHIFTLY" :meta="`${pad(why.items.length)} differentiators`" />
      <div class="mt-14 desktop:mt-20">
        <ShiftlyHeading :eyebrow="why.eyebrow" :title="why.headline" :lede="why.body" />
      </div>

      <ol class="mt-14 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
        <li
          v-for="(it, i) in why.items"
          :key="it.name"
          data-wy-row
          class="relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[20px] p-6"
          :class="i === 0 || i === 7 ? 'bg-slateNavy text-pureWhite' : 'bg-surfaceNeutral text-slateNavy'"
        >
          <span aria-hidden="true" class="absolute -right-3 -top-5 font-display text-[96px] font-extrabold leading-none tracking-[-0.06em] opacity-[0.07]">{{ pad(i + 1) }}</span>
          <span aria-hidden="true" class="block h-[3px] w-8 origin-left bg-pastiYellow-500" />
          <div class="relative mt-8">
            <h3 class="font-display text-[20px] font-bold tracking-[-0.01em]" :class="i === 0 || i === 7 ? 'text-pureWhite' : 'text-slateNavy'">{{ it.name }}</h3>
            <p class="mt-2 text-[14px] leading-relaxed" :class="i === 0 || i === 7 ? 'text-[color:rgba(255,255,255,0.75)]' : 'text-[color:rgba(3,60,89,0.72)]'">{{ it.body }}</p>
          </div>
        </li>
      </ol>

      <div class="mt-14 flex flex-col items-start gap-5 rounded-[24px] bg-slateNavy p-7 text-pureWhite tablet:flex-row tablet:items-center tablet:p-10">
        <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy"><ShiftlyIcon name="check" class="h-6 w-6" /></span>
        <div>
          <p class="font-display text-[clamp(24px,2.4vw,34px)] font-extrabold tracking-[-0.02em]">{{ why.statement.title }}</p>
          <p class="mt-1.5 text-[15px] text-[color:rgba(255,255,255,0.75)]">{{ why.statement.body }}</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

