<script setup lang="ts">
// /work — portfolio (owner redesign, 2026-10-01). Interactive poster deck
// hero → filterable project index (Grid ↔ List with GSAP Flip) → Featured
// Case Studies (2026-10-07, replaced the legacy brief/result case files).
// Data: useWorkPage() — legacy code content (useWorkPortfolio +
// useFeaturedCases) or, when the server flag is on, the published Work CMS.

const content = await resolveWorkPageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <WorkHero />
  <WorkProjectIndex />
  <WorkFeaturedCases />
</template>
