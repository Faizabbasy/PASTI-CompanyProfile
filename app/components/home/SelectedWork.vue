<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 06 — SELECTED WORK.
const heading = 'Selected work'
const cta = 'View all projects'

const { projects } = useSelectedWork()

const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })

type SceneInstance = { wrapperRef: HTMLElement | null; sceneRef: HTMLElement | null; mediaRef: HTMLElement | null; contentRef: HTMLElement | null }
const sceneComponents = ref<SceneInstance[]>([])

// Resolved client-side only (mirrors IntroOverlay.vue's `mounted` pattern):
// server and first client paint always render the 'pinned' desktop stage
// markup, avoiding a hydration mismatch. Kept reactive to both queries for
// the full lifetime of the component (not a one-time onMounted read) so
// resizing across the mobile/desktop breakpoint — or toggling OS reduced-
// motion — updates the DOM structure correctly, per the plan's mandatory
// "resize before/after the section has activated" QA case. 'static'
// (reduced motion) takes priority over 'sticky' (mobile width) — a mobile
// user with reduced motion gets the plain readable list, not a lighter
// version of the sticky choreography. The GSAP setup below watches this
// same ref (via a `watch`, not its own separate matchMedia queries) so the
// two can never disagree about which layout is active.
type SceneLayout = 'pinned' | 'sticky' | 'static'
const sceneLayout = ref<SceneLayout>('pinned')

onMounted(() => {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const mobileQuery = window.matchMedia('(max-width: 767px)')

  function resolveLayout() {
    sceneLayout.value = reducedMotionQuery.matches ? 'static' : mobileQuery.matches ? 'sticky' : 'pinned'
  }

  resolveLayout()
  reducedMotionQuery.addEventListener('change', resolveLayout)
  mobileQuery.addEventListener('change', resolveLayout)

  onBeforeUnmount(() => {
    reducedMotionQuery.removeEventListener('change', resolveLayout)
    mobileQuery.removeEventListener('change', resolveLayout)
  })
})

