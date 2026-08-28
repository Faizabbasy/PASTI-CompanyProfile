<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 09 — FINAL CTA.
const { eyebrowLine, headingLine, ctaTo, officeLabel, email } = useFinalCta()

const eyebrowRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const headingLinkRef = ref<HTMLElement | null>(null)

useMaskedReveal(eyebrowRef, { by: 'line' })
useMaskedReveal(headingRef, { by: 'word' })
useMagnetic(headingLinkRef, { strength: 0.25 })

const { setState } = useCustomCursor()
</script>

<template>
  <BaseSection as="section" class="bg-navy-950" @mouseenter="setState('inverse')" @mouseleave="setState('default')">
    <BaseContainer>
      <div>
        <p ref="eyebrowRef" class="text-display-md font-display font-semibold text-paper md:text-display-lg">
          {{ eyebrowLine }}
        </p>

        <div ref="headingLinkRef" class="mt-2 inline-block">
          <NuxtLink
            :to="ctaTo"
            class="group inline-block text-display-md font-display font-semibold text-paper underline decoration-navy-700 underline-offset-8 transition-colors duration-400 ease-editorial hover:text-yellow-400 hover:decoration-yellow-400 md:text-display-lg"
            @mouseenter="setState('contact')"
            @mouseleave="setState('inverse')"
          >
            <span ref="headingRef">{{ headingLine }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center md:mt-20">
        <NuxtLink v-if="email" :to="`mailto:${email}`" class="btn-outline border-navy-700 text-paper hover:border-paper">
          {{ email }}
        </NuxtLink>

        <p class="text-body-sm text-navy-300">
          <span class="eyebrow text-navy-400">{{ officeLabel }}</span>
        </p>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
