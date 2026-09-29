# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Nuxt 4 / Vue 3 / TypeScript / Tailwind 3 (`@nuxtjs/tailwindcss`), npm (`package-lock.json`).

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` / `npm run generate` / `npm run preview` — production build, static generate, preview
- `npx vue-tsc --noEmit` — type check (`vue-tsc` is installed; no script wraps it)

There is no test runner and no linter configured. Verify changes by running the dev server and checking the page in a browser (motion, pinning and responsive behavior can't be validated by type checks). `README.md` is the untouched Nuxt starter README.

## Source of truth: `docs/rework-v2/`

This is an in-progress rework of the PASTI agency landing page. The docs drive implementation and are ranked; a lower layer must never silently override a higher one — flag conflicts instead of resolving them in code:

`00-brand-guide` → `02-design-direction` → `03-design-system` → `04-homepage-spec` → `06-design-tokens.json` → existing site (only for Trusted / FAQ / Footer) → external references.

`docs/rework-v2/07-claude-instructions.md` is the operational rulebook (read it before section work); `08-implementation-plan.md` holds milestones and the locked decisions in §17. `docs/legacy/` is the superseded previous iteration — reference only. Comments in the code cite these docs by section number (e.g. "§17", "Milestone 5A"); commit messages follow `Milestone N` naming.

Rules that are easy to violate:
- **Copy**: new copy fields use `Lorem ipsum dolor sit amet`. Don't invent project names, testimonials, metrics, clients, or claims. Locked existing copy: Platforms/OPEN/e-CORPORATE, Trusted, FAQ, Footer.
- **Yellow**: PASTI Yellow's real HEX is `PENDING_MASTER_LOGO_SAMPLE`; the `pastiYellow` Tailwind scale is a placeholder. Yellow is off by default in homepage sections unless the spec explicitly approves it. Cyan must not be readable text on white.
- **Fonts**: Manrope/Inter are interim placeholders, swapped only via the `--font-*` CSS variables in `main.css`. Don't pick final fonts.
- **Motion** ("Controlled Momentum"): only `power3.out` / `power4.out` / `expo.out`; no bounce/elastic/spring/`back.out`. Fade-up must not be the dominant language. Anti-template guardrails (generic SaaS card grids, gradient blobs, glass cards, decorative WebGL) are listed in 07 §4.
- The homepage is a **locked 9-section sequence**: Hero / What We Build / Selected Work / Trusted / Testimoni / Platforms / Insight / PAQ-FAQ / Footer. Don't add sections (WhyPasti and homepage FinalCta were deliberately removed; `FinalCta.vue` remains for the other pages).

## Architecture

All source is under `app/` (Nuxt 4 layout). `nuxt.config.ts` adds `composables/motion` as an auto-import dir, so composables and motion helpers need no imports.

- **Pages** (`app/pages/`): `index` composes `Home*` components in order; `work`, `about`, `creative`, `technology`, `insights` are secondary pages; `preview-clou-hero` is a dev preview.
- **Components** are grouped by area and referenced with the folder prefix (`<HomeHero />`, `<LayoutHeader />`, `<BaseSection />`): `home/`, `layout/`, `base/`, `work/`, `insights/`, `about/`.
- **Content lives in composables, not components**: `useServices`, `useSelectedWork`, `useTestimonials`, `useFaq`, `usePlatforms`, etc. return typed arrays/objects that the section components render. Edit copy/data there.
- **`app/app.vue`** owns global runtime setup: starts Lenis, forces scroll-to-top on load, sets `<html data-reduced-motion>`, flips the page-ready flag (`usePageReady` → Hero/Header entrance gate), does a delayed per-instance `ScrollTrigger.refresh()`, and runs route transitions (`RouteCurtain` + `useLeaveTransition`). Header/Footer/cursor/grain/ambient layers are mounted here, outside `<NuxtPage>`.

### Motion / scroll system (`app/composables/motion/`)

- **Lenis owns smooth scrolling; GSAP + ScrollTrigger own choreography.** One Lenis instance, synced to the GSAP ticker; don't add another scroll engine, duplicate tickers, or intercept wheel events. Native `scroll-behavior: smooth` is intentionally not set.
- Wrap all GSAP setup in `useGsapContext(...)` so tweens/ScrollTriggers are reverted on unmount (needed for route re-entry and HMR). It may return a cleanup fn for non-GSAP resources (WebGL, observers).
- **Reduced motion** is handled three ways that must stay consistent: each composable's `gsap.matchMedia()` branch (use `reducedMotionQuery` from `motionTokens.ts`), Lenis being disabled, and `[data-reduced-motion='true']` CSS. Content must remain reachable when motion is off.
- **Timing/easing** come from `motionTokens.ts` (`motionTier`, `approvedEase`, plus older `motionDuration`/`spatialEase` groups kept for existing call sites). Use the approved tokens for new work.
- **Breakpoints**: Tailwind `tablet` 640 / `desktop` 1024 / `wide` 1440 are the canonical aliases (mirrored in `motionTokens.ts` for JS `matchMedia`). Heavy pinned sections gate their pin/scrub behavior at `desktop` (1024px), not 768px; `useResponsiveTier` scales interaction intensity for the tablet range.
- The Signal (a recurring visual motif) has a different role per section — implement it per section, not as one generic component (07 §11).

Styling: Tailwind config (`tailwind.config.ts`) defines the brand palette (`slateNavy`, `cobalt`, `cyan`, `surfaceNeutral`, …), and `app/assets/css/main.css` holds CSS variables for fonts, easing, and structural border tokens. Design tokens are mirrored from `docs/rework-v2/06-design-tokens.json`.
