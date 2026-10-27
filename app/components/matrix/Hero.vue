<script setup lang="ts">
import gsap from 'gsap'
import type { StockKey } from '~/composables/useMatrix'

// 01 HERO — MATRIX's own composition (owner 2026-10-20: "terasa Awwwards,
// beda dari yang lain"). No mock-UI card, no outline watermark: an
// editorial, full-width type block and the page Signal at full scale — one
// giant stock bar. On entry "14 ON HAND" resolves into net available,
// reserved, quarantine and damaged (big numerals in their segments), then
// the requirement line drops in and the shortfall bracket appears.
// Segments are real buttons: hover / focus explains each state in the
// line below. The bar keeps its height in every state (no layout shift).
// Mobile: same bar, labels move under it. Reduced motion: final state.
// Synthetic, illustrative data.
const { hero, sample, intelligence } = useMatrixPage()
const t = useT()
const scrollTo = useFastScroll()
const stageRef = ref<HTMLElement | null>(null)
const step = ref(0)
const hover = ref<StockKey | null>(null)
let timers: ReturnType<typeof setTimeout>[] = []

const mix = sample.mix
const net = netAvailable(mix)
const req = mix.requirement ?? 0
const short = Math.max(0, req - net)
const scale = Math.max(mix.onHand, req)
const pct = (n: number) => (n / scale) * 100
const segs: { key: StockKey; label: string; qty: number; left: number; width: number; i: number }[] = (() => {
  const order: { key: StockKey; label: string; qty: number }[] = [
    { key: 'net', label: t('Net available'), qty: net },
    { key: 'reserved', label: t('Reserved'), qty: mix.reserved },
    { key: 'quarantine', label: t('Quarantine'), qty: mix.quarantine },
    { key: 'damaged', label: t('Damaged'), qty: mix.damaged }
  ]
  let left = 0
  return order.map((s, i) => {
    const o = { ...s, left: pct(left), width: pct(s.qty), i }
    left += s.qty
    return o
  })
})()
const defs = Object.fromEntries(intelligence.states.filter((s) => ['net', 'reserved', 'quarantine', 'damaged'].includes(s.id)).map((s) => [s.id, s.body])) as Record<StockKey, string>

onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches) {
    step.value = 2
    return
  }
  timers = [setTimeout(() => (step.value = 1), 1700), setTimeout(() => (step.value = 2), 2900)]
})
onBeforeUnmount(() => timers.forEach(clearTimeout))

useGsapContext(() => {
  const stage = stageRef.value
  if (!stage) return
  const fades = stage.querySelectorAll<HTMLElement>('[data-mx-fade]')
  const lines = stage.querySelectorAll<HTMLElement>('[data-mx-line]')
  const bar = stage.querySelector<HTMLElement>('[data-mx-bar]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(fades, { autoAlpha: 0 })
    gsap.set(lines, { yPercent: 105 })
    gsap.set(bar, { clipPath: 'inset(0% 100% 0% 0% round 18px)' })
    const tl = gsap.timeline({ delay: 0.15 })
    tl.to(lines, { yPercent: 0, duration: motionTier.cinematicMin + 0.15, ease: approvedEase.gsapPrimary, stagger: 0.12 })
      .to(bar, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.45)
      .to(fades, { autoAlpha: 1, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.06 }, 0.6)
    return () => tl.kill()
  })
})

const caption = computed(() => {
  if (hover.value) return `${segs.find((s) => s.key === hover.value)!.label} — ${defs[hover.value]}`
  if (step.value >= 2) return t('Net available is {n} {unit} short of the near-term requirement. Review the shortage before issuing.', { n: short, unit: sample.unit })
  if (step.value === 1) return t('Separating what is held from what can be used…')
  return t('{n} {unit} on hand across {loc} locations.', { n: mix.onHand, unit: sample.unit, loc: sample.locations.length })
})
</script>

