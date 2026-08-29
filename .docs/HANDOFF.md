# PASTI Website Redesign — Handoff

## Project
Redesign of pastipeople.id homepage using the Cuberto agency template as the
visual/layout benchmark, restyled with PASTI's navy/yellow brand and PASTI's
own copy. Stack: **Nuxt 4 + Tailwind CSS**, no UI library, no extra
animation dependency — everything reuses the tokens/utilities built in
TASK 00.

## Source of truth for content
`.docs/PASTI_Cuberto_Template_Content_Mapping.docx` — read this before any
new task. It maps every homepage section's Cuberto-template copy to PASTI's
replacement copy, with placement rules and a QA checklist at the end.

**Known issue in that doc:** several copy/label cells are truncated mid-word
to hit a character-count target (e.g. nav label "e-CORPOR", section label
"What we bu", service title "Creative Commu"). When a task references one of
these, do not paste the truncated string literally — resolve it to the full,
correct word (confirmed so far: "e-CORPORATE", "What we build", "Creative
Communication", "Cybersecurity & Compliance", "Work", "Insights"). If a new
truncated value shows up in a future task, ask the client to confirm the
intended full word rather than guessing silently.

## Working process (how each task has been run)
1. Each task is scoped to exactly one homepage section. Do not touch sections
   already built unless the current task explicitly requires it.
2. Cuberto's **live site** (https://cuberto.com) is the visual benchmark, not
   just the mapping doc's text description — screenshot the relevant section
   live (desktop + mobile, and hover state if relevant) before building, since
   the doc references "the current Cuberto homepage" which can differ subtly
   from assumptions.
3. Ambiguous/truncated content always gets confirmed with the client via a
   question before implementing — never silently invented.
4. After implementing: `npx nuxi typecheck`, `npm run build`, then a real
   visual check by running `npm run dev` and driving headless Chromium
   (Playwright, installed ad hoc via `npx playwright install chromium` since
   no `chromium-cli` is available in this environment) across desktop/laptop/
   tablet/mobile viewports, checking for horizontal scroll, console errors,
   and that animations actually run (not just present in markup).
5. Commit with a message explaining *why*, not just what. **Do NOT push.**
   As of the session after TASK 09, the user pushes to
   `origin/master` (`https://github.com/muhammadgrata30/PASTI`) from a
   separate chat/session themselves — just commit locally and say so.
   If the user explicitly asks *this* session to push, confirm first
   (destructive/shared-state action) rather than assuming the old
   "push every time" instruction still applies.
6. Many task instructions reference truncated cells in the mapping doc as if
   already resolved ("use the complete version"). Independently verify the
   doc's actual raw text yourself (unzip the .docx, parse
   `word/document.xml`) before trusting a user-supplied "full" string —
   several truncations were only caught this way (see the section-by-section
   log below for examples). When the doc's own text disagrees with what the
   task instruction assumes, surface the discrepancy and ask the user to
   confirm the real value rather than silently using either one.
7. `./references/cuberto/` (mentioned in TASK 13's instructions as the
   primary visual ground truth) does not exist in this repo and never has.
   Confirmed with the user in TASK 13: fall back to live-screenshotting
   https://cuberto.com per section (desktop + mobile) as ground truth
   instead — same as steps 2 above. Don't assume the folder now exists in a
   future session; check again, and if still missing, use the live site.

## Repo / auth notes
- Git remote uses a fine-grained GitHub PAT scoped only to this repo. It is
  **not** stored in git config (`git remote -v` shows a plain HTTPS URL) to
  avoid leaking it into shell history/config — instead it's passed inline via
  a `credential.helper` override on each push:
  ```bash
  git -c credential.helper='!f() { echo "username=x-access-token"; echo "password=$GIT_ASKPASS_TOKEN"; }; f' push origin master
  ```
  with `GIT_ASKPASS_TOKEN` exported in the same shell command. If a new
  session needs to push and doesn't have the token, ask the user for a
  fine-grained PAT scoped to the `PASTI` repo with Contents: Read and write.
