from pathlib import Path

content = r"""# PASTI Homepage — Ultra-Premium Motion & Interaction Context

## Purpose

This document is the persistent project context for Claude Code.

Claude should read this file before making any motion, visual, interaction, or homepage refinement changes.

The goal is **NOT** to rebuild the website from scratch.

The goal is to perform a **targeted ultra-premium upgrade pass** on the existing homepage, preserving all current structure, content, layout, and brand colors while improving motion quality, ambient depth, interaction polish, and overall cohesion to an Awwwards-level standard.

---

# 1. Current Project Context

## Stack

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- GSAP
- Three.js
- Existing custom cursor system
- Existing magnetic hover system
- Existing Hero 3D scene
- Existing masked text reveal system
- Existing section transitions / curtain transitions
- Existing scroll-based interactions / accordions

Do **not** migrate the project to React, Next.js, or another framework.

Use the current Nuxt/Vue architecture.

---

# 2. Main Goal

Treat the current website as an already-finished architectural structure.

Do not move the walls.

Do not repaint the building.

Do not rewrite the content.

Enhance it with:

- ambient lighting
- subtle material depth
- refined motion choreography
- tactile cursor response
- motion physics
- architectural micro-details
- selective telemetry / technical UI accents
- premium reveal systems
- restrained scroll responsiveness
- high-end interaction polish

The final result should feel like:

> a digitally engineered environment

not:

> a normal website with many animation effects.

---

# 3. Scope Intent

## Chosen approach: Targeted Upgrade Pass

Do NOT perform a full systemic overhaul.

The current homepage already contains substantial motion infrastructure.

Audit what exists first and identify only the highest-leverage gaps.

Prioritize:

- one or two signature ambient moments
- easing/timing refinement
- motion cohesion
- Hero polish
- section transition polish
- micro-interactions that still feel generic
- missing high-value motion moments

Do not add effects everywhere.

More effects does NOT automatically mean a better website.

---

# 4. Non-Negotiable Constraints

## 4.1 Zero Layout Alteration

Do NOT modify:

- section order
- wireframe hierarchy
- grid structure
- container dimensions
- existing content layout
- section spacing
- main alignment logic
- HTML text content
- route structure

Enhancements must be additive and non-invasive.

Prefer:

- absolute overlays
- pseudo-elements
- canvas / WebGL overlays
- transforms
- opacity
- clip-path
- masks
- interaction-only layers

Avoid any implementation that changes document flow.

---

## 4.2 Zero Content Alteration

Do NOT rewrite:

- headings
- body text
- CTA labels
- project names
- client names
- metrics
- testimonials
- navigation labels

Do not invent:

- new copy
- fake metrics
- fake projects
- fake clients
- fake awards
- fake testimonials
- fake telemetry claims

---

## 4.3 Strict Color Integrity

Use the current project color system as the single source of truth.

Do NOT:

- replace base colors
- introduce a new palette
- overwrite Tailwind theme values
- hardcode unrelated colors
- recolor the website to match another reference

All decorative effects must derive from existing brand tokens.

Decorative overlay opacity should usually remain around:

- 0.05
- 0.08
- 0.10
- 0.12
- maximum ~0.15 in most cases

The page must never look recolored after the enhancement pass.

---

# 5. Visual Quality Bar

Target:

- editorial
- art-directed
- cinematic
- precise
- restrained
- premium
- technically sophisticated
- tactile
- cohesive
- bespoke
- high-end

Avoid:

- generic SaaS aesthetics
- generic agency layouts
- Framer-template feel
- excessive rounded cards
- floating glassmorphism
- neon cyberpunk
- particle fields
- random gradient blobs
- stock Three.js demos
- decorative motion with no purpose
- repetitive fade-up animation
- AI-slop visual language

---

# 6. Ambient Lighting System

If the current page needs more depth, add a subtle ambient light-leak layer.

Preferred characteristics:

- cursor-reactive
- WebGL or performant Canvas
- radial but irregular
- soft edge
- slight organic distortion
- very subtle chromatic aberration
- velocity-aware
- heavily damped

The effect must NOT look like a generic cursor spotlight.

Pointer pipeline:

raw pointer
→ normalized pointer
→ damped pointer
→ velocity
→ shader uniforms

Fast movement may slightly influence:

- radius
- directional stretch
- light intensity

But always clamp the effect.

Do not allow chaotic output.

---

# 7. Film Grain / Material Depth

Add subtle tactile depth only where useful.

Possible techniques:

- low-opacity procedural grain
- lightweight shader noise
- SVG filter
- small tiled monochrome noise texture

Target opacity:

~0.015–0.04

Avoid:

- VHS noise
- visible RGB grain
- heavy scratches
- high-frequency full-screen canvas regeneration

The goal is to remove digital flatness, not make the site visibly noisy.

---

# 8. Architectural Micro-Details

Use restrained Swiss/editorial technical accents.

Examples:

- crosshairs
- registration marks
- subtle axis ticks
- corner brackets
- 1px structural line sweeps
- tiny measurement accents

These must:

- live in whitespace
- remain secondary
- use existing brand color tokens
- never affect layout
- stay low-opacity

Avoid turning the site into a cyberpunk HUD.

---

# 9. Telemetry / HUD Rules

Telemetry is optional and must remain extremely subtle.

Potential real runtime data:

- cursor X/Y
- viewport size
- local time
- measured FPS
- performance mode
- active section index

Do not show fake values.

Examples:

X: 042
Y: 891
VIEWPORT 1440×900
LOCAL 15:42:31
SYSTEM: NOMINAL

Telemetry should:

- use small monospace text
- remain peripheral
- never compete with headlines or CTA
- not flood the page

Prefer 1–3 useful telemetry items, not many.

---

# 10. Typography Motion

Do NOT replace the existing font.

Enhance behavior only.

Possible treatments:

- masked GSAP reveal
- split words / lines
- subtle tracking changes
- variable-font axis interpolation if supported
- slight proximity response for selected display text

Do not make typography wobble or distort heavily.

For reveal:

wrapper:
overflow: hidden

child:
translateY(100–110%) → 0

Preferred easing family:

cubic-bezier(0.16, 1, 0.3, 1)

Use centralized motion tokens.

---

# 11. Cursor System

Reuse the existing custom cursor infrastructure.

Do NOT rebuild it unless there is a clear architectural reason.

Possible states:

- default
- link
- media
- magnetic
- action
- drag

Cursor movement should use spring/damping.

Avoid:

- direct mouse-follow
- excessive lag
- jelly behavior
- playful bounce
- large blur blobs everywhere

Contextual labels like:

- EXPLORE
- VIEW
- PREVIEW

should only appear where they improve UX.

---

# 12. Magnetic Interaction

Use only on high-value elements.

Examples:

- primary CTA
- selected navigation actions
- circular controls
- important media triggers

Maximum visual attraction should remain subtle.

Approximate movement:

4–10px maximum, depending on element size.

Do not make buttons chase the cursor.

---

# 13. Scroll Velocity Physics

If scroll velocity is already available through Lenis, reuse it.

Otherwise derive it safely.

Use velocity selectively for:

- tiny image skew
- internal parallax
- ambient shader response
- border energy

Do not connect scroll velocity to everything.

Recommended maximum skew:

~0.5°–2°

Return smoothly to zero when scrolling stops.

---

# 14. Smooth Scroll

If Lenis is already present, reuse the current provider.

Do NOT create multiple Lenis instances.

If Lenis is not installed, do not add it automatically unless it clearly improves the current experience and does not break:

- anchors
- accessibility
- routing
- existing scroll logic

GSAP/ScrollTrigger integration must be centralized.

---

# 15. Media Reveal

Do not resize existing media containers.

Use internal clipping only.

Possible reveal:

clip-path inset(...)
→ full reveal

paired with:

internal media scale 1.03–1.05
→ 1.00

No CLS.

No external container movement.

---

# 16. Scroll Reveal Hierarchy

Avoid using the same fade-up animation everywhere.

Use different reveal categories:

A. masked typography
B. structural line draw
C. media clip reveal
D. subtle telemetry fade
E. ambient shader shift

Each section should use only what serves its composition.

---

# 17. Motion Token System

Centralize:

- durations
- easing
- stagger
- cursor damping
- magnetic strength
- scroll response strength
- parallax strength

Example conceptual groups:

- instant
- fast
- medium
- slow
- editorial
- spring
- exit

Avoid arbitrary numbers scattered across components.

---

# 18. Performance Rules

Target perceived 60fps on capable modern hardware.

Do not promise constant 60fps on all devices.

Avoid:

- per-frame Vue reactive state updates
- repeated DOM measurement
- layout thrashing
- many independent RAF loops
- high-DPR WebGL without limits
- excessive shader complexity

Prefer:

- refs
- GSAP
- mutable animation state
- shader uniforms
- requestAnimationFrame
- IntersectionObserver
- visibility pause
- DPR caps

Pause expensive effects when off-screen.

---

# 19. Responsive Experience Tiers

## Desktop / Fine Pointer

- full cursor
- richer motion
- magnetic interactions
- ambient light response
- richer telemetry if appropriate

## Tablet

- reduced cursor/pointer complexity
- lighter telemetry
- reduced parallax
- simpler ambient motion

## Mobile

- no desktop custom cursor
- no magnetic pointer behavior
- simplified shader
- reduced scroll skew
- lightweight reveal choreography
- static/subtle technical accents

Do not simply shrink desktop behavior.

---

# 20. Reduced Motion

Respect:

prefers-reduced-motion: reduce

When active:

- disable large ambient movement
- disable velocity skew
- disable pointer-driven typography
- reduce parallax
- shorten reveal durations
- ensure content is immediately usable

Motion must never be required to understand content.

---

# 21. Z-Index Discipline

Use a clear layer hierarchy.

Recommended conceptual order:

1. base background
2. ambient visual layer
3. decorative section accents
4. content
5. interactive overlays
6. custom cursor
7. transitions/modals

Do not scatter arbitrary z-index values.

Decorative layers must usually use:

pointer-events: none

---

# 22. Nuxt / Vue Architecture

Adapt to the actual repository.

Potential structure:

app/
  components/
    ambient/
    cursor/
    motion/
  composables/
    motion/
  plugins/
  utils/

Possible composables:

- usePointerPhysics.ts
- usePointerVelocity.ts
- useScrollVelocity.ts
- useMagnetic.ts
- usePerformanceMode.ts
- useViewportTelemetry.ts

Possible components:

- AmbientCanvas.vue
- GrainOverlay.vue
- TelemetryOverlay.vue
- RegistrationMark.vue
- Magnetic.vue
- RevealText.vue
- MediaReveal.vue

Do not create these blindly.

Reuse existing equivalents first.

---

# 23. Vue Performance Rules

Do not use Vue refs/reactive state for high-frequency frame animation unless necessary.

Prefer:

- shallowRef
- non-reactive mutable objects
- GSAP
- raw Three.js state
- shader uniforms
- local RAF state

Use:

onMounted
onUnmounted
onScopeDispose

for lifecycle management.

---

# 24. GSAP Lifecycle

Every GSAP timeline must:

- be component-scoped
- be cleaned up on unmount
- avoid duplicate registration
- kill relevant ScrollTriggers
- remain safe on route changes

Use:

gsap.context()

where appropriate.

---

# 25. Three.js Lifecycle

Every Three.js scene must clearly expose:

- start()
- stop()
- fit()/resize()
- dispose()

Dispose:

- geometry
- materials
- textures
- render targets
- renderer
- listeners
- RAF

Pause when:

- scene outside viewport
- document hidden
- component inactive

Cap DPR.

---

# 26. Anti AI-Slop Checklist

Reject the implementation if it introduces:

- random floating gradients
- glowing neon borders everywhere
- fake terminal UI
- particle fields
- excessive blur
- too many HUD labels
- random rotating 3D objects
- large colored blobs
- generic cursor trails
- gimmicky text scramble
- repeated motion presets

Every effect must have a design purpose.

---

# 27. Mandatory Workflow

Before modifying code:

1. audit current homepage
2. identify existing motion systems
3. identify duplicated systems
4. identify visual gaps
5. identify the highest-leverage improvement opportunities

Then propose a short implementation plan.

Do NOT implement every possible effect from this document.

Choose only the improvements that materially increase quality.

Implementation should happen incrementally.

For each phase:

1. implement
2. run
3. visually inspect
4. check layout integrity
5. check palette integrity
6. check performance
7. correct
8. continue

---

# 28. Final QA

Run repository-equivalent:

- lint
- typecheck
- production build

Check:

- no layout shift introduced
- no color drift
- no horizontal overflow
- no console errors
- no hydration errors
- no duplicate GSAP timelines
- no stale ScrollTriggers
- no canvas leaks
- no duplicate RAF loops
- no cursor on coarse pointer/mobile
- reduced motion works
- navigation/anchors remain functional

Test at approximately:

Desktop:
- 1920×1080
- 1440×900
- 1280×800

Tablet:
- 1024×768
- 768×1024

Mobile:
- 430×932
- 390×844
- 375×812

---

# 29. Definition of Done

The targeted upgrade is successful when:

- existing content remains unchanged
- existing layout remains unchanged
- existing base colors remain unchanged
- no meaningful CLS is introduced
- motion feels more cohesive
- interactions feel more tactile
- ambient depth is improved
- Hero/section transitions feel more premium
- micro-interactions are more intentional
- mobile remains clean
- performance remains strong
- the result does NOT feel like an effect pack layered onto a normal website

Most importantly:

> The experience should feel as if the original website was always designed to behave this way.

---

# 30. Instruction to Claude

When starting a new task:

1. Read this document first.
2. Audit the relevant existing implementation.
3. Reuse existing infrastructure where possible.
4. Do not introduce new systems unless necessary.
5. Keep each task narrowly scoped.
6. Do not proceed to unrelated sections automatically.
7. Report files changed and any performance implications.
8. Stop after the requested scope is complete.

This file is the persistent motion/design context for the project.
"""

path = Path("/mnt/data/PASTI_HOMEPAGE_MOTION_CONTEXT.md")
path.write_text(content, encoding="utf-8")
print(path)
