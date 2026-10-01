<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// BRAND — "Who PASTI is" (owner-directed, company-profile branding). All copy
// is verbatim from docs/rework-v2/00-brand-guide.md: §01 Brand Core (promise,
// essence, positioning, legal entity), §02 Brand Pillars (name, meaning and
// the guide's own "visual translation" column) and the §04 voice example.
//
// PART 1 — the promise, enacted. "We turn complexity into certainty" is not
// only set in type: beside it, a tangle of routes (complexity) is pulled
// straight by scroll until every route runs into one point — the Yellow dot
// of the PASTI logo (certainty). The drawing IS the sentence, so it's a
// Signal doing its job (transition / state), not decoration. Desktop pins
// the stage for a short scrub; below desktop and under reduced motion the
// drawing simply rests in its resolved state.
//
// PART 2 — the five pillars: see BrandPillars.vue.
const statement = ['We', 'turn', 'complexity', 'into', 'certainty']
const support = 'We build systems designed to perform, scale, and move the business forward.'

const facts = [
  { label: 'Brand essence', value: 'Certainty Through Execution' },
  { label: 'Positioning', value: 'Technology × Creative Execution Partner' },
  { label: 'Company', value: 'PT Hidup Pasti Bahagia' }
]

// ---- Complexity -> certainty drawing (viewBox 700 x 520) ----
const VB = { w: 700, h: 520 }
const DOT = { x: 640, y: 262 }
const LINES = 18
/** Deterministic pseudo-random, so SSR and client draw the same tangle. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const rnd = seeded(7)
interface Route { y0: number; chaos: number[]; order: number[] }
const routes: Route[] = Array.from({ length: LINES }, (_, i) => {
  const y0 = 30 + (i / (LINES - 1)) * (VB.h - 60)
  return {
    y0,
    // cp1x, cp1y, cp2x, cp2y, endx, endy
    chaos: [60 + rnd() * 520, rnd() * VB.h, 80 + rnd() * 540, rnd() * VB.h, 300 + rnd() * 360, 20 + rnd() * (VB.h - 40)],
    order: [260, y0 + (DOT.y - y0) * 0.08, 470, DOT.y + (y0 - DOT.y) * 0.06, DOT.x, DOT.y]
  }
})
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function pathAt(r: Route, t: number) {
  const v = r.chaos.map((c, k) => lerp(c, r.order[k]!, t))
  return `M0 ${r.y0.toFixed(1)} C${v[0]!.toFixed(1)} ${v[1]!.toFixed(1)} ${v[2]!.toFixed(1)} ${v[3]!.toFixed(1)} ${v[4]!.toFixed(1)} ${v[5]!.toFixed(1)}`
}
const initialPaths = routes.map((r) => pathAt(r, 1))

const stageRef = ref<HTMLElement | null>(null)
const statementRef = ref<HTMLElement | null>(null)
const pathRefs = ref<SVGPathElement[]>([])
const dotRef = ref<SVGCircleElement | null>(null)
const ringRef = ref<SVGCircleElement | null>(null)
const labelCRef = ref<SVGTextElement | null>(null)
const labelKRef = ref<SVGTextElement | null>(null)

function draw(t: number) {
  const e = gsap.parseEase('power2.inOut')(t)
  routes.forEach((r, i) => pathRefs.value[i]?.setAttribute('d', pathAt(r, e)))
  dotRef.value?.setAttribute('r', String(lerp(0, 9, gsap.utils.clamp(0, 1, (t - 0.75) / 0.2))))
  if (labelCRef.value) labelCRef.value.style.opacity = String(1 - gsap.utils.clamp(0, 1, t * 2))
  if (labelKRef.value) labelKRef.value.style.opacity = String(gsap.utils.clamp(0, 1, (t - 0.8) / 0.2))
}

useGsapContext(() => {
  const words = statementRef.value ? Array.from(statementRef.value.querySelectorAll<HTMLElement>('[data-word]')) : []
  const stage = stageRef.value
  if (!stage) return
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    draw(1)
    gsap.set(words, { opacity: 1 })
  })

  // Desktop: short pin, one scrub drives the words and the drawing together.
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (ctx) => {
    if (!(ctx.conditions as { isDesktop: boolean }).isDesktop) return
    const proxy = { t: 0 }
    draw(0)
    gsap.set(words, { opacity: 0.14 })
    let pulsed = false
    const tl = gsap.timeline({
      scrollTrigger: { trigger: stage, start: 'top top', end: '+=130%', scrub: 0.7, pin: true, anticipatePin: 1 },
      defaults: { ease: 'none' }
    })
    tl.to(proxy, {
      t: 1,
      duration: 1,
      onUpdate: () => {
        draw(proxy.t)
        if (proxy.t > 0.96 && !pulsed && ringRef.value) {
          pulsed = true
          gsap.fromTo(ringRef.value, { attr: { r: 9 }, opacity: 0.9 }, { attr: { r: 46 }, opacity: 0, duration: 0.9, ease: approvedEase.gsapStandard })
        }
        if (proxy.t < 0.9) pulsed = false
      }
    }, 0)
    tl.to(words, { opacity: 1, stagger: 0.12, duration: 0.3 }, 0.05)
    tl.to({}, { duration: 0.15 })
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  })

  // Below desktop: no pin, resolved drawing, words fill with scroll.
  mm.add({ isBelow: `${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}` }, (ctx) => {
    if (!(ctx.conditions as { isBelow: boolean }).isBelow) return
    draw(1)
    const fill = gsap.fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.4, ease: 'none', scrollTrigger: { trigger: statementRef.value, start: 'top 85%', end: 'bottom 50%', scrub: 0.6 } })
    return () => fill.scrollTrigger?.kill()
  })

})

</script>

<template>
  <section class="surface-dark relative overflow-hidden">
    <!-- PART 1: promise stage (pinned on desktop). -->
    <div ref="stageRef" class="relative flex min-h-[100svh] flex-col py-24 desktop:h-[100svh] desktop:py-0">
      <!-- Warm/cool tonal field: navy deepening to the left, a low Cobalt
           lift behind the drawing. -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0"
        style="background: linear-gradient(180deg, transparent 72%, #033C59 100%), radial-gradient(ellipse 45% 55% at 78% 55%, rgba(251, 186, 0, 0.16), transparent 72%), linear-gradient(90deg, #022436 0%, #033C59 55%, #022F47 100%)"
      />

      <BaseContainer class="relative z-10 desktop:pt-10">
        <BaseSectionMark surface="dark" label="PASTI People" meta="Who we are" />
      </BaseContainer>

      <BaseContainer class="relative z-10 flex flex-1 items-center">
        <div class="grid w-full grid-cols-1 items-center gap-12 pt-14 desktop:grid-cols-12 desktop:gap-8 desktop:pt-0">
          <div class="desktop:col-span-6">
            <p class="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-pastiYellow-500">Brand promise</p>
            <h2
              ref="statementRef"
              aria-label="We turn complexity into certainty."
              class="mt-6 font-display text-[length:clamp(44px,5.6vw,100px)] font-bold leading-[0.94] tracking-[-0.045em] text-pureWhite"
            >
              <template v-for="(w, i) in statement" :key="w"
                ><span data-word aria-hidden="true" class="inline-block">{{ w }}</span
                ><span v-if="i < statement.length - 1" aria-hidden="true">{{ ' ' }}</span></template
              ><span aria-hidden="true" class="ml-[0.03em] inline-block h-[0.19em] w-[0.19em] rounded-full bg-pastiYellow-500" />
            </h2>
            <p class="mt-8 max-w-lg text-token-body-large text-[color:rgba(255,255,255,0.7)]">{{ support }}</p>
          </div>

          <!-- The drawing: complexity pulled into certainty. -->
          <div class="relative desktop:col-span-6">
            <svg
              :viewBox="`0 0 ${VB.w} ${VB.h}`"
              class="h-auto w-full overflow-visible"
              fill="none"
              role="img"
              aria-label="A tangle of lines resolving into a single point: complexity turned into certainty."
            >
              <path
                v-for="(d, i) in initialPaths"
                :key="i"
                :ref="(el) => { if (el) pathRefs[i] = el as unknown as SVGPathElement }"
                :d="d"
                :stroke="i === 6 ? '#FBBA00' : 'rgba(255,255,255,0.26)'"
                :stroke-width="i === 6 ? 1.6 : 1"
              />
              <circle v-for="(r, i) in routes" :key="`o${i}`" cx="0" :cy="r.y0" r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle ref="ringRef" :cx="DOT.x" :cy="DOT.y" r="9" fill="none" stroke="#FBBA00" stroke-width="1.5" opacity="0" />
              <circle ref="dotRef" :cx="DOT.x" :cy="DOT.y" r="9" fill="#FBBA00" />
              <text ref="labelCRef" x="0" y="-14" fill="rgba(255,255,255,0.5)" class="font-display" font-size="12" letter-spacing="2.4" opacity="0">COMPLEXITY</text>
              <text ref="labelKRef" :x="DOT.x" :y="DOT.y + 40" text-anchor="middle" fill="#FBBA00" class="font-display" font-size="12" letter-spacing="2.4">CERTAINTY</text>
            </svg>
          </div>
        </div>
      </BaseContainer>

      <!-- Facts strip along the stage floor. -->
      <BaseContainer class="relative z-10 desktop:pb-10">
        <dl class="mt-14 grid grid-cols-1 border-t border-[color:rgba(255,255,255,0.12)] sm:grid-cols-3 desktop:mt-0">
          <div v-for="(f, i) in facts" :key="f.label" class="flex items-center gap-4 py-5" :class="i > 0 ? 'sm:border-l sm:border-[color:rgba(255,255,255,0.12)] sm:pl-6' : ''">
            <LayoutBrandMark v-if="i === 2" :height="13" class="opacity-80" />
            <div>
              <dt class="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.45)]">{{ f.label }}</dt>
              <dd class="mt-1 font-display text-token-body font-semibold text-pureWhite">{{ f.value }}</dd>
            </div>
          </div>
        </dl>
      </BaseContainer>
    </div>

    <!-- PART 2: the five pillars, one system re-forming (BrandPillars.vue). -->
    <HomeBrandPillars />
  </section>
</template>
