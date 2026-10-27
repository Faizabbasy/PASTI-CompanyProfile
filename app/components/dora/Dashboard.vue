<script setup lang="ts">
// 08 OPERATIONAL DASHBOARD — the six widgets the blueprint names (F-02,
// §11), rebuilt with neutral illustrative values (owner D4 — never the
// source's demo figures, no KPI formulas, no SLA). The 14-day line draws
// itself when in view (stroke-dashoffset, once); figures rise out of a
// mask, no count-up. Reduced motion: drawn, static. Lite devices (phones,
// html[data-lite]): no per-frame line drawing — the finished chart fades in
// once (opacity is composited; stroke-dashoffset repaints every frame).
const { dashboard } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const chartRef = ref<SVGSVGElement | null>(null)
const drawn = ref(false)
const lite = ref(false)
useFastReveal(sectionRef)

const W = 560
const H = 170
const max = Math.max(...dashboard.volume)
const pts = dashboard.volume.map((v, i) => [(i / (dashboard.volume.length - 1)) * W, H - (v / max) * (H - 18) - 6] as const)
const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
const area = `${line} L${W} ${H} L0 ${H} Z`

let stop = () => {}
onMounted(() => {
  lite.value = document.documentElement.dataset.lite === 'true'
  if (window.matchMedia(reducedMotionQuery.reduce).matches || !chartRef.value) {
    drawn.value = true
    return
  }
  stop = onceInView(chartRef.value, () => (drawn.value = true))
})
onBeforeUnmount(() => stop())

