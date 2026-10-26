<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { GanttStep } from '~/composables/useFast'

// 05 SCHEDULING BOARD — the signature section and the page's only pin.
// Desktop: a short pin walks the reconstructed board through four beats
// with scroll — Queue → Schedule → Validate → Adjust. The visitor can also
// pick a beat, switch forward / backward scheduling and hour / day / week
// views, and at "Validate" drag the conflicting operation onto Work Center
// 04 (or press "Move it for me"). Below desktop: no pin; the same board in
// a readable hour view with step buttons. Sample data only.
if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

const { board, gantt } = useFastPage()
const sectionRef = ref<HTMLElement | null>(null)
const step = ref<GanttStep>(0)
const dir = ref<'fwd' | 'bwd'>('fwd')
const view = ref<'hour' | 'day' | 'week'>('day')
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)

const go = (i: number) => (step.value = i as GanttStep)
const resolve = () => (step.value = 3)

const queue = computed(() => (step.value === 0 ? gantt.orders : gantt.orders.filter((o) => o.readiness === 'Material shortage')))
const dueLabel = (h: number) => `${String((gantt.start + h) % 24).padStart(2, '0')}:00${gantt.start + h >= 24 ? ' +1d' : ''}`

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const mm = gsap.matchMedia()
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    const stage = section.querySelector<HTMLElement>('[data-fb-stage]')
    let last = -1
    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top+=40',
      end: '+=180%',
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const i = Math.min(3, Math.floor(self.progress * 4.2))
        if (i !== last) {
          last = i
          step.value = i as GanttStep
        }
      }
    })
    return () => st.kill()
  })
  mm.add(`${reducedMotionQuery.noPreference} and (max-width: 1023.98px)`, () => {
    view.value = 'hour'
  })
  mm.add(reducedMotionQuery.reduce, () => {
    step.value = 3
  })
})
</script>

