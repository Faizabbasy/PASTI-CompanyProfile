<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// FEATURED CASE STUDIES — "case reel + dossier" (owner 2026-10-08: make it
// stand apart from the site's other tab/list sections).
//
// 1. Reel: the four cases as tall image strips (ARIA tabs). The active strip
//    opens wide and shows its lead visual in full — posters full-bleed,
//    dashboards / UI as a floating sheet on navy; the others fold into
//    narrow strips with a vertical title. Widths ease via flex-grow (CSS).
//    Below desktop the same buttons become a horizontal swipe rail of cards.
// 2. Dossier: the active case as a report — a sticky "file cover" on the
//    left (outlined index, title, client · year, context, prev / next) and
//    numbered chapters on the right (WorkFeaturedCasePanel). Inactive
//    dossiers are display:none (in the DOM for SEO, no images loaded).
//
// On case change the cover's numeral and title rise from a mask and the
// chapters settle in (power3/4.out). No autoplay. Reduced motion: static.
// Deep links (#case-<id>) and the Project Index badges go through
// useActiveCase().openCase.
const { publicCases } = useFeaturedCases()
const { active, openCase } = useActiveCase()
const pad = (n: number) => String(n).padStart(2, '0')

const sectionRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const tabRefs = ref<HTMLElement[]>([])

const activeIndex = computed(() => Math.max(0, publicCases.findIndex((c) => c.id === active.value)))
const lead = (c: (typeof publicCases)[number]) => approvedVisuals(c)[0] ?? null

const reduce = () => import.meta.client && window.matchMedia(reducedMotionQuery.reduce).matches
const refreshTriggers = () => setTimeout(() => ScrollTrigger.refresh(), 760)

useMaskedReveal(headingRef, { by: 'word' })

const select = (i: number, focus = false) => {
  const n = publicCases.length
  const next = (i + n) % n
  active.value = publicCases[next]!.id
  if (focus) tabRefs.value[next]?.focus()
  // Phone rail only: centre the chosen card by scrolling the rail itself
  // (scrollIntoView would also shift the overflow-hidden section sideways).
  const card = tabRefs.value[next]
  const rail = card?.parentElement
  if (card && rail && rail.scrollWidth > rail.clientWidth + 1) {
    rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' })
  }
}
const onTabKey = (e: KeyboardEvent, i: number) => {
  const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: publicCases.length - 1 }
  if (!(e.key in map)) return
  e.preventDefault()
  select(map[e.key]!, true)
}
const step = (dir: 1 | -1) => select(activeIndex.value + dir)

// Case change: the cover rises, chapters settle.
watch(active, async (id) => {
  await nextTick()
  refreshTriggers()
  if (reduce()) return
  const panel = document.getElementById(`case-panel-${id}`)
  if (!panel) return
  const rise = panel.querySelectorAll('[data-fd-rise]')
  const blocks = panel.querySelectorAll('[data-cp-anim]')
  gsap.fromTo(rise, { yPercent: 105 }, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.06, overwrite: true })
  gsap.fromTo(blocks, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.06, delay: 0.1, overwrite: true })
})

let cancelDeepLink: (() => void) | undefined
onMounted(() => {
  const id = location.hash.replace(/^#case-/, '')
  if (!id || !publicCases.some((c) => c.id === id)) return
  active.value = id
  cancelDeepLink = whenScrollable(() => openCase(id))
})
onBeforeUnmount(() => cancelDeepLink?.())

// Entrance: the reel unmasks upward, strip by strip.
useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const strips = section.querySelectorAll<HTMLElement>('[data-fc-strip]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(strips, { clipPath: 'inset(100% 0% 0% 0% round 22px)' })
    const tl = gsap.to(strips, {
      clipPath: 'inset(0% 0% 0% 0% round 22px)',
      duration: motionTier.cinematicMax * 0.75,
      ease: approvedEase.gsapCinematic,
      stagger: 0.08,
      scrollTrigger: { trigger: section.querySelector('[data-fc-reel]'), start: 'top 80%', once: true },
      onComplete: () => gsap.set(strips, { clearProps: 'clipPath' })
    })
    return () => tl.kill()
  })
})
</script>

