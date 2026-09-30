<script setup lang="ts">
import type { NavItem } from '~/composables/useNavigation'

// A string `:is="'NuxtLink'"` is not resolved at runtime (components are
// auto-imported, not globally registered) — it rendered a dead <NuxtLink>
// element instead of an <a>. Resolve the component itself.
const RouterLink = resolveComponent('NuxtLink')

withDefaults(defineProps<{ item: NavItem; dark?: boolean }>(), { dark: false })

const route = useRoute()
const labelRef = ref<HTMLElement | null>(null)
const { setState } = useCustomCursor()
</script>

<template>
  <component
    :is="item.comingSoon ? 'span' : RouterLink"
    :to="item.comingSoon ? undefined : item.to"
    :aria-disabled="item.comingSoon ? 'true' : undefined"
    :title="item.comingSoon ? `${item.label} — coming soon` : undefined"
    class="group relative flex items-center gap-1.5 py-2 font-display text-sm font-bold tracking-tight transition-opacity duration-400 ease-editorial"
    :class="[
      dark
        ? ['text-pureWhite/80', { 'text-pureWhite': route.path === item.to }]
        : ['text-navy-950', { 'text-navy-700': route.path === item.to }],
      { 'cursor-default opacity-50': item.comingSoon }
    ]"
    @mouseenter="setState(item.comingSoon ? 'default' : 'link')"
    @mouseleave="setState('default')"
  >
    <!-- Platform-link dot / hover accent: unchanged Yellow on the existing
         light nav theme (out of scope this milestone — Header's light
         variant belongs to the light-hero pages, not touched here). The
         dark variant (over Hero) uses Cobalt/Cyan per this milestone's
         nav spec instead, since Yellow defaults off homepage-wide
         (03-design-system.md §9) and Hero's own Signal language is
         Cobalt/Cyan. -->
    <span
      v-if="item.isPlatform"
      class="mt-[0.55em] h-1.5 w-1.5 shrink-0 self-start rounded-full transition-transform duration-400 ease-editorial group-hover:scale-125"
      :class="dark ? 'bg-cobalt' : 'bg-yellow-500'"
      aria-hidden="true"
    />
    <span ref="labelRef" class="relative block overflow-clip">
      <span class="block transition-transform duration-400 ease-editorial group-hover:-translate-y-full">{{ item.label }}</span>
      <span
        class="absolute inset-0 block translate-y-full transition-transform duration-400 ease-editorial group-hover:translate-y-0"
        :class="dark ? 'text-cyan' : 'text-yellow-500'"
        aria-hidden="true"
        >{{ item.label }}</span
      >
    </span>
    <span
      class="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-400 ease-editorial group-hover:scale-x-100"
      :class="[dark ? 'bg-cyan' : 'bg-yellow-500', { 'scale-x-100': route.path === item.to }]"
      aria-hidden="true"
    />
  </component>
</template>
