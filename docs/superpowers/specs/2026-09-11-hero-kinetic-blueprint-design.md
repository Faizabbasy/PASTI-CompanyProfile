# PASTI Hero — Kinetic Blueprint / "Precision in Motion" — Design

Status: approved by user, ready for implementation planning
Supersedes (Hero background layer only): `2026-09-11-hero-living-surface-design.md`

## Context

The Living Surface shader background (Three.js, added in the immediately preceding work) reads as too subtle — the Hero still feels visually under-filled as a static frame. This spec replaces it with a 2D graphic motion identity system: a "Kinetic Blueprint" of precision grids, construction lines, brand-derived diagonal/slash geometry, registration marks, and yellow signal nodes, animated with GSAP. No Three.js, no shaders, no 3D.

## Locked / out of scope (do not touch)

Everything inside `data-hero-content` in `app/components/home/Hero.vue`:
- Headline triad (real text + `.cursor-spotlight` yellow duplicate + `.hero-shine` sweep duplicate), font/size/line-height/tracking/reveal animation
- Subtext, CTA row (copy, layout, `.btn-primary`/`.btn-outline` styles, magnetic hover)
- Corner-bracket accents (`border-l-2 border-t-2` / `border-b-2 border-r-2`, navy-700/20)
- Container/max-width (`max-w-5xl` inner, `max-w-container`=1440px outer), section height (`min-h-[100svh]`), text-center alignment
- Navbar (`app/components/layout/Header.vue`) — untouched entirely
- Existing GSAP entry timeline in Hero.vue (word-mask reveal, spotlight, shine-sweep)
- Section order, page structure below Hero, global color palette

The only in-scope surface is the mount point currently occupied by `<HomeHeroLivingSurface class="z-[3]" />` (Hero.vue) plus its scrim (`z-[5]`) — the scrim's shape/size/position is kept as-is; only its opacity is minimally reduced (see "Scrim audit" below). Only the background layer beneath it is otherwise replaced.

## Brand geometry note

No diagonal/slash motif exists anywhere in PASTI's current identity today (logo is a flat wordmark + yellow dot; only existing geometric echo is the L-shaped corner-bracket accent). Per user decision, this spec **introduces a new diagonal/slash system** as an intentional new identity element, informed by the existing navy/yellow palette and the corner-bracket precision aesthetic, rather than deriving it from prior art that doesn't exist.

## Visual composition (1600×900 SVG coordinate space, `preserveAspectRatio="xMidYMid slice"`)

Full-bleed inline `<svg>` at `z-[3]`, same stacking contract as today (scrim `z-[5]`, brackets `z-[6]`). A small CSS-only overlay div may hold 2-3 micro-pulse effects not worth SVG precision.

- **Left zone (x 0–450) — major mass #1 (dominant)**: an asymmetric diagonal slash-block bleeding off the left edge, ~15–20° off-vertical, 2–3 overlapping parallelogram/trapezoid paths, navy-700 fill at 8–14% opacity with one navy-500 stroked edge for definition. 4–6 construction lines converge into it. One yellow signal node sits at its sharpest vertex.
- **Right zone (x 1150–1600) — major mass #2 (subordinate/quieter)**: a fan of 3–4 long construction lines radiating from an off-canvas point at upper-right, crossing one smaller secondary slash block at mid-height. Lower opacity/contrast than the left mass — establishes hierarchy, avoids mirrored symmetry.
- **Bottom zone (y 650–900) — major mass #3 (anchor)**: a shallow-angle (3–5°) horizontal slash strip spanning most of the canvas width at low opacity, with 2–3 short vertical registration ticks. Doubles as the directional actor for the scroll "Handoff" phase.
- **Top/center zone (behind headline, x 450–1150 / y 200–650)**: sparse — only the precision grid's 4–6 major lines (navy-700 ~5% opacity) pass through, plus a few registration marks (small crop-corner brackets / coordinate ticks) at grid intersections near the headline's edges, echoing the existing corner-bracket motif at smaller scale. No dense detail directly behind the headline — this negative space is intentional.
- **Signal nodes**: 5–7 total at structural vertices/intersections (left-mass anchor, right-fan intersection, 1–2 on the grid, 1 on the bottom band). Navy stroke by default; yellow fill only when "active" (idle event or scroll phase) — yellow is never a wash, always a deliberate point/line accent.

