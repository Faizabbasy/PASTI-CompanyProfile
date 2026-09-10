<script setup lang="ts">
import gsap from 'gsap'

// Line-art variant: one continuous flowing stroke plus a single accent dot
// that travels along it after the draw-in — minimal, calm, high-end-editorial
// rather than technical. The least "busy" of the three line-art options.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const path = rootRef.value.querySelector<SVGPathElement>('[data-draw]')
  const dot = rootRef.value.querySelector<SVGCircleElement>('[data-dot]')
  if (!path) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(path, { opacity: 0.5 })
    gsap.set(dot, { opacity: 0 })
    return
  }

  const length = path.getTotalLength()
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
  gsap.set(dot, { opacity: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  tl.to(path, { strokeDashoffset: 0, duration: 2.6 })
  if (dot) {
    tl.to(dot, { opacity: 1, duration: 0.3 }, '-=0.3')
    tl.to(
      {},
      {
        duration: 18,
        repeat: -1,
        onUpdate: function () {
          const progress = this.progress()
          const point = path.getPointAtLength(progress * length)
          gsap.set(dot, { x: point.x, y: point.y })
        }
      }
    )
  }

  return () => tl.kill()
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg
      ref="rootRef"
      class="absolute inset-0 h-full w-full opacity-70"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        data-draw=""
        d="M-50 500 C 150 300, 350 650, 550 450 S 850 150, 1000 350 S 1150 600, 1250 500"
        stroke="#0B3954"
        stroke-width="1.5"
      />
      <circle data-dot="" cx="0" cy="0" r="5" fill="#FBBA00" stroke="none" />
    </svg>
  </div>
</template>
