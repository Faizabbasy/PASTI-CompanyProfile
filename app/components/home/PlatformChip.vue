<script setup lang="ts">
// "PASTI × PRODUCT" lockup that sits in the corner of a product fragment —
// ties every platform to the parent brand the way an endorsement line does,
// and reads as a caption plate (a real state/attribution), not decoration.
defineProps<{ name: string }>()
</script>

<template>
  <span
    class="pointer-events-none inline-flex items-center gap-2.5 rounded-token-sm border border-[color:rgba(255,255,255,0.12)] bg-[color:rgba(15,23,42,0.92)] px-3 py-2"
  >
    <LayoutBrandMark :height="11" />
    <span aria-hidden="true" class="h-3 w-px bg-[color:rgba(255,255,255,0.22)]" />
    <span class="font-display text-[11px] font-semibold tracking-[0.06em] text-pureWhite">{{ name }}</span>
  </span>
</template>
