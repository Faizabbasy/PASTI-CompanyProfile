# PASTI — Design Direction

## Engineering Precision × Premium Digital

PASTI must present serious technology capability through exceptional digital taste.

The site should feel enterprise-credible, editorial, immersive, precise, and confident. It must never feel like a generic technology template decorated with animation.

**Source**: This document interprets `00-brand-guide.md` for the website. Scope note: this file contains only **cross-section, reusable direction** — genuinely brand/experience-level principles that apply across the whole homepage. Section-specific mental models (e.g. "Operational Evidence in Motion" for Hero, "Sticky Editorial Canvas" for Insight, "Product Worlds" for Platforms) live in `04-homepage-spec.md`, not here. Do not blur this boundary when editing either file.

---

## 1. Core Visual Concept

### Engineering Precision × Premium Digital

The intended blend:

- Enterprise-grade structure
- Super-editorial composition
- Premium motion craft
- Strong visual hierarchy
- Selective depth / 3D
- Asymmetry
- Real proof
- Controlled cinematic interaction

PASTI should feel capable before it feels decorative.

---

## 2. Brand Essence

> **Certainty Through Execution**

Every visual and interaction decision should reinforce at least one of:

- Certainty
- Precision
- Momentum
- Practicality
- Impact

Core emotion:

> **Confidence + Momentum + Certainty**

---

## 3. What PASTI Is Not

PASTI is not:

- A SaaS template
- An AI-generated agency landing page
- A Cuberto derivative
- A cyberpunk product
- A glassmorphism showcase
- A random 3D experiment
- A corporate site with timid typography
- A motion demo that weakens usability

---

## 4. Experience Ratio

### Website Execution Mix

**70% Experience** — typography, motion, scroll choreography, masks, image treatment, composition, transitions, selective 3D, interaction rhythm.

**20% Platform** — information hierarchy, navigation, content structure, responsive grid, product/project comprehension, usability.

**10% Brand** — color, logo, The Signal, graphic language, voice.

The brand should be felt through the experience, not pasted on top of it.

### Brand Philosophy Ratio

For strategic brand decisions (from Brand Guide §15):

**50% Proof · 30% Expression · 20% Brand.**

Proof leads. Expression elevates. Brand makes the experience ownable.

Do not merge these two ratios into one metric — they answer different questions (strategic brand allocation vs. website execution allocation).

---

## 5. Color Direction

### Slate Navy — Primary Environment

`#0F172A`

Primary use: Hero, dark sections, premium panels, navigation states, Footer, high-impact narrative scenes.

Do not flatten the entire page into one uniform navy tone. Use tonal depth and light resets.

### Pure White

`#FFFFFF`

Use for: high-contrast typography, strategic clean surfaces, controlled visual resets.

### Surface Neutral

`#F8FAFC`

Use for: editorial light sections, quieter reading environments, softer contrast moments.

### Cobalt Blue

`#2563EB`

Core digital interaction accent: active state, progress, route, mask edge, selected metadata, CTA emphasis, project index, vector signal.

### Cyan Spark

`#06B6D4`

Use sparingly for: technical cue, secondary signal, subtle edge light, data point, micro vector detail.

**Never use readable Cyan text directly on Pure White without dark containment or sufficient contrast.**

### PASTI Yellow

Signature accent from the logo. Exact production HEX is pending sampling from the official master logo.

Use rarely for: signature signal, unmistakable active state, final emphasis, branded visual punctuation.

Never use yellow as a large UI wash by default.

> **Homepage-execution note**: the Brand Guide's recommended digital ratio allows Yellow roughly 1–3% presence. For this specific homepage rework, section-by-section art-direction locks (see `04-homepage-spec.md`) have collectively converged on a stricter default: **Yellow is off unless a specific section explicitly justifies and approves its use.** This is a homepage-execution posture, not a redefinition of the brand-level ratio.

---

## 6. Typography Direction

### Super Editorial × Functional Precision

Display typography is a primary visual asset.

