# PASTI — Design System

Reusable visual, layout, interaction, and motion rules that apply across the homepage (and, where relevant, beyond it). This document translates `02-design-direction.md` into system-level rules a developer or designer can reach for without re-deriving them per section.

**Scope boundary**: this file contains only **reusable, cross-section system rules**. It does not contain any section-specific choreography, numeric baseline (scroll distance, card counts, fragment counts), or section-specific mental model — those live in `04-homepage-spec.md`. A rule belongs here only if it is genuinely reusable across more than one section without modification to its core mechanic.

---

## 1. Macro Grid System

**12-column conceptual macro grid.** Every section's key compositional elements — headline anchors, media fragments, card placements, Signal positions — align to at least one meaningful column/key line of this grid, even when the overall composition is intentionally asymmetric.

- Container: 1280–1440px max width (see `06-design-tokens.json` → `layout.container`).
- Outer gutter: 48–80px desktop, 32–48px tablet, 20–24px mobile (see `06-design-tokens.json` → `layout.gutter`).
- Exact column spans per section (e.g. "featured article spans 7/12") are a Homepage Spec decision, not a system-level rule — the grid provides the ruler, sections decide how to use it.

### Precise Misalignment, Not Playful Irregularity

The governing principle for how the grid is used: controlled offset, overlap, crop, and depth are permitted and encouraged, but elements are not skewed, floated, or angled arbitrarily merely to look "editorial." At least one edge of any positioned element should align to a grid key line. This is what separates PASTI's asymmetry from Behance-style collage — see `02-design-direction.md` §9 for the full cross-section statement of this principle.

---

## 2. Spacing Discipline

**8px base grid.** Allowed increments: 4 / 8 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128 / 160. 4px is permitted only for micro-spacing.

### Section Rhythm (vertical spacing between sections)

- Desktop: 120–200px, depending on composition.
- Tablet: 96–144px.
- Mobile: 72–112px.

Pinned scenes may use viewport-based heights instead of fixed section spacing — this is expected for the Heavy-Signature sections and is specified per-section in Homepage Spec.

---

## 3. Typography Hierarchy System

| Role | Size | Line Height | Tracking |
|---|---|---|---|
| Display XL (Hero) | `clamp(72px, 9vw, 160px)` | 0.88–0.98 | -0.02em to -0.05em |
| Section Monumental (H1) | 56–96px | 0.95–1.05 | -0.02em to -0.04em |
| H2 | 36–56px | 1.00–1.10 | -0.01em to -0.03em |
| Body Large | 18–24px | 1.4–1.6 | 0 |
| Body | 16–18px | 1.5–1.7 | 0 |
| Metadata | 11–14px | 1.2–1.4 | 0.04em–0.08em |

**Display behavior** (used at Display XL / Section Monumental scale): oversized, tight line-height, negative tracking, asymmetric alignment, occasional crop/bleed. **Body behavior**: calm, legible, functional — readability is never sacrificed for editorial effect at body scale.

Which specific role (e.g. "featured article title" vs "supporting article title") maps to which scale tier, and how much a given section prioritizes readability over display scale, is a Homepage Spec decision — see especially Insight (readability-priority) vs Hero (display-priority) for how the same system produces different emphasis.

---

## 4. Motion Timing Categories

| Tier | Duration | Typical Use |
|---|---|---|
| Micro | 120–250ms | Hover / focus / underline / arrow / small state shifts |
| Standard | 300–600ms | Cards, masks, simple state changes, most reveals |
| Cinematic | 800–1600ms | Major reveal, section takeover, narrative transitions |

**Idle motion** (where permitted at all): slow, low-amplitude, non-repetitive. Idle motion is the exception, not the default — see Controlled Momentum below.

### Easing

- CSS primary: `cubic-bezier(0.16, 1, 0.3, 1)`
- GSAP: `power3.out` (standard), `power4.out` (more assertive standard/cinematic), `expo.out` (cinematic)
- Never: bounce, elastic, spring, or cartoon overshoot easing.

A section's specific timing choice within a tier (e.g. "PAQ hover: 120–150ms", "Footer link hover: ~150ms") is a Homepage Spec decision that instantiates this system-level category — the category itself is the reusable rule, the exact number per interaction is section-specific.

---

## 5. Controlled Momentum — Motion Evaluation System

Every motion decision, in every section, must be evaluated against this five-function test:

