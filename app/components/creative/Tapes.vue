<script setup lang="ts">
import gsap from 'gsap'

// Two crossing "tape" marquees (navy + white) carrying the service names —
// the studio's loud transition out of the yellow hero. They run in opposite
// directions and speed up with scroll velocity. Static under reduced motion.
const { services } = useCreative()
const names = services.map((s) => s.title)
const rowRefs = ref<HTMLElement[]>([])

useGsapContext(() => {
  const rows = rowRefs.value
  if (!rows.length) return
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const loops = rows.map((row, i) => gsap.fromTo(row, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 38, ease: 'none', repeat: -1 }))
    const lenis = getLenisInstance()
    const onScroll = (l: { velocity: number }) => {
      const v = 1 + Math.min(5, Math.abs(l.velocity) / 4)
      loops.forEach((lp) => gsap.to(lp, { timeScale: v, duration: 0.3, overwrite: true, onComplete: () => gsap.to(lp, { timeScale: 1, duration: 1.2, ease: approvedEase.gsapStandard }) }))
    }
    lenis?.on('scroll', onScroll)
    return () => {
      lenis?.off('scroll', onScroll)
      loops.forEach((l) => l.kill())
    }
  })
})
</script>

<template>
  <section aria-label="Creative disciplines" class="relative h-[200px] overflow-hidden bg-pastiYellow-500 tablet:h-[260px]">
    <div
      v-for="r in 2"
      :key="r"
      class="absolute left-[-10%] top-1/2 w-[120%] -translate-y-1/2 py-4 shadow-[0_20px_40px_-20px_rgba(3,40,60,0.5)] tablet:py-5"
      :class="r === 1 ? 'rotate-[-4deg] bg-slateNavy text-pureWhite' : 'rotate-[3deg] bg-pureWhite text-slateNavy'"
    >
      <div :ref="(el) => { if (el) rowRefs[r - 1] = el as HTMLElement }" class="flex w-max items-center">
        <template v-for="copy in 2" :key="copy">
          <span
            v-for="(n, i) in names"
            :key="`${copy}-${i}`"
            class="flex shrink-0 items-center font-display text-[clamp(22px,3vw,42px)] font-extrabold uppercase tracking-[-0.02em]"
            :aria-hidden="copy === 2 || r === 2 ? 'true' : undefined"
          >
            {{ n }}
            <span aria-hidden="true" class="mx-6 inline-block h-3 w-3 rotate-45 tablet:mx-8" :class="r === 1 ? 'bg-pastiYellow-500' : 'bg-slateNavy'" />
          </span>
        </template>
      </div>
    </div>
  </section>
</template>
