<script setup lang="ts">
// Authenticated draft preview of FAST (shared product preview frame).
// Sections are listed in page order; the editor's "Lihat bagian ini" links
// scroll to them by position (?s=<index>).
definePageMeta({ layout: false })
useHead({
  title: 'Preview · FAST (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminProductPreview slug="fast" name="FAST" :build-legacy="buildLegacyFastContent" :adapt="adaptFastCms" :provider="provideFastPreview">
    <FastHero />
    <FastComplexity />
    <FastTicker />
    <FastFramework />
    <FastFlow />
    <FastBoard />
    <FastConstraints />
    <FastReadiness />
    <FastScenarios />
    <FastExecution />
    <FastVisibility />
    <FastIntegration />
    <FastDemo />
  </AdminProductPreview>
</template>
