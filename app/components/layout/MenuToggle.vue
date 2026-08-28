<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="relative z-50 flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
    :aria-expanded="open"
    aria-label="Toggle navigation menu"
    @click="$emit('toggle')"
  >
    <span class="relative flex h-4 w-6 flex-col justify-between">
      <span
        class="h-0.5 w-full origin-center bg-ink transition-all duration-400 ease-editorial"
        :class="open ? 'translate-y-[7px] rotate-45' : ''"
      />
      <span
        class="h-0.5 w-full bg-ink transition-all duration-400 ease-editorial"
        :class="open ? 'opacity-0' : 'opacity-100'"
      />
      <span
        class="h-0.5 w-full origin-center bg-ink transition-all duration-400 ease-editorial"
        :class="open ? '-translate-y-[7px] -rotate-45' : ''"
      />
    </span>
  </button>
</template>
