// app/composables/motion/useHeroKineticBlueprint.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getComposition,
  PIN_DISTANCE_VH,
  type BlueprintComposition,
  type BlueprintElementDef,
  type BlueprintTier
} from './kineticBlueprintPaths'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export interface UseHeroKineticBlueprintOptions {
  sectionEl: Ref<HTMLElement | null>
}

export function useHeroKineticBlueprint(
  svgEl: Ref<SVGSVGElement | null>,
  options: UseHeroKineticBlueprintOptions
): () => void {
  if (!import.meta.client || !svgEl.value) return () => {}

  const svg = svgEl.value
  const sectionEl = options.sectionEl.value ?? svg.closest('section') ?? svg.parentElement!

  // --- Responsive tier: re-evaluated live (never captured once), matching
  // the pattern in useHeroLivingSurface.ts. Desktop >=1024px, tablet
  // 640-1023px, mobile <640px per spec "Responsive art direction". ---
  function getTier(): BlueprintTier {
    if (window.matchMedia('(max-width: 639px)').matches) return 'mobile'
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet'
    return 'desktop'
  }
  let currentTier: BlueprintTier = getTier()

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches

  const NS = 'http://www.w3.org/2000/svg'

  function makePath(def: BlueprintElementDef, extraClass: string): SVGGElement {
    const g = document.createElementNS(NS, 'g')
    g.dataset.blueprintId = def.id
    if (def.role) g.dataset.role = def.role
    if (def.idle?.transform) g.style.transform = def.idle.transform
    if (typeof def.idle?.opacity === 'number') g.style.opacity = String(def.idle.opacity)

    const path = document.createElementNS(NS, 'path')
    path.setAttribute('d', def.d)
    path.setAttribute('class', extraClass)
    if (typeof def.idle?.strokeDashoffset === 'number') {
      const length = path.getTotalLength?.() ?? 0
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(def.idle.strokeDashoffset)
    }
    g.appendChild(path)
    return g
  }

  // Groups holding each element category, rebuilt on a tier crossing.
  const massesGroup = document.createElementNS(NS, 'g')
  massesGroup.dataset.blueprintGroup = 'masses'
  const linesGroup = document.createElementNS(NS, 'g')
  linesGroup.dataset.blueprintGroup = 'lines'
  const gridGroup = document.createElementNS(NS, 'g')
  gridGroup.dataset.blueprintGroup = 'grid'
  const registrationGroup = document.createElementNS(NS, 'g')
  registrationGroup.dataset.blueprintGroup = 'registration'
  const nodesGroup = document.createElementNS(NS, 'g')
  nodesGroup.dataset.blueprintGroup = 'nodes'
  svg.append(massesGroup, gridGroup, linesGroup, registrationGroup, nodesGroup)

  let composition: BlueprintComposition = getComposition(currentTier)

  // Tracks the tier `buildElements` last ran for, so a resize that doesn't
  // cross a tier boundary never rebuilds the DOM (mirrors
  // useHeroLivingSurface.ts's `builtSegments` guard).
  let builtTier: BlueprintTier | null = null

  function shouldInclude(def: BlueprintElementDef, tier: BlueprintTier): boolean {
    if (tier === 'desktop') return true
    // Tablet and mobile both skip 'secondary' elements — tablet reuses
    // desktop's coordinate set (see kineticBlueprintPaths.ts), mobile has
    // its own set that only defines primary-tier elements to begin with.
    return def.detail !== 'secondary'
  }

  function clearGroup(group: SVGGElement) {
    group.replaceChildren()
  }

  function buildElements(tier: BlueprintTier) {
    if (builtTier === tier) return
    builtTier = tier
    composition = getComposition(tier)

    clearGroup(massesGroup)
    clearGroup(linesGroup)
    clearGroup(gridGroup)
    clearGroup(registrationGroup)
    clearGroup(nodesGroup)

    for (const def of composition.masses) {
      if (!shouldInclude(def, tier)) continue
      massesGroup.appendChild(makePath(def, 'kinetic-blueprint__mass'))
    }
    for (const def of composition.constructionLines) {
      if (!shouldInclude(def, tier)) continue
      linesGroup.appendChild(makePath(def, 'kinetic-blueprint__line'))
    }
    for (const def of composition.gridLines) {
      if (!shouldInclude(def, tier)) continue
      gridGroup.appendChild(makePath(def, 'kinetic-blueprint__grid'))
    }
    for (const def of composition.registrationMarks) {
      if (!shouldInclude(def, tier)) continue
      registrationGroup.appendChild(makePath(def, 'kinetic-blueprint__registration'))
    }
    for (const def of composition.nodes) {
      if (!shouldInclude(def, tier)) continue
      nodesGroup.appendChild(makePath(def, 'kinetic-blueprint__node'))
    }
  }

  buildElements(currentTier)

  // --- Idle motion system (spec "Idle motion system") — 4 independently
  // scheduled timescales so no obvious repeat point emerges. `idleStopped`
  // gates every self-rescheduling callback (C, D, and B's chain) so
  // stopIdleTimelines() can halt the whole system without individually
  // tracking every future scheduled call. ---
  let idleStopped = false
  const idleTweens: gsap.core.Tween[] = []
  const idleDelayedCalls: gsap.core.Tween[] = []

  function activeMasses(): SVGGElement[] {
    return Array.from(massesGroup.children) as SVGGElement[]
  }
  function activeLines(): SVGGElement[] {
    return Array.from(linesGroup.children) as SVGGElement[]
  }
  function activeGridLines(): SVGGElement[] {
    return Array.from(gridGroup.children) as SVGGElement[]
  }
  function activeNodes(): SVGGElement[] {
    return Array.from(nodesGroup.children) as SVGGElement[]
  }

  function startTimescaleA() {
    // Grid-line drift: ±1-2px, 3-6s, repeat:-1 yoyo, staggered start delays.
    for (const grid of activeGridLines()) {
      const dx = gsap.utils.random(-2, 2)
      const dy = gsap.utils.random(-1, 1)
      idleTweens.push(
        gsap.to(grid, {
          x: `+=${dx}`,
          y: `+=${dy}`,
          duration: gsap.utils.random(3, 6),
          delay: gsap.utils.random(0, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      )
    }
    // Node scale pulses: 1 <-> 1.08.
    for (const node of activeNodes()) {
      idleTweens.push(
        gsap.to(node, {
          scale: 1.08,
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

  function startTimescaleB() {
    const masses = activeMasses()
    if (masses.length === 0) return

    // Left mass slides along its own diagonal axis (10-20px), then chains to
    // a freshly-randomized next move rather than repeating — this is what
    // keeps timescale B from ever reading as a fixed-period loop.
    const leftMass = masses.find((m) => m.dataset.blueprintId === 'mass-left')
    if (leftMass) {
      const runSlide = () => {
        if (idleStopped) return
        const distance = gsap.utils.random(10, 20)
        const angleRad = gsap.utils.random(15, 20) * (Math.PI / 180)
        idleTweens.push(
          gsap.to(leftMass, {
            x: `+=${Math.sin(angleRad) * distance}`,
            y: `+=${Math.cos(angleRad) * distance}`,
            duration: gsap.utils.random(5, 12),
            ease: 'sine.inOut',
            onComplete: runSlide
          })
        )
      }
      runSlide()
    }

    // One long construction line's stroke-dashoffset extends/retracts.
    const longLine = activeLines()[0]?.querySelector('path')
    if (longLine) {
      const length = longLine.getTotalLength()
      longLine.style.strokeDasharray = String(length)
      const runDraw = () => {
        if (idleStopped) return
        idleTweens.push(
          gsap.to(longLine, {
            strokeDashoffset: gsap.utils.random(0, length * 0.4),
            duration: gsap.utils.random(5, 12),
            ease: 'sine.inOut',
            onComplete: runDraw
          })
        )
      }
      runDraw()
    }
  }

  function activateNode(node: SVGGElement, duration = 0.4) {
    node.dataset.active = 'true'
    idleTweens.push(
      gsap.to(node, {
        scale: 1.3,
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

  function drawRandomLine() {
    const lines = activeLines()
    const target = lines[Math.floor(Math.random() * lines.length)]?.querySelector('path')
    if (!target) return
    const length = target.getTotalLength()
    target.style.strokeDasharray = String(length)
    idleTweens.push(gsap.fromTo(target, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }))
  }

  function startTimescaleC() {
    const runEvent = () => {
      if (idleStopped) return
      const nodes = activeNodes()
      const choice = Math.floor(gsap.utils.random(0, 3))
      if (choice === 0) drawRandomLine()
      else if (choice === 1 && nodes.length > 0) activateNode(nodes[Math.floor(Math.random() * nodes.length)]!)
      else if (nodes.length > 0) activateNode(nodes[Math.floor(Math.random() * nodes.length)]!, 0.6)

      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(3, 7), runEvent))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(3, 7), runEvent))
  }

  // Signature-moment variants (spec: "3-4 pre-authored variants" so repeats
  // aren't identical) — each picks a small set of lines + one node to
  // converge toward, then retract. Indices are defensive-checked against
  // the current tier's actual element count since mobile has fewer lines.
  const signatureVariants: Array<() => void> = [
    () => runSignature([0, 1], 0),
    () => runSignature([1, 2], 1),
    () => runSignature([0], 0)
  ]

  function runSignature(lineIndices: number[], nodeIndex: number) {
    const lines = activeLines()
      .map((g) => g.querySelector('path'))
      .filter((p): p is SVGPathElement => !!p)
    const nodes = activeNodes()
    const selectedLines = lineIndices.map((i) => lines[i]).filter((p): p is SVGPathElement => !!p)
    const node = nodes[nodeIndex] ?? nodes[0]
    if (selectedLines.length === 0 && !node) return

    const tl = gsap.timeline()
    for (const line of selectedLines) {
      const length = line.getTotalLength()
      line.style.strokeDasharray = String(length)
      tl.fromTo(line, { strokeDashoffset: length, opacity: 0.4 }, { strokeDashoffset: 0, opacity: 0.8, duration: 0.9, ease: 'power2.out' }, 0)
    }
    if (node) {
      tl.call(() => activateNode(node, 0.6), undefined, 0.7)
    }
    tl.to(
      selectedLines,
      { opacity: 0.15, duration: 1.2, ease: 'power2.in' },
      1.6
    )
    idleTweens.push(tl as unknown as gsap.core.Tween)
  }

  function startTimescaleD() {
    const runSignatureMoment = () => {
      if (idleStopped) return
      const variant = signatureVariants[Math.floor(Math.random() * signatureVariants.length)]
      variant?.()
      idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 15), runSignatureMoment))
    }
    idleDelayedCalls.push(gsap.delayedCall(gsap.utils.random(8, 15), runSignatureMoment))
  }

  function startIdleTimelines() {
    idleStopped = false
    startTimescaleA()
    startTimescaleB()
    startTimescaleC()
    startTimescaleD()
  }

  function stopIdleTimelines() {
    idleStopped = true
    for (const tween of idleTweens.splice(0)) tween.kill()
    for (const call of idleDelayedCalls.splice(0)) call.kill()
  }

  // --- Visibility / intersection pausing: genuinely stop/start idle
  // timelines, mirroring useHeroLivingSurface.ts's syncLoopState pattern. ---
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

  // --- Resize: rebuild the element set only on an actual tier crossing.
  // viewBox + preserveAspectRatio (set in HeroKineticBlueprint.vue's
  // template) absorbs same-tier resizes with zero JS. ---
  function reconcileTier() {
    const nextTier = getTier()
    if (nextTier === currentTier) {
      refreshPointerBounds()
      return
    }
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildElements(currentTier)
    syncRunState()
    refreshPointerBounds()
    reconcilePointerState()
    buildScrollTimeline()
  }

  const resizeObserver = new ResizeObserver(() => reconcileTier())
  resizeObserver.observe(sectionEl)

  // --- Pointer bounds cached in document space, not viewport space, since
  // the Hero moves relative to the viewport across the pre-pin/pinned/
  // post-pin scroll ranges (spec "Performance / lifecycle strategy"). ---
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

  // Raw normalized pointer position (-1..1), updated only by the listener.
  const rawPointer = { x: 0, y: 0 }
  // Damped pointer position consumed by the gsap.ticker callback.
  const dampedPointer = { x: 0, y: 0 }

  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
    const currentTop = cachedDocumentTop - window.scrollY
    rawPointer.x = ((event.clientX - cachedLeft) / cachedWidth) * 2 - 1
    rawPointer.y = -(((event.clientY - currentTop) / cachedHeight) * 2 - 1)
  }

  // Elements currently nudged by pointer proximity, so they can be eased
  // back to baseline on detach (spec: "tween any pointer-nudged elements
  // back to their idle-timeline baseline").
  let nudgedElements: SVGGElement[] = []

  function pointerTick() {
    const t = 1 - Math.exp(-8 * gsap.ticker.deltaRatio(60) * (1 / 60))
    dampedPointer.x += (rawPointer.x - dampedPointer.x) * t
    dampedPointer.y += (rawPointer.y - dampedPointer.y) * t

    // Nudge the 2-3 nearest lines/nodes toward the pointer, capped magnitude.
    const candidates = [...activeLines(), ...activeNodes()]
    const withDistance = candidates
      .map((el) => {
        const cx = el.getBBox().x + el.getBBox().width / 2
        const cy = el.getBBox().y + el.getBBox().height / 2
        const px = (dampedPointer.x * 0.5 + 0.5) * 1600
        const py = (dampedPointer.y * -0.5 + 0.5) * 900
        return { el, dist: Math.hypot(cx - px, cy - py) }
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)

    nudgedElements = withDistance.map((c) => c.el)
    for (const { el, dist } of withDistance) {
      const influence = Math.max(0, 1 - dist / 400)
      const dx = dampedPointer.x * 6 * influence
      const dy = dampedPointer.y * -6 * influence
      el.style.setProperty('--pointer-nudge-x', `${dx}px`)
      el.style.setProperty('--pointer-nudge-y', `${dy}px`)
      el.style.translate = `var(--pointer-nudge-x, 0px) var(--pointer-nudge-y, 0px)`
    }
  }

  // --- Pointer capability: dedicated MediaQueryList with its own change
  // listener, reconciled alongside (not only inside) tier changes — a
  // tablet can gain a mouse/trackpad with zero resize event (spec "Pointer
  // lifecycle"). ---
  const pointerMql = window.matchMedia('(hover: hover) and (pointer: fine)')
  let isPointerActive = false

  function pointerShouldBeActive(): boolean {
    if (currentTier === 'mobile' || reducedMotion) return false
    return pointerMql.matches
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
      // Ease nudged elements back to baseline so nothing is left visually
      // offset with no system driving it back.
      for (const el of nudgedElements) {
        gsap.to(el, { '--pointer-nudge-x': '0px', '--pointer-nudge-y': '0px', duration: 0.5, ease: 'power2.out' })
      }
      nudgedElements = []
      rawPointer.x = 0
      rawPointer.y = 0
      dampedPointer.x = 0
      dampedPointer.y = 0
    }
    // If state is unchanged: no-op — idempotent, matching usePointerVelocity's
    // start()/stop() guard pattern, so the two independent triggers below
    // (tier reconciliation and the pointerMql change event) can never
    // produce duplicate listeners/ticker callbacks even if they fire close
    // together.
  }

  reconcilePointerState() // initial pointer-state evaluation at setup

  pointerMql.addEventListener('change', reconcilePointerState)

  // --- Reduced motion: idle timelines never start, no ScrollTrigger pin
  // (added in Task 8) is created, and a single static fully-composed frame
  // is shown instead — approximating the Convergence/Resolution visual
  // target, expressed directly via each element's `idle` values already
  // applied by `makePath`, so no extra GSAP .set() work is needed beyond
  // nudging opacity slightly up for a couple of key nodes. ---
  function applyReducedMotionRestingState() {
    const nodes = activeNodes()
    // 2-3 active yellow nodes, per spec.
    nodes.slice(0, Math.min(3, nodes.length)).forEach((node) => {
      node.dataset.active = 'true'
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
    buildScrollTimeline() // no pin at all when reducedMotion is true; rebuilt fresh when it turns false
  }
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

  if (reducedMotion) {
    applyReducedMotionRestingState()
  }

  // --- Entry choreography: gated on introReady, sequenced alongside (not
  // blocking) Hero.vue's own headline reveal. Uses existing motionDuration/
  // motionEase tokens so the timing language matches the rest of the page. ---
  const { introReady } = useIntroReady()
  let entryTimeline: gsap.core.Timeline | null = null
  const stopIntroWatch = watch(
    introReady,
    (ready) => {
      if (!ready) return
      if (reducedMotion) return // resting state already applied above; no entry animation under reduced motion

      entryTimeline = gsap.timeline()
      entryTimeline
        .from(activeGridLines(), { opacity: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base })
        .from(activeMasses(), { opacity: 0, scale: 0.92, duration: motionDuration.slow, ease: motionEase.standard, transformOrigin: 'center' }, '-=0.3')
        .from(
          activeLines().map((g) => g.querySelector('path')).filter(Boolean),
          { opacity: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger: motionStagger.base },
          '-=0.4'
        )
        .call(() => {
          const nodes = activeNodes()
          nodes.slice(0, Math.min(3, nodes.length)).forEach((node) => activateNode(node, 0.5))
        })
        .call(() => {
          syncRunState() // starts idle timelines A-D once entry completes
        })
    },
    { immediate: true }
  )

  // --- Pinned scroll choreography (spec "Scroll choreography"). One
  // scrubbed timeline per the current tier's pin distance; rebuilt whenever
  // the tier crosses a breakpoint so distance stays correct without a page
  // reload. Every animated value is transform/opacity/strokeDashoffset only
  // — never a path `d` change (spec "SVG animation technique constraint"). ---
  let scrollTimeline: gsap.core.Timeline | null = null
  let scrollTriggerInstance: ScrollTrigger | null = null

  function activeRegistrationMarks(): SVGGElement[] {
    return Array.from(registrationGroup.children) as SVGGElement[]
  }

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

    const massEls = activeMasses()
    const lineEls = activeLines()
    const guideEls = [...massEls, ...lineEls, ...activeGridLines(), ...activeRegistrationMarks()].filter(
      (el) => el.dataset.role === 'guide'
    )

    function massById(id: string): SVGGElement | undefined {
      return massEls.find((el) => el.dataset.blueprintId === id)
    }

    // Phase labels at 0/.2/.45/.7/.9/1 (spec exact fractions).
    tl.addLabel('calibration', 0)
      .addLabel('construction', 0.2)
      .addLabel('convergence', 0.45)
      .addLabel('resolution', 0.7)
      .addLabel('handoff', 0.9)
      .addLabel('end', 1)

    // Drive each mass through its authored per-phase transform/opacity
    // targets (from kineticBlueprintPaths.ts), one segment per phase
    // transition, so scrub position always corresponds to an interpolated
    // point between two authored states — never a jump.
    for (const def of composition.masses) {
      const el = massById(def.id)
      if (!el || !def.phases) continue
      const order: Array<keyof NonNullable<typeof def.phases>> = [
        'calibration',
        'construction',
        'convergence',
        'resolution',
        'handoff'
      ]
      for (const phaseName of order) {
        const target = def.phases[phaseName]
        if (!target) continue
        const vars: gsap.TweenVars = { duration: 0.2, ease: 'none' }
        if (typeof target.opacity === 'number') vars.opacity = target.opacity
        if (target.transform) {
          // GSAP can't tween a raw CSS transform string target directly on
          // an SVG <g> alongside x/y/scale shorthand reliably across
          // browsers, so instead parse the authored transform string's
          // translate/scale components into GSAP's own x/y/scale props,
          // which it tweens natively via its internal CSSPlugin-equivalent
          // SVG transform handling.
          const translateMatch = target.transform.match(/translate\(([-.\d]+)px,\s*([-.\d]+)px\)/)
          const scaleMatch = target.transform.match(/scale\(([-.\d]+)\)/)
          if (translateMatch) {
            vars.x = Number(translateMatch[1])
            vars.y = Number(translateMatch[2])
          }
          if (scaleMatch) {
            vars.scale = Number(scaleMatch[1])
          }
        }
        tl.to(el, vars, phaseName)
      }
    }

    // Secondary/guide elements fade out specifically during Resolution
    // (70-90%), per spec.
    if (guideEls.length > 0) {
      tl.to(guideEls, { opacity: 0, duration: 0.2, ease: 'none' }, 'resolution')
    }

    // Idle-mix crossfade during Calibration (0-20%): idle timelines' visual
    // influence reduces without killing them, so scrolling back up resumes
    // idle motion smoothly. Represented as a CSS custom property read by
    // idle tweens' targets — simplest correct implementation is to scale
    // down the opacity of non-key nodes during this phase.
    const nodeEls = activeNodes()
    const keyNodeIds = new Set(['node-1', 'node-2', 'node-5'])
    const nonKeyNodes = nodeEls.filter((n) => !keyNodeIds.has(n.dataset.blueprintId ?? ''))
    if (nonKeyNodes.length > 0) {
      tl.to(nonKeyNodes, { opacity: 0.3, duration: 0.2, ease: 'none' }, 'calibration')
    }

    // Handoff (90-100%): bottom band + a couple of lines already animate
    // downward via their authored 'handoff' phase target above (mass-bottom
    // translateY). No additional work needed here beyond what the per-mass
    // loop already applied.

    scrollTimeline = tl
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: pinDistance,
      pin: true,
      scrub: 1,
      animation: scrollTimeline
    })
  }

  buildScrollTimeline()

  if (reducedMotion) {
    syncRunState() // no entry animation in this path — start (or rather, confirm not-started) idle state immediately
  }
  // Otherwise, syncRunState() is called by the entry timeline's completion above.

  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
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
