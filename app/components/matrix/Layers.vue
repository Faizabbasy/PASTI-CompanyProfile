<script setup lang="ts">
// 03 WHAT MATRIX IS — the three connected layers from the source (§3):
// Material Intelligence, Warehouse Execution, Governance & Control — each
// with its scope and the operational output it produces — drawn as one
// rack with three levels (one model, not three modules). Below, the conceptual
// work cycle and the control principle about inspection and availability.
const { layers } = useMatrixPage()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useMatrixReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="relative bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="top" />
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="3" name="What MATRIX is" surface="light" class="mb-12 desktop:mb-16" />
      <MatrixHeading :eyebrow="layers.eyebrow" :title="layers.headline" :lede="layers.lede" />

      <!-- One rack, three levels: two perforated uprights, a beam under
           each shelf, level tags on the left upright. Scope items sit on
           the shelf as square-cornered "boxes", not pills. -->
      <div class="mxl-rack relative mt-14 px-4 tablet:px-6">
        <span aria-hidden="true" class="mxl-upright absolute inset-y-0 left-0 w-2.5 rounded-[3px] tablet:w-3.5" />
        <span aria-hidden="true" class="mxl-upright absolute inset-y-0 right-0 w-2.5 rounded-[3px] tablet:w-3.5" />
        <ol class="grid gap-7 py-2">
          <li v-for="(l, i) in layers.items" :key="i" class="relative">
            <div data-fr class="grid gap-5 rounded-t-[14px] p-5 tablet:p-7 desktop:grid-cols-12 desktop:items-end desktop:gap-8" :class="i === 1 ? 'bg-slateNavy text-pureWhite' : 'bg-pureWhite text-slateNavy'">
              <div class="desktop:col-span-4">
                <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]" :class="i === 1 ? 'text-pastiYellow-400' : 'text-[color:rgba(3,60,89,0.5)]'">Level {{ pad(i + 1) }}</p>
                <h3 class="mt-1 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em]" :class="i === 1 ? 'text-pureWhite' : 'text-slateNavy'">{{ l.name }}</h3>
                <p class="mt-2 text-[14px] leading-snug" :class="i === 1 ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.68)]'">{{ l.out }}</p>
              </div>
              <ul class="flex flex-wrap items-end gap-1.5 desktop:col-span-8">
                <li v-for="(s, si) in l.scope" :key="si" class="rounded-[6px] px-3 py-2 font-display text-[13px] font-semibold" :class="i === 1 ? 'bg-[color:rgba(255,255,255,0.1)] text-pureWhite' : 'bg-surfaceNeutral text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.12)]'">{{ s }}</li>
              </ul>
            </div>
            <!-- Shelf beam -->
            <span aria-hidden="true" class="block h-2.5 rounded-b-[3px]" :class="i === 0 ? 'bg-pastiYellow-500' : 'bg-slateNavy'" />
          </li>
        </ol>
      </div>

      <!-- Work cycle -->
      <div data-fr class="mt-14">
        <p class="m-center font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">The work cycle</p>
        <ol class="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 max-desktop:justify-center">
          <template v-for="(c, i) in layers.cycle" :key="i">
            <li class="rounded-[6px] bg-pureWhite px-3.5 py-2 font-display text-[13px] font-bold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.12)]">{{ c }}</li>
            <li v-if="i < layers.cycle.length - 1" aria-hidden="true" class="text-[color:rgba(3,60,89,0.35)]">
              <svg viewBox="0 0 12 12" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6h7M6.5 3 9.5 6l-3 3" /></svg>
            </li>
          </template>
        </ol>
        <p class="m-center mt-6 flex max-w-[70ch] gap-3 rounded-[14px] bg-pureWhite p-4 text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.75)] ring-1 ring-[color:rgba(3,60,89,0.1)] max-desktop:mx-auto max-desktop:text-left">
          <svg viewBox="0 0 16 16" class="mt-0.5 h-4 w-4 shrink-0 text-slateNavy" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
          {{ layers.principle }}
        </p>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mxl-upright {
  background-color: #033c59;
  background-image: radial-gradient(circle, #f8fafc 1.4px, transparent 1.6px);
  background-size: 100% 14px;
  background-position: center 4px;
}
</style>
