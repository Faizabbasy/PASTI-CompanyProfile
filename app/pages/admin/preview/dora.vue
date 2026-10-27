<script setup lang="ts">
import { DORA_SECTIONS, DORA_TABS } from '#shared/utils/doraSchema'

// Authenticated draft preview of DORA (shared product preview frame).
// Sections are listed in page order; the editor's "Lihat bagian ini" links
// scroll to them by position (?s=<index>).
definePageMeta({ layout: false })
useHead({
  title: 'Preview · DORA (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminProductPreview slug="dora" :sections="DORA_SECTIONS" :tabs="DORA_TABS" name="DORA" :build-legacy="buildLegacyDoraContent" :adapt="adaptDoraCms" :provider="provideDoraPreview">
    <DoraHero />
    <DoraProblem />
    <DoraCore />
    <DoraFlow />
    <DoraExtraction />
    <DoraVerify />
    <DoraSearch />
    <DoraDashboard />
    <DoraModel />
    <DoraGovernance />
    <DoraIntegration />
    <DoraWhy />
    <DoraDemo />
  </AdminProductPreview>
</template>
