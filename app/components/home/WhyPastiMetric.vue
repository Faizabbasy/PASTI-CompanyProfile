<script setup lang="ts">
import type { WhyPastiMetric } from '~/composables/useWhyPasti'

defineProps<{ metric: WhyPastiMetric }>()

const rowRef = ref<HTMLElement | null>(null)
useRevealOnScroll(rowRef, { threshold: 0.3 })
</script>

<template>
  <div ref="rowRef" class="reveal-up grid grid-cols-1 gap-2 border-t border-navy-100 py-8 md:grid-cols-12 md:items-baseline md:gap-8 md:py-10">
    <span class="font-display text-sm font-semibold text-navy-300 md:col-span-1" aria-hidden="true">
      {{ metric.index }}
    </span>

    <p v-if="metric.value" class="font-display text-display-md font-semibold text-ink md:col-span-4">
      {{ metric.value }}
    </p>

    <p
      class="text-body-lg text-muted md:col-start-6"
      :class="metric.value ? 'md:col-span-7' : 'md:col-span-11 md:text-display-sm md:font-display md:font-medium md:text-ink'"
    >
      {{ metric.label }}
    </p>
  </div>
</template>
