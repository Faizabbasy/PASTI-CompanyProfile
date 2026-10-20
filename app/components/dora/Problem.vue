<script setup lang="ts">
// 02 THE DOCUMENT PROBLEM — eight plain statements from the blueprint's
// problem framing (§1.1, §2.1). No quantified pain. Each sits under a
// field-marker frame (the page Signal) that tightens on hover/focus, as if
// the page were being proof-read. Reveal: useFastReveal clip.
const { problem } = useDora()
const sectionRef = ref<HTMLElement | null>(null)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="none" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="02 / 13" class="mb-12 desktop:mb-16" />
      <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <div class="desktop:sticky desktop:top-32">
            <DoraHeading size="md" :eyebrow="problem.eyebrow" :title="problem.headline" :lede="problem.lede" />
          </div>
        </div>
        <ol class="grid gap-x-8 tablet:grid-cols-2 desktop:col-span-7">
          <li v-for="(p, i) in problem.items" :key="p.name" data-fr class="dp-item group grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-[color:rgba(3,60,89,0.12)] py-5 tablet:block tablet:py-7">
            <span class="dp-frame relative row-span-2 inline-grid h-9 w-11 place-items-center font-mono text-[11px] font-semibold tabular-nums text-slateNavy">
              <span aria-hidden="true" class="dp-corners absolute inset-0 text-doraCyan-deep transition-transform duration-500 ease-editorial group-hover:scale-90" />
              {{ pad(i + 1) }}
            </span>
            <h3 class="mt-1.5 font-display text-[18px] font-bold tablet:mt-4 tablet:text-[20px] leading-tight tracking-[-0.015em] text-slateNavy">{{ p.name }}</h3>
            <p class="mt-1.5 max-w-[38ch] text-[14.5px] leading-relaxed tablet:mt-2 tablet:text-[15px] text-[color:rgba(3,60,89,0.7)]">{{ p.body }}</p>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.dp-corners {
  --c: currentColor;
  background:
    linear-gradient(var(--c), var(--c)) top left / 8px 1.5px,
    linear-gradient(var(--c), var(--c)) top left / 1.5px 8px,
    linear-gradient(var(--c), var(--c)) top right / 8px 1.5px,
    linear-gradient(var(--c), var(--c)) top right / 1.5px 8px,
    linear-gradient(var(--c), var(--c)) bottom left / 8px 1.5px,
    linear-gradient(var(--c), var(--c)) bottom left / 1.5px 8px,
    linear-gradient(var(--c), var(--c)) bottom right / 8px 1.5px,
    linear-gradient(var(--c), var(--c)) bottom right / 1.5px 8px;
  background-repeat: no-repeat;
}
</style>
