<script setup lang="ts">
// 08 SCENARIO SIMULATION & RESCHEDULING — "Test the decision before
// changing the live plan." Pick a scenario; the KPI comparison redraws
// against Active production. Bars are relative and unlabelled on purpose
// (illustrative — no invented figures). The publish gate shows that drafts
// and simulations never reach production until published. Objectives are
// listed as scenario objectives, not "optimization".
const { scenarios } = useFast()
const sectionRef = ref<HTMLElement | null>(null)
const pick = ref(2)
useFastReveal(sectionRef)

// Relative bar lengths per scenario (illustrative only).
const shape = [
  [0.62, 0.7, 0.42, 0.55],
  [0.7, 0.72, 0.34, 0.5],
  [0.82, 0.66, 0.22, 0.38],
  [0.58, 0.8, 0.5, 0.6]
]
</script>

<template>
  <section id="simulation" ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy desktop:-mt-12 desktop:rounded-t-[48px] py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="dark" label="FAST" meta="08 / 12" class="mb-12 desktop:mb-16" />
      <div><FastHeading surface="dark" :eyebrow="scenarios.eyebrow" :title="scenarios.headline" :lede="scenarios.lede" /></div>

      <div class="mt-14 grid gap-6 desktop:grid-cols-12">
        <ul role="group" aria-label="Scenarios" class="grid content-start gap-2 desktop:col-span-4">
          <li v-for="(s, i) in scenarios.list" :key="s.name" data-fr>
            <button
              type="button"
              :aria-pressed="pick === i"
              class="flex w-full items-start justify-between gap-4 rounded-[16px] p-4 text-left ring-1 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
              :class="pick === i ? 'bg-pureWhite text-slateNavy ring-pureWhite' : 'ring-[color:rgba(255,255,255,0.14)] hover:bg-[color:rgba(255,255,255,0.05)]'"
              @click="pick = i"
            >
              <span>
                <span class="block font-display text-[16px] font-bold">{{ s.name }}</span>
                <span class="mt-0.5 block text-[13px] leading-snug" :class="pick === i ? 'text-[color:rgba(3,60,89,0.65)]' : 'text-[color:rgba(255,255,255,0.6)]'">{{ s.body }}</span>
              </span>
              <span class="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em]" :class="s.status === 'Active' ? 'bg-pastiYellow-500 text-slateNavy' : pick === i ? 'bg-surfaceNeutral text-slateNavy' : 'bg-[color:rgba(255,255,255,0.1)] text-[color:rgba(255,255,255,0.75)]'">{{ s.status }}</span>
            </button>
          </li>
        </ul>

        <!-- Comparison -->
        <div data-fr class="rounded-[24px] bg-[color:rgba(255,255,255,0.05)] p-6 ring-1 ring-[color:rgba(255,255,255,0.12)] tablet:p-8 desktop:col-span-8">
          <div class="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">
            <span>KPI comparison · {{ scenarios.list[pick]!.name }} vs Active production</span>
            <span>Illustrative</span>
          </div>
          <ul class="mt-6 grid gap-5">
            <li v-for="(k, ki) in scenarios.kpis" :key="k">
              <p class="font-display text-[14px] font-semibold">{{ k }}</p>
              <div class="mt-2 grid gap-1.5">
                <span class="block h-2.5 rounded-full bg-[color:rgba(255,255,255,0.22)]" :style="{ width: `${shape[0]![ki]! * 100}%` }" aria-hidden="true" />
                <span class="block h-2.5 rounded-full bg-pastiYellow-500 transition-[width] duration-700 ease-editorial" :style="{ width: `${shape[pick]![ki]! * 100}%` }" aria-hidden="true" />
              </div>
            </li>
          </ul>
          <p class="mt-5 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.6)]">
            <span class="inline-flex items-center gap-2"><span class="h-2 w-4 rounded-full bg-[color:rgba(255,255,255,0.22)]" />Active production</span>
            <span class="inline-flex items-center gap-2"><span class="h-2 w-4 rounded-full bg-pastiYellow-500" />{{ scenarios.list[pick]!.name }}</span>
          </p>

          <!-- Publish gate -->
          <div class="mt-8 flex flex-wrap items-center gap-3 border-t border-[color:rgba(255,255,255,0.12)] pt-6 font-display text-[13px] font-semibold">
            <span class="rounded-full bg-[color:rgba(255,255,255,0.1)] px-3 py-1.5">Draft / simulation</span>
            <svg viewBox="0 0 24 8" class="h-2 w-8 text-[color:rgba(255,255,255,0.4)]" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M0 4h22M18 1l4 3-4 3" /></svg>
            <span class="rounded-full border border-dashed border-pastiYellow-500 px-3 py-1.5 text-pastiYellow-500">Publish</span>
            <svg viewBox="0 0 24 8" class="h-2 w-8 text-[color:rgba(255,255,255,0.4)]" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M0 4h22M18 1l4 3-4 3" /></svg>
            <span class="rounded-full bg-pastiYellow-500 px-3 py-1.5 text-slateNavy">Active production</span>
          </div>
        </div>
      </div>

      <div data-fr class="mt-12">
        <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)] max-desktop:text-center">Scenario objectives</p>
        <ul class="m-center-row mt-4 flex flex-wrap gap-2">
          <li v-for="o in scenarios.objectives" :key="o" class="rounded-full px-3.5 py-2 font-display text-[13px] font-semibold ring-1 ring-[color:rgba(255,255,255,0.18)]">{{ o }}</li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>
