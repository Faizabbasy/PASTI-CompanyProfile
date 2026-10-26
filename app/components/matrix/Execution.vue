<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 08 WAREHOUSE EXECUTION — the source workflow (§8–9) as eight stations:
// Receive → Inspect → Put away → Request → Pick → Issue → Transfer /
// return → Count. Desktop: one rail; a yellow fill travels it with scroll
// (scrubbed, no pin) and the station it reaches opens its controls in the
// detail card; any station can be picked. Below desktop: a vertical track
// with every station's controls inline. Stations are square bins and a
// yellow "MTX" pallet travels the line (MATRIX's own take — FAST / DORA use
// round stations and a plain fill). Reduced motion: all lit, no pallet.
if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

const { execution } = useMatrixPage()
const sectionRef = ref<HTMLElement | null>(null)
const lit = ref(-1)
const picked = ref(0)
const pad = (n: number) => String(n).padStart(2, '0')
useMatrixReveal(sectionRef)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const fillX = section.querySelector<HTMLElement>('[data-mxe-fill-x]')
  const fillY = section.querySelector<HTMLElement>('[data-mxe-fill-y]')
  const tokX = section.querySelector<HTMLElement>('[data-mxe-tok-x]')
  const tokY = section.querySelector<HTMLElement>('[data-mxe-tok-y]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    lit.value = execution.steps.length - 1
    gsap.set(fillX, { scaleX: 1 })
    gsap.set(fillY, { scaleY: 1 })
    gsap.set([tokX, tokY], { autoAlpha: 0 })
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    const track = section.querySelector<HTMLElement>('[data-mxe-track]')
    const n = execution.steps.length
    // Track lengths are read on refresh only (no layout reads per scroll).
    let w = 0
    let h = 0
    const measure = () => {
      w = (tokX?.parentElement?.offsetWidth ?? 0) - (tokX?.offsetWidth ?? 0)
      h = (tokY?.parentElement?.offsetHeight ?? 0) - (tokY?.offsetHeight ?? 0)
    }
    measure()
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top 75%',
      end: 'bottom 40%',
      scrub: 0.6,
      onRefresh: measure,
      onUpdate: (self) => {
        gsap.set(fillX, { scaleX: self.progress })
        gsap.set(fillY, { scaleY: self.progress })
        gsap.set(tokX, { x: self.progress * w })
        gsap.set(tokY, { y: self.progress * h })
        const i = Math.min(n - 1, Math.floor(self.progress * n + 0.1) - 1)
        if (i !== lit.value) {
          lit.value = i
          if (i >= 0) picked.value = i
        }
      }
    })
    return () => st.kill()
  })
})
</script>

<template>
  <section id="execution" ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px]">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="8" name="Warehouse execution" surface="dark" class="mb-12 desktop:mb-16" />
      <MatrixHeading surface="dark" :eyebrow="execution.eyebrow" :title="execution.headline" :lede="execution.lede" />

      <div data-mxe-track class="relative mt-16">
        <div aria-hidden="true" class="absolute left-0 right-0 top-[18px] hidden h-[2px] bg-[color:rgba(255,255,255,0.14)] desktop:block">
          <span data-mxe-fill-x class="block h-full origin-left scale-x-0 bg-pastiYellow-500" />
          <!-- The pallet travelling the line -->
          <span data-mxe-tok-x class="absolute -top-[9px] left-0 grid h-5 w-9 place-items-center rounded-[4px] bg-pastiYellow-500 font-mono text-[8.5px] font-bold text-slateNavy shadow-[0_6px_16px_-6px_rgba(251,186,0,0.8)]">MTX</span>
        </div>
        <div aria-hidden="true" class="absolute bottom-0 left-[17px] top-0 w-[2px] bg-[color:rgba(255,255,255,0.14)] desktop:hidden">
          <span data-mxe-fill-y class="block h-full w-full origin-top scale-y-0 bg-pastiYellow-500" />
          <span data-mxe-tok-y class="absolute -left-[5px] top-0 h-3 w-3 rounded-[2px] bg-pastiYellow-500" />
        </div>

        <ol class="relative grid gap-7 desktop:grid-cols-8 desktop:gap-3">
          <li v-for="(s, i) in execution.steps" :key="i" class="relative">
            <button
              type="button"
              class="group flex w-full gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500 desktop:block"
              :aria-pressed="picked === i"
              aria-controls="mxe-detail"
              @click="picked = i"
            >
              <span
                class="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-[7px] border-2 font-mono text-[11px] font-semibold tabular-nums transition-colors duration-300 ease-editorial"
                :class="[i <= lit ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(255,255,255,0.25)] bg-slateNavy text-[color:rgba(255,255,255,0.65)] group-hover:border-[color:rgba(255,255,255,0.6)]', picked === i ? 'ring-4 ring-[color:rgba(251,186,0,0.25)]' : '']"
              >{{ pad(i + 1) }}</span>
              <span class="block desktop:mt-4">
                <span class="block font-display text-[17px] font-bold leading-tight tracking-[-0.01em] desktop:text-[15px]" :class="picked === i ? 'text-pureWhite' : 'desktop:text-[color:rgba(255,255,255,0.75)]'">{{ s.name }}</span>
                <span class="mt-2 flex flex-wrap gap-1.5 desktop:hidden">
                  <span v-for="(c, ci) in s.controls" :key="ci" class="rounded-full bg-[color:rgba(255,255,255,0.07)] px-2.5 py-1 text-[12px] text-[color:rgba(255,255,255,0.8)]">{{ c }}</span>
                </span>
              </span>
            </button>
          </li>
        </ol>

        <div id="mxe-detail" class="mt-12 hidden rounded-[22px] bg-[color:rgba(255,255,255,0.05)] p-7 ring-1 ring-[color:rgba(255,255,255,0.1)] desktop:grid desktop:grid-cols-12 desktop:items-center desktop:gap-8" aria-live="polite">
          <p class="col-span-1 font-display text-[44px] font-extrabold leading-none tabular-nums text-pastiYellow-500">{{ pad(picked + 1) }}</p>
          <!-- Every station's content is stacked in one grid cell (only the
               picked one visible), so the card height never changes while
               the scroll fill moves — no layout shift below. -->
          <div class="col-span-11 grid">
            <div v-for="(s, i) in execution.steps" :key="i" class="grid grid-cols-11 items-center gap-8 [grid-area:1/1]" :class="picked === i ? '' : 'invisible'" :aria-hidden="picked !== i">
              <p class="col-span-3 font-display text-[26px] font-bold tracking-[-0.02em]">{{ s.name }}</p>
              <ul class="col-span-8 flex flex-wrap gap-2">
                <li v-for="(c, ci) in s.controls" :key="ci" class="inline-flex items-center gap-2 rounded-full bg-[color:rgba(0,0,0,0.2)] px-3.5 py-2 text-[14px] font-semibold">
                  <svg viewBox="0 0 12 12" class="h-3 w-3 text-pastiYellow-500" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>{{ c }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
