<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// e-AUCTION SPOTLIGHT (slide 11) — "More than just online bidding."
// Deep navy. The eight-step process as a single readout: a big step word
// with its line, over an eight-segment rail. As the rail crosses the
// viewport (no pin) the readout advances Create → … → Trace; segments are
// buttons too. The ordered list underneath is the real content (all eight
// steps, always readable); the readout is a visual duplicate (aria-hidden).
// Then the six capabilities and five principles from the deck.
const { auction } = useOpen()
const { requestDemo } = useOpenDemo()
const steps = auction.steps
const active = ref(0)
const railRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const rail = railRef.value
  if (!rail) return
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const st = ScrollTrigger.create({
      trigger: rail,
      start: 'top 75%',
      end: 'bottom 30%',
      onUpdate: (self) => {
        const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length))
        if (i !== active.value) active.value = i
      }
    })
    return () => st.kill()
  })
})
</script>

<template>
  <section id="e-auction" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10" style="background: radial-gradient(ellipse 55% 60% at 15% 20%, rgba(251,186,0,0.13), transparent 70%), linear-gradient(180deg, #022F47 0%, #022436 100%)" />
    <div aria-hidden="true" class="op-rules--dark pointer-events-none absolute inset-0 -z-10" />

    <BaseContainer>
      <OpenTag :n="7" label="e-Auction" surface="dark" />

      <div class="mt-14 grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <OpenHeading :lines="auction.title" surface="dark" size="xl" :lede="auction.body" />
          <p class="m-center mt-8 font-display text-[19px] font-bold leading-snug">{{ auction.line[0] }}<br><span class="text-pastiYellow-500">{{ auction.line[1] }}</span></p>
          <div class="mt-9">
            <BaseHeroCtas surface="dark" :primary="{ label: 'Request a Demo' }" @primary="requestDemo('e-auction')" />
          </div>
        </div>

        <!-- Process readout -->
        <div ref="railRef" class="desktop:col-span-7 desktop:pl-6">
          <p class="m-center text-[14px] font-semibold text-[color:rgba(255,255,255,0.6)]">e-Auction process in OPEN</p>
          <div aria-hidden="true" class="relative mt-4 h-[148px] overflow-hidden tablet:h-[188px]">
            <Transition name="bid" mode="out-in">
              <div :key="active" class="m-center-col m-center absolute inset-0 flex flex-col justify-end">
                <span class="op-num font-display text-[15px] font-bold text-pastiYellow-500">{{ String(active + 1).padStart(2, '0') }} / {{ String(steps.length).padStart(2, '0') }}</span>
                <span class="op-display mt-1 text-[length:clamp(64px,10vw,140px)] !leading-[0.85]">{{ steps[active]?.label }}</span>
              </div>
            </Transition>
          </div>
          <p aria-hidden="true" class="m-center mt-3 min-h-[1.6em] text-[17px] text-[color:rgba(255,255,255,0.75)]">{{ steps[active]?.body }}</p>

          <ol class="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 tablet:grid-cols-4 desktop:grid-cols-8 desktop:gap-1.5">
            <li v-for="(s, i) in steps" :key="s.label">
              <button
                type="button"
                class="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500"
                :aria-current="i === active ? 'step' : undefined"
                @click="active = i"
              >
                <span class="block h-[5px] rounded-full transition-colors duration-300" :class="i <= active ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.14)] group-hover:bg-[color:rgba(255,255,255,0.3)]'" />
                <span class="mt-3 block font-display text-[14px] font-extrabold" :class="i === active ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.6)]'">{{ s.label }}</span>
                <span class="mt-0.5 block text-[12px] leading-snug text-[color:rgba(255,255,255,0.5)] desktop:hidden">{{ s.body }}</span>
              </button>
            </li>
          </ol>
        </div>
      </div>

      <!-- Key capabilities -->
      <div class="mt-20 desktop:mt-24">
        <p class="m-center font-display text-[20px] font-extrabold">Key capabilities</p>
        <ul class="mt-6 grid border-t border-[color:rgba(255,255,255,0.14)] tablet:grid-cols-2 desktop:grid-cols-3">
          <li v-for="c in auction.capabilities" :key="c.label" class="border-b border-[color:rgba(255,255,255,0.14)] py-4 tablet:py-6 tablet:pr-8">
            <p class="font-display text-[19px] font-extrabold tracking-[-0.015em]">{{ c.label }}</p>
            <p class="mt-2 text-[14.5px] text-[color:rgba(255,255,255,0.68)]">{{ c.body }}</p>
          </li>
        </ul>
      </div>

      <ul class="mt-12 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-5">
        <li v-for="p in auction.principles" :key="p.label" class="rounded-[18px] bg-[color:rgba(255,255,255,0.05)] p-5">
          <p class="flex items-center gap-2 font-display text-[15px] font-extrabold"><span class="h-2 w-2 rounded-full bg-pastiYellow-500" />{{ p.label }}</p>
          <p class="mt-2 text-[13.5px] leading-snug text-[color:rgba(255,255,255,0.65)]">{{ p.body }}</p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
.bid-enter-active,
.bid-leave-active {
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.bid-enter-from {
  transform: translateY(40%);
  opacity: 0;
}
.bid-leave-to {
  transform: translateY(-40%);
  opacity: 0;
}
[data-reduced-motion='true'] .bid-enter-active,
[data-reduced-motion='true'] .bid-leave-active {
  transition: none;
}
</style>
