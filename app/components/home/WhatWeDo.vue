<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// MILESTONE 4B — What We Build, total rework per
// docs/rework-v2/04-homepage-spec.md §2 ("Controlled Expansion" / "One
// Visual Anchor, Not One Superior Capability" / "Engineered Takeover, not
// Theatrical or Sci-Fi Effect" / "Typographic Clusters / Glyph Slices, Not
// Particles"). This replaces the previous light-themed, non-pinned
// EditorialIntro + prose block entirely — that composition had no curtain,
// no decode, no card system, and ran on the light Yellow-accented shared
// editorial treatment. Discarded per the milestone's guardrail: frozen docs
// win over existing component structure.
//
// The previously separate `ServiceCards`/`ServiceRow` legacy section is
// retired as an independent section per user decision: the frozen spec has
// no standalone "Service Cards" section — What We Build's own 4 capability
// cards ARE that content now. 4 of the 5 real services become the card copy
// (Primary/Medium A/Medium B/Accent); "Cybersecurity & Compliance" is
// dropped per user decision as the least representative of PASTI's core
// capabilities relative to the other four. `useServices()` below is the only
// surviving piece of that cluster, still actively consumed here.
//
// POLISH PASS (post-Milestone 7): the frozen sequence (curtain -> pin ->
// decode -> cluster break -> card emergence -> fan -> decay -> exit) is
// unchanged. What changed is the craft inside each stage — see the plan in
// the git history: headline is the section name, the cluster break is real
// glyph slices, cards carry line illustrations, a segmented Signal rail
// tracks the phases, and the settled fan responds to the pointer.

const { services } = useServices()
// [0]=Technology Development -> Primary, [1]=Enterprise Platforms -> Medium A,
// [2]=Mobile App Development -> Medium B, [3]=Creative Communication -> Accent.
// "Cybersecurity & Compliance" ([4]) dropped per user decision (2026-09-25).
const [primaryService, mediumAService, mediumBService, accentService] = services

// Copy: every string here is already-approved profile content, nothing new
// invented — the section name (04-homepage-spec.md §2), the positioning line
// and the brand promise (00-brand-guide.md §01), and the four service
// titles/bodies from useServices().
const headlineWords = ['What', 'We', 'Build'] as const
const headlineFinal = headlineWords.join(' ')
const eyebrow = 'Technology × Creative Execution Partner'
const supportLine = 'We turn complexity into certainty.'

type CardKey = 'primary' | 'mediumA' | 'mediumB' | 'accent'
interface CardConfig {
  key: CardKey
  service: (typeof services)[number] | undefined
  kind: 'technology' | 'enterprise' | 'mobile' | 'creative'
}
const cards: CardConfig[] = [
  { key: 'primary', service: primaryService, kind: 'technology' },
  { key: 'mediumA', service: mediumAService, kind: 'enterprise' },
  { key: 'mediumB', service: mediumBService, kind: 'mobile' },
  { key: 'accent', service: accentService, kind: 'creative' }
]

// Visual hierarchy only (One Visual Anchor, Not One Superior Capability):
// Primary leads the composition, Medium A/B ~65-75% of it, Accent smallest
// but frontmost. Sizes differ in proportion, not just scale, so the four
// cards never read as one repeated SaaS card.
const CARD_STYLE: Record<CardKey, { shell: string }> = {
  primary: { shell: 'z-20 w-[400px]' },
  mediumA: { shell: 'z-10 w-[292px]' },
  mediumB: { shell: 'z-10 w-[292px]' },
  accent: { shell: 'z-30 w-[224px]' }
}

// Decode charset: clean alphanumeric + limited technical punctuation only
// (04-homepage-spec.md §2 "Text Decode") — never {}/[]/<>/$/#/% or
// binary/code-like syntax, so this never reads as hacking/cyberpunk.
const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-:'

// Fixed pixel offsets from the stage center for each card's fan-spread
// resting position (cards differ in size, so percentages give wildly
// different real distances). Scaled at setup time for smaller desktops.
// Shared between the full desktop timeline and the reduced-motion branch
// so both land cards in the same place. Each card sits on a different
// horizontal key line — Precise Misalignment, not a symmetric fan.
const CARD_LAYOUT = [
  { key: 'primary', x: -285, y: -20, rotation: -1.5 },
  { key: 'mediumA', x: 300, y: -120, rotation: 1.2 },
  { key: 'mediumB', x: 270, y: 190, rotation: -1 },
  { key: 'accent', x: -215, y: 250, rotation: 2 }
] as const

// Parallax reach (px) per card once the fan has settled — foreground cards
// travel further than the anchor, giving depth without blur.
const DEPTH_REACH = [6, 12, 10, 16] as const

