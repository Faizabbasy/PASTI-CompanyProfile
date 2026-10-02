<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// OWNER-DIRECTED ADDITION (2026-09-30) — "Who We Are" + Trusted Partner card.
// Approved exceptions to docs/rework-v2 (flagged, not silently resolved):
//   - Adds a 10th homepage section between What We Build and Trusted
//     (04-homepage-spec.md locks 9). Trusted itself stays untouched (§4 lock);
//     the Trusted Partner card lives HERE, as this section's closing band.
//   - Shows 200+ / 130+ — figures supplied and confirmed verified by the owner.
//   - Uses PASTI Yellow (pastiYellow-500, docs HEX still pending) as accent
//     only: marker bar, orbit dot, "+" marks, CTA fill. Never text on white.
//   - Portraits are placeholders (public/images/people/) until real photos land.
// Motion: Controlled Momentum eases only; own reveal language (orbit rings
// draw → portraits iris open → medallion lands), no pin, content final under
// reduced motion.
const { eyebrow, heading, body, facts, portraits, clientStat, cta } = useWhoWeAre()
const { link: whatsappLink } = useWhatsapp()

const beforeWords = heading.before.split(' ')
const afterWords = heading.after.split(' ')

const sectionRef = ref<HTMLElement | null>(null)
const constellationRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const copyRef = ref<HTMLElement | null>(null)
const statRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const hovered = ref<number | null>(null)

// Constellation layout — mirrors the owner's reference composition
// (650x540 box): large / medium / small circles around the client medallion.
// The medallion must keep covering the same overlap as in the reference —
// the cropped photos have that area filled with background grey.
const layout = [
  { wrap: 'left-[41.7%] top-0 w-[58.5%]', tag: 'right-[4%] bottom-[6%]', depth: 0.6 },
  { wrap: 'left-0 top-[29.1%] w-[38.5%]', tag: 'left-[2%] -top-[4%]', depth: 1 },
  { wrap: 'left-[36.2%] top-[70%] w-[21.1%]', tag: 'left-[92%] top-[42%]', depth: 1.5 }
]
const wrapRefs = layout.map(() => ref<HTMLElement | null>(null))
const layerRefs = layout.map(() => ref<HTMLElement | null>(null))

useCountUp(statRef, { value: clientStat.value, duration: 2 })
useMagnetic(ctaRef, { strength: 0.3 })
useDepthParallax(wrapRefs[0]!, 'back')
useDepthParallax(wrapRefs[1]!, 'mid')

