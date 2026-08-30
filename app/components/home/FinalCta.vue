<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 09 — FINAL CTA.
const { eyebrowLine, headingLine, ctaTo, officeLabel, email } = useFinalCta()
const { primaryCta } = useNavigation()

const eyebrowRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const headingLinkRef = ref<HTMLElement | null>(null)
const ctaButtonRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)

useMaskedReveal(eyebrowRef, { by: 'line' })
useMaskedReveal(headingRef, { by: 'word' })
useMagnetic(headingLinkRef, { strength: 0.25 })
useMagnetic(ctaButtonRef, { strength: 0.35 })
useScrollReveal(footerRef, { y: 16 })

const { setState } = useCustomCursor()

useGsapContext(() => {
  if (!glowRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const anim = gsap.to(glowRef.value, {
      x: 40,
      y: -30,
      duration: 8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
    return () => anim.kill()
  })
})
</script>

<template>
  <BaseSection
    as="section"
    class="relative overflow-hidden bg-navy-950"
    @mouseenter="setState('inverse')"
    @mouseleave="setState('default')"
  >
    <div
      ref="glowRef"
      aria-hidden="true"
      class="pointer-events-none absolute -right-1/4 -top-1/3 h-[36rem] w-[36rem] rounded-full bg-yellow-500/10 blur-3xl"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-1/3 -left-1/4 h-[28rem] w-[28rem] rounded-full bg-navy-700/20 blur-3xl"
    />

    <BaseContainer class="relative">
      <div>
        <p ref="eyebrowRef" class="text-display-md font-display font-semibold text-paper md:text-display-lg">
          {{ eyebrowLine }}
        </p>

        <div ref="headingLinkRef" class="mt-2 inline-block">
          <NuxtLink
            :to="ctaTo"
            class="group inline-block border-b-2 border-navy-700 text-display-md font-display font-semibold leading-[1.15] text-paper transition-colors duration-400 ease-editorial hover:border-yellow-400 hover:text-yellow-400 md:text-display-lg"
            @mouseenter="setState('contact')"
            @mouseleave="setState('inverse')"
          >
            <span ref="headingRef">{{ headingLine }}</span>
          </NuxtLink>
        </div>

        <div ref="ctaButtonRef" class="group mt-10 block w-fit md:mt-12">
          <NuxtLink :to="ctaTo" class="btn-accent" @mouseenter="setState('contact')" @mouseleave="setState('inverse')">
            {{ primaryCta.label }}
            <span aria-hidden="true" class="inline-block transition-transform duration-400 ease-editorial group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>
      </div>

      <div ref="footerRef" class="mt-16 flex flex-col items-start gap-6 border-t border-navy-800 pt-10 sm:flex-row sm:items-center sm:justify-between md:mt-24">
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