// BaseSection renders via <component :is="as">, so a template `ref` on it
// resolves to the component instance, not its DOM element (pasti-gotchas
// memory #4). `.$el` is Vue's fallthrough accessor to that single root
// element.
const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

const curtainRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const headlineRef = ref<HTMLElement | null>(null)
const supportRef = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const clusterLayerRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const railFillRefs = ref<HTMLElement[]>([])
const signalDotRef = ref<HTMLElement | null>(null)
const signalRouteRef = ref<HTMLElement | null>(null)
const hubRef = ref<HTMLElement | null>(null)
const routeRefs = ref<SVGPathElement[]>([])
const routeNodeRefs = ref<SVGRectElement[]>([])
const pulseRef = ref<SVGCircleElement | null>(null)
const HUB_IDLE = `— / ${String(cards.length).padStart(2, '0')}`
const hubReadout = ref(HUB_IDLE)

// Hub sits in the gap between the Primary card and the right-hand pair.
const HUB_X = 20

/** Lays the system-map routes out from the hub to each card's facing edge,
 * orthogonally (grid-aware, never diagonal). Card sizes are measured from
 * the unscaled layout box and multiplied by the same layout scale `s` the
 * cards are placed with. */
function layoutRoutes(s: number) {
  const hub = hubRef.value
  if (!hub) return
  const hx = HUB_X * s
  gsap.set(hub, { xPercent: -50, yPercent: -50, x: hx, y: 0 })
  const hubHalf = hub.offsetWidth / 2
  cardRefs.value.forEach((el, i) => {
    const path = routeRefs.value[i]
    const node = routeNodeRefs.value[i]
    const layout = CARD_LAYOUT[i]
    if (!path || !node || !layout) return
    const cx = layout.x * s
    const cy = layout.y * s
    const hw = (el.offsetWidth * s) / 2
    const hh = (el.offsetHeight * s) / 2
    const left = cx < hx
    const sx = left ? hx - hubHalf : hx + hubHalf
    const ex = left ? cx + hw : cx - hw
    const ey = gsap.utils.clamp(cy - hh * 0.55, cy + hh * 0.55, 0)
    const mx = sx + (ex - sx) * 0.5
    path.setAttribute('d', `M${sx} 0 H${mx} V${ey} H${ex}`)
    path.setAttribute('pathLength', '1')
    node.setAttribute('x', String(ex - 2.5))
    node.setAttribute('y', String(ey - 2.5))
  })
}

// Mobile-simplified refs — a separate, normal-flow DOM subtree (see
// template) rather than reusing the desktop absolute-positioned fan, since
// spec explicitly forbids "reproduce desktop choreography fully" on mobile
// and an absolute-fan layout doesn't recompose sensibly at narrow widths.
const mobileSectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

const { signalXFraction } = useHeroSignalHandoff()

// Align the standby Signal / curtain's own vertical seam to Hero's Signal
// exit x-position (Designed Continuity, Not Arbitrary Proximity) — falls
// back to the same key line Hero itself uses when the handoff value hasn't
// published yet (e.g. reduced motion skipped Hero's own measurement, or
// this section was reached via a direct anchor).
const signalLeftStyle = computed(() => {
  const fraction = signalXFraction.value
  if (fraction === null) return undefined
  return { left: `${fraction * 100}vw` }
})

/** Layout scale for desktops smaller than the 1360x820 design frame, so the
 * fan stays inside the viewport instead of clipping. Never scales up. */
function layoutScale() {
  return Math.min(1, Math.max(0.7, Math.min(window.innerWidth / 1360, window.innerHeight / 820)))
}

