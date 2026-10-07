<script setup lang="ts">
import gsap from 'gsap'

// HERO — "Everything HR, Simplified." (deck slide 1). Copy left; the product
// right with a segmented switch between the real web dashboard and the
// mobile app (whichever is active comes forward — pure CSS transitions).
// The four pillars are real links into the page. Signature motif: a 24-hour
// "shift ruler" along the bottom with three shift bands and a NOW playhead
// at the visitor's local time (updates once a minute — no per-frame work).
// Entrance: copy rises, dashboard unmasks, phone slides in. Fine pointer on
// desktop tilts the product a few degrees. Reduced motion: static.
const { hero } = useShiftly()
const scrollTo = useShiftlyScroll()
const stageRef = ref<HTMLElement | null>(null)
const productRef = ref<HTMLElement | null>(null)
const view = ref<'web' | 'mobile'>('web')

const pillarTargets = [
  { label: hero.pillars[0]!, go: () => scrollTo('modules') },
  { label: hero.pillars[1]!, go: () => scrollTo('enterprise') },
  { label: hero.pillars[2]!, go: () => (view.value = 'mobile') },
  { label: hero.pillars[3]!, go: () => scrollTo('platform') }
]

// Shift ruler: local time → % across 24h.
const now = ref<Date | null>(null)
const nowPct = computed(() => (now.value ? ((now.value.getHours() * 60 + now.value.getMinutes()) / 1440) * 100 : 50))
const nowLabel = computed(() => (now.value ? now.value.toTimeString().slice(0, 5) : '--:--'))
const shifts = [
  { from: 6, to: 14 },
  { from: 14, to: 22 },
  { from: 22, to: 24 },
  { from: 0, to: 6 }
]
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = new Date()
  clock = setInterval(() => (now.value = new Date()), 60_000)
})
onBeforeUnmount(() => clearInterval(clock))

useGsapContext(() => {
  const stage = stageRef.value
  const product = productRef.value
  if (!stage || !product) return
  const fades = stage.querySelectorAll<HTMLElement>('[data-sh-fade]')
  const web = product.querySelector<HTMLElement>('[data-sh-web]')
  const phone = product.querySelector<HTMLElement>('[data-sh-phone]')
  const ruler = stage.querySelector<HTMLElement>('[data-sh-ruler]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(fades, { autoAlpha: 0, y: 22 })
    gsap.set(web, { clipPath: 'inset(100% 0% 0% 0% round 16px)' })
    gsap.set(phone, { autoAlpha: 0, y: 60 })
    gsap.set(ruler, { clipPath: 'inset(0% 100% 0% 0%)' })
    const tl = gsap.timeline({ delay: 0.25 })
    tl.to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 })
      .to(web, { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.2)
      .to(phone, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin + 0.2, ease: approvedEase.gsapPrimary }, 0.75)
      .to(ruler, { clipPath: 'inset(0% 0% 0% 0%)', duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0.6)

    let off = () => {}
    if (window.matchMedia('(pointer: fine)').matches && window.matchMedia(breakpointQuery.desktopUp).matches) {
      const rx = gsap.quickTo(product, 'rotationX', { duration: 0.8, ease: approvedEase.gsapStandard })
      const ry = gsap.quickTo(product, 'rotationY', { duration: 0.8, ease: approvedEase.gsapStandard })
      gsap.set(product, { transformPerspective: 1400 })
      const onMove = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect()
        ry(((e.clientX - r.left) / r.width - 0.5) * 6)
        rx(-((e.clientY - r.top) / r.height - 0.5) * 4)
      }
      stage.addEventListener('pointermove', onMove, { passive: true })
      off = () => stage.removeEventListener('pointermove', onMove)
    }
    return () => { tl.kill(); off() }
  })
})
</script>

