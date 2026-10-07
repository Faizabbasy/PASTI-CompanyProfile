<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// INTEGRATION / ARCHITECTURE — deliberately high level (no vendors,
// protocols or certifications): SHIFTLY at the centre, four connected
// domains around it, and the two deployment options from deck slide 8.
// Desktop: a cross layout with drawn connectors. Below: a stacked list.
const { architecture } = useShiftly()
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const links = section.querySelectorAll<HTMLElement>('[data-ar-link]')
  const nodes = section.querySelectorAll<HTMLElement>('[data-ar-node]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(nodes, { autoAlpha: 0, scale: 0.94 })
    gsap.set(links, { scaleX: 0 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 65%', once: true } })
    tl.to(nodes, { autoAlpha: 1, scale: 1, duration: motionTier.standardMax, ease: approvedEase.gsapPrimary, stagger: 0.08 })
      .to(links, { scaleX: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic, stagger: 0.06 }, 0.3)
    return () => tl.kill()
  })
})
</script>

<template>
  <section id="architecture" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Architecture" meta="Integrations" />
      <div class="mt-14 desktop:mt-20">
        <ShiftlyHeading surface="dark" :eyebrow="architecture.eyebrow" :title="architecture.headline" :lede="architecture.body" />
      </div>

      <div class="mt-16 grid gap-3 desktop:grid-cols-[1fr_auto_1fr] desktop:items-center desktop:gap-0">
        <div class="flex flex-col gap-3">
          <template v-for="n in architecture.nodes.slice(0, 2)" :key="n.id">
            <div class="flex items-center">
              <div data-ar-node class="flex-1 rounded-[18px] bg-[color:rgba(255,255,255,0.06)] p-5 ring-1 ring-[color:rgba(255,255,255,0.12)]">
                <p class="flex items-center gap-3 font-display text-[18px] font-bold"><ShiftlyIcon :name="n.id" class="h-6 w-6 text-pastiYellow-500" />{{ n.name }}</p>
                <p class="mt-2 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ n.body }}</p>
              </div>
              <span data-ar-link aria-hidden="true" class="hidden h-[2px] w-12 origin-right bg-pastiYellow-500 desktop:block" />
            </div>
          </template>
        </div>

        <div data-ar-node class="grid place-items-center rounded-[24px] bg-pureWhite px-10 py-10 text-slateNavy shadow-[0_40px_80px_-40px_rgba(0,8,16,0.9)] desktop:min-h-[220px]">
          <ShiftlyMark :size="28" />
          <p class="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Workforce operating platform</p>
          <p class="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Real-time sync</p>
        </div>

        <div class="flex flex-col gap-3">
          <template v-for="n in architecture.nodes.slice(2)" :key="n.id">
            <div class="flex items-center">
              <span data-ar-link aria-hidden="true" class="hidden h-[2px] w-12 origin-left bg-pastiYellow-500 desktop:block" />
              <div data-ar-node class="flex-1 rounded-[18px] bg-[color:rgba(255,255,255,0.06)] p-5 ring-1 ring-[color:rgba(255,255,255,0.12)]">
                <p class="flex items-center gap-3 font-display text-[18px] font-bold"><ShiftlyIcon :name="n.id" class="h-6 w-6 text-pastiYellow-500" />{{ n.name }}</p>
                <p class="mt-2 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ n.body }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="mt-14 grid gap-3 tablet:grid-cols-[auto_1fr_1fr] tablet:items-stretch">
        <p class="m-center self-center font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)] tablet:pr-6">Deployment</p>
        <div v-for="d in architecture.deployment" :key="d.name" class="rounded-[16px] border border-[color:rgba(255,255,255,0.14)] px-5 py-4">
          <p class="font-display text-[17px] font-bold">{{ d.name }}</p>
          <p class="mt-1 text-[14px] text-[color:rgba(255,255,255,0.65)]">{{ d.body }}</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

