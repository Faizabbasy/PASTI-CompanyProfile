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
const risingRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

// "Selimut ditarik" — per direct feedback: NOT a separate neutral curtain
// panel that covers then reveals the section behind it (that was the
// previous, now-retired approach, and it read wrong — see git history for
// the reference screenshot). The section itself is the sheet: it arrives,
// holds briefly, then on further scroll input rises bodily from below the
// viewport and covers whatever's behind it (Trust) — same physical-sheet
// language as Hero's "Explore our work" click-curtain, just driven by
// scroll instead of a click, and it's the destination content doing the
// covering rather than a neutral panel handing off to it. Per explicit
// confirmation, the WHOLE section (heading through every grid card, one
// long board) rises together as a single unit — not just a viewport-tall
// "window" at the top with the grid staying put underneath.
//
// Mechanically: pin the section the moment its top reaches the viewport
// top (the "diem dulu" hold), then scrub `risingRef`'s own `y` from one
// viewport height (fully below-viewport, Trust still fully visible) to 0
// (the whole board settled at its natural position) across a short, fixed
// scroll distance — driven by the user's continued scroll, not a timer.
// Pin releases once the rise completes; because the board is now sitting
// at its natural y:0, normal scrolling continues straight into the grid
// below with no extra jump.
useGsapContext(() => {
  const section = sectionRef.value
  const rising = risingRef.value
  if (!section || !rising) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(rising, { y: 0 })
  })

  // Mobile skips the pin (pinning inside a short viewport tends to feel
  // forced) and falls back to a plain scroll-triggered rise at 'top 90%',
  // no hold/scrub.
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
    // `y` in pixels (viewport height), not `yPercent` — `rising` wraps the
    // WHOLE section's content (heading through every grid card, several
    // thousand px tall), so a percentage-based offset would translate it
    // by that same multi-thousand-px height rather than one screen's worth.
    // A fixed viewport-height rise reads as "the sheet rises one full
    // screen to cover what's behind it", not a many-screens-long throw.
    const riseDistance = window.innerHeight

    gsap.set(rising, { y: riseDistance })

    const pin = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=70%',
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      onUpdate: (self) => gsap.set(rising, { y: riseDistance * (1 - self.progress) })
    })

    return () => pin.kill()
  })

  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => {
    const riseDistance = window.innerHeight * 0.4

    gsap.set(rising, { y: riseDistance })

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(rising, { y: 0, duration: 0.8, ease: spatialEase.settle })
      }
    })

    return () => trigger.kill()
  })
})
</script>

<template>
  <BaseSection id="selected-work" as="section" class="relative overflow-hidden">
    <div ref="sectionRef" class="relative">
      <!-- bg-navy-950 and rounded-t-[2.5rem] live on `risingRef`, not the
           section itself: the section's own box already occupies its
           natural document-flow position the moment its top reaches the
           viewport (that's what trips the pin), so a background/shape
           painted directly on it would solidly cover Trust immediately,
           before the content had actually risen — reproduced once already
           (see the referenced screenshot: a flat navy frame with nothing
           visible underneath, well before any rise had actually happened).
           Keeping both on the translated element means Trust stays
           genuinely visible, rounded top edge included, until the sheet
           physically arrives. -->
      <div ref="risingRef" class="relative rounded-t-[2.5rem] bg-navy-950">
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
    </div>
  </BaseSection>
</template>
