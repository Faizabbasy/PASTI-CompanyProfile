# PASTI — Reference Direction Checkpoint

**Status:** Supporting implementation/reference document. Frozen as of the date below.
**Authority:** This document does NOT outrank the creative precedence chain. It exists to freeze exactly how external visual references may be used, nothing more.

**Precedence (unchanged, restated for clarity):**

```
Brand Guide
  → Design Direction
    → Design System
      → Homepage Spec
        → Design Tokens
          → Approved Implementation Plan (08-implementation-plan.md)
            → This document (09) — reference-use rules only
              → Code
```

If any reference in this document conflicts with any frozen document above it, **the frozen document wins.** This file only narrows *how* a reference may inform implementation — it never introduces new design decisions, never overrides a locked mechanic, and never expands scope beyond what `04-homepage-spec.md` already locks per section.

---

## CORE IMPLEMENTATION PRINCIPLE (restated prominently, per instruction)

> If a coding convenience, existing component structure, reusable utility, legacy implementation, or external visual reference conflicts with the frozen design direction, discard the convenience/reference — preserve the frozen design direction. Do not reinterpret the design to fit the code or the reference.

This is the same guardrail already governing Milestone 3 (`08-implementation-plan.md`), extended explicitly to cover external references. A reference is never grounds to loosen, reinterpret, or "improve on" a locked spec.

---

## REFERENCE LIMITATION (read before using any reference below)

URLs are **behavioral references, not pixel specifications.** They communicate a *feeling* (pacing quality, smoothness, restraint) — never exact timing, geometry, or animation curves to copy.

- If exact timing, geometry, or animation behavior cannot be reliably determined from the reference alone: **do not guess.** Fall back to the frozen section specification's own locked values (durations, easing, scroll-depth guardrails, etc. from `03-design-system.md` / `04-homepage-spec.md` / `06-design-tokens.json`).
- If a future implementation genuinely depends on an exact behavior not captured in any frozen document: **STOP and request a recording/screenshot/reference clarification** from the person who supplied the reference. Do not silently approximate the reference into a new, uncoordinated design decision.
- A reference may justify a *behavioral quality* (e.g., "this transition should feel this smooth/precise"). It may never justify borrowing that site's branding, color system, typography, composition, decorative assets, or section architecture.

---

## REFERENCE 1 — madewithgsap.com

**Relevant to:** What We Build · Platforms · secondarily Insight (pacing principles only)

**Allowed inspiration:**
- Curtain reveal behavior (quality of motion, not exact geometry)
- Pinning feel (how "locked in place" a pinned scroll segment should read)
- Scroll-controlled continuity (the sense that scroll position and visual state stay tightly coupled)
- Horizontal movement smoothness
- Timing / pacing quality
- Transition precision

**Do NOT copy:** branding, color system, typography, composition, decorative assets, section architecture, visual identity.

**Section-specific boundaries:**

- **What We Build** — behavioral inspiration for curtain takeover / pinned flow *only*. The section's actual mechanic remains exactly what `04-homepage-spec.md` §2 locks: vertical-axis curtain (Slate Navy, `expo.out`, ~800–1200ms, 2 layers, tonal continuity), pinned stage composition, clean-alphanumeric text decode, typographic cluster break (not particles), staggered capability-card emergence (1 Primary + 2 Medium + 1 Accent). madewithgsap.com may inform how *smooth and continuous* the curtain-to-pin transition feels — it may not inform what the curtain looks like, what breaks apart, or how cards emerge.
- **Platforms** — behavioral inspiration for smooth horizontal world transfer *only*. The section's actual mechanic remains exactly what §6 locks: OPEN/e-CORPORATE as spatial environments (not cards), the locked transition hierarchy (spatial transfer → crop/reframe → Signal state-transfer → opacity/depth as supporting only), fragment guardrails, binary horizontal Signal. The reference may inform pacing/overlap smoothness — it may not inform product-fragment framing, world character, or Signal shape.
- **Insight** — may borrow smoothness/pacing principles for the Sticky Editorial Canvas's scrub feel *only*. Insight **must remain** Editorial Page Progression (§7) — flatter, quieter, more readable than Platforms — and must **never** become another Heavy horizontal product/pin experience. If any madewithgsap.com pattern reads as "another Platforms," it is out of bounds for Insight by definition, regardless of how well it executes.

