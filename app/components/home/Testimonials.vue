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
const cardComponents = ref<{ cardRef: HTMLElement | null }[]>([])

const tilts = [-8, 6, 7, -6]

useGsapContext(() => {
  const grid = gridRef.value
  const cards = cardComponents.value.map((c) => c?.cardRef).filter((el): el is HTMLElement => !!el)
  if (!grid || !cards.length) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Measure each card's own center relative to the grid's center, then
    // start it stacked exactly on top of that shared center point (like one
    // deck of cards) and animate it back to its natural grid position — the
    // vector is computed from real layout, not guessed offsets, so the
    // "stack" always lands dead-center regardless of grid/column width.
    const gridRect = grid.getBoundingClientRect()
    const gridCenterX = gridRect.left + gridRect.width / 2
    const gridCenterY = gridRect.top + gridRect.height / 2

    cards.forEach((card, i) => {
      const cardRect = card.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2
      const cardCenterY = cardRect.top + cardRect.height / 2

      gsap.set(card, {
        opacity: 0,
        scale: 0.55,
        x: gridCenterX - cardCenterX,
        y: gridCenterY - cardCenterY,
        rotate: tilts[i % tilts.length]
      })
    })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: grid, start: 'top 75%', toggleActions: 'restart none restart reverse' }
    })

    tl.to(cards, {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      rotate: 0,
      duration: 1.1,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      stagger: motionStagger.wide
    })

    return () => tl.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(cards, { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 })
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
          v-for="testimonial in testimonials"
          ref="cardComponents"
          :key="testimonial.name"
          :testimonial="testimonial"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