// PINNED CINEMATIC TAKEOVER SCROLL — see .docs/context/LARGE_SCALE_MOTION_PLAN.md
// section 5 for the full spec and locked timeline this implements. Structurally
// different from the earlier "dominant card scales within a static grid" version
// (shipped and reverted twice for reading as "grid cards with a scale animation"):
// this section's grid is retired entirely in favor of one pinned stage holding all
// 6 projects as absolutely-positioned full-viewport layers. One ScrollTrigger with
// `scrub` drives a single progress value (0-1 across the whole pin distance); every
// layer's transform/opacity is a pure function of that progress, computed in
// `applyProgress` below — not per-layer ScrollTriggers — so there is one source of
// truth and scrolling backward reverses smoothly for free (no separate "reverse"
// animation to author or drift out of sync).
//
// Driven by a `watch` on `sceneLayout`, created inside `onMounted` (not GSAP's
// own matchMedia, and not a top-level `watch` call) so the animation setup
// only ever runs against DOM that has already mounted and populated its
// template refs. A top-level `watch(..., { immediate: true })` was tried
// first and reproduced a real bug: its immediate invocation fired before
// `onMounted` bound `sectionRef`/`stageRef`/`sceneComponents` at all (all
// null/empty), so the entire pin setup silently no-opped — every scene sat
// at `transform: none` and the highest z-index project simply covered the
// others with no motion whatsoever. Creating the watcher inside `onMounted`
// guarantees refs are already bound before its immediate call can fire.
// `sceneLayout` changing later (resize across breakpoints, reduced-motion
// toggle) and the corresponding v-for's ref/class updates land in the same
// Vue render pass, and `watch`'s callback runs after that pass flushes
// (`flush: 'post'`), so `sceneComponents.value` is always current for
// whichever layout is being set up.
if (import.meta.client) {
  let cleanup: (() => void) | undefined
  let stopWatch: (() => void) | undefined

  onMounted(() => {
    stopWatch = watch(
      sceneLayout,
      (layout) => {
        cleanup?.()
        cleanup = undefined

        const section = sectionRef.value
        const stage = stageRef.value
        const scenes = sceneComponents.value
        if (!section || !stage || scenes.length === 0) return

        const sceneEls = scenes.map((s) => s.sceneRef).filter((el): el is HTMLElement => !!el)
        const contentEls = scenes.map((s) => s.contentRef).filter((el): el is HTMLElement => !!el)
        if (sceneEls.length !== projects.length) return

        if (layout === 'static') {
          // SelectedWorkScene.vue already renders these in normal document
          // flow with no transforms applied — nothing to animate.
          return
        }

        if (layout === 'pinned') {
          const mm = gsap.matchMedia()

          // Tablet/desktop share the 'pinned' DOM structure — only the
          // transform amplitude and pin distance differ, so this stays a
          // nested matchMedia (both branches are safe to re-run on resize
          // without touching the DOM structure itself).
          mm.add(
            { isTablet: '(max-width: 1024px)', isDesktop: '(min-width: 1025px)' },
            (context) => {
              const { isTablet } = context.conditions as { isTablet: boolean }

              const recedeScale = isTablet ? 0.985 : 0.97
              const recedeBrightness = isTablet ? 0.92 : 0.85
              const riseDistanceVh = isTablet ? 60 : 100
              const pinDistanceVh = isTablet ? 420 : 560

              gsap.set(contentEls, { y: 24, autoAlpha: 0 })

              // Locked timeline (see plan): 0-8% entry hold, then 6 rise
              // spans (one per project), each followed by a hold before the
              // next project's rise begins — projects 05/06 compress their
              // hold to land the sequence at exactly 100%, a deliberate
              // pacing taper, not a bug. [riseStart, riseEnd] pairs per
              // project index (0-based); the hold after a rise is simply the
              // gap before the next project's riseStart.
              const riseSpans: [number, number][] = [
                [0.08, 0.22], // Project 01
                [0.30, 0.44], // Project 02
                [0.52, 0.66], // Project 03
                [0.74, 0.88], // Project 04
                [0.92, 0.96], // Project 05
                [0.96, 1.00] // Project 06
              ]
              const enterEase = gsap.parseEase(spatialEase.enter)

              function applyProgress(progress: number) {
                riseSpans.forEach(([start, end], i) => {
                  const scene = sceneEls[i]
                  const content = contentEls[i]
                  if (!scene) return

                  const riseProgress = gsap.utils.clamp(0, 1, gsap.utils.normalize(start, end, progress))
                  const eased = enterEase(riseProgress)

                  // This project's own rise: from off-screen below
                  // (riseDistanceVh) to its resting position (0), easing in
                  // as progress crosses its span. Per direct feedback, this
                  // transform lives on `scene` (the whole card — image,
                  // title and index together) so the WHOLE CARD is what
                  // visibly rises and covers the previous one, not just the
                  // image inside a static frame. The image itself
                  // (mediaEls) gets no separate scale tween any more — it
                  // just sits still inside the card, filling its frame via
                  // object-cover the same way SelectedWorkCard.vue's grid
                  // cards always did ("gambar-nya biarin aja berjajar kaya
                  // biasanya").
                  const yPercent = i === 0 ? 0 : riseDistanceVh * (1 - eased)

                  // Receding under the NEXT project's rise: as project i+1
                  // crosses its own rise span, this project scales down/dims
                  // slightly rather than disappearing — still visible
                  // peeking behind, per the "physical sheet stack" depth
                  // requirement.
                  const nextSpan = riseSpans[i + 1]
                  const coverProgress = nextSpan
                    ? gsap.utils.clamp(0, 1, gsap.utils.normalize(nextSpan[0], nextSpan[1], progress))
                    : 0

                  gsap.set(scene, {
                    yPercent,
                    scale: gsap.utils.interpolate(1, recedeScale, coverProgress),
                    filter: `brightness(${gsap.utils.interpolate(1, recedeBrightness, coverProgress)})`
                  })

                  if (content) {
                    gsap.set(content, { y: gsap.utils.interpolate(24, 0, eased), autoAlpha: eased })
                  }
                })
              }

              applyProgress(0)

              const pin = ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: `+=${pinDistanceVh}%`,
                pin: stage,
                pinSpacing: true,
                scrub: 0.6,
                onUpdate: (self) => applyProgress(self.progress)
              })

              return () => pin.kill()
            }
          )

          cleanup = () => mm.revert()
          return
        }

        // 'sticky' (mobile): no pin at all. Each scene participates in
        // normal document flow (SelectedWorkScene.vue renders `position:
        // sticky` for this layout) so it sticks to the viewport top and gets
        // naturally covered by the next scene scrolling over it — the
        // "layer covers layer" identity without a JS-driven pin, per the
        // plan's mobile stability preference. GSAP only adds a lightweight
        // reveal as each scene becomes the active sticky layer.
        const wrapperEls = scenes.map((s) => s.wrapperRef).filter((el): el is HTMLElement => !!el)
        if (wrapperEls.length !== projects.length) return

        gsap.set(contentEls, { y: 16, autoAlpha: 0 })

        // Triggering off `wrapperEls` (the tall, non-sticky outer block), not
        // `sceneEls` (the sticky element itself) — see the note in
        // SelectedWorkScene.vue's defineExpose for why.
        const triggers = wrapperEls.map((wrapper, i) => {
          const scene = sceneEls[i]
          const content = contentEls[i]
          return ScrollTrigger.create({
            trigger: wrapper,
            start: 'top top',
            end: 'top top-=20%',
            scrub: 0.4,
            onUpdate: (self) => {
              if (scene) {
                gsap.set(scene, {
                  scale: gsap.utils.interpolate(0.985, 1, self.progress),
                  filter: `brightness(${gsap.utils.interpolate(0.92, 1, self.progress)})`
                })
              }
              if (content) {
                gsap.set(content, { y: gsap.utils.interpolate(16, 0, self.progress), autoAlpha: self.progress })
              }
            }
          })
        })

        cleanup = () => triggers.forEach((t) => t.kill())
      },
      // `immediate: true` still matters here even though the watcher is now
      // created inside `onMounted`: `sceneLayout` was already resolved to its
      // final value by the earlier `onMounted` (registered first, so it runs
      // first) before this one runs, and a plain `watch` only fires on an
      // actual value CHANGE — without `immediate`, the common case (value
      // resolves to 'pinned', same as the ref's initial default) would never
      // trigger this callback at all.
      { flush: 'post', immediate: true }
    )
  })

  onBeforeUnmount(() => {
    stopWatch?.()
    cleanup?.()
  })
}
</script>

