<script setup lang="ts">
import type { WhyPastiMetric } from '~/composables/useWhyPasti'

defineProps<{ metric: WhyPastiMetric; tone: 'navy' | 'yellow' }>()

const cardRef = ref<HTMLElement | null>(null)
const valueRef = ref<HTMLElement | null>(null)

useScrollReveal(cardRef, { y: 24 })
useMaskedReveal(valueRef, { by: 'line' })
</script>

<template>
  <div
    ref="cardRef"
    class="flex h-full flex-col justify-between gap-8 rounded-3xl p-8"
    :class="tone === 'navy' ? 'bg-navy-50' : 'bg-yellow-50'"
  >
    <span class="text-navy-700" aria-hidden="true" v-html="metric.icon" />

    <div>
      <p v-if="metric.value" ref="valueRef" class="font-display text-display-md font-semibold text-ink">
        {{ metric.value }}
      </p>
      <p
        class="text-body-sm uppercase tracking-widest text-navy-500"
        :class="metric.value ? 'mt-2' : 'text-body-lg normal-case tracking-normal text-ink'"
      >
        {{ metric.label }}
      </p>
    </div>
  </div>
</template>
