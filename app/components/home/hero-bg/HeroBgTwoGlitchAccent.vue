<script setup lang="ts">
import gsap from 'gsap'

// 2D — RGB-split glitch accent. Three offset copies of a geometric shape
// cluster (cyan/magenta/yellow channel-style, tinted to brand navy/yellow
// instead of literal RGB for taste), glitch-shifting on a randomized
// interval rather than a fixed loop — bursts of 2-4 quick displacement
// "cuts" then a long calm hold, mimicking a broadcast/signal-error look
// popular in Awwwards tech/agency sites. Idle state (between glitches) is
// a calm static shape cluster with a slow rotation.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const layerA = rootRef.value.querySelector<SVGGElement>('[data-layer-a]')
  const layerB = rootRef.value.querySelector<SVGGElement>('[data-layer-b]')
  const layerC = rootRef.value.querySelector<SVGGElement>('[data-layer-c]')
  const group = rootRef.value.querySelector<SVGGElement>('[data-group]')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  gsap.to(group, { rotate: 360, duration: 90, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

  function glitchBurst() {
    const cuts = 2 + Math.floor(Math.random() * 3)
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(1.8 + Math.random() * 2.6, glitchBurst)
      }
    })
    for (let i = 0; i < cuts; i++) {
      const dx = (Math.random() - 0.5) * 24
      const dy = (Math.random() - 0.5) * 8
      tl.to(layerA, { x: dx, duration: 0.04, ease: 'none' })
      tl.to(layerB, { x: -dx * 0.8, duration: 0.04, ease: 'none' }, '<')
      tl.to(layerC, { y: dy, duration: 0.04, ease: 'none' }, '<')
      tl.to([layerA, layerB, layerC], { x: 0, y: 0, duration: 0.06, ease: 'power2.out' })
      tl.to({}, { duration: 0.05 + Math.random() * 0.08 })
    }
  }
  gsap.delayedCall(1, glitchBurst)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
      <g data-group="" transform="translate(850 350)">
        <g data-layer-c="">
          <polygon points="0,-140 130,-40 80,120 -80,120 -130,-40" stroke="#FBBA00" stroke-width="1.5" opacity="0.5" />
        </g>
        <g data-layer-b="">
          <polygon points="0,-140 130,-40 80,120 -80,120 -130,-40" stroke="#0B3954" stroke-width="1.5" opacity="0.6" />
        </g>
        <g data-layer-a="">
          <polygon points="0,-140 130,-40 80,120 -80,120 -130,-40" stroke="#0B3954" stroke-width="1.75" opacity="0.9" />
          <circle r="4" fill="#FBBA00" stroke="none" />
        </g>
      </g>
    </svg>
  </div>
</template>
