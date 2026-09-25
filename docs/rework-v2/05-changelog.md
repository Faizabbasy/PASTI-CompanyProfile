# Changelog — PASTI Landing Page Rework

All notable direction and documentation decisions are recorded here. This project uses semantic-style versioning for documentation and major direction milestones where practical — it does not track code releases.

---

## [2.0.0] — Section-by-Section Art-Direction Lock & Documentation Consolidation

### Context

Following the `[1.0.0]` baseline specification, all 9 homepage sections went through individual **DISCUSS → REFINE** sessions — each section was bedah'd (dissected) in detail, revised against feedback, and explicitly locked before moving to the next. This entry records the outcome of that process and the subsequent documentation consolidation into the `docs/rework-v2/` active documentation set.

### Added — Cross-Section Mental Models

New principles that emerged through refinement and now live in `02-design-direction.md`:

- **Precise Misalignment, Not Playful Irregularity** — composition may be asymmetric and offset, but must remain grid-disciplined; rejects arbitrary/random-looking placement.
- **Designed Continuity, Not Arbitrary Proximity** — Signal handoffs between sections must share deliberate alignment/momentum, not merely be spatially adjacent.
- **Visual Hierarchy Is Not Business Priority** — a section's "primary/featured" element leads the composition, not a ranking of business importance.
- **Depth Without Blur** — depth is communicated via scale, crop, occlusion, tonal contrast, and parallax — never blur as a default mechanism.

### Added — Design System (new document)

`03-design-system.md` created from scratch, extracting genuinely reusable, cross-section rules that were previously undocumented or scattered: the 12-column macro grid as a system, Signal visual primitives (point / short route / structural line / segmented progression / color-state behavior / final structural resolution), motion timing categories, interaction timing categories, structural framing/border system, dark/light surface system principle, Yellow usage system (homepage-execution posture), responsive and reduced-motion philosophy.

### Changed — Hero

- Added **Operational Evidence in Motion** and **Precise Misalignment** as the section's governing mental models.
- Living Proof System depth mechanism clarified: occlusion/scale/tonal-contrast, explicitly **not** blur.
- Locked the 12-column grid as the alignment reference for all 4 proof fragments.
- Signal route locked as a single directional path (headline → primary proof → micro state → boundary → What We Build), replacing an earlier looser "network of connections to all fragments" framing.
- Micro Utility whitelisted to a specific set of neutral technical states; explicitly bans invented business metrics.
- Idle motion redefined as state-based (only Micro Utility and Signal are meaningfully "live"), replacing an earlier "independent fragment drift on all elements" framing.
- Scroll handoff distance locked at ~1.3–1.6 viewport (medium cinematic).

### Changed — What We Build

- **Superseded**: earlier "randomized text decode" + "radial breakup" language, which could be read as a Matrix-style or particle-explosion effect, replaced with an explicit **Typographic Cluster Break** mechanism (baseline/glyph-group clusters, not pixel particles).
- Curtain axis locked to **vertical** specifically for the Hero → What We Build handoff (not a global curtain-direction rule).
- Decode character language locked to clean alphanumeric (`A–Z`, `0–9`, limited punctuation) — explicitly not monospace-by-default, explicitly avoiding code/hacking-styled punctuation.
- Residual texture given an explicit lifecycle (visible → 3–8% ambient → majority decay → thin structural-line remnants → release) with points/dots explicitly excluded from the remnant language (reserved for Signal).
- Scroll baseline locked at ~3.5–4 viewport, guardrail ~4.5.
- Added explicit "one continuous mechanism" requirement for the curtain-to-pin transition (no perceived snap).

### Changed — Selected Work

