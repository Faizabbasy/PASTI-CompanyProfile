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

// Play the reveal-tagged elements' un-reveal tween before a page-to-page
// navigation actually swaps the route, so text/cards visibly retreat
// instead of the page just cutting away mid-reveal. Awaiting inside the
// guard (rather than redirecting) simply holds the pending navigation
// until the tween resolves.
const router = useRouter()

router.beforeEach(async (to, from) => {
  const isFirstNavigation = from.matched.length === 0
  if (isFirstNavigation || to.path === from.path) return true

  const { playLeave } = useLeaveTransition()
  await playLeave()
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
// transition and guarantees the new page component is fully mounted.
async function onPageAfterEnter() {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  ScrollTrigger.refresh()
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <LayoutCustomCursor />
    <LayoutSectionCurtain />
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
