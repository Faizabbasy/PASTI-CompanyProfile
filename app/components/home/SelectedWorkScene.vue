<script setup lang="ts">
import type { SelectedWorkProject } from '~/composables/useSelectedWork'

// One "scene" layer inside SelectedWork.vue's pinned stage — replaces the
// old grid-card role of SelectedWorkCard.vue for this section (that
// component's card-sized/grid-flow layout doesn't apply here). No motion
// logic lives in this component: the parent owns one shared scroll-progress
// value and writes every layer's transform/opacity from it directly, per
// the plan's "one source of truth, no per-scene ScrollTriggers" requirement
// — this component only exposes the DOM refs the parent needs and picks its
// own base CSS positioning from `layout`, since that differs structurally
// (not just in motion amplitude) across the three presentation modes:
// - 'pinned' (desktop/tablet): absolutely positioned full-viewport layer,
//   stacked on top of each other, driven by the parent's pin+scrub.
// - 'sticky' (mobile): normal document flow, `position: sticky` so each
//   scene sticks to the viewport top and gets naturally covered by the
//   next scene scrolling over it — no JS pin.
// - 'static' (prefers-reduced-motion): normal document flow, no motion,
//   every project fully visible and readable without relying on scroll
//   choreography.
const props = defineProps<{
  project: SelectedWorkProject
  index: number
  layout: 'pinned' | 'sticky' | 'static'
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const sceneRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()

// `wrapperRef` (the tall, non-sticky outer block) is what the parent's
// ScrollTrigger should use as `trigger` for the 'sticky' layout — a sticky
// element's own bounding rect stops changing relative to the viewport once
// it's stuck, which makes trigger math against `sceneRef` itself unreliable;
// GSAP's own ScrollTrigger docs recommend triggering off the non-sticky
// container in sticky patterns. For 'pinned'/'static' layouts there is no
// separate wrapper, so this just mirrors `sceneRef`.
defineExpose({ wrapperRef, sceneRef, mediaRef, contentRef })
</script>

<template>
  <!-- 'sticky' layout needs an outer wrapper TALLER than the viewport (160vh)
       so there is scroll room for the inner `sticky top-0 h-screen` element
       to actually hold in place before the next scene's own sticky element
       takes over — a wrapper exactly 100vh tall gives `position: sticky`
       zero room to stick within, and it would just behave like a normal
       block. This is the standard CSS sticky-stack mechanism (not a GSAP
       pin): each 160vh block scrolls past while its sticky child holds at
       the top for that scroll distance, then the next block's sticky child
       is already in place underneath, ready to take over. -->
  <div v-if="layout === 'sticky'" ref="wrapperRef" class="relative h-[160vh]">
    <div
      ref="sceneRef"
      class="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
      :style="{ zIndex: index + 1 }"
      @mouseenter="setState('view')"
      @mouseleave="setState('default')"
    >
      <div class="relative h-full w-full overflow-hidden">
        <div ref="mediaRef" class="absolute inset-0">
          <img :src="project.image" :alt="project.title" loading="lazy" class="h-full w-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
        </div>

        <div ref="contentRef" class="container-page absolute inset-x-0 bottom-0 pb-16">
          <p class="flex items-baseline gap-3 text-body-sm text-navy-200">
            <span class="font-mono text-yellow-500">{{ project.index }}</span>
          </p>
          <h3 class="mt-3 text-display-md text-paper">
            {{ project.title }}
          </h3>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    ref="sceneRef"
    class="flex items-center justify-center overflow-hidden"
    :class="layout === 'pinned' ? 'absolute inset-0' : 'relative'"
    :style="layout === 'pinned' ? { zIndex: index + 1 } : undefined"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <div
      class="relative w-full overflow-hidden"
      :class="layout === 'static' ? 'aspect-[4/5] rounded-2xl md:aspect-[16/9]' : 'h-full'"
    >
      <div ref="mediaRef" class="absolute inset-0">
        <img
          :src="project.image"
          :alt="project.title"
          loading="lazy"
          class="h-full w-full object-cover"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
      </div>

      <div
        ref="contentRef"
        class="absolute inset-x-0 bottom-0"
        :class="layout === 'static' ? 'p-6' : 'container-page pb-16 md:pb-20'"
      >
        <p class="flex items-baseline gap-3 text-body-sm text-navy-200">
          <span class="font-mono text-yellow-500">{{ project.index }}</span>
        </p>
        <h3 class="mt-3 text-display-md text-paper">
          {{ project.title }}
        </h3>
      </div>
    </div>
  </div>
</template>
