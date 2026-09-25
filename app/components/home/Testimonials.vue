<script setup lang="ts">
import gsap from 'gsap'

// Social Proof with Controlled Human Energy (04-homepage-spec.md §5).
// "What clients say" label sourced from the existing testimonial content
// (no field in the Cuberto content-mapping doc — testimonials are
// client-supplied, not doc-sourced).
const label = 'What clients say'

const { testimonials } = useTestimonials()
const featured = testimonials.filter((t) => t.tier === 'featured')
const medium = testimonials.filter((t) => t.tier === 'medium')
const compact = testimonials.filter((t) => t.tier === 'compact')

// Structured 2-band zig-zag field on a 12-column grid — precise
// misalignment, not masonry. Band 1: Featured (wide anchor, not a
// mega-card) + Medium-1, offset by one small, restrained step (not a large
// masonry-style gap). Band 2: Medium-2 + Medium-3 + the 2 Compact cards,
// each carrying the same small offset step so the whole field reads as one
// engineered rhythm rather than loosely scattered rows. Built as one
// ordered array (rather than 6 hand-written template blocks) so `v-for`
// can collect each card's exposed `cardRef` via a single array ref —
// `ref="cardComponents"` on repeated *manually written* tags (not `v-for`)
// does not auto-collect into an array in Vue 3, it overwrites to a single
// object each time; `v-for` is required for the array-ref behavior.
//
// `offsetPx` is the SAME visual offset previously expressed as a static
// `md:mt-*` class, but expressed as a number so the exit choreography (see
// useGsapContext below) can animate it back to 0 — a plain CSS margin
// class can't be scrubbed by GSAP, which is exactly what the locked exit
// sequence's "offsets resolve toward a shared baseline" step requires. The
// offset is applied via GSAP `y` at mount (desktop only), not via the
// column classes, so it participates in the same transform GSAP owns for
// the exit tween.
const fieldItems = [
  { testimonial: featured[0]!, columnClass: 'desktop:col-span-7', offsetPx: 0 },
  { testimonial: medium[0]!, columnClass: 'desktop:col-span-5', offsetPx: 24 },
  { testimonial: medium[1]!, columnClass: 'desktop:col-span-4', offsetPx: 32 },
  { testimonial: medium[2]!, columnClass: 'desktop:col-span-4 desktop:col-start-5', offsetPx: 8 },
  { testimonial: compact[0]!, columnClass: 'desktop:col-span-4 desktop:col-start-9', offsetPx: 32 },
  { testimonial: compact[1]!, columnClass: 'desktop:col-span-8', offsetPx: 8 }
]

const labelRef = ref<HTMLElement | null>(null)
useMaskedReveal(labelRef, { by: 'word' })

const fieldRef = ref<HTMLElement | null>(null)
const cardComponents = ref<{ cardRef: HTMLElement | null }[]>([])
const signalRef = ref<HTMLElement | null>(null)

const hoveredIndex = ref<number | null>(null)
const focusedIndex = ref<number | null>(null)
const activeIndex = computed(() => focusedIndex.value ?? hoveredIndex.value)

// Signal — Structural Focus Indicator (04-homepage-spec.md §5): a restrained
// anchor at the field's perimeter. Active card changes the Signal's STATE
// (opacity/subtle local shift), never its position across the field — it
// never travels card-to-card like a second cursor or magnetic follower.
watch(activeIndex, (index) => {
  const signal = signalRef.value
  if (!signal) return
  gsap.to(signal, {
    opacity: index === null ? 0.4 : 1,
    y: index === null ? 0 : -3,
    duration: motionDuration.fast,
    ease: approvedEase.gsapStandard
  })
})

// Surrounding-card dim: active card 100%, others ~35-50% (locked values).
// Desktop/hover-capable only — mobile has no dim-others behavior per spec
// (hierarchy there comes from spacing/scale/typography/ordering instead).
watch([hoveredIndex, focusedIndex], () => {
  const cards = cardComponents.value.map((c) => c?.cardRef).filter((el): el is HTMLElement => !!el)
  if (!cards.length) return
  const active = activeIndex.value

  cards.forEach((card, i) => {
    gsap.to(card, {
      opacity: active === null ? 1 : i === active ? 1 : 0.4,
      duration: motionDuration.fast,
      ease: approvedEase.gsapStandard
    })
  })
})

function handleCardEnter(index: number) { hoveredIndex.value = index }
function handleCardLeave() { hoveredIndex.value = null }
function handleCardFocusIn(index: number) { focusedIndex.value = index }
function handleCardFocusOut() { focusedIndex.value = null }