<template>
  <BaseSection id="selected-work" as="section" tight class="relative overflow-hidden rounded-t-[2.5rem] bg-navy-950 py-16 md:py-20">
    <div ref="sectionRef" class="relative">
      <BaseContainer>
        <h2 ref="headingRef" class="text-display-lg text-paper">
          {{ heading }}
        </h2>
      </BaseContainer>

      <!-- 'sticky' gets no gap between scenes: the classic CSS sticky-stack
           pattern requires each scene's containing block to sit flush
           against the next (each is exactly `h-screen` tall) so one scene's
           sticky child stays pinned at the top for its container's full
           scroll length, then the next container's sticky child takes over
           the instant the previous container's bottom edge reaches the
           viewport top — a gap here would show a plain scrolling gap
           between "covers", breaking the seamless takeover illusion. -->
      <div
        ref="stageRef"
        class="relative mt-16 w-full"
        :class="{
          'h-screen overflow-hidden': sceneLayout === 'pinned',
          'flex flex-col overflow-visible': sceneLayout === 'sticky',
          'flex flex-col gap-16': sceneLayout === 'static'
        }"
      >
        <HomeSelectedWorkScene
          v-for="(project, index) in projects"
          ref="sceneComponents"
          :key="project.index"
          :project="project"
          :index="index"
          :layout="sceneLayout"
        />
      </div>

      <BaseContainer>
        <div class="mt-16 flex justify-center md:mt-20">
          <NuxtLink
            to="/work"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper transition-colors duration-300 ease-editorial hover:border-yellow-500"
          >
            {{ cta }}
          </NuxtLink>
        </div>
      </BaseContainer>
    </div>
  </BaseSection>
</template>
