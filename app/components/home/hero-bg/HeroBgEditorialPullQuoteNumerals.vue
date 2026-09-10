<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Pull-quote numeral texture. A single oversized numeral set
// like a magazine pull-quote folio (the giant "01" a print feature spread
// uses to mark a section), tucked into a corner with a small uppercase
// caption line beneath it for editorial credibility. Pure background
// texture: low opacity, a gentle fade/rise on load, no continuous motion.
const rootRef = ref<HTMLElement | null>(null)
const numeralRef = ref<HTMLElement | null>(null)
const captionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!numeralRef.value || !captionRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return

  gsap.set(numeralRef.value, { opacity: 0, y: 32 })
  gsap.set(captionRef.value, { opacity: 0, y: 12 })

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.to(numeralRef.value, { opacity: 1, y: 0, duration: 1.4 })
  tl.to(captionRef.value, { opacity: 1, y: 0, duration: 1 }, '-=0.9')

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute bottom-[6%] right-[5%] flex flex-col items-end">
      <span
        ref="numeralRef"
        class="select-none font-display text-[22vw] font-extrabold leading-none tracking-tighter text-navy-900 opacity-[0.06]"
      >
        01
      </span>
      <span
        ref="captionRef"
        class="mt-3 mr-2 font-display text-eyebrow font-semibold uppercase tracking-[0.3em] text-navy-700 opacity-[0.14]"
      >
        Field Note
      </span>
    </div>
  </div>
</template>
