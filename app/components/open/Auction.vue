<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// DEDICATED e-AUCTION — the page's signature moment. A bid board fragment
// whose ranking reshuffles as you scroll: illustrative only — no prices, no
// timers, no speed claims (BUTUH DATA: real e-Auction UI and flow copy).
// The "Up to 40%" proof stays in Business Impact with its case context.
const { auctionBody, flow } = useOpen()
const { requestDemo } = useOpenDemo()
const step = flow.findIndex((s) => s.module === 'e-auction')
const before = flow[step - 1]?.label
const after = flow[step + 1]?.label

// Ranking per round (indexes into bidders); bar = relative position only.
const bidders = ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D']
const rounds = [
  [0, 1, 2, 3],
  [2, 0, 3, 1],
  [3, 2, 0, 1],
  [1, 3, 2, 0]
]
const round = ref(0)
const rankOf = (b: number) => rounds[round.value]!.indexOf(b)

const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const board = section.querySelector<HTMLElement>('[data-au-board]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const st = ScrollTrigger.create({
      trigger: board,
      start: 'top 75%',
      end: 'bottom 25%',
      onUpdate: (self) => {
        round.value = Math.min(rounds.length - 1, Math.floor(self.progress * rounds.length))
      }
    })
    return () => st.kill()
  })
  mm.add(reducedMotionQuery.reduce, () => {
    round.value = rounds.length - 1
  })
})
</script>

<template>
  <section id="e-auction" ref="sectionRef" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <!-- Depth: navy-family gradient + one yellow lift + orbit lines (as in
         the homepage Platforms world). Static, gradient-only. -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10" style="background: radial-gradient(ellipse 60% 70% at 78% 45%, rgba(251,186,0,0.16), transparent 65%), radial-gradient(ellipse 70% 60% at 10% 100%, #022436, transparent 70%), linear-gradient(180deg, #033C59 0%, #022F47 100%)" />
    <BaseGridLines tone="dark" />
    <svg aria-hidden="true" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" class="pointer-events-none absolute inset-0 -z-10 h-full w-full" fill="none">
      <ellipse cx="880" cy="360" rx="520" ry="210" stroke="rgba(251,186,0,0.35)" stroke-width="1" transform="rotate(-12 880 360)" />
      <ellipse cx="880" cy="360" rx="380" ry="140" stroke="rgba(255,255,255,0.08)" stroke-width="1" transform="rotate(-12 880 360)" />
      <circle cx="1390" cy="250" r="5" fill="#FBBA00" transform="rotate(-12 880 360)" />
    </svg>
    <span aria-hidden="true" class="open-ghost absolute -bottom-[6%] right-[-2%] text-[length:clamp(140px,24vw,380px)] !text-[color:rgba(255,255,255,0.035)]">BID</span>

    <BaseContainer class="relative z-10">
      <BaseSectionMark label="e-Auction" meta="05 / 11" />

      <div class="mt-12 grid items-center gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-5">
          <p class="m-center-row inline-flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">
            <span>{{ before }}</span><span aria-hidden="true">→</span>
            <span class="rounded-full bg-pastiYellow-500 px-2 py-0.5 text-slateNavy">Step {{ flow[step]?.index }}</span>
            <span aria-hidden="true">→</span><span>{{ after }}</span>
          </p>
          <OpenHeading class="mt-5" surface="dark" before="e-Auction / " mark="Bidding" :lede="auctionBody" />
          <div class="mt-8">
            <BaseHeroCtas surface="dark" :primary="{ label: 'Request Demo' }" @primary="requestDemo('e-auction')" />
          </div>
        </div>

        <!-- Bid board (illustrative) — a white product card on navy -->
        <div data-au-board class="desktop:col-span-6 desktop:col-start-7">
          <div class="overflow-hidden rounded-[24px] bg-pureWhite text-slateNavy shadow-[0_60px_120px_-40px_rgba(0,12,22,0.85)] desktop:rotate-[-2deg]">
            <div class="flex items-center justify-between border-b border-[color:rgba(3,60,89,0.08)] px-5 py-4">
              <span class="inline-flex items-center gap-2.5">
                <OpenMark :size="20" />
                <span class="font-display text-[14px] font-bold">Lot · Lorem ipsum</span>
              </span>
              <span class="inline-flex items-center gap-2 rounded-full bg-slateNavy px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-pureWhite">
                <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Round {{ round + 1 }} / {{ rounds.length }}
              </span>
            </div>
            <ol class="relative h-[288px]" aria-label="Illustrative bid ranking">
              <li
                v-for="(b, i) in bidders"
                :key="b"
                class="absolute inset-x-0 flex h-[72px] items-center gap-4 border-b border-[color:rgba(3,60,89,0.06)] px-5 transition-transform duration-700 ease-editorial"
                :style="{ transform: `translateY(${rankOf(i) * 72}px)` }"
              >
                <span
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[12px] font-semibold transition-colors duration-500"
                  :class="rankOf(i) === 0 ? 'bg-pastiYellow-500 text-slateNavy shadow-[0_0_0_5px_rgba(251,186,0,0.2)]' : 'bg-[color:rgba(3,60,89,0.06)] text-[color:rgba(3,60,89,0.6)]'"
                >{{ rankOf(i) + 1 }}</span>
                <span class="w-24 shrink-0 font-display text-[15px] font-bold">{{ b }}</span>
                <span class="relative h-2 flex-1 overflow-hidden rounded-full bg-[color:rgba(3,60,89,0.07)]">
                  <span
                    class="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-700 ease-editorial"
                    :class="rankOf(i) === 0 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.28)]'"
                    :style="{ width: `${92 - rankOf(i) * 18}%` }"
                  />
                </span>
              </li>
            </ol>
            <div class="flex items-center justify-between px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)]">
              <span>Illustrative · UI placeholder</span>
              <LayoutBrandMark surface="light" :height="10" />
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
