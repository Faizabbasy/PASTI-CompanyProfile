<script setup lang="ts">
// WHY PASTI — restrained: the brief's five points (descriptions TEMPORARY,
// no credentials, counts or awards). Ruled numbered list beside the PASTI
// signature and a link to /about.
const { why } = useEcorporate()
</script>

<template>
  <section id="why-pasti" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Why PASTI" meta="11 / 12" />
      <div class="mt-12 grid gap-12 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-5">
          <p class="m-center-row flex items-center gap-3">
            <EcorpWordmark class="text-[15px]" />
            <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">by</span>
            <LayoutBrandMark surface="light" :height="16" />
          </p>
          <EcorpHeading class="mt-6" size="md" before="Why " mark="PASTI" />
          <NuxtLink to="/about" class="group mt-8 inline-flex min-h-11 items-center gap-2 font-display text-[15px] font-bold text-slateNavy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500">
            About PASTI
            <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </NuxtLink>
        </div>
        <ol class="border-t border-[color:rgba(3,60,89,0.14)] desktop:col-span-7">
          <li v-for="(w, i) in why" :key="w.id" class="grid grid-cols-[40px_1fr] gap-x-4 border-b border-[color:rgba(3,60,89,0.14)] py-6">
            <span class="pt-1 font-mono text-[12px] tabular-nums text-[color:rgba(3,60,89,0.45)]">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <h3 class="font-display text-[20px] font-bold leading-tight tracking-[-0.015em] text-slateNavy tablet:text-[22px]">{{ w.title }}</h3>
              <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.7)]">{{ w.body }}</p>
            </div>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>
