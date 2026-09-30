<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// HERO + SELECTED WORK GALLERY (post-Milestone 7 redirection, owner-directed).
// The hero is now one pinned stage: a glass-ring centerpiece behind the
// headline, and the Selected Work projects as cards sitting on a curved
// arc at the bottom edge. Scrolling straightens the arc, grows the cards
// (not to full screen) and then slides them sideways one project at a time.
// This supersedes 04-homepage-spec.md §1 (Living Proof System) and §3
// (alternating split-screen Pinned Project Exchange) by owner decision —
// those sections of the spec need a follow-up edit.
//
// Below `desktop` (1024px) and under reduced motion there is no pin and no
// gallery: the hero is a static composition and the existing vertical
// Selected Work list (SelectedWork.vue) carries every project.
//
// Copy: headline/subtext are owner-supplied; project copy comes straight from
// useSelectedWork() (the 6 real projects; placeholders removed 2026-09-30).

const headlineWords = ['Technology.', 'Creativity.', 'Impact.']
const subtext = 'We build technology and creative solutions for businesses ready to move forward.'
const ctaPrimary = { label: 'Explore our work' }
const ctaSecondary = { label: 'Tell us about it' }

const { projects } = useSelectedWork()
const { link: whatsappLink } = useWhatsapp()
const { pageReady } = usePageReady()
const { playTo } = useSectionCurtain()

const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const copyRef = ref<HTMLElement | null>(null)
const subtextRef = ref<HTMLElement | null>(null)
const ctaRowRef = ref<HTMLElement | null>(null)
const ctaPrimaryRef = ref<HTMLElement | null>(null)
const ctaSecondaryRef = ref<HTMLElement | null>(null)
const ringRef = ref<HTMLElement | null>(null)
const chipsRef = ref<HTMLElement | null>(null)
const galleryRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const captionRef = ref<HTMLElement | null>(null)
const categoryRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const railRef = ref<HTMLElement | null>(null)
const railWrapRef = ref<HTMLElement | null>(null)
const numeralRef = ref<HTMLElement | null>(null)
const successRef = ref<HTMLElement | null>(null)

useMagnetic(ctaPrimaryRef, { strength: 0.2 })
useMagnetic(ctaSecondaryRef, { strength: 0.2 })

// The gallery's ScrollTrigger, kept so the primary CTA can jump straight to
// the point where the first project becomes active.
let galleryTrigger: ScrollTrigger | undefined
const GALLERY_START = 0.36 // fraction of the pin where the horizontal phase begins

function goToWork() {
  if (galleryTrigger) {
    const y = galleryTrigger.start + (galleryTrigger.end - galleryTrigger.start) * GALLERY_START
    playTo(`y:${Math.round(y)}`)
  } else {
    playTo('#selected-work')
  }
}

/** Wraps a word in the outer-clip / inner-translate mask structure. The
 * closing full stop is the headline's Signal point, kept Cobalt. */
function wrapWord(word: string): { outer: HTMLSpanElement; inner: HTMLSpanElement } {
  const outer = document.createElement('span')
  outer.style.overflow = 'clip'
  outer.style.display = 'inline-block'
  outer.style.verticalAlign = 'top'
  outer.style.margin = '-0.2em'

  const inner = document.createElement('span')
  inner.style.display = 'inline-block'
  inner.style.padding = '0.2em'
  if (word.endsWith('.')) {
    inner.textContent = word.slice(0, -1)
    const dot = document.createElement('span')
    dot.className = 'text-cobalt'
    dot.textContent = '.'
    inner.appendChild(dot)
  } else {
    inner.textContent = word
  }
  outer.appendChild(inner)
  return { outer, inner }
}

// Plain helper, not gsap.utils.clamp: this line runs during SSR, where the
// server bundle can resolve `gsap` to its CJS module object (no `.utils`).
const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

