<script setup lang="ts">
import gsap from 'gsap'

// Curves polish B — sequenced multi-stroke choreography. Each stroke gets
// its own directed beat: some draw start-to-end, some end-to-start (achieved
// by flipping which end is the dash offset origin), the square accent
// morphs its corner radius in after landing, and the yellow accent line
// pulses gently forever — reads as a short directed sequence rather than
// one uniform stagger.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const curveA = rootRef.value.querySelector<SVGPathElement>('[data-curve-a]')
  const curveB = rootRef.value.querySelector<SVGPathElement>('[data-curve-b]')
  const square = rootRef.value.querySelector<SVGRectElement>('[data-square]')
  const ring = rootRef.value.querySelector<SVGCircleElement>('[data-ring]')
  const accentLine = rootRef.value.querySelector<SVGPathElement>('[data-accent-line]')
  const ticks = rootRef.value.querySelector<SVGPathElement>('[data-ticks]')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const all = [curveA, curveB, square, ring, accentLine, ticks].filter(Boolean) as SVGGraphicsElement[]
  if (prefersReducedMotion) {
    gsap.set(all, { opacity: 0.5 })
    return
  }

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

  ;[curveA, curveB, accentLine, ticks].forEach((path) => {
    if (!path) return
    const length = (path as SVGGeometryElement).getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
  })
  if (square) gsap.set(square, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' })
  if (ring) gsap.set(ring, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' })

  // Beat 1: primary curve draws in.
  tl.to(curveA, { strokeDashoffset: 0, duration: 1.6 })
  // Beat 2 (overlapping tail): secondary curve draws from the opposite feel.
  tl.to(curveB, { strokeDashoffset: 0, duration: 1.4 }, '-=0.9')
  // Beat 3: square pops in with a slight overshoot.
  tl.to(square, { opacity: 0.85, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.5')
  // Beat 4: ring settles in behind it.
  tl.to(ring, { opacity: 0.5, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, '-=0.4')
  // Beat 5: accent line + ticks draw in fast, like an annotation landing.
  tl.to([accentLine, ticks], { strokeDashoffset: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')

  // Ongoing: yellow accent pulses softly forever.
  if (accentLine) {
    tl.to(accentLine, { opacity: 0.4, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  }
  // Ongoing: the whole scene breathes with a very slow scale.
  tl.to(rootRef.value, { scale: 1.015, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' }, 0)

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
      <path data-curve-a="" d="M100 650 C 300 500, 500 750, 750 550 S 1100 350, 1150 200" stroke="#0B3954" stroke-width="1.5" />
      <path data-curve-b="" d="M-50 200 C 200 100, 400 300, 650 150 S 1000 50, 1250 180" stroke="#0B3954" stroke-width="1" opacity="0.6" />
      <rect data-square="" x="150" y="100" width="200" height="200" stroke="#FBBA00" stroke-width="1.5" rx="4" />
      <circle data-ring="" cx="950" cy="550" r="90" stroke="#0B3954" stroke-width="1" opacity="0.5" />
      <path data-accent-line="" d="M850 650 L 1050 450" stroke="#FBBA00" stroke-width="1.5" />
      <path data-ticks="" d="M50 450 L 250 450 M150 350 L 150 550" stroke="#0B3954" stroke-width="1" opacity="0.4" />
    </svg>
  </div>
</template>
