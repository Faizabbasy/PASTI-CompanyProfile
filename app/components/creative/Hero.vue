<script setup lang="ts">
import gsap from 'gsap'

// CREATIVE HERO — the studio in PASTI Yellow. Moving the pointer (or dragging
// a finger) across the stage "prints" a trail of PASTI-made visuals that
// land with a slight tilt and fade out — the page reacts like a sketchbook.
// The headline breaks into words that each lean away from the pointer.
// Reduced motion: no trail; a static fan of three visuals instead.
const { eyebrow, heading, introBody, visuals } = useCreative()
const { link: whatsappLink } = useWhatsapp()

const words = heading.replace(/\.$/, '').split(' ')
const stageRef = ref<HTMLElement | null>(null)
const poolRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
useMagnetic(ctaRef, { strength: 0.3 })

const scrollToServices = () => {
  const el = document.getElementById('creative-services')
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

useGsapContext(() => {
  const stage = stageRef.value
  const pool = poolRef.value
  if (!stage || !pool) return
  const wordEls = stage.querySelectorAll<HTMLElement>('[data-ch-word]')
  const fades = stage.querySelectorAll<HTMLElement>('[data-ch-fade]')
  const tiles = Array.from(pool.children) as HTMLElement[]
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set([...wordEls, ...fades], { yPercent: 0, autoAlpha: 1, y: 0 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(wordEls, { yPercent: 115 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    gsap.set(tiles, { autoAlpha: 0, scale: 0.4 })
    const intro = gsap.timeline({ delay: 0.25 })
    intro
      .to(wordEls, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.06 })
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, '-=0.8')

    // Image trail: a pool of tiles reused round-robin, one spawned every
    // `step` px of pointer travel.
    let next = 0
    let last = { x: 0, y: 0 }
    let started = false
    const step = window.matchMedia('(pointer: fine)').matches ? 110 : 70
    const spawn = (x: number, y: number, dx: number, dy: number) => {
      const tile = tiles[next % tiles.length]!
      next++
      const rot = gsap.utils.random(-14, 14)
      gsap.killTweensOf(tile)
      gsap.set(tile, { x, y, xPercent: -50, yPercent: -50, rotation: rot, scale: 0.55, autoAlpha: 1, zIndex: next })
      gsap
        .timeline()
        .to(tile, { scale: 1, x: x + dx * 0.4, y: y + dy * 0.4, duration: 0.6, ease: approvedEase.gsapPrimary })
        .to(tile, { autoAlpha: 0, scale: 0.85, y: `+=${gsap.utils.random(30, 60)}`, rotation: rot * 1.4, duration: 0.7, ease: approvedEase.gsapStandard }, 0.55)
    }
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (!started) {
        last = { x, y }
        started = true
        return
      }
      const dx = x - last.x
      const dy = y - last.y
      if (Math.hypot(dx, dy) >= step) {
        spawn(x, y, dx, dy)
        last = { x, y }
      }
    }
    const onLeave = () => {
      started = false
    }
    const onDown = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      spawn(e.clientX - r.left, e.clientY - r.top, 0, 0)
    }
    stage.addEventListener('pointermove', onMove, { passive: true })
    stage.addEventListener('pointerleave', onLeave)
    stage.addEventListener('pointerdown', onDown, { passive: true })

    // Headline words lean away from the pointer (fine pointer only).
    let offLean = () => {}
    if (window.matchMedia('(pointer: fine)').matches) {
      const qs = Array.from(wordEls).map((el) => ({
        el,
        x: gsap.quickTo(el, 'x', { duration: 0.8, ease: approvedEase.gsapStandard }),
        r: gsap.quickTo(el, 'rotation', { duration: 0.8, ease: approvedEase.gsapStandard })
      }))
      const lean = (e: PointerEvent) => {
        qs.forEach((q) => {
          const b = q.el.getBoundingClientRect()
          const cx = b.left + b.width / 2
          const cy = b.top + b.height / 2
          const d = Math.hypot(e.clientX - cx, e.clientY - cy)
          const k = Math.max(0, 1 - d / 420)
          q.x(Math.sign(cx - e.clientX) * k * 18)
          q.r(Math.sign(cx - e.clientX) * k * 4)
        })
      }
      stage.addEventListener('pointermove', lean, { passive: true })
      offLean = () => stage.removeEventListener('pointermove', lean)
    }

    return () => {
      intro.kill()
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      stage.removeEventListener('pointerdown', onDown)
      offLean()
      gsap.killTweensOf(tiles)
    }
  })
})
</script>

