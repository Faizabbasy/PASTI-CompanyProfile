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
const isPlaceholder = computed(() => props.testimonial.status === 'placeholder')

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

// Measuring edge: the card's own 1px border is re-drawn in Cobalt inside a
// soft mask that follows the pointer — the same "system is measuring where
// you are" response the Hero's precision field uses. A border response, not
// a glow (nothing outside the border lights up). Fine pointers only.
function handlePointerMove(event: PointerEvent) {
  const el = cardRef.value
  if (!el || event.pointerType !== 'mouse') return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--px', `${event.clientX - rect.left}px`)
  el.style.setProperty('--py', `${event.clientY - rect.top}px`)
}
</script>

<template>
  <!-- No avatar by default (spec-locked). Compact still carries quote/name/
       role/company, just tighter — never role/company by default reduced.
       Brand layer: corner registration ticks (Precision Framing), a small
       PASTI mark as the card's signature, and a Cobalt spine on the Featured
       anchor. -->
  <div
    ref="cardRef"
    tabindex="0"
    class="testimonial-card group relative flex h-full flex-col overflow-hidden rounded-card border border-navy-800 bg-navy-900 transition-opacity duration-300 ease-editorial focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cobalt"
    :class="[
      testimonial.tier === 'featured' ? 'gap-8 p-8 md:p-10' : testimonial.tier === 'medium' ? 'gap-6 p-7 md:p-8' : 'gap-5 p-6'
    ]"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @pointermove="handlePointerMove"
  >
    <!-- Measuring edge (see handlePointerMove). -->
    <span
      aria-hidden="true"
      class="testimonial-card__edge pointer-events-none absolute inset-0 rounded-card border border-cobalt opacity-0 transition-opacity duration-150 ease-editorial group-hover:opacity-100 group-focus-visible:opacity-100"
    />

    <!-- Featured anchor: ghost wordmark cropped by the card edge + Cobalt spine. -->
    <template v-if="testimonial.tier === 'featured'">
      <div aria-hidden="true" class="pointer-events-none absolute -bottom-6 -right-10 w-96 opacity-[0.06] md:w-[32rem]">
        <LayoutBrandMark :dot="false" class="block w-full" />
      </div>
      <span aria-hidden="true" class="absolute inset-y-0 left-0 w-[3px] bg-cobalt" />
    </template>

    <div class="relative flex items-center justify-between">
      <span aria-hidden="true" class="flex items-center gap-1.5">
        <span class="h-px w-5 bg-[color:rgba(255,255,255,0.35)]" />
        <span class="h-1 w-1 rounded-full" :class="isPlaceholder ? 'bg-[color:rgba(255,255,255,0.25)]' : 'bg-cobalt'" />
      </span>
      <LayoutBrandMark :height="testimonial.tier === 'compact' ? 11 : 13" class="opacity-70 transition-opacity duration-150 ease-editorial group-hover:opacity-100" />
    </div>

    <p
      class="relative"
      :class="[
        isPlaceholder ? 'text-navy-400' : 'text-navy-100',
        testimonial.tier === 'featured'
          ? 'font-display text-token-body-large font-medium leading-[1.45] tracking-[-0.01em] text-paper'
          : testimonial.tier === 'medium'
            ? 'text-body-md'
            : 'text-body-sm'
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

<style scoped>
.testimonial-card {
  --px: 50%;
  --py: 0%;
}

.testimonial-card__edge {
  -webkit-mask-image: radial-gradient(circle 170px at var(--px) var(--py), #000 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
  mask-image: radial-gradient(circle 170px at var(--px) var(--py), #000 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
}
</style>
