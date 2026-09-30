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
//
// MILESTONE 6 FOLLOW-UP CORRECTION: `<HomeFinalCta />` removed too — same
// reasoning as WhyPasti above. The locked 9-section sequence ends at
// PAQ-FAQ, then Footer (mounted globally in app.vue, outside <NuxtPage>,
// so it was never this file's concern); FinalCta has no slot in that
// sequence at all. `FinalCta.vue` itself is NOT deleted — it's still
// actively used by creative.vue/insights.vue/technology.vue/work.vue —
// only this homepage usage is removed.
</script>

<template>
  <HomeHero />
  <HomeSelectedWork />
  <!-- Owner-directed addition (company-profile branding): who PASTI is,
       straight from the brand guide, between the Hero and What We Build. -->
  <!-- Temporarily hidden (owner request): Brand Promise + Brand Pillars.
       Restore by uncommenting. -->
  <!-- <HomeBrand /> -->
  <HomeWhatWeDo />
  <!-- Owner-directed addition (2026-09-30): Who We Are + Trusted Partner card.
       Approved exception to the locked 9-section sequence — see the header
       comment in WhoWeAre.vue. Trusted (below) is unchanged. -->
  <HomeWhoWeAre />
  <HomeTrust />
  <HomeTestimonials />
  <HomePlatforms />
  <HomeInsights />
  <HomeFaq />
</template>