useGsapContext(() => {
  // --- Entrance (all widths; skipped under reduced motion) ---
  watch(
    pageReady,
    (ready, _old, onCleanup) => {
      if (!ready) return
      const mm = gsap.matchMedia()
      onCleanup(() => mm.revert())

      mm.add(reducedMotionQuery.noPreference, () => {
        const heading = headingRef.value
        if (!heading) return
        const words: HTMLElement[] = []
        heading.textContent = ''
        for (const part of headlineWords) {
          const { outer, inner } = wrapWord(part)
          heading.appendChild(outer)
          words.push(inner)
        }
        gsap.set(words, { yPercent: 120 })
        gsap.set([subtextRef.value, ctaRowRef.value].filter(Boolean), { opacity: 0, y: 14 })
        gsap.set(chipsRef.value, { opacity: 0 })
        gsap.set(ringRef.value, { opacity: 0, scale: 0.9 })

        const tl = gsap.timeline({ defaults: { ease: approvedEase.gsapStandard } })
        tl.to(ringRef.value, { opacity: 1, scale: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0)
        tl.to(words, { yPercent: 0, duration: motionTier.cinematicMin, stagger: motionStagger.loose }, 0.1)
        tl.to(subtextRef.value, { opacity: 1, y: 0, duration: motionTier.standardMax }, '-=0.5')
        tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: motionTier.standardMax }, '-=0.4')
        tl.to(chipsRef.value, { opacity: 1, duration: motionTier.standardMax }, '-=0.3')
        return () => tl.kill()
      })
    },
    { immediate: true }
  )

  // --- Desktop only: pinned gallery. Below desktop / reduced motion the
  // gallery layer is display:none (see <style>) and nothing here runs. ---
  const mm = gsap.matchMedia()
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    const stage = stageRef.value
    const gallery = galleryRef.value
    const cards = cardRefs.value
    if (!isDesktop || !stage || !gallery || cards.length === 0) return

    const N = cards.length
    let vw = window.innerWidth
    let vh = window.innerHeight
    // Final (active) card size + height: fitted into the free band between
    // the "Success Project" title and the caption row (measured, plus a
    // breathing gap), so the grown card never touches either on short
    // viewports. Capped by width so it never goes full-screen.
    let W = 0
    let H = 0
    let centerFinal = 0 // px from stage top where the active card sits
    const measure = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      const title = successRef.value
      const caption = captionRef.value
      const titleBottom = title ? title.offsetTop + title.offsetHeight : vh * 0.2
      const captionTop = caption ? caption.offsetTop : vh * 0.8
      const gap = clamp(28, 56, vh * 0.05)
      const band = Math.max(160, captionTop - titleBottom - gap * 2)
      H = Math.min(band, vw * 0.56 * 0.625)
      W = H / 0.625
      centerFinal = titleBottom + gap + band / 2
      cards.forEach((c) => {
        c.style.width = `${W}px`
        c.style.height = `${H}px`
        c.style.marginLeft = `${-W / 2}px`
        c.style.marginTop = `${-H / 2}px`
      })
      // Caption spans a bit wider than the card so titles stay on one line.
      if (caption) caption.style.width = `${Math.min(vw * 0.9, Math.max(W, 820))}px`
    }
    measure()
    measure() // caption width changed → its wrapped height; settle once more

    // Animated state, driven by one scrubbed timeline.
    const state = { enter: 0, b: 0, pos: 1, fade: 1 }
    const easeB = gsap.parseEase('power2.inOut')

    let activeIndex = -1
    const setCaption = (index: number, direction: 1 | -1) => {
      const project = projects[index]
      if (!project) return
      activeIndex = index
      const title = titleRef.value
      const category = categoryRef.value
      const desc = descRef.value
      if (!title || !category || !desc) return
      const tl = gsap.timeline({ defaults: { ease: approvedEase.gsapStandard } })
      tl.to(title, { yPercent: direction > 0 ? -110 : 110, duration: 0.25 }, 0)
      tl.call(() => {
        title.textContent = project.title
        category.textContent = project.category
        desc.textContent = project.description
      }, undefined, 0.15)
      tl.fromTo(title, { yPercent: direction > 0 ? 110 : -110 }, { yPercent: 0, duration: 0.35 }, 0.15)
      tl.fromTo([category, desc], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0.18)
      if (numeralRef.value) numeralRef.value.textContent = `${project.index} / ${String(N).padStart(2, '0')}`
      const segs = railRef.value?.children
      if (segs) {
        for (let i = 0; i < segs.length; i++) {
          const el = segs[i] as HTMLElement
          el.dataset.on = i < index ? 'past' : i === index ? 'active' : 'off'
        }
      }
    }

    const render = () => {
      const eB = easeB(state.b)
      const arc = 1 - eB
      const spacing = lerp(W * 0.68, W * 0.97, eB)
      const centerY = centerFinal
      const baseY = vh * 0.5 // cards are absolutely centered on the stage middle

      for (let i = 0; i < N; i++) {
        const el = cards[i]!
        const d = i - state.pos
        const ad = Math.abs(d)

        // Scale: at rest the center card is largest and the arc's sides
        // fall away; once grown, only the active card is full size.
        const scaleA = clamp(0.3, 0.66, 0.66 - ad * 0.11)
        const scaleC = clamp(0.6, 1, 1 - ad * 0.17)
        const s = lerp(scaleA, scaleC, eB)

        const x = d * spacing
        // Arc: at rest the row sits at the bottom edge, the center card
        // highest and the sides falling away and tilting; it straightens
        // to a flat row at the final height.
        const restY = vh * 0.87 + (H * scaleA) / 2 - baseY + arc * ad * ad * vh * 0.045
        const y = lerp(restY, centerY - baseY, eB) + (1 - state.enter) * vh * 0.12
        const rotZ = arc * d * 5
        const rotY = arc * -d * 16

        // Cards far from the active one fade out so at most ~3 are seen.
        const far = clamp(0, 1, 1 - (ad - 2.2))
        const opacity = far * lerp(1, ad < 0.5 ? 1 : 0.55, eB) * state.enter * state.fade

        gsap.set(el, {
          x,
          y,
          scale: s,
          rotationZ: rotZ,
          rotationY: rotY,
          opacity,
          zIndex: 100 - Math.round(ad * 10),
          pointerEvents: opacity > 0.5 ? 'auto' : 'none'
        })
      }

      // Caption follows the nearest card once the cards have grown.
      const nearest = clamp(0, N - 1, Math.round(state.pos))
      if (eB > 0.55 && nearest !== activeIndex) {
        setCaption(nearest, nearest >= activeIndex ? 1 : -1)
      }
      // Ring has faded out by the end of B — stop rendering it (HeroRing skips
      // frames while this flag is set) so the GPU isn't drawing invisible glass.
      if (ringRef.value) ringRef.value.dataset.paused = String(state.b > 0.85)
      const captionOpacity = String(clamp(0, 1, (eB - 0.6) / 0.3) * state.fade)
      if (captionRef.value) captionRef.value.style.opacity = captionOpacity
      // "Success Project" title: arrives with the grown cards, holds through
      // the horizontal travel, leaves with the gallery's release.
      if (successRef.value) {
        const t = clamp(0, 1, (eB - 0.5) / 0.4)
        successRef.value.style.opacity = String(t * state.fade)
        successRef.value.style.transform = `translateY(${(1 - t) * 28}px)`
      }
    }

    // Initial state
    setCaption(0, 1)
    render()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        // ~7.5 viewport lengths total, inside the Selected Work guardrail
        // (baseline 6.5-8, hard maximum ~9).
        end: '+=650%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: measure
      },
      onUpdate: render,
      defaults: { ease: 'none' }
    })

    // 0-12: intro rest.
    // 12-36 (B): hero copy recedes, ring drifts back, cards straighten + grow,
    // and the centered card shifts from project 02 to project 01.
    tl.to(state, { b: 1, duration: 24, ease: 'none' }, 12)
    tl.to(state, { pos: 0, duration: 24, ease: 'power2.inOut' }, 12)
    tl.to(copyRef.value, { opacity: 0, y: -70, duration: 14, ease: 'power2.in' }, 12)
    tl.to(chipsRef.value, { opacity: 0, duration: 10, ease: 'power2.in' }, 12)
    tl.to(ringRef.value, { scale: 0.6, yPercent: -22, opacity: 0, duration: 20, ease: 'power2.inOut' }, 12)
    // 36-94 (C): horizontal travel across all projects.
    tl.to(state, { pos: N - 1, duration: 58, ease: 'none' }, 36)
    // 94-100 (D): release — gallery dissolves into the next section.
    tl.to(state, { fade: 0, duration: 6, ease: 'power1.in' }, 94)

    galleryTrigger = tl.scrollTrigger ?? undefined

    // Entrance of the arc after the hero copy has landed.
    const enterTween = gsap.to(state, {
      enter: 1,
      duration: 1.4,
      delay: 0.9,
      ease: approvedEase.gsapCinematic,
      onUpdate: render
    })

    // --- Pointer response: cards drift a few px at different depths ---
    const cleanups: Array<() => void> = []
    if (window.matchMedia('(pointer: fine)').matches) {
      const inners = cards.map((c) => c.querySelector<HTMLElement>('[data-card-inner]')!)
      const qx = inners.map((el) => gsap.quickTo(el, 'x', { duration: 0.9, ease: approvedEase.gsapStandard }))
      const qy = inners.map((el) => gsap.quickTo(el, 'y', { duration: 0.9, ease: approvedEase.gsapStandard }))
      const onMove = (event: PointerEvent) => {
        const nx = (event.clientX / window.innerWidth) * 2 - 1
        const ny = (event.clientY / window.innerHeight) * 2 - 1
        inners.forEach((_, i) => {
          const depth = 6 + (i % 3) * 4
          qx[i]!(nx * depth)
          qy[i]!(ny * depth * 0.6)
        })
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      cleanups.push(() => window.removeEventListener('pointermove', onMove))

      // Hover: gentle lift on the grown card.
      cards.forEach((card, i) => {
        const inner = inners[i]!
        const enter = () => {
          if (state.b < 0.95) return
          gsap.to(inner, { scale: 1.02, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        }
        const leave = () => {
          gsap.to(inner, { scale: 1, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        }
        card.addEventListener('pointerenter', enter)
        card.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          card.removeEventListener('pointerenter', enter)
          card.removeEventListener('pointerleave', leave)
        })
      })
    }

    const onResize = () => {
      measure()
      render()
    }
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))

    return () => {
      enterTween.kill()
      tl.scrollTrigger?.kill()
      tl.kill()
      galleryTrigger = undefined
      cleanups.forEach((fn) => fn())
    }
  })
})
</script>