- Added the **Rhythm Vocabulary** (7 treatments: Standard Exchange, Media-Dominant State, Typography-Dominant State, Temporary Full-Bleed Takeover, Accelerated Exchange, Slower Showcase State, Closing State) as Selected Work's own reusable-within-the-section vocabulary — explicitly **not** promoted to a homepage-wide pattern.
- Locked that rhythm-treatment assignment to specific project numbers is **content-driven**, decided later against real assets — not pre-assigned at art-direction level.
- Locked one dominant media-mask grammar (vertical/axis-consistent) with rare exceptions, replacing an earlier looser "mask reveal, direction may alternate" framing.
- Signal reframed explicitly as an **editorial spine** (segmented, numeral, restrained rail) — explicitly rejecting generic-progress-bar or browser-scrollbar visual language.
- Scroll baseline tightened from an unspecified range to ~6.5–8 viewport, guardrail ~9.
- Mobile locked to **media-above/typography-below for all 10 projects** (no alternating reading order on mobile), replacing an earlier ambiguous mobile framing.

### Changed — Trusted by Brand

- Environment explicitly locked to **Surface Neutral as default light reset**, replacing an earlier ambiguous "theme integration" framing.
- Signal reframed as a **Quiet Proof Marker** with an explicit conceptual transition sequence from Selected Work's editorial spine.
- Added explicit partner-logo-respect rule (no PASTI brand color/tint/glow/frame applied to third-party logos) — not previously documented.
- Confirmed the existing marquee's focal-zone mechanism is locked (not redesigned) while its exact numeric calibration remains open for future refinement.

### Changed — Testimoni

- **Superseded**: "optional low-amplitude, asynchronous drift" idle-motion allowance from the `[1.0.0]` baseline — replaced with **static-by-default**, idle motion no longer permitted except as an imperceptible, single-anchor exception.
- Card baseline locked to **6 cards (1 Featured + 3 Medium + 2 Compact)**, replacing the earlier looser "5–7 cards" framing.
- **No-avatar baseline** locked — not previously specified.
- Signal reframed as **Focus Indicator, Not Follower** — explicitly rejecting a "physical tracker that jumps to hovered cards" interpretation.
- Exit choreography given an explicit quality bar: "ordered handoff," not "cards being swept away."
- Scroll baseline locked at ~1.4–1.7 viewport.

### Changed — Platforms

- Added **product fragment guardrail** (OPEN: 1 primary + optional 1 secondary; e-CORPORATE: 1 primary + max 2 secondary) — not previously specified, added specifically to prevent e-CORPORATE from becoming a dashboard collage.
- Added explicit **"world is not a giant card"** principle — the composition itself is the world, not content inside a panel wrapper.
- Added **Transition Hierarchy** (spatial transfer > crop/reframe > Signal state transfer > opacity/depth as supporting only) to prevent all transition effects reading as equally prominent.
- Section label ("Platforms") behavior locked as persistent-but-understated throughout the pin.
- Scroll baseline tightened from ~2.8–3.5/~4 max (unchanged from initial proposal, but now explicitly disciplined against "long horizontal journey just because it's pinned").
- Dark-to-dark freshness (from Testimoni) explicitly locked to come from scale/spatial/density change — **not** from new color, glow, or gradient.

### Changed — Insight

