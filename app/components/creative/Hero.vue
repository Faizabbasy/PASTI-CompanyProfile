<script setup lang="ts">
import gsap from 'gsap'

// CREATIVE HERO — on the shared page-hero system (2026-10-05: title scale,
// marker and CTAs shared with the homepage hero; the PASTI Yellow stage is
// kept by owner decision). A fan of three studio visuals is the centerpiece. Moving the pointer (or dragging
// a finger) across the stage "prints" a trail of PASTI-made visuals that
// land with a slight tilt and fade out — the page reacts like a sketchbook.
// The headline breaks into words that each lean away from the pointer.
// Reduced motion: no trail; a static fan of three visuals instead.
const { eyebrow, heading, introBody, visuals } = useCreative()
const { link: whatsappLink } = useWhatsapp()

const words = heading.replace(/\.$/, '').split(' ')
// Balanced two-line break (owner 2026-10-08): the last two words start line
// two — "Creative that gets / business results." — instead of a long first
// line and a lone outlined word.
const breakAt = words.length - 2
const stageRef = ref<HTMLElement | null>(null)
const poolRef = ref<HTMLElement | null>(null)

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
  <section ref="stageRef" class="relative isolate flex select-none flex-col overflow-hidden bg-pastiYellow-500 pb-16 pt-28 text-slateNavy desktop:min-h-[100svh] desktop:pb-12 desktop:pt-32">
    <!-- Texture: fine navy dot grid -->
    <div aria-hidden="true" class="ch-dots pointer-events-none absolute inset-0 -z-10" />

    <!-- Trail pool -->
    <div ref="poolRef" aria-hidden="true" class="pointer-events-none absolute inset-0 z-10">
      <div v-for="(v, i) in [...visuals, ...visuals.slice(0, 5)]" :key="i" class="absolute left-0 top-0 w-[clamp(110px,12vw,190px)] opacity-0">
        <img :src="v.src" alt="" loading="lazy" draggable="false" :class="v.src.includes('/insights/') ? 'object-left' : 'object-top'" class="aspect-[4/5] w-full rounded-[14px] object-cover shadow-[0_24px_50px_-20px_rgba(3,40,60,0.55)] ring-4 ring-pureWhite">
      </div>
    </div>

    <BaseContainer class="relative z-20 flex flex-1 flex-col desktop:justify-center">
      <div class="grid items-center gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-7">
          <div data-ch-fade><BaseHeroMarker surface="yellow" :label="`${eyebrow} studio`" meta="Move to paint" /></div>

          <h1 class="hero-title pointer-events-none mt-6 desktop:mt-[3svh]">
            <template v-for="(w, i) in words" :key="i"><br v-if="i === breakAt"><span class="ch-mask"><span data-ch-word class="inline-block will-change-transform" :class="i === words.length - 1 ? 'ch-outline' : ''">{{ w }}</span><span v-if="i === words.length - 1">.</span></span>{{ ' ' }}</template>
          </h1>

          <p data-ch-fade class="hero-lede hero-lede--strong m-center mt-6 desktop:mt-[3svh]">{{ introBody }}</p>

          <div data-ch-fade class="mt-8 desktop:mt-[4svh]">
            <BaseHeroCtas
              surface="yellow"
              :primary="{ label: 'Brief us', href: whatsappLink }"
              :secondary="{ label: 'What we make', down: true }"
              @secondary="scrollToServices"
            />
          </div>
        </div>

        <!-- Centerpiece: a fan of three studio visuals. -->
        <div data-ch-fade aria-hidden="true" class="pointer-events-none relative mx-auto h-[300px] w-full max-w-[420px] desktop:col-span-5 desktop:h-[min(54svh,480px)] desktop:max-w-none">
          <img
            v-for="(v, i) in visuals.slice(0, 3)"
            :key="v.src"
            :src="v.src"
            alt=""
            draggable="false"
            :class="v.src.includes('/insights/') ? 'object-left' : 'object-top'"
            class="absolute left-1/2 top-1/2 aspect-[4/5] w-[min(44%,210px)] rounded-[18px] object-cover shadow-[0_34px_70px_-30px_rgba(3,40,60,0.6)] ring-[5px] ring-pureWhite desktop:w-[min(46%,250px)]"
            :style="{ transform: `translate(-50%, -50%) translateX(${(i - 1) * 62}%) translateY(${Math.abs(i - 1) * 6}%) rotate(${(i - 1) * 9}deg)`, zIndex: i === 1 ? 3 : 1 }"
          >
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
  -webkit-text-stroke: 1.6px #033c59;
}
</style>
