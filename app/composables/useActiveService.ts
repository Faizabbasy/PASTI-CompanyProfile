/**
 * Module-level singleton tracking which Service row is currently open (its
 * scroll-triggered accordion state — see ServiceRow.vue). ServiceCards.vue
 * mounts a single shared "Reactive Spatial Field" decoration keyed off this,
 * rather than each row owning its own copy of the decorative pattern — see
 * .docs/context/LARGE_SCALE_MOTION_PLAN.md section 3. `null` when no row is
 * currently open (e.g. between two rows' trigger windows, or before the
 * section has been scrolled into).
 */
const activeIndex = ref<number | null>(null)

export function useActiveService() {
  return {
    activeIndex: readonly(activeIndex),
    setActiveService(index: number | null) {
      activeIndex.value = index
    }
  }
}
