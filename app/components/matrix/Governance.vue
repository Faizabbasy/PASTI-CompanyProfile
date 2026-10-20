<script setup lang="ts">
// 10 TRACEABILITY & GOVERNANCE — "Every movement leaves evidence." Tabs
// switch between the movement ledger (what changed a balance) and the
// audit trail (who changed what, when, why); rows are synthetic and show
// roles, never people. Then the enterprise controls as a ruled list, the
// report catalog (representative reports, no figures) and sample roles.
// Merges the brief's Reporting section (owner D4). Source §5, §10, §11, §14.
const { governance, sample } = useMatrix()
const sectionRef = ref<HTMLElement | null>(null)
const tab = ref<'ledger' | 'audit'>('ledger')
const tabsRef = ref<HTMLButtonElement[]>([])
useMatrixReveal(sectionRef)

const tabs = [
  { id: 'ledger', label: 'Movement ledger' },
  { id: 'audit', label: 'Audit trail' }
] as const
const onKey = (e: KeyboardEvent) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  e.preventDefault()
  tab.value = tab.value === 'ledger' ? 'audit' : 'ledger'
  tabsRef.value[tab.value === 'ledger' ? 0 : 1]?.focus()
}
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <section id="governance" ref="sectionRef" class="relative bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="top" />
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="10" name="Traceability & governance" surface="light" class="mb-12 desktop:mb-16" />
      <MatrixHeading :eyebrow="governance.eyebrow" :title="governance.headline" :lede="governance.lede" />

      <!-- Ledger / audit -->
      <div data-fr class="mt-12 overflow-hidden rounded-[22px] bg-pureWhite ring-1 ring-[color:rgba(3,60,89,0.1)]">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[color:rgba(3,60,89,0.08)] px-4 py-3 tablet:px-5">
          <div role="tablist" aria-label="Evidence views" class="inline-flex rounded-full bg-surfaceNeutral p-1" @keydown="onKey">
            <button
              v-for="(t, i) in tabs"
              :id="`mxg-tab-${t.id}`"
              :key="t.id"
              ref="tabsRef"
              type="button"
              role="tab"
              :aria-selected="tab === t.id"
              aria-controls="mxg-panel"
              :tabindex="tab === t.id ? 0 : -1"
              class="min-h-10 rounded-full px-4 font-display text-[13px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
              :class="tab === t.id ? 'bg-slateNavy text-pureWhite' : 'text-[color:rgba(3,60,89,0.7)] hover:text-slateNavy'"
              @click="tab = t.id"
            >
              {{ t.label }}<span class="sr-only"> ({{ i + 1 }} of 2)</span>
            </button>
          </div>
          <p class="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">{{ tab === 'ledger' ? `${sample.code} · ${sample.name}` : 'Stock-impacting events' }}</p>
        </div>

        <div id="mxg-panel" role="tabpanel" :aria-labelledby="`mxg-tab-${tab}`" class="px-4 py-2 tablet:px-5">
          <!-- Tablet+: table -->
          <table class="hidden w-full text-left text-[13px] tablet:table">
            <thead>
              <tr class="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:rgba(3,60,89,0.55)]">
                <template v-if="tab === 'ledger'"><th class="py-2.5 font-medium">Time</th><th class="py-2.5 font-medium">Movement</th><th class="py-2.5 font-medium">Qty</th><th class="py-2.5 font-medium">From → to</th><th class="py-2.5 font-medium">Before → after</th><th class="py-2.5 font-medium">Actor</th><th class="py-2.5 font-medium">Ref</th></template>
                <template v-else><th class="py-2.5 font-medium">Time</th><th class="py-2.5 font-medium">Actor</th><th class="py-2.5 font-medium">Action</th><th class="py-2.5 font-medium">Object</th><th class="py-2.5 font-medium">Before</th><th class="py-2.5 font-medium">After</th><th class="py-2.5 font-medium">Ref</th></template>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:rgba(3,60,89,0.08)] text-slateNavy">
              <template v-if="tab === 'ledger'">
                <tr v-for="(r, i) in sample.ledger" :key="r.ref" class="mxg-row" :style="{ animationDelay: `${i * 70}ms` }">
                  <td class="py-3 pr-3 font-mono text-[11.5px] text-[color:rgba(3,60,89,0.6)]">{{ r.time }}</td><td class="py-3 pr-3 font-semibold">{{ r.movement }}</td><td class="py-3 pr-3 font-mono tabular-nums">{{ r.qty }}</td><td class="py-3 pr-3 text-[12.5px]">{{ r.from }} → {{ r.to }}</td><td class="py-3 pr-3 font-mono tabular-nums">{{ r.before }} → {{ r.after }}</td><td class="py-3 pr-3">{{ r.actor }}</td><td class="py-3 font-mono text-[11.5px] text-[color:rgba(3,60,89,0.6)]">{{ r.ref }}</td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="(r, i) in governance.audit" :key="r.ref + r.time" class="mxg-row" :style="{ animationDelay: `${i * 70}ms` }">
                  <td class="py-3 pr-3 font-mono text-[11.5px] text-[color:rgba(3,60,89,0.6)]">{{ r.time }}</td><td class="py-3 pr-3">{{ r.actor }}</td><td class="py-3 pr-3 font-semibold">{{ r.action }}</td><td class="py-3 pr-3 font-mono text-[12px]">{{ r.object }}</td><td class="py-3 pr-3 text-[12.5px]">{{ r.before }}</td><td class="py-3 pr-3 text-[12.5px]">{{ r.after }}</td><td class="py-3 font-mono text-[11.5px] text-[color:rgba(3,60,89,0.6)]">{{ r.ref }}</td>
                </tr>
              </template>
            </tbody>
          </table>
          <!-- Phones: stacked rows -->
          <ul class="divide-y divide-[color:rgba(3,60,89,0.08)] text-slateNavy tablet:hidden">
            <template v-if="tab === 'ledger'">
              <li v-for="r in sample.ledger" :key="r.ref" class="py-3">
                <p class="flex justify-between gap-3 text-[14px]"><strong>{{ r.movement }}</strong><span class="font-mono tabular-nums">{{ r.qty }}</span></p>
                <p class="mt-0.5 text-[12.5px] text-[color:rgba(3,60,89,0.7)]">{{ r.from }} → {{ r.to }} · {{ r.before }} → {{ r.after }}</p>
                <p class="mt-0.5 font-mono text-[11px] text-[color:rgba(3,60,89,0.55)]">{{ r.time }} · {{ r.actor }} · {{ r.ref }}</p>
              </li>
            </template>
            <template v-else>
              <li v-for="r in governance.audit" :key="r.ref + r.time" class="py-3">
                <p class="text-[14px]"><strong>{{ r.action }}</strong> · <span class="font-mono text-[12px]">{{ r.object }}</span></p>
                <p class="mt-0.5 text-[12.5px] text-[color:rgba(3,60,89,0.7)]">{{ r.before }} → {{ r.after }}</p>
                <p class="mt-0.5 font-mono text-[11px] text-[color:rgba(3,60,89,0.55)]">{{ r.time }} · {{ r.actor }} · {{ r.ref }}</p>
              </li>
            </template>
          </ul>
        </div>
        <p class="border-t border-[color:rgba(3,60,89,0.08)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.45)] tablet:px-5">Synthetic records · roles shown instead of people · searchable and exportable for review</p>
      </div>

      <div class="mt-4 grid gap-4 desktop:grid-cols-12">
        <!-- Enterprise controls -->
        <div data-fr class="rounded-[22px] bg-slateNavy p-6 text-pureWhite desktop:col-span-7">
          <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">Enterprise control</p>
          <ul class="mt-4 grid gap-x-8 tablet:grid-cols-2">
            <li v-for="(c, i) in governance.controls" :key="c.name" class="grid grid-cols-[1.75rem_1fr] gap-2 border-t border-[color:rgba(255,255,255,0.1)] py-3.5">
              <span class="font-mono text-[10.5px] tabular-nums text-pastiYellow-400">{{ pad(i + 1) }}</span>
              <span>
                <span class="block font-display text-[15px] font-bold">{{ c.name }}</span>
                <span class="mt-0.5 block text-[13px] leading-snug text-[color:rgba(255,255,255,0.7)]">{{ c.body }}</span>
              </span>
            </li>
          </ul>
          <p class="mt-4 text-[12.5px] text-[color:rgba(255,255,255,0.6)]">Sample roles: {{ governance.roles.join(' · ') }}. Names and rights follow your organization.</p>
        </div>

        <!-- Report catalog -->
        <div data-fr class="rounded-[22px] bg-pureWhite p-6 ring-1 ring-[color:rgba(3,60,89,0.1)] desktop:col-span-5">
          <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Reporting & operational control</p>
          <ul class="mt-3 divide-y divide-[color:rgba(3,60,89,0.08)]">
            <li v-for="r in governance.reports" :key="r" class="flex items-center justify-between gap-3 py-2.5">
              <span class="font-display text-[14.5px] font-semibold text-slateNavy">{{ r }}</span>
              <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:rgba(3,60,89,0.5)]">Preview · Export</span>
            </li>
          </ul>
          <p class="mt-3 text-[12.5px] leading-snug text-[color:rgba(3,60,89,0.6)]">Representative reports. Definitions, parameters and scope are agreed during configuration.</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mxg-row {
  animation: mxg-row 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes mxg-row {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .mxg-row {
    animation: none;
  }
}
</style>