<template>
  <BaseSection ref="sectionComponentRef" as="section" class="relative overflow-hidden bg-[#f6f9fb] py-0">
    <div ref="stageRef" class="relative flex min-h-[100svh] items-center justify-center overflow-hidden desktop:h-[100svh]">
      <!-- Background (owner revision 2026-09-30: light): white-to-mist with a
           soft Cobalt lift behind the ring, a cool highlight top-right and a
           faint #033C59 lift bottom-left, plus one thin orbit line and two
           small marks. No grid, no particles, no blobs. -->
      <div
        aria-hidden="true"
        class="absolute inset-0"
        style="background: radial-gradient(ellipse 52% 48% at 50% 44%, rgba(251, 186, 0, 0.16), rgba(251, 186, 0, 0.05) 50%, transparent 74%), radial-gradient(ellipse 40% 38% at 94% 4%, rgba(251, 186, 0, 0.14), transparent 70%), radial-gradient(ellipse 45% 42% at 4% 96%, rgba(3, 60, 89, 0.08), transparent 70%), linear-gradient(180deg, #ffffff 0%, #f5f8fb 55%, #eef3f7 100%)"
      />
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <ellipse cx="720" cy="400" rx="470" ry="300" stroke="rgba(3,60,89,0.16)" stroke-width="1" transform="rotate(-14 720 400)" />
        <circle cx="1094" cy="212" r="6" fill="#FBBA00" />
        <path d="M22 500h16M30 492v16" stroke="rgba(3,60,89,0.35)" stroke-width="1" />
        <path d="M1402 500h16M1410 492v16" stroke="rgba(3,60,89,0.25)" stroke-width="1" />
      </svg>

      <!-- Glass ring (Three.js, client-only) -->
      <div
        ref="ringRef"
        aria-hidden="true"
        class="pointer-events-none absolute left-1/2 top-[46%] z-0 h-[min(78vw,680px)] w-[min(78vw,680px)] -translate-x-1/2 -translate-y-1/2 desktop:top-[45%] desktop:h-[min(48vw,74svh,680px)] desktop:w-[min(48vw,74svh,680px)]"
      >
        <ClientOnly>
          <HomeHeroRing />
        </ClientOnly>
      </div>

      <!-- Copy: headline / supporting text / CTAs, centered. -->
      <BaseContainer class="z-10 w-full">
        <div
          ref="copyRef"
          class="mx-auto flex flex-col items-center px-2 pb-16 pt-28 text-center desktop:absolute desktop:inset-x-0 desktop:top-[22svh] desktop:mx-0 desktop:px-0 desktop:pb-0 desktop:pt-0"
        >
          <h1
            ref="headingRef"
            class="flex flex-col items-center text-center font-display text-[length:clamp(40px,14vw,72px)] font-bold leading-[0.92] tracking-[-0.04em] text-slateNavy md:text-token-display-xl desktop:flex-row desktop:justify-center desktop:gap-x-[0.1em] desktop:text-[length:clamp(64px,6.4vw,132px)]"
          >
            <span v-for="word in headlineWords" :key="word" class="block">{{ word.slice(0, -1) }}<span class="text-cobalt">.</span></span>
          </h1>

          <p ref="subtextRef" class="mx-auto mt-8 max-w-lg text-center text-token-body-large font-semibold text-[color:rgba(3,60,89,0.9)] [text-shadow:0_0_12px_rgba(255,255,255,0.95),0_0_26px_rgba(255,255,255,0.85)]">
            {{ subtext }}
          </p>

          <!-- CTAs sit over the Cobalt 3D ring, so neither may be Cobalt at
               rest: primary is solid Slate Navy (the header CTA's colour) with
               a soft shadow lifting it off the render; secondary is a solid
               white surface instead of bare text. Cobalt only as hover wipe.
               Desktop: pinned to the left key line (4vw — header logo / 01·04
               marker) at the same height as the right "Process Ready" chip
               (22svh + 44svh = 66svh), so the ring sits centred between them. -->
          <div ref="ctaRowRef" class="mt-9 flex w-full max-w-[21rem] flex-col items-stretch gap-3 tablet:w-auto tablet:max-w-none tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-center tablet:gap-4 desktop:absolute desktop:left-[4vw] desktop:top-[44svh] desktop:mt-0 desktop:flex-col desktop:items-stretch desktop:gap-3 wide:flex-row wide:items-center wide:gap-4">
            <div ref="ctaPrimaryRef" class="inline-block w-full tablet:w-auto desktop:w-full wide:w-auto">
              <a
                href="#selected-work"
                class="group relative flex items-center justify-between gap-4 overflow-hidden rounded-[14px] bg-slateNavy transition-transform duration-200 active:scale-[0.97] py-2.5 pl-6 pr-2.5 font-display text-[15px] font-bold text-pureWhite shadow-[0_18px_40px_-16px_rgba(3,60,89,0.7)]"
                @click.prevent="goToWork"
              >
                <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-cobalt transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
                <span class="relative z-10">{{ ctaPrimary.label }}</span>
                <span class="relative z-10 grid h-10 w-10 place-items-center rounded-[10px] bg-pastiYellow-500 text-slateNavy transition-transform duration-300 ease-editorial group-hover:rotate-[-45deg]">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </span>
              </a>
            </div>
            <div ref="ctaSecondaryRef" class="inline-block w-full tablet:w-auto desktop:w-full wide:w-auto">
              <a
                :href="whatsappLink"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center justify-between gap-4 rounded-[14px] border active:scale-[0.97] border-[color:rgba(3,60,89,0.14)] bg-pureWhite py-2.5 pl-6 pr-2.5 font-display text-[15px] font-bold text-slateNavy shadow-[0_18px_40px_-18px_rgba(3,60,89,0.45)] transition-colors duration-300 ease-editorial hover:border-slateNavy"
              >
                {{ ctaSecondary.label }}
                <span class="grid h-10 w-10 place-items-center rounded-[10px] bg-[color:rgba(3,60,89,0.07)] text-slateNavy transition-colors duration-300 ease-editorial group-hover:bg-slateNavy group-hover:text-pureWhite">
                  <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </BaseContainer>

      <!-- Status chips (whitelisted neutral states). -->
      <div ref="chipsRef" aria-hidden="true" class="hidden desktop:block">
        <div class="absolute left-[4vw] top-[34svh] z-10 flex items-center gap-3 font-display text-token-metadata font-semibold tracking-[0.08em] text-[color:rgba(3,60,89,0.72)]">
          <span>01 / 04</span>
          <span class="h-px w-16 bg-cobalt" />
        </div>
        <div class="absolute right-[4vw] top-[66svh] z-30 flex items-center gap-3 rounded-button border border-[color:rgba(3,60,89,0.16)] bg-[color:rgba(255,255,255,0.75)] px-4 py-2.5 font-display text-token-metadata font-semibold uppercase tracking-[0.08em] text-slateNavy shadow-[0_12px_30px_-20px_rgba(3,60,89,0.5)]">
          <span class="h-1.5 w-1.5 rounded-full bg-cobalt" />
          Process Ready
        </div>
      </div>

      <!-- Gallery: the Selected Work projects on a curved arc that
           straightens, grows and travels sideways with scroll. Desktop
           only (hidden below 1024px and under reduced motion — the
           vertical Selected Work list covers those). -->
      <div
        ref="galleryRef"
        class="hero-gallery pointer-events-none absolute inset-0 z-20 hidden desktop:block"
        style="perspective: 1500px"
      >
        <article
          v-for="(project, i) in projects"
          :key="project.index"
          :ref="(el) => { if (el) cardRefs[i] = el as HTMLElement }"
          class="absolute left-1/2 top-1/2 opacity-0"
          style="transform-style: preserve-3d"
        >
          <div
            data-card-inner
            class="relative h-full w-full overflow-hidden rounded-card border border-[color:rgba(3,60,89,0.14)] bg-slateNavy shadow-[0_50px_100px_-45px_rgba(3,60,89,0.55)]"
          >
            <!-- Posters are portrait (4:5) in a landscape card: show the WHOLE
                 poster with breathing room (its baked-in headline stays
                 readable), over a blurred, dimmed copy of itself as backdrop. -->
            <img :src="project.image" alt="" aria-hidden="true" loading="lazy" class="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl">
            <span aria-hidden="true" class="absolute inset-0 bg-[color:rgba(3,60,89,0.35)]" />
            <div class="absolute inset-0 flex items-center justify-center px-[6%] py-[4.5%]">
              <img :src="project.image" :alt="project.title" :loading="i < 3 ? 'eager' : 'lazy'" class="h-full w-auto max-w-full rounded-[clamp(8px,0.8vw,14px)] object-contain shadow-[0_30px_60px_-20px_rgba(0,12,22,0.7)] ring-1 ring-[color:rgba(255,255,255,0.14)]">
            </div>
            <span class="absolute left-4 top-3 font-display text-token-metadata font-semibold tracking-[0.08em] text-pureWhite">{{ project.index }}</span>
            <span class="absolute right-4 top-3.5 opacity-80"><LayoutBrandMark :height="11" /></span>
          </div>
        </article>

        <!-- Section title above the grown cards. Driven by render(), so it
             follows the same scrubbed timeline as the cards. -->
        <div
          ref="successRef"
          class="absolute inset-x-0 top-[9svh] z-0 opacity-0"
        >
          <div class="container-page">
            <p class="flex items-center gap-4 font-display text-[length:clamp(36px,4.2vw,68px)] font-bold leading-[0.95] tracking-[-0.035em] text-slateNavy">
              <span>Success Project<span class="text-cobalt">.</span></span>
              <span aria-hidden="true" class="mt-[0.35em] hidden h-px flex-1 bg-[color:rgba(3,60,89,0.16)] md:block" />
              <LayoutBrandMark surface="light" :height="14" class="mt-[0.3em] hidden md:inline-block" />
            </p>
          </div>
        </div>

        <!-- Caption under the active card. -->
        <div
          ref="captionRef"
          class="absolute inset-x-0 bottom-[4.5svh] mx-auto flex items-end justify-between gap-10 opacity-0"
        >
          <div class="min-w-0 max-w-xl flex-1 text-left">
            <span ref="categoryRef" class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-cobalt">{{ projects[0]?.category }}</span>
            <div class="mt-2 overflow-hidden">
              <h2 ref="titleRef" class="truncate font-display text-[length:clamp(24px,min(2.6vw,5svh),44px)] font-bold leading-[1.05] tracking-[-0.02em] text-slateNavy">{{ projects[0]?.title }}</h2>
            </div>
            <p ref="descRef" class="mt-2 line-clamp-2 min-h-[3.2em] text-token-body text-[color:rgba(3,60,89,0.72)]">{{ projects[0]?.description }}</p>
          </div>

          <!-- Segmented rail: one segment per project + numeral. -->
          <div ref="railWrapRef" class="flex shrink-0 flex-col items-end gap-3 pb-1">
            <div ref="railRef" class="hero-rail flex items-center gap-1.5">
              <span v-for="p in projects" :key="p.index" data-on="off" class="h-[3px] w-6" />
            </div>
            <span ref="numeralRef" class="font-display text-token-metadata font-semibold tracking-[0.08em] text-[color:rgba(3,60,89,0.7)]">01 / {{ String(projects.length).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseSection>
</template>

<style>
/* Gallery is desktop-only and motion-only: with reduced motion the vertical
   Selected Work list carries every project. */
[data-reduced-motion='true'] .hero-gallery {
  display: none;
}

.hero-rail > span {
  background: rgba(3, 60, 89, 0.14);
  transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.hero-rail > span[data-on='past'] {
  background: #2563eb;
}
.hero-rail > span[data-on='active'] {
  background: #fdc81f;
}
</style>
