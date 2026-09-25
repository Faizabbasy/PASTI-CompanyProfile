<script setup lang="ts">
// Homepage sections are built task-by-task per the content mapping doc.
//
// MILESTONE 4E FINAL CLOSURE CORRECTION: `<HomeWhyPasti />` removed per the
// owner-approved §17 decision — WhyPasti is not part of the frozen homepage
// architecture (docs/rework-v2/04-homepage-spec.md's locked 9-section
// sequence: Hero / What We Build / Selected Work / Trusted / Testimoni /
// Platforms / Insight / PAQ-FAQ / Footer). Its content was NOT carried into
// any other homepage section. The component/data files (WhyPasti.vue,
// WhyPastiMetric.vue, useWhyPasti.ts) have since been removed (Milestone 6
// legacy decommission). This restores the direct Testimoni -> Platforms
// handoff the frozen spec requires (zig-zag -> shared baseline -> ordered
// field -> restrained upward move -> Platforms spatial takeover), with no
// legacy section between them.
</script>

<template>
  <HomeHero />
  <HomeWhatWeDo />
  <HomeSelectedWork />
  <HomeTrust />
  <HomeTestimonials />
  <HomePlatforms />
  <HomeInsights />
  <HomeFaq />
  <HomeFinalCta />
</template>