Target visual occupation: ~55–75% of Hero whitespace carries meaningful composition; headline remains the clear focal point.

## Scrim audit

The existing scrim (Hero.vue line 143, `z-[5]`): `radial-gradient(ellipse 60% 50% at 50% 45%, paper/0.4, transparent 70%)`. Mapped against the composition zones above, this ellipse sits over the headline and the sparse top/center grid zone — it does not reach the left mass (x 0–450), right fan (x 1150–1600), or bottom band (y 650–900), which stay near their designed opacity. Only 1–2 signal nodes on the grid and the registration marks directly behind the headline fall inside its falloff, which is already the intended "quiet negative-space zone" and is not a problem on its own.

However, to ensure the grid/registration layer still reads with some presence in a static screenshot (rather than being fully washed to paper), reduce the scrim's opacity from `paper/0.4` to **`paper/0.25`**, keeping its ellipse shape, size, and position (`60% 50% at 50% 45%`, `transparent 70%`) unchanged. This is the only change to `Hero.vue` outside the mount-point swap. It affects opacity only — no recoloring, no foreground change, no shape change.

## Idle motion system (4 independent timescales — mandatory, must not read as a short loop)

Each timescale runs as independently-scheduled GSAP work (not one master repeating timeline), so schedules drift out of phase with each other and no obvious repeat point emerges:

- **A. Constant micro** (always active): grid-line drift (±1–2px), node scale pulses (1↔1.08), one mask-rect breathing width — each its own `repeat:-1, yoyo:true` tween, 3–6s, staggered start delays.
- **B. Slow structural** (5–12s per motion, non-looping — each tween chains to a freshly-randomized next tween rather than repeating): left-mass slide along its own diagonal axis (10–20px), a long construction line's `stroke-dashoffset` extend/retract, a mask gradually revealing more of the bottom band.
- **C. Occasional events**: a self-rescheduling `gsap.delayedCall` (`gsap.utils.random(3,7)`s intervals) triggers one of: draw a line, activate a node (navy→yellow flash), or travel a dot along a path.
- **D. Signature moment**: self-rescheduling `delayedCall` at `gsap.utils.random(8,15)`s builds a fresh one-shot ~2–3s timeline (2–3 lines draw toward a shared vertex near the headline, that vertex flashes yellow, then retracts). Discarded after playing; next occurrence picks a different variant from a small pre-authored rotation (3–4 variants) so repeats aren't identical.

**Pointer interaction (secondary, gated by live capability + tier, not a one-time check)**: damped proximity check via `gsap.ticker` (not raw `mousemove`) nudges the 2–3 nearest lines/nodes — capped magnitude (≤6px position, ≤0.15 opacity), smoothly damped. No global recompute, no glow/halo/magnetic pull. See "Pointer lifecycle" below for attach/detach rules across tier changes.

## Scroll choreography (pinned, scrubbed, fully reversible by construction)

`ScrollTrigger.create({ trigger: sectionEl, start: 'top top', end: () => \`+=${pinDistanceForTier()}\`, pin: true, scrub: 1 })` drives one GSAP timeline whose progress equals scroll progress — reverse-scroll is automatically correct (no custom reverse logic, no jump cuts) because everything is scrubbed against a single timeline. `pinDistanceForTier()` returns `160vh`/`100vh`/`65vh` per the current tier (see "Responsive art direction"); the ScrollTrigger is rebuilt (`.kill()` + recreate) on a tier crossing, same as the idle-element rebuild, so pin distance stays correct across live resizes without a page reload.

Labels at 0 / .2 / .45 / .7 / .9 / 1:

- **0–20% Calibration**: idle timelines' influence crossfades down (global "idle mix" 1→0.3, not killed — resumes cleanly if user scrolls back up); scattered secondary lines animate toward aligned positions; active node count reduces to 2–3 key anchors.
- **20–45% Construction**: major masses expand toward a "resolved" shape (pre-authored target `d`/transform values, not procedural morphing); more construction lines draw in.
- **45–70% Convergence**: grid, slash geometry, and nodes tween toward one curated tighter "peak" composition (explicit authored target state).
- **70–90% Resolution**: elements tagged `data-role="guide"` fade out; primary masses/nodes hold at full opacity.
- **90–100% Handoff**: bottom band + 1–2 lines animate downward/off-canvas, cueing the transition; pin releases past 100%.