- No CI/deploy pipeline exists yet.

## Design tokens (TASK 00 — do not recreate, reuse)
- Colors sampled from the PASTI logo: navy `#0B3954` (full 50–950 scale as
  `navy-*` in `tailwind.config.ts`), yellow `#FBBA00` (50–900 scale as
  `yellow-*`). `text-ink` / `bg-paper` are the default text/background aliases.
- Fonts: Manrope (`font-display`, headings/UI) and Inter (`font-body`, text),
  loaded via Google Fonts in `nuxt.config.ts`.
- Type scale: `text-display-xl/lg/md/sm`, `text-body-lg/md/sm`, `text-eyebrow`
  — all fluid via `clamp()`, defined in `tailwind.config.ts`.
- Spacing: `.section` class = vertical section padding (`py-section` token),
  `.container-page` = max-width page gutter wrapper. Components:
  `<BaseSection>` and `<BaseContainer>` wrap these.
- Buttons: `.btn-primary` (navy), `.btn-accent` (yellow), `.btn-outline`.
- Animation (as of TASK 14 — replaces the old Tailwind-keyframe system
  entirely, see "What's built so far" #16 below): **GSAP + ScrollTrigger +
  Lenis**. Six composables live under `app/composables/motion/`:
  `useLenis` (smooth-scroll driver, mounted once at the app root),
  `useGsapContext` (wraps `gsap.context()` + auto-cleanup on unmount),
  `useMaskedReveal` (clip-path word/line text reveal), `useScrollReveal`
  (generic scroll-triggered entrance), `useMagnetic` (cursor-follow hover
  effect on CTAs/links), and `useCustomCursor` (module-level singleton
  cursor state). The custom cursor itself renders via
  `app/components/layout/CustomCursor.vue` (mounted once in `app.vue`,
  `pointer: fine` only). `animate-fade-up`/`animate-fade-in`/`animate-reveal`
  and `useRevealOnScroll`/`.reveal-up` **no longer exist** — do not reference
  them in new work.

### Gotcha already hit twice — read before adding new animation
Tailwind's `theme.extend.animation`/`keyframes` only emit `@keyframes` into
the compiled CSS if the matching **utility class** (`animate-fade-up` etc.)
literally appears in a scanned template. A custom `<style scoped>` block that
writes `animation: fade-up ...` referencing that keyframe by name will not
work — the keyframe won't exist in the output CSS and the element stays
invisible forever. Always trigger these animations via the Tailwind utility
class directly in the template, not hand-rolled scoped CSS.

### Gotcha — Nuxt component auto-import naming
Components under `app/components/home/Foo.vue` must be referenced as
`<HomeFoo>` in templates (Nuxt prefixes by folder), not `<Foo>`. Hit this
once with `ServiceRow.vue` inside `components/home/` — always double check
the resolved tag name matches the folder prefix.

### Gotcha — nested `app/composables/` subdirectories need explicit `imports.dirs`
Nuxt 4 auto-imports composables from the **top level** of `app/composables/`
only, by default. A nested subdirectory — like `app/composables/motion/`,
added in TASK 14 to group the six GSAP/Lenis composables — is **not**
scanned unless you add it explicitly:
```ts
// nuxt.config.ts
imports: {
  dirs: ['composables', 'composables/motion']
}
```
Without this, composables under the nested folder (`useLenis`,
`useGsapContext`, `useMaskedReveal`, `useScrollReveal`, `useMagnetic`,
`useCustomCursor`) fail to auto-import **silently** — no build error, just an
undefined function at runtime. This caused a real bug during TASK 14's Task
1 (motion foundation). If a future task adds another nested composables
subdirectory (e.g. `app/composables/forms/`), it needs its own entry added
to this same `dirs` array.

### Gotcha — `ref` on a Vue *component* (e.g. `<NuxtLink>`) is not a DOM node
Still very much alive post-TASK 14, and not tied to any specific composable
— it's a general Vue rule: a template `ref` placed directly on a **component**
resolves to that component's instance, not its rendered DOM element. Any code
that then calls native DOM methods on `target.value` — `getBoundingClientRect()`,
`addEventListener()`, `IntersectionObserver.observe()`, etc. — will throw or
silently no-op. Originally hit via the now-deleted `useRevealOnScroll`
composable's `IntersectionObserver.observe(target.value)` call (TASK 10,
`PlatformRow.vue`), which broke hydration for the **entire page**, not just
that component. It resurfaced identically **twice** during TASK 14 with
`useMagnetic` (which reads `getBoundingClientRect()`/adds pointer listeners
on its target): once on Hero's primary CTA (`Hero.vue`, Task 2 of the motion
plan) and once on Final CTA's heading-link (`FinalCta.vue`, Task 7) — both
crashed the app with a hydration/runtime error, both fixed identically by
wrapping the `<NuxtLink>` in a plain `<div ref="...">` and passing that div's
ref to `useMagnetic` instead. **Always wrap the link (or any component, not
native element) in a plain element and put the ref there** whenever the
consuming code needs a real DOM node — this applies to `useMagnetic`,
`useMaskedReveal`, `useScrollReveal`, or any future composable that touches
the DOM directly.

