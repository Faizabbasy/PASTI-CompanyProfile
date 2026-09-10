<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { InsightArticle } from '~/composables/useInsights'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ article: InsightArticle; index?: number }>()

const cardRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()

// Editorial directional flow: a magazine-page-opening wipe, not a generic
// inset fade — reveal direction alternates per card (index modulo 3) for
// rhythmic variation within the section (LARGE_SCALE_MOTION_PLAN.md
// section 9). Each direction's clip-path starts fully hidden from that
// edge and opens to the full rect.
const FULL_RECT = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
const DIRECTIONS = [
  { from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', to: FULL_RECT }, // left->right
  { from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)', to: FULL_RECT }, // right->left
  { from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', to: FULL_RECT }, // top->bottom
  { from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', to: FULL_RECT } // bottom->top (mobile)
]

useGsapContext(() => {
  const media = mediaRef.value
  if (!media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(media, { opacity: 1, scale: 1, clipPath: FULL_RECT })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    // Mobile simplifies to one consistent bottom->top direction for clarity.
    const dirIndex = isMobile ? 3 : (props.index ?? 0) % 3
    const { from, to } = DIRECTIONS[dirIndex]!

    gsap.set(media, { opacity: 1, scale: 1.08, clipPath: from })

    const entrance = gsap.to(media, {
      scale: 1,
      clipPath: to,
      duration: 1.1,
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
