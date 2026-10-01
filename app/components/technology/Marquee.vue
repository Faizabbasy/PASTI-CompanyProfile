<script setup lang="ts">
import gsap from 'gsap'

// Kinetic service marquee — the six real service names as oversized type in
// two counter-running rows (one outlined, one solid). Base drift is slow;
// scroll velocity (Lenis) accelerates it and flips its direction with the
// scroll, then it eases back — the page "feels" the scroll. Static rows
// under reduced motion.
const { services } = useTechnology()
const names = services.map((s) => s.title)

const rowRefs = ref<HTMLElement[]>([])

useGsapContext(() => {
  const rows = rowRefs.value
  if (!rows.length) return
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.noPreference, () => {
    const loops = rows.map((row, i) =>
      gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 48, ease: 'none', repeat: -1 })
    )

    const lenis = getLenisInstance()
    const boost = { v: 1 }
    let settle: gsap.core.Tween | undefined
    const apply = () => loops.forEach((l) => l.timeScale(boost.v))
    const onScroll = (instance: { velocity: number }) => {
      const v = Math.max(-8, Math.min(8, instance.velocity / 3))
      boost.v = Math.abs(v) < 1 ? (v < 0 ? -1 : 1) : v
      apply()
      settle?.kill()
      settle = gsap.to(boost, { v: boost.v < 0 ? -1 : 1, duration: 1.2, ease: approvedEase.gsapStandard, onUpdate: apply })
    }
    lenis?.on('scroll', onScroll)

    return () => {
      lenis?.off('scroll', onScroll)
      settle?.kill()
      loops.forEach((l) => l.kill())
    }
  })
})
</script>

<template>
  <section data-header-theme="dark" aria-label="Technology capabilities" class="relative overflow-hidden border-y border-[color:rgba(255,255,255,0.08)] bg-slateNavy py-10 tablet:py-14">
    <div v-for="r in 2" :key="r" class="overflow-hidden" :class="r === 2 ? 'mt-2 tablet:mt-4' : ''">
      <div :ref="(el) => { if (el) rowRefs[r - 1] = el as HTMLElement }" class="flex w-max items-center will-change-transform">
        <template v-for="copy in 2" :key="copy">
          <span
            v-for="(name, i) in names"
            :key="`${copy}-${i}`"
            class="flex shrink-0 items-center font-display text-[length:clamp(44px,8vw,128px)] font-extrabold leading-none tracking-[-0.04em]"
            :aria-hidden="copy === 2 || r === 2 ? 'true' : undefined"
          >
            <span :class="r === 1 ? 'tm-outline' : 'text-pureWhite'">{{ name }}</span>
            <span aria-hidden="true" class="mx-[0.35em] inline-block h-[0.16em] w-[0.16em] rounded-full" :class="r === 1 ? 'bg-pastiYellow-500' : 'bg-pastiYellow-500'" />
          </span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tm-outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.55);
}
</style>
