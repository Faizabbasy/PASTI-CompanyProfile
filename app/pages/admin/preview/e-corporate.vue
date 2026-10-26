<script setup lang="ts">
// Authenticated draft preview of e-CORPORATE (shared product preview frame).
// Sections are listed in page order; the editor's "Lihat bagian ini" links
// scroll to them by position (?s=<index>).
definePageMeta({ layout: false })
useHead({
  title: 'Preview · e-CORPORATE (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminProductPreview slug="e-corporate" name="e-CORPORATE" :build-legacy="buildLegacyEcorporateContent" :adapt="adaptEcorporateCms" :provider="provideEcorporatePreview">
    <EcorpHero />
    <EcorpTicker />
    <EcorpProblem />
    <EcorpOverview />
    <EcorpValues />
    <EcorpCapabilities />
    <EcorpUseCases />
    <EcorpConfigurable />
    <EcorpIntegration />
    <EcorpGovernance />
    <EcorpOutcomes />
    <EcorpWhyPasti />
    <EcorpDemo />
  </AdminProductPreview>
</template>