<template>
  <section id="work-cases" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <div aria-hidden="true" class="pointer-events-none absolute -right-[20%] top-[8%] h-[60vw] max-h-[760px] w-[60vw] max-w-[760px] rounded-full opacity-60" style="background: radial-gradient(closest-side, rgba(251, 186, 0, 0.14), transparent)" />
    <!-- Hash targets for #case-<id> links (router scrollBehavior). -->
    <span v-for="c in publicCases" :id="`case-${c.id}`" :key="c.id" aria-hidden="true" class="pointer-events-none absolute left-0 top-0" />

    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Case studies" :meta="`${pad(publicCases.length)} featured`" />

      <div class="mt-12 grid gap-6 desktop:mt-16 desktop:grid-cols-12 desktop:items-end desktop:gap-10">
        <h2 ref="headingRef" class="m-center font-display text-[length:clamp(40px,6vw,96px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-pureWhite desktop:col-span-8">
          Featured <span class="text-pastiYellow-500">case studies.</span>
        </h2>
        <div class="m-center desktop:col-span-4 desktop:pb-3">
          <p class="text-token-body-large text-[color:rgba(255,255,255,0.7)]">Real challenges. Practical solutions. Meaningful outcomes.</p>
          <p class="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.45)]">
            <span class="hidden desktop:inline">Select a case</span><span class="desktop:hidden">Swipe &amp; tap a case</span>
          </p>
        </div>
      </div>
    </BaseContainer>

    <!-- ===== REEL ===== -->
    <div class="relative z-10 mt-12 desktop:mt-16" data-fc-reel>
      <div class="container-page desktop:px-[max(4vw,calc((100vw-1440px)/2+4vw))]">
        <div
          role="tablist"
          aria-label="Featured case studies"
          class="snap-rail -mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-gutter px-gutter pb-2 desktop:mx-0 desktop:h-[min(64svh,600px)] desktop:min-h-[460px] desktop:snap-none desktop:overflow-visible desktop:px-0 desktop:pb-0"
        >
          <button
            v-for="(c, i) in publicCases"
            :id="`case-tab-${c.id}`"
            :key="c.id"
            :ref="(el) => { if (el) tabRefs[i] = el as HTMLElement }"
            data-fc-strip
            type="button"
            role="tab"
            :aria-selected="active === c.id"
            :aria-controls="`case-panel-${c.id}`"
            :tabindex="active === c.id ? 0 : -1"
            class="fc-strip group relative aspect-[4/5] w-[74vw] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-[22px] text-left ring-1 transition-[flex-grow,box-shadow] duration-700 ease-editorial focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500 desktop:aspect-auto desktop:w-auto desktop:min-w-0 desktop:max-w-none desktop:shrink"
            :class="active === c.id ? 'is-active grow-[6] ring-pastiYellow-500' : 'grow ring-[color:rgba(255,255,255,0.12)] desktop:hover:grow-[1.5]'"
            @click="select(i)"
            @keydown="onTabKey($event, i)"
          >
            <!-- Visual -->
            <template v-if="lead(c)">
              <img
                v-if="lead(c)!.kind === 'poster'"
                :src="lead(c)!.src"
                alt=""
                loading="lazy"
                decoding="async"
                draggable="false"
                class="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-editorial"
                :class="active === c.id ? 'scale-100' : 'scale-[1.08]'"
              >
              <div v-else class="absolute inset-0 bg-[linear-gradient(160deg,#0a4b6c_0%,#022f47_70%)]">
                <div aria-hidden="true" class="absolute -bottom-[30%] -right-[20%] h-[80%] w-[80%] rounded-full" style="background: radial-gradient(closest-side, rgba(251, 186, 0, 0.28), transparent)" />
                <img
                  :src="lead(c)!.src"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  class="fc-sheet absolute left-[8%] top-[12%] w-[150%] max-w-none rounded-[12px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-[color:rgba(255,255,255,0.2)] transition-transform duration-[1200ms] ease-editorial desktop:left-[9%] desktop:top-[14%] desktop:w-[min(860px,150%)]"
                >
              </div>
            </template>
            <div v-else class="absolute inset-0 bg-[color:rgba(255,255,255,0.06)]" />

            <!-- Shade: heavy when folded, a bottom gradient when open -->
            <span aria-hidden="true" class="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,36,54,0)_40%,rgba(2,36,54,0.75)_68%,rgba(2,36,54,0.97)_100%)]" />
            <span aria-hidden="true" class="absolute inset-0 bg-[color:rgba(2,36,54,0.62)] transition-opacity duration-700" :class="active === c.id ? 'opacity-0' : 'opacity-0 desktop:opacity-100'" />

            <!-- Index -->
            <span class="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[color:rgba(2,36,54,0.72)] px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] ring-1 ring-[color:rgba(255,255,255,0.14)]">
              <span class="h-1.5 w-1.5 rounded-full" :class="active === c.id ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.4)]'" />{{ c.index }}
            </span>

            <!-- Folded (desktop): vertical title -->
            <span
              aria-hidden="true"
              class="fc-vtitle absolute bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-display text-[22px] font-extrabold tracking-[-0.02em] text-pureWhite transition-opacity duration-500 desktop:block"
              :class="active === c.id ? 'opacity-0' : 'opacity-100 delay-200'"
            >{{ c.title }}</span>

            <!-- Open: caption -->
            <span
              class="absolute inset-x-5 bottom-5 block transition-[opacity,transform] duration-500 desktop:inset-x-8 desktop:bottom-8"
              :class="active === c.id ? 'translate-y-0 opacity-100 delay-300' : 'desktop:translate-y-4 desktop:opacity-0'"
            >
              <span class="block font-mono text-[10px] uppercase tracking-[0.18em] text-pastiYellow-500">{{ c.category }}</span>
              <span class="mt-2 block font-display text-[length:clamp(22px,2.6vw,40px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-pureWhite">{{ c.title }}</span>
              <span v-if="c.client || c.year" class="mt-2 block text-[13px] text-[color:rgba(255,255,255,0.7)]">{{ [c.client, c.year].filter(Boolean).join(' · ') }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== DOSSIER ===== -->
    <BaseContainer class="relative z-10">
      <div id="case-dossier" class="mt-14 desktop:mt-24">
        <div
          v-for="(c, i) in publicCases"
          v-show="active === c.id"
          :id="`case-panel-${c.id}`"
          :key="c.id"
          role="tabpanel"
          :aria-labelledby="`case-tab-${c.id}`"
          tabindex="0"
          class="grid gap-12 focus-visible:outline-none desktop:grid-cols-12 desktop:gap-10"
        >
          <!-- File cover -->
          <aside class="m-center desktop:sticky desktop:top-28 desktop:col-span-4 desktop:self-start">
            <div class="overflow-hidden">
              <span data-fd-rise class="fc-outline block font-display text-[length:clamp(120px,16vw,220px)] font-extrabold leading-[0.82] tracking-[-0.06em]">{{ c.index }}</span>
            </div>
            <div class="mt-6 overflow-hidden pb-1">
              <h3 data-fd-rise class="font-display text-[length:clamp(30px,3vw,46px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-pureWhite">{{ c.title }}</h3>
            </div>
            <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-pastiYellow-500">{{ c.category }}</p>
            <dl v-if="c.client || c.year" class="m-center-row mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-[color:rgba(255,255,255,0.14)] pt-5">
              <div v-if="c.client">
                <dt class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.45)]">Client</dt>
                <dd class="mt-1 text-[15px] font-semibold text-pureWhite">{{ c.client }}</dd>
              </div>
              <div v-if="c.year">
                <dt class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.45)]">Year</dt>
                <dd class="mt-1 text-[15px] font-semibold text-pureWhite">{{ c.year }}</dd>
              </div>
            </dl>
            <p v-if="c.businessContext" class="mt-6 text-[17px] leading-relaxed text-[color:rgba(255,255,255,0.8)]">{{ c.businessContext }}</p>

            <div class="m-center-row mt-8 flex items-center gap-3">
              <button type="button" class="grid h-12 w-12 place-items-center rounded-full ring-1 ring-[color:rgba(255,255,255,0.25)] transition-colors duration-300 hover:bg-pureWhite hover:text-slateNavy focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :aria-label="`Previous case: ${publicCases[(i - 1 + publicCases.length) % publicCases.length]!.title}`" @click="step(-1)">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 8H3M7 4L3 8l4 4" /></svg>
              </button>
              <span class="font-mono text-[12px] tracking-[0.18em] text-[color:rgba(255,255,255,0.5)]"><span class="text-pureWhite">{{ c.index }}</span> / {{ pad(publicCases.length) }}</span>
              <button type="button" class="group grid h-12 w-12 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-300 active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pureWhite" :aria-label="`Next case: ${publicCases[(i + 1) % publicCases.length]!.title}`" @click="step(1)">
                <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
            </div>
          </aside>

          <!-- Chapters -->
          <div class="min-w-0 desktop:col-span-8">
            <WorkFeaturedCasePanel :item="c" />
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.fc-outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(251, 186, 0, 0.8); /* pastiYellow-500 */
}
.fc-vtitle {
  writing-mode: vertical-rl;
  transform: translateX(-50%) rotate(180deg);
}
/* Dashboards drift a little when their strip opens. */
.fc-strip .fc-sheet {
  transform: translate3d(6%, 4%, 0) rotate(-3deg);
}
.fc-strip.is-active .fc-sheet {
  transform: translate3d(0, 0, 0) rotate(-2deg);
}
[data-reduced-motion='true'] .fc-strip,
[data-reduced-motion='true'] .fc-strip * {
  transition: none !important;
}
</style>
