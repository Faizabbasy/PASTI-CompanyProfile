<script setup lang="ts">
import gsap from 'gsap'

// Agency — Oversized cropped wordmark. A single brand word set massively
// larger than the viewport so only letter fragments are ever visible,
// aggressively cropped by the hero edges — a bold-oversized-type move seen
// across 2026 studio-site trends. A very slow horizontal drift shifts
// which fragments are on-screen over time, so the composition keeps
// quietly changing without ever reading as "text to read."
const rootRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!wordRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(wordRef.value, { xPercent: -8 })
    return
  }

  const tween = gsap.to(wordRef.value, {
    xPercent: -22,
    duration: 26,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  })

  return () => tween.kill()
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      ref="wordRef"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[42vw] font-extrabold leading-none tracking-tight text-navy-900 opacity-[0.05]"
    >
      IMPACT
    </span>
  </div>
</template>
