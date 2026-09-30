<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// BRAND PILLARS — "one system, five formations". The same 36 nodes re-form
// into a figure for each pillar as you scroll, so every pillar is shown, not
// just labelled (00-brand-guide.md §02 names, meanings and the guide's own
// "visual translation" column — verbatim):
//
//   scatter ──> Certainty    a locked 6×6 grid        (structure, decisive)
//           ──> Precision    two measured axes        (exact alignment)
//           ──> Momentum     an accelerating route    (direction, progress)
//           ──> Practicality a stepped, usable form   (clarity, use)
//           ──> Impact       rings from one point     (what changes)
//
// Desktop: a short pin; scroll morphs node positions between formations and
// snaps to each; the copy on the left rolls to the active pillar. The first
// formation assembles from scatter when the stage enters. Below desktop /
// reduced motion: a vertical list, each pillar with its formation drawn
// statically.
const pillars = [
  { index: '01', name: 'Certainty', meaning: 'Reduce ambiguity through clarity, structure, and predictable execution.', visual: 'Strong hierarchy, clean alignment, decisive states.' },
  { index: '02', name: 'Precision', meaning: 'Operate with engineering discipline and attention to detail.', visual: 'Grid, spacing, exact alignment, controlled motion.' },
  { index: '03', name: 'Momentum', meaning: 'Move fast with control rather than rushing.', visual: 'Directional transitions, progress cues, responsive interaction.' },
  { index: '04', name: 'Practicality', meaning: 'Technology and creative work must be understandable and useful.', visual: 'Clarity before decoration; content remains usable.' },
  { index: '05', name: 'Impact', meaning: 'Judge work by what changes for the business or user.', visual: 'Real proof, projects, outcomes, measurable value.' }
]
const P = pillars.length

// ---- formations (viewBox 520 x 520), 36 nodes each ----
type Pt = [number, number]
const N = 36
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const rnd = seeded(11)
const scatter: Pt[] = Array.from({ length: N }, () => [30 + rnd() * 460, 30 + rnd() * 460])

const grid: Pt[] = Array.from({ length: N }, (_, i) => {
  const r = Math.floor(i / 6)
  const c = r % 2 === 0 ? i % 6 : 5 - (i % 6) // serpentine, so the trace reads as one route
  return [80 + c * 72, 80 + r * 72]
})
const axes: Pt[] = Array.from({ length: N }, (_, i) => (i < 18 ? [34 + i * 26.8, 260] : [260, 30 + (i - 18) * 27]))
const momentum: Pt[] = (() => {
  const start: Pt = [60, 450]
  const tip: Pt = [440, 90]
  const out: Pt[] = []
  // 28 nodes along the route, spacing growing toward the tip (acceleration)
  for (let i = 0; i < 28; i++) {
    const t = Math.pow(i / 27, 1.7)
    out.push([start[0] + (tip[0] - start[0]) * t, start[1] + (tip[1] - start[1]) * t])
  }
  // arrowhead: two wings of 4 nodes swept back from the tip at ±35°
  const len = Math.hypot(tip[0] - start[0], tip[1] - start[1])
  const bx = (start[0] - tip[0]) / len
  const by = (start[1] - tip[1]) / len
  // (first wing listed outer->inner, second inner->outer, so the trace runs
  // along the wings and through the tip — never across the arrowhead)
  ;[-0.61, 0.61].forEach((ang, w) => {
    const wx = bx * Math.cos(ang) - by * Math.sin(ang)
    const wy = bx * Math.sin(ang) + by * Math.cos(ang)
    for (let j = 1; j <= 4; j++) {
      const k = w === 0 ? 5 - j : j
      out.push([tip[0] + wx * k * 22, tip[1] + wy * k * 22])
    }
  })
  return out
})()
const steps: Pt[] = (() => {
  const out: Pt[] = []
  for (let c = 0; c < 8; c++) for (let j = 0; j <= c; j++) out.push([78 + c * 52, 450 - j * 50])
  return out
})()
const impact: Pt[] = (() => {
  const out: Pt[] = [[260, 260]]
  const ring = (r: number, n: number, off: number) => {
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * Math.PI * 2
      out.push([260 + Math.cos(a) * r, 260 + Math.sin(a) * r])
    }
  }
  ring(62, 8, 0)
  ring(128, 12, 0.2)
  ring(196, 15, 0.1)
  return out
})()
const formations: Pt[][] = [grid, axes, momentum, steps, impact]
const YELLOW = 0 // the node that carries the PASTI dot through every formation

/** Trace through the nodes in order, lifting the pen on long jumps (e.g.
 * between Precision's two axes) so the route never draws a false diagonal. */
const toTrace = (pts: Pt[]) =>
  pts
    .map((p, i) => {
      const prev = pts[i - 1]
      const jump = !prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 310
      return `${jump ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`
    })
    .join('')

