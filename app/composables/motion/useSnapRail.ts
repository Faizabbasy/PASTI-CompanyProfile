import type { Ref } from 'vue'

/**
 * State for a native CSS scroll-snap rail (`overflow-x-auto snap-x`): the
 * mobile counterpart of the desktop sideways galleries (Hero "Success
 * Project", Insight ring). Scrolling stays 100% native — momentum, snap and
 * rubber-banding come from the browser, Lenis doesn't touch horizontal touch
 * scroll — this only derives which card is active, the travel progress, and
 * lets arrows / rail segments jump to a card.
 *
 * The track must be `position: relative` (offsetLeft is measured against it)
 * and its direct children are the cards.
 */
export function useSnapRail(track: Ref<HTMLElement | null>) {
  const active = ref(0)
  const progress = ref(0)
  const touched = ref(false)

  let raf = 0
  const padLeft = (el: HTMLElement) => parseFloat(getComputedStyle(el).scrollPaddingLeft || '0') || 0

  const update = () => {
    const el = track.value
    if (!el) return
    const items = Array.from(el.children) as HTMLElement[]
    const max = el.scrollWidth - el.clientWidth
    progress.value = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0
    const anchor = el.scrollLeft + padLeft(el)
    let best = 0
    let bestDist = Infinity
    items.forEach((item, i) => {
      const d = Math.abs(item.offsetLeft - anchor)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    // The last card can't reach the snap line on wide screens — at the end
    // of travel it is the active one.
    if (max > 0 && el.scrollLeft >= max - 2) best = items.length - 1
    active.value = best
  }

  const onScroll = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(update)
  }

  // "Touched" only from real user input on the rail — programmatic or
  // layout-driven scroll (e.g. re-snapping) must not hide the swipe hint.
  const markTouched = () => {
    touched.value = true
  }

  const go = (i: number) => {
    markTouched()
    const el = track.value
    const item = el?.children[i] as HTMLElement | undefined
    if (!el || !item) return
    const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
    el.scrollTo({ left: item.offsetLeft - padLeft(el), behavior: reduce ? 'auto' : 'smooth' })
  }
  const next = () => go(Math.min(active.value + 1, (track.value?.children.length ?? 1) - 1))
  const prev = () => go(Math.max(active.value - 1, 0))

  onMounted(() => {
    const el = track.value
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    for (const type of ['touchstart', 'pointerdown', 'wheel'] as const) el.addEventListener(type, markTouched, { passive: true, once: true })
    window.addEventListener('resize', onScroll)
    update()
  })
  onBeforeUnmount(() => {
    track.value?.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    cancelAnimationFrame(raf)
  })

  return { active, progress, touched, go, next, prev }
}
