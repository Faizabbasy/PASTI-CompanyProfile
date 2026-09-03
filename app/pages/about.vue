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

// Stats woven into one editorial sentence instead of a card grid — order
// matches useAbout.ts's `stats` array (Support Given, Project Done, Get
// Awards, Cup of Coffee), one count-up ref per position.
const [supportStat, projectStat, awardsStat, coffeeStat] = stats
const supportValueRef = ref<HTMLElement | null>(null)
const projectValueRef = ref<HTMLElement | null>(null)
const awardsValueRef = ref<HTMLElement | null>(null)
const coffeeValueRef = ref<HTMLElement | null>(null)
const statsSentenceRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useMaskedReveal(introRef, { by: 'word' })
useScrollReveal(statsSentenceRef, { y: 16 })
useCountUp(supportValueRef, { value: supportStat!.numericValue, format: (n) => `${Math.round(n)}${supportStat!.suffix}` })
useCountUp(projectValueRef, { value: projectStat!.numericValue, format: (n) => `${Math.round(n)}${projectStat!.suffix}` })
useCountUp(awardsValueRef, { value: awardsStat!.numericValue, format: (n) => `${Math.round(n)}${awardsStat!.suffix}` })
useCountUp(coffeeValueRef, { value: coffeeStat!.numericValue, format: (n) => `${Math.round(n)}${coffeeStat!.suffix}` })
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
      <p ref="statsSentenceRef" class="max-w-4xl font-display text-display-sm font-semibold leading-snug text-ink">
        We've supported
        <span class="whitespace-nowrap text-navy-700"><span ref="supportValueRef">0{{ supportStat!.suffix }}</span> businesses</span>,
        shipped
        <span class="whitespace-nowrap text-navy-700"><span ref="projectValueRef">0{{ projectStat!.suffix }}</span> projects</span>,
        won
        <span class="whitespace-nowrap text-yellow-600"><span ref="awardsValueRef">0{{ awardsStat!.suffix }}</span> in awards</span>
        — and yes, it took
        <span class="whitespace-nowrap text-navy-700"><span ref="coffeeValueRef">0{{ coffeeStat!.suffix }}</span> cups of coffee</span>
        to get here.
      </p>
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
