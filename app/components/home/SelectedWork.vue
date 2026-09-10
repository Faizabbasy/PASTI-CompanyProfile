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
const risingRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

// A curtain wipe that reveals the section the first time it's scrolled
// into view — the same "hidden behind a panel, then unveiled" language as
// Hero's "Explore our work" CTA jump (LayoutSectionCurtain), but scroll-
// triggered here rather than click-triggered, and without the scroll jump
// (the user is already arriving here naturally). Per direct feedback, the
// content block itself (heading/grid/CTA, `risingRef`) now rises into
// place under the panel rather than just sitting static behind it — so
// the moment reads as the whole block surfacing, not merely a curtain
// sliding off inert content. Once the curtain finishes lifting away, all
// cards currently in the grid reveal together in one coordinated stagger.
// This force-resets each card to its SelectedWorkCard.vue-authored hidden
// state right before the reveal regardless of whether that card's own
// `top 88%` ScrollTrigger already fired while still behind the curtain —
// harmless, since the opaque curtain panel (z-20, h-screen) fully hides
// the grid underneath either way, so re-triggering the reveal in sync
// with the lift is indistinguishable from the card never having fired.
// Cards scrolled to later keep playing their own independent entrance in
// SelectedWorkCard.vue as they come into view normally.
useGsapContext(() => {
  const section = sectionRef.value
  const curtain = curtainRef.value
  const rising = risingRef.value
  if (!section || !curtain || !rising) return

  const cards = Array.from(rising.querySelectorAll<HTMLElement>('[data-selected-work-card]'))

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(curtain, { autoAlpha: 0 })
    gsap.set(rising, { y: 0, autoAlpha: 1 })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(curtain, { yPercent: 0 })
    gsap.set(rising, { y: 48, autoAlpha: 0 })

    // Starts earlier than useMaskedReveal's own trigger on the heading
    // ('top 85%') so the curtain is already fully covering the section
    // before any content underneath begins revealing — the heading/cards
    // should never be visible "through" a gap before the curtain lifts.
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        gsap.set(cards, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 16px)' })

        const tl = gsap.timeline()

        tl.to(rising, { y: 0, autoAlpha: 1, duration: 0.8, ease: spatialEase.enter, delay: 0.15 })
          .to(curtain, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '<')
          .to(cards, {
            opacity: 1,
            scale: 1,
            clipPath: 'inset(0% round 16px)',
            duration: 1,
            ease: motionEase.standard,
            stagger: motionStagger.wide
          }, '-=0.35')
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
        <div ref="risingRef">
          <h2 ref="headingRef" class="text-display-lg text-paper">
            {{ heading }}
          </h2>

          <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
            <HomeSelectedWorkCard
              v-for="(project, index) in projects"
              :key="project.index"
              data-selected-work-card
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
        </div>
      </BaseContainer>
    </div>
  </BaseSection>
</template>
