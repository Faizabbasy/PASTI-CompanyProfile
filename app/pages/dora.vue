<script setup lang="ts">
// /dora — DORA, Document Recognition & Analysis (FCP by PASTI Technology).
// Brief, audit and capability classification:
// docs/dora/00-dora-landing-page-brief.md. Copy + synthetic sample data:
// useDora. Public since 2026-10-19 (owner): navbar, footer and sitemap.
const { seo } = useDora()

usePageSeo({ ...seo, image: '/images/og/dora.jpg' })
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
