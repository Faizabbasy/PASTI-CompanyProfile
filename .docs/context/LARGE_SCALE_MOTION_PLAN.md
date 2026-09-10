# PASTI Homepage — Large-Scale Spatial Motion Plan (APPROVED, ready for implementation)

Status: **Concept approved. 4 execution guardrails approved. FINAL — implementation may proceed.**
Do not re-brainstorm or change the concept. Execute incrementally, one section at a time,
in the order below, with a visual QA pass (typecheck + build + Playwright) after each section
before moving to the next. Commit each section separately.

This plan supersedes the earlier "targeted upgrade pass" conservative plan. It does not
replace or invalidate the work already shipped in commits `8b3a108`..`9642a03` (ambient
light/grain, corner-brackets, cursor states, scroll-velocity skew, motion tokens, reduced-
motion guards, tablet tier, z-index/GSAP/Three.js lifecycle fixes) — those stay as-is and
are the foundation this plan builds on.

## Non-negotiable constraints (unchanged from original brief)
- Do NOT change section order, wireframe, existing copy, existing brand colors, existing
  content, or existing layout structure/grid.
- Every section gets exactly ONE dominant Level-1 signature motion. Do not stack many
  micro-effects to fake a signature moment.
- Mobile must feel intentionally art-directed, not simply a reduced desktop experience.
- `prefers-reduced-motion: reduce` must collapse every effect below to a stable, fully
  readable static state — never required to understand content.

## Primary creative narrative: SPATIAL DEPTH / DEPTH LAYERS
The homepage is a journey through a series of layered spatial "rooms", not a stack of
animated blocks. Every section has at minimum a foreground (content, static relative to
scroll) and a background/midground layer (parallax, moving at a different rate) — depth is
established by rate-of-motion difference, scale relationships, and camera-like framing, not
by literal 3D everywhere.

## Secondary language: BLUEPRINT / PRECISION (accent only, never the main metaphor)
Thin structural lines, crosshairs, registration marks, corner-brackets (the motif already
shipped on Why PASTI/Hero/FAQ) — used as a technical accent inside the spatial rooms above,
never as the section's primary visual idea except where explicitly noted (WhatWeDo,
Services, e-CORPORATE accent, Footer closing gesture).

## Scroll-pin scope (locked)
Exactly 2 pin points in the whole homepage, both approved explicitly:
1. **Hero** — exit sequence (structure retracts toward nucleus + camera dolly-out as user
   starts scrolling away)
2. **Selected Work** — cinematic project sequence (dominant card scales forward per scroll
   increment)
No other section pins. Both are disabled on mobile (see per-section mobile notes) — replaced
with a normal reveal-on-enter, because pinning inside a short mobile viewport feels forced.

---

## SHARED MOTION SYSTEM

Extend `app/composables/motion/motionTokens.ts` (do not replace existing values — the
existing `motionDuration`/`motionEase`/`motionStagger` groups stay; add new spatial-specific
groups alongside them):

```ts
export const spatialEase = {
  enter: 'power4.out',   // element approaching camera / coming into focus
  settle: 'expo.out',    // camera/viewpoint arriving and stopping (pin exits, footer collapse)
  drift: 'sine.inOut'    // ambient looping motion (glows, idle breathing)
} as const

export const spatialDuration = {
  cinematic: 1.6 // large depth transitions: Hero exit, Selected Work pin handoff
} as const
```

**Depth tiers** (parallax rate relative to scroll, applied via a new `useDepthParallax(el, tier)`
composable — do not hardcode the ratio per call site):
- `foreground` — rate 1.0 (moves with natural scroll, never parallaxed)
- `mid` — rate 0.85–0.9 (supporting visuals: images, cards)
- `back` — rate 0.6–0.75 (ambient/grid/line elements, feels "further away")

**Cursor/magnetic system**: unchanged. Stays Level 3, must never dominate over Level 1/2.

**Z-index/layering**: unchanged from the existing audited budget (cursor `z-[55]`, curtains
`z-[60]/[70]`, header `z-50`, mobile menu `z-40`). Any new per-section depth layer uses an
internal 3-tier scheme mirroring Hero's existing pattern: `z-0`/back, `z-[3]`/mid, `z-10`/
foreground content.

**Reduced motion (global rule)**: every depth-parallax and both pins collapse to a static
single-layer render — foreground content only, back/mid layers stay visible but frozen.

**Mobile adaptation (global rule)**: parallax is replaced with reveal-on-enter (elements
fade/scale in once as the section enters the viewport, not continuously re-parallaxed per
frame) — intentionally art-directed, not merely disabled. Both scroll-pins are off on mobile.

---

## SECTION-BY-SECTION PLAN

### 1. HERO — "Nucleus / Origin System" (replaces the generic distorted-sphere identity)

