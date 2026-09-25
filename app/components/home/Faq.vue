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
const heading = 'FAQ'

const { items } = useFaq()

const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })
</script>

<template>
  <BaseSection as="section" class="surface-dark relative overflow-hidden">
    <BaseContainer class="relative">
      <h2 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h2>

      <div class="mt-16 md:mt-20">
        <HomeFaqItem v-for="item in items" :key="item.index" :item="item" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
