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
const statsRef = ref<HTMLElement | null>(null)
const servicesHeadingRef = ref<HTMLElement | null>(null)
const servicesGridRef = ref<HTMLElement | null>(null)
const companyRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useMaskedReveal(introRef, { by: 'word' })
useScrollReveal(statsRef, { y: 16, children: '.about-stat', stagger: 0.08 })
useMaskedReveal(servicesHeadingRef, { by: 'word' })
useScrollReveal(servicesGridRef, { y: 24, children: '.about-service', stagger: 0.08 })
useScrollReveal(companyRef, { y: 16 })
</script>

<template>
  <BaseSection as="section" class="pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseContainer>
      <div class="mx-auto max-w-4xl text-center">
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1 ref="heroRef" class="mt-4 text-display-xl font-extrabold leading-[1.04] tracking-tight text-ink">
          {{ heading }}
        </h1>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" tight>
    <BaseContainer>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <h2 ref="introRef" class="text-display-sm font-semibold text-ink md:col-span-8 md:col-start-1 lg:col-span-7">
          {{ introHeading }}
        </h2>
        <p class="text-body-lg text-muted md:col-span-4 md:col-start-9 lg:col-span-4 lg:col-start-9">
          {{ introBody }}
        </p>
      </div>

      <div
        ref="statsRef"
        class="mt-16 grid grid-cols-1 divide-y divide-navy-100 sm:grid-cols-2 sm:divide-y-0 lg:flex lg:flex-wrap lg:items-start lg:justify-between lg:gap-8 lg:divide-x lg:divide-navy-100 md:mt-20"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="py-8 first:pt-0 sm:px-8 sm:py-0 lg:flex-1 lg:px-8 lg:first:pl-0 lg:last:pr-0"
        >
          <AboutStat :stat="stat" />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section">
    <BaseContainer>
      <p ref="servicesHeadingRef" class="eyebrow text-center">{{ servicesSubheading }}</p>
      <h2 class="mt-4 text-center text-display-md font-semibold text-ink">{{ servicesHeading }}</h2>

      <div ref="servicesGridRef" class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
        <div
          v-for="service in services"
          :key="service.index"
          class="about-service rounded-3xl bg-navy-50 p-8"
        >
          <span class="font-display text-sm font-semibold text-navy-400">{{ service.index }}</span>
          <h3 class="mt-4 font-display text-display-sm font-semibold text-ink">{{ service.title }}</h3>
          <p class="mt-3 text-body-md text-muted">{{ service.body }}</p>
        </div>
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
