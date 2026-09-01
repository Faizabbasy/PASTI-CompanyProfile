<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// `enabled` MUST stay false through the initial render on both server and
// client so hydration sees the same (empty) DOM on both sides — flipping it
// synchronously during setup() from a client-only check caused a hydration
// mismatch (server renders nothing, client would've rendered the div before
// Vue finished reconciling). Gating + mounting the scene happens entirely
// in onMounted, which always runs after hydration completes.
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const enabled = ref(false)

const { introReady } = useIntroReady()

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let ribbons: ReturnType<typeof useHeroRibbons> | undefined
let introWatchStop: (() => void) | undefined
let scrollTrigger: ScrollTrigger | undefined

function handlePointerMove(event: PointerEvent) {
  if (!containerRef.value || !ribbons) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
  ribbons.setPointer(x, y)
}

onMounted(() => {
  const shouldEnable =
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  if (!shouldEnable) return
  enabled.value = true

  nextTick(() => {
    if (!containerRef.value || !canvasRef.value) return

    ribbons = useHeroRibbons(canvasRef, containerRef)
    ribbons.start()
    ribbons.fit()

    introWatchStop = watch(
      introReady,
      (ready) => {
        if (ready) ribbons?.playEntrance()
      },
      { immediate: true }
    )

    resizeObserver = new ResizeObserver(() => ribbons?.fit())
    resizeObserver.observe(containerRef.value)

    // Pause the render loop when the Hero scrolls out of view so the
    // GPU/battery cost drops to zero once the user has moved on, same
    // performance-conscious pattern as the custom cursor / magnetic hover.
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false
        if (isVisible) ribbons?.start()
        else ribbons?.stop()
      },
      { threshold: 0 }
    )
    intersectionObserver.observe(containerRef.value)

    containerRef.value.addEventListener('pointermove', handlePointerMove)

    // Drives the cascade's scroll-reaction (drift + rotation) as the Hero
    // scrolls out of view — 0 while the Hero fills the viewport, 1 once it
    // has fully scrolled past. Scoped to this component's own trigger, not
    // a shared one, matching the per-instance ScrollTrigger pattern used by
    // HomeServiceRow.vue (see HANDOFF.md).
    scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => ribbons?.setScrollProgress(self.progress)
    })
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  introWatchStop?.()
  scrollTrigger?.kill()
  containerRef.value?.removeEventListener('pointermove', handlePointerMove)
  ribbons?.dispose()
})
</script>

<template>
  <div v-if="enabled" ref="containerRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
