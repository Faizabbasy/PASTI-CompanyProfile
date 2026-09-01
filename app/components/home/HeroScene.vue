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
let scene: ReturnType<typeof useHeroScene> | undefined
let introWatchStop: (() => void) | undefined
let scrollTrigger: ScrollTrigger | undefined
let idleHandle: number | undefined
let idleCancel: ((handle: number) => void) | undefined

function handlePointerMove(event: PointerEvent) {
  if (!containerRef.value || !scene) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
  scene.setPointer(x, y)
}

onMounted(() => {
  const shouldEnable =
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  if (!shouldEnable) return
  enabled.value = true

  // Deferred one frame off the hydration/reload critical path: building the
  // shard field's meshes/materials synchronously inside onMounted competed
  // with the browser settling the reload itself, reading as a stuck/frozen
  // page for a beat. requestAnimationFrame (not requestIdleCallback — idle
  // time isn't guaranteed to arrive quickly and made the felt delay worse)
  // lets one paint happen first, then builds the scene on the very next
  // frame. Handle is stashed so onBeforeUnmount can cancel it if the
  // component unmounts before it fires (fast route away / fast reload).
  idleCancel = (handle: number) => cancelAnimationFrame(handle)

  nextTick(() => {
    idleHandle = requestAnimationFrame(() => {
      if (!containerRef.value || !canvasRef.value) return

      scene = useHeroScene(canvasRef, containerRef)
      scene.start()
      scene.fit()

      introWatchStop = watch(
        introReady,
        (ready) => {
          if (ready) scene?.playEntrance()
        },
        { immediate: true }
      )

      resizeObserver = new ResizeObserver(() => scene?.fit())
      resizeObserver.observe(containerRef.value)

      // Pause the render loop when the Hero scrolls out of view so the
      // GPU/battery cost drops to zero once the user has moved on, same
      // performance-conscious pattern as the custom cursor / magnetic hover.
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0]?.isIntersecting ?? false
          if (isVisible) scene?.start()
          else scene?.stop()
        },
        { threshold: 0 }
      )
      intersectionObserver.observe(containerRef.value)

      containerRef.value.addEventListener('pointermove', handlePointerMove)

      // Drives the field's scroll-reaction (drift + rotation) as the Hero
      // scrolls out of view — 0 while the Hero fills the viewport, 1 once it
      // has fully scrolled past. Scoped to this component's own trigger, not
      // a shared one, matching the per-instance ScrollTrigger pattern used by
      // HomeServiceRow.vue (see HANDOFF.md).
      scrollTrigger = ScrollTrigger.create({
        trigger: containerRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => scene?.setScrollProgress(self.progress)
      })
    })
  })
})

onBeforeUnmount(() => {
  if (idleHandle !== undefined) idleCancel?.(idleHandle)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  introWatchStop?.()
  scrollTrigger?.kill()
  containerRef.value?.removeEventListener('pointermove', handlePointerMove)
  scene?.dispose()
})
</script>

<template>
  <div v-if="enabled" ref="containerRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
