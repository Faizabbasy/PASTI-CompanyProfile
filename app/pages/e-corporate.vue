<script setup lang="ts">
// /e-corporate — e-CORPORATE, Enterprise Digital Platform. Structure and
// content rules: docs/e-corporate/00-e-corporate-landing-page-brief.md.
// Copy lives in useEcorporate (confirmed vs `temporary: true`). Global
// header/footer come from app.vue; the product sub-nav is EcorpSubNav.
const { seo } = useEcorporate()

// SEO — editable content (useEcorporate().seo).
usePageSeo({ ...seo, image: '/images/og/e-corporate.jpg' })
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
