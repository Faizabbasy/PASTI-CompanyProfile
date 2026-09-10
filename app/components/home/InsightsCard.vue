<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { InsightArticle } from '~/composables/useInsights'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

defineProps<{ article: InsightArticle }>()

const cardRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()

// Media clip-path reveal (category C, per the reveal-hierarchy spec) —
// same technique as SelectedWorkCard, replacing this card's previous plain
// fade-up so Insights isn't the only section using generic reveal for
// every element.
useGsapContext(() => {
  const media = mediaRef.value
  if (!media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(media, { opacity: 1, scale: 1, clipPath: 'inset(0% round 16px)' })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(media, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 16px)' })

    const entrance = gsap.to(media, {
      opacity: 1,
      scale: 1,
      clipPath: 'inset(0% round 16px)',
      duration: 1,
      ease: motionEase.standard,
      scrollTrigger: { trigger: media, start: 'top 88%', toggleActions: 'restart none restart reverse' }
    })

    return () => entrance.kill()
  })

  onBeforeUnmount(() => mm.revert())
})
</script>

<template>
  <div ref="cardRef" class="group" @mouseenter="setState('view')" @mouseleave="setState('default')">
    <div ref="mediaRef" class="aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <img
        :src="article.image"
        :alt="article.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
      >
    </div>

    <p class="mt-6 inline-flex items-center gap-2 text-body-lg font-display font-medium text-paper">
      <span class="inline-block transition-all duration-400 ease-editorial group-hover:translate-x-1 group-hover:text-yellow-400">
        {{ article.title }}
      </span>
      <span
        aria-hidden="true"
        class="transition-transform duration-400 ease-editorial group-hover:translate-x-2"
      >→</span>
    </p>
  </div>
</template>
