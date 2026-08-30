<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 10 —
// PASTI SERVICE EXPANSION / CONTENT MODEL, PLATFORMS line. Per placement rule "OPEN
// and e-CORPORATE must be visible in the main navigation and again as a platform
// section on the homepage."
const label = 'Platforms'

const { platforms } = usePlatforms()

const labelRef = ref<HTMLElement | null>(null)
useMaskedReveal(labelRef, { by: 'word' })
</script>

<template>
  <BaseSection as="section" class="rounded-t-[2.5rem] bg-navy-950">
    <BaseContainer>
      <p ref="labelRef" class="eyebrow text-navy-300">
        {{ label }}
      </p>

      <div class="mt-8">
        <HomePlatformRow v-for="platform in platforms" :key="platform.index" :platform="platform" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
