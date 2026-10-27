<script setup lang="ts">
// 03 WHAT DORA IS — the FCP model as two layers: the reusable DORA core
// (navy slab, six modules) and the organisation's configuration laid over
// it (nine areas, dashed — they change per client). Below, the FCP
// delivery path with each stage's output (§2). The "not a replacement"
// boundary is stated plainly. Reveal: useFastReveal clip.
const { core } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="relative bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="top" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="03 / 13" class="mb-12 desktop:mb-16" />
      <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <DoraHeading size="md" :eyebrow="core.eyebrow" :title="core.headline" :lede="core.lede" />
          <p data-fr="fade" class="m-center mt-8 flex max-w-[46ch] gap-3 rounded-[14px] bg-pureWhite p-4 text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.75)] ring-1 ring-[color:rgba(3,60,89,0.1)] max-desktop:mx-auto max-desktop:text-left">
            <svg viewBox="0 0 16 16" class="mt-0.5 h-4 w-4 shrink-0 text-slateNavy" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6.5" /><path d="M8 7v4.5M8 4.6v.2" stroke-linecap="round" /></svg>
            {{ core.not }}
          </p>
        </div>

        <div class="desktop:col-span-7">
          <!-- Configuration layer -->
          <div data-fr class="rounded-[22px] border-2 border-dashed border-[color:rgba(3,60,89,0.22)] bg-pureWhite p-5 tablet:p-6">
            <p class="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.6)]">
              <span>{{ t('Your configuration') }}</span><span>{{ t('per organization') }}</span>
            </p>
            <ul class="mt-4 flex flex-wrap gap-2">
              <li v-for="(c, i) in core.config" :key="i" class="inline-flex items-center gap-2 rounded-full bg-surfaceNeutral px-3 py-1.5 font-display text-[13px] font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)]">
                <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ c }}
              </li>
            </ul>
          </div>
          <!-- Joint -->
          <div aria-hidden="true" class="flex justify-center gap-16 py-1">
            <span v-for="n in 3" :key="n" class="h-6 w-[2px] bg-[color:rgba(3,60,89,0.25)]" />
          </div>
          <!-- Core -->
          <div data-fr class="relative overflow-hidden rounded-[22px] bg-slateNavy p-5 text-pureWhite tablet:p-6">
            <p class="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.6)]">
              <span class="inline-flex items-center gap-2"><DoraMark surface="dark" :size="12" /> {{ t('core') }}</span><span>{{ t('reusable') }}</span>
            </p>
            <ul class="mt-4 grid grid-cols-2 gap-2 tablet:grid-cols-3">
              <li v-for="(m, i) in core.modules" :key="i" class="rounded-[12px] bg-[color:rgba(255,255,255,0.06)] px-3 py-3 ring-1 ring-[color:rgba(255,255,255,0.08)]">
                <span class="block font-mono text-[10px] tabular-nums text-doraCyan">{{ pad(i + 1) }}</span>
                <span class="mt-1 block font-display text-[14px] font-bold leading-tight">{{ m }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- FCP path -->
      <div class="mt-16 desktop:mt-20">
        <p data-fr="fade" class="m-center font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">{{ t('The FCP path') }}</p>
        <ol class="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-[color:rgba(3,60,89,0.1)] ring-1 ring-[color:rgba(3,60,89,0.1)] tablet:grid-cols-3 desktop:grid-cols-6">
          <!-- Reveal on the inner block (inside the padding) — see DoraWhy. -->
          <li v-for="(s, i) in core.path" :key="i" class="bg-pureWhite p-5">
            <div data-fr>
              <span class="font-mono text-[10px] tabular-nums text-[color:rgba(3,60,89,0.5)]">{{ pad(i + 1) }}</span>
              <span class="mt-1 block font-display text-[17px] font-bold text-slateNavy">{{ s.name }}</span>
              <span class="mt-1 block text-[13px] leading-snug text-[color:rgba(3,60,89,0.65)]">{{ s.out }}</span>
            </div>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>
