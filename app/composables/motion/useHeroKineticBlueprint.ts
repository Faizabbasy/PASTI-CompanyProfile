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

  startIdleTimelines()

  return () => {
    stopIdleTimelines()
  }
}
