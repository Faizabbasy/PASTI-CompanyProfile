# PASTI Landing Page Rework — Project Overview

## 1. Project Summary

PASTI Landing Page Rework is a full visual and interaction rework of the PASTI agency homepage. The goal is to move away from any Cuberto-derived design grammar and establish an original PASTI digital experience built around the approved direction:

> **Engineering Precision × Premium Digital**

The website must represent PASTI as a serious **Technology × Creative Execution Partner** whose brand essence is:

> **Certainty Through Execution**

The final experience must feel enterprise-capable, editorial, motion-led, precise, modern, immersive, and premium. It must not resemble a generic SaaS template, an AI-generated landing page, or a motion showcase without business credibility.

This document is a supporting document — it provides project context and operational scaffolding. It is not part of the creative-decision precedence chain (see Section 2).

---

## 2. Source-of-Truth Hierarchy

This is a **six-layer design/implementation hierarchy**:

```
1. Brand Guide         (00-brand-guide.md)
2. Design Direction     (02-design-direction.md)
3. Design System        (03-design-system.md)
4. Homepage Spec        (04-homepage-spec.md)
5. Design Tokens        (06-design-tokens.json)
6. Implementation       (source code)
```

Each layer has a distinct role:

- **Brand Guide** defines brand truth — the foundational WHY.
- **Design Direction** interprets brand truth for the website — WHAT the experience should feel like.
- **Design System** defines reusable, cross-section rules — the SYSTEM.
- **Homepage Spec** applies those rules to specific section behavior — the HOW per section.
- **Design Tokens** numerically encode reusable system decisions — the NUMBERS.
- **Implementation** must conform to all approved layers above it.

`01-project-overview.md`, `05-changelog.md`, `07-claude-instructions.md`, and `09-reference-direction.md` are **supporting documents outside this precedence chain** — they provide context, history, operational scaffolding, and (for `09`) reference-use rules, but do not themselves originate creative direction.

### Conflict Resolution Principle

Do not apply "lower number always wins" mechanically. Each layer's authority is scoped to its role:

- If a Design Token conflicts with the Brand Guide or Design System, **the token must be corrected**.
- If Homepage Spec appears to need behavior that seems to violate Design System, **flag it for discussion** rather than silently overriding either the section spec or the system rule.
- Section-specific art-direction locks (in Homepage Spec) are **execution detail derived from** Design Direction and Design System — they never silently redefine brand-level or direction-level truth.

### Legacy Reference

`docs/legacy/` contains prior documentation (including the pre-refinement `.docs/` snapshot and old Hero-experiment plans/specs under `docs/superpowers/`). Legacy documentation is **not** an active source of truth for this rework and must not be used to justify implementation decisions.

The existing PASTI website / current screenshots are used **only** as a reference for the three sections explicitly locked as "preserve existing structure": Trusted by Brand, PAQ/FAQ, and Footer.

External references (Awwwards, other studios, etc.) are behavior/craft inspiration only — never a source for visual identity or structure to be cloned literally. See `09-reference-direction.md` for the current frozen checkpoint on exactly which external references are approved for which section, and the exact allowed/disallowed boundary per reference.

---

## 3. Technology Stack

### Required

- **Nuxt 4**
- **Vue 3**
- **TypeScript**
- **Tailwind CSS**
- **GSAP**
- **GSAP ScrollTrigger**
- **Lenis** for smooth scrolling

### Optional / Conditional

- **Three.js / WebGL** — only where it materially improves storytelling, primarily Selected Work media or Platforms internal visuals. Not required by default for any section.
- **SVG / vector animation** — encouraged for The Signal, masks, progress, route lines, section markers, and state transitions.

Do not add a second smooth-scroll engine or competing scroll abstraction.

---

## 4. Locked Homepage Architecture

The homepage section order is locked:

1. Hero
2. What We Build
3. Selected Work
4. Trusted by Brand
5. Testimoni
6. Platforms
7. Insight
8. PAQ / FAQ
9. Footer

Do not reorder, merge, remove, or insert new primary sections without explicit approval. Full section-by-section behavior is defined in `04-homepage-spec.md`.

### Sections Requiring Total Rework

Hero, What We Build, Selected Work, Testimoni, Platforms, Insight.

### Sections with Locked Existing Structure (Preserve, Do Not Redesign)

Trusted by Brand, PAQ / FAQ, Footer. These three sections keep their existing UI/IA intact; only theme integration, spacing/typography calibration, and restrained microinteraction are permitted. See `04-homepage-spec.md` for the exact allowed/not-allowed boundary per section.

---

## 5. Global Copy Rule

Until production copy is formally mapped and approved, every newly introduced headline, card copy, name, review, description, CTA, label, or text field must use:

`Lorem ipsum dolor sit amet`

### Exceptions

- Locked existing Trusted by Brand / FAQ / Footer content may remain as existing.
- Section name "Platforms" may remain as specified.
- Product names **OPEN** and **e-CORPORATE** are approved content names.

Never invent testimonials, claims, metrics, client names, awards, or marketing statements.

---

## 6. Recommended Build Order

1. Global tokens and typography
2. Lenis + GSAP integration
3. Navigation / global shell
4. Hero
5. What We Build
6. Selected Work
7. Trusted by Brand integration
8. Testimoni
9. Platforms
10. Insight
11. PAQ / FAQ integration
12. Footer integration
13. Responsive pass
14. Reduced-motion pass
15. Performance pass
16. Visual QA
17. Browser QA

---

## 7. Definition of Done

A section is not done until:

- Static composition looks premium.
- Motion improves hierarchy.
- Reverse scroll works where applicable.
- Responsive behavior is intentional (recomposed, not scaled).
- Reduced-motion path works and preserves a strong static composition.
- No console errors.
- No layout shift.
- No duplicate timelines / triggers.
- No uncleaned listeners.
- Implementation does not resemble a generic SaaS or AI-generated template.

---

## 8. Current Process Phase

As of this document's writing, the project has completed:

**READ → UNDERSTAND → DISCUSS → REFINE**

All 9 homepage sections are art-direction locked (see `04-homepage-spec.md`). Documentation is currently in:

**CONSOLIDATE → VERIFY → FINALIZE DOCUMENTATION**

Implementation planning and coding have not yet started. See `07-claude-instructions.md` for the operational rules that will govern the next phase (**PLAN → IMPLEMENT**) once documentation consolidation is complete and explicitly approved.