<template>
  <section id="overview" ref="stageRef" class="relative isolate overflow-hidden bg-surfaceNeutral pb-16 pt-28 desktop:flex desktop:min-h-[100svh] desktop:flex-col desktop:justify-center desktop:pb-14 desktop:pt-32">
    <BaseGridLines tone="light" />
    <div aria-hidden="true" class="mx-rack pointer-events-none absolute inset-0" />

    <BaseContainer class="relative z-10 w-full">
      <!-- Top meta row -->
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 max-desktop:justify-center">
        <div data-mx-fade><BaseHeroMarker surface="light" :label="hero.eyebrow" :meta="t('by PASTI Technology')" /></div>
        <p data-mx-fade data-mx-bin data-mx-code="A-01" :data-mx-name="t('Overview')" class="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.6)] tablet:inline-flex">
          <span class="rounded-[6px] bg-pureWhite px-2 py-1 font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.14)]">A-01</span>
          {{ sample.code }} · {{ sample.warehouse }} / {{ sample.zone }} / {{ sample.bin }}
        </p>
      </div>

      <div class="m-center mt-10 desktop:mt-8">
        <div class="xl:flex xl:items-center xl:justify-between xl:gap-8">
          <p data-mx-fade class="inline-flex flex-wrap items-baseline gap-x-4 gap-y-2 max-desktop:justify-center">
            <MatrixMark :size="30" />
            <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.62)]">{{ hero.full }}</span>
          </p>
          <!-- ≥1280: CTAs sit up here so they are visible above the fold. -->
          <div data-mx-fade class="hidden xl:block">
            <BaseHeroCtas surface="light" :primary="{ label: t('Request a Demo') }" :secondary="{ label: t('Explore MATRIX'), down: true }" @primary="scrollTo('demo')" @secondary="scrollTo('intelligence')" />
          </div>
        </div>
        <h1 class="mx-h1 mt-6 font-display font-extrabold text-slateNavy" :aria-label="`${t('Material certainty')} ${t('is')} ${t('operational certainty')}.`">
          <span aria-hidden="true" class="block overflow-hidden pb-[0.06em]"><span data-mx-line class="block">{{ t('Material certainty') }}</span></span>
          <span aria-hidden="true" class="block overflow-hidden pb-[0.06em]"><span data-mx-line class="block">{{ t('is') }} <span class="mx-hl">{{ t('operational certainty') }}</span><span class="text-pastiYellow-500">.</span></span></span>
        </h1>
      </div>

      <!-- The giant stock bar -->
      <figure class="mt-12 desktop:mt-10">
        <figcaption data-mx-fade class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.6)]">
          <span><strong class="text-slateNavy">{{ sample.name }}</strong> · {{ t('stock balance in {unit}', { unit: sample.unit }) }}</span>
          <span class="hidden tablet:inline">{{ t('Synthetic sample · illustrative') }}</span>
        </figcaption>
        <div class="relative mt-14 tablet:mt-10">
          <!-- Requirement line + shortfall bracket -->
          <div aria-hidden="true" class="pointer-events-none absolute -bottom-3 -top-8 z-20 transition-opacity duration-500" :class="step >= 2 ? 'opacity-100' : 'opacity-0'" :style="{ left: `${pct(req)}%` }">
            <span class="absolute bottom-full right-0 mb-1 whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slateNavy">{{ t('Requirement') }} {{ req }}</span>
            <span class="absolute inset-y-0 left-0 border-l-2 border-dashed border-slateNavy" />
          </div>
          <div aria-hidden="true" class="pointer-events-none absolute -bottom-9 z-20 flex h-4 items-end transition-[opacity,transform] duration-500" :class="step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'" :style="{ left: `${pct(net)}%`, width: `${pct(req) - pct(net)}%` }">
            <span class="absolute inset-x-0 bottom-0 h-2 rounded-b-[4px] border-x-2 border-b-2 border-[#C2412D]" />
            <span class="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] font-semibold text-[#9E3322]">−{{ short }} {{ t('short') }}</span>
          </div>

          <div data-mx-bar class="mx-bar relative overflow-hidden rounded-[18px] bg-[color:rgba(3,60,89,0.06)]">
            <button
              v-for="s in segs"
              :key="s.key"
              type="button"
              class="mx-seg absolute inset-y-0 origin-left text-left focus-visible:z-10 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-slateNavy"
              :class="[`mx-${s.key}`, step >= 1 ? 'is-split' : '', hover && hover !== s.key ? 'is-dim' : '']"
              :style="{ left: `${s.left}%`, width: `${s.width}%`, transitionDelay: step >= 1 ? `${s.i * 110}ms` : '0ms' }"
              :tabindex="step >= 1 ? 0 : -1"
              :aria-label="`${s.label}: ${s.qty} ${sample.unit}. ${defs[s.key]}`"
              @mouseenter="hover = s.key"
              @mouseleave="hover = null"
              @focus="hover = s.key"
              @blur="hover = null"
            >
              <span class="absolute bottom-0 left-0 hidden p-3 desktop:p-4" :class="s.width < 9 ? '' : 'tablet:block'">
                <span class="mx-num block font-display font-extrabold leading-none tracking-[-0.04em]">{{ s.qty }}</span>
                <span class="mt-1 block whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">{{ s.label }}</span>
              </span>
            </button>
            <!-- Unsplit total -->
            <span aria-hidden="true" class="absolute inset-y-0 left-0 flex items-end bg-slateNavy p-3 text-pureWhite transition-opacity duration-500 desktop:p-4" :class="step >= 1 ? 'pointer-events-none opacity-0' : 'opacity-100'" :style="{ width: `${pct(mix.onHand)}%` }">
              <span>
                <span class="mx-num block font-display font-extrabold leading-none tracking-[-0.04em]">{{ mix.onHand }}</span>
                <span class="mt-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:rgba(255,255,255,0.7)]">{{ t('On hand') }}</span>
              </span>
            </span>
          </div>
        </div>

        <!-- Legend: phones always; tablet+ only for segments too narrow to label inside. -->
        <ul class="mt-16 grid grid-cols-2 gap-x-4 gap-y-2 tablet:mt-12 tablet:flex tablet:flex-wrap tablet:justify-end tablet:gap-x-5" aria-hidden="true">
          <li v-for="s in segs" :key="s.key" class="flex items-center gap-2 font-mono text-[11.5px] text-[color:rgba(3,60,89,0.8)]" :class="s.width < 9 ? '' : 'tablet:hidden'"><span class="h-3 w-3 rounded-[3px]" :class="`mx-${s.key}`" />{{ s.label }} <strong class="text-slateNavy">{{ s.qty }}</strong></li>
        </ul>
        <!-- Live line: verdict, or the hovered segment's definition (fixed height). -->
        <p class="mt-2 min-h-[3em] max-w-[64ch] text-[15px] leading-snug text-slateNavy max-desktop:mx-auto max-desktop:text-center" aria-live="polite">{{ caption }}</p>
        <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.45)] tablet:hidden max-desktop:text-center">{{ t('Synthetic sample · illustrative') }}</p>
      </figure>

      <!-- Bottom row -->
      <div class="mt-8 grid items-end gap-8 desktop:mt-6 desktop:grid-cols-12">
        <div class="m-center desktop:col-span-7">
          <p data-mx-fade class="hero-lede m-center desktop:max-w-[40rem]">{{ hero.body }}</p>
          <div data-mx-fade class="mt-8 xl:hidden">
            <BaseHeroCtas surface="light" :primary="{ label: t('Request a Demo') }" :secondary="{ label: t('Explore MATRIX'), down: true }" @primary="scrollTo('demo')" @secondary="scrollTo('intelligence')" />
          </div>
        </div>
        <ul data-mx-fade class="m-center-row flex flex-wrap gap-2 desktop:col-span-5 desktop:justify-end">
          <li v-for="(f, i) in hero.facts" :key="i" class="inline-flex items-center gap-2 rounded-[8px] bg-pureWhite px-3 py-2 font-display text-[12.5px] font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.12)]">
            <span aria-hidden="true" class="h-2 w-2 rounded-[2px] bg-pastiYellow-500" />{{ f }}
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mx-h1 {
  font-size: clamp(40px, 6.3vw, 104px);
  line-height: 0.95;
  letter-spacing: -0.045em;
}
/* "operational certainty" — navy type on a yellow band (never yellow text on light). */
.mx-hl {
  background: linear-gradient(transparent 60%, rgba(251, 186, 0, 0.6) 60%, rgba(251, 186, 0, 0.6) 90%, transparent 90%);
}
.mx-rack {
  background-image:
    linear-gradient(90deg, rgba(3, 60, 89, 0.035) 1px, transparent 1px),
    linear-gradient(rgba(3, 60, 89, 0.035) 1px, transparent 1px);
  background-size: 44px 30px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 70%, #000, transparent);
}
.mx-bar {
  height: clamp(64px, 7.6vw, 112px);
}
.mx-num {
  font-size: clamp(26px, 4.2vw, 64px);
}
.mx-seg {
  transform: scaleX(0);
  transition:
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.mx-seg.is-split {
  transform: scaleX(1);
}
.mx-seg.is-dim {
  opacity: 0.35;
}
.mx-seg + .mx-seg {
  box-shadow: inset 3px 0 0 #f8fafc;
}
.mx-net {
  background: #fbba00;
  color: #033c59;
}
.mx-reserved {
  background: #3e7a99;
  color: #fff;
}
.mx-quarantine {
  background: repeating-linear-gradient(135deg, #8fa9b8 0 6px, #c9d6de 6px 12px);
  color: #033c59;
}
.mx-damaged {
  background: #c2412d;
  color: #fff;
}
@media (prefers-reduced-motion: reduce) {
  .mx-seg {
    transition: none;
  }
}
</style>
