<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Editorial Intelligence in Motion (04-homepage-spec.md §7), redirected by the
// owner: instead of a flat horizontal track, the 4 articles sit on a curved
// ring (perspective, receding to the right) around a thin orbit line. Scrolling
// (a short pin) slides the ring sideways one article at a time — the active
// article leads on the left, the next ones recede behind it. Mirrors the
// Hero gallery's mechanic, so Insight reads as the same universe on a light
// surface. Copy sourced from the content mapping doc, section 08 — INSIGHTS.
//
// Owner polish pass (2026-09-30), same ring mechanic:
//   - topic tabs (clickable — glide the ring to that article) + scrubbed
//     progress line replace the bare counter;
//   - a richer caption (category, headline with Cobalt accent, poster
//     description — all transcribed from the poster, see useInsights `page`)
//     that swaps with a masked out/in instead of a fade;
//   - active-card precision brackets + a one-shot light sweep, inactive cards
//     desaturate; a ghost index numeral and a floor shadow under the ring;
//   - a circular "Read" CTA with a slowly turning text ring.
//
// Below `desktop` (1024px) and under reduced motion there is no pin and no
// ring: the section is a plain vertical editorial feed (Featured -> Supporting
// x3), shown via the `data-motion-stage="simple"` swap in main.css.
const heading = 'Insights'
const cta = 'View all'

const { articles } = useInsights()
const featured = articles.find((a) => a.role === 'featured')!
const supporting = articles.filter((a) => a.role === 'supporting').slice(0, 3)
const homepageArticles = [featured, ...supporting]
const N = homepageArticles.length
const pad = (n: number) => String(n).padStart(2, '0')

const stageRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const mobileHeadingRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const captionRef = ref<HTMLElement | null>(null)
const headerRowRef = ref<HTMLElement | null>(null)
const captionRowRef = ref<HTMLElement | null>(null)
const ghostRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const readRef = ref<HTMLElement | null>(null)
const readRingRef = ref<SVGSVGElement | null>(null)
const orbitDotRef = ref<SVGCircleElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })
useMaskedReveal(mobileHeadingRef, { by: 'word' })
useMagnetic(readRef, { strength: 0.35 })

// Mobile swipe rail (below desktop / reduced motion).
const mobileTrackRef = ref<HTMLElement | null>(null)
const { active: mobileActive, touched: mobileTouched, go: mobileGo, next: mobileNext, prev: mobilePrev } = useSnapRail(mobileTrackRef)

const { setState } = useCustomCursor()

// Reading State Marker Signal (spec §7, narrow scope): which article state is
// active. Not a category selector, not a progress bar.
const activeIndex = ref(0)
// What the caption/ghost currently SHOW — lags activeIndex by the out-animation
// so the old copy can leave before the new copy enters.
const shownIndex = ref(0)
const shownArticle = computed(() => homepageArticles[shownIndex.value]!)