const active = ref(0)
const current = computed(() => pillars[active.value]!)

const stageRef = ref<HTMLElement | null>(null)
const nodeRefs = ref<SVGCircleElement[]>([])
const traceRef = ref<SVGPathElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const copyRef = ref<HTMLElement | null>(null)
const bigIndexRef = ref<HTMLElement | null>(null)

let pinTrigger: ScrollTrigger | undefined
function jumpTo(i: number) {
  if (!pinTrigger) return
  const y = pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (i / (P - 1))
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(y, { duration: 1.1 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Writes node positions (and the trace) for one frame. */
function place(pts: Pt[]) {
  pts.forEach((p, i) => {
    const el = nodeRefs.value[i]
    if (!el) return
    el.setAttribute('cx', p[0].toFixed(1))
    el.setAttribute('cy', p[1].toFixed(1))
  })
  traceRef.value?.setAttribute('d', toTrace(pts))
}
const mix = (a: Pt[], b: Pt[], t: number): Pt[] => a.map((p, i) => [p[0] + (b[i]![0] - p[0]) * t, p[1] + (b[i]![1] - p[1]) * t])

watch(active, async () => {
  await nextTick()
  if (window.matchMedia(reducedMotionQuery.reduce).matches) return
  const chars = nameRef.value?.querySelectorAll('[data-c]')
  if (chars?.length) gsap.fromTo(chars, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.035, ease: approvedEase.gsapPrimary, overwrite: 'auto' })
  if (copyRef.value) gsap.fromTo(copyRef.value.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: approvedEase.gsapStandard, overwrite: 'auto' })
  if (bigIndexRef.value) gsap.fromTo(bigIndexRef.value, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: approvedEase.gsapCinematic, overwrite: 'auto' })
})

useGsapContext(() => {
  const mm = gsap.matchMedia()
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (ctx) => {
    if (!(ctx.conditions as { isDesktop: boolean }).isDesktop) return
    const stage = stageRef.value
    if (!stage) return

    const s = { assemble: 0, p: 0 }
    const easeM = gsap.parseEase('power3.inOut')
    const render = () => {
      const seg = Math.min(P - 2, Math.floor(s.p))
      const local = easeM(gsap.utils.clamp(0, 1, s.p - seg))
      const settled = mix(formations[seg]!, formations[seg + 1]!, local)
      place(s.assemble < 1 ? mix(scatter, settled, easeM(s.assemble)) : settled)
      const idx = Math.round(s.p)
      if (idx !== active.value) active.value = idx
    }
    render()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: `+=${(P - 1) * 70}%`,
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        snap: { snapTo: 1 / (P - 1), duration: { min: 0.3, max: 0.7 }, ease: approvedEase.gsapStandard, delay: 0.06 }
      },
      onUpdate: render,
      defaults: { ease: 'none' }
    })
    tl.to(s, { p: P - 1, duration: 1 })
    pinTrigger = tl.scrollTrigger ?? undefined

    const assemble = gsap.to(s, {
      assemble: 1,
      duration: 1.6,
      ease: 'none',
      onUpdate: render,
      scrollTrigger: { trigger: stage, start: 'top 70%', toggleActions: 'play none none reverse' }
    })

    return () => {
      assemble.scrollTrigger?.kill()
      assemble.kill()
      tl.scrollTrigger?.kill()
      tl.kill()
      pinTrigger = undefined
    }
  })

  // No pin: show the first formation at rest in the (hidden) stage.
  mm.add(`${reducedMotionQuery.reduce}, ${breakpointQuery.belowDesktop}`, () => {
    place(formations[0]!)
  })
})
</script>

