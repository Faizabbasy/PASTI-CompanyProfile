<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { SelectedWorkProject } from '~/composables/useSelectedWork'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps<{ project: SelectedWorkProject; offset?: boolean }>()

const cardRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()

useGsapContext(() => {
  const card = cardRef.value
  const media = mediaRef.value
  if (!card || !media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(card, { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% round 16px)' })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(card, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 16px)' })

    const entrance = gsap.to(card, {
      opacity: 1,
      scale: 1,
      clipPath: 'inset(0% round 16px)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true }
    })

    // Subtle per-card vertical parallax as the grid scrolls — offset cards
    // (odd rows, per SelectedWork.vue's md:mt-20 stagger) drift a touch
    // slower than the base rate, matching the light "cards move at
    // slightly different speeds" effect referenced in the spec.
    const parallax = gsap.matchMedia().add('(min-width: 768px)', () => {
      const parallaxTween = gsap.to(card, {
        y: props.offset ? -24 : -12,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
      })
      return () => parallaxTween.kill()
    })

    return () => {
      entrance.kill()
      parallax.revert()
    }
  })

  onBeforeUnmount(() => mm.revert())
})
</script>

<template>
  <div
    ref="cardRef"
    class="group"
    :class="offset ? 'md:mt-20' : ''"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <div ref="mediaRef" class="aspect-[4/5] w-full overflow-hidden rounded-2xl">
      <div class="h-full w-full bg-gradient-to-br from-navy-800 to-navy-950 transition-transform duration-600 ease-editorial group-hover:scale-105" />
    </div>
    <p class="mt-6 text-body-md text-navy-100">
      {{ project.title }}
    </p>
  </div>
</template>
