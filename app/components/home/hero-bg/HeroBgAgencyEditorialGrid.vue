<script setup lang="ts">
import gsap from 'gsap'

// Agency — Editorial grid with animated rulers. A restrained, print-
// inspired column grid (like a design studio's own site background) where
// the grid lines themselves draw in on load, plus small rotating
// "crop mark"-style ticks at intersections and a coordinate readout label
// that follows the cursor — a detail borrowed from portfolio sites that
// lean into a technical/design-process aesthetic.
const rootRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const verticals = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-vline]'))
  const horizontals = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-hline]'))
  const ticks = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-tick]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set([...verticals, ...horizontals], { scaleY: 1, scaleX: 1 })
    gsap.set(ticks, { opacity: 1 })
    return
  }

  gsap.set(verticals, { scaleY: 0, transformOrigin: 'top' })
  gsap.set(horizontals, { scaleX: 0, transformOrigin: 'left' })
  gsap.set(ticks, { opacity: 0, rotate: -45 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  tl.to(verticals, { scaleY: 1, duration: 1, stagger: 0.08 })
  tl.to(horizontals, { scaleX: 1, duration: 1, stagger: 0.08 }, '<0.2')
  tl.to(ticks, { opacity: 1, rotate: 0, duration: 0.5, stagger: 0.04 }, '-=0.4')

  const el = rootRef.value
  const label = labelRef.value
  function onPointerMove(e: PointerEvent) {
    if (!label) return
    const rect = el.getBoundingClientRect()
    const px = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const py = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    label.textContent = `X${px.toString().padStart(2, '0')} / Y${py.toString().padStart(2, '0')}`
    label.style.left = `${e.clientX - rect.left + 14}px`
    label.style.top = `${e.clientY - rect.top + 14}px`
    label.style.opacity = '1'
  }
  function onPointerLeave() {
    if (label) label.style.opacity = '0'
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  return () => {
    tl.kill()
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]">
    <div v-for="i in 5" :key="`v${i}`" data-vline="" class="absolute top-0 h-full w-px bg-navy-700" :style="{ left: `${(i / 6) * 100}%` }" />
    <div v-for="i in 3" :key="`h${i}`" data-hline="" class="absolute left-0 w-full h-px bg-navy-700" :style="{ top: `${(i / 4) * 100}%` }" />

    <div
      v-for="i in 8"
      :key="`t${i}`"
      data-tick=""
      class="absolute h-3 w-3 border border-navy-700"
      :style="{ left: `${((i % 4) + 1) * 20}%`, top: `${i < 4 ? 25 : 75}%` }"
    />

    <span
      ref="labelRef"
      class="absolute whitespace-nowrap rounded bg-navy-900 px-2 py-1 font-mono text-[10px] text-paper opacity-0 transition-opacity duration-200"
    />
  </div>
</template>
