<script setup lang="ts">
// 11 INTEGRATION & IMPLEMENTATION — the ERP interface as an exchange of
// inventory transactions between two systems, wrapped in interface
// controls (validation, error log, retry, idempotency, reconciliation,
// migration) — scoped by blueprint, never "out of the box" (§11, §13).
// Below, the five conceptual implementation phases with the source's
// caveat that they are not a contractual schedule. No RFID, offline
// mobile, handover or duration claims.
const { integration } = useMatrix()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useMatrixReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px]">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="11" name="Integration" surface="dark" class="mb-12 desktop:mb-16" />
      <MatrixHeading surface="dark" :eyebrow="integration.eyebrow" :title="integration.headline" :lede="integration.lede" />

      <!-- Exchange -->
      <div data-fr class="mt-14 grid items-stretch gap-3 desktop:grid-cols-[1fr_1.6fr_1fr]">
        <div class="grid place-items-center rounded-[22px] bg-[color:rgba(255,255,255,0.06)] p-6 text-center ring-1 ring-[color:rgba(255,255,255,0.12)]">
          <div>
            <p class="font-display text-[22px] font-extrabold">Your ERP</p>
            <p class="mt-1 text-[13px] text-[color:rgba(255,255,255,0.65)]">Master data, purchasing, finance</p>
          </div>
        </div>
        <div class="rounded-[22px] border border-dashed border-[color:rgba(255,255,255,0.25)] p-5">
          <p class="text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">Inventory transactions · agreed data contract</p>
          <ul class="mt-4 grid grid-cols-2 gap-2 tablet:grid-cols-3">
            <li v-for="t in integration.transactions" :key="t" class="inline-flex items-center gap-2 rounded-[12px] bg-[color:rgba(255,255,255,0.06)] px-3 py-2.5 text-[13px] font-semibold">
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0 text-pastiYellow-500" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 5.5h11M10 2.5l3 3-3 3M14 10.5H3M6 7.5l-3 3 3 3" /></svg>{{ t }}
            </li>
          </ul>
          <ul class="mt-4 flex flex-wrap justify-center gap-1.5" aria-label="Interface controls">
            <li v-for="c in integration.controls" :key="c" class="rounded-full border border-[color:rgba(255,255,255,0.18)] px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.8)]">{{ c }}</li>
          </ul>
        </div>
        <div class="grid place-items-center rounded-[22px] bg-pureWhite p-6 text-center text-slateNavy">
          <div>
            <MatrixMark :size="24" />
            <p class="mt-2 text-[13px] text-[color:rgba(3,60,89,0.65)]">Material & warehouse operations</p>
          </div>
        </div>
      </div>
      <p data-fr="fade" class="m-center mt-4 text-[13.5px] leading-relaxed text-[color:rgba(255,255,255,0.65)] desktop:max-w-[80ch]">{{ integration.note }}</p>

      <!-- Implementation path -->
      <div class="mt-16">
        <p data-fr="fade" class="m-center font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">Implementation approach</p>
        <ol class="mt-5 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-5">
          <li v-for="(p, i) in integration.phases" :key="p.name" class="rounded-[18px] bg-[color:rgba(255,255,255,0.05)] p-5 ring-1 ring-[color:rgba(255,255,255,0.1)]">
            <div data-fr>
              <span class="font-mono text-[11px] tabular-nums text-pastiYellow-400">{{ pad(i + 1) }}</span>
              <span class="mt-1 block font-display text-[17px] font-bold">{{ p.name }}</span>
              <span class="mt-1.5 block text-[13px] leading-snug text-[color:rgba(255,255,255,0.68)]">{{ p.body }}</span>
            </div>
          </li>
        </ol>
        <p data-fr="fade" class="m-center mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">A conceptual framework, not a contractual schedule · duration and deliverables follow the agreed scope</p>
      </div>
    </BaseContainer>
  </section>
</template>
