<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WorkProject } from '~/composables/useWorkPortfolio'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ project: WorkProject; offset?: boolean }>()

const cardRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)
const detailRef = ref<HTMLElement | null>(null)

const { setState } = useCustomCursor()
const isOpen = ref(false)

let openTween: gsap.core.Tween | undefined

function toggle() {
  isOpen.value = !isOpen.value
}

watch(isOpen, (open) => {
  const detail = detailRef.value
  if (!detail) return

  openTween?.kill()

  if (open) {
    gsap.set(detail, { height: 'auto' })
    const targetHeight = detail.offsetHeight
    gsap.set(detail, { height: 0 })
    openTween = gsap.to(detail, { height: targetHeight, duration: 0.6, ease: 'power3.out', clearProps: open ? 'height' : '' })
  } else {
    openTween = gsap.to(detail, { height: 0, duration: 0.45, ease: 'power3.inOut' })
  }
})

useGsapContext(() => {
  const card = cardRef.value
  const media = mediaRef.value
  if (!card || !media) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(card, { opacity: 1, scale: 1, clipPath: 'inset(0% round 20px)' })
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(card, { opacity: 0, scale: 1.08, clipPath: 'inset(6% round 20px)' })

    const entrance = gsap.to(card, {
      opacity: 1,
      scale: 1,
      clipPath: 'inset(0% round 20px)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'restart none restart reverse' }
    })

    const parallax = gsap.matchMedia().add('(min-width: 768px)', () => {
      const parallaxTween = gsap.to(card, {
        y: props.offset ? -24 : -12,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
      })
      return () => parallaxTween.kill()
    })

    return () => {
      entrance.kill()
      parallax.revert()
    }
  })

  onBeforeUnmount(() => mm.revert())
})
</script>

<template>
  <div
    ref="cardRef"
    class="group"
    :class="offset ? 'md:mt-20' : ''"
  >
    <button
      type="button"
      class="block w-full text-left"
      :aria-expanded="isOpen"
      @click="toggle"
      @mouseenter="setState('view')"
      @mouseleave="setState('default')"
    >
      <div ref="mediaRef" class="relative aspect-[4/5] w-full overflow-hidden rounded-[20px]">
        <img
          :src="project.image"
          :alt="project.title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/0 to-navy-950/0" />

        <span
          v-if="project.isDummy"
          class="absolute right-4 top-4 rounded-full bg-navy-950/70 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-yellow-400 backdrop-blur"
        >
          Placeholder copy
        </span>

        <span
          class="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-paper text-navy-950 transition-transform duration-500 ease-editorial"
          :class="isOpen ? 'rotate-45' : 'rotate-0'"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </div>

      <p class="mt-6 flex items-baseline gap-3 text-body-sm text-navy-300">
        <span class="font-mono text-navy-500">{{ project.index }}</span>
        <span class="text-navy-100">{{ project.title }}</span>
      </p>
    </button>

    <div ref="detailRef" class="overflow-hidden" :style="{ height: 0 }">
      <div class="mt-6 space-y-4 border-l-2 border-yellow-500/60 pl-5">
        <p class="font-mono text-xs uppercase tracking-wide text-navy-500">{{ project.date }}</p>
        <div>
          <p class="font-display text-xs font-semibold uppercase tracking-wide text-yellow-500">Brief</p>
          <p class="mt-2 text-body-md text-navy-200">{{ project.brief }}</p>
        </div>
        <div>
          <p class="font-display text-xs font-semibold uppercase tracking-wide text-yellow-500">Result</p>
          <p class="mt-2 text-body-md text-navy-200">{{ project.result }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
