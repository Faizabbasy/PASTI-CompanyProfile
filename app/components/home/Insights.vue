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

const stageRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const mobileHeadingRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const captionRef = ref<HTMLElement | null>(null)
const orbitDotRef = ref<SVGCircleElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })
useMaskedReveal(mobileHeadingRef, { by: 'word' })

const { setState } = useCustomCursor()

// Reading State Marker Signal (spec §7, narrow scope): which article state is
// active. Not a category selector, not a progress bar.
const activeIndex = ref(0)
const activeArticle = computed(() => homepageArticles[activeIndex.value]!)

// Orbit: an ellipse the Signal dot rides as the ring turns (viewBox units).
const ORBIT = { cx: 720, cy: 470, rx: 560, ry: 250, rot: -8 }
const clamp = gsap.utils.clamp
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

useGsapContext(() => {
  const mm = gsap.matchMedia()

  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    const stage = stageRef.value
    const cards = cardRefs.value
    if (!isDesktop || !stage || cards.length === 0) return

    let vw = window.innerWidth
    let vh = window.innerHeight
    let W = 0
    let H = 0
    let anchorX = 0 // front card's centre, relative to the stage centre
    const measure = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      W = Math.min(vw * 0.46, vh * 0.5 * 1.6)
      H = W * 0.625
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
    const centerY = () => vh * 0.03 // offset from stage middle

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
      }

      const nearest = clamp(0, N - 1, Math.round(state.pos))
      if (nearest !== activeIndex.value) activeIndex.value = nearest

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

    // Entrance: composition settles in normal flow before the ring turns.
    const enter = gsap.to(state, {
      enter: 1,
      duration: motionTier.cinematicMin + 0.4,
      ease: approvedEase.gsapCinematic,
      onUpdate: render,
      scrollTrigger: { trigger: stage, start: 'top 75%', once: true }
    })

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
      tl.scrollTrigger?.kill()
      tl.kill()
      cleanups.forEach((fn) => fn())
    }
  })
})

// Caption swap: the new article title slides in as the active state changes.
watch(activeIndex, () => {
  const el = captionRef.value
  if (!el) return
  gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
})
</script>

<template>
  <!-- Desktop-only stage (>= 1024px): curved ring of the 4 articles. -->
  <BaseSection as="section" data-motion-stage="pinned" class="surface-light relative hidden overflow-hidden py-0 desktop:block">
    <div ref="stageRef" class="relative h-[100svh] overflow-hidden">
      <BaseGridLines tone="light" />

      <!-- Orbit line + Signal dot (structural, one dot: the reading state). -->
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g :transform="`rotate(${ORBIT.rot} ${ORBIT.cx} ${ORBIT.cy})`">
          <ellipse :cx="ORBIT.cx" :cy="ORBIT.cy" :rx="ORBIT.rx" :ry="ORBIT.ry" stroke="rgba(15,23,42,0.14)" stroke-width="1" />
        </g>
        <circle ref="orbitDotRef" r="5" fill="#FBBA00" cx="160" cy="590" />
      </svg>

      <BaseContainer class="pointer-events-none absolute inset-x-0 top-10 z-30">
        <BaseSectionMark surface="light" label="Insight" meta="07 / 09" />
      </BaseContainer>

      <!-- Title + reading-state marker + CTA. -->
      <BaseContainer class="absolute inset-x-0 top-[11svh] z-30">
        <div class="flex items-start justify-between gap-8">
          <h2 ref="headingRef" class="pointer-events-none font-display text-[length:clamp(64px,8vw,132px)] font-bold leading-[0.92] tracking-[-0.04em] text-slateNavy">
            {{ heading }}
          </h2>
          <div class="flex flex-col items-end gap-5 pt-4">
            <div class="flex items-center gap-3">
              <span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />
              <p class="font-display text-token-body-large font-semibold tabular-nums tracking-[-0.01em] text-slateNavy">
                {{ String(activeIndex + 1).padStart(2, '0') }}<span class="text-[color:rgba(15,23,42,0.35)]"> / {{ String(N).padStart(2, '0') }}</span>
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
          <NuxtLink to="/insights" :aria-label="article.title" tabindex="-1" class="block h-full w-full">
            <div
              data-card-inner
              class="relative h-full w-full overflow-hidden rounded-card border border-structural-light bg-pureWhite shadow-[0_36px_70px_-38px_rgba(15,23,42,0.4)]"
            >
              <img :src="article.image" :alt="article.title" :loading="i < 2 ? 'eager' : 'lazy'" class="h-full w-full object-cover">
              <span class="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-token-sm bg-[color:rgba(255,255,255,0.92)] px-2.5 py-1.5">
                <LayoutBrandMark surface="light" :height="10" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(15,23,42,0.2)]" />
                <span class="font-display text-[10px] font-semibold tabular-nums tracking-[0.08em] text-slateNavy">{{ article.index }}</span>
              </span>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Caption for the active article. -->
      <BaseContainer class="absolute inset-x-0 bottom-[5svh] z-30">
        <NuxtLink
          to="/insights"
          class="group inline-flex max-w-[46rem] items-start gap-4 font-display text-[length:clamp(24px,2.4vw,40px)] font-medium leading-[1.12] tracking-[-0.015em] text-slateNavy"
          @mouseenter="setState('link')"
          @mouseleave="setState('default')"
        >
          <span ref="captionRef" class="inline-flex items-start gap-4">
            <span class="transition-colors duration-200 ease-editorial group-hover:text-cobalt">{{ activeArticle.title }}</span>
            <span aria-hidden="true" class="mt-1 shrink-0 transition-transform duration-200 ease-editorial group-hover:translate-x-2">→</span>
          </span>
        </NuxtLink>
      </BaseContainer>
    </div>
  </BaseSection>

  <!-- Tablet + Mobile + reduced motion: plain vertical editorial feed. -->
  <BaseSection as="section" data-motion-stage="simple" class="surface-light relative desktop:hidden">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Insight" meta="07 / 09" />

      <div class="mt-14 flex items-end justify-between gap-6 md:mt-16">
        <h2 ref="mobileHeadingRef" class="font-display text-token-display-xl font-bold text-slateNavy">
          {{ heading }}
        </h2>
        <NuxtLink
          to="/insights"
          class="group/cta relative mb-2 inline-flex shrink-0 items-center gap-2 pb-1.5 font-display text-token-metadata font-semibold uppercase tracking-[0.08em] text-slateNavy hover:text-cobalt"
        >
          {{ cta }}
          <span aria-hidden="true" class="inline-block transition-transform duration-200 ease-editorial group-hover/cta:translate-x-1">→</span>
          <span aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px origin-left scale-x-[0.2] bg-current transition-transform duration-200 ease-editorial group-hover/cta:scale-x-100" />
        </NuxtLink>
      </div>

      <div class="mt-12 flex flex-col gap-10 md:mt-14">
        <HomeInsightsCard
          v-for="(article, i) in homepageArticles"
          :key="article.index"
          :article="article"
          :role="i === 0 ? 'featured' : 'supporting'"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
