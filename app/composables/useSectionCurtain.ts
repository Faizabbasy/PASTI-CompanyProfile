const trigger = ref(0)
const targetSelector = ref('')
let resolveActive: (() => void) | undefined

/**
 * Module-level singleton that drives LayoutSectionCurtain.vue: a full-screen
 * navy panel that slides up to cover the viewport, jumps the scroll position
 * to `target` while hidden, then slides away — so a CTA that skips several
 * sections (e.g. Hero's "Explore our work" jumping straight to Selected
 * Work) reads as the destination section being "unveiled" rather than the
 * page just snapping to a new scroll position.
 */
export function useSectionCurtain() {
  function playTo(target: string): Promise<void> {
    targetSelector.value = target
    trigger.value += 1

    return new Promise((resolve) => {
      resolveActive = resolve
    })
  }

  function resolveCurrent() {
    resolveActive?.()
    resolveActive = undefined
  }

  return {
    trigger: readonly(trigger),
    targetSelector: readonly(targetSelector),
    playTo,
    resolveCurrent
  }
}
