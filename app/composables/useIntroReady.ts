const introReady = ref(false)

/**
 * Page-load intro gate. Consumers `watch(introReady, ...)` inside a GSAP
 * timeline (see Hero.vue, Header.vue) and fire their own entrance animation
 * once this is true. Flipped by LayoutIntroOverlay when its sequence
 * finishes (or immediately if reduced motion / dev has no intro selected).
 */
export function useIntroReady() {
  return { introReady }
}

/** Called once by LayoutIntroOverlay when its sequence completes. */
export function markIntroReady() {
  introReady.value = true
}
