<script setup lang="ts">
import gsap from 'gsap'
import type { Testimonial } from '~/composables/useTestimonials'

const props = defineProps<{ testimonial: Testimonial; tiltDeg?: number }>()

const cardRef = ref<HTMLElement | null>(null)
const scoreRef = ref<HTMLElement | null>(null)
const quoteRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
defineExpose({ cardRef, scoreRef, quoteRef, footerRef })

const { setState } = useCustomCursor()

// Generated, abstract avatar seeded from the client's name — not a stock
// photo standing in for a real person's likeness (these are real, named
// client testimonials; a stock face would misrepresent who they are).
// DiceBear's "glass" style renders an abstract gradient pattern, not a
// human face, so it reads as a personal visual mark rather than a claimed
// photo.
const avatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(props.testimonial.name)}`

const ratingDisplay = props.testimonial.rating.toFixed(1)

// The entrance timeline (Testimonials.vue) sets this card's resting tilt
// via GSAP as part of its fly-in animation. useCardTilt is handed the same
// value so its own hover tween composes on top of that resting rotation
// instead of fighting it — see useCardTilt's baseRotate doc for why a
// plain CSS `hover:rotate-0` utility can't be used here.
useCardTilt(cardRef, { strength: 5, lift: 1.02, baseRotate: props.tiltDeg ?? 0 })

// Cursor-following spotlight: a radial glow tracks the pointer inside the
// card via CSS custom properties updated per pointermove, cheaper than a
// GSAP tween since it's just two custom-property writes per frame.
function handlePointerMove(event: PointerEvent) {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
}

onMounted(() => {
  if (!import.meta.client) return
  if (!window.matchMedia('(pointer: fine)').matches) return

  const el = cardRef.value
  if (!el) return

  el.addEventListener('pointermove', handlePointerMove)
  el.addEventListener('pointerenter', () => {
    gsap.to(glowRef.value, { opacity: 1, duration: 0.3 })
  })
  el.addEventListener('pointerleave', () => {
    gsap.to(glowRef.value, { opacity: 0, duration: 0.4 })
  })

  onBeforeUnmount(() => {
    el.removeEventListener('pointermove', handlePointerMove)
  })
})
</script>

<template>
  <div
    ref="cardRef"
    class="testimonial-card group relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-navy-800 bg-navy-900 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] transition-[border-color] duration-500 ease-editorial hover:border-yellow-500/40 md:p-10"
    style="--spotlight-x: 50%; --spotlight-y: 50%"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <!-- Cursor-following spotlight glow, positioned via CSS custom
         properties written on pointermove (see handlePointerMove). -->
    <div
      ref="glowRef"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-0"
      style="background: radial-gradient(360px circle at var(--spotlight-x) var(--spotlight-y), rgba(250, 204, 21, 0.08), transparent 70%)"
    />

    <span
      aria-hidden="true"
      class="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] font-bold leading-none text-navy-800 select-none"
    >&rdquo;</span>

    <!-- Editorial score, replacing the generic star rating — a large,
         semi-transparent numeral in the corner (echoing the index-numeral
         accent used on Selected Work) instead of five stock stars. -->
    <div ref="scoreRef" class="relative flex items-start justify-between">
      <span
        aria-hidden="true"
        class="font-display text-4xl font-bold leading-none text-yellow-500/90 transition-transform duration-500 ease-editorial group-hover:scale-110"
        style="transform-origin: 0% 50%"
      >{{ ratingDisplay }}<span class="text-lg text-yellow-500/50">/5</span></span>
    </div>

    <p ref="quoteRef" class="relative text-body-md text-navy-100">{{ testimonial.quote }}</p>

    <div ref="footerRef" class="relative mt-auto flex items-center gap-4 border-t border-navy-800 pt-6">
      <img
        :src="avatarUrl"
        :alt="`Avatar for ${testimonial.name}`"
        width="44"
        height="44"
        loading="lazy"
        class="h-11 w-11 shrink-0 rounded-full border border-navy-700 bg-navy-800 transition-transform duration-500 ease-editorial group-hover:scale-110"
      >
      <div>
        <p class="font-display text-body-md font-semibold text-paper">{{ testimonial.name }}</p>
        <p class="text-body-sm text-navy-400">{{ testimonial.role }}</p>
      </div>
    </div>
  </div>
</template>
