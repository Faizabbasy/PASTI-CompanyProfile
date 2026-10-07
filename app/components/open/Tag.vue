<script setup lang="ts">
// OPEN section tag — the page read as one closed loop. A small ring whose arc
// is this section's position in the page (n of 12); at the CTA the ring is
// complete and the check appears, i.e. the OPEN mark is "assembled" by the
// time you reach the demo. Replaces BaseSectionMark on /open only. The arc
// draws once on entry (CSS); reduced motion shows it drawn.
const props = withDefaults(defineProps<{ n: number; label: string; total?: number; surface?: 'light' | 'dark' }>(), {
  total: 12,
  surface: 'light'
})

const rootRef = ref<HTMLElement | null>(null)
const inView = useOpenInView(rootRef, 0.6)

const R = 9
const C = 2 * Math.PI * R
const done = computed(() => props.n >= props.total)
const dash = computed(() => `${(C * props.n) / props.total} ${C}`)
const dark = computed(() => props.surface === 'dark')
</script>

<template>
  <div ref="rootRef" class="flex items-center gap-3" :class="{ 'is-in': inView }">
    <span class="relative h-6 w-6 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 24 24" class="absolute inset-0 h-full w-full -rotate-90" fill="none">
        <circle cx="12" cy="12" :r="R" stroke-width="2.5" :stroke="dark ? 'rgba(255,255,255,0.16)' : 'rgba(3,60,89,0.14)'" />
        <circle
          cx="12"
          cy="12"
          :r="R"
          stroke-width="2.5"
          stroke="#FBBA00"
          stroke-linecap="round"
          :stroke-dasharray="dash"
          class="op-tag-arc"
          :style="{ '--c': C }"
        />
      </svg>
      <svg v-if="done" viewBox="0 0 24 24" class="op-pop absolute inset-0 h-full w-full" fill="none" style="--d: 600ms">
        <path d="M8 12.5l3 3 5.5-6" stroke="#FBBA00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <p class="font-display text-[14px] font-bold tracking-[-0.01em]" :class="dark ? 'text-pureWhite' : 'text-slateNavy'">{{ label }}</p>
    <span class="relative block h-px flex-1" :class="dark ? 'bg-[color:rgba(255,255,255,0.12)]' : 'bg-[color:rgba(3,60,89,0.12)]'">
      <span class="op-draw absolute inset-0 bg-pastiYellow-500/70" />
    </span>
    <span class="op-num font-display text-[13px] font-semibold" :class="dark ? 'text-[color:rgba(255,255,255,0.55)]' : 'text-[color:rgba(3,60,89,0.55)]'">
      {{ String(n).padStart(2, '0') }}<span class="opacity-50"> / {{ total }}</span>
    </span>
  </div>
</template>

<style scoped>
.op-tag-arc {
  transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
:global(html[data-reduced-motion='false']) .op-tag-arc {
  stroke-dashoffset: var(--c);
}
:global(html[data-reduced-motion='false']) .is-in .op-tag-arc {
  stroke-dashoffset: 0;
}
</style>
