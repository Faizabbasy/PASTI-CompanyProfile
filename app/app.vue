<script setup lang="ts">
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
// page's layout is at that instant. That layout keeps shifting for a beat
// after mount from several independent, hard-to-enumerate causes (web
// fonts swapping in, a pinned section's spacer landing on ScrollTrigger's
// own next internal refresh pass rather than synchronously, images without
// reserved dimensions) — nothing self-heals a trigger whose start/end was
// cached against a since-changed document height. Reproduced concretely:
// Services' scroll-to-open accordion rows stopped opening at all once the
// page's total height changed ~1s after mount. Rather than chase each
// individual cause (tried a one-shot refresh on document.fonts.ready
// first — didn't cover the pin-spacer case), watch the document's actual
// height and refresh whenever it changes during the first few seconds
// after mount, then stop watching — steady-state scroll interactions
// don't need this, and onPageAfterEnter below already covers subsequent
// route changes.
if (import.meta.client) {
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
    let lastHeight = document.documentElement.scrollHeight
    let debounceTimer: ReturnType<typeof setTimeout> | undefined

    const observer = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight
      if (height === lastHeight) return
      lastHeight = height

      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => ScrollTrigger.refresh(), 50)
    })
    observer.observe(document.body)

    setTimeout(() => observer.disconnect(), 5000)
  })
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
