<script setup lang="ts">
import gsap from 'gsap'

// GOVERNANCE, SECURITY & AUDITABILITY — trust shown as an audit ledger, not
// padlock icons. Ledger entries reuse e-Procurement capability names from the
// brief; actors and timestamps are placeholders. No certification badges or
// standard names until confirmed (BUTUH DATA).
const { governancePillars, governanceBody, modules } = useOpen()
const actions = (modules[0]?.capabilities ?? []).filter((c) => c !== 'Audit Trail').slice(0, 6)

const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-gv-row]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rows, { autoAlpha: 0, x: 24 })
    const t = gsap.to(rows, { autoAlpha: 1, x: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.12, scrollTrigger: { trigger: section.querySelector('[data-gv-ledger]'), start: 'top 75%', once: true } })
    return () => t.kill()
  })
})
</script>

<template>
  <section class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 10%; --lift-y: 10%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Governance" meta="07 / 11" />

      <!-- One navy panel (as the homepage's Trusted Partner card) -->
      <div class="relative isolate mt-12 overflow-hidden rounded-[32px] bg-slateNavy px-5 py-10 text-pureWhite shadow-[0_60px_120px_-60px_rgba(3,60,89,0.9)] tablet:px-10 tablet:py-14 desktop:px-14 desktop:py-16" data-header-theme="dark">
        <div aria-hidden="true" class="open-glow pointer-events-none absolute -right-[10%] -top-[30%] -z-10 h-[520px] w-[520px] opacity-50" />
        <div class="grid items-start gap-12 desktop:grid-cols-12 desktop:gap-8">
          <div class="desktop:col-span-5">
            <OpenHeading surface="dark" size="md" before="Governance, Security & " mark="Auditability" :lede="governanceBody" />
            <ul class="m-center-row mt-8 flex flex-wrap gap-2">
              <li v-for="p in governancePillars" :key="p" class="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.18)] bg-[color:rgba(255,255,255,0.04)] px-4 text-[14px] font-semibold">
                <OpenMark :size="14" />{{ p }}
              </li>
            </ul>
          </div>

          <div data-gv-ledger class="desktop:col-span-6 desktop:col-start-7">
            <div class="overflow-hidden rounded-[22px] bg-pureWhite text-slateNavy shadow-[0_40px_80px_-40px_rgba(0,12,22,0.8)]">
              <div class="flex items-center justify-between border-b border-[color:rgba(3,60,89,0.08)] px-5 py-4">
                <span class="inline-flex items-center gap-2.5"><OpenMark :size="18" /><span class="font-display text-[14px] font-bold">Audit Trail</span></span>
                <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)]">UI placeholder</span>
              </div>
              <ol class="font-mono text-[12px]">
                <li v-for="(a, i) in actions" :key="a" data-gv-row class="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[color:rgba(3,60,89,0.06)] px-5 py-4 last:border-0 tablet:grid-cols-[64px_1fr_120px_auto]">
                  <span class="text-[color:rgba(3,60,89,0.4)]">--:--</span>
                  <span class="font-display text-[14px] font-bold">{{ a }}</span>
                  <span class="hidden text-[color:rgba(3,60,89,0.5)] tablet:block">Lorem ipsum</span>
                  <span class="grid h-6 w-6 place-items-center rounded-full" :class="i < actions.length - 1 ? 'bg-pastiYellow-500 text-slateNavy' : 'border border-[color:rgba(3,60,89,0.25)]'">
                    <svg v-if="i < actions.length - 1" viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                  </span>
                </li>
              </ol>
              <div class="flex justify-end border-t border-[color:rgba(3,60,89,0.08)] px-5 py-3"><LayoutBrandMark surface="light" :height="10" /></div>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