useGsapContext(() => {
  const section = sectionRef.value
  const constellation = constellationRef.value
  const headingEl = headingRef.value
  const copy = copyRef.value
  if (!section || !constellation || !headingEl || !copy) return

  const rings = constellation.querySelectorAll<SVGCircleElement>('[data-ring]')
  const frames = constellation.querySelectorAll<HTMLElement>('[data-frame]')
  const frameImgs = constellation.querySelectorAll<HTMLElement>('[data-frame] img')
  const tags = constellation.querySelectorAll<HTMLElement>('[data-tag]')
  const medallion = constellation.querySelector<HTMLElement>('[data-medallion]')
  const medallionArc = constellation.querySelector<SVGCircleElement>('[data-medallion-arc]')
  const orbits = constellation.querySelectorAll<HTMLElement>('[data-orbit]')
  const words = headingEl.querySelectorAll<HTMLElement>('[data-word]')
  const marker = headingEl.querySelector<HTMLElement>('[data-marker]')
  const copyItems = copy.querySelectorAll<HTMLElement>('[data-copy-item]')
  const factRules = copy.querySelectorAll<HTMLElement>('[data-fact-rule]')

  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(rings, { strokeDashoffset: 0 })
    gsap.set(frames, { clipPath: 'none' })
    gsap.set([...tags, ...orbits, ...copyItems, medallion].filter(Boolean), { autoAlpha: 1, x: 0, scale: 1 })
    gsap.set(words, { yPercent: 0 })
    gsap.set([marker, ...factRules].filter(Boolean), { scaleX: 1 })
    gsap.set(frameImgs, { filter: 'grayscale(0)' })
    if (medallionArc) gsap.set(medallionArc, { strokeDashoffset: 0.3 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rings, { strokeDashoffset: 1 })
    gsap.set(frames, { clipPath: 'circle(0% at 50% 50%)' })
    gsap.set(frameImgs, { scale: 1.3, filter: 'grayscale(1)' })
    if (medallionArc) gsap.set(medallionArc, { strokeDashoffset: 1 })
    gsap.set(medallion, { autoAlpha: 0, scale: 0.55 })
    gsap.set(tags, { autoAlpha: 0, x: -14 })
    gsap.set(orbits, { autoAlpha: 0 })
    gsap.set(words, { yPercent: 115 })
    gsap.set(marker, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(copyItems, { autoAlpha: 0, x: -24 })
    gsap.set(factRules, { scaleX: 0, transformOrigin: 'left center' })

    const constTl = gsap.timeline({ scrollTrigger: { trigger: constellation, start: 'top 78%', once: true } })
    constTl
      .to(rings, { strokeDashoffset: 0, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic, stagger: 0.14 })
      .to(frames, { clipPath: 'circle(72% at 50% 50%)', duration: motionTier.cinematicMax * 0.85, ease: approvedEase.gsapCinematic, stagger: 0.13 }, 0.25)
      .to(frameImgs, { scale: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic, stagger: 0.13 }, '<')
      // Colour arrives after the iris opens — the people "come alive".
      .to(frameImgs, { filter: 'grayscale(0)', duration: motionTier.cinematicMax, ease: approvedEase.gsapStandard, stagger: 0.13 }, '<0.35')
      .to(medallion, { autoAlpha: 1, scale: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary }, 0.75)
      .to(medallionArc, { strokeDashoffset: 0.3, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, '<0.2')
      .to(orbits, { autoAlpha: 1, duration: motionTier.standardMax, ease: approvedEase.gsapStandard }, '<0.2')
      .to(tags, { autoAlpha: 1, x: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.08 }, '<')

    const copyTl = gsap.timeline({ scrollTrigger: { trigger: headingEl, start: 'top 82%', once: true } })
    copyTl
      .to(words, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.06 })
      .to(marker, { scaleX: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary }, '-=0.35')
      .to(copyItems, { autoAlpha: 1, x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, '-=0.5')
      .to(factRules, { scaleX: 1, duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapCinematic, stagger: 0.1 }, '<0.1')

    // Orbiting brand dots — linear loops, paused whenever the section is off-screen.
    const loops = [...orbits].map((orbit, i) =>
      gsap.to(orbit, { rotation: i % 2 ? -360 : 360, duration: i % 2 ? 54 : 34, ease: 'none', repeat: -1, paused: true })
    )
    const visibility = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause()))
    })

    return () => {
      constTl.kill()
      copyTl.kill()
      loops.forEach((loop) => loop.kill())
      visibility.kill()
    }
  })

  // Desktop + fine pointer: the constellation drifts with the pointer, each
  // circle by its own depth so the cluster reads as layered space.
  mm.add(`${breakpointQuery.desktopUp} and (pointer: fine) and ${reducedMotionQuery.noPreference}`, () => {
    const movers = layerRefs
      .map((layerRef, i) => ({ el: layerRef.value, depth: layout[i]!.depth }))
      .filter((m): m is { el: HTMLElement; depth: number } => !!m.el)
      .map(({ el, depth }) => ({
        depth,
        x: gsap.quickTo(el, 'x', { duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard }),
        y: gsap.quickTo(el, 'y', { duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard })
      }))

    const handleMove = (event: PointerEvent) => {
      const rect = constellation.getBoundingClientRect()
      const relX = (event.clientX - (rect.left + rect.width / 2)) / rect.width
      const relY = (event.clientY - (rect.top + rect.height / 2)) / rect.height
      movers.forEach((m) => {
        m.x(relX * 26 * m.depth)
        m.y(relY * 26 * m.depth)
      })
    }
    const handleLeave = () => movers.forEach((m) => { m.x(0); m.y(0) })

    section.addEventListener('pointermove', handleMove)
    section.addEventListener('pointerleave', handleLeave)
    return () => {
      section.removeEventListener('pointermove', handleMove)
      section.removeEventListener('pointerleave', handleLeave)
    }
  })
})
</script>

