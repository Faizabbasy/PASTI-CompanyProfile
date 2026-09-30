<script setup lang="ts">
import type { Platform } from '~/composables/usePlatforms'

// A string `:is="'NuxtLink'"` is not resolved at runtime (components are
// auto-imported, not globally registered) — it rendered a dead <NuxtLink>
// element instead of an <a>. Resolve the component itself.
const RouterLink = resolveComponent('NuxtLink')

// Text-led CTA (00-brand-guide.md §10: hover uses line travel / arrow shift,
// never scaling). The underline draws left-to-right and the arrow steps
// forward inside the same ~200ms window. While a platform has no destination
// page yet, the CTA is a non-navigating label with an explicit state tag —
// visible, not just dimmed.
defineProps<{ platform: Platform }>()
const { setState } = useCustomCursor()
</script>

<template>
  <component
    :is="platform.comingSoon ? 'span' : RouterLink"
    :to="platform.comingSoon ? undefined : platform.to"
    :aria-disabled="platform.comingSoon ? 'true' : undefined"
    :title="platform.comingSoon ? `${platform.name} — coming soon` : undefined"
    class="group/cta relative inline-flex items-center gap-3 pb-1.5 font-display text-token-metadata font-semibold uppercase tracking-[0.08em]"
    :class="platform.comingSoon ? 'cursor-default text-[color:rgba(255,255,255,0.6)]' : 'text-cobalt'"
    @mouseenter="platform.comingSoon ? undefined : setState('link')"
    @mouseleave="setState('default')"
  >
    <span>Explore {{ platform.name }}</span>
    <span
      v-if="platform.comingSoon"
      class="rounded-token-sm border border-[color:rgba(255,255,255,0.18)] px-2 py-0.5 text-[10px] tracking-[0.1em] text-[color:rgba(255,255,255,0.75)]"
      >Coming soon</span
    >
    <span
      v-else
      aria-hidden="true"
      class="inline-block transition-transform duration-200 ease-editorial group-hover/cta:translate-x-1"
      >→</span
    >
    <span
      aria-hidden="true"
      class="absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-200 ease-editorial"
      :class="platform.comingSoon ? 'scale-x-100 opacity-25' : 'scale-x-[0.18] group-hover/cta:scale-x-100'"
    />
  </component>
</template>
