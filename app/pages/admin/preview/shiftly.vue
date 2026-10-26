<script setup lang="ts">
// Authenticated draft preview of SHIFTLY (shared product preview frame).
// Sections are listed in page order; the editor's "Lihat bagian ini" links
// scroll to them by position (?s=<index>).
definePageMeta({ layout: false })
useHead({
  title: 'Preview · SHIFTLY (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminProductPreview slug="shiftly" name="SHIFTLY" :build-legacy="buildLegacyShiftlyContent" :adapt="adaptShiftlyCms" :provider="provideShiftlyPreview">
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
  </AdminProductPreview>
</template>
