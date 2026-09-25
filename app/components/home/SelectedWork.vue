<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// MILESTONE 4C — Selected Work, total rework per
// docs/rework-v2/04-homepage-spec.md §3 ("Pinned Project Exchange" / "A
// Curated Sequence of Execution Proof, Not Ten Slides With Ten Effects").
// Replaces the previous plain 2-column grid entirely (glow blobs, pill
// "View all projects" button, hover-only card reveals, no pin, no mask
// transitions) — that composition had none of the frozen mechanics this
// section requires. Discarded per the milestone's guardrail.

const { projects } = useSelectedWork()

const sectionComponentRef = ref<{ $el: HTMLElement } | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const mediaZoneRef = ref<HTMLElement | null>(null)
const typeZoneRef = ref<HTMLElement | null>(null)
const spineRef = ref<HTMLElement | null>(null)
const spineNumeralRef = ref<HTMLElement | null>(null)
const fullBleedRef = ref<HTMLElement | null>(null)

// Mobile-simplified subtree (media above / type below, natural vertical
// sequence, no side-alternation, no pin — 04-homepage-spec.md §3
// "Responsive: Mobile (locked)").
const mobileSectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

// Per-project scroll-budget weighting (04-homepage-spec.md §3 "Duration
// per project is NOT uniform — Standard Exchange progresses faster;
// Slower Showcase and pattern-break moments get more dwell"). Values are
// relative weight units, not pixels — converted to real pixel spans against
// the section's total scroll distance once the trigger element's height is
// known (see buildProjectRanges()).
const TREATMENT_WEIGHT: Record<string, number> = {
  standard: 1,
  'media-dominant': 1.1,
  'typography-dominant': 1.1,
  'full-bleed': 1.1,
  accelerated: 0.8,
  'slower-showcase': 1.3,
  closing: 1.2
}

/** Splits `totalDistance` px across `projects` proportional to each one's
 * treatment weight, returning each project's [start, end] px range
 * relative to the pinned stage's own scroll-through distance. */
function buildProjectRanges(totalDistance: number) {
  const weights = projects.map((p) => TREATMENT_WEIGHT[p.treatment] ?? 1)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let cursor = 0
  return projects.map((project, i) => {
    const span = ((weights[i] ?? 1) / totalWeight) * totalDistance
    const range = { project, start: cursor, end: cursor + span }
    cursor += span
    return range
  })
}

