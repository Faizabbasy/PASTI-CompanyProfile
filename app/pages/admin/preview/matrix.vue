<script setup lang="ts">
// Authenticated draft preview of MATRIX (shared product preview frame).
// Sections are listed in page order; the editor's "Lihat bagian ini" links
// scroll to them by position (?s=<index>). The rack locator is navigation,
// not content, so it is left out.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · MATRIX (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminProductPreview slug="matrix" name="MATRIX" :build-legacy="buildLegacyMatrixContent" :adapt="adaptMatrixCms" :provider="provideMatrixPreview">
    <MatrixHero />
    <MatrixProblem />
    <MatrixLayers />
    <MatrixIntelligence />
    <MatrixMaterial360 />
    <MatrixAvailability />
    <MatrixAging />
    <MatrixExecution />
    <MatrixExplorer />
    <MatrixGovernance />
    <MatrixIntegration />
    <MatrixDemo />
  </AdminProductPreview>
</template>