**This is the most significant change in the whole plan** — the Hero's 3D object is being
rebuilt from scratch, not re-skinned. Current file:
`app/components/home/hero-bg/HeroBgThreeDistortedSphere.vue` (icosahedron + noise shader,
currently the default-active background via `activeBg = '3d-sphere'` in `Hero.vue:355`).

**Concept**: the yellow dot from the PASTI wordmark is not decoration — it's the **nucleus**,
the origin point of the Hero's entire spatial system. The object starts as a single small
point and deterministically builds a navy structure around it, arriving at one coherent
resolved state (not infinite growth).

**Motion narrative (must all read as ONE identity system, in this order)**:
1. `nucleus` — single small yellow point, center, appears first (~0.3–0.4s into load, before
   anything else)
2. `spatial expansion` — a fixed, deterministic number of thin navy lines (6–12, NOT random
   per load) radiate outward from the nucleus, forming a skeleton
3. `structured formation` — flat, angular navy semi-transparent planes (triangles/quads —
   faceted, NOT a smooth subdivided sphere) lock into place following the line skeleton
4. `controlled creative deformation` — one deliberate, noise-driven distortion pass on the
   formed planes — subtle enough to feel alive, never chaotic (reuse the existing `snoise`
   GLSL from the old sphere shader, but at much smaller amplitude, applied only to plane
   vertices)
5. `convergence` — the planes pull slightly back toward the nucleus (gentle scale-in),
   reading as a solid structure bound to its origin
6. `resolved impact state` — the idle state for the rest of Hero's on-screen time: faceted
   navy structure, nucleus still visible as a focal point inside it, very subtle idle noise
   "breathing" continues (this is the fallback resting frame, not a transient)

**Palette**: structure mostly `navy-700`/`navy-900` semi-transparent (reads as "planes", not
solid mass), line skeleton `navy-500`, nucleus stays `yellow-500` as the ONLY color accent —
per explicit instruction, yellow is origin/focal accent only, majority of the structure stays
navy/neutral.

**Reject explicitly** (per user's own list): generic sphere, glowing orb, crystal, metaball,
particle explosion, sci-fi energy core, AI-style abstract blob.

**Scroll behavior (PIN — exit sequence)**: as the user starts scrolling down, the formation
partially reverses — structure pulls back toward the nucleus (stop at the "convergence"
stage, not all the way back to a bare point) while the camera dollies out, reading as the
structure "retracting into its origin" before Hero is left — narratively consistent with
"nucleus as origin" (the natural exit is returning toward origin, not exploding/vanishing).

**Technical approach**:
- Base geometry: NOT `IcosahedronGeometry` (that's what made the old sphere read as generic)
  — use individual small `PlaneGeometry`/`BufferGeometry` triangles positioned around the
  origin (not one subdivided mesh), so each plane can have its own entrance timing
  (stagger from line→plane→convergence).
- Lines (`spatial expansion` stage): `THREE.LineSegments` with a simple `BufferGeometry`,
  fixed count, deterministic angles (not `Math.random()` per load — precision, not chaos).
- Nucleus: small `THREE.Mesh` (small icosahedron or sprite), yellow, always at local origin
  (0,0,0).
- Noise displacement (idle breathing): reuse the existing tested `snoise` GLSL from the old
  sphere shader, but applied at much smaller amplitude, only on plane vertices — texture, not
  the dominant shape driver.
- Formation timeline: one `gsap.timeline()` tweening, in order: (a) nucleus scale/opacity,
  (b) line opacity/drawRange one-by-one (stagger), (c) plane opacity+scale (stagger, starts
  after lines finish), (d) noise amplitude uniform 0→small, (e) group scale for the final
  convergence. One controlled sequence, not disconnected effects.

**Performance notes**: this is a rebuild, not a tweak — more individual objects than the old
single-mesh sphere (lines + several planes vs. one mesh), but each object is very cheap (no
physics, tiny geometry). Keep plane count disciplined (6–12, not dozens) to keep draw calls
low. Keep the existing DPR cap (max 1.5, reapplied on resize) and the existing
IntersectionObserver + `visibilitychange` pause pattern from the prior session's work —
do not regress those.

**Mobile adaptation**: the formation sequence still plays (this is brand identity, not
something to strip on mobile per "mobile must feel intentionally art-directed") but runs
~40% faster and with fewer planes/lines (e.g. 6 instead of 12) for weaker devices.

**Reduced motion**: render directly in the *resolved impact state* (final structure static,
nucleus visible, idle noise breathing OFF) — no formation sequence plays at all.

**GUARDRAIL — Hero first-paint (mandatory)**: do NOT gate Hero's HTML content (headline,
subtext, CTAs) behind the nucleus/formation sequence. The page shell and text content must
render immediately per the existing `useIntroReady()` gate (~100ms blank beat, unchanged) —
the nucleus formation timeline runs in parallel with, and synced to, the existing headline
word-reveal timeline (both start from the same `watch(introReady, ...)` in `Hero.vue`), never
as a sequential loading gate that blocks content.

**Implementation note**: build as a new file (e.g.
`HeroBgThreeNucleusOrigin.vue`) rather than overwriting
`HeroBgThreeDistortedSphere.vue` in place, so the change is reversible via the existing dev
picker in `Hero.vue` during development, then set it as the new default `activeBg` once
verified. Remove/retire the old sphere as the *default* only after this is confirmed working
— the old file can stay in `hero-bg/` as an exploration artifact like the other 130+ variants
already there (out of scope to delete).

---

### 2. WHAT WE DO — "Architectural Drawing Field"

**Concept**: second room — from the organic-turned-faceted Hero object to pure precision
lines. First appearance of the secondary Blueprint/precision language.

**Visual behavior**: the empty left column (col 1–4, currently blank per the audit) gets a
technical line field (grid + 1–2 crosshair/registration marks, consistent with the
corner-bracket motif already shipped on Why PASTI/Hero/FAQ) that "draws itself" in
progressively.

**Scroll behavior**: lines are scrubbed by section scroll progress (not a one-shot reveal),
moving at the `back` depth tier (~0.65 rate) relative to the text which stays static at
`foreground`.

**Interaction behavior**: none new — Level 3 stays minimal here so the Level 1 idea reads
clearly.

**Technical approach**: SVG with `stroke-dashoffset` scrubbed via `ScrollTrigger`, wrapper
uses `useDepthParallax(el, 'back')`.

**Performance notes**: SVG is cheap, safe on all devices.

**Mobile adaptation**: lines still appear but as a one-shot reveal-on-enter (not continuous
scrub), scaled down.

**Reduced motion**: lines appear fully drawn immediately, static.

**Relationship to prev/next**: visually hands off to Services' reactive line field (same
technical visual language, different context).

