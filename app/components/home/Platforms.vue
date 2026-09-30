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
// milestone guardrail. PlatformRow.vue was flagged as a cleanup candidate at
// the time and has since been removed (Milestone 6 legacy decommission),
// same discipline as Milestone 4B's ServiceCards retirement.

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

// The desktop pin, kept so the arrows can scroll to either world.
let pinTrigger: ScrollTrigger | undefined
function goToWorld(index: 0 | 1) {
  if (!pinTrigger) return
  const y = pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (index === 0 ? 0.12 : 0.86)
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

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

  // --- Desktop only: pinned vertical Spatial World Transfer (owner-directed: e-CORPORATE slides up over OPEN, no longer sideways) (Milestone
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
    gsap.set(corpWorld, { yPercent: 100 })
    gsap.set(openWorld, { yPercent: 0 })
    gsap.set(openTitle, { yPercent: 0 })
    gsap.set(corpTitle, { yPercent: 14 })
    // Restrained parallax layers (4-8px range per spec) tied to horizontal
    // transfer progress, not idle — set up as a fixed depth offset here,
    // driven from onUpdate below.
    gsap.set(openFragments, { x: 0 })
    gsap.set(corpFragments, { x: 0 })
    if (signalPoint) gsap.set(signalPoint, { x: 0 })

    // --- OPEN product set ---
    const openChars = Array.from(openWorld.querySelectorAll<HTMLElement>('[data-open-char]'))
    const openCopy = Array.from(openWorld.querySelectorAll<HTMLElement>('[data-open-copy]'))
    const openScreen = openWorld.querySelector<HTMLElement>('[data-open-screen]')
    const panelL = openWorld.querySelector<HTMLElement>('[data-open-panel="left"]')
    const panelR = openWorld.querySelector<HTMLElement>('[data-open-panel="right"]')
    const openOrbits = Array.from(openWorld.querySelectorAll<SVGGeometryElement>('[data-open-orbit]'))
    const openDot = openWorld.querySelector<SVGElement>('[data-open-dot]')
    const openLight = openWorld.querySelector<HTMLElement>('[data-open-light]')
    const openRings = Array.from(openWorld.querySelectorAll<SVGElement>('[data-open-ring]'))
    for (const o of openOrbits) o.setAttribute('pathLength', '1')

    const SCREEN_REST = { yPercent: -50, rotationY: -16, rotationX: 5, rotationZ: 1.5, x: 0, scale: 1, opacity: 1 }
    gsap.set([panelL, panelR], { yPercent: -50 })
    gsap.set(openScreen, SCREEN_REST)

    // ENTRANCE — plays once the stage comes into view (reverses if the
    // reader scrolls back up above it). Light rises, the orbit draws, the
    // screen swings in from depth and settles at its resting tilt, the two
    // panels slide out from behind it, the title rises letter by letter.
    const openIn = gsap.timeline({ paused: true, defaults: { ease: approvedEase.gsapCinematic } })
    openIn
      .fromTo(openLight, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0)
      .fromTo(openRings, { opacity: 0, scale: 0.82, transformOrigin: '1010px 468px' }, { opacity: 1, scale: 1, duration: 1.6, stagger: 0.07 }, 0)
      .fromTo(openOrbits, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15 }, 0.1)
      .fromTo(openScreen, { rotationY: -55, rotationX: 14, x: 220, scale: 0.86, opacity: 0 }, { ...SCREEN_REST, duration: 1.4 }, 0.15)
      .fromTo(panelL, { x: 160, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }, 0.55)
      .fromTo(panelR, { x: -160, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1 }, 0.6)
      .fromTo(openDot, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, ease: approvedEase.gsapPrimary }, 1.1)
      .fromTo(openChars, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: approvedEase.gsapPrimary }, 0.2)
      .fromTo(openCopy, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: approvedEase.gsapStandard }, 0.45)
    const openInTrigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top 60%',
      onEnter: () => openIn.play(),
      onLeaveBack: () => openIn.reverse()
    })
    let lastTp = 0

    // --- e-CORPORATE exploded stack ---
    const corpStack = corpWorld.querySelector<HTMLElement>('[data-corp-stack]')
    const corpTilt = corpWorld.querySelector<HTMLElement>('[data-corp-tilt]')
    const corpPlates = Array.from(corpWorld.querySelectorAll<HTMLElement>('[data-corp-plate]')) // bottom -> top
    const corpFloor = corpWorld.querySelector<HTMLElement>('[data-corp-floor]')
    const corpRails = Array.from(corpWorld.querySelectorAll<HTMLElement>('[data-corp-rail]'))
    const corpChars = Array.from(corpWorld.querySelectorAll<HTMLElement>('[data-corp-char]'))
    const corpOutcomes = Array.from(corpWorld.querySelectorAll<HTMLElement>('[data-corp-outcome]'))
    const STACK_REST = { rotationX: 56, rotationZ: -38 }
    const PLATE_GAP = 112 // px between plates once exploded
    gsap.set(corpStack, STACK_REST)
    gsap.set(corpPlates, { z: 0 })
    gsap.set(corpRails, { scaleY: 0 })
    const corpTitleIn = gsap.fromTo(corpChars, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.04, ease: approvedEase.gsapPrimary, paused: true })
    let corpTitleShown = false
    let corpActive = -2
    const setCorpActive = (i: number) => {
      if (i === corpActive) return
      corpActive = i
      corpOutcomes.forEach((el, k) => { el.dataset.active = String(k === i) })
      // outcome i lights plate i+? — People (2), Processes (1), Information (0)
      corpPlates.forEach((el, k) => { el.dataset.active = String(i >= 0 && k === 2 - i) })
    }

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
        gsap.set(openWorld, { yPercent: -30 * transferProgress })

        // EXIT of the OPEN set (scrubbed with the transfer): the screen
        // swings away and drops back, panels fold in behind it, orbit and
        // light go out. Only written once the transfer has begun, so it
        // never fights the entrance timeline.
        if (transferProgress > 0 || lastTp > 0) {
          const t = transferProgress
          gsap.set(openScreen, { rotationY: -16 - 34 * t, rotationX: 5 + 12 * t, x: -80 * t, scale: 1 - 0.18 * t, opacity: 1 - 0.85 * t })
          gsap.set(panelL, { x: 120 * t, opacity: 1 - t })
          gsap.set(panelR, { x: -120 * t, opacity: 1 - t })
          gsap.set([...openOrbits, ...openRings, openDot, openLight].filter(Boolean), { opacity: 1 - t })
        }
        lastTp = transferProgress
        gsap.set(corpWorld, { yPercent: 100 - 100 * transferProgress })

        // --- Crop/reframe (strong secondary, priority 2): outgoing world
        // tightens its crop as it exits, incoming world resolves toward
        // full crop as it arrives — scale as the reframe proxy. ---
        gsap.set(openWorld, { scale: 1 - 0.04 * transferProgress })
        gsap.set(corpWorld, { scale: 0.96 + 0.04 * transferProgress })

        // --- Restrained parallax (supporting only, priority 4): 4-8px
        // range across fragment layers, tied to transfer progress. ---
        openFragments.forEach((el, i) => {
          const depth = i === 0 ? 4 : 8
          gsap.set(el, { y: -depth * transferProgress })
        })
        // ENTRY of the e-CORPORATE set: fragments rise in sequence and
        // flatten from a forward tilt as they land (structured, grid-tight).
        corpFragments.forEach((el, i) => {
          const lp = gsap.utils.clamp(0, 1, (transferProgress - 0.15 - i * 0.12) / 0.6)
          const e = 1 - Math.pow(1 - lp, 3)
          gsap.set(el, { y: 90 * (1 - e), rotationX: 18 * (1 - e), transformPerspective: 1200, opacity: 0.2 + 0.8 * e })
        })

        // ENTRY of the e-CORPORATE stack: arrives flat, then the layers
        // lift apart (bottom stays, each layer above rises further); floor
        // and light rails come up with it. During the dwell after the
        // transfer the stack turns a few degrees and the three outcomes
        // light in turn, each with its layer.
        {
          const lift = 1 - Math.pow(1 - gsap.utils.clamp(0, 1, (transferProgress - 0.3) / 0.7), 3)
          corpPlates.forEach((el, i) => {
            const show = gsap.utils.clamp(0, 1, (transferProgress - 0.05 - i * 0.08) / 0.4)
            gsap.set(el, { z: i * PLATE_GAP * lift, opacity: 0.15 + 0.85 * show })
          })
          gsap.set(corpFloor, { opacity: transferProgress })
          corpRails.forEach((el, i) => gsap.set(el, { scaleY: gsap.utils.clamp(0, 1, (transferProgress - 0.2 - i * 0.05) / 0.6) }))
          const dwell = gsap.utils.clamp(0, 1, (p - TRANSFER_END) / (1 - TRANSFER_END))
          gsap.set(corpStack, { rotationZ: STACK_REST.rotationZ + 12 * dwell, rotationX: STACK_REST.rotationX - 4 * dwell })
          setCorpActive(transferProgress < 1 ? -1 : Math.min(2, Math.floor(dwell * 3.3)))
          if (transferProgress > 0.55 && !corpTitleShown) { corpTitleShown = true; corpTitleIn.play() }
          if (transferProgress < 0.25 && corpTitleShown) { corpTitleShown = false; corpTitleIn.reverse() }
        }

        // --- Mask-based title exit/entry (not opacity-only) ---
        gsap.set(openTitle, { yPercent: -18 * transferProgress, autoAlpha: 1 - transferProgress })
        gsap.set(corpTitle, { yPercent: 14 * (1 - transferProgress), autoAlpha: transferProgress })

        // --- Signal: horizontal state-transfer system (functional marker,
        // priority 3). Static at each state anchor, moves only during the
        // active transfer window. ---
        if (signalPoint) gsap.set(signalPoint, { x: 57 * transferProgress })
        if (signalNumeral) signalNumeral.textContent = transferProgress < 0.5 ? '01 / 02' : '02 / 02'
      }
    })

    // --- Post-settle Response layer (fine pointers only): the primary
    // fragment's inner layer drifts a few px against the pointer while the
    // pointer is over the stage, so the crop reads as a window onto the
    // product. It lives on [data-pan], an inner wrapper — the pinned
    // transfer above owns the fragment's own transform, so the two never
    // fight. Amplitude stays inside the 4-8px depth budget's spirit (a
    // bit more, since it is user-driven, not idle).
    pinTrigger = trigger
    const cleanups: Array<() => void> = [() => trigger.kill(), () => openInTrigger.kill(), () => openIn.kill(), () => corpTitleIn.kill(), () => { pinTrigger = undefined }]
    if (window.matchMedia('(pointer: fine)').matches) {
      const pans = Array.from(stage.querySelectorAll<HTMLElement>('[data-pan]'))
      const panX = pans.map((el) => gsap.quickTo(el, 'x', { duration: 0.8, ease: approvedEase.gsapStandard }))
      const panY = pans.map((el) => gsap.quickTo(el, 'y', { duration: 0.8, ease: approvedEase.gsapStandard }))
      const onMove = (event: PointerEvent) => {
        const nx = (event.clientX / window.innerWidth) * 2 - 1
        const ny = (event.clientY / window.innerHeight) * 2 - 1
        pans.forEach((_, i) => {
          panX[i]!(-nx * 14)
          panY[i]!(-ny * 9)
        })
      }
      stage.addEventListener('pointermove', onMove, { passive: true })
      cleanups.push(() => stage.removeEventListener('pointermove', onMove))

      if (corpTilt) {
        const tx = gsap.quickTo(corpTilt, 'rotationY', { duration: 1, ease: approvedEase.gsapStandard })
        const ty = gsap.quickTo(corpTilt, 'rotationX', { duration: 1, ease: approvedEase.gsapStandard })
        const onTilt = (event: PointerEvent) => {
          tx(((event.clientX / window.innerWidth) * 2 - 1) * 5)
          ty(-((event.clientY / window.innerHeight) * 2 - 1) * 4)
        }
        stage.addEventListener('pointermove', onTilt, { passive: true })
        cleanups.push(() => stage.removeEventListener('pointermove', onTilt))
      }
    }

    return () => cleanups.forEach((fn) => fn())
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
    data-header-theme="dark"
    class="relative hidden overflow-hidden bg-navy-950 py-0 desktop:block"
  >
    <div ref="stageRef" class="relative h-[100svh] overflow-hidden">
      <!-- Persistent "Platforms" label: understated, metadata-scale, static
           on a stable grid line, does not travel with the horizontal world
           motion (spec: "orientation, not visual emphasis"). -->
      <BaseContainer class="pointer-events-none absolute inset-x-0 top-10 z-30">
        <BaseSectionMark as="h2" surface="dark" :label="label" meta="07 / 10" />
      </BaseContainer>

      <!-- Signal: horizontal state-transfer system. Short structural route,
           two state anchors, one active point, optional 01/02 numeral.
           Fixed placement, does not move with the worlds. -->
      <!-- Controls + Signal: arrows step between the two worlds (they scroll
           the pin, nothing pages); the short route and numeral carry state. -->
      <BaseContainer class="absolute inset-x-0 bottom-10 z-30">
        <div class="ml-auto flex w-fit items-center gap-6">
          <div ref="signalRef" aria-hidden="true" class="flex items-center gap-3 text-pastiYellow-500">
            <div class="relative h-px w-16 bg-[color:rgba(255,255,255,0.18)]">
              <span data-signal-point class="absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full bg-current" />
            </div>
            <span data-signal-numeral class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.1em] text-pureWhite">01 / 02</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" aria-label="Show OPEN" class="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.25)] text-pureWhite transition-colors duration-150 ease-editorial hover:border-pastiYellow-500 hover:text-pastiYellow-500 focus-visible:border-pastiYellow-500 focus-visible:outline-none" @click="goToWorld(0)">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" aria-label="Show e-CORPORATE" class="flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.25)] text-pureWhite transition-colors duration-150 ease-editorial hover:border-pastiYellow-500 hover:text-pastiYellow-500 focus-visible:border-pastiYellow-500 focus-visible:outline-none" @click="goToWorld(1)">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </BaseContainer>

      <!-- OPEN world: Expansive Precision. 1 Primary fragment + optional 1
           Secondary. Expansive, breathable, one dominant fragment, generous
           negative space, restrained-but-roomy Cobalt/Cyan usage. -->
      <!-- OPEN sits on the lighter navy of the family (roomier), e-CORPORATE
           on the deeper one (denser) — same family, different spatial
           character (spec §6 Color). The pointer-following measuring layer
           lives only here: OPEN is the expansive world, so the field is the
           thing that "opens". -->
      <div ref="openWorldRef" class="absolute inset-0 z-10 overflow-hidden bg-[#022436]">
        <!-- Owner-directed "stage light": two directional pools of PASTI
             Yellow falling in from opposite corners, like light on a product
             set. Static, low opacity, fades in with the world and out with
             the transfer — lighting for the product, not a floating blob. -->
        <div
          data-open-light
          aria-hidden="true"
          class="pointer-events-none absolute inset-0"
          style="background: radial-gradient(ellipse 34% 30% at 100% 0%, rgba(251, 186, 0, 0.3), transparent 72%), radial-gradient(ellipse 26% 38% at 0% 100%, rgba(251, 186, 0, 0.2), transparent 72%), radial-gradient(ellipse 42% 48% at 70% 52%, rgba(37, 99, 235, 0.24), rgba(29, 78, 216, 0.08) 55%, transparent 78%), linear-gradient(155deg, #011826 0%, #022F47 45%, #022F47 100%)"
        />
        <!-- OPEN's own field (not the grid used elsewhere): concentric rings
             radiating from the product — "opening outward", Expansive
             Precision. Static once drawn; faded out toward the edges. -->
        <svg
          aria-hidden="true"
          class="open-rings pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <circle
            v-for="n in 9"
            :key="n"
            data-open-ring
            cx="1010"
            cy="468"
            :r="110 + n * 88"
            :stroke="n === 4 ? 'rgba(251,186,0,0.45)' : 'rgba(255,255,255,0.11)'"
            :stroke-dasharray="n === 4 ? '2 10' : n % 3 === 0 ? '1 6' : undefined"
            stroke-width="1"
          />
          <path d="M1010 20V916M110 468H1436" stroke="rgba(255,255,255,0.035)" stroke-width="1" />
        </svg>

        <BaseContainer class="relative flex h-full items-center">
          <div class="grid w-full grid-cols-12 items-center gap-8">
            <div class="col-span-5">
              <span data-open-copy class="block font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-pastiYellow-500">{{ open.character }}</span>
              <h3 data-world-title :aria-label="open.name" class="mt-4 font-display text-[clamp(3.5rem,8.4vw,8rem)] font-bold leading-[0.92] tracking-[-0.03em] text-pureWhite">
                <span v-for="(ch, i) in open.name.split('')" :key="i" aria-hidden="true" class="inline-block overflow-hidden align-top"><span data-open-char class="inline-block">{{ ch }}</span></span>
              </h3>
              <p data-open-copy class="mt-6 max-w-md text-token-body-large text-[color:rgba(255,255,255,0.78)]">
                {{ open.positioning }}
              </p>
              <div data-open-copy class="mt-8">
                <HomePlatformCta :platform="open" />
              </div>
            </div>

            <!-- Product set: the OPEN screen, tilted in space, flanked by two
                 statement panels (both lifted from OPEN's own positioning
                 copy), inside an orbit carrying the Yellow Signal point. -->
            <div class="relative col-span-7 h-[64svh]" style="perspective: 1600px">
              <svg aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 800 560" preserveAspectRatio="none" fill="none">
                <ellipse data-open-orbit cx="400" cy="270" rx="385" ry="232" transform="rotate(-6 400 270)" stroke="rgba(251,186,0,0.5)" stroke-width="1.25" />
                <ellipse data-open-orbit cx="400" cy="520" rx="330" ry="30" stroke="rgba(251,186,0,0.35)" stroke-width="1" />
                <circle data-open-dot cx="330" cy="46" r="7" fill="#FBBA00" />
              </svg>

              <div
                data-open-panel="left"
                class="absolute left-0 top-1/2 flex h-[50%] w-[30%] flex-col rounded-card border border-[color:rgba(255,255,255,0.1)] bg-[color:rgba(3,60,89,0.82)] p-5"
              >
                <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-[color:rgba(255,255,255,0.55)]">01</span>
                <p class="mt-auto max-w-[62%] font-display text-token-body font-medium leading-snug text-pureWhite">From planning to contract.</p>
                <span aria-hidden="true" class="mt-4 block h-[2px] w-8 bg-pastiYellow-500" />
              </div>
              <div
                data-open-panel="right"
                class="absolute right-0 top-1/2 flex h-[50%] w-[30%] flex-col items-end rounded-card border border-[color:rgba(251,186,0,0.35)] bg-[color:rgba(3,60,89,0.82)] p-5"
              >
                <span class="w-[62%] font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-[color:rgba(255,255,255,0.55)]">02</span>
                <p class="mt-auto w-[62%] font-display text-token-body font-medium leading-snug text-pureWhite">People, processes, vendors and approvals.</p>
                <span aria-hidden="true" class="mt-4 block w-[62%]"><span class="block h-[2px] w-8 bg-pastiYellow-500" /></span>
              </div>

              <div
                data-open-screen
                data-pan-host
                class="absolute left-[21%] right-[21%] top-1/2 aspect-[16/10] overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.14)] shadow-[0_60px_120px_-50px_rgba(0,0,0,0.9)]"
              >
                <div data-pan class="h-full w-full">
                  <img :src="open.image" :alt="open.name" loading="lazy" class="h-full w-full scale-[1.06] object-cover object-left-top">
                </div>
                <HomePlatformChip :name="open.name" class="absolute bottom-3 right-3" />
              </div>
            </div>
          </div>
        </BaseContainer>
      </div>

      <!-- e-CORPORATE world: Structured Precision, answered architecturally.
           Where OPEN opens outward (rings, a screen swung into space),
           e-CORPORATE is built upward: the product sits on top of an
           exploded stack of the three things it connects — people,
           processes, information (its own positioning copy) — drawn in
           isometric on a measured floor. Cool light (Cyan/Cobalt) instead
           of OPEN's Yellow, vertical light rails instead of rings. -->
      <div ref="corporateWorldRef" class="absolute inset-0 z-20 overflow-hidden bg-[#011826]">
        <div
          data-corp-light
          aria-hidden="true"
          class="pointer-events-none absolute inset-0"
          style="background: radial-gradient(ellipse 30% 36% at 0% 0%, rgba(6, 182, 212, 0.16), transparent 72%), radial-gradient(ellipse 44% 50% at 72% 60%, rgba(37, 99, 235, 0.22), transparent 74%), linear-gradient(200deg, #022F47 0%, #022436 55%, #011826 100%)"
        />
        <!-- Vertical light rails behind the stack (a skyline of light). -->
        <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-[48%] right-[4%]">
          <span
            v-for="(r, i) in [8, 22, 41, 63, 79, 94]"
            :key="i"
            data-corp-rail
            class="absolute bottom-0 w-px origin-bottom"
            :style="{ left: `${r}%`, height: `${[62, 84, 70, 96, 58, 76][i]}%`, background: `linear-gradient(to top, rgba(${i % 2 ? '6,182,212' : '37,99,235'},0.55), transparent)` }"
          />
        </div>

        <BaseContainer class="relative flex h-full items-center">
          <div class="grid w-full grid-cols-12 items-center gap-8">
            <div class="col-span-5">
              <span class="block font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-cyan">{{ corporate.character }}</span>
              <h3 data-world-title :aria-label="corporate.name" class="mt-4 whitespace-nowrap font-display text-[clamp(2.5rem,5.2vw,5.25rem)] font-bold leading-[0.92] tracking-[-0.03em] text-pureWhite">
                <span v-for="(ch, i) in corporate.name.split('')" :key="i" aria-hidden="true" class="inline-block overflow-hidden align-top"><span data-corp-char class="inline-block">{{ ch }}</span></span>
              </h3>
              <p class="mt-6 max-w-md text-token-body text-[color:rgba(255,255,255,0.72)]">
                {{ corporate.positioning }}
              </p>

              <!-- Three outcomes, lifted from the positioning line; they
                   light up in turn as the reader dwells on this world. -->
              <ol class="mt-8 max-w-md border-t border-[color:rgba(255,255,255,0.12)]">
                <li
                  v-for="(o, i) in ['Work smarter', 'Collaborate better', 'Operate with greater control']"
                  :key="o"
                  data-corp-outcome
                  class="corp-outcome relative flex items-center gap-4 border-b border-[color:rgba(255,255,255,0.08)] py-3"
                >
                  <span class="corp-outcome__bar absolute bottom-[-1px] left-0 h-px w-full origin-left bg-cyan" />
                  <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-cyan">0{{ i + 1 }}</span>
                  <span class="font-display text-token-body font-semibold">{{ o }}</span>
                </li>
              </ol>

              <div class="mt-8">
                <HomePlatformCta :platform="corporate" />
              </div>
            </div>

            <!-- The exploded stack. -->
            <div data-corp-tilt class="relative col-span-7 flex h-[72svh] items-center justify-center" style="perspective: 2000px">
              <div data-corp-stack class="relative aspect-[16/10] w-[min(29vw,430px)] translate-y-[14%]" style="transform-style: preserve-3d">
                <!-- Measured floor (square grid; reads as diamonds in isometric). -->
                <div data-corp-floor aria-hidden="true" class="corp-floor pointer-events-none absolute -inset-[55%]" />

                <!-- 03 Information: the data layer. -->
                <div data-corp-plate class="corp-plate absolute inset-0 rounded-card border border-[color:rgba(37,99,235,0.45)] bg-[color:rgba(8,15,34,0.92)]">
                  <div aria-hidden="true" class="corp-plate__blocks absolute inset-5" />
                  <span class="corp-plate__label">03 Information</span>
                </div>

                <!-- 02 Processes: lanes and hand-offs. -->
                <div data-corp-plate class="corp-plate absolute inset-0 rounded-card border border-[color:rgba(6,182,212,0.4)] bg-[color:rgba(10,22,48,0.78)]">
                  <svg aria-hidden="true" viewBox="0 0 400 250" class="absolute inset-0 h-full w-full" fill="none">
                    <g v-for="(y, l) in [62, 125, 188]" :key="l">
                      <path :d="`M40 ${y}H360`" stroke="rgba(255,255,255,0.14)" />
                      <rect v-for="(x, k) in [[70, 170, 280], [110, 230], [60, 150, 250, 330]][l]" :key="k" :x="x - 22" :y="y - 12" width="44" height="24" rx="4" stroke="rgba(6,182,212,0.75)" fill="rgba(6,182,212,0.08)" />
                    </g>
                    <path d="M92 74V113M232 137V176" stroke="rgba(6,182,212,0.75)" stroke-dasharray="3 4" />
                  </svg>
                  <span class="corp-plate__label">02 Processes</span>
                </div>

                <!-- 01 People: the network. -->
                <div data-corp-plate class="corp-plate absolute inset-0 rounded-card border border-[color:rgba(255,255,255,0.18)] bg-[color:rgba(15,27,58,0.72)]">
                  <svg aria-hidden="true" viewBox="0 0 400 250" class="absolute inset-0 h-full w-full" fill="none">
                    <path d="M80 70L190 120L310 64M190 120L130 196M190 120L280 190M310 64L340 150M80 70L60 160" stroke="rgba(255,255,255,0.25)" />
                    <circle v-for="(c, k) in [[80, 70], [190, 120], [310, 64], [130, 196], [280, 190], [340, 150], [60, 160]]" :key="k" :cx="c[0]" :cy="c[1]" :r="k === 1 ? 12 : 8" :fill="k === 1 ? '#2563EB' : '#033C59'" stroke="rgba(255,255,255,0.7)" />
                  </svg>
                  <span class="corp-plate__label">01 People</span>
                </div>

                <!-- The product, on top. -->
                <div data-corp-plate data-pan-host class="corp-plate absolute inset-0 overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.22)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                  <div data-pan class="h-full w-full">
                    <img :src="corporate.image" :alt="corporate.name" loading="lazy" class="h-full w-full scale-[1.06] object-cover object-left-top">
                  </div>
                  <HomePlatformChip :name="corporate.name" class="absolute bottom-3 left-3" />
                </div>
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
    data-header-theme="dark"
    class="relative overflow-hidden bg-navy-950 desktop:hidden"
  >
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark as="h2" surface="dark" :label="label" meta="07 / 10" />

      <div class="mt-12 flex flex-col gap-20">
        <article v-for="platform in platforms" :key="platform.index" data-mobile-world class="relative">
          <span
            aria-hidden="true"
            class="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[128px] font-bold leading-none tracking-[-0.06em] text-[color:rgba(255,255,255,0.05)]"
            >{{ platform.index }}</span
          >
          <div class="relative flex items-center gap-2">
            <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
            <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-cyan">{{ platform.character }}</span>
          </div>
          <h3 class="relative mt-3 font-display text-[clamp(2.5rem,13vw,4rem)] font-bold leading-[0.94] tracking-[-0.02em] text-pureWhite">
            {{ platform.name }}
          </h3>
          <div class="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.08)]">
            <img :src="platform.image" :alt="platform.name" loading="lazy" class="h-full w-full object-cover">
            <HomePlatformChip :name="platform.name" class="absolute bottom-3 left-3" />
          </div>
          <p class="relative mt-4 max-w-md text-token-body text-[color:rgba(255,255,255,0.64)]">
            {{ platform.positioning }}
          </p>
          <div class="relative mt-5">
            <HomePlatformCta :platform="platform" />
          </div>
        </article>
      </div>
    </BaseContainer>
  </BaseSection>
