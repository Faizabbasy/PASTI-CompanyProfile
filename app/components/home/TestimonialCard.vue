<script setup lang="ts">
import type { Testimonial } from '~/composables/useTestimonials'

defineProps<{ testimonial: Testimonial }>()

const cardRef = ref<HTMLElement | null>(null)
defineExpose({ cardRef })
</script>

<template>
  <div
    ref="cardRef"
    class="testimonial-card flex h-full flex-col gap-6 rounded-3xl border border-navy-100 bg-paper p-8 shadow-[0_20px_50px_-30px_rgba(11,57,84,0.35)] transition-transform duration-500 ease-editorial hover:!rotate-0"
  >
    <div>
      <p class="font-display text-body-md font-semibold text-ink">{{ testimonial.name }}</p>
      <p class="text-body-sm text-muted">{{ testimonial.role }}</p>
    </div>

    <div class="flex gap-1 text-yellow-500" aria-hidden="true">
      <span v-for="n in testimonial.rating" :key="n">★</span>
    </div>

    <p class="text-body-md text-muted">{{ testimonial.quote }}</p>
  </div>
</template>
