<script setup lang="ts">
// Value ticker — a slim deep-navy band between the hero and the Problem
// section: the six CONFIRMED key values in large outlined/solid type,
// travelling sideways. One CSS transform animation on a duplicated track
// (no JS); paused on hover; static under reduced motion. Decorative — the
// values themselves are presented properly in Key Value.
const { values } = useEcorporate()
</script>

<template>
  <div aria-hidden="true" class="et-band relative overflow-hidden border-y border-[color:rgba(255,255,255,0.08)] bg-navyDeep-900 py-5 tablet:py-7" data-header-theme="dark">
    <div class="et-track flex w-max">
      <div v-for="copy in 2" :key="copy" class="flex shrink-0 items-center">
        <template v-for="(v, i) in values" :key="`${copy}-${v.title}`">
          <span
            class="px-6 font-display text-[length:clamp(30px,4.6vw,72px)] font-extrabold leading-none tracking-[-0.04em] tablet:px-10"
            :class="i % 2 === 0 ? 'text-pureWhite' : 'et-outline'"
          >{{ v.title }}</span>
          <span class="h-3 w-3 shrink-0 bg-pastiYellow-500 tablet:h-4 tablet:w-4" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.et-outline {
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.55);
}
@media (prefers-reduced-motion: no-preference) {
  .et-track {
    animation: et-slide 38s linear infinite;
  }
  .et-band:hover .et-track {
    animation-play-state: paused;
  }
}
@keyframes et-slide {
  to {
    transform: translateX(-50%);
  }
}
</style>
