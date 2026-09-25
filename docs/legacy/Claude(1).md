# CLAUDE.md — PASTI Landing Page Rework

## Role

You are working as a senior frontend, interaction, and motion engineer on the PASTI agency landing-page rework.

You must preserve approved creative direction and brand rules. Do not reinterpret the project into your own generic agency template.

---

# 1. Source-of-Truth Priority

Use this order:

1. PASTI Brand Guide Working Baseline v1.0
2. PASTI Design Direction v1.0
3. Developer handoff documents in this package
4. Existing site/screenshot only for Trusted by Brand, PAQ/FAQ, and Footer where locked
5. External references only as behavior/craft inspiration

Do not silently override higher-priority rules.

---

# 2. Project Stack

Required:

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- GSAP
- ScrollTrigger
- Lenis

Optional:

- Three.js / WebGL only when content storytelling materially improves
- SVG/vector animation

Do not introduce another smooth-scroll engine.

---

# 3. Core Creative Direction

Approved direction:

> **Engineering Precision × Premium Digital**

Brand essence:

> **Certainty Through Execution**

Brand positioning:

> **Technology × Creative Execution Partner**

Motion language:

> **Controlled Momentum**

The site must feel:

- precise
- premium
- editorial
- modern
- enterprise-capable
- interactive
- cinematic when justified
- highly authored

---

# 4. Hard Anti-Template Guardrails

Do not create:

- generic SaaS 3-card grids
- Cuberto-derived visual grammar
- purple-blue gradient blobs
- giant glass cards
- generic floating dashboard collage
- random chrome sphere
- random particle field
- fake futuristic HUD
- giant pill UI everywhere
- identical rounded cards across sections
- generic browser mockup stack
- fade-up animation as the dominant motion language
- AI-slop typography
- decorative WebGL with no content purpose

If implementation starts resembling these patterns, stop and correct direction before proceeding.

---

# 5. Brand Colors

Required working palette:

Slate Navy:
`#0F172A`

Pure White:
`#FFFFFF`

Surface Neutral:
`#F8FAFC`

Cobalt Blue:
`#2563EB`

Cyan Spark:
`#06B6D4`

PASTI Yellow:
`PENDING_MASTER_LOGO_SAMPLE`

### Critical Rule

Cyan Spark must never be used as readable text directly on Pure White without sufficient dark containment or verified contrast treatment.

PASTI Yellow must remain rare. Never guess its official HEX if the master logo has not been sampled.

---

# 6. Typography

Direction:

> **Super Editorial × Functional Precision**

Display:

- oversized
- tight leading
- negative tracking
- asymmetric placement
- occasional crop / edge bleed

Hero display:

`clamp(72px, 9vw, 160px)`

Avoid:

- generic SaaS type
- sci-fi fonts
- rounded playful display type
- monospace as main voice
- arbitrary font mixing

Do not choose final font files without approval if font family remains undecided.

---

# 7. Copy Rule

Until approved content is supplied, all newly introduced copy fields must use:

`Lorem ipsum dolor sit amet`

Do not invent:

- project names
- testimonials
- marketing claims
- awards
- metrics
- client names

Approved exceptions:

- Platforms
- OPEN
- e-CORPORATE
- existing locked copy in Trusted / FAQ / Footer

---

# 8. Brand / Website Ratios

Brand philosophy:

- 50% Proof
- 30% Expression
- 20% Brand

Website execution:

- 70% Experience
- 20% Platform
- 10% Brand

Do not confuse these two frameworks.

---

# 9. Motion Rules

Motion must serve:

1. Reveal
2. Focus
3. Progress
4. Transition
5. Response

Avoid:

- bounce
- elastic springs
- meaningless float
- motion delay for decoration
- long pinning with no narrative value
- mobile scroll traps

Timing:

Micro: 120–250ms

Standard: 300–600ms

Cinematic: 800–1600ms

Preferred easing:

- `power3.out`
- `power4.out`
- `expo.out`

---

# 10. Scroll Architecture

Lenis owns smooth scrolling.

GSAP / ScrollTrigger owns scroll choreography.

Requirements:

- only one Lenis instance
- synchronize Lenis and GSAP ticker correctly
- call ScrollTrigger update / refresh as needed
- do not create duplicate ticker loops
- do not manually intercept wheel events unless explicitly approved
- scope ScrollTriggers to component lifecycle
- kill all triggers on cleanup

---

# 11. The Signal

The Signal is mandatory as a recurring visual behavior.

Use it for:

- route
- point
- active state
- progress
- index
- section handoff
- underline / vector completion
- state transfer

Default language: Cobalt / Cyan.

Yellow: rare signature moment.

