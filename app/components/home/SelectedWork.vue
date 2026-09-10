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

// A brief scroll-pinned curtain reveal, per direct feedback: the section
// should hold still the moment it's reached (not auto-play immediately),
// then the content block (heading/grid/CTA, `risingRef`) rises into place
// — under the lifting curtain panel — driven by the user's own continued
// scroll input (scrubbed), not a timer. Only once that short pinned rise
// completes does the pin release and normal scrolling resume; cards then
// reveal together in one coordinated stagger. This is a short, one-shot
// pin (not the earlier dominant-card cinematic pin that was reverted —
// that one cycled through cards for 150-200vh of scroll and was reverted
// for feeling "stuck"; this pin only covers the single rise gesture, a
// small fixed scroll distance, then gets out of the way).
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

  // Mobile skips the pin entirely (per the plan's global mobile-adaptation
  // rule: pins feel forced in a short mobile viewport) and falls back to a
  // plain scroll-triggered reveal at 'top 85%', no scrub/hold. Nested inside
  // the outer '(prefers-reduced-motion: no-preference)' branch below, so
  // only the viewport width needs to be queried here.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches

    gsap.set(curtain, { yPercent: 0 })
    gsap.set(rising, { y: 120, autoAlpha: 0 })
    gsap.set(cards, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 16px)' })

    const revealCards = () =>
      gsap.to(cards, {
        opacity: 1,
        scale: 1,
        clipPath: 'inset(0% round 16px)',
        duration: 1,
        ease: motionEase.standard,
        stagger: motionStagger.wide
      })

    if (!isDesktop) {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(rising, { y: 0, autoAlpha: 1, duration: 0.8, ease: spatialEase.enter })
          gsap.to(curtain, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' })
          revealCards()
        }
      })
      return () => trigger.kill()
    }

    // Desktop/tablet: pin the section right as it reaches the top of the
    // viewport (the "hold still" moment), then scrub the rise/lift across
    // a short, fixed scroll distance (60% of viewport height) driven by
    // the user's own continued scroll — not an auto-playing timeline.
    let cardsRevealed = false
    const pin = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${window.innerHeight * 0.6}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.4,
      onUpdate: (self) => {
        gsap.set(rising, { y: 120 * (1 - self.progress), autoAlpha: self.progress })
        gsap.set(curtain, { yPercent: -100 * self.progress })
      },
      onLeave: () => {
        if (cardsRevealed) return
        cardsRevealed = true
        revealCards()
      },
      onLeaveBack: () => {
        cardsRevealed = false
        gsap.set(cards, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 16px)' })
      }
    })

    return () => pin.kill()
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
           reading as a near-instant snap rather than a deliberate wipe.
           `navy-700` (not `navy-950`, matching the section's own resting
           background) plus a `yellow-500` leading edge — a curtain the
           exact same color as what it's covering never visibly moves; the
           lift needs contrast against the section to read as a panel
           pulling away rather than the background just sitting there. -->
      <div ref="curtainRef" aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-20 h-screen bg-navy-700">
        <div class="absolute inset-x-0 bottom-0 h-[3px] bg-yellow-500" />
      </div>

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
