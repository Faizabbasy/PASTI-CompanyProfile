export type CursorState = 'default' | 'link' | 'view' | 'inverse' | 'contact'

const state = ref<CursorState>('default')
const label = ref<string | null>(null)

/**
 * Module-level singleton cursor state. CustomCursor.vue is the only
 * component that renders the visual dot; setState is imported anywhere
 * (links, magnetic targets, media items) to switch its appearance. `label`
 * is an optional short word rendered inside the dot (e.g. 'view' state's
 * Insights usage shows 'Read') — omitting it leaves the dot exactly as
 * every other caller already renders it.
 */
export function useCustomCursor() {
  return {
    state: readonly(state),
    label: readonly(label),
    setState(next: CursorState, nextLabel: string | null = null) {
      state.value = next
      label.value = nextLabel
    }
  }
}
