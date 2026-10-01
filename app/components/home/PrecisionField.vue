<script setup lang="ts">
import gsap from 'gsap'

// Shared environment — "precision field" (docs/rework-v2/00-brand-guide.md §08
// Precision Framing + The Signal). Deliberately NOT a glow/blob/particle
// background: the surface is Slate Navy with tonal depth, a 12-column
// structural grid (the macro grid made visible, 1px low-opacity rules per
// 03-design-system.md §7), and a few short Cobalt Signal routes that draw
// themselves ONCE and then rest (Signal = state/progress, never a loop).
//
// Interaction: a cursor-driven measuring layer. A brighter copy of the grid
// (plus a fine horizontal pitch) is revealed only inside a soft circular
// mask that follows the pointer, so the grid reads as "the system is
// measuring where you are" — response, not decoration. Fine-pointer +
// no-preference-motion only; otherwise the layer rests at a static default.

// `hero`: tonal top + Cobalt/Cyan lifts, Signal routes, bottom fade into the
// next section. `stage`: same grid + measuring layer on plain Slate Navy
// (What We Build's pinned stage), no routes — that section owns its own
// Signal. `focus` is the measuring layer's resting point (fractions of the
// host's width/height) before the pointer has moved.
const props = withDefaults(
  defineProps<{
    variant?: 'hero' | 'stage'
    showRoutes?: boolean
    focus?: [number, number]
    /** Surface the field sits on — `light` draws the grid in navy. */
    tone?: 'dark' | 'light'
  }>(),
  { variant: 'hero', showRoutes: true, focus: () => [0.64, 0.36], tone: 'dark' }
)

const rootRef = ref<HTMLElement | null>(null)
const routeRefs = ref<HTMLElement[]>([])
const headRefs = ref<HTMLElement[]>([])

const COLUMNS = 12

// Signal routes: column line (1-based key line), start/height as % of the
// field, so they stay proportional whatever the section's height. Each sits
// on a real grid key line (Precise Misalignment — offset but aligned).
const routes = [
  { col: 2, top: 10, height: 30, delay: 0.5 },
  { col: 9, top: 46, height: 34, delay: 0.75 },
  { col: 12, top: 6, height: 20, delay: 0.95 }
]

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  root.style.setProperty('--mx', `${props.focus[0] * 100}%`)
  root.style.setProperty('--my', `${props.focus[1] * 100}%`)
  const host = root.parentElement
  if (!host) return

  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    if (!props.showRoutes) return
    gsap.set(routeRefs.value, { scaleY: 1 })
    gsap.set(headRefs.value, { opacity: 1 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    // One-shot route draw, staggered, expo.out (cinematic tier) — then static.
    if (props.showRoutes) gsap.set(routeRefs.value, { scaleY: 0, transformOrigin: 'top' })
    if (props.showRoutes) gsap.set(headRefs.value, { opacity: 0, scale: 0.4 })
    routes.forEach((route, i) => {
      if (!props.showRoutes) return
      const line = routeRefs.value[i]
      const head = headRefs.value[i]
      if (!line || !head) return
      gsap.to(line, {
        scaleY: 1,
        duration: motionTier.cinematicMax,
        delay: route.delay,
        ease: approvedEase.gsapCinematic
      })
      gsap.to(head, {
        opacity: 1,
        scale: 1,
        duration: motionTier.microMax,
        delay: route.delay + motionTier.cinematicMin,
        ease: approvedEase.gsapStandard
      })
    })

    if (!window.matchMedia('(pointer: fine)').matches) return

    // Cursor-following measuring layer.
    const pos = { x: 0, y: 0 }
    let primed = false
    const apply = () => {
      root.style.setProperty('--mx', `${pos.x}px`)
      root.style.setProperty('--my', `${pos.y}px`)
    }
    const toX = gsap.quickTo(pos, 'x', { duration: 0.7, ease: approvedEase.gsapStandard, onUpdate: apply })
    const toY = gsap.quickTo(pos, 'y', { duration: 0.7, ease: approvedEase.gsapStandard, onUpdate: apply })

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      if (!primed) {
        // Start the glide from where the CSS default sits, not (0,0).
        pos.x = rect.width * props.focus[0]
        pos.y = rect.height * props.focus[1]
        primed = true
      }
      toX(event.clientX - rect.left)
      toY(event.clientY - rect.top)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  })

  return () => mm.revert()
})
</script>

