<script setup lang="ts">
withDefaults(defineProps<{ inverted?: boolean }>(), { inverted: false })
</script>

<template>
  <NuxtLink to="/" class="relative z-50 flex items-center">
    <!-- On light backgrounds, render the source PNG untouched — its dot is
         already positioned/colored correctly. On dark backgrounds it needs a
         CSS invert to read as white, but that would also turn the dot white,
         so a solid yellow circle is redrawn on top at the dot's measured
         pixel bounding box (left 87.8%, top 9.3%, 113x113px out of the full
         1205x527 image — measured via canvas pixel-scan, not eyeballed).
         Width/height are given as separate percentages of the image's own
         width/height (not aspect-ratio: 1/1) because the source image itself
         is far wider than tall, so a circle that's 9.38% of the width is
         21.44% of the height — this stays exact at any render size without
         needing to crop/rescale the image itself. -->
    <img
      v-if="!inverted"
      src="/images/pasti-logo.png"
      alt="PASTI"
      class="h-6 w-auto md:h-7"
      width="1205"
      height="527"
    />
    <span v-else class="relative inline-block h-6 w-auto md:h-7" style="aspect-ratio: 1205 / 527">
      <img
        src="/images/pasti-logo.png"
        alt="PASTI"
        class="h-full w-auto brightness-0 invert"
        width="1205"
        height="527"
      />
      <span
        class="absolute rounded-full bg-yellow-500"
        style="left: 87.8%; top: 9.3%; width: 9.38%; height: 21.44%"
        aria-hidden="true"
      />
    </span>
    <span class="sr-only">PASTI — Home</span>
  </NuxtLink>
</template>
