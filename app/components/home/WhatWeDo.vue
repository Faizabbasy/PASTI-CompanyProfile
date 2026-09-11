<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 03 — WHAT WE DO.
// "What we bu" in the source doc is truncated; confirmed with the client as "What we build".
const label = 'What we build'

const introSegments: { text: string; accent?: boolean }[] = [
  { text: 'We combine' },
  { text: 'technology and creativity', accent: true },
  { text: 'to solve' },
  { text: 'real business challenges', accent: true },
  { text: 'and create' },
  { text: 'measurable impact.', accent: true }
]

const gridRef = ref<HTMLElement | null>(null)
useScrollReveal(gridRef, { y: 32 })
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <div ref="gridRef">
        <HomeEditorialIntro :label="label" :segments="introSegments" reconstruct-from-hero />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
