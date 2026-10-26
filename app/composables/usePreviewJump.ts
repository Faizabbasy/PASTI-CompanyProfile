import type { Ref } from 'vue'

// Admin draft previews: `?s=<n>` scrolls to the n-th section inside `main`
// — the editors' "Lihat bagian ini" link. Waits for the sections to mount
// and lay out (pins, measured heights) first.
export function usePreviewJump(mainRef: Ref<HTMLElement | null>) {
  const route = useRoute()
  onMounted(() => {
    const n = Number(route.query.s)
    if (!Number.isInteger(n) || n < 0) return
    setTimeout(() => {
      const el = mainRef.value?.children[n] as HTMLElement | undefined
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 48
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
    }, 600)
  })
}
