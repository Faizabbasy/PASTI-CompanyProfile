const coverTrigger = ref(0)
const revealTrigger = ref(0)
const covering = ref(false)

let resolveCover: (() => void) | undefined
let resolveReveal: (() => void) | undefined

/**
 * Module-level singleton driving LayoutRouteCurtain.vue: a full-screen white
 * panel that slides up to cover the viewport before a route change, then
 * slides away (up and off the top) once the destination page has mounted —
 * same slide-up-cover / slide-up-reveal motion as useSectionCurtain's
 * in-page "Explore our work" jump, reused here for page-to-page navigation
 * instead of a same-page scroll jump.
 *
 * `covering` flips true the instant the cover animation starts and back to
 * false once the reveal animation finishes — Header.vue watches it to
 * replay its entrance stagger (logo/nav/CTA fading down from -12px) in sync
 * with the curtain lifting, so the navbar reads as "arriving" with each new
 * page rather than sitting there static across every navigation.
 */
export function useRouteCurtain() {
  function playCover(): Promise<void> {
    covering.value = true
    coverTrigger.value += 1
    return new Promise((resolve) => {
      resolveCover = resolve
    })
  }

  function playReveal(): Promise<void> {
    revealTrigger.value += 1
    return new Promise((resolve) => {
      resolveReveal = resolve
    })
  }

  function resolveCoverDone() {
    resolveCover?.()
    resolveCover = undefined
  }

  function resolveRevealDone() {
    covering.value = false
    resolveReveal?.()
    resolveReveal = undefined
  }

  return {
    coverTrigger: readonly(coverTrigger),
    revealTrigger: readonly(revealTrigger),
    covering: readonly(covering),
    playCover,
    playReveal,
    resolveCoverDone,
    resolveRevealDone
  }
}
