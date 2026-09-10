<script setup lang="ts">
import gsap from 'gsap'

// Agency — Print/design-system "index grid" overlay. Thin column guide
// lines divide the hero like a layout grid, with small corner tick-marks
// and tiny rotated coordinate labels ("01", "N 6.2° / E 106.8°") sitting
// at intersections — the "we're precise, structural" signature seen on
// premium studio sites that expose their own grid as decoration. Labels
// idle-fade in and out slowly and independently so the overlay never
// reads as static, but everything stays extremely low-opacity.
const rootRef = ref<HTMLElement | null>(null)

const COLS = 6
const labels = [
  '01', 'N 6.2° / E 106.8°', '02', '03',
  'N 6.2° / E 106.8°', '04', '05', 'N 6.2° / E 106.8°'
]

useGsapContext(() => {
  if (!rootRef.value) return
  const vlines = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-vline]'))
  const idxLabels = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-idx-label]'))
  const ticks = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-corner-tick]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(vlines, { scaleY: 1 })
    gsap.set(ticks, { opacity: 1 })
    gsap.set(idxLabels, { opacity: 0.35 })
    return
  }

  gsap.set(vlines, { scaleY: 0, transformOrigin: 'top' })
  gsap.set(ticks, { opacity: 0 })
  gsap.set(idxLabels, { opacity: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  tl.to(vlines, { scaleY: 1, duration: 1.1, stagger: 0.07 })
  tl.to(ticks, { opacity: 1, duration: 0.5, stagger: 0.03 }, '-=0.5')
  tl.to(idxLabels, { opacity: 0.35, duration: 0.6, stagger: 0.05 }, '-=0.3')

  const idleTweens = idxLabels.map((label, i) =>
    gsap.to(label, {
      opacity: () => 0.08 + Math.random() * 0.3,
      duration: 3 + Math.random() * 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.7 + i * 0.15
    })
  )

  return () => {
    tl.kill()
    idleTweens.forEach((t) => t.kill())
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12]">
    <div
      v-for="i in COLS - 1"
      :key="`v${i}`"
      data-vline=""
      class="absolute top-0 h-full w-px bg-navy-700"
      :style="{ left: `${(i / COLS) * 100}%` }"
    />

    <div
      v-for="i in 4"
      :key="`ct${i}`"
      data-corner-tick=""
      class="absolute h-2 w-2 border-l border-t border-navy-700"
      :style="{
        left: i % 2 === 0 ? 'calc(100% - 18px)' : '18px',
        top: i < 3 ? '18px' : 'calc(100% - 18px)',
        transform: `rotate(${i === 1 ? 0 : i === 2 ? 90 : i === 3 ? 270 : 180}deg)`
      }"
    />

    <span
      v-for="(label, i) in labels"
      :key="`idx${i}`"
      data-idx-label=""
      class="absolute whitespace-nowrap font-mono text-[9px] tracking-wide text-navy-700"
      :style="{
        left: `${((i % COLS) / COLS) * 100 + 1.5}%`,
        top: `${i < COLS ? 10 : 90}%`,
        transform: 'rotate(-90deg)',
        transformOrigin: 'left top'
      }"
    >
      {{ label }}
    </span>
  </div>
</template>
