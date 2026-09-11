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

  return () => {
    // Cleanup body filled in by later tasks (ResizeObserver, IntersectionObserver,
    // ScrollTrigger, idle timelines, pointer listeners all disconnect here).
  }
}
