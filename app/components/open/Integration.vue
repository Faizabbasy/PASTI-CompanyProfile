<script setup lang="ts">
import gsap from 'gsap'

// INTEGRATION & ARCHITECTURE — OPEN as the layer between the client's
// enterprise systems (generic, unnamed slots — BUTUH DATA: real system list)
// and the governance/audit base. Connection lines draw in on entry; hovering
// a slot highlights its path. No third-party logos.
const { integrationBody, foundation } = useOpen()
const { scrollTo } = useOpenDemo()

const systems = ['System 01', 'System 02', 'System 03', 'System 04']
const hovered = ref<number | null>(null)
const xs = [80, 260, 440, 620]

const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const paths = section.querySelectorAll<SVGPathElement>('[data-in-path]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    paths.forEach((p) => {
      const len = p.getTotalLength()
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
    })
    const t = gsap.to(paths, { strokeDashoffset: 0, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic, stagger: 0.12, scrollTrigger: { trigger: section, start: 'top 60%', once: true } })
    return () => {
      t.kill()
      gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' })
    }
  })
})
</script>

<template>
  <section ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 90%; --lift-y: 90%">
    <BaseGridLines tone="light" />
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -bottom-[20%] right-[0%] h-[44vw] max-h-[600px] w-[44vw] max-w-[600px] opacity-70" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Integration" meta="06 / 11" />

      <div class="mt-12 grid items-center gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-4">
          <OpenHeading size="md" before="Integration & " mark="Architecture" :lede="integrationBody" />
          <button type="button" class="group mt-6 inline-flex min-h-11 items-center gap-2 font-display text-[15px] font-bold text-slateNavy" @click="scrollTo('demo')">
            Talk to our team
            <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </button>
        </div>

        <div class="rounded-[28px] border border-[color:rgba(3,60,89,0.08)] bg-pureWhite p-5 shadow-[0_50px_100px_-60px_rgba(3,60,89,0.6)] tablet:p-8 desktop:col-span-7 desktop:col-start-6">
          <!-- Phones: the same layers, stacked in HTML so labels stay legible -->
          <div class="flex flex-col items-center gap-3 tablet:hidden">
            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.5)]">Enterprise systems</span>
            <div class="grid w-full grid-cols-2 gap-2">
              <span v-for="s in systems" :key="s" class="rounded-[12px] border border-[color:rgba(3,60,89,0.2)] bg-pureWhite py-3 text-center font-display text-[14px] font-bold text-slateNavy">{{ s }}</span>
            </div>
            <span aria-hidden="true" class="h-8 w-px bg-[color:rgba(3,60,89,0.3)]" />
            <span class="inline-flex w-full items-center justify-center gap-3 rounded-[16px] bg-slateNavy py-5">
              <OpenMark :size="28" /><span class="font-display text-[24px] font-extrabold tracking-[-0.02em] text-pureWhite">OPEN</span>
            </span>
            <span aria-hidden="true" class="h-8 w-px bg-[color:rgba(3,60,89,0.3)]" />
            <span class="w-full rounded-[14px] border border-dashed border-[color:rgba(3,60,89,0.3)] py-4 text-center font-display text-[14px] font-bold text-slateNavy">{{ foundation.join(' · ') }}</span>
          </div>
          <svg viewBox="0 0 700 420" class="hidden h-auto w-full overflow-visible tablet:block" role="img" aria-label="Enterprise systems connect to OPEN, which runs on a governance and audit base">
            <text x="0" y="14" class="fill-[color:rgba(3,60,89,0.5)] font-mono text-[11px] uppercase tracking-[0.16em]">Enterprise systems</text>
            <path
              v-for="(x, i) in xs"
              :key="`p${i}`"
              data-in-path
              :d="`M${x} 86 C ${x} 150, 350 140, 350 196`"
              fill="none"
              :stroke="hovered === i ? '#FBBA00' : 'rgba(3,60,89,0.3)'"
              :stroke-width="hovered === i ? 2.5 : 1.5"
              class="transition-[stroke,stroke-width] duration-300"
            />
            <g
              v-for="(s, i) in systems"
              :key="s"
              class="cursor-default"
              @mouseenter="hovered = i"
              @mouseleave="hovered = null"
            >
              <rect :x="xs[i]! - 72" y="30" width="144" height="56" rx="14" :fill="hovered === i ? '#033C59' : '#fff'" stroke="rgba(3,60,89,0.2)" class="transition-[fill] duration-300" />
              <text :x="xs[i]" y="63" text-anchor="middle" class="font-display text-[14px] font-bold transition-[fill] duration-300" :class="hovered === i ? 'fill-pureWhite' : 'fill-slateNavy'">{{ s }}</text>
            </g>

            <!-- OPEN core -->
            <rect x="200" y="196" width="300" height="88" rx="20" fill="#033C59" />
            <circle cx="262" cy="240" r="17" fill="none" stroke="#FBBA00" stroke-width="4" />
            <path d="M254 240.5l6 6 10-11" fill="none" stroke="#FBBA00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <text x="292" y="248" class="fill-pureWhite font-display text-[26px] font-extrabold tracking-[-0.02em]">OPEN</text>

            <path data-in-path d="M350 284 V 330" stroke="rgba(3,60,89,0.3)" stroke-width="1.5" fill="none" />
            <!-- Foundation -->
            <rect x="20" y="330" width="660" height="62" rx="16" fill="none" stroke="rgba(3,60,89,0.25)" stroke-dasharray="4 5" />
            <text x="350" y="367" text-anchor="middle" class="fill-slateNavy font-display text-[15px] font-bold">{{ foundation.join('  ·  ') }}</text>
          </svg>
          <div class="mt-5 flex items-center justify-between border-t border-[color:rgba(3,60,89,0.08)] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)]"><span>Systems shown as placeholders</span><LayoutBrandMark surface="light" :height="10" /></div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
