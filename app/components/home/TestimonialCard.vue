<script setup lang="ts">
import gsap from 'gsap'
import type { Testimonial } from '~/composables/useTestimonials'

const props = defineProps<{ testimonial: Testimonial }>()

const cardRef = ref<HTMLElement | null>(null)
defineExpose({ cardRef })

const { setState } = useCustomCursor()

// Magnetic hover — locked values (04-homepage-spec.md §5): active card lifts
// ~6-10px, no tilt, no glow, no scale jump, no repositioning. This is a
// plain vertical lift + border/opacity emphasis, NOT useCardTilt (that
// composable's 3D pointer-tilt is explicitly banned for this section).
const LIFT_PX = 8
const REST_DURATION = motionDuration.fast
const isFocused = ref(false)

function handleEnter() {
  setState('view')
  gsap.to(cardRef.value, { y: -LIFT_PX, duration: REST_DURATION, ease: approvedEase.gsapStandard })
}

function handleLeave() {
  setState('default')
  if (isFocused.value) return
  gsap.to(cardRef.value, { y: 0, duration: REST_DURATION, ease: approvedEase.gsapStandard })
}

function handleFocus() {
  isFocused.value = true
  gsap.to(cardRef.value, { y: -LIFT_PX, duration: REST_DURATION, ease: approvedEase.gsapStandard })
}

function handleBlur() {
  isFocused.value = false
  gsap.to(cardRef.value, { y: 0, duration: REST_DURATION, ease: approvedEase.gsapStandard })
}
</script>

<template>
  <!-- No avatar by default (spec-locked). Compact still carries quote/name/
       role/company, just tighter — never role/company by default reduced. -->
  <div
    ref="cardRef"
    tabindex="0"
    class="testimonial-card group relative flex h-full flex-col overflow-hidden rounded-card border border-navy-800 bg-navy-900 transition-opacity duration-300 ease-editorial focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cobalt"
    :class="[
      testimonial.tier === 'featured' ? 'gap-6 p-8 md:p-10' : testimonial.tier === 'medium' ? 'gap-5 p-7 md:p-8' : 'gap-4 p-6'
    ]"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <p
      class="relative text-navy-100"
      :class="[
        testimonial.tier === 'featured' ? 'text-body-lg' : testimonial.tier === 'medium' ? 'text-body-md' : 'text-body-sm'
      ]"
    >
      {{ testimonial.quote }}
    </p>

    <div class="relative mt-auto flex items-center gap-4 border-t border-navy-800 pt-5">
      <div>
        <p class="font-display font-semibold text-paper" :class="testimonial.tier === 'compact' ? 'text-body-sm' : 'text-body-md'">
          {{ testimonial.name }}
        </p>
        <p class="text-body-sm text-navy-400">{{ testimonial.role }}</p>
      </div>
    </div>
  </div>
</template>
