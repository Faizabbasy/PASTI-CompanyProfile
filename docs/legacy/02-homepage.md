# PASTI Homepage Specification

## 1. Locked Section Order

1. Hero
2. What We Build
3. Selected Work
4. Trusted by Brand
5. Testimoni
6. Platforms
7. Insight
8. PAQ / FAQ
9. Footer

No reordering without approval.

---

# 2. Global Copy Rule

All newly introduced copy uses:

`Lorem ipsum dolor sit amet`

until production copy is approved.

Do not fabricate names, quotes, metrics, or claims.

Approved names that may remain:

- Platforms
- OPEN
- e-CORPORATE

Existing locked content may remain in Trusted / FAQ / Footer.

---

# 3. Global Scroll Architecture

Lenis owns smooth scrolling.

GSAP / ScrollTrigger owns section choreography.

Requirements:

- one Lenis instance
- one GSAP ticker integration path
- no competing smooth-scroll engine
- no manual wheel interception unless specifically approved
- ScrollTrigger refresh after material layout changes
- cleanup on unmount / route transition

---

# 4. HERO

## Direction

Asymmetrical Editorial + Living Proof System.

## Layout

### Left

- optional micro label
- oversized editorial headline
- supporting copy
- primary CTA
- optional secondary CTA

### Right

Living Proof System with 4 fragments:

1. 1 primary product/UI fragment
2. 2 secondary fragments
3. 1 micro utility fragment

No four-equal-card arrangement.

## Environment

- Slate Navy dominant
- controlled Cobalt/Cyan depth
- no purple-blue blobs
- no generic glow field

## Navigation

- proportional PASTI logo left
- text navigation right
- no background box initially
- no glass pill

## Idle Motion

- slow crop shift
- independent fragment drift
- mask recalibration
- restrained parallax
- Signal movement

No obvious short looping timeline.

## Scroll Behavior

Hero should resolve toward Section 02:

- proof system tightens
- active proof becomes more dominant
- Signal prepares vertical handoff
- avoid simple fade-out

## Mobile

- preserve asymmetry through recomposition
- reduce fragment count/detail if necessary
- avoid dense overlap
- minimize parallax

---

# 5. WHAT WE BUILD

## Direction

Controlled Expansion.

## Entry

Curtain Reveal from below / over Hero.

The reveal should feel like a new stage taking over the viewport.

## Pinning

After reveal, the section pins.

Scroll progress controls the sequence.

## Phase A — Decode

Centered placeholder text appears:

`Lorem ipsum dolor sit amet`

Characters decode from randomized states into readable final text.

Rules:

- controlled
- short
- premium
- no Matrix styling
- no green terminal aesthetic

## Phase B — Radial Break

Resolved text breaks apart radially.

Fragments become a controlled abstract background field.

Do not create an explosive or chaotic particle effect.

## Phase C — Card Emergence

Four cards emerge from a compressed center state.

Hierarchy:

- 1 primary card
- 2 medium cards
- 1 smaller accent card

Cards must vary in:

- size
- angle
- depth
- z-order

## Phase D — Fan Spread

Cards fan outward and settle into a layered composition.

Do not use playful springs.

## Phase E — Release

Once the final fan state is established, the pin releases.

## Copy

All card copy:

`Lorem ipsum dolor sit amet`

## Responsive

Desktop: full pinned choreography.
Tablet: shorter runway, lower rotation/depth.
Mobile: compressed sequence, fewer decorative text fragments, no long trap.

---

# 6. SELECTED WORK

## Direction

Pinned Project Exchange.

## Baseline Project Count

10 project states.

Architecture must be data-driven and scalable beyond 10.

## Layout

Alternating split-screen:

### Odd project

- media left
- typography right

### Even project

- typography left
- media right

## Typography Content

Each state supports:

- project index
- category
- title
- description
- metadata

All unapproved text uses placeholder.

## Media

Temporary dummy imagery allowed.

Production may use:

- image
- video
- selective 3D / WebGL

Do not require 3D for every project.

## Title Transition

Slide-Up Masking:

- old title exits upward inside mask
- new title enters upward
- no opacity-only swap

## Description Transition

Scrubbed typewriter-style reveal.

Preferred implementation:

- word / chunk reveal
- avoid slow literal character typing if it feels gimmicky

## Media Transition

- mask reveal
- controlled crop shift
- restrained scale
- direction may alternate with layout

## Progress Rail

Use a visible but restrained project progress system for 10 states.

The Signal may become:

- active index
- progress line
- current project marker

## Pinning

Vertical user scroll controls project progression.

Scroll upward must reverse smoothly.

## Performance

Do not mount ten heavy WebGL scenes simultaneously.

Lazy-load media and use lightweight placeholders where appropriate.

---

# 7. TRUSTED BY BRAND

## Lock Rule

Existing UI and structure remain intact.

Do not redesign.

