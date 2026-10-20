<script setup lang="ts">
// Interim FAST wordmark (owner 2026-10-19: no official logo file yet —
// replace with the supplied mark when it arrives). A three-bar "mini Gantt"
// glyph (the page motif: staggered operations on a timeline) + the name.
withDefaults(defineProps<{ surface?: 'light' | 'dark'; size?: number }>(), { surface: 'light', size: 20 })
</script>

<template>
  <span class="inline-flex items-center gap-[0.45em] font-display font-extrabold leading-none tracking-[-0.03em]" :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'" :style="{ fontSize: `${size}px` }">
    <svg viewBox="0 0 20 16" class="h-[0.95em] w-auto" aria-hidden="true">
      <rect x="0" y="1" width="10" height="3.2" rx="1.6" :fill="surface === 'dark' ? '#fff' : '#033C59'" />
      <rect x="6" y="6.4" width="10" height="3.2" rx="1.6" fill="#FBBA00" />
      <rect x="11" y="11.8" width="9" height="3.2" rx="1.6" :fill="surface === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(3,60,89,0.55)'" />
    </svg>
    <span>FAST</span>
  </span>
</template>
