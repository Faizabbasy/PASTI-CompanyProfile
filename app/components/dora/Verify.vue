<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { DoraField, VerifyStep } from '~/composables/useDora'

// 06 HUMAN-IN-THE-LOOP VERIFICATION — the signature section and the page's
// only pin. Desktop: a short pin walks the reconstructed workspace through
// five beats with scroll — open from queue → compare (marker follows the
// field) → flag (lower confidence) → correct → decide. Visitors can also
// pick a beat, select any field to see its marker, type the correction
// themselves and complete verification. Below desktop: no pin; the same
// workspace recomposed (page → fields → decision) with step controls.
// Never implies automatic approval: the decision is always a person's and
// follows the configured workflow. Synthetic data only.
if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

type Key = DoraField['key']
const { verify } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const step = ref<VerifyStep>(0)
const chosen = ref<Key | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)

const defaultActive: Record<number, Key | null> = { 0: null, 1: 'date', 2: 'docNo', 3: 'docNo', 4: null }
const active = computed(() => chosen.value ?? defaultActive[step.value] ?? null)
watch(step, () => (chosen.value = null))

const go = (i: number) => (step.value = Math.max(0, Math.min(4, i)) as VerifyStep)
const select = (k: Key) => {
  chosen.value = k
  if (step.value === 0) step.value = 1
}

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const mm = gsap.matchMedia()
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    const stage = section.querySelector<HTMLElement>('[data-dv-stage]')
    let last = -1
    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=220%',
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const i = Math.min(4, Math.floor(self.progress * 5.2))
        if (i !== last) {
          last = i
          step.value = i as VerifyStep
        }
      }
    })
    return () => st.kill()
  })
  mm.add(reducedMotionQuery.reduce, () => {
    step.value = 4
  })
})

const captions = [
  t('Opened from the verification queue. Every extracted field is listed with its confidence.'),
  t('Select a field — its marker shows exactly where the value sits on the page.'),
  t('Document No. has lower confidence: the scan read “OO01” for “0001”. It is flagged for a closer look.'),
  t('The reviewer corrects the value. It is saved and shown when the document is reopened.'),
  t('A person completes verification. The final status follows your configured workflow.')
]
</script>

<template>
  <section id="verification" ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-navyDeep-900 py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px] desktop:py-0">
    <BaseGridLines tone="dark" />
    <div data-dv-stage class="desktop:flex desktop:min-h-[100svh] desktop:items-center desktop:py-12">
      <BaseContainer class="relative z-10 w-full">
        <BaseSectionMark surface="dark" label="DORA" meta="06 / 13" class="mb-10 desktop:mb-7" />
        <div class="grid gap-10 desktop:grid-cols-12 desktop:gap-10">
          <!-- Story -->
          <div class="desktop:col-span-4">
            <DoraHeading class="desktop:[@media(max-height:820px)]:[&_[data-dh-lede]]:hidden" surface="dark" size="md" :eyebrow="verify.eyebrow" :title="verify.headline" :lede="verify.lede" />
            <ol class="mt-8 hidden gap-1 desktop:grid">
              <li v-for="(s, i) in verify.steps" :key="i">
                <button
                  type="button"
                  class="group flex w-full items-start gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-doraCyan"
                  :class="step === i ? 'bg-[color:rgba(255,255,255,0.07)]' : 'hover:bg-[color:rgba(255,255,255,0.05)]'"
                  :aria-pressed="step === i"
                  @click="go(i)"
                >
                  <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold tabular-nums transition-colors duration-300" :class="step === i ? 'bg-doraCyan text-slateNavy' : step > i ? 'bg-pureWhite text-slateNavy' : 'bg-[color:rgba(255,255,255,0.1)] text-[color:rgba(255,255,255,0.65)]'">{{ pad(i + 1) }}</span>
                  <span>
                    <span class="block font-display text-[15.5px] font-bold">{{ s.name }}</span>
                    <span class="mt-0.5 block text-[13px] leading-snug text-[color:rgba(255,255,255,0.65)] desktop:line-clamp-1">{{ s.body }}</span>
                  </span>
                </button>
              </li>
            </ol>
          </div>

          <!-- Workspace -->
          <div class="min-w-0 desktop:col-span-8">
            <DoraWorkspace :step="step" :active="active" @select="select" @decide="go(4)" />
            <!-- Below desktop: step controls first (prev · step · next), then
                 the caption. Desktop: the caption alone (the story list and
                 the pin drive the steps). -->
            <div class="mt-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 desktop:hidden">
              <button type="button" class="grid h-11 w-11 place-items-center rounded-full ring-1 ring-[color:rgba(255,255,255,0.2)] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-doraCyan" :disabled="step <= 0" :aria-label="t('Previous step')" @click="go(step - 1)">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 8H3M7 4 3 8l4 4" /></svg>
              </button>
              <p class="text-center">
                <span class="block font-mono text-[10.5px] tabular-nums tracking-[0.12em] text-doraCyan">{{ pad(step + 1) }} / 05</span>
                <span class="block font-display text-[15px] font-bold">{{ verify.steps[step]?.name }}</span>
              </p>
              <button type="button" class="grid h-11 w-11 place-items-center rounded-full bg-doraCyan text-slateNavy disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pureWhite" :disabled="step >= 4" :aria-label="t('Next step')" @click="go(step + 1)">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
            </div>
            <!-- All captions stacked in one grid cell: fixed height, so the
                 pinned stage never shifts between steps. -->
            <div class="mt-4 grid max-w-[60ch] text-[13.5px] leading-snug text-[color:rgba(255,255,255,0.75)] max-desktop:text-center" aria-live="polite">
              <p v-for="(c, i) in captions" :key="i" class="[grid-area:1/1]" :class="step === i ? '' : 'invisible'">{{ c }}</p>
            </div>
            <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.45)]">{{ verify.note }} · {{ t('Synthetic sample, not a product screenshot') }}</p>
          </div>
        </div>
      </BaseContainer>
    </div>
  </section>
</template>
