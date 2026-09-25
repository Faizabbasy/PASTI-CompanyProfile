# PASTI WEBSITE REWORK — IMPLEMENTATION PLAN v1.0

**Status:** Planning only. No code written. No packages installed. No files deleted or refactored.
**Authority:** `docs/rework-v2/` (00–07), frozen. This document is downstream of that baseline, not a replacement for it.
**Scope:** Homepage rework (`app/pages/index.vue` and its 9 locked sections) + supporting global foundation + legacy decommission.

---

## 0. FACTUAL BASELINE (verified against current codebase, 2026-09-25)

This plan is grounded in an actual survey of `app/`, not assumptions. Key facts that drive every decision below:

- **Current homepage (`app/pages/index.vue`) renders 11 components**, not the locked 9: Hero → WhatWeDo → ServiceCards → Trust → SelectedWork → Testimonials → WhyPasti → Platforms → Insights → Faq → FinalCta. Order and set both diverge from the frozen spec (Hero → What We Build → Selected Work → Trusted by Brand → Testimoni → Platforms → Insight → PAQ/FAQ → Footer).
- **`ServiceCards.vue`, `WhyPasti.vue`, `FinalCta.vue` have no equivalent in the locked 9-section architecture.** They are Cuberto-content-mapping-era holdovers.
- **161 Hero/intro experiment files** live under `app/components/home/hero-bg/` (135), `app/components/intro/` (25), and `app/components/home/HeroKineticBlueprint.vue` (1), plus 2 orphaned composables (`useHeroKineticBlueprint.ts`, `kineticBlueprintPaths.ts`). Only **2 of the 161 component files are reachable in production** (`HeroBgThreeWireGrid.vue`, `IntroAgencyCounterLogoStack.vue`). None of this is part of the deletions already staged in git — those staged deletions are 100% `.docs/`/`docs/superpowers/` documentation, untouched `app/` source.
- **Token layer mismatch:** `tailwind.config.ts` defines a navy/yellow color system with pill-radius buttons (`rounded-full` throughout `main.css`) that has no relation to `06-design-tokens.json`'s slateNavy/cobalt/cyan/pureWhite system and directly violates the Brand Guide's 6–12px compact-radius mandate.
- **Font already hardcoded** (Manrope display / Inter body) in `nuxt.config.ts` + `tailwind.config.ts`, despite docs stating font is undecided.
- **Testimonials.vue actively violates the frozen spec**: elastic/bounce easing (`back.out(1.6)`), auto-cycling carousel, idle floating — all explicitly banned in `04-homepage-spec.md`.
- **Faq.vue and Footer.vue contain the glow/Yellow decoration the spec explicitly requires removed**, even though their IA/structure is marked "preserve."
- **Motion infrastructure is centralized and largely reusable**: single `useLenis.ts` singleton synced to GSAP ticker (mounted once in `app.vue`), `useGsapContext.ts` cleanup helper, `useMaskedReveal.ts`/`useScrollReveal.ts` used broadly, `useHeroHandoff.ts` bridging Hero→WhatWeDo. No competing scroll libraries found.
- **Existing production/current content is present in the codebase** in 6 top-level composables (`useTestimonials`, `useSelectedWork`, `useTrustedClients`, `usePlatforms`, `useInsights`, `useFaq`) — this is not independently verified as approved-for-production in this plan; authenticity, approval, and freshness must be verified before final production sign-off (§11). Its presence conflicts with the docs' Lorem-ipsum-until-approved default; resolved by §17.1 (CLOSED): reuse-and-reshape with a verification gate.
- **No feature-flag system exists.** The only precedent for staging experimental work is a standalone unlinked page (`preview-clou-hero.vue`).
- Stale git worktrees (5 registered + 4 unregistered) on disk carry legacy experiment names (K95, Living Surface, kinetic blueprint, disassembly handoff) as branch names, not as files in the main tree. Cleanup of these is a `git worktree remove` operation, tracked separately from `app/` file deletion.
- **Homepage rhythm/motion-intensity table is locked in `04-homepage-spec.md` line 21–33**: Hero=Heavy, What We Build=Heavy, **Selected Work=Heavy**, Trusted by Brand=Quiet, **Testimoni=Medium**, **Platforms=Heavy**, Insight=Medium, PAQ/FAQ=Quiet, Footer=Quiet. Any risk/build-order classification in this plan must match this table — Platforms is a Heavy Signature section (Spatial World Transfer, pinned horizontal, dual product worlds) and Testimoni is Medium (no pin, normal scroll, zig-zag field). An earlier draft of this plan had these reversed; corrected throughout §2, §7, §8, §14, §16 below.
- **Selected Work's target architecture is `04-homepage-spec.md` §3's Pinned Project Exchange, in full** — not an extension of the current plain grid. Locked specifics: 10 project states (data-driven, scalable beyond 10), pinned stage with ~50/50 media/typography split, sides alternate per project (odd: media-left/type-right, even: type-left/media-right) while the project-index Signal holds a persistent, non-alternating position, 7-treatment rhythm vocabulary (Standard/Media-Dominant/Typography-Dominant/Temporary-Full-Bleed/Accelerated/Slower-Showcase/Closing), vertical/axis-consistent media mask grammar as the default grammar, scrubbed word-chunk description reveal, slide-up-mask title transitions, editorial-spine Signal (10 discrete segments, persistent edge placement), scroll depth ~6.5–8 viewport lengths baseline / ~9 viewport lengths guardrail (not literal CSS `vh` values — exact production scroll distance is calibrated during prototyping), mobile locked to media-above/typography-below for all 10 entries (no alternating at mobile). The current `SelectedWork.vue`'s plain-grid, no-pin, no-curtain behavior is **not** what the frozen spec locks — it is prior implementation history being misread as direction. Frozen docs win; corrected in §7.03 below.

---

## 1. IMPLEMENTATION STRATEGY SUMMARY

The existing codebase is **implementation material, not a target to preserve**. Three categories of work, run largely in sequence with some overlap:

1. **Foundation rebuild** — tokens, grid, typography abstraction, motion infrastructure audit/refinement. Nothing section-level starts before this lands, because every section consumes these tokens.
2. **Section-by-section rebuild**, ordered by risk (quiet/locked sections first, heavy signature sections last), each shipped behind visual/structural QA before the next begins.
3. **Legacy decommission**, staged in three waves: (a) safe-immediately (verified zero-reference), (b) wait-for-replacement (used by a section being rebuilt), (c) hold-for-reference (kept temporarily, e.g. for motion-pattern lookup), never deleted in one sweep.

The guiding discipline: **frozen docs win, existing behavior is not preserved by default, and nothing section-level is called "done" without QA against the spec's explicit guardrails** (scroll-depth budget, Signal role, reduced-motion, no-carousel/no-bounce locks, etc).

---

## 2. PHASED BUILD ORDER

Not homepage order. Dependency- and risk-ordered:

**A. Foundations** — design tokens, typography abstraction, grid, motion infra audit (§3 below).
**B. Quiet/locked-existing sections** — Trusted by Brand, PAQ/FAQ, Footer. Lowest behavioral risk (spec says preserve IA), good validation of the new token layer before touching anything harder.
**C. Medium sections** — Testimoni, Insight. Per the spec's own motion-intensity table (`04-homepage-spec.md` line 21–33), both are locked as **Medium** intensity: Testimoni is normal-scroll with no pin, Insight's Sticky Editorial Canvas is a lighter/shorter/flatter hold than a Heavy pinned section. Moderate new mechanics, contained scope.
**D. Heavy signature sections** — Hero, What We Build, Selected Work, Platforms. Per the same locked table, all four are **Heavy** intensity: Hero and What We Build's pinned curtain/decode/fan-spread choreography, Selected Work's full pinned Project Exchange across 10 states, and Platforms' pinned horizontal Spatial World Transfer between OPEN/e-CORPORATE. Highest Signal/motion complexity, highest chance of drift from spec, benefit from a mature token+motion foundation already validated by B and C.
**E. Cross-section continuity** — verify every adjacent-section handoff resolves per the frozen spec's locked visual-continuity language (§5): Hero→What We Build (explicit shared handoff mechanism), What We Build→Selected Work, Selected Work→Trusted, Trusted→Testimoni, Testimoni→Platforms, Platforms→Insight, Insight→PAQ, PAQ→Footer (all section-local state, but each must visually resolve into the next section's role).
**F. Responsive pass** — across all 9, once desktop compositions are locked.
**G. Reduced-motion pass** — across all 9.
**H. Cleanup** — legacy component/token/file decommission (§8), now that nothing references them.
**I. Final QA** — full-page regression per §13.

