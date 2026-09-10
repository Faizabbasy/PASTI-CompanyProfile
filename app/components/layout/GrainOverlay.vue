<script setup lang="ts">
// Static, page-global film-grain texture for material depth — a single SVG
// turbulence filter tiled across the viewport, no per-frame regeneration
// (the whole point is to remove digital flatness, not animate noise).
// Purely decorative: never intercepts pointer events, sits above the
// ambient light layer but below real content via mix-blend-mode + low
// opacity rather than stacking order, since it must tint everything below.
</script>

<template>
  <div aria-hidden="true" class="grain-overlay pointer-events-none fixed inset-0 z-[6]" />
</template>

<style scoped>
.grain-overlay {
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
}
</style>
