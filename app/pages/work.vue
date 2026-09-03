<script setup lang="ts">
const heading = 'Selected work'

const { projects } = useSelectedWork()

const headingRef = ref<HTMLElement | null>(null)
useScrollReveal(headingRef, { y: 24 })
</script>

<template>
  <BaseSection as="section" class="bg-navy-950 pt-32 md:pt-40">
    <BaseContainer>
      <h1 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h1>

      <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:mt-20">
        <HomeSelectedWorkCard
          v-for="(project, index) in projects"
          :key="project.index"
          :project="project"
          :offset="index % 2 === 1"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