---

### 3. SERVICES — "Reactive Spatial Field"

**Concept**: a technical space that reacts to which service is open — like a camera focus
shifting between "service rooms".

**Visual behavior**: the existing static bar-pattern decorative overlay
(`.service-shape-bars` in `ServiceRow.vue`) is replaced by a line/grid field whose
arrangement changes (not just opacity) each time a different row opens — pattern shifts like
a "new focus locking in".

**Scroll behavior**: the field also gets subtle `mid`-tier parallax following scroll within
the section (in addition to reacting to the open/close state).

**Interaction behavior**: pattern transition is driven by the row's existing `isOpen` state
(already implemented via ScrollTrigger toggling), not by hover — this stays a scroll-driven
accordion, not a hover-card grid.

**Technical approach**: one shared SVG/canvas component mounted once in `ServiceCards.vue`
(not per-row), receiving `activeIndex` as a prop, redrawing the pattern via a GSAP timeline
when the index changes.

**Performance notes**: one shared canvas/SVG (not five), redraws only on state transition —
safe.

**Mobile adaptation**: field stays but the transition simplifies to a pattern crossfade
(not a full rearrangement animation) to save compute.

**Reduced motion**: field is static, showing the pattern for whichever row is currently open,
no transition animation.

**Relationship to prev/next**: this is the peak of the "blueprint" language in the homepage —
Trust immediately after returns to pure spatial (floating logos), a deliberate contrast.

---

### 4. TRUST — "Spatial Logo Field" (revised from the earlier 2-lane marquee idea)

**Concept**: not a marquee, not two rows — ONE lane with a single focal-depth zone in the
center. Logos passing through that zone grow sharper/larger (peak clarity); logos further
from center shrink/fade (perspective compression) — reads as a corridor with real depth, not
two speeds.

**Visual behavior**:
- One continuous horizontal track (reverts from the earlier "2 lanes" idea — two independent
  lanes actually work against having "one" focal zone).
- Each logo's scale/opacity is driven by its distance from the section's horizontal center:
  inside the center ~20% of the viewport width, scale 1.15–1.3, opacity 1, slight forward lift
  (small `translateY`, `mid` depth). Outside that zone: scale down to ~0.75, opacity down to
  ~0.4, pushed back (`back` depth).
- A pair of logos approaching the focal zone from both sides gets a very subtle mutual
  vertical pull (±4px) just before passing through, then spreads again after — hinting at lens
  compression without touching the horizontal marquee spacing.

**Interaction**: existing hover-pause and dim-siblings stay (Level 3) — hover simply adds a
boost on top of whatever depth value currently applies to that logo, not an override.

**GUARDRAIL — performance (mandatory, from the final review)**:
Do NOT run `getBoundingClientRect()` on every logo every frame. Cache each logo's layout
metrics (position within the track) once on mount and again on resize/layout change (a
`ResizeObserver`, same pattern as the Hero WebGL component). Per-frame, derive the focal-depth
scale/opacity purely from the marquee's own transform/progress value (which is already known —
it's the driving `xPercent` tween) combined with the cached static position, NOT from a fresh
DOM read. If a DOM read is ever unavoidable (e.g. on resize), batch ALL reads first, then apply
ALL GSAP/style writes afterward — never interleave read/write to avoid layout thrashing.

