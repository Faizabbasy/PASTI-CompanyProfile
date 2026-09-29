<script setup lang="ts">
// The 12-column macro grid made visible (Precision Framing, 00-brand-guide.md
// §08). Static 1px structural rules only — no motion, no glow — so it can sit
// behind Quiet sections too. `edge` adds short column ticks along one edge,
// the same "grid being uncovered" cue What We Build's curtain uses.
withDefaults(
  defineProps<{
    tone?: 'dark' | 'light'
    edge?: 'top' | 'bottom' | 'none'
  }>(),
  { tone: 'dark', edge: 'none' }
)
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    <div class="container-page absolute inset-0 left-1/2 -translate-x-1/2">
      <div class="grid h-full grid-cols-12">
        <div
          v-for="n in 12"
          :key="n"
          class="h-full border-l"
          :class="[
            n === 12 ? 'border-r' : '',
            tone === 'dark' ? 'border-[color:rgba(255,255,255,0.045)]' : 'border-[color:rgba(15,23,42,0.06)]'
          ]"
        />
      </div>
    </div>
    <div v-if="edge !== 'none'" class="container-page absolute left-1/2 -translate-x-1/2" :class="edge === 'top' ? 'top-0' : 'bottom-0'">
      <div class="grid grid-cols-12">
        <span
          v-for="n in 12"
          :key="n"
          class="h-2 border-l"
          :class="tone === 'dark' ? 'border-[color:rgba(37,99,235,0.55)]' : 'border-[color:rgba(37,99,235,0.4)]'"
        />
      </div>
    </div>
  </div>
</template>
