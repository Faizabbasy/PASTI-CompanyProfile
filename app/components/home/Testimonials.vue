<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Client-approved testimonial quotes — see useTestimonials.ts. No field for
// this exists in the content mapping doc; the doc's own placement rule says
// to keep this component hidden until real quotes exist, which is now true.
const label = 'What clients say'

const { testimonials } = useTestimonials()

const labelRef = ref<HTMLElement | null>(null)
useMaskedReveal(labelRef, { by: 'word' })

const gridRef = ref<HTMLElement | null>(null)
const cardComponents = ref<{ cardRef: HTMLElement | null; scoreRef: HTMLElement | null; quoteRef: HTMLElement | null; footerRef: HTMLElement | null }[]>([])

const tilts = [-3, 2, 2.5, -2]

// Fixed, non-random focal order (never repeats the same card twice in a
// row) so the cycle is reproducible for visual QA and identical every
// reload — see LARGE_SCALE_MOTION_PLAN.md section 6's deterministic-
// sequence guardrail.
const FOCAL_ORDER = [2, 0, 3, 1, 2, 0, 3, 1]

useGsapContext(() => {
  const grid = gridRef.value
  const cards = cardComponents.value.map((c) => c?.cardRef).filter((el): el is HTMLElement => !!el)
  if (!grid || !cards.length) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Each card's inner elements (score, quote, footer) reveal in their own
    // short staggered beat once the card itself has mostly settled — the
    // entrance reads as "choreographed" rather than the whole card just
    // fading in as one flat block.
    const innerGroups = cardComponents.value.map((c) => [c?.scoreRef, c?.quoteRef, c?.footerRef].filter((el): el is HTMLElement => !!el))

    // Cards fly up from below with a 3D Y-axis rotation (reads as each card
    // "flipping in" out of the floor, not sliding) and settle with an
    // elastic overshoot — a deliberate departure from a plain fade/slide.
    cards.forEach((card, i) => {
      gsap.set(card, {
        opacity: 0,
        y: 90,
        rotateY: i % 2 === 0 ? -28 : 28,
        rotateX: 6,
        rotate: tilts[i % tilts.length],
        scale: 0.92,
        transformPerspective: 1000,
        transformOrigin: '50% 100%'
      })

      const inner = innerGroups[i]
      if (inner?.length) gsap.set(inner, { opacity: 0, y: 10 })
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 75%',
        toggleActions: 'restart none restart reverse',
        onLeaveBack: () => {
          // Reinforces the reverse-on-scroll-up exit with a soft blur pass
          // on top of the timeline's own reverse, so leaving the section
          // upward reads as a deliberate "focus pulls away" beat rather
          // than a bare opacity fade.
          gsap.fromTo(cards, { filter: 'blur(0px)' }, { filter: 'blur(6px)', duration: 0.4, ease: motionEase.exit, overwrite: 'auto' })
        },
        onEnterBack: () => {
          gsap.to(cards, { filter: 'blur(0px)', duration: 0.5, ease: motionEase.standard, overwrite: 'auto' })
        }
      }
    })

    tl.to(cards, {
      opacity: 1,
      y: 0,
      rotateY: 0,
      rotateX: 0,
      rotate: (i: number) => tilts[i % tilts.length] ?? 0,
      scale: 1,
      duration: 1.3,
      ease: 'back.out(1.6)',
      stagger: motionStagger.wide
    })

    cards.forEach((_, i) => {
      const inner = innerGroups[i]
      if (!inner?.length) return
      tl.to(inner, {
        opacity: 1,
        y: 0,
        duration: motionDuration.editorial,
        ease: motionEase.standard,
        stagger: motionStagger.base
      }, `<${motionStagger.wide * 0.6}`)
    })

    // Focal cycling: once the entrance settles, one card at a time
    // approaches the focal plane (scale up, stronger shadow, foreground
    // depth) while the others recede slightly — a slow "refocusing", not a
    // carousel/snap. Hovering a card overrides the cycle to make it focal
    // instantly (see below); the cycle timeline itself just keeps looping
    // in the background.
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const focalScale = isMobile ? 1.02 : 1.04
    const restScale = isMobile ? 0.98 : 0.97
    let hovering = false

    const focalCycle = gsap.timeline({ repeat: -1, delay: 0.4 })

    FOCAL_ORDER.forEach((focalIndex) => {
      focalCycle.call(() => {
        if (hovering) return
        cards.forEach((card, i) => {
          gsap.to(card, {
            scale: i === focalIndex ? focalScale : restScale,
            opacity: i === focalIndex ? 1 : 0.85,
            y: i === focalIndex ? -4 : 0,
            boxShadow: i === focalIndex
              ? '0 40px 70px -30px rgba(0,0,0,0.6)'
              : '0 30px 60px -30px rgba(0,0,0,0.5)',
            duration: 3.5,
            ease: spatialEase.drift
          })
        })
      })
      focalCycle.to({}, { duration: 2.5 })
    })

    tl.add(focalCycle, '+=0.2')

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => { hovering = true })
      card.addEventListener('mouseleave', () => { hovering = false })
    })

    return () => tl.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(cards, { opacity: 1, scale: 1, x: 0, y: 0, rotateY: 0, rotateX: 0, rotate: 0, filter: 'blur(0px)' })
    const innerAll = cardComponents.value.flatMap((c) => [c?.scoreRef, c?.quoteRef, c?.footerRef].filter((el): el is HTMLElement => !!el))
    gsap.set(innerAll, { opacity: 1, y: 0 })
  })
})
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <p ref="labelRef" class="eyebrow text-center">
        {{ label }}
      </p>

      <div ref="gridRef" class="mt-16 grid grid-cols-1 gap-8 md:mt-20 md:grid-cols-2">
        <HomeTestimonialCard
          v-for="(testimonial, i) in testimonials"
          ref="cardComponents"
          :key="testimonial.name"
          :testimonial="testimonial"
          :tilt-deg="tilts[i % tilts.length]"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
