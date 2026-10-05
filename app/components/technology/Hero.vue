<script setup lang="ts">
import gsap from 'gsap'

// TECHNOLOGY HERO — "engineering console", on the shared page-hero system
// (2026-10-05: title scale, marker and CTAs shared with the homepage hero;
// the dark Slate Navy stage is kept by owner decision). The interactive
// Signal lattice fills the stage; the approved heading sits left as three masked lines with "forward."
// on the yellow marker; a glass console card types each real service name in
// turn. Entrance plays on mount.
const { eyebrow, heading, introBody, services } = useTechnology()
const { link: whatsappLink } = useWhatsapp()

// "Technology built to move business forward." → three editorial lines.
const words = heading.replace(/\.$/, '').split(' ')
const lines = [words.slice(0, 2), words.slice(2, 5), words.slice(5)]

const rootRef = ref<HTMLElement | null>(null)
const typedRef = ref<HTMLElement | null>(null)

const scrollToCapabilities = () => {
  const el = document.getElementById('capabilities')
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const mm = gsap.matchMedia()
  const lineEls = root.querySelectorAll<HTMLElement>('[data-th-word]')
  const fades = root.querySelectorAll<HTMLElement>('[data-th-fade]')
  const marker = root.querySelector<HTMLElement>('[data-th-marker]')
  const typed = typedRef.value

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(lineEls, { yPercent: 0 })
    gsap.set(fades, { autoAlpha: 1, y: 0 })
    if (marker) gsap.set(marker, { scaleX: 1 })
    if (typed) typed.textContent = services[0]?.title ?? ''
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lineEls, { yPercent: 118 })
    gsap.set(fades, { autoAlpha: 0, y: 18 })
    if (marker) gsap.set(marker, { scaleX: 0 })

    const intro = gsap.timeline({ delay: 0.25 })
    intro
      .to(lineEls, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.07 })
      .to(marker ?? {}, { scaleX: 1, duration: motionTier.standardMax, ease: approvedEase.gsapCinematic }, '-=0.5')
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, '-=1.1')

    // Terminal readout: type → hold → delete → next service, forever.
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const wait = (ms: number) => new Promise<void>((resolve) => { timer = setTimeout(resolve, ms) })
    const run = async () => {
      await wait(1400)
      let i = 0
      while (!cancelled && typed) {
        const text = services[i % services.length]!.title
        for (let c = 1; c <= text.length && !cancelled; c++) {
          typed.textContent = text.slice(0, c)
          await wait(38)
        }
        await wait(1500)
        for (let c = text.length; c >= 0 && !cancelled; c--) {
          typed.textContent = text.slice(0, c)
          await wait(18)
        }
        await wait(260)
        i++
      }
    }
    run()

    return () => {
      cancelled = true
      clearTimeout(timer)
      intro.kill()
    }
  })
})
</script>

<template>
  <section
    ref="rootRef"
    data-header-theme="dark"
    class="relative isolate flex flex-col overflow-hidden bg-slateNavy pb-16 pt-28 text-pureWhite desktop:min-h-[100svh] desktop:pb-12 desktop:pt-32"
  >
    <TechnologyLattice />
    <!-- Depth: a yellow lift behind the lattice's resting node and a vignette
         that keeps the copy side calm and readable. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10"
      style="background: radial-gradient(ellipse 55% 60% at 70% 50%, rgba(251, 186, 0, 0.22), transparent 70%), linear-gradient(90deg, rgba(3, 60, 89, 0.9) 0%, rgba(3, 60, 89, 0.35) 55%, transparent 100%)"
    />

    <BaseContainer class="pointer-events-none relative z-10 flex flex-1 flex-col desktop:justify-center">
      <div class="grid items-center gap-12 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-7">
          <div data-th-fade><BaseHeroMarker surface="dark" :label="eyebrow" :meta="`${String(services.length).padStart(2, '0')} capabilities`" /></div>

          <h1 class="hero-title hero-title--dark mt-6 desktop:mt-[3svh]">
            <span v-for="(line, li) in lines" :key="li" class="block">
              <template v-for="(w, wi) in line" :key="wi"><span class="th-mask"><span data-th-word class="relative inline-block"><span v-if="li === lines.length - 1" data-th-marker aria-hidden="true" class="absolute -inset-x-[0.04em] bottom-[0.1em] -z-10 h-[0.36em] origin-left rounded-[4px] bg-pastiYellow-500" />{{ w }}<template v-if="li === lines.length - 1 && wi === line.length - 1"><span class="text-pastiYellow-500">.</span></template></span></span>{{ ' ' }}</template>
            </span>
          </h1>

          <p data-th-fade class="hero-lede hero-lede--dark m-center mt-6 desktop:mt-[3svh]">{{ introBody }}</p>

          <div data-th-fade class="pointer-events-auto mt-8 desktop:mt-[4svh]">
            <BaseHeroCtas
              surface="dark"
              :primary="{ label: 'Start a project', href: whatsappLink }"
              :secondary="{ label: 'Explore capabilities', down: true }"
              @secondary="scrollToCapabilities"
            />
          </div>
        </div>

        <!-- Console card: types each real service in turn. -->
        <div data-th-fade class="mx-auto w-full max-w-[22rem] desktop:col-span-4 desktop:col-start-9 desktop:mx-0 desktop:justify-self-end">
          <div class="rotate-[-3deg] rounded-[20px] border border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(2,36,54,0.72)] p-5 shadow-[0_30px_60px_-30px_rgba(0,10,20,0.8)] backdrop-blur-md">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-2.5">
                <LayoutBrandMark surface="dark" :height="11" />
                <span aria-hidden="true" class="h-3 w-px bg-[color:rgba(255,255,255,0.25)]" />
                <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">Console</span>
              </span>
              <span class="inline-flex gap-1.5" aria-hidden="true">
                <span class="h-2 w-2 rounded-full bg-[color:rgba(255,255,255,0.18)]" /><span class="h-2 w-2 rounded-full bg-[color:rgba(255,255,255,0.18)]" /><span class="h-2 w-2 rounded-full bg-pastiYellow-500" />
              </span>
            </div>
            <p class="mt-4 min-h-[3.2em] font-mono text-[13px] leading-relaxed text-[color:rgba(255,255,255,0.7)]" aria-live="off">
              <span class="font-bold text-pastiYellow-500">&gt;</span> building <span class="text-[color:rgba(255,255,255,0.4)]">▸</span>
              <span ref="typedRef" class="font-semibold text-pureWhite" /><span class="th-caret ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-pastiYellow-500" aria-hidden="true" />
            </p>
            <div class="mt-4 flex items-center justify-between border-t border-[color:rgba(255,255,255,0.12)] pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">
              <span>{{ String(services.length).padStart(2, '0') }} capabilities</span>
              <span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Live</span>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.th-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  margin: -0.12em -0.04em;
  padding: 0.12em 0.04em;
}
@media (prefers-reduced-motion: no-preference) {
  .th-caret {
    animation: th-blink 1s steps(1) infinite;
  }
}
@keyframes th-blink {
  50% {
    opacity: 0;
  }
}
</style>
