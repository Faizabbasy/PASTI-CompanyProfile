<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 06 — SELECTED WORK.
const heading = 'Selected work'
const cta = 'View all projects'

const { projects } = useSelectedWork()

// Per direct feedback, back to the section's original plain grid — no
// curtain, no pin, no takeover sequence. `useRevealOnScroll` (the original
// composable this section used at 653540b) no longer exists in the
// codebase, so the heading keeps using `useMaskedReveal`, the same word-
// reveal every other homepage section already uses.
const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

const glowRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!glowRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const anim = gsap.to(glowRef.value, {
      x: 35,
      y: -25,
      duration: 10,
      ease: spatialEase.drift,
      yoyo: true,
      repeat: -1
    })
    return () => anim.kill()
  })
})
</script>

<template>
  <BaseSection id="selected-work" as="section" class="relative overflow-hidden rounded-t-[2.5rem] bg-navy-950">
    <div
      ref="glowRef"
      aria-hidden="true"
      class="pointer-events-none absolute -right-1/4 top-1/3 h-[30rem] w-[30rem] rounded-full bg-yellow-500/[0.06] blur-3xl"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-1/4 -left-1/4 h-[26rem] w-[26rem] rounded-full bg-navy-600/[0.15] blur-3xl"
    />

    <BaseContainer class="relative">
      <h2 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h2>

      <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
        <HomeSelectedWorkCard
          v-for="(project, index) in projects"
          :key="project.index"
          :project="project"
          :offset="index % 2 === 1"
        />
      </div>

      <div class="mt-16 flex justify-center md:mt-20">
        <NuxtLink
          to="/work"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper transition-colors duration-300 ease-editorial hover:border-yellow-500"
        >
          {{ cta }}
        </NuxtLink>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
