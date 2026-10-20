<script setup lang="ts">
// 10 MANAGEMENT VISIBILITY — four curated views that the source shows
// implemented (executive dashboard, capacity & bottleneck heatmap, scenario
// comparison, reports with CSV export). Each is a small reconstructed
// view with abstract values — no figures. OTD / adherence / order-tracking
// dashboards are specification-only in the source and are not shown.
const { visibility, gantt } = useFast()
const sectionRef = ref<HTMLElement | null>(null)
const tab = ref(visibility.views[0]!.id)
useFastReveal(sectionRef)
const current = computed(() => visibility.views.find((v) => v.id === tab.value)!)

// Abstract heatmap: 5 resources × 12 slots, load 0..1 (sample pattern).
const heat = gantt.resources.map((r, ri) => ({ name: r.name, cells: Array.from({ length: 12 }, (_, c) => Math.min(1, Math.abs(Math.sin((ri + 1) * 1.7 + c * 0.55)) * (ri === 2 ? 1.15 : 0.85))) }))
const heatTone = (v: number) => (v > 0.9 ? 'bg-[#C2412D]' : v > 0.7 ? 'bg-pastiYellow-500' : v > 0.4 ? 'bg-[#3E7A99]' : 'bg-[color:rgba(3,60,89,0.12)]')
const kpis = ['Planning coverage', 'Avg. utilization', 'Open orders', 'Unscheduled', 'Critical exceptions', 'Operator availability']
const reports = ['Production performance', 'Capacity utilization', 'Exceptions']
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="10 / 12" class="mb-12 desktop:mb-16" />
      <div><FastHeading :eyebrow="visibility.eyebrow" :title="visibility.headline" :lede="visibility.lede" /></div>

      <div class="mt-12 grid gap-6 desktop:grid-cols-12">
        <div role="tablist" aria-label="Views" class="grid content-start gap-2 desktop:col-span-4">
          <button
            v-for="v in visibility.views"
            :key="v.id"
            data-fr
            type="button"
            role="tab"
            :aria-selected="tab === v.id"
            class="rounded-[16px] p-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
            :class="tab === v.id ? 'bg-slateNavy text-pureWhite' : 'bg-pureWhite text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.08)] hover:ring-[color:rgba(3,60,89,0.25)]'"
            @click="tab = v.id"
          >
            <span class="block font-display text-[16px] font-bold">{{ v.name }}</span>
            <span class="mt-1 block text-[13px] leading-snug" :class="tab === v.id ? 'text-[color:rgba(255,255,255,0.7)]' : 'text-[color:rgba(3,60,89,0.65)]'">{{ v.body }}</span>
          </button>
        </div>

        <div data-fr role="tabpanel" :aria-label="current.name" class="min-h-[360px] rounded-[24px] bg-pureWhite p-5 shadow-[0_40px_80px_-50px_rgba(3,60,89,0.5)] ring-1 ring-[color:rgba(3,60,89,0.08)] tablet:p-7 desktop:col-span-8">
          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">
            <span>{{ current.name }}</span><span>Illustrative</span>
          </div>

          <!-- Executive -->
          <div v-if="tab === 'executive'" class="mt-5 grid grid-cols-2 gap-3 tablet:grid-cols-3">
            <div v-for="(k, i) in kpis" :key="k" class="rounded-[14px] bg-surfaceNeutral p-4">
              <p class="text-[12px] font-semibold text-[color:rgba(3,60,89,0.65)]">{{ k }}</p>
              <div class="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
                <span v-for="b in 7" :key="b" class="flex-1 rounded-t-[3px]" :class="b === 7 ? (i === 4 ? 'bg-[#C2412D]' : 'bg-pastiYellow-500') : 'bg-[color:rgba(3,60,89,0.18)]'" :style="{ height: `${30 + Math.abs(Math.sin(b * 1.3 + i)) * 70}%` }" />
              </div>
            </div>
          </div>

          <!-- Capacity heatmap -->
          <div v-else-if="tab === 'capacity'" class="mt-5">
            <div v-for="r in heat" :key="r.name" class="flex items-center gap-3 py-1">
              <span class="w-28 shrink-0 truncate text-[12px] font-semibold text-slateNavy">{{ r.name }}</span>
              <span class="grid flex-1 grid-cols-12 gap-1" aria-hidden="true">
                <span v-for="(c, ci) in r.cells" :key="ci" class="h-7 rounded-[4px]" :class="heatTone(c)" />
              </span>
            </div>
            <p class="mt-4 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.6)]">
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[2px] bg-[color:rgba(3,60,89,0.12)]" />Light</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[2px] bg-[#3E7A99]" />Loaded</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[2px] bg-pastiYellow-500" />High</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[2px] bg-[#C2412D]" />Bottleneck candidate</span>
            </p>
          </div>

          <!-- Scenario comparison -->
          <div v-else-if="tab === 'scenario'" class="mt-5 grid gap-4 tablet:grid-cols-2">
            <div v-for="(s, si) in ['Active production', 'Simulation A']" :key="s" class="rounded-[16px] p-5" :class="si === 0 ? 'bg-surfaceNeutral' : 'bg-slateNavy text-pureWhite'">
              <p class="font-display text-[15px] font-bold">{{ s }}</p>
              <ul class="mt-4 grid gap-3">
                <li v-for="(k, ki) in ['On-time orders', 'Utilization', 'Late orders']" :key="k">
                  <p class="text-[12px] font-semibold opacity-75">{{ k }}</p>
                  <span class="mt-1.5 block h-2 rounded-full" :class="si === 0 ? 'bg-[color:rgba(3,60,89,0.35)]' : 'bg-pastiYellow-500'" :style="{ width: `${[[60, 70, 45], [80, 66, 25]][si]![ki]}%` }" aria-hidden="true" />
                </li>
              </ul>
            </div>
          </div>

          <!-- Reports -->
          <div v-else class="mt-5">
            <ul class="divide-y divide-[color:rgba(3,60,89,0.08)] rounded-[16px] ring-1 ring-[color:rgba(3,60,89,0.08)]">
              <li v-for="r in reports" :key="r" class="flex items-center justify-between gap-3 px-4 py-4">
                <span>
                  <span class="block font-display text-[15px] font-bold text-slateNavy">{{ r }}</span>
                  <span class="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.5)]">Scenario · schedule run · plant · period</span>
                </span>
                <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surfaceNeutral px-3 py-1.5 font-mono text-[10px] font-semibold uppercase text-slateNavy">
                  <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13h10" /></svg>CSV
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
