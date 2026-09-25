const pageReady = ref(false)

/**
 * Page-load readiness gate. Consumers `watch(pageReady, ...)` inside a GSAP
 * timeline (see Hero.vue, Header.vue) and fire their own entrance animation
 * once this is true. Flipped once, on client mount, by app.vue.
 *
 * This replaces the former `useIntroReady`/`markIntroReady` — the legacy
 * Intro overlay experience (Milestone 6 legacy decommission) was the only
 * thing that ever called `markIntroReady()`, and even it flipped the flag
 * immediately on mount whenever no intro was selected or reduced motion was
 * active. Hero/Header never actually needed "the intro finished playing" as
 * a signal — only "the client has mounted and it's safe to animate," which
 * this provides directly with no decorative delay layered on top.
 */
export function usePageReady() {
  return { pageReady }
}

/** Called once by app.vue on client mount. */
export function markPageReady() {
  pageReady.value = true
}