// Orbit: an ellipse the Signal dot rides as the ring turns (viewBox units).
const ORBIT = { cx: 720, cy: 470, rx: 560, ry: 250, rot: -8 }
// Plain helper, not gsap.utils.clamp: this line runs during SSR, where the
// server bundle can resolve `gsap` to its CJS module object (no `.utils`).
const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Timeline layout (see tl below): 0.08 rest, 0.84 travel (power1.inOut), 0.08 rest.
// Inverse of power1.inOut, so a tab click can scroll to the exact progress
// where `pos` lands on that article.
const progressForIndex = (i: number) => {
  const y = N > 1 ? i / (N - 1) : 0
  const t = y < 0.5 ? Math.sqrt(y / 2) : 1 - Math.sqrt((1 - y) / 2)
  return 0.08 + 0.84 * t
}
let galleryTrigger: ScrollTrigger | undefined
const goTo = (i: number) => {
  const st = galleryTrigger
  if (!st) return
  const y = st.start + (st.end - st.start) * progressForIndex(i)
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

useGsapContext(() => {
  const mm = gsap.matchMedia()

  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    const stage = stageRef.value
    const cards = cardRefs.value
    if (!isDesktop || !stage || cards.length === 0) return

    const imgs = cards.map((c) => c.querySelector<HTMLElement>('[data-card-img]'))
    const brackets = cards.map((c) => c.querySelector<HTMLElement>('[data-card-brackets]'))

    let vw = window.innerWidth
    let vh = window.innerHeight
    let W = 0
    let H = 0
    let anchorX = 0 // front card's centre, relative to the stage centre
    let centerOffset = 0 // lead card's centre, relative to the stage middle
    const measure = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      // Fit the lead card into the free band between the header row (title,
      // tabs, View all) and the caption row, with a breathing gap (+ room for
      // the precision brackets), so it never touches either on short screens.
      const sr = stage.getBoundingClientRect()
      const headBottom = headerRowRef.value ? headerRowRef.value.getBoundingClientRect().bottom - sr.top : vh * 0.3
      const capTop = captionRowRef.value ? captionRowRef.value.getBoundingClientRect().top - sr.top : vh * 0.8
      const gap = clamp(28, 56, vh * 0.05) + 12
      const band = Math.max(160, capTop - headBottom - gap * 2)
      H = Math.min(band, vw * 0.46 * 0.625)
      W = H / 0.625
      centerOffset = headBottom + gap + band / 2 - vh / 2
      const gutter = clamp(20, 80, vw * 0.04)
      const left = Math.max(0, (vw - 1440) / 2) + gutter
      anchorX = -vw / 2 + left + vw * 0.05 + W / 2
      cards.forEach((c) => {
        c.style.width = `${W}px`
        c.style.height = `${H}px`
        c.style.marginLeft = `${-W / 2}px`
        c.style.marginTop = `${-H / 2}px`
      })
    }
    measure()

    const state = { pos: 0, enter: 0 }
    const centerY = () => centerOffset

    const render = () => {
      for (let i = 0; i < N; i++) {
        const el = cards[i]!
        const d = i - state.pos
        const ahead = d >= 0

        // Ring geometry: ahead cards recede right/up and shrink; passed cards
        // slide off to the left and dissolve.
        const x = ahead ? anchorX + W * (0.9 * d - 0.1 * d * d) : anchorX + W * 0.9 * d
        const s = ahead ? Math.max(0.5, 1 - 0.15 * d) : Math.max(0.7, 1 + 0.1 * d)
        const y = centerY() + (ahead ? -d * 14 : 0) + (1 - state.enter) * vh * 0.1
        const rotY = ahead ? -6 + 20 * Math.min(d, 1.6) : -6 - 10 * Math.abs(d)
        const rotZ = ahead ? -d * 1.4 : 0
        const far = ahead ? clamp(0, 1, 1 - (d - 2.4)) : clamp(0, 1, 1 + d * 1.25)
        // Active emphasis (locked ~75-85% inactive, spec §7): visible articles stay scannable.
        const opacity = far * lerp(1, 0.82, clamp(0, 1, Math.abs(d))) * state.enter
        const focus = clamp(0, 1, 1 - Math.abs(d))

        gsap.set(el, {
          x,
          y,
          scale: s,
          rotationY: rotY,
          rotationZ: rotZ,
          opacity,
          zIndex: 100 - Math.round(Math.abs(d) * 10),
          pointerEvents: opacity > 0.6 && Math.abs(d) < 0.6 ? 'auto' : 'none'
        })
        // Focus treatment: the active poster is full colour and framed; the
        // receding ones are quieter so the eye lands on the lead card.
        const img = imgs[i]
        if (img) img.style.filter = `saturate(${lerp(0.45, 1, focus).toFixed(3)}) brightness(${lerp(0.97, 1, focus).toFixed(3)})`
        const br = brackets[i]
        if (br) br.style.opacity = String((focus * focus * state.enter).toFixed(3))
      }

      const nearest = clamp(0, N - 1, Math.round(state.pos))
      if (nearest !== activeIndex.value) activeIndex.value = nearest

      if (progressRef.value) progressRef.value.style.transform = `scaleX(${N > 1 ? state.pos / (N - 1) : 1})`

      // Signal dot rides the orbit as the ring turns.
      const dot = orbitDotRef.value
      if (dot) {
        const t = N > 1 ? state.pos / (N - 1) : 0
        const angle = lerp(200, -20, t) * (Math.PI / 180)
        dot.setAttribute('cx', String(ORBIT.cx + ORBIT.rx * Math.cos(angle)))
        dot.setAttribute('cy', String(ORBIT.cy - ORBIT.ry * Math.sin(angle)))
      }
    }
    render()

    // Short, light pin (spec: ~2.2-2.8 viewports total, hard max 3.2).
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=170%',
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: measure
      },
      onUpdate: render,
      defaults: { ease: 'none' }
    })
    tl.to({}, { duration: 0.08 })
    tl.to(state, { pos: N - 1, duration: 0.84, ease: 'power1.inOut' }, 0.08)
    tl.to({}, { duration: 0.08 }, 0.92)
    galleryTrigger = tl.scrollTrigger ?? undefined

    // Entrance: composition settles in normal flow before the ring turns;
    // tabs, caption and the Read button follow the cards in.
    const chrome = stage.querySelectorAll<HTMLElement>('[data-ins-chrome]')
    gsap.set(chrome, { autoAlpha: 0, y: 18 })
    const enter = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 75%', once: true } })
    enter
      .to(state, { enter: 1, duration: motionTier.cinematicMin + 0.4, ease: approvedEase.gsapCinematic, onUpdate: render })
      .to(chrome, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, 0.35)

    // Read button's text ring turns slowly while the section is on screen.
    const spin = readRingRef.value ? gsap.to(readRingRef.value, { rotation: 360, duration: 16, ease: 'none', repeat: -1, paused: true, transformOrigin: '50% 50%' }) : null
    const spinVis = spin
      ? ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? spin.play() : spin.pause()) })
      : null

    const cleanups: Array<() => void> = []
    const onResize = () => {
      measure()
      render()
    }
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))

    // Pointer response: the ring drifts a few px at different depths.
    if (window.matchMedia('(pointer: fine)').matches) {
      const inners = cards.map((c) => c.querySelector<HTMLElement>('[data-card-inner]')!)
      const qx = inners.map((el) => gsap.quickTo(el, 'x', { duration: 0.9, ease: approvedEase.gsapStandard }))
      const qy = inners.map((el) => gsap.quickTo(el, 'y', { duration: 0.9, ease: approvedEase.gsapStandard }))
      const onMove = (event: PointerEvent) => {
        const r = stage.getBoundingClientRect()
        if (r.bottom < 0 || r.top > window.innerHeight) return
        const nx = (event.clientX / window.innerWidth) * 2 - 1
        const ny = (event.clientY / window.innerHeight) * 2 - 1
        inners.forEach((_, i) => {
          const depth = 5 + (i % 3) * 3
          qx[i]!(nx * depth)
          qy[i]!(ny * depth * 0.6)
        })
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      cleanups.push(() => window.removeEventListener('pointermove', onMove))
    }

    return () => {
      enter.kill()
      spin?.kill()
      spinVis?.kill()
      tl.scrollTrigger?.kill()
      tl.kill()
      galleryTrigger = undefined
      cleanups.forEach((fn) => fn())
    }
  })
})

