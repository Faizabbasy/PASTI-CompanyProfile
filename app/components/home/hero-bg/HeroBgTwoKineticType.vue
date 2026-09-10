<script setup lang="ts">
import gsap from 'gsap'

// 2D — Kinetic word-cloud drift. Oversized, low-opacity brand words
// ("TECHNOLOGY", "CREATIVITY", "IMPACT", "PASTI") set as background type,
// each drifting independently along its own slow bezier-ish path and
// slightly scaling, overlapping to build depth — a technique from
// editorial/agency sites that use giant type as texture rather than
// message. Cursor pushes the nearest word away with an elastic return.
const rootRef = ref<HTMLElement | null>(null)

const words = [
  { text: 'TECHNOLOGY', x: 14, y: 22, size: 7, weight: 800, opacity: 0.05 },
  { text: 'CREATE', x: 68, y: 68, size: 9, weight: 800, opacity: 0.045 },
  { text: 'IMPACT', x: 72, y: 18, size: 6, weight: 800, opacity: 0.05 },
  { text: 'PASTI', x: 10, y: 74, size: 8, weight: 800, opacity: 0.04 }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-word]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return

  els.forEach((el, i) => {
    gsap.to(el, {
      x: `+=${20 + i * 6}`,
      y: `+=${-14 - i * 4}`,
      duration: 14 + i * 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
    gsap.to(el, {
      rotate: (i % 2 === 0 ? 1 : -1) * 2.5,
      duration: 18 + i * 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
  })

  const el = rootRef.value
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100

    words.forEach((w, i) => {
      const target = els[i]
      if (!target) return
      const dx = w.x - px
      const dy = w.y - py
      const dist = Math.hypot(dx, dy)
      if (dist < 22) {
        const push = (1 - dist / 22) * 30
        gsap.to(target, {
          x: (dx / (dist || 1)) * push,
          y: (dy / (dist || 1)) * push,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto'
        })
      } else {
        gsap.to(target, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
      }
    })
  }
  el.addEventListener('pointermove', onPointerMove)

  return () => el.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(w, i) in words"
      :key="i"
      data-word=""
      class="absolute select-none whitespace-nowrap font-display leading-none text-navy-900"
      :style="{
        left: `${w.x}%`,
        top: `${w.y}%`,
        fontSize: `${w.size}vw`,
        fontWeight: w.weight,
        opacity: w.opacity
      }"
    >
      {{ w.text }}
    </div>
  </div>
</template>
