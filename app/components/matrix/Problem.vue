<script setup lang="ts">
// 02 THE MATERIAL VISIBILITY PROBLEM — "Having stock is not the same as
// having material ready for operation." Left: the claim made visible — one
// illustrative bar, on hand vs usable, that splits when it comes into view.
// Right: seven plain statements from the source's challenge table (§2). No
// quantified pain. Reveal: useMatrixReveal (fill-up).
const { problem, sample } = useMatrixPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const split = ref(false)
const pad = (n: number) => String(n).padStart(2, '0')
useMatrixReveal(sectionRef)

let stop = () => {}
onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches || !barRef.value) {
    split.value = true
    return
  }
  stop = onceInView(barRef.value, () => setTimeout(() => (split.value = true), 350))
})
onBeforeUnmount(() => stop())
</script>

<template>
  <section ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="2" name="Visibility problem" surface="light" class="mb-12 desktop:mb-16" />
      <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <div class="desktop:sticky desktop:top-32">
            <MatrixHeading size="md" :eyebrow="problem.eyebrow" :title="problem.headline" :lede="problem.lede" />
            <!-- The claim as type: what is held ≠ what is ready (illustrative). -->
            <div ref="barRef" class="mt-10" role="img" :aria-label="`Illustrative: ${sample.mix.onHand} on hand, but only ${netAvailable(sample.mix)} ready to issue.`">
              <p aria-hidden="true" class="flex items-end gap-3 max-desktop:justify-center tablet:gap-5">
                <span>
                  <span class="mxp-out block font-display font-extrabold leading-[0.8] tracking-[-0.06em]">{{ sample.mix.onHand }}</span>
                  <span class="mt-3 block font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">{{ t('On hand') }}</span>
                </span>
                <span class="mxp-neq pb-9 font-display font-extrabold leading-none text-[color:rgba(3,60,89,0.35)]">≠</span>
                <span>
                  <span class="mxp-solid relative isolate inline-block font-display font-extrabold leading-[0.8] tracking-[-0.06em] text-slateNavy">{{ netAvailable(sample.mix) }}</span>
                  <span class="mt-3 block font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">{{ t('Ready to issue') }}</span>
                </span>
              </p>
              <div class="mt-7" aria-hidden="true"><MatrixStockBar :mix="sample.mix" :split="split" :legend="false" /></div>
              <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.45)] max-desktop:text-center">{{ sample.name }} · {{ t('illustrative') }}</p>
            </div>
          </div>
        </div>
        <ol class="desktop:col-span-7">
          <li v-for="(p, i) in problem.items" :key="i" data-fr class="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-[color:rgba(3,60,89,0.12)] py-6 last:border-b tablet:grid-cols-[3rem_1fr_1.3fr] tablet:items-baseline tablet:gap-x-6">
            <span class="font-mono text-[11px] font-semibold tabular-nums text-[color:rgba(3,60,89,0.5)]">{{ pad(i + 1) }}</span>
            <h3 class="font-display text-[19px] font-bold leading-tight tracking-[-0.015em] text-slateNavy tablet:text-[20px]">{{ p.name }}</h3>
            <p class="col-start-2 mt-1.5 text-[14.5px] leading-relaxed text-[color:rgba(3,60,89,0.7)] tablet:col-start-3 tablet:mt-0 tablet:text-[15px]">{{ p.body }}</p>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mxp-out {
  font-size: clamp(88px, 11vw, 168px);
  color: transparent;
  -webkit-text-stroke: 2px #033c59;
}
.mxp-solid {
  font-size: clamp(88px, 11vw, 168px);
}
/* Yellow fill behind the usable figure — a stock level, not yellow text. */
.mxp-solid::before {
  content: '';
  position: absolute;
  inset: 38% -0.08em -0.02em;
  z-index: -1;
  background: #fbba00;
  border-radius: 4px;
}
.mxp-neq {
  font-size: clamp(40px, 5vw, 72px);
}
</style>