- **Superseded**: implicit assumption that Insight's horizontal mechanic would closely mirror Platforms' — replaced with an explicit **Editorial Page Progression vs. Spatial World Transfer** comparison and the **Sticky Editorial Canvas** mental model (a lighter, shorter, flatter hold — not "another pinned section").
- Environment locked to **light (Surface Neutral)**, explicit intentional contrast against Platforms — reinforcing the "Product Immersion → Editorial Clarity" narrative shift.
- Heading behavior locked: large heading must reduce prominence once the horizontal phase begins (was previously unaddressed).
- Signal narrowed to a pure **Reading State Marker** — explicitly must not duplicate category labels or become category navigation.
- Inactive-article dimming locked at ~75–85% (deliberately lighter than Testimoni's 35–50%, because Insight content must stay scannable).
- Scroll baseline tightened to ~2.2–2.8 viewport, guardrail ~3.2 (down from an earlier looser proposal).

### Changed — PAQ / FAQ

- **Removed**: existing large glow blobs and continuous ambient drift animation — no exception for low opacity.
- **Removed**: existing Yellow usage across hover, accent bar, corner bracket, and glow — replaced with Cobalt as the primary interaction accent.
- Signal reframed to reuse the **existing left accent bar** as its manifestation — explicitly avoiding any new dot/numeral/rail/component.
- Heading motion reduced: continuous scroll-scrubbed scale/tracking behavior removed in favor of a single restrained reveal that then stays stable.
- Interaction timing locked and coordinated: hover/focus ~120–150ms, open/close ~200–300ms, with height/content/indicator/accent required to resolve as one state change (not staged).
- Environment confirmed dark (not following Insight's light reset) to preserve PAQ + Footer as one composed closing movement.

### Changed — Footer

- **Removed**: existing ambient glow blob completely, no exception for low opacity.
- **Removed**: existing Yellow product-link dot indicators, replaced with Cobalt.
- **New concept — Signal's Final Resolved State**: "The Signal finishes active. It resolves structural." — Signal's terminal state in Footer deliberately loses its active Cobalt color and becomes neutral/slate structural framing. This is a new addition to the cross-section Signal system, not present in the `[1.0.0]` baseline.
- Corner-line convergence geometry reinterpreted: "Frame → Resolve → Lock the Composition," explicitly not a literal point-to-viewport-center effect.
- Link hover timing calibrated down from the existing ~400ms to the Quiet-tier ~150ms target.
- Explicit environment rule: PAQ → Footer separation must come from structural/compositional change, never a major color shift.

### Added — Documentation Consolidation

- Created the `docs/rework-v2/` active documentation set (8 files + `source/`), replacing the prior `.docs/` snapshot as the active source of truth.
- Brand Guide (`PASTI_Brand_Guide_Working_Baseline_v1.0.docx`) and Design Direction (`PASTI_Design_Direction_v1.0.docx`) source files placed under `docs/rework-v2/source/`.
- `00-brand-guide.md` created as a faithful transcription of the Brand Guide `.docx` — flagged two reconciliation notes rather than silently resolving them:
  1. Brand-level Yellow ratio (1–3% recommended presence) vs. the stricter homepage-execution posture (off by default) — both are recorded as valid at their respective layers, not merged into one rule.
  2. Brand-level button/card radius guidance (6–8px / 8–12px) vs. the existing `Tokens.json` radius scale (`sm:6/md:10/lg:20`) — flagged for reconciliation when `06-design-tokens.json` is finalized; the token is expected to be corrected to conform to the Brand Guide.
- `01-project-overview.md`, `02-design-direction.md`, `03-design-system.md`, `04-homepage-spec.md` written as full-rewrite consolidations (not incremental patches) of the prior `.docs/00-readme.md`, `.docs/01-design-direction.md`, and `.docs/02-homepage.md`, per the approved consolidation plan — faithful to the Brand Guide, the original Design Direction, and every approved section lock, with superseded wording and ambiguity removed.

### Migration Status — Completed 2026-09-25

- `.docs/` (6-file snapshot: `00-readme.md`, `01-design-direction.md`, `02-homepage.md`, `Changelog.md`, `Claude(1).md`, `Tokens.json`) migrated to `docs/legacy/`.
- Old `docs/superpowers/` (Hero-experiment plans and specs) migrated to `docs/legacy/superpowers/`.
- Active code references to the old `docs/superpowers/` path checked and updated: `app/composables/motion/kineticBlueprintPaths.ts` and `app/composables/motion/useHeroHandoff.ts` now point to `docs/legacy/superpowers/specs/...` with an added pointer to the current `docs/rework-v2/04-homepage-spec.md` equivalent.
- Legacy copies verified byte-identical to their originals before removal.
- Old `.docs/` (including `.docs/rework-v2/source/`) and old `docs/superpowers/{plans,specs}/` paths removed after verification.
- `docs/rework-v2/` is now the sole active documentation root.

### Correction — 2026-09-25

An earlier consolidation audit pass incorrectly reported `PASTI_Cuberto_Template_Content_Mapping.docx`, `.docs/context/LARGE_SCALE_MOTION_PLAN.md`, `.docs/image/*`, and `.docs/LOGO/` as missing from the repository entirely. They were not — they existed in git history (last committed at `8c7e925`, 2026-09-12) but had been removed from the working directory (and, in the same pass, from `.docs/`) before this documentation consolidation began, so a filesystem-only check missed them. Once discovered via `git log`, the full `.docs/` snapshot at that commit (33 files: `HANDOFF.md`, `PASTIPEOPLE_EXISTING_CONTENT_SOURCE.md`, `PASTI_Cuberto_Template_Content_Mapping.docx`, `hero-preview.html`, `ref.png`, `context/`, `image/`, `LOGO/`, `specs/`) was restored via `git checkout` and migrated into `docs/legacy/` alongside the six documentation files already archived there, verified byte-identical, and the temporary `.docs/` restoration was removed again.

Production code still references these paths (21 references to the Cuberto content-mapping docx, 12 to `LARGE_SCALE_MOTION_PLAN.md`, 3 to `.docs/image/*`, 1 to `.docs/LOGO/`) — per explicit instruction, these references were **not** modified, and the referenced creative direction from these legacy files was **not** revived into any active document. This remains pre-existing technical/asset debt, now archived at `docs/legacy/` instead of scattered/absent, tracked for a future codebase audit rather than resolved here.

---

## [1.0.0] — Rework Specification Baseline

### Added

- New creative direction: **Engineering Precision × Premium Digital**.
- Brand essence integration: **Certainty Through Execution**.
- Super Editorial × Functional Precision typography direction.
- Controlled Momentum motion language.
- Lenis smooth-scroll architecture.
- GSAP animation system.
- GSAP ScrollTrigger choreography.
- The Signal recurring visual motif.
- Responsive recomposition rules.
- Reduced-motion requirements.
- Anti-template / anti-AI-slop guardrails.
- Nine-section homepage architecture.

### Added — Hero

Asymmetrical editorial composition, Living Proof System, 4-fragment proof hierarchy, controlled idle motion, section handoff behavior.

### Added — What We Build

Curtain Reveal, scroll pinning, randomized text decode, controlled radial typography breakup, 4-card asymmetric fan formation.

### Added — Selected Work

Pinned Project Exchange, alternating split-screen states, 10-project baseline (scalable), slide-up masking for title changes, scrubbed description reveal, project progress rail, selective media 3D/WebGL support.

### Preserved — Trusted by Brand

Existing layout retained; theme integration and subtle polish allowed.

### Added — Testimoni

Horizontal zig-zag proof field, magnetic focus hover, exit alignment choreography.

### Added — Platforms

Two product worlds (OPEN, e-CORPORATE), pinned horizontal scroll, differentiated internal art direction, subtle internal 3D/parallax.

### Added — Insight

4 editorial panels baseline, distinct masked entrance, horizontal editorial stream, CTA integration.

### Preserved — PAQ / FAQ

Existing information architecture retained; subtle micro-interaction polish added to spec.

### Preserved — Footer

Existing structure retained; dark premium theme integration and subtle motion added to spec.

### Changed

- Removed Cuberto-derived visual dependency as a creative direction.
- Replaced white-first generic agency styling with a navy-led premium editorial system.
- Replaced generic fade-up choreography with purpose-driven section motion.
- Replaced repetitive card-grid assumptions with section-specific composition systems.

### Removed

- Cuberto visual grammar as a design source.
- Generic SaaS 3-card grid as default section pattern.
- Generic AI gradient blob direction.
- Giant glass-card direction.
- Random decorative WebGL.
- Bounce / elastic motion language.

### Technical

- Stack locked to Nuxt 4 + Vue 3 + TypeScript + Tailwind.
- Lenis mandatory for smooth scroll.
- GSAP + ScrollTrigger mandatory for signature choreography.
- Three.js/WebGL optional and content-led.
- Reduced-motion support required.
- Lifecycle cleanup requirements documented.

---

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

### Performance

### Accessibility
