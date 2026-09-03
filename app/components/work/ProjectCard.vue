<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WorkProject } from '~/composables/useWorkPortfolio'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ project: WorkProject; reverse?: boolean }>()

const rowRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)
const detailRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()
const isOpen = ref(false)

let openTween: gsap.core.Tween | undefined
let supportsHover = false

onMounted(() => {
  supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
})

function handleMouseEnter() {
  if (supportsHover) isOpen.value = true
}

function handleMouseLeave() {
  if (supportsHover) isOpen.value = false
}

function handleClick() {
  if (supportsHover) return
  isOpen.value = !isOpen.value
}

watch(isOpen, (openState) => {
  const detail = detailRef.value
  if (!detail) return

  openTween?.kill()

  if (openState) {
    gsap.set(detail, { height: 'auto' })
    const targetHeight = detail.offsetHeight
    gsap.set(detail, { height: 0 })
    openTween = gsap.to(detail, { height: targetHeight, duration: 0.55, ease: 'power3.out', clearProps: 'height' })
  } else {
    openTween = gsap.to(detail, { height: 0, duration: 0.4, ease: 'power3.inOut' })
  }
})

useGsapContext(() => {
  const row = rowRef.value
  const media = mediaRef.value
  if (!row || !media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(row, { opacity: 1, clipPath: 'inset(0% round 20px)' })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(row, { opacity: 0, y: 32 })
    gsap.set(media, { clipPath: 'inset(6% round 20px)', scale: 1.08 })

    const entrance = gsap.timeline({
      scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'restart none restart reverse' }
    })
      .to(row, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
      .to(media, { clipPath: 'inset(0% round 20px)', scale: 1, duration: 1, ease: 'power3.out' }, '<')

    return () => entrance.kill()
  })

  onBeforeUnmount(() => mm.revert())
})
</script>

<template>
  <div
    ref="rowRef"
    class="group grid grid-cols-1 items-center gap-8 border-b border-navy-100 py-12 md:grid-cols-12 md:gap-10 md:py-16"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="md:col-span-6"
      :class="reverse ? 'md:order-2' : 'md:order-1'"
    >
      <div ref="mediaRef" class="relative aspect-[4/3] w-full overflow-hidden rounded-[20px]">
        <img
          :src="project.image"
          :alt="project.title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
        >
        <span
          v-if="project.isDummy"
          class="absolute right-4 top-4 rounded-full bg-navy-950/70 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-yellow-400 backdrop-blur"
        >
          Placeholder copy
        </span>
      </div>
    </div>

    <button
      type="button"
      class="block w-full text-left md:col-span-6"
      :class="reverse ? 'md:order-1' : 'md:order-2'"
      :aria-expanded="isOpen"
      @click="handleClick"
      @mouseenter="setState('view')"
      @mouseleave="setState('default')"
    >
      <p class="flex items-baseline gap-3 text-body-sm text-navy-400">
        <span class="font-mono text-navy-400">{{ project.index }}</span>
        <span class="font-mono uppercase tracking-wide">{{ project.date }}</span>
      </p>

      <h3 class="mt-3 flex items-center justify-between gap-4 text-display-sm font-semibold text-ink">
        {{ project.title }}
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-500 transition-all duration-400 ease-editorial group-hover:border-yellow-500 group-hover:text-yellow-600"
          :class="isOpen ? 'rotate-45' : 'rotate-0'"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </h3>

      <div ref="detailRef" class="overflow-hidden" :style="{ height: 0 }">
        <div class="mt-6 space-y-4 border-l-2 border-yellow-500/60 pl-5">
          <div>
            <p class="font-display text-xs font-semibold uppercase tracking-wide text-yellow-600">Brief</p>
            <p class="mt-2 text-body-md text-muted">{{ project.brief }}</p>
          </div>
          <div>
            <p class="font-display text-xs font-semibold uppercase tracking-wide text-yellow-600">Result</p>
            <p class="mt-2 text-body-md text-muted">{{ project.result }}</p>
          </div>
        </div>
      </div>
    </button>
  </div>
</template>
