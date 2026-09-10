<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 05 — TRUST.
const heading = 'Trusted by leading organizations'

const { clients } = useTrustedClients()
// Marquee needs a duplicated run so the loop can wrap seamlessly at -50%.
const marqueeClients = [...clients, ...clients]

const headingRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const hoveredClient = ref<string | null>(null)
const paused = ref(false)
// Reduced-motion still needs the plain Tailwind hover dim/scale (GSAP's
// depth-driven scale/opacity never runs in that branch) — read once, not
// watched, matching the same one-shot read used inside useGsapContext.
const motionSafe = import.meta.client ? window.matchMedia('(prefers-reduced-motion: no-preference)').matches : true

const { setState } = useCustomCursor()

useMaskedReveal(headingRef, { by: 'word' })

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
    const logos = Array.from(track.querySelectorAll<HTMLElement>('.trust-logo'))
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const scaleRange = isMobile ? [1, 1.15] : [1, 1.3] as const
    const opacityRange = isMobile ? [0.55, 1] : [0.4, 1] as const
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
    const throttle = isMobile ? 3 : 1

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
        m.opacityTo(isDimmed ? depthOpacity * 0.4 : depthOpacity)
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
  <BaseSection as="section" class="overflow-hidden">
    <BaseContainer>
      <h2 ref="headingRef" class="text-center text-display-sm">
        {{ heading }}
      </h2>
    </BaseContainer>

    <div v-if="clients.length" class="relative mt-16 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
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
          class="trust-logo flex h-24 w-56 shrink-0 items-center justify-center transition-all duration-400 ease-editorial motion-reduce:transition-none"
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
            class="max-h-full max-w-full object-contain"
            :class="{
              'wordpress-logo scale-150': client.name === 'WordPress',
              'scale-150': client.name === 'Shopify'
            }"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.wordpress-logo {
  filter: brightness(1.08) contrast(2.2);
}
</style>
