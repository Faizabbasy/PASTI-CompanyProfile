<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Mount wrapper for the Hero curtain/sheet scene. Contains no Three.js
 * scene-building logic itself (that's useHeroCurtainScene.ts) — this
 * file owns DOM mounting, responsive tier detection, observers, and
 * dispose timing. `enabled` stays false through the initial render on
 * both server and client so hydration sees the same (empty) DOM on both
 * sides, matching the pattern used by every other WebGL mount in this
 * codebase.
 */
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const enabled = ref(false)
const tier = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let reducedMotionQuery: MediaQueryList | undefined
let scene: ReturnType<typeof useHeroCurtainScene> | undefined
let scrollTrigger: ScrollTrigger | undefined
let idleHandle: number | undefined

function detectTier(): 'desktop' | 'tablet' | 'mobile' {
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
  if (window.matchMedia('(min-width: 640px)').matches) return 'tablet'
  return 'mobile'
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  scene?.setReducedMotion(event.matches)
}

function handlePointerMove(event: PointerEvent) {
  if (!containerRef.value || !scene) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
  scene.setPointer(x, y)
}

onMounted(() => {
  // Unlike the intro overlay's all-or-nothing WebGL gate, this scene runs
  // on every viewport (mobile included, reframed per the design spec) —
  // the only universal opt-out is WebGL being unavailable at all, which
  // buildScene()'s own renderer construction would throw on; that failure
  // mode is acceptable to surface as a console error here since a Hero
  // background is non-critical to the page functioning.
  enabled.value = true
  tier.value = detectTier()

  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Deferred one frame off the hydration/reload critical path, matching
  // the established pattern in this codebase (see the deleted
  // HeroScene.vue / useHeroScene.ts and the intro-3d-redesign work) —
  // avoids competing with the browser settling the initial paint.
  nextTick(() => {
    idleHandle = requestAnimationFrame(() => {
      if (!containerRef.value || !canvasRef.value) return

      scene = useHeroCurtainScene(canvasRef, containerRef, tier)
      scene.setReducedMotion(reducedMotionQuery!.matches)
      scene.start()
      scene.fit()
      scene.playEntrance()

      resizeObserver = new ResizeObserver(() => {
        const nextTier = detectTier()
        if (nextTier !== tier.value) {
          // Tier changed (e.g. rotated device, resized browser across a
          // breakpoint) — the layer composition itself differs per tier
          // (2 vs 3 sheets), so rebuild rather than just refitting.
          tier.value = nextTier
          scene?.dispose()
          scene = useHeroCurtainScene(canvasRef, containerRef, tier)
          scene.setReducedMotion(reducedMotionQuery!.matches)
          scene.start()
        }
        scene?.fit()
      })
      resizeObserver.observe(containerRef.value)

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
      reducedMotionQuery!.addEventListener('change', handleReducedMotionChange)

      scrollTrigger = ScrollTrigger.create({
        trigger: containerRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      })
    })
  })
})

onBeforeUnmount(() => {
  if (idleHandle !== undefined) cancelAnimationFrame(idleHandle)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange)
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