useGsapContext(() => {
  const mm = gsap.matchMedia()

  // --- Reduced motion: static, simplified, first project visible, hierarchy preserved ---
  mm.add(reducedMotionQuery.reduce, () => {
    const first = projects[0]
    if (!first) return
    if (typeZoneRef.value) {
      const title = typeZoneRef.value.querySelector<HTMLElement>('[data-project-title]')
      const desc = typeZoneRef.value.querySelector<HTMLElement>('[data-project-desc]')
      const category = typeZoneRef.value.querySelector<HTMLElement>('[data-project-category]')
      if (title) title.textContent = first.title
      if (desc) desc.textContent = first.description
      if (category) category.textContent = first.category
    }
    if (mediaZoneRef.value) {
      const img = mediaZoneRef.value.querySelector<HTMLImageElement>('img')
      if (img) img.src = first.image
    }
    if (spineNumeralRef.value) spineNumeralRef.value.textContent = `01 / ${String(projects.length).padStart(2, '0')}`
  })

  // --- Desktop/tablet: full Pinned Project Exchange (md and up, no-preference motion) ---
  mm.add({ isDesktop: `${reducedMotionQuery.noPreference} and (min-width: 768px)` }, (context) => {
    const { isDesktop } = context.conditions as { isDesktop: boolean }
    if (!isDesktop) return

    const stage = stageRef.value
    const typeZone = typeZoneRef.value
    const mediaZone = mediaZoneRef.value
    if (!stage || !typeZone || !mediaZone) return

    const titleEl = typeZone.querySelector<HTMLElement>('[data-project-title]')
    const descEl = typeZone.querySelector<HTMLElement>('[data-project-desc]')
    const categoryEl = typeZone.querySelector<HTMLElement>('[data-project-category]')
    const ctaEl = typeZone.querySelector<HTMLElement>('[data-project-cta]')
    const mediaImgA = mediaZone.querySelector<HTMLImageElement>('[data-media-a]')
    const mediaImgB = mediaZone.querySelector<HTMLImageElement>('[data-media-b]')
    const spineSegments = spineRef.value ? Array.from(spineRef.value.querySelectorAll<HTMLElement>('[data-spine-segment]')) : []
    if (!titleEl || !descEl || !categoryEl || !mediaImgA || !mediaImgB) return

    // Two alternating media <img> elements so the outgoing/incoming crop-
    // shift + mask transition can run with a brief overlap (spec's Media
    // Transition) rather than mutating one element's src mid-tween.
    const firstProject = projects[0]
    if (!firstProject) return

    let activeMediaIsA = true
    gsap.set(mediaImgA, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1.06 })
    gsap.set(mediaImgB, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06, opacity: 0 })
    mediaImgA.src = firstProject.image

    let currentIndex = -1
    let descWords: HTMLElement[] = []

    function wrapDescription(text: string): HTMLElement[] {
      descEl!.innerHTML = ''
      const words: HTMLElement[] = []
      const parts = text.split(' ')
      parts.forEach((word, i) => {
        const span = document.createElement('span')
        span.className = 'inline-block'
        span.textContent = word
        span.style.opacity = '0'
        span.style.transform = 'translateY(0.4em)'
        descEl!.appendChild(span)
        words.push(span)
        // The space lives as its own text node between spans, not inside
        // one — a trailing space character INSIDE an inline-block span
        // collapses under normal whitespace rules (verified via
        // Playwright: "Adigitalexperienceconnecting..." rendered with zero
        // inter-word gaps despite each span's textContent literally
        // ending in ' '). A sibling text node is not subject to that
        // collapsing the same way and reliably renders as a real space.
        if (i < parts.length - 1) descEl!.appendChild(document.createTextNode(' '))
      })
      return words
    }

    /** Renders project at `index` — title mask slide-up, description reset
     * for scrubbed reveal, media mask/crop transition with brief overlap,
     * side-alternation (odd 1-indexed = media left, even = media right),
     * always-left-aligned typography within its own zone. */
    function setProject(index: number, direction: 1 | -1) {
      if (index === currentIndex) return
      const project = projects[index]
      if (!project) return
      currentIndex = index

      // --- Title: vertical masked slide-up, old exits up, new enters up, slight overlap ---
      const tl = gsap.timeline({ defaults: { ease: approvedEase.gsapStandard } })
      tl.to(titleEl, { yPercent: direction > 0 ? -110 : 110, duration: 0.35 }, 0)
      tl.call(() => {
        titleEl!.textContent = project.title
      }, undefined, 0.18)
      tl.fromTo(titleEl, { yPercent: direction > 0 ? 110 : -110 }, { yPercent: 0, duration: 0.4 }, 0.18)

      tl.to(categoryEl, { opacity: 0, duration: 0.2 }, 0)
      tl.call(() => {
        categoryEl!.textContent = project.category
      }, undefined, 0.2)
      tl.to(categoryEl, { opacity: 1, duration: 0.25 }, 0.22)

      if (ctaEl) {
        tl.to(ctaEl, { opacity: index === projects.length - 1 ? 1 : 0.85, duration: 0.2 }, 0)
      }

      // --- Description: word-chunk reveal, scrubbed by scroll position
      // within this project's own range (see updateDescriptionProgress),
      // not a fire-and-forget timed tween — the spec requires this to be
      // reversible on scroll-up, which a one-shot gsap.to() never was
      // (caught via Playwright: scrolling back up left already-revealed
      // words stuck visible with no way to un-reveal them). Reset to
      // fully hidden here; the scroll handler drives it from 0 onward. ---
      descWords = wrapDescription(project.description)
      gsap.set(descWords, { opacity: 0, y: '0.4em' })

      // --- Media: mask reveal + crop shift, brief overlap, side-swap synced with title ---
      // TS can't narrow mediaImgA/mediaImgB/mediaZone as non-null across
      // this closure (they're guarded in the enclosing scope, above where
      // setProject is declared) — re-guarded here rather than asserted.
      if (!mediaImgA || !mediaImgB || !mediaZone) return
      const incoming = activeMediaIsA ? mediaImgB : mediaImgA
      const outgoing = activeMediaIsA ? mediaImgA : mediaImgB
      activeMediaIsA = !activeMediaIsA
      incoming.src = project.image
      gsap.set(incoming, { clipPath: direction > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', opacity: 1, scale: 1.08 })
      tl.to(incoming, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.55, ease: approvedEase.gsapCinematic }, 0.05)
      tl.to(outgoing, { opacity: 0, duration: 0.3 }, 0.05)
      tl.set(outgoing, { clipPath: direction > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)' })

      // --- Side alternation: odd (1-indexed) = media left/type right, even = type left/media right ---
      const mediaLeft = index % 2 === 0 // index is 0-based; project 01 (index 0) = media left
      mediaZone.parentElement?.classList.toggle('lg:flex-row-reverse', !mediaLeft)

      // --- Editorial spine: active point + numeral, 10 discrete segments ---
      spineSegments.forEach((seg, i) => seg.classList.toggle('bg-cobalt', i <= index))
      spineSegments.forEach((seg, i) => seg.classList.toggle('bg-[color:rgba(255,255,255,0.15)]', i > index))
      if (spineNumeralRef.value) {
        spineNumeralRef.value.textContent = `${project.index} / ${String(projects.length).padStart(2, '0')}`
      }
    }

    setProject(0, 1)

    // Full-bleed takeover sub-timeline for any project whose treatment is
    // 'full-bleed' — temporary only, resolves back into the resting
    // split-screen (04-homepage-spec.md §3 "Temporary Full-Bleed
    // Takeover"). None of this milestone's 10 projects currently use it
    // (kept as a hook, activated automatically if a future content update
    // assigns the treatment) — never forced arbitrarily onto placeholder
    // content per the instruction "if content is still placeholder,
    // default to Standard".
    function playFullBleed(active: boolean) {
      if (!fullBleedRef.value) return
      gsap.to(fullBleedRef.value, { opacity: active ? 1 : 0, duration: 0.4, ease: approvedEase.gsapStandard })
    }

    // Description reveal driven directly by scroll position within the
    // active project's own sub-range — genuinely scrubbed and reversible
    // (a plain gsap.set() per frame, not a tween with its own independent
    // duration/timer), per 04-homepage-spec.md §3 "Description Reveal:
    // Scrubbed, scroll-tied reveal ... Fully reversible on scroll-up".
    // Begins at 15% into the range (after the title has settled) and
    // completes by 55%, leaving the remainder of the range as dwell time
    // before the next project's title-exit begins.
    function updateDescriptionProgress(localProgress: number) {
      const revealStart = 0.15
      const revealEnd = 0.55
      const revealProgress = gsap.utils.clamp(0, 1, (localProgress - revealStart) / (revealEnd - revealStart))
      const revealedCount = Math.round(revealProgress * descWords.length)
      descWords.forEach((word, i) => {
        gsap.set(word, i < revealedCount ? { opacity: 1, y: 0 } : { opacity: 0, y: '0.4em' })
      })
    }

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      // Baseline ~6.5-8 viewport lengths (guardrail ~9) — `end: '+=620%'`
      // on a pinned 100svh stage gives 900px + 900px*6.2 = 6480px = 7.2
      // viewport lengths at a 900px viewport, comfortably inside the
      // baseline (verified via Playwright pin-spacer measurement, same
      // discipline as Milestone 4B's WWB fix — never trust the source
      // percentage math alone when a shared layout class like
      // BaseSection's default padding could be adding height on top of it;
      // `py-0` is applied here for the same reason as WWB's stage).
      end: '+=620%',
      scrub: 0.7,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const totalDistance = self.end - self.start
        const ranges = buildProjectRanges(totalDistance)
        const scrolledPx = self.progress * totalDistance
        const activeRangeIndex = ranges.findIndex((r) => scrolledPx >= r.start && scrolledPx < r.end)
        const resolvedIndex = activeRangeIndex === -1 ? ranges.length - 1 : activeRangeIndex
        const direction = self.direction >= 0 ? 1 : -1
        setProject(resolvedIndex, direction as 1 | -1)
        playFullBleed(projects[resolvedIndex]?.treatment === 'full-bleed')

        const activeRange = ranges[resolvedIndex]
        if (activeRange) {
          const localProgress = gsap.utils.clamp(0, 1, (scrolledPx - activeRange.start) / (activeRange.end - activeRange.start))
          updateDescriptionProgress(localProgress)
        }
      }
    })

    return () => trigger.kill()
  })

  // --- Mobile: media above / typography below, natural vertical sequence, no pin ---
  mm.add({ isMobile: `${reducedMotionQuery.noPreference} and (max-width: 767px)` }, (context) => {
    const { isMobile } = context.conditions as { isMobile: boolean }
    const section = mobileSectionComponentRef.value?.$el ?? null
    if (!isMobile || !section) return

    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-mobile-project]'))
    gsap.set(cards, { opacity: 0, y: 20 })

    const triggers = cards.map((card) =>
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'restart none restart reverse' } }).to(card, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: approvedEase.gsapStandard
      })
    )

    return () => triggers.forEach((tl) => tl.scrollTrigger?.kill())
  })
})
</script>

