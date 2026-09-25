<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// MILESTONE 4B — What We Build, total rework per
// docs/rework-v2/04-homepage-spec.md §2 ("Controlled Expansion" / "One
// Visual Anchor, Not One Superior Capability" / "Engineered Takeover, not
// Theatrical or Sci-Fi Effect" / "Typographic Clusters / Glyph Slices, Not
// Particles"). This replaces the previous light-themed, non-pinned
// EditorialIntro + prose block entirely — that composition had no curtain,
// no decode, no card system, and ran on the light Yellow-accented shared
// editorial treatment (EditorialIntro.vue — still on disk, no longer used
// on the homepage since WhyPasti.vue, its only remaining consumer, was
// removed in Milestone 6 legacy decommission).
// Discarded per the milestone's guardrail: frozen docs win over existing
// component structure.
//
// The previously separate `ServiceCards`/`ServiceRow` legacy section (5
// service rows, light theme, from the pre-rework-v2 Cuberto content-mapping
// doc's own "Section 04 — Service Cards") is retired as an independent
// section per user decision: the frozen spec has no standalone "Service
// Cards" section — What We Build's own 4 capability cards ARE that content
// now. 4 of the 5 real services become the card copy (Primary/Medium A/
// Medium B/Accent); "Cybersecurity & Compliance" is dropped per user
// decision as the least representative of PASTI's core capabilities
// relative to the other four. `ServiceCards.vue`/`ServiceRow.vue`/
// `ServicesReactiveField.vue` have since been removed (Milestone 6 legacy
// decommission) — `useServices()` below is the only surviving piece of
// that cluster, still actively consumed for this section's card content.

const { services } = useServices()
// [0]=Technology Development -> Primary, [1]=Enterprise Platforms -> Medium A,
// [2]=Mobile App Development -> Medium B, [3]=Creative Communication -> Accent.
// "Cybersecurity & Compliance" ([4]) dropped per user decision (2026-09-25).
const [primaryService, mediumAService, mediumBService, accentService] = services

// Decode charset: clean alphanumeric + limited technical punctuation only
// (04-homepage-spec.md §2 "Text Decode") — never {}/[]/<>/$/#/% or
// binary/code-like syntax, so this never reads as hacking/cyberpunk.
const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-:'

// Fixed pixel offsets for each card's fan-spread resting position, not
// percentages: each card's own width/height differ (Primary 320px / Medium
// 240px / Accent 170px), so a shared percentage produces wildly different
// real distances and the smaller cards end up stacked under Primary rather
// than genuinely fanned out (caught via Playwright — Medium A was reading
// as ~70% hidden behind Primary/Accent, violating "One Visual Anchor, Not
// One Superior Capability": every card must stay legible in its resting
// position, not just Primary). Shared between the full desktop timeline
// and the reduced-motion branch so both land cards in the same place —
// the reduced-motion branch previously left cards at their pre-fan (0,0)
// origin, stacking them directly under the still-visible headline.
const CARD_LAYOUT = [
  { key: 'primary', x: -260, y: -80, rotation: -2 },
  { key: 'mediumA', x: 260, y: -140, rotation: 1.5 },
  { key: 'mediumB', x: 220, y: 160, rotation: -1 },
  { key: 'accent', x: -230, y: 210, rotation: 2.5 }
] as const

// BaseSection renders via <component :is="as">, so a template `ref` on it
// resolves to the component instance, not its DOM element (pasti-gotchas
// memory #4). `.$el` is Vue's fallthrough accessor to that single root
// element — both section refs below (desktop stage + mobile section) need
// it since both wrap BaseSection.
const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

const curtainRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const decodeTextRef = ref<HTMLElement | null>(null)
const clusterLayerRef = ref<HTMLElement | null>(null)
const primaryCardRef = ref<HTMLElement | null>(null)
const mediumACardRef = ref<HTMLElement | null>(null)
const mediumBCardRef = ref<HTMLElement | null>(null)
const accentCardRef = ref<HTMLElement | null>(null)
const signalDotRef = ref<HTMLElement | null>(null)
const signalRouteRef = ref<HTMLElement | null>(null)