<template>
  <!-- Desktop stage (pinned). -->
  <div ref="stageRef" data-motion-stage="pinned" class="relative hidden h-[100svh] overflow-hidden desktop:block">
    <!-- Oversized index, cropped by the stage edge (Large Type as Graphic). -->
    <span
      ref="bigIndexRef"
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-[6vw] -left-[1vw] select-none font-display text-[clamp(240px,30vw,520px)] font-bold leading-none tracking-[-0.07em] text-[color:rgba(255,255,255,0.035)]"
      >{{ current.index }}</span
    >

    <BaseContainer class="relative flex h-full flex-col py-12">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-pastiYellow-500">Brand pillars</h3>
        <p class="font-display text-token-body-large font-semibold tabular-nums text-pureWhite">
          {{ current.index }}<span class="text-[color:rgba(255,255,255,0.35)]"> / {{ String(P).padStart(2, '0') }}</span>
        </p>
      </div>

      <div class="grid flex-1 grid-cols-12 items-center gap-8">
        <!-- Copy -->
        <div class="col-span-6">
          <p ref="nameRef" :key="current.name" :aria-label="current.name" class="font-display text-[length:clamp(64px,7.6vw,136px)] font-bold leading-[0.9] tracking-[-0.05em] text-pureWhite">
            <span v-for="(ch, i) in current.name.split('')" :key="i" aria-hidden="true" class="inline-block overflow-hidden align-top"><span data-c class="inline-block">{{ ch }}</span></span><span aria-hidden="true" class="ml-[0.04em] inline-block h-[0.16em] w-[0.16em] rounded-full bg-pastiYellow-500" />
          </p>
          <div ref="copyRef" class="mt-10 grid max-w-xl grid-cols-2 gap-8 border-t border-[color:rgba(255,255,255,0.14)] pt-6">
            <div>
              <p class="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.45)]">Meaning</p>
              <p class="mt-3 text-token-body leading-[1.55] text-pureWhite">{{ current.meaning }}</p>
            </div>
            <div>
              <p class="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.45)]">Visual translation</p>
              <p class="mt-3 text-token-body leading-[1.55] text-[color:rgba(255,255,255,0.65)]">{{ current.visual }}</p>
            </div>
          </div>
        </div>

        <!-- Formation -->
        <div class="relative col-span-6 flex items-center justify-center">
          <svg viewBox="0 0 520 520" class="h-[min(62svh,560px)] w-auto overflow-visible" fill="none" aria-hidden="true">
            <rect x="10" y="10" width="500" height="500" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2 8" />
            <path d="M10 22V10H22M498 10H510V22M510 498V510H498M22 510H10V498" stroke="rgba(251,186,0,0.6)" />
            <path ref="traceRef" stroke="rgba(37,99,235,0.45)" stroke-width="1" :d="toTrace(formations[0]!)" />
            <circle
              v-for="i in N"
              :key="i"
              :ref="(el) => { if (el) nodeRefs[i - 1] = el as unknown as SVGCircleElement }"
              :cx="formations[0]![i - 1]![0]"
              :cy="formations[0]![i - 1]![1]"
              :r="i - 1 === YELLOW ? 8 : 4"
              :fill="i - 1 === YELLOW ? '#FBBA00' : '#FFFFFF'"
              :fill-opacity="i - 1 === YELLOW ? 1 : 0.85"
            />
          </svg>
        </div>
      </div>

      <!-- Pillar rail: jump to any formation. -->
      <nav aria-label="Brand pillars" class="grid grid-cols-5 gap-3">
        <button
          v-for="(p, i) in pillars"
          :key="p.index"
          type="button"
          class="group relative pt-4 text-left"
          @click="jumpTo(i)"
        >
          <span aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-[color:rgba(255,255,255,0.14)]" />
          <span aria-hidden="true" class="absolute left-0 top-0 h-[2px] w-full origin-left bg-pastiYellow-500 transition-transform duration-600 ease-editorial" :class="i === active ? 'scale-x-100' : i < active ? 'scale-x-100 opacity-30' : 'scale-x-0'" />
          <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] transition-colors duration-200" :class="i === active ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.4)] group-hover:text-pureWhite'">{{ p.index }}</span>
          <span class="ml-2 font-display text-token-body font-semibold transition-colors duration-200" :class="i === active ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.4)] group-hover:text-pureWhite'">{{ p.name }}</span>
        </button>
      </nav>
    </BaseContainer>
  </div>

  <!-- Tablet + Mobile + reduced motion: each pillar with its formation. -->
  <div data-motion-stage="simple" class="desktop:hidden">
    <BaseContainer class="py-20">
      <h3 class="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-pastiYellow-500">Brand pillars</h3>
      <ol class="mt-8 flex flex-col gap-12">
        <li v-for="(p, i) in pillars" :key="p.index" class="grid grid-cols-[96px_1fr] gap-5 border-t border-[color:rgba(255,255,255,0.14)] pt-6 sm:grid-cols-[140px_1fr]">
          <svg viewBox="0 0 520 520" class="h-auto w-full" fill="none" aria-hidden="true">
            <path stroke="rgba(37,99,235,0.45)" stroke-width="2" :d="toTrace(formations[i]!)" />
            <circle v-for="(pt, k) in formations[i]" :key="k" :cx="pt[0]" :cy="pt[1]" :r="k === YELLOW ? 16 : 8" :fill="k === YELLOW ? '#FBBA00' : '#FFFFFF'" />
          </svg>
          <div>
            <span class="font-display text-token-metadata font-semibold tabular-nums text-pastiYellow-500">{{ p.index }}</span>
            <p class="mt-1 font-display text-[length:clamp(32px,9vw,56px)] font-bold leading-none tracking-[-0.04em] text-pureWhite">{{ p.name }}</p>
            <p class="mt-3 text-token-body text-[color:rgba(255,255,255,0.8)]">{{ p.meaning }}</p>
            <p class="mt-2 text-body-sm text-[color:rgba(255,255,255,0.5)]">{{ p.visual }}</p>
          </div>
        </li>
      </ol>
    </BaseContainer>
  </div>
</template>
