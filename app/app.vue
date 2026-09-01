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
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <LayoutCustomCursor />
    <LayoutSectionCurtain />
    <LayoutHeader />
    <LayoutMobileMenu />
    <NuxtPage v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <div :key="$route.fullPath">
          <component :is="Component" />
        </div>
      </Transition>
    </NuxtPage>
    <LayoutFooter />
  </div>
</template>
