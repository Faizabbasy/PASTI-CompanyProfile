<script setup lang="ts">
// 07 AGING, SURPLUS & DEADSTOCK — an age-band ruler that filters a list of
// surplus candidates (synthetic). Movement classes are labelled; one item
// is protected by the criticality guard and cannot enter disposal review —
// old or non-moving never means automatically disposable (§7). A
// disposition-evidence card shows what every decision keeps.
const { aging } = useMatrix()
const sectionRef = ref<HTMLElement | null>(null)
const band = ref<number | null>(null)
const rows = computed(() => (band.value === null ? aging.items : aging.items.filter((i) => i.band === band.value)))
const counts = aging.bands.map((_, b) => aging.items.filter((i) => i.band === b).length)
useMatrixReveal(sectionRef)

const clsTone: Record<string, string> = {
  'Slow-moving': 'bg-[color:rgba(251,186,0,0.18)] text-[#7A5200]',
  'Non-moving': 'bg-[color:rgba(3,60,89,0.08)] text-slateNavy',
  Deadstock: 'bg-[color:rgba(194,65,45,0.1)] text-[#9E3322]'
}
</script>

<template>
  <section ref="sectionRef" class="relative bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="top" />
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="7" name="Aging & surplus" surface="light" class="mb-12 desktop:mb-16" />
      <MatrixHeading :eyebrow="aging.eyebrow" :title="aging.headline" :lede="aging.lede" />

      <div class="mt-12 grid gap-4 desktop:grid-cols-12 desktop:gap-6">
        <div data-fr class="min-w-0 rounded-[22px] bg-pureWhite p-5 ring-1 ring-[color:rgba(3,60,89,0.08)] tablet:p-6 desktop:col-span-8">
          <!-- Age-band ruler (filter) -->
          <div role="group" aria-label="Filter by age band" class="grid grid-cols-2 gap-1.5 tablet:grid-cols-4">
            <button
              v-for="(b, i) in aging.bands"
              :key="b"
              type="button"
              class="rounded-[12px] px-3 py-2.5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
              :class="band === i ? 'bg-slateNavy text-pureWhite' : 'bg-surfaceNeutral text-slateNavy hover:bg-[color:rgba(3,60,89,0.07)]'"
              :aria-pressed="band === i"
              @click="band = band === i ? null : i"
            >
              <span class="block font-display text-[13.5px] font-bold">{{ b }}</span>
              <span class="mt-0.5 block font-mono text-[10.5px]" :class="band === i ? 'text-[color:rgba(255,255,255,0.7)]' : 'text-[color:rgba(3,60,89,0.55)]'">{{ counts[i] }} candidate{{ counts[i] === 1 ? '' : 's' }}</span>
              <span aria-hidden="true" class="mt-2 block h-1 rounded-full" :class="band === i ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.12)]'" :style="{ opacity: 0.45 + i * 0.18 }" />
            </button>
          </div>

          <p class="mt-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]" aria-live="polite">{{ rows.length }} surplus candidate{{ rows.length === 1 ? '' : 's' }}{{ band === null ? ' · all bands' : ` · ${aging.bands[band]}` }}</p>
          <ul class="mt-2 divide-y divide-[color:rgba(3,60,89,0.08)]">
            <li v-for="r in rows" :key="r.code" class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3.5 tablet:grid-cols-[1.6fr_0.8fr_0.7fr_1.2fr]">
              <span class="min-w-0">
                <span class="block font-mono text-[11px] text-[color:rgba(3,60,89,0.55)]">{{ r.code }}</span>
                <span class="block font-display text-[15px] font-bold text-slateNavy">{{ r.name }}</span>
              </span>
              <span class="justify-self-end rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] tablet:justify-self-start" :class="clsTone[r.cls]">{{ r.cls }}</span>
              <!-- Phones: age + review state share one full-width line; tablet+: own columns. -->
              <span class="col-span-2 flex items-center justify-between gap-3 tablet:contents">
              <span class="font-mono text-[12px] tabular-nums text-[color:rgba(3,60,89,0.7)]">{{ r.age }} days</span>
              <span v-if="r.guarded" class="inline-flex items-center gap-1.5 justify-self-end text-[12.5px] font-semibold text-slateNavy tablet:justify-self-start">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
                Guarded · critical spare
              </span>
              <span v-else class="justify-self-end text-[12.5px] text-[color:rgba(3,60,89,0.6)] tablet:justify-self-start">Eligible for disposition review</span>
              </span>
            </li>
            <li v-if="!rows.length" class="py-6 text-center text-[14px] text-[color:rgba(3,60,89,0.6)]">No candidates in this band.</li>
          </ul>
          <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.45)]">Synthetic records · illustrative ages</p>
        </div>

        <!-- Disposition evidence -->
        <div data-fr class="rounded-[22px] bg-slateNavy p-6 text-pureWhite desktop:col-span-4">
          <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">Disposition evidence</p>
          <p class="mt-2 font-display text-[18px] font-bold">MTX-0218 · Mechanical seal kit</p>
          <ol class="mt-5 grid gap-3">
            <li v-for="(e, i) in aging.evidence" :key="e.label" class="grid grid-cols-[1.5rem_1fr] gap-3">
              <span class="grid h-6 w-6 place-items-center rounded-full font-mono text-[10px] font-semibold" :class="i < 3 ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(255,255,255,0.12)] text-pureWhite'">{{ i + 1 }}</span>
              <span>
                <span class="block text-[12px] text-[color:rgba(255,255,255,0.6)]">{{ e.label }}</span>
                <span class="block text-[14px] font-semibold">{{ e.value }}</span>
              </span>
            </li>
          </ol>
          <p class="mt-6 border-t border-[color:rgba(255,255,255,0.12)] pt-4 text-[13px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">Age alone never disposes of material. A person decides, with the reason and approver kept on record.</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