useGsapContext(() => {
  const mm = gsap.matchMedia()

  // --- Reduced motion: short transition, resolved text directly, cards in final hierarchy ---
  // Applies regardless of viewport width — reduced motion always gets the
  // simplified, static-premium treatment (03-design-system.md §11).
  mm.add(reducedMotionQuery.reduce, () => {
    const s = layoutScale()
    gsap.set(curtainRef.value, { yPercent: -100 })
    // The decode headline is a transitional element that the full
    // choreography fades out once cards emerge — reduced motion skips the
    // animated break but must still end at the same visual state, otherwise
    // the headline sits behind the absolute-positioned cards. Hidden
    // instantly (opacity 0), not removed, since it's still the accessible
    // heading text.
    gsap.set([headlineRef.value, supportRef.value, eyebrowRef.value, clusterLayerRef.value].filter(Boolean), { opacity: 0 })
    cardRefs.value.forEach((el, i) => {
      const layout = CARD_LAYOUT[i]!
      gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 1, x: layout.x * s, y: layout.y * s, rotation: layout.rotation, scale: s })
    })
    gsap.set(railFillRefs.value, { scaleY: 1 })
    layoutRoutes(s)
    gsap.set(hubRef.value, { opacity: 1 })
    gsap.set(routeRefs.value, { strokeDasharray: 'none', strokeDashoffset: 0 })
    if (signalDotRef.value) gsap.set(signalDotRef.value, { opacity: 1 })
    if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 1 })
  })

  // --- Desktop only, full choreography (Milestone 5A final closure:
  // Desktop = 1024px, NOT the legacy 768px `md` boundary — 768px sits
  // inside the frozen Tablet tier). Tablet AND Mobile both get the separate
  // reduced-complexity DOM subtree below — the pinned mechanism itself is
  // gated behind this width query, so no ScrollTrigger/pin is ever created
  // below `desktop` at all (spec: "no long pin" on Tablet or Mobile). ---
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    if (!isDesktop) return

    const stage = stageRef.value
    const curtain = curtainRef.value
    const headline = headlineRef.value
    if (!stage || !curtain || !headline) return

    const s = layoutScale()
    const cardEls = cardRefs.value
    const layoutFor = CARD_LAYOUT.map((l) => ({ ...l, x: l.x * s, y: l.y * s }))

    const words = Array.from(headline.querySelectorAll<HTMLElement>('[data-word]'))
    const mains = words.map((w) => w.querySelector<HTMLElement>('[data-word-main]')!)
    const slicesTop = words.map((w) => w.querySelector<HTMLElement>('[data-slice="top"]')!)
    const slicesBottom = words.map((w) => w.querySelector<HTMLElement>('[data-slice="bottom"]')!)
    const dot = headline.querySelector<HTMLElement>('[data-dot]')

    // Lock each word's resolved width once, so scrambled glyphs (which vary
    // in width) never make the centered line jitter while decoding.
    for (const w of words) w.style.minWidth = `${w.getBoundingClientRect().width}px`

    // Card illustrations draw on via stroke-dashoffset — normalize every
    // stroke to pathLength 1 so one dash value fits any shape.
    const strokesOf = (el: HTMLElement) => Array.from(el.querySelectorAll<SVGGeometryElement>('[data-stroke],[data-accent]'))
    const allStrokes = cardEls.flatMap(strokesOf)
    for (const el of allStrokes) el.setAttribute('pathLength', '1')

    // --- Initial states ---
    gsap.set(curtain, { yPercent: 0 })
    gsap.set(headline, { opacity: 0 })
    gsap.set([supportRef.value, dot].filter(Boolean), { opacity: 0 })
    gsap.set([...slicesTop, ...slicesBottom], { opacity: 0 })
    gsap.set(clusterLayerRef.value, { opacity: 0 })
    gsap.set(cardEls, { xPercent: -50, yPercent: -50, opacity: 0, x: 0, y: 0, scale: 0.4, rotation: 0 })
    gsap.set(allStrokes, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(railFillRefs.value, { scaleY: 0, transformOrigin: 'top' })
    layoutRoutes(s)
    gsap.set(hubRef.value, { opacity: 0, scale: 0.85 })
    gsap.set(routeRefs.value, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(routeNodeRefs.value, { opacity: 0 })
    if (signalDotRef.value) gsap.set(signalDotRef.value, { opacity: 0.5, scale: 1 })
    if (signalRouteRef.value) gsap.set(signalRouteRef.value, { scaleY: 0 })

    // --- One continuous pinned scroll-controlled mechanism ---
    // Curtain takeover and the pinned stage that follows are ONE timeline
    // on ONE ScrollTrigger — never a perceived snap from "curtain finishes"
    // into "section suddenly pins" (04-homepage-spec.md §2 "Pin
    // experience"). Scroll depth baseline ~3.5-4 viewport lengths
    // (guardrail ~4.5): `end: '+=300%'` on a pinned 100svh trigger is 4.0
    // viewport lengths in total. See the stage's `py-0` note in the
    // template for why the section padding must stay zero.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=300%',
        scrub: 0.7,
        pin: true,
        anticipatePin: 1
      },
      defaults: { ease: approvedEase.gsapStandard }
    })

    // 1) CURTAIN: vertical axis takeover, tonal continuity (Slate Navy on
    // Slate Navy — not a contrasting color snap), expo.out, ~800-1200ms
    // window of the overall scrub. Its trailing edge carries a Cobalt rule
    // with column ticks, so the seam reads as the grid being uncovered.
    tl.addLabel('curtain')
    tl.to(curtain, { yPercent: -100, duration: 1, ease: approvedEase.gsapCinematic }, 'curtain')
    if (signalRouteRef.value) tl.to(signalRouteRef.value, { scaleY: 1, duration: 0.6 }, 'curtain+=0.2')
    if (railFillRefs.value[0]) tl.to(railFillRefs.value[0], { scaleY: 1, duration: 0.8 }, 'curtain+=0.1')

    // 2) DECODE: scramble limited to the final string's own characters (no
    // extra noise) so the silhouette is legible from the start.
    tl.addLabel('decode', 'curtain+=0.9')
    const decodeProxy = { progress: 0 }
    tl.to(
      decodeProxy,
      {
        progress: 1,
        duration: 1,
        onUpdate: () => scrambleWords(mains, decodeProxy.progress),
        onStart: () => {
          gsap.set(headline, { opacity: 1 })
        },
        onReverseComplete: () => {
          gsap.set(headline, { opacity: 0 })
        }
      },
      'decode'
    )
    if (railFillRefs.value[1]) tl.to(railFillRefs.value[1], { scaleY: 1, duration: 1 }, 'decode')

    // 3) RESOLVE: micro-pause at resolved state, Signal pulses once; the
    // full stop (the headline's Signal point) and the brand promise arrive.
    tl.addLabel('resolve', 'decode+=1.05')
    if (dot) tl.fromTo(dot, { opacity: 0, scale: 0.4, transformOrigin: '50% 80%' }, { opacity: 1, scale: 1, duration: 0.2 }, 'resolve')
    if (supportRef.value) tl.fromTo(supportRef.value, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 }, 'resolve+=0.05')
    if (signalDotRef.value) {
      tl.to(signalDotRef.value, { opacity: 1, scale: 1.6, duration: 0.15 }, 'resolve')
      tl.to(signalDotRef.value, { scale: 1, duration: 0.15 }, 'resolve+=0.15')
    }

    // 4) TYPOGRAPHIC CLUSTER BREAK: each word splits into two glyph slices
    // (upper / lower half of the same letterforms) that travel outward on
    // grid-aware paths (not radial), decelerate sharply and fade to low
    // opacity — architectural residue, not particles/dust/explosion.
    tl.addLabel('break', 'resolve+=0.5')
    tl.set([...slicesTop, ...slicesBottom], { opacity: 1 }, 'break')
    tl.set(mains, { opacity: 0 }, 'break')
    tl.to([dot, supportRef.value, eyebrowRef.value].filter(Boolean), { opacity: 0, duration: 0.25 }, 'break')
    const dir = [-1, 0, 1]
    tl.to(
      slicesTop,
      {
        x: (i: number) => (dir[i] === 0 ? 34 : dir[i]! * (150 + i * 24)),
        y: (i: number) => -(70 + i * 18),
        opacity: 0.08,
        scale: 0.92,
        duration: 0.55,
        ease: 'power4.out',
        stagger: 0.04
      },
      'break'
    )
    tl.to(
      slicesBottom,
      {
        x: (i: number) => (dir[i] === 0 ? -34 : -dir[i]! * (130 + i * 30)),
        y: (i: number) => 64 + i * 22,
        opacity: 0.08,
        scale: 0.92,
        duration: 0.55,
        ease: 'power4.out',
        stagger: 0.04
      },
      'break+=0.03'
    )
    if (clusterLayerRef.value) {
      // Baseline echoes: thin structural lines, not dots (dots belong to
      // the Signal system).
      const lines = Array.from(clusterLayerRef.value.children) as HTMLElement[]
      gsap.set(clusterLayerRef.value, { opacity: 1 })
      gsap.set(lines, { opacity: 0, scaleX: 0.2 })
      tl.to(lines, { opacity: 0.35, scaleX: 1, duration: 0.4, ease: 'power4.out', stagger: 0.03 }, 'break+=0.1')
    }
    if (railFillRefs.value[2]) tl.to(railFillRefs.value[2], { scaleY: 1, duration: 0.5 }, 'break')

    // 5) CARD EMERGENCE: from the same compressed centroid the text broke
    // from. Order: Primary first (anchors), Medium A/B near-simultaneous
    // slight stagger, Accent last. Each illustration then draws itself.
    tl.addLabel('cards', 'break+=0.3')
    for (const [i, el] of cardEls.entries()) {
      const layout = layoutFor[i]!
      const at = i === 0 ? 'cards' : `cards+=${0.08 + i * 0.06}`
      tl.to(el, { opacity: 1, scale: s, x: layout.x, y: layout.y, rotation: layout.rotation, duration: 0.6, ease: 'power4.out' }, at)
      tl.to(strokesOf(el), { strokeDashoffset: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 }, `cards+=${0.35 + i * 0.1}`)
    }
    if (railFillRefs.value[3]) tl.to(railFillRefs.value[3], { scaleY: 1, duration: 0.6 }, 'cards')
    // System map: hub resolves at the centroid, routes draw out to each card.
    tl.to(hubRef.value, { opacity: 1, scale: 1, duration: 0.35, ease: approvedEase.gsapPrimary }, 'cards+=0.45')
    tl.to(routeRefs.value, { strokeDashoffset: 0, duration: 0.5, ease: approvedEase.gsapStandard, stagger: 0.06 }, 'cards+=0.6')
    tl.to(routeNodeRefs.value, { opacity: 1, duration: 0.2, stagger: 0.06 }, 'cards+=0.95')
    // Signal: single restrained highlight on Primary as it settles.
    if (signalDotRef.value) tl.to(signalDotRef.value, { opacity: 1, scale: 1.3, duration: 0.2 }, 'cards+=0.5')
    if (signalDotRef.value) tl.to(signalDotRef.value, { scale: 1, duration: 0.2 }, 'cards+=0.7')

    // 6) DECAY: slices/lines reduce to ambient presence; majority decay
    // further, two thin structural remnants briefly persist before
    // releasing. Full residual field does NOT carry into Selected Work.
    tl.addLabel('decay', 'cards+=0.9')
    {
      const all = [...slicesTop, ...slicesBottom]
      const remnants = [slicesBottom[1], slicesTop[2]].filter(Boolean) as HTMLElement[]
      const majority = all.filter((el) => !remnants.includes(el))
      const lines = clusterLayerRef.value ? Array.from(clusterLayerRef.value.children) : []
      tl.to([...majority, ...lines], { opacity: 0, duration: 0.4 }, 'decay')
      tl.to(remnants, { opacity: 0.05, duration: 0.4 }, 'decay')
      tl.to(remnants, { opacity: 0, duration: 0.3 }, 'decay+=0.5')
    }

    // 7) EXIT: Signal repositions toward the section's edge, becoming the
    // origin/trigger for Selected Work's entry.
    tl.addLabel('exit', 'decay+=0.5')
    if (signalRouteRef.value) tl.to(signalRouteRef.value, { scaleY: 0.3, transformOrigin: 'top', duration: 0.4 }, 'exit')
    if (signalDotRef.value) tl.to(signalDotRef.value, { y: 40, duration: 0.4 }, 'exit')

    // --- Post-settle interaction (fine pointers only) ---
    // Once the fan has settled the section is otherwise inert; these give it
    // a Response layer: depth parallax on pointer move, and a per-card
    // hover (lift, Cobalt edge draws, illustration accent redraws, siblings
    // recede). All on inner wrappers, so they never fight the scrubbed
    // timeline that owns each card's own transform.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const depths = cardEls.map((el) => el.querySelector<HTMLElement>('[data-card-depth]')!)
    const lifts = cardEls.map((el) => el.querySelector<HTMLElement>('[data-card-lift]')!)
    const edges = cardEls.map((el) => el.querySelector<HTMLElement>('[data-card-edge]')!)
    const accents = cardEls.map((el) => Array.from(el.querySelectorAll<SVGGeometryElement>('[data-accent]')))
    const depthX = depths.map((d) => gsap.quickTo(d, 'x', { duration: 0.9, ease: approvedEase.gsapStandard }))
    const depthY = depths.map((d) => gsap.quickTo(d, 'y', { duration: 0.9, ease: approvedEase.gsapStandard }))

    const settled = () => {
      if (tl.progress() < 0.78) return false
      const r = stage.getBoundingClientRect()
      return r.bottom > 0 && r.top < window.innerHeight
    }

    const onMove = (event: PointerEvent) => {
      if (!settled()) return
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = (event.clientY / window.innerHeight) * 2 - 1
      depths.forEach((_, i) => {
        depthX[i]!(nx * DEPTH_REACH[i]!)
        depthY[i]!(ny * DEPTH_REACH[i]! * 0.6)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const cleanups: Array<() => void> = [() => window.removeEventListener('pointermove', onMove)]
    const pulseTravel = { t: 0 }
    lifts.forEach((lift, i) => {
      const others = lifts.filter((_, j) => j !== i)
      const enter = () => {
        if (!settled()) return
        gsap.to(lift, { y: -6, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        gsap.to(edges[i]!, { scaleX: 1, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        gsap.fromTo(accents[i]!, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: approvedEase.gsapCinematic, overwrite: 'auto' })
        gsap.to(others, { opacity: 0.55, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        hubReadout.value = `${cards[i]?.service?.index ?? ''} / ${String(cards.length).padStart(2, '0')}`
        routeRefs.value.forEach((r, j) => {
          gsap.to(r, { stroke: j === i ? '#033C59' : 'rgba(3,60,89,0.130)', duration: motionTier.microMax, overwrite: 'auto' })
        })
        const route = routeRefs.value[i]
        const pulse = pulseRef.value
        if (route && pulse) {
          const total = route.getTotalLength()
          gsap.killTweensOf(pulseTravel)
          pulseTravel.t = 0
          gsap.set(pulse, { opacity: 1 })
          gsap.to(pulseTravel, {
            t: 1,
            duration: 0.7,
            ease: approvedEase.gsapStandard,
            onUpdate: () => {
              const pt = route.getPointAtLength(pulseTravel.t * total)
              pulse.setAttribute('cx', String(pt.x))
              pulse.setAttribute('cy', String(pt.y))
            },
            onComplete: () => { gsap.to(pulse, { opacity: 0, duration: 0.3 }) }
          })
        }
      }
      const leave = () => {
        gsap.to(lift, { y: 0, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        gsap.to(edges[i]!, { scaleX: 0, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        gsap.to(others, { opacity: 1, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: 'auto' })
        hubReadout.value = HUB_IDLE
        gsap.to(routeRefs.value, { stroke: 'rgba(3,60,89,0.260)', duration: motionTier.microMax, overwrite: 'auto' })
      }
      lift.addEventListener('pointerenter', enter)
      lift.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        lift.removeEventListener('pointerenter', enter)
        lift.removeEventListener('pointerleave', leave)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  })

  // --- Tablet (Reduced Complexity) + Mobile (Recomposed): short
  // Signal/mask, resolved typography directly, no decode, no typographic
  // break, cards shown in final hierarchy, no long pin (04-homepage-spec.md
  // §2 "Mobile"; Milestone 5A extends this same simplified composition to
  // Tablet). A plain scroll-triggered reveal on the shared Tablet+Mobile DOM
  // subtree — not a scaled-down copy of the desktop pinned mechanism. ---
  mm.add({ isBelowDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}` }, (context) => {
    const { isBelowDesktop } = context.conditions as { isBelowDesktop: boolean }
    const section = mobileSectionComponentRef.value?.$el ?? null
    if (!isBelowDesktop || !section) return

    const heading = section.querySelector<HTMLElement>('[data-mobile-heading]')
    const cardEls = Array.from(section.querySelectorAll<HTMLElement>('[data-mobile-card]'))
    const dot = section.querySelector<HTMLElement>('[data-mobile-signal-dot]')

    gsap.set([heading, ...cardEls].filter(Boolean), { opacity: 0, y: 16 })
    if (dot) gsap.set(dot, { opacity: 0.4, scale: 0.8 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'restart none restart reverse' }
    })
    if (dot) tl.to(dot, { opacity: 1, scale: 1, duration: 0.3, ease: approvedEase.gsapStandard })
    tl.to(heading, { opacity: 1, y: 0, duration: 0.5, ease: approvedEase.gsapStandard }, '<0.1')
    tl.to(cardEls, { opacity: 1, y: 0, duration: 0.4, ease: approvedEase.gsapStandard, stagger: 0.08 }, '<0.15')

    return () => tl.kill()
  })
})

/** Scrambles the headline words toward their final text as `progress` (0-1)
 * increases. Only positions still "unresolved" at the given progress get a
 * random DECODE_CHARS character; resolved positions show the final
 * character — this keeps the string's silhouette legible from the very
 * first frame (04-homepage-spec.md §2 "Text Decode"), unlike a full-string
 * scramble. */
function scrambleWords(targets: HTMLElement[], progress: number) {
  const resolvedCount = Math.floor(headlineFinal.length * progress)
  let index = 0
  targets.forEach((target, wordIndex) => {
    const word = headlineWords[wordIndex] ?? ''
    let out = ''
    for (const char of word) {
      out += index < resolvedCount ? char : DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)]
      index++
    }
    index++ // the space between words
    target.textContent = out
  })
}
</script>

<template>
  <!-- Desktop-only stage (>= 1024px, Milestone 5A final closure — see
       breakpointQuery.desktopUp above). Hidden entirely below `desktop` —
       Tablet and Mobile both render the shared reduced-complexity subtree
       further down, not a CSS-hidden copy of this one (no pinned
       ScrollTrigger is created below `desktop` at all — see the
       isBelowDesktop/isDesktop matchMedia split above). -->
  <BaseSection
    v-if="primaryService"
    ref="sectionComponentRef"
    as="section"
    class="surface-light relative hidden overflow-hidden py-0 desktop:block"
  >
    <!-- py-0 above cancels BaseSection's default `.section` vertical
         rhythm padding — that padding is meant for normal homepage section
         spacing and, left in place here, silently adds ~280-400px on top
         of the pinned stage's own precisely-calculated scroll distance
         (measured earlier: 5.12 viewport lengths against a ~3.8 target,
         over the spec's 4.5 hard guardrail, entirely from this padding).
         The stage below is a full-bleed h-[100svh] box that owns its own
         spacing. -->
    <div ref="stageRef" class="relative flex h-[100svh] items-center justify-center overflow-hidden">
      <!-- Environment: the same precision field as Hero (12-column grid +
           pointer-following measuring layer), so Hero -> What We Build
           reads as one continuous world. This section owns its own Signal,
           so the field's routes are off. -->
      <HomePrecisionField variant="stage" tone="light" :show-routes="false" :focus="[0.5, 0.5]" />

      <!-- Curtain: 2 layers (this panel + the stage environment behind it),
           tonal continuity — Slate Navy on Slate Navy, not a contrasting
           color snap. Slides up on a single vertical axis; its trailing
           edge is a Cobalt rule with 12-column ticks. -->
      <div ref="curtainRef" aria-hidden="true" class="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(180deg,#eef3f7_0%,#f6f9fb_100%)]">
        <div class="absolute inset-x-0 bottom-0 h-px bg-[color:rgba(3, 60, 89,0.7)]" />
        <div class="absolute inset-x-0 bottom-px">
          <div class="container-page">
            <div class="grid grid-cols-12">
              <span v-for="n in 12" :key="n" class="h-2 border-l border-[color:rgba(3, 60, 89,0.7)]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Standby Signal, aligned to Hero's Signal exit x-position for
           designed continuity — same key line, not merely adjacent. -->
      <div
        ref="signalRouteRef"
        aria-hidden="true"
        class="absolute top-0 z-[5] h-1/3 w-px origin-top bg-[color:rgba(3, 60, 89,0.4)]"
        :style="signalLeftStyle"
        :class="signalXFraction === null ? 'left-[64.5vw]' : undefined"
      />
      <span
        ref="signalDotRef"
        aria-hidden="true"
        class="absolute top-1/3 z-[5] h-2 w-2 -translate-x-1/2 rounded-full bg-pastiYellow-500 shadow-[0_0_0_4px_rgba(251,186,0,0.18)]"
        :style="signalLeftStyle"
        :class="signalXFraction === null ? 'left-[64.5vw]' : undefined"
      />

      <!-- Segmented progression rail (03-design-system.md §6): 4 discrete
           segments, one per phase of the pinned sequence — reveal, decode,
           break, cards. Fixed to the stage's left edge. -->
      <div aria-hidden="true" class="absolute left-[max(24px,3vw)] top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
        <div v-for="n in 4" :key="n" class="flex items-center gap-3">
          <span class="relative block h-10 w-[2px] bg-[color:rgba(3,60,89,0.144)]">
            <span
              :ref="(el) => { if (el) railFillRefs[n - 1] = el as HTMLElement }"
              class="absolute inset-0 origin-top bg-cobalt"
            />
          </span>
          <span class="font-display text-[10px] font-semibold tracking-[0.12em] text-[color:rgba(3,60,89,0.55)]">0{{ n }}</span>
        </div>
      </div>

      <BaseContainer class="relative z-10">
        <!-- Pinned stage composition: text optically centered, large
             negative space around it, still grid-structured (12-column
             macro grid governs the overall section even though this
             moment is centered). -->
        <div class="relative mx-auto flex min-h-[40vh] max-w-6xl flex-col items-center justify-center text-center">
          <span ref="eyebrowRef" class="mb-8 font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.63)]">{{ eyebrow }}</span>
          <h2
            ref="headlineRef"
            :aria-label="`${headlineFinal}.`"
            class="flex items-baseline justify-center gap-x-[0.26em] whitespace-nowrap font-display text-[length:clamp(56px,8vw,150px)] font-bold leading-[0.92] tracking-[-0.04em] text-slateNavy"
          >
            <span v-for="word in headlineWords" :key="word" data-word aria-hidden="true" class="relative inline-block text-left">
              <span data-word-main>{{ word }}</span>
              <span
                data-slice="top"
                class="pointer-events-none absolute inset-0 opacity-0"
                style="clip-path: inset(0 0 50% 0)"
                >{{ word }}</span
              >
              <span
                data-slice="bottom"
                class="pointer-events-none absolute inset-0 opacity-0"
                style="clip-path: inset(50% 0 0 0)"
                >{{ word }}</span
              >
            </span>
            <span data-dot aria-hidden="true" class="-ml-[0.24em] text-pastiYellow-500">.</span>
          </h2>
          <p
            ref="supportRef"
            class="mt-8 max-w-md font-body text-token-body-large text-[color:rgba(3,60,89,0.82)]"
          >
            {{ supportLine }}
          </p>

          <!-- Baseline echoes: thin structural lines left behind by the
               break — lines, not dots (dots belong to the Signal system). -->
          <div
            ref="clusterLayerRef"
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-24 opacity-0"
          >
            <span
              v-for="n in 4"
              :key="n"
              class="h-px bg-[color:rgba(3,60,89,0.480)]"
              :style="{ width: `${120 + (n % 3) * 90}px`, marginLeft: `${(n % 2 === 0 ? 1 : -1) * 220}px` }"
            />
          </div>
        </div>

        <!-- Capability cards: exactly 4, emerging from the resolved
             headline's compressed centroid into a controlled fan. Flat
             dark surfaces, thin structural borders — no glass, no drop
             shadow, no oversized radius. Hierarchy is visual only (Primary
             largest/frontmost, Medium A/B ~65-75% of Primary on different
             grid lines, Accent smallest but frontmost layer).

             Three nested layers per card, each owned by one system so they
             never fight: the <article> is positioned/scrubbed by the pinned
             timeline; [data-card-depth] takes pointer parallax;
             [data-card-lift] takes hover lift / dimming. -->
        <div class="pointer-events-none absolute inset-0 z-40">
          <div class="relative mx-auto h-full max-w-5xl">
            <!-- System map: PASTI as the hub, one orthogonal Signal route to
                 each capability. It states a real relationship (one partner,
                 four capabilities) and carries the hover state: a route
                 lights and a Signal point travels to the card you're on. -->
            <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-1/2 z-0 h-0 w-0">
              <svg class="absolute left-0 top-0 overflow-visible" width="1" height="1">
                <path
                  v-for="n in 4"
                  :key="`r${n}`"
                  :ref="(el) => { if (el) routeRefs[n - 1] = el as unknown as SVGPathElement }"
                  fill="none"
                  stroke="rgba(3,60,89,0.260)"
                  stroke-width="1"
                />
                <rect
                  v-for="n in 4"
                  :key="`n${n}`"
                  :ref="(el) => { if (el) routeNodeRefs[n - 1] = el as unknown as SVGRectElement }"
                  width="5"
                  height="5"
                  fill="#FFFFFF"
                  stroke="rgba(3, 60, 89,0.8)"
                  stroke-width="1"
                />
                <circle ref="pulseRef" r="3" fill="#033C59" opacity="0" />
              </svg>
              <div
                ref="hubRef"
                class="absolute left-0 top-0 flex flex-col items-center gap-2 rounded-token-sm border border-[color:rgba(3, 60, 89,0.5)] bg-pureWhite px-4 py-3 opacity-0 shadow-[0_12px_30px_-18px_rgba(3,60,89,0.45)]"
              >
                <span class="absolute -left-px -top-px h-2 w-2 border-l border-t border-cobalt" />
                <span class="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-cobalt" />
                <LayoutBrandMark surface="light" :height="15" />
                <span class="whitespace-nowrap font-display text-[10px] font-semibold tabular-nums tracking-[0.14em] text-[color:rgba(3,60,89,0.73)]">{{ hubReadout }}</span>
              </div>
            </div>

            <article
              v-for="(card, i) in cards"
              :key="card.key"
              :ref="(el) => { if (el) cardRefs[i] = el as HTMLElement }"
              class="pointer-events-auto absolute left-1/2 top-1/2 opacity-0"
              :class="CARD_STYLE[card.key].shell"
            >
              <div data-card-depth>
                <div data-card-lift>
                  <HomeCapabilityCard
                    v-if="card.service"
                    :service="card.service"
                    :kind="card.kind"
                    :size="card.key === 'primary' ? 'primary' : card.key === 'accent' ? 'accent' : 'medium'"
                    interactive
                  />
                </div>
              </div>
            </article>
          </div>
        </div>
      </BaseContainer>
    </div>
  </BaseSection>

  <!-- Mobile/Tablet (below desktop): recomposed, not scaled. Short Signal
       reveal → resolved typography directly (no decode) → capability cards
       shown immediately in final hierarchy (no typographic break) → no pin,
       a normal vertical stack instead. Separate DOM from the desktop stage
       above, not a CSS-hidden copy of it. Illustrations render complete
       (no draw-on). -->
  <BaseSection
    v-if="primaryService"
    ref="mobileSectionComponentRef"
    as="section"
    class="surface-light relative overflow-hidden desktop:hidden"
  >
    <BaseContainer>
      <div class="flex items-center gap-2">
        <span data-mobile-signal-dot aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
        <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.63)]">{{ eyebrow }}</span>
      </div>
      <h2 data-mobile-heading class="mt-4 font-display text-token-h2 font-bold text-slateNavy">
        {{ headlineFinal }}<span class="text-pastiYellow-500">.</span>
      </h2>
      <p class="mt-3 max-w-md text-token-body text-[color:rgba(3,60,89,0.82)]">{{ supportLine }}</p>

      <div class="mt-10 flex flex-col gap-4 sm:grid sm:grid-cols-2">
        <div
          v-for="card in cards"
          :key="card.key"
          data-mobile-card
          :class="card.key === 'primary' ? 'sm:col-span-2' : ''"
        >
          <HomeCapabilityCard v-if="card.service" :service="card.service" :kind="card.kind" :size="card.key === 'primary' ? 'primary' : 'medium'" />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