Only the background SVG group is targeted — headline/CTA are never touched by this timeline.

## Responsive art direction

Tier detection mirrors the existing `getTier()` pattern (desktop/tablet/mobile, re-evaluated live on resize, not frozen at mount).

- **Desktop (≥1024px)**: full system — all zones, all 4 idle timescales, pointer interaction, pin distance **160vh** (within the 150–170vh band).
- **Tablet (640–1023px)**: elements tagged `data-detail="secondary"` (fine grid lines, minor ticks, ~half the construction lines) are not built/animated at all for this tier (skipped at setup, not hidden post-hoc). Major masses + 3–4 key nodes remain full-size. Pointer interaction retained if the device reports `hover:hover` + `pointer:fine` (see "Pointer lifecycle" below — many tablets are touch-only and must not get pointer listeners). Timescale D's line count reduced. Pin distance **100vh** (within the 90–120vh band).
- **Mobile (<640px)**: composition recomposes via a mobile-specific coordinate set (left mass and right fan repositioned so they remain visible; bottom band sits below the CTA row). Only major masses + 3 anchor nodes + timescales A/B/D survive (C merged into D to limit visual noise). Pointer interaction detached (coarse pointer). Pin distance **65vh** (within the 55–75vh maximum band) — kept short so mobile never feels scroll-jacked.

