<script setup lang="ts">
import gsap from 'gsap'
import type { WhyPastiMetric } from '~/composables/useWhyPasti'

const props = defineProps<{ metric: WhyPastiMetric; tone: 'navy' | 'yellow' }>()

const cardRef = ref<HTMLElement | null>(null)
const valueRef = ref<HTMLElement | null>(null)
const iconRef = ref<HTMLElement | null>(null)

const accent = props.tone === 'navy' ? 'border-navy-700' : 'border-yellow-600'
const cardTone = props.tone === 'navy'
  ? 'bg-gradient-to-br from-navy-50 via-navy-50 to-navy-100/80 shadow-[0_20px_45px_-25px_rgba(15,30,60,0.35)] ring-1 ring-navy-900/[0.04]'
  : 'bg-gradient-to-br from-yellow-50 via-yellow-50 to-yellow-100/70 shadow-[0_20px_45px_-25px_rgba(120,90,0,0.25)] ring-1 ring-yellow-900/[0.05]'
const numericMatch = props.metric.value?.match(/^(\d+)(.*)$/)
const numericValue = numericMatch ? Number.parseInt(numericMatch[1]!, 10) : null
const suffix = numericMatch ? numericMatch[2]! : ''

useCardTilt(cardRef, { strength: 6, lift: 1.03 })
useScrollReveal(cardRef, { y: 24 })

// Monumental numeric field: the value isn't a bare count-up — it grows from
// a small, blurred scale into sharp focus as it counts, like a camera
// racking focus onto a monument (LARGE_SCALE_MOTION_PLAN.md section 7).
if (numericValue !== null) {
  useCountUp(valueRef, { value: numericValue, format: (n) => `${Math.round(n)}${suffix}` })

  useGsapContext(() => {
    const el = valueRef.value
    if (!el) return
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(el, { scale: 0.7, filter: 'blur(6px)', opacity: 0.4, transformOrigin: '0% 50%' })

      const anim = gsap.to(el, {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 3.2,
        ease: motionEase.count,
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'restart none restart reverse' }
      })

      return () => anim.kill()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(el, { scale: 1, filter: 'blur(0px)', opacity: 1 })
    })
  })
} else {
  useMaskedReveal(valueRef, { by: 'line' })
}

useGsapContext(() => {
  if (!iconRef.value || !cardRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(iconRef.value, { opacity: 0, scale: 0.6, transformOrigin: '0% 50%' })

    const anim = gsap.to(iconRef.value, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(2)',
      scrollTrigger: { trigger: cardRef.value, start: 'top 85%', toggleActions: 'restart none restart reverse' }
    })

    return () => anim.kill()
  })
})
</script>

<template>
  <div
    ref="cardRef"
    class="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-3xl p-8 transition-shadow duration-500 ease-editorial"
    :class="cardTone"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute left-5 top-5 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 opacity-0 transition-opacity duration-500 ease-editorial group-hover:opacity-100"
      :class="accent"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-5 right-5 h-6 w-6 rounded-br-lg border-b-2 border-r-2 opacity-0 transition-opacity duration-500 ease-editorial group-hover:opacity-100"
      :class="accent"
    />

    <span ref="iconRef" class="text-navy-700" aria-hidden="true" v-html="metric.icon" />

    <div>
      <p v-if="metric.value" ref="valueRef" class="font-display text-display-xl font-bold leading-none tracking-tight text-ink">
        {{ metric.value }}
      </p>
      <p
        class="text-body-sm uppercase tracking-widest text-navy-500"
        :class="metric.value ? 'mt-4' : 'text-body-lg normal-case tracking-normal text-ink'"
      >
        {{ metric.label }}
      </p>
    </div>
  </div>
</template>
