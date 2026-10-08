<script setup lang="ts">
// OPEN IS NOT ANOTHER SAAS (slide 5). Why: six things every organization
// has differently. How: two tracks on one six-column grid — the SaaS track
// (Subscribe → Configure → Use) stops at column three, greyed; OPEN's
// approach (Understand → … → Deploy) runs the full width on a yellow trace
// that draws on entry, each step checked. The length difference is the
// argument. Closing line set large: the system adapts to your business.
const { notSaas } = useOpen()
const tracksRef = ref<HTMLElement | null>(null)
const tracksIn = useOpenInView(tracksRef, 0.35)
</script>

<template>
  <section class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 90%; --lift-y: 10%">
    <BaseContainer>
      <OpenTag :n="3" label="Not another SaaS" />

      <div class="mt-14 grid gap-14 desktop:grid-cols-12 desktop:gap-10">
        <OpenHeading class="desktop:col-span-6" :lines="notSaas.title" size="xl" />
        <div class="desktop:col-span-5 desktop:col-start-8">
          <p class="m-center text-[16px] font-medium text-[color:rgba(3,60,89,0.75)]">{{ notSaas.differsIntro }}</p>
          <ul class="mt-4 border-t border-[color:rgba(3,60,89,0.14)]">
            <li v-for="d in notSaas.differs" :key="d" class="flex items-baseline justify-between gap-4 border-b border-[color:rgba(3,60,89,0.14)] py-3.5">
              <span class="font-display text-[18px] font-bold tracking-[-0.015em] text-slateNavy">{{ d }}</span>
              <span class="text-[14px] italic text-[color:rgba(3,60,89,0.55)]">{{ notSaas.differsWord }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Two tracks, one grid -->
      <div ref="tracksRef" class="mt-20 space-y-10 desktop:mt-24" :class="{ 'is-in': tracksIn }">
        <div>
          <p class="text-[14px] font-semibold text-[color:rgba(3,60,89,0.5)]">{{ notSaas.saasLabel }}</p>
          <ol class="relative mt-4 grid grid-cols-3 desktop:grid-cols-6">
            <span aria-hidden="true" class="absolute left-0 top-[11px] h-[2px] w-full bg-[color:rgba(3,60,89,0.12)] desktop:w-1/2" />
            <li v-for="s in notSaas.saas" :key="s" class="relative pr-3">
              <span class="block h-6 w-6 rounded-full border-2 border-[color:rgba(3,60,89,0.22)] bg-pureWhite" />
              <span class="mt-3 block font-display text-[length:clamp(18px,2vw,26px)] font-bold tracking-[-0.02em] text-[color:rgba(3,60,89,0.4)] line-through decoration-[color:rgba(3,60,89,0.3)] decoration-2">{{ s }}</span>
            </li>
          </ol>
        </div>

        <div>
          <p class="flex items-center gap-2 text-[14px] font-semibold text-slateNavy"><OpenMark :size="16" />{{ notSaas.openLabel }}</p>
          <ol class="relative mt-4 grid grid-cols-2 gap-y-6 tablet:grid-cols-3 desktop:grid-cols-6 desktop:gap-y-0">
            <span aria-hidden="true" class="op-draw absolute left-0 top-[11px] hidden h-[3px] w-full bg-pastiYellow-500 desktop:block" style="--d: 150ms" />
            <li v-for="(s, i) in notSaas.open" :key="s" class="relative pr-3">
              <span class="op-pop relative z-10 grid h-6 w-6 place-items-center rounded-full bg-slateNavy text-pastiYellow-500" :style="{ '--d': `${300 + i * 110}ms` }">
                <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
              </span>
              <span class="mt-3 block font-display text-[length:clamp(18px,2vw,26px)] font-extrabold tracking-[-0.02em] text-slateNavy">{{ s }}</span>
            </li>
          </ol>
        </div>
      </div>

      <div class="mt-20 border-t border-[color:rgba(3,60,89,0.14)] pt-12 desktop:mt-24">
        <OpenHeading :lines="notSaas.line" size="lg" as="p" />
      </div>
    </BaseContainer>
  </section>
</template>
