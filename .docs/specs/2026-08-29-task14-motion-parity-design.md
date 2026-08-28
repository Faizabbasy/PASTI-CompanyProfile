# TASK 14 — Cuberto Motion Parity Pass — Design Spec

## Goal
Bring PASTI's homepage motion language (page load, scroll, hover, cursor,
transitions) close to Cuberto's, without touching layout, copy, data, or
section structure established in TASK 13. Cuberto's **live site** is the
motion benchmark (`./references/cuberto/` still does not exist in this repo —
confirmed again this session).

## Cuberto live-site findings (observed via Playwright DOM probe, not assumed)
- `<html class="lenis">` — Cuberto uses **Lenis** for smooth scroll.
- Custom cursor system: `.cb-cursor > .cb-cursor-inner > (.cb-cursor-media, .cb-cursor-text)`,
  `position: fixed`, moved via `transform: translate(x, y)` each frame.
  - `data-cursor-icon="arrow-up-right"` on `.cb-card` (project cards) and
    `.cb-logoreel-item` (logo items) — cursor swaps to an arrow-icon state.
  - `data-cursor="-inverse"` on dark sections (`.cb-summary.-inverse`,
    `.cb-faq.-inverse`, `.cb-outro`, `.cb-footer`) — cursor inverts color for
    contrast.
  - No `data-magnetic` marker found anywhere in the DOM — magnetic behavior
    (if any) is applied without a DOM signature, so magnetic scope in PASTI
    stays conservative (see below), not copied 1:1.
- No `.pin-spacer` / ScrollTrigger pin markers on the homepage — **Selected
  Work is not a pinned/sticky section** on Cuberto's real site today. Do not
  build pinning for PASTI's Selected Work.
- Heading text reveal pattern: every word wrapped
  `<span style="overflow:clip"><span style="transform:translateY(120%→0%)">Word</span></span>`
  — a masked **word-level** reveal, animated per word with stagger. This
  replaces PASTI's current line-level `clip-path` (`animate-reveal`) as the
  primary text-entrance technique.
- Project card hover: `transform: scale(1.05)` applied to the media/image
  only (not the whole card), ~600ms — no translateY/box-shadow card hover.
- Logo reel section (`cb-logoreel`) header uses the same word-reveal
  animation; no confirmed continuous marquee scroll of the logos themselves
  was observed.

## Stack decision (confirmed with user)
- Add **gsap** (core + `ScrollTrigger` plugin) as the animation foundation —
  current project has zero animation libraries (pure Tailwind keyframes +
  native `IntersectionObserver`), and the task brief itself directs GSAP if
  none exists.
- Add **Lenis** for smooth scroll, synced to `ScrollTrigger`'s ticker (the
  standard GSAP+Lenis integration pattern). Disabled under
  `prefers-reduced-motion` and falls back to native scroll on touch/mobile.
- No other library (no cursor lib, no WebGL, no physics engine) — custom
  cursor and magnetic interactions are hand-built per the task's explicit
  "recreate behavior using your own code" instruction.

## New composables (client-only, `app/composables/motion/`)
- `useLenis()` — singleton Lenis instance, wired into a `requestAnimationFrame`
  loop that also drives `ScrollTrigger.update()`; disabled entirely when
  `prefers-reduced-motion: reduce` or when running under test/SSR.
- `useGsapContext(fn)` — thin wrapper around `gsap.context()` scoped to the
  calling component's root element; auto-`revert()` on `onBeforeUnmount`.
  Every component-level animation MUST go through this to satisfy the task's
  cleanup/no-duplicate-init requirement.
- `useMaskedReveal(el, { by: 'word' | 'line', stagger?, trigger? })` — splits
  text into the double-span mask structure observed on Cuberto, animates via
  GSAP + ScrollTrigger (or immediately for page-load use without a trigger).
  Replaces `.reveal-up` for headings/eyebrows/paragraphs.
- `useScrollReveal(el, options)` — GSAP/ScrollTrigger equivalent of the
  existing `useRevealOnScroll` for non-text elements (images, cards): fade +
  rise/scale-in, one-shot, supports built-in stagger for a group of children
  (replacing manual inline `transitionDelay`).
- `useMagnetic(el, { strength?: number })` — pointer-relative translate on
  the target, only bound on devices matching `(pointer: fine)`; snaps back
  with an elastic-but-restrained ease on leave.
- `useCustomCursor()` — global singleton mounted once in `app.vue`. Exposes
  a `setState(state: 'default' | 'link' | 'view' | 'inverse')` that any
  component calls on `@mouseenter`/`@mouseleave`. Entirely inert (never
  mounted/rendered) on `(pointer: coarse)` devices.

All motion composables must:
- Respect `prefers-reduced-motion: reduce` (via `gsap.matchMedia()`), falling
  back to instant/no-op state changes.
- Be torn down cleanly on unmount (ScrollTrigger instances killed, Lenis
  RAF loop cancelled once, cursor listeners removed) — no duplicate
  initialization across route navigation or HMR.
- Keep animating only `transform`/`opacity`/`clip-path` (no layout-
  triggering properties), per the task's performance directive.

## Per-section motion plan