<template>
  <!-- Wrapping div carries the #selected-work anchor id (Hero's "Explore
       our work" CTA jumps here via useSectionCurtain) instead of either
       inner BaseSection: only one of the two is ever visible at a given
       viewport width (the other is `display:none` via `hidden md:block` /
       `md:hidden`), and a `display:none` element's `offsetTop` is always 0
       — putting the id on the desktop section alone left the anchor
       resolving to y=0 at mobile widths (caught via Playwright: the CTA
       jump landed on Hero itself on a narrow viewport, not Selected Work).
       Two elements sharing one id would also be invalid HTML if the id sat
       on both sections directly. -->
  <div id="selected-work">
  <!-- Desktop/tablet stage (md and up). Mobile renders a fully separate,
       simpler subtree below (see the isMobile/isDesktop matchMedia split
       above and Milestone 4B's WWB precedent for why: no pinned
       ScrollTrigger is even constructed below md, not just hidden via
       CSS). -->
  <BaseSection
    ref="sectionComponentRef"
    as="section"
    class="relative hidden overflow-hidden bg-navy-950 py-0 md:block"
  >
    <div ref="stageRef" class="relative h-[100svh] overflow-hidden">
      <!-- Editorial spine: persistent, non-alternating edge position. Thin
           structural rail + active point + project numeral + 10 discrete
           segments — never a percentage fill bar, browser scrollbar, or
           giant stepper. -->
      <div class="pointer-events-none absolute inset-y-0 right-8 z-30 flex flex-col items-center justify-center gap-2 lg:right-12">
        <div ref="spineRef" class="flex flex-col gap-2">
          <span
            v-for="(project, i) in projects"
            :key="project.index"
            data-spine-segment
            class="h-4 w-px"
            :class="i === 0 ? 'bg-cobalt' : 'bg-[color:rgba(255,255,255,0.15)]'"
          />
        </div>
        <span
          ref="spineNumeralRef"
          class="mt-3 whitespace-nowrap font-display text-token-metadata font-semibold tracking-[0.08em] text-[color:rgba(255,255,255,0.6)]"
          style="writing-mode: vertical-rl"
        >01 / 10</span>
      </div>

      <BaseContainer class="relative z-10 h-full">
        <!-- Alternating split-screen: media / typography zones. Side
             alternation is toggled via JS (lg:flex-row-reverse) per the
             active project's parity — typography stays left-aligned
             within its own zone regardless of which side it's on. -->
        <div class="flex h-full flex-col items-center gap-10 lg:flex-row lg:gap-16">
          <div ref="mediaZoneRef" class="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.1)] lg:aspect-auto lg:h-[68%] lg:w-1/2">
            <img
              data-media-a
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
              style="clip-path: inset(0% 0% 0% 0%)"
            >
            <img
              data-media-b
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
              style="clip-path: inset(100% 0% 0% 0%); opacity: 0"
            >
          </div>

          <div ref="typeZoneRef" class="w-full max-w-xl text-left lg:w-1/2">
            <span data-project-category class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-cobalt" />
            <div class="mt-3 overflow-hidden">
              <h3 data-project-title class="font-display text-token-h2 font-bold text-pureWhite" />
            </div>
            <p data-project-desc class="mt-4 max-w-md text-token-body text-[color:rgba(255,255,255,0.64)]" />
            <span
              data-project-cta
              class="mt-6 inline-flex items-center gap-1.5 text-token-metadata font-semibold uppercase tracking-[0.06em] text-cobalt"
            >
              View project <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </BaseContainer>

      <!-- Full-bleed takeover layer: temporary only, resolves back into the
           split-screen above (spec: "never a permanent layout replacement").
           Hidden/opacity-0 by default — activated only for a project whose
           treatment is 'full-bleed'; none of the current 10 use it. -->
      <div
        ref="fullBleedRef"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 z-20 bg-navy-950 opacity-0"
      />
    </div>
  </BaseSection>

  <!-- Mobile (below md): media above / typography below for every project,
       no side-alternation, no pin — natural vertical sequence
       (04-homepage-spec.md §3 "Responsive: Mobile (locked)"). -->
  <BaseSection
    ref="mobileSectionComponentRef"
    as="section"
    class="relative overflow-hidden bg-navy-950 md:hidden"
  >
    <BaseContainer>
      <div class="flex items-center gap-2">
        <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
        <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">Selected Work</span>
      </div>

      <div class="mt-8 flex flex-col gap-14">
        <article v-for="project in projects" :key="project.index" data-mobile-project>
          <div class="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-[color:rgba(255,255,255,0.1)]">
            <img :src="project.image" :alt="project.title" loading="lazy" class="h-full w-full object-cover">
          </div>
          <div class="mt-4 text-left">
            <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-cobalt">{{ project.category }}</span>
            <h3 class="mt-2 font-display text-token-h2 font-bold text-pureWhite">{{ project.title }}</h3>
            <p class="mt-3 max-w-md text-token-body text-[color:rgba(255,255,255,0.64)]">{{ project.description }}</p>
          </div>
        </article>
      </div>

      <div class="mt-4 text-center font-display text-token-metadata font-semibold tracking-[0.08em] text-[color:rgba(255,255,255,0.4)]">
        01 / {{ String(projects.length).padStart(2, '0') }}
      </div>
    </BaseContainer>
  </BaseSection>
  </div>
</template>
