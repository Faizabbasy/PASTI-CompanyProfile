<script setup lang="ts">
// /fast — FAST, Flexible Advanced Scheduling Technology (FCP by PASTI
// Technology). Brief, audit and capability classification:
// docs/fast/00-fast-landing-page-brief.md. Copy + sample data: useFast.
// Public since 2026-10-19 (owner): navbar, footer and sitemap.
const { seo } = useFast()

usePageSeo({ ...seo, image: '/images/og/fast.jpg' })
</script>

<template>
  <FastSubNav />
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
</template>
