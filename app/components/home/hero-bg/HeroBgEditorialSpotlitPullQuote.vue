<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Inspired by Iventions' Awwwards Site of the Day: a spotlit
// gallery installation, one hero form under a single dominant light,
// GSAP-paced reveal cues. This category's 3D sibling (HeroBgThreeSpotlit
// Installation) stages a physical object under a THREE.SpotLight; here the
// same "reading lamp" idea is applied purely to type — a large pull-quote
// phrase sits mostly dim/desaturated, masked by a soft warm radial-gradient
// "light" that sweeps slowly and deliberately across it on a GSAP timeline,
// briefly bringing the type into full sharp navy contrast as the light
// passes over each word, like a page read under a lamp in a dark room.
const rootRef = ref<HTMLElement | null>(null)
const lightRef = ref<HTMLElement | null>(null)
const revealRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !lightRef.value || !revealRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsap.set(lightRef.value, { xPercent: -50, yPercent: -50, left: '20%', top: '50%' })

  if (prefersReducedMotion) {
    gsap.set(lightRef.value, { opacity: 0 })
    gsap.set(revealRef.value, { opacity: 0 })
    return
  }

  // Position state driven by GSAP; onUpdate writes it into CSS custom
  // properties so the reveal mask tracks the same coordinates as the
  // visible warm-light glow, keeping the "sharp under the lamp" area in
  // sync with where the light actually sits.
  const pos = { x: 20, y: 50 }
  function applyMaskPosition() {
    revealRef.value!.style.setProperty('--lx', `${pos.x}%`)
    revealRef.value!.style.setProperty('--ly', `${pos.y}%`)
  }
  applyMaskPosition()

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } })
  tl.to(lightRef.value, { left: '80%', duration: 5.5 })
    .to(pos, { x: 80, duration: 5.5, onUpdate: applyMaskPosition }, '<')
    .to(lightRef.value, { top: '30%', duration: 2.4 }, '<')
    .to(pos, { y: 30, duration: 2.4, onUpdate: applyMaskPosition }, '<')
    .to(lightRef.value, { left: '20%', top: '65%', duration: 5.5 }, '+=0.3')
    .to(pos, { x: 20, y: 65, duration: 5.5, onUpdate: applyMaskPosition }, '<')
    .to(lightRef.value, { top: '50%', duration: 2 }, '<0.5')
    .to(pos, { y: 50, duration: 2, onUpdate: applyMaskPosition }, '<')

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden bg-navy-900/[0.02]">
    <!-- The dim, low-contrast pull quote — reads as a shadowed page. -->
    <div class="absolute inset-0 flex items-center justify-center px-[8%]">
      <p class="select-none text-center font-display text-[7vw] font-extrabold leading-[1.02] tracking-tight text-navy-900 opacity-[0.05]">
        &ldquo;Where technology meets creativity, impact follows.&rdquo;
      </p>
    </div>

    <!-- The warm light mask: a radial gradient div that only lifts opacity
         of the underlying text via mix-blend, sweeping via GSAP-driven
         left/top percentages set above. -->
    <div class="absolute inset-0 overflow-hidden [mask-image:linear-gradient(#000,#000)]">
      <div
        ref="lightRef"
        class="absolute h-[55vw] w-[55vw] rounded-full opacity-90 mix-blend-soft-light"
        style="background: radial-gradient(circle, rgba(251,186,0,0.35) 0%, rgba(251,186,0,0.12) 35%, rgba(251,186,0,0) 70%)"
      />
    </div>

    <div
      ref="revealRef"
      class="absolute inset-0 flex items-center justify-center px-[8%] [mask-image:radial-gradient(circle_at_var(--lx,50%)_var(--ly,50%),black_0%,transparent_60%)]"
    >
      <p class="select-none text-center font-display text-[7vw] font-extrabold leading-[1.02] tracking-tight text-navy-900 opacity-40">
        &ldquo;Where technology meets creativity, impact follows.&rdquo;
      </p>
    </div>
  </div>
</template>
