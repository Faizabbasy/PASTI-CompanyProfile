export type CursorState = 'default' | 'link' | 'view' | 'inverse' | 'contact'

const state = ref<CursorState>('default')

/**
 * Module-level singleton cursor state. CustomCursor.vue is the only
 * component that renders the visual dot; setState is imported anywhere
 * (links, magnetic targets, media items) to switch its appearance.
 */
export function useCustomCursor() {
  return {
    state: readonly(state),
    setState(next: CursorState) {
      state.value = next
    }
  }
}
