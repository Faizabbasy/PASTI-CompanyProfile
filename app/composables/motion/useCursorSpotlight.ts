import gsap from 'gsap'
import type { Ref } from 'vue'

interface CursorSpotlightOptions {
  radius?: number
}

/**
 * Tracks the pointer over `target` and drives two CSS custom properties
 * (--spotlight-x/--spotlight-y, in px relative to the element) that a
 * radial-gradient mask on `overlay` reads to reveal a solid-color copy of
 * the same text only in a hard-edged circle around the cursor — no
 * gradient falloff at the edge, per the client's explicit "solid yellow,
 * not gradient" request. Position is smoothed with a short GSAP tween
 * rather than set immediately, so the spotlight glides rather than snaps
 * frame-to-frame. Fine-pointer only — touch devices have no hover concept
 * for this effect.
 */
export function useCursorSpotlight(target: Ref<HTMLElement | null>, overlay: Ref<HTMLElement | null>, options: CursorSpotlightOptions = {}) {
  if (!import.meta.client) return

  const { radius = 110 } = options

  onMounted(() => {
    const el = target.value
    const glow = overlay.value
    if (!el || !glow) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    glow.style.setProperty('--spotlight-radius', `${radius}px`)

    const pos = { x: -9999, y: -9999 }
    gsap.set(glow, { '--spotlight-x': `${pos.x}px`, '--spotlight-y': `${pos.y}px` } as gsap.TweenVars)

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      gsap.to(pos, {
        x,
        y,
        duration: motionDuration.hover,
        ease: motionEase.soft,
        onUpdate: () => {
          glow.style.setProperty('--spotlight-x', `${pos.x}px`)
          glow.style.setProperty('--spotlight-y', `${pos.y}px`)
        }
      })
    }

    const handleLeave = () => {
      gsap.to(pos, {
        x: -9999,
        y: -9999,
        duration: motionDuration.fast,
        ease: motionEase.soft,
        onUpdate: () => {
          glow.style.setProperty('--spotlight-x', `${pos.x}px`)
          glow.style.setProperty('--spotlight-y', `${pos.y}px`)
        }
      })
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)

    onBeforeUnmount(() => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
      gsap.killTweensOf(pos)
    })
  })
}
