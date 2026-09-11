<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { FaqItem } from '~/composables/useFaq'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

defineProps<{ item: FaqItem }>()

const open = ref(false)
// True for the whole open->close transition, including the moment `open`
// has already gone false — kept true until the CSS transition finishes so
// the `<details>` element isn't closed (which hides its content instantly,
// see below) until the collapse animation has actually played out.
const closing = ref(false)
const rowRef = ref<HTMLElement | null>(null)
const dividerRef = ref<HTMLElement | null>(null)
const bodyWrapRef = ref<HTMLElement | null>(null)
useScrollReveal(rowRef)

// Native <details> hides its content synchronously the instant its `open`
// attribute is removed — the browser doesn't wait for any CSS transition
// on descendants, so binding `:open="open"` directly made the collapse
// snap shut even though the grid-template-rows transition below looks
// smooth on the way open. Fix: on close, keep `open` (and thus the
// element) true for one more frame while `closing` drives the collapsed
// visual state, then only drop `open` once the transition's `transitionend`
// fires (with a timeout fallback in case the event doesn't fire, e.g. the
// row was already at 0fr).
function handleSummaryClick(event: MouseEvent) {
  if (!open.value) return
  event.preventDefault()
  if (closing.value) return

  closing.value = true

  const wrap = bodyWrapRef.value
  const finish = () => {
    closing.value = false
    open.value = false
  }

  if (!wrap) {
    finish()
    return
  }

  const onEnd = (e: TransitionEvent) => {
    if (e.target !== wrap || e.propertyName !== 'grid-template-rows') return
    wrap.removeEventListener('transitionend', onEnd)
    finish()
  }
  wrap.addEventListener('transitionend', onEnd)
  window.setTimeout(finish, 500)
}

function handleNativeToggle(event: Event) {
  const isOpen = (event.target as HTMLDetailsElement).open
  if (isOpen) open.value = true
}

// Structural Expansion: the top divider grows outward from its center
// point as the item enters the viewport, reading as a structural line
// rather than a CSS border fading in (LARGE_SCALE_MOTION_PLAN.md section 10).
useGsapContext(() => {
  const divider = dividerRef.value
  const row = rowRef.value
  if (!divider || !row) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(divider, { scaleX: 0, transformOrigin: '50% 50%' })

    const anim = gsap.to(divider, {
      scaleX: 1,
      duration: motionDuration.editorial,
      ease: spatialEase.settle,
      scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: 'restart none restart reverse' }
    })

    return () => anim.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(divider, { scaleX: 1 })
  })
})
</script>

<template>
  <div ref="rowRef" class="group/row relative pl-6">
    <span
      ref="dividerRef"
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-navy-800"
    />
    <span
      aria-hidden="true"
      class="absolute -left-px top-0 h-full w-0.5 origin-top scale-y-0 bg-yellow-400 transition-transform duration-500 ease-editorial group-hover/row:scale-y-100"
      :class="{ 'scale-y-100': open }"
    />

    <details class="group" :open="open || closing" @toggle="handleNativeToggle">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-6 py-8 font-display text-body-lg font-medium text-paper marker:content-none transition-colors duration-400 ease-editorial hover:text-yellow-400 md:py-10 md:text-display-sm"
        @click.capture="handleSummaryClick"
      >
        {{ item.question }}
        <span
          aria-hidden="true"
          class="relative h-6 w-6 shrink-0"
        >
          <span class="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
          <span
            class="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-600 ease-editorial"
            :class="open && !closing ? 'rotate-90' : ''"
          />
        </span>
      </summary>

      <div
        ref="bodyWrapRef"
        class="grid transition-[grid-template-rows] duration-400 ease-editorial"
        :style="{ gridTemplateRows: open && !closing ? '1fr' : '0fr' }"
      >
        <div class="overflow-hidden">
          <p
            class="max-w-3xl pb-8 text-body-md text-navy-200 transition-all duration-400 ease-editorial md:pb-10 md:text-body-lg"
            :class="open && !closing ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'"
          >
            {{ item.answer }}
          </p>
        </div>
      </div>
    </details>
  </div>
</template>
