<script setup lang="ts">
import gsap from 'gsap'

// GOVERNANCE, VISIBILITY & CONTROL — deep navy structural section built only
// on the brief's safe themes (no certifications, compliance or encryption
// standards). Visual: an approval trail — each step with the role that owns
// it — revealed row by row, i.e. accountability shown, not claimed.
const { governanceThemes, trail } = useEcorporate()

const sectionRef = ref<HTMLElement | null>(null)
useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-eg-row]')
  const spine = section.querySelector<HTMLElement>('[data-eg-spine]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rows, { autoAlpha: 0, x: 20 })
    if (spine) gsap.set(spine, { scaleY: 0 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section.querySelector('[data-eg-trail]'), start: 'top 72%', once: true } })
    tl.to(spine ?? {}, { scaleY: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic })
      .to(rows, { autoAlpha: 1, x: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.15 }, 0.1)
    return () => {
      tl.kill()
      gsap.set([rows, spine], { clearProps: 'all' })
    }
  })
})
</script>

<template>
  <section id="governance" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <div aria-hidden="true" class="ec-dots--dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(270deg,#000,transparent_60%)]" />
    <BaseGridLines tone="dark" />
    <EcorpMarks surface="dark" label="09 / 12 · Accountability" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark label="Governance" meta="09 / 12" />

      <div class="mt-12 grid gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="desktop:col-span-5">
          <EcorpHeading surface="dark" size="md" eyebrow="Governance, visibility & control" before="Every step owned. Every step " mark="visible" />
          <ul class="mt-10 border-t border-[color:rgba(255,255,255,0.14)]">
            <li v-for="(t, i) in governanceThemes" :key="t" class="flex items-center gap-4 border-b border-[color:rgba(255,255,255,0.14)] py-3.5">
              <span class="w-6 font-mono text-[11px] text-[color:rgba(255,255,255,0.45)]">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="font-display text-[17px] font-semibold">{{ t }}</span>
            </li>
          </ul>
        </div>

        <!-- Approval trail (illustrative) -->
        <div data-eg-trail class="desktop:col-span-6 desktop:col-start-7 desktop:self-center">
          <div class="border border-[color:rgba(255,255,255,0.18)] bg-pureWhite text-slateNavy" role="img" aria-label="Illustrative approval trail: request submitted by the requester, reviewed by the department head, approved by the approver and recorded by the information owner.">
            <div aria-hidden="true">
              <div class="flex items-center justify-between border-b border-[color:rgba(3,60,89,0.1)] px-5 py-3.5">
                <span class="flex items-center gap-3"><EcorpWordmark class="text-[13px]" /><span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Approval trail</span></span>
                <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)]">Illustrative</span>
              </div>
              <ol class="relative px-5 py-4">
                <span data-eg-spine class="absolute bottom-8 left-[31px] top-8 w-[2px] origin-top bg-pastiYellow-500" />
                <li v-for="(t, i) in trail" :key="t.step" data-eg-row class="relative flex items-center gap-4 py-3.5">
                  <span class="relative z-10 grid h-6 w-6 shrink-0 place-items-center" :class="i < trail.length - 1 ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-slateNavy text-pureWhite'">
                    <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M3 8.5l3 3 7-7" /></svg>
                  </span>
                  <span class="flex-1 font-display text-[16px] font-bold">{{ t.step }}</span>
                  <span class="border border-[color:rgba(3,60,89,0.18)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.7)]">{{ t.role }}</span>
                </li>
              </ol>
              <div class="grid grid-cols-3 border-t border-[color:rgba(3,60,89,0.1)] font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.6)]">
                <span class="border-r border-[color:rgba(3,60,89,0.1)] px-5 py-3">Owner per step</span>
                <span class="border-r border-[color:rgba(3,60,89,0.1)] px-5 py-3">Visible status</span>
                <span class="px-5 py-3">One record</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
