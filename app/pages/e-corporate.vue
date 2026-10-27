<script setup lang="ts">
// /e-corporate — e-CORPORATE, Enterprise Digital Platform. Structure and
// content rules: docs/e-corporate/00-e-corporate-landing-page-brief.md.
// Copy lives in useEcorporate (confirmed vs `temporary: true`). Global
// header/footer come from app.vue; the product sub-nav is EcorpSubNav.
//
// Content source is resolved once here (code content by default; the
// published CMS snapshot only when the server-side flag allows it) and read
// by the e-CORPORATE sections through useEcorporatePage().
const content = await resolveEcorporatePageContent()
usePageSeo(content.value.seo)
useProductLd({ name: 'e-CORPORATE', description: content.value.seo.description, image: content.value.seo.image })
</script>

<template>
  <EcorpSubNav />
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
</template>
