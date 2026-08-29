<script setup lang="ts">
withDefaults(defineProps<{ inverted?: boolean }>(), { inverted: false })
</script>

<template>
  <NuxtLink to="/" class="relative z-50 flex items-center">
    <!-- On light backgrounds, render the source PNG untouched — its dot is
         already positioned/colored correctly. On dark backgrounds it needs a
         CSS invert to read as white, but that would also turn the dot white;
         since the dot overlaps the "I" in the source art (not a clean gap),
         crop it out and recreate it as a solid CSS dot instead. -->
    <img
      v-if="!inverted"
      src="/images/pasti-logo.png"
      alt="PASTI"
      class="h-6 w-auto md:h-7"
      width="1205"
      height="527"
    />
    <span v-else class="relative inline-block text-2xl md:text-[1.75rem]" style="line-height: 0">
      <span class="block overflow-hidden" style="width: 2.13em; height: 1em">
        <img
          src="/images/pasti-logo.png"
          alt="PASTI"
          class="h-[1em] w-auto max-w-none brightness-0 invert"
          width="1205"
          height="527"
        />
      </span>
      <span
        class="absolute rounded-full bg-yellow-500"
        style="width: 0.19em; height: 0.19em; top: 0.03em; right: -0.01em"
        aria-hidden="true"
      />
    </span>
    <span class="sr-only">PASTI — Home</span>
  </NuxtLink>
</template>
