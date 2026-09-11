// app/composables/motion/useHeroKineticBlueprint.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getComposition,
  PIN_DISTANCE_VH,
  type BlueprintTier,
  type FacetDef,
  type GradientDef,
  type ScrollPhaseName,
  type SignalComposition
} from './kineticBlueprintPaths'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export interface UseHeroKineticBlueprintOptions {
  sectionEl: Ref<HTMLElement | null>
  contentEl: Ref<HTMLElement | null>
}

export function useHeroKineticBlueprint(
  svgEl: Ref<SVGSVGElement | null>,
  options: UseHeroKineticBlueprintOptions
): () => void {
  if (!import.meta.client || !svgEl.value) return () => {}

  const svg = svgEl.value
  const sectionEl = options.sectionEl.value ?? svg.closest('section') ?? svg.parentElement!
  const contentEl = options.contentEl.value ?? sectionEl.querySelector('[data-hero-content]')

  // --- Responsive tier: re-evaluated live (never captured once). Desktop
  // >=1024px, tablet 640-1023px, mobile <640px, matching the retired
  // Kinetic Blueprint composable's breakpoints. ---
  function getTier(): BlueprintTier {
    if (window.matchMedia('(max-width: 639px)').matches) return 'mobile'
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet'
    return 'desktop'
  }
  let currentTier: BlueprintTier = getTier()

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches

  const NS = 'http://www.w3.org/2000/svg'

  const facetsGroup = svg.querySelector('[data-blueprint-group="facets"]') as SVGGElement
  const voidClipPath = svg.querySelector('[data-void-clip]') as SVGPathElement

  let composition: SignalComposition = getComposition(currentTier)
  let builtTier: BlueprintTier | null = null

  function facetEls(): SVGGElement[] {
    return Array.from(facetsGroup.children) as SVGGElement[]
  }
  function facetById(id: string): SVGGElement | undefined {
    return facetEls().find((el) => el.dataset.blueprintId === id)
  }

  function buildGradients(gradients: GradientDef[]) {
    for (const grad of gradients) {
      const el = svg.querySelector(`#${grad.id}`) as SVGElement | null
      if (!el) continue
      el.replaceChildren()
      if (grad.type === 'linear') {
        const angleRad = ((grad.angle ?? 90) * Math.PI) / 180
        const x1 = 50 - Math.cos(angleRad) * 50
        const y1 = 50 - Math.sin(angleRad) * 50
        const x2 = 50 + Math.cos(angleRad) * 50
        const y2 = 50 + Math.sin(angleRad) * 50
        el.setAttribute('x1', `${x1}%`)
        el.setAttribute('y1', `${y1}%`)
        el.setAttribute('x2', `${x2}%`)
        el.setAttribute('y2', `${y2}%`)
      }
      for (const stop of grad.stops) {
        const stopEl = document.createElementNS(NS, 'stop')
        stopEl.setAttribute('offset', `${stop.offset}%`)
        stopEl.setAttribute('stop-color', stop.color)
        stopEl.dataset.stopOffset = String(stop.offset)
        el.appendChild(stopEl)
      }
    }
  }

  function makeFacet(def: FacetDef): SVGGElement {
    const g = document.createElementNS(NS, 'g')
    g.dataset.blueprintId = def.id
    g.style.opacity = String(def.opacity)
    const path = document.createElementNS(NS, 'path')
    path.setAttribute('d', def.d)
    path.setAttribute('fill', `url(#${def.gradientId})`)
    path.setAttribute('class', 'signal-architecture__facet')
    g.appendChild(path)
    // A second copy of the same shape, filtered with fractal noise and
    // blended on top via CSS mix-blend-mode (see main.css) — a cheap way
    // to give the flat gradient fill a grain/material texture without
    // touching the base path's own fill or animating anything new.
    const grain = document.createElementNS(NS, 'path')
    grain.setAttribute('d', def.d)
    grain.setAttribute('filter', 'url(#signal-grain)')
    grain.setAttribute('class', 'signal-architecture__grain')
    g.appendChild(grain)
    return g
  }

  function buildFacets(tier: BlueprintTier) {
    if (builtTier === tier) return
    builtTier = tier
    composition = getComposition(tier)

    facetsGroup.replaceChildren()
    for (const def of composition.facets) {
      facetsGroup.appendChild(makeFacet(def))
    }
    buildGradients(composition.gradients)
  }

  buildFacets(currentTier)

  // --- Void clip: keeps the headline/subtext/CTA union bounding box free
  // of any facet/band coverage, tracked live against the actual DOM
  // content rather than a fixed guess (spec "Negative-space void"). ---
  const VOID_BUFFER_PX = 32

  function updateVoidClip() {
    if (!contentEl) return
    const svgRect = svg.getBoundingClientRect()
    const contentRect = contentEl.getBoundingClientRect()
    if (svgRect.width === 0 || svgRect.height === 0) return

    // Convert from viewport pixels into the SVG's 1600x900 viewBox space,
    // matching preserveAspectRatio="xMidYMid slice" scaling.
    const scale = Math.max(1600 / svgRect.width, 900 / svgRect.height)
    const offsetX = (svgRect.width * scale - 1600) / 2
    const offsetY = (svgRect.height * scale - 900) / 2

    const left = (contentRect.left - svgRect.left) * scale - offsetX - VOID_BUFFER_PX
    const top = (contentRect.top - svgRect.top) * scale - offsetY - VOID_BUFFER_PX
    const width = Math.max(0, contentRect.width * scale + VOID_BUFFER_PX * 2)
    const height = Math.max(0, contentRect.height * scale + VOID_BUFFER_PX * 2)
    const right = left + width
    const bottom = top + height

    // Two-subpath compound path with clip-rule="evenodd" on the <path>
    // itself (set in the template): the outer subpath is the full-viewBox
    // rect (clockwise winding), the inner subpath is the hole rect wound
    // in the OPPOSITE direction (counter-clockwise). Evenodd fill-rule
    // treats overlapping opposite-wound regions as "outside", carving the
    // hole out of the outer rect. Plain L/H/V/Z commands (no corner
    // rounding) per the finding's explicit allowance — correctness of the
    // hole matters more than rounded corners here.
    const outer = 'M0 0H1600V900H0Z'
    const hole = width > 0 && height > 0 ? `M${left} ${top}V${bottom}H${right}V${top}Z` : ''

    voidClipPath.setAttribute('d', `${outer}${hole}`)
  }

  updateVoidClip()

  // --- Idle motion system (spec "Idle motion") — large-amplitude facet
  // drift, periodic rail sweep, band micro-shift, gradient stop drift, and
  // node pulses. `idleStopped` gates every self-rescheduling callback so
  // stopIdleTimelines() halts the whole system without individually
  // tracking every future scheduled call — same pattern as the retired
  // Kinetic Blueprint composable's timescale system. ---
  let idleStopped = true
  const idleTweens: gsap.core.Tween[] = []
  const idleDelayedCalls: gsap.core.Tween[] = []

  function gradientStopEls(gradientId: string): SVGStopElement[] {
    const el = svg.querySelector(`#${gradientId}`)
    return el ? (Array.from(el.children) as SVGStopElement[]) : []
  }

  // Facet drift: continuous, larger-amplitude, faster-cycling translate +
  // rotate + scale wander, so the structure clearly "breathes" without
  // needing to stare — amplitude/speed intentionally pushed past the first
  // pass (which read as too static/faint).
  function startFacetDrift() {
    for (const facet of facetEls()) {
      const runDrift = () => {
        if (idleStopped) return
        const distance = gsap.utils.random(28, 55)
        const angleRad = gsap.utils.random(0, 360) * (Math.PI / 180)
        idleTweens.push(
          gsap.to(facet, {
            x: Math.cos(angleRad) * distance,
            y: Math.sin(angleRad) * distance,
            rotation: gsap.utils.random(-3, 3),
            scale: gsap.utils.random(0.97, 1.06),
            duration: gsap.utils.random(5, 10),
            ease: 'sine.inOut',
            onComplete: runDrift
          })
        )
      }
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(0, 2), runDrift))
    }
  }

  // Self-rescheduling gradient-stop drift for one facet's <stop> elements.
  // Shared by startGradientDrift() (idle loop) and runFacetLock()'s
  // restart-after-overwrite path, so the two never drift out of sync with
  // each other's scheduling logic.
  function scheduleGradientDrift(stops: SVGStopElement[], initialDelay: [number, number] = [0, 3]) {
    const runDrift = () => {
      if (idleStopped) return
      const tl = gsap.timeline({ onComplete: runDrift })
      stops.forEach((stop) => {
        const base = Number(stop.dataset.stopOffset)
        const jitter = gsap.utils.random(-16, 16)
        tl.to(
          stop,
          {
            attr: { offset: `${Math.min(100, Math.max(0, base + jitter))}%` },
            duration: gsap.utils.random(6, 12),
            ease: 'sine.inOut'
          },
          0
        )
      })
      idleTweens.push(tl as unknown as gsap.core.Tween)
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(...initialDelay), runDrift))
  }

  function startGradientDrift() {
    for (const facet of composition.facets) {
      const stops = gradientStopEls(facet.gradientId)
      if (stops.length < 2) continue
      scheduleGradientDrift(stops)
    }
  }

  function runFacetLock() {
    const facets = facetEls()
    if (facets.length === 0) return

    const tl = gsap.timeline()
    for (const def of composition.facets) {
      const el = facetById(def.id)
      if (!el) continue
      // A single tween using back.out(1.4): GSAP's back-out ease already
      // overshoots past the target and settles back in one continuous
      // motion, giving the "mechanical click into place" feel the spec
      // calls for without layering a second tween on the same properties
      // (which would fight the first for control of x/y/rotation).
      tl.to(
        el,
        {
          x: def.lockTarget.x,
          y: def.lockTarget.y,
          rotation: def.lockTarget.rotation,
          scale: 1,
          duration: 1,
          ease: 'back.out(1.6)'
        },
        0
      )
    }

    for (const facet of composition.facets) {
      const stops = gradientStopEls(facet.gradientId)
      if (stops.length === 0) continue
      tl.to(
        stops,
        {
          attr: { offset: (i: number) => `${Math.min(100, Math.max(0, Number(stops[i]?.dataset.stopOffset) - 15))}%` },
          duration: 0.5,
          ease: 'power2.out',
          // GSAP's default overwrite for attr-tweens is false, so a
          // concurrent gradient-drift tween on the same <stop> offset
          // would keep running alongside this one and yank the value
          // mid-lock. 'auto' kills any conflicting in-flight tween on the
          // same property so the lock's convergence always wins cleanly.
          overwrite: 'auto'
        },
        0.8
      ).to(
        stops,
        {
          attr: { offset: (i: number) => `${stops[i]?.dataset.stopOffset}%` },
          duration: 1,
          ease: 'sine.inOut',
          overwrite: 'auto',
          // overwrite:'auto' above kills startGradientDrift()'s in-flight
          // timeline for this facet without firing its onComplete, which
          // is what reschedules the next drift cycle — left alone, that
          // facet's gradient drift would permanently stop after its first
          // lock event. Explicitly restart the drift loop for these stops
          // once the lock's relax finishes, so it always resumes.
          onComplete: () => {
            if (!idleStopped) scheduleGradientDrift(stops)
          }
        },
        1.8
      )
    }

    idleTweens.push(tl as unknown as gsap.core.Tween)
  }

  function startFacetLockLoop() {
    const runLoop = () => {
      if (idleStopped) return
      runFacetLock()
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(6, 10), runLoop))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(6, 10), runLoop))
  }

  function startIdleTimelines() {
    idleStopped = false
    startFacetDrift()
    startGradientDrift()
    startFacetLockLoop()
  }

  function stopIdleTimelines() {
    idleStopped = true
    for (const tween of idleTweens.splice(0)) tween.kill()
    for (const call of idleDelayedCalls.splice(0)) call.kill()
  }

  // --- Visibility / intersection pausing: genuinely stop/start idle
  // timelines, mirroring the retired composable's syncRunState pattern. ---
  let isVisible = true
  let isTabVisible = document.visibilityState === 'visible'
  let isRunning = false

  function syncRunState() {
    const shouldRun = isVisible && isTabVisible && !reducedMotion
    if (shouldRun && !isRunning) {
      isRunning = true
      startIdleTimelines()
    } else if (!shouldRun && isRunning) {
      isRunning = false
      stopIdleTimelines()
    }
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      syncRunState()
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(sectionEl)

  const handleVisibilityChange = () => {
    isTabVisible = document.visibilityState === 'visible'
    syncRunState()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // --- Resize: rebuild the facet/rail/band/node set only on an actual
  // tier crossing. viewBox + preserveAspectRatio absorbs same-tier resizes
  // with zero JS, except the void clip, which must track the content box
  // continuously (handled by contentResizeObserver below, independent of
  // tier). ---
  function reconcileTier() {
    const nextTier = getTier()
    if (nextTier === currentTier) {
      refreshPointerBounds()
      return
    }
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildFacets(currentTier)
    syncRunState()
    updateVoidClip()
    refreshPointerBounds()
    reconcilePointerState()
    buildScrollTimeline()
  }

  const resizeObserver = new ResizeObserver(() => reconcileTier())
  resizeObserver.observe(sectionEl)

  let contentResizeObserver: ResizeObserver | null = null
  if (contentEl) {
    contentResizeObserver = new ResizeObserver(() => updateVoidClip())
    contentResizeObserver.observe(contentEl)
  }

  // --- Pointer bounds: width/height/left are cached (only vertical
  // position changes across the pre-pin/pinned/post-pin scroll ranges,
  // since pin:true takes the section out of normal flow for the pinned
  // range). Top is read live in handlePointerMove instead of being
  // reconstructed from a cached document-space value, since that
  // reconstruction assumed normal document flow and went stale for the
  // entire pinned duration (finding #5). ---
  let cachedWidth = 0
  let cachedHeight = 0
  let cachedLeft = 0

  function refreshPointerBounds() {
    const rect = sectionEl.getBoundingClientRect()
    cachedWidth = rect.width
    cachedHeight = rect.height
    cachedLeft = rect.left
  }
  refreshPointerBounds()

  const rawPointer = { x: 0, y: 0 }
  const dampedPointer = { x: 0, y: 0 }

  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
    // ScrollTrigger's pin:true takes the section out of normal document
    // flow for the pinned range (position:fixed / pin-spacer equivalent),
    // so its viewport top stays constant while window.scrollY keeps
    // changing throughout the pin — reconstructing top from the
    // document-space cache goes stale for the entire pinned duration.
    // pointermove is already browser rate-limited (not a per-frame ticker
    // callback), so a live measurement here does not violate the
    // "never measure in the ticker hot path" constraint that applies to
    // pointerTick specifically. Width/height/left stay cached since only
    // vertical position changes during a pin.
    const currentTop = sectionEl.getBoundingClientRect().top
    rawPointer.x = ((event.clientX - cachedLeft) / cachedWidth) * 2 - 1
    rawPointer.y = -(((event.clientY - currentTop) / cachedHeight) * 2 - 1)
  }

  // Structure tension: each facet gets a small, capped nudge toward the
  // pointer — restrained per spec ("no glow, halo, magnetic blob, huge
  // deformation"). Written to --pointer-tension-x/-y custom properties
  // consumed by the standalone CSS `translate` property (see main.css),
  // which composes independently of GSAP's own x/y/rotation tweens (idle
  // drift, Facet Lock) since those apply via the separate `transform`
  // property — the two never fight over the same CSS property.
  function pointerTick() {
    const t = 1 - Math.exp(-6 * gsap.ticker.deltaRatio(60) * (1 / 60))
    dampedPointer.x += (rawPointer.x - dampedPointer.x) * t
    dampedPointer.y += (rawPointer.y - dampedPointer.y) * t

    for (const facet of facetEls()) {
      const depthFactor = facet.dataset.blueprintId === 'plate-a' ? 1 : facet.dataset.blueprintId === 'plate-b' ? 0.7 : 0.5
      const dx = dampedPointer.x * 16 * depthFactor
      const dy = dampedPointer.y * -16 * depthFactor
      facet.style.setProperty('--pointer-tension-x', `${dx}px`)
      facet.style.setProperty('--pointer-tension-y', `${dy}px`)
    }
  }

  // --- Pointer capability: dedicated MediaQueryList with its own change
  // listener, reconciled alongside (not only inside) tier changes. ---
  const pointerMql = window.matchMedia('(hover: hover) and (pointer: fine)')
  let isPointerActive = false

  function pointerShouldBeActive(): boolean {
    if (currentTier === 'mobile' || reducedMotion) return false
    return pointerMql.matches
  }

  function resetPointerTension() {
    for (const facet of facetEls()) {
      gsap.to(facet, { '--pointer-tension-x': '0px', '--pointer-tension-y': '0px', duration: 0.5, ease: 'power2.out' })
    }
    rawPointer.x = 0
    rawPointer.y = 0
    dampedPointer.x = 0
    dampedPointer.y = 0
  }

  function reconcilePointerState() {
    const shouldBeActive = pointerShouldBeActive()
    if (shouldBeActive && !isPointerActive) {
      isPointerActive = true
      refreshPointerBounds()
      sectionEl.addEventListener('pointermove', handlePointerMove, { passive: true })
      gsap.ticker.add(pointerTick)
    } else if (!shouldBeActive && isPointerActive) {
      isPointerActive = false
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
      resetPointerTension()
    }
  }

  reconcilePointerState()
  pointerMql.addEventListener('change', reconcilePointerState)

  // --- Reduced motion: idle timelines never start, and every facet is set
  // directly to its authored lockTarget (the Lock phase is the spec's
  // designated "strongest single frame") with no animation. ---
  function applyReducedMotionRestingState() {
    for (const def of composition.facets) {
      const el = facetById(def.id)
      if (!el) continue
      gsap.set(el, { x: def.lockTarget.x, y: def.lockTarget.y, rotation: def.lockTarget.rotation, scale: 1 })
    }
  }

  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches
    if (reducedMotion) {
      stopIdleTimelines()
      isRunning = false
      applyReducedMotionRestingState()
    } else {
      syncRunState()
    }
    reconcilePointerState()
    buildScrollTimeline() // no pin at all when reducedMotion is true; rebuilt fresh when it turns false
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  if (reducedMotion) {
    applyReducedMotionRestingState()
  }

  // --- Entry choreography: gated on introReady (the same page-load intro
  // gate Hero.vue's own headline reveal watches), sequenced alongside (not
  // blocking) that reveal. Uses the project's shared motionDuration/
  // motionEase tokens so timing matches the rest of the page, with a
  // refined per-facet stagger curve rather than uniform spacing. ---
  const { introReady } = useIntroReady()
  let entryTimeline: gsap.core.Timeline | null = null
  const stopIntroWatch = watch(
    introReady,
    (ready) => {
      if (!ready) return
      if (reducedMotion) return // resting state already applied above; no entry animation under reduced motion

      const facets = facetEls()
      gsap.set(facets, { opacity: 0, scale: 0.85 })

      entryTimeline = gsap.timeline()
      entryTimeline
        .to(facets, {
          opacity: (i, target) => composition.facets.find((f) => f.id === (target as SVGGElement).dataset.blueprintId)?.opacity || 0.3,
          scale: 1,
          duration: motionDuration.slow,
          ease: motionEase.standard,
          stagger: { each: motionStagger.loose, ease: 'power2.out' }
        })
        .call(() => {
          syncRunState() // starts idle motion once entry completes
        })
    },
    { immediate: true }
  )

  if (reducedMotion) {
    syncRunState() // no entry animation in this path — confirms idle stays stopped
  }
  // Otherwise, syncRunState() is called by the entry timeline's completion above.

  // --- Pinned scroll choreography (spec "Pinned scroll choreography").
  // One scrubbed timeline per the current tier's pin distance; rebuilt
  // whenever the tier crosses a breakpoint or reduced-motion toggles, so
  // distance/presence stays correct without a page reload. Every animated
  // value is transform (x/y/rotation/scale) / opacity / stroke-dashoffset
  // only — never a path `d` change. ---
  let scrollTimeline: gsap.core.Timeline | null = null
  let scrollTriggerInstance: ScrollTrigger | null = null

  function buildScrollTimeline() {
    scrollTriggerInstance?.kill()
    scrollTimeline?.kill()

    if (reducedMotion) {
      scrollTriggerInstance = null
      scrollTimeline = null
      return
    }

    const pinDistance = `+=${PIN_DISTANCE_VH[currentTier]}vh`
    const tl = gsap.timeline({ paused: true })

    // Phase labels at the spec's exact fractions.
    tl.addLabel('wake', 0)
      .addLabel('expansion', 0.2)
      .addLabel('lock', 0.45)
      .addLabel('release', 0.7)
      .addLabel('handoff', 0.9)
      .addLabel('end', 1)

    const order: ScrollPhaseName[] = ['wake', 'expansion', 'lock', 'release', 'handoff']

    for (const def of composition.facets) {
      const el = facetById(def.id)
      if (!el || !def.phases) continue
      for (const phaseName of order) {
        const target = def.phases[phaseName]
        if (!target) continue
        const vars: gsap.TweenVars = { duration: 0.2, ease: 'none' }
        if (typeof target.x === 'number') vars.x = target.x
        if (typeof target.y === 'number') vars.y = target.y
        if (typeof target.rotation === 'number') vars.rotation = target.rotation
        if (typeof target.scale === 'number') vars.scale = target.scale
        if (typeof target.opacity === 'number') vars.opacity = target.opacity
        tl.to(el, vars, phaseName)
      }
    }

    scrollTimeline = tl
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: pinDistance,
      pin: true,
      scrub: 1,
      animation: scrollTimeline,
      // Idle drift (facet x/y/rotation etc.) writes to the same properties
      // as this scrubbed timeline for the entire time the section is
      // intersecting, including while pinned — last-writer-wins jitter.
      // Stop idle motion for the duration of the pin and let it resume
      // (via syncRunState's normal isVisible/isTabVisible/reducedMotion
      // gate) once the user scrolls back above the pin start.
      onEnter: () => {
        stopIdleTimelines()
        isRunning = false
      },
      onLeaveBack: () => {
        syncRunState()
      }
    })
  }

  buildScrollTimeline()

  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    contentResizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (isPointerActive) {
      sectionEl.removeEventListener('pointermove', handlePointerMove)
      gsap.ticker.remove(pointerTick)
    }
    pointerMql.removeEventListener('change', reconcilePointerState)
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    stopIntroWatch()
    entryTimeline?.kill()
    scrollTriggerInstance?.kill()
    scrollTimeline?.kill()
  }
}
