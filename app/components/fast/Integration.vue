<script setup lang="ts">
// 11 INTEGRATION & ENTERPRISE OPERATIONS — FAST plans on top of the
// customer's systems, never instead of them. A three-node chain (ERP /
// source → integration & staging → FAST) with a dashed line that flows
// left to right, the per-implementation note, then the enterprise
// governance cards. No vendor names, no "real-time" or "direct" promises.
const { integration } = useFastPage()
const sectionRef = ref<HTMLElement | null>(null)
const live = ref(false)
useFastReveal(sectionRef)

let io: IntersectionObserver | undefined
onMounted(() => {
  if (!sectionRef.value) return
  io = new IntersectionObserver(([e]) => (live.value = !!e?.isIntersecting))
  io.observe(sectionRef.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section id="integration" ref="sectionRef" data-header-theme="dark" :class="{ 'is-live': live }" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy desktop:-mt-12 desktop:rounded-t-[48px] py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="dark" label="FAST" meta="11 / 12" class="mb-12 desktop:mb-16" />
      <div class="grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <div class="desktop:col-span-7"><FastHeading surface="dark" :eyebrow="integration.eyebrow" :title="integration.headline" /></div>
        <p data-fr="fade" class="m-center text-token-body-large leading-relaxed text-[color:rgba(255,255,255,0.75)] desktop:col-span-5">{{ integration.body }}</p>
      </div>

      <ol data-fr class="relative mt-14 grid gap-4 desktop:grid-cols-3 desktop:gap-10">
        <li v-for="(c, i) in integration.chain" :key="i" class="relative">
          <div class="h-full rounded-[22px] p-6" :class="i === 2 ? 'bg-pureWhite text-slateNavy' : 'bg-[color:rgba(255,255,255,0.06)] ring-1 ring-[color:rgba(255,255,255,0.14)]'">
            <div class="flex items-center justify-between">
              <span class="font-mono text-[11px] tabular-nums" :class="i === 2 ? 'text-[color:rgba(3,60,89,0.5)]' : 'text-[color:rgba(255,255,255,0.5)]'">0{{ i + 1 }}</span>
              <FastMark v-if="i === 2" :size="14" />
            </div>
            <p class="mt-8 font-display text-[20px] font-bold tracking-[-0.01em]">{{ c.name }}</p>
            <p class="mt-1 text-[13.5px]" :class="i === 2 ? 'text-[color:rgba(3,60,89,0.65)]' : 'text-[color:rgba(255,255,255,0.65)]'">{{ c.body }}</p>
          </div>
          <span v-if="i < 2" aria-hidden="true" class="fi-link absolute left-1/2 top-full h-4 w-[2px] -translate-x-1/2 overflow-hidden desktop:left-full desktop:top-1/2 desktop:h-[2px] desktop:w-10 desktop:translate-x-0"><span class="fi-strip" /></span>
        </li>
      </ol>
      <p data-fr="fade" class="mt-6 flex items-start gap-3 text-[13.5px] leading-relaxed text-[color:rgba(255,255,255,0.65)] max-desktop:justify-center max-desktop:text-center">
        <span aria-hidden="true" class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500 max-desktop:hidden" />{{ integration.note }}
      </p>

      <ul class="mt-16 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
        <li v-for="(e, i) in integration.enterprise" :key="i" data-fr class="rounded-[18px] bg-[color:rgba(255,255,255,0.04)] p-5 ring-1 ring-[color:rgba(255,255,255,0.1)]">
          <span aria-hidden="true" class="block h-[3px] w-6 rounded-full bg-pastiYellow-500" />
          <p class="mt-4 font-display text-[16px] font-bold">{{ e.name }}</p>
          <p class="mt-1 text-[13.5px] leading-snug text-[color:rgba(255,255,255,0.68)]">{{ e.body }}</p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
/* Dashed connector that flows left → right (top → bottom on phones):
   a strip twice the link's length slides by one dash — transform only,
   and only while the section is on screen (.is-live). */
.fi-strip {
  position: absolute;
  inset: 0 auto 0 -10px;
  width: calc(100% + 10px);
  background-image: linear-gradient(90deg, #fbba00 50%, transparent 50%);
  background-size: 10px 100%;
}
.is-live .fi-strip {
  animation: fi-flow 1.2s linear infinite;
}
@media (max-width: 1023.98px) {
  .fi-strip {
    inset: -10px 0 auto 0;
    width: 100%;
    height: calc(100% + 10px);
    background-image: linear-gradient(180deg, #fbba00 50%, transparent 50%);
    background-size: 100% 10px;
  }
  .is-live .fi-strip {
    animation-name: fi-flow-y;
  }
}
@keyframes fi-flow {
  to { transform: translateX(10px); }
}
@keyframes fi-flow-y {
  to { transform: translateY(10px); }
}
@media (prefers-reduced-motion: reduce) {
  .is-live .fi-strip { animation: none; }
}
</style>
