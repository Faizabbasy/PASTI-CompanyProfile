# PASTI — Homepage Specification

All 9 homepage sections, fully locked through iterative DISCUSS → REFINE art-direction sessions. This document is the authoritative section-by-section behavior spec — it applies the reusable rules in `03-design-system.md` to specific, locked decisions per section. Where a section's mental model or mechanic is unique to it, it lives here, not in `02-design-direction.md` or `03-design-system.md`.

**Locked section order** (do not reorder without approval):

1. Hero
2. What We Build
3. Selected Work
4. Trusted by Brand
5. Testimoni
6. Platforms
7. Insight
8. PAQ / FAQ
9. Footer

**Global copy rule**: all new copy uses `Lorem ipsum dolor sit amet` until production copy is approved. Approved exceptions: "Platforms", "OPEN", "e-CORPORATE", and existing locked content in Trusted / FAQ / Footer. Never invent testimonials, claims, metrics, client names, or awards.

**Global scroll architecture**: one Lenis instance owns smooth scrolling; GSAP/ScrollTrigger owns section choreography. No competing smooth-scroll engine, no manual wheel interception unless explicitly approved, ScrollTrigger refresh after material layout changes, full cleanup on unmount/route transition.

**Homepage rhythm** (locked):

| Section | Motion Intensity | Theme |
|---|---|---|
| Hero | Heavy | Dark |
| What We Build | Heavy | Dark |
| Selected Work | Heavy | Dark |
| Trusted by Brand | Quiet | Light |
| Testimoni | Medium | Dark |
| Platforms | Heavy | Dark |
| Insight | Medium | Light |
| PAQ / FAQ | Quiet | Dark |
| Footer | Quiet | Dark |

---

## 1. HERO

**Status**: Total rework. **Intensity**: Heavy Signature. **Theme**: Dark.

### Mental Model

> **Operational Evidence in Motion.**
> **Precise Misalignment, Not Playful Irregularity.**

The Living Proof System is not a portfolio collage, not a floating dashboard, not a futuristic control panel. It is a fragment of PASTI's real execution that feels active and working — a visual manifestation of Certainty Through Execution.

### Experience Goal

Within 3–5 seconds, the user must feel "this company is already capable" — not "this company is trying to look capable." Confidence without flexing, momentum without rushing.

### Composition

Asymmetric, ~55/45 to 58/42 left/right split. Nav: full-width strip, logo left, text nav right, no background box, no glass pill. Headline: left, anchored ~1/3 down from top, left-aligned, 2–3 lines max. Supporting copy: small, max-width limited, below headline. CTA: text-led, near supporting copy. Living Proof System: right column, not container-bound — fragments may bleed slightly toward center. Negative space concentrated diagonally (top-right, bottom-left) for dynamic asymmetry rather than a static 2-column split.

All Living Proof fragments and the headline share key alignment lines on the **12-column macro grid**. Every fragment aligns to at least one meaningful grid line (top, left, or baseline) even while offset from one another.

### Living Proof System — 4 Fragments

- **Primary**: largest, most readable, most stable position on the grid. Depth from largest scale + frontmost z-position — not artificial sharpness/blur.
- **Secondary A**: aligned to a shared grid line with Primary (e.g. top edge), ~60–70% of Primary's scale. "Farther" depth from smaller scale + partial occlusion by Primary + slightly reduced tonal value — never blur.
- **Secondary B**: aligned to a different grid line than Secondary A, similar scale to A. Depth from more aggressive crop + a different parallax rate on scroll — never blur.
- **Micro Utility**: smallest, attached to an edge of Primary or Secondary (like a metadata chip). Functions as a *state indicator*, not a large image.

**Occlusion is the primary depth mechanism** — a fragment that is narratively "farther" is genuinely partially stacked behind another, not faked with blur.

**Content**: dummy UI/imagery during design phase, representing PASTI's broader execution capability — **not** locked to OPEN or e-CORPORATE specifically (Platforms owns that content later). Production replaces dummy content with real proof.

### Micro Utility — Whitelist

Allowed neutral placeholder states: `ACTIVE`, `READY`, `SYNCED`, `LIVE`, `01 / 04`, `SYSTEM ACTIVE`, `PROCESS READY`, `STATUS / ACTIVE`.

**Do not invent**: KPI, uptime, client count, success rate, performance metrics, or any business number, unless backed by real production data.

**Visual rule**: clean, editorial, technical, precise, minimal. Never cyberpunk terminal, fake HUD, command-line interface, or sci-fi monitoring aesthetic.

### Idle Motion

System-based, not "everything floating":

- **Primary**: mostly stable; slow crop/reframe behavior only.
- **Secondary A**: positional breathing, ±3–4px max.
- **Secondary B**: mostly static; motion primarily from scroll-driven parallax, not idle loop.
- **Micro Utility**: state/index transition (the element that most visibly "works").
- **Signal**: sparse, purposeful activation — not looping constantly.

### The Signal in Hero

Directional route, not a network visualization connecting all 4 fragments:

```
headline / composition anchor
  → primary proof
    → micro state
      → section boundary
        → What We Build
```

Secondary A/B respond passively to Signal's state (subtle tonal shift) without being part of the main route or connected by explicit lines.

### Handoff to What We Build

**Designed continuity, not arbitrary proximity**: Signal's exit position and What We Build's entry origin share a normalized alignment anchor — same 12-column key line, matching directional momentum, matching perceived position. (Pixel-exact coordinates are a Design System/implementation decision, not locked at art-direction level.)

**Scroll distance**: medium cinematic, ~1.3–1.6 viewport. Not a long scroll trap — What We Build owns the dominant pinned choreography that follows.

### Color & Lighting

