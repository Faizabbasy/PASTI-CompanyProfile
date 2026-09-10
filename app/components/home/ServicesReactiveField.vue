<script setup lang="ts">
// "Reactive Spatial Field" — a technical space that reacts to which
// Service row is open, like a camera focus shifting between "service
// rooms". One shared SVG mounted once here (not per-row) — Teleported
// into whichever row's own mount point is currently open, so it's
// naturally clipped to that row's rounded corners and painted between its
// background and text (both already established by that row's own
// markup) without fighting z-index/opacity across siblings. See
// .docs/context/LARGE_SCALE_MOTION_PLAN.md section 3.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const props = defineProps<{ rowCount: number }>()

const { activeIndex } = useActiveService()
const fieldRef = ref<HTMLElement | null>(null)

// Deterministic per-row line arrangement: each row gets its own fixed set
// of vertical line positions (not random per render), so "locking in" on
// a different row always redraws to the same pattern for that row — a
// stable identity per service, not noise.
function patternForIndex(index: number) {
  const seedBase = (index + 1) * 137.5 // golden-angle-ish spread, deterministic
  const lineCount = 7
  return Array.from({ length: lineCount }, (_, i) => {
    const seed = (seedBase + i * 41.3) % 100
    return {
      x: 8 + ((seed * 3.7) % 84),
      y1: 5 + ((seed * 1.9) % 20),
      y2: 60 + ((seed * 2.3) % 35)
    }
  })
}

const patterns = computed(() => Array.from({ length: props.rowCount }, (_, i) => patternForIndex(i)))
const currentLines = ref(patternForIndex(0))
const teleportTarget = computed(() => (activeIndex.value === null ? null : `#service-row-field-${activeIndex.value}`))

useGsapContext(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 767px)').matches

  watch(
    activeIndex,
    (index, _prev, onCleanup) => {
      if (index === null) return
      const target = patterns.value[index]
      if (!target) return

      if (prefersReducedMotion) {
        currentLines.value = target
        return
      }

      // Field just teleported to the newly-open row (or is mounting for
      // the first time) — its <svg> only exists in the DOM after this
      // watcher runs, so grab it fresh each time rather than caching a
      // ref from a previous mount point.
      nextTick(() => {
        const svg = fieldRef.value?.querySelector('svg')
        const group = svg?.querySelector<SVGGElement>('[data-field-group]')
        const lines = svg ? Array.from(svg.querySelectorAll<SVGLineElement>('[data-field-line]')) : []
        if (!lines.length) {
          currentLines.value = target
          return
        }

        // Subtle mid-tier parallax: the line group drifts a few viewBox
        // units against scroll progress through the row, on top of the
        // pattern-swap animation below — re-created each time the field
        // remounts into a different row, since the previous row's trigger
        // was already killed with that row's own timeline.
        if (group) {
          const parallax = ScrollTrigger.create({
            trigger: fieldRef.value,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => gsap.set(group, { y: (self.progress - 0.5) * -6 })
          })
          onCleanup(() => parallax.kill())
        }

        if (isMobile) {
          // Mobile: simplify the full rearrangement to a plain crossfade
          // to save compute, per the mobile adaptation note.
          const tl = gsap.timeline()
          tl.to(lines, { opacity: 0, duration: 0.25, ease: motionEase.standard })
          tl.call(() => { currentLines.value = target })
          tl.to(lines, { opacity: 1, duration: 0.35, ease: motionEase.standard })
          onCleanup(() => tl.kill())
          return
        }

        // Desktop: "new focus locking in" — lines retract, the new
        // arrangement's coordinates apply, lines extend back out.
        const tl = gsap.timeline()
        tl.to(lines, { scaleY: 0, opacity: 0.2, duration: 0.25, stagger: 0.015, ease: 'power2.in', transformOrigin: 'center' })
        tl.call(() => { currentLines.value = target })
        tl.to(lines, { scaleY: 1, opacity: 1, duration: 0.4, stagger: 0.03, ease: spatialEase.enter, transformOrigin: 'center' })
        onCleanup(() => tl.kill())
      })
    },
    { immediate: true }
  )
})
</script>

<template>
  <Teleport v-if="teleportTarget" :to="teleportTarget">
    <div ref="fieldRef" aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 md:block">
      <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g data-field-group>
          <line
            v-for="(line, i) in currentLines"
            :key="i"
            data-field-line
            :x1="line.x" :y1="line.y1" :x2="line.x" :y2="line.y2"
            :stroke="i % 3 === 0 ? '#FBBA00' : '#EAF1F4'"
            :stroke-opacity="i % 3 === 0 ? 0.45 : 0.2"
            stroke-width="0.6"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  </Teleport>
</template>
