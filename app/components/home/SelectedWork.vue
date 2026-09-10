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

// Per direct feedback: back to the original 2-column grid (each
// SelectedWorkCard.vue playing its own independent clip-reveal + parallax
// entrance, untouched throughout all of this section's motion experiments)
// — the pinned cinematic takeover sequence tried afterward is retired
// entirely. `id="selected-work"` and the `/work` link stay (Hero's
// "Explore our work" CTA jumps here via LayoutSectionCurtain, and /work is
// a real destination page), even though the grid itself matches the
// section's very first version before any curtain existed.
//
// A curtain-sweep entrance is added on top, styled after that same
// click-triggered "Explore our work" motion (LayoutSectionCurtain.vue /
// useSectionCurtain.ts: a full panel rises to cover the viewport, then
// lifts away to reveal the destination) — but scroll-triggered here rather
// than click-triggered, and without the scroll jump (the user is already
// arriving here naturally, so there's nothing to jump to mid-cover).
// `navy-700` with a `yellow-500` leading edge, not `navy-950` — a curtain
// the exact same color as the section behind it never visibly moves; this
// exact bug shipped once already (see git history) and was caught only by
// recording the animation frame-by-frame, so the color choice here is
// deliberate, not decorative.
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
      <div ref="curtainRef" aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-20 h-screen bg-navy-700">
        <div class="absolute inset-x-0 bottom-0 h-[3px] bg-yellow-500" />
      </div>

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
