<script setup lang="ts">
// 03 A FRAMEWORK, NOT A BLANK PAGE — FCP positioning (brief §04 + §14):
// a reusable product core under a configuration layer shaped by each
// organisation, then the six-step delivery principle. Visual: two stacked
// plates — the navy core, the yellow-edged configuration layer on top.
const { framework } = useFastPage()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="03 / 12" class="mb-12 desktop:mb-16" />
      <div><FastHeading :eyebrow="framework.eyebrow" :title="framework.headline" /></div>
      <div class="mt-12 grid gap-14 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <p data-fr="fade" class="m-center max-w-[46ch] text-token-body-large leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ framework.body }}</p>
          <ul data-fr class="mt-8 grid gap-2">
            <li v-for="(n, i) in framework.not" :key="i" class="flex items-center gap-3 font-display text-[15px] font-semibold text-slateNavy">
              <span aria-hidden="true" class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[color:rgba(3,60,89,0.2)] text-[11px]">✕</span>{{ n }}
            </li>
          </ul>
        </div>

        <!-- Stacked plates -->
        <div class="desktop:col-span-7">
          <div data-fr class="relative rounded-[24px] border-2 border-pastiYellow-500 bg-pureWhite p-6 shadow-[0_30px_60px_-40px_rgba(3,60,89,0.5)] tablet:p-8">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A5A00]">Configured per organisation</p>
            <ul class="mt-4 flex flex-wrap gap-2">
              <li v-for="(a, i) in framework.adapt" :key="i" class="rounded-full bg-[color:rgba(251,186,0,0.14)] px-3 py-1.5 font-display text-[13px] font-semibold text-slateNavy">{{ a }}</li>
            </ul>
          </div>
          <div aria-hidden="true" class="mx-auto h-6 w-px bg-[color:rgba(3,60,89,0.3)]" />
          <div data-fr class="relative rounded-[24px] bg-slateNavy p-6 text-pureWhite tablet:p-8">
            <div class="flex items-center justify-between gap-4">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">Reusable product core</p>
              <FastMark surface="dark" :size="14" />
            </div>
            <ul class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 tablet:grid-cols-3">
              <li v-for="(c, i) in framework.core" :key="i" class="flex items-center gap-2.5 font-display text-[14px] font-semibold">
                <span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />{{ c }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Delivery principle -->
      <ol class="mt-16 grid gap-3 tablet:grid-cols-3 desktop:mt-20 desktop:grid-cols-6">
        <li v-for="(s, i) in framework.steps" :key="i" data-fr class="relative rounded-[18px] bg-pureWhite p-5 ring-1 ring-[color:rgba(3,60,89,0.08)]">
          <span class="flex items-center gap-3">
            <span class="font-mono text-[11px] tabular-nums text-[color:rgba(3,60,89,0.45)]">{{ pad(i + 1) }}</span>
            <span aria-hidden="true" class="h-px flex-1 bg-[color:rgba(3,60,89,0.15)]" />
            <svg v-if="i < framework.steps.length - 1" viewBox="0 0 16 16" class="h-3.5 w-3.5 text-pastiYellow-600" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </span>
          <span class="mt-5 block font-display text-[18px] font-bold tracking-[-0.01em] text-slateNavy">{{ s.name }}</span>
          <span class="mt-1.5 block text-[13px] leading-snug text-[color:rgba(3,60,89,0.68)]">{{ s.body }}</span>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>