**Why this order:** B and C validate the foundation cheaply (low Signal complexity, "preserve IA" reduces design risk) before committing the foundation to the hardest sections in D. Cleanup is deliberately last — deleting legacy code before its replacement is proven invites regressions with no fallback.

---

## 3. GLOBAL FOUNDATION PLAN

Dependency order (each step blocks the next):

1. **Color tokens** — Replace `tailwind.config.ts`'s navy/yellow scale with the `06-design-tokens.json` palette (slateNavy, pureWhite, surfaceNeutral, cobalt, cyan, yellow-pending-hex). **Breakpoint scheme is CLOSED per §17.3**: `06-design-tokens.json`'s `mobile`/`tablet`/`desktop`/`wide` tiers are canonical; Tailwind's `sm`/`md`/`lg`/`xl`/`2xl`/`3xl` names remain only as implementation aliases mapped onto the exact approved token values — document that mapping explicitly, do not run two independent breakpoint systems.
2. **Spacing / section rhythm** — Apply the 8px grid + section-rhythm scale (120–200/96–144/72–112px) from `03-design-system.md`, replacing the current fluid-clamp `section`/`gutter` tokens where they conflict.
3. **Radius / border system** — Fix the pill-button violation: replace `rounded-full` in `main.css`'s `.btn-*` classes with the 6–8px button / 8–12px card radius tokens. Introduce the 1px structural border tokens (dark/light variants).
4. **Typography abstraction** — Build the role-based type system (display / body / metadata roles + CSS variables + fallback stack) per `06-design-tokens.json`, **without** picking a final brand font (see §12 Font Decision Gate). Manrope/Inter stay as the fallback/placeholder pairing until approved.
5. **12-column macro grid** — Formalize the container/gutter/column tokens from `03-design-system.md` as reusable Tailwind config + a `Container`/`Section` component contract (existing `app/components/base/Container.vue` and `Section.vue` are candidates to extend, not replace, pending a check that their current API can carry the new grid props).
6. **Dark/light surface tokens** — Define surface-rhythm pairs per section per `03-design-system.md`'s dark/light alternation principle.
7. **Motion timing/easing tokens** — Formalize Micro/Standard/Cinematic tiers and the approved easing curves (`cubic-bezier(0.16,1,0.3,1)`, `power3.out`, `power4.out`, `expo.out`) as shared constants (candidate: extend existing `app/composables/motion/motionTokens.ts` rather than creating a parallel file).
8. **Reduced-motion utilities** — Formalize a shared reduced-motion gate (audit whether `useLenis.ts`'s existing `prefers-reduced-motion` disable is the only gate, or whether per-section composables need their own check).
9. **Breakpoint behavior** — Lock the single breakpoint source from step 1 and confirm every foundation token above resolves against it consistently.
10. **Global layout primitives** — Only after 1–9 land, extend/adjust `Container.vue` / `Section.vue` / `HeroBackdrop.vue` to consume the new tokens.

Each step above is independently verifiable (render the app, confirm no visual regression on pages not yet touched by section work) before the next starts.

---

## 4. MOTION INFRASTRUCTURE PLAN

Existing infrastructure is **audited as reusable — do not redesign it.**

| Composable | Verdict | Notes |
|---|---|---|
| `useLenis.ts` | **Keep as-is** | Singleton, GSAP-ticker-synced, reduced-motion-aware. This is the correct pattern; no change needed. |
| `useGsapContext.ts` | **Keep as-is** | Cleanup-on-unmount helper used broadly; continue using for every new section. |
| `useMaskedReveal.ts`, `useScrollReveal.ts` | **Keep, refine call sites** | Reusable reveal primitives; each section rebuild should re-validate its params against the new motion-timing tokens (§3.7), not its logic. |
| `useHeroHandoff.ts` | **Keep, rename optional** | Bridges Hero exit → What We Build entrance; functionally matches the spec's "execution route → trigger/state" continuity requirement (§5 roles). Consider renaming only if Hero's rebuild changes the handoff's shape — do not rename speculatively. |
| `useResponsiveTier.ts`, `usePointerVelocity.ts`, `useScrollVelocity.ts`, `useDepthParallax.ts`, `useCardTilt.ts`, `useCursorSpotlight.ts`, `useMagnetic.ts`, `useAmbientLight.ts`, `useCountUp.ts`, `useLeaveTransition.ts` | **Keep, evaluate per-section** | Each is a candidate for reuse in a specific section's Signal work (§6); none needs global change. Evaluate at the section task, not upfront. |
| `useHeroKineticBlueprint.ts` + `kineticBlueprintPaths.ts` | **Replace/remove** | Only consumer is the orphaned `HeroKineticBlueprint.vue`. Decommission together (§8) once Hero's rebuild confirms it needs neither. |

**Do not consolidate composables speculatively.** The existing one-composable-per-concern structure matches the spec's "section-local behavior, shared primitives" model (§5 below) — consolidation would work against that, not for it.

No changes to Lenis/GSAP/ScrollTrigger library choice, versions, or ticker integration are needed — this stack is already the spec's mandated stack.

---

## 5. SIGNAL ARCHITECTURE PLAN

Not one generic component. Split into three layers:

**Global visual primitives** (shared, section-agnostic): point marker, short route/line, structural line, segmented progression indicator, color-state token, final structural-resolution motif — as defined in `03-design-system.md`. These become small, composable pieces (e.g. an SVG/CSS primitive per motif) that section components import and position — not a single `<Signal>` mega-component owning cross-section state.

**Shared token/style language**: the motion-timing tiers (§3.7), the Signal color-state tokens, and the structural-line/border tokens (§3.3) are the actual shared surface. Every section pulls from these, but each section decides *when* and *how* to trigger its own Signal state.

**Section-local behavior + role** (per `02-design-direction.md` / `04-homepage-spec.md`):

| Section | Signal role | State ownership |
|---|---|---|
| Hero | execution route | Hero owns entry/exit state; hands off via `useHeroHandoff.ts` |
| What We Build | trigger/state | Owns its own trigger threshold; consumes Hero's handoff payload |
| Selected Work | editorial spine | Section-local scroll-linked spine, no cross-section state needed |
| Trusted by Brand | proof marker | Fully local; existing marquee/focal-zone mechanism already matches this role |
| Testimoni | structural focus cue | Local; **must be rebuilt to a focus-indicator model, not the current carousel** |
| Platforms | transfer system | Local pinned-transfer mechanic; no dependency on neighboring sections |
| Insight | reading-state marker | Local scroll-position-driven marker |
| PAQ | existing accent bar | Preserve current accent-bar mechanism, strip glow/Yellow only |
| Footer | structural resolution | Local; final-resolution motif closes the page |

**Runtime state ownership vs. perceived visual continuity are two different things — do not conflate them.**

- **Runtime state ownership is mostly section-local**: each section owns and tears down its own state/lifecycle. Only Hero→What We Build has an explicit, code-level shared handoff mechanism (`useHeroHandoff.ts` passing a payload).
- **Perceived visual continuity, however, is required across the entire homepage**, per the frozen spec's own locked handoff language for every adjacent pair:
  - What We Build → Selected Work: What We Build's Signal repositions toward exit, becoming the origin/trigger for Selected Work's entry (full residual texture is *not* carried over — Selected Work gets a full visual reset, but the *perceived* handoff is still locked).
  - Selected Work → Trusted by Brand: the editorial-spine rail reaches its completed 10/10 state, then transitions into Trusted's quieter proof-state language — a quiet handoff, not a hard cut.
  - Trusted by Brand → Testimoni: Trusted's active rail resolves/collapses into one restrained Cobalt marker; Testimoni's own tonal/environment handoff (Surface Neutral → muted transitional band → full Slate Navy) is a separate, additional continuity requirement layered on top.
  - Testimoni → Platforms: Testimoni's ordered upward exit continues its momentum into Platforms' establish; Signal transforms from Testimoni's restrained focus anchor into Platforms' active product transfer system.
  - Platforms → Insight: Platforms' pinned world-transfer resolves before Insight's normal vertical entry begins; Insight is deliberately a light reset after Platforms' dark immersion (narrative shift from *product immersion* to *editorial clarity*).
  - Insight → PAQ/FAQ: a controlled tonal return from Surface Neutral back into Slate Navy — no dramatic wipe required, but the return is still a locked transition, not an arbitrary cut.
  - PAQ/FAQ → Footer: PAQ + Footer form one composed closing movement, differentiated by structural divider/spacing/density change and the Signal's final resolution — not a color-shift break.

**Do not build one global Signal state-machine.** Each section still owns and tears down its own lifecycle/state independently (per `useGsapContext.ts` discipline). But each section's entry/exit must be authored so it visually resolves into the next section's locked role — this is a QA and authoring discipline (§13 Cross-section handoff QA must therefore cover every adjacent pair, not only Hero→What We Build), not a shared-state architecture requirement.

**Mental model: local state, continuous visual language.**

**Lifecycle boundary rule**: every section owns and tears down its own ScrollTrigger instances via `useGsapContext.ts`; only the Lenis singleton and GSAP ticker are truly global.

---

## 6. CONTENT / DATA PLAN

Current content composables hold **existing production/current content present in the codebase** — not independently verified as client-approved by this plan — for Testimonials (4), Selected Work (6 projects), Trusted Clients (7 logos), Platforms (2 — matches spec exactly), Insights (7), FAQ (7). Authenticity, approval, and freshness of every item must be verified before final production sign-off (§11); this predates the rework docs' Lorem-ipsum-default rule and its production-readiness is not assumed here.

**Decision CLOSED (§17.1)**: reuse-and-reshape, with a verification gate. Existing content becomes baseline only after §11 verification; unverified items retain explicit unverified/placeholder state rather than being treated as final.

Target data shapes (extending current composable shapes, not replacing the composable pattern):

- **Hero proof content** — new shape needed; no current equivalent composable. Hero is locked around **Operational Evidence in Motion**: its Living Proof System requires exactly 1 Primary proof fragment + 2 Secondary proof fragments (Secondary A, Secondary B) + 1 Micro Utility fragment (`04-homepage-spec.md` §1). Data architecture should support: media/UI proof source (an actual PASTI execution/work/product-UI asset, not a generic image), fragment role (Primary/Secondary A/Secondary B/Micro Utility), crop/composition metadata (per the spec's occlusion-as-depth-mechanism requirement), state (for idle-motion behavior per fragment role), technical metadata, and Micro Utility state (restricted to the spec's whitelist: `ACTIVE`, `READY`, `SYNCED`, `LIVE`, `01/04`, `SYSTEM ACTIVE`, `PROCESS READY`, `STATUS/ACTIVE`). **Do not invent metrics, client counts, success rates, or generic logo-proof content** — the spec explicitly bans inventing KPI/uptime/client-count/success-rate/business numbers unless backed by real production data, and Hero's proof content is explicitly *not* locked to OPEN/e-CORPORATE (Platforms owns that content separately). Dummy visual assets are acceptable during composition/build only, replaced by real approved proof before production sign-off.
- **What We Build capability cards** — new shape; current `useServices.ts` (feeding the to-be-removed `ServiceCards.vue`) is the closest existing data and may be reusable *if* its fields are compatible with the frozen spec's card shape — verify field-by-field before reuse, do not assume compatibility.
- **Selected Work** — extend `useSelectedWork.ts`'s `{index, title, image}` shape to the frozen spec's fuller schema: title/category/description/meta, media type, rhythm-treatment metadata (which of the 7 treatments each project uses), placeholder state for unfilled fields. Current 6 projects vs. spec's 10-project baseline — the additional 4 need either new, verified-and-approved content (content-verification task, §11) or explicit placeholder state; do not invent client project content.
- **Trusted by Brand** — preserve `useTrustedClients.ts`'s existing content/order as baseline per spec. Verification task: confirm each logo/client relationship is still production-valid (§11) before final implementation; do not reorder or recolor.
- **Testimoni** — reshape to the spec's 6-card baseline (1 Featured + 3 Medium + 2 Compact, no-avatar default). Current 4 real quotes must be redistributed into this shape; the 2 missing cards need either new approved quotes or explicit placeholder + a content-verification flag per quote (§11) — do not treat existing 4 as fully covering the 6-slot schema without a decision on the gap.
- **Platforms** — `usePlatforms.ts` already matches "exactly OPEN + e-CORPORATE"; no data-shape change expected, only presentation.
- **Insight** — reshape to 1 Featured + 3 Supporting from the current flat 7-item shape; add a field distinguishing featured/supporting status.
- **FAQ** — preserve `useFaq.ts`'s existing data/IA as baseline per spec; no reshape expected.
- **Footer** — preserve `useFooter.ts`'s existing data as baseline per spec; no reshape expected.

No content is invented in this plan. Every gap above is logged as a content-verification or content-decision task, not silently filled.

---

## 7. 9-SECTION IMPLEMENTATION MATRIX

For each section: goal, existing component(s), target architecture, files, reuse, QA, risk.

### 01 Hero
- **Goal**: Rebuild to spec's "execution route" role; remove Cuberto-derived word-mask reveal pattern currently justified by "matching Cuberto's DOM."
- **Existing**: `app/components/home/Hero.vue` (198 lines), `app/components/home/hero-bg/HeroBgThreeWireGrid.vue` (only reachable background), `app/components/base/HeroBackdrop.vue`.
- **Target architecture**: Hero.vue rebuilt against homepage-spec's Hero composition; background scene either kept (if `HeroBgThreeWireGrid` is spec-compatible — verify, don't assume) or replaced by a new scene component under a single `home/hero-bg/` file, not a new experiment family.
- **Files to create**: none until Hero's own spec section is scoped in detail (out of this plan's depth per its "no code" instruction) — a follow-up section-level design pass produces the exact new component name.
- **Files to modify**: `Hero.vue`, potentially `HeroBackdrop.vue`.
- **Files to remove later**: all 134 unreachable `hero-bg/` files, `HeroKineticBlueprint.vue`, its 2 orphaned composables — only after this section's rebuild confirms none are needed for reference.
- **Reusable logic**: `useHeroHandoff.ts`, `useCursorSpotlight.ts`, `useMagnetic.ts`, `useIntroReady.ts`, `useSectionCurtain.ts`, `useWhatsapp.ts`.
- **Motion work**: re-validate entry/exit timing against Micro/Standard/Cinematic tiers; confirm handoff payload shape still fits What We Build's trigger.
- **Signal work**: owns execution-route state; hands off once.
- **Responsive/reduced-motion**: Hero is highest-risk for reduced-motion since it likely carries the heaviest scene; explicit reduced-motion fallback composition needed.
- **Content dependency**: Hero proof content (§6) undefined — blocks final content wiring, not layout skeleton.
- **QA acceptance**: matches spec's Hero composition, scroll-depth baseline (~1.3–1.6 viewport lengths — not a literal CSS `vh` value; exact production distance calibrated during prototyping), no Cuberto-derived markup/comments remain.
- **Risk**: **HIGH** — largest legacy footprint, most historical churn (per worktree names), highest Signal complexity.

