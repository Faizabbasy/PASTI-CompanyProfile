<script setup lang="ts">
// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 02 — HERO.
const eyebrow = 'Technology. Creativity. Impact.'
// Split into short clauses (not literal wrapped lines, which vary per breakpoint)
// purely for the staggered load-in reveal — the sentence still reads as one H1.
const headlineLines = ['We build technology', 'and creative solutions', 'for businesses ready to move forward.']
const ctaPrimary = { label: 'Explore our work', to: '/work' }
const ctaSecondary = { label: 'Tell us about it', to: '/contact' }

const { introReady } = useIntroReady()
</script>

<template>
  <BaseSection as="section" class="intro-gate pb-16 pt-20 md:pb-24 md:pt-28 lg:pt-32" :class="{ 'is-ready': introReady }">
    <BaseContainer>
      <div class="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p data-intro class="eyebrow animate-fade-up motion-reduce:animate-none" style="animation-delay: 0ms">
          {{ eyebrow }}
        </p>

        <h1 class="mt-6 text-display-lg md:text-display-xl">
          <span
            v-for="(line, index) in headlineLines"
            :key="line"
            data-intro
            class="block animate-reveal motion-reduce:animate-none"
            :style="{ animationDelay: `${150 + index * 120}ms` }"
          >{{ line }}</span>
        </h1>

        <div
          data-intro
          class="mt-10 flex animate-fade-up flex-col items-center gap-4 motion-reduce:animate-none sm:flex-row sm:justify-center"
          style="animation-delay: 550ms"
        >
          <NuxtLink :to="ctaPrimary.to" class="btn-accent w-full sm:w-auto">
            {{ ctaPrimary.label }}
          </NuxtLink>
          <NuxtLink :to="ctaSecondary.to" class="btn-outline w-full sm:w-auto">
            {{ ctaSecondary.label }}
          </NuxtLink>
        </div>
      </div>
    </BaseContainer>

    <div class="container-page mt-16 md:mt-20">
      <div
        data-intro
        class="aspect-[16/9] w-full animate-fade-in overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 motion-reduce:animate-none md:aspect-[21/9]"
        style="animation-delay: 700ms"
        aria-hidden="true"
      />
    </div>
  </BaseSection>
</template>
