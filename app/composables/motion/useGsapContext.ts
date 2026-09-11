import gsap from 'gsap'

/**
 * Scopes a GSAP setup function to a gsap.context() tied to the calling
 * component's lifetime, so every tween/ScrollTrigger it creates is killed
 * automatically on unmount — required to avoid duplicate ScrollTrigger
 * instances across route re-entry and HMR.
 *
 * `setup` may optionally return a plain cleanup function for resources
 * gsap.context() cannot track on its own (e.g. a WebGL renderer, a
 * ResizeObserver, a raw event listener). That function is invoked once on
 * unmount, after `ctx.revert()`. Most existing callers return nothing
 * (undefined), which is a no-op here — this is purely additive.
 */
export function useGsapContext(setup: (ctx: gsap.Context) => void | (() => void)) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined
  let extraCleanup: (() => void) | undefined

  onMounted(() => {
    ctx = gsap.context(() => {
      extraCleanup = setup(ctx as gsap.Context) ?? undefined
    })
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    extraCleanup?.()
  })
}
