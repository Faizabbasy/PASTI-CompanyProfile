/**
 * "Lite" rendering tier for mid/low-end devices (performance pass,
 * 2026-10-06). True on touch-first devices (phones / tablets), on machines
 * reporting ≤ 4 CPU cores or ≤ 4 GB RAM, and when the visitor asked to save
 * data. Lite keeps the design but swaps the expensive layers: the WebGL knot
 * becomes its pre-rendered image, full-screen blend / blur / backdrop
 * effects are dropped (see `[data-lite='true']` in main.css) and canvas
 * fields draw at 30 fps.
 *
 * Client-only; returns false during SSR. Decided once per page load (like
 * reduced motion) and mirrored as `<html data-lite>` by app.vue.
 */
let cached: boolean | undefined

export function isLiteDevice(): boolean {
  if (!import.meta.client) return false
  if (cached !== undefined) return cached
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const coarse = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches
  const fewCores = (nav.hardwareConcurrency || 8) <= 4
  const lowMemory = (nav.deviceMemory || 8) <= 4
  const saveData = nav.connection?.saveData === true
  cached = coarse || fewCores || lowMemory || saveData
  return cached
}

/**
 * Frame gate for canvas loops: in lite mode only every other frame draws
 * (~30 fps), halving the per-frame cost of decorative fields.
 */
export function createFrameGate() {
  const lite = isLiteDevice()
  let skip = false
  return () => {
    if (!lite) return true
    skip = !skip
    return !skip
  }
}
