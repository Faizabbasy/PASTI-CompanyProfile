# CLAUDE.md — PASTI Landing Page Rework

## Role

You are working as a senior frontend, interaction, and motion engineer on the PASTI agency landing-page rework. You must preserve approved creative direction and brand rules. Do not reinterpret the project into your own generic agency template.

This is a supporting operational document — it does not originate creative direction. See `01-project-overview.md` §2 for the six-layer source-of-truth hierarchy this document sits outside of.

---

## 1. Source-of-Truth Priority

Read in this order before implementing any section:

1. `00-brand-guide.md` — brand core, personality, color system, typography principles, UI principles, motion principles, brand guardrails.
2. `02-design-direction.md` — approved cross-section visual/experience direction.
3. `03-design-system.md` — reusable rules (grid, timing categories, Signal primitives, border/surface system).
4. `04-homepage-spec.md` — locked, section-specific behavior for all 9 sections.
5. `06-design-tokens.json` — numeric implementation values.
6. Existing PASTI website / current screenshots — **only** for Trusted by Brand, PAQ/FAQ, and Footer, where explicitly locked as "preserve existing structure."
7. External references — behavior/craft inspiration only. Never clone their visual identity or structure literally.

Do not silently override a higher-priority layer. If a lower layer (e.g. a Homepage Spec requirement) appears to conflict with a higher one (e.g. Design System), **flag it for discussion** — do not resolve the conflict unilaterally in code. See `01-project-overview.md` §2 for the full conflict-resolution principle.

---

## 2. Project Stack

**Required**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS, GSAP, ScrollTrigger, Lenis.

**Optional**: Three.js/WebGL only when content storytelling materially improves; SVG/vector animation encouraged.

Do not introduce a second smooth-scroll engine or competing scroll abstraction.

---

## 3. Core Creative Direction

> **Engineering Precision × Premium Digital** (core idea)
> **Certainty Through Execution** (brand essence)
> **Technology × Creative Execution Partner** (positioning)
> **Controlled Momentum** (motion language)

The site must feel: precise, premium, editorial, modern, enterprise-capable, interactive, cinematic when justified, highly authored.

---

## 4. Hard Anti-Template Guardrails

Do not create: generic SaaS 3-card grids, Cuberto-derived visual grammar, purple-blue gradient blobs, giant glass cards, generic floating dashboard collage, random chrome sphere, random particle field, fake futuristic HUD, giant pill UI everywhere, identical rounded cards across sections, generic browser mockup stack, fade-up animation as the dominant motion language, AI-slop typography, decorative WebGL with no content purpose.

If implementation starts resembling these patterns, stop and correct direction before proceeding.

---

## 5. Brand Colors & the Two-Layer Yellow Rule

| Color | Value |
|---|---|
| Slate Navy | `#0F172A` |
| Pure White | `#FFFFFF` |
| Surface Neutral | `#F8FAFC` |
| Cobalt Blue | `#2563EB` |
| Cyan Spark | `#06B6D4` |
| PASTI Yellow | `PENDING_MASTER_LOGO_SAMPLE` |

**Critical rule**: Cyan Spark must never be used as readable text directly on Pure White without sufficient dark containment or verified contrast treatment.

**Yellow is a two-layer rule — do not collapse it into one**:

- **Brand level** (`00-brand-guide.md`): PASTI Yellow is a rare signature accent, recommended digital presence ~1–3%.
- **Homepage-execution level** (this rework, `04-homepage-spec.md`): Yellow is **off by default** in every locked section unless that section's spec explicitly justifies and approves a specific use. Section ownership, visual prominence, or "hero" status is **not**, by itself, sufficient justification.

Never guess the official PASTI Yellow HEX before the master logo is sampled.

---

## 6. Typography

Direction: **Super Editorial × Functional Precision.** Display: oversized, tight leading, negative tracking, asymmetric placement, occasional crop/edge bleed. Hero display: `clamp(72px, 9vw, 160px)`.

**Avoid**: generic SaaS type, sci-fi fonts, rounded playful display type, monospace as main voice, arbitrary font mixing.

Do not choose final font files without approval — font family remains undecided.

---

## 7. Copy Rule

Until approved content is supplied, all newly introduced copy fields must use: `Lorem ipsum dolor sit amet`.

Do not invent: project names, testimonials, marketing claims, awards, metrics, client names.

**Approved exceptions**: Platforms, OPEN, e-CORPORATE, existing locked copy in Trusted / FAQ / Footer.

---

## 8. Brand / Website Ratios

**Brand philosophy** (strategic decisions): 50% Proof / 30% Expression / 20% Brand.
**Website execution** (this rework): 70% Experience / 20% Platform / 10% Brand.

Do not confuse these two frameworks — they answer different questions.

---

## 9. Motion Rules

Motion must serve: Reveal, Focus, Progress, Transition, Response.

**Avoid**: bounce, elastic springs, meaningless float, motion delay for decoration, long pinning with no narrative value, mobile scroll traps.

**Timing**: Micro 120–250ms · Standard 300–600ms · Cinematic 800–1600ms. **Easing**: `power3.out`, `power4.out`, `expo.out`. Full category-to-use mapping is in `03-design-system.md` §4 & §12.

---

## 10. Scroll Architecture

Lenis owns smooth scrolling. GSAP/ScrollTrigger owns scroll choreography.

- Only one Lenis instance.
- Synchronize Lenis and GSAP ticker correctly.
- Call ScrollTrigger update/refresh as needed after layout changes.
- Do not create duplicate ticker loops.
- Do not manually intercept wheel events unless explicitly approved.
- Scope ScrollTriggers to component lifecycle; kill all triggers on cleanup.

Full performance/lifecycle discipline checklist: `03-design-system.md` §13.

---

## 11. The Signal — Quick Reference

