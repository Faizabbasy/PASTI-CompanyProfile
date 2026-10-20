<script setup lang="ts">
// /matrix — MATRIX, Material Tracking, Inventory & Resource eXecution (FCP
// by PASTI Technology). Brief, audit and capability classification:
// docs/matrix/00-matrix-landing-page-brief.md. Copy + synthetic sample
// data: useMatrix. Public from launch (owner 2026-10-19): navbar
// Frameworks, footer and sitemap.
const { seo } = useMatrix()

usePageSeo({ ...seo, image: '/images/og/matrix.jpg' })
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
