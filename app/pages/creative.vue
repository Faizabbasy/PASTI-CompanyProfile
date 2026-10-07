<script setup lang="ts">
// /creative — "the studio" (owner redesign, 2026-10-01; COMPRO 2025 content
// rebuild 2026-10-07). PASTI Yellow hero with an image-trail sketchbook →
// crossing capability tapes → sticky-split capabilities (COMPRO copy, interim
// illustrations, related work) → draggable studio wall → selected creative
// work (OCTO strategy, Pertamina, BSI testimonial, UI/UX) → Why PASTI. The
// global footer carries the CTA. Copy: useCreative.
const { why } = useCreative()
</script>

<template>
  <CreativeHero />
  <CreativeTapes />
  <CreativeServices />
  <CreativeWall />
  <CreativeWork />
  <BaseWhyPasti :why="why" />
</template>
