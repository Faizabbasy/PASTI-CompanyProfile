<script setup lang="ts">
// 09 WAREHOUSE EXPLORER — "Know where material is. Know whether it belongs
// there." A reconstructed zone plan of a synthetic "Central Warehouse"
// (§10): each zone shows occupancy, capacity and its storage restriction
// (pattern + text label, never colour alone). Select a zone — from the
// plan or the hierarchy list — to see what it holds and the restriction
// check. Below tablet the plan is not shrunk: the hierarchy list becomes
// the navigation and the selected zone's card follows it.
const { explorer } = useMatrixPage()
const sectionRef = ref<HTMLElement | null>(null)
const picked = ref('valve')
const zone = computed(() => explorer.zones.find((z) => z.id === picked.value)!)
useMatrixReveal(sectionRef)

const fill: Record<string, string> = {
  standard: 'bg-[color:rgba(3,60,89,0.1)]',
  controlled: 'mx-dots',
  hazardous: 'mx-warn',
  quarantine: 'mx-hatch'
}
</script>

<template>
  <section id="warehouse" ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="9" name="Warehouse explorer" surface="light" class="mb-12 desktop:mb-16" />
      <MatrixHeading :eyebrow="explorer.eyebrow" :title="explorer.headline" :lede="explorer.lede" />

      <div data-fr class="mt-12 grid gap-4 desktop:grid-cols-12 desktop:gap-6">
        <!-- Hierarchy -->
        <div class="rounded-[22px] bg-surfaceNeutral p-4 ring-1 ring-[color:rgba(3,60,89,0.08)] desktop:col-span-3">
          <p class="px-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">Hierarchy</p>
          <p class="mt-3 px-2 font-display text-[14px] font-bold text-slateNavy">{{ explorer.warehouse }}</p>
          <ul class="mt-1.5 grid gap-0.5">
            <li v-for="z in explorer.zones" :key="z.id">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13.5px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
                :class="picked === z.id ? 'bg-slateNavy font-semibold text-pureWhite' : 'text-slateNavy hover:bg-pureWhite'"
                :aria-pressed="picked === z.id"
                aria-controls="mxx-detail"
                @click="picked = z.id"
              >
                <span class="truncate">{{ z.name }}</span>
                <span class="shrink-0 font-mono text-[11px] tabular-nums" :class="picked === z.id ? 'text-pastiYellow-400' : 'text-[color:rgba(3,60,89,0.55)]'">{{ z.used }}%</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Plan (tablet+) -->
        <div class="hidden rounded-[22px] bg-surfaceNeutral p-4 ring-1 ring-[color:rgba(3,60,89,0.08)] tablet:block desktop:col-span-6" aria-hidden="true">
          <p class="flex items-center justify-between px-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]"><span>Zone plan</span><span>Illustrative</span></p>
          <div class="mx-plan mt-3 grid h-[340px] gap-2">
            <button
              v-for="z in explorer.zones"
              :key="z.id"
              type="button"
              tabindex="-1"
              class="relative overflow-hidden rounded-[12px] bg-pureWhite p-2.5 text-left ring-1 transition-shadow duration-300"
              :class="picked === z.id ? 'ring-2 ring-slateNavy shadow-[0_12px_30px_-16px_rgba(3,60,89,0.6)]' : 'ring-[color:rgba(3,60,89,0.1)] hover:ring-[color:rgba(3,60,89,0.35)]'"
              :style="{ gridArea: z.area }"
              @click="picked = z.id"
            >
              <span class="absolute inset-y-0 left-0 transition-transform duration-700 ease-editorial" :class="fill[z.restriction]" :style="{ width: `${z.used}%` }" />
              <span class="relative inline-block rounded-[6px] bg-[color:rgba(255,255,255,0.9)] px-1.5 py-1">
                <span class="block font-display text-[12.5px] font-bold leading-tight text-slateNavy">{{ z.name }}</span>
                <span class="mt-0.5 block font-mono text-[10.5px] text-[color:rgba(3,60,89,0.75)]">{{ z.used }}% used</span>
              </span>
            </button>
          </div>
          <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 px-1">
            <li v-for="(label, key) in explorer.restrictions" :key="key" class="inline-flex items-center gap-1.5 text-[11.5px] text-[color:rgba(3,60,89,0.75)]">
              <span class="h-3 w-3 rounded-[3px] ring-1 ring-[color:rgba(3,60,89,0.15)]" :class="fill[key]" />{{ label }}
            </li>
          </ul>
        </div>

        <!-- Selected location -->
        <div id="mxx-detail" class="rounded-[22px] bg-slateNavy p-5 text-pureWhite desktop:col-span-3" aria-live="polite">
          <p class="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.6)]">Selected location</p>
          <p class="mt-2 font-display text-[20px] font-bold leading-tight">{{ zone.name }}</p>
          <p class="mt-0.5 font-mono text-[11px] text-[color:rgba(255,255,255,0.6)]">{{ explorer.warehouse }} / {{ zone.name }}</p>
          <div class="mt-4">
            <div class="flex items-baseline justify-between text-[12.5px]"><span class="text-[color:rgba(255,255,255,0.65)]">Occupancy</span><strong class="font-display text-[16px] tabular-nums">{{ zone.used }}%</strong></div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:rgba(255,255,255,0.12)]"><span class="block h-full origin-left rounded-full bg-pastiYellow-500 transition-transform duration-500" :style="{ transform: `scaleX(${zone.used / 100})` }" /></div>
          </div>
          <dl class="mt-4 grid gap-3 text-[13px]">
            <div><dt class="text-[color:rgba(255,255,255,0.6)]">Capacity</dt><dd class="font-semibold">{{ zone.capacity }}</dd></div>
            <div><dt class="text-[color:rgba(255,255,255,0.6)]">Restriction</dt><dd class="font-semibold">{{ explorer.restrictions[zone.restriction] }}</dd></div>
            <div><dt class="text-[color:rgba(255,255,255,0.6)]">Material held</dt><dd class="font-semibold leading-snug">{{ zone.held }}</dd></div>
          </dl>
          <p class="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:rgba(255,255,255,0.08)] px-3 py-1.5 text-[12px] font-semibold">
            <svg viewBox="0 0 12 12" class="h-3 w-3 text-pastiYellow-500" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Putaway checks capacity and restriction
          </p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mx-plan {
  grid-template-columns: 1.1fr 1.2fr 1fr;
  grid-template-rows: 1fr 0.8fr 1fr;
  grid-template-areas:
    'recv valve rot'
    'quar valve inst'
    'haz gen inst';
}
.mx-dots {
  background-color: rgba(62, 122, 153, 0.12);
  background-image: radial-gradient(rgba(62, 122, 153, 0.45) 1px, transparent 1.2px);
  background-size: 6px 6px;
}
.mx-warn {
  background: repeating-linear-gradient(45deg, rgba(251, 186, 0, 0.35) 0 5px, rgba(251, 186, 0, 0.12) 5px 10px);
}
.mx-hatch {
  background: repeating-linear-gradient(135deg, rgba(143, 169, 184, 0.55) 0 4px, rgba(201, 214, 222, 0.5) 4px 8px);
}
</style>
