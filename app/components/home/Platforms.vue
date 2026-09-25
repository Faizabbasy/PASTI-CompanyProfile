<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// MILESTONE 4D — Platforms, total rework per docs/rework-v2/04-homepage-spec.md
// §6 ("Two Product Worlds, Not Two Product Cards" / "OPEN: Expansive
// Precision. e-CORPORATE: Structured Precision."). Replaces the previous
// PlatformRow.vue vertical two-row layout (giant rounded-image cards,
// per-row parallax, no pin, no Signal, no world/spatial-transfer mechanic)
// entirely — none of that structure is the frozen design, discarded per the
// milestone guardrail. PlatformRow.vue is left on disk, now orphaned —
// flagged as a cleanup candidate, not deleted unilaterally (same discipline
// as Milestone 4B's ServiceCards retirement).

const label = 'Platforms'
const { platforms } = usePlatforms()
const open = platforms[0]!
const corporate = platforms[1]!

const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const openWorldRef = ref<HTMLElement | null>(null)
const corporateWorldRef = ref<HTMLElement | null>(null)
const signalRef = ref<HTMLElement | null>(null)

// Mobile-simplified subtree: OPEN -> e-CORPORATE via natural vertical
// scroll, no pin, no horizontal transfer (spec "Responsive: Mobile
// (locked)"). Same architecture precedent as Milestone 4B/4C's
// desktop/mobile separate-subtree split — gated via matchMedia so no pin
// ScrollTrigger is even constructed below md.
const mobileSectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

