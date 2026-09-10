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
    <LayoutIntroOverlay />
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
  </div>
</template>
