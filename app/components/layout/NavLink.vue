<script setup lang="ts">
import type { NavItem } from '~/composables/useNavigation'

defineProps<{ item: NavItem }>()

const route = useRoute()
</script>

<template>
  <NuxtLink
    :to="item.to"
    class="group relative flex items-center gap-1.5 py-2 font-display text-sm font-medium text-ink"
    :class="{ 'text-navy-700': route.path === item.to }"
  >
    <span
      v-if="item.isPlatform"
      class="h-1.5 w-1.5 rounded-full bg-yellow-500 transition-transform duration-400 ease-editorial group-hover:scale-125"
      aria-hidden="true"
    />
    <span>{{ item.label }}</span>
    <span
      class="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-yellow-500 transition-transform duration-400 ease-editorial group-hover:scale-x-100"
      :class="{ 'scale-x-100': route.path === item.to }"
      aria-hidden="true"
    />
  </NuxtLink>
</template>
