<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// ENTERPRISE BRANDING SUITE (deck slide 9) — price withheld (needs owner
// approval). The idea is shown, not told: a schematic app shell (no metrics,
// skeleton content only) that re-skins to an example corporate identity —
// logo, colours, domain — when a brand swatch is picked. The example brands
// are neutral placeholders, not clients.
const { branding } = useShiftly()
const sectionRef = ref<HTMLElement | null>(null)
const brands = [
  { id: 'shiftly', label: 'SHIFTLY', name: 'SHIFTLY', domain: 'shiftly.app', primary: '#033C59', accent: '#FBBA00', radius: '10px' },
  { id: 'a', label: 'Your company', name: 'Your Company', domain: 'hr.yourcompany.com', primary: '#0E5A43', accent: '#7ED0A8', radius: '4px' },
  { id: 'b', label: 'Your company', name: 'Your Company', domain: 'people.yourcompany.co.id', primary: '#6B1E2E', accent: '#F2A65A', radius: '16px' }
]
const brand = ref(0)
const b = computed(() => brands[brand.value]!)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const items = section.querySelectorAll<HTMLElement>('[data-bs-item]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(items, { autoAlpha: 0, y: 22 })
    const t = gsap.to(items, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07, scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    return () => t.kill()
  })
})
</script>

<template>
  <section id="branding" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 80%; --lift-y: 30%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Branding suite" meta="Enterprise add-on" />
      <div class="mt-14 grid gap-14 desktop:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <ShiftlyHeading :eyebrow="branding.eyebrow" :title="branding.headline" :lede="branding.body" />
          <ul class="mt-10 border-t border-[color:rgba(3,60,89,0.14)]">
            <li v-for="f in branding.features" :key="f.name" data-bs-item class="grid grid-cols-[1fr] gap-1 border-b border-[color:rgba(3,60,89,0.14)] py-4 tablet:grid-cols-[180px_1fr] tablet:gap-6">
              <p class="font-display text-[16px] font-bold text-slateNavy">{{ f.name }}</p>
              <p class="text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ f.body }}</p>
            </li>
          </ul>
          <p data-bs-item class="mt-6 font-display text-[18px] font-bold text-slateNavy">{{ branding.tagline }}</p>
        </div>

        <!-- Re-skinnable app shell -->
        <div data-bs-item class="desktop:col-span-7">
          <div role="radiogroup" aria-label="Preview a corporate identity" class="m-center-row flex flex-wrap items-center gap-2">
            <span class="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Preview identity</span>
            <button
              v-for="(x, i) in brands"
              :key="x.id"
              type="button"
              role="radio"
              :aria-checked="brand === i"
              class="inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold ring-1 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slateNavy"
              :class="brand === i ? 'bg-slateNavy text-pureWhite ring-slateNavy' : 'bg-pureWhite text-slateNavy ring-[color:rgba(3,60,89,0.18)]'"
              @click="brand = i"
            >
              <span class="flex" aria-hidden="true"><span class="h-3.5 w-3.5 rounded-full" :style="{ background: x.primary }" /><span class="-ml-1 h-3.5 w-3.5 rounded-full ring-2 ring-pureWhite" :style="{ background: x.accent }" /></span>
              {{ x.label }}<span v-if="i > 0" class="sr-only"> example {{ i }}</span>
            </button>
          </div>

          <div class="mt-5 overflow-hidden rounded-[18px] bg-pureWhite shadow-[0_50px_100px_-50px_rgba(3,60,89,0.55)] ring-1 ring-[color:rgba(3,60,89,0.12)]" aria-hidden="true">
            <div class="flex items-center gap-2 border-b border-[color:rgba(3,60,89,0.08)] bg-surfaceNeutral px-4 py-2.5">
              <span class="h-2.5 w-2.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" /><span class="h-2.5 w-2.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" />
              <span class="ml-2 flex h-6 flex-1 items-center gap-1.5 rounded-full bg-pureWhite px-3 font-mono text-[11px] text-[color:rgba(3,60,89,0.6)]">
                <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
                <span class="bs-swap">{{ b.domain }}</span>
              </span>
            </div>
            <div class="grid grid-cols-[30%_1fr] tablet:grid-cols-[200px_1fr]">
              <div class="bs-swap min-h-[300px] p-4 tablet:min-h-[360px]" :style="{ background: b.primary }">
                <div class="flex items-center gap-2">
                  <span class="grid h-7 w-7 place-items-center text-[12px] font-extrabold" :style="{ background: b.accent, color: b.primary, borderRadius: b.radius }">{{ b.name[0] }}</span>
                  <span class="truncate font-display text-[13px] font-bold text-pureWhite">{{ b.name }}</span>
                </div>
                <div class="mt-6 space-y-2.5">
                  <span v-for="n in 7" :key="n" class="block h-2.5 rounded-full" :style="{ width: `${92 - (n % 3) * 18}%`, background: n === 1 ? b.accent : 'rgba(255,255,255,0.18)' }" />
                </div>
              </div>
              <div class="p-4 tablet:p-6">
                <span class="block h-3.5 w-1/2 rounded-full bg-[color:rgba(3,60,89,0.16)]" />
                <span class="mt-2 block h-2.5 w-1/3 rounded-full bg-[color:rgba(3,60,89,0.08)]" />
                <div class="mt-5 grid grid-cols-2 gap-3 tablet:grid-cols-4">
                  <span v-for="n in 4" :key="n" class="bs-swap block h-16 p-3 ring-1 ring-[color:rgba(3,60,89,0.08)]" :style="{ borderRadius: b.radius }">
                    <span class="block h-2 w-2/3 rounded-full bg-[color:rgba(3,60,89,0.12)]" />
                    <span class="mt-3 block h-3 w-1/2 rounded-full" :style="{ background: n === 1 ? b.accent : 'rgba(3,60,89,0.18)' }" />
                  </span>
                </div>
                <div class="bs-swap mt-4 h-24 p-4 ring-1 ring-[color:rgba(3,60,89,0.08)]" :style="{ borderRadius: b.radius }">
                  <span class="block h-2 w-1/4 rounded-full bg-[color:rgba(3,60,89,0.12)]" />
                  <span class="mt-6 flex h-2 overflow-hidden rounded-full"><span class="w-[62%]" :style="{ background: b.primary }" /><span class="w-[20%]" :style="{ background: b.accent }" /><span class="flex-1 bg-[color:rgba(3,60,89,0.1)]" /></span>
                </div>
                <span class="bs-swap mt-4 inline-block h-9 w-32" :style="{ background: b.accent, borderRadius: b.radius }" />
              </div>
            </div>
          </div>
          <p class="m-center mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">Schematic preview — example identities, not client data</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.bs-swap {
  transition: background-color 0.5s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.5s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s;
}
@media (prefers-reduced-motion: reduce) {
  .bs-swap {
    transition: none;
  }
}
</style>
