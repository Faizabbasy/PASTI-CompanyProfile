<script setup lang="ts">
import type { Service } from '~/composables/useServices'

defineProps<{ service: Service }>()

const rowRef = ref<HTMLElement | null>(null)
useScrollReveal(rowRef)

const { setState } = useCustomCursor()
</script>

<template>
  <div
    ref="rowRef"
    class="group grid grid-cols-1 gap-6 rounded-2xl bg-navy-50 p-8 transition-colors duration-400 ease-editorial hover:bg-navy-800 md:grid-cols-12 md:items-center md:gap-8 md:p-12"
    @mouseenter="setState('link')"
    @mouseleave="setState('default')"
  >
    <div class="flex items-start justify-between md:col-span-7 md:block">
      <h3 class="text-display-sm font-display font-semibold text-ink transition-all duration-400 ease-editorial group-hover:translate-x-2 group-hover:text-paper">
        {{ service.title }}
      </h3>
      <span
        class="font-display text-2xl font-semibold text-navy-200 transition-all duration-400 ease-editorial group-hover:scale-110 group-hover:text-navy-500 md:hidden"
        aria-hidden="true"
      >
        {{ service.index }}
      </span>
    </div>

    <p class="text-body-md text-muted transition-colors duration-400 ease-editorial group-hover:text-navy-100 md:col-span-4">
      {{ service.body }}
    </p>

    <div class="hidden items-center justify-end gap-10 md:col-span-1 md:flex">
      <span
        class="font-display text-3xl font-semibold text-navy-200 transition-all duration-400 ease-editorial group-hover:scale-110 group-hover:text-navy-500"
        aria-hidden="true"
      >
        {{ service.index }}
      </span>
    </div>

    <NuxtLink
      to="/technology"
      class="inline-flex items-center gap-2 font-display text-sm font-semibold text-ink transition-colors duration-400 ease-editorial group-hover:text-paper md:col-span-12 md:mt-2"
    >
      {{ service.cta }}
      <span aria-hidden="true" class="inline-block translate-x-0 opacity-0 transition-all duration-400 ease-editorial group-hover:translate-x-1 group-hover:opacity-100">→</span>
    </NuxtLink>
  </div>
</template>
