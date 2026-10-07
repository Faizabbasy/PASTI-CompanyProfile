<script setup lang="ts">
// /open — OPEN by PASTI Technology, One Procurement Ecosystem Network.
// Primary source: OPEN PRODUCT 2026.pdf (notes: docs/open/02-open-product-
// 2026-notes.md); section order and rules: docs/open/01-open-page-structure.md.
// OPEN is a customizable, ready-to-develop procurement framework — never
// "OPEN = e-Procurement", never plug-and-play SaaS. Copy lives in useOpen.
// Global header/footer come from app.vue (sections 01 and 14).
const { seo } = useOpen()

useSeoMeta({
  title: seo.title,
  description: seo.description,
  ogTitle: seo.title,
  ogDescription: seo.description,
  ogImage: '/images/platforms/open.webp',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <OpenSubNav />
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
</template>