**Display behavior**: oversized, tight line-height, negative tracking, asymmetric alignment, strong crop/bleed where appropriate, deliberate negative space.

Hero display range: `clamp(72px, 9vw, 160px)`. Line-height: `0.88–0.98`. Tracking: `-0.02em` to `-0.05em`.

**Body typography** must remain calm, legible, functional, and enterprise-credible.

**Avoid**: rounded SaaS display type, decorative futuristic fonts, AI-slop typography, mono as primary voice, random font mixing, timid section headings.

Exact production font family remains a separate, not-yet-decided implementation choice. Do not select a final font family without explicit approval.

---

## 7. Layout Direction

Use an 8px base system but allow editorial composition to break rigid symmetry intentionally.

**Preferred composition traits**: asymmetry, oversized type, strong crop, real negative space, edge-aligned visual masses, layered media, intentional off-grid moments within a controlled macro grid.

Avoid repetitive centered stacks and repeated identical card systems.

### 12-Column Conceptual Macro Grid

The homepage's asymmetric compositions are built on a **12-column conceptual macro grid** — not rigid symmetry, but a disciplined structure that every section's key elements align to at least one meaningful line of. This is the structural basis for the **Precise Misalignment** principle (Section 9 below). Exact column spans, gutters, and responsive breakpoints are defined in `03-design-system.md`; this document establishes the grid as a cross-section principle, not the pixel-level specification.

---

## 8. Graphic Language

### Precision Framing

Use frames, edge rules, masks, crop lines, and alignment markers to structure information.

### The Signal

The recurring active visual motif across sections. See Section 10 below for its cross-section role; the exact form and behavior of Signal in each individual section is defined in `04-homepage-spec.md`.

### Editorial Crop

Use product screens, imagery, and interfaces as material: oversized crop, partial interface, mask reveal, edge bleed, layered fragments.

Avoid generic browser mockups as the default presentation method.

### Large Type as Graphic

Typography may become visual mass through scale, mask, movement, and crop.

---

## 9. Cross-Section Mental Models

These are the mental models that emerged through section-by-section art-direction refinement and that genuinely apply across more than one section — they are cross-cutting principles, not a single section's choreography. Anything that describes *how one specific section behaves* belongs in `04-homepage-spec.md`, not here.

### Precise Misalignment, Not Playful Irregularity

PASTI must feel engineered. Composition may use controlled offset, overlap, crop, and depth — but elements are not skewed/floated/angled arbitrarily just to look "editorial." The majority of any composition's elements align to at least one meaningful line of the 12-column macro grid. This principle governs Hero's Living Proof System, Selected Work's project layout, What We Build's card fan spread, and Platforms' fragment placement alike — each applies it differently, but the underlying discipline is the same.

### Designed Continuity, Not Arbitrary Proximity

Where The Signal (or any other recurring device) appears to hand off from one section to the next, that continuity must be **by design** — sharing a grid key line, matching directional momentum, matching perceived position — not merely two elements that happen to be near each other at a section boundary.

### Visual Hierarchy Is Not Business Priority

Where a section establishes one element as a visual anchor (a "primary" card, a "featured" item, a dominant fragment), that anchor leads the *composition*, not a ranking of business or service importance. This governs, among others, What We Build's card hierarchy, Testimoni's featured card, and Insight's featured article. Do not let visual dominance in a layout be read — by a viewer or by a future content decision — as "this is our best/most important offering."

### Depth Without Blur

Depth and "distance" between layered elements (proof fragments, product fragments, editorial media) is communicated through scale, crop, occlusion, tonal contrast, parallax, and z-position — not through blur as a default mechanism. Blur-as-depth is treated as a generic, easily-overused shortcut and is avoided across the homepage's signature sections.

### Controlled Momentum

See Brand Guide §11. Motion must feel precise, weighted, responsive, and intentional. Every movement must serve at least one function: Reveal, Focus, Progress, Transition, or Response. Avoid bounce, elastic springs, random floating loops, and fade-up-everywhere behavior. Idle motion, where it exists at all, is restrained, state-based, and non-repetitive — not a default "everything gently floats" treatment.

