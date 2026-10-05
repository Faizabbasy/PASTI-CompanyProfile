<script setup lang="ts">
// Shared hero marker — the homepage's "● 01 / 04 ——" device, carrying the
// page name instead. Centred (rule on both sides) on phones, left-aligned
// with a trailing rule from desktop up. `surface` adapts it to the navy
// (Technology) and PASTI Yellow (Creative) hero grounds.
withDefaults(defineProps<{ label: string; meta?: string; surface?: 'light' | 'dark' | 'yellow' }>(), { surface: 'light' })
</script>

<template>
  <div
    class="m-center-row flex items-center gap-3 font-display text-token-metadata font-semibold uppercase tracking-[0.12em]"
    :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.8)]' : 'text-[color:rgba(3,60,89,0.78)]'"
  >
    <span aria-hidden="true" class="h-px w-10 desktop:hidden" :class="surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.35)]' : 'bg-[color:rgba(3,60,89,0.4)]'" />
    <span
      aria-hidden="true"
      class="h-2 w-2 shrink-0 rounded-full"
      :class="surface === 'yellow' ? 'bg-slateNavy shadow-[0_0_0_4px_rgba(3,60,89,0.15)]' : 'bg-pastiYellow-500 shadow-[0_0_0_4px_rgba(251,186,0,0.18)]'"
    />
    <span>{{ label }}</span>
    <span
      v-if="meta"
      class="hidden font-medium normal-case tracking-[0.04em] tablet:inline"
      :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.5)]' : 'text-[color:rgba(3,60,89,0.6)]'"
    >· {{ meta }}</span>
    <span aria-hidden="true" class="h-px w-10 desktop:w-14" :class="surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.35)]' : 'bg-[color:rgba(3,60,89,0.4)]'" />
  </div>
</template>
