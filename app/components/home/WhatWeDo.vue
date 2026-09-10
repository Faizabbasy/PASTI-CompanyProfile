<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 03 — WHAT WE DO.
// "What we bu" in the source doc is truncated; confirmed with the client as "What we build".
const label = 'What we build'
const intro = 'We combine technology and creativity to solve real business challenges and create measurable impact.'

const gridRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)

useScrollReveal(gridRef, { y: 32 })
useMaskedReveal(labelRef, { by: 'word', blur: true })
useMaskedReveal(introRef, { by: 'line', blur: true })
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <div ref="gridRef" class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <div class="md:col-span-3">
          <p ref="labelRef" class="eyebrow text-base font-bold tracking-wider md:text-lg">
            {{ label }}
          </p>
          <HomeWhatWeDoDrawingField class="mt-8" />
        </div>

        <p ref="introRef" class="text-display-sm font-medium leading-snug text-ink md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
          {{ intro }}
        </p>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