<template>
  <div
    ref="rootRef"
    aria-hidden="true"
    class="hero-field pointer-events-none absolute inset-0 z-0 overflow-hidden"
  >
    <!-- Tonal depth: a slightly deeper top and a restrained Cobalt lift
         behind the headline. Single low-opacity tonal shift, not a glow. -->
    <div
      v-if="variant === 'hero'"
      class="absolute inset-0"
      style=" background: radial-gradient(ellipse 60% 45% at 50% 34%, rgba(3, 60, 89, 0.1), transparent 70%), radial-gradient(ellipse 45% 40% at 100% 0%, rgba(251, 186, 0, 0.05), transparent 70%), linear-gradient(180deg, #0a1020 0%, #033C59 42%, #033C59 100%); "
    />
    <div
      v-else
      class="absolute inset-0"
      style="background: radial-gradient(ellipse 55% 50% at 50% 52%, rgba(3, 60, 89, 0.08), transparent 70%)"
    />

    <!-- Resting grid: the 12-column macro grid, 1px structural rules. -->
    <div class="container-page absolute inset-0 left-1/2 -translate-x-1/2">
      <div class="grid h-full grid-cols-12">
        <div
          v-for="n in COLUMNS"
          :key="n"
          class="h-full border-l"
          :class="[n === COLUMNS ? 'border-r' : '', tone === 'light' ? 'border-[color:rgba(3,60,89,0.07)]' : 'border-[color:rgba(255,255,255,0.055)]']"
        />
      </div>
    </div>

    <!-- Measuring layer: same grid, brighter, plus a fine horizontal pitch;
         only visible inside the pointer-following mask. -->
    <div class="hero-field__measure absolute inset-0">
      <div class="container-page absolute inset-0 left-1/2 -translate-x-1/2">
        <div class="grid h-full grid-cols-12">
          <div
            v-for="n in COLUMNS"
            :key="n"
            class="h-full border-l border-[color:rgba(3, 60, 89,0.55)]"
            :class="n === COLUMNS ? 'border-r' : ''"
          />
        </div>
      </div>
      <div
        class="absolute inset-0"
        style=" background-image: repeating-linear-gradient( to bottom, rgba(251, 186, 0, 0.32) 0, rgba(251, 186, 0, 0.32) 1px, transparent 1px, transparent 48px ); "
      />
    </div>

    <!-- Signal routes: drawn once on load, then structural/static. -->
    <div v-if="showRoutes" class="container-page absolute inset-0 left-1/2 -translate-x-1/2">
      <div
        v-for="(route, i) in routes"
        :key="route.col"
        class="absolute w-px"
        :style="{
          left: `${((route.col - 1) / COLUMNS) * 100}%`,
          top: `${route.top}%`,
          height: `${route.height}%`
        }"
      >
        <span
          :ref="(el) => { if (el) routeRefs[i] = el as HTMLElement }"
          class="absolute inset-0 origin-top bg-gradient-to-b from-[color:rgba(3, 60, 89,0)] via-[color:rgba(3, 60, 89,0.7)] to-cobalt"
        />
        <span
          :ref="(el) => { if (el) headRefs[i] = el as HTMLElement }"
          class="absolute -bottom-[3px] -left-[2.5px] h-[6px] w-[6px] rounded-full bg-cobalt"
        />
      </div>
    </div>

    <!-- Handoff: settles into Slate Navy so What We Build continues from
         the same tone (tonal continuity, no hard edge). -->
    <div v-if="variant === 'hero'" class="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-b from-transparent to-slateNavy" />
  </div>
</template>

<style scoped>
.hero-field {
  --mx: 64%;
  --my: 36%;
}

.hero-field__measure {
  -webkit-mask-image: radial-gradient(circle 300px at var(--mx) var(--my), #000 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%);
  mask-image: radial-gradient(circle 300px at var(--mx) var(--my), #000 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%);
}

@media (prefers-reduced-motion: reduce) {
  .hero-field__measure {
    opacity: 0.6;
  }
}
</style>
