<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 02 — HERO.
const headline = 'Technology. Creativity. Impact.'
const subtext = 'We build technology and creative solutions for businesses ready to move forward.'
const ctaPrimary = { label: 'Explore our work', to: '/work' }
const ctaSecondary = { label: 'Tell us about it', to: '/contact' }

const { introReady } = useIntroReady()

const headingRef = ref<HTMLElement | null>(null)
const headingWrapRef = ref<HTMLElement | null>(null)
const spotlightRef = ref<HTMLElement | null>(null)
const subtextRef = ref<HTMLElement | null>(null)
const ctaRowRef = ref<HTMLElement | null>(null)
const ctaPrimaryRef = ref<HTMLElement | null>(null)

useMagnetic(ctaPrimaryRef, { strength: 0.25 })

/** Wraps a word in the outer-clip / inner-translate mask structure, matching
 * Cuberto's own hero markup exactly (verified via their live DOM): the outer
 * span clips overflow with a negative margin, the inner span carries the
 * translateY reveal with matching positive padding — this compensates for
 * descenders (g, y, p) so they don't get clipped by the outer span's
 * overflow during the reveal. */
function wrapWord(word: string): { outer: HTMLSpanElement; inner: HTMLSpanElement } {
  const outer = document.createElement('span')
  outer.style.overflow = 'clip'
  outer.style.display = 'inline-block'
  outer.style.verticalAlign = 'top'
  outer.style.margin = '-0.2em'

  const inner = document.createElement('span')
  inner.style.display = 'inline-block'
  inner.style.padding = '0.2em'
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
        gsap.set([subtextRef.value, ctaRowRef.value].filter(Boolean), { opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const heading = headingRef.value
        if (!heading) return

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
        gsap.set(allHeadingWords, { yPercent: 120 })
        if (subtextRef.value) gsap.set(subtextRef.value, { opacity: 0, y: 12 })
        if (ctaRowRef.value) gsap.set(ctaRowRef.value, { opacity: 0, y: 12 })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.to(allHeadingWords, { yPercent: 0, duration: 0.65, stagger: 0.03 }, 0)
        if (subtextRef.value) tl.to(subtextRef.value, { opacity: 1, y: 0, duration: 0.5 }, 0.35)
        if (ctaRowRef.value) tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: 0.5 }, 0.45)

        return () => tl.kill()
      })
    },
    { immediate: true }
  )
})

useCursorSpotlight(headingWrapRef, spotlightRef, { radius: 110 })
</script>

<template>
  <BaseSection as="section" class="pb-16 pt-20 md:pb-24 md:pt-28 lg:pt-32">
    <BaseContainer>
      <div class="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div ref="headingWrapRef" class="relative max-w-4xl md:max-w-none">
          <h1 ref="headingRef" class="font-extrabold leading-[1.04] tracking-tight text-display-lg md:text-display-xl">
            {{ headline }}
          </h1>
          <h1
            ref="spotlightRef"
            class="pointer-events-none absolute inset-0 font-extrabold leading-[1.04] tracking-tight text-yellow-500 text-display-lg cursor-spotlight md:text-display-xl"
            aria-hidden="true"
          >
            {{ headline }}
          </h1>
        </div>

        <p ref="subtextRef" class="mt-6 max-w-2xl text-body-lg text-muted">
          {{ subtext }}
        </p>

        <div ref="ctaRowRef" class="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <div ref="ctaPrimaryRef" class="inline-block">
            <NuxtLink :to="ctaPrimary.to" class="btn-primary">
              {{ ctaPrimary.label }}
            </NuxtLink>
          </div>
          <NuxtLink :to="ctaSecondary.to" class="btn-outline">
            {{ ctaSecondary.label }}
          </NuxtLink>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
