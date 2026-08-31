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
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <LayoutCustomCursor />
    <LayoutHeader />
    <LayoutMobileMenu />
    <NuxtPage />
    <LayoutFooter />
  </div>
</template>
