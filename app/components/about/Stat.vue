<script setup lang="ts">
import type { AboutStat } from '~/composables/useAbout'

const props = defineProps<{ stat: AboutStat }>()

const valueRef = ref<HTMLElement | null>(null)

useCountUp(valueRef, {
  value: props.stat.numericValue,
  format: (n) => `${Math.round(n)}${props.stat.suffix}`
})
</script>

<template>
  <div class="about-stat flex items-center gap-4 md:flex-col md:items-start md:gap-0">
    <span class="text-navy-500" aria-hidden="true" v-html="stat.icon" />

    <div class="md:mt-4">
      <p ref="valueRef" class="font-display text-display-md font-bold text-ink">0{{ stat.suffix }}</p>
      <p class="mt-1 text-body-sm uppercase tracking-widest text-navy-500">{{ stat.label }}</p>
    </div>
  </div>
</template>
