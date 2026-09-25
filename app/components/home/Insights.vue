<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Editorial Intelligence in Motion, Not a Horizontal Blog Carousel
// (04-homepage-spec.md §7). Copy sourced from .docs/PASTI_Cuberto_Template_
// Content_Mapping.docx, section 08 — INSIGHTS.
const heading = 'Insights'
const cta = 'View all'

const { articles } = useInsights()
const featured = articles.find((a) => a.role === 'featured')!
const supporting = articles.filter((a) => a.role === 'supporting').slice(0, 3)
const homepageArticles = [featured, ...supporting]

const sectionRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const compositionRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const signalRef = ref<HTMLElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })

// Reading State Marker Signal (04-homepage-spec.md §7, locked narrow scope):
// a restrained marker + short structural cue, optional small numeral. Not a
// category selector, not a progress bar. `activeIndex` reflects which
// article state is currently active during the sticky progression.
const activeIndex = ref(0)

useGsapContext(() => {
  const section = sectionRef.value
  const composition = compositionRef.value
  const canvas = canvasRef.value
  const track = trackRef.value
  const heading = headingRef.value
  if (!section || !composition || !canvas || !track || !heading) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Entrance: normal vertical flow only — heading mask reveal (via
    // useMaskedReveal above) → Featured appears → Supporting stagger in →
    // composition settles → THEN the Sticky Editorial Canvas begins.
    // Horizontal motion must not start immediately on section entry.
    const cards = Array.from(composition.querySelectorAll<HTMLElement>('.insight-card'))
    gsap.set(cards, { opacity: 0, y: 28 })

    const entrance = gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: motionDuration.editorial,
      ease: approvedEase.gsapStandard,
      stagger: motionStagger.base,
      scrollTrigger: { trigger: composition, start: 'top 80%', toggleActions: 'restart none restart reverse' }
    })

    // Sticky Editorial Canvas — deliberately LIGHT, not another Heavy pinned
    // section: short pin distance, flatter/quieter than Platforms' Spatial
    // World Transfer will be. Heading prominence reduces (scales down,
    // settles as a quieter anchor) as the canvas holds; it does not stay at
    // full scale through the whole progression.
    //
    // Milestone 5A final closure: gated at Desktop (1024px), not the
    // legacy 768px `md` boundary — see breakpointQuery.desktopUp/
    // belowDesktop. Tablet gets the same lighter, non-sticky vertical feed
    // as Mobile ("do not use full sticky progression if it reads as
    // desktop-heavy behavior" — a short pin+scrub IS that, so Tablet skips
    // it entirely, same as Mobile).
    const isBelowDesktop = window.matchMedia(breakpointQuery.belowDesktop).matches
    if (isBelowDesktop) {
      // Tablet + Mobile: no pin, no horizontal progression — natural
      // vertical feed (handled entirely by normal document flow + the
      // entrance above).
      return
    }

    const trackDistance = () => track.scrollWidth - canvas.clientWidth

    const cardEls = Array.from(track.querySelectorAll<HTMLElement>('.insight-card'))

    const st = ScrollTrigger.create({
      trigger: canvas,
      start: 'top top+=80',
      end: () => `+=${Math.max(trackDistance(), 1) * 1.1}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        gsap.set(track, { x: -trackDistance() * self.progress })
        gsap.set(heading, {
          scale: 1 - self.progress * 0.28,
          opacity: 1 - self.progress * 0.35,
          transformOrigin: '0% 50%'
        })
        const count = homepageArticles.length
        const active = Math.min(count - 1, Math.floor(self.progress * count))
        activeIndex.value = active

        // Active/inactive emphasis (locked values, deliberately lighter
        // than Testimoni's 35-50%): active 100%, inactive ~75-85% — content
        // here must stay scannable, not merely decorative.
        cardEls.forEach((el, i) => {
          gsap.set(el, { opacity: i === active ? 1 : 0.8 })
        })
      }
    })

    return () => st.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    const cards = Array.from(composition.querySelectorAll<HTMLElement>('.insight-card'))
    gsap.set(cards, { opacity: 1, y: 0 })
    gsap.set(heading, { scale: 1, opacity: 1 })
  })
})
</script>

<template>
  <BaseSection ref="sectionRef" as="section" class="surface-light">
    <BaseContainer>
      <div class="flex items-center justify-center gap-3">
        <!-- Signal — Reading State Marker: restrained, narrow-scope. Not a
             category selector (category stays in article metadata), not a
             progress bar, not a carousel indicator. -->
        <span ref="signalRef" aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />
        <p class="eyebrow text-navy-500">
          {{ String(activeIndex + 1).padStart(2, '0') }}/{{ String(homepageArticles.length).padStart(2, '0') }}
        </p>
      </div>

      <h2 ref="headingRef" class="mt-4 text-center text-display-lg">
        {{ heading }}
      </h2>

      <!-- Digital Editorial Feature + 3 Supporting, close in visual weight
           (one may be slightly more dominant, none becomes a second
           Featured) — not 4 equal cards, not a giant-card-plus-tiny-cards
           layout. Composition settles in normal vertical flow before the
           Sticky Editorial Canvas (below) begins any horizontal motion. -->
      <div ref="compositionRef" class="mt-16 desktop:mt-20">
        <!-- Tablet + Mobile (locked, Milestone 5A final closure): natural
             vertical editorial feed — Featured → Supporting → Supporting →
             Supporting, plain block flow, no horizontal scroll container at
             all, below `desktop` (1024px). Desktop only: the flex/overflow
             track becomes the Sticky Editorial Canvas's horizontal
             progression surface once pinned (script gates the pin+scrub
             behind the same desktop-only matchMedia branch, see
             breakpointQuery.desktopUp/belowDesktop above). -->
        <div ref="canvasRef" data-motion-canvas class="flex flex-col gap-8 desktop:block desktop:overflow-hidden">
          <div ref="trackRef" data-motion-track class="flex flex-col gap-8 desktop:w-max desktop:flex-row desktop:gap-8">
            <HomeInsightsCard :article="featured" role="featured" data-motion-card class="insight-card desktop:w-[46rem] desktop:shrink-0" />
            <HomeInsightsCard
              v-for="article in supporting"
              :key="article.index"
              :article="article"
              role="supporting"
              data-motion-card
              class="insight-card desktop:w-[26rem] desktop:shrink-0"
            />
          </div>
        </div>
      </div>

      <div class="mt-16 flex justify-center desktop:mt-20">
        <NuxtLink
          to="/insights"
          class="inline-flex items-center justify-center gap-2 rounded-button border border-navy-200 px-7 py-3.5 font-display text-sm font-semibold text-ink transition-colors duration-400 ease-editorial hover:border-cobalt hover:text-cobalt"
        >
          {{ cta }}
        </NuxtLink>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