All three tiers keep the same 5 phase labels (0/.2/.45/.7/.9/1) and the same choreography *content* per phase — only the absolute pin distance (and therefore the scrub distance each phase's motion plays out over) changes, so timing compresses proportionally on smaller tiers rather than any phase being dropped or reordered.

## Pointer lifecycle

Pointer capability (`matchMedia('(hover: hover) and (pointer: fine)')`) is checked live, on the same resize/tier-reconciliation pass that already re-evaluates `getTier()` — never only once at mount. The composable holds one `isPointerActive` boolean derived from `hover:fine` **and** tier (attached on desktop always-when-capable, attached on tablet only when the device actually reports `hover:fine`, always detached on mobile regardless of capability, per the responsive spec above).

On each reconciliation pass:
- If the new state should be active and it isn't currently: attach the `gsap.ticker` pointer-update callback and the `pointermove` listener.
- If the new state should be inactive and it currently is: remove the `pointermove` listener and the `gsap.ticker` callback, and tween any pointer-nudged elements back to their idle-timeline baseline (so nothing is left visually offset with no system driving it back).
- If state is unchanged: no-op (idempotent — mirrors the existing `startLoop`/`stopLoop` guard pattern from the Living Surface composable).

This guarantees no duplicate listeners/tickers across repeated resizes and no stale pointer state surviving a tier crossing (e.g. rotating a tablet from landscape-with-mouse to a coarse-touch state, or a browser window being dragged across a breakpoint).

## Reduced motion

Live `prefers-reduced-motion` `matchMedia` listener (matches existing pattern). When active: idle timelines A–D never start; the pinned `ScrollTrigger` is not created at all (normal scroll, no scroll-jacking); a single static, fully-composed frame is shown — a hand-authored "idle-settled" state approximating the Convergence/Resolution visual target (full grid, resolved masses, 2–3 active yellow nodes), expressed as the SVG's natural resting markup (no GSAP `.set()` needed). Toggling mid-session live tears down/rebuilds the appropriate state, matching the existing composable's live-toggle behavior.

## Entry choreography

Gated on the existing `introReady` ref, sequenced alongside (not blocking) the headline reveal: grid fades/draws in (~0.6s, staggered) → slash masses scale/fade in (~0.8s) → remaining construction lines draw (~0.6s, staggered) → 2–3 nodes activate (yellow flash) → idle timelines A–D start. ~2–2.5s total, using existing `motionDuration`/`motionEase`/`motionStagger` tokens from `motionTokens.ts`.

## Files

**New:**
- `app/components/home/HeroKineticBlueprint.vue` — mount wrapper, owns the SVG template markup + small CSS-pulse overlay
- `app/composables/motion/useHeroKineticBlueprint.ts` — all GSAP/ScrollTrigger logic: idle A–D, entry, scroll timeline, pointer damping, reduced-motion static state, tier/lifecycle management
- `app/composables/motion/kineticBlueprintPaths.ts` — static path/coordinate data per tier (desktop/tablet/mobile) and per-phase "resolved" scroll-target states

**Modified:**
- `app/components/home/Hero.vue` — swap `<HomeHeroLivingSurface class="z-[3]" />` for `<HomeHeroKineticBlueprint class="z-[3]" />` at the existing mount line only

**Removed:**
- `app/components/home/HeroLivingSurface.vue`
- `app/composables/motion/useHeroLivingSurface.ts`
- Three.js dependency removal evaluated separately during implementation if nothing else depends on it (not assumed here)

## Performance / lifecycle strategy

Same discipline as the audited Living Surface composable, adapted for DOM/SVG:

- **Visibility pause**: `IntersectionObserver` (threshold 0) + `document.visibilitychange` → `.pause()`/`.resume()` all 4 idle timelines and the pointer `gsap.ticker` listener. ScrollTrigger's own scrub/pin naturally no-ops when not in viewport-relevant range.
- **Reduced motion**: live listener, tears down/rebuilds idle timelines and the pin's ScrollTrigger on toggle.
- **Resize**: `ResizeObserver` on the section; `viewBox`+`preserveAspectRatio` absorbs most resizes with zero JS. Only a tier crossing (mobile↔tablet↔desktop) rebuilds the coordinate set from `kineticBlueprintPaths.ts` and restarts idle timelines with the new element set.
- **Cleanup**: one returned function that kills all GSAP timelines/tweens, the ScrollTrigger instance, the `gsap.ticker` listener, both observers, and both `matchMedia`/`visibilitychange` listeners. No WebGL context to force-lose, but every acquired observer/listener handle must be explicitly released.
- **No per-frame DOM measurement**: pointer bounds are cached in **document space**, not viewport space, because the Hero section moves relative to the viewport as the page scrolls through the pre-pin, pinned, and post-pin ranges. On mount and on resize, compute once: `cachedDocumentTop = rect.top + window.scrollY`, plus cached `width`/`height`/`left` from the same `getBoundingClientRect()` call. On every pointer update (inside the `gsap.ticker` callback, not per raw `mousemove`), derive the current viewport-space top on the fly as `currentViewportTop = cachedDocumentTop - window.scrollY` — this is a cheap arithmetic op, not a layout-triggering measurement, so it stays safe to run every tick. `getBoundingClientRect()` itself is never called inside the pointer or ticker hot path — only on mount and on `ResizeObserver` callbacks (which already exist for tier reconciliation). This keeps pointer-to-element proximity mapping correct before, during, and after the pinned scroll range.
- **SSR/hydration**: same `ClientOnly` wrapper as today around the whole component, avoiding any mismatch between entry-choreography initial state and server output.

## Testing / acceptance

Manual verification against the brief's quality gates before calling this done:
- Static screenshot at idle (animation paused) reads as composed/premium, not empty
- 15s idle observation shows visible evolution without interaction
- 20s idle observation shows no detectable short loop
- Scroll down and back up through the full pin range shows no jump cuts or state bugs
- Reduced-motion mode shows a full composed static frame, not a blank/stripped Hero
- Desktop/tablet/mobile each look intentionally art-directed, not naively scaled
- No console errors, no layout shift, no hydration mismatch, no duplicate GSAP timelines on repeated mount/unmount (HMR test)
- Reduced-opacity scrim (`paper/0.25`) still keeps headline fully legible while the grid/registration layer behind it has visible presence in a static screenshot
- Each tier (desktop/tablet/mobile) pins for its specified distance (160vh/100vh/65vh) and mobile does not feel scroll-jacked
- Resizing the browser across a tier breakpoint mid-session re-attaches/detaches pointer interaction correctly with no duplicate listeners or stale ticker callbacks
- Pointer proximity mapping stays accurate when tested before the pin activates, while pinned mid-scroll, and after the pin releases