### Gotcha — custom `@layer utilities` rules vs Tailwind's generated utility classes
A hand-written rule in `main.css`'s `@layer utilities` will **beat** a
same-specificity Tailwind utility class applied via `:class` — Tailwind's
generated utilities are injected at the `@tailwind utilities` directive (top
of the file), so anything written after it in the same layer wins the
cascade regardless of where the class appears in the HTML. This mechanism
(CSS layer ordering) hasn't changed and can still bite. The original example
that surfaced it, `.intro-gate { opacity: 0 }` colliding with a
Vue-toggled `opacity-100` (hit in the intro-animation work after TASK 13),
**no longer exists in the codebase** — TASK 14 replaced that whole
CSS-driven intro gate with a GSAP timeline (see `useIntroReady()` below and
`Hero.vue`). `@layer utilities` today only hosts the custom-cursor's
`.cursor-dot` / `[data-cursor-state='...']` rules, which don't collide with
any Tailwind utility name. Still, if a future task adds a hand-written rule
here that shares a name/specificity with a Tailwind utility, prefer state
that doesn't collide (a data-attribute selector, a differently-named class)
over fighting the cascade by reordering CSS.

### Gotcha (superseded mechanism, composable itself unchanged) — page-load intro gating
Pre-TASK 14, the Hero's page-load intro used Tailwind
`animation-fill-mode: both` + `animation-play-state: paused` on
`.intro-gate` / `[data-intro]` elements, flipped to `running` once
`useIntroReady()` resolved. **That CSS-driven mechanism and both classes are
gone** — confirmed via grep, `.intro-gate`/`[data-intro]` no longer appear
anywhere in the codebase. `useIntroReady()` itself is **unchanged**: it still
provides the same ~250ms blank-beat gate (`requestAnimationFrame` +
`setTimeout`) via an `introReady` ref, documented in
`app/composables/useIntroReady.ts`. What changed is the *consumer* pattern —
`Hero.vue` now does `watch(introReady, (ready) => { if (!ready) return; ...
})` inside `useGsapContext()` to gate the **start of a hand-built GSAP
timeline** (word-mask reveal + CTA/visual fade-in), not to toggle
`animation-play-state` on paused CSS animations. Any future consumer of
`useIntroReady()` should follow the GSAP-timeline-gate pattern, not
resurrect the CSS one.

## What's built so far (commits, newest last)
1. `f95b03c` — **Foundation**: Nuxt 4 + Tailwind scaffold, design tokens,
   `BaseContainer`/`BaseSection`, `useRevealOnScroll` composable.
