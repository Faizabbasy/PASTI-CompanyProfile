<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 06 — SELECTED WORK.
const heading = 'Selected work'
const cta = 'View all projects'

const { projects } = useSelectedWork()

const headingRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

// "Cinematic Project Sequence" (2nd scroll-pin, see
// .docs/context/LARGE_SCALE_MOTION_PLAN.md section 5) — the grid layout
// itself never changes; while pinned, each scroll increment advances which
// card reads as dominant (scaled up, raised z-index) while the rest recede
// slightly, like passing through a gallery rather than scrolling a list.
useGsapContext(() => {
  const grid = gridRef.value
  if (!grid) return

  const mm = gsap.matchMedia()

  // Desktop/tablet only — mobile keeps the existing scroll-natural
  // per-card parallax + clip-reveal (already implemented in
  // SelectedWorkCard.vue) rather than pinning a short viewport, per the
  // plan's mobile adaptation note. Reduced motion also skips the pin: all
  // cards stay static at their resting position, no dominant-card scaling.
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(':scope > *'))
    if (!cards.length) return

    const cardCount = cards.length
    // Pin for enough scroll distance to "pass through" all projects —
    // roughly 150-200vh per the plan, scaled by card count so more
    // projects naturally take proportionally more scroll to step through.
    const pinDistance = window.innerHeight * (1.2 + cardCount * 0.15)

    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: 'top top',
      end: `+=${pinDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const activeIndex = Math.min(cardCount - 1, Math.floor(self.progress * cardCount))
        for (const [i, card] of cards.entries()) {
          const distance = Math.abs(i - activeIndex)
          const isActive = distance === 0
          gsap.to(card, {
            scale: isActive ? 1.06 : 1 - Math.min(distance, 2) * 0.03,
            opacity: isActive ? 1 : 0.7,
            zIndex: isActive ? 10 : 1,
            duration: 0.5,
            ease: spatialEase.enter,
            overwrite: 'auto'
          })
        }
      }
    })

    return () => {
      trigger.kill()
      gsap.set(cards, { clearProps: 'scale,opacity,zIndex' })
    }
  })
})
</script>

<template>
  <BaseSection id="selected-work" as="section" class="rounded-t-[2.5rem] bg-navy-950">
    <BaseContainer>
      <h2 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h2>

      <div ref="gridRef" class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
        <HomeSelectedWorkCard
          v-for="(project, index) in projects"
          :key="project.index"
          :project="project"
          :offset="index % 2 === 1"
        />
      </div>

      <div class="mt-16 flex justify-center md:mt-20">
        <NuxtLink
          to="/work"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper transition-colors duration-300 ease-editorial hover:border-yellow-500"
        >
          {{ cta }}
        </NuxtLink>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
