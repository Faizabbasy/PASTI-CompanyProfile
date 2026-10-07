<script setup lang="ts">
// /shiftly — SHIFTLY, Enterprise Workforce Operating Platform. Brief and
// rules: docs/shiftly/00-shiftly-landing-page-brief.md. Copy lives in
// useShiftly (source: SHIFTLY PRODUCT_2026_UPDATE deck); pricing is held
// back there (needs approval). Global header/footer come from app.vue; the
// product sub-nav is ShiftlySubNav.
const { seo } = useShiftly()

useSeoMeta({
  title: seo.title,
  description: seo.description,
  ogTitle: seo.title,
  ogDescription: seo.description,
  ogImage: '/images/shiftly/dashboard.webp',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <ShiftlySubNav />
  <ShiftlyHero />
  <ShiftlyPlatform />
  <ShiftlyModules />
  <ShiftlyPlans />
  <ShiftlyDevices />
  <ShiftlyBranding />
  <ShiftlyWhy />
  <ShiftlyArchitecture />
  <ShiftlyPricing />
  <ShiftlyDemo />
</template>
