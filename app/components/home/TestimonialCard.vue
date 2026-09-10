<script setup lang="ts">
import type { Testimonial } from '~/composables/useTestimonials'

defineProps<{ testimonial: Testimonial }>()

const cardRef = ref<HTMLElement | null>(null)
defineExpose({ cardRef })

const { setState } = useCustomCursor()
</script>

<template>
  <div
    ref="cardRef"
    class="testimonial-card relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-navy-800 bg-navy-900 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-editorial hover:!rotate-0 md:p-10"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] font-bold leading-none text-navy-800 select-none"
    >&rdquo;</span>

    <div class="relative flex gap-1 text-yellow-500" aria-hidden="true">
      <span v-for="n in testimonial.rating" :key="n">★</span>
    </div>

    <p class="relative text-body-md text-navy-100">{{ testimonial.quote }}</p>

    <div class="relative mt-auto border-t border-navy-800 pt-6">
      <p class="font-display text-body-md font-semibold text-paper">{{ testimonial.name }}</p>
      <p class="text-body-sm text-navy-400">{{ testimonial.role }}</p>
    </div>
  </div>
</template>