### 02 What We Build
- **Goal**: Build the spec's real composition; current `WhatWeDo.vue` (27 lines) is a thin wrapper with none of the curtain/pin/decode/cluster-break mechanics the spec implies.
- **Existing**: `app/components/home/WhatWeDo.vue`, shared `EditorialIntro.vue` (153 lines, also used by WhyPasti — decouple before WhyPasti is removed, §8).
- **Target architecture**: full rebuild per spec; `EditorialIntro.vue` either forked or generalized into a shared intro primitive usable by What We Build alone once WhyPasti is decommissioned.
- **Files to modify**: `WhatWeDo.vue`; **files to watch**: `EditorialIntro.vue` (shared dependency — do not break WhyPasti's usage until WhyPasti is decommissioned in the same milestone).
- **Reusable logic**: `useScrollReveal.ts`, `useMaskedReveal.ts`, `useHeroHandoff.ts` (consumer side).
- **Content dependency**: capability-card data shape (§6), possibly reusing `useServices.ts` fields.
- **QA acceptance**: scroll-depth ~3.5–4 viewport lengths (guardrail ~4.5 viewport lengths — not literal CSS `vh` values; exact production distance calibrated during prototyping), correct trigger/state Signal role, receives Hero handoff correctly.
- **Risk**: **HIGH** — currently the least-built section relative to spec (thin wrapper today), core Signal trigger receiver.

### 03 Selected Work
- **Goal**: Full rebuild to the frozen spec's **Pinned Project Exchange** (`04-homepage-spec.md` §3) — a pinned, scroll-controlled, alternating split-screen sequence across 10 project states. **Correction from an earlier draft of this plan**: the current plain-grid `SelectedWork.vue` is not a spec-compliant target to extend — it is prior implementation history (a past revert away from curtain/pin experiments) that predates the frozen doc and does not satisfy it. The frozen spec explicitly locks a pinned mechanism; "frozen docs win over existing implementation" (§0 Core Principle) applies here in full, not selectively.
- **Existing**: `SelectedWork.vue` (74 lines, plain grid, no pin), `SelectedWorkCard.vue` (121 lines) — both require substantial rebuild, not incremental extension.
- **Target architecture**: pinned stage with ~50/50 media/typography split (visual-weight variance, not pixel-rigid); side alternation locked odd/even (media-left/type-right ↔ type-left/media-right) continuing unbroken across all 10; project-index Signal at a **persistent, non-alternating** edge position (vertical orientation, top-to-bottom = 01→10, 10 discrete segments — not a continuous fill, not a generic progress bar); 7-treatment rhythm vocabulary (Standard Exchange as majority baseline, Media-Dominant, Typography-Dominant, Temporary Full-Bleed Takeover that resolves back to split-screen, Accelerated Exchange, Slower Showcase, dedicated Closing State for project 10) with treatment-to-project assignment deferred to real content, not pre-assigned; vertical/axis-consistent media mask grammar as the default, horizontal reserved only for rare Full-Bleed rhythm-breaks; slide-up masked title transitions with brief entry/exit overlap; scrubbed word/phrase-chunk description reveal beginning after title settles, fully reversible on scroll-up; media transitions via mask-reveal + crop-shift (never simple slide/cross-fade); quiet handoff into Trusted by Brand as the rail reaches 10/10 and transitions to Trusted's Quiet Proof Marker language (§7.04 dependency).
- **Files to create**: likely a new pinned-choreography composable (name TBD at section-level design pass) analogous to `useHeroHandoff.ts`'s role for Hero — needed because the current component has no ScrollTrigger/pin logic to extend.
- **Files to modify**: `SelectedWork.vue` (full rebuild), `SelectedWorkCard.vue` (full rebuild — likely split further per rhythm-treatment variant given the 7-treatment vocabulary, evaluated at section-level design pass, not pre-decided here).
- **Reusable logic**: `useGsapContext.ts` (pin cleanup), `useScrollReveal.ts`/`useMaskedReveal.ts` as a starting point for the description/title reveal mechanics (will need scrubbed, chunked extension — audit whether they support scroll-scrubbed chunked reveal as-is or need a variant).
- **Content dependency**: extend `useSelectedWork.ts`'s `{index, title, image}` shape to title/category/description/meta/media-type/rhythm-treatment fields (§6); 4 additional projects needed (6 existing → 10 baseline) — content-verification/decision task (§11), blocks final content wiring only, not the pinned-mechanism build itself (the mechanism can be built and QA'd against placeholder/dummy project data first).
- **QA acceptance**: scroll-depth ~6.5–8 viewport lengths (guardrail ~9 viewport lengths, hard maximum — not literal CSS `vh` values; exact production distance calibrated during prototyping), pin behaves as one continuous mechanism across all 10 states forward/reverse/fast/slow scroll, side-alternation unbroken across all 10, editorial-spine Signal holds persistent position through the full pin, no reintroduced curtain/theatrical-wipe borrowed from Hero/What We Build's own (different) curtain mechanic, mobile locked to media-above/typography-below with no alternating reading order.
- **Risk**: **HIGH** — per the spec's own motion-intensity table this is a **Heavy Signature** section (not Medium/contained as an earlier draft assumed); it requires the largest net-new pin/choreography build of any section apart from Hero/What We Build, plus the same 6→10 content gap risk as before.

