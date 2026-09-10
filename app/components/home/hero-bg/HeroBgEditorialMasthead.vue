<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Magazine masthead texture. The brand name set in a huge,
// heavy display weight and pushed off-center (never centered, the way a
// print masthead sits above a folio rule rather than in the middle of the
// page), paired with a thin horizontal rule like a nameplate underline.
// Sits at very low opacity so it reads as paper texture behind the real
// Hero heading, with a slow idle drift independent of scroll position.
const rootRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const ruleRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !nameRef.value || !ruleRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsap.set(ruleRef.value, { scaleX: 0, transformOrigin: 'left' })

  if (prefersReducedMotion) {
    gsap.set(ruleRef.value, { scaleX: 1 })
    return
  }

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
  tl.to(ruleRef.value, { scaleX: 1, duration: 1.4 })
  tl.from(nameRef.value, { opacity: 0, y: 24, duration: 1.2 }, '-=1')

  const drift = gsap.to(nameRef.value, {
    x: 18,
    y: -10,
    duration: 22,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  })

  return () => {
    tl.kill()
    drift.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute inset-x-0 top-[14%] flex flex-col items-end pr-[4%] opacity-[0.05]">
      <span
        ref="nameRef"
        class="select-none whitespace-nowrap font-display text-[16vw] font-extrabold leading-none tracking-tight text-navy-900"
      >
        PASTI
      </span>
      <div ref="ruleRef" class="mt-4 h-[3px] w-[42%] bg-navy-700" />
    </div>
  </div>
</template>
