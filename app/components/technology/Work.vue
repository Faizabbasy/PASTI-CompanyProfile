<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// SELECTED TECHNOLOGY WORK — the technology projects from useSelectedWork
// (the corporate-campaign project is left to the Creative page).
// Desktop + motion: the stage pins and the row of poster cards travels
// sideways with the scroll (each poster drifting inside its frame for depth),
// with a scrubbed progress line. Touch / tablet / reduced motion: the very
// same track is a native swipe rail (scroll-snap + BaseSnapControls).
const { projects: allProjects } = useSelectedWork()
const projects = allProjects.filter((p) => !/campaign/i.test(p.category))

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
        <BaseSectionMark surface="light" label="In production" :meta="`${pad(projects.length)} projects`" />
        <div class="m-center-row mt-10 flex items-end justify-between gap-8 desktop:mt-8">
          <div class="m-center">
            <div class="overflow-hidden">
              <p data-tw-head class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
                <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />Selected Work
              </p>
            </div>
            <div class="mt-3 overflow-hidden pb-1">
              <h2 data-tw-head class="font-display text-[length:clamp(40px,5.6vw,88px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slateNavy">
                Technology at work<span class="text-pastiYellow-500">.</span>
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
          :key="p.index"
          class="w-[74vw] max-w-[340px] shrink-0 snap-start desktop:w-auto desktop:max-w-none"
        >
          <article class="group/tw">
            <div class="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-[color:rgba(3,60,89,0.12)] bg-slateNavy shadow-[0_40px_80px_-40px_rgba(3,60,89,0.6)] desktop:h-[52svh] desktop:w-auto">
              <img
                data-tw-img
                :src="p.image"
                :alt="p.title"
                :loading="i < 2 ? 'eager' : 'lazy'"
                class="h-full w-full origin-top scale-[1.14] object-cover object-top transition-transform duration-700 ease-editorial group-hover/tw:scale-[1.2]"
                draggable="false"
              >
              <span class="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-[color:rgba(3,60,89,0.92)] px-3 py-1.5">
                <LayoutBrandMark surface="dark" :height="9" />
                <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.25)]" />
                <span class="font-mono text-[10px] tracking-[0.14em] text-pureWhite">{{ pad(i + 1) }}</span>
              </span>
            </div>
            <div class="mt-4 max-w-[340px] px-1">
              <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-cobalt">{{ p.category }}</span>
              <h3 class="mt-1.5 font-display text-[22px] font-bold leading-[1.15] tracking-[-0.02em] text-slateNavy">{{ p.title }}</h3>
            </div>
          </article>
        </li>
      </ul>

      <BaseContainer class="relative z-10 mt-6 desktop:hidden">
        <BaseSnapControls :count="projects.length" :active="active" :touched="touched" noun="project" @go="go" @prev="prev" @next="next" />
      </BaseContainer>
    </div>
  </section>
</template>