## Allowed

- theme integration
- minor spacing calibration
- subtle hover / contrast lift
- smoother section handoff
- tiny Signal cue

## Not Allowed

- changing logo arrangement
- reordering clients
- converting logos into cards
- introducing heavy motion

This is a breathing / proof section.

---

# 8. TESTIMONI

## Direction

Social Proof in Motion.

## Scroll Model

Normal vertical scroll.

No long pin.

## Layout

Horizontal zig-zag card field.

Recommended baseline:

- 1 featured card
- several medium cards
- optional compact cards

Do not use carousel controls.

## Magnetic Hover

When one card is active:

- active opacity = 1
- surrounding cards = approx. 0.35–0.5
- active vertical lift = 6–10px max
- subtle border / Signal emphasis

No heavy glow.
No dramatic scale.

## Idle

Optional low-amplitude, asynchronous drift.

Do not move all cards together.

## Exit Choreography

1. Zig-zag offsets reduce.
2. Cards align to shared baseline.
3. Opacity normalizes.
4. Row forms one clean rhythm.
5. Entire row moves upward together.
6. Platforms enters.

---

# 9. PLATFORMS

## Direction

Product Worlds.

## Product Count

Exactly 2 baseline product worlds:

1. OPEN
2. e-CORPORATE

## Scroll Model

Pinned horizontal movement driven by vertical scroll.

Panels move right to left.

## Panel Form

- near-viewport width
- dark
- editorial
- large UI fragments
- no pricing-card visual language

## OPEN Art Direction

- expansive
- more breathing room
- broader compositions
- freer media framing

## e-CORPORATE Art Direction

- tighter grid
- more precise
- more structured
- denser information rhythm

## Internal Motion

Allowed:

- subtle 3D
- 4–8px parallax / depth
- UI fragment movement
- vector Signal
- title / metadata stagger

3D is support, not the hero gimmick.

## Transition

Next panel begins entering before current panel fully disappears.

Active emphasis transfers smoothly.

## Exit

Final panel settles, horizontal timeline completes, pin releases.

---

# 10. INSIGHT

## Direction

Editorial Intelligence Stream.

## Baseline Content

4 panels:

- 1 featured
- 3 supporting

## Entrance

Must differ from Platforms.

Sequence:

1. Large heading mask reveal.
2. Featured article establishes composition.
3. Supporting stories stagger into place.
4. Only then horizontal movement begins.

## Horizontal Scroll

Vertical scroll drives horizontal editorial stream.

## Hierarchy

Featured article:

- dominant media
- largest title
- strongest crop

Supporting articles:

- mixed image ratios
- more typography-led
- varied scale

No identical blog cards.

## CTA

CTA copy:

`Lorem ipsum dolor sit amet`

CTA style:

- text-led
- editorial
- line / arrow / Signal interaction

## Theme

May act as a strategic light interruption using Pure White / Surface Neutral.

Cyan contrast rule remains mandatory.

---

# 11. PAQ / FAQ

## Lock Rule

Existing UI and information architecture remain intact.

## Interaction Polish

Hover:

`120–150ms`

Open / close:

`200–300ms`

Allowed:

- indicator rotation
- border shift
- text contrast shift
- clean height reveal
- Signal cue for active item

Not allowed:

- pinning
- heavy 3D
- giant card redesign
- glow-heavy treatment

---

# 12. FOOTER

## Lock Rule

Existing structure remains intact.

## Theme Integration

- Slate Navy / darkest navy
- off-white typography
- muted supporting slate
- restrained Cobalt / Cyan
- optional rare Yellow signature

## Motion

- short stagger
- line reveal
- underline movement
- arrow shift
- 150ms hover response

Footer must feel like a resolved ending, not another promotional section.

---

# 13. Navigation

- PASTI logo left
- text links right
- no background box in initial Hero state
- sticky state may introduce subtle backdrop / line
- no glass pill
- active state primarily Cobalt / Cyan
- Yellow only for rare signature moment

---

# 14. The Signal — Cross-Section Usage

Hero: activates proof field.

What We Build: marks capability resolution.

Selected Work: project index / progress.

Trusted: optional micro proof marker.

Testimoni: magnetic focus state.

Platforms: product state handoff.

Insight: category / reading progress.

PAQ: active item cue.

Footer: final resolved point / line.

---

# 15. Reduced Motion

Reduced mode must preserve layout and content.

Simplify:

- randomized decode
- radial breakup
- long pinning
- parallax
- WebGL
- horizontal runway length

Do not remove the visual composition itself.

---

# 16. QA Acceptance

Verify:

- forward scroll
- reverse scroll
- responsive layout
- mobile scroll comfort
- reduced-motion path
- no duplicate triggers
- no stuck pin
- no layout jumps
- no console warnings
- no leaked WebGL resources
- no Cyan-on-white readability violation
- no accidental generic SaaS pattern
