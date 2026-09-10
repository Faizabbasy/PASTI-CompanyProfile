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
useCardTilt(cardRef, { strength: 7, lift: 1.035, baseRotate: props.tiltDeg ?? 0 })

const shineRef = ref<HTMLElement | null>(null)

// Depth + shine: on top of useCardTilt's 3D tilt, the card's own shadow
// grows into a much heavier, more diffuse cast on hover (reads as
// "lifting off the page" rather than just scaling up), and a diagonal
// light band sweeps across following the cursor — the glass/premium-card
// treatment common to 2025-era product UI. Driven by CSS custom
// properties written on pointermove rather than a GSAP tween per frame,
// since it's just property writes, no interpolation needed.
function handlePointerMove(event: PointerEvent) {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  el.style.setProperty('--spotlight-x', `${px}px`)
  el.style.setProperty('--spotlight-y', `${py}px`)
  // Shine band angle/position tracks horizontal cursor position across
  // the card width, so it reads as sweeping with the pointer.
  el.style.setProperty('--shine-pos', `${(px / rect.width) * 160 - 30}%`)
}

const REST_SHADOW = '0 30px 60px -30px rgba(0,0,0,0.5)'
const HOVER_SHADOW = '0 50px 90px -25px rgba(0,0,0,0.65)'

onMounted(() => {
  if (!import.meta.client) return

  const el = cardRef.value
  if (!el) return

  gsap.set(el, { boxShadow: REST_SHADOW })

  if (!window.matchMedia('(pointer: fine)').matches) return

  el.addEventListener('pointermove', handlePointerMove)
  el.addEventListener('pointerenter', () => {
    gsap.to(glowRef.value, { opacity: 1, duration: 0.3 })
    gsap.to(shineRef.value, { opacity: 1, duration: 0.3 })
    gsap.to(el, { boxShadow: HOVER_SHADOW, duration: 0.4, ease: motionEase.standard })
  })
  el.addEventListener('pointerleave', () => {
    gsap.to(glowRef.value, { opacity: 0, duration: 0.4 })
    gsap.to(shineRef.value, { opacity: 0, duration: 0.4 })
    gsap.to(el, { boxShadow: REST_SHADOW, duration: 0.5, ease: motionEase.soft })
  })

  onBeforeUnmount(() => {
    el.removeEventListener('pointermove', handlePointerMove)
  })
})
</script>

<template>
  <div
    ref="cardRef"
    class="testimonial-card group relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-navy-800 bg-navy-900 p-8 transition-[border-color] duration-500 ease-editorial hover:border-yellow-500/40 md:p-10"
    style="--spotlight-x: 50%; --spotlight-y: 50%; --shine-pos: 50%"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <!-- Cursor-following spotlight glow, positioned via CSS custom
         properties written on pointermove (see handlePointerMove). -->
    <div
      ref="glowRef"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-0"
      style="background: radial-gradient(360px circle at var(--spotlight-x) var(--spotlight-y), rgba(250, 204, 21, 0.1), transparent 70%)"
    />

    <!-- Diagonal shine band, sweeping horizontally with the cursor — the
         glass/premium-card highlight treatment. -->
    <div
      ref="shineRef"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-0"
      style="background: linear-gradient(115deg, transparent calc(var(--shine-pos) - 12%), rgba(255,255,255,0.06) var(--shine-pos), transparent calc(var(--shine-pos) + 12%))"
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
