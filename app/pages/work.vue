<script setup lang="ts">
const eyebrow = 'Portfolio'
const heading = 'Selected work'
const intro = 'A closer look at how we work with our clients — the brief, and the result. Explore a project to read the full story.'

const approachEyebrow = 'How we work'
const approachHeading = 'Real projects, real results'
const approachBody = 'Setiap project di bawah ini adalah hasil kerja nyata PASTI bersama client — dari riset, desain, sampai eksekusi teknis yang benar-benar dipakai hari ini.'

const viewMoreLabel = 'View more projects'
const viewLessLabel = 'Show less'

const { primary, more } = useWorkPortfolio()

const showMore = ref(false)

const heroRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const approachHeadingRef = ref<HTMLElement | null>(null)
const approachBodyRef = ref<HTMLElement | null>(null)
const moreListRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useScrollReveal(introRef, { y: 16 })
useMaskedReveal(approachHeadingRef, { by: 'word' })
useScrollReveal(approachBodyRef, { y: 16 })

watch(showMore, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  const list = moreListRef.value
  if (!list) return

  const rows = Array.from(list.querySelectorAll<HTMLElement>(':scope > div'))
  if (!rows.length) return

  const gsap = (await import('gsap')).default
  gsap.set(list, { height: 'auto' })
  const targetHeight = list.offsetHeight
  gsap.set(list, { height: 0 })
  gsap.set(rows, { opacity: 0, y: 24 })

  gsap.to(list, { height: targetHeight, duration: 0.6, ease: 'power3.out', clearProps: 'height' })
  gsap.to(rows, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12, delay: 0.15 })
})
</script>

<template>
  <BaseSection as="section" class="bg-paper pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseContainer>
      <div class="flex items-center justify-between gap-12">
        <div>
          <p class="eyebrow">{{ eyebrow }}</p>
          <h1 ref="heroRef" class="mt-4 max-w-3xl text-display-lg text-ink">
            {{ heading }}
          </h1>
          <p ref="introRef" class="mt-6 max-w-xl text-body-lg text-muted">
            {{ intro }}
          </p>
        </div>

        <div class="hidden w-48 shrink-0 lg:block xl:w-56">
          <DoodleWork />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" tight class="bg-paper">
    <BaseContainer>
      <div class="grid grid-cols-1 gap-6 border-t border-navy-100 pt-10 md:grid-cols-12 md:gap-8">
        <p class="eyebrow md:col-span-4">{{ approachEyebrow }}</p>
        <div class="md:col-span-8">
          <h2 ref="approachHeadingRef" class="text-display-sm font-semibold text-ink">
            {{ approachHeading }}
          </h2>
          <p ref="approachBodyRef" class="mt-4 max-w-2xl text-body-md text-muted">
            {{ approachBody }}
          </p>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" tight class="bg-paper">
    <BaseContainer>
      <div>
        <WorkProjectCard
          v-for="(project, index) in primary"
          :key="project.index"
          :project="project"
          :reverse="index % 2 === 1"
        />
      </div>

      <div
        ref="moreListRef"
        class="overflow-hidden"
        :style="!showMore ? { height: 0 } : undefined"
      >
        <div>
          <WorkProjectCard
            v-for="(project, index) in more"
            :key="project.index"
            :project="project"
            :reverse="index % 2 === 1"
          />
        </div>
      </div>

      <div class="mt-16 flex justify-center md:mt-20">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-200 px-7 py-3.5 font-display text-sm font-semibold text-ink transition-colors duration-300 ease-editorial hover:border-yellow-500"
          @click="showMore = !showMore"
        >
          {{ showMore ? viewLessLabel : viewMoreLabel }}
        </button>
      </div>
    </BaseContainer>
  </BaseSection>

  <HomeFinalCta class="rounded-t-[2.5rem]" />
</template>
