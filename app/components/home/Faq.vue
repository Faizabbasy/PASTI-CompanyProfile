<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, sections 13
// — FAQ: REPLACE TEMPLATE QUESTIONS and 14 — FAQ ANSWERS / PASTI COPY.
//
// Quiet Precision (04-homepage-spec.md §8): existing IA (heading,
// single-column accordion, native details/summary, divider, left accent
// bar) is preserved unchanged. Removed per the frozen spec: the two
// ambient glow blobs, the corner-bracket Yellow accent, and the
// continuous scroll-scrubbed heading scale/tracking — none of these are
// "structure," they're decoration the spec explicitly requires removed.
// Motion here is now: a single restrained heading mask reveal (unchanged,
// already existed) and nothing else at the section level — interaction
// motion lives entirely in FaqItem.vue's accordion/divider/accent-bar,
// per the "existing left accent bar is the Signal, not a new element" rule.
//
// Brand layer (still Quiet, still one column): the section carries the same
// SectionMark as the rest of the homepage, the 12-column grid is drawn as
// static structure (no glow, no drift), the heading takes the monumental
// editorial scale, and the list closes on a PASTI mark + brand essence line
// that hands off to the Footer as one composed closing movement.
const heading = 'FAQ'

const { items } = useFaq()

const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })
</script>

<template>
  <BaseSection as="section" class="surface-dark relative overflow-hidden">
    <BaseGridLines tone="dark" />

    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="PAQ" meta="08 / 09" />

      <h2 ref="headingRef" class="mt-16 font-display text-token-display-xl font-bold text-paper md:mt-20">
        {{ heading }}
      </h2>

      <div class="mt-14 md:mt-20">
        <HomeFaqItem v-for="item in items" :key="item.index" :item="item" />
        <!-- Closing rule: the last divider, then the brand signature. -->
        <div class="border-t border-navy-800 pt-8">
          <div class="flex items-center justify-between gap-6">
            <LayoutBrandMark :height="14" class="opacity-80" />
            <p class="font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-[color:rgba(255,255,255,0.45)]">Certainty Through Execution</p>
          </div>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