Do not turn The Signal into random HUD decoration.

---

# 12. Homepage Order

Locked:

1. Hero
2. What We Build
3. Selected Work
4. Trusted by Brand
5. Testimoni
6. Platforms
7. Insight
8. PAQ / FAQ
9. Footer

Do not reorder.

---

# 13. Hero

Approved:

- asymmetrical editorial layout
- headline / CTA left
- Living Proof System right
- 4 proof fragments total
- Slate Navy dominant
- restrained Cobalt/Cyan depth
- subtle idle motion
- no generic browser stack
- no centered SaaS dashboard

The four fragments are hierarchical, not equal cards.

Scroll should resolve / hand off to Section 02 rather than simply fade away.

---

# 14. What We Build

Required sequence:

1. Curtain Reveal
2. Pin
3. Randomized text decode
4. Controlled radial breakup
5. Four cards emerge
6. Fan spread
7. Settle
8. Release

Card hierarchy:

- 1 primary
- 2 medium
- 1 smaller accent

No identical cards.
No playful spring.
No Matrix aesthetic.

---

# 15. Selected Work

Baseline supports 10 projects and must remain scalable.

Required:

- pinned split-screen
- alternating media / text sides
- slide-up title masking
- scrubbed word/chunk description reveal
- controlled media crop / mask transitions
- active project rail

Do not create a carousel.

Do not mount ten heavy WebGL scenes at once.

---

# 16. Trusted by Brand

Existing UI and hierarchy are locked.

Allowed:

- theme integration
- spacing calibration
- subtle hover
- smooth transition handoff
- tiny Signal cue

Do not redesign.

---

# 17. Testimoni

Required:

- horizontal zig-zag proof field
- magnetic focus hover
- active card full opacity
- surrounding cards dim to 35–50%
- active lift 6–10px max
- exit alignment choreography

Do not use carousel arrows or generic review cards.

---

# 18. Platforms

Exactly two baseline product worlds:

- OPEN
- e-CORPORATE

Required:

- pinned horizontal scroll
- vertical input drives horizontal panels
- near-viewport-width dark panels
- differentiated internal art direction
- subtle 3D / parallax where useful
- active Signal transfer

OPEN should feel more expansive.

e-CORPORATE should feel tighter and more structured.

Do not build SaaS pricing cards.

---

# 19. Insight

Baseline:

- 1 featured
- 3 supporting

Required:

- masked entrance distinct from Platforms
- editorial composition before horizontal movement starts
- mixed hierarchy
- horizontal story stream
- text-led CTA

Do not use equal-width blog cards.

---

# 20. PAQ / FAQ

Existing UI and IA are locked.

Allowed:

- 120–150ms hover
- 200–300ms reveal
- indicator rotation
- border / contrast shift
- Signal active cue

Do not add heavy pinning or 3D.

---

# 21. Footer

Existing structure is locked.

Allowed:

- dark premium theme integration
- line reveal
- short stagger
- underline movement
- arrow shift
- 150ms hover
- optional rare Yellow signature

Footer should feel resolved and calm.

---

# 22. Responsive

Do not scale desktop mechanically.

Desktop:
full experience.

Tablet:
reduce secondary detail, pin length, parallax, and optional 3D complexity.

Mobile:
recompose, shorten heavy sequences, reduce WebGL, avoid long scroll traps.

---

# 23. Reduced Motion

Honor `prefers-reduced-motion: reduce`.

Disable or simplify:

- decorative idle
- long pinning
- heavy parallax
- non-essential WebGL
- excessive horizontal runway

Preserve a strong static composition and full content access.

---

# 24. Performance

Prefer:

- transform
- opacity
- SVG
- GPU-friendly compositing

Avoid:

- repeated layout measurement inside RAF
- heavy animated blur
- excessive box-shadow animation
- unnecessary high-DPR WebGL
- duplicated timelines

Pause expensive offscreen animations.

Dispose Three.js resources completely.

---

# 25. Before Coding a Section

Always:

1. Read Brand Guide.
2. Read Design Direction.
3. Read `03 homepage spec.md`.
4. Audit current implementation.
5. Identify reusable utilities.
6. List files to modify.
7. Write a concise implementation plan.
8. Respect approval gate if requested.

Do not silently redesign an approved section.

---

# 26. Definition of Done

A section is complete only when:

- static frame looks premium
- motion serves hierarchy
- scroll reverse works where relevant
- responsive state is intentional
- reduced motion works
- no layout shift
- no console errors
- no duplicate ScrollTriggers
- no leaked listeners
- no leaked WebGL resources
- no forbidden Cyan-on-white readable text
- no generic SaaS / AI-slop visual pattern
- brand direction remains intact
