<script setup lang="ts">
// Decorative backdrop for a white-background content-page hero (/work,
// /about, /insights) — these pages sit on bg-paper with no Three.js scene
// behind them (unlike the homepage Hero), so without this the whole block
// reads as flat/empty. Two soft brand-tinted glow blobs (same idea as
// FinalCta.vue's ambient glow, recolored/lightened for a white ground
// instead of navy) plus a faint dot-grid texture, both purely decorative
// and non-interactive.
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    <div
      class="absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-yellow-500/[0.09] blur-3xl"
    />
    <div
      class="absolute -left-32 top-40 h-[22rem] w-[22rem] rounded-full bg-navy-500/[0.06] blur-3xl"
    />
    <div
      class="absolute inset-0 opacity-[0.35]"
      style="background-image: radial-gradient(rgba(11, 57, 84, 0.12) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(to bottom, black, transparent 85%);"
    />
  </div>
</template>
