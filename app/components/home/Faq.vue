<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, sections 13
// — FAQ: REPLACE TEMPLATE QUESTIONS and 14 — FAQ ANSWERS / PASTI COPY.
const heading = 'FAQ'

const { items } = useFaq()

const headingRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

useGsapContext(() => {
  if (!glowRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const anim = gsap.to(glowRef.value, {
      x: -30,
      y: 40,
      duration: 9,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
    return () => anim.kill()
  })
})
</script>

<template>
  <BaseSection as="section" class="relative overflow-hidden bg-navy-950">
    <div
      ref="glowRef"
      aria-hidden="true"
      class="pointer-events-none absolute -right-1/4 top-0 h-[32rem] w-[32rem] rounded-full bg-yellow-500/10 blur-3xl"
    />

    <BaseContainer class="relative">
      <div class="relative inline-block">
        <!-- Swiss/editorial corner-bracket accent, same motif as Hero/Why
             PASTI, anchored to the heading's own bounding box (not the
             container) so it stays visually attached to "FAQ" at any
             viewport width instead of drifting to the container's edge. -->
        <span
          aria-hidden="true"
          class="pointer-events-none absolute -right-6 -top-3 hidden h-8 w-8 border-r-2 border-t-2 border-yellow-500/20 sm:block md:-right-8"
        />

        <h2 ref="headingRef" class="text-display-lg text-paper">
          {{ heading }}
        </h2>
      </div>

      <div class="mt-16 md:mt-20">
        <HomeFaqItem v-for="item in items" :key="item.index" :item="item" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