### 04 Trusted by Brand
- **Goal**: Preserve existing IA/mechanism; theme-integrate only (align colors/tokens to new palette), remove glow/Yellow per spec.
- **Existing**: `Trust.vue` (188 lines) — already has the marquee/focal-zone/hover-pause mechanism the spec asks to preserve; closest section to spec-compliant today.
- **Target architecture**: same structure, retokened.
- **Files to modify**: `Trust.vue` (styling/token pass only).
- **Content dependency**: verify all 7 logos are still production-valid (§11) before final ship — do not swap/reorder without approval.
- **QA acceptance**: unchanged mechanism, new token colors only, proof-marker Signal role intact.
- **Risk**: **LOW** — structurally closest to spec already; good first "quiet" milestone to validate the new token layer.

### 05 Testimoni
- **Goal**: Full behavioral rebuild — current implementation actively violates the spec (elastic/bounce easing, auto-cycling carousel, idle floating, only 4 cards vs. required 6-card Featured/Medium/Compact split).
- **Existing**: `Testimonials.vue` (159 lines), `TestimonialCard.vue` (145 lines).
- **Target architecture**: focus-indicator model (not carousel), approved easing only (no `back.out`), 1 Featured + 3 Medium + 2 Compact layout, no-avatar default.
- **Files to modify**: both files, substantially.
- **Content dependency**: 2 additional testimonials needed (4→6) — content-verification task (§11): quote authenticity, name/role/company, brand-naming consistency for all 6, mark unverified as placeholder.
- **QA acceptance**: no carousel/auto-cycle/elastic-easing/idle-float remain, scroll-depth ~1.4–1.7 viewport lengths (not a literal CSS `vh` value; exact production distance calibrated during prototyping), structural-focus-cue Signal role, no pin (normal scroll only, per the spec's own **Medium** intensity classification).
- **Risk**: **HIGH** — largest *behavioral* gap between current implementation and spec of any section (carousel/elastic-easing/idle-float all directly violate explicit locks), even though the spec classifies Testimoni's overall motion intensity as **Medium** (no pin, normal scroll) — the risk here is drift-from-spec and content gap, not choreography complexity. Build-phase placement: Category C (Medium), alongside Insight — see corrected §2.

### 06 Platforms
- **Goal**: Rebuild from simple label+rows to spec's pinned horizontal transfer mechanic.
- **Existing**: `Platforms.vue` (31 lines), `PlatformRow.vue` (150 lines).
- **Target architecture**: pinned/transfer-system composition per spec; data already matches (`usePlatforms.ts` — exactly OPEN + e-CORPORATE, no data change needed).
- **Files to modify**: `Platforms.vue`, `PlatformRow.vue` (or replaced by new pinned-transfer component depending on section-level design pass).
- **QA acceptance**: scroll-depth ~2.8–3.5 viewport lengths (guardrail ~4 viewport lengths — not literal CSS `vh` values; exact production distance calibrated during prototyping), transfer-system Signal role, fragment guardrails respected (OPEN: 1 Primary + optional 1 Secondary; e-CORPORATE: 1 Primary + max 2 Secondary), pinned horizontal world-transfer with significant OPEN/e-CORPORATE overlap, mobile locked to vertical stack (no pinned horizontal at mobile).
- **Risk**: **HIGH** — per the spec's own motion-intensity table this is a **Heavy Signature** section (not Medium/contained as an earlier draft assumed): full pinned horizontal Spatial World Transfer between two distinct product-world compositions, with a locked transition hierarchy (spatial transfer → crop/reframe → Signal state-transfer → opacity/depth as supporting only). Data is settled (`usePlatforms.ts` already matches "exactly 2"), but the mechanic itself is one of the four Heavy-tier builds. Build-phase placement: Category D (Heavy), alongside Hero/What We Build/Selected Work — see corrected §2.

### 07 Insight
- **Goal**: Rebuild simple 3-card grid into spec's Sticky Editorial Canvas with 1 Featured + 3 Supporting.
- **Existing**: `Insights.vue` (34 lines), `InsightsCard.vue` (84 lines).
- **Target architecture**: sticky editorial canvas per spec; extend data shape (§6) to mark Featured/Supporting.
- **Files to modify**: both files.
- **QA acceptance**: scroll-depth ~2.2–2.8 viewport lengths (guardrail ~3.2 viewport lengths — not literal CSS `vh` values; exact production distance calibrated during prototyping), reading-state-marker Signal role, Sticky Editorial Canvas reads as lighter/flatter/shorter than Platforms' pin (not "another Heavy pinned section" per spec's explicit caution), mobile locked to vertical editorial feed (no horizontal pin).
- **Risk**: **MEDIUM** — matches the spec's own **Medium** intensity classification; moderate new mechanic, contained scope, data mostly present (7 items, just needs featured/supporting split). Build-phase placement: Category C (Medium), alongside Testimoni — see corrected §2.

