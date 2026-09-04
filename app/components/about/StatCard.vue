<script setup lang="ts">
import type { AboutStat } from '~/composables/useAbout'

const props = withDefaults(
  defineProps<{ stat: AboutStat; dark?: boolean; valueClass?: string }>(),
  { valueClass: 'text-display-sm' }
)

const valueRef = ref<HTMLElement | null>(null)

useCountUp(valueRef, {
  value: props.stat.numericValue,
  format: (n) => `${Math.round(n)}${props.stat.suffix}`
})
</script>

<template>
  <div>
    <span :class="dark ? 'text-yellow-500' : 'text-navy-400'" aria-hidden="true" v-html="stat.icon" />
    <p ref="valueRef" class="mt-3 font-display font-bold leading-none" :class="[valueClass, dark ? 'text-paper' : 'text-ink']">
      0{{ stat.suffix }}
    </p>
    <p class="mt-2 text-body-sm uppercase tracking-widest" :class="dark ? 'text-navy-300' : 'text-navy-500'">
      {{ stat.label }}
    </p>
  </div>
</template>
