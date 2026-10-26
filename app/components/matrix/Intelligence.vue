<script setup lang="ts">
import type { StockKey } from '~/composables/useMatrix'

// 04 MATERIAL INTELLIGENCE — an interactive material-state explorer, not a
// card grid. Pick a state; the same sample material answers it: the stock
// bar highlights the matching segment, or the panel switches to its
// locations, serials, requirement, planning parameters or aging. The panel
// keeps a fixed minimum height and layout containment, so switching never
// shifts the page. Synthetic data; source §1, §3, §4.
const { intelligence, sample } = useMatrixPage()
const sectionRef = ref<HTMLElement | null>(null)
const picked = ref<(typeof intelligence.states)[number]['id']>('net')
const state = computed(() => intelligence.states.find((s) => s.id === picked.value)!)
useMatrixReveal(sectionRef)

const net = netAvailable(sample.mix)
const qty: Record<string, number> = { onhand: sample.mix.onHand, reserved: sample.mix.reserved, quarantine: sample.mix.quarantine, damaged: sample.mix.damaged, net }
const barStates = ['onhand', 'reserved', 'quarantine', 'damaged', 'net'] as const
const focus = computed<StockKey | 'onhand' | null>(() => (barStates.includes(picked.value as (typeof barStates)[number]) ? (picked.value as StockKey | 'onhand') : null))
const serialTone: Record<string, string> = {
  Available: 'bg-pastiYellow-500 text-slateNavy',
  Reserved: 'bg-[#3E7A99] text-pureWhite',
  Quarantine: 'mx-hatch text-slateNavy',
  Damaged: 'bg-[#C2412D] text-pureWhite'
}
</script>

<template>
  <section id="intelligence" ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="4" name="Material intelligence" surface="light" class="mb-12 desktop:mb-16" />
      <MatrixHeading :eyebrow="intelligence.eyebrow" :title="intelligence.headline" :lede="intelligence.lede" />

      <div data-fr class="mt-12 grid gap-4 desktop:grid-cols-12 desktop:gap-8">
        <!-- State picker -->
        <div role="group" aria-label="Material states" class="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] desktop:col-span-4 desktop:mx-0 desktop:grid desktop:gap-1 desktop:overflow-visible desktop:px-0 desktop:pb-0" data-lenis-prevent>
          <button
            v-for="s in intelligence.states"
            :key="s.id"
            type="button"
            class="shrink-0 rounded-full px-4 py-2.5 text-left font-display text-[14px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500 desktop:flex desktop:items-center desktop:justify-between desktop:rounded-[12px] desktop:py-3"
            :class="picked === s.id ? 'bg-slateNavy text-pureWhite' : 'bg-surfaceNeutral text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)] hover:bg-[color:rgba(3,60,89,0.06)] desktop:bg-transparent desktop:ring-0'"
            :aria-pressed="picked === s.id"
            aria-controls="mxi-panel"
            @click="picked = s.id"
          >
            {{ s.label }}
            <span aria-hidden="true" class="hidden h-1.5 w-1.5 rounded-full desktop:block" :class="picked === s.id ? 'bg-pastiYellow-500' : 'bg-transparent'" />
          </button>
        </div>

        <!-- Panel -->
        <div id="mxi-panel" class="min-h-[400px] rounded-[22px] bg-surfaceNeutral p-5 ring-1 ring-[color:rgba(3,60,89,0.08)] [contain:layout_paint] tablet:p-8 desktop:col-span-8" aria-live="polite">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">{{ sample.code }} · {{ sample.name }}</p>
            <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.45)]">Illustrative</p>
          </div>
          <p class="mt-5 font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-slateNavy tablet:text-[34px]">
            {{ state.label }}<template v-if="qty[picked] !== undefined"> · {{ qty[picked] }} {{ sample.unit }}</template>
          </p>
          <p class="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ state.body }}</p>

          <div class="mt-8">
            <!-- Balance states + critical: the bar -->
            <div v-if="focus || picked === 'critical'" class="pt-6">
              <MatrixStockBar :mix="sample.mix" :focus="focus" :requirement="picked === 'critical'" />
              <p v-if="picked === 'critical'" class="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:rgba(194,65,45,0.1)] px-3 py-1.5 text-[13px] font-semibold text-[#9E3322]">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 1.5 15 14H1z" stroke-linejoin="round" /><path d="M8 6v3.5M8 11.6v.2" stroke-linecap="round" /></svg>
                Short {{ (sample.mix.requirement ?? 0) - net }} {{ sample.unit }} against the near-term requirement
              </p>
            </div>

            <!-- Location -->
            <ul v-else-if="picked === 'location'" class="divide-y divide-[color:rgba(3,60,89,0.08)] rounded-[14px] bg-pureWhite ring-1 ring-[color:rgba(3,60,89,0.08)]">
              <li v-for="l in sample.locations" :key="l.path" class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3.5">
                <span class="min-w-0 font-mono text-[12.5px] text-slateNavy">{{ l.path }}</span>
                <span class="inline-flex items-center gap-3 text-[13px]">
                  <span class="font-semibold" :class="l.state === 'Quarantine' ? 'text-[color:rgba(3,60,89,0.6)]' : 'text-slateNavy'">{{ l.state }}</span>
                  <strong class="font-display text-[16px] tabular-nums text-slateNavy">{{ l.qty }} {{ sample.unit }}</strong>
                </span>
              </li>
            </ul>

            <!-- Lot / serial -->
            <ul v-else-if="picked === 'serial'" class="grid grid-cols-2 gap-2 tablet:grid-cols-4">
              <li v-for="s in sample.serials" :key="s.id" class="rounded-[14px] bg-pureWhite p-3.5 ring-1 ring-[color:rgba(3,60,89,0.08)]">
                <span class="block font-mono text-[12.5px] text-slateNavy">{{ s.id }}</span>
                <span class="mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]" :class="serialTone[s.state]">{{ s.state }}</span>
              </li>
            </ul>

            <!-- Replenishment -->
            <div v-else-if="picked === 'replenish'">
              <dl class="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                <div v-for="p in sample.planning" :key="p.label" class="rounded-[14px] bg-pureWhite p-3.5 ring-1 ring-[color:rgba(3,60,89,0.08)]">
                  <dt class="text-[12px] text-[color:rgba(3,60,89,0.6)]">{{ p.label }}</dt>
                  <dd class="mt-1 font-display text-[18px] font-bold text-slateNavy">{{ p.value }}</dd>
                </div>
              </dl>
              <p class="mt-4 text-[13.5px] text-[color:rgba(3,60,89,0.72)]">Net available ({{ net }}) is below the reorder point (8) — the item is flagged for <strong class="text-slateNavy">replenishment review</strong>, not ordered automatically.</p>
            </div>

            <!-- Aging -->
            <dl v-else-if="picked === 'aging'" class="grid grid-cols-2 gap-2 tablet:grid-cols-4">
              <div v-for="a in [{ l: 'Last movement', v: 'Day 4' }, { l: 'Movement class', v: sample.movement }, { l: 'Age band', v: '0–90 days' }, { l: 'Surplus candidate', v: 'No' }]" :key="a.l" class="rounded-[14px] bg-pureWhite p-3.5 ring-1 ring-[color:rgba(3,60,89,0.08)]">
                <dt class="text-[12px] text-[color:rgba(3,60,89,0.6)]">{{ a.l }}</dt>
                <dd class="mt-1 font-display text-[16px] font-bold text-slateNavy">{{ a.v }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mx-hatch {
  background: repeating-linear-gradient(135deg, #8fa9b8 0 4px, #c9d6de 4px 8px);
}
</style>
