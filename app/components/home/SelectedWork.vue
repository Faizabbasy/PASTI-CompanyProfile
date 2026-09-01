<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 06 — SELECTED WORK.
const heading = 'Selected work'
const cta = 'View all projects'

const { projects } = useSelectedWork()

const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })
</script>

<template>
  <BaseSection id="selected-work" as="section" class="rounded-t-[2.5rem] bg-navy-950">
    <BaseContainer>
      <h2 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h2>

      <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
        <HomeSelectedWorkCard
          v-for="(project, index) in projects"
          :key="project.index"
          :project="project"
          :offset="index % 2 === 1"
        />
      </div>

      <div class="mt-16 flex justify-center md:mt-20">
        <span class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper">
          {{ cta }}
        </span>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
