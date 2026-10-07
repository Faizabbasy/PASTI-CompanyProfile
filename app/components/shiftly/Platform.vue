<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// MORE THAN JUST HRIS (deck slide 11). Interactive: the four operating
// layers are buttons; picking one lifts it to the front of the stack and
// lights the capabilities that belong to it (grouping is ours, by topic —
// the capability names and lines are the deck's). Below desktop the same
// buttons sit above a filtered capability list. CSS transitions only.
const { platform } = useShiftly()
const sectionRef = ref<HTMLElement | null>(null)
const icons = ['people', 'process', 'data', 'technology']
// layer index → capability indexes
const map: number[][] = [[0, 2], [1], [3], [4, 5]]
const active = ref(0)
const lit = (ci: number) => map[active.value]!.includes(ci)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const layers = section.querySelectorAll<HTMLElement>('[data-pf-layer]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(layers, { autoAlpha: 0, x: 60 })
    const a = gsap.to(layers, { autoAlpha: 1, x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.1, scrollTrigger: { trigger: section.querySelector('[data-pf-stack]'), start: 'top 80%', once: true } })
    return () => a.kill()
  })
})
</script>

<template>
  <section id="platform" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 15%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Platform" meta="More than just HRIS" />
      <div class="mt-14 grid gap-12 desktop:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <ShiftlyHeading :eyebrow="platform.eyebrow" :title="platform.headline" :lede="platform.body" />
          <p class="m-center mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">
            <span aria-hidden="true" class="grid h-5 w-5 place-items-center rounded-full bg-pastiYellow-500 text-[11px] text-slateNavy">↓</span>Pick a layer to see what it powers
          </p>
        </div>

        <!-- Layer buttons -->
        <div data-pf-stack role="group" aria-label="Operating layers" class="flex flex-col gap-2 desktop:col-span-7">
          <button
            v-for="(l, i) in platform.layers"
            :key="l.name"
            data-pf-layer
            type="button"
            :aria-pressed="active === i"
            class="pf-layer group grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-[16px] px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slateNavy tablet:grid-cols-[56px_150px_1fr_auto] tablet:gap-6 tablet:px-7"
            :class="active === i ? 'bg-slateNavy text-pureWhite shadow-[0_30px_60px_-30px_rgba(3,60,89,0.7)] desktop:-translate-x-3' : 'bg-pureWhite text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.12)] hover:ring-slateNavy'"
            @click="active = i"
            @mouseenter="active = i"
          >
            <span class="grid h-12 w-12 place-items-center rounded-[12px] transition-colors duration-300" :class="active === i ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-surfaceNeutral text-slateNavy group-hover:bg-pastiYellow-500'">
              <ShiftlyIcon :name="icons[i]!" class="h-6 w-6" />
            </span>
            <span class="font-display text-[22px] font-extrabold tracking-[-0.02em]">{{ l.name }}</span>
            <span class="col-span-3 row-start-2 text-[15px] leading-snug tablet:col-span-1 tablet:row-start-auto" :class="active === i ? 'text-[color:rgba(255,255,255,0.78)]' : 'text-[color:rgba(3,60,89,0.72)]'">{{ l.body }}</span>
            <span class="col-start-3 row-start-1 grid h-9 w-9 place-items-center rounded-full transition-[transform,background-color] duration-300 tablet:col-start-auto tablet:row-start-auto" :class="active === i ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-surfaceNeutral text-slateNavy group-hover:translate-x-0.5'">
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
          </button>
        </div>
      </div>

      <!-- Capabilities, lit by the active layer -->
      <ul class="mt-16 grid gap-3 tablet:grid-cols-2 desktop:mt-20 desktop:grid-cols-3" aria-live="polite">
        <li
          v-for="(c, i) in platform.capabilities"
          :key="c.name"
          class="pf-cap relative overflow-hidden rounded-[18px] p-6 tablet:p-7"
          :class="lit(i) ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-pureWhite text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)] opacity-60'"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px]" :class="lit(i) ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.45)]'">{{ String(i + 1).padStart(2, '0') }}</span>
            <span v-if="lit(i)" class="rounded-full bg-slateNavy px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-pureWhite">{{ platform.layers[active]!.name }}</span>
          </div>
          <h3 class="mt-3 font-display text-[21px] font-bold tracking-[-0.02em] text-slateNavy">{{ c.name }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed" :class="lit(i) ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.72)]'">{{ c.body }}</p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
.pf-layer,
.pf-cap {
  transition: background-color 0.4s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s, opacity 0.4s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s;
}
@media (prefers-reduced-motion: reduce) {
  .pf-layer,
  .pf-cap {
    transition: none;
  }
}
</style>