### 08 PAQ / FAQ
- **Goal**: Preserve IA/accordion mechanism; strip glow blobs, Yellow accents, and the continuous scroll-scrubbed heading-scale effect the spec disallows.
- **Existing**: `Faq.vue` (126 lines), `FaqItem.vue` (140 lines) — uses native `<details>/<summary>` semantics already (good baseline for accessibility, §10).
- **Target architecture**: same IA, retokened, glow/scroll-scrub removed, existing accent bar kept as the section's Signal role.
- **Files to modify**: both files (styling/effect removal, not structural rebuild).
- **QA acceptance**: no glow/Yellow decoration remains, accordion semantics preserved, existing-accent-bar Signal role intact.
- **Risk**: **LOW** — removal work, not net-new construction.

### 09 Footer
- **Goal**: Preserve IA/data; remove ambient glow blob, convert Yellow product-link dots to Cobalt.
- **Existing**: `app/components/layout/Footer.vue` (137 lines), mounted globally in `app.vue` (not `index.vue`).
- **Target architecture**: same structure, retokened, glow removed.
- **Files to modify**: `Footer.vue` (styling pass).
- **Content dependency**: preserve `useFooter.ts` data as-is.
- **QA acceptance**: no glow remains, Yellow dots are Cobalt, structural-resolution Signal role intact, mounts correctly outside `index.vue`.
- **Risk**: **LOW** — global-mount section, removal-only work, but touches every page (not just homepage) — regression check must cover all pages, not just `/`.

---

## 8. LEGACY DECOMMISSION PLAN

**Staged removal discipline**: replacement verified → references removed → runtime check → delete → regression check. Never delete in one sweep.

### Wave 1 — safe immediately (zero production references, verified by grep)
- `app/components/home/hero-bg/*.vue` **except** `HeroBgThreeWireGrid.vue` (134 files) — confirmed zero references anywhere in `app/`.
- `app/components/intro/*.vue` **except** `IntroAgencyCounterLogoStack.vue` (24 files) — technically referenced in `IntroOverlay.vue`'s dead `v-else-if` branches (behind hardcoded `isDev = false`); removing requires first trimming those branches from `IntroOverlay.vue` (a small, low-risk edit), then deleting the 24 files.
- Stale git worktrees (5 registered + 4 unregistered under `.claude/worktrees/`, `.worktrees/`) — via `git worktree remove`, not file deletion. Independent of the `app/` cleanup wave; can happen anytime, does not block or get blocked by section work. Per §17.9 (CLOSED), this is a separate housekeeping task, not a blocker, and must not be mixed into section-implementation commits.

**Note on the intro overlay (§17.5, CLOSED)**: since the decision is to remove the intro-overlay experience entirely (not just the 24 unreachable variants), the *entire* `app/components/intro/` directory (all 25 files) plus `IntroOverlay.vue` itself become removable together once Hero's rebuild (§7.01) confirms the homepage's direct-into-Hero entry has no residual dependency on the overlay component. This is still gated on Hero's rebuild (hence tracked in Wave 2 below), not immediately safe today — but it is no longer an open question of *whether* to remove it, only *when* it's safe to.

**Precondition before Wave 1 executes**: confirm via a fresh grep pass at execution time (not just this planning survey) that no new references were added mid-implementation.

### Wave 2 — wait for replacement (used by a section still being rebuilt)
- `HeroBgThreeWireGrid.vue` — only removable once Hero's rebuild (§7.01) confirms it either keeps this scene or ships a replacement.
- `HeroKineticBlueprint.vue` + `useHeroKineticBlueprint.ts` + `kineticBlueprintPaths.ts` — orphaned already, but hold until Hero's rebuild explicitly confirms no reference/pattern value remains (see Wave 3 rationale).
- `IntroAgencyCounterLogoStack.vue` + `IntroOverlay.vue` (all branches, not just the reachable one) — **Decision CLOSED (§17.5): remove the intro-overlay experience entirely.** The homepage enters directly into Hero; no user-facing intro overlay survives. This moves the full `IntroOverlay.vue` + all 25 `intro/*.vue` files from a Wave 2 "wait for Hero" item to effectively Wave 1 status once Hero's rebuild confirms it does not depend on the overlay for any entry sequencing — extract any reusable technique first if genuinely useful, but the overlay itself does not ship.
- `ServiceCards.vue` + `ServiceRow.vue` + `ServicesReactiveField.vue` — **Decision CLOSED (§17.4): standalone section removed.** `useServices.ts` may be audited for field/data reuse in What We Build *only if directly compatible* with the frozen capability-card requirements — do not force incompatible legacy content in. Remove component files once What We Build (§7.02) confirms what, if anything, it reuses from `useServices.ts`.
- `WhyPasti.vue` + `WhyPastiMetric.vue` + `useWhyPasti.ts` — **Decision CLOSED (§17.4): standalone section removed, content NOT carried into the new homepage by default.** Remove once `EditorialIntro.vue`'s shared usage is decoupled (What We Build must no longer depend on WhyPasti's usage pattern first).
- `FinalCta.vue` + `useFinalCta.ts` — **Decision CLOSED (§17.4 + §17.8): standalone homepage section removed, content NOT carried into the new homepage.** Remove only its `index.vue` (homepage) usage; do **not** delete the `FinalCta.vue` file itself, since `creative.vue`, `insights.vue`, `technology.vue`, `work.vue` remain out-of-scope pages that still depend on it (§17.8, CLOSED) — regression-check all four during cleanup/cutover.

### Wave 3 — hold temporarily for technical reference
- Nothing in the current survey clearly warrants indefinite hold — the "160 files" are experiments, not documented reference material. If Hero's rebuild (§7.01) finds a specific `hero-bg/` file's technique worth referencing during implementation, extract the specific technique/pattern into a note before Wave 1 deletes it; do not hold entire files "just in case" past Milestone completion (§14).

### Verification method before any deletion
1. `grep -rl "<ComponentName" app/` and `grep -rl "ComponentName" app/` (covers both template usage and script-side references) returns zero hits outside the file itself.
2. Dev server boots and the affected route(s) render without console errors.
3. Existing regression checklist (§13) re-run on affected pages.

---

## 9. PERFORMANCE GUARDRAILS

Qualitative thresholds (no fabricated hard numbers beyond what the frozen docs already specify):

- **ScrollTrigger count**: one instance per section-local motion behavior, torn down via `useGsapContext.ts` on unmount — never leave a stale trigger from a previous route. Audit trigger count after each section milestone; if a single section needs more than a handful of independent triggers, that's a signal the composition is over-fragmented (re-check against the spec's guardrail scroll-depth for that section).
- **RAF/ticker loops**: only the single `useLenis.ts`-driven GSAP ticker should run continuously; no section should start its own independent `requestAnimationFrame` loop — reuse the ticker via GSAP-driven tweens instead.
- **Videos**: none currently found in the 9 sections' media; if the Hero rebuild introduces one, it must respect the reduced-motion gate and lazy-load off the critical path.
- **Image loading**: continue Nuxt's existing image handling conventions; verify Selected Work / Trusted / Insight images use appropriate lazy-loading given they're below-the-fold for most viewport heights.
- **Large transforms / fixed layers**: minimize `position: fixed` layers to what Hero's pinned scenes and Platforms' pinned-transfer mechanic strictly require; avoid adding new fixed layers to sections marked "preserve" (Trusted, PAQ, Footer).
- **Blur/filter usage**: the spec's "Depth Without Blur" mental model (§02-design-direction.md) means blur/backdrop-filter should be the exception, not the default — audit each section's use against this before shipping.
- **WebGL default-off**: if Hero's rebuild considers a WebGL scene (as `HeroBgThreeWireGrid.vue` currently does via Three.js, wrapped in `<ClientOnly>`), keep it client-only-gated and provide a non-WebGL fallback for reduced-motion/low-capability contexts — mirroring the current `<ClientOnly>` pattern.
- **Mobile simplification**: per the design system's "recompose not scale" principle — each section's mobile composition is a deliberate re-layout, not a shrunk desktop version. Verify this explicitly in responsive QA (§13), not just visually eyeballed.
- **Cleanup/memory**: every new composable that attaches listeners (scroll, pointer, resize) must expose and be verified to call a teardown path on unmount — audit this at each section's QA gate, not only at the end.

