<script setup lang="ts">
import * as THREE from 'three'

const props = defineProps<{
  build: (group: THREE.Group) => ((elapsed: number, dt: number) => void) | void
}>()

// Same gating as HeroScene.vue: `enabled` starts false through hydration on
// both server and client (no mismatch), only flips true in onMounted once
// we know we're on a fine-pointer, non-reduced-motion desktop. Everywhere
// else (touch, reduced motion, small screens) the 2D SVG doodle in the
// default slot renders instead — this component's whole job is to hide
// itself and let that fallback show through if 3D isn't appropriate here.
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const enabled = ref(false)

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let scene: ReturnType<typeof useDoodleScene> | undefined
let idleHandle: number | undefined

function handlePointerEnter() {
  scene?.triggerBounce()
}

onMounted(() => {
  const shouldEnable =
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(hover: hover)').matches &&
    window.matchMedia('(min-width: 1024px)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  if (!shouldEnable) return
  enabled.value = true

  nextTick(() => {
    idleHandle = requestAnimationFrame(() => {
      if (!containerRef.value || !canvasRef.value) return

      scene = useDoodleScene(canvasRef.value, containerRef.value, props.build)
      scene.start()
      scene.fit()

      resizeObserver = new ResizeObserver(() => scene?.fit())
      resizeObserver.observe(containerRef.value)

      // Same battery/GPU-conscious pause-when-offscreen pattern as the
      // homepage Hero scene — these mascots sit in a hero that can scroll
      // out of view just like that one does.
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0]?.isIntersecting ?? false
          if (isVisible) scene?.start()
          else scene?.stop()
        },
        { threshold: 0 }
      )
      intersectionObserver.observe(containerRef.value)

      containerRef.value.addEventListener('pointerenter', handlePointerEnter)
    })
  })
})

onBeforeUnmount(() => {
  if (idleHandle !== undefined) cancelAnimationFrame(idleHandle)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  containerRef.value?.removeEventListener('pointerenter', handlePointerEnter)
  scene?.dispose()
})
</script>

<template>
  <div v-if="enabled" ref="containerRef" class="aspect-square w-full">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
  <slot v-else />
</template>
