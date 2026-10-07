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
// Copy: slide copy is owner/client-supplied (see `slides`); project copy comes straight from
// useSelectedWork() (the 6 real projects; placeholders removed 2026-09-30).

// Hero copy is a 2-slide text slideshow (client revision 2026-10-06). Slide 1
// is client-supplied verbatim (title set in normal case, "FCP" on the yellow
// marker bar); slide 2 is the previous headline/subtext. Only the text block
// rotates — knot, cards, CTAs and the scroll gallery are shared.
interface HeroSlide {
  lines: string[]
  /** Word set on the PASTI Yellow marker bar. */
  highlight?: string
  body: string
  /** Longer lines → one step smaller title. */
  compact?: boolean
}
const slides: HeroSlide[] = [
  {
    // Boss feedback 2026-10-06: the "agency in Indonesia." line ran too long.
    // Re-balanced into three even lines, set flush-left (no staircase).
    lines: ['The first FCP', 'technology agency', 'in Indonesia.'],
    highlight: 'FCP',
    body: 'Indonesia’s first technology agency focused on Framework Code Products (FCP). We build customizable technology foundations that adapt to your business, processes, and ecosystem.',
    compact: true
  },
  {
    lines: ['Technology.', 'Creativity.', 'Impact.'],
    body: 'We build technology and creative solutions for businesses ready to move forward.'
  }
]
const SLIDE_MS = 6000
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Splits a title line into plain text, the marker word and a yellow full stop. */
function lineParts(line: string, highlight?: string) {
  const dot = line.endsWith('.')
  const text = dot ? line.slice(0, -1) : line
  const at = highlight ? text.indexOf(highlight) : -1
  if (at < 0) return { before: text, mark: '', after: '', dot }
  return { before: text.slice(0, at), mark: highlight!, after: text.slice(at + highlight!.length), dot }
}

const activeSlide = ref(0)
const leavingSlide = ref(-1)
const ctaPrimary = { label: 'Explore our work' }
const ctaSecondary = { label: 'Tell us about it' }
// Owner-supplied hero furniture (reference comp, 2026-10-01). The service
// list reuses the real titles from useServices() — no invented offers.
const partnerCard = { label: 'Your Partner in', strong: 'Digital Transformation', to: '/about' }
const ringTag = { from: 'Ideas', to: 'Real Solutions' }
const sideNote = 'Innovation drives real business growth.'
const { services } = useServices()
const heroServices = services.slice(0, 4).map((s) => ({
  title: s.title,
  to: s.category === 'creative' ? '/creative' : '/technology'
}))

const { projects } = useSelectedWork()
const { link: whatsappLink } = useWhatsapp()
const { pageReady } = usePageReady()
const { playTo } = useSectionCurtain()

const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const copyRef = ref<HTMLElement | null>(null)
const slideLineRefs = ref<HTMLElement[][]>(slides.map(() => []))
const slideBodyRefs = ref<HTMLElement[]>([])
const segFillRefs = ref<HTMLElement[]>([])
const ctaRowRef = ref<HTMLElement | null>(null)
const ctaPrimaryRef = ref<HTMLElement | null>(null)
const ctaSecondaryRef = ref<HTMLElement | null>(null)
const ringRef = ref<HTMLElement | null>(null)
const knotTiltRef = ref<HTMLElement | null>(null)
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
const decorRef = ref<HTMLElement | null>(null)

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

// Plain helper, not gsap.utils.clamp: this line runs during SSR, where the
// server bundle can resolve `gsap` to its CJS module object (no `.utils`).
const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// --- Text slideshow controller. `holds` pause autoplay (hover, the scroll
// gallery taking over, hidden tab, hero off-screen); reduced motion never
// autoplays and swaps instantly. ---
const holds = { hover: false, scroll: false, hidden: false, away: false }
let progress: gsap.core.Tween | undefined
let switching: gsap.core.Timeline | undefined
let autoplay = false