// Active-state change: masked caption swap (old lines leave upward, new lines
// rise in), ghost numeral swap, and a one-shot light sweep over the new lead card.
let swap: gsap.core.Timeline | null = null
watch(activeIndex, (next, prev) => {
  const caption = captionRef.value
  const ghost = ghostRef.value
  const dir = next > prev ? 1 : -1
  const lines = caption ? [...caption.querySelectorAll<HTMLElement>('[data-cap-line]')] : []
  const targets = ghost ? [...lines, ghost] : lines
  swap?.kill()
  if (!targets.length) {
    shownIndex.value = next
    return
  }
  swap = gsap.timeline()
  swap
    .to(targets, { yPercent: -110 * dir, duration: 0.28, ease: motionEase.exit, stagger: 0.03 })
    .add(() => {
      shownIndex.value = next
    })
    .add(() => {
      nextTick(() => {
        gsap.fromTo(targets, { yPercent: 110 * dir }, { yPercent: 0, duration: motionTier.standardMax, ease: approvedEase.gsapPrimary, stagger: 0.05, overwrite: 'auto' })
      })
    })

  const sweep = cardRefs.value[next]?.querySelector<HTMLElement>('[data-card-sweep]')
  if (sweep) gsap.fromTo(sweep, { xPercent: -130, autoAlpha: 1 }, { xPercent: 130, autoAlpha: 1, duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapStandard, overwrite: 'auto' })
})
</script>

