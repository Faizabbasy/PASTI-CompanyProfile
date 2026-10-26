<script setup lang="ts">
// /creative — "the studio" (owner redesign, 2026-10-01; COMPRO 2025 content
// rebuild 2026-10-07). PASTI Yellow hero with an image-trail sketchbook →
// crossing capability tapes → sticky-split capabilities (COMPRO copy, interim
// illustrations, related work) → draggable studio wall → selected creative
// work (OCTO strategy, Pertamina, BSI testimonial, UI/UX) → Why PASTI. The
// global footer carries the CTA. Copy: useCreative.
//
// Content source is resolved once here (legacy code by default; the
// published CMS snapshot only when the server-side flag allows it) and read
// by the Creative sections through useCreativePage().
const content = await resolveCreativePageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <CreativeHero />
  <CreativeTapes />
  <CreativeServices />
  <CreativeWall />
  <CreativeWork />
  <BaseWhyPasti :why="content.why" />
</template>