**Technical approach**: extend the existing marquee GSAP timeline in `Trust.vue` — one track,
one `gsap.ticker.add()` callback that computes each logo's target scale/opacity/y from cached
position + current marquee progress, applied via `gsap.quickTo` per logo.

**Mobile adaptation**: depth-scale range narrower (1.0–1.15 instead of 1.0–1.3), the
per-frame update throttled more aggressively (every 3–4 frames) to save compute on weaker
devices.

**Reduced motion**: falls back to the existing static grid (already implemented), no
depth-scale at all.

---

### 5. SELECTED WORK — "Pinned Cinematic Takeover Scroll" (2nd scroll-pin, REVISED)

**Status: revised per explicit follow-up brief (superseding the "dominant card scales
forward within a static grid" version below this note) — a prior attempt at the *old*
version of this section (dominant-card scale within the grid) shipped, was judged to feel
like "grid cards with a scale animation" rather than a real takeover, and was reverted twice.
This revision is a structurally different mechanic, not a tuning pass on the old one.**

**Concept**: Selected Work becomes a pinned sequence of full-viewport project "scenes", not a
scrolling grid. Each of the 6 projects (`useSelectedWork.ts`, unchanged) rises from below as a
physical sheet/layer, takes over the viewport, then is itself covered by the next project
rising from below — a stacked-cover sequence, not a carousel, not a grid, not a hard snap.

**Scroll-progress timeline (locked, drives everything below via one pinned ScrollTrigger with
`scrub`, progress 0→1 over the pin's scroll distance)** — 6 projects, so after the fixed 0–8%
entry hold and 92–100% exit hold, the remaining 84% splits into 6 equal per-project spans of
14% each (rise + hold, no separate "cover" span — project N's rise *is* project N-1's cover):

| Progress | Phase |
|---|---|
| 0% – 8% | Selected Work enters and settles (arrival hold — section pins, nothing rises yet) |
| 8% – 22% | Project 01 rises into dominant/near-full-viewport position |
| 22% – 30% | Project 01 holds/breathes (idle micro-motion only, no rise) |
| 30% – 44% | Project 02 rises from below, covers Project 01 |
| 44% – 52% | Project 02 holds/breathes |
| 52% – 66% | Project 03 rises, covers Project 02 |
| 66% – 74% | Project 03 holds/breathes |
| 74% – 88% | Project 04 rises, covers Project 03 |
| 88% – 92% | Project 04 holds/breathes (shortened — see below) |
| 92% – 96% | Project 05 rises, covers Project 04 |
| 96% – 100% | Project 06 rises, covers Project 05 — final project settles, pin releases |

Note: 6 equal 14% rise+hold spans don't fit evenly in the 84% middle budget (6×14%=84% exactly
for the *rises*, leaving no room for holds on the last two) — projects 05/06 compress their
hold phase to keep the total at exactly 100%; this is a deliberate pacing taper (the sequence
accelerates slightly toward the end, reading as the gallery "wrapping up") rather than a bug.
Exact percentages above are the implementation contract; do not re-derive per build.

**Pin mechanics (per explicit constraint — no wheel hijacking)**: standard
`ScrollTrigger.create({ trigger, pin: true, scrub: <smoothing>, start: 'top top', end: '+=<N>vh' })`.
Scroll progress IS the timeline; no `preventDefault`, no manual scroll lock, no fake scroll, no
forced snapping. Scrolling backward reverses the same scrub timeline smoothly (native
`scrub` behavior, not a separate reverse animation). Pin distance (`end: '+=Nvh'`) target:
~500–600vh desktop (enough room for 6 projects to each read as a distinct beat, not a blur) —
exact value tuned during implementation against real scroll-speed testing, not fixed in this
plan.

**Stacking / z-order**: project N's DOM z-index = N (later projects always paint over earlier
ones — no z-index animation needed, only position/scale/opacity). All 6 project layers are
absolutely positioned within one pinned stage (not the current CSS grid — grid is retired for
this section only, per the "not cards scrolling together as a grid" constraint). Previous
project on cover: scale 1 → ~0.96–0.98, brightness/contrast reduced slightly (CSS `filter`,
small delta only — no heavy blur), a few px vertical shift — subtle recede, not a hidden/faded
layer (still visible peeking behind, reinforcing "physical sheet stack" depth).

**Active-project composition (not "just moving the image")**: image/media, title, index/
metadata move as one spatial scene per project — image `scale: 1.04 → 1` + a small internal
parallax as it settles, title/metadata get their own secondary choreography (masked reveal,
small y-offset, delayed settle relative to the image) using the existing `useMaskedReveal`
pattern. No content is added or changed — same title/index/image per project as today.

