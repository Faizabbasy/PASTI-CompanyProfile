<script setup lang="ts">
// /technology — "engineering console" (owner redesign, 2026-09-30; COMPRO 2025
// content rebuild 2026-10-07). Dark interactive hero → kinetic capability
// marquee → the six COMPRO capabilities as one chapter (with related work) →
// PASTI's own platforms → Technology case studies (pinned rail / swipe rail,
// linking into /work) → Why PASTI (vision, standards, milestones). The global
// footer carries the CTA. Copy: useTechnology, usePlatforms, useFeaturedCases.
const { why } = useTechnology()
</script>

<template>
  <TechnologyHero />
  <TechnologyMarquee />
  <TechnologyCapabilities />
  <TechnologyPlatforms />
  <TechnologyWork />
  <BaseWhyPasti :why="why" />
</template>
