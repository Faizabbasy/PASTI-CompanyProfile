<script setup lang="ts">
// Blueprint registration marks — four "+" crosshairs pinned to the content
// frame's corners, plus an optional mono coordinate label. The e-CORPORATE
// page's recurring signature (precision, engineered), decorative only.
withDefaults(defineProps<{ surface?: 'light' | 'dark'; label?: string }>(), { surface: 'light', label: undefined })
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0">
    <div class="container-page relative h-full">
      <span
        v-for="pos in ['left-0 top-6', 'right-0 top-6', 'left-0 bottom-6', 'right-0 bottom-6']"
        :key="pos"
        class="absolute mx-gutter h-3 w-3"
        :class="pos"
      >
        <span class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" :class="surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.35)]' : 'bg-[color:rgba(3,60,89,0.35)]'" />
        <span class="absolute left-0 top-1/2 h-px w-full -translate-y-1/2" :class="surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.35)]' : 'bg-[color:rgba(3,60,89,0.35)]'" />
      </span>
      <span
        v-if="label"
        class="absolute bottom-[22px] right-0 mx-gutter hidden pr-6 font-mono text-[10px] uppercase tracking-[0.2em] tablet:block"
        :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.4)]' : 'text-[color:rgba(3,60,89,0.4)]'"
      >{{ label }}</span>
    </div>
  </div>
</template>