useGsapContext(() => {
  const mm = gsap.matchMedia()

  // --- Reduced motion (Milestone 5B final closure): the pinned desktop
  // stage's OPEN/e-CORPORATE worlds are both `absolute inset-0` (they
  // exist to be horizontally transferred, not stacked in flow) — the
  // pre-5B code here set e-CORPORATE to `autoAlpha:0` believing it
  // "remains reachable via normal document flow below it," but that was
  // wrong: both worlds occupy the exact same absolutely-positioned box
  // inside this stage, so hiding e-CORPORATE made it genuinely
  // unreachable at desktop widths under reduced motion, not just visually
  // deferred. Fixed at the CSS layer instead (main.css's
  // `[data-reduced-motion] [data-motion-stage]` rules): the entire pinned
  // stage (`data-motion-stage="pinned"`) is force-hidden and the existing
  // Tablet+Mobile subtree (`data-motion-stage="simple"`, OPEN -> e-
  // CORPORATE in normal vertical document flow) is force-shown at EVERY
  // viewport width when reduced motion is active — both worlds are
  // reachable there with zero pin/parallax dependency, so nothing needs
  // to be set on this stage's own elements at all. ---
  mm.add(reducedMotionQuery.reduce, () => {
    // Intentionally empty: the CSS-level stage swap above is sufficient.
    // Kept as an explicit branch (not omitted) so this remains the
    // documented, discoverable place a future reduced-motion adjustment to
    // this section would go, matching every other section's pattern.
  })

  // --- Desktop only: pinned horizontal Spatial World Transfer (Milestone
  // 5A final closure: Desktop = 1024px, not the legacy 768px `md`
  // boundary — see breakpointQuery.desktopUp. Tablet gets the same
  // reduced-complexity vertical stack as Mobile below, per spec: "Tablet
  // may also resolve vertically if this best satisfies Reduced
  // Complexity" — it does here, since building a scaled-down horizontal
  // pin for Tablet would still be a full pin mechanism, not reduced
  // complexity.) ---
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    if (!isDesktop) return

    const stage = stageRef.value
    const openWorld = openWorldRef.value
    const corpWorld = corporateWorldRef.value
    const signal = signalRef.value
    if (!stage || !openWorld || !corpWorld) return

    const openFragments = Array.from(openWorld.querySelectorAll<HTMLElement>('[data-fragment]'))
    const corpFragments = Array.from(corpWorld.querySelectorAll<HTMLElement>('[data-fragment]'))
    const openTitle = openWorld.querySelector<HTMLElement>('[data-world-title]')
    const corpTitle = corpWorld.querySelector<HTMLElement>('[data-world-title]')
    const signalPoint = signal?.querySelector<HTMLElement>('[data-signal-point]') ?? null
    const signalNumeral = signal?.querySelector<HTMLElement>('[data-signal-numeral]') ?? null

    // --- Initial state: OPEN active at x:0, e-CORPORATE staged fully off-right ---
    gsap.set(corpWorld, { xPercent: 100 })
    gsap.set(openWorld, { xPercent: 0 })
    gsap.set(openTitle, { xPercent: 0 })
    gsap.set(corpTitle, { xPercent: 8 })
    // Restrained parallax layers (4-8px range per spec) tied to horizontal
    // transfer progress, not idle — set up as a fixed depth offset here,
    // driven from onUpdate below.
    gsap.set(openFragments, { x: 0 })
    gsap.set(corpFragments, { x: 0 })
    if (signalPoint) gsap.set(signalPoint, { xPercent: 0 })

    // Dwell distribution across the pin's total scroll distance (spec
    // "conceptual, not rigid": OPEN ~35% / transfer ~25-30% / e-CORPORATE
    // ~35-40%). Transfer overlap begins before OPEN's own dwell ends
    // (e-CORPORATE enters while OPEN is still ~70-80% visible) rather than
    // as a hard-cut boundary between two blocks.
    const OPEN_DWELL_END = 0.38
    const TRANSFER_END = 0.66
    // (remaining 0.66-1.0 is e-CORPORATE establish/final dwell)

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      // Baseline ~2.8-3.5 viewport, hard max ~4. `end: '+=280%'` on a
      // pinned 100svh stage gives 900px + 900px*2.8 = 3.7 viewport lengths
      // at a 900px viewport — inside baseline, well under the 4-viewport
      // guardrail. (Milestone 4B/4C lesson: verify via Playwright
      // pin-spacer measurement, not the percentage math alone — py-0 is
      // applied to the pinned stage from the start here for that reason.)
      end: '+=280%',
      scrub: 0.7,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress

        // --- Horizontal spatial transfer (dominant, priority 1) ---
        // OPEN moves left as e-CORPORATE arrives from the right, overlapping
        // significantly rather than a hard swap. transferProgress is 0
        // until OPEN's own dwell ends, ramps 0->1 across the transfer
        // window, then holds 1 through e-CORPORATE's final dwell.
        const transferProgress = gsap.utils.clamp(
          0,
          1,
          (p - OPEN_DWELL_END) / (TRANSFER_END - OPEN_DWELL_END)
        )
        gsap.set(openWorld, { xPercent: -30 * transferProgress })
        gsap.set(corpWorld, { xPercent: 100 - 100 * transferProgress })

        // --- Crop/reframe (strong secondary, priority 2): outgoing world
        // tightens its crop as it exits, incoming world resolves toward
        // full crop as it arrives — scale as the reframe proxy. ---
        gsap.set(openWorld, { scale: 1 - 0.04 * transferProgress })
        gsap.set(corpWorld, { scale: 0.96 + 0.04 * transferProgress })

        // --- Restrained parallax (supporting only, priority 4): 4-8px
        // range across fragment layers, tied to transfer progress. ---
        openFragments.forEach((el, i) => {
          const depth = i === 0 ? 4 : 8
          gsap.set(el, { x: -depth * transferProgress })
        })
        corpFragments.forEach((el, i) => {
          const depth = i === 0 ? 4 : 6
          gsap.set(el, { x: depth * (1 - transferProgress) })
        })

        // --- Mask-based title exit/entry (not opacity-only) ---
        gsap.set(openTitle, { xPercent: -12 * transferProgress, autoAlpha: 1 - transferProgress })
        gsap.set(corpTitle, { xPercent: 8 * (1 - transferProgress), autoAlpha: transferProgress })

        // --- Signal: horizontal state-transfer system (functional marker,
        // priority 3). Static at each state anchor, moves only during the
        // active transfer window. ---
        if (signalPoint) gsap.set(signalPoint, { xPercent: 100 * transferProgress })
        if (signalNumeral) signalNumeral.textContent = transferProgress < 0.5 ? '01 / 02' : '02 / 02'
        signal?.classList.toggle('text-cyan', transferProgress > 0.05 && transferProgress < 0.95)
        signal?.classList.toggle('text-cobalt', transferProgress <= 0.05 || transferProgress >= 0.95)
      }
    })

    return () => trigger.kill()
  })

  // --- Tablet (Reduced Complexity) + Mobile (Recomposed): OPEN ->
  // e-CORPORATE vertical stack, no pin, no horizontal transfer. Milestone
  // 5A final closure extends this to Tablet — resolves vertically per
  // spec, preserving OPEN -> e-CORPORATE hierarchy without inventing a
  // scaled-down horizontal pin as a "tablet-only spectacle." ---
  mm.add({ isBelowDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}` }, (context) => {
    const { isBelowDesktop } = context.conditions as { isBelowDesktop: boolean }
    const section = mobileSectionComponentRef.value?.$el ?? null
    if (!isBelowDesktop || !section) return

    const worlds = Array.from(section.querySelectorAll<HTMLElement>('[data-mobile-world]'))
    gsap.set(worlds, { opacity: 0, y: 24 })

    const triggers = worlds.map((world) =>
      gsap.timeline({ scrollTrigger: { trigger: world, start: 'top 85%', toggleActions: 'restart none restart reverse' } }).to(world, {
        opacity: 1,
        y: 0,
        duration: motionDuration.editorial,
        ease: approvedEase.gsapStandard
      })
    )

    return () => triggers.forEach((tl) => tl.scrollTrigger?.kill())
  })
})
</script>

<template>
  <!-- Platforms -> Insight handoff: dark product immersion gives way to a
       light editorial reset (spec §6/§7). No wrapper id needed here (unlike
       Selected Work) — nothing currently jumps to Platforms directly. -->

  <!-- Desktop-only stage (>= 1024px). -->
  <BaseSection
    ref="sectionComponentRef"
    as="section"
    data-motion-stage="pinned"
    class="relative hidden overflow-hidden bg-navy-950 py-0 desktop:block"
  >
    <div ref="stageRef" class="relative h-[100svh] overflow-hidden">
      <!-- Persistent "Platforms" label: understated, metadata-scale, static
           on a stable grid line, does not travel with the horizontal world
           motion (spec: "orientation, not visual emphasis"). -->
      <BaseContainer class="pointer-events-none absolute inset-x-0 top-10 z-30">
        <p class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.4)]">
          {{ label }}
        </p>
      </BaseContainer>

      <!-- Signal: horizontal state-transfer system. Short structural route,
           two state anchors, one active point, optional 01/02 numeral.
           Fixed placement, does not move with the worlds. -->
      <div
        ref="signalRef"
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex flex-col items-center gap-2 text-cobalt"
      >
        <div class="relative h-px w-16 bg-[color:rgba(255,255,255,0.15)]">
          <span data-signal-point class="absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full bg-current" />
        </div>
        <span data-signal-numeral class="font-display text-token-metadata font-semibold tracking-[0.1em] text-current">01 / 02</span>
      </div>

      <!-- OPEN world: Expansive Precision. 1 Primary fragment + optional 1
           Secondary. Expansive, breathable, one dominant fragment, generous
           negative space, restrained-but-roomy Cobalt/Cyan usage. -->
      <div ref="openWorldRef" class="absolute inset-0 z-10">
        <BaseContainer class="relative flex h-full items-center">
          <div class="grid w-full grid-cols-12 items-center gap-8">
            <div class="col-span-12 lg:col-span-5">
              <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-cyan">{{ open.character }}</span>
              <h3 data-world-title class="mt-4 font-display text-[clamp(3.5rem,9vw,8rem)] font-bold leading-[0.92] tracking-[-0.03em] text-pureWhite">
                {{ open.name }}
              </h3>
              <p class="mt-6 max-w-sm text-token-body text-[color:rgba(255,255,255,0.64)]">
                {{ open.positioning }}
              </p>
              <NuxtLink :to="open.to" class="mt-8 inline-flex items-center gap-1.5 text-token-metadata font-semibold uppercase tracking-[0.06em] text-cobalt">
                Explore OPEN <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>

            <div class="relative col-span-12 lg:col-span-7">
              <!-- Primary fragment: large, aggressively cropped, edge-bled — never a complete framed screenshot. -->
              <div data-fragment class="relative ml-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.08)]">
                <img :src="open.image" :alt="open.name" loading="lazy" class="h-full w-full scale-[1.15] object-cover object-left-top">
              </div>
              <!-- Optional Secondary fragment: small, offset, partial. -->
              <div data-fragment class="absolute -bottom-6 -left-6 hidden aspect-[4/3] w-40 overflow-hidden rounded-lg border border-[color:rgba(255,255,255,0.1)] bg-navy-900 shadow-2xl xl:block">
                <img :src="open.image" :alt="`${open.name} detail`" loading="lazy" class="h-full w-full scale-[1.4] object-cover object-right-bottom opacity-90">
              </div>
            </div>
          </div>
        </BaseContainer>
      </div>

      <!-- e-CORPORATE world: Structured Precision. 1 Primary + max 2
           Secondary fragments. Tighter, grid-structured, higher density
           from spacing/alignment/layering, not screenshot count. -->
      <div ref="corporateWorldRef" class="absolute inset-0 z-20 bg-navy-950">
        <BaseContainer class="relative flex h-full items-center">
          <div class="grid w-full grid-cols-12 items-center gap-6">
            <div class="col-span-12 lg:col-span-4">
              <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-cyan">{{ corporate.character }}</span>
              <h3 data-world-title class="mt-4 font-display text-[clamp(2.75rem,7vw,6rem)] font-bold leading-[0.94] tracking-[-0.02em] text-pureWhite">
                {{ corporate.name }}
              </h3>
              <p class="mt-6 max-w-xs text-token-body text-[color:rgba(255,255,255,0.64)]">
                {{ corporate.positioning }}
              </p>
              <NuxtLink :to="corporate.to" class="mt-8 inline-flex items-center gap-1.5 text-token-metadata font-semibold uppercase tracking-[0.06em] text-cobalt">
                Explore e-CORPORATE <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>

            <div class="relative col-span-12 grid grid-cols-6 gap-3 lg:col-span-8">
              <!-- Primary fragment: medium scale, grid-tight, structural border.
                   Milestone 5A: this stage only ever renders at >= desktop
                   (1024px), so its old `md:col-span-4` (768px) threshold
                   always won and is collapsed to its unconditional value
                   here — no rendered change, just removing a now-unreachable
                   breakpoint. -->
              <div data-fragment class="relative col-span-4 aspect-[16/9] overflow-hidden rounded-lg border border-cobalt/20">
                <img :src="corporate.image" :alt="corporate.name" loading="lazy" class="h-full w-full scale-[1.1] object-cover object-left-top">
              </div>
              <!-- Secondary fragment A: tighter crop, edge-aligned. -->
              <div data-fragment class="relative col-span-2 aspect-square overflow-hidden rounded-lg border border-[color:rgba(255,255,255,0.1)]">
                <img :src="corporate.image" :alt="`${corporate.name} detail`" loading="lazy" class="h-full w-full scale-[1.6] object-cover object-right-top opacity-90">
              </div>
              <!-- Secondary fragment B: max 2 total, structural crop, precise
                   alignment. `lg:block` kept (both `lg` and `desktop` are
                   the same 1024px, exact match, zero risk either name). -->
              <div data-fragment class="relative col-span-2 hidden aspect-[3/2] overflow-hidden rounded-lg border border-[color:rgba(255,255,255,0.1)] lg:block">
                <img :src="corporate.image" :alt="`${corporate.name} structure`" loading="lazy" class="h-full w-full scale-[1.3] object-cover object-center opacity-85">
              </div>
            </div>
          </div>
        </BaseContainer>
      </div>
    </div>
  </BaseSection>

  <!-- Tablet + Mobile (below desktop): OPEN -> e-CORPORATE via natural
       vertical scroll, no pin, no swipe carousel, Signal simplified/static
       (spec locked). -->
  <BaseSection
    ref="mobileSectionComponentRef"
    as="section"
    data-motion-stage="simple"
    class="relative overflow-hidden bg-navy-950 desktop:hidden"
  >
    <BaseContainer>
      <p class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.4)]">
        {{ label }}
      </p>

      <div class="mt-8 flex flex-col gap-16">
        <article v-for="(platform, i) in platforms" :key="platform.index" data-mobile-world>
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
            <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-cyan">{{ platform.character }}</span>
          </div>
          <h3 class="mt-3 font-display text-[clamp(2.5rem,13vw,4rem)] font-bold leading-[0.94] tracking-[-0.02em] text-pureWhite">
            {{ platform.name }}
          </h3>
          <div class="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.08)]">
            <img :src="platform.image" :alt="platform.name" loading="lazy" class="h-full w-full object-cover">
          </div>
          <p class="mt-4 max-w-md text-token-body text-[color:rgba(255,255,255,0.64)]">
            {{ platform.positioning }}
          </p>
          <NuxtLink :to="platform.to" class="mt-5 inline-flex items-center gap-1.5 text-token-metadata font-semibold uppercase tracking-[0.06em] text-cobalt">
            Explore {{ platform.name }} <span aria-hidden="true">→</span>
          </NuxtLink>
          <span class="mt-4 block font-display text-token-metadata font-semibold tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">
            {{ platform.index }} / {{ String(platforms.length).padStart(2, '0') }}
          </span>
        </article>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
