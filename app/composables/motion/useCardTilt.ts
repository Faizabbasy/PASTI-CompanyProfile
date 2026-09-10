import gsap from 'gsap'
import type { Ref } from 'vue'

interface CardTiltOptions {
  /** Max rotation in degrees at the card's edge. */
  strength?: number
  /** Scale applied on hover, on top of the tilt. */
  lift?: number
  /**
   * The card's own resting rotation in degrees (e.g. its scattered-stack
   * tilt). Must be handed to GSAP via `gsap.set` rather than left as a CSS
   * transform — GSAP composes its own tween on top of whatever transform
   * it already owns, not on top of an untracked CSS one, so a plain
   * `transform: rotate(...)` here would fight the tilt tween (see
   * HANDOFF.md's "GSAP transform tweens don't replace a pre-existing CSS
   * transform" gotcha).
   */
  baseRotate?: number
}

/**
 * Cursor-relative 3D tilt + hover lift for a card in a stack — bound only
 * on fine-pointer devices, same gating as useMagnetic. Rotation is driven
 * by pointer position within the card's own bounds (not viewport-relative,
 * so it still works when the card sits inside a rotated/offset parent).
 */
export function useCardTilt(target: Ref<HTMLElement | null>, options: CardTiltOptions = {}) {
  if (!import.meta.client) return

  const { strength = 10, lift = 1.06, baseRotate = 0 } = options

  onMounted(() => {
    const el = target.value
    if (!el) return

    gsap.set(el, { rotate: baseRotate, transformPerspective: 600 })

    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    // Tablet-width devices with a fine pointer (trackpad, stylus) still get
    // the tilt, just gentler — a full desktop-strength 3D tilt reads as too
    // much on a smaller, closer-held screen.
    const tiltStrength = tabletScaled(strength)

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = (event.clientX - rect.left) / rect.width - 0.5
      const relY = (event.clientY - rect.top) / rect.height - 0.5

      gsap.to(el, {
        rotateX: relY * -tiltStrength,
        rotateY: relX * tiltStrength,
        rotate: baseRotate,
        scale: lift,
        duration: motionDuration.fast,
        ease: motionEase.standard
      })
    }

    const handleLeave = () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, rotate: baseRotate, scale: 1, duration: motionDuration.mediumSlow, ease: motionEase.soft })
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
