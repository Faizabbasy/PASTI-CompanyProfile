const introReady = ref(false)
let scheduled = false

/**
 * Page-load intro gate — mirrors Cuberto's brief blank beat before its entrance
 * animation starts, rather than firing hero animations the instant Vue mounts.
 * Consumers `watch(introReady, ...)` inside a GSAP timeline (see Hero.vue) and
 * fire their entrance animation once this flips true. Superseded the earlier
 * CSS-only `[data-intro]` / `animation-play-state` approach (see HANDOFF.md's
 * `@layer utilities` cascade gotcha) with a GSAP-driven timeline instead.
 */
export function useIntroReady() {
  if (import.meta.client && !scheduled) {
    scheduled = true
    requestAnimationFrame(() => {
      setTimeout(() => {
        introReady.value = true
      }, 100)
    })
  }

  return { introReady }
}
