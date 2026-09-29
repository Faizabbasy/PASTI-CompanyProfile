<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { InsightArticle, InsightRole } from '~/composables/useInsights'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ article: InsightArticle; role: InsightRole }>()

const cardRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()

// Editorial directional flow: a magazine-page-opening wipe, not a generic
// inset fade — kept from the prior implementation as a valid editorial
// entrance technique (not a product-style reveal). Reduced to a single
// consistent direction (was previously index-cycled through 4 directions)
// since the section itself no longer decides per-index — role decides
// scale/dominance, not the editorial reveal grammar.
const FULL_RECT = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
const FROM_RECT = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'

useGsapContext(() => {
  const media = mediaRef.value
  if (!media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(media, { opacity: 1, scale: 1, clipPath: FULL_RECT })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(media, { opacity: 1, scale: 1.08, clipPath: FROM_RECT })

    const entrance = gsap.to(media, {
      scale: 1,
      clipPath: FULL_RECT,
      duration: 1.1,
      ease: approvedEase.gsapStandard,
      scrollTrigger: { trigger: media, start: 'top 88%', toggleActions: 'restart none restart reverse' }
    })

    return () => entrance.kill()
  })
})
</script>

<template>
  <!-- Digital Editorial Feature (Featured) / close-in-weight Supporting
       (04-homepage-spec.md §7) — editorial composition: image, headline,
       controlled crop. Not a literal magazine cover, not a browser window,
       not a product mockup/SaaS card. -->
  <div ref="cardRef" class="group" @mouseenter="setState('view', 'Read')" @mouseleave="setState('default')">
    <div
      ref="mediaRef"
      class="w-full overflow-hidden rounded-card"
      :class="role === 'featured' ? 'aspect-[16/10]' : 'aspect-[4/3]'"
    >
      <img
        :src="article.image"
        :alt="article.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
      >
    </div>

    <!-- Caption rule: index + PASTI mark on one structural line, so each
         article reads as a PASTI publication. The rule's Cobalt segment
         draws on hover (line travel, 00-brand-guide.md §10). -->
    <div class="mt-5 flex items-center gap-3">
      <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-[color:rgba(15,23,42,0.55)]">{{ article.index }}</span>
      <span class="relative block h-px flex-1 bg-[color:rgba(15,23,42,0.14)]">
        <span aria-hidden="true" class="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-cobalt transition-transform duration-400 ease-editorial group-hover:scale-x-100" />
      </span>
      <LayoutBrandMark surface="light" :height="12" />
    </div>

    <p
      class="mt-4 inline-flex items-start gap-2 font-display font-medium text-ink"
      :class="role === 'featured' ? 'text-display-sm' : 'text-body-lg'"
    >
      <span class="inline-block transition-all duration-400 ease-editorial group-hover:translate-x-1 group-hover:text-cobalt">
        {{ article.title }}
      </span>
      <span
        aria-hidden="true"
        class="mt-1 shrink-0 transition-transform duration-400 ease-editorial group-hover:translate-x-2"
      >→</span>
    </p>
  </div>
</template>
