<script setup lang="ts">
const eyebrow = 'Portfolio'
const heading = 'Selected work'
const intro = 'A closer look at how we work with our clients — the brief, and the result. Tap a project to read the full story.'
const viewMoreLabel = 'View more projects'
const viewLessLabel = 'Show less'

const { primary, more } = useWorkPortfolio()

const showMore = ref(false)

const heroRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)
const moreGridRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useScrollReveal(introRef, { y: 16 })

watch(showMore, async (open) => {
  if (!open) return
  await nextTick()
  const grid = moreGridRef.value
  if (!grid) return

  const cards = Array.from(grid.querySelectorAll<HTMLElement>(':scope > div'))
  if (!cards.length) return

  const gsap = (await import('gsap')).default
  gsap.set(grid, { height: 'auto' })
  const targetHeight = grid.offsetHeight
  gsap.set(grid, { height: 0 })
  gsap.set(cards, { opacity: 0, y: 24 })

  gsap.to(grid, { height: targetHeight, duration: 0.6, ease: 'power3.out', clearProps: 'height' })
  gsap.to(cards, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12, delay: 0.15 })
})
</script>

<template>
  <BaseSection as="section" class="bg-navy-950 pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseContainer>
      <p class="eyebrow text-yellow-500">{{ eyebrow }}</p>
      <h1 ref="heroRef" class="mt-4 max-w-3xl text-display-lg text-paper">
        {{ heading }}
      </h1>
      <p ref="introRef" class="mt-6 max-w-xl text-body-lg text-navy-300">
        {{ intro }}
      </p>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" tight class="bg-navy-950">
    <BaseContainer>
      <div class="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
        <WorkProjectCard
          v-for="(project, index) in primary"
          :key="project.index"
          :project="project"
          :offset="index % 2 === 1"
        />
      </div>

      <div
        ref="moreGridRef"
        class="overflow-hidden"
        :style="!showMore ? { height: 0 } : undefined"
      >
        <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:mt-20 md:grid-cols-2">
          <WorkProjectCard
            v-for="(project, index) in more"
            :key="project.index"
            :project="project"
            :offset="index % 2 === 1"
          />
        </div>
      </div>

      <div class="mt-16 flex justify-center md:mt-20">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper transition-colors duration-300 ease-editorial hover:border-yellow-500"
          @click="showMore = !showMore"
        >
          {{ showMore ? viewLessLabel : viewMoreLabel }}
        </button>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
