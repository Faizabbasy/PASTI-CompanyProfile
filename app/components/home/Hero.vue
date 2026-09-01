<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 02 — HERO.
const headline = 'Technology. Creativity. Impact.'
const subtext = 'We build technology and creative solutions for businesses ready to move forward.'
const ctaPrimary = { label: 'Explore our work', to: '#selected-work' }
const ctaSecondary = { label: 'Tell us about it' }

const { link: whatsappLink } = useWhatsapp()
const { introReady } = useIntroReady()
const { playTo } = useSectionCurtain()

function goToSelectedWork() {
  playTo(ctaPrimary.to)
}

const headingRef = ref<HTMLElement | null>(null)
const headingWrapRef = ref<HTMLElement | null>(null)
const spotlightRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)
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
  inner.dataset.revealEl = ''
  inner.dataset.revealKind = 'mask'

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
        if (subtextRef.value) {
          subtextRef.value.dataset.revealEl = ''
          subtextRef.value.dataset.revealKind = 'scroll'
        }
        if (ctaRowRef.value) {
          ctaRowRef.value.dataset.revealEl = ''
          ctaRowRef.value.dataset.revealKind = 'scroll'
        }

        gsap.set(allHeadingWords, { yPercent: 120 })
        if (subtextRef.value) gsap.set(subtextRef.value, { opacity: 0, y: 12 })
        if (ctaRowRef.value) gsap.set(ctaRowRef.value, { opacity: 0, y: 12 })
        if (shineRef.value) gsap.set(shineRef.value, { opacity: 0, backgroundPosition: '130% 130%' })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.to(allHeadingWords, { yPercent: 0, duration: 0.9, stagger: 0.08 })
        tl.addLabel('shineStart')
        if (subtextRef.value) tl.to(subtextRef.value, { opacity: 1, y: 0, duration: 0.6 }, 'shineStart+=0.1')
        if (ctaRowRef.value) tl.to(ctaRowRef.value, { opacity: 1, y: 0, duration: 0.6 }, 'shineStart+=0.2')

        // Shine sweep: a one-off "kinclong" touch on the headline once its
        // own word reveal has settled — a diagonal light band travels
        // across the text toward the top-right. Positioned relative to the
        // 'shineStart' label on the SAME timeline as the reveal (not a
        // separate hardcoded-delay timeline), so it always starts right as
        // the reveal finishes.
        if (shineRef.value) {
          tl.to(
            shineRef.value,
            { opacity: 1, backgroundPosition: '-30% -30%', duration: 2.2, ease: 'cubic-bezier(0.65, 0, 0.35, 1)' },
            'shineStart'
          )
          tl.set(shineRef.value, { opacity: 0 })
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
          <h1
            ref="shineRef"
            class="pointer-events-none absolute inset-0 font-extrabold leading-[1.04] tracking-tight text-display-lg hero-shine md:text-display-xl"
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
            <a :href="ctaPrimary.to" class="btn-primary" @click.prevent="goToSelectedWork">
              {{ ctaPrimary.label }}
            </a>
          </div>
          <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="btn-outline">
            {{ ctaSecondary.label }}
          </a>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
