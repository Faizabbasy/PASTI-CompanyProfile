<script setup lang="ts">
import type { Testimonial } from '~/composables/useTestimonials'

const props = defineProps<{ testimonial: Testimonial }>()

const cardRef = ref<HTMLElement | null>(null)
const scoreRef = ref<HTMLElement | null>(null)
const quoteRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
defineExpose({ cardRef, scoreRef, quoteRef, footerRef })

const { setState } = useCustomCursor()

// Generated, abstract avatar seeded from the client's name — not a stock
// photo standing in for a real person's likeness (these are real, named
// client testimonials; a stock face would misrepresent who they are).
// DiceBear's "glass" style renders an abstract gradient pattern, not a
// human face, so it reads as a personal visual mark rather than a claimed
// photo.
const avatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(props.testimonial.name)}`

const ratingDisplay = props.testimonial.rating.toFixed(1)
</script>

<template>
  <div
    ref="cardRef"
    class="testimonial-card group relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-navy-800 bg-navy-900 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] transition-[transform,border-color] duration-500 ease-editorial hover:!rotate-0 hover:border-yellow-500/30 md:p-10"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] font-bold leading-none text-navy-800 select-none"
    >&rdquo;</span>

    <!-- Editorial score, replacing the generic star rating — a large,
         semi-transparent numeral in the corner (echoing the index-numeral
         accent used on Selected Work) instead of five stock stars. -->
    <div ref="scoreRef" class="relative flex items-start justify-between">
      <span
        aria-hidden="true"
        class="font-display text-4xl font-bold leading-none text-yellow-500/90"
      >{{ ratingDisplay }}<span class="text-lg text-yellow-500/50">/5</span></span>
    </div>

    <p ref="quoteRef" class="relative text-body-md text-navy-100">{{ testimonial.quote }}</p>

    <div ref="footerRef" class="relative mt-auto flex items-center gap-4 border-t border-navy-800 pt-6">
      <img
        :src="avatarUrl"
        :alt="`Avatar for ${testimonial.name}`"
        width="44"
        height="44"
        loading="lazy"
        class="h-11 w-11 shrink-0 rounded-full border border-navy-700 bg-navy-800 transition-transform duration-500 ease-editorial group-hover:scale-110"
      >
      <div>
        <p class="font-display text-body-md font-semibold text-paper">{{ testimonial.name }}</p>
        <p class="text-body-sm text-navy-400">{{ testimonial.role }}</p>
      </div>
    </div>
  </div>
</template>
