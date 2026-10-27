<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 05 MATERIAL 360 — the signature section and the page's only pin.
// "One material. One operational view." Desktop: a short pin walks the
// reconstructed Material 360 record through six beats — identity →
// locations & serials → stock composition → readiness → planning →
// movement history; any beat can be picked directly. The body has a fixed
// height on desktop, so the pinned stage never resizes. Below desktop: no
// pin; the same record with prev / next controls. Synthetic data (§5).
if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

const { m360, sample } = useMatrixPage()
// `tr`, not `t`: the template loops over tabs as `t`.
const tr = useT()
const sectionRef = ref<HTMLElement | null>(null)
const step = ref(0)
const pad = (n: number) => String(n).padStart(2, '0')
const last = m360.steps.length - 1
const go = (i: number) => (step.value = Math.max(0, Math.min(last, i)))
const net = netAvailable(sample.mix)
const tabs = ['Overview', 'Locations & serials', 'Stock', 'Planning', 'Movements'].map((x) => tr(x))
const tabFor = (s: number) => [0, 1, 2, 2, 3, 4][s]
useMatrixReveal(sectionRef)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const mm = gsap.matchMedia()
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    const stage = section.querySelector<HTMLElement>('[data-m3-stage]')
    let prev = -1
    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=240%',
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const i = Math.min(last, Math.floor(self.progress * (last + 1.2)))
        if (i !== prev) {
          prev = i
          step.value = i
        }
      }
    })
    return () => st.kill()
  })
  mm.add(reducedMotionQuery.reduce, () => {
    step.value = 3
  })
})

const identity = [
  { l: tr('Code'), v: sample.code },
  { l: tr('Category'), v: sample.category },
  { l: tr('Unit'), v: sample.unit },
  { l: tr('Criticality'), v: sample.criticality },
  { l: tr('Tracking'), v: sample.tracking },
  { l: tr('Movement class'), v: sample.movement }
]
const serialTone: Record<string, string> = {
  Available: 'bg-pastiYellow-500 text-slateNavy',
  Reserved: 'bg-[#3E7A99] text-pureWhite',
  Quarantine: 'm3-hatch text-slateNavy',
  Damaged: 'bg-[#C2412D] text-pureWhite'
}
</script>

