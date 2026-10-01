<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// TESTIMONI — "Voices on an orbit" (owner-directed, supersedes the 6-card
// zig-zag of 04-homepage-spec.md §5; the spec needs a follow-up edit).
//
//   What clients say          ╭──── orbit ────╮
//   “ active quote, in full   [02]  [ 01 ]  [03] [04]      <- every voice
//   ── Name, role                  active                     is on screen
//   ← →  01 / 04                                            at once
//
// All voices are always visible; there are no pages. On desktop a short pin
// turns scroll into sideways travel along the ring (snapping to each voice),
// the active card comes to the front, and the full quote on the left follows
// it. Arrows / card clicks scroll to that voice rather than paging.
//
// Brand guardrails (00-brand-guide.md): no portraits — none exist and stock
// faces are banned (§09, spec "no avatar baseline") — so each card carries a
// typographic monogram of the client's initials instead. Card excerpts are
// the opening of the client's own quote, never rewritten copy.
// Owner-directed: PASTI Yellow marks the voice in focus (active disc, index,
// rule, orbit arc, heading stroke) — always a state marker, never a fill.
// Placeholder testimonials (Lorem ipsum) are excluded until real ones exist.
//
// Below `desktop` and under reduced motion: no pin; the same cards sit in a
// native horizontal swipe row with the full quote on each card.
const label = 'What clients say'

const { testimonials } = useTestimonials()
const voices = testimonials.filter((t) => t.status !== 'placeholder')
const N = voices.length
const total = String(N).padStart(2, '0')

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

/** Opening of the client's own quote: first sentence, cut on a word boundary. */
const excerpt = (quote: string, max = 120) => {
  const first = quote.split(/(?<=[.!?])\s+/)[0] ?? quote
  if (first.length <= max) return first
  return `${first.slice(0, max).replace(/\s+\S*$/, '')}…`
}

const active = ref(0)
const current = computed(() => voices[active.value]!)
const words = computed(() => current.value.quote.split(/\s+/))

const stageRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const mobileHeadingRef = ref<HTMLElement | null>(null)
const quoteRef = ref<HTMLElement | null>(null)
const attributionRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const orbitDotRef = ref<SVGCircleElement | null>(null)
const orbitArcRef = ref<SVGEllipseElement | null>(null)
const underlineRef = ref<HTMLElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })
useMaskedReveal(mobileHeadingRef, { by: 'word' })

const { setState } = useCustomCursor()

const ORBIT = { cx: 1000, cy: 450, rx: 440, ry: 330 }
// Plain helper, not gsap.utils.clamp: this line runs during SSR, where the
// server bundle can resolve `gsap` to its CJS module object (no `.utils`).
const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

let trigger: ScrollTrigger | undefined