The Signal is mandatory as a recurring visual behavior, drawing from a shared primitive vocabulary (point, short route, structural line, segmented progression, color-state behavior, final structural resolution — see `03-design-system.md` §6). Its **specific role differs by section** — never implement it as one generic reusable component:

| Section | Signal Role |
|---|---|
| Hero | Execution route (headline → primary proof → micro state → boundary) |
| What We Build | Trigger / capability-resolution state |
| Selected Work | Editorial spine (segmented project index, 10 states) |
| Trusted by Brand | Quiet proof marker |
| Testimoni | Focus indicator, not follower |
| Platforms | Horizontal state-transfer system (binary, 2 states) |
| Insight | Reading-state marker (not category navigation) |
| PAQ / FAQ | Active accordion cue (existing left accent bar, reused) |
| Footer | Final structural resolution (neutral/slate, one-shot, non-interactive) |

Full behavior for each: `04-homepage-spec.md`, relevant section.

Default Signal language: Cobalt/Cyan. Yellow: rare signature moments only, per Section 5 above. Do not turn The Signal into random HUD decoration.

---

## 12. Homepage Order (Locked)

1. Hero
2. What We Build
3. Selected Work
4. Trusted by Brand
5. Testimoni
6. Platforms
7. Insight
8. PAQ / FAQ
9. Footer

Do not reorder. Full architecture rationale: `01-project-overview.md` §4.

---

## 13. Section Guardrail Summary

Full detail for every rule below is in `04-homepage-spec.md`. This is a fast-reference pointer, not the source of truth.

- **Hero**: asymmetrical editorial, Living Proof System (1 primary + 2 secondary + 1 micro, hierarchical not equal), Slate Navy dominant, no browser mockup, no centered SaaS dashboard, scroll resolves/hands off (doesn't fade).
- **What We Build**: Curtain Reveal (vertical axis) → Pin → decode → typographic cluster break → 4-card fan (1 primary + 2 medium + 1 accent) → release. No particle explosion, no playful spring, no Matrix aesthetic.
- **Selected Work**: pinned split-screen, 10-project baseline (scalable), alternating sides locked, Rhythm Vocabulary (7 treatments, content-driven assignment), no carousel, no simultaneous 10-WebGL-scene mount.
- **Trusted by Brand**: existing UI/hierarchy locked, Surface Neutral light reset, theme integration + spacing + subtle hover + Signal cue only. Do not redesign.
- **Testimoni**: horizontal zig-zag, 6-card baseline (1 Featured + 3 Medium + 2 Compact), no-avatar default, static idle (no floating), active card 100%/surrounding 35–50%, no carousel arrows.
- **Platforms**: exactly 2 worlds (OPEN, e-CORPORATE), pinned horizontal, fragment guardrail (OPEN 1+optional1, e-CORPORATE 1+max2), Transition Hierarchy locked, no SaaS pricing cards, WebGL not default.
- **Insight**: masked entrance distinct from Platforms, editorial composition before horizontal movement, Sticky Editorial Canvas (lighter than a pin), light environment, no equal-width blog cards.
- **PAQ / FAQ**: existing UI/IA locked, glow removed, Yellow removed, Signal = existing accent bar reused, no heavy pinning or 3D.
- **Footer**: existing structure locked, glow removed, Yellow removed (including product-link dots), Signal resolves structural/neutral (not active Cobalt), no final CTA spectacle.

---

## 14. Responsive

Do not scale desktop mechanically — **recompose.**

- **Desktop**: full experience.
- **Tablet**: reduce secondary detail, pin length, parallax, optional 3D complexity.
- **Mobile**: recompose, shorten heavy sequences, reduce WebGL, avoid long scroll traps. Recurring pattern: sections that are pinned+horizontal on desktop (Selected Work, Platforms, Insight) become vertical, normal-scroll sequences on mobile — never a squeezed horizontal-pin experience.

---

## 15. Reduced Motion

Honor `prefers-reduced-motion: reduce`. Disable or simplify: decorative idle, long pinning, heavy parallax, non-essential WebGL, excessive horizontal runway. Preserve a strong static composition and full content access — reduced motion is a different premium expression, never a degraded one.

---

## 16. Performance

Prefer: transform, opacity, SVG, GPU-friendly compositing. Avoid: repeated layout measurement inside RAF, heavy animated blur, excessive box-shadow animation, unnecessary high-DPR WebGL, duplicated timelines. Pause expensive offscreen animations. Dispose Three.js resources completely.

---

## 17. Before Coding a Section

Always, in order:

1. Read `00-brand-guide.md`.
2. Read `02-design-direction.md`.
3. Read the relevant section in `04-homepage-spec.md`.
4. Audit current implementation (if reworking an existing component).
5. Identify reusable utilities/composables already in the codebase.
6. List files to modify.
7. Write a concise implementation plan.
8. Respect any approval gate the user has requested.

Do not silently redesign an approved section. If something in the spec seems wrong or outdated once you're looking at real implementation constraints, flag it — don't quietly deviate.

---

## 18. Definition of Done

A section is complete only when:

- Static frame looks premium.
- Motion serves hierarchy.
- Scroll reverse works where relevant.
- Responsive state is intentional.
- Reduced motion works.
- No layout shift.
- No console errors.
- No duplicate ScrollTriggers.
- No leaked listeners.
- No leaked WebGL resources.
- No forbidden Cyan-on-white readable text.
- No generic SaaS/AI-slop visual pattern.
- Brand direction remains intact.

---

## 19. Current Project Phase

As of this document, the project has completed art-direction lock for all 9 homepage sections and documentation consolidation into `docs/rework-v2/`. **No coding or implementation planning has started.** Do not begin implementation until explicitly instructed to move into the PLAN → IMPLEMENT phase.
