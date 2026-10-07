<script setup lang="ts">
// SHIFTLY wordmark — the deck's yellow ring-check mark + "SHIFTLY" set in the
// display face (interim until an SVG logo is supplied).
withDefaults(defineProps<{ surface?: 'light' | 'dark'; size?: number }>(), { surface: 'light', size: 18 })
</script>

<template>
  <span class="inline-flex items-center gap-[0.35em] font-display font-extrabold tracking-[-0.02em]" :style="{ fontSize: `${size}px` }" :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'">
    <svg viewBox="0 0 24 24" class="h-[1.15em] w-[1.15em]" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="#FBBA00" stroke-width="3" />
      <path d="M7.5 12.2l3.2 3.2 6.2-7" stroke="#FBBA00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span>SHIFT<span class="text-pastiYellow-500">LY</span></span>
  </span>
</template>