---

## 10. ACCESSIBILITY PLAN

- **Reduced-motion**: verify `useLenis.ts`'s existing `prefers-reduced-motion` gate covers every new section's motion, not just Lenis-scroll-driven motion — sections with their own GSAP timelines (independent of scroll) need their own check against the same media query.
- **Keyboard**: every interactive element introduced in section rebuilds (Testimoni's focus-indicator controls, Platforms' transfer-system if it has interactive affordances, PAQ's accordion) must be reachable and operable via keyboard — verify tab order matches visual order per section.
- **Focus-visible**: audit that no section's rebuild suppresses default focus rings without providing an equivalent visible-focus treatment consistent with the new token system.
- **Semantic HTML**: preserve `FaqItem.vue`'s existing `<details>/<summary>` pattern (already correct) as the model for equivalent semantic choices elsewhere (e.g. Selected Work project cards as `<article>`, Trusted logos with proper `alt` text).
- **Heading hierarchy**: verify one coherent `h1`→`h2`→`h3` structure across the full homepage once all 9 sections are rebuilt — a single-page audit at Milestone completion, not per-section (heading level depends on page-level context, not just section-local markup).
- **Details/summary FAQ**: keep as-is; do not replace with a JS-driven accordion.
- **Links/buttons**: audit that every clickable element uses the semantically correct element (`<a>` for navigation, `<button>` for actions) — flag any current `<div>`-with-click-handler patterns found during section rebuilds.
- **Alt text**: verify every image across Selected Work, Trusted, Insight, Platforms carries meaningful alt text (not filename-derived) — part of the content-verification pass (§11).
- **Touch targets**: verify minimum touch-target sizing on mobile for Testimoni's focus controls, Platforms' interactive elements, PAQ's accordion triggers, and nav elements — check against the new spacing tokens (§3.2), not arbitrary pixel guesses.
- **Contrast**: re-verify text/background contrast ratios once the new color tokens (§3.1) land, especially for the metadata-role typography (typically smaller/lighter) against both dark and light surface tokens (§3.6).

---

## 11. CONTENT VERIFICATION PLAN

Required pre-production tasks — not optional:

**Trusted by Brand**
- Verify each of the 7 current logos (Google, Microsoft, Meta, Shopify, Shopee, TikTok, WordPress) represents a still-valid, still-approved client/partner relationship.
- Verify logo asset files (`public/logos/` — paths referenced but not asset-content-verified in this plan) are current, correctly licensed, and production-quality.
- Do not replace, reorder, or recolor any entry without explicit approval.

**Testimoni**
- Verify authenticity of all 4 existing quotes (still consented, still accurate).
- Verify name, role, company, and brand-naming consistency for each.
- For the 2 additional cards needed to reach the 6-card baseline: either source 2 new approved quotes, or mark those 2 slots as explicit placeholder state (not silently duplicated or invented).
- Mark every unverified quote with a content-verification flag in the data shape (§6) until sign-off.

**Selected Work**
- Verify the 6 existing client projects (IKEA Indonesia, JM-Click/Jasa Marga, PowerHours, HDI Healthy Lifestyle, Pertamina, OCTO Mobile/CIMB Niaga) are still approved for public display.
- For the 4 additional projects needed to reach the 10-project baseline: source new approved projects or mark as placeholder — do not invent client work.
- Verify media assets exist and are production-quality for every project, existing and new.

**Insight**
- Verify the 7 existing articles are still current/accurate for public display; confirm which 4 (1 Featured + 3 Supporting) are the intended homepage selection, since the current data shape doesn't yet distinguish them.

**FAQ / Footer**
- Lower-priority verification pass: confirm existing Q&A and footer links/data are still accurate (no schema change expected, so this is a content-freshness check, not a re-approval task).

**Alt text / asset audit**
- As part of the above, verify every image asset referenced by the 6 content composables has appropriate alt text prepared, per §10.

---

## 12. FONT DECISION GATE

Font family is explicitly pending. Definition of what can and cannot proceed without it:

**Can proceed without final font:**
- Global foundation's typography *abstraction* (display/body/metadata roles as CSS variables, §3.4) — the variable structure doesn't depend on which font fills it.
- Layout skeleton for every section (grid, spacing, composition) — layout doesn't depend on font metrics at the skeleton stage.
- Type-role variable wiring throughout components (components reference `var(--font-display)` etc., not a hardcoded family name).
- Fallback-stack definition (system fonts / current Manrope-Inter pairing as placeholder).

**Cannot proceed / becomes a hard blocker:**
- **Final line-break, crop, and spacing visual QA** for any section cannot be signed off before the font decision — different fonts produce different line-wrap points, letter-spacing needs, and vertical rhythm, especially for Hero's large display sizes (`clamp(72px,9vw,160px)`).
- **Final Hero composition QA** specifically, since Hero's display type is the most visually load-bearing element on the page.
- **Cross-browser font-loading/FOUT-FOIT strategy** — can't be finalized until the actual font (and its licensing/hosting method) is chosen.

**Practical implication for build order**: Sections can be built and structurally QA'd using the current Manrope/Inter placeholder pairing (already in code) without blocking on font approval, but every section's *final* visual QA sign-off (§13 Static QA) must be re-run once the font is locked, and this re-run is a scheduled step, not an afterthought.

---

## 13. QA PLAN

Applied per-section at each milestone gate, and again at full-page completion.

**Static QA** — composition matches homepage-spec's per-section layout description; spacing matches the 8px grid + section-rhythm tokens (§3.2); typography hierarchy matches role assignment (display/body/metadata) regardless of final font.

**Motion QA** — forward scroll, reverse (scroll-up) behavior, fast scroll (trigger-skip handling), slow scroll, browser resize mid-scroll (trigger recalculation via matchMedia), and full-page refresh while mid-scroll (initial-state correctness) — each section's ScrollTrigger(s) tested against all six conditions, not just forward-scroll-once.

**Responsive QA** — desktop (1440/1280 container widths), tablet, mobile — verified against the "recompose not scale" principle (§9), i.e. confirm each breakpoint has a deliberately composed layout, not a naive scale-down.

**Reduced Motion QA** — `prefers-reduced-motion: reduce` verified per section: confirm each section still functions and communicates its content without its full motion treatment, per the reduced-motion philosophy in `03-design-system.md`.

**Accessibility QA** — per §10's checklist, re-run at each section milestone and once more at full-page completion for heading hierarchy.

**Performance QA** — ScrollTrigger count audit, ticker-loop audit, cleanup/memory audit per §9, run at each milestone and again at full-page completion under throttled CPU/network conditions.

**Content QA** — every content-verification task in §11 resolved (verified, replaced, or explicitly flagged placeholder) before a section's final sign-off.

**Cross-section handoff QA** — for Hero→What We Build specifically: verify the explicit handoff payload triggers correctly regardless of scroll speed/direction. For every other adjacent pair (What We Build→Selected Work, Selected Work→Trusted, Trusted→Testimoni, Testimoni→Platforms, Platforms→Insight, Insight→PAQ, PAQ→Footer): verify the perceived visual continuity locked in §5/`04-homepage-spec.md` reads correctly (tonal handoff, Signal-state transformation, momentum carryover, etc.) even though runtime state stays section-local — and confirm no section pair has accidentally introduced *shared runtime state* that the Signal architecture plan (§5) says should stay local (visual continuity is required; state coupling is not).

---

## 14. MILESTONES

No time estimates, per instruction. Each milestone below is a completion boundary, not a schedule.

### Milestone 1 — Global Foundation
- **Scope**: §3 steps 1–10 (tokens, spacing, radius, typography abstraction, grid, surfaces, motion timing tokens, reduced-motion utilities, breakpoint consolidation, layout primitives).
- **Files/systems affected**: `tailwind.config.ts`, `app/assets/css/main.css`, `app/composables/motion/motionTokens.ts`, `app/components/base/*`.
- **Acceptance criteria**: no visual regression on any currently-unmodified page; new tokens resolve consistently; pill-radius violation fixed; single breakpoint scheme in effect.
- **Dependency**: none (first milestone).
- **Rollback strategy**: token/config changes are isolated to a handful of files; revert via git if any page breaks.
- **Approval needed before next milestone**: breakpoint-naming (§17.3) and font-placeholder approach (§17.2) are both already CLOSED — confirm the token-layer implementation actually conforms to those closed decisions (tokens.json as canonical breakpoint source with Tailwind aliases; Manrope/Inter wired as interim placeholder via role-based CSS variables, not hardcoded as final) before Milestone 2 starts.

### Milestone 2 — Quiet Sections (Trusted, PAQ/FAQ, Footer)
- **Scope**: §7 sections 04, 08, 09 — retokening + glow/Yellow removal, no structural rebuild.
- **Files/systems affected**: `Trust.vue`, `Faq.vue`, `FaqItem.vue`, `Footer.vue`.
- **Acceptance criteria**: §13 QA passes for all three; content-verification tasks for Trusted logos resolved (§11).
- **Dependency**: Milestone 1 complete.
- **Rollback strategy**: each section is independently revertible; no cross-section coupling introduced here.
- **Approval needed**: confirm glow/Yellow removal reads correctly against the new token palette before proceeding to heavier sections.

### Milestone 3 — Medium Sections (Testimoni, Insight)
- **Scope**: §7 sections 05, 07 — matching the spec's own **Medium** motion-intensity classification (`04-homepage-spec.md` line 21–33): Testimoni's normal-scroll zig-zag field rebuild, Insight's sticky editorial canvas. **Corrected from an earlier draft**, which grouped Platforms here — Platforms is Heavy per the locked table and moved to Milestone 4.
- **Files/systems affected**: `Testimonials.vue`, `TestimonialCard.vue`, `Insights.vue`, `InsightsCard.vue`.
- **Acceptance criteria**: §13 QA passes; Testimoni's 6-card Featured/Medium/Compact split implemented, no carousel/elastic-easing/idle-float remains; Insight's featured/supporting data split implemented (§6).
- **Dependency**: Milestone 1 complete; independent of Milestone 2.
- **Rollback strategy**: independently revertible.
- **Approval needed**: confirm neither section's rebuild exceeds its scroll-depth guardrail before proceeding to heavier sections.

### Milestone 4 — Heavy Signature Sections (Hero, What We Build, Selected Work, Platforms)
- **Scope**: §7 sections 01, 02, 03, 06 — matching the spec's own **Heavy** motion-intensity classification (`04-homepage-spec.md` line 21–33). **Corrected from an earlier draft**, which mis-grouped Testimoni here (it is Medium) and understated Selected Work's rebuild as an extension of the current plain grid (it is a full Pinned Project Exchange rebuild, §7.03) — Selected Work and Platforms are the two Heavy sections that move into this milestone in their place.
- **Files/systems affected**: `Hero.vue`, `HeroBackdrop.vue`, `WhatWeDo.vue`, `EditorialIntro.vue`, `SelectedWork.vue`, `SelectedWorkCard.vue` (full pin rebuild, likely a new pin-choreography composable), `Platforms.vue`, `PlatformRow.vue` (full pinned horizontal world-transfer rebuild).
- **Acceptance criteria**: §13 QA passes for all four; Hero→What We Build handoff verified (§5, §13 cross-section); Selected Work's pin behaves as one continuous mechanism across all 10 project states with unbroken side-alternation; Platforms' OPEN↔e-CORPORATE transfer follows the locked transition hierarchy (spatial transfer → crop/reframe → Signal state-transfer → opacity/depth as supporting only); content gaps (Selected Work 6→10) resolved or explicitly placeholder-flagged (§11).
- **Dependency**: Milestones 1–3 complete (foundation proven stable on lower-risk sections first).
- **Rollback strategy**: highest-risk milestone; recommend one section at a time within this milestone, each independently gated, rather than landing all four together.
- **Approval needed**: full Hero visual sign-off is explicitly gated on the Font Decision (§12) if font is locked by this point; if not yet locked, Hero ships with placeholder font and is flagged for a mandatory re-QA pass later. Selected Work's and Platforms' pin mechanisms each get an explicit sign-off on scroll-depth guardrail compliance (~9 / ~4 viewport lengths respectively — not literal CSS `vh` values) before Milestone 5.

### Milestone 5 — Cross-Section Continuity + Responsive + Reduced Motion
- **Scope**: §2 phases E, F, G — Hero handoff polish, full responsive pass across all 9 sections, full reduced-motion pass across all 9 sections.
- **Files/systems affected**: all 9 section files, potentially shared composables if a cross-cutting responsive/reduced-motion gap is found.
- **Acceptance criteria**: §13 Motion/Responsive/Reduced-Motion QA passes across the full page, not per-section in isolation.
- **Dependency**: Milestone 4 complete.
- **Rollback strategy**: fixes here are typically small per-section adjustments; revert individual section commits if a responsive fix regresses desktop.
- **Approval needed**: full-page walkthrough sign-off across desktop/tablet/mobile before cleanup begins.

### Milestone 6 — Legacy Decommission
- **Scope**: §8 Waves 1 and 2 (Wave 1 can actually start as early as Milestone 1 completion, per §8 — listed last here only because full confirmation that nothing references legacy files is cheapest once all sections are rebuilt).
- **Files/systems affected**: 134 unreachable `hero-bg/*.vue`, 24 unreachable `intro/*.vue`, `HeroKineticBlueprint.vue` + its 2 orphaned composables, `ServiceCards.vue`/`WhyPasti.vue` clusters, `FinalCta.vue`'s `index.vue` usage (not the file itself, per §8 Wave 2 note), stale git worktrees.
- **Acceptance criteria**: grep-verified zero references (§8 verification method) before each deletion; dev server + full regression QA (§13) after each wave.
- **Dependency**: Milestone 4 complete for anything Hero/WhatWeDo-related (Wave 2 items); Wave 1 items can run independently once Milestone 1 confirms the foundation doesn't touch them.
- **Rollback strategy**: git history preserves everything; this is the safest milestone to revert since it's pure subtraction.
- **Approval needed**: explicit go-ahead before deleting anything — recommend batch-listing every file slated for deletion for a final human review pass before executing.

### Milestone 7 — Final QA + Cutover Readiness
- **Scope**: §13 full QA sweep across all categories; §15 cutover precondition checks.
- **Files/systems affected**: none (verification-only milestone).
- **Acceptance criteria**: every QA category in §13 passes; every content-verification task in §11 resolved; font decision (§12) either locked-and-re-QA'd or explicitly deferred with owner sign-off.
- **Dependency**: Milestones 1–6 complete.
- **Rollback strategy**: n/a (no changes made in this milestone).
- **Approval needed**: this is the go/no-go gate for cutover (§15).

---

## 15. FINAL CUTOVER STRATEGY

- **Branch/worktree**: implement on a dedicated feature branch (not directly on `master`), given the scale of changes across `index.vue` and every section component. Given the existing stale-worktree clutter (§0), do not create yet another ad hoc worktree without a clear removal plan — prefer a single long-lived feature branch, merged in stages if the team wants incremental review, rather than a new worktree added to the existing pile.
- **Staged section integration**: land Milestones 1–6 as separate, individually reviewable commits/PRs against that branch (mirrors §2's phased order) rather than one giant diff — each section's PR should be independently revertible.
- **Temporary feature flag**: **Decision CLOSED (§17.6): no feature-flag system for this rework by default.** Use a dedicated feature branch + staged commits/review gates; the homepage ships as one completed rework after Milestone 7. Do not build new feature-flag infrastructure unless partial production rollout is explicitly requested later.
- **Removal of obsolete sections**: `ServiceCards`/`WhyPasti`/`FinalCta` removed from `index.vue`'s template as part of Milestone 4 (once What We Build absorbs any reusable ServiceCards data) — do not leave them mounted "just in case" once their replacements are confirmed.
- **Final cleanup**: Milestone 6's decommission completes before cutover is called done.
- **Regression verification**: full §13 QA sweep (Milestone 7) immediately before merge; re-verify the 4 non-homepage pages still using `FinalCta.vue` (`creative.vue`, `insights.vue`, `technology.vue`, `work.vue`) are unaffected, since this plan is homepage-scoped and must not silently break other routes.
- **No deployment** happens as part of this plan — cutover here means merge-readiness, not a live push.

---

## 16. RISKS

All nine former decision-blockers are now **CLOSED** per §17 (owner-approved 2026-09-25). Risk levels below reflect residual execution risk *given* those closed decisions, not open unknowns.

**BLOCKER**
- None remaining. The three items previously listed here (content-reuse policy, font family, ServiceCards/WhyPasti/FinalCta salvage) are resolved by §17.1, §17.2, §17.4 respectively. Residual work from each is tracked under HIGH/MEDIUM below — it is now execution risk, not a decision blocker.

**HIGH**
- Testimoni's current implementation directly violates multiple explicit spec locks (carousel, elastic easing, idle floating) — full behavioral rebuild required, not incremental fix; highest drift-from-spec section found relative to its own (Medium) intensity tier.
- Hero carries the largest legacy footprint (161 experiment files, multiple historical worktree attempts) — highest risk of the rebuild silently reintroducing Cuberto-derived or prior-experiment patterns without disciplined review against §0's "core principle."
- **Selected Work requires a full Pinned Project Exchange rebuild** (`04-homepage-spec.md` §3) — pin, 10-state alternating split-screen, 7-treatment rhythm vocabulary, persistent editorial-spine Signal — not an extension of the current plain-grid `SelectedWork.vue`. An earlier draft of this plan under-scoped this section as Medium-risk/grid-extension; corrected to Heavy/full-rebuild. This is now, alongside Hero, one of the two highest-complexity section builds in the whole plan.
- Selected Work and Testimoni both have content gaps (6→10 projects, 4→6 testimonials); per §17.7 (CLOSED) placeholders are acceptable during implementation, but **before final production cutover** all content must be approved-real or have explicit owner sign-off on unresolved placeholder status — this final resolution could still stall Milestone 7 if verification/sourcing lags behind the section rebuilds.
- Font decision remains genuinely pending (§17.2, CLOSED as "interim placeholder, final TBD by owner before final visual QA") — implementation may proceed, but every section's *final* visual QA sign-off is still gated on it, most severely Hero's line-break/crop/tracking/vertical-rhythm QA (§12).

**MEDIUM**
- `EditorialIntro.vue`'s shared usage between What We Build and WhyPasti creates a decommission-ordering dependency (§8 Wave 2) that must be sequenced carefully to avoid breaking What We Build while removing WhyPasti (§17.4, CLOSED: WhyPasti removed, content not carried over).
- Intro-overlay removal (§17.5, CLOSED) touches `Hero.vue`'s and `IntroOverlay.vue`'s current entry-sequencing coupling — verify Hero's rebuild genuinely has no residual dependency on the overlay before removing it, not just on the homepage route.
- `useServices.ts` field-compatibility audit for What We Build (§17.4, CLOSED as "only if directly compatible") still requires an actual field-by-field check at Milestone 4 scoping time — do not assume compatibility without doing it.

**LOW**
- Stale git worktrees (§17.9, CLOSED as separate housekeeping) are disk clutter but functionally inert — low urgency, explicitly not mixed into section-implementation commits.
- `FinalCta.vue`'s continued use on 4 non-homepage pages (§17.8, CLOSED) means the file can't be fully deleted even after homepage cutover — low risk, just requires scoping discipline to not over-delete, plus a regression check across all four pages at cutover.

**INFO**
- Current homepage's 11-section set vs. locked 9-section set is already well understood and doesn't need further investigation — it needs the decommission plan (§8) executed, which this plan already defines.
- `FaqItem.vue`'s existing `<details>/<summary>` semantic pattern is a positive precedent worth reusing as the accessibility baseline for other sections (§10), not a risk.

---

## 17. DECISIONS — LOCKED 2026-09-25 (OWNER-APPROVED)

All nine decision gates below are **CLOSED**. This plan is **APPROVED FOR IMPLEMENTATION**. Recorded verbatim as decided; implementation must follow these, not re-litigate them. If implementation discovers a genuine conflict between one of these decisions and the frozen documentation baseline (`docs/rework-v2/00-07`), the correct response is: **STOP → report the conflict → revise documentation explicitly if approved → then continue.** Do not silently change the design during coding.

1. **Content reuse vs. placeholder** — **CLOSED.** Decision: **Reuse-and-reshape, with a verification gate.** Existing-in-code content (Trusted, Testimoni, Selected Work, Insight) may be used as baseline only *after* verification (§11) — existing-in-code never automatically means production-approved. Unverified content retains an explicit unverified/placeholder state; do not invent replacements, do not silently treat unverified content as final. Newly missing content (the Selected Work 6→10 and Testimoni 4→6 gaps) may use approved placeholder state during implementation. Final production sign-off requires either verification or explicit owner approval to ship with unresolved content.
2. **Font family** — **CLOSED.** Decision: Manrope + Inter remain **interim placeholder fonts only** — not the final brand decision. Implementation proceeds using the display/body/metadata typography abstraction via CSS variables/role-based tokens (§3.4, §12), without waiting on the final font. Final font selection is **pending owner design decision**, made before final visual QA is frozen — especially Hero line breaks, oversized-typography crop, tracking, vertical rhythm, and cross-browser font loading (§12 remains the authoritative gate for what can/cannot proceed without it).
3. **Breakpoint naming** — **CLOSED.** Decision: `06-design-tokens.json` is the **canonical breakpoint source**. The semantic tiers `mobile` / `tablet` / `desktop` / `wide` are the design-system vocabulary. Tailwind's `sm`/`md`/`lg`/`xl`/`2xl`/`3xl` names may remain only as **implementation aliases** mapped to the exact approved Design Token values — not a second independent breakpoint system. Design Tokens define meaning and values; Tailwind aliases implement them. This supersedes and closes the "pick one scheme" framing in §3.1 — the scheme is picked: tokens.json values, Tailwind names as aliases onto them.
4. **ServiceCards / WhyPasti / FinalCta data salvage** — **CLOSED.** Decision: **ServiceCards** — standalone section removed; `useServices.ts` may be audited for field/data reuse *only if directly compatible* with the frozen What We Build capability-card requirements — do not force incompatible legacy content into What We Build. **WhyPasti** — standalone section removed; its content is **not** carried into the new homepage by default. **FinalCta** — standalone homepage section removed; its content is **not** carried into the new homepage. Do not search for a new home for legacy content merely because it already exists — the frozen 9-section architecture wins.
5. **Intro overlay** — **CLOSED.** Decision: **Remove** the intro-overlay experience from the homepage rework. `IntroOverlay.vue` / `IntroAgencyCounterLogoStack.vue` are not part of the frozen homepage experience; the homepage enters directly into Hero. Reusable technical techniques (if any) may be extracted, but the intro overlay itself must not survive as a user-facing experience.
6. **Feature-flag / rollout** — **CLOSED.** Decision: **No feature-flag system** for this rework by default. Use a dedicated feature branch, staged commits/review gates, and a final homepage cutover after Milestone 7 — the homepage ships as one completed rework. Do not build new feature-flag infrastructure unless partial production rollout is explicitly requested later.
7. **Selected Work / Testimoni content gaps** — **CLOSED.** Decision: placeholders are acceptable **during implementation**. Selected Work's architecture/data model must support 10 states from the start; the existing 6 verified/reusable projects populate available slots, the remaining 4 slots may stay explicit placeholders during build. Testimoni's architecture must support the 6-card baseline (1 Featured + 3 Medium + 2 Compact); the existing 4 quotes populate available slots, the remaining 2 slots may stay explicit placeholders during build. Do not duplicate existing content, invent client/project/testimonial data, or create fake names/metrics/quotes. Before final production cutover: all content must be approved-real, or unresolved placeholder/content status requires explicit owner sign-off.
8. **Non-homepage `FinalCta.vue` usage** — **CLOSED.** Decision: `creative.vue`, `insights.vue`, `technology.vue`, `work.vue` are **out of scope** for this rework — do not redesign them. Remove `FinalCta` only from the homepage architecture (`index.vue`); do **not** delete `FinalCta.vue` globally while those four pages still depend on it. Regression-check all four pages during cleanup/cutover (§8, §15).
9. **Stale git worktrees** — **CLOSED.** Decision: separate housekeeping task, **not a blocker** for homepage implementation. Do not mix worktree cleanup with section-implementation commits. Worktrees may be removed only after confirming they contain no needed unmerged work.

---

**STOP — this is the end of the implementation plan. No code has been written, no packages installed, no files deleted or refactored, per instruction.**
