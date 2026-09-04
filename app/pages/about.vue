<script setup lang="ts">
const {
  eyebrow,
  heading,
  introHeading,
  introBody,
  stats,
  servicesHeading,
  servicesSubheading,
  services,
  companyName,
  companyTagline
} = useAbout()

const heroRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const servicesHeadingRef = ref<HTMLElement | null>(null)
const servicesListRef = ref<HTMLElement | null>(null)
const companyRef = ref<HTMLElement | null>(null)

// Stats shown as a tilted, overlapping stack of uniform cards (same size,
// same style — no card singled out as "the important one"). Each card gets
// its own cursor-tilt + hover-lift ref via useCardTilt, and CSS hover:z-20
// brings the hovered card to the front of the stack.
const statsStackRef = ref<HTMLElement | null>(null)
const cardRefs = stats.map(() => ref<HTMLElement | null>(null))

// Rotation/offset per card position, tuned by hand against a screenshot so
// every card stays fully clear of its neighbours and the container edges.
// `rotate` is handed to useCardTilt as `baseRotate` rather than set via CSS
// — GSAP needs to own the transform it's animating on top of.
const cardStyles = [
  { rotate: -6, x: '2%', y: '4%' },
  { rotate: 5, x: '36%', y: '-6%' },
  { rotate: -3, x: '68%', y: '10%' },
  { rotate: 4, x: '20%', y: '52%' }
]

cardRefs.forEach((cardRef, i) => {
  useCardTilt(cardRef, { strength: 8, lift: 1.05, baseRotate: cardStyles[i]!.rotate })
})

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useMaskedReveal(introRef, { by: 'word' })
useScrollReveal(statsStackRef, { y: 24, children: '.about-stat-card', stagger: 0.12 })
useMaskedReveal(servicesHeadingRef, { by: 'word' })
useScrollReveal(servicesListRef, { y: 24, children: '.about-service', stagger: 0.1 })
useScrollReveal(companyRef, { y: 16 })
</script>

<template>
  <BaseSection as="section" class="relative overflow-hidden bg-paper pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseHeroBackdrop />
    <BaseContainer>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 ref="heroRef" class="mt-4 text-display-xl text-ink">
        {{ heading }}
      </h1>

      <div class="mt-10 ml-auto max-w-xl md:mt-14 md:mr-4">
        <h2 ref="introRef" class="text-display-sm font-semibold text-ink">
          {{ introHeading }}
        </h2>
        <p class="mt-4 text-body-lg text-muted">
          {{ introBody }}
        </p>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" tight class="bg-paper">
    <BaseContainer>
      <!-- Mobile/tablet: plain grid, no rotation/tilt — the tilted overlap
           and cursor-tilt effect only work with room and a pointer on wide
           viewports. -->
      <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:hidden">
        <div v-for="stat in stats" :key="stat.label" class="about-stat-card rounded-3xl border border-navy-100 bg-paper p-6 shadow-[0_20px_45px_-20px_rgba(11,22,32,0.25)]">
          <AboutStatCard :stat="stat" />
        </div>
      </div>

      <!-- Desktop: tilted overlapping stack of uniform cards, cursor-tilt +
           hover-lift on each. -->
      <div ref="statsStackRef" class="relative mt-12 hidden h-[24rem] lg:block">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          :ref="(el) => (cardRefs[i]!.value = el as HTMLElement)"
          class="about-stat-card absolute w-56 rounded-3xl border border-navy-100 bg-paper p-6 shadow-[0_20px_45px_-20px_rgba(11,22,32,0.25)] transition-shadow duration-300 ease-editorial will-change-transform hover:z-20 hover:shadow-[0_30px_60px_-20px_rgba(11,22,32,0.4)]"
          :style="{
            left: cardStyles[i]!.x,
            top: cardStyles[i]!.y,
            transform: `rotate(${cardStyles[i]!.rotate}deg)`
          }"
        >
          <AboutStatCard :stat="stat" />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section">
    <BaseContainer>
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-navy-100 pt-10">
        <p ref="servicesHeadingRef" class="eyebrow">{{ servicesSubheading }}</p>
        <h2 class="text-display-sm font-semibold text-ink">{{ servicesHeading }}</h2>
      </div>

      <div ref="servicesListRef" class="mt-4">
        <div
          v-for="service in services"
          :key="service.index"
          class="about-service grid grid-cols-1 items-baseline gap-2 border-t border-navy-100 py-8 md:grid-cols-12 md:gap-8 md:py-10"
        >
          <span class="font-display text-body-lg text-navy-400 md:col-span-2">{{ service.index }}</span>
          <h3 class="font-display text-display-sm font-semibold text-ink md:col-span-4">{{ service.title }}</h3>
          <p class="text-body-md text-muted md:col-span-6">{{ service.body }}</p>
        </div>
        <div class="border-t border-navy-100" />
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" class="rounded-t-[2.5rem] bg-navy-950">
    <BaseContainer>
      <div ref="companyRef" class="text-center">
        <p class="font-display text-body-lg font-semibold text-paper">{{ companyName }}</p>
        <p class="mx-auto mt-3 max-w-xl text-body-md text-navy-300">{{ companyTagline }}</p>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
