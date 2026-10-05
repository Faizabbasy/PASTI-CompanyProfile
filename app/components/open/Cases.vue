<script setup lang="ts">
import gsap from 'gsap'

// PROVEN EXPERIENCE — "What has PASTI implemented, and for whom?" The five
// clients from the brief as an editorial index (names as typography; logos
// only once assets + permission exist). Per-case context/scope/year is
// BUTUH DATA, so each row says so instead of inventing it. Cases with proof
// points link down to Business Impact.
const { cases } = useOpen()
const { scrollTo } = useOpenDemo()

const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-cs-row]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rows, { clipPath: 'inset(0 0 100% 0)', y: 20 })
    const t = gsap.to(rows, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.09, scrollTrigger: { trigger: section, start: 'top 65%', once: true } })
    return () => {
      t.kill()
      gsap.set(rows, { clearProps: 'clipPath,y' })
    }
  })
})
</script>

<template>
  <section id="cases" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 10%; --lift-y: 20%">
    <BaseGridLines tone="light" />
    <span aria-hidden="true" class="open-ghost absolute -right-[3%] top-[6%] text-[length:clamp(160px,28vw,440px)]">OPEN</span>
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Proven experience" meta="08 / 11" />

      <OpenHeading class="mt-10" eyebrow="Proven experience" before="Case " mark="Studies" />

      <ol class="mt-12">
        <li
          v-for="(c, i) in cases"
          :key="c.client"
          data-cs-row
          class="group relative grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 overflow-hidden border-t border-[color:rgba(3,60,89,0.14)] py-6 last:border-b tablet:grid-cols-[48px_1fr_auto] desktop:px-4 desktop:py-8"
        >
          <span aria-hidden="true" class="absolute inset-0 -z-0 hidden origin-bottom scale-y-0 bg-slateNavy transition-transform duration-500 ease-editorial group-hover:scale-y-100 desktop:block" />
          <span class="relative font-mono text-[12px] tabular-nums text-[color:rgba(3,60,89,0.45)] transition-colors duration-300 desktop:group-hover:text-pastiYellow-500">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="relative font-display text-[length:clamp(26px,4.6vw,64px)] font-extrabold leading-[1] tracking-[-0.035em] text-slateNavy transition-[color,transform] duration-500 ease-editorial desktop:group-hover:translate-x-2 desktop:group-hover:text-pureWhite">{{ c.client }}</h3>
          <div class="relative col-start-2 flex flex-wrap items-center gap-3 tablet:col-start-3 tablet:justify-end">
            <span class="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.45)] transition-colors duration-300 desktop:group-hover:text-[color:rgba(255,255,255,0.6)]">Case details coming soon</span>
            <button
              v-if="c.hasProof"
              type="button"
              class="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-pastiYellow-500 px-3 font-display text-[13px] font-bold text-slateNavy transition-transform duration-200 active:scale-[0.97]"
              @click="scrollTo('impact')"
            >
              See impact
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 rotate-90" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </button>
          </div>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>
