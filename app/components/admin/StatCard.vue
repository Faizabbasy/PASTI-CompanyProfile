<script setup lang="ts">
defineProps<{ label: string; value: number | string; hint?: string }>()
</script>

<template>
  <div class="rounded-lg border border-navy-100 bg-white p-5">
    <p class="text-xs font-semibold uppercase tracking-wider text-navy-500">{{ label }}</p>
    <p class="mt-2 font-display text-3xl font-bold tabular-nums text-slateNavy">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-navy-500">{{ hint }}</p>
  </div>
</template>
