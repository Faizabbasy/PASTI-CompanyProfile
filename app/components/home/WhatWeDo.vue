<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 03 — WHAT WE DO.
// "What we bu" in the source doc is truncated; confirmed with the client as "What we build".
const label = 'What we build'
const intro = 'We combine technology and creativity to solve real business challenges and create measurable impact.'

const labelRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)

useMaskedReveal(labelRef, { by: 'word' })
useMaskedReveal(introRef, { by: 'line' })
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <p ref="labelRef" class="eyebrow md:col-span-3">
          {{ label }}
        </p>

        <p ref="introRef" class="text-body-lg text-ink md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
          {{ intro }}
        </p>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
