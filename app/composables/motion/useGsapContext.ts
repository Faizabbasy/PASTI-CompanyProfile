import gsap from 'gsap'

/**
 * Scopes a GSAP setup function to a gsap.context() tied to the calling
 * component's lifetime, so every tween/ScrollTrigger it creates is killed
 * automatically on unmount — required to avoid duplicate ScrollTrigger
 * instances across route re-entry and HMR.
 *
 * `setup` may optionally return a plain cleanup function for resources
 * gsap.context() cannot track via tweens/ScrollTriggers alone (e.g. a WebGL
 * renderer, a ResizeObserver, a raw event listener). GSAP's own Context
 * class already captures a returned function from its setup callback and
 * invokes it as part of revert()/kill() (see gsap-core.js's Context.add()
 * and Context.prototype.kill) — so passing `setup` straight to
 * gsap.context() is sufficient; no separate cleanup-tracking is needed
 * here. Most existing callers return nothing (undefined), which GSAP
 * simply ignores.
 */
export function useGsapContext(setup: (ctx: gsap.Context) => void | (() => void)) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined

  onMounted(() => {
    ctx = gsap.context(setup)
  })

  onBeforeUnmount(() => {
    ctx?.revert()
  })
}
