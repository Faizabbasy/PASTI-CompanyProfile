import gsap from 'gsap'
import type { Ref } from 'vue'

/**
 * Drives a hero-side cartoon doodle: a gentle continuous idle float (so it
 * reads as "alive" even untouched) plus a playful squash-and-stretch wiggle
 * on hover — deliberately bouncier than useMagnetic's "restrained overshoot"
 * brief elsewhere on the site, since the whole point here is a cartoon-like
 * reaction. Skipped entirely under prefers-reduced-motion (idle float never
 * starts; hover just does nothing extra).
 */
export function useHeroDoodle(target: Ref<HTMLElement | null>) {
  if (!import.meta.client) return

  onMounted(() => {
    const el = target.value
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const idle = gsap.to(el, {
      y: -14,
      rotation: 2,
      duration: 2.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const handleEnter = () => {
      idle.pause()
      gsap
        .timeline({ onComplete: () => { idle.resume() } })
        .to(el, { scaleX: 1.15, scaleY: 0.85, rotation: -6, duration: 0.18, ease: 'power2.out' })
        .to(el, { scaleX: 0.9, scaleY: 1.12, rotation: 5, duration: 0.16, ease: 'power2.inOut' })
        .to(el, { scaleX: 1.05, scaleY: 0.96, rotation: -3, duration: 0.14, ease: 'power2.inOut' })
        .to(el, { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.3, ease: 'elastic.out(1, 0.5)' })
    }

    if (canHover) {
      el.addEventListener('pointerenter', handleEnter)
    }

    onBeforeUnmount(() => {
      idle.kill()
      if (canHover) el.removeEventListener('pointerenter', handleEnter)
    })
  })
}
