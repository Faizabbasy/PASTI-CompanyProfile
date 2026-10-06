<script setup lang="ts">
// e-CORPORATE wordmark as set on the product's cover art (public/images/
// platforms/e-corporate.webp): a PASTI Yellow "e", the rest in Slate Navy
// (white on dark). Text, not an image, so it scales and stays crisp.
withDefaults(defineProps<{ surface?: 'light' | 'dark' }>(), { surface: 'light' })
</script>

<template>
  <span class="whitespace-nowrap font-display font-extrabold tracking-[-0.02em]"><span class="text-pastiYellow-500">e</span><span :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'">-CORPORATE</span></span>
</template>