**Technical approach**: one pinned stage component owns a single `ScrollTrigger` with
`scrub` driving a derived progress value; each project scene's transform/opacity is computed
from that shared progress (not per-scene ScrollTriggers) so there is one source of truth and
no drift between layers. Transform/opacity/clip-path only — never animate `width`/`height`
(layout thrashing) and never trigger document reflow; if a rise needs to originate from an
existing element's bounds, use FLIP-style transform math (compute once, animate via
transform), not live layout reads per frame. Cache all layout metrics once on mount and on
resize (`ResizeObserver`), matching the read-once/batch-write discipline already established
for Trust's per-frame logo positioning.

**Interaction behavior**: existing `view` cursor state and hover tilt apply to whichever
project is currently the dominant/active scene (Level 3, unchanged from the old version).

**Performance notes**: highest-risk item in the whole plan (unchanged from the prior version's
assessment, now more so — 6 full-viewport image layers instead of grid cards). Required:
`ScrollTrigger.normalizeScroll` evaluation (same consideration as Hero's pin), lazy-load
project images not yet needed, preload the next project's image shortly before its rise
begins, pause any video media on non-active projects, kill the pin's ScrollTrigger on
unmount, call `ScrollTrigger.refresh()` after images/fonts settle (not mid-tween — see the
documented `LayoutSectionCurtain` refresh-timing pitfall in `SelectedWork.vue`'s git history
for why), verify continued Lenis stability (`useLenis.ts`'s existing `scroll` → `ScrollTrigger.
update` sync).

**Mobile adaptation**: keep the "layer covers layer" identity, but do not force the identical
desktop pin. Prefer CSS `position: sticky` stacked-card behavior (each project section is
sticky within its own scroll block, naturally covered by the next as the user scrolls) with
GSAP enhancement for the reveal choreography, if that proves more stable than a full pin on
mobile viewports/Safari address-bar-resize quirks — falls back to a real short pinned sequence
only if sticky-stacking can't be made to read correctly. Either way: shorter total scroll
distance, smaller depth-transform amplitude, lighter parallax than desktop/tablet.

**Tablet**: same mechanic as desktop, shorter pin duration, smaller depth-transform amplitude,
lighter parallax.

**Reduced motion**: no pin at all — all 6 projects render in a natural static stacked/listed
state (simple vertical list, each fully visible, no depth transforms, no takeover) so content
remains fully accessible without relying on the choreography.

**QA (mandatory before this section is considered done)**: slow scroll forward, fast scroll
forward, scroll backward (must reverse smoothly, no jump), stop mid-sequence, resize before
the section has ever activated, resize after it has activated, desktop, tablet, mobile, route
away/back navigation. Verify: no jump cuts, pin never gets stuck, no card flicker, z-index
always correct, project order always correct (01→06), no blank frame between projects, no
horizontal overflow, the next section (Testimonials) remains reachable by continued scrolling
after the pin releases.

**Definition of done**: the experience must read as — user reaches Selected Work → section
holds → project 01 takes over the screen → project 02 rises and covers project 01 → ... →
project 06 settles → pin releases → page continues naturally. If the result still reads as
"grid cards with a scale animation", it is not done.

**Relationship to prev/next**: from this pinned cinematic peak, Testimonials that follows
brings a calmer, quieter depth sensation (drift, not pin) — a deliberate tempo drop after the
homepage's most intense moment.

**Non-negotiable constraints reaffirmed for this section specifically**: do not change
section order, project content, project titles/copy, the global container system, the navbar,
or any section after Selected Work — this is a motion/presentation change only, the
underlying `useSelectedWork.ts` data stays the source of truth.

---

<details>
<summary>Superseded — original "dominant card scales within static grid" version (kept for
history; do not implement this version)</summary>

**Concept**: projects feel like passing through a gallery, not scrolling a grid.

**Visual behavior**: while pinned, whichever card is currently dominant in the viewport
scales up to occupy more visual space (the underlying grid itself never changes — one card
visually "steps forward" via scale/z-index while others recede slightly in the background).

**Scroll behavior (PIN)**: the section pins for enough scroll distance to "pass through" all
projects (roughly 150–200vh) — each scroll increment advances which card is dominant; normal
scroll resumes after the last project.

**Interaction behavior**: the existing `view` cursor state and hover tilt stay on the
currently-dominant card (Level 3).

**Technical approach**: `ScrollTrigger.create({ pin: true, scrub: true })` on the grid
wrapper; progress maps to an active-card index; a GSAP timeline tweens each card's
`scale`/`z-index`/`opacity` based on its distance from the active index (no grid reflow).

**Performance notes**: the highest-risk item in the whole plan — requires manual testing of
fast scroll, window resize, and interaction with Lenis. `ScrollTrigger.normalizeScroll` is
likely needed (same consideration as the Hero pin). Reuse the existing
`useScrollVelocitySkew` on the active card's image for extra motion texture.

**Mobile adaptation**: no pin — falls back to the current scroll-natural behavior (per-card
parallax + clip-reveal, already implemented and solid) rather than reducing it further.

**Reduced motion**: no pin, all cards static at their resting position, no dominant-card
scaling.

**Relationship to prev/next**: from this pinned "gallery" peak, Testimonials that follows
brings a calmer, quieter depth sensation (drift, not pin) — a deliberate tempo drop after the
homepage's most intense moment.

</details>

---

### 6. TESTIMONIALS — "Depth Stack / Focal Depth Moment" (revised from plain idle drift)

**Concept**: not random idle drift — a controlled, slow **focal cycling**: one card at a time
approaches the focal plane while the others recede slightly, like an eye periodically
refocusing between testimonials. No carousel, no hard snap.

**Visual behavior**:
- After the existing stack-scatter entrance completes (kept exactly as-is — it's already a
  strong Level 1 moment), a slow repeating timeline begins (full cycle ~16–20s) that
  designates one of the 4 cards "focal" at a time: scale up slightly (1.0→1.04), stronger
  shadow, nudged toward foreground (depth `mid`→`foreground`); the other 3 scale down
  slightly (1.0→0.97) and dim slightly (opacity 1→0.85), depth recedes.
- Transitions between focal cards are slow and smooth (`sine.inOut`, ~3–4s transition
  duration) — never reads as an explicit "turn", just a section that feels alive.

**GUARDRAIL — deterministic sequence (mandatory, from the final review)**:
Do NOT use `Math.random()` for the focal order. Use a fixed, seeded/deterministic sequence
(e.g. a hardcoded array like `[2, 0, 3, 1, 2, 0, 3, 1, ...]` that never repeats the same card
twice in a row) defined as a constant — reproducible for visual QA, identical every reload.

**Interaction**: existing hover `un-rotate` stays — hovering a card makes it instantly focal
(overriding the timeline briefly), resuming the normal cycle after `mouseleave`.

**Technical approach**: one `gsap.timeline({ repeat: -1 })` with `.call()` at labeled points
that updates a `focalIndex` variable and tweens all 4 cards toward their target
scale/opacity/shadow depending on whether they match `focalIndex` — not 4 independent
timelines that could collide.

**Performance notes**: transform + opacity + box-shadow only (avoid `filter: blur` here — 4
large elements at once would be costly) — very cheap.

**Mobile adaptation**: same mechanism (cheap), but the scale range is narrower (1.0→1.02
focal, 1.0→0.98 non-focal) so it doesn't feel like "wobble" in the already-tight mobile grid.

**Reduced motion**: no focal cycling — all cards stay static at their entrance-settled
position (existing guard, unchanged).

---

### 7. WHY PASTI — "Monumental Numeric Field" (explicitly NOT a generic count-up)

**Concept**: the number is not just text that counts up — it's a **monumental object** in
space: it grows from a small scale with depth-blur that sharpens into focus as it reaches its
final value, like a camera racking focus onto a monument.

**Visual behavior**: `value` starts at `scale: 0.7`, `filter: blur(6px)`, low opacity — as the
count-up runs (still using the existing `useCountUp` composable, but wrapped in this depth
transform rather than standing alone as a bare effect), scale grows to 1, blur clears,
opacity reaches full.

**Scroll behavior**: triggers once per card (not a continuous scrub — the final number must
be stable and readable).

**Interaction behavior**: existing `useCardTilt` stays (Level 3), but `baseRotate` gets more
noticeable per-card variation (echoing Testimonials' tilt pattern, more subtle here) — unifies
the "depth" language across sections.

**Technical approach**: in `WhyPastiMetric.vue`, replace the `value`'s current
`useMaskedReveal` with `gsap.set` (initial blur+scale) + the existing `useCountUp` + a
parallel `gsap.to` on filter/scale.

**Performance notes**: `filter: blur()` on a handful of small elements (up to 6 cards) is
fine — never apply blur to a large/full-section element.

**Mobile adaptation**: effect stays at full strength (transform-only, cheap) — Why PASTI is
one of the sections safe to keep equally strong on mobile and desktop.

**Reduced motion**: number displays at its final value immediately, no blur/scale/count
(existing `useCountUp` reduced-motion guard already handles the count-up part; the blur/scale
wrapper follows the same guard).

---

### 8. PLATFORMS — "Dual Product Worlds" (OPEN vs e-CORPORATE, distinct but same system)

**Concept**: both rows stay in the same design system (12-col grid, typography, colors) but
each gets a deliberately different depth *character* — OPEN feels open/expansive (matching
its name and "One Procurement Ecosystem Network" positioning), e-CORPORATE feels
structured/precise (matching its "Enterprise platform" status).

**Visual behavior**:
- **OPEN**: larger-amplitude parallax on the image (a more dramatic window-effect — supports
  the "ecosystem/network" feeling), slightly wider/more zoomed-out crop framing at rest.
- **e-CORPORATE**: smaller-amplitude, tighter-eased parallax (see guardrail below — smooth,
  not stuttery), slightly tighter/more zoomed-in crop framing, plus one thin precision-line
  accent (secondary blueprint language) along the image edge — an element that does NOT
  appear on OPEN, so the difference reads as deliberate, not random.
- Both rows keep the same window-effect technical basis (`overflow:hidden` container + moving
  image inside) — only the motion parameters and the one accent element differ.

**GUARDRAIL — e-CORPORATE motion character (mandatory, from the final review)**:
Do NOT interpret "tighter/more rigid" as jitter or stutter. Motion must remain 100% smooth at
all times — the differentiation from OPEN comes ONLY from: lower amplitude, tighter/faster
easing (e.g. `power2.out` vs. OPEN's `power3.out`), more precise/predictable timing, and the
tighter crop framing — never from interrupted or stepped movement.

**Interaction**: existing hover (title translate-x + image scale) stays on both rows.

**Technical approach**: extend `PlatformRow.vue` with one additional prop (e.g.
`variant: 'open' | 'corporate'`) that drives the GSAP scrub parameters (amplitude, easing)
and conditionally renders the extra line accent for `corporate` — parameterize, don't
duplicate the component.

**Performance notes**: same cost as the original plain-parallax plan — only parameters
differ, no added compute.

**Mobile adaptation**: both variants keep their distinct character (cheap, transform-only)
but amplitude scales down proportionally for the shorter viewport.

**Reduced motion**: both images sit static at their respective final crop framing (no
scrub) — the crop-framing difference itself is not motion, so it stays visible even under
reduced motion.

---

### 9. INSIGHTS — "Editorial Directional Flow" (revises the clip-reveal shipped last session)

**Concept**: not a "blog card" — a magazine page opening. Directional reveal that feels like
a curtain/shutter opening, not a generic fade.

**Visual behavior**: the current `clipPath: inset()` reveal (shipped in a prior session) is
replaced with a `clipPath: polygon()`-based directional wipe — image reveals from one side,
with the wipe direction alternating per card (left→right, right→left, top→bottom via index
modulo 3) for rhythmic variation within the section.

**Scroll behavior**: triggers once per card (an editorial reveal needs a choreography that
completes, not a continuous scrub).

**Interaction behavior**: existing hover scale + title slide stays.

**Technical approach**: animate `clipPath: polygon(...)` per direction, stagger timing per
card with alternating direction by index.

**Performance notes**: `clip-path` animation is cheap, safe.

**Mobile adaptation**: wipe direction simplifies to one consistent direction (bottom→top,
natural with scroll direction) instead of the 3-way variation, for clarity on small screens.

**Reduced motion**: image displays fully revealed immediately, no wipe.

---

### 10. FAQ — "Structural Expansion"

**Concept**: since FAQ is purely textual content, "depth" here comes from the structure
itself, not a fake image — the section's own dividing lines and heading get spatial weight.

**Visual behavior**: the "FAQ" heading gets a subtle scale + letter-spacing scrub tied to
scroll progress (spacing tightens as the section scrolls, like a camera moving closer to the
text — not a letter-by-letter gimmick); the border-top divider between each FAQ item grows
outward from its center point as the section enters the viewport (`transform: scaleX()` from
`transform-origin: center`, not an opacity fade) — reading as structural lines, not CSS
borders.

**Scroll behavior**: heading scrub is light and scroll-tied; each divider's grow-in triggers
once per item.

**Interaction behavior**: existing left accent-bar hover stays; the existing ambient glow
(shipped last session) gets one second variant blending navy+yellow, reinforcing the "space"
feeling in this dark section.

**Technical approach**: `ScrollTrigger scrub` on heading `letter-spacing`/`scale`;
`transform: scaleX()` from center origin for the divider grow-in.

**Performance notes**: entirely CSS-transform based, very cheap.

**Mobile adaptation**: heading scrub range is reduced (less pronounced on small screens),
divider grow-in stays at full strength (cheap and effective).

**Reduced motion**: heading is static, dividers display fully grown immediately.

---

### 11. FINAL CTA — "Kinetic Brand Convergence"

**Concept**: the convergence point — every motion language used across the homepage (depth,
precision, spatial) visually "gathers" here as the most dramatic closing moment, not just
"another big CTA".

**Visual behavior**: both existing glow blobs grow noticeably larger and gain deliberate
mutual attract/repel movement (not just independent drift) — like two spatial elements
pulling toward each other; the eyebrow heading gets a letter-by-letter reveal with depth
(each letter emerges from small scale/blur, echoing Why PASTI's technique but bigger/more
dramatic), timed to sync with the glow convergence behind it.

**Scroll behavior**: triggers once as the section enters the viewport (a climax needs a
choreography that completes, not a scrub) — glows continue as a drifting ambient loop
afterward.

**Interaction behavior**: existing magnetic on the heading-link and CTA button stays as the
homepage's strongest Level 3 moment (consistent with "magnetic only on high-value elements").

**Technical approach**: extend `useMaskedReveal` with a new `by: 'letter'` option (reusable
going forward), used specifically here for the short eyebrow line; retime the existing glow
tweens into a convergence timeline (targets that approach each other, then settle back — not
a simple linear yoyo).

**Performance notes**: letter-reveal for a short line is a reasonable element count, safe.

**Mobile adaptation**: letter-reveal stays (cheap); convergence glow amplitude is reduced so
it doesn't feel cramped on a small screen.

**Reduced motion**: text appears fully formed immediately, glows sit static at their center
position with no convergence movement.

---

### 12. FOOTER — "Brand Afterglow / Closing Field" (revised — ONE closing gesture, not two glows)

**Concept**: the echo/residue of Final CTA's energy — not a new busy section, but a space that
slowly settles, closing the experience.

**Visual behavior — "structural line collapse"** (chosen mechanic): a small number of thin
lines (secondary blueprint language, matching the style already used in WhatWeDo/
Services/corner-brackets) appear from the footer's four corners and slowly converge toward the
center (roughly toward the logo in `col-span-4`), then stop and remain as a subtle static
frame around the footer content — not endless decoration, a clear resolved end-state ("frame"
formed, animation complete). The existing top-left glow stays but is slowed to near-static
(ambient base, no longer the main focus). Runs once, triggered when the footer first enters
the viewport — not a repeating loop like other sections' ambient drift, per "resolving, not
fading out".

**Technical approach**: 4 line elements (`<span>` with `border`/`scaleX`/`scaleY` from a
per-corner `transform-origin`) tweened toward the center via a trigger-once `ScrollTrigger`
when the footer enters the viewport, `ease: expo.out` for a definitive "landing" feel (not a
bounce).

**Performance notes**: very cheap — 4 CSS-transform elements, one-shot, not looping.

**Mobile adaptation**: identical to desktop — footer is already the cheapest section on the
page, no need to reduce it.

**Reduced motion**: lines display immediately at their final collapsed/frame position, no
collapse animation plays.

---

## GLOBAL COHERENCE CHECKLIST (apply to every section above)

1. **Clear origin/focus point** — every section has one visual anchor (Hero: nucleus; Trust:
   center focal zone; Testimonials: the current focal card; Why PASTI: the number;
   Platforms: the image; FAQ: the heading; Final CTA: the convergence point; Footer: the
   logo) — never motion without a destination.
2. **Resolved state, not infinite chaos** — every motion (except the ambient loops that are
   explicitly meant to loop — Trust's field, Testimonials' focal cycle, Final CTA's glow
   drift) has a readable, stable end state.
3. **One dominant mechanic per section** — never mix more than one primary technique in a
   single section (Hero = formation timeline, Trust = distance-based scale, Testimonials =
   focal-cycle, etc.) — the mechanic *variety* between sections is what makes it feel
   designed, not repeated.
4. **Consistent easing families across sections**: `spatialEase.enter` for anything
   "approaching focus", `spatialEase.settle` for anything "arriving/stopping/collapsing",
   `spatialEase.drift` for ambient loops — used consistently across Hero/Trust/
   Testimonials/Footer so that even though the mechanics differ, the *feel* of movement is
   unified.
5. **Precision accent visual consistency** — every line/crosshair/registration-mark
   appearance (WhatWeDo, Services, e-CORPORATE accent, Footer) uses identical stroke-width,
   opacity (15–20%), and color (`navy-500`/`yellow-500`) wherever it appears.

---

## Execution order and process (locked)

1. Hero (Nucleus/Origin System + exit pin)
2. What We Do (Architectural Drawing Field)
3. Services (Reactive Spatial Field)
4. Trust (Spatial Logo Field)
5. Selected Work (Cinematic Project Sequence + pin)
6. Testimonials (Focal Depth Moment)
7. Why PASTI (Monumental Numeric Field)
8. Platforms (Dual Product Worlds)
9. Insights (Editorial Directional Flow)
10. FAQ (Structural Expansion)
11. Final CTA (Kinetic Brand Convergence)
12. Footer (Brand Afterglow)

For each section: implement → `npx nuxi typecheck` → `npm run build` → visual QA via
Playwright (desktop + mobile + reduced-motion) → commit separately → move to next section.
Do not batch multiple sections into one commit. Do not skip QA between sections.
