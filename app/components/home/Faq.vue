<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, sections 13
// — FAQ: REPLACE TEMPLATE QUESTIONS and 14 — FAQ ANSWERS / PASTI COPY.
const heading = 'FAQ'

const { items } = useFaq()

const sectionRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
const glowSecondaryRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

useGsapContext(() => {
  if (!glowRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const anim = gsap.to(glowRef.value, {
      x: -30,
      y: 40,
      duration: 9,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
    return () => anim.kill()
  })
})

// Second glow variant blending navy+yellow, reinforcing the "space"
// feeling in this dark section (LARGE_SCALE_MOTION_PLAN.md section 10).
useGsapContext(() => {
  if (!glowSecondaryRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const anim = gsap.to(glowSecondaryRef.value, {
      x: 25,
      y: -35,
      duration: 11,
      ease: spatialEase.drift,
      yoyo: true,
      repeat: -1
    })
    return () => anim.kill()
  })
})

// Structural Expansion: the "FAQ" heading gets a light scale + letter-
// spacing scrub tied to scroll progress — spacing tightens as the camera
// moves closer to the text (LARGE_SCALE_MOTION_PLAN.md section 10).
useGsapContext(() => {
  const heading = headingRef.value
  const section = (sectionRef.value as unknown as { $el?: HTMLElement })?.$el ?? (sectionRef.value as unknown as HTMLElement)
  if (!heading || !section) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const scaleTo = isMobile ? 1.015 : 1.04
    const trackingFrom = isMobile ? '0.005em' : '0.01em'

    gsap.set(heading, { letterSpacing: trackingFrom, transformOrigin: '0% 50%' })

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(heading, {
          scale: 1 + (scaleTo - 1) * self.progress,
          letterSpacing: `${0.01 - 0.01 * self.progress}em`
        })
      }
    })

    return () => trigger.kill()
  })
})
</script>

<template>
  <BaseSection ref="sectionRef" as="section" class="relative overflow-hidden bg-navy-950">
    <div
      ref="glowRef"
      aria-hidden="true"
      class="pointer-events-none absolute -right-1/4 top-0 h-[32rem] w-[32rem] rounded-full bg-yellow-500/10 blur-3xl"
    />
    <div
      ref="glowSecondaryRef"
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-1/4 -left-1/4 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-navy-600/15 to-yellow-500/10 blur-3xl"
    />

    <BaseContainer class="relative">
      <div class="relative inline-block">
        <!-- Swiss/editorial corner-bracket accent, same motif as Hero/Why
             PASTI, anchored to the heading's own bounding box (not the
             container) so it stays visually attached to "FAQ" at any
             viewport width instead of drifting to the container's edge. -->
        <span
          aria-hidden="true"
          class="pointer-events-none absolute -right-6 -top-3 hidden h-8 w-8 border-r-2 border-t-2 border-yellow-500/20 sm:block md:-right-8"
        />

        <h2 ref="headingRef" class="text-display-lg text-paper">
          {{ heading }}
        </h2>
      </div>

      <div class="mt-16 md:mt-20">
        <HomeFaqItem v-for="item in items" :key="item.index" :item="item" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
