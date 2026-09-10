import gsap from 'gsap'
import type { Ref } from 'vue'

interface MagneticOptions {
  strength?: number
}

/**
 * Pointer-relative magnetic pull, bound only on fine-pointer (mouse/
 * trackpad) devices — never on touch, per the task's explicit "no magnetic
 * pointer behavior on mobile" instruction. Snaps back with an elastic-but-
 * restrained ease on leave, matching the brief's "restrained overshoot"
 * principle rather than a bouncy elastic.out.
 */
export function useMagnetic(target: Ref<HTMLElement | null>, options: MagneticOptions = {}) {
  if (!import.meta.client) return

  const { strength = 0.35 } = options

  onMounted(() => {
    const el = target.value
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    // Gentler pull on tablet-width viewports — same reasoning as
    // useCardTilt: a fine-pointer tablet still qualifies, but full
    // desktop-strength attraction is too much movement for the screen size.
    const pullStrength = tabletScaled(strength)

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = event.clientX - (rect.left + rect.width / 2)
      const relY = event.clientY - (rect.top + rect.height / 2)

      gsap.to(el, {
        x: relX * pullStrength,
        y: relY * pullStrength,
        duration: motionDuration.medium,
        ease: motionEase.standard
      })
    }

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: motionDuration.mediumSlow, ease: motionEase.soft })
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerleave', handleLeave)

    onBeforeUnmount(() => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
      gsap.killTweensOf(el)
    })
  })
}
