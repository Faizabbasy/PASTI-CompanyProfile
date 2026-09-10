/**
 * Generic pointer → damped position → velocity → direction → strength
 * tracker. No Vue reactivity in the hot path: `state` is one stable object
 * mutated in place by `tick()`, so consumers (e.g. a WebGL render loop) can
 * read it every frame without triggering Vue's reactivity system.
 *
 * Damping (not direct pointer-to-value mapping) is what gives the "gradual
 * relax, no snap" behavior for free: when the pointer stops, the raw target
 * stops updating, and the damped position keeps easing toward it with
 * ever-smaller steps — no separate idle/relax state machine needed.
 */

export interface PointerVelocityState {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  direction: { x: number; y: number }
  strength: number
}

export interface UsePointerVelocityOptions {
  dampingSpeed?: number
  maxSpeed?: number
}

export function usePointerVelocity(
  target: Ref<HTMLElement | null>,
  options: UsePointerVelocityOptions = {}
) {
  // Read live from `options` on every tick rather than captured once into a
  // local const, so a caller that mutates the same options object it passed
  // in (e.g. to lower maxSpeed on a tablet/mobile tier change) takes effect
  // immediately without reconstructing this composable.
  const dampingSpeed = () => options.dampingSpeed ?? 6
  const maxSpeed = () => options.maxSpeed ?? 4

  const state: PointerVelocityState = {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    strength: 0
  }

  // Raw normalized pointer target, updated by the event listener only.
  const rawTarget = { x: 0, y: 0 }
  const prevPosition = { x: 0, y: 0 }

  // Element the listener is currently attached to — recorded explicitly so
  // stop() always removes the listener from the same element start() used,
  // even if target.value has since changed or gone null by cleanup time.
  let attachedEl: HTMLElement | null = null

  // Cached bounds, refreshed on resize/attach rather than read on every
  // high-frequency pointermove (getBoundingClientRect forces layout).
  //
  // The Hero is not pinned, so its viewport-space top changes continuously
  // as the page scrolls — a plain cached DOMRect.top would go stale the
  // moment the user scrolls past the point it was captured. Rather than
  // re-reading getBoundingClientRect() on every pointermove (a layout read
  // in a high-frequency handler), cache the element's DOCUMENT-space top
  // (a value that doesn't change as the page scrolls) alongside its stable
  // width/height/left, and derive the current viewport-space top on each
  // move from `window.scrollY` — a plain property read, no layout.
  let cachedWidth = 0
  let cachedHeight = 0
  let cachedLeft = 0
  let cachedDocumentTop = 0 // rect.top + window.scrollY at the moment of caching
  function refreshRect() {
    if (!attachedEl) {
      cachedWidth = 0
      cachedHeight = 0
      return
    }
    const rect = attachedEl.getBoundingClientRect()
    cachedWidth = rect.width
    cachedHeight = rect.height
    cachedLeft = rect.left
    cachedDocumentTop = rect.top + window.scrollY
  }

  function handlePointerMove(event: PointerEvent) {
    if (cachedWidth === 0 || cachedHeight === 0) return
    // Current viewport-space top, derived from the cached document-space
    // top and the current scroll offset — correct at any scroll position
    // without a layout read.
    const currentTop = cachedDocumentTop - window.scrollY
    rawTarget.x = ((event.clientX - cachedLeft) / cachedWidth) * 2 - 1
    rawTarget.y = -(((event.clientY - currentTop) / cachedHeight) * 2 - 1)
  }

  function tick(dt: number) {
    prevPosition.x = state.position.x
    prevPosition.y = state.position.y

    // Exponential damping toward rawTarget, framerate-independent.
    const t = 1 - Math.exp(-dampingSpeed() * dt)
    state.position.x += (rawTarget.x - state.position.x) * t
    state.position.y += (rawTarget.y - state.position.y) * t

    const rawVelX = dt > 0 ? (state.position.x - prevPosition.x) / dt : 0
    const rawVelY = dt > 0 ? (state.position.y - prevPosition.y) / dt : 0

    // Smooth velocity itself slightly so it doesn't jitter frame-to-frame.
    const velSmooth = 1 - Math.exp(-10 * dt)
    state.velocity.x += (rawVelX - state.velocity.x) * velSmooth
    state.velocity.y += (rawVelY - state.velocity.y) * velSmooth

    const speed = Math.hypot(state.velocity.x, state.velocity.y)
    if (speed > 1e-5) {
      state.direction.x = state.velocity.x / speed
      state.direction.y = state.velocity.y / speed
    } else {
      state.direction.x = 0
      state.direction.y = 0
    }
    state.strength = Math.min(speed / maxSpeed(), 1)
  }

  function start() {
    if (!import.meta.client || !target.value) return
    if (attachedEl === target.value) return // already attached to this element — no duplicate listener
    if (attachedEl) stop() // attached to a stale element — detach before reattaching
    attachedEl = target.value
    refreshRect()
    attachedEl.addEventListener('pointermove', handlePointerMove, { passive: true })
  }

  function stop() {
    if (!import.meta.client || !attachedEl) return
    attachedEl.removeEventListener('pointermove', handlePointerMove)
    attachedEl = null
    cachedWidth = 0
    cachedHeight = 0
  }

  /** Recompute cached bounds — call from the owner's resize handler. */
  function updateBounds() {
    refreshRect()
  }

  return { state, tick, start, stop, updateBounds }
}
