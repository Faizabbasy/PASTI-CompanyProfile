<script setup lang="ts">
import gsap from 'gsap'

// Agency — Split-screen color block reveal. Several full-height color
// panels wipe in from alternating edges on load (like a portfolio site's
// section transition borrowed as a background texture), settle into thin
// vertical bands, then very slowly breathe their widths — a strong,
// confident geometric statement rather than a soft ambient effect.
const rootRef = ref<HTMLElement | null>(null)

const blocks = [
  { color: '#0B3954', from: 'left' as const, width: 8 },
  { color: '#FBBA00', from: 'right' as const, width: 3 },
  { color: '#0B3954', from: 'left' as const, width: 4 },
  { color: '#1C5E7C', from: 'right' as const, width: 6 }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-block]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(els, { scaleY: 1 })
    return
  }

  gsap.set(els, { scaleY: 0, transformOrigin: (i) => (blocks[i]!.from === 'left' ? '0% 0%' : '0% 100%') })

  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
  tl.to(els, { scaleY: 1, duration: 1.1, stagger: 0.12 })

  els.forEach((el, i) => {
    gsap.to(el, {
      scaleX: 0.85 + Math.random() * 0.3,
      duration: 8 + i * 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.3 + i * 0.2
    })
  })

  return () => tl.kill()
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 flex overflow-hidden opacity-[0.08]">
    <div
      v-for="(b, i) in blocks"
      :key="i"
      data-block=""
      class="h-full"
      :style="{ width: `${b.width}%`, backgroundColor: b.color, transformOrigin: b.from === 'left' ? 'top' : 'bottom' }"
    />
  </div>
</template>
