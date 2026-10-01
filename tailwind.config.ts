import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue'
  ],
  // Vue's <Transition name="page"> in app.vue injects these classes at
  // runtime (page-enter-active, page-leave-to, etc.) — they never appear as
  // literal text in any scanned template, so Tailwind's JIT content scanner
  // would otherwise purge the hand-written rules for them out of main.css.
  //
  // The foundation utilities below (main.css's @layer utilities additions
  // for Milestone 1 — 08-implementation-plan.md §3) are likewise not yet
  // referenced by any component's template — they exist so section work in
  // later milestones can start using them immediately — so without this
  // safelist entry Tailwind's JIT scanner purges their hand-written rules
  // out of the compiled CSS entirely (verified: they compiled to nothing
  // without this, including the `.motion-decorative` marker class inside
  // the `[data-reduced-motion='true']` compound selector — the attribute
  // selector itself isn't a Tailwind-generated class, so only safelisting
  // the plain class name it's paired with keeps the whole rule alive).
  // NOTE: Tailwind's JIT engine purges UNREFERENCED utilities generated from theme config too
  // (verified directly: `text-token-display-xl` etc. compiled to nothing until added below) —
  // not just hand-authored `@layer utilities` classes. Any theme-scale entry with zero call
  // sites in the scanned `content` globs needs an explicit safelist entry to survive the build,
  // same as the plain utility classes already listed here from Milestone 1.
  safelist: [
    'page-enter-active',
    'page-leave-active',
    'page-enter-from',
    'page-leave-to',
    'border-structural-dark',
    'border-structural-light',
    'surface-dark',
    'surface-light',
    'container-page-content',
    'motion-decorative',
    // Frozen typography scale (docs/rework-v2/06-design-tokens.json) — reusable foundation
    // tokens not yet consumed by any section (post-Milestone-1 follow-up, item 3).
    'text-token-display-xl',
    'text-token-section-monumental',
    'text-token-h2',
    'text-token-body-large',
    'text-token-body',
    'text-token-metadata'
  ],
  theme: {
    // Canonical breakpoint SOURCE is docs/rework-v2/06-design-tokens.json's
    // `breakpoint` block (mobile:0 / tablet:640 / desktop:1024 / wide:1440)
    // — §17.3 CLOSED decision.
    //
    // MILESTONE 5A RECONCILIATION: explicit semantic aliases (`tablet`/
    // `desktop`/`wide`) added below, mapped EXACTLY to the frozen token
    // values. This does not remove or renumber any legacy alias — `sm`
    // through `3xl` keep their original pixel values unchanged, so every
    // pre-existing `md:`/`lg:`/`xl:` call site across every route (legacy
    // and rework-v2 alike) keeps behaving exactly as before. New/updated
    // homepage rework code should prefer the semantic names going forward;
    // legacy call sites are migrated only where doing so is a pure, exact
    // rename with zero behavioral change (verified per call site, not
    // mechanically) — see the reconciliation note below for what was NOT
    // touched and why.
    //
    // BREAKPOINT DEBT STATUS (was: owner decision CLOSED, post-Milestone-1
    // follow-up; reconciled here per 08-implementation-plan.md §14
    // Milestone 5):
    //   sm (480px)  → below `tablet`, sub-tablet fine tier — no token tier, kept as-is, no debt.
    //   md (768px)  → nearest to `tablet` (640px), NOT exact — this is the real, structural
    //                 debt. `md:768`/`(min-width:768px)`/`(max-width:767px)` is the universal
    //                 mobile-vs-desktop split boundary across every homepage rework section
    //                 (Hero/WhatWeDo/SelectedWork/Trust/Testimonials/Platforms/Insight — both
    //                 as Tailwind classes AND as the JS gsap.matchMedia()/window.matchMedia()
    //                 gate that decides whether a section's pinned/scrubbed Heavy choreography
    //                 even constructs at all). Reconciliation strategy: introduce `tablet:640`
    //                 as the semantic alias for genuinely NEW/cosmetic layout work, but do NOT
    //                 move the existing 767/768px pin-vs-no-pin JS gate down to 640px — doing
    //                 so would silently flip true-tablet viewports (640-767px) from the spec's
    //                 intended "Mobile: Recompose" treatment straight into full desktop Heavy
    //                 pinned choreography with zero tablet-specific tuning, which is a real
    //                 design/behavior change to already-CLOSED Heavy sections, not a safe
    //                 reconciliation — forbidden by this milestone's own guardrail ("do not
    //                 redesign already-closed sections"). Tracked as remaining, intentionally
    //                 NOT-closed debt — see 08-implementation-plan.md §14 Milestone 5 report.
    //   lg (1024px) → exact match for `desktop` (1024px) — debt: none, safe 1:1 rename available.
    //   xl (1280px) → between `desktop` (1024px) and `wide` (1440px), NOT exact — only ONE call
    //                 site in the whole homepage rework (Platforms.vue's single decorative
    //                 `xl:block` fragment) — low-risk, left as-is this pass since `wide:1440`
    //                 is not an exact substitute and 1280px has no token-tier equivalent to
    //                 rename to; tracked as minor remaining debt (no token tier exists at 1280).
    //   2xl (1440px)→ exact match for `wide` (1440px) — debt: none, safe 1:1 rename available.
    //   3xl (1680px)→ above `wide`, extra-wide fine tier — no token tier, kept as-is, no debt.
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1680px',
      // --- Canonical semantic aliases (06-design-tokens.json `breakpoint`), exact 1:1 values ---
      tablet: '640px',
      desktop: '1024px',
      wide: '1440px'
    },
    extend: {
      colors: {
        // --- Canonical brand vocabulary (docs/rework-v2/06-design-tokens.json) ---
        // Use these names for all NEW section work. `yellow` value is a
        // placeholder — see comment below; do not treat it as final.
        // Owner revision (2026-09-30): the brand's dark blue is #033C59 (was
        // #0F172A). `navyDeep` is its darker family for gradients/depth.
        slateNavy: '#033C59',
        navyDeep: {
          700: '#033C59',
          800: '#022F47',
          900: '#022436',
          950: '#011826'
        },
        pureWhite: '#FFFFFF',
        surfaceNeutral: '#F8FAFC',
        // Owner revision (2026-10-01): one blue only — PASTI Blue #033C59. The
        // former Cobalt/Cyan accents now alias the brand blue / PASTI Yellow.
        cobalt: '#033C59',
        cyan: '#FBBA00',
        // Yellow: exact production HEX is PENDING_MASTER_LOGO_SAMPLE per
        // tokens.json — do not guess the official brand value. This is the
        // same placeholder scale already in the codebase, kept only so
        // existing rare-accent usages don't break; do not introduce new
        // Yellow usage in homepage-foundation styling (§17: off by default
        // unless a section explicitly justifies use).
        pastiYellow: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE788',
          300: '#FFDA4D',
          400: '#FDC81F',
          500: '#FBBA00',
          600: '#D69C00',
          700: '#A97B00',
          800: '#7C5900',
          900: '#523B00'
        },

        // --- Legacy implementation aliases, values corrected to the frozen
        // token palette above ONLY where a step's real role is one of the
        // 5 canonical brand colors above (verified per-step against actual
        // call sites, not a mechanical numeric substitution — see the
        // post-Milestone-1 follow-up's "color-alias regressions" check,
        // which caught a real regression from an earlier, less careful pass
        // of this same file: `navy-500` had been aliased straight to Cobalt
        // on the assumption that "the mid-numbered step becomes the
        // interaction accent," but `navy-500` is actually used across ~10
        // call sites — Footer/MobileMenu/StatCard/WhyPastiMetric/ServiceRow/
        // ProjectCard/etc — almost entirely for muted eyebrow labels, subtle
        // hover-accent text, and decorative low-opacity glow/borders, NOT
        // for a Cobalt-style primary interaction accent. Aliasing it to
        // Cobalt made every eyebrow label and muted label sitewide render
        // in the bright interaction-accent blue instead of a muted navy
        // tone — reverted below. Only `navy-700`/`ink` (verified: the
        // actual dark-surface/heading/primary-button-background color) is
        // corrected to slateNavy; every other step keeps its original
        // guessed-but-harmless value unless a future pass verifies a
        // specific step's real call sites justify remapping it. New section
        // work should use the canonical `cobalt`/`cyan` names directly for
        // any genuinely new interaction-accent need — never retrofit an
        // existing legacy navy step for that. ---
        navy: {
          50: '#F0F3F5',
          100: '#E1E8EB',
          200: '#C0CED6',
          300: '#95ADB9',
          400: '#6D8E9F',
          500: '#4A7387', // reverted — see regression note above; this was never Cobalt's real role
          600: '#265770',
          700: '#033C59', // = slateNavy (owner revision 2026-09-30) — was #0B3954 (guessed), now the real primary dark
          800: '#082A3E',
          900: '#051B28',
          950: '#030F17'
        },
        yellow: {
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE788',
          300: '#FFDA4D',
          400: '#FDC81F',
          500: '#FBBA00',
          600: '#D69C00',
          700: '#A97B00',
          800: '#7C5900',
          900: '#523B00'
        },
        ink: '#033C59', // = slateNavy (owner revision 2026-09-30) (was #0B3954, guessed)
        paper: '#FFFFFF', // = pureWhite (already correct)
        muted: '#5C7280'
      },
      fontFamily: {
        // Role-based abstraction (display/body/metadata) resolves through
        // CSS variables defined in main.css's :root, NOT hardcoded family
        // names — this lets the interim Manrope/Inter pairing be swapped for
        // the final brand font (still pending owner decision, §17.2 CLOSED)
        // without touching this config or any component. See main.css.
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        metadata: ['var(--font-metadata)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        // Existing editorial type scale — large, confident, generous line-height for
        // whitespace-driven layout. UNCHANGED from before this milestone; still the scale
        // actually consumed by every current section/component. Left in place per this
        // follow-up's own instruction: "do not force current sections to consume [the frozen
        // scale] yet" — these two scales are intended to coexist until each section's own
        // milestone migrates it to the frozen one below.
        'display-xl': ['clamp(3rem, 6vw, 6.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 4.8vw, 5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 3.6vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'body-lg': ['clamp(1.125rem, 1.4vw, 1.375rem)', { lineHeight: '1.5' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        eyebrow: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],

        // --- Frozen typography scale (docs/rework-v2/06-design-tokens.json typography) ---
        // Exact size/lineHeight/tracking values from the frozen token, exposed as reusable
        // `text-token-*` utilities so section work in later milestones can consume them
        // directly instead of re-deriving the clamp values by hand. NOT wired into any
        // component this milestone — existing sections keep using the scale above unchanged.
        // Font-size/line-height/letter-spacing only; this does not decide final line breaks
        // or crop (still gated on the pending font decision, §12/§17.2) and does not change
        // which font renders them (still var(--font-display)/var(--font-body) etc., interim
        // Manrope/Inter).
        'token-display-xl': ['clamp(72px, 9vw, 160px)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'token-section-monumental': ['clamp(56px, 7vw, 96px)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'token-h2': ['clamp(36px, 4vw, 56px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'token-body-large': ['clamp(18px, 1.5vw, 24px)', { lineHeight: '1.5', letterSpacing: '0em' }],
        'token-body': ['clamp(16px, 1.2vw, 18px)', { lineHeight: '1.6', letterSpacing: '0em' }],
        'token-metadata': ['clamp(11px, 0.9vw, 14px)', { lineHeight: '1.3', letterSpacing: '0.06em' }],

        // Metadata role scale — the pre-existing name from this milestone's first pass,
        // identical values to `token-metadata` above. Kept so anything already written
        // against `text-metadata` this milestone keeps working; `token-metadata` is the
        // consistently-prefixed name going forward for the rest of the frozen scale.
        metadata: ['clamp(11px, 0.9vw, 14px)', { lineHeight: '1.3', letterSpacing: '0.06em' }]
      },
      maxWidth: {
        // 06-design-tokens.json layout.container: max=1440 (full bleed cap), content=1280 (reading measure)
        container: '1440px',
        'container-content': '1280px',
        prose: '65ch'
      },
      spacing: {
        // Legacy fluid section/gutter spacing — kept as aliases (existing call sites use
        // `.section` / `px-gutter` broadly outside the homepage too), now DEFINED so their
        // fluid range matches the frozen token's section-rhythm / gutter bounds instead of an
        // unrelated arbitrary clamp. See docs/rework-v2/06-design-tokens.json sectionRhythm + layout.gutter.
        section: 'clamp(4.5rem, 10vw, 12.5rem)', // ~72px–200px, covers mobile(72-112) through desktop(120-200)
        gutter: 'clamp(1.25rem, 4vw, 5rem)', // ~20px–80px, covers mobile(20-24) through desktop(48-80) gutter bounds
        // 8px base grid (06-design-tokens.json spacing) as explicit numeric-suffixed utilities
        // (spacing-1..20) alongside Tailwind's own default numeric scale — named to avoid
        // colliding with Tailwind's built-in `1`..`96` spacing keys, which already exist as a
        // different (4px-based) scale that many existing components rely on.
        'grid-micro': '4px',
        'grid-1': '8px',
        'grid-2': '16px',
        'grid-3': '24px',
        'grid-4': '32px',
        'grid-5': '40px',
        'grid-6': '48px',
        'grid-8': '64px',
        'grid-10': '80px',
        'grid-12': '96px',
        'grid-16': '128px',
        'grid-20': '160px'
      },
      borderRadius: {
        // Primary semantic radius tokens (06-design-tokens.json radius) — use these
        // (`rounded-button`, `rounded-card`) for all new section work.
        button: 'clamp(6px, 0.5vw, 8px)',
        card: 'clamp(8px, 0.6vw, 12px)',
        // Compatibility/general-purpose aliases (tokens.json radius.sm/md) for radius needs
        // outside buttons/cards (e.g. small Signal markers) — named `token-sm`/`token-md` so
        // they don't silently override Tailwind's own built-in `rounded-sm`/`rounded-md`
        // (0.125rem/0.375rem), which existing non-homepage components may already rely on.
        // Per the frozen token's own note, a broader `lg`/`xl` radius scale is intentionally
        // NOT restored (old `lg: 20px` stays gone).
        'token-sm': '6px',
        'token-md': '10px'
      },
      transitionTimingFunction: {
        // Approved Controlled-Momentum easing family (06-design-tokens.json motion.ease).
        // `editorial` (existing name, kept as alias) now maps to the exact frozen cssPrimary
        // curve — same value as before (cubic-bezier(0.16,1,0.3,1) was already correct here).
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.65, 0, 0.35, 1)'
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms'
      }
    }
  },
  plugins: []
}
