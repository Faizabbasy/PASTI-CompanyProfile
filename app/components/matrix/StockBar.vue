<script setup lang="ts">
import type { StockKey, StockMix } from '~/composables/useMatrix'

// The MATRIX Signal: one material's stock as a bar. Unsplit, it reads as a
// single "on hand" total; split, the total resolves into net available
// (yellow), reserved, quarantine (hatched) and damaged — each segment keeps
// its text label in the legend, never colour alone. Optional requirement
// marker shows the shortfall against net available. Motion is CSS only
// (opacity + scaleX, composited); reduced motion shows the final state.
// Illustrative values only.
const props = withDefaults(
  defineProps<{ mix: StockMix; split?: boolean; focus?: StockKey | 'onhand' | null; dark?: boolean; requirement?: boolean; legend?: boolean; unit?: string }>(),
  { split: true, focus: null, dark: false, requirement: false, legend: true, unit: 'EA' }
)
const t = useT()

const net = computed(() => netAvailable(props.mix))
const scale = computed(() => Math.max(props.mix.onHand, props.mix.requirement ?? 0))
const pct = (n: number) => `${(n / scale.value) * 100}%`

const segs = computed(() => {
  const order: { key: StockKey; label: string; qty: number }[] = [
    { key: 'net', label: t('Net available'), qty: net.value },
    { key: 'reserved', label: t('Reserved'), qty: props.mix.reserved },
    { key: 'quarantine', label: t('Quarantine'), qty: props.mix.quarantine },
    { key: 'damaged', label: t('Damaged'), qty: props.mix.damaged }
  ]
  let left = 0
  return order.map((s, i) => {
    const out = { ...s, left: pct(left), width: pct(s.qty), i }
    left += s.qty
    return out
  })
})
const shortfall = computed(() => Math.max(0, (props.mix.requirement ?? 0) - net.value))
const dim = (k: StockKey) => props.split && props.focus && props.focus !== 'onhand' && props.focus !== k
const summary = computed(
  () =>
    t('On hand {a} {unit}: net available {b}, reserved {c}, quarantine {d}, damaged {e}', { a: props.mix.onHand, unit: props.unit, b: net.value, c: props.mix.reserved, d: props.mix.quarantine, e: props.mix.damaged }) +
    (props.requirement && props.mix.requirement ? `. ${t('Requirement {r}, short {s}.', { r: props.mix.requirement, s: shortfall.value })}` : '.')
)
</script>

<template>
  <div>
    <div class="relative" role="img" :aria-label="summary">
      <!-- Requirement marker -->
      <div v-if="requirement && mix.requirement" aria-hidden="true" class="absolute -top-6 bottom-[-6px] z-10 transition-opacity duration-500" :class="split ? 'opacity-100' : 'opacity-0'" :style="{ left: pct(mix.requirement) }">
        <span class="absolute bottom-full right-0 mb-0.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em]" :class="dark ? 'text-[color:rgba(255,255,255,0.75)]' : 'text-[color:rgba(3,60,89,0.7)]'">{{ t('Requirement') }} {{ mix.requirement }}</span>
        <span class="absolute inset-y-0 left-0 w-0 border-l-2 border-dashed" :class="dark ? 'border-pureWhite' : 'border-slateNavy'" />
      </div>
      <div class="relative h-9 overflow-hidden rounded-[8px]" :class="dark ? 'bg-[color:rgba(255,255,255,0.06)]' : 'bg-[color:rgba(3,60,89,0.06)]'">
        <span
          v-for="s in segs"
          :key="s.key"
          aria-hidden="true"
          class="msb-seg absolute inset-y-0 origin-left"
          :class="[`msb-${s.key}`, split ? 'is-split' : '', dim(s.key) ? 'opacity-25' : 'opacity-100']"
          :style="{ left: s.left, width: s.width, transitionDelay: split ? `${s.i * 90}ms` : '0ms' }"
        />
        <!-- The unsplit total -->
        <span aria-hidden="true" class="absolute inset-y-0 left-0 flex items-center px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-500" :class="[dark ? 'bg-pureWhite text-slateNavy' : 'bg-slateNavy text-pureWhite', split ? 'opacity-0' : 'opacity-100']" :style="{ width: pct(mix.onHand) }">{{ t('On hand') }} {{ mix.onHand }}</span>
      </div>
    </div>
    <ul v-if="legend" class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-hidden="true">
      <li class="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums" :class="dark ? 'text-[color:rgba(255,255,255,0.8)]' : 'text-[color:rgba(3,60,89,0.8)]'">
        <span class="h-2.5 w-2.5 rounded-[2px]" :class="dark ? 'bg-pureWhite' : 'bg-slateNavy'" />{{ t('On hand') }} <strong class="font-semibold">{{ mix.onHand }}</strong>
      </li>
      <li v-for="s in segs" :key="s.key" class="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums transition-opacity duration-300" :class="[dark ? 'text-[color:rgba(255,255,255,0.8)]' : 'text-[color:rgba(3,60,89,0.8)]', dim(s.key) ? 'opacity-40' : '']">
        <span class="h-2.5 w-2.5 rounded-[2px]" :class="`msb-${s.key}`" />{{ s.label }} <strong class="font-semibold">{{ s.qty }}</strong>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.msb-seg {
  transform: scaleX(0);
  transition:
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.msb-seg.is-split {
  transform: scaleX(1);
}
.msb-net {
  background: #fbba00;
}
.msb-reserved {
  background: #3e7a99;
}
.msb-quarantine {
  background: repeating-linear-gradient(135deg, #8fa9b8 0 4px, #c9d6de 4px 8px);
}
.msb-damaged {
  background: #c2412d;
}
/* Segments are separated by a hairline so adjacent states never merge. */
.msb-seg + .msb-seg {
  box-shadow: inset 2px 0 0 rgba(255, 255, 255, 0.85);
}
@media (prefers-reduced-motion: reduce) {
  .msb-seg {
    transition: none;
  }
}
</style>
