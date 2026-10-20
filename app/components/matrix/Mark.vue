<script setup lang="ts">
// Interim MATRIX wordmark (owner 2026-10-19: no official logo yet — swap in
// the supplied mark when it arrives). Glyph = a 3×3 rack of bins with one
// located in yellow: the page's idea of knowing exactly where material is.
withDefaults(defineProps<{ surface?: 'light' | 'dark'; size?: number }>(), { surface: 'light', size: 20 })
</script>

<template>
  <span class="inline-flex items-center gap-[0.42em] font-display font-extrabold leading-none tracking-[-0.03em]" :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'" :style="{ fontSize: `${size}px` }">
    <svg viewBox="0 0 18 18" class="h-[0.92em] w-auto" aria-hidden="true">
      <template v-for="r in 3" :key="r">
        <rect
          v-for="c in 3"
          :key="c"
          :x="(c - 1) * 6.5"
          :y="(r - 1) * 6.5"
          width="5"
          height="5"
          rx="1"
          :fill="r === 2 && c === 3 ? '#FBBA00' : surface === 'dark' ? (r === 3 ? 'rgba(255,255,255,0.45)' : '#fff') : r === 3 ? 'rgba(3,60,89,0.45)' : '#033C59'"
        />
      </template>
    </svg>
    <span>MATRIX</span>
  </span>
</template>
