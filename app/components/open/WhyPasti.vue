<script setup lang="ts">
// WHY PASTI TECHNOLOGY — quieter beat that ties OPEN back to its builder
// ("OPEN by PASTI"). Copy is BUTUH DATA (candidate source: the site's Why
// Choose Us content, pending owner approval to reuse), so body is Lorem.
const { whyBody } = useOpen()
</script>

<template>
  <section class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 50%; --lift-y: 100%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Why PASTI" meta="10 / 11" />
      <div class="mt-12 grid gap-10 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-6">
          <p class="m-center-row flex items-center gap-3">
            <OpenMark :size="30" />
            <span class="font-display text-[15px] font-extrabold tracking-[0.02em] text-slateNavy">OPEN</span>
            <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">by</span>
            <LayoutBrandMark surface="light" :height="16" />
          </p>
          <OpenHeading class="mt-6" size="md" before="Why " mark="PASTI" after=" Technology" />
        </div>
        <div class="m-center desktop:col-span-5 desktop:col-start-8 desktop:self-end">
          <p class="text-[17px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ whyBody }}</p>
          <NuxtLink to="/about" class="group mt-6 inline-flex min-h-11 items-center gap-2 font-display text-[15px] font-bold text-slateNavy">
            About PASTI
            <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </NuxtLink>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