---

## 10. The Signal — Cross-Section Role

**The Signal** is the recurring visual motif across the website. It unifies sections that otherwise have very different mechanics.

It may appear as: route line, point, progress indicator, active index, section handoff, mask edge, state marker, vector path, structural frame.

Default digital language: Cobalt / Cyan. PASTI Yellow: rare signature moments only. Do not turn The Signal into decorative HUD clutter — if a Signal element does not support hierarchy, state, progression, or transition, remove it (Brand Guide §08).

Signal's specific form and behavior differs deliberately by section — it is never flattened into one generic reusable component behavior. The section-by-section role (Hero's execution route, What We Build's trigger/state, Selected Work's editorial spine, Trusted's quiet proof marker, Testimoni's structural focus cue, Platforms' transfer system, Insight's reading-state marker, PAQ's accordion cue, Footer's final structural resolution) is fully specified in `04-homepage-spec.md`. The reusable visual *primitives* Signal draws from (point, short route, structural line, segmented progression, color-state behavior) are catalogued in `03-design-system.md`.

---

## 11. Motion Language

### Controlled Momentum

Motion should feel: crisp, weighted, smooth, responsive, precise, cinematic when justified.

Every animation must serve: Reveal, Focus, Progress, Transition, Response.

**Avoid**: bounce, elastic springs, random float, decorative delay, fade-up everywhere, long pinning without narrative value.

### Motion Intensity Hierarchy

**Heavy Signature**: Hero · What We Build · Selected Work · Platforms
**Medium**: Testimoni · Insight
**Quiet**: Trusted by Brand · PAQ · Footer

The page must breathe between signature moments — this hierarchy is mandatory.

### Motion Technology

Mandatory: Lenis, GSAP, ScrollTrigger. Encouraged: SVG/vector motion. Conditional: WebGL/Three.js only when storytelling materially benefits.

---

## 12. Navigation

- PASTI logo left, text navigation right.
- No background box in initial Hero state.
- No glass pill.
- Sticky state may introduce subtle dark backdrop / separator.
- Cobalt / Cyan for active state.
- Yellow only for rare signature emphasis.

---

## 13. Anti-Template / Anti-AI-Slop

Strictly reject: Cuberto visual dependency, generic SaaS 3-card grids, purple-blue gradient blobs, random chrome spheres, meaningless particles, giant glass cards, pill UI everywhere, fake HUD graphics, generic floating dashboard collage, generic browser mockup stack, glow as a substitute for art direction, identical rounded cards everywhere, motion whose only purpose is to look animated.

**Preferred alternatives**: asymmetry, editorial scale, strong crop, real proof, dark/light rhythm, precise spacing, controlled motion, limited repeatable visual devices.

---

## 14. Final Direction Summary

| Dimension | Direction |
|---|---|
| Brand | PASTI People |
| Positioning | Technology × Creative Execution Partner |
| Brand Essence | Certainty Through Execution |
| Core Idea | Engineering Precision × Premium Digital |
| Visual | Dark × Precise × Editorial × Confident |
| Primary Environment | Slate Navy `#0F172A` |
| Light Base | Pure White / Surface Neutral |
| Core Accent | Cobalt Blue `#2563EB` |
| Highlight | Cyan Spark `#06B6D4` |
| Signature Accent | PASTI Yellow — sparse, exact HEX pending master logo |
| Typography | Super Editorial × Functional Precision |
| Motion | Controlled Momentum |
| Scroll Stack | Lenis × GSAP × ScrollTrigger |
| UI | Minimal × Content-led × Not SaaS-card-heavy |
| Core Emotion | Confidence + Momentum + Certainty |

> PASTI should never look like a company trying to appear advanced. It should look like a company that is already capable — and therefore confident enough to be precise, restrained, and exceptionally well executed.
