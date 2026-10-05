<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Always start a fresh page load at the top instead of the browser's
// default scroll-restoration (which keeps the last scroll position across
// a reload). Runs before Lenis initializes so there's no smooth-scroll
// animation on load — the page is just already at the top.
if (import.meta.client && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}

useLenis()

// Page-ready signal for Hero/Header's entrance animations (see
// usePageReady.ts) — replaces the former Intro-overlay-driven
// `markIntroReady()` (Milestone 6 legacy decommission removed that whole
// cluster). Flipped once, synchronously, right after client mount: no
// decorative delay, matching what the removed Intro overlay actually did
// in every case that didn't render a decorative sequence (reduced motion,
// or "no intro" selected) — Hero/Header never depended on anything
// intro-specific, only on "it's now safe to animate."
// Now flipped by <LayoutBrandIntro @done> — immediately when the intro is
// skipped (reduced motion / repeat visit in the session), otherwise as the
// intro panel starts lifting away, so Hero's entrance plays underneath it.

// Reduced-motion foundation (08-implementation-plan.md §3.8 / §14 Milestone
// 1): a single `data-reduced-motion` attribute on <html>, set once here,
// that any component's plain CSS can key off (see main.css's
// `[data-reduced-motion='true']` rule) in addition to each GSAP composable's
// own `gsap.matchMedia()` branch and useLenis's existing Lenis-disable
// check. This does not replace those — it's the plain-CSS equivalent for
// styling that isn't driven through GSAP at all. Read once on load rather
// than kept live: a user changing the OS-level setting mid-session is
// expected to reload, matching how useLenis() already behaves (Lenis is
// also decided once, at start, not re-evaluated live).
if (import.meta.client) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.dataset.reducedMotion = String(prefersReducedMotion)
  // Performance tier for mid/low-end devices (see useDeviceTier.ts).
  document.documentElement.dataset.lite = String(isLiteDevice())
}

// Every ScrollTrigger created during initial mount (Hero, WhatWeDo, Service
// rows, etc.) computes its start/end pixel positions against whatever the
// page's layout is at that instant. That layout keeps growing for a beat
// after mount — each section's own onMounted hook creates more of the page
// synchronously as Vue works down the tree, so an early trigger (e.g. the
// first Service row) gets measured against a document that's still much
// shorter than its final height. Nothing self-heals that: the row's
// start/end stay cached against the too-short document forever unless
// something calls refresh() afterwards.
//
// The global `ScrollTrigger.refresh()` was tried first and doesn't fix
// this — on this page (pinned Hero + triggers created inside
// gsap.matchMedia()) it actively recalculates every trigger back to its
// original, too-early value instead of the current, correct one. Verified
// by comparing it directly against each trigger's own instance
// `.refresh()`, which *does* recompute correctly. Per-instance refresh on
// every existing ScrollTrigger sidesteps whatever the global call gets
// wrong. onPageAfterEnter below still uses the global call for subsequent
// route changes, where this discrepancy hasn't been observed.
if (import.meta.client) {
  setTimeout(() => {
    for (const trigger of ScrollTrigger.getAll()) trigger.refresh()
  }, 2000)
}

const router = useRouter()
const { playCover, playReveal } = useRouteCurtain()

// Every page-to-page navigation now plays as a white curtain sliding up to
// fully cover the viewport, then sliding away up and off the top once the
// destination page has mounted — same motion as the in-page "Explore our
// work" jump (LayoutSectionCurtain), reused here for route changes. The
// in-page reveal-tagged elements' un-reveal tween (useLeaveTransition) still
// runs alongside it: the curtain takes 0.55s to fully cover, so without this
// the outgoing page would visibly retreat/cut away for the first stretch of
// that slide rather than the curtain hiding it cleanly throughout.
router.beforeEach(async (to, from) => {
  const isFirstNavigation = from.matched.length === 0
  if (isFirstNavigation || to.path === from.path) return true

  const { playLeave } = useLeaveTransition()
  await Promise.all([playLeave(), playCover()])

  if ('scrollRestoration' in window.history) {
    window.scrollTo(0, 0)
  }

  return true
})

// Persistent elements outside <NuxtPage> (the footer, most notably) never
// remount across navigation, so their ScrollTrigger instances keep whatever
// start/end pixel positions they were created with on the *previous* page.
// If the destination page has a different height, those triggers are now
// stale — the footer's entrance (un-revealed by playLeave above if it was
// in view when the link was clicked) may never re-fire, leaving it stuck
// invisible until a manual reload recreates everything. router.afterEach +
// nextTick fires far too early to fix this: the .page-enter-active CSS
// transition (400ms, see main.css) is still running, and the entering
// page's own useScrollReveal/useMaskedReveal onMounted hooks — which create
// its ScrollTriggers in the first place — haven't necessarily run yet
// either. @after-enter below is Vue's own hook for "this Transition's enter
// animation has actually finished," which both waits out that CSS
// transition and guarantees the new page component is fully mounted — so
// the curtain's reveal (which un-hides the header and destination page) is
// deliberately kicked off from here too, after the new page is actually
// ready to be shown, not the instant the route object changes.
async function onPageAfterEnter() {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  ScrollTrigger.refresh()
  await playReveal()
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <LayoutAmbientLight />
    <LayoutGrainOverlay />
    <LayoutBrandIntro @done="markPageReady" />
    <LayoutCustomCursor />
    <LayoutSectionCurtain />
    <LayoutRouteCurtain />
    <LayoutHeader />
    <LayoutMobileMenu />
    <NuxtPage v-slot="{ Component }">
      <Transition name="page" mode="out-in" @after-enter="onPageAfterEnter">
        <div :key="$route.fullPath">
          <component :is="Component" />
        </div>
      </Transition>
    </NuxtPage>
    <LayoutFooter />
    <LayoutWhatsappFab />
  </div>
</template>
