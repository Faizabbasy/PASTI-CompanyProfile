import gsap from 'gsap'
import type { Ref } from 'vue'

/**
 * Page-global cursor-reactive light-leak: draws one soft, irregular radial
 * glow on a full-viewport canvas that follows the pointer with damping, and
 * stretches slightly along the direction of movement at speed. Canvas 2D
 * (not WebGL/Three) is deliberate — this is one soft gradient, not a scene,
 * and a second Three.js/WebGL context alongside the Hero's would double
 * GPU context overhead for no visual gain.
 *
 * Desktop fine-pointer + prefers-reduced-motion: no-preference only (same
 * gating as useMagnetic/useCardTilt/useCursorSpotlight). Pauses on
 * document.hidden and when off-screen is not applicable since this is a
 * fixed page-global layer, not per-section.
 */
export function useAmbientLight(canvasRef: Ref<HTMLCanvasElement | null>) {
  if (!import.meta.client) return

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let width = 0
    let height = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // raw -> damped pointer, plus a velocity estimate for the stretch effect.
    const raw = { x: width / 2, y: height / 2 }
    const damped = { x: raw.x, y: raw.y }
    const prevDamped = { x: raw.x, y: raw.y }
    let velocity = { x: 0, y: 0 }
    let hasPointer = false

    const dampedTween = gsap.quickTo(damped, 'x', { duration: 0.9, ease: 'power3.out' })
    const dampedTweenY = gsap.quickTo(damped, 'y', { duration: 0.9, ease: 'power3.out' })

    const handleMove = (event: PointerEvent) => {
      raw.x = event.clientX
      raw.y = event.clientY
      hasPointer = true
      dampedTween(raw.x)
      dampedTweenY(raw.y)
    }

    window.addEventListener('pointermove', handleMove)

    let visible = document.visibilityState === 'visible'
    const handleVisibility = () => { visible = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', handleVisibility)

    let rafId = 0

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      if (!visible || !hasPointer) return

      velocity = {
        x: damped.x - prevDamped.x,
        y: damped.y - prevDamped.y
      }
      prevDamped.x = damped.x
      prevDamped.y = damped.y

      const speed = Math.min(Math.hypot(velocity.x, velocity.y), 40)
      const stretch = 1 + (speed / 40) * 0.35 // clamped, restrained elongation
      const angle = Math.atan2(velocity.y, velocity.x)
      const baseRadius = Math.min(width, height) * 0.32

      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(damped.x, damped.y)
      ctx.rotate(angle)
      ctx.scale(stretch, 1 / Math.sqrt(stretch))

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius)
      gradient.addColorStop(0, 'rgba(251, 186, 0, 0.10)')
      gradient.addColorStop(0.55, 'rgba(11, 57, 84, 0.06)')
      gradient.addColorStop(1, 'rgba(11, 57, 84, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(0, 0, baseRadius, baseRadius, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    rafId = requestAnimationFrame(draw)

    onBeforeUnmount(() => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('visibilitychange', handleVisibility)
    })
  })
}
