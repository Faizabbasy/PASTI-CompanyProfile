<script setup lang="ts">
// CUSTOMIZATION & IMPLEMENTATION (slides 20, 21) — OPEN's second
// differentiator. The nine customization areas set as a configuration
// panel: each area has its own setting slider, and the knobs settle at
// different positions on entry — every organization's OPEN is set
// differently. (Decorative: the knob positions mean nothing.) Then the six
// implementation phases on one trace and the deck's foundation
// implementation scope, worded as "can include" — not every engagement
// includes every activity.
const { customization } = useOpen()
const panelRef = ref<HTMLElement | null>(null)
const panelIn = useOpenInView(panelRef, 0.2)
const phasesRef = ref<HTMLElement | null>(null)
const phasesIn = useOpenInView(phasesRef, 0.35)
const knob = (i: number) => 22 + ((i * 37) % 64)
</script>

<template>
  <section id="customization" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 80%; --lift-y: 90%">
    <BaseContainer>
      <OpenTag :n="10" label="Customization & implementation" />

      <div class="mt-14 grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <OpenHeading class="desktop:col-span-7" :lines="customization.title" size="xl" />
        <p class="text-[16px] font-medium text-[color:rgba(3,60,89,0.75)] desktop:col-span-4 desktop:col-start-9">{{ customization.intro }}</p>
      </div>

      <ul ref="panelRef" class="mt-12 grid overflow-hidden rounded-[24px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite tablet:grid-cols-2 desktop:grid-cols-3" :class="{ 'is-in': panelIn }">
        <li v-for="(a, i) in customization.areas" :key="a.label" class="group border-b border-[color:rgba(3,60,89,0.1)] p-6 tablet:border-r desktop:p-7">
          <div class="flex items-center justify-between gap-4">
            <p class="font-display text-[19px] font-extrabold tracking-[-0.015em] text-slateNavy">{{ a.label }}</p>
            <span aria-hidden="true" class="relative block h-[6px] w-24 shrink-0 rounded-full bg-[color:rgba(3,60,89,0.08)]">
              <span class="op-draw absolute inset-y-0 left-0 rounded-full bg-slateNavy" :style="{ width: `${knob(i)}%`, '--d': `${i * 70}ms` }" />
              <span class="op-knob absolute inset-0" :style="{ '--x': `${knob(i)}%`, '--d': `${i * 70}ms` }"><span class="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-slateNavy bg-pastiYellow-500" /></span>
            </span>
          </div>
          <p class="mt-3 text-[14.5px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ a.body }}</p>
        </li>
      </ul>

      <p class="mt-14 max-w-[64rem] op-display text-[length:clamp(26px,3.4vw,50px)] text-slateNavy">
        {{ customization.line[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ customization.line[1] }}</span>
      </p>

      <!-- Implementation approach -->
      <div ref="phasesRef" class="mt-24 desktop:mt-32" :class="{ 'is-in': phasesIn }">
        <OpenHeading :lines="customization.implTitle" size="md" />
        <ol class="relative mt-12 grid gap-8 tablet:grid-cols-3 desktop:grid-cols-6 desktop:gap-4">
          <span aria-hidden="true" class="op-draw absolute left-0 right-0 top-[22px] hidden h-[3px] bg-pastiYellow-500 desktop:block" style="--d: 100ms" />
          <li v-for="(p, i) in customization.phases" :key="p.label" class="relative">
            <span class="op-pop op-num relative z-10 grid h-11 w-11 place-items-center rounded-full bg-slateNavy font-display text-[14px] font-extrabold text-pastiYellow-500" :style="{ '--d': `${200 + i * 110}ms` }">{{ String(i + 1).padStart(2, '0') }}</span>
            <p class="mt-5 font-display text-[22px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ p.label }}</p>
            <p class="mt-1.5 text-[14px] leading-snug text-[color:rgba(3,60,89,0.7)]">{{ p.body }}</p>
          </li>
        </ol>

        <div class="mt-16 rounded-[24px] bg-[color:rgba(3,60,89,0.04)] p-6 tablet:p-8">
          <p class="font-display text-[16px] font-bold text-slateNavy">{{ customization.scopeIntro }}</p>
          <ul class="mt-5 grid gap-x-8 tablet:grid-cols-2 desktop:grid-cols-4">
            <li v-for="s in customization.scope" :key="s.label" class="border-t border-[color:rgba(3,60,89,0.12)] py-4">
              <p class="font-display text-[15.5px] font-extrabold text-slateNavy">{{ s.label }}</p>
              <p class="mt-1 text-[13.5px] text-[color:rgba(3,60,89,0.68)]">{{ s.body }}</p>
            </li>
          </ul>
          <p class="mt-4 text-[14px] font-medium text-slateNavy">{{ customization.implLine }}</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.op-knob {
  transform: translateX(var(--x));
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms);
}
:global(html[data-reduced-motion='false']) .op-knob {
  transform: none;
}
:global(html[data-reduced-motion='false']) .is-in .op-knob {
  transform: translateX(var(--x));
}
</style>
