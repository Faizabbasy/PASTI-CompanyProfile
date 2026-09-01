<script setup lang="ts">
import type { NavItem } from '~/composables/useNavigation'

defineProps<{ item: NavItem }>()

const route = useRoute()
const labelRef = ref<HTMLElement | null>(null)
const { setState } = useCustomCursor()
</script>

<template>
  <NuxtLink
    :to="item.to"
    class="group relative flex items-center gap-1.5 py-2 font-display text-sm font-semibold text-ink transition-opacity duration-400 ease-editorial"
    :class="{ 'text-navy-700': route.path === item.to }"
    @mouseenter="setState('link')"
    @mouseleave="setState('default')"
  >
    <span
      v-if="item.isPlatform"
      class="mt-[0.55em] h-1.5 w-1.5 shrink-0 self-start rounded-full bg-yellow-500 transition-transform duration-400 ease-editorial group-hover:scale-125"
      aria-hidden="true"
    />
    <span ref="labelRef" class="relative block overflow-clip">
      <span class="block transition-transform duration-400 ease-editorial group-hover:-translate-y-full">{{ item.label }}</span>
      <span class="absolute inset-0 block translate-y-full text-yellow-500 transition-transform duration-400 ease-editorial group-hover:translate-y-0" aria-hidden="true">{{ item.label }}</span>
    </span>
    <span
      class="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-yellow-500 transition-transform duration-400 ease-editorial group-hover:scale-x-100"
      :class="{ 'scale-x-100': route.path === item.to }"
      aria-hidden="true"
    />
  </NuxtLink>
</template>
