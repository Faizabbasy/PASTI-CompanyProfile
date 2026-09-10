<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Service } from '~/composables/useServices'

defineProps<{ service: Service }>()

const rowRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const bodyTextRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const { setState } = useCustomCursor()

useGsapContext(() => {
  const row = rowRef.value
  const body = bodyRef.value
  const bodyText = bodyTextRef.value
  if (!row || !body || !bodyText) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(body, { height: 0, opacity: 0 })
    gsap.set(bodyText, { y: 16, opacity: 0 })

    const st = ScrollTrigger.create({
      trigger: row,
      start: 'top 75%',
      end: 'bottom 35%',
      onToggle: (self) => {
        isOpen.value = self.isActive
        gsap.to(body, {
          height: self.isActive ? 'auto' : 0,
          opacity: self.isActive ? 1 : 0,
          duration: 0.85,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
        })
        gsap.to(bodyText, {
          y: self.isActive ? 0 : 16,
          opacity: self.isActive ? 1 : 0,
          duration: 0.65,
          delay: self.isActive ? 0.2 : 0,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
        })
      }
    })

    return () => st.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    isOpen.value = true
    gsap.set(body, { height: 'auto', opacity: 1 })
    gsap.set(bodyText, { y: 0, opacity: 1 })
  })
})
</script>

<template>
  <div ref="rowRef">
    <div
      class="group relative overflow-hidden rounded-2xl p-10 transition-colors duration-600 ease-editorial md:p-16"
      :class="isOpen ? 'bg-navy-800' : 'bg-navy-50'"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 right-0 w-2/5 opacity-0 transition-opacity duration-600 ease-editorial service-shape-bars"
        :class="isOpen ? 'opacity-100' : 'opacity-0'"
      />

      <div class="relative flex items-start justify-between gap-6">
        <h3
          class="text-display-md font-display font-semibold transition-all duration-400 ease-editorial"
          :class="isOpen ? 'translate-x-2 text-paper' : 'text-ink'"
        >
          {{ service.title }}
        </h3>
        <span
          class="font-display text-3xl font-semibold transition-all duration-400 ease-editorial md:text-4xl"
          :class="isOpen ? 'scale-110 text-navy-500' : 'text-navy-200'"
          aria-hidden="true"
        >
          {{ service.index }}
        </span>
      </div>

      <div ref="bodyRef" class="relative overflow-hidden">
        <p ref="bodyTextRef" class="mt-6 max-w-2xl text-body-lg" :class="isOpen ? 'text-navy-100' : 'text-muted'">
          {{ service.body }}
        </p>
      </div>

      <NuxtLink
        :to="service.category === 'creative' ? '/creative' : '/technology'"
        class="relative mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold transition-colors duration-400 ease-editorial"
        :class="isOpen ? 'text-paper hover:text-yellow-400' : 'text-ink hover:text-navy-500'"
        @mouseenter="setState('link')"
        @mouseleave="setState('default')"
      >
        {{ service.cta }}
        <span
          class="inline-block transition-all duration-400 ease-editorial"
          :class="isOpen ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-0'"
        >→</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.service-shape-bars {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(251, 186, 0, 0.05) 30%,
    rgba(251, 186, 0, 0.08) 50%,
    rgba(251, 186, 0, 0.13) 68%,
    rgba(251, 186, 0, 0.19) 84%,
    rgba(251, 186, 0, 0.24) 100%
  );
  mask-image: repeating-linear-gradient(90deg, #000 0, #000 6px, transparent 6px, transparent 14px);
  -webkit-mask-image: repeating-linear-gradient(90deg, #000 0, #000 6px, transparent 6px, transparent 14px);
}
</style>
