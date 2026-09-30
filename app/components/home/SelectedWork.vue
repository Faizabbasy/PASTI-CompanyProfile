<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// SELECTED WORK — simple list (post-Milestone 7 redirection, owner-directed).
// On desktop the projects now live in Hero.vue's pinned gallery (curved
// arc -> horizontal travel), so the former pinned Project Exchange stage that
// used to be here was removed. What remains is the media-above /
// typography-below vertical sequence (04-homepage-spec.md §3 "Responsive:
// Mobile (locked)"), shown below `desktop` and — via the
// `[data-reduced-motion] [data-motion-stage='simple']` rule in main.css — at
// every width under reduced motion, since the desktop gallery has no
// reduced-motion equivalent and this list already reaches every project
// with zero motion dependency.

const { projects } = useSelectedWork()

const mobileSectionComponentRef = ref<{ $el: HTMLElement } | null>(null)

useGsapContext(() => {
  const mm = gsap.matchMedia()

  // Tablet (Reduced Complexity) + Mobile (Recomposed): natural vertical
  // sequence, no pin.
  mm.add({ isBelowDesktop: `${reducedMotionQuery.noPreference} and ${breakpointQuery.belowDesktop}` }, (context) => {
    const { isBelowDesktop } = context.conditions as { isBelowDesktop: boolean }
    const section = mobileSectionComponentRef.value?.$el ?? null
    if (!isBelowDesktop || !section) return

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
        <div class="flex items-center gap-2">
          <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
          <h2 class="font-display text-token-metadata font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.68)]">Selected Work</h2>
        </div>

        <div class="mt-8 flex flex-col gap-14">
          <article v-for="project in projects" :key="project.index" data-mobile-project>
            <div class="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-[color:rgba(3,60,89,0.120)]">
              <img :src="project.image" :alt="project.title" loading="lazy" class="h-full w-full object-cover">
              <span class="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-token-sm border border-[color:rgba(255,255,255,0.12)] bg-[color:rgba(3,60,89,0.9)] px-2.5 py-1.5">
                <LayoutBrandMark :height="10" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.22)]" />
                <span class="font-display text-[10px] font-semibold tabular-nums tracking-[0.08em] text-pureWhite">{{ project.index }}</span>
              </span>
            </div>
            <div class="mt-4 text-left">
              <span class="font-display text-token-metadata font-semibold uppercase tracking-[0.1em] text-cobalt">{{ project.category }}</span>
              <h3 class="mt-2 font-display text-token-h2 font-bold text-slateNavy">{{ project.title }}</h3>
              <p class="mt-3 max-w-md text-token-body text-[color:rgba(3,60,89,0.82)]">{{ project.description }}</p>
            </div>
          </article>
        </div>

        <div class="mt-4 text-center font-display text-token-metadata font-semibold tracking-[0.08em] text-[color:rgba(3,60,89,0.58)]">
          01 / {{ String(projects.length).padStart(2, '0') }}
        </div>
      </BaseContainer>
    </BaseSection>
  </div>
</template>
