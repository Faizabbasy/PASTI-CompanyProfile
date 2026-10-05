<script setup lang="ts">
import gsap from 'gsap'

// BUSINESS IMPACT — "What outcomes have been achieved?" Four proof points
// from the brief. These are CASE-SPECIFIC claims: every number is set with
// its case on the same line, never alone, never as an OPEN-wide promise.
// "Up to 40%" has no stated outcome in the brief yet (BUTUH KONFIRMASI).
const { proofs } = useOpen()

const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const nums = section.querySelectorAll<HTMLElement>('[data-im-num]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    // Numbers slide up from a mask rather than counting: a count-up would
    // flash figures (e.g. 98%) the brief never claimed.
    gsap.set(nums, { yPercent: 105 })
    const tweens = Array.from(nums).map((el) =>
      gsap.to(el, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
    )
    return () => {
      tweens.forEach((t) => t.kill())
      gsap.set(nums, { clearProps: 'transform' })
    }
  })
})
</script>

<template>
  <section id="impact" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 90%; --lift-y: 10%">
    <BaseGridLines tone="light" />
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -left-[14%] top-[20%] h-[48vw] max-h-[660px] w-[48vw] max-w-[660px] opacity-70" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Business impact" meta="09 / 11" />

      <div class="mt-10 grid gap-6 desktop:grid-cols-12 desktop:items-end">
        <OpenHeading class="desktop:col-span-7" eyebrow="Proof" before="Business " mark="Impact" />
        <p class="m-center max-w-[24rem] font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-[color:rgba(3,60,89,0.55)] desktop:col-span-4 desktop:col-start-9 desktop:justify-self-end desktop:text-right">
          Case-specific results from individual implementations
        </p>
      </div>

      <!-- Navy proof cards (as the homepage's Trusted Partner numbers) -->
      <ul class="mt-12 grid gap-4 tablet:grid-cols-2 tablet:gap-5">
        <li
          v-for="(p, i) in proofs"
          :key="p.outcome + p.context"
          class="relative isolate flex min-h-[260px] flex-col overflow-hidden rounded-[28px] bg-slateNavy p-6 text-pureWhite shadow-[0_50px_100px_-60px_rgba(3,60,89,0.95)] tablet:p-8 desktop:min-h-[320px]"
        >
          <div v-if="i === 1" aria-hidden="true" class="open-glow pointer-events-none absolute -right-[30%] -top-[40%] -z-10 h-[420px] w-[420px] opacity-40" />
          <div class="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.5)]">
            <span>{{ String(i + 1).padStart(2, '0') }} / {{ String(proofs.length).padStart(2, '0') }}</span>
            <LayoutBrandMark surface="dark" :height="10" />
          </div>
          <p class="mt-auto pt-8 font-display font-extrabold leading-[0.9] tracking-[-0.05em]">
            <span v-if="p.prefix" class="mb-1 block text-[18px] font-bold tracking-[-0.01em] text-[color:rgba(255,255,255,0.7)] tablet:text-[22px]">{{ p.prefix.trim() }}</span>
            <span class="inline-block overflow-hidden align-bottom text-[length:clamp(72px,9vw,128px)] leading-[0.95] text-pastiYellow-500"><span data-im-num class="inline-block">{{ p.value }}{{ p.suffix.startsWith('%') ? '%' : '' }}</span></span>
            <span v-if="p.suffix.length > 1" class="ml-3 text-[length:clamp(26px,3vw,44px)] tracking-[-0.03em]">{{ p.suffix.replace('%', '').trim() }}</span>
          </p>
          <p data-im-rule class="mt-5 border-t border-[color:rgba(255,255,255,0.16)] pt-5 font-display text-[20px] font-bold leading-[1.2] tracking-[-0.015em] tablet:text-[22px]">
            {{ p.outcome }}
            <span v-if="p.pending" class="ml-1 inline-block rounded-full border border-[color:rgba(255,255,255,0.3)] px-2 py-0.5 align-middle font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.6)]">Outcome pending</span>
          </p>
          <p class="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-pastiYellow-500 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-slateNavy">
            <OpenMark tone="navy" :size="13" />{{ p.context }}
          </p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>
