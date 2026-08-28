const introReady = ref(false)
let scheduled = false

/**
 * Page-load intro gate — mirrors Cuberto's brief blank beat before its entrance
 * animation starts, rather than firing hero animations the instant Vue mounts.
 * `[data-intro]` elements start with animation-play-state: paused (see main.css)
 * and are released together once this flips true.
 */
export function useIntroReady() {
  if (import.meta.client && !scheduled) {
    scheduled = true
    requestAnimationFrame(() => {
      setTimeout(() => {
        introReady.value = true
      }, 250)
    })
  }

  return { introReady }
}
