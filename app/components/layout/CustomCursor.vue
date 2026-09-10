<script setup lang="ts">
import gsap from 'gsap'

const { state } = useCustomCursor()

const enabled = ref(false)
const cursorRef = ref<HTMLElement | null>(null)

let activeHandleMove: ((event: PointerEvent) => void) | undefined

onBeforeUnmount(() => {
  if (activeHandleMove) window.removeEventListener('pointermove', activeHandleMove)
})

onMounted(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return
  enabled.value = true

  nextTick(() => {
    const el = cursorRef.value
    if (!el) return

    const quickX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const quickY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })

    activeHandleMove = (event: PointerEvent) => {
      quickX(event.clientX)
      quickY(event.clientY)
    }

    window.addEventListener('pointermove', activeHandleMove)
  })
})
</script>

<template>
  <div
    v-if="enabled"
    ref="cursorRef"
    class="pointer-events-none fixed left-0 top-0 z-[55] -translate-x-1/2 -translate-y-1/2"
    :data-cursor-state="state"
    aria-hidden="true"
  >
    <div class="cursor-dot" />
  </div>
</template>