<template>
  <!-- Desktop-only stage (>= 1024px): curved ring of the 4 articles. -->
  <BaseSection as="section" data-motion-stage="pinned" class="surface-light relative hidden overflow-hidden py-0 desktop:block">
    <div ref="stageRef" class="relative h-[100svh] overflow-hidden">
      <BaseGridLines tone="light" />

      <!-- Ghost index numeral (swaps with the active article). -->
      <div aria-hidden="true" class="pointer-events-none absolute bottom-[1svh] right-[11vw] z-0 overflow-hidden">
        <span ref="ghostRef" class="ins-ghost block select-none font-display text-[length:clamp(180px,30svh,320px)] font-extrabold leading-[0.9] tracking-[-0.06em]">
          {{ pad(shownIndex + 1) }}
        </span>
      </div>

      <!-- Orbit lines + Signal dot (structural, one dot: the reading state). -->
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g :transform="`rotate(${ORBIT.rot} ${ORBIT.cx} ${ORBIT.cy})`">
          <ellipse :cx="ORBIT.cx" :cy="ORBIT.cy" :rx="ORBIT.rx" :ry="ORBIT.ry" stroke="rgba(3,60,89,0.14)" stroke-width="1" />
          <ellipse :cx="ORBIT.cx" :cy="ORBIT.cy" :rx="ORBIT.rx + 70" :ry="ORBIT.ry + 46" stroke="rgba(3, 60, 89,0.14)" stroke-width="1" stroke-dasharray="2 9" />
        </g>
        <circle ref="orbitDotRef" r="5" fill="#FBBA00" cx="160" cy="590" />
      </svg>
      <!-- Floor shadow the ring floats over. -->
      <div aria-hidden="true" class="pointer-events-none absolute bottom-[17svh] left-[8vw] z-10 h-[10svh] w-[62vw] rounded-[50%] bg-[radial-gradient(closest-side,rgba(3,60,89,0.16),transparent)] blur-md" />

      <BaseContainer class="pointer-events-none absolute inset-x-0 top-10 z-30">
        <BaseSectionMark surface="light" label="Insight" meta="09 / 11" />
      </BaseContainer>

      <!-- Title + topic tabs + progress + CTA. -->
      <BaseContainer class="absolute inset-x-0 top-[10svh] z-30">
        <div ref="headerRowRef" class="flex items-start justify-between gap-8">
          <h2 ref="headingRef" class="pointer-events-none font-display text-[length:clamp(56px,min(8vw,13svh),132px)] font-bold leading-[0.92] tracking-[-0.04em] text-slateNavy">
            {{ heading }}
          </h2>
          <div class="flex flex-col items-end gap-4 pt-3">
            <div data-ins-chrome class="flex items-center gap-8">
              <div class="flex items-center gap-3">
                <span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />
                <p class="font-display text-token-body-large font-semibold tabular-nums tracking-[-0.01em] text-slateNavy">
                  {{ pad(activeIndex + 1) }}<span class="text-[color:rgba(3,60,89,0.35)]"> / {{ pad(N) }}</span>
                </p>
              </div>
              <NuxtLink
                to="/insights"
                class="group/cta relative inline-flex items-center gap-2 pb-1.5 font-display text-token-metadata font-semibold uppercase tracking-[0.08em] text-slateNavy hover:text-cobalt"
              >
                {{ cta }}
                <span aria-hidden="true" class="inline-block transition-transform duration-200 ease-editorial group-hover/cta:translate-x-1">→</span>
                <span aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px origin-left scale-x-[0.2] bg-current transition-transform duration-200 ease-editorial group-hover/cta:scale-x-100" />
              </NuxtLink>
            </div>
            <div data-ins-chrome class="flex flex-col items-end gap-2.5">
              <div class="flex items-center gap-1" role="tablist" aria-label="Insight topics">
                <button
                  v-for="(article, i) in homepageArticles"
                  :key="article.index"
                  type="button"
                  role="tab"
                  :aria-selected="activeIndex === i"
                  class="group/tab relative rounded-full px-3.5 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 ease-editorial"
                  :class="activeIndex === i ? 'bg-slateNavy text-pureWhite' : 'text-[color:rgba(3,60,89,0.55)] hover:bg-[color:rgba(3,60,89,0.06)] hover:text-slateNavy'"
                  @click="goTo(i)"
                  @mouseenter="setState('link')"
                  @mouseleave="setState('default')"
                >
                  <span class="tabular-nums" :class="activeIndex === i ? 'text-pastiYellow-500' : ''">{{ article.index }}</span>
                  <span class="ml-1.5">{{ article.page?.category ?? article.title }}</span>
                </button>
              </div>
              <!-- Scrubbed progress through the ring. -->
              <span class="relative block h-px w-full bg-[color:rgba(3,60,89,0.12)]">
                <span ref="progressRef" class="absolute inset-0 origin-left scale-x-0 bg-cobalt" />
              </span>
            </div>

          </div>
        </div>
      </BaseContainer>

      <!-- The ring. Cards are absolutely centred on the stage and placed by
           render(); perspective lives here. -->
      <div class="pointer-events-none absolute inset-0 z-20" style="perspective: 1800px">
        <article
          v-for="(article, i) in homepageArticles"
          :key="article.index"
          :ref="(el) => { if (el) cardRefs[i] = el as HTMLElement }"
          class="absolute left-1/2 top-1/2 opacity-0"
          style="transform-style: preserve-3d"
          @mouseenter="setState('view', 'Read')"
          @mouseleave="setState('default')"
        >
          <NuxtLink to="/insights" :aria-label="article.title" tabindex="-1" class="group/card block h-full w-full">
            <div
              data-card-inner
              class="relative h-full w-full overflow-hidden rounded-card border border-structural-light bg-pureWhite shadow-[0_36px_70px_-38px_rgba(3,60,89,0.4)]"
            >
              <img
                data-card-img
                :src="article.image"
                :alt="article.title"
                :loading="i < 2 ? 'eager' : 'lazy'"
                class="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover/card:scale-[1.03]"
              >
              <!-- One-shot light sweep when this card becomes the lead. -->
              <span data-card-sweep aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.55)] to-transparent opacity-0" />
              <span class="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-token-sm bg-[color:rgba(255,255,255,0.92)] px-2.5 py-1.5">
                <LayoutBrandMark surface="light" :height="10" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(3,60,89,0.2)]" />
                <span class="font-display text-[10px] font-semibold tabular-nums tracking-[0.08em] text-slateNavy">{{ article.index }}</span>
              </span>
            </div>
            <!-- Precision brackets framing the lead card (Precision Framing device). -->
            <span data-card-brackets aria-hidden="true" class="pointer-events-none absolute -inset-3 opacity-0">
              <span class="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-cobalt" />
              <span class="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-cobalt" />
              <span class="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-cobalt" />
              <span class="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-cobalt" />
              <span class="absolute -top-1 right-8 h-2 w-2 rounded-full bg-pastiYellow-500" />
            </span>
          </NuxtLink>
        </article>
      </div>

      <!-- Caption for the active article + circular Read CTA. -->
      <BaseContainer class="absolute inset-x-0 bottom-[4.5svh] z-30">
        <div ref="captionRowRef" class="flex items-end justify-between gap-10">
          <NuxtLink
            to="/insights"
            data-ins-chrome
            class="group block max-w-[46rem]"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            <span ref="captionRef" class="block">
            <span class="block overflow-hidden">
              <span data-cap-line class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.6)]">
                <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />
                Insight {{ shownArticle.index }} · {{ shownArticle.page?.category }}
              </span>
            </span>
            <span class="mt-2 block overflow-hidden pb-[0.08em]">
              <span data-cap-line class="block font-display text-[length:clamp(24px,2.1vw,36px)] font-bold leading-[1.08] tracking-[-0.02em] text-slateNavy transition-colors duration-200 ease-editorial group-hover:text-cobalt">
                <template v-if="shownArticle.page">
                  {{ shownArticle.page.headline.text }}<span class="text-cobalt">{{ shownArticle.page.headline.accent ? ` ${shownArticle.page.headline.accent}` : '' }}</span><span v-if="shownArticle.page.tagline" class="text-cobalt">. {{ shownArticle.page.tagline.accent }}</span>
                </template>
                <template v-else>{{ shownArticle.title }}</template>
              </span>
            </span>
            <span v-if="shownArticle.page" class="mt-2 block overflow-hidden">
              <span data-cap-line class="block max-w-[40rem] truncate text-token-body text-[color:rgba(3,60,89,0.68)]">{{ shownArticle.page.description }}</span>
            </span>
            </span>
          </NuxtLink>

          <!-- Circular Read CTA with a turning text ring. -->
          <div ref="readRef" data-ins-chrome class="shrink-0">
            <NuxtLink
              to="/insights"
              class="group/read relative grid h-[112px] w-[112px] place-items-center"
              aria-label="Read insight"
              @mouseenter="setState('link')"
              @mouseleave="setState('default')"
            >
              <svg ref="readRingRef" viewBox="0 0 120 120" aria-hidden="true" class="absolute inset-0 h-full w-full">
                <defs>
                  <path id="ins-read-ring" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
                </defs>
                <text class="fill-slateNavy font-display text-[10px] font-semibold uppercase">
                  <textPath href="#ins-read-ring" textLength="292" lengthAdjust="spacing">Read insight · Read insight · </textPath>
                </text>
              </svg>
              <span class="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-slateNavy text-pureWhite transition-transform duration-500 ease-editorial group-hover/read:scale-110">
                <span aria-hidden="true" class="absolute inset-0 origin-bottom scale-y-0 bg-pastiYellow-500 transition-transform duration-500 ease-editorial group-hover/read:scale-y-100" />
                <svg viewBox="0 0 16 16" class="relative h-4 w-4 -rotate-45 transition-colors duration-300 group-hover/read:text-slateNavy" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </BaseContainer>
    </div>
  </BaseSection>

  <!-- Tablet + Mobile + reduced motion: the ring becomes a native swipe rail
       (scroll-snap, browser momentum) — same topics, same caption content. -->
  <BaseSection as="section" data-motion-stage="simple" class="surface-light relative overflow-hidden desktop:hidden">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Insight" meta="09 / 11" />

      <div class="m-stack mt-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 ref="mobileHeadingRef" class="min-w-0 font-display text-[length:clamp(52px,16vw,96px)] font-bold leading-[0.95] tracking-[-0.04em] text-slateNavy">
          {{ heading }}
        </h2>
        <NuxtLink
          to="/insights"
          class="group/cta relative mb-1 inline-flex min-h-11 shrink-0 items-center gap-2 font-display text-token-metadata font-semibold uppercase tracking-[0.08em] text-slateNavy active:text-cobalt"
        >
          {{ cta }}
          <span aria-hidden="true">→</span>
          <span aria-hidden="true" class="absolute inset-x-0 bottom-2 h-px bg-pastiYellow-500" />
        </NuxtLink>
      </div>
    </BaseContainer>

    <ul
      ref="mobileTrackRef"
      class="snap-rail relative z-10 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-gutter px-gutter pb-2"
      aria-label="Insight articles"
    >
      <li
        v-for="(article, i) in homepageArticles"
        :key="article.index"
        class="w-[84vw] max-w-[420px] shrink-0 snap-start"
        :aria-current="i === mobileActive ? 'true' : undefined"
      >
        <NuxtLink
          to="/insights"
          class="block origin-left transition-[transform,opacity] duration-500 ease-editorial active:scale-[0.98]"
          :class="i === mobileActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60'"
        >
          <div class="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite shadow-[0_30px_60px_-36px_rgba(3,60,89,0.5)]">
            <img :src="article.image" :alt="article.title" :loading="i < 2 ? 'eager' : 'lazy'" class="h-full w-full object-cover" draggable="false">
            <span class="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-[color:rgba(255,255,255,0.94)] px-3 py-1.5">
              <LayoutBrandMark surface="light" :height="10" />
              <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(3,60,89,0.2)]" />
              <span class="font-display text-[10px] font-semibold tabular-nums tracking-[0.08em] text-slateNavy">{{ article.index }}</span>
            </span>
          </div>
          <div class="mt-5 px-1">
            <span class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Insight {{ article.index }} · {{ article.page?.category }}
            </span>
            <h3 class="mt-2 font-display text-[24px] font-bold leading-[1.12] tracking-[-0.02em] text-slateNavy">
              <template v-if="article.page">
                {{ article.page.headline.text }}<span class="text-cobalt">{{ article.page.headline.accent ? ` ${article.page.headline.accent}` : '' }}</span><span v-if="article.page.tagline" class="text-cobalt">. {{ article.page.tagline.accent }}</span>
              </template>
              <template v-else>{{ article.title }}</template>
            </h3>
            <p v-if="article.page" class="mt-2 line-clamp-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ article.page.description }}</p>
            <span class="mt-4 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-slateNavy">
              Read insight <span aria-hidden="true" class="grid h-7 w-7 place-items-center rounded-full bg-slateNavy text-pureWhite">→</span>
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>

    <BaseContainer class="relative z-10 mt-6">
      <BaseSnapControls :count="N" :active="mobileActive" :touched="mobileTouched" noun="insight" @go="mobileGo" @prev="mobilePrev" @next="mobileNext" />
    </BaseContainer>
  </BaseSection>
</template>

<style scoped>
.ins-ghost {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(3, 60, 89, 0.08);
}
</style>
