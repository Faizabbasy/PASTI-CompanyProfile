<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// SELECTED WORK — mobile / tablet / reduced-motion counterpart of the Hero's
// desktop "Success Project" gallery (which travels sideways on scroll). On
// touch screens the same idea becomes a native swipe rail: full 4:5 posters
// with CSS scroll-snap (browser momentum + snap, no scroll-jacking), the
// active card at full scale while its neighbours rest slightly smaller and
// dimmer, and a tappable progress rail + arrows (useSnapRail/BaseSnapControls).
// Shown below `desktop` and — via the `[data-reduced-motion]
// [data-motion-stage='simple']` rule in main.css — at every width under
// reduced motion, where the desktop gallery doesn't exist.
const { projects } = useSelectedWork()

const mobileSectionComponentRef = ref<{ $el: HTMLElement } | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const { active, touched, go, next, prev } = useSnapRail(trackRef)

useGsapContext(() => {
  const mm = gsap.matchMedia()

  // Entrance: the rail slides in from the right once, hinting it continues.
  mm.add({ isBelowDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}` }, (context) => {
    const { isBelowDesktop } = context.conditions as { isBelowDesktop: boolean }
    const section = mobileSectionComponentRef.value?.$el ?? null
    const track = trackRef.value
    if (!isBelowDesktop || !section || !track) return

    // Animate the article INSIDE each snap item, never the snap item itself:
    // transforming snap children makes the browser re-snap the rail.
    const cards = Array.from(track.querySelectorAll<HTMLElement>('li > article'))
    const heads = section.querySelectorAll<HTMLElement>('[data-sw-head]')
    gsap.set(cards, { x: 90, autoAlpha: 0 })
    gsap.set(heads, { yPercent: 110 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 75%', once: true } })
    tl.to(heads, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.06 })
      .to(cards, { x: 0, autoAlpha: 1, duration: motionTier.cinematicMin + 0.2, ease: approvedEase.gsapCinematic, stagger: 0.08 }, '-=0.5')

    return () => tl.kill()
  })
})
</script>

<template>
  <!-- Wrapping div carries the #selected-work anchor id (Hero's "Explore
       our work" CTA falls back to it below desktop / under reduced motion,
       where the gallery doesn't exist). -->
  <div id="selected-work">
    <BaseSection
      ref="mobileSectionComponentRef"
      as="section"
      data-motion-stage="simple"
      class="surface-light relative overflow-hidden desktop:hidden"
    >
      <BaseContainer>
        <div class="m-center-row flex items-center gap-2 overflow-hidden">
          <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
          <p data-sw-head class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.68)]">Selected Work</p>
        </div>
        <div class="m-center mt-3 overflow-hidden pb-1">
          <h2 data-sw-head class="font-display text-[length:clamp(40px,11vw,64px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-slateNavy">
            Success Project<span class="text-pastiYellow-500">.</span>
          </h2>
        </div>
      </BaseContainer>

      <!-- The rail: native horizontal scroll with snap; cards peek past the
           right edge so it reads as swipeable at a glance. -->
      <ul
        ref="trackRef"
        class="snap-rail relative mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-gutter px-gutter pb-2"
        aria-label="Selected work projects"
      >
        <li
          v-for="(project, i) in projects"
          :key="project.index"
          class="w-[74vw] max-w-[340px] shrink-0 snap-start"
          :aria-current="i === active ? 'true' : undefined"
        >
          <article
            class="origin-left transition-[transform,opacity] duration-500 ease-editorial"
            :class="i === active ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60'"
          >
            <div class="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] border border-[color:rgba(3,60,89,0.12)] bg-surfaceNeutral shadow-[0_30px_60px_-36px_rgba(3,60,89,0.55)]">
              <img :src="project.image" :alt="project.title" :loading="i < 2 ? 'eager' : 'lazy'" class="h-full w-full object-cover" draggable="false">
              <span class="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(3,60,89,0.9)] px-3 py-1.5">
                <LayoutBrandMark :height="10" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.22)]" />
                <span class="font-display text-[10px] font-semibold tabular-nums tracking-[0.08em] text-pureWhite">{{ project.index }} / {{ String(projects.length).padStart(2, '0') }}</span>
              </span>
            </div>
            <div class="mt-5 px-1">
              <span class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cobalt">
                <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ project.category }}
              </span>
              <h3 class="mt-2 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-slateNavy">{{ project.title }}</h3>
              <p class="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ project.description }}</p>
            </div>
          </article>
        </li>
      </ul>

      <BaseContainer class="mt-6">
        <BaseSnapControls :count="projects.length" :active="active" :touched="touched" noun="project" @go="go" @prev="prev" @next="next" />
      </BaseContainer>
    </BaseSection>
  </div>
</template>
