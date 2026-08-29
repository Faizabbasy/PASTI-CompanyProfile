<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 02 — HERO.
// Client asked for an exact structural match to Cuberto's own hero: no small label above
// the headline, no CTA row in this section — just headline, then a shorter subtext line
// below it, matching Cuberto's own <h1> + one-paragraph-subtext layout precisely.
const headline = 'Technology. Creativity. Impact.'
const subtext = 'We build technology and creative solutions for businesses ready to move forward.'

const { introReady } = useIntroReady()

const headingRef = ref<HTMLElement | null>(null)
const headingWrapRef = ref<HTMLElement | null>(null)
const spotlightRef = ref<HTMLElement | null>(null)
const subtextRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)

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
        gsap.set([subtextRef.value, visualRef.value].filter(Boolean), { opacity: 1, y: 0, scale: 1, clipPath: 'none' })
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
        if (visualRef.value) gsap.set(visualRef.value, { opacity: 0, scale: 1.05, clipPath: 'inset(4% round 24px)' })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.to(allHeadingWords, { yPercent: 0, duration: 0.65, stagger: 0.03 }, 0)
        if (subtextRef.value) tl.to(subtextRef.value, { opacity: 1, y: 0, duration: 0.5 }, 0.35)
        if (visualRef.value) {
          tl.to(visualRef.value, { opacity: 1, scale: 1, clipPath: 'inset(0% round 24px)', duration: 0.9 }, 0.5)
        }

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