2. `ba04919` — **Header/Navigation**: desktop nav, mobile full-screen overlay
   menu (state lives in `useMobileMenu()`, rendered as a sibling of `<header>`
   in `app.vue` — nesting a `fixed` overlay inside a `position: sticky`
   header caused visual bleed-through, so don't put it back inside Header.vue).
   Nav items + CTA label live in `useNavigation()`. OPEN/e-CORPORATE get a
   small yellow dot marker as first-class platform links.
3. `10b17ea` — **Hero**: `HomeHero.vue`, centered eyebrow/H1/2-CTA layout.
4. `ed08a39` — **What We Do**: `HomeWhatWeDo.vue`, asymmetric 2-column
   (label left, intro right) matching Cuberto's actual layout for this
   section (different from Hero's centered layout) — verified against the
   live site, not assumed.
5. `4511625` — **Service Cards**: `HomeServiceCards.vue` + `HomeServiceRow.vue`
   + `useServices()`. Built as full-width row blocks (Cuberto's actual
   pattern, not generic cards).
   **Superseded by a later session** (see #17 below) — rows are now
   scroll-triggered expand/collapse, not always-visible with hover-darken.
   Left here only for commit-history context.
6. `0417ade` — **Trust**: `HomeTrust.vue` + `useTrustedClients()`. Heading
   "Trusted by leading organizations", 4-col/2-col logo grid with grayscale
   → color hover and staggered scroll-reveal. **Logo grid is still empty** —
   no PASTI client logos exist in the repo and the mapping doc requires logos
   to be "approved for publication" before use. Drop approved assets in
   `public/logos/` (or similar) and populate `clients` in
   `useTrustedClients.ts` once available — the grid/animation will just work.
7. `653540b` — **Selected Work**: `HomeSelectedWork.vue` +
   `HomeSelectedWorkCard.vue` + `useSelectedWork.ts`. 2-column staggered/
   masonry grid, dark navy section, 10 project cards with empty gradient
   placeholder visuals (no approved case-study imagery exists yet). Cards and
   the "View all projects" CTA are non-interactive (no `<a>`/route) since no
   Work detail pages exist. The mapping doc's list of *named* PASTI case
   studies (section 11) is not paired to specific card slots by the doc
   itself — that pairing is still unresolved, not guessed.
8. `4332cce` — **Why PASTI**: `HomeWhyPasti.vue` + `HomeWhyPastiMetric.vue` +
   `useWhyPasti.ts`. Deliberately **not** a card grid like Cuberto's — client
   asked for an editorial metric list (large typography rows + hairlines)
   instead, to avoid "SaaS stat card" styling. Metric 01's value ("2020") was
   truncated to "202" in the source doc; the full value was confirmed by the
   client directly, not guessed.
9. `18f964a` — **Insights**: `HomeInsights.vue` + `HomeInsightsCard.vue` +
   `useInsights.ts`. 3-up grid, title-only cards (no invented publish dates/
   authors/categories/thumbnails — the doc requires real PASTI articles and
   none exist yet). Two fields were truncated mid-word in the source with no
   ellipsis marker (article 1 title, the CTA text); confirmed by the client.
10. `6287009` — **Final CTA**: `HomeFinalCta.vue` + `useFinalCta.ts`.
    Two-line oversized heading, second line is an underlined link to
    `/contact`. **`email` is `null`** — the doc's PASTI email replacement is
    itself truncated ("hello@pastitech." with no TLD) and no complete PASTI
    contact email exists anywhere in the doc or repo. The component omits
    the email action entirely when null (not a placeholder string) — just
    set `email` in `useFinalCta.ts` once the real address is confirmed and
    it activates automatically in both `FinalCta.vue` and `Footer.vue`.
11. `64439b6` — **OPEN & e-CORPORATE platform section**:
    `HomePlatforms.vue` + `HomePlatformRow.vue` + `usePlatforms.ts`. Adapts
    Selected Work's full-width row grammar (not a small-card grid) for two
    first-class product rows. OPEN's positioning ("One Procurement Ecosystem
    Network") is verbatim from the doc. **e-CORPORATE has no real
    positioning anywhere in the source** — the doc itself says to keep it
    high-level until an approved product brief exists — so it shows a
    neutral status label ("Enterprise platform · Coming soon"), not an
    invented description. Don't write e-CORPORATE feature copy until that
    brief exists.
12. `aaad3f3` — **FAQ**: `HomeFaq.vue` + `HomeFaqItem.vue` + `useFaq.ts`.
    Native `<details>/<summary>` accordion (free keyboard support), multiple
    items can be open at once (verified against Cuberto live — opening item
    2 does not close item 1). Height animates via the `grid-template-rows:
    0fr → 1fr` trick, not JS `scrollHeight` measurement. 3 questions + 2
    answers were truncated mid-sentence in the source with no ellipsis
    marker; confirmed by the client.
13. `b2dd255` — **Footer**: `LayoutFooter.vue` + `useFooter.ts`. Mounted in
    `app.vue` (layout-level, like Header) so it appears on every route, not
    just the homepage. 3 of 5 nav labels and both platform-link cells were
    truncated/placeholder in the source ("Solution", "Insi", "Let's Ta", "O",
    "e") — full labels confirmed by the client. No social icons or privacy-
    policy link — none exist in the source and Cuberto's originals are
    Cuberto-specific, so nothing was invented. Email row reuses
    `useFinalCta().email` (see #10).
14. `b6da248` — **TASK 13 visual parity pass**: audited the whole homepage
    section-by-section against Cuberto's live site (no `references/cuberto/`
    folder exists in this repo — see gotcha above). Found one CRITICAL gap:
    Hero had no image/visual block at all, while Cuberto's hero has a large
    device-mockup image directly under the CTAs. Added a placeholder visual
    block (rounded, 16:9 desktop / 21:9 wider, gradient navy) matching
    Cuberto's hero image proportions — confirmed with the client before
    building. Everything else audited was already close enough to Cuberto's
    layout/rhythm/motion from its own build task and needed no structural
    change.
15. `0af9ee4` — **Hero page-load intro animation**: added a brief blank beat
    (`useIntroReady()`, ~250ms) before entrance animations start, plus a
    word/line-level clip-reveal on the H1 instead of the whole sentence
    fading up as one block — closer to Cuberto's own load-in. This used a
    CSS-only `animation-play-state` approach at the time; superseded by
    TASK 14 below (see the gotchas above for what changed and why).
16. `9b7bcac`…`fd05b9c` — **TASK 14, Cuberto motion parity pass**: replaced
    the entire on-mount/scroll-reveal Tailwind-keyframe system
    (`animate-fade-up`/`animate-fade-in`/`animate-reveal`,
    `useRevealOnScroll`/`.reveal-up` — all deleted) with a **GSAP +
    ScrollTrigger + Lenis** foundation (`9b7bcac`), six composables under
    `app/composables/motion/` (see "Design tokens" above). Added a custom
    cursor with 5 states — default/link/view/inverse/contact
    (`CustomCursor.vue` + `useCustomCursor.ts`; fixed twice for
    mount/hydration ordering, `a3ff082` and `026282c`). Added magnetic hover
    (`useMagnetic`) to Hero's primary CTA and Final CTA's heading-link, and
    rebuilt Hero's page-load intro as a hand-built GSAP timeline gated on
    `useIntroReady()` instead of CSS `animation-play-state` (`494d8af`).
    Replaced the old CSS keyframe reveals with masked word/line-reveal text
    animation (`useMaskedReveal`) across What We Do, Why PASTI, and other
    copy-heavy sections (`7fc6611`). Added entrance (clip-path + scale),
    hover, and per-column parallax motion to Selected Work — no pinning
    (`3d275f7`). Extended hover motion to Services, Insights, and Platforms
    rows with a differential title/arrow shift pattern (`f093bb0`,
    `e42ec13`). Refined FAQ icon easing and Footer hover motion, added Final
    CTA's magnetic interaction (`365c6f9`). Fixed a leftover CSS-only reveal
    pattern found during final QA (`fd05b9c`), and guarded MobileMenu's
    stagger animation with `prefers-reduced-motion` (`2be9bcc`). See the
    gotchas above (`ref` on a Vue component, `@layer utilities` cascade, the
    `imports.dirs` nested-composables trap, and the superseded intro-gate
    mechanism) for bugs hit and fixed while building this.
17. **Hero headline reflow + navbar restyle + Service rows scroll-accordion**
    (session after TASK 14, no TASK number assigned): three separate
    client-directed changes, each re-verified against Cuberto's live site
    with fresh screenshots (not assumed from memory):
    - **Hero** (`HomeHero.vue`): `headlineLines[]` (3 forced `<span
      class="block">` lines) collapsed into one `headline` string that wraps
      naturally. Cuberto's live hero turned out to be **center-aligned**,
      not left — the only real difference from the old PASTI build was
      forced-vs-natural line breaks and a smaller type scale. Also widened
      the heading's max-width and stepped `text-display-lg/xl` down to
      `text-display-sm/md` so it settles at 2 lines on desktop instead of
      3–4. Word-mask reveal logic updated to split words off the single
      heading block directly (was iterating `heading.children` per forced
      line — that loop is gone now that there's only one child).
    - **Navbar** (`LayoutHeader.vue`): restyled to match Cuberto's visual
      treatment — solid `bg-paper` (no `backdrop-blur`), dropped
      `border-b`, shrank `h-20/h-24` to `h-16/h-20`, widened nav `gap-8` to
      `gap-10`, swapped the CTA from `.btn-accent` (yellow) to
      `.btn-primary` (navy solid) for a high-contrast pill like Cuberto's
      black one. **Nav items themselves (8 links incl. OPEN/e-CORPORATE
      platform dots), logo, and mobile menu were explicitly left alone** —
      this was a styling-only pass, not an IA change.
    - **Service rows** (`HomeServiceRow.vue` + `HomeServiceCards.vue`):
      **reverses the #5 decision above.** Client re-requested Cuberto's
      real behavior after seeing it live-screenshotted: each row now
      expands/collapses independently via its own `ScrollTrigger`
      (`start: 'top 75%', end: 'bottom 35%'`, `onToggle` drives an
      `isOpen` ref), not on hover and not always-visible. Confirmed via
      live Cuberto screenshots that multiple rows can be open
      simultaneously (it's per-row scroll visibility, not a
      one-open-at-a-time accordion), and that open rows get a decorative
      abstract gradient shape on the right — added three CSS-gradient
      variants (`service-shape-diagonal/chevron/radial`, cycled by index
      in `ServiceCards.vue`) since no image assets exist for this. Body
      height is tweened via GSAP (`height: 0 → auto`, not the FAQ's
      `grid-template-rows` trick) because it needs to reverse in sync with
      scroll direction, not just play-once. `reduced-motion` fallback
      forces all rows permanently open. Verified both scroll directions
      (down = progressive expand, up = progressive re-collapse) and mobile
      via Playwright — see gotcha note below if a future session touches
      this again.

18. **Session after #17: Service rows layout fix, Hero rebuilt twice more,
    real logo asset, cursor spotlight** (no TASK number assigned; commits
    `33ee2af` onward through `54b841c`). Dense session — client iterated on
    the Hero multiple times, including one full detour that was reverted.
    Read this whole entry before touching Hero.vue, Logo.vue, or
    ServiceRow.vue again.
    - **Service rows alignment + description placement** (`33ee2af`,
      `e33e845`, `8b4f6f6`): fixed `items-center`→`items-start` so
      title/description/index share a top baseline across all 5 rows
      (previously only row 1 aligned by coincidence). Description's reveal
      animation split from the row's height-tween so it visibly eases in
      on its own beat (`y:16→0`, 150ms delay) instead of popping in flat.
      Then, per a follow-up screenshot from the client showing Cuberto's
      actual open-card layout, moved the description from a right-hand
      column to directly under the title (stacked, one column, matching
      Cuberto exactly) and **removed the standalone "Explore" link** —
      the whole row is now one `NuxtLink` (wrapped in a plain `<div
      ref="rowRef">` for the same Vue-component-ref gotcha documented
      above), so clicking anywhere on a row navigates to `/technology`.
      Also collapsed the three decorative shape variants
      (diagonal/chevron/radial) down to one (`service-shape-diagonal`
      only) — the client flagged the chevron's "X" look as wrong and
      asked for one consistent treatment.
    - **Hero: wordmark experiment, built then fully reverted.** The client
      asked for a giant "PASTI" wordmark (styled like the navbar logo,
      with an animated dot flying in) to replace the sentence headline.
      This was built, verified, and iterated on (letter-by-letter reveal,
      dot entrance animation) — then the client asked to revert it
      entirely back to the sentence headline. **Do not resurrect the
      wordmark-hero idea from git history without being asked** — it was
      explicitly rejected, not just deprioritized. The revert was done by
      restoring `Hero.vue` from commit `534a6e8` (last known-good sentence
      headline), not by hand-editing forward.
    - **Hero: hierarchy flip, then full Cuberto structural match.** After
      the wordmark revert, the client first asked to swap prominence
      between the two lines — "Technology. Creativity. Impact." became
      the large `<h1>`, "We build technology..." became a small line
      above it. Then, after comparing screenshots of Cuberto's actual
      hero, asked to match Cuberto's structure **exactly**: no small
      label above the headline at all, no CTA row in this section.
      Current final structure (as of `54b841c`): headline (now
      `text-display-lg/xl`, much larger than before) → subtext paragraph
      below it → visual block. `ctaPrimary`/`ctaSecondary` and
      `useMagnetic` are gone from Hero entirely. The word-reveal
      `wrapWord()` helper now adds `margin: -0.2em` (outer) /
      `padding: 0.2em` (inner) — copied from Cuberto's own live DOM
      structure (verified via `outerHTML` inspection) — to stop
      descenders (g, y, p) clipping during the reveal; the previous
      version didn't have this and it happened to not matter for the
      words used, but keep it for any future headline text.
    - **Real logo asset.** Client supplied
      `.docs/LOGO/pasti logo (1).png` (full "PASTI" wordmark + dot,
      1205×527, transparent background) and
      `.docs/LOGO/PASTI PUTIH LOGO biru.png` (a "P." icon mark, likely
      for a future favicon — **not currently used anywhere**, don't wire
      it up without being asked). The wordmark was copied to
      `public/images/pasti-logo.png` and `LayoutLogo.vue` now renders it
      via `<img>` instead of CSS text. **Non-obvious part:** on light
      backgrounds (navbar) the image renders untouched — the source
      art's dot is already correctly positioned/colored. On dark
      backgrounds (footer) it needs to read as white, but
      `brightness-0 invert` also turns the dot white (filters apply
      per-pixel uniformly, there's no way to invert selectively) — and
      in the source art the dot actually **overlaps** the top of the
      final "I", it isn't a clean gap, which was confirmed by measuring
      the PNG with a percentage-grid overlay in a scratch HTML file. So
      the inverted/footer variant (`<LayoutLogo inverted />`, used in
      `Footer.vue`) crops the image at a hand-tuned width
      (`2.13em` of a `1em`-tall wrapper) to cut the source dot out of
      frame, then draws a solid `bg-yellow-500` CSS span back on top at
      hand-tuned coordinates. If the source PNG is ever replaced, these
      crop/position numbers will need re-tuning the same way (screenshot
      at high `deviceScaleFactor`, adjust, re-screenshot — there's no
      shortcut without image-editing tooling, which this environment
      doesn't have: no ImageMagick, no `sharp`).
    - **Cursor spotlight on the Hero headline.** New composable
      `app/composables/motion/useCursorSpotlight.ts`: tracks
      `pointermove` over a wrapper element and writes
      `--spotlight-x`/`--spotlight-y` custom properties (smoothed via a
      short GSAP tween so it glides, not snaps) that a `radial-gradient`
      mask (`.cursor-spotlight` in `main.css`) reads on a second,
      absolutely-positioned, `aria-hidden` copy of the headline text
      (`text-yellow-500`) stacked on top of the real navy one. The mask
      is a **hard-edged** circle (`black` all the way to
      `--spotlight-radius`, `transparent` one pixel past it) — an
      earlier version had a soft ~70px feather between radius and edge,
      which the client rejected as looking "kaya gradient" (like a
      gradient); they want solid yellow inside the circle, full stop.
      Fine-pointer only (`window.matchMedia('(pointer: fine)')`, same
      gating pattern as `useMagnetic`/`CustomCursor.vue`), so it's
      simply absent on touch devices rather than trying to simulate it.

### Gotcha — per-row `ScrollTrigger` instances need their own `useGsapContext`
`HomeServiceRow.vue`'s scroll-accordion (#17 above) creates one
`ScrollTrigger` per row instance inside `useGsapContext()`, keyed to that
component's own mount/unmount — not a single shared trigger in the parent
`HomeServiceCards.vue`. This matters because `ScrollTrigger.create()` calls
made outside a `gsap.context()` scope leak across route navigation/HMR (the
same class of bug `useGsapContext` exists to prevent elsewhere in the
codebase — see the Design tokens section above). If a future change moves
this logic up into `ServiceCards.vue` (e.g. to orchestrate cross-row
behavior), each trigger still needs to stay individually scoped/cleaned up,
not just batched into one context with a shared teardown that fires only
once for all five.

## Not built yet (homepage sections remaining per the mapping doc)
- All 15 mapped homepage sections (00 through Footer) are now built. What's
  left is asset/content, not structure:
  - Trust section client logos (empty grid, see #6 above)
  - Selected Work project imagery + named-case-study-to-slot pairing (#7)
  - Insights real article data: thumbnails, dates, authors, categories (#9)
  - PASTI contact email / office address (#10, gates Footer's email row too)
  - OPEN / e-CORPORATE product visuals, and e-CORPORATE's real positioning
    copy once a product brief is approved (#11)
  - Hero's product/device mockup image (#14, currently a placeholder —
    Hero's own text content and structure changed substantially since
    #14 was written, see #18, but the visual block itself is still the
    same gradient placeholder)
  - Favicon: `.docs/LOGO/PASTI PUTIH LOGO biru.png` (a "P." icon mark)
    was supplied alongside the wordmark logo in #18 and looks intended
    for this, but hasn't been wired up — `public/favicon.ico` is still
    whatever was scaffolded in TASK 00. Ask before changing it in case
    the client has an opinion on format/sizing.
- Testimonials: **do not build** unless real approved quotes are supplied —
  the doc says to hide the component rather than invent quotes.
- Technology/Creative/Work/About/Insights/Contact — all currently 404 (no
  pages exist yet, only referenced as nav links). Out of scope until a task
  asks for them explicitly.
- No further TASK numbers have been assigned past TASK 13 as of this
  writing — check with the user for what's next (likely: real assets as
  they become available, then individual sub-pages for the 404 routes).

## Visual verification setup (Playwright, ad hoc)
No `chromium-cli` exists in this environment. The reliable pattern used
across every task: `mkdir` a throwaway dir under the scratchpad, `npm init
-y && npm install playwright@1.62.1`, then a one-off `node -e "..."` script
using `chromium.launch()` — never `npx playwright install` alone (it
installs the browser binary but not the npm package needed to `require()`
it; you need both, and the binary is cached at
`$LOCALAPPDATA/ms-playwright` so it's normally already there — only the npm
package needs reinstalling per scratch dir). Screenshot section-by-section
by scrolling to a text locator (`page.locator('text=...').first()`) rather
than relying on `fullPage: true` (has timed out / OOM'd on heavy pages like
Cuberto's live site). Delete the scratch dir when done.

## How to run locally
```bash
npm install   # first time only
npm run dev   # starts on :3000, or next free port if busy
```
Build/typecheck:
```bash
npx nuxi typecheck
npm run build
```
