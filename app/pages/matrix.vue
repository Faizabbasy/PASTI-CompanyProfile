<script setup lang="ts">
// /matrix — MATRIX, Material Tracking, Inventory & Resource eXecution (FCP
// by PASTI Technology). Brief, audit and capability classification:
// docs/matrix/00-matrix-landing-page-brief.md. Copy + synthetic sample
// data: useMatrix. Public from launch (owner 2026-10-19): navbar
// Frameworks, footer and sitemap.
//
// Content source is resolved once here (code content by default; the
// published CMS snapshot only when the server-side flag allows it) and read
// by the MATRIX sections through useMatrixPage().
const content = await resolveMatrixPageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <MatrixLocator />
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
</template>