<template>
  <section ref="sectionRef" class="section surface-light relative overflow-hidden" style="--lift-x: 8%; --lift-y: 30%">
    <BaseGridLines tone="light" />
    <!-- Ghost PASTI wordmark, cropped by the section edge (same ~3% texture device as Trusted). -->
    <img
      src="/images/pasti-logo.png"
      alt=""
      aria-hidden="true"
      draggable="false"
      class="pointer-events-none absolute -left-[10%] top-[4%] z-0 w-auto max-w-none select-none opacity-[0.035] grayscale"
      style="height: clamp(180px, 30vw, 460px); -webkit-mask-image: radial-gradient(ellipse 5.6% 12.6% at 92.5% 20%, transparent 99%, #000 100%); mask-image: radial-gradient(ellipse 5.6% 12.6% at 92.5% 20%, transparent 99%, #000 100%)"
    />

    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="PASTI People" meta="04 / 11" />

      <div class="mt-14 grid items-center gap-16 desktop:mt-20 desktop:grid-cols-12 desktop:gap-8">
        <!-- Portrait constellation -->
        <div class="desktop:col-span-6">
          <div ref="constellationRef" class="relative mx-auto aspect-[650/540] w-full max-w-[640px]" @mouseleave="hovered = null">
            <svg aria-hidden="true" viewBox="0 0 100 100" class="absolute inset-0 h-full w-full overflow-visible">
              <circle data-ring cx="50" cy="50" r="49" fill="none" stroke="rgba(3,60,89,0.16)" vector-effect="non-scaling-stroke" pathLength="1" stroke-dasharray="1" transform="rotate(-90 50 50)" />
              <circle data-ring cx="50" cy="50" r="36" fill="none" stroke="rgba(3, 60, 89,0.28)" vector-effect="non-scaling-stroke" pathLength="1" stroke-dasharray="1" transform="rotate(-90 50 50)" />
              <circle data-ring cx="50" cy="50" r="23" fill="none" stroke="rgba(3,60,89,0.1)" vector-effect="non-scaling-stroke" pathLength="1" stroke-dasharray="1" transform="rotate(-90 50 50)" />
            </svg>

            <!-- Orbiting dots: PASTI Yellow (the logo's own dot) on the outer ring, Cobalt on the inner. -->
            <div data-orbit aria-hidden="true" class="pointer-events-none absolute inset-0">
              <span class="absolute left-1/2 top-[1%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pastiYellow-500 shadow-[0_0_0_6px_rgba(251,186,0,0.18)]" />
            </div>
            <div data-orbit aria-hidden="true" class="pointer-events-none absolute inset-[14%]">
              <span class="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-cobalt" />
            </div>

            <div
              v-for="(portrait, i) in portraits"
              :key="portrait.src"
              :ref="(el) => { wrapRefs[i]!.value = el as HTMLElement | null }"
              class="absolute"
              :class="layout[i]!.wrap"
            >
              <div :ref="(el) => { layerRefs[i]!.value = el as HTMLElement | null }" class="relative">
                <figure
                  data-frame
                  class="group/frame relative aspect-square overflow-hidden rounded-full border-[5px] border-pureWhite bg-[#f2f2f2] shadow-[0_30px_80px_-30px_rgba(3,60,89,0.45)] transition-[transform,opacity] duration-600 ease-editorial"
                  :class="[
                    hovered === i ? 'scale-[1.04]' : '',
                    hovered !== null && hovered !== i ? 'opacity-60' : ''
                  ]"
                  @mouseenter="hovered = i"
                >
                  <span class="block h-full w-full transition-transform duration-700 ease-editorial group-hover/frame:scale-[1.06]"><img :src="portrait.src" :alt="portrait.alt" class="h-full w-full object-cover" loading="lazy" draggable="false" /></span>
                </figure>
                <span
                  data-tag
                  class="absolute z-10 hidden items-center gap-2 whitespace-nowrap rounded-full bg-pureWhite py-1.5 pl-2.5 pr-3 shadow-[0_10px_30px_-12px_rgba(3,60,89,0.35)] tablet:inline-flex"
                  :class="layout[i]!.tag"
                >
                  <LayoutBrandMark surface="light" :height="10" />
                  <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-slateNavy">{{ portrait.tag }}</span>
                </span>
              </div>
            </div>

            <!-- Client medallion -->
            <div
              data-medallion
              class="absolute left-[31.3%] top-[35.6%] z-20 grid aspect-square w-[30.8%] place-items-center rounded-full border-[6px] border-pureWhite bg-slateNavy text-center shadow-[0_30px_70px_-25px_rgba(3,60,89,0.7)]"
            >
              <!-- PASTI Yellow progress arc — draws once on reveal, then rests. -->
              <svg aria-hidden="true" viewBox="0 0 100 100" class="pointer-events-none absolute -inset-[14px] -rotate-90">
                <circle data-medallion-arc cx="50" cy="50" r="48.5" fill="none" stroke="#FBBA00" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0.3" vector-effect="non-scaling-stroke" style="stroke-width: 3px" />
              </svg>
              <div class="flex flex-col items-center">
                <p class="flex items-start font-display text-[clamp(30px,4vw,52px)] font-extrabold leading-none tracking-[-0.04em] text-pureWhite tabular-nums">
                  <span ref="statRef">{{ clientStat.value }}</span><span class="text-[0.6em] text-pastiYellow-500">{{ clientStat.suffix }}</span>
                </p>
                <p class="mt-1.5 font-display text-[clamp(10px,1vw,13px)] text-[color:rgba(255,255,255,0.72)]">{{ clientStat.label }}</p>
                <LayoutBrandMark surface="dark" :height="9" class="mt-2.5 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        <!-- Copy -->
        <div ref="copyRef" class="m-center desktop:col-span-5 desktop:col-start-8">
          <p data-copy-item class="m-center-row flex items-center gap-3 font-display text-token-metadata font-semibold uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">
            <span class="h-px w-8 bg-cobalt" />{{ eyebrow }}
          </p>

          <h2 ref="headingRef" class="relative isolate mt-6 font-display text-token-h2 font-extrabold text-slateNavy">
            <template v-for="w in beforeWords" :key="`b-${w}`"><span class="wwa-mask"><span data-word class="inline-block">{{ w }}</span></span>{{ ' ' }}</template>
            <span class="relative inline-block">
              <span data-marker aria-hidden="true" class="absolute -inset-x-[0.06em] bottom-[0.1em] -z-10 h-[0.42em] rounded-[3px] bg-pastiYellow-500" />
              <span class="wwa-mask"><span data-word class="inline-block">{{ heading.highlight }}</span></span>
            </span>{{ ' ' }}
            <template v-for="w in afterWords" :key="`a-${w}`"><span class="wwa-mask"><span data-word class="inline-block">{{ w }}</span></span>{{ ' ' }}</template>
          </h2>

          <p data-copy-item class="mt-7 max-w-[46ch] text-token-body-large text-[color:rgba(3,60,89,0.72)]">{{ body }}</p>

          <dl class="mt-10 grid grid-cols-1 gap-5 tablet:grid-cols-3 tablet:gap-4">
            <div v-for="fact in facts" :key="fact.label" class="relative pt-4">
              <span data-fact-rule aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-[color:rgba(3,60,89,0.18)]" />
              <dt data-copy-item class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">{{ fact.label }}</dt>
              <dd data-copy-item class="mt-1.5 font-display text-[14px] font-semibold leading-snug text-slateNavy">{{ fact.value }}</dd>
            </div>
          </dl>

          <div data-copy-item class="m-center-row mt-10 flex items-center gap-6">
            <div ref="ctaRef" class="inline-block">
              <a
                :href="whatsappLink"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative flex items-center gap-5 overflow-hidden rounded-[14px] bg-slateNavy py-3 pl-6 pr-3 font-display text-[15px] font-bold text-pureWhite"
              >
                <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-navy-900 transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
                <span class="relative z-10">{{ cta.label }}</span>
                <span class="relative z-10 grid h-10 w-10 place-items-center rounded-[10px] bg-pastiYellow-500 text-slateNavy transition-transform duration-300 ease-editorial group-hover:rotate-[-45deg]">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </span>
              </a>
            </div>
            <LayoutBrandMark surface="light" :height="13" class="opacity-70" />
          </div>
        </div>
      </div>
    </BaseContainer>

    <BaseContainer class="relative z-10 mt-24 desktop:mt-32">
      <HomeTrustedPartnerCard />
    </BaseContainer>
  </section>
</template>

<style scoped>
/* Same descender-safe mask trick as useMaskedReveal (negative margin / padding). */
.wwa-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  margin: -0.2em;
  padding: 0.2em;
}
</style>
