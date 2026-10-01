<script setup lang="ts">
// /work — portfolio (owner redesign, 2026-10-01). Interactive poster deck
// hero → filterable project index (Grid ↔ List with GSAP Flip) → case files
// with the real brief / result copy → Final CTA. Data: useWorkPortfolio.
</script>

<template>
  <WorkHero />
  <WorkProjectIndex />
  <WorkCaseFiles />
  <HomeFinalCta class="rounded-t-[2.5rem]" />
</template>
