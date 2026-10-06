<script setup lang="ts">
import gsap from 'gsap'

// e-CORPORATE HERO — "blueprint" signature: dot grid, registration marks and
// an outlined e-CORPORATE wordmark cropped by the bottom edge. H1 is the
// brief's headline as three lines; each noun is live — hovering or focusing
// "people / processes / information" lights the matching region of the
// operating surface (EcorpSurface `focus`), so headline and product read as
// one statement. Desktop + fine pointer: the surface tilts a few degrees
// toward the cursor (two quickTo transforms, no layout).
// Lede = confirmed short positioning. Perf: no glow, no filters.
const { short, heroLines, category } = useEcorporate()
const scrollTo = useEcorpScroll()

type Focus = 'people' | 'processes' | 'information'
const focus = ref<Focus | null>(null)
const setFocus = (w: string | null) => (focus.value = w as Focus | null)
const toggleFocus = (w: string) => setFocus(focus.value === w ? null : w)

const rootRef = ref<HTMLElement | null>(null)
const tiltRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const mm = gsap.matchMedia()
  const lines = root.querySelectorAll<HTMLElement>('[data-eh-word]')
  const fades = root.querySelectorAll<HTMLElement>('[data-eh-fade]')
  const surface = root.querySelector<HTMLElement>('[data-eh-surface]')
  const outline = root.querySelector<HTMLElement>('[data-eh-outline]')

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lines, { yPercent: 110 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    gsap.set(surface, { autoAlpha: 0, y: 40 })
    gsap.set(outline, { yPercent: 40, autoAlpha: 0 })
    const tl = gsap.timeline({ delay: 0.2 })
    tl.to(lines, { yPercent: 0, duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapPrimary, stagger: 0.09 })
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 }, 0.35)
      .to(surface, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapCinematic }, 0.45)
      .to(outline, { yPercent: 0, autoAlpha: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.3)

    // The outline wordmark drifts up slower than the page as you leave.
    const drift = outline ? gsap.to(outline, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } }) : null
    return () => {
      tl.kill()
      drift?.scrollTrigger?.kill()
      drift?.kill()
    }
  })

  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp} and (pointer: fine)`, () => {
    const tilt = tiltRef.value
    if (!tilt) return
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: approvedEase.gsapStandard })
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: approvedEase.gsapStandard })
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 7)
      rx(-((e.clientY - r.top) / r.height - 0.5) * 5)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      gsap.set(tilt, { clearProps: 'transform' })
    }
  })
})
</script>

<template>
  <section ref="rootRef" class="surface-light relative isolate overflow-hidden pb-28 pt-28 desktop:flex desktop:min-h-[100svh] desktop:flex-col desktop:pb-[16svh] desktop:pt-32" style="--lift-x: 82%; --lift-y: 20%">
    <div aria-hidden="true" class="ec-dots pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_45%,#000_20%,transparent_75%)]" />
    <BaseGridLines tone="light" edge="bottom" />
    <EcorpMarks label="00 / 12 · Enterprise digital platform" />

    <!-- Outline wordmark, cropped by the bottom edge -->
    <div aria-hidden="true" data-eh-outline class="pointer-events-none absolute inset-x-0 -bottom-[3vw] z-0 flex justify-center">
      <span class="ec-outline text-[length:clamp(84px,19vw,300px)]">e-CORPORATE</span>
    </div>

    <BaseContainer class="relative z-10 flex flex-1 flex-col desktop:justify-center">
      <div class="grid items-center gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-6">
          <div data-eh-fade><BaseHeroMarker label="e-CORPORATE" :meta="category" /></div>

          <h1 class="mt-6 font-display text-[length:clamp(28px,8vw,56px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-slateNavy desktop:mt-[3svh] desktop:text-[length:clamp(42px,min(4.1vw,8.6svh),66px)]" @mouseleave="focus = null">
            <span class="sr-only">e-CORPORATE, {{ category }}: </span>
            <span v-for="(w, i) in heroLines" :key="w" class="block overflow-hidden pb-[0.06em]">
              <span data-eh-word class="block">
                <span class="text-[color:rgba(3,60,89,0.4)]">Connect </span><span
                  class="relative inline-block cursor-default transition-colors duration-300"
                  :class="focus && focus !== w ? 'text-[color:rgba(3,60,89,0.35)]' : ''"
                  @mouseenter="setFocus(w)"
                >{{ w }}<span
                  aria-hidden="true"
                  class="absolute inset-x-0 -bottom-[0.02em] h-[0.07em] min-h-[3px] origin-left bg-pastiYellow-500 transition-transform duration-500 ease-editorial"
                  :class="focus === w || (!focus && i === heroLines.length - 1) ? 'scale-x-100' : 'scale-x-0'"
                /></span><span class="text-pastiYellow-500">.</span>
              </span>
            </span>
          </h1>

          <!-- Keyboard / touch access to the same highlight (tablet+) -->
          <div data-eh-fade class="m-center-row mt-5 hidden items-center gap-1 tablet:flex" role="group" aria-label="Highlight in the workspace">
            <span class="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">Show</span>
            <button
              v-for="w in heroLines"
              :key="w"
              type="button"
              class="h-8 border px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
              :class="focus === w ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.2)] text-slateNavy hover:border-slateNavy'"
              :aria-pressed="focus === w"
              @click="toggleFocus(w)"
            >{{ w }}</button>
          </div>

          <p data-eh-fade class="hero-lede m-center mt-6 max-w-[34rem] desktop:mt-[3svh]">{{ short }}</p>

          <div data-eh-fade class="mt-8 desktop:mt-[4svh]">
            <BaseHeroCtas
              :primary="{ label: 'Request a Demo' }"
              :secondary="{ label: 'Explore Platform', down: true }"
              @primary="scrollTo('demo')"
              @secondary="scrollTo('overview')"
            />
          </div>
        </div>

        <div data-eh-surface class="desktop:col-span-6 desktop:pl-6" style="perspective: 1400px">
          <div ref="tiltRef" style="transform-style: preserve-3d">
            <EcorpSurface :focus="focus" />
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
