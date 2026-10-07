<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// FEATURED CASE STUDIES (owner decision 2026-10-07, Work Step 3) — replaces
// the legacy "From brief to result" case files. Deeper proof than the
// Selected Work index above it: challenge → what was built → outcome, from
// COMPRO 2025 (useFeaturedCases, public cases only).
//
// Desktop (>= 1024px): split layout — a sticky tablist on the left, the
// active case's panel on the right. One case at a time; arrow keys / Home /
// End move between tabs. On change the panel's visual unmasks upward and its
// blocks settle in (power3/4.out). No autoplay, no carousel, no modal.
// Below desktop: a stacked accordion, one case open at a time.
// Both layouts are in the DOM and swapped with CSS (SSR-safe); the hidden
// one is display:none, so it is out of the a11y tree and loads no images.
// Reduced motion: no transitions, everything static and readable.
const { publicCases } = useFeaturedCases()
const { active, openCase } = useActiveCase()
const pad = (n: number) => String(n).padStart(2, '0')

const sectionRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const tabRefs = ref<HTMLElement[]>([])
const accHeadRefs = ref<HTMLElement[]>([])

// Mobile accordion: mirrors the active case, but may also be fully closed.
const openAcc = ref<string | null>(active.value)
watch(active, (id) => (openAcc.value = id))

const reduce = () => import.meta.client && window.matchMedia(reducedMotionQuery.reduce).matches
const refreshTriggers = () => setTimeout(() => ScrollTrigger.refresh(), 560)

useMaskedReveal(headingRef, { by: 'word' })

// Tabs — automatic activation, roving focus.
const selectTab = (i: number) => {
  const n = publicCases.length
  const next = (i + n) % n
  active.value = publicCases[next]!.id
  tabRefs.value[next]?.focus()
}
const onTabKey = (e: KeyboardEvent, i: number) => {
  const map: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: publicCases.length - 1 }
  if (!(e.key in map)) return
  e.preventDefault()
  selectTab(map[e.key]!)
}

// Desktop panel change: visual unmasks, blocks settle — restrained.
watch(active, async (id) => {
  await nextTick()
  if (reduce()) return
  const panel = document.getElementById(`case-panel-${id}`)
  if (!panel || !panel.offsetParent) return
  const visual = panel.querySelector('[data-cp-visual]')
  const blocks = panel.querySelectorAll('[data-cp-anim]')
  gsap.fromTo(visual, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, overwrite: true })
  gsap.fromTo(blocks, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.05, overwrite: true })
  refreshTriggers()
})

// Accordion toggle: one open; bring the opened header back into view.
const toggleAcc = (id: string, i: number) => {
  if (openAcc.value === id) {
    openAcc.value = null
    refreshTriggers()
    return
  }
  openAcc.value = id
  active.value = id
  setTimeout(() => {
    const head = accHeadRefs.value[i]
    if (!head) return
    const top = head.getBoundingClientRect().top
    if (top >= 0 && top < window.innerHeight * 0.4) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(head, { offset: -90, duration: 0.9 })
    else window.scrollTo({ top: window.scrollY + top - 90, behavior: reduce() ? 'auto' : 'smooth' })
  }, 540)
  refreshTriggers()
}

// Deep link (#case-<id>): activate at once, but scroll only once the page is
// scrollable — app.vue resets to the top on load and the first-visit
// BrandIntro locks scrolling (Lenis stopped + html overflow hidden) for ~3s.
let cancelDeepLink: (() => void) | undefined
onMounted(() => {
  const id = location.hash.replace(/^#case-/, '')
  if (!id || !publicCases.some((c) => c.id === id)) return
  active.value = id
  cancelDeepLink = whenScrollable(() => openCase(id))
})
onBeforeUnmount(() => cancelDeepLink?.())

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const rows = section.querySelectorAll<HTMLElement>('[data-fc-row]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(rows, { autoAlpha: 0, x: -32 })
    const tl = gsap.to(rows, { autoAlpha: 1, x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.08, scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    return () => tl.kill()
  })
})
</script>

