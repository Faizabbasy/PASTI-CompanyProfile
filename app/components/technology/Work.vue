<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// TECHNOLOGY CASE STUDIES (COMPRO rebuild 2026-10-07) — the public Featured
// Cases from /work (each with its own approved metrics) followed by the
// technology portfolio projects; every card links to its /work entry.
// Desktop + motion: the stage pins and the row of poster cards travels
// sideways with the scroll (each poster drifting inside its frame for depth),
// with a scrubbed progress line. Touch / tablet / reduced motion: the very
// same track is a native swipe rail (scroll-snap + BaseSnapControls).
const { cases: projects } = useTechnology()
const { setState } = useCustomCursor()

const stageRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const { active, touched, go, next, prev } = useSnapRail(trackRef)
const pinnedIndex = ref(0)

useGsapContext(() => {
  const stage = stageRef.value
  const track = trackRef.value
  if (!stage || !track) return
  const heads = stage.querySelectorAll<HTMLElement>('[data-tw-head]')
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(heads, { yPercent: 110 })
    const tl = gsap.to(heads, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08, scrollTrigger: { trigger: stage, start: 'top 70%', once: true } })
    return () => tl.kill()
  })
  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(heads, { yPercent: 0 })
  })

  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    // Pinned horizontal travel replaces native scrolling of the track.
    track.style.overflowX = 'visible'
    track.style.scrollSnapType = 'none'
    const images = track.querySelectorAll<HTMLElement>('[data-tw-img]')
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80)

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressRef.value) progressRef.value.style.transform = `scaleX(${self.progress})`
          pinnedIndex.value = Math.min(projects.length - 1, Math.round(self.progress * (projects.length - 1)))
        }
      }
    })
    tl.to(track, { x: () => -distance() }, 0)
    tl.fromTo(images, { xPercent: -6 }, { xPercent: 6 }, 0)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      gsap.set(track, { clearProps: 'x' })
      gsap.set(images, { clearProps: 'xPercent' })
      track.style.overflowX = ''
      track.style.scrollSnapType = ''
    }
  })
})

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <section class="surface-light relative overflow-hidden" style="--lift-x: 10%; --lift-y: 90%">
    <div ref="stageRef" class="relative flex flex-col py-24 desktop:h-[100svh] desktop:min-h-[700px] desktop:justify-center desktop:py-0">
      <BaseGridLines tone="light" />

      <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="Case studies" :meta="`${pad(projects.length)} projects`" />
        <div class="m-center-row mt-10 flex items-end justify-between gap-8 desktop:mt-8">
          <div class="m-center">
            <div class="overflow-hidden">
              <p data-tw-head class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
                <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Proof of delivery
              </p>
            </div>
            <div class="mt-3 overflow-hidden pb-1">
              <h2 data-tw-head class="hero-title">
                Technology case studies<span class="text-pastiYellow-500">.</span>
              </h2>
            </div>
          </div>
          <!-- Desktop counter + scrubbed progress -->
          <div class="hidden w-56 shrink-0 flex-col items-end gap-3 desktop:flex">
            <span class="font-display text-token-body-large font-semibold tabular-nums text-slateNavy">{{ pad(pinnedIndex + 1) }}<span class="text-[color:rgba(3,60,89,0.35)]"> / {{ pad(projects.length) }}</span></span>
            <span class="relative block h-[3px] w-full overflow-hidden rounded-full bg-[color:rgba(3,60,89,0.12)]">
              <span ref="progressRef" class="absolute inset-0 origin-left scale-x-0 bg-pastiYellow-500" />
            </span>
          </div>
        </div>
      </BaseContainer>

      <ul
        ref="trackRef"
        class="snap-rail relative z-10 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-gutter px-gutter pb-2 desktop:mt-12 desktop:gap-8 desktop:px-[max(4vw,calc((100vw-1440px)/2+4vw))]"
        aria-label="Technology projects"
      >
        <li
          v-for="(p, i) in projects"
          :key="p.title"
          class="w-[78vw] max-w-[340px] shrink-0 snap-start desktop:w-auto desktop:max-w-none"
        >
          <NuxtLink
            :to="p.to"
            class="group/tw block rounded-[22px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slateNavy"
            :aria-label="`${p.kind === 'case' ? 'Read the case study' : 'View project'}: ${p.title}`"
            @mouseenter="setState('view', p.kind === 'case' ? 'Case study' : 'View')"
            @mouseleave="setState('default')"
          >
            <div
              class="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-[color:rgba(3,60,89,0.12)] shadow-[0_40px_80px_-40px_rgba(3,60,89,0.6)] desktop:h-[52svh] desktop:w-auto"
              :class="p.imageKind === 'screen' ? 'bg-pureWhite' : 'bg-slateNavy'"
            >
              <img
                data-tw-img
                :src="p.image"
                :alt="p.title"
                :loading="i < 2 ? 'eager' : 'lazy'"
                class="h-full w-full origin-top transition-transform duration-700 ease-editorial"
                :class="p.imageKind === 'screen' ? 'scale-[1.12] object-cover object-left-top group-hover/tw:scale-[1.18]' : 'scale-[1.14] object-cover object-top group-hover/tw:scale-[1.2]'"
                draggable="false"
              >
              <span class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" :class="p.kind === 'case' ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(3,60,89,0.92)] text-pureWhite'">
                {{ p.kind === 'case' ? 'Case study' : 'Project' }}
              </span>
              <!-- Approved metrics, only with their own case. -->
              <div v-if="p.metrics.length" class="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] bg-[color:rgba(3,60,89,0.15)]">
                <div v-for="m in p.metrics" :key="m.label" class="bg-slateNavy px-3.5 py-3">
                  <span class="block font-display text-[26px] font-extrabold leading-none tracking-[-0.04em] text-pastiYellow-500">{{ m.value }}</span>
                  <span class="mt-1 block text-[11px] leading-tight text-[color:rgba(255,255,255,0.78)]">{{ m.label }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 max-w-[340px] px-1">
              <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-cobalt">{{ p.category }}</span>
              <h3 class="mt-1.5 font-display text-[22px] font-bold leading-[1.15] tracking-[-0.02em] text-slateNavy">{{ p.title }}</h3>
              <p class="mt-2 inline-flex items-center gap-2 text-[14px] font-semibold text-[color:rgba(3,60,89,0.7)] transition-colors duration-300 group-hover/tw:text-slateNavy">
                {{ p.client ?? (p.kind === 'case' ? 'Read the case study' : 'View in Work') }}
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 transition-transform duration-300 group-hover/tw:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <BaseContainer class="relative z-10 mt-6 desktop:hidden">
        <BaseSnapControls :count="projects.length" :active="active" :touched="touched" noun="project" @go="go" @prev="prev" @next="next" />
      </BaseContainer>
    </div>
  </section>
</template>
