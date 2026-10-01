<script setup lang="ts">
import gsap from 'gsap'

// FAQ — "Question index + reading panel" (owner-directed redesign; copy is
// unchanged from useFaq(), sourced from the content-mapping doc §13/§14).
//
//   [PASTI] ───────────────────────────────── PAQ   09 / 10
//   FAQ.                      │ 01  What can PASTI help ...      [–]
//                             │     answer, word by word
//    ┌──────┐                 │ 02  What technology services ... [+]
//    │  01  │ / 07            │ 03  ...
//    └──────┘                 │ ...
//   active question, echoed   │
//   [ Tell us about it → ]    │ PASTI ─────── Certainty Through Execution
//
// The left column is sticky on desktop and *reads* the list: its oversized
// outlined numeral rolls to whichever question is hovered/focused/open, and
// echoes that question underneath — the Signal as a reading state, not
// decoration. One answer open at a time (parent-controlled), native
// <details> kept in every row. Below desktop the panel collapses to the
// heading + CTA and the list reads top to bottom.
const heading = 'FAQ'
const { items } = useFaq()
const { link: whatsappLink } = useWhatsapp()
const { setState } = useCustomCursor()

const openIndex = ref<number | null>(0)
const hoverIndex = ref<number | null>(null)
const activeIndex = computed(() => hoverIndex.value ?? openIndex.value ?? 0)
const active = computed(() => items[activeIndex.value]!)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}

const headingRef = ref<HTMLElement | null>(null)
const numeralRef = ref<HTMLElement | null>(null)
const echoRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

watch(activeIndex, (next, prev) => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches) return
  const dir = prev === undefined || next > prev ? 1 : -1
  if (numeralRef.value) gsap.fromTo(numeralRef.value, { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: approvedEase.gsapPrimary, overwrite: 'auto' })
  if (echoRef.value) gsap.fromTo(echoRef.value, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: approvedEase.gsapStandard, overwrite: 'auto' })
})
</script>

<template>
  <BaseSection as="section" class="surface-light relative overflow-clip" style="--lift-x: 10%; --lift-y: 30%">
    <BaseGridLines tone="light" />

    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="PAQ" meta="09 / 10" />

      <div class="mt-14 grid grid-cols-1 gap-12 md:mt-20 desktop:grid-cols-12 desktop:gap-10">
        <!-- Reading panel -->
        <aside class="desktop:col-span-5">
          <div class="desktop:sticky desktop:top-28">
            <h2 ref="headingRef" class="font-display text-token-display-xl font-bold text-slateNavy">
              {{ heading }}
            </h2>

            <div class="mt-10 hidden desktop:block" aria-hidden="true">
              <div class="flex items-end gap-4">
                <div class="relative overflow-hidden">
                  <span
                    ref="numeralRef"
                    class="faq-numeral block font-display text-[clamp(120px,12vw,210px)] font-bold leading-[0.8] tracking-[-0.06em]"
                    :class="openIndex === activeIndex ? 'is-open' : ''"
                    >{{ active.index }}</span
                  >
                </div>
                <span class="mb-3 font-display text-token-body-large font-semibold tabular-nums text-[color:rgba(3,60,89,0.4)]">/ {{ String(items.length).padStart(2, '0') }}</span>
              </div>
              <div class="mt-6 flex items-start gap-3 border-t border-[color:rgba(3,60,89,0.14)] pt-5">
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />
                <p ref="echoRef" class="max-w-sm font-display text-token-body font-semibold leading-snug text-slateNavy">{{ active.question }}</p>
              </div>
            </div>

            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="group mt-10 inline-flex items-center gap-4 rounded-[14px] bg-slateNavy py-3 pl-6 pr-3 font-display text-sm font-semibold text-pureWhite transition-colors duration-150 ease-editorial hover:bg-cobalt"
              @mouseenter="setState('contact')"
              @mouseleave="setState('default')"
            >
              Tell us about it
              <span aria-hidden="true" class="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[color:rgba(255,255,255,0.12)] transition-transform duration-200 ease-editorial group-hover:translate-x-1">→</span>
            </a>
          </div>
        </aside>

        <!-- Question index -->
        <div class="desktop:col-span-7" @mouseleave="hoverIndex = null">
          <HomeFaqItem
            v-for="(item, i) in items"
            :key="item.index"
            :item="item"
            :open="openIndex === i"
            @toggle="toggle(i)"
            @hover="hoverIndex = i"
          />
          <div class="border-t border-[color:rgba(3,60,89,0.12)] pt-8">
            <div class="flex items-center justify-between gap-6">
              <LayoutBrandMark surface="light" :height="14" class="opacity-80" />
              <p class="font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.63)]">Certainty Through Execution</p>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>

<style scoped>
/* Outlined numeral: navy stroke at rest, filled Cobalt when that question
   is the open one — the reading state made visible. */
.faq-numeral {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(3, 60, 89, 0.55);
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1), -webkit-text-stroke-color 0.3s;
}
.faq-numeral.is-open {
  color: #033C59;
  -webkit-text-stroke-color: #033C59;
}
</style>