<template>
  <section id="overview" ref="stageRef" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy pb-10 pt-28 text-pureWhite desktop:flex desktop:min-h-[100svh] desktop:flex-col desktop:justify-center desktop:pb-8 desktop:pt-32">
    <BaseGridLines tone="dark" />
    <!-- Soft yellow pool behind the product (static gradient, no filter). -->
    <div aria-hidden="true" class="pointer-events-none absolute -right-[10%] top-[10%] h-[70%] w-[60%] rounded-full" style="background: radial-gradient(closest-side, rgba(251, 186, 0, 0.16), transparent)" />

    <BaseContainer class="relative z-10 w-full">
      <div class="grid items-center gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-5">
          <div data-sh-fade><BaseHeroMarker surface="dark" :label="hero.eyebrow" meta="by PASTI" /></div>
          <div data-sh-fade class="mt-7"><ShiftlyMark surface="dark" :size="22" /></div>
          <h1 data-sh-fade class="hero-title hero-title--dark mt-5">
            Everything HR, <span class="sh-under text-pastiYellow-500">Simplified.</span>
          </h1>
          <p data-sh-fade class="hero-lede hero-lede--dark m-center mt-6">{{ hero.body }}</p>
          <div data-sh-fade class="mt-8">
            <BaseHeroCtas
              surface="dark"
              :primary="{ label: 'Request a Demo' }"
              :secondary="{ label: 'Explore Modules', down: true }"
              @primary="scrollTo('demo')"
              @secondary="scrollTo('modules')"
            />
          </div>
          <!-- Pillars = real shortcuts -->
          <ul data-sh-fade class="mt-10 grid grid-cols-2 gap-2 text-left">
            <li v-for="p in pillarTargets" :key="p.label">
              <button
                type="button"
                class="sh-chip group flex w-full items-center justify-between gap-2 rounded-[12px] border border-[color:rgba(255,255,255,0.16)] bg-[color:rgba(255,255,255,0.04)] px-3.5 py-3 text-left font-display text-[14px] font-semibold text-pureWhite transition-[background-color,border-color] duration-300 hover:border-pastiYellow-500 hover:bg-[color:rgba(251,186,0,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
                @click="p.go"
              >
                <span class="flex items-center gap-2.5"><span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />{{ p.label }}</span>
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0 text-pastiYellow-500 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
            </li>
          </ul>
        </div>

        <!-- Product -->
        <div class="relative desktop:col-span-7">
          <div data-sh-fade role="group" aria-label="Product preview" class="m-center-row relative z-20 mb-5 flex justify-end">
            <div class="inline-flex rounded-full bg-[color:rgba(255,255,255,0.08)] p-1 ring-1 ring-[color:rgba(255,255,255,0.14)]">
              <button
                v-for="v in (['web', 'mobile'] as const)"
                :key="v"
                type="button"
                :aria-pressed="view === v"
                class="inline-flex min-h-10 items-center gap-2 rounded-full px-4 font-display text-[13px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
                :class="view === v ? 'bg-pastiYellow-500 text-slateNavy' : 'text-[color:rgba(255,255,255,0.75)] hover:text-pureWhite'"
                @click="view = v"
              >
                <ShiftlyIcon :name="v" class="h-4 w-4" />{{ v === 'web' ? 'Web dashboard' : 'Mobile app' }}
              </button>
            </div>
          </div>

          <div ref="productRef" class="relative mx-auto max-w-[760px] pb-10 tablet:pb-16 desktop:ml-auto desktop:mr-0 [transform-style:preserve-3d]">
            <figure
              data-sh-web
              class="sh-swap overflow-hidden rounded-[16px] bg-pureWhite shadow-[0_50px_100px_-40px_rgba(0,8,16,0.9)] ring-1 ring-[color:rgba(255,255,255,0.18)]"
              :class="view === 'mobile' ? 'scale-[0.94] opacity-40' : 'scale-100 opacity-100'"
            >
              <div class="flex items-center gap-1.5 border-b border-[color:rgba(3,60,89,0.1)] bg-surfaceNeutral px-4 py-2.5" aria-hidden="true">
                <span class="h-2.5 w-2.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" />
                <span class="h-2.5 w-2.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" />
                <span class="h-2.5 w-2.5 rounded-full bg-pastiYellow-500" />
                <span class="ml-3 h-5 flex-1 rounded-full bg-pureWhite px-3 font-mono text-[10px] leading-5 text-[color:rgba(3,60,89,0.45)]">shiftly · dashboard</span>
              </div>
              <img :src="hero.dashboard.src" :alt="hero.dashboard.alt" width="929" height="442" class="block h-auto w-full" draggable="false">
            </figure>
            <figure
              data-sh-phone
              class="sh-swap absolute bottom-0 right-3 origin-bottom-right overflow-hidden rounded-[26px] border-[5px] border-[#0b1620] bg-pureWhite shadow-[0_40px_70px_-25px_rgba(0,8,16,0.9)] tablet:right-6 desktop:-right-4"
              :class="view === 'mobile' ? 'w-[44%] max-w-[270px]' : 'w-[30%] max-w-[190px]'"
            >
              <img :src="hero.mobile.src" :alt="hero.mobile.alt" width="262" height="576" class="block h-auto w-full" draggable="false">
            </figure>
          </div>
        </div>
      </div>
    </BaseContainer>

    <!-- Signature: 24h shift ruler with NOW playhead -->
    <BaseContainer class="relative z-10 mt-10 w-full desktop:mt-12">
      <div aria-hidden="true" class="relative">
        <div data-sh-ruler class="relative h-9 overflow-hidden rounded-full bg-[color:rgba(255,255,255,0.06)] ring-1 ring-[color:rgba(255,255,255,0.12)]">
          <span
            v-for="(s, i) in shifts"
            :key="i"
            class="absolute inset-y-1.5 rounded-full"
            :class="i === 0 ? 'bg-[color:rgba(251,186,0,0.85)]' : i === 1 ? 'bg-[color:rgba(255,255,255,0.22)]' : 'bg-[color:rgba(255,255,255,0.1)]'"
            :style="{ left: `calc(${(s.from / 24) * 100}% + 3px)`, width: `calc(${((s.to - s.from) / 24) * 100}% - 6px)` }"
          />
          <span class="absolute inset-y-0 w-[2px] bg-pureWhite" :style="{ left: `${nowPct}%` }" />
        </div>
        <span class="absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-full bg-pureWhite px-2.5 py-0.5 font-mono text-[10px] font-semibold text-slateNavy" :style="{ left: `clamp(32px, ${nowPct}%, calc(100% - 32px))` }">Now · {{ nowLabel }}</span>
        <div class="mt-2 flex justify-between font-mono text-[10px] text-[color:rgba(255,255,255,0.45)]">
          <span v-for="h in [0, 6, 12, 18, 24]" :key="h">{{ String(h).padStart(2, '0') }}:00</span>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.sh-swap {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), width 0.6s cubic-bezier(0.22, 1, 0.36, 1), max-width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.sh-under {
  background-image: linear-gradient(transparent 90%, rgba(251, 186, 0, 0.3) 90%);
}
@media (prefers-reduced-motion: reduce) {
  .sh-swap {
    transition: none;
  }
}
</style>
