<script setup lang="ts">
import type { CompareValue } from '~/composables/useShiftly'

// STANDARD SUBSCRIPTION vs ENTERPRISE EXPANSION (deck slide 8). A real
// <table> on tablet+; stacked capability cards on phones. No prices here
// (pending approval) — and nothing implies add-ons are in the subscription.
const { compare, plans } = useShiftly()

// Filter chips: everything / what the subscription includes / add-ons.
const filters = [
  { id: 'all', label: 'All capabilities' },
  { id: 'standard', label: 'Included in Standard' },
  { id: 'addon', label: 'Enterprise add-ons' }
] as const
const filter = ref<(typeof filters)[number]['id']>('all')
const rows = computed(() =>
  compare.filter((r) =>
    filter.value === 'all' ? true : filter.value === 'standard' ? r.standard.kind === 'included' : r.enterprise.label !== '—'
  )
)
const countOf = (id: (typeof filters)[number]['id']) => compare.filter((r) => (id === 'all' ? true : id === 'standard' ? r.standard.kind === 'included' : r.enterprise.label !== '—')).length

const tone = (k: CompareValue) =>
  k === 'included' ? 'text-slateNavy' : k === 'addon' ? 'text-slateNavy' : k === 'limited' ? 'text-[color:rgba(3,60,89,0.7)]' : k === 'none' ? 'text-[color:rgba(3,60,89,0.4)]' : 'text-[color:rgba(3,60,89,0.78)]'
const icon = (k: CompareValue) => (k === 'included' ? 'check' : k === 'addon' ? 'plus' : k === 'limited' ? 'limited' : k === 'none' ? 'none' : '')

</script>

<template>
  <section id="enterprise" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 15%; --lift-y: 20%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Enterprise" meta="Standard vs expansion" />
      <div class="mt-14 grid gap-10 desktop:mt-20 desktop:grid-cols-12">
        <div class="desktop:col-span-7">
          <ShiftlyHeading :eyebrow="plans.eyebrow" :title="plans.headline" :lede="plans.body" />
        </div>
        <aside class="rounded-[20px] bg-slateNavy p-6 text-pureWhite tablet:p-8 desktop:col-span-5 desktop:self-end">
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-pastiYellow-500">Enterprise expansion services</p>
          <p class="mt-2 text-[14px] text-[color:rgba(255,255,255,0.7)]">{{ plans.expansionNote }}</p>
          <ul class="mt-5 grid grid-cols-1 gap-2 tablet:grid-cols-2">
            <li v-for="e in plans.expansion" :key="e" class="flex items-center gap-2.5 text-[14px] font-semibold"><ShiftlyIcon name="plus" class="h-3.5 w-3.5 text-pastiYellow-500" />{{ e }}</li>
          </ul>
        </aside>
      </div>

      <!-- Filter -->
      <div role="group" aria-label="Filter capabilities" class="m-center-row mt-14 flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          :aria-pressed="filter === f.id"
          class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-display text-[14px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slateNavy"
          :class="filter === f.id ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.2)] bg-pureWhite text-slateNavy hover:border-slateNavy'"
          @click="filter = f.id"
        >
          {{ f.label }}
          <span class="rounded-full px-1.5 font-mono text-[10px]" :class="filter === f.id ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-surfaceNeutral text-[color:rgba(3,60,89,0.6)]'">{{ countOf(f.id) }}</span>
        </button>
      </div>

      <!-- Tablet+ table -->
      <div class="mt-6 hidden overflow-hidden rounded-[20px] ring-1 ring-[color:rgba(3,60,89,0.12)] tablet:block">
        <table class="w-full border-collapse bg-pureWhite text-left">
          <caption class="sr-only">SHIFTLY Standard subscription compared with Enterprise Expansion add-on services</caption>
          <thead>
            <tr class="bg-slateNavy text-pureWhite">
              <th scope="col" class="w-[38%] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.16em]">Capability</th>
              <th scope="col" class="px-6 py-4"><ShiftlyMark surface="dark" :size="15" /> <span class="ml-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.7)]">Standard</span></th>
              <th scope="col" class="bg-pastiYellow-500 px-6 py-4 font-display text-[15px] font-bold text-slateNavy">Enterprise Expansion <span class="font-mono text-[10px] font-normal uppercase tracking-[0.14em]">(add-on)</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.capability" class="border-t border-[color:rgba(3,60,89,0.08)] even:bg-surfaceNeutral/40">
              <th scope="row" class="px-6 py-3.5 font-display text-[15px] font-bold text-slateNavy">{{ r.capability }}</th>
              <td v-for="(c, k) in [r.standard, r.enterprise]" :key="k" class="px-6 py-3.5 text-[14px] font-semibold" :class="tone(c.kind)">
                <span class="inline-flex items-center gap-2">
                  <span v-if="icon(c.kind)" class="grid h-5 w-5 place-items-center rounded-full" :class="c.kind === 'included' ? 'bg-pastiYellow-500 text-slateNavy' : c.kind === 'addon' ? 'bg-slateNavy text-pureWhite' : ''">
                    <ShiftlyIcon :name="icon(c.kind)" class="h-3 w-3" />
                  </span>
                  {{ c.label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Phone: stacked capability cards -->
      <ul class="mt-6 grid gap-3 tablet:hidden" aria-label="Standard vs Enterprise Expansion">
        <li v-for="r in rows" :key="r.capability" class="rounded-[16px] bg-pureWhite p-5 ring-1 ring-[color:rgba(3,60,89,0.1)]">
          <p class="font-display text-[17px] font-bold text-slateNavy">{{ r.capability }}</p>
          <dl class="mt-3 grid grid-cols-2 gap-3">
            <div v-for="(c, k) in [r.standard, r.enterprise]" :key="k">
              <dt class="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">{{ k === 0 ? 'Standard' : 'Enterprise add-on' }}</dt>
              <dd class="mt-1 text-[13px] font-semibold leading-snug" :class="tone(c.kind)">{{ c.label }}</dd>
            </div>
          </dl>
        </li>
      </ul>

      <p class="m-center mt-8 max-w-[60ch] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.72)]"><span class="font-bold text-slateNavy">Why it matters — </span>{{ plans.why }}</p>
    </BaseContainer>
  </section>
</template>
