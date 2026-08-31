<script setup lang="ts">
import type { Testimonial } from '~/composables/useTestimonials'

const props = defineProps<{ testimonial: Testimonial; rotate: string }>()

const initials = props.testimonial.name
  .split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

const cardRef = ref<HTMLElement | null>(null)
useScrollReveal(cardRef, { y: 28, scale: 0.96 })
</script>

<template>
  <div
    ref="cardRef"
    class="flex h-full flex-col gap-6 rounded-3xl border border-navy-100 bg-paper p-8 shadow-[0_20px_50px_-30px_rgba(11,57,84,0.35)] transition-transform duration-500 ease-editorial hover:!rotate-0"
    :class="rotate"
  >
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-sm font-semibold text-paper">
        {{ initials }}
      </div>
      <div>
        <p class="font-display text-body-md font-semibold text-ink">{{ testimonial.name }}</p>
        <p class="text-body-sm text-muted">{{ testimonial.role }}</p>
      </div>
    </div>

    <div class="flex gap-1 text-yellow-500" aria-hidden="true">
      <span v-for="n in testimonial.rating" :key="n">★</span>
    </div>

    <p class="text-body-md text-muted">{{ testimonial.quote }}</p>
  </div>
</template>
