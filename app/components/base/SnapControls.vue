<script setup lang="ts">
// Controls for a useSnapRail carousel: tappable segment rail (active = PASTI
// Yellow), "01 / 06" counter, prev/next buttons (44px touch targets) and a
// one-time "Swipe" hint that fades once the user has scrolled the rail.
const props = withDefaults(
  defineProps<{
    count: number
    active: number
    touched?: boolean
    /** Accessible name of what the rail pages through, e.g. "project". */
    noun?: string
  }>(),
  { touched: false, noun: 'item' }
)
const emit = defineEmits<{ go: [index: number]; prev: []; next: [] }>()
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div class="flex flex-1 items-center gap-1" role="tablist" :aria-label="`${noun} navigation`">
        <button
          v-for="n in props.count"
          :key="n"
          type="button"
          role="tab"
          :aria-selected="n - 1 === props.active"
          :aria-label="`Go to ${noun} ${n}`"
          class="group/seg flex h-11 flex-1 items-center"
          @click="emit('go', n - 1)"
        >
          <span
            class="block h-[3px] w-full rounded-full transition-colors duration-300 ease-editorial"
            :class="n - 1 === props.active ? 'bg-pastiYellow-500' : n - 1 < props.active ? 'bg-[color:rgba(3,60,89,0.45)]' : 'bg-[color:rgba(3,60,89,0.14)]'"
          />
        </button>
      </div>
      <span class="shrink-0 font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-slateNavy">
        {{ pad(props.active + 1) }}<span class="text-[color:rgba(3,60,89,0.4)]"> / {{ pad(props.count) }}</span>
      </span>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <span
        aria-hidden="true"
        class="swipe-hint mr-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)] transition-opacity duration-500 ease-editorial"
        :class="props.touched ? 'opacity-0' : 'opacity-100'"
      >
        Swipe
        <svg viewBox="0 0 16 16" class="swipe-hint-arrow h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
      </span>
      <button
        type="button"
        :aria-label="`Previous ${noun}`"
        :disabled="props.active === 0"
        class="grid h-11 w-11 place-items-center rounded-full border border-[color:rgba(3,60,89,0.18)] text-slateNavy transition-[opacity,transform,background-color] duration-200 ease-editorial active:scale-90 disabled:opacity-30"
        @click="emit('prev')"
      >
        <svg viewBox="0 0 16 16" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
      </button>
      <button
        type="button"
        :aria-label="`Next ${noun}`"
        :disabled="props.active === props.count - 1"
        class="grid h-11 w-11 place-items-center rounded-full bg-slateNavy text-pureWhite transition-[opacity,transform] duration-200 ease-editorial active:scale-90 disabled:opacity-30"
        @click="emit('next')"
      >
        <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Gentle nudge until the first swipe — linear-free, approved ease curve. */
@media (prefers-reduced-motion: no-preference) {
  .swipe-hint-arrow {
    animation: swipe-nudge 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
}
@keyframes swipe-nudge {
  0%,
  40% {
    transform: translateX(0);
  }
  70% {
    transform: translateX(4px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