const syncProgress = () => {
  if (!progress) return
  const held = holds.hover || holds.scroll || holds.hidden || holds.away
  if (held) progress.pause()
  else progress.resume()
}

const runProgress = () => {
  progress?.kill()
  segFillRefs.value.forEach((el, i) => gsap.set(el, { scaleX: i < activeSlide.value ? 1 : 0 }))
  if (!autoplay) return
  const fill = segFillRefs.value[activeSlide.value]
  if (!fill) return
  progress = gsap.fromTo(fill, { scaleX: 0 }, {
    scaleX: 1,
    duration: SLIDE_MS / 1000,
    ease: 'none',
    onComplete: () => goToSlide((activeSlide.value + 1) % slides.length)
  })
  syncProgress()
}

async function goToSlide(n: number) {
  if (n === activeSlide.value || n < 0 || n >= slides.length) return
  const from = activeSlide.value
  switching?.progress(1)
  leavingSlide.value = from
  activeSlide.value = n
  await nextTick()
  const outLines = slideLineRefs.value[from] ?? []
  const inLines = slideLineRefs.value[n] ?? []
  const outBody = slideBodyRefs.value[from]
  const inBody = slideBodyRefs.value[n]
  const done = () => {
    leavingSlide.value = -1
    runProgress()
  }
  if (window.matchMedia(reducedMotionQuery.reduce).matches) {
    gsap.set(inLines, { yPercent: 0, y: 0 })
    if (inBody) gsap.set(inBody, { opacity: 1, y: 0 })
    done()
    return
  }
  const tl = gsap.timeline({ defaults: { ease: approvedEase.gsapStandard }, onComplete: done })
  tl.to(outLines, { yPercent: -110, duration: 0.55, stagger: 0.05 }, 0)
  if (outBody) tl.to(outBody, { opacity: 0, y: -10, duration: 0.4 }, 0)
  tl.fromTo(inLines, { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: motionTier.cinematicMin, stagger: motionStagger.loose, ease: approvedEase.gsapCinematic }, 0.3)
  if (inBody) tl.fromTo(inBody, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: motionTier.standardMax }, 0.65)
  switching = tl
}

const slideshow = {
  start() {
    autoplay = !window.matchMedia(reducedMotionQuery.reduce).matches
    runProgress()
  }
}

