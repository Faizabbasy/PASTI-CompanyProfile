<script setup lang="ts">
import type { Platform } from '~/composables/usePlatforms'

defineProps<{ platform: Platform }>()

const rowRef = ref<HTMLElement | null>(null)
useRevealOnScroll(rowRef, { threshold: 0.15 })
</script>

<template>
  <div ref="rowRef" class="reveal-up border-t border-navy-800">
    <NuxtLink
      :to="platform.to"
      class="group grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:items-center md:gap-8 md:py-16"
    >
      <div class="md:col-span-5">
        <span class="font-display text-sm font-semibold text-navy-400" aria-hidden="true">
          {{ platform.index }}
        </span>

        <h3 class="mt-4 text-display-md font-display font-semibold text-paper transition-colors duration-400 ease-editorial group-hover:text-yellow-400 md:text-display-lg">
          {{ platform.name }}
        </h3>

        <p class="mt-4 inline-flex items-center gap-2 text-body-lg text-navy-200">
          {{ platform.positioning }}
          <span
            aria-hidden="true"
            class="transition-transform duration-400 ease-editorial group-hover:translate-x-1"
          >→</span>
        </p>
      </div>

      <div class="md:col-span-7">
        <div class="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950" aria-hidden="true">
          <div class="h-full w-full transition-transform duration-600 ease-editorial group-hover:scale-105" />
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
