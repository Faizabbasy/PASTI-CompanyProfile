<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 09 — FINAL CTA.
const { eyebrowLine, headingLine, ctaTo, officeLabel, email } = useFinalCta()
const { primaryCta } = useNavigation()
const { link: whatsappLink } = useWhatsapp()

const sectionRef = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const headingLinkRef = ref<HTMLElement | null>(null)
const ctaButtonRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
const glowSecondaryRef = ref<HTMLElement | null>(null)

// Kinetic Brand Convergence: the eyebrow line gets a letter-by-letter
// depth reveal (echoing Why PASTI's blur/scale technique, bigger/more
// dramatic), timed to sync with the glows converging behind it
// (LARGE_SCALE_MOTION_PLAN.md section 11).
useMaskedReveal(eyebrowRef, { by: 'letter', blur: true, stagger: motionStagger.tight })
useMaskedReveal(headingRef, { by: 'word' })
useMagnetic(headingLinkRef, { strength: 0.25 })
useMagnetic(ctaButtonRef, { strength: 0.35 })
useScrollReveal(footerRef, { y: 16 })

const { setState } = useCustomCursor()

useGsapContext(() => {
  const glow = glowRef.value
  const glowSecondary = glowSecondaryRef.value
  const section = (sectionRef.value as unknown as { $el?: HTMLElement })?.$el ?? (sectionRef.value as unknown as HTMLElement)
  if (!glow || !glowSecondary || !section) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Climax convergence: both glows pull toward each other once as the
    // section enters, then settle back into an independent ambient drift —
    // not a simple linear yoyo, and not a continuous scrub (a climax needs
    // a choreography that completes).
    const convergeTl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'restart none restart reverse' }
    })

    convergeTl
      .to(glow, { x: -60, y: 50, scale: 1.15, duration: spatialDuration.cinematic, ease: spatialEase.enter }, 0)
      .to(glowSecondary, { x: 50, y: -60, scale: 1.15, duration: spatialDuration.cinematic, ease: spatialEase.enter }, 0)
      .to([glow, glowSecondary], { scale: 1, duration: 1, ease: spatialEase.settle }, '>-0.2')
      .add(() => {
        // Ambient drift loop, unchanged in character from before.
        gsap.to(glow, { x: 40, y: -30, duration: 8, ease: spatialEase.drift, yoyo: true, repeat: -1 })
        gsap.to(glowSecondary, { x: -40, y: 30, duration: 9, ease: spatialEase.drift, yoyo: true, repeat: -1 })
      })

    return () => convergeTl.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set([glow, glowSecondary], { x: 0, y: 0, scale: 1 })
  })
})
</script>

<template>
  <BaseSection
    ref="sectionRef"
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
      ref="glowSecondaryRef"
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
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-accent"
            @mouseenter="setState('contact')"
            @mouseleave="setState('inverse')"
          >
            {{ primaryCta.label }}
            <span aria-hidden="true" class="inline-block transition-transform duration-400 ease-editorial group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      <!-- Contact row only once real contact data exists (no empty "Our
           office" label with nothing under it). -->
      <div v-if="email" ref="footerRef" class="mt-16 flex flex-col items-start gap-6 border-t border-navy-800 pt-10 sm:flex-row sm:items-center sm:justify-between md:mt-24">
        <NuxtLink :to="`mailto:${email}`" class="btn-outline border-navy-700 text-paper hover:border-paper">
          {{ email }}
        </NuxtLink>

        <p class="text-body-sm text-navy-300">
          <span class="eyebrow text-navy-400">{{ officeLabel }}</span>
        </p>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