/** Scrolls the pin to voice `i` (desktop) — voices are positions, not pages. */
function goTo(i: number) {
  const index = clamp(0, N - 1, i)
  if (!trigger) {
    active.value = index
    return
  }
  const y = trigger.start + (trigger.end - trigger.start) * (N > 1 ? index / (N - 1) : 0)
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(y, { duration: 1.1 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

watch(active, async () => {
  await nextTick()
  const q = quoteRef.value
  if (!q || window.matchMedia(reducedMotionQuery.reduce).matches) return
  gsap.fromTo(q.querySelectorAll('[data-w]'), { yPercent: 110 }, { yPercent: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.008, overwrite: 'auto' })
  if (attributionRef.value) {
    gsap.fromTo(attributionRef.value, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: motionTier.standardMin, delay: 0.1, ease: approvedEase.gsapStandard, overwrite: 'auto' })
  }
})

useGsapContext(() => {
  const mm = gsap.matchMedia()

  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    const stage = stageRef.value
    const cards = cardRefs.value
    if (!isDesktop || !stage || cards.length === 0) return

    let W = 0
    let H = 0
    let centerX = 0
    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      W = Math.min(vw * 0.18, (vh * 0.6) / 1.5, 290)
      H = W * 1.5
      centerX = vw * 0.13 // ring centre sits right of the stage centre
      cards.forEach((c) => {
        c.style.width = `${W}px`
        c.style.height = `${H}px`
        c.style.marginLeft = `${-W / 2}px`
        c.style.marginTop = `${-H / 2}px`
      })
    }
    measure()

    const state = { pos: 0, enter: 0 }

    const render = () => {
      for (let i = 0; i < N; i++) {
        const el = cards[i]!
        const d = i - state.pos
        const ad = Math.abs(d)
        const side = Math.sign(d)
        // Ring: neighbours recede and turn toward the centre; the left side
        // is thinned out so it never crowds the quote column.
        const x = centerX + side * W * (1.05 * ad - 0.12 * ad * ad)
        const s = Math.max(0.55, 1 - 0.15 * ad)
        const rotY = -side * 26 * Math.min(ad, 1.5)
        const y = ad * 10 + (1 - state.enter) * 60
        const reach = d < 0 ? clamp(0, 1, 1 - (ad - 1.1) * 1.6) : clamp(0, 1, 1 - (ad - 2.6))
        const opacity = reach * lerp(1, 0.7, clamp(0, 1, ad)) * state.enter
        gsap.set(el, {
          x,
          y,
          scale: s,
          rotationY: rotY,
          opacity,
          zIndex: 100 - Math.round(ad * 10),
          pointerEvents: opacity > 0.4 ? 'auto' : 'none'
        })
        el.dataset.active = String(ad < 0.5)
      }
      const nearest = clamp(0, N - 1, Math.round(state.pos))
      if (nearest !== active.value) active.value = nearest

      const dot = orbitDotRef.value
      if (dot) {
        const t = N > 1 ? state.pos / (N - 1) : 0
        const a = lerp(235, 125, t) * (Math.PI / 180)
        dot.setAttribute('cx', String(ORBIT.cx + ORBIT.rx * Math.cos(a)))
        dot.setAttribute('cy', String(ORBIT.cy - ORBIT.ry * Math.sin(a)))
        // Ellipse strokes start at 3 o'clock and run clockwise on screen;
        // trail the arc behind the dot.
        const f = ((((-a * 180) / Math.PI) % 360) + 360) % 360 / 3.6
        orbitArcRef.value?.setAttribute('stroke-dashoffset', String(-(f - 10)))
      }
    }
    render()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${Math.max(1, N - 1) * 55}%`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        snap: N > 1 ? { snapTo: 1 / (N - 1), duration: { min: 0.25, max: 0.6 }, ease: approvedEase.gsapStandard, delay: 0.08 } : undefined
      },
      onUpdate: render,
      defaults: { ease: 'none' }
    })
    tl.to(state, { pos: N - 1, duration: 1 })
    trigger = tl.scrollTrigger ?? undefined

    if (underlineRef.value) {
      gsap.fromTo(underlineRef.value, { scaleX: 0 }, { scaleX: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic, scrollTrigger: { trigger: stage, start: 'top 60%', once: true } })
    }

    const enter = gsap.to(state, {
      enter: 1,
      duration: motionTier.cinematicMin + 0.4,
      ease: approvedEase.gsapCinematic,
      onUpdate: render,
      scrollTrigger: { trigger: stage, start: 'top 70%', once: true }
    })

    const cleanups: Array<() => void> = []
    const onResize = () => {
      measure()
      render()
    }
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))

    // Pointer response: cards drift a few px at different depths.
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
      trigger = undefined
      cleanups.forEach((fn) => fn())
    }
  })
})
</script>

<template>
  <!-- Desktop stage (>= 1024px, motion allowed): pinned ring. -->
  <BaseSection as="section" data-motion-stage="pinned" class="surface-light relative hidden overflow-hidden py-0 desktop:block">
    <div ref="stageRef" class="relative h-[100svh] overflow-hidden">
      <BaseGridLines tone="light" />

      <!-- Orbit + the single Yellow Signal point riding it. -->
      <svg aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <ellipse :cx="ORBIT.cx" :cy="ORBIT.cy" :rx="ORBIT.rx" :ry="ORBIT.ry" stroke="rgba(3,60,89,0.130)" stroke-width="1" />
        <ellipse :cx="ORBIT.cx" :cy="ORBIT.cy" :rx="ORBIT.rx - 60" :ry="ORBIT.ry - 60" stroke="rgba(3, 60, 89,0.14)" stroke-width="1" />
        <ellipse
          ref="orbitArcRef"
          :cx="ORBIT.cx"
          :cy="ORBIT.cy"
          :rx="ORBIT.rx"
          :ry="ORBIT.ry"
          pathLength="100"
          stroke="#FBBA00"
          stroke-width="1.5"
          stroke-dasharray="10 90"
          stroke-linecap="round"
        />
        <circle ref="orbitDotRef" r="5" fill="#FBBA00" :cx="ORBIT.cx - 250" :cy="ORBIT.cy + 270" />
      </svg>

      <BaseContainer class="pointer-events-none absolute inset-x-0 top-10 z-30">
        <BaseSectionMark surface="light" label="Testimoni" meta="07 / 11" />
      </BaseContainer>

      <!-- Left column: heading, the active voice in full, controls. -->
      <BaseContainer class="absolute inset-x-0 bottom-[7svh] top-[13svh] z-30">
        <div class="flex h-full w-[min(36vw,500px)] flex-col">
          <h2 ref="headingRef" class="pointer-events-none relative font-display text-[length:clamp(56px,5.6vw,96px)] font-bold leading-[0.92] tracking-[-0.04em] text-slateNavy">
            {{ label }}
          </h2>
          <!-- Yellow underline stroke under the heading — drawn once. -->
          <span ref="underlineRef" aria-hidden="true" class="mt-3 block h-[3px] w-24 origin-left bg-pastiYellow-500" />

          <figure class="relative mt-[5svh] flex gap-4">
            <span aria-hidden="true" class="-mt-3 shrink-0 select-none font-display text-[72px] font-bold leading-none text-pastiYellow-500">“</span>
            <div>
              <blockquote :key="active" ref="quoteRef" aria-live="polite" class="text-[length:clamp(15px,1.15vw,18px)] leading-[1.6] text-[color:rgba(3,60,89,0.95)]">
                <p>
                  <template v-for="(w, i) in words" :key="i"
                    ><span class="inline-block overflow-hidden align-top"><span data-w class="inline-block">{{ w }}</span></span
                    >{{ ' ' }}</template
                  >
                </p>
              </blockquote>
              <figcaption ref="attributionRef" class="mt-6 flex items-center gap-4">
                <span aria-hidden="true" class="h-px w-8 bg-cobalt" />
                <span>
                  <span class="block font-display text-token-body font-semibold text-slateNavy">{{ current.name }}</span>
                  <span class="block text-body-sm text-[color:rgba(3,60,89,0.65)]">{{ current.role }}</span>
                </span>
              </figcaption>
            </div>
          </figure>

          <div class="mt-auto flex items-center gap-6">
            <div class="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous testimony"
                :disabled="active === 0"
                class="flex h-11 w-11 items-center justify-center rounded-button border border-[color:rgba(3,60,89,0.216)] text-slateNavy transition-colors duration-150 ease-editorial hover:border-cobalt hover:text-cobalt focus-visible:border-cobalt focus-visible:outline-none disabled:opacity-30"
                @click="goTo(active - 1)"
                @mouseenter="setState('link')"
                @mouseleave="setState('default')"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                aria-label="Next testimony"
                :disabled="active === N - 1"
                class="flex h-11 w-11 items-center justify-center rounded-button border border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy transition-colors duration-150 ease-editorial hover:bg-slateNavy hover:border-slateNavy hover:text-pureWhite focus-visible:bg-slateNavy focus-visible:text-pureWhite focus-visible:outline-none disabled:opacity-30"
                @click="goTo(active + 1)"
                @mouseenter="setState('link')"
                @mouseleave="setState('default')"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <span aria-hidden="true" class="h-px w-10 bg-pastiYellow-500" />
            <p class="font-display text-token-body-large font-semibold tabular-nums text-slateNavy">
              {{ String(active + 1).padStart(2, '0') }}<span class="text-[color:rgba(3,60,89,0.55)]"> / {{ total }}</span>
            </p>
          </div>
        </div>
      </BaseContainer>

      <!-- The ring: every voice, placed by render(). -->
      <div class="pointer-events-none absolute inset-0 z-20" style="perspective: 1600px">
        <article
          v-for="(v, i) in voices"
          :key="v.name"
          :ref="(el) => { if (el) cardRefs[i] = el as HTMLElement }"
          data-active="false"
          class="voice-card absolute left-1/2 top-1/2 cursor-pointer opacity-0"
          style="transform-style: preserve-3d"
          @click="goTo(i)"
          @mouseenter="setState('link')"
          @mouseleave="setState('default')"
        >
          <div data-card-inner class="voice-card__inner relative flex h-full w-full flex-col overflow-hidden rounded-card border bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FB_100%)] shadow-[0_30px_60px_-40px_rgba(3,60,89,0.5)] p-6">
            <div class="flex items-center justify-between">
              <span class="voice-card__index font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em]">{{ String(i + 1).padStart(2, '0') }}</span>
              <LayoutBrandMark surface="light" :height="11" class="opacity-70" />
            </div>

            <!-- Monogram: typographic stand-in for a portrait (none exist). -->
            <div class="relative mx-auto mt-4 aspect-square w-[40%]">
              <span aria-hidden="true" class="voice-card__disc absolute inset-0 rounded-full" />
              <span aria-hidden="true" class="absolute -inset-2 rounded-full border border-dashed border-[color:rgba(3,60,89,0.168)]" />
              <span aria-hidden="true" class="voice-card__halo absolute -inset-3.5 rounded-full border-2 border-transparent" />
              <span class="relative flex h-full w-full items-center justify-center font-display text-[clamp(28px,2.6vw,44px)] font-bold tracking-[-0.03em] text-slateNavy voice-card__initials">{{ initials(v.name) }}</span>
            </div>

            <p class="mt-6 line-clamp-3 font-display text-[length:clamp(14px,1.08vw,17px)] font-medium leading-[1.4] text-slateNavy">“{{ excerpt(v.quote) }}”</p>

            <div class="mt-auto">
              <span aria-hidden="true" class="voice-card__rule block h-px w-8" />
              <p class="mt-3 font-display text-token-body font-semibold text-slateNavy">{{ v.name }}</p>
              <p class="truncate text-body-sm text-[color:rgba(3,60,89,0.65)]">{{ v.role }}</p>
            </div>
          </div>
        </article>
      </div>

      <!-- Bottom-right: segmented progress (one segment per voice). -->
      <BaseContainer class="pointer-events-none absolute inset-x-0 bottom-[7svh] z-30">
        <div class="ml-auto flex w-fit items-center gap-4">
          <span class="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.63)]">Client voices</span>
          <span class="flex items-center gap-1.5">
            <span
              v-for="n in N"
              :key="n"
              class="h-[3px] w-6 transition-colors duration-200 ease-editorial"
              :class="n - 1 === active ? 'bg-pastiYellow-500' : n - 1 < active ? 'bg-[color:rgba(3, 60, 89,0.45)]' : 'bg-[color:rgba(3,60,89,0.192)]'"
            />
          </span>
        </div>
      </BaseContainer>
    </div>
  </BaseSection>

  <!-- Tablet + Mobile + reduced motion: every voice in a native swipe row. -->
  <BaseSection as="section" data-motion-stage="simple" class="surface-light relative overflow-hidden desktop:hidden">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Testimoni" meta="07 / 11" />
      <h2 ref="mobileHeadingRef" class="mt-14 font-display text-token-section-monumental font-bold text-slateNavy">{{ label }}</h2>
      <p class="mt-4 font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.63)]">{{ total }} client voices</p>
    </BaseContainer>
    <div class="relative z-10 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-gutter px-gutter pb-4 [scrollbar-width:none]">
      <article
        v-for="(v, i) in voices"
        :key="v.name"
        class="flex w-[82vw] max-w-[380px] shrink-0 snap-start flex-col rounded-card border border-[color:rgba(3,60,89,0.144)] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FB_100%)] shadow-[0_30px_60px_-40px_rgba(3,60,89,0.5)] p-6"
      >
        <div class="flex items-center justify-between">
          <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-cobalt">{{ String(i + 1).padStart(2, '0') }}</span>
          <LayoutBrandMark surface="light" :height="11" class="opacity-70" />
        </div>
        <div class="mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-pastiYellow-500 font-display text-xl font-bold text-slateNavy">{{ initials(v.name) }}</div>
        <p class="mt-5 text-body-md leading-[1.6] text-[color:rgba(3,60,89,0.95)]">“{{ v.quote }}”</p>
        <div class="mt-auto pt-6">
          <span aria-hidden="true" class="block h-px w-8 bg-pastiYellow-500" />
          <p class="mt-3 font-display text-token-body font-semibold text-slateNavy">{{ v.name }}</p>
          <p class="text-body-sm text-[color:rgba(3,60,89,0.65)]">{{ v.role }}</p>
        </div>
      </article>
    </div>
  </BaseSection>
</template>

<style scoped>
.voice-card__inner {
  border-color: rgba(3,60,89,0.130);
  transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.voice-card__index {
  color: rgba(3,60,89,0.715);
}
.voice-card__disc {
  background: rgba(3, 60, 89, 0.08);
  transition: background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.voice-card__rule {
  background: rgba(3,60,89,0.390);
}
.voice-card__halo {
  opacity: 0;
  transform: rotate(-40deg);
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.voice-card[data-active='true'] .voice-card__halo {
  opacity: 1;
  transform: rotate(0deg);
  border-top-color: #fbba00;
  border-right-color: #fbba00;
}

/* Active voice (owner-directed): PASTI Yellow marks the voice in focus —
   disc, index and rule — so Yellow stays a state, not a fill. Yellow value
   is the placeholder scale (#FBBA00) until the master-logo HEX is sampled. */
.voice-card[data-active='true'] .voice-card__inner {
  border-color: rgba(251, 186, 0, 0.45);
}
.voice-card[data-active='true'] .voice-card__index {
  color: #033C59;
}
.voice-card[data-active='true'] .voice-card__disc {
  background: #fbba00;
}
.voice-card[data-active='true'] .voice-card__initials {
  color: #033C59;
}
.voice-card[data-active='true'] .voice-card__rule {
  background: #fbba00;
}
.voice-card__initials {
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
