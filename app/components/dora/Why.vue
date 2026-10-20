<script setup lang="ts">
// 12 WHY DORA — the source-supported differentiators (§5.1 + the brief),
// one line each. No accuracy, AI, speed or "zero review" claims. Each cell
// carries a cyan-deep corner tick (the field-marker Signal) — a non-text
// stroke on white, never cyan text.
const { why } = useDora()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="12 / 13" class="mb-12 desktop:mb-16" />
      <DoraHeading :eyebrow="why.eyebrow" :title="why.headline" />
      <ul class="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] bg-[color:rgba(3,60,89,0.1)] ring-1 ring-[color:rgba(3,60,89,0.1)] tablet:grid-cols-2 desktop:grid-cols-4">
        <!-- data-fr sits on the inner block, inside the cell padding: on a
             cell flush with the grid's clipped edge, the reveal's start
             state would fall outside the clip and never intersect. -->
        <li v-for="(w, i) in why.items" :key="w.name" class="dw-cell relative bg-pureWhite p-4 tablet:p-6">
          <div data-fr>
            <span class="font-mono text-[10.5px] tabular-nums text-[color:rgba(3,60,89,0.5)]">{{ pad(i + 1) }}</span>
            <h3 class="mt-2 font-display text-[15px] font-bold tablet:mt-3 tablet:text-[18px] leading-tight tracking-[-0.01em] text-slateNavy">{{ w.name }}</h3>
            <p class="mt-1.5 text-[13px] leading-snug tablet:text-[14px] text-[color:rgba(3,60,89,0.68)]">{{ w.body }}</p>
          </div>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
.dw-cell::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 16px;
  width: 10px;
  height: 10px;
  border-top: 1.5px solid #0a7f93;
  border-right: 1.5px solid #0a7f93;
}
</style>
