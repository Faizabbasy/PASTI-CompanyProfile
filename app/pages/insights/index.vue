<script setup lang="ts">
// /insights — "The PASTI Journal" (owner redesign, 2026-10-01). Poster-filled
// masthead → table of contents with expanding previews + topic filter →
// full-screen reader sheet → Final CTA. Copy: useInsights (transcribed from
// each poster). Data: useInsightsPage() — legacy code content or, when the
// server flag is on, the published Insights CMS.

const content = await resolveInsightsPageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <InsightsMasthead />
  <InsightsContents />
</template>
