<script setup lang="ts">
// Conditions ticker — a band between "Why it gets complex" and the FCP
// section: the thirteen scheduling conditions in giant outline type,
// separated by the mini-Gantt glyph, drifting left. Pure CSS transform
// loop (compositor-only), paused whenever the band is off screen, static
// under reduced motion. Decorative: the same list is readable in the grid
// above, so the band is aria-hidden.
const { complexity } = useFast()
const bandRef = ref<HTMLElement | null>(null)
const live = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!bandRef.value) return
  io = new IntersectionObserver(([e]) => (live.value = !!e?.isIntersecting), { rootMargin: '100px 0px' })
  io.observe(bandRef.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="bandRef" aria-hidden="true" class="ft-band relative overflow-hidden border-y border-[color:rgba(3,60,89,0.1)] bg-pureWhite py-6 tablet:py-8" :class="{ 'is-live': live }">
    <div class="ft-track flex w-max">
      <div v-for="copy in 2" :key="copy" class="flex shrink-0 items-center">
        <template v-for="f in complexity.factors" :key="`${copy}-${f.name}`">
          <span class="ft-word whitespace-nowrap px-6 font-display font-extrabold leading-none tablet:px-10">{{ f.name }}</span>
          <span class="relative block h-[14px] w-[28px] shrink-0">
            <span class="absolute left-0 top-0 h-1 w-4 rounded-full bg-pastiYellow-500" />
            <span class="absolute left-2 top-[5px] h-1 w-4 rounded-full bg-slateNavy" />
            <span class="absolute left-[14px] top-[10px] h-1 w-[14px] rounded-full bg-[color:rgba(3,60,89,0.35)]" />
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ft-word {
  font-size: clamp(40px, 6.5vw, 104px);
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px #033c59;
}
.ft-word:nth-of-type(4n + 1) {
  color: #033c59;
  -webkit-text-stroke: 0;
}
.is-live .ft-track {
  animation: ft-scroll 70s linear infinite;
}
@keyframes ft-scroll {
  to {
    transform: translateX(-50%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-live .ft-track {
    animation: none;
  }
}
</style>
