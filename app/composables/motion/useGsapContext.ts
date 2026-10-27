import gsap from 'gsap'
import { getCurrentScope } from 'vue'
import { scheduleMotion } from './motionQueue'

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
export function useGsapContext(setup: (ctx: gsap.Context) => void | (() => void), opts: { defer?: boolean } = {}) {
  if (!import.meta.client) return

  let ctx: gsap.Context | undefined
  let cancel: (() => void) | undefined
  // The component's effect scope: a deferred setup runs inside it, so any
  // watch() it creates is still stopped when the component unmounts.
  const scope = getCurrentScope()

  onMounted(() => {
    // Default: queued (motionQueue.ts) so the page's motion setup is spread
    // over short tasks. `defer: false` for app-shell pieces that must be
    // ready immediately (header, route curtains).
    if (opts.defer === false) {
      ctx = gsap.context(setup)
      return
    }
    cancel = scheduleMotion(() => {
      const run = () => {
        ctx = gsap.context(setup)
      }
      if (scope?.active) scope.run(run)
      else run()
    })
  })

  onBeforeUnmount(() => {
    cancel?.()
    ctx?.revert()
  })
}