<template>
  <section ref="stageRef" class="relative isolate flex min-h-[100svh] select-none flex-col overflow-hidden bg-pastiYellow-500 pb-10 pt-28 text-slateNavy desktop:pt-32">
    <!-- Texture: fine navy dot grid -->
    <div aria-hidden="true" class="ch-dots pointer-events-none absolute inset-0 -z-10" />

    <!-- Trail pool -->
    <div ref="poolRef" aria-hidden="true" class="pointer-events-none absolute inset-0 z-10">
      <div v-for="(v, i) in [...visuals, ...visuals.slice(0, 5)]" :key="i" class="absolute left-0 top-0 w-[clamp(120px,14vw,220px)] opacity-0">
        <img :src="v.src" alt="" loading="lazy" draggable="false" :class="v.src.includes('/insights/') ? 'object-left' : 'object-top'" class="aspect-[4/5] w-full rounded-[14px] object-cover shadow-[0_24px_50px_-20px_rgba(3,40,60,0.55)] ring-4 ring-pureWhite">
      </div>
    </div>

    <!-- Reduced motion: static fan -->
    <div aria-hidden="true" class="pointer-events-none absolute right-[6vw] top-[22%] hidden motion-reduce:block">
      <img v-for="(v, i) in visuals.slice(0, 3)" :key="v.src" :src="v.src" alt="" class="absolute w-40 rounded-[14px] object-cover ring-4 ring-pureWhite" :style="{ transform: `rotate(${(i - 1) * 9}deg) translateX(${(i - 1) * 60}px)` }">
    </div>

    <BaseContainer class="relative z-20 flex flex-1 flex-col">
      <div data-ch-fade class="flex items-center justify-between gap-4">
        <span class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <LayoutBrandMark surface="light" :height="12" />
          <span aria-hidden="true" class="h-3 w-px bg-[color:rgba(3,60,89,0.35)]" />
          {{ eyebrow }} studio
        </span>
        <span class="hidden font-mono text-[11px] uppercase tracking-[0.2em] tablet:inline">
          <span class="hidden desktop:inline">Move to paint ↘</span><span class="desktop:hidden">Drag to paint ↘</span>
        </span>
      </div>

      <div class="pointer-events-none flex flex-1 items-center py-12">
        <h1 class="font-display text-[length:clamp(54px,11vw,190px)] font-extrabold leading-[0.88] tracking-[-0.055em]">
          <template v-for="(w, i) in words" :key="i"><span class="ch-mask"><span data-ch-word class="inline-block will-change-transform" :class="i === words.length - 1 ? 'ch-outline' : ''">{{ w }}{{ i === words.length - 1 ? '.' : '' }}</span></span>{{ ' ' }}</template>
        </h1>
      </div>

      <div class="grid gap-8 border-t-2 border-slateNavy pt-6 desktop:grid-cols-12 desktop:items-end">
        <p data-ch-fade class="max-w-[46ch] text-token-body-large font-medium desktop:col-span-6">{{ introBody }}</p>
        <div data-ch-fade class="flex flex-wrap items-center gap-5 desktop:col-span-6 desktop:justify-end">
          <div ref="ctaRef" class="inline-block">
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="group relative flex items-center gap-4 overflow-hidden rounded-full bg-slateNavy py-2.5 pl-6 pr-2.5 font-display text-[15px] font-bold text-pureWhite transition-transform duration-200 active:scale-[0.97]">
              <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-pureWhite transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
              <span class="relative z-10 transition-colors duration-300 group-hover:text-slateNavy">Brief us</span>
              <span class="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-300 ease-editorial group-hover:rotate-[-45deg]">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </a>
          </div>
          <button type="button" class="group inline-flex min-h-11 items-center gap-3 font-display text-[13px] font-bold uppercase tracking-[0.1em]" @click="scrollToServices">
            <span class="grid h-11 w-11 place-items-center rounded-full border-2 border-slateNavy transition-colors duration-300 group-hover:bg-slateNavy group-hover:text-pastiYellow-500">
              <svg viewBox="0 0 16 16" class="h-4 w-4 rotate-90" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
            What we make
          </button>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.ch-dots {
  background-image: radial-gradient(rgba(3, 60, 89, 0.16) 1.2px, transparent 1.4px);
  background-size: 22px 22px;
}
.ch-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  padding: 0.04em 0.04em 0.1em;
  margin: -0.04em -0.04em -0.1em;
}
.ch-outline {
  color: transparent;
  -webkit-text-stroke: 2px #033c59;
}
</style>
