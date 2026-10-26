<script setup lang="ts">
// 07 PRODUCTION READINESS — Material / Capacity / Workforce. A readiness
// meter cycles through the four material states from the source (Fully
// available → Partially available → Expected on time → Material shortage)
// while the section is on screen; visitors can pick a state themselves.
// Reduced motion: no cycling, first state shown.
const { readiness } = useFastPage()
const sectionRef = ref<HTMLElement | null>(null)
const active = ref(0)
const auto = ref(true)
useFastReveal(sectionRef)

const fill = ['100%', '62%', '78%', '22%']
const toneBg: Record<string, string> = { ok: 'bg-slateNavy', partial: 'bg-[#3E7A99]', expected: 'bg-pastiYellow-500', short: 'bg-[#C2412D]' }

let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches || !sectionRef.value) return
  io = new IntersectionObserver(([e]) => {
    clearInterval(timer)
    if (e?.isIntersecting) timer = setInterval(() => auto.value && (active.value = (active.value + 1) % readiness.states.length), 2400)
  })
  io.observe(sectionRef.value)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  io?.disconnect()
})
const pick = (i: number) => {
  auto.value = false
  active.value = i
}
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="07 / 12" class="mb-12 desktop:mb-16" />
      <div class="grid gap-10 desktop:grid-cols-12 desktop:items-end">
        <div class="desktop:col-span-6">
          <FastHeading :eyebrow="readiness.eyebrow" :title="readiness.headline" :lede="readiness.lede" />
        </div>

        <!-- Readiness meter -->
        <div data-fr class="rounded-[22px] bg-pureWhite p-5 ring-1 ring-[color:rgba(3,60,89,0.08)] desktop:col-span-6">
          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">
            <span>PRD-1047 · material readiness</span><span>sample</span>
          </div>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-[color:rgba(3,60,89,0.08)]">
            <span class="block h-full rounded-full transition-[width,background-color] duration-700 ease-editorial" :class="toneBg[readiness.states[active]!.tone]" :style="{ width: fill[active] }" />
          </div>
          <div role="group" aria-label="Readiness states" class="mt-4 grid grid-cols-2 gap-2 tablet:grid-cols-4">
            <button
              v-for="(s, i) in readiness.states"
              :key="s.name"
              type="button"
              :aria-pressed="active === i"
              class="flex min-h-11 items-center gap-2 rounded-[12px] px-3 text-left font-display text-[13px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
              :class="active === i ? 'bg-slateNavy text-pureWhite' : 'bg-surfaceNeutral text-slateNavy hover:bg-[color:rgba(3,60,89,0.08)]'"
              @click="pick(i)"
            >
              <span class="h-2 w-2 shrink-0 rounded-full" :class="toneBg[s.tone]" />{{ s.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-12 grid gap-4 desktop:grid-cols-3">
        <article v-for="(p, i) in readiness.pillars" :key="i" data-fr class="flex flex-col rounded-[24px] p-6 tablet:p-8" :class="i === 0 ? 'bg-slateNavy text-pureWhite' : 'bg-pureWhite text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.08)]'">
          <span class="font-mono text-[11px] tabular-nums" :class="i === 0 ? 'text-pastiYellow-500' : 'text-[color:rgba(3,60,89,0.45)]'">0{{ i + 1 }}</span>
          <h3 class="mt-6 font-display text-[28px] font-extrabold tracking-[-0.03em]" :class="i === 0 ? 'text-pureWhite' : 'text-slateNavy'">{{ p.name }}<span class="text-pastiYellow-500">.</span></h3>
          <p class="mt-2 text-[14px] leading-relaxed" :class="i === 0 ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.7)]'">{{ p.body }}</p>
          <ul class="mt-6 grid gap-2 border-t pt-5" :class="i === 0 ? 'border-[color:rgba(255,255,255,0.14)]' : 'border-[color:rgba(3,60,89,0.1)]'">
            <li v-for="(it, ii) in p.items" :key="ii" class="flex items-center gap-2.5 text-[14px] font-medium">
              <span aria-hidden="true" class="h-px w-3 bg-pastiYellow-500" />{{ it }}
            </li>
          </ul>
        </article>
      </div>
    </BaseContainer>
  </section>
</template>