// Mobile-simplified refs — a separate, normal-flow DOM subtree (see
// template) rather than reusing the desktop absolute-positioned fan, since
// spec explicitly forbids "reproduce desktop choreography fully" on mobile
// and an absolute-fan layout doesn't recompose sensibly at narrow widths.
const mobileSectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

const { signalXFraction } = useHeroSignalHandoff()

// Align the standby Signal / curtain's own vertical seam to Hero's Signal
// exit x-position (Designed Continuity, Not Arbitrary Proximity) — falls
// back to the same md:col-start-8 key line Hero itself uses when the
// handoff value hasn't published yet (e.g. reduced motion skipped Hero's
// own measurement, or this section was reached via a direct anchor).
const signalLeftStyle = computed(() => {
  const fraction = signalXFraction.value
  if (fraction === null) return undefined
  return { left: `${fraction * 100}vw` }
})

const resolvedHeadline = primaryService?.title ?? 'Technology Development'

useGsapContext(() => {
  const mm = gsap.matchMedia()

  // --- Reduced motion: short transition, resolved text directly, cards in final hierarchy ---
  // Applies regardless of viewport width — reduced motion always gets the
  // simplified, static-premium treatment (03-design-system.md §11).
  mm.add(reducedMotionQuery.reduce, () => {
    const curtain = curtainRef.value
    const decodeText = decodeTextRef.value
    if (curtain) gsap.set(curtain, { yPercent: -100 })
    // Desktop stage only: the decode headline is a transitional element
    // that the full choreography fades out once cards emerge (step 4,
    // "break") — reduced motion skips the animated break but must still
    // end at the same final visual state, otherwise the full-size headline
    // sits directly behind/through the absolute-positioned cards (caught
    // via Playwright: "Technology Development" rendered overlapping every
    // card). Hidden instantly (opacity 0, no tween) rather than removed
    // from the DOM, since it's still the accessible heading text. The
    // mobile subtree's own `data-mobile-heading` is unaffected — mobile's
    // vertical stack has no overlap problem, so its heading stays visible
    // per "resolved typography directly" for mobile.
    if (decodeText) {
      decodeText.textContent = resolvedHeadline
      gsap.set(decodeText, { opacity: 0 })
    }
    gsap.set(clusterLayerRef.value, { opacity: 0 })
    const cardEls = {
      primary: primaryCardRef.value,
      mediumA: mediumACardRef.value,
      mediumB: mediumBCardRef.value,
      accent: accentCardRef.value
    }
    for (const layout of CARD_LAYOUT) {
      const el = cardEls[layout.key]
      if (el) gsap.set(el, { opacity: 1, x: layout.x, y: layout.y, rotation: layout.rotation, scale: 1 })
    }
    if (signalDotRef.value) gsap.set(signalDotRef.value, { opacity: 1 })
    if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 1 })
  })

  // --- Desktop only, full choreography (Milestone 5A final closure:
  // Desktop = 1024px, NOT the legacy 768px `md` boundary — 768px sits
  // inside the frozen Tablet tier, so gating "full experience" there would
  // silently give Tablet viewports the Desktop-Heavy pin/decode/break
  // sequence with zero tablet-specific tuning). Tablet AND Mobile both get
  // the separate reduced-complexity DOM subtree below (see template) —
  // gating the pinned mechanism itself behind this width query, not just
  // hiding the result with CSS, so no ScrollTrigger/pin is ever created
  // below `desktop` at all (spec: "no long pin" on Tablet or Mobile). ---
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    if (!isDesktop) return

    const stage = stageRef.value
    const curtain = curtainRef.value
    const decodeText = decodeTextRef.value
    if (!stage || !curtain || !decodeText) return

    const cards = [
      { el: primaryCardRef.value, ...CARD_LAYOUT[0] },
      { el: mediumACardRef.value, ...CARD_LAYOUT[1] },
      { el: mediumBCardRef.value, ...CARD_LAYOUT[2] },
      { el: accentCardRef.value, ...CARD_LAYOUT[3] }
    ].filter((c) => c.el) as { el: HTMLElement; x: number; y: number; rotation: number }[]

    // --- Initial states ---
    gsap.set(curtain, { yPercent: 0 })
    gsap.set(decodeText, { opacity: 0 })
    gsap.set(clusterLayerRef.value, { opacity: 0 })
    gsap.set(
      cards.map((c) => c.el),
      { opacity: 0, x: 0, y: 0, scale: 0.4, rotation: 0 }
    )
    if (signalDotRef.value) gsap.set(signalDotRef.value, { opacity: 0.5, scale: 1 })
    if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 0 })

    // --- One continuous pinned scroll-controlled mechanism ---
    // Curtain takeover and the pinned stage that follows are ONE timeline
    // on ONE ScrollTrigger — never a perceived snap from "curtain finishes"
    // into "section suddenly pins" (04-homepage-spec.md §2 "Pin
    // experience"). Scroll depth baseline ~3.5-4 viewport lengths
    // (guardrail ~4.5) — `end: '+=280%'` on a pinned 100svh trigger gives
    // 900px + 900px*2.8 = 3420px total = 3.8 viewport lengths at a 900px
    // viewport, comfortably inside the baseline (verified via Playwright
    // measurement of the actual pin-spacer height, not just the source
    // math — see the stage's own `py-0` note in the template for why the
    // two previously diverged).
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=280%',
        scrub: 0.7,
        pin: true,
        anticipatePin: 1
      },
      defaults: { ease: approvedEase.gsapStandard }
    })

    // 1) CURTAIN: vertical axis takeover, tonal continuity (Slate Navy on
    // Slate Navy — not a contrasting color snap), expo.out, ~800-1200ms
    // window of the overall scrub.
    tl.addLabel('curtain')
    tl.to(curtain, { yPercent: -100, duration: 1, ease: approvedEase.gsapCinematic }, 'curtain')
    if (signalRouteRef.value) tl.to(signalRouteRef.value, { scaleY: 1, duration: 0.6 }, 'curtain+=0.2')

    // 2) DECODE: scramble limited to the final string's own characters (no
    // extra noise) so the silhouette is legible from the start.
    tl.addLabel('decode', 'curtain+=0.9')
    const decodeProxy = { progress: 0 }
    tl.to(
      decodeProxy,
      {
        progress: 1,
        duration: 1,
        onUpdate: () => scrambleText(decodeText, resolvedHeadline, decodeProxy.progress),
        onStart: () => {
          gsap.set(decodeText, { opacity: 1 })
        }
      },
      'decode'
    )

    // 3) RESOLVE: micro-pause at resolved state, Signal pulses once.
    tl.addLabel('resolve', 'decode+=1.05')
    if (signalDotRef.value) {
      tl.to(signalDotRef.value, { opacity: 1, scale: 1.6, duration: 0.15 }, 'resolve')
      tl.to(signalDotRef.value, { scale: 1, duration: 0.15 }, 'resolve+=0.15')
    }

    // 4) TYPOGRAPHIC CLUSTER BREAK: baseline/word-group glyph slices travel
    // outward along grid-aware paths (not radial), decelerate sharply,
    // fade to low (not zero) opacity — architectural residue, not
    // particles/dust/explosion.
    tl.addLabel('break', 'resolve+=0.4')
    tl.to(decodeText, { opacity: 0, duration: 0.3 }, 'break')
    if (clusterLayerRef.value) {
      const clusters = Array.from(clusterLayerRef.value.children) as HTMLElement[]
      gsap.set(clusterLayerRef.value, { opacity: 1 })
      tl.to(
        clusters,
        {
          x: (i) => (i % 2 === 0 ? -1 : 1) * (60 + i * 14),
          y: (i) => (i % 3 === 0 ? -1 : 1) * (30 + i * 10),
          scale: 0.85,
          opacity: 0.06,
          duration: 0.5,
          ease: 'power4.out',
          stagger: 0.02
        },
        'break'
      )
    }

    // 5) CARD EMERGENCE: from the same compressed centroid the text broke
    // from. Order: Primary first (anchors), Medium A/B near-simultaneous
    // slight stagger, Accent last.
    tl.addLabel('cards', 'break+=0.25')
    for (const [i, card] of cards.entries()) {
      tl.to(
        card.el,
        { opacity: 1, scale: 1, x: card.x, y: card.y, rotation: card.rotation, duration: 0.6, ease: 'power4.out' },
        i === 0 ? 'cards' : `cards+=${0.08 + i * 0.06}`
      )
    }
    // Signal: single restrained highlight on Primary as it settles.
    if (signalDotRef.value) tl.to(signalDotRef.value, { opacity: 1, scale: 1.3, duration: 0.2 }, 'cards+=0.5')
    if (signalDotRef.value) tl.to(signalDotRef.value, { scale: 1, duration: 0.2 }, 'cards+=0.7')

    // 6) DECAY: fragments reduce to ambient presence (already at ~6%
    // opacity from step 4); majority decay further, a couple of thin
    // structural remnants briefly persist before releasing. Full residual
    // field does NOT carry into Selected Work — decays fully by the end.
    tl.addLabel('decay', 'cards+=0.9')
    if (clusterLayerRef.value) {
      const clusters = Array.from(clusterLayerRef.value.children) as HTMLElement[]
      const remnants = clusters.filter((_, i) => i % 4 === 0).slice(0, 2)
      const majority = clusters.filter((el) => !remnants.includes(el))
      tl.to(majority, { opacity: 0, duration: 0.4 }, 'decay')
      tl.to(remnants, { opacity: 0.05, duration: 0.4 }, 'decay')
      tl.to(remnants, { opacity: 0, duration: 0.3 }, 'decay+=0.5')
    }

    // 7) EXIT: Signal repositions toward the section's edge, becoming the
    // origin/trigger for Selected Work's entry (out of scope this
    // milestone — this only prepares the visual position/state).
    tl.addLabel('exit', 'decay+=0.5')
    if (signalRouteRef.value) tl.to(signalRouteRef.value, { scaleY: 0.3, transformOrigin: 'top', duration: 0.4 }, 'exit')
    if (signalDotRef.value) tl.to(signalDotRef.value, { y: 40, duration: 0.4 }, 'exit')
  })

  // --- Tablet (Reduced Complexity) + Mobile (Recomposed): short
  // Signal/mask, resolved typography directly, no decode, no typographic
  // break, cards shown in final hierarchy, no long pin (04-homepage-spec.md
  // §2 "Mobile"; Milestone 5A extends this same simplified composition to
  // Tablet — the simplest faithful reduced-complexity adaptation, not a
  // third invented design language). A plain scroll-triggered reveal on
  // the shared Tablet+Mobile DOM subtree — not a scaled-down copy of the
  // desktop pinned mechanism, for either tier. -->
  mm.add({ isBelowDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}` }, (context) => {
    const { isBelowDesktop } = context.conditions as { isBelowDesktop: boolean }
    const section = mobileSectionComponentRef.value?.$el ?? null
    if (!isBelowDesktop || !section) return

    const heading = section.querySelector<HTMLElement>('[data-mobile-heading]')
    const cardEls = Array.from(section.querySelectorAll<HTMLElement>('[data-mobile-card]'))
    const dot = section.querySelector<HTMLElement>('[data-mobile-signal-dot]')

    gsap.set([heading, ...cardEls].filter(Boolean), { opacity: 0, y: 16 })
    if (dot) gsap.set(dot, { opacity: 0.4, scale: 0.8 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'restart none restart reverse' }
    })
    if (dot) tl.to(dot, { opacity: 1, scale: 1, duration: 0.3, ease: approvedEase.gsapStandard })
    tl.to(heading, { opacity: 1, y: 0, duration: 0.5, ease: approvedEase.gsapStandard }, '<0.1')
    tl.to(cardEls, { opacity: 1, y: 0, duration: 0.4, ease: approvedEase.gsapStandard, stagger: 0.08 }, '<0.15')

    return () => tl.kill()
  })
})

/** Scrambles `target`'s text toward `final` as `progress` (0-1) increases.
 * Only positions still "unresolved" at the given progress get a random
 * DECODE_CHARS character; resolved positions show the final character —
 * this keeps the string's silhouette legible from the very first frame
 * (04-homepage-spec.md §2 "Text Decode"), unlike a full-string scramble. */
function scrambleText(target: HTMLElement, final: string, progress: number) {
  const resolvedCount = Math.floor(final.length * progress)
  let out = ''
  for (let i = 0; i < final.length; i++) {
    const char = final[i]
    if (char === ' ' || i < resolvedCount) {
      out += char
    } else {
      out += DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)]
    }
  }
  target.textContent = out
}
</script>

<template>
  <!-- Desktop-only stage (>= 1024px, Milestone 5A final closure — see
       breakpointQuery.desktopUp above). Hidden entirely below `desktop` —
       Tablet and Mobile both render the shared reduced-complexity subtree
       further down, not a CSS-hidden copy of this one (04-homepage-spec.md's
       "no long pin" / "do not reproduce desktop choreography" applies to
       the MECHANISM, not just the visual result, so no pinned ScrollTrigger
       is created below `desktop` at all — see the isBelowDesktop/isDesktop
       matchMedia split above). -->
  <BaseSection
    v-if="primaryService"
    ref="sectionComponentRef"
    as="section"
    class="relative hidden overflow-hidden bg-slateNavy py-0 desktop:block"
  >
    <!-- py-0 above cancels BaseSection's default `.section` vertical
         rhythm padding (py-section, ~144-200px each side at desktop
         widths) — that padding is meant for normal homepage section
         spacing and, left in place here, silently added ~280-400px on top
         of the pinned stage's own precisely-calculated scroll distance
         (caught via Playwright: measured total pin distance was 5.12
         viewport lengths against a ~3.8-viewport target, i.e. over the
         spec's 4.5 hard guardrail, entirely from this padding rather than
         the ScrollTrigger math itself). The stage below is a full-bleed
         h-[100svh] box that owns its own spacing. -->
    <div ref="stageRef" class="relative flex h-[100svh] items-center justify-center overflow-hidden">
      <!-- Curtain: 2 layers (this panel + the stage environment behind it),
           tonal continuity — Slate Navy on Slate Navy, not a contrasting
           color snap. Slides up on a single vertical axis. -->
      <div
        ref="curtainRef"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 z-30 bg-slateNavy"
      />

      <!-- Standby Signal, aligned to Hero's Signal exit x-position for
           designed continuity — same 12-column key line, not merely
           adjacent. -->
      <div
        ref="signalRouteRef"
        aria-hidden="true"
        class="absolute top-0 z-20 h-1/3 w-px origin-top bg-[color:rgba(37,99,235,0.4)]"
        :style="signalLeftStyle"
        :class="signalXFraction === null ? 'left-[64.5vw]' : undefined"
      />
      <span
        ref="signalDotRef"
        aria-hidden="true"
        class="absolute top-1/3 z-20 h-2 w-2 -translate-x-1/2 rounded-full bg-cobalt shadow-[0_0_0_4px_rgba(37,99,235,0.18)]"
        :style="signalLeftStyle"
        :class="signalXFraction === null ? 'left-[64.5vw]' : undefined"
      />

      <BaseContainer class="relative z-10">
        <!-- Pinned stage composition: text optically centered, large
             negative space around it, still grid-structured (12-column
             macro grid governs the overall section even though this
             moment is centered). -->
        <div class="relative mx-auto flex min-h-[40vh] max-w-4xl flex-col items-center justify-center text-center">
          <span class="mb-6 font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.45)]">What We Build</span>
          <h2
            ref="decodeTextRef"
            class="font-display text-token-section-monumental font-bold text-pureWhite"
            aria-live="off"
          >
            {{ resolvedHeadline }}
          </h2>

          <!-- Typographic cluster break layer: per-word/baseline glyph
               groups that travel outward from the resolved headline and
               decay — NOT a particle system. Each span is a short
               structural fragment (thin line/edge remnant), not a dot
               (dots belong to the Signal system only). -->
          <div
            ref="clusterLayerRef"
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-3 opacity-0"
          >
            <span
              v-for="n in 10"
              :key="n"
              class="h-px bg-[color:rgba(255,255,255,0.4)]"
              :style="{ width: `${28 + (n % 4) * 14}px` }"
            />
          </div>
        </div>

        <!-- Capability cards: exactly 4, emerging from the resolved
             headline's compressed centroid into a controlled fan. Flat
             dark surfaces, thin structural borders — no glass, no drop
             shadow, no oversized radius. Hierarchy is visual only (Primary
             largest/frontmost, Medium A/B ~65-75% of Primary on different
             grid lines, Accent smallest but frontmost layer). -->
        <div class="pointer-events-none absolute inset-0 z-40">
          <div class="relative mx-auto h-full max-w-5xl">
            <article
              ref="primaryCardRef"
              class="pointer-events-auto absolute left-1/2 top-1/2 z-20 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-card border border-[color:rgba(255,255,255,0.12)] bg-slateNavy p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]"
            >
              <div class="flex items-center justify-between">
                <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.45)]">{{ primaryService?.index }}</span>
                <span class="h-1.5 w-1.5 rounded-full bg-cobalt" aria-hidden="true" />
              </div>
              <h3 class="mt-4 text-token-body-large font-semibold text-pureWhite">{{ primaryService?.title }}</h3>
              <p class="mt-2 text-token-body text-[color:rgba(255,255,255,0.64)]">{{ primaryService?.body }}</p>
              <span class="mt-4 inline-flex items-center gap-1.5 text-token-metadata font-semibold uppercase tracking-[0.06em] text-cobalt">
                {{ primaryService?.cta }} <span aria-hidden="true">→</span>
              </span>
            </article>

            <article
              ref="mediumACardRef"
              class="pointer-events-auto absolute left-1/2 top-1/2 z-10 w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-card border border-[color:rgba(255,255,255,0.1)] bg-slateNavy p-5"
            >
              <div class="flex items-center justify-between">
                <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">{{ mediumAService?.index }}</span>
              </div>
              <h3 class="mt-3 text-token-body font-semibold text-pureWhite">{{ mediumAService?.title }}</h3>
              <p class="mt-2 text-[color:rgba(255,255,255,0.6)]" style="font-size: 0.8125rem; line-height: 1.5">{{ mediumAService?.body }}</p>
            </article>

            <article
              ref="mediumBCardRef"
              class="pointer-events-auto absolute left-1/2 top-1/2 z-10 w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-card border border-[color:rgba(255,255,255,0.1)] bg-slateNavy p-5"
            >
              <div class="flex items-center justify-between">
                <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">{{ mediumBService?.index }}</span>
              </div>
              <h3 class="mt-3 text-token-body font-semibold text-pureWhite">{{ mediumBService?.title }}</h3>
              <p class="mt-2 text-[color:rgba(255,255,255,0.6)]" style="font-size: 0.8125rem; line-height: 1.5">{{ mediumBService?.body }}</p>
            </article>

            <article
              ref="accentCardRef"
              class="pointer-events-auto absolute left-1/2 top-1/2 z-30 w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-card border border-[color:rgba(37,99,235,0.35)] bg-slateNavy p-4"
            >
              <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">{{ accentService?.index }}</span>
              <h3 class="mt-2 text-token-metadata font-semibold text-pureWhite" style="font-size: 0.8125rem">{{ accentService?.title }}</h3>
            </article>
          </div>
        </div>
      </BaseContainer>
    </div>
  </BaseSection>

  <!-- Mobile (below md): recomposed, not scaled. Short Signal/mask reveal
       → resolved typography directly (no decode) → capability cards shown
       immediately in final hierarchy (no typographic break) → no pin, a
       normal vertical stack instead. Separate DOM from the desktop stage
       above, not a CSS-hidden copy of it. -->
  <BaseSection
    v-if="primaryService"
    ref="mobileSectionComponentRef"
    as="section"
    class="relative overflow-hidden bg-slateNavy desktop:hidden"
  >
    <BaseContainer>
      <div class="flex items-center gap-2">
        <span data-mobile-signal-dot aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
        <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.45)]">What We Build</span>
      </div>
      <h2
        data-mobile-heading
        class="mt-4 font-display text-token-h2 font-bold text-pureWhite"
      >
        {{ resolvedHeadline }}
      </h2>

      <div class="mt-10 flex flex-col gap-4">
        <article data-mobile-card class="rounded-card border border-[color:rgba(255,255,255,0.12)] bg-slateNavy p-5">
          <div class="flex items-center justify-between">
            <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.45)]">{{ primaryService?.index }}</span>
            <span class="h-1.5 w-1.5 rounded-full bg-cobalt" aria-hidden="true" />
          </div>
          <h3 class="mt-3 text-token-body-large font-semibold text-pureWhite">{{ primaryService?.title }}</h3>
          <p class="mt-2 text-token-body text-[color:rgba(255,255,255,0.64)]">{{ primaryService?.body }}</p>
          <span class="mt-3 inline-flex items-center gap-1.5 text-token-metadata font-semibold uppercase tracking-[0.06em] text-cobalt">
            {{ primaryService?.cta }} <span aria-hidden="true">→</span>
          </span>
        </article>

        <article data-mobile-card class="rounded-card border border-[color:rgba(255,255,255,0.1)] bg-slateNavy p-5">
          <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">{{ mediumAService?.index }}</span>
          <h3 class="mt-3 text-token-body font-semibold text-pureWhite">{{ mediumAService?.title }}</h3>
          <p class="mt-2 text-[color:rgba(255,255,255,0.6)]" style="font-size: 0.8125rem; line-height: 1.5">{{ mediumAService?.body }}</p>
        </article>

        <article data-mobile-card class="rounded-card border border-[color:rgba(255,255,255,0.1)] bg-slateNavy p-5">
          <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">{{ mediumBService?.index }}</span>
          <h3 class="mt-3 text-token-body font-semibold text-pureWhite">{{ mediumBService?.title }}</h3>
          <p class="mt-2 text-[color:rgba(255,255,255,0.6)]" style="font-size: 0.8125rem; line-height: 1.5">{{ mediumBService?.body }}</p>
        </article>

        <article data-mobile-card class="rounded-card border border-[color:rgba(37,99,235,0.35)] bg-slateNavy p-4">
          <span class="text-token-metadata font-semibold uppercase tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">{{ accentService?.index }}</span>
          <h3 class="mt-2 text-token-metadata font-semibold text-pureWhite" style="font-size: 0.8125rem">{{ accentService?.title }}</h3>
        </article>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