const card = 'rounded-[18px] bg-[color:rgba(255,255,255,0.05)] p-4 ring-1 ring-[color:rgba(255,255,255,0.09)] tablet:p-5'
const label = 'font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]'
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px]">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="DORA" meta="08 / 13" class="mb-12 desktop:mb-16" />
      <div class="grid gap-8 desktop:grid-cols-12 desktop:items-end desktop:gap-10">
        <div class="desktop:col-span-7"><DoraHeading surface="dark" :eyebrow="dashboard.eyebrow" :title="dashboard.headline" :lede="dashboard.lede" /></div>
        <ul data-fr="fade" class="m-center-row hidden flex-wrap gap-2 tablet:flex desktop:col-span-5 desktop:justify-end">
          <li v-for="(w, i) in dashboard.widgets" :key="i" class="inline-flex items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.16)] px-3 py-1.5 font-display text-[12px] font-semibold text-[color:rgba(255,255,255,0.85)]">
            <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-doraCyan" />{{ w }}
          </li>
        </ul>
      </div>

      <div class="mt-10 grid gap-3 tablet:mt-12 tablet:grid-cols-3">
        <div data-fr :class="card">
          <p :class="label">{{ t('Processed documents') }}</p>
          <p class="mt-3 flex items-baseline gap-2"><span class="font-display text-[32px] font-extrabold leading-none tablet:text-[40px]">{{ dashboard.processed.docs }}</span><span class="text-[14px] text-[color:rgba(255,255,255,0.65)]">{{ dashboard.processed.pages }}</span></p>
        </div>
        <div data-fr :class="card">
          <p :class="label">{{ t('Waiting verification') }}</p>
          <p class="mt-3 flex items-baseline gap-2"><span class="font-display text-[32px] font-extrabold leading-none tablet:text-[40px] text-doraCyan">{{ dashboard.waiting.docs }}</span><span class="text-[14px] text-[color:rgba(255,255,255,0.65)]">{{ dashboard.waiting.split }}</span></p>
        </div>
        <div data-fr :class="card">
          <p :class="label">{{ t('Quality') }}</p>
          <p class="mt-3 flex items-baseline gap-2"><span class="font-display text-[32px] font-extrabold leading-none tablet:text-[40px]">{{ dashboard.quality.value }}</span><span class="text-[14px] text-[color:rgba(255,255,255,0.65)]">{{ dashboard.quality.label }}</span></p>
        </div>
      </div>

      <div class="mt-3 grid gap-3 desktop:grid-cols-3">
        <figure data-fr class="desktop:col-span-2" :class="card">
          <figcaption :class="label">{{ t('14-day volume · documents per day') }}</figcaption>
          <svg ref="chartRef" :viewBox="`0 -4 ${W} ${H + 8}`" class="mt-4 h-auto w-full overflow-visible" :class="lite ? ['dd-lite', drawn ? 'opacity-100' : 'opacity-0'] : ''" role="img" :aria-label="t('Illustrative 14-day volume, between {min} and {max} documents per day.', { min: Math.min(...dashboard.volume), max })">
            <g aria-hidden="true">
              <line v-for="g in 4" :key="g" x1="0" :x2="W" :y1="(H / 4) * (g - 1) + 6" :y2="(H / 4) * (g - 1) + 6" stroke="rgba(255,255,255,0.08)" />
              <path :d="area" fill="rgba(31,214,238,0.12)" class="transition-opacity duration-1000" :class="drawn ? 'opacity-100' : 'opacity-0'" />
              <path :d="line" pathLength="1" fill="none" stroke="#1FD6EE" stroke-width="2.2" stroke-linejoin="round" class="dd-line" :class="drawn ? 'is-drawn' : ''" />
              <circle v-for="(p, i) in pts" :key="i" :cx="p[0]" :cy="p[1]" r="3" fill="#033C59" stroke="#1FD6EE" stroke-width="1.6" class="transition-opacity duration-500" :class="drawn ? 'opacity-100' : 'opacity-0'" :style="{ transitionDelay: `${300 + i * 60}ms` }" />
            </g>
          </svg>
        </figure>
        <div data-fr :class="card">
          <p :class="label">{{ t('Needs attention') }}</p>
          <div class="mt-4 rounded-[12px] border-l-[3px] border-doraCyan bg-[color:rgba(31,214,238,0.08)] px-4 py-3">
            <p class="font-display text-[15px] font-bold text-doraCyan">{{ t('{n} documents waiting verification', { n: dashboard.waiting.docs }) }}</p>
            <p class="mt-0.5 text-[13px] text-[color:rgba(255,255,255,0.7)]">{{ t('Open the verification queue') }}</p>
          </div>
        </div>
      </div>

      <div data-fr class="mt-3" :class="card">
        <p :class="label">{{ t('Recent documents') }}</p>
        <ul class="mt-3 divide-y divide-[color:rgba(255,255,255,0.08)]">
          <li v-for="r in dashboard.recent" :key="r.file" class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 tablet:grid-cols-[1.4fr_1fr_1.2fr_auto] tablet:gap-4">
            <span class="truncate font-display text-[14px] font-bold">{{ r.file }}</span>
            <span class="inline-flex items-center gap-2 justify-self-end text-[12.5px] font-semibold tablet:order-3 tablet:justify-self-start tablet:text-[13px]" :class="r.status === 'Verified' ? 'text-pastiYellow-400' : 'text-doraCyan'"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" :class="r.status === 'Verified' ? 'bg-pastiYellow-500' : 'bg-doraCyan'" />{{ r.status === 'Waiting verification' ? t('Waiting') : t(r.status) }}</span>
            <span class="text-[12.5px] text-[color:rgba(255,255,255,0.6)] tablet:order-2 tablet:text-[13px]">{{ t(r.type) }}<span class="tablet:hidden"> · {{ r.pages }} {{ r.pages === 1 ? t('page') : t('pages') }}</span></span>
            <span class="hidden font-mono text-[11px] tabular-nums text-[color:rgba(255,255,255,0.55)] tablet:order-4 tablet:block">{{ r.pages }} {{ r.pages === 1 ? t('page') : t('pages') }}</span>
          </li>
        </ul>
      </div>
      <p data-fr="fade" class="m-center mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">{{ t('Illustrative values') }} · {{ dashboard.note }}</p>
    </BaseContainer>
  </section>
</template>

<style scoped>
.dd-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.dd-line.is-drawn {
  stroke-dashoffset: 0;
}
.dd-lite {
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.dd-lite .dd-line {
  stroke-dasharray: none;
  transition: none;
}
.dd-lite :deep(*) {
  transition: none !important;
}
</style>
