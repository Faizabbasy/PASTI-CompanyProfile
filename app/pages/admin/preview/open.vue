<script setup lang="ts">
// Authenticated draft preview of OPEN (shared product preview frame).
// Sections are listed in page order; the editor's "Lihat bagian ini" links
// scroll to them by position (?s=<index>).
definePageMeta({ layout: false })
useHead({
  title: 'Preview · OPEN (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminProductPreview slug="open" name="OPEN" :build-legacy="buildLegacyOpenContent" :adapt="adaptOpenCms" :provider="provideOpenPreview">
    <OpenHero />
    <OpenProblem />
    <OpenNotSaas />
    <OpenFramework />
    <OpenEcosystem />
    <OpenModules />
    <OpenAuction />
    <OpenGovernance />
    <OpenSystems />
    <OpenCustomization />
    <OpenAdvantage />
    <OpenDemo />
  </AdminProductPreview>
</template>