| Section | Change |
|---|---|
| Page load / Nav / Hero | GSAP timeline gated by existing `useIntroReady()` beat: nav fade+drop → Hero eyebrow masked reveal → H1 word-level masked reveal (stagger ~0.05s/word, `power3.out`) → sub-copy fade+rise → CTA stagger → visual block scale(1.05→1)+clip-inset. Total ≤ ~1.4s. Hero scroll-away: scrub-linked translateY + opacity fade as user scrolls into What We Do. |
| Navigation | Keep existing underline scale-x hover. Add masked two-line text-shift hover (old label slides up/out, new slides in from below) on desktop nav links only. Mobile menu: same `<Transition>` structure, item stagger moves from inline `transitionDelay` to GSAP. |
| What We Do / Why PASTI | `.reveal-up` → `useMaskedReveal` (line-level for paragraphs, word-level for eyebrow labels). Why PASTI metrics: clip-mask reveal per row, explicitly **no** fake counter/count-up animation (Cuberto doesn't use one; task forbids inventing it). |
| Services | Keep existing row hover bg/text color transition. Add: index number scale+fade, title micro horizontal shift (4–8px), arrow fade+translateX from the right. No card-style translateY/shadow hover (row layout already avoids this). |
| Trust | No marquee — Cuberto's own homepage doesn't run one on the logo grid today, and the brief says not to invent one. Improve existing grayscale→color reveal to GSAP stagger. **Fix latent gap**: logo grid's `.reveal-up` elements found during audit to never receive `.is-visible` (only the heading triggers) — wire them to their own scroll-reveal so the grid animates correctly once logos are populated. |
| Selected Work (top priority) | No pin/sticky (matches confirmed Cuberto behavior). Card entrance: clip-path inset wipe + scale(1.08→1) "zoom settle" on scroll-in. Hover: image scale 1→1.05 matching Cuberto's ratio, caption micro-translateY, cursor → `view` (arrow) state even though cards aren't `<a>` yet (cursor state bound to the `group` div). Scroll-linked: light per-column parallax via `scrub`. |
| Insights / Platforms | Same family of motion as Selected Work, lighter weight (not top priority): softer image scale-on-hover, arrow translate, title micro-shift, masked reveal on row titles. |
| Final CTA | Magnetic heading-link + dedicated large cursor state (e.g. "Contact" circle). Per-word hover micro-interaction on the heading. |
| FAQ | Keep the `grid-template-rows: 0fr↔1fr` accordion mechanism as-is (already smooth, not JS `scrollHeight`). Only refine the plus/minus icon rotation easing via GSAP; no structural change to `<details>`. |
| Footer | Minimal: reuse nav's link hover pattern (underline + micro shift). No scroll-linked motion, per the task's "don't overdo it" instruction. |

## Custom cursor states (final scope)
- `default` — small dot follower.
- `link` — slightly enlarged, generic interactive hover.
- `view` — arrow-icon state (mirrors Cuberto's `arrow-up-right`), bound to
  Selected Work cards, Insights cards, Platform rows.
- `inverse` — color-inverted variant over dark sections (Selected Work,
  Final CTA, Footer), mirroring Cuberto's `data-cursor="-inverse"`.
- Mounted only under `(pointer: fine)` — never on touch devices. Native
  click behavior and focus/keyboard interaction are untouched (cursor is a
  purely visual overlay, `pointer-events: none`).

## Magnetic scope (final)
Limited to two elements, matching the task's explicit call-outs and the
absence of a broader magnetic signature in Cuberto's actual DOM:
1. Hero primary CTA button.
2. Final CTA heading-link.

No magnetic behavior on project cards, service rows, or small icon buttons.

## Explicitly not doing
- No pinned/sticky Selected Work (confirmed unnecessary against live Cuberto).
- No logo marquee in Trust (confirmed unnecessary against live Cuberto).
- No WebGL, no physics/inertia engine, no count-up numeric animation.
- No new homepage sections, no copy/data changes, no layout restructuring
  beyond what implementing motion strictly requires (e.g., wrapping text in
  spans for masked reveal).
- No route/page transitions added (out of scope — task is homepage-section
  motion only; only one page exists today).

## Verification plan
1. `npx nuxi typecheck`, `npm run build`, `npm run lint` if a lint script
   exists (audit `package.json` scripts first).
2. `npm run dev` + Playwright scratch-dir pattern (per HANDOFF.md) across
   desktop/laptop/tablet/mobile viewports: check page load sequence, scroll
   through the full page, hover key interactive elements, confirm no
   horizontal scroll, no console errors, no hydration warnings.
3. Explicitly test: page refresh mid-scroll, browser resize, repeated route
   re-entry (HMR-equivalent) for duplicate ScrollTrigger/Lenis
   initialization, `prefers-reduced-motion: reduce` emulation, and a
   touch-emulated viewport to confirm cursor/magnetic are inert.
4. Manual diff against Cuberto live site behavior per section (the
   "motion comparison loop" the task requires) using targeted Playwright
   probes (scroll position screenshots, hover-state screenshots) rather than
   static screenshots alone.

## Commit plan
Multiple commits, grouped by logical unit (matches the project's existing
one-section-per-commit convention):
1. Foundation: gsap+lenis install, motion composables, cursor mount in `app.vue`.
2. Page load + Nav + Hero motion.
3. What We Do + Why PASTI (masked reveal rollout).
4. Services + Trust (incl. the latent reveal-gap fix).
5. Selected Work (top priority section).
6. Insights + Platforms.
7. Final CTA (magnetic) + FAQ (icon easing) + Footer.

Do not push — commit locally only, per HANDOFF.md's standing instruction.
