<script setup lang="ts">
// INTEGRATION & ARCHITECTURE — high level only, as the brief asks:
// e-CORPORATE ↔ Integration / API layer ↔ existing enterprise environment.
// The five targets are EXAMPLES (labelled on the page), not confirmed
// supported integrations; no vendors, no protocols. Three ruled tiers with a
// slow travelling signal on the links (CSS only, off under reduced motion).
// Desktop: tiers left → right. Below desktop: top → bottom.
const { integrationTargets, integrationNote, integrationBody } = useEcorporate()
</script>

<template>
  <section id="architecture" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 10%; --lift-y: 90%">
    <BaseGridLines tone="light" />
    <EcorpMarks label="08 / 12 · Architecture, high level" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Integration & architecture" meta="08 / 12" />
      <div class="mt-12 grid gap-6 desktop:grid-cols-12 desktop:items-end">
        <EcorpHeading class="desktop:col-span-7" size="md" eyebrow="Integration & architecture" before="Built to sit inside your " mark="existing environment" />
        <p class="m-center max-w-[28rem] text-[16px] leading-relaxed text-[color:rgba(3,60,89,0.76)] desktop:col-span-5 desktop:justify-self-end">{{ integrationBody }}</p>
      </div>

      <div class="mt-14 grid items-stretch gap-0 desktop:grid-cols-[1fr_auto_1fr_auto_1.25fr]" role="group" aria-label="Architecture overview">
        <!-- Tier 1 -->
        <div class="flex flex-col border border-slateNavy bg-slateNavy p-6 text-pureWhite">
          <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">Tier 01 · Platform</span>
          <EcorpWordmark surface="dark" class="mt-6 text-[28px]" />
          <p class="mt-2 text-[14px] text-[color:rgba(255,255,255,0.7)]">People, processes and information in one environment.</p>
        </div>
        <!-- Link -->
        <div aria-hidden="true" class="ei-link relative mx-auto h-12 w-px bg-[color:rgba(3,60,89,0.25)] desktop:my-auto desktop:h-px desktop:w-16"><span class="ei-dot absolute h-1.5 w-1.5 bg-pastiYellow-500" /></div>
        <!-- Tier 2 -->
        <div class="flex flex-col border border-[color:rgba(3,60,89,0.2)] bg-pureWhite p-6">
          <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Tier 02 · Connection</span>
          <p class="mt-6 font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-slateNavy">Integration / API layer</p>
          <div aria-hidden="true" class="mt-auto flex gap-1 pt-6">
            <span v-for="n in 12" :key="n" class="h-2 flex-1" :class="n % 4 === 0 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.12)]'" />
          </div>
        </div>
        <!-- Link -->
        <div aria-hidden="true" class="ei-link ei-link--b relative mx-auto h-12 w-px bg-[color:rgba(3,60,89,0.25)] desktop:my-auto desktop:h-px desktop:w-16"><span class="ei-dot absolute h-1.5 w-1.5 bg-pastiYellow-500" /></div>
        <!-- Tier 3 -->
        <div class="flex flex-col border border-dashed border-[color:rgba(3,60,89,0.35)] bg-[color:rgba(255,255,255,0.6)] p-6">
          <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Tier 03 · Existing enterprise environment</span>
          <ul class="mt-5 grid grid-cols-2 gap-2">
            <li v-for="t in integrationTargets" :key="t" class="flex min-h-11 items-center gap-2 border border-[color:rgba(3,60,89,0.16)] bg-pureWhite px-3 font-display text-[14px] font-bold text-slateNavy last:col-span-2">
              <span aria-hidden="true" class="h-1.5 w-1.5 border border-slateNavy" />{{ t }}
            </li>
          </ul>
        </div>
      </div>
      <p class="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">
        <span aria-hidden="true" class="h-1.5 w-1.5 border border-slateNavy" />{{ integrationNote }}
      </p>
    </BaseContainer>
  </section>
</template>

<style scoped>
/* Travelling signal: transform-only (no layout work). Link is 48px tall
   below desktop, 64px wide on desktop. */
.ei-dot {
  left: -2.5px;
  top: -3px;
  transform: none;
}
@media (min-width: 1024px) {
  .ei-dot {
    left: -3px;
    top: -2.5px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .ei-dot {
    animation: ei-v 2.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .ei-link--b .ei-dot {
    animation-delay: 1.4s;
  }
  @media (min-width: 1024px) {
    .ei-dot {
      animation-name: ei-h;
    }
  }
}
@keyframes ei-v {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(48px); opacity: 0; }
}
@keyframes ei-h {
  0% { transform: translateX(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(64px); opacity: 0; }
}
</style>
