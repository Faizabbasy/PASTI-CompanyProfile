import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Motion setup queue (performance pass 2026-10-27).
 *
 * Every section used to build its GSAP timelines / ScrollTriggers / text
 * splits synchronously in onMounted, so a page's whole motion setup ran as
 * one long main-thread task right after hydration (2–2.5s of Total Blocking
 * Time on a mid-range phone). Setups now queue here and run in mount order —
 * top of the page first, so pinned sections keep their creation order — in
 * slices of ~10ms with a yield between slices, letting the browser paint and
 * respond to input. Each section looks and moves exactly as before; it is
 * just set up a few frames later (below-the-fold sections are off-screen by
 * then anyway).
 *
 * When the queue drains, every ScrollTrigger is refreshed per instance (the
 * same reason app.vue does it: the global refresh mis-measures the pinned
 * homepage hero), so start/end positions match the final layout.
 */
type Task = { run: () => void; cancelled: boolean }

const queue: Task[] = []
let pumping = false
const SLICE_MS = 10

const yieldToBrowser = (fn: () => void) => {
  // MessageChannel yields without setTimeout's 4ms clamp.
  const ch = new MessageChannel()
  ch.port1.onmessage = () => fn()
  ch.port2.postMessage(0)
}

function pump() {
  const start = performance.now()
  while (queue.length && performance.now() - start < SLICE_MS) {
    const t = queue.shift()!
    if (t.cancelled) continue
    try {
      t.run()
    } catch (err) {
      console.error('[motion] setup failed', err)
    }
  }
  if (queue.length) {
    yieldToBrowser(pump)
    return
  }
  pumping = false
  requestAnimationFrame(() => {
    for (const st of ScrollTrigger.getAll()) st.refresh()
  })
}

/** Queue a motion setup; returns a cancel function (call it on unmount). */
export function scheduleMotion(run: () => void): () => void {
  if (!import.meta.client) return () => {}
  const task: Task = { run, cancelled: false }
  queue.push(task)
  if (!pumping) {
    pumping = true
    // Let the current mount pass finish (siblings queue in order) first.
    yieldToBrowser(pump)
  }
  return () => {
    task.cancelled = true
  }
}
