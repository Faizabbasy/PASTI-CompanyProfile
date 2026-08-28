<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, sections 13
// — FAQ: REPLACE TEMPLATE QUESTIONS and 14 — FAQ ANSWERS / PASTI COPY.
const heading = 'FAQ'

const { items } = useFaq()

const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })
</script>

<template>
  <BaseSection as="section" class="bg-navy-950">
    <BaseContainer>
      <h2 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h2>

      <div class="mt-16 md:mt-20">
        <HomeFaqItem v-for="item in items" :key="item.index" :item="item" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
