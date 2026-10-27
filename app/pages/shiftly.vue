<script setup lang="ts">
// /shiftly — SHIFTLY, Enterprise Workforce Operating Platform. Brief and
// rules: docs/shiftly/00-shiftly-landing-page-brief.md. Copy lives in
// useShiftly (source: SHIFTLY PRODUCT_2026_UPDATE deck); pricing is held
// back there (needs approval). Global header/footer come from app.vue; the
// product sub-nav is ShiftlySubNav.
//
// Content source is resolved once here (code content by default; the
// published CMS snapshot only when the server-side flag allows it) and read
// by the SHIFTLY sections through useShiftlyPage().
const content = await resolveShiftlyPageContent()
usePageSeo(content.value.seo)
useProductLd({ name: 'SHIFTLY', description: content.value.seo.description, image: content.value.seo.image })
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
