<script setup lang="ts">
// 02 WHY SCHEDULING GETS COMPLEX — the 13 inputs a feasible schedule has to
// satisfy at once (source: Scheduling Board inputs + cross-functional
// rules). A grid of condition tiles that closes on one navy tile: "one
// feasible schedule". Hovering / focusing a tile lights it; no numbers,
// no invented pain points.
const { complexity } = useFastPage()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
const inView = ref(false)
useFastReveal(sectionRef)

// Each tile's bar is "scheduled" in sequence once the grid is on screen.
let io: IntersectionObserver | undefined
onMounted(() => {
  const grid = sectionRef.value?.querySelector('ol')
  if (!grid) return
  io = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting) {
      inView.value = true
      io?.disconnect()
    }
  }, { threshold: 0.25 })
  io.observe(grid)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="02 / 12" class="mb-12 desktop:mb-16" />
      <div class="grid gap-10 desktop:grid-cols-12 desktop:items-end">
        <div class="desktop:col-span-7">
          <FastHeading :eyebrow="complexity.eyebrow" :title="complexity.headline" :lede="complexity.lede" />
        </div>
        <p data-fr="fade" class="m-center font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)] desktop:col-span-5 desktop:text-right">{{ pad(complexity.factors.length) }} conditions · one schedule</p>
      </div>

      <ol class="mt-14 grid grid-cols-2 border-l border-t border-[color:rgba(3,60,89,0.1)] tablet:grid-cols-4 desktop:grid-cols-7">
        <li
          v-for="(f, i) in complexity.factors"
          :key="i"
          data-fr
          tabindex="0"
          class="fx-tile group relative flex min-h-[150px] flex-col justify-between border-b border-r border-[color:rgba(3,60,89,0.1)] p-4 outline-none transition-colors duration-300 hover:bg-surfaceNeutral focus-visible:bg-surfaceNeutral tablet:min-h-[170px]"
        >
          <span class="flex items-center justify-between">
            <span class="font-mono text-[11px] tabular-nums text-[color:rgba(3,60,89,0.45)]">{{ pad(i + 1) }}</span>
            <span aria-hidden="true" class="fx-bar h-[3px] w-5 origin-left rounded-full transition-[transform,background-color] duration-700 ease-editorial" :class="inView ? 'scale-x-100 bg-pastiYellow-500' : 'scale-x-[0.3] bg-[color:rgba(3,60,89,0.2)]'" :style="{ transitionDelay: inView ? `${i * 70}ms` : '0ms' }" />
          </span>
          <span>
            <span class="block font-display text-[16px] font-bold leading-tight tracking-[-0.01em] text-slateNavy">{{ f.name }}</span>
            <span class="mt-1.5 block text-[13px] leading-snug text-[color:rgba(3,60,89,0.65)]">{{ f.body }}</span>
          </span>
        </li>
        <li data-fr class="relative flex min-h-[150px] flex-col justify-between border-b border-r border-slateNavy bg-slateNavy p-4 text-pureWhite tablet:min-h-[170px]">
          <FastMark surface="dark" :size="14" />
          <span>
            <span class="block font-display text-[16px] font-bold leading-tight">One feasible schedule<span class="text-pastiYellow-500">.</span></span>
            <span class="mt-1.5 block text-[13px] leading-snug text-[color:rgba(255,255,255,0.7)]">Every condition respected, or flagged.</span>
          </span>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>
