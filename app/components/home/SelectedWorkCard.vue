<script setup lang="ts">
import type { SelectedWorkProject } from '~/composables/useSelectedWork'

defineProps<{ project: SelectedWorkProject; offset?: boolean }>()

const cardRef = ref<HTMLElement | null>(null)
useRevealOnScroll(cardRef, { threshold: 0.15 })
</script>

<template>
  <div ref="cardRef" class="reveal-up" :class="offset ? 'md:mt-20' : ''">
    <div class="aspect-[4/5] w-full rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950" aria-hidden="true" />
    <p class="mt-6 text-body-md text-navy-100">
      {{ project.title }}
    </p>
  </div>
</template>
