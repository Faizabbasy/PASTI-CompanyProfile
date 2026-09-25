<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// MILESTONE 4A — Hero, total rework per docs/rework-v2/04-homepage-spec.md §1
// ("Operational Evidence in Motion" / "Precise Misalignment, Not Playful
// Irregularity"). This replaces the previous centered-SaaS-hero markup
// entirely — that composition (centered column, WebGL wire-grid backdrop,
// yellow cursor-spotlight duplicate text, diagonal shine sweep) directly
// contradicted the frozen asymmetric 55/45 Living Proof System direction
// and is discarded per the milestone's non-negotiable guardrail (frozen
// docs win over existing component structure/legacy implementation).
//
// Kept from the previous implementation: the masked word-reveal mechanic
// (`wrapWord`) and `useMagnetic` on the primary CTA — both are visually
// neutral techniques compatible with the new direction, not decorative
// legacy behavior tied to the old composition.

// Copy: no approved production headline exists yet for this reworked
// composition (04-homepage-spec.md's global copy rule) — using the
// required literal placeholder rather than inventing a new brand claim.
const headline = 'Lorem ipsum dolor sit amet'
const subtext = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
const ctaPrimary = { label: 'Explore our work', to: '#selected-work' }
const ctaSecondary = { label: 'Tell us about it' }

const { link: whatsappLink } = useWhatsapp()
const { introReady } = useIntroReady()
const { playTo } = useSectionCurtain()

function goToSelectedWork() {
  playTo(ctaPrimary.to)
}

// BaseSection renders via <component :is="as">, so a template `ref` here
// resolves to the component instance, not its DOM element (see
// pasti-gotchas memory #4 — a ref on a Vue component is never the DOM
// node). `$el` is Vue's fallthrough accessor to that single root element.
const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)
const sectionEl = computed<HTMLElement | null>(() => sectionComponentRef.value?.$el ?? null)
const headingRef = ref<HTMLElement | null>(null)
const subtextRef = ref<HTMLElement | null>(null)
const ctaRowRef = ref<HTMLElement | null>(null)
const ctaPrimaryRef = ref<HTMLElement | null>(null)

const primaryRef = ref<HTMLElement | null>(null)
const secondaryARef = ref<HTMLElement | null>(null)
const secondaryBRef = ref<HTMLElement | null>(null)
const microUtilityRef = ref<HTMLElement | null>(null)
const signalDotRef = ref<HTMLElement | null>(null)
const signalRouteRef = ref<HTMLElement | null>(null)

useMagnetic(ctaPrimaryRef, { strength: 0.2 })

/** Wraps a word in the outer-clip / inner-translate mask structure — see
 * git history for provenance. Kept verbatim as a technique; only the
 * composition around it changed. */
function wrapWord(word: string): { outer: HTMLSpanElement; inner: HTMLSpanElement } {
  const outer = document.createElement('span')
  outer.style.overflow = 'clip'
  outer.style.display = 'inline-block'
  outer.style.verticalAlign = 'top'
  outer.style.margin = '-0.2em'

  const inner = document.createElement('span')
  inner.style.display = 'inline-block'
  inner.style.padding = '0.2em'
  inner.textContent = word
  inner.dataset.revealEl = ''
  inner.dataset.revealKind = 'mask'

  outer.appendChild(inner)
  return { outer, inner }
}

// Micro Utility state cycle — whitelisted placeholder states only
// (04-homepage-spec.md "Micro Utility — Whitelist"). This is the element
// that "most visibly works": a restrained, non-looping index/state
// transition, not a fake KPI.
const microStates = ['SYSTEM ACTIVE', 'PROCESS READY', '01 / 04'] as const
const microStateIndex = ref(0)
const microStateLabel = computed(() => microStates[microStateIndex.value])

