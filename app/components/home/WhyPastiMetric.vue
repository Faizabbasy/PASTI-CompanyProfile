<script setup lang="ts">
import gsap from 'gsap'
import type { WhyPastiMetric } from '~/composables/useWhyPasti'

const props = defineProps<{ metric: WhyPastiMetric; tone: 'navy' | 'yellow' }>()

const cardRef = ref<HTMLElement | null>(null)
const valueRef = ref<HTMLElement | null>(null)
const iconRef = ref<HTMLElement | null>(null)

const accent = props.tone === 'navy' ? 'border-navy-700' : 'border-yellow-600'

useCardTilt(cardRef, { strength: 6, lift: 1.03 })
useScrollReveal(cardRef, { y: 24 })
useMaskedReveal(valueRef, { by: 'line' })

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
    class="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-3xl p-8"
    :class="tone === 'navy' ? 'bg-navy-50' : 'bg-yellow-50'"
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
      <p v-if="metric.value" ref="valueRef" class="font-display text-display-md font-semibold text-ink">
        {{ metric.value }}
      </p>
      <p
        class="text-body-sm uppercase tracking-widest text-navy-500"
        :class="metric.value ? 'mt-2' : 'text-body-lg normal-case tracking-normal text-ink'"
      >
        {{ metric.label }}
      </p>
    </div>
  </div>
</template>
