<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// TECHNOLOGY × CREATIVE — the positioning as a diagram. Two large rings
// start apart and slide together with the scroll; their intersection fills
// PASTI Yellow and the PASTI mark appears in it ("never only a software
// house, only a creative agency, or only a consultancy" — brand guide §01).
// The rings lean toward the pointer on desktop. Proof numbers (owner-verified,
// shared with the homepage) count up beside it.
const { positioning, stats, coreEmotion } = useAbout()

const sectionRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const statEls = stats.map(() => ref<HTMLElement | null>(null))
stats.forEach((s, i) => useCountUp(statEls[i]!, { value: s.value, duration: 2 }))

// viewBox 0 0 600 400; ring radius 150; apart cx 170/430 → together 245/355.
const R = 150

useGsapContext(() => {
  const section = sectionRef.value
  const svg = svgRef.value
  if (!section || !svg) return
  const a = svg.querySelectorAll<SVGCircleElement>('[data-vn-a]')
  const b = svg.querySelectorAll<SVGCircleElement>('[data-vn-b]')
  const lens = svg.querySelector<SVGGElement>('[data-vn-lens]')
  const mark = section.querySelector<HTMLElement>('[data-vn-mark]')
  const labels = svg.querySelectorAll<SVGTextElement>('[data-vn-label]')
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(a, { attr: { cx: 245 } })
    gsap.set(b, { attr: { cx: 355 } })
    gsap.set([lens, mark], { autoAlpha: 1, scale: 1 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(a, { attr: { cx: 150 } })
    gsap.set(b, { attr: { cx: 450 } })
    gsap.set(lens, { autoAlpha: 0 })
    gsap.set(mark, { autoAlpha: 0, scale: 0.6 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top 75%', end: 'center 45%', scrub: 0.6 } })
    tl.to(a, { attr: { cx: 245 } }, 0)
      .to(b, { attr: { cx: 355 } }, 0)
      .to(lens, { autoAlpha: 1, duration: 0.4 }, 0.55)
      .to(mark, { autoAlpha: 1, scale: 1, duration: 0.3 }, 0.7)
      .fromTo(labels, { letterSpacing: '0.5em' }, { letterSpacing: '0.2em' }, 0)

    // Pointer lean (fine pointer only).
    let off = () => {}
    if (window.matchMedia('(pointer: fine)').matches) {
      const q = gsap.quickTo(svg, 'rotationY', { duration: 0.9, ease: approvedEase.gsapStandard })
      const qx = gsap.quickTo(svg, 'rotationX', { duration: 0.9, ease: approvedEase.gsapStandard })
      const onMove = (e: PointerEvent) => {
        const r = section.getBoundingClientRect()
        q(((e.clientX - r.left) / r.width - 0.5) * 14)
        qx(-((e.clientY - r.top) / r.height - 0.5) * 10)
      }
      section.addEventListener('pointermove', onMove)
      off = () => section.removeEventListener('pointermove', onMove)
    }
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      off()
    }
  })
})
</script>

<template>
  <section ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Positioning" meta="Technology × Creative" />

      <div class="mt-14 grid items-center gap-14 desktop:mt-20 desktop:grid-cols-12 desktop:gap-8">
        <!-- Diagram -->
        <div class="desktop:col-span-7" style="perspective: 1200px">
          <div class="relative mx-auto aspect-[3/2] w-full max-w-[720px]">
            <svg ref="svgRef" viewBox="0 0 600 400" class="absolute inset-0 h-full w-full overflow-visible" style="transform-style: preserve-3d" aria-hidden="true">
              <defs>
                <clipPath id="vn-clip"><circle data-vn-a cx="245" cy="200" :r="R" /></clipPath>
              </defs>
              <g data-vn-lens>
                <circle data-vn-b cx="355" cy="200" :r="R" fill="#FBBA00" clip-path="url(#vn-clip)" />
              </g>
              <circle data-vn-a cx="245" cy="200" :r="R" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" />
              <circle data-vn-b cx="355" cy="200" :r="R" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" />
              <circle data-vn-a cx="245" cy="200" :r="R + 18" fill="none" stroke="rgba(255,255,255,0.12)" stroke-dasharray="2 8" />
              <circle data-vn-b cx="355" cy="200" :r="R + 18" fill="none" stroke="rgba(255,255,255,0.12)" stroke-dasharray="2 8" />
              <text data-vn-label x="95" y="40" fill="#fff" font-size="15" font-weight="700" letter-spacing="0.2em" font-family="var(--font-mono)">TECHNOLOGY</text>
              <text data-vn-label x="505" y="40" text-anchor="end" fill="#fff" font-size="15" font-weight="700" letter-spacing="0.2em" font-family="var(--font-mono)">CREATIVE</text>
            </svg>
            <!-- PASTI mark in the intersection -->
            <div data-vn-mark class="pointer-events-none absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span class="grid h-[clamp(64px,8vw,96px)] w-[clamp(64px,8vw,96px)] place-items-center rounded-full bg-slateNavy shadow-[0_20px_40px_-12px_rgba(0,10,18,0.6)]">
                <LayoutBrandMark surface="dark" :height="18" />
              </span>
            </div>
          </div>
        </div>

        <!-- Copy + proof -->
        <div class="m-center desktop:col-span-5">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.55)]">Where PASTI sits</p>
          <h2 class="mt-4 font-display text-[length:clamp(36px,4.4vw,68px)] font-extrabold leading-[0.98] tracking-[-0.04em] text-pureWhite">
            {{ positioning.split('×')[0] }}<span class="text-pastiYellow-500">×</span>{{ positioning.split('×')[1] }}
          </h2>
          <p class="mt-5 max-w-[44ch] text-token-body text-[color:rgba(255,255,255,0.7)]">
            Never only a software house, never only a creative agency, never only a consultancy — PASTI sits between technology, product, creative and business execution.
          </p>

          <dl class="mt-10 grid grid-cols-2 gap-6 border-t border-[color:rgba(255,255,255,0.14)] pt-8">
            <div v-for="(s, i) in stats" :key="s.label" class="m-center-col flex flex-col-reverse">
              <dt class="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">{{ s.label }}</dt>
              <dd class="m-center-row flex items-start font-display text-[clamp(48px,5vw,80px)] font-extrabold leading-none tracking-[-0.05em] text-pureWhite">
                <span :ref="(el) => { statEls[i]!.value = el as HTMLElement | null }">{{ s.value }}</span><span class="text-[0.5em] text-pastiYellow-500">{{ s.suffix }}</span>
              </dd>
            </div>
          </dl>

          <p class="m-center-row mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-[15px] font-semibold text-[color:rgba(255,255,255,0.75)]">
            <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.45)]">Core emotion</span>
            <template v-for="(e, i) in coreEmotion" :key="e">
              <span v-if="i" aria-hidden="true" class="text-pastiYellow-500">+</span>{{ e }}
            </template>
          </p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