---

## REFERENCE 2 — wembi.ai

**Relevant to:** Selected Work

**Allowed inspiration:**
- Precision of text/media exchange (how tightly a title-swap and a media-swap can stay synchronized)
- Pinned split-screen discipline (compositional restraint within a pinned split layout)
- Clean mask-transition feeling
- Controlled typography/media timing
- Polished scroll choreography

**Do NOT copy:** brand identity, exact page composition, exact typography, exact transitions, visual assets, colors, layout proportions blindly.

**Selected Work remains governed entirely by `04-homepage-spec.md` §3's locked Pinned Project Exchange architecture:**
- 10 project states (data-driven, scalable beyond 10)
- Alternating split-screen (odd: media-left/type-right, even: type-left/media-right), unbroken across all 10
- Persistent, non-alternating editorial-spine Signal (10 discrete segments, vertical orientation)
- 7-treatment rhythm vocabulary (Standard/Media-Dominant/Typography-Dominant/Temporary-Full-Bleed/Accelerated/Slower-Showcase/Closing)
- Vertical/axis-consistent media-mask grammar as the default grammar
- Slide-up masked title transitions with brief overlap
- Scrubbed word/phrase-chunk description reveal
- Fully reversible behavior on scroll-up
- Temporary Full-Bleed Takeover only as a rhythm-break moment that resolves back into the resting split-screen — never a permanent layout replacement

wembi.ai's reference behavior must bend to this architecture — the reverse is never acceptable. If wembi.ai's actual mechanic (e.g. its specific split ratio, its specific mask direction, its specific pacing) conflicts with any locked item above, the locked item wins outright; the reference is discarded for that specific behavior, not blended with it.

---

## REFERENCE 3 — produx.design

**Relevant to:** Testimoni

**Allowed inspiration:**
- Non-rigid relationship between cards (a *sense* of considered, human arrangement rather than a rigid corporate grid)
- Controlled human energy
- Interaction polish
- Composition that reads as less rigid than a plain corporate testimonial grid

**Do NOT copy or introduce:** magnetic free-floating card behavior, masonry, random scatter, card-following Signal, idle movement, excessive tilt, glow, carousel behavior.

**Frozen Testimoni direction always wins (`04-homepage-spec.md` §5):**
- Static by default (no idle float/breathing/drift)
- Structured 2-band zig-zag field, limited/deliberate offsets — not masonry, not scatter
- No pin
- 1 Featured / 3 Medium / 2 Compact (locked 6-card baseline)
- Structural Focus Indicator Signal (state-only, never follows/travels)
- Ordered Handoff exit (offsets resolve to a shared baseline → dimming normalizes → opacity neutral → field reads ordered → THEN the restrained group move)

If produx.design's actual implementation uses magnetic hover-follow, masonry, or a cursor-tracking accent — none of that transfers. Only the *feeling* of "not corporate-rigid" is portable, and only insofar as it's already expressible within the locked static/structured field above.

---

## GOVERNANCE NOTE

This document is discoverable from `01-project-overview.md`'s source-of-truth read order (see that document's index) as the current reference-use checkpoint, added below `08-implementation-plan.md` in the reading order — it does not replace or renumber any of `00`–`08`. No content in `00`–`08` was altered to produce this file.

Any new external reference introduced after this checkpoint should be added as its own numbered subsection here (Reference 4, 5, …) following the same allowed/disallowed/section-boundary structure — not folded loosely into implementation comments or invented ad hoc mid-section.
