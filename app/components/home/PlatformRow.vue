<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Platform } from '~/composables/usePlatforms'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ platform: Platform; variant: 'open' | 'corporate' }>()

const rowRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLElement | null>(null)
useScrollReveal(rowRef)

const { setState } = useCustomCursor()

// Dual Product Worlds: OPEN gets a larger-amplitude, more expansive window-
// parallax; e-CORPORATE gets a smaller-amplitude, tighter-eased one — same
// technical basis (overflow:hidden container + moving image inside), only
// the motion parameters differ (LARGE_SCALE_MOTION_PLAN.md section 8). The
// tighter easing must still read as perfectly smooth, never stuttery.
useGsapContext(() => {
  const image = imageRef.value
  if (!image) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const amplitude = props.variant === 'open' ? (isMobile ? 10 : 20) : (isMobile ? 6 : 12)
    const ease = props.variant === 'open' ? 'power3.out' : 'power2.out'

    gsap.set(image, { yPercent: -amplitude / 2, scale: 1.08 })

    const trigger = ScrollTrigger.create({
      trigger: rowRef.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: props.variant === 'open' ? 0.6 : 0.35,
      onUpdate: (self) => {
        gsap.to(image, { yPercent: -amplitude / 2 + amplitude * self.progress, duration: 0.1, ease, overwrite: 'auto' })
      }
    })

    return () => trigger.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(image, { yPercent: 0, scale: props.variant === 'corporate' ? 1.02 : 1.05 })
  })
})
</script>

<template>
  <div ref="rowRef" class="border-t border-navy-800">
    <NuxtLink
      :to="platform.to"
      class="group grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:items-center md:gap-8 md:py-16"
      @mouseenter="setState('view')"
      @mouseleave="setState('default')"
    >
      <div class="md:col-span-5">
        <span class="font-display text-sm font-semibold text-navy-400" aria-hidden="true">
          {{ platform.index }}
        </span>

        <h3 class="mt-4 text-display-md font-display font-semibold text-paper transition-all duration-400 ease-editorial group-hover:translate-x-2 group-hover:text-yellow-400 md:text-display-lg">
          {{ platform.name }}
        </h3>

        <p class="mt-4 inline-flex items-center gap-2 text-body-lg text-navy-200">
          {{ platform.positioning }}
          <span
            aria-hidden="true"
            class="transition-transform duration-400 ease-editorial group-hover:translate-x-2"
          >→</span>
        </p>
      </div>

      <div class="md:col-span-7">
        <div
          class="relative w-full overflow-hidden rounded-2xl"
          :class="variant === 'open' ? 'aspect-[16/10]' : 'aspect-[16/10] md:aspect-[4/3] md:mx-auto md:max-w-[85%]'"
        >
          <img
            ref="imageRef"
            :src="platform.image"
            :alt="platform.name"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
          >
          <span
            v-if="variant === 'corporate'"
            aria-hidden="true"
            class="pointer-events-none absolute inset-3 rounded-xl border border-navy-500/20"
          />
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