useGsapContext(() => {
  const field = fieldRef.value
  const cardEntries = cardComponents.value
  const cards = cardEntries.map((c) => c?.cardRef).filter((el): el is HTMLElement => !!el)
  if (!field || !cards.length) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Milestone 5A final closure: the zig-zag vertical-offset composition
    // device is Desktop-only (>= 1024px), not the legacy 768px `md`
    // boundary — Testimoni is Medium/not pinned, so "reduced offsets" for
    // Tablet is satisfied by reusing the same simplified single-column
    // stack Mobile already uses (spec: "do not invent a new third design
    // language" / simplest faithful reduced-complexity adaptation), rather
    // than inventing a separate partial-offset scheme for Tablet alone.
    const isDesktop = window.matchMedia(breakpointQuery.desktopUp).matches
    // The zig-zag's vertical offset is only a desktop composition device
    // (mobile is a plain vertical stack, per spec) — apply it as a GSAP-
    // owned `y` at rest so the exit tween below can resolve it to 0.
    if (isDesktop) {
      cards.forEach((card, i) => {
        gsap.set(card, { y: fieldItems[i]!.offsetPx })
      })
    }

    // Entrance: plain fade + rise, no rotation, no elastic overshoot — the
    // spec's approved easing family only (power3.out), reversible on
    // scroll-up. Idle state after settling is fully static (locked). Note:
    // entrance animates FROM `restY + 32` back TO each card's own resting
    // offset (not to 0) — the zig-zag is the section's resting state; only
    // the exit sequence below resolves it to a shared baseline.
    gsap.set(cards, { opacity: 0 })
    cards.forEach((card, i) => {
      const restY = isDesktop ? fieldItems[i]!.offsetPx : 0
      gsap.set(card, { y: restY + 32 })
    })

    const entrance = gsap.to(cards, {
      opacity: 1,
      y: (i: number) => (isDesktop ? fieldItems[i]!.offsetPx : 0),
      duration: motionDuration.editorial,
      ease: approvedEase.gsapStandard,
      stagger: motionStagger.base,
      scrollTrigger: { trigger: field, start: 'top 80%', toggleActions: 'restart none restart reverse' }
    })

    // Exit — Ordered Handoff (locked 5-step sequence, 04-homepage-spec.md
    // §5): (1) zig-zag vertical offsets resolve toward a shared baseline —
    // each card's own `offsetPx` tweens to 0; (2) sibling dimming/active
    // emphasis normalizes — force-clear hover/focus state so no card is
    // left mid-dim; (3) opacity returns to the neutral resting state — all
    // cards explicitly set to 1; (4) the field reads visually ordered as a
    // direct consequence of 1-3 landing before any positional handoff; (5)
    // ONLY THEN does the group perform its restrained upward move. Built
    // as one timeline (not independent scrubbed tweens) specifically so
    // steps 1-3 are guaranteed to complete before step 5 starts, both
    // forward and in reverse.
    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: field,
        start: 'bottom 70%',
        end: 'bottom 20%',
        scrub: true,
        // Step 2: normalize sibling dimming/active emphasis. Clearing the
        // reactive hover/focus state (rather than only tweening opacity
        // directly here) means the `watch([hoveredIndex, focusedIndex])`
        // handler above can't fight this timeline by re-dimming a card the
        // instant the pointer moves during the scrubbed exit — the active
        // state itself is reset, not just its visual side effect.
        onEnter: () => { hoveredIndex.value = null; focusedIndex.value = null },
        onLeaveBack: () => { hoveredIndex.value = null; focusedIndex.value = null }
      }
    })

    exitTl
      // Step 1-3: resolve offsets to baseline, normalize opacity/emphasis.
      .to(cards, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: approvedEase.gsapStandard
      }, 0)
      // Step 5: restrained group move upward — begins only after the
      // baseline-resolve tween above (same timeline, sequenced after it,
      // not layered underneath it) so the field is already ordered before
      // it moves.
      .to(cards, {
        y: -24,
        duration: 1,
        ease: approvedEase.gsapStandard
      })

    return () => {
      entrance.kill()
      exitTl.kill()
    }
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(cards, { opacity: 1, y: 0 })
  })
})
</script>

<template>
  <BaseSection as="section" class="surface-dark relative overflow-hidden">
    <!-- Tonal handoff from Trusted's light reset back into dark Slate Navy —
         a controlled gradient band, not a hard cut or dramatic wipe. Quiet
         → Medium, not Quiet → Heavy. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-surfaceNeutral to-transparent md:h-56"
    />

    <BaseContainer class="relative">
      <div class="flex items-center justify-center gap-3">
        <!-- Signal — Structural Focus Indicator: a restrained anchor near
             the field's edge, not a follower/cursor. Its STATE (opacity/
             micro-shift) changes with the active card; its position never
             travels across the field. -->
        <span
          ref="signalRef"
          aria-hidden="true"
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt opacity-40"
        />
        <p ref="labelRef" class="eyebrow">
          {{ label }}
        </p>
      </div>

      <!-- Structured 2-band zig-zag field on a 12-column grid — precise
           misalignment, not masonry. See `fieldItems` above for the
           per-card grid placement/offset rationale. -->
      <div ref="fieldRef" class="mt-16 desktop:mt-20">
        <div class="grid grid-cols-1 gap-6 desktop:grid-cols-12 desktop:gap-8">
          <HomeTestimonialCard
            v-for="(item, i) in fieldItems"
            ref="cardComponents"
            :key="item.testimonial.name + i"
            :testimonial="item.testimonial"
            :class="item.columnClass"
            @mouseenter="handleCardEnter(i)"
            @mouseleave="handleCardLeave"
            @focusin="handleCardFocusIn(i)"
            @focusout="handleCardFocusOut"
          />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