useGsapContext(() => {
  // --- Slideshow inputs: hover pause, hidden tab, off-screen, swipe. ---
  const copy = copyRef.value
  const stageEl = stageRef.value
  const inputCleanups: Array<() => void> = []
  if (copy && stageEl) {
    const enter = () => { holds.hover = true; syncProgress() }
    const leave = () => { holds.hover = false; syncProgress() }
    const vis = () => { holds.hidden = document.hidden; syncProgress() }
    const io = new IntersectionObserver(([e]) => { holds.away = !e?.isIntersecting; syncProgress() })
    io.observe(stageEl)
    let sx = 0
    let sy = 0
    const down = (e: PointerEvent) => { sx = e.clientX; sy = e.clientY }
    const up = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      const dx = e.clientX - sx
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - sy)) {
        goToSlide((activeSlide.value + (dx < 0 ? 1 : slides.length - 1)) % slides.length)
      }
    }
    copy.addEventListener('pointerenter', enter)
    copy.addEventListener('pointerleave', leave)
    copy.addEventListener('pointerdown', down, { passive: true })
    copy.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('visibilitychange', vis)
    // Reduced motion has no entrance timeline to hand over: settle now
    // (static, no autoplay). Otherwise the entrance calls slideshow.start().
    if (window.matchMedia(reducedMotionQuery.reduce).matches) slideshow.start()
    inputCleanups.push(() => {
      copy.removeEventListener('pointerenter', enter)
      copy.removeEventListener('pointerleave', leave)
      copy.removeEventListener('pointerdown', down)
      copy.removeEventListener('pointerup', up)
      document.removeEventListener('visibilitychange', vis)
      io.disconnect()
      progress?.kill()
      switching?.kill()
      progress = undefined
    })
  }

  // --- Entrance (all widths; skipped under reduced motion) ---
  watch(
    pageReady,
    (ready, _old, onCleanup) => {
      if (!ready) return
      const mm = gsap.matchMedia()
      onCleanup(() => mm.revert())

      mm.add(reducedMotionQuery.noPreference, () => {
        const words = slideLineRefs.value[0] ?? []
        const firstBody = slideBodyRefs.value[0]
        if (words.length === 0) return
        const floats = chipsRef.value ? Array.from(chipsRef.value.querySelectorAll<HTMLElement>('[data-float]')) : []
        gsap.set(words, { yPercent: 120 })
        gsap.set([firstBody, ctaRowRef.value].filter(Boolean), { opacity: 0, y: 14 })
        gsap.set(chipsRef.value, { opacity: 0 })
        gsap.set(floats, { opacity: 0, x: 24 })
        gsap.set(ringRef.value, { opacity: 0, scale: 0.9 })

        const tl = gsap.timeline({ defaults: { ease: approvedEase.gsapStandard } })
        tl.to(ringRef.value, { opacity: 1, scale: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, 0)
        tl.to(words, { yPercent: 0, duration: motionTier.cinematicMin, stagger: motionStagger.loose }, 0.1)
        tl.to(firstBody ?? {}, { opacity: 1, y: 0, duration: motionTier.standardMax }, '-=0.5')
        tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: motionTier.standardMax }, '-=0.4')
        tl.to(chipsRef.value, { opacity: 1, duration: motionTier.standardMax }, '-=0.3')
        tl.to(floats, { opacity: 1, x: 0, duration: motionTier.cinematicMin, stagger: 0.08, ease: approvedEase.gsapCinematic }, '<')
        tl.call(() => slideshow.start())
        return () => tl.kill()
      })
    },
    { immediate: true }
  )

  // --- Desktop only: pinned gallery. Below desktop / reduced motion the
  // gallery layer is display:none (see <style>) and nothing here runs. ---
  const mm = gsap.matchMedia()

  // Knot pointer tilt (desktop, fine pointer): a few degrees toward the
  // cursor — what the live 3D knot used to do, as two eased transforms.
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp} and (pointer: fine)`, () => {
    const knot = knotTiltRef.value
    if (!knot) return
    const ry = gsap.quickTo(knot, 'rotationY', { duration: 1.2, ease: approvedEase.gsapStandard })
    const rx = gsap.quickTo(knot, 'rotationX', { duration: 1.2, ease: approvedEase.gsapStandard })
    const tx = gsap.quickTo(knot, 'xPercent', { duration: 1.2, ease: approvedEase.gsapStandard })
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      ry(nx * 12)
      rx(-ny * 9)
      tx(nx * 2)
    }
    gsap.set(knot.parentElement, { perspective: 1200 })
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.set(knot, { clearProps: 'transform' })
    }
  })
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
    // `shift` is the visitor's own rotation of the resting arc (clicking a
    // side card); it hands back to the scroll as B runs.
    const state = { enter: 0, b: 0, pos: 1, fade: 1, shift: 0 }
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
      const pos = state.pos + state.shift * (1 - eB)

      for (let i = 0; i < N; i++) {
        const el = cards[i]!
        const d = i - pos
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
        const restY = vh * 0.92 + (H * scaleA) / 2 - baseY + arc * ad * ad * vh * 0.045
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
      const nearest = clamp(0, N - 1, Math.round(pos))
      if (eB > 0.55 && nearest !== activeIndex) {
        setCaption(nearest, nearest >= activeIndex ? 1 : -1)
      }
      const engaged = state.b > 0.02
      if (engaged !== holds.scroll) {
        holds.scroll = engaged
        syncProgress()
      }
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
    tl.to(decorRef.value, { opacity: 0.35, duration: 20, ease: 'power2.inOut' }, 12)
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

    const cleanups: Array<() => void> = []

    // --- Arc navigation (resting state only): click a side card to centre it ---
    const shiftTo = (restIndex: number) => {
      const target = clamp(0, N - 1, restIndex) - 1
      gsap.to(state, { shift: target, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic, overwrite: 'auto', onUpdate: render })
    }
    const restIndex = () => Math.round(1 + state.shift)
    cards.forEach((card, i) => {
      const onClick = () => {
        if (state.b < 0.05 && i !== restIndex()) shiftTo(i)
      }
      card.addEventListener('click', onClick)
      cleanups.push(() => card.removeEventListener('click', onClick))
    })

    // --- Pointer response: cards drift a few px at different depths ---
    if (window.matchMedia('(pointer: fine)').matches) {
      const inners = cards.map((c) => c.querySelector<HTMLElement>('[data-card-inner]')!)
      const qx = inners.map((el) => gsap.quickTo(el, 'x', { duration: 0.9, ease: approvedEase.gsapStandard }))
      const qy = inners.map((el) => gsap.quickTo(el, 'y', { duration: 0.9, ease: approvedEase.gsapStandard }))
      // Background furniture (blurred yellow forms, pearls, side card)
      // drifts at its own data-depth — parallax, not follow.
      const layers = [decorRef.value, chipsRef.value].flatMap((root) =>
        root ? Array.from(root.querySelectorAll<HTMLElement>('[data-depth]')) : []
      )
      const lx = layers.map((el) => gsap.quickTo(el, 'x', { duration: 1.4, ease: approvedEase.gsapStandard }))
      const ly = layers.map((el) => gsap.quickTo(el, 'y', { duration: 1.4, ease: approvedEase.gsapStandard }))
      const onMove = (event: PointerEvent) => {
        const nx = (event.clientX / window.innerWidth) * 2 - 1
        const ny = (event.clientY / window.innerHeight) * 2 - 1
        layers.forEach((el, i) => {
          const depth = Number(el.dataset.depth) || 10
          lx[i]!(nx * -depth)
          ly[i]!(ny * -depth * 0.7)
        })
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

  return () => inputCleanups.forEach((fn) => fn())
})
</script>

<template>
  <BaseSection ref="sectionComponentRef" as="section" class="relative overflow-hidden bg-[#f6f9fb] py-0">
    <div ref="stageRef" class="relative flex min-h-[100svh] flex-col overflow-hidden desktop:block desktop:h-[100svh]">
      <!-- Background (owner reference comp, 2026-10-01): cool mist base with
           soft, out-of-focus PASTI Yellow forms bleeding in from the edges
           (as if more of the knot sat just outside the frame) and a few
           pearl spheres. Each layer drifts at its own data-depth. -->
      <div
        aria-hidden="true"
        class="absolute inset-0"
        style="background: radial-gradient(ellipse 46% 44% at 62% 44%, rgba(251, 186, 0, 0.12), transparent 72%), radial-gradient(ellipse 50% 50% at 8% 90%, rgba(3, 60, 89, 0.06), transparent 70%), linear-gradient(180deg, #fbfcfd 0%, #f2f6f9 55%, #ebf1f5 100%)"
      />
      <div ref="decorRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
        <div data-depth="26" class="hero-blur absolute -right-[12vw] -top-[22vh] h-[56vh] w-[44vw] rotate-[-18deg] rounded-full" />
        <div data-depth="34" class="hero-blur hero-blur--soft absolute -left-[9vw] top-[30%] h-[22vh] w-[22vw] rotate-[38deg] rounded-full" />
        <div data-depth="40" class="hero-blur hero-blur--soft absolute -left-[6vw] bottom-[-8vh] h-[30vh] w-[18vw] rotate-[-30deg] rounded-full" />
        <div data-depth="30" class="hero-blur hero-blur--soft absolute -right-[6vw] bottom-[12%] hidden h-[12vh] w-[30vw] rotate-[-22deg] rounded-full desktop:block" />
        <span data-depth="18" class="hero-pearl absolute right-[7vw] top-[37%] hidden h-11 w-11 desktop:block" />
        <span data-depth="12" class="hero-pearl absolute right-[24vw] top-[63%] hidden h-7 w-7 opacity-70 desktop:block" />
        <span data-depth="22" class="hero-pearl absolute left-[84vw] top-[13%] h-5 w-5 opacity-60 desktop:left-[30vw] desktop:top-[9%]" />
      </div>

      <!-- Copy: marker / headline / supporting text / CTAs, left-aligned on
           a stepped key line (each headline line indents a little further). -->
      <BaseContainer class="relative z-10 w-full desktop:static">
        <div
          ref="copyRef"
          class="flex flex-col items-center pb-6 pt-28 text-center tablet:pt-32 desktop:absolute desktop:z-10 desktop:items-start desktop:text-left desktop:left-[max(6vw,calc(50vw-640px))] desktop:top-[15svh] desktop:pb-0 desktop:pt-0"
        >
          <!-- Slide control: "● 01 / 02" + one progress segment per slide
               (fills while the slide is up; click to jump). -->
          <div class="mb-5 flex items-center gap-3 font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-[color:rgba(3,60,89,0.78)] desktop:mb-[3svh]">
            <span class="h-2 w-2 rounded-full bg-pastiYellow-500 shadow-[0_0_0_4px_rgba(251,186,0,0.18)]" />
            <span aria-live="polite">{{ pad2(activeSlide + 1) }} / {{ pad2(slides.length) }}</span>
            <span class="flex items-center gap-1.5">
              <button
                v-for="(slide, i) in slides"
                :key="i"
                type="button"
                class="group/seg relative grid h-8 w-10 place-items-center"
                :aria-label="`Show slide ${i + 1}`"
                :aria-current="i === activeSlide ? 'true' : undefined"
                @click="goToSlide(i)"
              >
                <span class="relative block h-[3px] w-full overflow-hidden rounded-full bg-[color:rgba(3,60,89,0.16)] transition-colors group-hover/seg:bg-[color:rgba(3,60,89,0.3)]">
                  <span :ref="(el) => { if (el) segFillRefs[i] = el as HTMLElement }" class="absolute inset-0 origin-left scale-x-0 rounded-full bg-slateNavy" />
                </span>
              </button>
            </span>
          </div>

          <!-- Accessible title = the active slide; visual titles are hidden from AT. -->
          <h1 class="sr-only">{{ slides[activeSlide]!.lines.join(' ') }}</h1>

          <!-- Slides stacked in one grid cell: the block keeps the taller
               slide's height, so CTAs never jump between slides. -->
          <div class="grid w-full touch-pan-y desktop:w-auto">
            <div
              v-for="(slide, si) in slides"
              :key="si"
              class="[grid-area:1/1]"
              :class="si === activeSlide || si === leavingSlide ? '' : 'invisible'"
              :aria-hidden="si === activeSlide ? undefined : 'true'"
              :inert="si === activeSlide ? undefined : true"
            >
              <p
                aria-hidden="true"
                class="font-display font-bold leading-[0.9] tracking-[-0.045em] text-slateNavy"
                :class="slide.compact
                  ? 'text-[length:clamp(36px,10vw,64px)] desktop:text-[length:clamp(44px,min(4.4vw,8svh),80px)]'
                  : 'text-[length:clamp(46px,13.5vw,84px)] desktop:text-[length:clamp(64px,min(7.2vw,11.5svh),128px)]'"
              >
                <span
                  v-for="(line, i) in slide.lines"
                  :key="line"
                  class="-mb-[0.14em] block overflow-clip pb-[0.14em]"
                  :class="slide.compact ? '' : i === 1 ? 'desktop:pl-[0.32em]' : i >= 2 ? 'desktop:pl-[0.62em]' : ''"
                >
                  <span :ref="(el) => { if (el) slideLineRefs[si]![i] = el as HTMLElement }" class="inline-block" :class="si === 0 ? '' : 'translate-y-[110%]'"><template v-for="part in [lineParts(line, slide.highlight)]" :key="line">{{ part.before }}<span v-if="part.mark" class="relative isolate inline-block"><span aria-hidden="true" class="absolute -inset-x-[0.06em] bottom-[0.1em] -z-10 h-[0.36em] rounded-[4px] bg-pastiYellow-500" />{{ part.mark }}</span>{{ part.after }}<span v-if="part.dot" class="text-pastiYellow-500">.</span></template></span>
                </span>
              </p>

              <p
                :ref="(el) => { if (el) slideBodyRefs[si] = el as HTMLElement }"
                class="mx-auto mt-6 max-w-[25rem] text-token-body-large font-medium text-[color:rgba(3,60,89,0.86)] desktop:mx-0 desktop:mt-[3svh] desktop:max-w-[27rem] desktop:text-[17px] desktop:leading-[1.6]"
                :class="[si === 0 ? '' : 'opacity-0', slide.compact ? '' : 'desktop:ml-[0.9em]']"
              >
                {{ slide.body }}
              </p>
            </div>
          </div>

          <!-- CTAs: a yellow orb inside a white halo leading a glass pill
               (primary), then a quiet text link (secondary, WhatsApp). -->
          <div ref="ctaRowRef" class="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 desktop:mt-[3.6svh] desktop:justify-start">
            <div ref="ctaPrimaryRef" class="inline-block">
              <a
                href="#selected-work"
                class="group flex items-center transition-transform duration-200 active:scale-[0.97]"
                @click.prevent="goToWork"
              >
                <span class="relative z-10 grid h-[72px] w-[72px] place-items-center rounded-full border border-[color:rgba(3,60,89,0.08)] bg-[color:rgba(255,255,255,0.7)] shadow-[0_20px_44px_-20px_rgba(3,60,89,0.45),inset_0_1px_0_#fff] backdrop-blur-sm">
                  <span class="grid h-12 w-12 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy shadow-[0_10px_24px_-8px_rgba(251,186,0,0.9),inset_0_-3px_6px_rgba(200,120,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.6)] transition-transform duration-500 ease-editorial group-hover:rotate-[-45deg]">
                    <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  </span>
                </span>
                <span class="relative -ml-5 flex h-[52px] items-center overflow-hidden rounded-full border border-[color:rgba(3,60,89,0.12)] bg-[color:rgba(255,255,255,0.72)] pl-10 pr-7 font-display text-[15px] font-bold text-slateNavy shadow-[0_16px_36px_-22px_rgba(3,60,89,0.5)] backdrop-blur-sm">
                  <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-slateNavy transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
                  <span class="relative transition-colors duration-300 group-hover:text-pureWhite">{{ ctaPrimary.label }}</span>
                </span>
              </a>
            </div>
            <div ref="ctaSecondaryRef" class="inline-block">
              <a
                :href="whatsappLink"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative inline-flex items-center gap-3 py-2 font-display text-[15px] font-semibold text-slateNavy"
              >
                {{ ctaSecondary.label }}
                <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                <span aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-slateNavy transition-transform duration-500 ease-editorial group-hover:origin-left group-hover:scale-x-100" />
              </a>
            </div>
          </div>
        </div>
      </BaseContainer>

      <!-- Glass knot (pre-rendered image) with its tilted orbit and the
           "Ideas → Real Solutions" tag. In flow under the copy on mobile;
           right of centre, behind the headline's tail, on desktop. -->
      <div
        ref="ringRef"
        aria-hidden="true"
        class="pointer-events-none relative z-0 mx-auto -mt-4 mb-16 aspect-square w-[min(92vw,480px)] desktop:absolute desktop:left-[57%] desktop:top-[40%] desktop:m-0 desktop:h-[min(46vw,70svh,700px)] desktop:w-[min(46vw,70svh,700px)] desktop:-translate-x-1/2 desktop:-translate-y-1/2"
      >
        <svg class="absolute -inset-[12%] h-[124%] w-[124%] overflow-visible" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="hero-orbit" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#FBBA00" stop-opacity="0" />
              <stop offset="0.35" stop-color="#FBBA00" stop-opacity="0.75" />
              <stop offset="0.7" stop-color="#FBBA00" stop-opacity="0.35" />
              <stop offset="1" stop-color="#FBBA00" stop-opacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="100" rx="96" ry="34" stroke="url(#hero-orbit)" stroke-width="0.55" transform="rotate(-24 100 100)" />
          <g transform="rotate(-24 100 100)">
            <circle class="hero-orbit-dot" r="1.6" fill="#033C59">
              <animateMotion dur="16s" repeatCount="indefinite" path="M4,100 a96,34 0 1,0 192,0 a96,34 0 1,0 -192,0" />
            </circle>
          </g>
        </svg>
        <!-- The knot: its pre-rendered image (public/images/hero-knot.webp,
             captured from the original three.js glass scene) on every
             device, painted from the server HTML with the text.
             Performance pass 2026-10-06: the live WebGL knot cost ~700KB of
             three.js plus a ~0.9s main-thread freeze compiling its
             transmission shader on desktop, and a double render pass every
             frame. Now: a slow CSS float (main.css) + a few degrees of
             pointer tilt on desktop (two GPU transforms). -->
        <div ref="knotTiltRef" class="absolute inset-0" style="transform-style: preserve-3d">
          <img
            src="/images/hero-knot.webp"
            alt=""
            width="960"
            height="960"
            fetchpriority="high"
            decoding="async"
            draggable="false"
            class="hero-knot-img absolute inset-0 h-full w-full select-none object-contain"
          >
        </div>
        <span class="absolute right-[2%] top-[9%] inline-flex rotate-[-7deg] items-center gap-2 rounded-full border border-[color:rgba(3,60,89,0.08)] bg-[color:rgba(255,255,255,0.86)] px-3.5 py-1.5 font-display text-[11px] font-bold text-slateNavy shadow-[0_14px_30px_-16px_rgba(3,60,89,0.45)] backdrop-blur-sm desktop:right-[-4%] desktop:top-[4%] desktop:text-[12px]">
          {{ ringTag.from }}
          <svg viewBox="0 0 16 16" class="h-3 w-3 text-pastiYellow-600" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          <span class="font-semibold text-[color:rgba(3,60,89,0.8)]">{{ ringTag.to }}</span>
        </span>
      </div>

      <!-- Desktop hero furniture: partner card + service list and side note
           (right). Scroll cue removed (owner request 2026-10-06). Fades with the copy as the gallery
           takes over. -->
      <div ref="chipsRef" class="hidden desktop:block">
        <div class="absolute right-[max(4vw,calc(50vw-660px))] top-[23svh] z-30 w-[min(21rem,24vw)]">
          <div data-float data-depth="10">
            <NuxtLink
              :to="partnerCard.to"
              class="group flex rotate-[-5deg] items-center gap-4 rounded-[18px] border border-[color:rgba(255,255,255,0.9)] bg-[color:rgba(255,255,255,0.72)] py-4 pl-5 pr-4 shadow-[0_24px_50px_-26px_rgba(3,60,89,0.45)] backdrop-blur-md transition-transform duration-500 ease-editorial hover:rotate-[-3deg]"
            >
              <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-pastiYellow-500 shadow-[0_0_0_5px_rgba(251,186,0,0.16)]" />
              <span class="min-w-0 flex-1 font-display text-[13px] font-semibold leading-snug text-[color:rgba(3,60,89,0.75)]">
                {{ partnerCard.label }}<br><span class="font-bold text-slateNavy">{{ partnerCard.strong }}</span>
              </span>
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:rgba(3,60,89,0.1)] bg-pureWhite text-slateNavy transition-colors duration-300 group-hover:bg-slateNavy group-hover:text-pureWhite">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </NuxtLink>
          </div>
          <ul data-float data-depth="6" class="ml-8 mt-6 flex rotate-[-5deg] flex-col gap-3">
            <li v-for="service in heroServices" :key="service.title">
              <NuxtLink :to="service.to" class="group inline-flex items-center gap-3 font-display text-[13px] font-medium text-[color:rgba(3,60,89,0.82)] transition-colors hover:text-slateNavy">
                <span class="text-[15px] leading-none text-slateNavy transition-transform duration-300 ease-editorial group-hover:rotate-90">+</span>
                <span class="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-editorial group-hover:bg-[length:100%_1px]">{{ service.title }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div aria-hidden="true" data-float data-depth="14" class="absolute right-[max(3vw,calc(50vw-680px))] top-[58svh] z-10 flex max-w-[9.5rem] flex-col gap-3 wide:top-[56svh]">
          <p class="font-display text-[12px] font-medium leading-snug text-[color:rgba(3,60,89,0.78)]">{{ sideNote }}</p>
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
            class="relative h-full w-full overflow-hidden rounded-card border border-[color:rgba(3,60,89,0.14)] bg-pureWhite shadow-[0_50px_100px_-45px_rgba(3,60,89,0.55)]"
          >
            <!-- Portrait (4:5) posters in a landscape (16:10) card, shown WHOLE
                 (owner request 2026-10-06: nothing cropped): the poster sits
                 centred at full card height; the side bands are the same
                 poster, pre-blurred offline into a ~1KB backdrop
                 (public/images/selected-work/backdrop/) — no runtime filter,
                 so the scrubbed gallery stays cheap. -->
            <img
              :src="project.image.replace('/selected-work/', '/selected-work/backdrop/')"
              alt=""
              aria-hidden="true"
              class="absolute inset-0 h-full w-full scale-110 object-cover"
              draggable="false"
            >
            <span aria-hidden="true" class="absolute inset-0 bg-[color:rgba(3,60,89,0.08)]" />
            <img
              :src="project.image"
              :alt="project.title"
              :loading="i < 3 ? 'eager' : 'lazy'"
              class="relative mx-auto h-full w-auto object-contain shadow-[0_0_60px_-10px_rgba(3,36,54,0.55)]"
              draggable="false"
            >
            <span class="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-[color:rgba(3,60,89,0.88)] px-2.5 py-1">
              <LayoutBrandMark :height="9" />
              <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.25)]" />
              <span class="font-display text-[10px] font-semibold tabular-nums tracking-[0.08em] text-pureWhite">{{ project.index }}</span>
            </span>
          </div>
        </article>

        <!-- Section title above the grown cards. Driven by render(), so it
             follows the same scrubbed timeline as the cards. -->
        <div
          ref="successRef"
          class="absolute inset-x-0 top-[15svh] z-0 opacity-0"
        >
          <div class="container-page">
            <p class="flex items-center gap-4 font-display text-[length:clamp(36px,4.2vw,68px)] font-bold leading-[0.95] tracking-[-0.035em] text-slateNavy">
              <span>Success Project<span class="text-pastiYellow-500">.</span></span>
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
[data-reduced-motion='true'] .hero-gallery,
[data-reduced-motion='true'] .hero-orbit-dot {
  display: none;
}

.hero-rail > span {
  background: rgba(3, 60, 89, 0.14);
  transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.hero-rail > span[data-on='past'] {
  background: #033C59;
}
.hero-rail > span[data-on='active'] {
  background: #fdc81f;
}
</style>
