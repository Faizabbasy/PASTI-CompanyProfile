<script setup lang="ts">
// /technology — "engineering console" (owner redesign, 2026-09-30; COMPRO 2025
// content rebuild 2026-10-07). Dark interactive hero → kinetic capability
// marquee → the six COMPRO capabilities as one chapter (with related work) →
// PASTI's own platforms → Technology case studies (pinned rail / swipe rail,
// linking into /work) → Why PASTI (vision, standards, milestones). The global
// footer carries the CTA. Copy: useTechnology, usePlatforms, useFeaturedCases.
// Why PASTI (company data) and Platforms stay code-managed.
const { why } = useTechnology()

// Content source is resolved once here (legacy code by default; the
// published CMS snapshot only when the server-side flag allows it) and read
// by the Technology sections through useTechnologyPage().
const content = await resolveTechnologyPageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <TechnologyHero />
  <TechnologyMarquee />
  <TechnologyCapabilities />
  <TechnologyPlatforms />
  <TechnologyWork />
  <BaseWhyPasti :why="why" />
</template>
