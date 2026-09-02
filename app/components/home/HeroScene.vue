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
const hintVisible = ref(false)
const hintX = ref(0)
const hintY = ref(0)
const hasInteracted = ref(false)

const { introReady } = useIntroReady()

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let scene: ReturnType<typeof useHeroScene> | undefined
let introWatchStop: (() => void) | undefined
let scrollTrigger: ScrollTrigger | undefined
let idleHandle: number | undefined
let idleCancel: ((handle: number) => void) | undefined
let isPressed = false

function handlePointerMove(event: PointerEvent) {
  if (!containerRef.value || !scene) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
  scene.setPointer(x, y)

  if (!hasInteracted.value) {
    hintX.value = event.clientX - rect.left
    hintY.value = event.clientY - rect.top
    hintVisible.value = true
  }
}

function handlePointerLeave() {
  hintVisible.value = false
  // A press that's still held when the pointer leaves the Hero (fast drag
  // off the edge) must still release the coil, or it stays wound up with
  // no way to trigger the pointerup that would normally unwind it.
  if (isPressed) {
    isPressed = false
    scene?.setPressed(false)
  }
}

function handlePointerDown() {
  if (!scene) return
  isPressed = true
  hasInteracted.value = true
  hintVisible.value = false
  scene.setPressed(true)
}

function handlePointerUp() {
  if (!scene || !isPressed) return
  isPressed = false
  scene.setPressed(false)
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
      containerRef.value.addEventListener('pointerleave', handlePointerLeave)
      containerRef.value.addEventListener('pointerdown', handlePointerDown)
      containerRef.value.addEventListener('pointerup', handlePointerUp)

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
  containerRef.value?.removeEventListener('pointerleave', handlePointerLeave)
  containerRef.value?.removeEventListener('pointerdown', handlePointerDown)
  containerRef.value?.removeEventListener('pointerup', handlePointerUp)
  scene?.dispose()
})
</script>

<template>
  <div v-if="enabled" ref="containerRef" aria-hidden="true" class="absolute inset-0 cursor-pointer overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
    <div
      class="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 transition-opacity duration-300"
      :class="hintVisible ? 'opacity-100' : 'opacity-0'"
      :style="{ left: `${hintX}px`, top: `${hintY}px` }"
    >
      <span class="h-9 w-9 rounded-full border border-navy-400/40" />
      <span class="text-[10px] font-semibold uppercase tracking-widest text-navy-400/70">Click &amp; hold</span>
    </div>
  </div>
</template>