**Reveal · Focus · Progress · Transition · Response**

If a proposed animation does not serve at least one of these five functions, remove it or redesign it. This is the single most important reusable filter in the entire system — it applies identically whether evaluating a Hero idle-drift, a Testimoni hover-lift, or a Footer link underline.

**Reject by default**: bounce, elastic springs, random floating loops, fade-up-everywhere, decorative delay, long pinning without narrative value, motion whose only purpose is "looking animated."

---

## 6. Signal Visual Primitives

The Signal (see `02-design-direction.md` §10 for its cross-section role and Brand Guide §08 for its origin as a graphic-language device) draws from a small, reusable vocabulary of visual primitives. A section may combine or emphasize different primitives from this list, but does not invent a new primitive outside it without a strong reason.

- **Point** — a single marker indicating an active/focused state.
- **Short route** — a bounded line segment communicating direction or transfer, not an open-ended path.
- **Structural line** — a thin (1px-class) line functioning as frame, divider, or boundary marker rather than an active indicator.
- **Segmented progression** — a route divided into discrete, countable segments (used where a bounded sequence of states exists), as opposed to a continuous percentage fill.
- **Color-state behavior** — Cobalt as the default "active" language; Cyan as a highly restrained secondary/technical accent; neutral/slate as the "resolved, no longer active" language; Yellow reserved for rare, explicitly justified signature moments (see Section 8 below).
- **Final structural resolution** — the principle that Signal, at the end of its cross-section journey, may lose its active interaction color and become quiet structural framing rather than remaining visually "live." (This primitive exists specifically because of what Footer's lock established — see `04-homepage-spec.md` → Footer.)

**Explicitly avoided primitives**: generic percentage/fill progress bars, browser-scrollbar-style indicators, toggle/switch-styled controls, always-on glow endpoints, looping/repeating "ambient" activation with no state meaning.

Which primitive(s) a given section uses, and what specific role Signal plays there, is entirely a Homepage Spec decision — this section only catalogues the shared vocabulary, it does not assign roles.

---

## 7. Structural Framing & Border System

- **1px structural borders** as the default line weight for dividers, frames, and edge rules.
- Dark environments: low-opacity white/slate borders (see `06-design-tokens.json` → `color.border.darkSubtle`).
- Light environments: subtle navy/neutral borders (see `06-design-tokens.json` → `color.border.lightSubtle`).
- Prefer tonal separation, borders, or masks over heavy shadows or drop-shadow stacks.
- No oversized border radius as a default language (Brand Guide §14). Buttons and cards use a compact radius scale — see `06-design-tokens.json` → `radius` (reconciled against Brand Guide §10 button/card radius guidance).
- No large identical rounded rectangles repeated across the page as a default section pattern.

---

## 8. Surface System — Dark / Light Rhythm

PASTI uses a deliberate dark/light rhythm rather than one flat page tone (Brand Guide §17). As a **system-level principle**:

- **Slate Navy** is the primary, default environment — the majority of the homepage lives here.
- **Surface Neutral / Pure White** are used as **strategic, deliberate resets** — never the default canvas, always a considered interruption that serves a functional or narrative purpose (e.g. a "reading mode" environment, a "breathing moment" after a dense sequence).
- A light section should never appear back-to-back with another light section — light resets are singular events that punctuate a predominantly dark rhythm, not a recurring alternate theme.
- Where two adjacent sections share the same tone (dark-to-dark, most commonly), differentiation must come from **composition, density, structure, and spacing** — not from color shift. Introducing a new color or a major tonal jump purely to create separation between two same-tone sections is not permitted.

Which section is light vs. dark, and the specific rhythm across all 9 sections, is a Homepage Spec decision (and is already locked — see `04-homepage-spec.md`). This section defines the *principle* that governs how that rhythm should be reasoned about and extended, including for any future section.

---

## 9. Yellow Usage System

Per Brand Guide §05, PASTI Yellow's brand-level recommended digital ratio is 1–3% presence, used for scarce signature moments. As a **homepage-execution system rule**:

- Yellow defaults to **off** in section implementation unless a section's Homepage Spec entry explicitly calls for it and justifies why.
- A section owning a product, being visually prominent, or being a "hero" moment is **not**, by itself, sufficient justification for introducing Yellow — justification must be a genuinely meaningful signature moment, evaluated on its own merits.
- Do not guess or introduce an arbitrary Yellow HEX value before the official master-logo sample is available. Use `PENDING_MASTER_LOGO_SAMPLE` as the placeholder token value.

This system rule exists to keep the *default* posture consistent across sections while still allowing the Brand Guide's own more permissive ratio to apply if a specific, justified case arises later.

---

## 10. Responsive Philosophy

**Recompose, not scale** (Brand Guide §13).

| Tier | Principle | Behavior |
|---|---|---|
| Desktop | Full experience | Full cinematic choreography, largest typography, richer depth and scroll interactions. |
| Tablet | Reduced complexity | Shorter pin durations, fewer secondary graphics, reduced parallax/3D complexity, preserved hierarchy. |
| Mobile | Recomposed | Layout is rebuilt for the constraint, not shrunk. Simplified choreography, reduced/removed WebGL, large type retained, no long scroll traps, no forced horizontal pin. |

A recurring pattern across the locked sections: mechanisms that are **pinned and horizontal** on desktop (Selected Work, Platforms, Insight's sticky canvas) become **vertical, normal-scroll sequences** on mobile — never a horizontally-pinned experience squeezed into a touch viewport. This is a system-level pattern worth naming explicitly, even though each section's exact mobile recomposition is specified individually in Homepage Spec.

---

## 11. Reduced-Motion Philosophy

Honor `prefers-reduced-motion: reduce` everywhere.

**System-level default behavior**:

- Disable decorative idle animation.
- Remove or drastically shorten long pins.
- Remove or simplify parallax.
- Disable non-essential WebGL/3D.
- Preserve a strong, premium **static composition** — reduced motion is never a degraded or broken experience, it is a different, still-premium expression of the same design.
- Preserve full content access — nothing that is only reachable through motion should become inaccessible.

Each section's specific reduced-motion behavior (what exactly gets removed/simplified) is defined in Homepage Spec; this is the shared philosophy all of those specific decisions must satisfy.

---

## 12. Interaction Timing Categories

Reusable interaction-timing categories (instances of the Motion Timing Categories in Section 4, specialized for discrete interaction events):

| Interaction Type | Category | Typical Range |
|---|---|---|
| Hover / focus-visible state change | Micro | 120–150ms |
| Open/close, reveal/collapse | Micro–Standard boundary | 200–300ms |
| Card/element entrance | Standard | 300–600ms |
| Section-level reveal or takeover | Cinematic | 800–1600ms |

A given section's exact numbers (e.g. PAQ's "hover 120–150ms, open/close 200–300ms", Footer's "link hover ~150ms") are specific applications of these categories and are recorded in Homepage Spec, not re-derived here.

---

## 13. Performance & Lifecycle Discipline

System-level engineering requirements, applicable to every section that uses GSAP/ScrollTrigger/Lenis or WebGL:

- Use `transform` and `opacity` for high-frequency motion.
- Avoid layout reads inside RAF / ticker hot paths.
- Scope and clean up all GSAP contexts.
- Kill all ScrollTriggers on unmount / route leave.
- Dispose WebGL resources fully.
- Pause expensive animation when offscreen.
- Avoid excessive blur and animated heavy shadows.
- Avoid unnecessary device-pixel-ratio scaling on WebGL.
- Prevent duplicate Lenis / GSAP ticker loops — only one Lenis instance, one GSAP ticker integration path for the whole page.

---

## 14. What This Document Deliberately Does Not Contain

To keep the system/spec boundary clean, the following are explicitly **excluded** from this document and belong in `04-homepage-spec.md` instead:

- Selected Work's Rhythm Vocabulary (Standard Exchange, Media-Dominant State, etc.) — this is Selected Work's own reusable-*within-that-section* vocabulary, not a homepage-wide pattern.
- Platforms' Transition Hierarchy (spatial transfer > crop > Signal > opacity/depth) — specific to Platforms' World-to-World mechanic.
- Any section's scroll-depth baseline or guardrail (viewport ranges) — these are section-specific behavior numbers, not reusable primitives.
- Card/fragment/project counts (Testimoni's 1+3+2, Platforms' fragment guardrails, Selected Work's 10-project baseline, Insight's 1+3) — content-architecture decisions specific to one section.
- Any section's specific Signal role or behavior narrative — only the shared primitive vocabulary lives here (Section 6); the assignment lives in Homepage Spec.
