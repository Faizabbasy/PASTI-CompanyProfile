<script setup lang="ts">
import gsap from 'gsap'

// Owner decision 2026-10-07: "Our Beloved Client" (the COMPRO 2025 client-wall
// title, p.7) replaces the mapping doc's "Trusted by leading organizations".
const heading = 'Our Beloved Client'
// Client-sector line condensed from COMPRO 2025 p.25 (same source as useWhoWeAre).
const lede = 'State-owned enterprises, multinational corporations and leading brands across Indonesia.'

// Owner decisions 2026-10-07: the marquee shows real clients (useClients)
// instead of the 7 platform logos (moved to HomeTechStrip), and the section
// was re-laid out for the larger list ("perbagus lagi design dan layout"):
// an editorial head (heading left, live count right) and TWO counter-moving
// rows instead of one long line. Overrides the 04-homepage-spec
// "existing logo order" lock; the focal-depth / hover-pause / edge-mask
// mechanism is kept, now running across both rows.
type ShownClient = { name: string; logo: string; ratio: number }
const clients: ShownClient[] = useClients().clients.filter((c) => c.trusted && c.logo).map((c) => ({ name: c.name, logo: c.logo!, ratio: c.ratio }))
// Alternate the list into two rows so sectors stay mixed in both.
const rows = [clients.filter((_, i) => i % 2 === 0), clients.filter((_, i) => i % 2 === 1)]

// Optical sizing: every logo gets the same visual AREA (not the same height),
// so wide wordmarks don't dwarf square marks — capped by the slot. Sizes are
// in px at desktop and scaled by --tl-scale below desktop (CSS).
const AREA = 4000
const MAX_W = 196
const MAX_H = 66
const size = (r: number) => {
  let w = Math.sqrt(AREA * r)
  let h = Math.sqrt(AREA / r)
  if (h > MAX_H) { h = MAX_H; w = h * r }
  if (w > MAX_W) { w = MAX_W; h = w / r }
  return { width: `calc(${w.toFixed(1)}px * var(--tl-scale))`, height: `calc(${h.toFixed(1)}px * var(--tl-scale))` }
}

const headingRef = ref<HTMLElement | null>(null)
const trackRefs = ref<HTMLElement[]>([])
const markerRef = ref<HTMLElement | null>(null)
const hoveredClient = ref<string | null>(null)
const paused = ref(false)
// Reduced-motion still needs the plain Tailwind hover dim/scale (GSAP's
// depth-driven scale/opacity never runs in that branch) — read once.
const motionSafe = import.meta.client ? window.matchMedia('(prefers-reduced-motion: no-preference)').matches : true

const { setState } = useCustomCursor()

const countRef = ref<HTMLElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })
useCountUp(countRef, { value: clients.length, duration: 1.4, format: (n) => String(Math.round(n)).padStart(2, '0') })

