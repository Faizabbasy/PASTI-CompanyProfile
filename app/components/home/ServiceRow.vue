<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Service } from '~/composables/useServices'

const props = defineProps<{ service: Service; shape: 'diagonal' | 'chevron' | 'radial' }>()

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
          duration: 0.6,
          ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
        })
        gsap.to(bodyText, {
          y: self.isActive ? 0 : 16,
          opacity: self.isActive ? 1 : 0,
          duration: 0.5,
          delay: self.isActive ? 0.15 : 0,
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
  <div
    ref="rowRef"
    class="group relative grid grid-cols-1 gap-6 overflow-hidden rounded-2xl p-8 transition-colors duration-400 ease-editorial md:grid-cols-12 md:items-start md:gap-8 md:p-12"
    :class="isOpen ? 'bg-navy-800' : 'bg-navy-50'"
    @mouseenter="setState('link')"
    @mouseleave="setState('default')"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-0 transition-opacity duration-400 ease-editorial"
      :class="[isOpen ? 'opacity-100' : 'opacity-0', `service-shape-${props.shape}`]"
    />

    <div class="relative flex items-start justify-between md:col-span-7 md:block">
      <h3
        class="text-display-sm font-display font-semibold transition-all duration-400 ease-editorial"
        :class="isOpen ? 'translate-x-2 text-paper' : 'text-ink'"
      >
        {{ service.title }}
      </h3>
      <span
        class="font-display text-2xl font-semibold transition-all duration-400 ease-editorial md:hidden"
        :class="isOpen ? 'scale-110 text-navy-500' : 'text-navy-200'"
        aria-hidden="true"
      >
        {{ service.index }}
      </span>
    </div>

    <div ref="bodyRef" class="relative overflow-hidden md:col-span-4">
      <p ref="bodyTextRef" class="text-body-md" :class="isOpen ? 'text-navy-100' : 'text-muted'">
        {{ service.body }}
      </p>
    </div>

    <div class="relative hidden items-start justify-end gap-10 md:col-span-1 md:flex">
      <span
        class="font-display text-3xl font-semibold transition-all duration-400 ease-editorial"
        :class="isOpen ? 'scale-110 text-navy-500' : 'text-navy-200'"
        aria-hidden="true"
      >
        {{ service.index }}
      </span>
    </div>

    <NuxtLink
      to="/technology"
      class="relative inline-flex items-center gap-2 font-display text-sm font-semibold transition-colors duration-400 ease-editorial md:col-span-12 md:mt-2"
      :class="isOpen ? 'text-paper' : 'text-ink'"
    >
      {{ service.cta }}
      <span
        aria-hidden="true"
        class="inline-block transition-all duration-400 ease-editorial"
        :class="isOpen ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-0'"
      >→</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.service-shape-diagonal {
  background: linear-gradient(115deg, transparent 40%, rgba(251, 186, 0, 0.12) 55%, transparent 70%);
}

.service-shape-chevron {
  background:
    linear-gradient(225deg, transparent 48%, rgba(251, 186, 0, 0.14) 49%, rgba(251, 186, 0, 0.14) 51%, transparent 52%),
    linear-gradient(135deg, transparent 48%, rgba(251, 186, 0, 0.14) 49%, rgba(251, 186, 0, 0.14) 51%, transparent 52%);
}

.service-shape-radial {
  background: radial-gradient(circle at 75% 50%, rgba(251, 186, 0, 0.16), transparent 60%);
}
</style>
