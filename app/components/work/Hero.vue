<script setup lang="ts">
import gsap from 'gsap'

// WORK HERO — on the shared page-hero system (2026-10-05: light ground,
// title scale, marker and CTAs shared with the homepage hero). The portfolio as a physical deck. Six real project posters sit
// stacked; moving the pointer across the stage fans the deck open (further
// right = wider fan), the hovered card lifts out, and clicking a card jumps
// to that project in the index. Touch: the deck rests half-open and each tap
// jumps. Reduced motion: a static fan.
const { projects } = useWorkPortfolio()
const { publicCases } = useFeaturedCases()
const pad = (n: number) => String(n).padStart(2, '0')

const stageRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const hovered = ref<number | null>(null)
const { setState } = useCustomCursor()

const { link: whatsappLink } = useWhatsapp()
const toIndex = () => {
  const el = document.getElementById('work-index')
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

const jump = (i: number) => {
  const el = document.getElementById(`work-${projects[i]!.index}`)
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { offset: -140, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

useGsapContext(() => {
  const stage = stageRef.value
  const cards = cardRefs.value
  if (!stage || !cards.length) return
  const words = stage.querySelectorAll<HTMLElement>('[data-wh-word]')
  const fades = stage.querySelectorAll<HTMLElement>('[data-wh-fade]')
  const n = cards.length
  const mid = (n - 1) / 2
  const layout = (spread: number, lift: number | null) => {
    cards.forEach((c, i) => {
      const d = i - mid
      const isLift = lift === i
      gsap.to(c, {
        x: d * spread * 64,
        y: Math.abs(d) * spread * 14 - (isLift ? 46 : 0),
        rotation: d * spread * 8,
        scale: isLift ? 1.08 : 1,
        zIndex: isLift ? 50 : 10 + i,
        duration: 0.7,
        ease: approvedEase.gsapPrimary,
        overwrite: 'auto'
      })
    })
  }
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set([...words, ...fades], { yPercent: 0, autoAlpha: 1 })
    const step = window.innerWidth < 640 ? 32 : 60
    cards.forEach((c, i) => gsap.set(c, { x: (i - mid) * step, rotation: (i - mid) * 6, y: Math.abs(i - mid) * 10 }))
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(words, { yPercent: 115 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    gsap.set(cards, { y: 260, rotation: 0, autoAlpha: 0 })
    // Narrow phones get a tighter resting fan so the outer cards stay on screen.
    const rest = window.innerWidth < 640 ? 0.32 : 0.45
    const intro = gsap.timeline({ delay: 0.2 })
    intro
      .to(words, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.07 })
      .to(cards, { y: 0, autoAlpha: 1, duration: motionTier.cinematicMin + 0.2, ease: approvedEase.gsapCinematic, stagger: 0.06 }, 0.15)
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, '-=0.6')
      .add(() => layout(rest, null))

    const fine = window.matchMedia('(pointer: fine)').matches
    let spread = rest
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      spread = 0.15 + Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 0.75
      layout(spread, hovered.value)
    }
    const onLeave = () => {
      spread = rest
      layout(spread, null)
    }
    if (fine) {
      stage.addEventListener('pointermove', onMove, { passive: true })
      stage.addEventListener('pointerleave', onLeave)
    }
    const stop = watch(hovered, (h) => layout(spread, h))

    return () => {
      intro.kill()
      stop()
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  })
})
</script>

<template>
  <section ref="stageRef" class="surface-light relative isolate flex flex-col overflow-hidden pb-14 pt-28 desktop:min-h-[100svh] desktop:pt-32" style="--lift-x: 70%; --lift-y: 40%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10 flex flex-1 flex-col desktop:justify-center">
      <div class="grid items-center gap-6 desktop:grid-cols-12 desktop:gap-10">
        <div class="m-center desktop:col-span-6">
          <div data-wh-fade><BaseHeroMarker label="Work" :meta="`${pad(projects.length)} projects · ${pad(publicCases.length)} case studies`" /></div>
          <h1 class="hero-title mt-6 desktop:mt-[3svh]">
            <span class="wh-mask block"><span data-wh-word class="inline-block">Selected</span></span>
            <span class="wh-mask block"><span data-wh-word class="inline-block">work<span class="text-pastiYellow-500">.</span></span></span>
          </h1>
          <p data-wh-fade class="hero-lede m-center mt-6 desktop:mt-[3svh]">
            A closer look at how we work with our clients — real projects, from the brief to the result that's running today.
          </p>
          <div data-wh-fade class="mt-8 desktop:mt-[4svh]">
            <BaseHeroCtas
              :primary="{ label: 'Browse projects' }"
              :secondary="{ label: 'Tell us about it', href: whatsappLink }"
              @primary="toIndex"
            />
          </div>
        </div>

        <!-- Deck -->
        <div class="relative mt-4 h-[min(52svh,400px)] desktop:col-span-6 desktop:mt-0 desktop:h-[min(56svh,520px)]" @mouseleave="hovered = null">
          <div class="absolute left-1/2 top-1/2 desktop:left-[46%] -translate-x-1/2 -translate-y-1/2">
            <button
              v-for="(p, i) in projects"
              :key="p.index"
              :ref="(el) => { if (el) cardRefs[i] = el as HTMLElement }"
              type="button"
              :aria-label="`Go to ${p.title}`"
              class="absolute left-0 top-0 -ml-[clamp(75px,7.5vw,125px)] -mt-[clamp(94px,9.4vw,156px)] w-[clamp(150px,15vw,250px)] origin-bottom overflow-hidden rounded-[18px] bg-pureWhite shadow-[0_40px_70px_-30px_rgba(3,60,89,0.55)] ring-1 ring-[color:rgba(3,60,89,0.12)]"
              @mouseenter="hovered = i; setState('view', 'Open')"
              @mouseleave="setState('default')"
              @click="jump(i)"
            >
              <img :src="p.image" :alt="p.title" draggable="false" class="aspect-[4/5] w-full object-cover object-top">
              <span class="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[color:rgba(3,60,89,0.88)] px-2 py-1">
                <LayoutBrandMark :height="8" />
                <span class="font-mono text-[9px] text-pureWhite">{{ p.index }}</span>
              </span>
            </button>
          </div>
          <p data-wh-fade class="absolute bottom-0 right-0 font-mono left-0 text-center desktop:left-auto desktop:text-left text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.5)]">
            <span class="hidden desktop:inline">Move to fan · click to open</span><span class="desktop:hidden">Tap a project</span>
          </p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.wh-mask {
  overflow: clip;
  padding: 0.04em 0.04em 0.1em;
  margin: -0.04em -0.04em -0.1em;
}
</style>
