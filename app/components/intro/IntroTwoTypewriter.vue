<script setup lang="ts">
import gsap from 'gsap'

// 2D Intro — Typewriter reveal. "PASTI" types itself out character by
// character with a blinking cursor (monospace, terminal-style), holds a
// beat, then the whole line does a mask-wipe upward off-screen while the
// background fades — a quick, confident "loading the interface" feel
// without a literal progress bar.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const word = 'PASTI'
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, {
        yPercent: -100,
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => emit('complete')
      })
    }
  })

  if (textRef.value) {
    tl.to(
      { i: 0 },
      {
        i: word.length,
        duration: word.length * 0.12,
        ease: 'none',
        onUpdate: function () {
          const count = Math.floor(this.targets()[0].i)
          if (textRef.value) textRef.value.textContent = word.slice(0, count)
        }
      }
    )
  }
  tl.to({}, { duration: 0.5 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-navy-950">
    <div class="font-mono text-4xl tracking-wide text-paper md:text-6xl">
      <span ref="textRef" />
      <span class="typewriter-cursor inline-block w-[2px] translate-y-1 bg-yellow-400" style="height: 0.9em" />
    </div>
  </div>
</template>

<style scoped>
.typewriter-cursor {
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
</style>
