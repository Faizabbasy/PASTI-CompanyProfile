<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Counter grid. The "00 -> 100%" counter ticks up with a
// checkerboard grid fill behind it (a loading beat that sets scale/
// anticipation), then the whole overlay fades out straight to the page.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const counterRef = ref<HTMLElement | null>(null)

const COLS = 10
const ROWS = 6

onMounted(() => {
  const cells = Array.from(document.querySelectorAll<HTMLElement>('[data-counter-cell]'))
  gsap.set(cells, { opacity: 0 })

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', onComplete: () => emit('complete') })
    }
  })

  tl.to(
    { v: 0 },
    {
      v: 100,
      duration: 1.3,
      ease: 'power1.inOut',
      onUpdate: function () {
        const v = Math.floor(this.targets()[0].v)
        if (counterRef.value) counterRef.value.textContent = String(v).padStart(2, '0')
        const shouldShow = Math.floor((v / 100) * cells.length)
        cells.forEach((cell, i) => {
          gsap.set(cell, { opacity: i < shouldShow ? 1 : 0 })
        })
      }
    }
  )
  tl.to({}, { duration: 0.15 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-paper">
    <div
      class="absolute inset-0 grid opacity-[0.06]"
      :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }"
    >
      <div v-for="i in COLS * ROWS" :key="i" data-counter-cell="" class="m-[2px] bg-navy-700" />
    </div>
    <div class="relative flex items-baseline gap-2 font-display text-navy-900">
      <span ref="counterRef" class="text-7xl font-extrabold tabular-nums md:text-9xl">00</span>
      <span class="text-2xl font-semibold text-navy-400 md:text-4xl">%</span>
    </div>
  </div>
</template>
