<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { SelectedWorkProject } from '~/composables/useSelectedWork'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ project: SelectedWorkProject; offset?: boolean }>()

const cardRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()
useScrollVelocitySkew(mediaRef, { maxSkew: 1.5 })
useCardTilt(cardRef, { strength: 4, lift: 1.015 })

useGsapContext(() => {
  const card = cardRef.value
  const media = mediaRef.value
  if (!card || !media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(card, { opacity: 1, scale: 1, clipPath: 'inset(0% round 16px)' })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(card, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 16px)' })

    const entrance = gsap.to(card, {
      opacity: 1,
      scale: 1,
      clipPath: 'inset(0% round 16px)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'restart none restart reverse' }
    })

    // Subtle per-card vertical parallax as the grid scrolls — offset cards
    // (odd rows, per SelectedWork.vue's md:mt-20 stagger) drift roughly 2x
    // further/faster than the base rate (-24 vs -12), matching the light
    // "cards move at slightly different speeds" effect referenced in the spec.
    // Tablet widths (768-1024px) get a reduced-distance version rather than
    // the full desktop parallax throw.
    const baseDistance = props.offset ? -24 : -12
    const parallax = gsap.matchMedia().add(
      { isTablet: '(min-width: 768px) and (max-width: 1024px)', isDesktop: '(min-width: 1025px)' },
      (context) => {
        const { isTablet } = context.conditions as { isTablet: boolean }
        const parallaxTween = gsap.to(card, {
          y: isTablet ? baseDistance * 0.5 : baseDistance,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
        })
        return () => parallaxTween.kill()
      }
    )

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
    <div ref="mediaRef" class="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
      <img
        :src="project.image"
        :alt="project.title"
        loading="lazy"
        class="h-full w-full object-cover grayscale-[60%] transition-[transform,filter] duration-600 ease-editorial group-hover:scale-105 group-hover:grayscale-0"
      >

      <!-- Bottom scrim so the large index numeral stays legible over any
           photo, and to ground the corner-bracket accents. -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy-950/70 to-transparent opacity-0 transition-opacity duration-500 ease-editorial group-hover:opacity-100"
      />

      <!-- Large index numeral, editorial/gallery accent — the small mono
           index in the caption below stays as the technical metadata
           label; this is the decorative counterpart, fading in on hover. -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute bottom-4 right-5 font-display text-6xl font-bold text-paper/0 transition-all duration-500 ease-editorial group-hover:translate-y-0 group-hover:text-paper/90"
        style="transform: translateY(0.5rem)"
      >{{ project.index }}</span>

      <!-- Swiss/editorial corner-bracket accent, same motif as Hero/Why
           PASTI/FAQ, fading in on hover to tie this section into the
           site's shared visual language. -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-yellow-400/0 transition-all duration-500 ease-editorial group-hover:border-yellow-400/70"
      />
      <span
        aria-hidden="true"
        class="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-yellow-400/0 transition-all duration-500 ease-editorial group-hover:border-yellow-400/70"
      />
    </div>
    <p class="mt-6 flex items-baseline gap-3 text-body-sm text-navy-300">
      <span class="font-mono text-navy-500">{{ project.index }}</span>
      <span class="text-navy-100">{{ project.title }}</span>
    </p>
  </div>
</template>
