# PASTI Landing Page Rework — Developer Handoff

## 1. Project Overview

PASTI Landing Page Rework is a full visual and interaction rework of the PASTI agency homepage. The goal is to move away from any Cuberto-derived design grammar and establish an original PASTI digital experience built around the approved direction:

> **Engineering Precision × Premium Digital**

The website must represent PASTI as a serious **Technology × Creative Execution Partner** whose brand essence is:

> **Certainty Through Execution**

The final experience must feel enterprise-capable, editorial, motion-led, precise, modern, immersive, and premium. It must not resemble a generic SaaS template, an AI-generated landing page, or a motion showcase without business credibility.

---

## 2. Absolute Sources of Truth

Use the following hierarchy when making implementation decisions:

1. **PASTI Brand Guide Working Baseline v1.0** — brand core, visual identity, color hierarchy, typography direction, motion principles, anti-template rules.
2. **PASTI Design Direction v1.0** — approved website art direction and section-level interaction intent.
3. **This handoff package** — implementation-ready rules, motion architecture, tokens, and section specifications.
4. **Existing PASTI website / screenshot reference** — only for Trusted by Brand, PAQ/FAQ, and Footer structure where explicitly stated as locked.
5. **External references** — behavior and craft references only. Never clone their visual identity or structure literally.

If two rules conflict, use the highest source in the list above and document the discrepancy before implementation.

---

## 3. Locked Homepage Architecture

The homepage order is locked:

1. Hero
2. What We Build
3. Selected Work
4. Trusted by Brand
5. Testimoni
6. Platforms
7. Insight
8. PAQ / FAQ
9. Footer

Do not reorder, merge, remove, or insert new primary sections without explicit approval.

---

## 4. Technology Stack

### Required

- **Nuxt 4**
- **Vue 3**
- **TypeScript**
- **Tailwind CSS**
- **GSAP**
- **GSAP ScrollTrigger**
- **Lenis** for smooth scrolling

### Optional / Conditional

- **Three.js / WebGL** — only where it materially improves storytelling, primarily Selected Work media or Platforms internal visuals.
- **SVG / vector animation** — encouraged for The Signal, masks, progress, route lines, section markers, and state transitions.

Do not add a second smooth-scroll engine or competing scroll abstraction.

---

## 5. Global Copy Rule

Until production copy is formally mapped and approved, every newly introduced headline, card copy, name, review, description, CTA, label, or text field must use:

`Lorem ipsum dolor sit amet`

Exceptions:

- Locked existing Trusted by Brand / FAQ / Footer content may remain as existing.
- Section name “Platforms” may remain as specified.
- Product names **OPEN** and **e-CORPORATE** are approved content names.

Never invent testimonials, claims, metrics, client names, awards, or marketing statements.

---

## 6. Brand Color Rules

Required working palette:

- Slate Navy — `#0F172A`
- Pure White — `#FFFFFF`
- Surface Neutral — `#F8FAFC`
- Cobalt Blue — `#2563EB`
- Cyan Spark — `#06B6D4`
- PASTI Yellow — exact production HEX **pending sampling from official master logo**

### Critical rule

**Cyan Spark must never be used as readable text directly on Pure White without sufficient dark containment or a verified accessible contrast treatment.**

PASTI Yellow must remain rare and signature-level. Do not guess an official production HEX before the master logo is sampled.

---

## 7. Brand / Website Ratio Rules

These are two separate concepts and both are valid:

### Brand Philosophy

- 50% Proof
- 30% Expression
- 20% Brand

Meaning: real work and capability lead; expression supports proof; brand language binds the experience.

### Website Execution Mix

- 70% Experience
- 20% Platform
- 10% Brand

Meaning: the website should be experienced through composition, typography, scroll, interaction, and motion rather than feeling like a static component library.

Do not merge these ratios into one metric.

---

## 8. Motion Architecture

### Lenis

Lenis owns smooth scrolling.

### GSAP

GSAP owns choreography, state transitions, masks, transforms, text transitions, vector motion, and interaction timelines.

### ScrollTrigger

ScrollTrigger owns:

- pinning
- scrubbed animation
- horizontal scroll choreography
- progress-based state changes
- section transitions
- scroll-synchronized project changes

### Motion principle

> **Controlled Momentum**

Motion must feel precise, weighted, responsive, and intentional. Every movement must serve at least one function:

- Reveal
- Focus
- Progress
- Transition
- Response

Avoid bounce, elastic springs, random floating loops, and fade-up-everywhere behavior.

---

## 9. Motion Intensity Hierarchy

### Heavy Signature Sections

- Hero
- What We Build
- Selected Work
- Platforms

### Medium Motion

- Testimoni
- Insight

### Quiet / Restrained

- Trusted by Brand
- PAQ / FAQ
- Footer

This hierarchy is mandatory. The page must have rhythm, not constant spectacle.

---

## 10. The Signal

**The Signal** is the recurring visual motif across the website.

It may appear as:

- route line
- point
- progress indicator
- active index
- section handoff
- mask edge
- state marker
- vector path

Default digital language: Cobalt / Cyan.

PASTI Yellow: rare signature moments only.

Do not turn The Signal into decorative HUD clutter.

---

## 11. Existing UI Lock Rules

### Trusted by Brand

Keep existing layout and content hierarchy intact. Theme integration and subtle micro-interaction are allowed.

### PAQ / FAQ

Keep existing information architecture and layout intact. Only subtle interaction polish is allowed.

### Footer

Keep existing structure intact. Theme integration, subtle motion, and color refinement are allowed.

Do not rebuild these three sections from scratch.

---

## 12. Selected Work Baseline

Design and implementation must support **10 project states** as the initial baseline.

The architecture must remain scalable so project count can increase or decrease without rewriting the choreography engine.

Use dummy media until real Selected Work assets are inserted.

---

## 13. Platforms Baseline

Exactly two product worlds:

1. OPEN
2. e-CORPORATE

Both must share the same PASTI universe while having differentiated internal art direction and motion behavior.

---

## 14. Insight Baseline

Use 4 editorial story panels:

- 1 featured story
- 3 supporting stories

Copy remains placeholder until approved.

---

## 15. Responsive Principles

### Desktop

Full cinematic experience.

### Tablet

Reduce secondary details, parallax amplitude, 3D complexity, and pin duration.

### Mobile

Recompose rather than scale desktop. Avoid long scroll traps. Preserve editorial hierarchy and PASTI identity while simplifying heavy choreography.

---

## 16. Accessibility

Respect `prefers-reduced-motion: reduce`.

Under reduced motion:

- disable decorative idle motion
- reduce or remove long pins where appropriate
- simplify parallax
- disable non-essential 3D
- preserve strong static composition
- preserve full content access

Keyboard focus states and readable contrast remain mandatory.

---

## 17. Performance Requirements

- Use transform and opacity for high-frequency motion.
- Avoid layout reads inside RAF / ticker hot paths.
- Scope and clean all GSAP contexts.
- Kill ScrollTriggers on unmount / route leave.
- Dispose WebGL resources fully.
- Pause expensive animation offscreen.
- Avoid excessive blur and animated heavy shadows.
- Avoid unnecessary device-pixel-ratio on WebGL.
- Prevent duplicate Lenis / GSAP ticker loops.

---

## 18. Recommended Build Order

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

## 19. Definition of Done

A section is not done until:

- static composition looks premium
- motion improves hierarchy
- reverse scroll works where applicable
- responsive behavior is intentional
- reduced-motion path works
- no console errors
- no layout shift
- no duplicate timelines / triggers
- no uncleaned listeners
- implementation does not resemble a generic SaaS or AI-generated template
