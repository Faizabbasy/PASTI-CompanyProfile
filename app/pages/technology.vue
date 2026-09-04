<script setup lang="ts">
const { eyebrow, heading, introBody, servicesEyebrow, servicesHeading, services } = useTechnology()

const heroRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const servicesHeadingRef = ref<HTMLElement | null>(null)
const servicesListRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useScrollReveal(introRef, { y: 16 })
useMaskedReveal(servicesHeadingRef, { by: 'word' })
useScrollReveal(servicesListRef, { y: 24, children: '.technology-service', stagger: 0.1 })
</script>

<template>
  <BaseSection as="section" class="relative overflow-hidden bg-paper pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseHeroBackdrop />
    <BaseContainer>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 ref="heroRef" class="mt-4 max-w-3xl text-display-lg text-ink">
        {{ heading }}
      </h1>
      <p ref="introRef" class="mt-6 max-w-xl text-body-lg text-muted">
        {{ introBody }}
      </p>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section">
    <BaseContainer>
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-navy-100 pt-10">
        <p ref="servicesHeadingRef" class="eyebrow">{{ servicesEyebrow }}</p>
        <h2 class="text-display-sm font-semibold text-ink">{{ servicesHeading }}</h2>
      </div>

      <div ref="servicesListRef" class="mt-4">
        <div
          v-for="service in services"
          :key="service.index"
          class="technology-service grid grid-cols-1 items-baseline gap-2 border-t border-navy-100 py-8 md:grid-cols-12 md:gap-8 md:py-10"
        >
          <span class="font-display text-body-lg text-navy-400 md:col-span-2">{{ service.index }}</span>
          <h3 class="font-display text-display-sm font-semibold text-ink md:col-span-4">{{ service.title }}</h3>
          <p class="text-body-md text-muted md:col-span-6">{{ service.body }}</p>
        </div>
        <div class="border-t border-navy-100" />
      </div>
    </BaseContainer>
  </BaseSection>

  <HomeFinalCta class="rounded-t-[2.5rem]" />
</template>
