<script setup lang="ts">
import gsap from 'gsap'

// Motion — Floating blurred orbs with physics-feeling drift. Unlike a
// CSS-keyframe blob loop (which repeats identically), each orb's path is
// driven by GSAP tweening toward freshly randomized targets on completion
// (so the motion never visibly loops), with duration/ease varied per orb
// and a gentle cursor-repulsion layered on top — orbs "avoid" the pointer
// like soap bubbles, then drift back to wandering.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const orbs = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-orb]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  function wander(el: HTMLElement) {
    gsap.to(el, {
      xPercent: -20 + Math.random() * 40,
      yPercent: -20 + Math.random() * 40,
      scale: 0.85 + Math.random() * 0.3,
      duration: 10 + Math.random() * 8,
      ease: 'sine.inOut',
      onComplete: () => wander(el)
    })
  }
  orbs.forEach((el, i) => gsap.delayedCall(i * 0.4, () => wander(el)))

  const el = rootRef.value
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100

    orbs.forEach((orb) => {
      const orbRect = orb.getBoundingClientRect()
      const ox = ((orbRect.left + orbRect.width / 2 - rect.left) / rect.width) * 100
      const oy = ((orbRect.top + orbRect.height / 2 - rect.top) / rect.height) * 100
      const dx = ox - px
      const dy = oy - py
      const dist = Math.hypot(dx, dy)
      if (dist < 20) {
        const push = (1 - dist / 20) * 12
        gsap.to(orb, {
          x: `+=${(dx / (dist || 1)) * push}`,
          y: `+=${(dy / (dist || 1)) * push}`,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      }
    })
  }
  el.addEventListener('pointermove', onPointerMove)

  return () => el.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div data-orb="" class="orb orb-1" />
    <div data-orb="" class="orb orb-2" />
    <div data-orb="" class="orb orb-3" />
  </div>
</template>

<style scoped>
.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(50px);
  will-change: transform;
}

.orb-1 {
  left: 12%;
  top: 15%;
  width: 34vw;
  height: 34vw;
  max-width: 480px;
  max-height: 480px;
  background: radial-gradient(circle at 40% 40%, theme(colors.yellow.200 / 70%), theme(colors.yellow.400 / 0%) 70%);
}

.orb-2 {
  right: 8%;
  top: 30%;
  width: 26vw;
  height: 26vw;
  max-width: 380px;
  max-height: 380px;
  background: radial-gradient(circle at 40% 40%, theme(colors.navy.200 / 60%), theme(colors.navy.400 / 0%) 70%);
}

.orb-3 {
  left: 38%;
  bottom: -5%;
  width: 22vw;
  height: 22vw;
  max-width: 320px;
  max-height: 320px;
  background: radial-gradient(circle at 40% 40%, theme(colors.yellow.100 / 50%), transparent 70%);
}
</style>