<template>
  <section id="work-cases" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <!-- Hash targets for #case-<id> links (the router's scrollBehavior
         looks them up); FeaturedCases handles the actual scroll. -->
    <span v-for="c in publicCases" :id="`case-${c.id}`" :key="c.id" aria-hidden="true" class="pointer-events-none absolute left-0 top-0" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Case studies" :meta="`${pad(publicCases.length)} featured`" />
      <div class="m-center mt-12 max-w-[30ch] desktop:mt-16 desktop:max-w-none">
        <h2 ref="headingRef" class="font-display text-[length:clamp(40px,6vw,96px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-pureWhite">
          Featured <span class="text-pastiYellow-500">case studies.</span>
        </h2>
        <p class="mt-6 max-w-[44ch] text-token-body-large text-[color:rgba(255,255,255,0.68)] m-center">
          Real challenges. Practical solutions. Meaningful outcomes.
        </p>
      </div>

      <!-- DESKTOP: tablist + active panel -->
      <div class="mt-16 hidden desktop:grid desktop:grid-cols-12 desktop:gap-10">
        <div class="col-span-4">
          <div class="sticky top-28">
            <div role="tablist" aria-label="Featured case studies" aria-orientation="vertical" class="border-b border-[color:rgba(255,255,255,0.14)]">
              <button
                v-for="(c, i) in publicCases"
                :id="`case-tab-${c.id}`"
                :key="c.id"
                :ref="(el) => { if (el) tabRefs[i] = el as HTMLElement }"
                data-fc-row
                type="button"
                role="tab"
                :aria-selected="active === c.id"
                :aria-controls="`case-panel-${c.id}`"
                :tabindex="active === c.id ? 0 : -1"
                class="fc-tab group relative flex w-full items-start gap-5 border-t border-[color:rgba(255,255,255,0.14)] py-6 pl-5 text-left transition-colors duration-300 focus-visible:outline-none"
                @click="active = c.id"
                @keydown="onTabKey($event, i)"
              >
                <span aria-hidden="true" class="absolute bottom-0 left-0 top-0 w-[3px] origin-top bg-pastiYellow-500 transition-transform duration-500 ease-editorial" :class="active === c.id ? 'scale-y-100' : 'scale-y-0'" />
                <span class="pt-1.5 font-mono text-[11px] transition-colors duration-300" :class="active === c.id ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.4)]'">{{ c.index }}</span>
                <span class="min-w-0">
                  <span class="block font-display text-[24px] font-extrabold leading-[1.1] tracking-[-0.03em] transition-colors duration-300" :class="active === c.id ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.5)] group-hover:text-[color:rgba(255,255,255,0.8)]'">{{ c.title }}</span>
                  <span class="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.45)]">{{ c.category }}</span>
                </span>
              </button>
            </div>
            <p class="mt-6 font-mono text-[11px] tracking-[0.18em] text-[color:rgba(255,255,255,0.45)]">
              <span class="text-pureWhite">{{ pad(publicCases.findIndex((c) => c.id === active) + 1) }}</span> / {{ pad(publicCases.length) }}
            </p>
          </div>
        </div>

        <!-- All panels share one grid cell, so the stage keeps the tallest
             case's height and switching never jumps the page. Inactive
             panels are visibility:hidden (out of the a11y tree, unfocusable). -->
        <div class="col-span-8 grid">
          <div
            v-for="c in publicCases"
            :id="`case-panel-${c.id}`"
            :key="c.id"
            role="tabpanel"
            :aria-labelledby="`case-tab-${c.id}`"
            :tabindex="active === c.id ? 0 : -1"
            class="self-start rounded-[24px] [grid-area:1/1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500"
            :class="active === c.id ? '' : 'invisible'"
          >
            <div class="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 class="font-display text-[clamp(32px,3.2vw,52px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-pureWhite">{{ c.title }}</h3>
              <span v-if="c.client || c.year" class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">{{ [c.client, c.year].filter(Boolean).join(' · ') }}</span>
            </div>
            <WorkFeaturedCasePanel :item="c" />
          </div>
        </div>
      </div>

      <!-- BELOW DESKTOP: accordion -->
      <ol class="mt-12 border-b border-[color:rgba(255,255,255,0.14)] desktop:hidden">
        <li v-for="(c, i) in publicCases" :key="c.id" data-fc-row class="border-t border-[color:rgba(255,255,255,0.14)]">
          <h3 class="text-pureWhite">
            <button
              :id="`case-acc-head-${c.id}`"
              :ref="(el) => { if (el) accHeadRefs[i] = el as HTMLElement }"
              type="button"
              class="flex w-full items-center gap-4 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500"
              :aria-expanded="openAcc === c.id"
              :aria-controls="`case-acc-${c.id}`"
              @click="toggleAcc(c.id, i)"
            >
              <span class="font-mono text-[11px]" :class="openAcc === c.id ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.45)]'">{{ c.index }}</span>
              <span class="min-w-0 flex-1">
                <span class="block font-display text-[clamp(22px,6vw,32px)] font-extrabold leading-[1.08] tracking-[-0.03em]">{{ c.title }}</span>
                <span class="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.5)]">{{ c.category }}</span>
              </span>
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300" :class="openAcc === c.id ? 'rotate-45 bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(255,255,255,0.1)] text-pureWhite'">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
              </span>
            </button>
          </h3>
          <div
            :id="`case-acc-${c.id}`"
            role="region"
            :aria-labelledby="`case-acc-head-${c.id}`"
            class="grid transition-[grid-template-rows] duration-500 ease-editorial motion-reduce:transition-none"
            :class="openAcc === c.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            :inert="openAcc !== c.id"
          >
            <div class="min-w-0 overflow-hidden">
              <div class="pb-10">
                <p v-if="c.client || c.year" class="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">{{ [c.client, c.year].filter(Boolean).join(' · ') }}</p>
                <WorkFeaturedCasePanel :item="c" />
              </div>
            </div>
          </div>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>

<style scoped>
.fc-tab:focus-visible {
  outline: 2px solid #fbba00; /* pastiYellow-500 */
  outline-offset: -2px;
}
</style>