// Signal — Quiet Proof Marker (04-homepage-spec.md §4 "The Signal"): one
// restrained marker near the heading, a single activation on entry, then
// static. It does not track hovered/focal logos.
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
  const tracks = trackRefs.value.filter(Boolean)
  if (!tracks.length) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const isBelowDesktop = window.matchMedia(breakpointQuery.belowDesktop).matches
    // Row 0 drifts left, row 1 drifts right, at slightly different speeds
    // (px/s) so the two never lock into step. Duration follows track length.
    const speeds = isBelowDesktop ? [30, 24] : [42, 34]
    const tweens = tracks.map((track, i) => {
      const half = track.scrollWidth / 2
      const duration = Math.max(20, half / speeds[i % 2]!)
      return i % 2 === 0
        ? gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration, ease: 'none', repeat: -1 })
        : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration, ease: 'none', repeat: -1 })
    })

    watch(paused, (isPaused) => {
      tweens.forEach((t) => (isPaused ? t.pause() : running && t.play()))
    })

    let hoveredName: string | null = null
    watch(hoveredClient, (name) => { hoveredName = name })

    // Focal-depth zone: logos passing the horizontal centre read slightly
    // larger and fully opaque; further out they recede. Each logo's offset
    // in its track is cached (mount + ResizeObserver) — never measured in
    // the per-frame loop, which only combines it with the track's live x.
    const scaleRange = isBelowDesktop ? [1, 1.1] : [1, 1.18] as const
    const opacityRange = isBelowDesktop ? [0.88, 1] : [0.78, 1] as const
    const focalHalfWidth = () => window.innerWidth * 0.12

    interface LogoMetrics { el: HTMLElement; name: string; offset: number; s: number; o: number }
    interface TrackMetrics { el: HTMLElement; left: number; logos: LogoMetrics[] }
    let state: TrackMetrics[] = []

    function measure() {
      state = tracks.map((track) => {
        const left = track.getBoundingClientRect().left - (gsap.getProperty(track, 'x') as number)
        const els = Array.from(track.querySelectorAll<HTMLElement>('.trust-logo'))
        const offsets = els.map((el) => el.offsetLeft + el.offsetWidth / 2)
        return { el: track, left, logos: els.map((el, i) => ({ el, name: el.dataset.clientName ?? '', offset: offsets[i]!, s: 1, o: 1 })) }
      })
    }
    measure()
    const resizeObserver = new ResizeObserver(measure)
    tracks.forEach((t) => resizeObserver.observe(t))

    let frameCount = 0
    const throttle = isBelowDesktop ? 2 : 1

    function onTick() {
      frameCount++
      if (frameCount % throttle !== 0) return
      const viewportCenter = window.innerWidth / 2
      const half = focalHalfWidth()
      const k = 0.18 * throttle
      for (const t of state) {
        const trackX = gsap.getProperty(t.el, 'x') as number
        for (const m of t.logos) {
          const distance = Math.abs(t.left + trackX + m.offset - viewportCenter)
          const proximity = 1 - Math.min(distance / (half * 3), 1)
          const depthScale = gsap.utils.mapRange(0, 1, scaleRange[0], scaleRange[1], proximity)
          const depthOpacity = gsap.utils.mapRange(0, 1, opacityRange[0], opacityRange[1], proximity)
          const isHovered = hoveredName === m.name
          const isDimmed = hoveredName !== null && !isHovered
          const ts = isHovered ? Math.max(depthScale, 1.1) : depthScale
          const to = isHovered ? 1 : isDimmed ? depthOpacity * 0.45 : depthOpacity
          m.s += (ts - m.s) * k
          m.o += (to - m.o) * k
          m.el.style.transform = `scale(${m.s.toFixed(4)})`
          m.el.style.opacity = m.o.toFixed(3)
        }
      }
    }

    // Run only while the section is on screen.
    let running = false
    const setRunning = (on: boolean) => {
      if (on === running) return
      running = on
      if (on) {
        if (!paused.value) tweens.forEach((t) => t.play())
        gsap.ticker.add(onTick)
      } else {
        tweens.forEach((t) => t.pause())
        gsap.ticker.remove(onTick)
      }
    }
    tweens.forEach((t) => t.pause())
    const io = new IntersectionObserver(([e]) => setRunning(!!e?.isIntersecting), { rootMargin: '100px 0px' })
    io.observe(tracks[0]!.parentElement!.parentElement!)

    return () => {
      tweens.forEach((t) => t.kill())
      gsap.ticker.remove(onTick)
      io.disconnect()
      resizeObserver.disconnect()
    }
  })
})
</script>

