<script setup lang="ts">
import gsap from 'gsap'

// OPEN HERO — the homepage hero's language (light ground, soft yellow
// atmosphere, marker, CTA pair) with OPEN's ecosystem orbit on the right:
// the brief's 9 flow steps as nodes on one ring, wired to OPEN at the centre
// (a hint of section 03, not its explanation). Bottom: the mental model.
// Perf: glows are plain gradients (no filter blur); the only idle motion is
// one dot travelling the ring, off under reduced motion.
const { name, expansion, positioning, mentalModel, flow } = useOpen()
const { requestDemo, scrollTo } = useOpenDemo()

const rootRef = ref<HTMLElement | null>(null)

const C = 200
const R = 138
const nodes = flow.map((s, i) => {
  const a = ((-90 + i * (360 / flow.length)) * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return {
    ...s,
    x: C + R * cos,
    y: C + R * sin,
    lx: C + (R + 22) * cos,
    ly: C + (R + 22) * sin + 3.5,
    anchor: Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end'
  }
})

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const mm = gsap.matchMedia()
  const letters = root.querySelectorAll<HTMLElement>('[data-oh-letter]')
  const fades = root.querySelectorAll<HTMLElement>('[data-oh-fade]')
  const ring = root.querySelector<SVGCircleElement>('[data-oh-ring]')
  const spokes = root.querySelectorAll<SVGLineElement>('[data-oh-spoke]')
  const dots = root.querySelectorAll<SVGGElement>('[data-oh-node]')
  const mark = root.querySelector<SVGGElement>('[data-oh-centre]')
  const pulse = root.querySelector<SVGGElement>('[data-oh-pulse]')

  mm.add(reducedMotionQuery.noPreference, () => {
    const ringLen = 2 * Math.PI * R
    gsap.set(letters, { yPercent: 110 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    if (ring) gsap.set(ring, { strokeDasharray: ringLen, strokeDashoffset: ringLen })
    spokes.forEach((l) => {
      const len = l.getTotalLength()
      gsap.set(l, { strokeDasharray: len, strokeDashoffset: len })
    })
    gsap.set(dots, { autoAlpha: 0, scale: 0.4, transformOrigin: 'center center', transformBox: 'fill-box' })
    if (mark) gsap.set(mark, { autoAlpha: 0, scale: 0.7, transformOrigin: 'center center', transformBox: 'fill-box' })

    const tl = gsap.timeline({ delay: 0.2 })
    tl.to(letters, { yPercent: 0, duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapPrimary, stagger: 0.06 })
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 }, '-=0.8')
      .to(ring ?? {}, { strokeDashoffset: 0, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.3)
      .to(dots, { autoAlpha: 1, scale: 1, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.06 }, 0.6)
      .to(spokes, { strokeDashoffset: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.05 }, 1.0)
      .to(mark ?? {}, { autoAlpha: 1, scale: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary }, 1.3)

    // One signal travelling the ring — the ecosystem in motion, not a spinner.
    const orbit = pulse ? gsap.to(pulse, { rotation: 360, svgOrigin: `${C} ${C}`, duration: 26, ease: 'none', repeat: -1 }) : null

    return () => {
      tl.kill()
      orbit?.kill()
    }
  })
})
</script>

