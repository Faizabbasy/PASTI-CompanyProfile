<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// COMPANY PROOF — the approved client logos (useClients) as a calm static
// grid, with the client sectors from COMPRO 2025 (p.25 / CEO foreword).
// Logos are optically sized by aspect ratio (same rule as the homepage
// marquee) and keep their own colours (04-spec §Partner Logo Respect).
const clients = useClients().clients.filter((c) => c.trusted && c.logo)
const { company } = useAbout()
const sectionRef = ref<HTMLElement | null>(null)

const size = (r: number) => {
  const AREA = 2600
  let w = Math.sqrt(AREA * r)
  let h = Math.sqrt(AREA / r)
  if (h > 52) { h = 52; w = h * r }
  if (w > 150) { w = 150; h = w / r }
  return { width: `${w.toFixed(1)}px`, height: `${h.toFixed(1)}px` }
}

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const tiles = section.querySelectorAll<HTMLElement>('[data-cl-tile]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(tiles, { autoAlpha: 0, y: 16 })
    const b = ScrollTrigger.batch(tiles, { start: 'top 92%', once: true, onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.03 }) })
    return () => b.forEach((t) => t.kill())
  })
})
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Clients" :meta="`${clients.length} organizations`" />
      <div class="mt-14 grid items-end gap-8 desktop:mt-20 desktop:grid-cols-12">
        <div class="m-center desktop:col-span-7">
          <h2 class="hero-title">Our beloved client<span class="text-pastiYellow-500">.</span></h2>
        </div>
        <ul class="m-center-row flex flex-wrap gap-2 desktop:col-span-5 desktop:justify-end" aria-label="Sectors">
          <li v-for="s in company.sectors" :key="s" class="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.65)] ring-1 ring-[color:rgba(3,60,89,0.16)]">{{ s }}</li>
        </ul>
      </div>
      <ul class="mt-12 grid grid-cols-2 border-l border-t border-[color:rgba(3,60,89,0.1)] tablet:grid-cols-4 desktop:mt-16 desktop:grid-cols-7">
        <li
          v-for="c in clients"
          :key="c.name"
          data-cl-tile
          class="group grid h-28 place-items-center border-b border-r border-[color:rgba(3,60,89,0.1)] px-4 transition-colors duration-300 hover:bg-surfaceNeutral tablet:h-32"
        >
          <img :src="c.logo!" :alt="c.name" :style="size(c.ratio)" loading="lazy" decoding="async" draggable="false" class="max-w-full object-contain transition-transform duration-500 ease-editorial group-hover:scale-110">
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>
