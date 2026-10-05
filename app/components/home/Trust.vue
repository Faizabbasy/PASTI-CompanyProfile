<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 05 — TRUST.
const heading = 'Trusted by leading organizations'

const { clients } = useTrustedClients()
// Marquee needs a duplicated run so the loop can wrap seamlessly at -50%.
const marqueeClients = [...clients, ...clients]

const headingRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const markerRef = ref<HTMLElement | null>(null)
const hoveredClient = ref<string | null>(null)
const paused = ref(false)
// Reduced-motion still needs the plain Tailwind hover dim/scale (GSAP's
// depth-driven scale/opacity never runs in that branch) — read once, not
// watched, matching the same one-shot read used inside useGsapContext.
const motionSafe = import.meta.client ? window.matchMedia('(prefers-reduced-motion: no-preference)').matches : true

const { setState } = useCustomCursor()

const countRef = ref<HTMLElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })
useCountUp(countRef, { value: clients.length, duration: 1.4, format: (n) => String(Math.round(n)).padStart(2, '0') })

// Signal — Quiet Proof Marker (04-homepage-spec.md §4 "The Signal"): Selected
// Work's editorial spine visually resolves into this restrained Cobalt
// marker near the Trusted heading. One subtle activation on entry, then
// fully static — no progress percentage, no numeral, no repeated pulse, no
// logo tracking, no persistent animated rail. This is the section's only
// Signal element; it does not track hovered/focal logos.
useGsapContext(() => {
  const marker = markerRef.value
  if (!marker) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(marker, { scale: 0, opacity: 0 })
    const anim = gsap.to(marker, {
      scale: 1,
      opacity: 1,
      duration: motionDuration.editorial,
      ease: approvedEase.gsapStandard,
      scrollTrigger: { trigger: marker, start: 'top 85%', once: true }
    })
    return () => anim.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(marker, { scale: 1, opacity: 1 })
  })
})

useGsapContext(() => {
  const track = trackRef.value
  if (!track) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 32,
      ease: 'none',
      repeat: -1
    })

    watch(paused, (isPaused) => {
      if (isPaused) tween.pause()
      else tween.play()
    })

    let hoveredName: string | null = null
    watch(hoveredClient, (name) => { hoveredName = name })

    // Focal-depth zone: logos passing the horizontal center read sharper/
    // larger (peak clarity), logos further out shrink/fade (perspective
    // compression) — a corridor with real depth, not a flat marquee. Per
    // the mandatory performance guardrail: each logo's static offset
    // within the track is cached once (on mount, and again on resize via
    // ResizeObserver) — never re-measured with getBoundingClientRect()
    // inside the per-frame loop. Per frame, only the track's own live
    // xPercent (already being driven by the tween above) combines with
    // that cached offset to derive where each logo currently sits.
    // Milestone 5A final closure: this `isMobile` flag is a presentation
    // optimization only (gentler focal-depth range + lower per-frame
    // throttle for weaker devices), NOT a Heavy-vs-reduced pin gate — the
    // marquee itself runs identically at every viewport width, per the
    // spec's "Trusted is Quiet, the marquee may remain at Tablet only if
    // it remains readable/performant/visually quiet" (it does). Per the
    // frozen tier model, the same gentler tuning that was previously only
    // "below 768px" is extended to cover the whole sub-desktop range
    // (Tablet + Mobile, i.e. below 1024px) rather than just true-Mobile —
    // Tablet is "Reduced Complexity" too, and this optimization already
    // reads as reduced complexity, not a Heavy desktop-only device.
    const logos = Array.from(track.querySelectorAll<HTMLElement>('.trust-logo'))
    const isBelowDesktop = window.matchMedia(breakpointQuery.belowDesktop).matches
    const scaleRange = isBelowDesktop ? [1, 1.15] : [1, 1.3] as const
    // Raised the far-from-focus floor from 0.4/0.55 to 0.75/0.85 — logos
    // outside the focal zone still recede, but read as clearly visible
    // brand marks rather than washed out, per feedback that the marquee
    // overall needed to feel brighter.
    const opacityRange = isBelowDesktop ? [0.85, 1] : [0.75, 1] as const
    const focalHalfWidth = () => window.innerWidth * 0.1 // ~20% width zone, centered

    interface LogoMetrics { name: string; offset: number; scaleTo: (v: number) => void; opacityTo: (v: number) => void; yTo: (v: number) => void }
    let metrics: LogoMetrics[] = []
    let trackLeft = 0

    // Batch ALL reads first (offsetLeft, getBoundingClientRect), then set
    // up ALL the GSAP writers afterward — never interleaved, per the
    // guardrail against layout thrashing. Re-run on mount and on resize;
    // never inside the per-frame tick below.
    function measure() {
      if (!track) return
      trackLeft = track.getBoundingClientRect().left - (gsap.getProperty(track, 'x') as number)
      const offsets = logos.map((el) => el.offsetLeft + el.offsetWidth / 2)
      metrics = logos.map((el, i) => ({
        name: el.dataset.clientName ?? '',
        offset: offsets[i]!,
        scaleTo: gsap.quickTo(el, 'scale', { duration: motionDuration.hover, ease: motionEase.standard }),
        opacityTo: gsap.quickTo(el, 'opacity', { duration: motionDuration.hover, ease: motionEase.standard }),
        yTo: gsap.quickTo(el, 'y', { duration: motionDuration.hover, ease: motionEase.standard })
      }))
    }
    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track)

    // Mobile throttles the per-frame update to every 3rd tick to save
    // compute on weaker devices, per the mobile adaptation note.
    let frameCount = 0
    const throttle = isBelowDesktop ? 3 : 1

    function onTick() {
      frameCount++
      if (frameCount % throttle !== 0) return
      if (!metrics.length) return

      const trackX = gsap.getProperty(track, 'x') as number
      const viewportCenter = window.innerWidth / 2
      const half = focalHalfWidth()

      for (const m of metrics) {
        // Logo's live viewport x = its cached static offset within the
        // track, shifted by the track's own cached left edge and its
        // current live translate (the marquee tween already driving it) —
        // no DOM read in this loop.
        const viewportX = trackLeft + trackX + m.offset
        const distance = Math.abs(viewportX - viewportCenter)
        const proximity = 1 - Math.min(distance / (half * 3), 1) // 0 far, 1 at center

        const depthScale = gsap.utils.mapRange(0, 1, scaleRange[0], scaleRange[1], proximity)
        const depthOpacity = gsap.utils.mapRange(0, 1, opacityRange[0], opacityRange[1], proximity)

        // Hover adds a boost on top of whatever depth value currently
        // applies (never an override): the hovered logo scales up further
        // and every other logo dims, on top of its own depth-driven state.
        const isHovered = hoveredName === m.name
        const isDimmed = hoveredName !== null && !isHovered
        m.scaleTo(isHovered ? depthScale * 1.08 : depthScale)
        m.opacityTo(isDimmed ? depthOpacity * 0.6 : depthOpacity)
        // Subtle mutual vertical pull as a pair approaches the focal zone
        // from both sides, hinting at lens compression without touching
        // horizontal marquee spacing.
        m.yTo(proximity > 0.6 ? -(proximity - 0.6) * 10 : 0)
      }
    }

    gsap.ticker.add(onTick)

    return () => {
      tween.kill()
      gsap.ticker.remove(onTick)
      resizeObserver.disconnect()
    }
  })
})
</script>

