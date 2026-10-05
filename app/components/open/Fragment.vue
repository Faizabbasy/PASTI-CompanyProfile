<script setup lang="ts">
// Placeholder product fragment — a cropped, edge-bled slice of an OPEN screen
// drawn as structure only (no browser chrome, no fake numbers). Stands in for
// the real OPEN UI until the owner supplies screenshots (BUTUH DATA).
// `seed` varies the bar lengths so each module's slice reads differently.
const props = withDefaults(defineProps<{ title: string; seed?: number; surface?: 'light' | 'dark' }>(), { seed: 0, surface: 'light' })
const rows = computed(() => Array.from({ length: 6 }, (_, i) => 38 + (((i + 1) * 37 + props.seed * 23) % 52)))
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[22px] border"
    :class="surface === 'dark' ? 'border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(255,255,255,0.04)]' : 'border-[color:rgba(3,60,89,0.12)] bg-pureWhite shadow-[0_40px_80px_-50px_rgba(3,60,89,0.55)]'"
  >
    <div class="flex items-center justify-between border-b px-5 py-3.5" :class="surface === 'dark' ? 'border-[color:rgba(255,255,255,0.1)]' : 'border-[color:rgba(3,60,89,0.08)]'">
      <span class="inline-flex items-center gap-2.5">
        <OpenMark :size="18" />
        <span class="font-display text-[13px] font-bold" :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'">{{ title }}</span>
      </span>
      <span class="font-mono text-[10px] uppercase tracking-[0.16em]" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.45)]' : 'text-[color:rgba(3,60,89,0.45)]'">UI placeholder</span>
    </div>
    <div class="flex">
      <div class="hidden w-[22%] shrink-0 flex-col gap-2.5 border-r p-4 tablet:flex" :class="surface === 'dark' ? 'border-[color:rgba(255,255,255,0.08)]' : 'border-[color:rgba(3,60,89,0.06)]'">
        <span v-for="n in 5" :key="n" class="h-2 rounded-full" :class="[n === 2 ? 'bg-pastiYellow-500' : surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.12)]' : 'bg-[color:rgba(3,60,89,0.1)]']" :style="{ width: `${50 + ((n * 17) % 40)}%` }" />
      </div>
      <ul class="flex-1 p-4 tablet:p-5">
        <li v-for="(w, i) in rows" :key="i" class="flex items-center gap-3 border-b py-3 last:border-0" :class="surface === 'dark' ? 'border-[color:rgba(255,255,255,0.06)]' : 'border-[color:rgba(3,60,89,0.06)]'">
          <span
            class="grid h-5 w-5 shrink-0 place-items-center rounded-full"
            :class="i < 3 ? 'bg-pastiYellow-500 text-slateNavy' : surface === 'dark' ? 'border border-[color:rgba(255,255,255,0.2)]' : 'border border-[color:rgba(3,60,89,0.2)]'"
          >
            <svg v-if="i < 3" viewBox="0 0 16 16" class="h-2.5 w-2.5" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
          </span>
          <span class="h-2 rounded-full" :class="surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.16)]' : 'bg-[color:rgba(3,60,89,0.12)]'" :style="{ width: `${w}%` }" />
          <span class="ml-auto h-2 w-10 shrink-0 rounded-full" :class="surface === 'dark' ? 'bg-[color:rgba(255,255,255,0.08)]' : 'bg-[color:rgba(3,60,89,0.06)]'" />
        </li>
      </ul>
    </div>
    <!-- Edge bleed: the slice continues beyond the frame -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-16" :class="surface === 'dark' ? 'bg-gradient-to-t from-slateNavy' : 'bg-gradient-to-t from-pureWhite'" />
  </div>
</template>
