<script setup lang="ts">
// Interim DORA wordmark (owner 2026-10-19: no official logo file yet —
// replace with the supplied mark when it arrives). Glyph = a page with a
// folded corner crossed by the cyan scan line, after the document-scan
// icon in the product UI. Never "PILOT" / "FCB" (docs/dora/00).
withDefaults(defineProps<{ surface?: 'light' | 'dark'; size?: number }>(), { surface: 'light', size: 20 })
</script>

<template>
  <span class="inline-flex items-center gap-[0.42em] font-display font-extrabold leading-none tracking-[-0.03em]" :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'" :style="{ fontSize: `${size}px` }">
    <svg viewBox="0 0 16 20" class="h-[1em] w-auto" fill="none" aria-hidden="true">
      <path d="M2 1.5h8l4.5 4.5v12.5H2z" :stroke="surface === 'dark' ? '#fff' : '#033C59'" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M10 1.5V6h4.5" :stroke="surface === 'dark' ? '#fff' : '#033C59'" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M5 11h6.5M5 14.5h4.5" :stroke="surface === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(3,60,89,0.55)'" stroke-width="1.6" stroke-linecap="round" />
      <path d="M0 7.6h16" :stroke="surface === 'dark' ? '#1FD6EE' : '#0A7F93'" stroke-width="2" />
    </svg>
    <span>DORA</span>
  </span>
</template>