<template>
  <section id="scheduling" ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32 desktop:py-0">
    <div data-fb-stage class="desktop:flex desktop:min-h-[100svh] desktop:items-center desktop:py-14">
      <BaseContainer class="relative z-10 w-full">
        <BaseSectionMark surface="light" label="FAST" meta="05 / 12" class="mb-12 desktop:mb-16" />
        <div class="grid gap-10 desktop:grid-cols-12 desktop:gap-10">
          <!-- Story -->
          <div class="desktop:col-span-4">
            <div><FastHeading size="md" :eyebrow="board.eyebrow" :title="board.headline" :lede="board.lede" /></div>
            <ol class="mt-8 grid gap-1.5">
              <li v-for="(s, i) in board.steps" :key="i">
                <button
                  type="button"
                  class="group flex w-full items-start gap-3 rounded-[14px] px-3 py-3 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
                  :class="step === i ? 'bg-surfaceNeutral' : 'hover:bg-surfaceNeutral'"
                  :aria-pressed="step === i"
                  @click="go(i)"
                >
                  <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold tabular-nums transition-colors duration-300" :class="step === i ? 'bg-pastiYellow-500 text-slateNavy' : step > i ? 'bg-slateNavy text-pureWhite' : 'bg-[color:rgba(3,60,89,0.08)] text-[color:rgba(3,60,89,0.6)]'">{{ pad(i + 1) }}</span>
                  <span>
                    <span class="block font-display text-[16px] font-bold text-slateNavy">{{ s.name }}</span>
                    <span class="mt-0.5 block text-[13px] leading-snug text-[color:rgba(3,60,89,0.65)]" :class="step === i ? '' : 'max-desktop:hidden desktop:line-clamp-1'">{{ s.body }}</span>
                  </span>
                </button>
              </li>
            </ol>
          </div>

          <!-- Board -->
          <div class="min-w-0 desktop:col-span-8">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Scheduling direction" class="inline-flex rounded-full bg-surfaceNeutral p-1">
                <button v-for="d in (['fwd', 'bwd'] as const)" :key="d" type="button" :aria-pressed="dir === d" class="min-h-10 rounded-full px-4 font-display text-[13px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="dir === d ? 'bg-slateNavy text-pureWhite' : 'text-[color:rgba(3,60,89,0.7)] hover:text-slateNavy'" @click="dir = d">
                  {{ d === 'fwd' ? 'Forward' : 'Backward' }}
                </button>
              </div>
              <div role="group" aria-label="Timeline view" class="inline-flex rounded-full bg-surfaceNeutral p-1">
                <button v-for="v in (['hour', 'day', 'week'] as const)" :key="v" type="button" :aria-pressed="view === v" class="min-h-10 rounded-full px-4 font-display text-[13px] font-bold capitalize transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="view === v ? 'bg-slateNavy text-pureWhite' : 'text-[color:rgba(3,60,89,0.7)] hover:text-slateNavy'" @click="view = v">
                  {{ v }}
                </button>
              </div>
            </div>

            <div class="mt-4 overflow-hidden rounded-[20px] bg-pureWhite shadow-[0_40px_80px_-50px_rgba(3,60,89,0.6)] ring-1 ring-[color:rgba(3,60,89,0.1)]">
              <!-- Unscheduled queue -->
              <div class="border-b border-[color:rgba(3,60,89,0.08)] bg-surfaceNeutral px-4 py-3">
                <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Unscheduled queue · {{ queue.length }}</p>
                <ul class="mt-2 flex flex-wrap gap-2">
                  <li v-for="o in queue" :key="o.id" class="inline-flex items-center gap-2 rounded-[10px] bg-pureWhite px-2.5 py-1.5 text-[12px] ring-1 ring-[color:rgba(3,60,89,0.1)]">
                    <span class="font-display font-bold text-slateNavy">{{ o.id }}</span>
                    <span class="text-[color:rgba(3,60,89,0.6)]">due {{ dueLabel(o.due) }}</span>
                    <span class="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase" :class="o.priority === 'Rush' ? 'bg-pastiYellow-500 text-slateNavy' : o.priority === 'High' ? 'bg-slateNavy text-pureWhite' : 'bg-[color:rgba(3,60,89,0.08)] text-[color:rgba(3,60,89,0.7)]'">{{ o.priority }}</span>
                    <span v-if="o.readiness === 'Material shortage'" class="inline-flex items-center gap-1 font-semibold text-[#C2412D]"><span class="h-1.5 w-1.5 rounded-full bg-[#C2412D]" />{{ step >= 1 ? 'Blocked · material shortage' : 'Material shortage' }}</span>
                  </li>
                </ul>
              </div>

              <div class="px-1 pb-3 pt-2 tablet:px-2">
                <FastGantt :step="step" :dir="dir" :view="view" :interactive="step === 2" :now="9" @resolve="resolve" />
              </div>

              <!-- Validation strip -->
              <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[color:rgba(3,60,89,0.08)] px-4 py-3" aria-live="polite">
                <p class="text-[13px] leading-snug" :class="step === 2 ? 'text-[#C2412D]' : 'text-[color:rgba(3,60,89,0.7)]'">
                  <template v-if="step === 0">Four orders waiting. Press “Schedule” or keep scrolling.</template>
                  <template v-else-if="step === 1">Every eligible operation placed {{ dir === 'fwd' ? 'as early as possible' : 'back from its due date' }}. Validating…</template>
                  <template v-else-if="step === 2"><strong>PRD-1047 · Op 20</strong> overlaps planned maintenance on Work Center 03. Drag it onto Work Center 04.</template>
                  <template v-else>Conflict resolved by the planner. The board is valid and saved as a draft — the active plan is untouched.</template>
                </p>
                <button v-if="step === 2" type="button" class="inline-flex min-h-10 items-center gap-2 rounded-full bg-slateNavy px-4 font-display text-[13px] font-bold text-pureWhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500" @click="resolve">
                  Move it for me
                  <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v11M4 9l4 4 4-4" /></svg>
                </button>
                <span v-else-if="step === 3" class="inline-flex items-center gap-2 rounded-full bg-[color:rgba(251,186,0,0.18)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A5A00]"><span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Draft · not published</span>
              </div>
            </div>
            <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.45)] max-desktop:text-center">Illustrative sample data · not a product screenshot</p>
          </div>
        </div>
      </BaseContainer>
    </div>

    <!-- Feature register -->
    <BaseContainer class="relative z-10 desktop:pb-28">
      <ul class="mt-16 grid grid-cols-1 gap-x-8 border-t border-[color:rgba(3,60,89,0.1)] tablet:grid-cols-2 desktop:mt-6 desktop:grid-cols-5">
        <li v-for="(f, i) in board.features" :key="i" data-fr class="flex items-center gap-3 border-b border-[color:rgba(3,60,89,0.1)] py-4 font-display text-[14px] font-semibold text-slateNavy">
          <span class="font-mono text-[10px] tabular-nums text-[color:rgba(3,60,89,0.4)]">{{ pad(i + 1) }}</span>{{ f }}
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>