useGsapContext(() => {
  watch(
    introReady,
    (ready, _oldValue, onCleanup) => {
      if (!ready) return

      const mm = gsap.matchMedia()
      onCleanup(() => mm.revert())

      mm.add(reducedMotionQuery.reduce, () => {
        // Reduced motion: premium static composition, short mask/Signal
        // state acceptable, no long motion dependency (spec "Reduced
        // Motion"). Everything settles to its resting state immediately.
        gsap.set(
          [subtextRef.value, ctaRowRef.value, primaryRef.value, secondaryARef.value, secondaryBRef.value, microUtilityRef.value].filter(
            Boolean
          ),
          { opacity: 1, x: 0, y: 0, scale: 1, clearProps: 'filter' }
        )
        if (signalDotRef.value) gsap.set(signalDotRef.value, { opacity: 1 })
        if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 1 })
      })

      mm.add(reducedMotionQuery.noPreference, () => {
        const heading = headingRef.value
        if (!heading) return

        // --- Headline mask reveal setup ---
        const allHeadingWords: HTMLElement[] = []
        const headingText = heading.textContent ?? ''
        heading.textContent = ''
        for (const part of headingText.split(/(\s+)/).filter(Boolean)) {
          if (/^\s+$/.test(part)) {
            heading.appendChild(document.createTextNode(part))
            continue
          }
          const { outer, inner } = wrapWord(part)
          heading.appendChild(outer)
          allHeadingWords.push(inner)
        }

        if (subtextRef.value) {
          subtextRef.value.dataset.revealEl = ''
          subtextRef.value.dataset.revealKind = 'scroll'
        }
        if (ctaRowRef.value) {
          ctaRowRef.value.dataset.revealEl = ''
          ctaRowRef.value.dataset.revealKind = 'scroll'
        }

        gsap.set(allHeadingWords, { yPercent: 120 })
        gsap.set([subtextRef.value, ctaRowRef.value].filter(Boolean), { opacity: 0, y: 12 })

        // --- Living Proof System initial states ---
        // Primary: mostly stable — enters via a restrained scale/opacity
        // settle only (crop/reframe is its idle language, not entrance).
        if (primaryRef.value) gsap.set(primaryRef.value, { opacity: 0, y: 24, scale: 0.98 })
        // Secondary A: aligned to Primary's top edge — enters slightly
        // behind Primary, partial-occlusion depth already in the DOM
        // layering (z-index), not faked with blur.
        if (secondaryARef.value) gsap.set(secondaryARef.value, { opacity: 0, y: 18 })
        // Secondary B: farther crop, different parallax rate later.
        if (secondaryBRef.value) gsap.set(secondaryBRef.value, { opacity: 0, y: 14 })
        // Micro Utility: last to arrive — it's the payoff of the route.
        if (microUtilityRef.value) gsap.set(microUtilityRef.value, { opacity: 0, y: 10 })
        if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 0 })
        if (signalDotRef.value) gsap.set(signalDotRef.value, { opacity: 0, scale: 0.6 })

        // --- Load sequence: mask reveal → hierarchy settles → proof system activates ---
        const tl = gsap.timeline({ defaults: { ease: approvedEase.gsapStandard } })

        tl.to(allHeadingWords, { yPercent: 0, duration: motionTier.cinematicMin, stagger: motionStagger.loose })
        tl.to(
          subtextRef.value,
          { opacity: 1, y: 0, duration: motionTier.standardMax },
          `-=${motionTier.cinematicMin * 0.55}`
        )
        tl.to(
          ctaRowRef.value,
          { opacity: 1, y: 0, duration: motionTier.standardMax },
          `-=${motionTier.standardMax * 0.7}`
        )
        tl.addLabel('proofSystem', `-=${motionTier.standardMax * 0.4}`)

        // The Signal begins its route as the headline settles, reaching
        // Primary just as it arrives — "headline → primary proof" per the
        // spec's execution route.
        tl.to(signalRouteRef.value, { scaleY: 1, duration: motionTier.standardMax, ease: approvedEase.gsapCinematic }, 'proofSystem')
        tl.to(primaryRef.value, { opacity: 1, y: 0, scale: 1, duration: motionTier.cinematicMin * 0.8, ease: approvedEase.gsapCinematic }, 'proofSystem')
        tl.to(secondaryARef.value, { opacity: 1, y: 0, duration: motionTier.standardMax }, 'proofSystem+=0.12')
        tl.to(secondaryBRef.value, { opacity: 1, y: 0, duration: motionTier.standardMax }, 'proofSystem+=0.2')

        // "→ micro state" — Signal reaches its destination and the Micro
        // Utility activates: this is the single purposeful activation
        // moment, not a looping pulse.
        tl.to(signalDotRef.value, { opacity: 1, scale: 1, duration: motionTier.microMax }, 'proofSystem+=0.5')
        tl.to(microUtilityRef.value, { opacity: 1, y: 0, duration: motionTier.standardMin }, 'proofSystem+=0.55')

        // --- Idle motion: system-based, not "everything floating" ---
        // Secondary A: positional breathing, ±3-4px max, restrained.
        if (secondaryARef.value) {
          gsap.to(secondaryARef.value, {
            y: '+=4',
            duration: 3.4,
            ease: spatialEase.drift,
            repeat: -1,
            yoyo: true,
            delay: motionTier.cinematicMax
          })
        }

        // Micro Utility state cycle: a sparse, non-looping-feeling index
        // transition (index advances slowly; this is the element that
        // "most visibly works").
        const stateInterval = window.setInterval(() => {
          microStateIndex.value = (microStateIndex.value + 1) % microStates.length
        }, 4200)
        onCleanup(() => window.clearInterval(stateInterval))

        return () => tl.kill()
      })
    },
    { immediate: true }
  )

  // --- Scroll-driven Signal exit + Primary crop/reframe ---
  // Baseline additional scroll depth ~1.3-1.6 viewport (spec). Hero is not
  // one of the pinned Heavy-Signature stages (Selected Work/Platforms own
  // that mechanic) — but without pinning, a scrub tied to `end: '+=140%'`
  // has no real scroll runway to play across: the very next section
  // (What We Build) starts immediately below Hero's own 100svh box, so the
  // whole "exit" would resolve within whatever sliver of ordinary scrolling
  // happens to overlap it, not the ~1.3-1.6 viewport of dwell the spec
  // calls for (verified via Playwright: without a pin, scrolling 60% of
  // the intended distance already landed deep inside What We Build's
  // content). A short pin on Hero's own content for exactly this trigger's
  // duration is what actually reserves that scroll distance — content
  // pins, the route/crop-shift/parallax plays out across genuine scroll
  // input, then releases into What We Build at the trigger's end, same as
  // this codebase's other scroll-linked (if non-pinned) reveals but scoped
  // to Hero's own boundary only.
  const mmScroll = gsap.matchMedia()
  mmScroll.add(reducedMotionQuery.noPreference, () => {
    if (!sectionEl.value) return

    const trigger = ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top top',
      end: '+=140%',
      scrub: 0.6,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        // Primary: allowed crop shift / reframe, restrained. Secondary B:
        // its own, different parallax rate (never idle-looped).
        if (primaryRef.value) gsap.set(primaryRef.value, { yPercent: self.progress * -6 })
        if (secondaryBRef.value) gsap.set(secondaryBRef.value, { yPercent: self.progress * -14 })
        if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 1 - self.progress * 0.4, transformOrigin: 'top' })
      }
    })

    return () => trigger.kill()
  })
})
</script>

