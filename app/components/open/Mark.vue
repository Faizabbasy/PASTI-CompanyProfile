<script setup lang="ts">
// OPEN's ring-and-check device (from the OPEN cover art, public/images/
// platforms/open.webp) redrawn as SVG so it can scale and animate. The page's
// Signal: the ring is the ecosystem, the check is control/approval.
withDefaults(defineProps<{ size?: number; tone?: 'yellow' | 'navy' | 'white' }>(), { size: 40, tone: 'yellow' })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
    :class="tone === 'yellow' ? 'text-pastiYellow-500' : tone === 'navy' ? 'text-slateNavy' : 'text-pureWhite'"
  >
    <circle data-mark-ring cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4.5" />
    <path data-mark-check d="M15.5 24.5l6 6 11-12" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
