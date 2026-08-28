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
5. Commit with a message explaining *why*, not just what. Push directly to
   `origin/master` on `https://github.com/muhammadgrata30/PASTI` — the user
   has said not to ask for push confirmation each time.

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
- Animation: `animate-fade-up` / `animate-fade-in` / `animate-reveal` Tailwind
  utilities (on-mount style animations — use the *utility class*, not a raw
  custom `animation:` property in scoped CSS, see gotcha below). For
  scroll-triggered reveals use the `useRevealOnScroll(templateRef, options?)`
  composable paired with the `.reveal-up` CSS utility class in `main.css`.

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

## What's built so far (commits, newest last)
1. `f95b03c` — **Foundation**: Nuxt 4 + Tailwind scaffold, design tokens,
   `BaseContainer`/`BaseSection`, `useRevealOnScroll` composable.
2. `ba04919` — **Header/Navigation**: desktop nav, mobile full-screen overlay
   menu (state lives in `useMobileMenu()`, rendered as a sibling of `<header>`
   in `app.vue` — nesting a `fixed` overlay inside a `position: sticky`
   header caused visual bleed-through, so don't put it back inside Header.vue).
   Nav items + CTA label live in `useNavigation()`. OPEN/e-CORPORATE get a
   small yellow dot marker as first-class platform links.
3. `10b17ea` — **Hero**: `HomeHero.vue`, centered eyebrow/H1/2-CTA layout,
   on-mount staggered `animate-fade-up`.
4. `ed08a39` — **What We Do**: `HomeWhatWeDo.vue`, asymmetric 2-column
   (label left, intro right) matching Cuberto's actual layout for this
   section (different from Hero's centered layout) — verified against the
   live site, not assumed.
5. `4511625` — **Service Cards**: `HomeServiceCards.vue` + `HomeServiceRow.vue`
   + `useServices()`. Built as full-width row blocks (Cuberto's actual
   pattern, not generic cards). All 5 rows always show title+body+CTA (the
   client explicitly chose this over Cuberto's real accordion/collapse
   behavior); hover still darkens the row navy with white text, matching
   Cuberto's hover treatment.
6. `0417ade` — **Trust**: `HomeTrust.vue` + `useTrustedClients()`. Heading
   "Trusted by leading organizations", 4-col/2-col logo grid with grayscale
   → color hover and staggered scroll-reveal, matching Cuberto's live Trust
   section composition. **Logo grid is currently empty** — no PASTI client
   logos exist in the repo and the mapping doc requires logos to be
   "approved for publication" before use, so nothing was invented. Anyone
   picking up work: if you get approved logo assets, drop them in
   `public/logos/` (or similar) and populate the `clients` array in
   `useTrustedClients.ts` — the grid/animation will just work.

## Not built yet (homepage sections remaining per the mapping doc)
- 06 — Selected Work (project case studies)
- 07 — Why PASTI (intro + 4 metrics)
- 08 — Insights (3 articles)
- 09 — Final CTA
- Footer / platform links (section 15 in the doc)
- Testimonials: **do not build** unless real approved quotes are supplied —
  the doc says to hide the component rather than invent quotes.
- Technology/Creative/Work/About/Insights/Contact — all currently 404 (no
  pages exist yet, only referenced as nav links). Out of scope until a task
  asks for them explicitly.

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
