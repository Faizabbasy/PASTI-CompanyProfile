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

  // --- Idle system start/stop — bodies filled in by Task 5. Declared here
  // so the visibility/intersection lifecycle wiring in this task has a
  // stable pair of functions to call; Task 5 replaces these two function
  // bodies without touching this section. ---
  let idleStopped = true
  function startIdleTimelines() {
    idleStopped = false
  }
  function stopIdleTimelines() {
    idleStopped = true
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
    if (nextTier === currentTier) return
    currentTier = nextTier
    stopIdleTimelines()
    isRunning = false
    buildFacets(currentTier)
    syncRunState()
    updateVoidClip()
  }

  const resizeObserver = new ResizeObserver(() => reconcileTier())
  resizeObserver.observe(sectionEl)

  let contentResizeObserver: ResizeObserver | null = null
  if (contentEl) {
    contentResizeObserver = new ResizeObserver(() => updateVoidClip())
    contentResizeObserver.observe(contentEl)
  }

  syncRunState()

  return () => {
    stopIdleTimelines()
    intersectionObserver.disconnect()
    resizeObserver.disconnect()
    contentResizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
