<script setup lang="ts">
// /dora — DORA, Document Recognition & Analysis (FCP by PASTI Technology).
// Brief, audit and capability classification:
// docs/dora/00-dora-landing-page-brief.md. Copy + synthetic sample data:
// useDora. Public since 2026-10-19 (owner): navbar, footer and sitemap.
//
// Content source is resolved once here (code content by default; the
// published CMS snapshot only when the server-side flag allows it) and read
// by the DORA sections through useDoraPage().
const content = await resolveDoraPageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <DoraSubNav />
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
</template>
