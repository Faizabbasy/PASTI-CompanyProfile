<script setup lang="ts">
import type { FaqItem } from '~/composables/useFaq'

defineProps<{ item: FaqItem }>()

const open = ref(false)
const rowRef = ref<HTMLElement | null>(null)
useScrollReveal(rowRef)
</script>

<template>
  <div ref="rowRef" class="border-t border-navy-800">
    <details class="group" :open="open" @toggle="open = ($event.target as HTMLDetailsElement).open">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-6 py-8 font-display text-body-lg font-medium text-paper marker:content-none transition-colors duration-400 ease-editorial hover:text-yellow-400 md:py-10 md:text-display-sm"
      >
        {{ item.question }}
        <span
          aria-hidden="true"
          class="relative h-6 w-6 shrink-0"
        >
          <span class="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
          <span
            class="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-600 ease-editorial group-open:rotate-90"
          />
        </span>
      </summary>

      <div
        class="grid transition-[grid-template-rows] duration-400 ease-editorial"
        :style="{ gridTemplateRows: open ? '1fr' : '0fr' }"
      >
        <div class="overflow-hidden">
          <p class="max-w-3xl pb-8 text-body-md text-navy-200 md:pb-10 md:text-body-lg">
            {{ item.answer }}
          </p>
        </div>
      </div>
    </details>
  </div>
</template>
