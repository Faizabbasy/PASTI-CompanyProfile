import gsap from 'gsap'

/**
 * Scopes a GSAP setup function to a gsap.context() tied to the calling
 * component's lifetime, so every tween/ScrollTrigger it creates is killed
 * automatically on unmount — required to avoid duplicate ScrollTrigger
 * instances across route re-entry and HMR.
 */
export function useGsapContext(setup: (ctx: gsap.Context) => void) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined

  onMounted(() => {
    ctx = gsap.context(setup)
  })

  onBeforeUnmount(() => {
    ctx?.revert()
  })
}