<template>
  <BaseSection as="section" class="surface-light relative overflow-hidden">
    <!-- Brand environment (light reset): the 12-column grid made visible with
         top-edge ticks, and a single ghost PASTI wordmark cropped by the
         section corner. Static, ~3%. -->
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

      <!-- Editorial head: heading left, live client count right. -->
      <div class="mt-16 grid items-end gap-10 md:mt-20 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-8">
          <span ref="markerRef" aria-hidden="true" class="mb-5 block h-1.5 w-1.5 rounded-full bg-pastiYellow-500 max-desktop:mx-auto" />
          <h2 ref="headingRef" class="max-w-[16ch] text-display-sm max-desktop:mx-auto">
            {{ heading }}
          </h2>
        </div>
        <div class="m-stack flex items-end gap-5 desktop:col-span-4 desktop:justify-end">
          <span ref="countRef" class="font-display text-[clamp(64px,7vw,112px)] font-extrabold leading-[0.8] tracking-[-0.05em] text-slateNavy">{{ String(clients.length).padStart(2, '0') }}</span>
          <div class="pb-1 desktop:max-w-[22ch]">
            <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Clients</p>
            <p class="mt-1.5 text-[14px] leading-snug text-[color:rgba(3,60,89,0.72)]">{{ lede }}</p>
          </div>
        </div>
      </div>
    </BaseContainer>

    <!-- Two counter-moving rows between hairline rules. Logos stay unframed
         (04-spec §Partner Logo Respect); PASTI's line language sits around them. -->
    <div
      v-if="clients.length"
      class="tl-field relative z-10 mt-14 border-y border-structural-light md:mt-20"
      @mouseenter="paused = true"
      @mouseleave="paused = false; hoveredClient = null"
    >
      <div
        v-for="(row, r) in rows"
        :key="r"
        class="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        :class="r > 0 ? 'border-t border-structural-light' : ''"
      >
        <ul
          :ref="(el) => { if (el) trackRefs[r] = el as HTMLElement }"
          class="flex w-max items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
          :aria-label="r === 0 ? 'Client logos' : undefined"
        >
          <li
            v-for="(client, i) in [...row, ...row]"
            :key="`${client.name}-${i}`"
            :data-client-name="client.name"
            class="trust-logo group relative flex h-24 shrink-0 items-center justify-center px-6 transition-[opacity,transform] duration-300 ease-editorial motion-reduce:h-20 tablet:h-28 tablet:px-10 desktop:h-32 desktop:px-12"
            :class="[
              i >= row.length ? 'motion-reduce:hidden' : '',
              hoveredClient === client.name ? 'motion-reduce:scale-110' : 'motion-reduce:scale-100'
            ]"
            :aria-hidden="i >= row.length ? 'true' : undefined"
            :style="{ opacity: !motionSafe && hoveredClient && hoveredClient !== client.name ? 0.4 : undefined }"
            @mouseenter="hoveredClient = client.name; setState('view', client.name)"
            @mouseleave="setState('default')"
          >
            <img
              :src="client.logo"
              :alt="i >= row.length ? '' : client.name"
              :style="size(client.ratio)"
              decoding="async"
              loading="lazy"
              draggable="false"
              class="max-w-none object-contain"
            >
            <!-- Precision tick under the hovered logo. -->
            <span
              aria-hidden="true"
              class="absolute bottom-3 left-1/2 h-px w-8 -translate-x-1/2 origin-center scale-x-0 bg-pastiYellow-500 transition-transform duration-300 ease-editorial group-hover:scale-x-100"
            />
          </li>
        </ul>
      </div>
    </div>

    <BaseContainer class="relative z-10 mt-6">
      <div class="m-center-row flex items-center gap-4">
        <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.45)]">Est. 2020 · PT Hidup Pasti Bahagia</span>
        <LayoutBrandMark surface="light" :height="13" class="ml-auto max-desktop:hidden" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>

<style scoped>
.tl-field {
  --tl-scale: 0.8;
}
@media (min-width: 640px) {
  .tl-field {
    --tl-scale: 0.86;
  }
}
@media (min-width: 1024px) {
  .tl-field {
    --tl-scale: 1;
  }
}
</style>
