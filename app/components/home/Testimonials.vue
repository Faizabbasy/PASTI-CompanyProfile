<script setup lang="ts">
// Client-approved testimonial quotes — see useTestimonials.ts. No field for
// this exists in the content mapping doc; the doc's own placement rule says
// to keep this component hidden until real quotes exist, which is now true.
const label = 'What clients say'

const { testimonials } = useTestimonials()

const labelRef = ref<HTMLElement | null>(null)
useMaskedReveal(labelRef, { by: 'word' })

const rotations = ['md:-rotate-2', 'md:rotate-1', 'md:-rotate-1', 'md:rotate-2']
</script>

<template>
  <BaseSection as="section" class="pb-0">
    <BaseContainer>
      <p ref="labelRef" class="eyebrow text-center">
        {{ label }}
      </p>

      <div class="mt-16 grid grid-cols-1 gap-8 md:mt-20 md:grid-cols-2">
        <HomeTestimonialCard
          v-for="(testimonial, i) in testimonials"
          :key="testimonial.name"
          :testimonial="testimonial"
          :rotate="rotations[i % rotations.length] ?? ''"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
