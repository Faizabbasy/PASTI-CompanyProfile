<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 02 — HERO.
const eyebrow = 'Technology. Creativity. Impact.'
const headline = 'We build technology and creative solutions for businesses ready to move forward.'
const ctaPrimary = { label: 'Explore our work', to: '/work' }
const ctaSecondary = { label: 'Tell us about it', to: '/contact' }

const { introReady } = useIntroReady()

const eyebrowRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const ctaRowRef = ref<HTMLElement | null>(null)
const primaryCtaRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)

useMagnetic(primaryCtaRef, { strength: 0.3 })

/** Wraps a word in the outer-clip / inner-translate mask structure used
 * across the site's masked reveals (see useMaskedReveal for the shared
 * version used elsewhere; Hero builds it inline because its reveal is
 * hand-timed into one master timeline rather than independently triggered). */
function wrapWord(word: string): { outer: HTMLSpanElement; inner: HTMLSpanElement } {
  const outer = document.createElement('span')
  outer.style.overflow = 'clip'
  outer.style.display = 'inline-block'
  outer.style.verticalAlign = 'top'

  const inner = document.createElement('span')
  inner.style.display = 'inline-block'
  inner.textContent = word

  outer.appendChild(inner)
  return { outer, inner }
}

useGsapContext(() => {
  watch(
    introReady,
    (ready, _oldValue, onCleanup) => {
      if (!ready) return

      const mm = gsap.matchMedia()
      onCleanup(() => mm.revert())

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([eyebrowRef.value, ctaRowRef.value, visualRef.value].filter(Boolean), { opacity: 1, y: 0, scale: 1, clipPath: 'none' })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const eyebrowInner = eyebrowRef.value
        const heading = headingRef.value
        if (!eyebrowInner || !heading) return

        const eyebrowWords: HTMLElement[] = []
        const eyebrowText = eyebrowInner.textContent ?? ''
        eyebrowInner.textContent = ''
        for (const part of eyebrowText.split(/(\s+)/).filter(Boolean)) {
          if (/^\s+$/.test(part)) {
            eyebrowInner.appendChild(document.createTextNode(part))
            continue
          }
          const { outer, inner } = wrapWord(part)
          eyebrowInner.appendChild(outer)
          eyebrowWords.push(inner)
        }

        const allHeadingWords: HTMLElement[] = []
        const headingText = heading.textContent ?? ''
        heading.textContent = ''
        for (const part of headingText.split(/(\s+)/).filter(Boolean)) {
          if (/^\s+$/.test(part)) {
            heading.appendChild(document.createTextNode(part))
            continue
          }
          const { outer, inner } = wrapWord(part)
          heading.appendChild(outer)
          allHeadingWords.push(inner)
        }
        gsap.set([...eyebrowWords, ...allHeadingWords], { yPercent: 120 })
        if (ctaRowRef.value) gsap.set(ctaRowRef.value, { opacity: 0, y: 16 })
        if (visualRef.value) gsap.set(visualRef.value, { opacity: 0, scale: 1.05, clipPath: 'inset(4% round 24px)' })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.to(eyebrowWords, { yPercent: 0, duration: 0.6, stagger: 0.04 }, 0)
        tl.to(allHeadingWords, { yPercent: 0, duration: 0.8, stagger: 0.02 }, 0.15)
        if (ctaRowRef.value) tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: 0.7 }, 0.7)
        if (visualRef.value) {
          tl.to(visualRef.value, { opacity: 1, scale: 1, clipPath: 'inset(0% round 24px)', duration: 1.0 }, 0.8)
        }

        return () => tl.kill()
      })
    },
    { immediate: true }
  )
})
</script>

<template>
  <BaseSection as="section" class="pb-16 pt-20 md:pb-24 md:pt-28 lg:pt-32">
    <BaseContainer>
      <div class="mx-auto flex max-w-4xl flex-col items-center text-center md:max-w-5xl">
        <p ref="eyebrowRef" class="eyebrow">
          {{ eyebrow }}
        </p>

        <h1 ref="headingRef" class="mt-6 max-w-3xl text-display-sm md:max-w-none md:text-display-md">
          {{ headline }}
        </h1>

        <div ref="ctaRowRef" class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div ref="primaryCtaRef" class="w-full sm:w-auto">
            <NuxtLink :to="ctaPrimary.to" class="btn-accent w-full sm:w-auto">
              {{ ctaPrimary.label }}
            </NuxtLink>
          </div>
          <NuxtLink :to="ctaSecondary.to" class="btn-outline w-full sm:w-auto">
            {{ ctaSecondary.label }}
          </NuxtLink>
        </div>
      </div>
    </BaseContainer>

    <div class="container-page mt-16 md:mt-20">
      <div
        ref="visualRef"
        class="aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 md:aspect-[21/9]"
        aria-hidden="true"
      />
    </div>
  </BaseSection>
</template>