<template>
  <section ref="rootRef" class="surface-light relative isolate overflow-hidden pb-12 pt-28 desktop:flex desktop:min-h-[100svh] desktop:flex-col desktop:pb-10 desktop:pt-32" style="--lift-x: 80%; --lift-y: 30%">
    <BaseGridLines tone="light" />
    <!-- Soft yellow atmosphere (gradients only) -->
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -right-[12%] -top-[18%] -z-10 h-[70vw] max-h-[900px] w-[70vw] max-w-[900px]" />
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -bottom-[30%] -left-[18%] -z-10 h-[50vw] max-h-[620px] w-[50vw] max-w-[620px] opacity-70" />

    <BaseContainer class="relative z-10 flex flex-1 flex-col desktop:justify-center">
      <div class="grid items-center gap-12 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-6">
          <div data-oh-fade><BaseHeroMarker label="OPEN by PASTI" :meta="`${flow.length} connected steps`" /></div>

          <h1 class="mt-6 desktop:mt-[3svh]">
            <span class="sr-only">{{ name }} — {{ expansion }}</span>
            <span aria-hidden="true" class="m-center-row flex items-center gap-[0.14em] font-display text-[length:clamp(84px,24vw,124px)] font-extrabold leading-[0.86] tracking-[-0.05em] text-slateNavy desktop:text-[length:clamp(104px,min(11.5vw,20svh),190px)]">
              <span class="oh-mask"><span data-oh-letter class="inline-block"><OpenMark class="h-[0.72em] w-[0.72em]" /></span></span>
              <span class="oh-mask"><span v-for="(l, i) in name.split('')" :key="i" data-oh-letter class="inline-block">{{ l }}</span></span>
            </span>
            <span aria-hidden="true" class="oh-mask mt-3 block"><span data-oh-letter class="block font-display text-[length:clamp(18px,4.6vw,24px)] font-bold italic tracking-[-0.01em] text-slateNavy desktop:text-[length:clamp(22px,1.8vw,28px)]">{{ expansion }}</span></span>
          </h1>

          <p data-oh-fade class="hero-lede m-center mt-6 max-w-[33rem] desktop:mt-[3svh]">{{ positioning }}</p>

          <div data-oh-fade class="mt-8 desktop:mt-[4svh]">
            <BaseHeroCtas
              :primary="{ label: 'Request Demo' }"
              :secondary="{ label: 'Explore the ecosystem', down: true }"
              @primary="requestDemo()"
              @secondary="scrollTo('ecosystem')"
            />
          </div>
        </div>

        <!-- Ecosystem orbit -->
        <div data-oh-fade class="mx-auto w-full max-w-[360px] tablet:max-w-[440px] desktop:col-span-6 desktop:max-w-[560px] desktop:justify-self-end">
          <svg viewBox="-70 -6 540 412" class="h-auto w-full overflow-visible" role="img" :aria-label="`OPEN connects ${flow.length} procurement steps: ${flow.map((s) => s.label).join(', ')}`">
            <circle cx="200" cy="200" :r="R + 44" stroke="rgba(3,60,89,0.08)" stroke-dasharray="2 6" fill="none" />
            <line v-for="n in nodes" :key="`s${n.index}`" data-oh-spoke :x1="n.x" :y1="n.y" x2="200" y2="200" stroke="rgba(3,60,89,0.16)" stroke-width="1" />
            <circle data-oh-ring cx="200" cy="200" :r="R" stroke="#033C59" stroke-width="1.5" fill="none" />
            <g data-oh-pulse>
              <circle cx="200" :cy="200 - R" r="5" fill="#FBBA00" />
              <circle cx="200" :cy="200 - R" r="11" fill="rgba(251,186,0,0.22)" />
            </g>
            <g v-for="n in nodes" :key="n.index" data-oh-node>
              <circle :cx="n.x" :cy="n.y" r="7" fill="#fff" stroke="#033C59" stroke-width="1.5" />
              <text :x="n.lx" :y="n.ly" :text-anchor="n.anchor" class="fill-slateNavy font-mono text-[10.5px] font-medium tracking-[0.02em]">{{ n.label }}</text>
            </g>
            <g data-oh-centre>
              <circle cx="200" cy="200" r="58" fill="#033C59" />
              <circle cx="200" cy="200" r="34" stroke="#FBBA00" stroke-width="6" fill="none" />
              <path d="M186 201l10 10 18-20" stroke="#FBBA00" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </g>
          </svg>
        </div>
      </div>

      <!-- Mental model strip (brief §1) -->
      <div data-oh-fade class="mt-12 grid gap-4 border-t border-[color:rgba(3,60,89,0.14)] pt-6 desktop:mt-[5svh] desktop:grid-cols-12 desktop:gap-8">
        <p class="m-center font-display text-[17px] font-semibold leading-snug text-[color:rgba(3,60,89,0.55)] desktop:col-span-5 desktop:text-[19px]">{{ mentalModel.digitizes }}</p>
        <p class="m-center flex flex-col items-center gap-2 font-display text-[17px] font-bold leading-snug text-slateNavy desktop:col-span-6 desktop:col-start-7 desktop:flex-row desktop:items-start desktop:gap-3 desktop:text-[19px]">
          <OpenMark :size="22" class="mt-[2px] shrink-0" />{{ mentalModel.connects }}
        </p>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.oh-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  margin: -0.1em -0.04em;
  padding: 0.1em 0.04em;
}
</style>