<template>
  <BaseSection
    ref="sectionComponentRef"
    as="section"
    class="relative flex min-h-[100svh] items-center overflow-hidden bg-slateNavy pb-20 pt-32 md:pt-36"
  >
    <!-- Environment: Slate Navy with tonal depth via a very restrained
         radial lift behind the headline column — not a gradient blob, not
         a glow effect; a single low-opacity tonal shift so the surface
         doesn't read as flat. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_35%,rgba(37,99,235,0.08),transparent_65%)]"
    />

    <BaseContainer class="relative z-10">
      <!-- 12-column macro grid, ~55/45 asymmetric split: headline column
           spans 7, Living Proof System spans 5 and is allowed to bleed
           slightly left of its column start (see proof-system's own
           negative margin) toward the center per spec. -->
      <div class="grid grid-cols-1 gap-y-16 md:grid-cols-12 md:items-center md:gap-x-8">
        <!-- LEFT: headline / composition anchor -->
        <div class="md:col-span-7">
          <h1
            ref="headingRef"
            class="max-w-[14ch] text-left font-display text-token-display-xl font-bold text-pureWhite"
          >
            {{ headline }}
          </h1>

          <!-- text-[color:...] arbitrary value, not `text-pureWhite/64`: the
               opacity-modifier utility for this exact fraction did not
               reliably compile via the JIT scanner in dev (verified via
               Playwright: /45 and /80 elsewhere in this file compiled fine,
               /64 silently did not) — using the literal
               06-design-tokens.json color.text.mutedOnDark value directly
               sidesteps that scanning gap entirely. -->
          <p ref="subtextRef" class="mt-6 max-w-md text-left text-token-body text-[color:rgba(255,255,255,0.64)]">
            {{ subtext }}
          </p>

          <div ref="ctaRowRef" class="mt-8 flex flex-wrap items-center gap-6">
            <div ref="ctaPrimaryRef" class="inline-block">
              <!-- Cobalt CTA, not the shared `.btn-accent`/`.btn-primary`
                   classes — both bake in a Yellow fill/hover that conflicts
                   with this section's Cobalt-led Signal language and the
                   Yellow-off-by-default posture (03-design-system.md §9).
                   Those shared classes remain correct for their existing
                   light-page call sites; not touched here. -->
              <a
                :href="ctaPrimary.to"
                class="inline-flex items-center justify-center gap-2 rounded-button bg-cobalt px-7 py-3.5 font-display text-sm font-semibold text-pureWhite transition-colors duration-150 hover:bg-cyan hover:text-slateNavy"
                @click.prevent="goToSelectedWork"
              >
                {{ ctaPrimary.label }}
              </a>
            </div>
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-2 text-token-metadata font-semibold uppercase tracking-[0.06em] text-[color:rgba(255,255,255,0.64)] transition-colors duration-150 hover:text-pureWhite"
            >
              {{ ctaSecondary.label }}
              <span aria-hidden="true" class="transition-transform duration-150 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        <!-- RIGHT: Living Proof System — not container-bound, fragments
             align to grid key lines while overlapping/occluding each
             other. Exactly 4 fragments: Primary, Secondary A, Secondary B,
             Micro Utility — must not read as 4 equal cards.

             Mobile recomposition (spec: "Recompose, not scale"): Secondary
             B is hidden below `md` rather than shrunk into an unreadable
             sliver — a squeezed 58%-width fragment inside a narrow mobile
             column would just be the desktop layout scaled down. Primary +
             Secondary A + Micro Utility + Signal are preserved, which is
             the essential-fragment subset the spec calls for ("preserve
             Primary proof, essential Secondary proof, Micro Utility,
             Signal logic"). Height drops from a fixed 520px to a shorter,
             content-driven mobile block. -->
        <div class="relative h-[320px] sm:h-[380px] md:col-span-5 md:col-start-8 md:-ml-6 md:h-[520px]">
          <!-- The Signal — execution route: descends from the headline
               anchor, through Primary, to the Micro Utility, toward the
               section boundary. A short bounded line + point, not a
               network connecting all fragments. -->
          <div
            ref="signalRouteRef"
            aria-hidden="true"
            class="absolute -left-3 top-0 h-full w-px origin-top bg-[color:rgba(37,99,235,0.4)] md:-left-5"
          />
          <span
            ref="signalDotRef"
            aria-hidden="true"
            class="absolute -left-[15px] top-[58%] h-2 w-2 rounded-full bg-cobalt shadow-[0_0_0_4px_rgba(37,99,235,0.18)] md:-left-[23px]"
          />

          <!-- Secondary B: farther crop, aligned to a different grid line
               (bottom-right), lowest z, most aggressive crop. Depth from
               crop + tonal contrast, never blur. Hidden on mobile — see
               recomposition note above. -->
          <div
            ref="secondaryBRef"
            class="absolute bottom-0 right-0 z-10 hidden h-[46%] w-[58%] overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.1)] bg-slateNavy md:block"
            style="background: linear-gradient(155deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))"
          >
            <div class="flex h-full flex-col justify-between p-4">
              <div class="h-1.5 w-10 rounded-full bg-[color:rgba(255,255,255,0.15)]" />
              <div class="space-y-2">
                <div class="h-1.5 w-full rounded-full bg-[color:rgba(255,255,255,0.1)]" />
                <div class="h-1.5 w-2/3 rounded-full bg-[color:rgba(255,255,255,0.1)]" />
              </div>
            </div>
          </div>

          <!-- Primary: largest, most stable, frontmost. Aligned to the
               top-left key line of this column. -->
          <div
            ref="primaryRef"
            class="absolute left-0 top-0 z-20 h-[68%] w-[86%] overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.12)] bg-slateNavy shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] md:h-[62%] md:w-[78%]"
            style="background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))"
          >
            <div class="flex h-full flex-col justify-between p-6">
              <div class="flex items-center justify-between">
                <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.45)]">Execution</span>
                <span class="h-1.5 w-1.5 rounded-full bg-cobalt" aria-hidden="true" />
              </div>
              <div class="space-y-3">
                <div class="h-2 w-full rounded-full bg-[color:rgba(255,255,255,0.12)]" />
                <div class="h-2 w-4/5 rounded-full bg-[color:rgba(255,255,255,0.12)]" />
                <div class="h-2 w-1/2 rounded-full bg-[color:rgba(37,99,235,0.4)]" />
              </div>
            </div>
          </div>

          <!-- Secondary A: shares Primary's top edge, ~65% of its scale,
               partially occluded by Primary. Kept on mobile (essential
               Secondary proof) but narrower so it still reads as a
               distinct, occluded fragment rather than crowding Primary. -->
          <div
            ref="secondaryARef"
            class="absolute right-0 top-0 z-30 h-[30%] w-[36%] overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.1)] bg-slateNavy md:h-[34%] md:w-[42%]"
            style="background: linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))"
          >
            <div class="flex h-full flex-col justify-center gap-2 p-3 md:p-4">
              <div class="h-1.5 w-full rounded-full bg-[color:rgba(255,255,255,0.14)]" />
              <div class="h-1.5 w-3/5 rounded-full bg-[color:rgba(255,255,255,0.14)]" />
            </div>
          </div>

          <!-- Micro Utility: smallest, attached to Primary's edge like a
               metadata chip — a state indicator, not an image. -->
          <div
            ref="microUtilityRef"
            class="absolute -bottom-4 left-4 z-40 flex items-center gap-2 rounded-button border border-[color:rgba(37,99,235,0.3)] bg-slateNavy px-3 py-2 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.7)] md:left-10"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-cobalt" aria-hidden="true" />
            <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.8)]">{{ microStateLabel }}</span>
          </div>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
