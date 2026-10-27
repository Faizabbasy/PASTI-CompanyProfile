<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 04 HOW DORA WORKS — the blueprint's ten-step operational flow (§4), with
// the actor of each step. Desktop: ten stations on one rail; a cyan fill
// travels it with scroll (scrubbed, no pin) and the station it reaches
// opens in the detail card (activity, actor, result). Any station can be
// picked by click/keyboard. Below desktop: a vertical track with every
// step's detail visible. Reduced motion: the whole rail drawn, all lit.
if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

const { flow } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const lit = ref(-1)
const picked = ref(0)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const fillX = section.querySelector<HTMLElement>('[data-dfl-fill-x]')
  const fillY = section.querySelector<HTMLElement>('[data-dfl-fill-y]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    lit.value = flow.steps.length - 1
    gsap.set(fillX, { scaleX: 1 })
    gsap.set(fillY, { scaleY: 1 })
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    const track = section.querySelector<HTMLElement>('[data-dfl-track]')
    const n = flow.steps.length
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top 75%',
      end: 'bottom 40%',
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(fillX, { scaleX: self.progress })
        gsap.set(fillY, { scaleY: self.progress })
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
  <section id="workflow" ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px]">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="DORA" meta="04 / 13" class="mb-12 desktop:mb-16" />
      <DoraHeading surface="dark" :eyebrow="flow.eyebrow" :title="flow.headline" :lede="flow.lede" />

      <div data-dfl-track class="relative mt-16">
        <!-- Desktop rail -->
        <div aria-hidden="true" class="absolute left-0 right-0 top-[18px] hidden h-[2px] bg-[color:rgba(255,255,255,0.14)] desktop:block">
          <span data-dfl-fill-x class="block h-full origin-left scale-x-0 bg-doraCyan" />
        </div>
        <!-- Mobile track -->
        <div aria-hidden="true" class="absolute bottom-0 left-[17px] top-0 w-[2px] bg-[color:rgba(255,255,255,0.14)] desktop:hidden">
          <span data-dfl-fill-y class="block h-full w-full origin-top scale-y-0 bg-doraCyan" />
        </div>

        <ol class="relative grid gap-7 desktop:grid-cols-10 desktop:gap-3">
          <li v-for="(s, i) in flow.steps" :key="i" class="relative">
            <button
              type="button"
              class="group flex w-full gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-doraCyan desktop:block"
              :aria-pressed="picked === i"
              :aria-controls="'dfl-detail'"
              @click="picked = i"
            >
              <span
                class="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 font-mono text-[11px] font-semibold tabular-nums transition-colors duration-300 ease-editorial"
                :class="[
                  i <= lit ? 'border-doraCyan bg-doraCyan text-slateNavy' : 'border-[color:rgba(255,255,255,0.25)] bg-slateNavy text-[color:rgba(255,255,255,0.65)] group-hover:border-[color:rgba(255,255,255,0.6)]',
                  picked === i ? 'shadow-[0_0_0_5px_rgba(31,214,238,0.22)]' : ''
                ]"
              >{{ pad(i + 1) }}</span>
              <span class="block desktop:mt-4">
                <span class="block font-display text-[16px] font-bold leading-tight tracking-[-0.01em] desktop:text-[14px]" :class="picked === i ? 'text-pureWhite' : 'desktop:text-[color:rgba(255,255,255,0.75)]'">{{ s.name }}</span>
                <span class="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-doraCyan desktop:text-[9.5px]">{{ s.actor }}</span>
                <span class="mt-1.5 block text-[13.5px] leading-snug text-[color:rgba(255,255,255,0.68)] desktop:hidden">{{ s.body }} <span class="text-[color:rgba(255,255,255,0.5)]">→ {{ s.result }}</span></span>
              </span>
            </button>
          </li>
        </ol>

        <!-- Desktop detail card -->
        <div id="dfl-detail" class="mt-12 hidden rounded-[22px] bg-[color:rgba(255,255,255,0.05)] p-7 ring-1 ring-[color:rgba(255,255,255,0.1)] desktop:grid desktop:grid-cols-12 desktop:items-center desktop:gap-8" aria-live="polite">
          <p class="col-span-1 font-display text-[44px] font-extrabold leading-none tabular-nums text-doraCyan">{{ pad(picked + 1) }}</p>
          <!-- Every step's content stacked in one grid cell (only the picked
               one visible): the card never changes height while the scroll
               fill moves, so nothing below shifts. -->
          <div class="col-span-11 grid">
            <div v-for="(s, i) in flow.steps" :key="i" class="grid grid-cols-11 items-center gap-8 [grid-area:1/1]" :class="picked === i ? '' : 'invisible'" :aria-hidden="picked !== i">
              <div class="col-span-5">
                <p class="font-display text-[24px] font-bold tracking-[-0.02em]">{{ s.name }}</p>
                <p class="mt-1.5 text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ s.body }}</p>
              </div>
              <dl class="col-span-6 grid grid-cols-2 gap-4">
                <div class="rounded-[14px] bg-[color:rgba(0,0,0,0.2)] p-4">
                  <dt class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">{{ t('Actor') }}</dt>
                  <dd class="mt-1.5 font-display text-[16px] font-bold">{{ s.actor }}</dd>
                </div>
                <div class="rounded-[14px] bg-[color:rgba(0,0,0,0.2)] p-4">
                  <dt class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">{{ t('Result') }}</dt>
                  <dd class="mt-1.5 text-[14.5px] font-semibold leading-snug">{{ s.result }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
