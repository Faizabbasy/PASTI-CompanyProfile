<script setup lang="ts">
import gsap from 'gsap'

// 2D — Inspired by Active Theory's signature "cursor-driven interaction,
// text/visual distortion, elements shift as you hover" (their reactive-
// cursor / interactive type-distortion work, usually WebGL/mesh-deform —
// re-built here as a DOM grid since 2D has no shaders). A loose grid of
// small brand-relevant glyphs (letters + a few symbols) each gets its own
// GSAP tween driven every pointermove tick: distance-to-cursor maps through
// a smooth falloff to scale/rotate/skew, so marks near the cursor genuinely
// warp and marks far away stay flat — not a spotlight mask, a per-element
// reaction.
const rootRef = ref<HTMLElement | null>(null)

const GLYPHS = ['P', 'A', 'S', 'T', 'I', '+', '×', 'O', '/', '#']
const COLS = 14
const ROWS = 9
const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
  x: ((i % COLS) + 0.5) / COLS * 100,
  y: (Math.floor(i / COLS) + 0.5) / ROWS * 100,
  char: GLYPHS[i % GLYPHS.length]
}))

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const root = rootRef.value
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-glyph]'))
  if (!els.length) return

  if (prefersReducedMotion) return

  const RADIUS = 20 // falloff radius in percentage units of the container

  function onPointerMove(e: PointerEvent) {
    const rect = root.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100

    cells.forEach((cell, i) => {
      const el = els[i]
      if (!el) return
      const dx = cell.x - px
      const dy = cell.y - py
      const dist = Math.hypot(dx, dy)
      const t = Math.max(0, 1 - dist / RADIUS)

      if (t > 0.01) {
        const scale = 1 + t * 1.6
        const rot = (dx >= 0 ? 1 : -1) * t * 28
        const skew = (dy >= 0 ? 1 : -1) * t * 14
        gsap.to(el, {
          scale,
          rotate: rot,
          skewX: skew,
          opacity: 0.05 + t * 0.5,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      } else {
        gsap.to(el, {
          scale: 1,
          rotate: 0,
          skewX: 0,
          opacity: 0.08,
          duration: 0.9,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      }
    })
  }

  function onPointerLeave() {
    gsap.to(els, {
      scale: 1,
      rotate: 0,
      skewX: 0,
      opacity: 0.08,
      duration: 0.9,
      ease: 'power2.out',
      overwrite: 'auto'
    })
  }

  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerleave', onPointerLeave)

  return () => {
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      v-for="(cell, i) in cells"
      :key="i"
      data-glyph=""
      class="absolute select-none font-display font-bold leading-none text-navy-900 opacity-[0.08]"
      :style="{ left: `${cell.x}%`, top: `${cell.y}%`, fontSize: '1.6vw', transform: 'translate(-50%, -50%)' }"
    >{{ cell.char }}</span>
  </div>
</template>
