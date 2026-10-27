<script setup lang="ts">
// 11 INTEGRATION & ENTERPRISE FIT — the source's integration areas (§10)
// shown as POSSIBLE boundaries around the DORA core, each joined by a
// dashed "agreed data contract" line (dashed = to be scoped, never
// plug-and-play). A small cyan packet travels each line (transform-only
// CSS, paused off-screen and under reduced motion). No vendor names.
// Below: what is agreed before build (§10.1).
const { integration } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const live = ref(false)
useFastReveal(sectionRef)

let stop = () => {}
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!sectionRef.value || window.matchMedia(reducedMotionQuery.reduce).matches) return
  io = new IntersectionObserver(([e]) => (live.value = !!e?.isIntersecting))
  io.observe(sectionRef.value)
  stop = () => io?.disconnect()
})
onBeforeUnmount(() => stop())

const left = computed(() => integration.boundaries.filter((_, i) => i % 2 === 0))
const right = computed(() => integration.boundaries.filter((_, i) => i % 2 === 1))
</script>

<template>
  <section id="integration" ref="sectionRef" data-header-theme="dark" class="relative z-20 -mt-8 overflow-hidden rounded-t-[28px] bg-slateNavy py-24 text-pureWhite tablet:py-32 desktop:-mt-12 desktop:rounded-t-[48px]" :class="live ? 'is-live' : ''">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="DORA" meta="11 / 13" class="mb-12 desktop:mb-16" />
      <DoraHeading surface="dark" :eyebrow="integration.eyebrow" :title="integration.headline" :lede="integration.lede" />

      <!-- Desktop: hub -->
      <div data-fr class="mt-16 hidden items-center gap-0 desktop:grid desktop:grid-cols-[1fr_auto_1fr]">
        <ul class="grid gap-4">
          <li v-for="(b, i) in left" :key="i" class="flex items-center">
            <div class="w-full max-w-[300px] rounded-[16px] bg-[color:rgba(255,255,255,0.05)] p-4 ring-1 ring-[color:rgba(255,255,255,0.1)]">
              <p class="font-display text-[15px] font-bold">{{ b.name }}</p>
              <p class="mt-1 text-[13px] leading-snug text-[color:rgba(255,255,255,0.65)]">{{ b.body }}</p>
            </div>
            <span aria-hidden="true" class="di-link relative h-px flex-1"><span class="di-dot" /></span>
          </li>
        </ul>
        <div class="relative grid h-[220px] w-[220px] place-items-center rounded-full bg-navyDeep-950 ring-1 ring-[color:rgba(31,214,238,0.45)] shadow-[0_0_0_14px_rgba(31,214,238,0.05),0_0_0_28px_rgba(31,214,238,0.03)]">
          <div class="text-center">
            <DoraMark surface="dark" :size="30" />
            <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">{{ t('Product core') }}</p>
          </div>
        </div>
        <ul class="grid gap-4">
          <li v-for="(b, i) in right" :key="i" class="flex items-center">
            <span aria-hidden="true" class="di-link di-link--rev relative h-px flex-1"><span class="di-dot" /></span>
            <div class="ml-auto w-full max-w-[300px] rounded-[16px] bg-[color:rgba(255,255,255,0.05)] p-4 ring-1 ring-[color:rgba(255,255,255,0.1)]">
              <p class="font-display text-[15px] font-bold">{{ b.name }}</p>
              <p class="mt-1 text-[13px] leading-snug text-[color:rgba(255,255,255,0.65)]">{{ b.body }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Below desktop: list hanging off the core -->
      <div class="mt-12 desktop:hidden">
        <div data-fr class="inline-flex items-center gap-3 rounded-full bg-navyDeep-950 px-5 py-3 ring-1 ring-[color:rgba(31,214,238,0.45)]">
          <DoraMark surface="dark" :size="18" /><span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">{{ t('Product core') }}</span>
        </div>
        <ul class="ml-6 border-l border-dashed border-[color:rgba(31,214,238,0.5)] pl-5">
          <li v-for="(b, i) in integration.boundaries" :key="i" data-fr class="relative pt-5">
            <span aria-hidden="true" class="absolute -left-5 top-[38px] h-px w-4 border-t border-dashed border-[color:rgba(31,214,238,0.5)]" />
            <div class="rounded-[16px] bg-[color:rgba(255,255,255,0.05)] p-4 ring-1 ring-[color:rgba(255,255,255,0.1)]">
              <p class="font-display text-[15px] font-bold">{{ b.name }}</p>
              <p class="mt-1 text-[13px] leading-snug text-[color:rgba(255,255,255,0.65)]">{{ b.body }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p data-fr="fade" class="m-center mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">
        <span class="mr-2 inline-block w-6 border-t border-dashed border-doraCyan align-middle" />{{ t('Dashed = agreed data contract') }} · {{ integration.note }}
      </p>

      <!-- Agreed before build -->
      <div class="mt-14 grid gap-6 border-t border-[color:rgba(255,255,255,0.12)] pt-10 desktop:grid-cols-12">
        <p data-fr class="m-center font-display text-[22px] font-bold tracking-[-0.02em] desktop:col-span-4">{{ t('Agreed before build') }}<span class="text-pastiYellow-500">.</span></p>
        <ul class="grid gap-x-8 tablet:grid-cols-2 desktop:col-span-8">
          <li v-for="(c, i) in integration.contract" :key="i" data-fr class="flex items-start gap-3 border-b border-[color:rgba(255,255,255,0.1)] py-3.5 text-[14.5px] leading-snug text-[color:rgba(255,255,255,0.82)]">
            <span aria-hidden="true" class="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-doraCyan" />{{ c }}
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.di-link {
  min-width: 40px;
  border-top: 1.5px dashed rgba(31, 214, 238, 0.45);
}
.di-dot {
  position: absolute;
  inset: -3.5px 0 auto 0;
  height: 6px;
  opacity: 0;
}
.di-dot::before {
  content: '';
  position: absolute;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #1fd6ee;
  box-shadow: 0 0 10px rgba(31, 214, 238, 0.9);
}
.di-link--rev .di-dot::before {
  left: auto;
  right: 0;
}
/* The wrapper spans the link, so translateX(100%) = the link's length. */
.is-live .di-dot {
  animation: di-travel 2.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
.is-live .di-link--rev .di-dot {
  animation-name: di-travel-rev;
}
.is-live li:nth-child(2) .di-dot {
  animation-delay: 0.9s;
}
.is-live li:nth-child(3) .di-dot {
  animation-delay: 1.8s;
}
@keyframes di-travel {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  15%,
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(calc(100% - 6px));
  }
}
@keyframes di-travel-rev {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  15%,
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(calc(-100% + 6px));
  }
}
</style>