</template>

<style scoped>
/* e-CORPORATE floor: a square measuring grid, faded at the edges. Seen
   through the isometric stack it reads as a diamond plan. */
.corp-floor {
  transform: translateZ(-60px);
  background-image:
    linear-gradient(to right, rgba(6, 182, 212, 0.14) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(6, 182, 212, 0.14) 1px, transparent 1px);
  background-size: 40px 40px;
  -webkit-mask-image: radial-gradient(closest-side, #000 35%, transparent 100%);
  mask-image: radial-gradient(closest-side, #000 35%, transparent 100%);
}
.corp-plate {
  transform-style: preserve-3d;
  transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.corp-plate[data-active='true'] {
  border-color: rgba(6, 182, 212, 0.9);
  box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.35);
}
.corp-plate__label {
  position: absolute;
  left: 14px;
  bottom: 10px;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.corp-plate__blocks {
  background-image: radial-gradient(rgba(37, 99, 235, 0.55) 1.5px, transparent 1.6px);
  background-size: 16px 16px;
}
.corp-outcome {
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.corp-outcome__bar {
  transform: scaleX(0);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.corp-outcome[data-active='true'] {
  color: #fff;
}
.corp-outcome[data-active='true'] .corp-outcome__bar {
  transform: scaleX(1);
}

.open-rings {
  -webkit-mask-image: radial-gradient(ellipse 60% 70% at 70% 52%, #000 30%, transparent 85%);
  mask-image: radial-gradient(ellipse 60% 70% at 70% 52%, #000 30%, transparent 85%);
}
</style>
