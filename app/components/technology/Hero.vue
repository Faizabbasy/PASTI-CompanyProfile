<script setup lang="ts">
import gsap from 'gsap'

// TECHNOLOGY HERO — "engineering console". Dark full-screen stage over the
// interactive Signal lattice; the approved heading set as three masked lines
// with the last word on the PASTI Yellow accent; a terminal readout that
// types each real service name in turn. Entrance plays on mount.
const { eyebrow, heading, introBody, services } = useTechnology()
const { link: whatsappLink } = useWhatsapp()

// "Technology built to move business forward." → three editorial lines.
const words = heading.replace(/\.$/, '').split(' ')
const lines = [words.slice(0, 2), words.slice(2, 5), words.slice(5)]

const rootRef = ref<HTMLElement | null>(null)
const typedRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
useMagnetic(ctaRef, { strength: 0.3 })

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
  const rule = root.querySelector<HTMLElement>('[data-th-rule]')
  const typed = typedRef.value

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(lineEls, { yPercent: 0 })
    gsap.set(fades, { autoAlpha: 1, y: 0 })
    if (rule) gsap.set(rule, { scaleX: 1 })
    if (typed) typed.textContent = services[0]?.title ?? ''
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lineEls, { yPercent: 118 })
    gsap.set(fades, { autoAlpha: 0, y: 18 })
    if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })

    const intro = gsap.timeline({ delay: 0.25 })
    intro
      .to(lineEls, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.07 })
      .to(rule, { scaleX: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, '-=0.6')
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
    class="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-slateNavy pb-10 pt-28 text-pureWhite desktop:pb-12 desktop:pt-32"
  >
    <TechnologyLattice />
    <!-- Depth: a Cobalt lift behind the lattice's resting node and a vignette
         that keeps the copy side calm and readable. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10"
      style="background: radial-gradient(ellipse 55% 60% at 70% 50%, rgba(37, 99, 235, 0.22), transparent 70%), linear-gradient(90deg, rgba(3, 60, 89, 0.9) 0%, rgba(3, 60, 89, 0.35) 55%, transparent 100%)"
    />

    <BaseContainer class="pointer-events-none relative z-10 flex flex-1 flex-col">
      <!-- Console header row -->
      <div data-th-fade class="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.55)]">
        <span class="inline-flex items-center gap-2.5">
          <LayoutBrandMark surface="dark" :height="12" />
          <span aria-hidden="true" class="h-3 w-px bg-[color:rgba(255,255,255,0.25)]" />
          {{ eyebrow }}
        </span>
        <span class="hidden tablet:inline">{{ String(services.length).padStart(2, '0') }} capabilities</span>
      </div>

      <div class="flex flex-1 flex-col justify-center py-14">
        <h1 class="font-display text-[length:clamp(52px,10.4vw,176px)] font-extrabold text-pureWhite leading-[0.9] tracking-[-0.05em]">
          <span v-for="(line, li) in lines" :key="li" class="block">
            <template v-for="(w, wi) in line" :key="wi"><span class="th-mask"><span data-th-word class="inline-block" :class="li === lines.length - 1 ? 'text-pastiYellow-500' : ''">{{ w }}{{ li === lines.length - 1 && wi === line.length - 1 ? '.' : '' }}</span></span>{{ ' ' }}</template>
          </span>
        </h1>
      </div>

      <span data-th-rule aria-hidden="true" class="block h-px w-full bg-[color:rgba(255,255,255,0.18)]" />

      <div class="mt-6 grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <!-- Terminal readout -->
        <p data-th-fade class="font-mono text-[13px] text-[color:rgba(255,255,255,0.75)] desktop:col-span-4" aria-live="off">
          <span class="text-cobalt">&gt;</span> building <span class="text-[color:rgba(255,255,255,0.4)]">▸</span>
          <span ref="typedRef" class="text-pureWhite" /><span class="th-caret ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-pastiYellow-500" aria-hidden="true" />
        </p>

        <p data-th-fade class="max-w-[44ch] text-token-body-large text-[color:rgba(255,255,255,0.72)] desktop:col-span-4 desktop:col-start-5">
          {{ introBody }}
        </p>

        <div data-th-fade class="pointer-events-auto flex flex-wrap items-center gap-5 desktop:col-span-4 desktop:col-start-9 desktop:justify-end">
          <div ref="ctaRef" class="inline-block">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative flex items-center gap-4 overflow-hidden rounded-[14px] bg-pastiYellow-500 py-2.5 pl-6 pr-2.5 font-display text-[15px] font-bold text-slateNavy transition-transform duration-200 active:scale-[0.97]"
            >
              <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-pureWhite transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
              <span class="relative z-10">Start a project</span>
              <span class="relative z-10 grid h-10 w-10 place-items-center rounded-[10px] bg-slateNavy text-pastiYellow-500 transition-transform duration-300 ease-editorial group-hover:rotate-[-45deg]">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </a>
          </div>
          <button
            type="button"
            class="group inline-flex min-h-11 items-center gap-3 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-pureWhite"
            @click="scrollToCapabilities"
          >
            <span class="grid h-11 w-11 place-items-center rounded-full border border-[color:rgba(255,255,255,0.25)] transition-colors duration-300 ease-editorial group-hover:border-pastiYellow-500 group-hover:bg-pastiYellow-500 group-hover:text-slateNavy">
              <svg viewBox="0 0 16 16" class="h-4 w-4 rotate-90" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
            Explore
          </button>
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
