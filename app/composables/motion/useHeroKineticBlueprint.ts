// app/composables/motion/useHeroKineticBlueprint.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getComposition,
  PIN_DISTANCE_VH,
  type BlueprintTier,
  type FacetDef,
  type GradientDef,
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
  const railGroup = svg.querySelector('[data-blueprint-group="rail"]') as SVGGElement
  const bandGroup = svg.querySelector('[data-blueprint-group="band"]') as SVGGElement
  const nodesGroup = svg.querySelector('[data-blueprint-group="nodes"]') as SVGGElement
  const voidHoleRect = svg.querySelector('[data-void-hole]') as SVGRectElement
  voidHoleRect.setAttribute('clip-rule', 'evenodd')

  let composition: SignalComposition = getComposition(currentTier)
  let builtTier: BlueprintTier | null = null

  function facetEls(): SVGGElement[] {
    return Array.from(facetsGroup.children) as SVGGElement[]
  }
  function railEl(): SVGLineElement | null {
    return railGroup.querySelector('[data-blueprint-id="primary-rail"]')
  }
  function bandEl(): SVGPathElement | null {
    return bandGroup.querySelector('[data-blueprint-id="secondary-band"]')
  }
  function nodeEls(): SVGCircleElement[] {
    return Array.from(nodesGroup.children) as SVGCircleElement[]
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

    railGroup.replaceChildren()
    const rail = document.createElementNS(NS, 'line')
    const [, x1, y1, , x2, y2] = composition.rail.d.match(/M ([-.\d]+) ([-.\d]+) L ([-.\d]+) ([-.\d]+)/) ?? []
    rail.setAttribute('x1', x1 ?? '0')
    rail.setAttribute('y1', y1 ?? '0')
    rail.setAttribute('x2', x2 ?? '0')
    rail.setAttribute('y2', y2 ?? '0')
    rail.dataset.blueprintId = composition.rail.id
    rail.setAttribute('class', 'signal-architecture__rail')
    railGroup.appendChild(rail)

    bandGroup.replaceChildren()
    const band = document.createElementNS(NS, 'path')
    band.setAttribute('d', composition.band.d)
    band.dataset.blueprintId = composition.band.id
    band.setAttribute('class', 'signal-architecture__band')
    bandGroup.appendChild(band)

    nodesGroup.replaceChildren()
    for (const def of composition.nodes) {
      const circle = document.createElementNS(NS, 'circle')
      circle.setAttribute('cx', String(def.cx))
      circle.setAttribute('cy', String(def.cy))
      circle.setAttribute('r', String(def.r))
      circle.dataset.blueprintId = def.id
      circle.setAttribute('class', 'signal-architecture__node')
      nodesGroup.appendChild(circle)
    }
  }

  buildFacets(currentTier)

  // --- Void clip: keeps the headline/subtext/CTA union bounding box free
  // of any facet/band coverage, tracked live against the actual DOM
  // content rather than a fixed guess (spec "Negative-space void"). ---
  const VOID_BUFFER_PX = 32
  const VOID_RADIUS = 10

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
    const width = contentRect.width * scale + VOID_BUFFER_PX * 2
    const height = contentRect.height * scale + VOID_BUFFER_PX * 2

    voidHoleRect.setAttribute('x', String(left))
    voidHoleRect.setAttribute('y', String(top))
    voidHoleRect.setAttribute('width', String(Math.max(0, width)))
    voidHoleRect.setAttribute('height', String(Math.max(0, height)))
    voidHoleRect.setAttribute('rx', String(VOID_RADIUS))
    voidHoleRect.setAttribute('ry', String(VOID_RADIUS))
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

  function startFacetDrift() {
    for (const facet of facetEls()) {
      const runDrift = () => {
        if (idleStopped) return
        const distance = gsap.utils.random(15, 30)
        const angleRad = gsap.utils.random(0, 360) * (Math.PI / 180)
        idleTweens.push(
          gsap.to(facet, {
            x: Math.cos(angleRad) * distance,
            y: Math.sin(angleRad) * distance,
            rotation: gsap.utils.random(-1.5, 1.5),
            duration: gsap.utils.random(8, 16),
            ease: 'sine.inOut',
            onComplete: runDrift
          })
        )
      }
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(0, 4), runDrift))
    }
  }

  function startRailSweep() {
    const rail = railEl()
    if (!rail) return
    const length = rail.getTotalLength()
    rail.style.strokeDasharray = String(length)
    const runSweep = () => {
      if (idleStopped) return
      idleTweens.push(
        gsap.fromTo(
          rail,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: gsap.utils.random(10, 14), ease: 'sine.inOut', onComplete: runSweep }
        )
      )
    }
    runSweep()
  }

  function startBandShift() {
    const band = bandEl()
    if (!band) return
    const runShift = () => {
      if (idleStopped) return
      idleTweens.push(
        gsap.to(band, {
          x: gsap.utils.random(-15, 15),
          duration: gsap.utils.random(12, 20),
          ease: 'sine.inOut',
          onComplete: runShift
        })
      )
    }
    runShift()
  }

  function startGradientDrift() {
    for (const facet of composition.facets) {
      const stops = gradientStopEls(facet.gradientId)
      if (stops.length < 2) continue
      const runDrift = () => {
        if (idleStopped) return
        const tl = gsap.timeline({ onComplete: runDrift })
        stops.forEach((stop, i) => {
          const base = Number(stop.dataset.stopOffset)
          const jitter = gsap.utils.random(-8, 8)
          tl.to(
            stop,
            {
              attr: { offset: `${Math.min(100, Math.max(0, base + jitter))}%` },
              duration: gsap.utils.random(10, 18),
              ease: 'sine.inOut'
            },
            0
          )
        })
        idleTweens.push(tl as unknown as gsap.core.Tween)
      }
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(0, 5), runDrift))
    }
  }

  function startNodePulse() {
    for (const node of nodeEls()) {
      idleTweens.push(
        gsap.to(node, {
          scale: 1.25,
          transformOrigin: 'center',
          duration: gsap.utils.random(3, 6),
          delay: gsap.utils.random(0, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      )
    }
  }

  function activateNode(node: SVGCircleElement, duration = 0.4) {
    node.dataset.active = 'true'
    idleTweens.push(
      gsap.to(node, {
        scale: 1.4,
        duration: duration * 0.5,
        yoyo: true,
        repeat: 1,
        transformOrigin: 'center',
        ease: 'power2.out',
        onComplete: () => {
          node.dataset.active = 'false'
        }
      })
    )
  }

  function runFacetLock() {
    const facets = facetEls()
    if (facets.length === 0) return
    const rail = railEl()
    const nodes = nodeEls()

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
          duration: 1.2,
          ease: 'back.out(1.4)'
        },
        0
      )
    }

    if (rail) {
      tl.to(rail, { opacity: 1, strokeWidth: 6, duration: 0.3, ease: 'power2.out' }, 1.0).to(
        rail,
        { opacity: 0.75, strokeWidth: 4, duration: 0.6, ease: 'power2.inOut' },
        1.6
      )
    }

    for (const facet of composition.facets) {
      const stops = gradientStopEls(facet.gradientId)
      if (stops.length === 0) continue
      tl.to(
        stops,
        { attr: { offset: (i: number) => `${Math.min(100, Math.max(0, Number(stops[i]?.dataset.stopOffset) - 15))}%` }, duration: 0.6, ease: 'power2.out' },
        1.0
      ).to(stops, { attr: { offset: (i: number) => `${stops[i]?.dataset.stopOffset}%` }, duration: 1.2, ease: 'sine.inOut' }, 2.2)
    }

    if (nodes.length > 0) {
      tl.call(() => {
        nodes.slice(0, Math.min(2, nodes.length)).forEach((n) => activateNode(n, 0.5))
      }, undefined, 1.0)
    }

    idleTweens.push(tl as unknown as gsap.core.Tween)
  }

  function startFacetLockLoop() {
    const runLoop = () => {
      if (idleStopped) return
      runFacetLock()
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 14), runLoop))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 14), runLoop))
  }

  function startIdleTimelines() {
    idleStopped = false
    startFacetDrift()
    startRailSweep()
    startBandShift()
    startGradientDrift()
    startNodePulse()
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
  }

  const resizeObserver = new ResizeObserver(() => reconcileTier())
  resizeObserver.observe(sectionEl)

  let contentResizeObserver: ResizeObserver | null = null
  if (contentEl) {
    contentResizeObserver = new ResizeObserver(() => updateVoidClip())
    contentResizeObserver.observe(contentEl)
  }

  // --- Pointer bounds cached in document space, not viewport space, since
  // the Hero moves relative to the viewport across the pre-pin/pinned/
  // post-pin scroll ranges. ---
  let cachedWidth = 0
  let cachedHeight = 0
  let cachedLeft = 0
  let cachedDocumentTop = 0

  function refreshPointerBounds() {
    const rect = sectionEl.getBoundingClientRect()
    cachedWidth = rect.width
    cachedHeight = rect.height
    cachedLeft = rect.left
    cachedDocumentTop = rect.top + window.scrollY
  }
  refreshPointerBounds()

  const rawPointer = { x: 0, y: 0 }
  const dampedPointer = { x: 0, y: 0 }

  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
    const currentTop = cachedDocumentTop - window.scrollY
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
      const dx = dampedPointer.x * 8 * depthFactor
      const dy = dampedPointer.y * -8 * depthFactor
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
      gsap.set(el, { x: def.lockTarget.x, y: def.lockTarget.y, rotation: def.lockTarget.rotation })
    }
    const nodes = nodeEls()
    nodes.slice(0, Math.min(2, nodes.length)).forEach((n) => {
      n.dataset.active = 'true'
    })
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
      const rail = railEl()
      const band = bandEl()

      gsap.set(facets, { opacity: 0, scale: 0.9 })
      if (rail) gsap.set(rail, { opacity: 0 })
      if (band) gsap.set(band, { opacity: 0 })

      entryTimeline = gsap.timeline()
      entryTimeline
        .to(facets, {
          opacity: (i, target) => Number(target.style.opacity) || composition.facets.find((f) => f.id === (target as SVGGElement).dataset.blueprintId)?.opacity || 0.3,
          scale: 1,
          duration: motionDuration.slow,
          ease: motionEase.standard,
          stagger: { each: motionStagger.loose, ease: 'power2.out' }
        })
        .to(rail ? [rail] : [], { opacity: 0.75, duration: motionDuration.editorial, ease: motionEase.standard }, '-=0.4')
        .to(band ? [band] : [], { opacity: 1, duration: motionDuration.editorial, ease: motionEase.standard }, '-=0.5')
        .call(() => {
          const nodes = nodeEls()
          nodes.slice(0, Math.min(2, nodes.length)).forEach((n) => activateNode(n, 0.5))
        })
        .call(() => {
          syncRunState() // starts idle motion (Task 5-6 systems) once entry completes
        })
    },
    { immediate: true }
  )

  if (reducedMotion) {
    syncRunState() // no entry animation in this path — confirms idle stays stopped
  }
  // Otherwise, syncRunState() is called by the entry timeline's completion above.

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
  }
}