Slate Navy dominant with tonal depth (not flat), Cobalt for Signal/CTA/micro-utility "active" indication, Cyan very selective (edge light, never readable text on a light surface — low risk here since the environment is dark), White/off-white for headline and muted supporting copy, Yellow absent by default or, at most, one single micro-highlight moment (e.g. Signal's first activation of Primary) — never a recurring element. No gradient blob; depth from crop/layering/tonal shift only.

### Non-Generic Decisions

Honest fragment hierarchy (not 4 equal cards); no browser mockup chrome; Signal as a functional single-route system, not decorative network lines; asymmetric diagonal negative space, not a rote 2-column split; typography as mass with crop/bleed; Yellow deliberately scarce; non-synchronized, non-looping idle motion; scroll as narrative continuation (resolve/handoff), not simple parallax fade.

### Responsive & Reduced Motion

Mobile: preserve asymmetry through recomposition, reduce fragment count/detail if needed, avoid dense overlap, minimize parallax. Reduced motion: disable decorative idle, simplify/remove parallax, disable non-essential elements, preserve strong static composition and full content access.

---

## 2. WHAT WE BUILD

**Status**: Total rework. **Intensity**: Heavy Signature. **Theme**: Dark.

### Mental Model

> **Controlled Expansion.**
> **One Visual Anchor, Not One Superior Capability.**
> **Engineered Takeover, not Theatrical or Sci-Fi Effect** (curtain).
> **Typographic Clusters / Glyph Slices, Not Particles** (break mechanism).

### Experience Goal

Card hierarchy (Primary/Medium/Accent) is a **visual** hierarchy for this composition state, not a business-priority ranking of PASTI's capabilities.

### Handoff from Hero

Signal's exit from Hero and What We Build's origin **by design** share one key line of the 12-column grid — matching directional momentum and perceived position. Before curtain fully opens, a hint of the resolved text (still in high-noise/unresolved state) is visible through the opening gap.

### Curtain Reveal

**One dominant axis, locked vertical** for the Hero → What We Build handoff specifically (this is not a global rule for all future curtain-like transitions — it is specific to this one handoff, chosen because Hero's Signal is already moving vertically toward the section boundary).

```
Signal descends
  → reaches shared boundary anchor
    → vertical curtain takeover begins
      → subtle secondary lateral expansion may assist
        → full What We Build stage is revealed
```

2 layers (Slate Navy curtain + environment behind), tonal continuity (not a contrasting color snap), `expo.out` easing, ~800–1200ms. No circular/radial 360° wipe, no aperture/iris effect — this is an engineered axis-based takeover, not a sci-fi or theatrical effect.

**Pin experience**: curtain takeover and the pinned stage that follows must feel like **one continuous scroll-controlled mechanism** — never a perceived snap from "curtain finishes" into "section suddenly pins." (Exact pinning implementation technique is deferred to implementation planning.)

### Pinned Stage Composition

Main text: horizontally centered, optically (not mathematically) centered vertically, biased slightly upward to leave room below for card emergence. Large negative space around it — this is the most deliberately "empty" moment before card emergence. Signal: settles near/adjacent to the central text in a standby state after triggering the curtain. Only the focal composition is centered — the section as a whole still follows the 12-column grid.

### Text Decode

Character language: **clean alphanumeric** — `A–Z`, `0–9`, and limited technical punctuation (`/`, `.`, `-`, `:`). Avoid `{}`, `[]`, `<>`, `$`, `#`, `%`, binary strings, or code-like syntax — this must never read as hacking/cyberpunk. **Not automatically monospace** — decode stays part of PASTI's own typography system.

Scramble is limited to the final string's own character positions (no extra noise), so the string's silhouette is legible from the start even while characters are wrong. Duration ~800–1200ms, settling smoothly (not flicker/CRT-style), with a ~200–300ms micro-pause at resolved state (Signal pulses once to mark the checkpoint) before breaking apart.

### Typographic Cluster Break

**Not a particle system.**

```
resolved type
  → baseline / glyph groups separate
    → selected clusters travel outward
      → fragments settle into architectural background positions
```

Default cluster unit: **per-word groups, per-baseline segments, or selected glyph slices** where composition needs them — **not** syllable-based splitting. The goal is architectural/editorial fragmentation, not linguistic fragmentation. Clusters move along grid-aware paths (not radial 360°), decelerate sharply (`power4.out`/`expo.out`), scale down slightly and fade to low (not zero) opacity as they settle — becoming a residual background texture, not particles/dust/explosion.

**Residual texture lifecycle** (locked sequence):

```
resolved type → controlled break → fragments visible
  → cards emerge → fragments reduce to 3–8% ambient presence
    → fan settles → majority decay
      → selected remnants briefly remain → release
```

**Selected remnants** (the very last visible trace before full decay): **thin structural line / edge remnants** — baseline echoes, cropped edge segments, thin typographic structural lines, 1–2 residual glyph-edge fragments. **Not dots** — points/dots belong to The Signal system, not to typography remnants.

Full residual field is **not** carried into Selected Work — Selected Work requires a full visual reset.

### Capability Card Emergence

1 Primary + 2 Medium + 1 Accent, emerging from the same compressed centroid the text broke from.

- **Primary**: largest, most visually dominant, aligned to a central/major grid key line, frontmost z-order.
- **Medium A / Medium B**: similar scale to each other (~65–75% of Primary), aligned to *different* grid key lines (not mirror-symmetric), slight overlap with Primary rather than a clean gap.
- **Accent**: smallest (~40–50% of Primary), may overlap/attach to Primary or Medium, frontmost layer despite small size.

Flat surfaces with thin border/edge rule (no drop shadow, no glassmorphism), Slate Navy family with a slight tonal lift, compact radius (design-system scale), no rounded-corner-as-default.

### Fan Spread

Order of release: Primary first (anchors composition), then Medium A/Medium B (near-simultaneous, slight stagger), Accent last. Straight/predictable arc paths (no zigzag/bounce), minimal rotation, consistent deceleration easing across all cards (not individually bouncy). Final resting positions are asymmetric but each aligns to a grid key line — **Precise Misalignment**, not a Behance-style playful card fan.

### The Signal in What We Build

Standby after triggering curtain → active again at text-resolved checkpoint (pulse) → single restrained highlight on Primary card as it settles (marking capability-resolution state, **not** superiority) → reposition toward exit, becoming the origin/trigger for Selected Work's entry.

### Motion Choreography

```
Handoff (Hero Signal enters, shared alignment anchor)
  → Curtain (vertical axis, expo.out, ~800–1200ms) — Transition
    → [continuous, no snap] Pin settle — Focus
      → Decode (clean alphanumeric, non-monospace, ~800–1200ms) — Reveal
        → Resolve (micro-pause, Signal pulse) — Progress
          → Typographic cluster break (~400–600ms, sharp decelerate) — Transition
            → Card emergence (staggered by visual hierarchy) — Reveal + Focus
              → Fan spread (precise misalignment, power4.out) — Progress + Focus
                → Fragments decay to 3–8% → majority decay — Transition (ambient)
                  → Release (pin lets go, fragments mostly gone) — Response
                    → Exit toward Selected Work (Signal repositions, visual reset begins) — Transition
```

Fully reversible — reverse scroll unwinds fan spread → cluster reassembly → decode reverse → curtain closes.

### Scroll Depth

Baseline: **~3.5–4 viewport**. Guardrail: do not exceed **~4.5 viewport** without strong reason. Not a production-exact number — an art-direction constraint.

### Color & Material

Slate Navy dominant, off-white for decode text/card typography, Cobalt as Signal/edge accent on Primary card, Cyan very selective (micro detail on Accent card or resolve-pulse highlight), Yellow absent by default or a single super-specific moment, thin precise borders (no glow, no glassmorphism, no gradient blob).

### Reduced Motion

```
Signal handoff → short mask reveal → resolved text directly visible (no scramble)
  → no typographic cluster break → capability cards appear directly in final visual hierarchy
    → no long pinned choreography
```

Static composition remains premium — the card hierarchy is legible without the full sequence.

---

## 3. SELECTED WORK

**Status**: Total rework. **Intensity**: Heavy Signature. **Theme**: Dark.

### Mental Model

> **Pinned Project Exchange.**
> **A Curated Sequence of Execution Proof, Not Ten Slides With Ten Effects.**

### Experience Goal

The system itself remains consistent across all 10 projects. The projects bring the variation, not the system reinventing itself per project.

### Baseline & Scalability

**10 project states** as baseline. Architecture must remain data-driven and scalable beyond 10 without rewriting the choreography engine.

### Pinned Stage Architecture

Split ratio roughly 50/50 (media zone / typography zone) with visual-weight variance, not pixel-rigid. Media and typography zones each occupy a consistent grid span; sides alternate, span proportions do not. Project index (Signal) sits at a **persistent position** (does not alternate sides) — this stability against the alternating layout is what keeps the section from feeling mechanically repetitive.

### Side Alternation (locked)

- Project A (odd): media left / typography right.
- Project B (even): typography left / media right.
- Continue alternating for all 10 — **not** broken arbitrarily. Visual variety comes from hierarchy, crop, pacing, and rhythm treatment (below) — not from breaking this core system.

### Rhythm Vocabulary (locked — 7 treatments, sufficient, do not expand without genuine content need)

- **Standard Exchange** — the baseline mechanism; majority of projects use this.
- **Media-Dominant State** — media zone widens temporarily, typography narrows.
- **Typography-Dominant State** — typography zone widens, media narrows/tighter crop.
- **Temporary Full-Bleed Takeover** — media expands to full-bleed for a brief moment, then **resolves back into the resting alternate split-screen composition** — this is a temporary interruption inside a project state, never a permanent layout replacement. The underlying alternating split-screen system remains intact.
- **Accelerated Exchange** — faster pacing, shorter dwell.
- **Slower Showcase State** — longer dwell, more detailed transition.
- **Closing State** — dedicated pacing/treatment for project 10 specifically.

**Special Moment Density**: majority (~6–7 of 10) Standard Exchange; ~2 strong pattern-break moments (Media-Dominant, Typography-Dominant, or Full-Bleed Takeover); ~1 subtle pacing variation (Accelerated or Slower Showcase); opener (01) and closer (10) each get their own pacing behavior distinct from mid-sequence Standard.

**Assignment of treatments to actual project numbers is content-driven** — determined later based on real project assets, not pre-assigned at the art-direction level. Do not force an unsuitable project into a visual treatment.

### Media Mask Grammar (locked — one primary grammar)

**Vertical / axis-consistent geometric masking** as the default for nearly all project transitions. Alternative axis behavior (e.g. horizontal mask) is reserved for **rare rhythm-break moments** only (e.g. during Full-Bleed Takeover) — not a free choice of 10 different directions across 10 projects.

### Typography System

Project number (small, metadata scale) · category · title (editorial scale, tight line-height) · description (body-large, scrubbed reveal) · metadata · text-led CTA/detail cue. Typography stays left-aligned relative to its own zone even when that zone swaps sides — never mirrored to right-align.

### Title Transition

Slide-up masking: old title exits upward inside a mask, new title enters upward from below the mask, with a brief overlap (new title begins entering before old title fully exits) — not strict sequential. Lines stagger very subtly if multi-line. No opacity-only swap, no generic "text slider" translate.

### Description Reveal

Scrubbed, scroll-tied reveal in word/small-phrase chunks (2–3 words), not per-character (avoids a cheesy typewriter feel) and not the whole sentence at once (avoids generic fade). Begins **after** the title has settled — title establishes first, description follows. Each chunk enters with a small vertical shift + opacity ramp. Fully reversible on scroll-up (chunks disappear in reverse order, tied to scroll position, not a timer).

### Media Transition

Mask reveal + crop shift (not simple slide/cross-fade), brief overlap between outgoing/incoming media, side-swap synchronized with title transition, direction may echo the alternating side. This combination is what keeps it from feeling like a slideshow.

### The Signal — Editorial Spine (calibrated project index)

> **Calibrated Project Index / Editorial Spine — not a generic progress bar.**

Language: thin structural rail + active point + project numeral + controlled segment progression (10 discrete segments, not a continuous fill). **Avoid**: generic percentage fill bars, browser-scrollbar appearance, an overly prominent progress UI. Placement persistent at one edge, vertical orientation (top-to-bottom = project 01→10). Role: orientation, state, continuity — an editorial spine, not a UI control.

Transition to Trusted by Brand: rail reaches its completed 10/10 state, then transitions into a **quieter proof-state language** (exact transformation defined in Trusted by Brand's own spec below) — a quiet handoff, not a hard cut.

### Color

Slate Navy environment, off-white typography, Cobalt/Cyan as active-project-state language, **Yellow not required — Selected Work may use no Yellow at all** (no default assignment to any specific project; avoids an arbitrary decision before real content exists).

### Scroll Depth

Baseline: **~6.5–8 viewport** total for all 10 projects. Hard guardrail: **~9 viewport maximum**, unless later prototype testing proves more distance is genuinely necessary. Duration per project is **not uniform** — Standard Exchange progresses faster; Slower Showcase and pattern-break moments get more dwell.

### Responsive

Desktop: full rhythm vocabulary. Tablet: pin retained but complexity reduced. **Mobile (locked)**: **media above, typography below** for **all** 10 project entries — no alternating top/bottom reading order at mobile. Mobile variation instead comes from media crop/height, typography scale, spacing, metadata placement, Signal behavior, and occasional controlled emphasis (a simplified echo of the rhythm vocabulary). Reading order stays predictable.

### Reduced Motion

No long pin if necessary; simplified title/description reveal (no slide-up mask, no scrubbed word reveal — simple clean reveal instead); media without crop-shift/mask complexity, no WebGL; Signal index/rail stays visible (for progress context "01/10") but without dynamic transfer animation.

---

## 4. TRUSTED BY BRAND

**Status**: Locked existing structure — theme integration only, no redesign. **Intensity**: Quiet. **Theme**: Light (Surface Neutral).

### Mental Model

> **Quiet Proof After Heavy Execution.**

### Experience Goal

PASTI has already demonstrated its work through Selected Work; this section does not need to persuade aggressively. It simply shows: proof exists.

### Environment — Light Reset (locked)

Default base: **Surface Neutral `#F8FAFC`**, Pure White used selectively. This is the **first major visual exhale** of the homepage: `Hero (Dark) → What We Build (Dark) → Selected Work (Dark) → Trusted by Brand (Light Reset)`. Typography: Slate Navy. Cobalt/Cyan: micro accent only. PASTI Yellow: not required in this section.

### Existing Marquee — Locked Structure

The existing marquee system is **preserved entirely, not redesigned**: centered heading, horizontal infinite logo marquee, duplicated track for seamless loop, edge mask (fade at track ends), focal-zone emphasis (logos passing viewport center read sharper/larger), hover-pause, dim-others interaction, existing logo order.

**Focal-zone mechanism is locked; exact scale/opacity numeric values are not sacred** and may be calibrated later. The desired feeling: **subtle emphasis, not logo pop-out** — no dramatic scale introduced. Final numeric values belong to Design System/prototyping refinement, not a redesign of the mechanism itself.

### Partner Logo Respect

No PASTI brand styling applied directly onto partner logos: no Cobalt/Cyan/Yellow tint, no glow, no branded borders, no decorative frame, no distortion. Partner logos retain their own identity — PASTI's color language lives around them, not on them.

### The Signal — Quiet Proof Marker

**Not** attached to moving/focal logos. Locked behavior: **Quiet Proof Marker.**

```
Selected Work editorial spine completes
  → active rail resolves/collapses
    → one restrained Cobalt marker remains
      → marker settles near the Trusted heading composition
        → single subtle activation
          → static/quiet state
```

No progress behavior, no logo tracking, no repeated pulsing, no rail, no numeral. Signal here is nearly punctuation.

### Motion Intensity

Existing heading masked reveal, restrained marquee movement, focal-zone response, hover pause/dim, one-time Signal proof cue, subtle entry/exit integration. No cinematic choreography, no pin, no WebGL, no additional animated layers.

### Not Allowed

Redesign of logo arrangement or client sequence, conversion to card system, added horizontal scroll (beyond the existing marquee mechanism), pinning, WebGL, large motion choreography, giant typography takeover, carousel, over-animated logo wall, glow/glass/AI-style effects.

### Responsive & Reduced Motion

Mobile may retain horizontal marquee if performance/readability remain good. Reduced motion: no auto-moving marquee, static/wrapped logo presentation acceptable, no repeated Signal animation, hierarchy and logo readability maintained.

---

## 5. TESTIMONI

**Status**: Total rework. **Intensity**: Medium. **Theme**: Dark.

### Mental Model

> **Social Proof with Controlled Human Energy.**
> **One Visual Anchor, Not One Superior Testimonial.**
> **Focus Indicator, Not Follower** (Signal).

### Experience Goal

Trusted by Brand says: "Proof exists." Testimoni says: "People experienced the quality." It must never become emotional marketing theater.

### Environment & Tonal Handoff

Testimoni is a **dark Slate Navy section**, returning from Trusted's light reset via a **controlled tonal handoff**, not an instant cut:

```
Surface Neutral (Trusted)
  → muted slate / dark transitional band
    → full Slate Navy Testimoni environment
```

Intensity feels like it is gradually returning from Quiet → Medium. No dramatic wipe, no cinematic transition required.

### Card Count & Hierarchy (locked baseline)

**6 cards**: 1 Featured + 3 Medium + 2 Compact. This is a composition baseline, not a hard content limit — the component must remain scalable.

- **Featured**: visual anchor, **not** "the most important testimonial." Not dramatically oversized — avoid mega quote typography, hero-card treatment, or any implication other testimonials are less credible.
- **Medium** (3): uniform sizing, moderate quote length, full role/company.
- **Compact** (2): **does not mean incomplete credibility** — still carries quote, name, role, company. May reduce quote length, spacing, typography scale, and optional secondary metadata — never role/company by default.

**No avatar baseline.** This preserves the editorial/enterprise character. Client photography may be introduced later only if real portrait assets exist, quality is high, treatment is consistent, and it genuinely improves credibility — no generic circular profile picture or LinkedIn-style avatar treatment.

### Composition — Zig-Zag Field

2 vertical-offset bands (not full masonry), moderate offset amplitude, featured card as an anchor with medium/compact filling around it, all cards still aligned to the 12-column grid despite vertical offset (**Precise Misalignment**, not Pinterest-style randomness). Negative space is significant between cards.

### Magnetic Hover (locked values)

- Active card: opacity 100%, lift ~6–10px max.
- Surrounding cards: opacity ~35–50%.
- **No tilt, no glow, no scale jump, no card repositioning.**

### Idle Motion (locked — static default)

**Default card state: static. No idle floating.** If any breathing behavior is later prototyped, it must be nearly imperceptible and limited to the Featured card only. The section feels alive through hover, focus, scroll progression, and exit choreography — not continuous floating.

### The Signal — Focus Indicator, Not Follower

**Not** a physical tracker that jumps to and attaches itself to every hovered card. Preferred behavior:

- Signal remains a **restrained anchor** near the perimeter/structural edge of the field.
- Active/focused card changes Signal's **state**, not its position across the field.
- Signal may shift subtly along its own local axis or align toward the active card — it does **not** behave like a second cursor and does not travel long distances card-to-card.

Mental model: **Focus Indicator, Not Follower.**

### Exit Choreography

```
zig-zag
  → cards align to shared baseline
    → opacity normalizes
      → field becomes visually ordered
        → restrained group move upward
          → Platforms enters
```

The final upward movement must feel like an **ORDERED HANDOFF**, not cards being swept away — restrained, coordinated speed/easing, uniform across cards.

### Scroll Depth

Baseline: **~1.4–1.7 viewport** total. No pin — normal scroll.

### Responsive & Reduced Motion

Mobile: vertical stack, predictable reading order, **no horizontal zig-zag recreation**, **no dim-others hover behavior**, hierarchy from scale/spacing (not interaction), no avatar/media required, Signal reduced to a restrained static/focus cue. Reduced motion: static premium composition, simple reveal, no lift, no long choreography.

---

## 6. PLATFORMS

**Status**: Total rework. **Intensity**: Heavy Signature. **Theme**: Dark.

### Mental Model

> **Two Product Worlds, Not Two Product Cards.**
> **OPEN: Expansive Precision. e-CORPORATE: Structured Precision.**

### Experience Goal

Same PASTI universe, different spatial character.

### Platform Count (locked)

Exactly **2**: **OPEN** and **e-CORPORATE**. No third dummy product.

### Handoff from Testimoni

Momentum from Testimoni's ordered upward exit continues into Platforms' establish. Intensity rises Medium → Heavy. Signal transforms from Testimoni's restrained focus anchor into Platforms' active product transfer system. **Freshness from dark-to-dark must come from scale change, spatial takeover, product fragment size, stronger negative-space architecture, and the shift from normal scroll to controlled horizontal world movement — not from a new color, glow, gradient, or futuristic lighting treatment.**

### Product Worlds — Core System

Each platform is a **spatial environment**, not a card, browser window, dashboard screenshot, or generic product showcase — **the world is the composition itself.** Even though implementation may use a panel wrapper, the visual result must **not** read as a large rounded product card being horizontally translated. Avoid: giant container outline, giant rounded rectangle, floating panel shadow, SaaS card treatment.

**Shared vocabulary (persistent across both worlds)**: Slate Navy environment, same typography system, same Signal language, same 12-column grid, same motion physics (easing family), same brand palette, same "no browser chrome" principle.

**What differs between worlds**: density, crop, spacing, UI layering, pacing, media scale, composition weight — **not** the underlying system. Differences come from *how* the same system is used, not from a different system per world.

### Product Fragment Guardrail (locked)

- **OPEN**: 1 Primary fragment + optional 1 Secondary fragment.
- **e-CORPORATE**: 1 Primary fragment + **maximum 2** Secondary fragments.

Micro metadata/structural labels may exist but must not become additional screenshot cards. Density difference between worlds must come from spacing, alignment, hierarchy, and layering — **not** from filling the viewport with more screenshots.

### Section Label

"Platforms" label: **persistent during the entire pin**, but extremely understated — metadata scale, low visual contrast, aligned to a stable 12-column key line, **static** (does not participate in horizontal world motion). Role: orientation, not visual emphasis.

### OPEN — World Character

Expansive, breathable, spatially generous — but still engineered, enterprise-credible, premium, precise. Asymmetric-but-open composition, one dominant large fragment (not many small ones), generous negative space, smooth/slower internal motion pacing, restrained but roomy Cobalt/Cyan usage.

### e-CORPORATE — World Character

Tighter, structured, system-oriented, more controlled — without becoming a fake admin dashboard, a cyberpunk control room, or a generic enterprise SaaS. Grid-tight composition, multiple smaller/medium fragments arranged with precise alignment, higher density, tighter spacing, faster/more precise internal motion pacing, Cobalt/Cyan used more structurally (more edge rules/borders).

### UI/Product Fragment System

Aggressive, disciplined crop (never a full-screen capture); large for OPEN's single dominant fragment, medium-multiple for e-CORPORATE; always partial/edge-bled (never a complete framed screenshot); grid-structured framing; optional layering/occlusion for depth. **No browser chrome, no laptop mockup, no floating phone stack, no "dashboard cards in 3D space" cliché** — fragments read as real product proof, not decorative screenshot collage.

### Depth & WebGL

CSS/GSAP depth first. 4–8px restrained parallax across 2–3 layers max per world, tied to horizontal scroll progress (not idle). Perspective/3D CSS transforms not needed — depth from scale/crop/occlusion/parallax rate. **WebGL not required by default** and must **not** be added merely because this is a Heavy Signature section — only introduced later if real product content genuinely benefits from it.

### Horizontal Transition & Transition Hierarchy (locked)

```
OPEN active → e-CORPORATE begins entering before OPEN fully exits
  → visual emphasis transfers → e-CORPORATE becomes active → final settle
```

Significant overlap (e-CORPORATE begins entering while OPEN is still ~70–80% visible), movement right→left, mask-based title exit/entry (not opacity-only), crop-shift media transitions on both sides.

**Primary transition hierarchy (locked, not all effects equally visible)**:

1. Horizontal spatial transfer (most dominant, perceived first).
2. Crop / reframe behavior (strong secondary).
3. Signal state transfer (functional marker).
4. Opacity and depth — **supporting effects only**, never headline elements of the transition.

The user should perceive **"World A gives way to World B"** — not "multiple animations happening at once."

### The Signal — Horizontal State-Transfer System

Not a toggle, not a progress bar, not a clickable control.

```
short structural route → two state anchors → one active point
  → transfer movement ONLY during world handoff
```

Optional very small `01 / 02` numeral. Static at each state anchor except during active transition. Placement fixed (does not move with the world), horizontal orientation. Cobalt as primary state color, Cyan very selective during the transition moment only.

**Different from Selected Work's editorial spine**: this is binary (2 states, not 10), horizontal (not vertical), focused entirely on the handoff moment (not a long-running progress track).

### Typography

Platform name (OPEN / e-CORPORATE) is an **oversized visual mass** — the most dominant typographic element per world, tight line-height, negative tracking, may bleed/crop at composition edges. Short descriptor, metadata, text-led CTA follow the standard scale hierarchy. OPEN's alignment is looser/more asymmetric; e-CORPORATE's is tighter to the grid — a subtle difference reflecting each world's character without changing the underlying typography system.

### Dwell & Scroll Depth (locked)

Baseline: **~2.8–3.5 viewport** total. Hard guardrail: **~4 viewport maximum**, unless later prototype testing proves more distance is genuinely necessary. Conceptual (not rigid) dwell distribution: OPEN establish ~35% · transfer ~25–30% · e-CORPORATE establish/final ~35–40%. Neither product is secondary by default; exact ratio may be calibrated later using real assets.

### Color

Slate Navy base for both worlds, with a small tonal difference (OPEN slightly lighter/roomier in value, e-CORPORATE slightly deeper/denser) — still the same navy family, not different colors. Off-white typography, Cobalt as the Signal/interaction language, Cyan very selective, Yellow not default (only if a genuinely justified signature moment arises later). No gradient world, no neon, no glassmorphism.

### Responsive

Desktop: full pinned horizontal experience. Tablet: reduced depth/parallax complexity, shorter overlap. **Mobile (locked)**: **no pinned horizontal experience.** Vertical stack — OPEN → e-CORPORATE — via natural scroll. Oversized platform typography retained, product proof remains prominent, Signal becomes a simplified/static state cue (e.g. small "01/02").

### Reduced Motion

Static premium compositions, no long pin, no parallax, no complex overlap transfer, simplified state indicator.

---

## 7. INSIGHT

**Status**: Total rework. **Intensity**: Medium. **Theme**: Light (Surface Neutral).

### Mental Model

> **Editorial Intelligence in Motion, Not a Horizontal Blog Carousel.**
> **Product Immersion → Editorial Clarity.**

### Experience Goal

Insight feels like PASTI has stopped showing what it builds and started showing how it thinks.

### Environment (locked — light, intentional contrast to Platforms)

**Light editorial interruption.** Default Surface Neutral `#F8FAFC`, Pure White used selectively. Slate Navy remains primary typography color. Cobalt is the main interaction/Signal accent. Cyan extremely restrained, respecting the existing contrast rule. PASTI Yellow not required by default.

This is intentional: Platforms (dark, immersive, product-world) is directly followed by a light reset — reinforcing the narrative shift from *product immersion* to *editorial clarity*. Do not revert Insight to dark unless explicitly instructed.

### Content Architecture (locked)

Exactly **4 article states**: 1 Featured + 3 Supporting.

- **Featured** = **Digital Editorial Feature** (not a literal "magazine cover" — magazine-level hierarchy and composition, but native to a premium technology-agency website, not a print-editorial trope).
- **Supporting (3)**: relatively **close** in visual weight — image ratios may vary, but only **one** supporting item may be slightly more dominant, and **no** supporting item may become a "second Featured." Variation comes from image ratio, crop, typography wrapping, spacing — not extreme size difference. Avoid editorial-collage chaos.

### Entrance (locked sequence)

```
normal vertical entry
  → heading mask reveal
    → Featured establishes
      → Supporting articles stagger into composition
        → composition settles
          → Sticky Editorial Canvas begins
```

Horizontal movement must **not** begin immediately on section entry.

### Sticky Editorial Canvas (locked mental model — not "another Heavy pinned section")

```
editorial composition establishes → canvas holds
  → article field progresses → canvas releases
    → normal vertical scroll resumes
```

Implementation may later use ScrollTrigger/sticky mechanics, but the experience must **not** feel like "Platforms ends → another pin immediately starts." The hold must feel lighter, shorter, flatter, more readable than Platforms.

### Heading Behavior During Horizontal Phase (locked)

The large Insight heading establishes during entrance. Once the Sticky Editorial Canvas begins, its prominence **must decrease** — it may remain partially visible, settle into a smaller anchor state, or move into a quieter compositional role. It must **not** permanently occupy major viewport space throughout the entire horizontal progression. The small section label may remain persistent.

### Transition Grammar — Editorial Page Progression (vs. Platforms' Spatial World Transfer)

| | Platforms | Insight |
|---|---|---|
| Transition grammar | Spatial World Transfer | **Editorial Page Progression** |

Primary Insight behavior: editorial shift, crop/reframe, title emphasis, reading-state update. **Avoid**: large world overlap, heavy depth, product-style parallax, dramatic spatial takeover, carousel-slide behavior. Insight stays flatter, quieter, more readable than Platforms even though both use horizontal mechanics.

### The Signal — Reading State Marker (locked, narrow scope)

**Not** a category selector/taxonomy widget. Category stays inside article metadata — never duplicated into the Signal system.

Allowed: restrained marker, short structural cue, optional tiny `01/04`. Signal communicates **which editorial state is active** — not "which category is selected." Signal does not: duplicate category labels, become category navigation, become a progress bar, become a carousel indicator.

### Active/Inactive Article Emphasis (locked values — different from Testimoni)

- Active: 100%.
- Inactive visible articles: **~75–85%** (do not dim aggressively — users must still be able to scan surrounding article titles). This is deliberately lighter dimming than Testimoni's 35–50%, because content here needs to stay scannable, not merely decorative.

### Media

Editorial imagery only: natural photography, illustration, editorial crops, restrained crop/reframe state. **No** device mockups, UI fragments, product-world composition, WebGL, heavy 3D, or meaningful parallax depth by default.

### Typography

Section heading (large, editorial, mask reveal) · article title (Featured larger, Supporting smaller) · category (metadata scale, not a colored pill) · date/metadata · excerpt (body-large, generous line-height — readability is the priority here more than in any other section) · text-led CTA. Max line length tightly constrained for excerpts.

### Scroll Depth (locked)

Baseline: **~2.2–2.8 viewport** total. Hard guardrail: **~3.2 viewport maximum**. Conceptual distribution: vertical entrance ~0.8–1.0 viewport · sticky editorial progression ~1.2–1.6 viewport · final resolve, short remaining handoff.

### Color

Surface Neutral default, Pure White selective, Slate Navy typography, Cobalt for Signal/CTA emphasis, Cyan very selective with the hard contrast rule fully enforced, Yellow not default. No blog-card shadow, no glass, no gradient blob, no colorful category-pill system.

### Responsive & Reduced Motion

**Mobile (locked)**: vertical editorial feed — Featured → Supporting → Supporting → Supporting. No horizontal pin, no sideways swipe requirement, no carousel behavior. Reading comfort takes priority. Reduced motion: no horizontal choreography, no long sticky hold, simplified reveal, static reading-state cue, static premium editorial hierarchy, full content readability.

---

## 8. PAQ / FAQ

**Status**: Locked existing structure — theme integration + motion calibration only, no redesign. **Intensity**: Quiet. **Theme**: Dark (Slate Navy).

### Mental Model

> **Quiet Precision.**

### Experience Goal

Insight says: "Here is how PASTI thinks." PAQ/FAQ says: "Here are the answers, clearly." No spectacle, no ambient decoration, no new visual system — clarity itself is the premium behavior here.

### Environment (locked)

Dark Slate Navy. Rhythm: `Insight (Light) → PAQ/FAQ (Dark) → Footer (Dark)` — PAQ + Footer form **one composed closing movement**. Transition from Insight is a controlled tonal return from Surface Neutral into Slate Navy — no dramatic wipe required.

### Existing Structure — Preserved

Section heading, single-column accordion list, question, answer, plus/minus indicator, divider, left accent bar, native `<details>`/`<summary>` behavior. **Do not redesign the structure.**

**Allowed**: spacing calibration, typography calibration, border treatment, indicator refinement, motion timing refinement, theme integration.
**Not allowed**: redesign into large cards, multi-column fancy layout, tabs, horizontal FAQ, chat-bubble UI, floating question cards, decorative icons beyond the existing minimal set.

### Remove Legacy Decoration (locked)

The existing large glow blobs and continuous drifting background decoration must be **removed completely** — not recolored, not shrunk and retained, not replaced with another ambient effect. Quiet Precision does not use ambient decoration; the environment's quality comes from typography, spacing, dividers, contrast, and state clarity instead.

### Yellow (locked — removed)

Yellow is **not used by default** in this section. Removed from: hover state, accent bar, corner accent, glow, interaction state. Primary interaction accent: **Cobalt.**

### The Signal — Active Accordion Cue

**No new dot, numeral, rail, or separate Signal component.** The Signal is represented by the **existing left accent bar** — this is the cleanest expression of Signal in the whole homepage because it reuses an existing functional element rather than adding decoration.

- **Closed**: quiet / inactive.
- **Hover / focus-visible**: restrained Cobalt activation.
- **Open**: clear but restrained active Cobalt state.

### Index Numbers

Existing `01–07` data indices remain **hidden** if not currently visible in the UI. Do not expose them purely to create another Signal device.

### Heading Motion (reduced)

```
section enters → restrained mask/simple reveal → heading settles → remains stable
```

Continuous scroll-scrubbed scale/tracking behavior is **not preserved** — PAQ is a Quiet section. Super Editorial scale may remain visually, but motion must be quiet (no continued scale choreography, no tracking animation throughout scroll).

### Divider Reveal

Existing structural divider reveal (scale-in) may remain, but must stay restrained — the user should perceive **Precision Framing**, not "seven decorative line animations." No theatrical stagger, no long cascade.

### Interaction Timing & State Coordination (locked)

Hover/focus: ~120–150ms. Open/close: ~200–300ms. Height reveal, answer appearance, indicator rotation, and accent-bar state must resolve **within the same overall interaction window** — avoid staged behavior (container opens → answer appears → indicator rotates → accent appears). It should read as **one state change.**

### Open/Closed Visual Language (locked)

- **Closed**: full question readability, thin divider, quiet indicator, no dimming.
- **Hover/Focus**: restrained Cobalt accent bar, subtle typography contrast shift, no scale.
- **Open**: Cobalt accent bar active, plus resolves to minus, answer reveals cleanly, question remains visually stable, no dramatic weight/size change.

### Accessibility

Native `<details>`/`<summary>` semantics preserved. Maintain keyboard operability, focus-visible parity, generous hit area, touch usability, readable answer line length. Do not replace native behavior with a custom div-based implementation unless a strong technical reason emerges later.

### Reduced Motion

Immediate/near-immediate open/close state, no divider animation, no heading choreography, no unnecessary indicator animation, static Cobalt active state, full accessibility.

---

## 9. FOOTER

**Status**: Locked existing structure — theme integration + Signal resolution only, no redesign. **Intensity**: Quiet. **Theme**: Dark (Slate Navy).

### Mental Model

> **Confident Closure.**

### Experience Goal

Not final CTA. Not brand spectacle. Not one more Hero. The website ends with: Identity. Orientation. Contact. Resolution. The Footer does not sell — it closes.

### Environment (locked)

Dark, continuing the PAQ/FAQ closing movement. **Do not separate Footer from PAQ using a major color shift** — differentiate through structural divider, spacing reset, composition change (single-column accordion → 3-column information grid), density change, and final Signal resolution instead.

### Existing Structure — Preserved

PASTI logo + direct email contact, Navigate links, Platforms links, bottom legal row, current information hierarchy and content order. **Do not redesign from zero.**

### No Ambient Glow (locked — no exception)

All glow/blur ambient decoration is removed completely — **no exception for low-opacity glow.** Not recolored, not reduced further, not replaced with another ambient effect. Footer quality comes from grid, spacing, typography, contrast, separator, microinteraction, and Signal resolution.

### Yellow (locked — removed, including product-link dots)

Yellow is not used by default. The existing Yellow product-link dot indicators (next to OPEN/e-CORPORATE) become **Cobalt** — platform ownership is not, by itself, sufficient justification for a Yellow signature moment. No Yellow signature moment is introduced in Footer unless explicitly approved later.

### Contact Moment (locked)

Existing email-based contact action is kept as-is. **No** new closing headline, conversion banner, giant CTA, marketing slogan ("Let's build something amazing"), or newsletter module. The homepage has already proven capability — Footer simply provides the next step; the user chooses whether to take it.

### The Signal — Final Resolved State (locked)

> **The Signal finishes active. It resolves structural.**

Across the homepage, Signal has acted as an active state/progress/transfer language. In Footer, its job is complete — its final state deliberately **loses** the active interaction color and becomes quiet structural framing.

- **Color**: **neutral/slate**, not Cobalt. Not an "active" color — a structural one.
- **Behavior**: one-shot, then completely static. No loop, no ambient motion, no pulse after completion.
- **Never**: glowing endpoint, active Cobalt pulse, Yellow terminal point, repeating animation.

The final Signal should feel **complete**, not waiting for another state.

### Corner-Line Convergence (locked, geometry reinterpreted)

The existing one-shot corner-line convergence concept is preserved, but its geometry must respect the Footer's actual 12-column composition — **not** a literal four-lines-to-the-mathematical-center effect.

```
Footer enters → structural boundary establishes
  → corner-line convergence performs ONCE
    → line system settles → becomes completely static
```

Mental model: **Frame → Resolve → Lock the Composition** — not "point to the center." Exact geometry (line length, which grid line each corner references) is calibrated later in Design System/prototyping; the principle above is what's locked now.

### Logo

Remains the largest visual mass because that is already part of the existing structure — its scale is **not increased** merely to create a "premium" closing moment or drama. Footer must not become a brand takeover; existing scale may be calibrated later if necessary, but restraint is the rule.

### Link Microinteraction (locked, calibrated from existing 400ms)

Quiet intensity baseline: **~150ms.** Allowed: small horizontal shift, arrow reveal, Cobalt color state, focus-visible equivalent. Avoid: slow 400ms hover, large translation, glow, multiple simultaneous interaction tricks stacked together — keep one clear interaction grammar.

### Final Static State

After all one-shot motion resolves, Footer must be fully calm:

- PASTI logo + direct email contact
- Navigate links
- Platforms links
- bottom legal row
- restrained neutral/slate structural corner-line frame
- zero ambient movement

The website must feel fully complete even if the user remains at the bottom indefinitely.

### Responsive & Reduced Motion

Preserve existing responsive hierarchy; mobile keeps the existing stacked structure. Reduced motion: no staged reveal required, no convergence animation, Signal immediately appears in its final structural state, links remain fully usable, static premium composition remains intact.
