<script setup lang="ts">
// 09 PLAN VS ACTUAL + EXCEPTION CENTER — "See the issue. Understand the
// cause. Decide what to do next." Left: a plan-vs-actual board — planned
// span as an outline, synced progress as a fill, health badge per
// operation (sample data). Right: the exception feed with severity filter.
// No thresholds, no client values; progress is "synced", never "real-time".
const { execution } = useFast()
const sectionRef = ref<HTMLElement | null>(null)
const sev = ref<string | null>(null)
useFastReveal(sectionRef)

const rows = [
  { ref: 'PRD-1042 · Op 20', plan: [10, 55], actual: [10, 48], health: 'On schedule', exec: 'Running' },
  { ref: 'PRD-1043 · Op 10', plan: [5, 40], actual: [12, 32], health: 'At risk', exec: 'Running' },
  { ref: 'PRD-1047 · Op 10', plan: [30, 60], actual: [38, 38], health: 'Late', exec: 'Not started' },
  { ref: 'PRD-1044 · Op 30', plan: [55, 85], actual: [50, 86], health: 'Ahead', exec: 'Done' }
]
const healthTone: Record<string, string> = {
  'On schedule': 'bg-[color:rgba(3,60,89,0.08)] text-slateNavy',
  'At risk': 'bg-[color:rgba(251,186,0,0.2)] text-[#8A5A00]',
  Late: 'bg-[color:rgba(194,65,45,0.12)] text-[#C2412D]',
  Ahead: 'bg-slateNavy text-pureWhite'
}
const sevTone: Record<string, string> = {
  Critical: 'bg-[#C2412D] text-pureWhite',
  High: 'bg-[#B25E00] text-pureWhite',
  Medium: 'bg-pastiYellow-500 text-slateNavy',
  Low: 'bg-[#3E7A99] text-pureWhite',
  Info: 'bg-[color:rgba(3,60,89,0.12)] text-slateNavy'
}
const feed = computed(() => (sev.value ? execution.feed.filter((f) => f.sev === sev.value) : execution.feed))
</script>

<template>
  <section id="monitoring" ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="09 / 12" class="mb-12 desktop:mb-16" />
      <div><FastHeading :eyebrow="execution.eyebrow" :title="execution.headline" :lede="execution.lede" /></div>

      <div class="mt-14 grid gap-6 desktop:grid-cols-12">
        <!-- Plan vs actual -->
        <div data-fr class="rounded-[24px] bg-surfaceNeutral p-5 tablet:p-7 desktop:col-span-7">
          <div class="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">
            <span>Progress tracking · plan vs actual</span>
            <span class="inline-flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Last sync · sample</span>
          </div>
          <ul class="mt-5 grid gap-4">
            <li v-for="r in rows" :key="r.ref" class="rounded-[14px] bg-pureWhite p-4 ring-1 ring-[color:rgba(3,60,89,0.06)]">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="font-display text-[14px] font-bold text-slateNavy">{{ r.ref }}</span>
                <span class="flex items-center gap-2">
                  <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.55)]">{{ r.exec }}</span>
                  <span class="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase" :class="healthTone[r.health]">{{ r.health }}</span>
                </span>
              </div>
              <div class="relative mt-3 h-6" aria-hidden="true">
                <span class="absolute inset-y-0 rounded-[6px] border-2 border-dashed border-[color:rgba(3,60,89,0.3)]" :style="{ left: `${r.plan[0]}%`, width: `${r.plan[1]! - r.plan[0]!}%` }" />
                <span class="absolute inset-y-1 rounded-[4px]" :class="r.health === 'Late' ? 'bg-[#C2412D]' : r.health === 'At risk' ? 'bg-pastiYellow-500' : 'bg-slateNavy'" :style="{ left: `${r.actual[0]}%`, width: `${Math.max(1.5, r.actual[1]! - r.actual[0]!)}%` }" />
              </div>
            </li>
          </ul>
          <p class="mt-4 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">
            <span class="inline-flex items-center gap-2"><span class="h-2.5 w-5 rounded-[3px] border-2 border-dashed border-[color:rgba(3,60,89,0.3)]" />Planned</span>
            <span class="inline-flex items-center gap-2"><span class="h-2 w-5 rounded-[3px] bg-slateNavy" />Actual</span>
          </p>
          <ul class="mt-6 flex flex-wrap gap-1.5 border-t border-[color:rgba(3,60,89,0.1)] pt-5">
            <li v-for="f in execution.fields" :key="f" class="rounded-full bg-pureWhite px-2.5 py-1 text-[12px] font-medium text-[color:rgba(3,60,89,0.75)] ring-1 ring-[color:rgba(3,60,89,0.08)]">{{ f }}</li>
          </ul>
        </div>

        <!-- Exception Center -->
        <div data-fr class="rounded-[24px] bg-slateNavy p-5 text-pureWhite tablet:p-7 desktop:col-span-5">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">Exception Center</p>
          <div role="group" aria-label="Filter by severity" class="mt-4 flex flex-wrap gap-1.5">
            <button type="button" :aria-pressed="sev === null" class="min-h-9 rounded-full px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="sev === null ? 'bg-pureWhite text-slateNavy' : 'ring-1 ring-[color:rgba(255,255,255,0.2)] text-[color:rgba(255,255,255,0.75)]'" @click="sev = null">All</button>
            <button v-for="s in execution.severity" :key="s.name" type="button" :aria-pressed="sev === s.name" :title="s.body" class="min-h-9 rounded-full px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="sev === s.name ? sevTone[s.name] : 'ring-1 ring-[color:rgba(255,255,255,0.2)] text-[color:rgba(255,255,255,0.75)]'" @click="sev = s.name">{{ s.name }}</button>
          </div>
          <ul class="mt-5 grid gap-2" aria-live="polite">
            <li v-for="f in feed" :key="f.type + f.ref" class="rounded-[14px] bg-[color:rgba(255,255,255,0.06)] p-4 ring-1 ring-[color:rgba(255,255,255,0.1)]">
              <div class="flex items-center justify-between gap-3">
                <span class="rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]" :class="sevTone[f.sev]">{{ f.sev }}</span>
                <span class="font-mono text-[10px] text-[color:rgba(255,255,255,0.55)]">{{ f.ref }}</span>
              </div>
              <p class="mt-2 font-display text-[15px] font-bold">{{ f.type }}</p>
              <p class="mt-0.5 text-[13px] leading-snug text-[color:rgba(255,255,255,0.7)]">{{ f.note }}</p>
            </li>
          </ul>
          <p class="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.45)]">Sample feed</p>
        </div>
      </div>

      <div data-fr class="mt-10">
        <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)] max-desktop:text-center">Exception categories</p>
        <ul class="m-center-row mt-3 flex flex-wrap gap-2">
          <li v-for="c in execution.categories" :key="c" class="rounded-full bg-surfaceNeutral px-3.5 py-2 font-display text-[13px] font-semibold text-slateNavy">{{ c }}</li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>