<template>
  <section id="material-360" ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px] desktop:py-0">
    <BaseGridLines tone="dark" />
    <div data-m3-stage class="desktop:flex desktop:min-h-[100svh] desktop:items-center desktop:py-12">
      <BaseContainer class="relative z-10 w-full">
        <MatrixBinLabel :index="5" name="Material 360" surface="dark" class="mb-10 desktop:mb-7" />
        <div class="grid gap-10 desktop:grid-cols-12 desktop:gap-10">
          <!-- Story -->
          <div class="desktop:col-span-4">
            <MatrixHeading class="desktop:[@media(max-height:820px)]:[&_[data-mh-lede]]:hidden" surface="dark" size="md" :eyebrow="m360.eyebrow" :title="m360.headline" :lede="m360.lede" />
            <ol class="mt-8 hidden gap-1 desktop:grid">
              <li v-for="(s, i) in m360.steps" :key="i">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
                  :class="step === i ? 'bg-[color:rgba(255,255,255,0.08)]' : 'hover:bg-[color:rgba(255,255,255,0.05)]'"
                  :aria-pressed="step === i"
                  @click="go(i)"
                >
                  <span class="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] font-mono text-[10px] font-semibold tabular-nums transition-colors duration-300" :class="step === i ? 'bg-pastiYellow-500 text-slateNavy' : step > i ? 'bg-pureWhite text-slateNavy' : 'bg-[color:rgba(255,255,255,0.1)] text-[color:rgba(255,255,255,0.65)]'">{{ pad(i + 1) }}</span>
                  <span class="block font-display text-[15px] font-bold">{{ s.name }}</span>
                </button>
              </li>
            </ol>
            <!-- The active step's description lives in one slot whose height
                 never changes (all texts stacked in one grid cell), so the
                 pinned stage does not shift between steps. -->
            <div class="mt-3 hidden px-3 text-[13.5px] leading-snug text-[color:rgba(255,255,255,0.7)] desktop:grid" aria-live="polite">
              <p v-for="(s, i) in m360.steps" :key="i" class="[grid-area:1/1] transition-opacity duration-300" :class="step === i ? 'opacity-100' : 'invisible opacity-0'">{{ s.body }}</p>
            </div>
          </div>

          <!-- Record -->
          <div class="min-w-0 desktop:col-span-8">
            <div class="overflow-hidden rounded-[20px] bg-pureWhite text-slateNavy shadow-[0_40px_90px_-50px_rgba(0,8,16,0.9)]">
              <!-- Identity header -->
              <div class="border-b border-[color:rgba(3,60,89,0.08)] p-5 transition-colors duration-500 tablet:p-6" :class="step === 0 ? 'bg-[color:rgba(251,186,0,0.1)]' : ''">
                <p class="truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">{{ tr('Inventory') }} / {{ sample.category }} / {{ sample.code }}</p>
                <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p class="font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em] tablet:text-[26px]">{{ sample.name }}</p>
                  <ul class="flex flex-wrap gap-1.5">
                    <li class="inline-flex items-center gap-1.5 rounded-full bg-[color:rgba(194,65,45,0.1)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9E3322]"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-[#C2412D]" />{{ sample.criticality }}</li>
                    <li class="rounded-full bg-surfaceNeutral px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:rgba(3,60,89,0.75)] ring-1 ring-[color:rgba(3,60,89,0.1)]">{{ sample.tracking }}</li>
                  </ul>
                </div>
              </div>
              <!-- Tabs (mirror the step) -->
              <div class="flex gap-1 overflow-hidden border-b border-[color:rgba(3,60,89,0.08)] px-3 tablet:px-4" aria-hidden="true">
                <span v-for="(t, i) in tabs" :key="t" class="relative shrink-0 whitespace-nowrap px-2.5 py-3 font-display text-[12.5px] font-semibold transition-colors duration-300" :class="[tabFor(step) === i ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.45)]', i > 2 ? 'max-tablet:hidden' : '']">
                  {{ t }}
                  <span class="absolute inset-x-2 bottom-0 h-[2px] origin-left bg-pastiYellow-500 transition-transform duration-300" :class="tabFor(step) === i ? 'scale-x-100' : 'scale-x-0'" />
                </span>
              </div>

              <!-- Body: fixed height on desktop (stable pin). -->
              <div class="relative p-5 tablet:p-6 desktop:h-[300px] desktop:overflow-hidden" aria-live="polite">
                <Transition name="m3" mode="out-in">
                  <dl v-if="step === 0" key="0" class="grid grid-cols-2 gap-x-6 gap-y-4 tablet:grid-cols-3">
                    <div v-for="d in identity" :key="d.l">
                      <dt class="text-[12px] text-[color:rgba(3,60,89,0.55)]">{{ d.l }}</dt>
                      <dd class="mt-0.5 font-display text-[16px] font-bold">{{ d.v }}</dd>
                    </div>
                  </dl>

                  <div v-else-if="step === 1" key="1" class="grid gap-4 tablet:grid-cols-[1.4fr_1fr]">
                    <ul class="divide-y divide-[color:rgba(3,60,89,0.08)]">
                      <li v-for="l in sample.locations" :key="l.path" class="flex items-center justify-between gap-3 py-2.5">
                        <span class="min-w-0 truncate font-mono text-[12px]">{{ l.path }}</span>
                        <strong class="shrink-0 font-display text-[15px] tabular-nums">{{ l.qty }} {{ sample.unit }}</strong>
                      </li>
                    </ul>
                    <ul class="grid grid-cols-2 gap-2">
                      <li v-for="s in sample.serials" :key="s.id" class="rounded-[12px] bg-surfaceNeutral p-2.5">
                        <span class="block font-mono text-[11.5px]">{{ s.id }}</span>
                        <span class="mt-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em]" :class="serialTone[s.state]">{{ tr(s.state) }}</span>
                      </li>
                    </ul>
                  </div>

                  <div v-else-if="step === 2 || step === 3" key="2" class="pt-7">
                    <MatrixStockBar :mix="sample.mix" :requirement="step === 3" />
                    <div class="mt-6 flex min-h-[60px] items-start gap-3 rounded-[14px] border-l-[3px] px-4 py-3 transition-colors duration-500" :class="step === 3 ? 'border-[#C2412D] bg-[color:rgba(194,65,45,0.08)]' : 'border-pastiYellow-500 bg-[color:rgba(251,186,0,0.1)]'">
                      <p class="text-[14px] leading-snug">
                        <template v-if="step === 3"><strong>{{ tr('Net available is {n} {unit} short', { n: (sample.mix.requirement ?? 0) - net, unit: sample.unit }) }}</strong> {{ tr('of the near-term requirement while units remain in quarantine. Review the shortage.') }}</template>
                        <template v-else><strong>{{ tr('{n} {unit} net available', { n: net, unit: sample.unit }) }}</strong> = {{ tr('{a} on hand − {b} reserved − {c} quarantine − {d} damaged.', { a: sample.mix.onHand, b: sample.mix.reserved, c: sample.mix.quarantine, d: sample.mix.damaged }) }}</template>
                      </p>
                    </div>
                  </div>

                  <dl v-else-if="step === 4" key="4" class="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    <div v-for="p in sample.planning" :key="p.label" class="rounded-[14px] bg-surfaceNeutral p-3.5">
                      <dt class="text-[12px] text-[color:rgba(3,60,89,0.6)]">{{ p.label }}</dt>
                      <dd class="mt-1 font-display text-[18px] font-bold">{{ p.value }}</dd>
                    </div>
                  </dl>

                  <div v-else key="5">
                    <!-- Ledger: table on tablet+, stacked rows on phones. -->
                    <table class="hidden w-full text-left text-[12px] tablet:table">
                      <thead>
                        <tr class="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:rgba(3,60,89,0.55)]">
                          <th class="pb-2 font-medium">{{ tr('Time') }}</th><th class="pb-2 font-medium">{{ tr('Movement') }}</th><th class="pb-2 font-medium">{{ tr('Qty') }}</th><th class="pb-2 font-medium">{{ tr('Before → after') }}</th><th class="pb-2 font-medium">{{ tr('Actor') }}</th><th class="pb-2 font-medium">{{ tr('Ref') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[color:rgba(3,60,89,0.08)]">
                        <tr v-for="(r, i) in sample.ledger" :key="r.ref" class="m3-row" :style="{ animationDelay: `${i * 90}ms` }">
                          <td class="py-2 pr-3 font-mono text-[11px] text-[color:rgba(3,60,89,0.6)]">{{ r.time }}</td>
                          <td class="py-2 pr-3 font-semibold">{{ r.movement }}</td>
                          <td class="py-2 pr-3 font-mono tabular-nums">{{ r.qty }}</td>
                          <td class="py-2 pr-3 font-mono tabular-nums">{{ r.before }} → {{ r.after }}</td>
                          <td class="py-2 pr-3">{{ r.actor }}</td>
                          <td class="py-2 font-mono text-[11px] text-[color:rgba(3,60,89,0.6)]">{{ r.ref }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <ul class="divide-y divide-[color:rgba(3,60,89,0.08)] tablet:hidden">
                      <li v-for="r in sample.ledger" :key="r.ref" class="py-2.5">
                        <p class="flex justify-between gap-3 text-[13px]"><strong>{{ r.movement }}</strong><span class="font-mono tabular-nums">{{ r.qty }}</span></p>
                        <p class="mt-0.5 font-mono text-[11px] text-[color:rgba(3,60,89,0.6)]">{{ r.time }} · {{ r.actor }} · {{ r.ref }}</p>
                      </li>
                    </ul>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Below desktop: step controls -->
            <div class="mt-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 desktop:hidden">
              <button type="button" class="grid h-11 w-11 place-items-center rounded-full ring-1 ring-[color:rgba(255,255,255,0.25)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :disabled="step <= 0" :aria-label="tr('Previous view')" @click="go(step - 1)">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 8H3M7 4 3 8l4 4" /></svg>
              </button>
              <p class="text-center">
                <span class="block font-mono text-[10.5px] tabular-nums tracking-[0.12em] text-pastiYellow-400">{{ pad(step + 1) }} / {{ pad(last + 1) }}</span>
                <span class="block font-display text-[15px] font-bold">{{ m360.steps[step]?.name }}</span>
              </p>
              <button type="button" class="grid h-11 w-11 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pureWhite" :disabled="step >= last" :aria-label="tr('Next view')" @click="go(step + 1)">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
            </div>
            <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.45)] max-desktop:text-center">{{ tr('Synthetic sample record · not a product screenshot') }}</p>
          </div>
        </div>
      </BaseContainer>
    </div>
  </section>
</template>

<style scoped>
.m3-enter-active,
.m3-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.m3-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.m3-leave-to {
  opacity: 0;
}
.m3-row {
  animation: m3-row 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes m3-row {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
.m3-hatch {
  background: repeating-linear-gradient(135deg, #8fa9b8 0 4px, #c9d6de 4px 8px);
}
@media (prefers-reduced-motion: reduce) {
  .m3-enter-active,
  .m3-leave-active {
    transition: none;
  }
  .m3-row {
    animation: none;
  }
}
</style>
