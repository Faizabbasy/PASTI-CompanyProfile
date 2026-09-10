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

const sectionRef = ref<HTMLElement | null>(null)
const curtainRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

// A curtain wipe that reveals the section the first time it's scrolled
// into view — the same "hidden behind a panel, then unveiled" language as
// Hero's "Explore our work" CTA jump (LayoutSectionCurtain), but scroll-
// triggered here rather than click-triggered, and without the scroll jump
// (the user is already arriving here naturally). The panel covers the
// section, then slides away upward once, revealing it — cards underneath
// still play their own existing entrance animation (SelectedWorkCard.vue's
// clip-reveal) as they individually scroll into view afterward.
useGsapContext(() => {
  const section = sectionRef.value
  const curtain = curtainRef.value
  if (!section || !curtain) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(curtain, { autoAlpha: 0 })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(curtain, { yPercent: 0 })

    // Starts earlier than useMaskedReveal's own trigger on the heading
    // ('top 85%') so the curtain is already fully covering the section
    // before any content underneath begins revealing — the heading/cards
    // should never be visible "through" a gap before the curtain lifts.
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        gsap.to(curtain, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power3.inOut',
          delay: 0.15
        })
      }
    })

    return () => trigger.kill()
  })
})
</script>

<template>
  <BaseSection id="selected-work" as="section" class="relative overflow-hidden rounded-t-[2.5rem] bg-navy-950">
    <div ref="sectionRef" class="relative">
      <!-- Fixed viewport height, not inset-0 relative to the section (which
           spans the full card grid — several thousand px tall): the curtain
           only needs to cover what's actually visible in the viewport when
           the section first scrolls into view, not the section's entire
           length. An inset-0 curtain that tall still visually reads as
           "covering everything" at rest, but a -100% lift then travels its
           own full (multi-thousand-px) height in the same 0.8s duration —
           reading as a near-instant snap rather than a deliberate wipe. -->
      <div ref="curtainRef" aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-20 h-screen bg-navy-950" />

      <BaseContainer>
        <h2 ref="headingRef" class="text-display-lg text-paper">
          {{ heading }}
        </h2>

        <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
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
    </div>
  </BaseSection>
</template>