<template>
  <BaseSection as="section" class="surface-light relative overflow-hidden">
    <!-- Brand environment (light reset): the 12-column grid made visible with
         top-edge ticks, and a single ghost PASTI wordmark cropped by the
         section corner (Large Type as Graphic / Editorial Crop). Static,
         ~4% — it is texture you notice only when you look for it. -->
    <BaseGridLines tone="light" edge="top" />
    <img
      src="/images/pasti-logo.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      draggable="false"
      class="pointer-events-none absolute -bottom-[14%] -right-[6%] z-0 w-auto max-w-none select-none opacity-[0.03]"
      style="height: clamp(200px, 38vw, 560px)"
    />

    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Trusted" meta="06 / 11" />

      <div class="mt-16 flex flex-col items-center md:mt-20">
        <!-- Signal — Quiet Proof Marker: a single restrained Cobalt dot,
             settling near the heading, one-shot activation then static. -->
        <span
          ref="markerRef"
          aria-hidden="true"
          class="mb-4 h-1.5 w-1.5 rounded-full bg-pastiYellow-500"
        />
        <h2 ref="headingRef" class="text-center text-display-sm">
          {{ heading }}
        </h2>
      </div>
    </BaseContainer>

    <div v-if="clients.length" class="relative z-10 mt-16 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        ref="trackRef"
        class="flex w-max flex-wrap items-center justify-center gap-x-16 gap-y-14 motion-safe:flex-nowrap motion-safe:justify-start md:gap-x-24"
        @mouseenter="paused = true"
        @mouseleave="paused = false; hoveredClient = null"
      >
        <div
          v-for="(client, i) in marqueeClients"
          :key="`${client.name}-${i}`"
          :data-client-name="client.name"
          class="trust-logo group relative flex h-24 w-56 shrink-0 items-center justify-center transition-all duration-400 ease-editorial motion-reduce:transition-none"
          :class="[
            i >= clients.length ? 'motion-reduce:hidden' : '',
            hoveredClient === client.name ? 'motion-reduce:scale-110' : 'motion-reduce:scale-100'
          ]"
          :style="{ opacity: !motionSafe && hoveredClient && hoveredClient !== client.name ? 0.3 : undefined }"
          @mouseenter="hoveredClient = client.name; setState('view')"
          @mouseleave="setState('default')"
        >
          <img
            :src="client.logo"
            :alt="client.name"
            decoding="async"
            class="max-h-full max-w-full object-contain"
            :class="{
              'wordpress-logo scale-150': client.name === 'WordPress',
              'scale-150': client.name === 'Shopify'
            }"
            loading="lazy"
          />
          <!-- Precision tick: PASTI's line language sits around the partner
               logo, never on it (04-homepage-spec.md §4 Partner Logo Respect). -->
          <span
            aria-hidden="true"
            class="absolute bottom-1 left-1/2 h-px w-10 -translate-x-1/2 origin-center scale-x-0 bg-cobalt transition-transform duration-200 ease-editorial group-hover:scale-x-100"
          />
        </div>
      </div>
    </div>

    <!-- Proof line: the count is the real length of the approved logo list —
         no invented metric. -->
    <BaseContainer class="relative z-10 mt-14 md:mt-20">
      <div class="flex items-center gap-4 border-t border-structural-light pt-6">
        <span ref="countRef" class="font-display text-token-h2 font-bold leading-none tracking-[-0.03em] text-slateNavy">{{ String(clients.length).padStart(2, '0') }}</span>
        <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-[color:rgba(3,60,89,0.55)]">Approved partner logos</span>
        <LayoutBrandMark surface="light" :height="13" class="ml-auto" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>

<style scoped>
.wordpress-logo {
  filter: brightness(1.08) contrast(2.2);
}
</style>
