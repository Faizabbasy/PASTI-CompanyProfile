<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Branded section header: [PASTI mark] ───────── label  meta
// One repeatable device that carries the logo into every homepage section and
// doubles as orientation (which section, where in the sequence). The rule
// draws once from the mark outward and then rests — Signal as a structural
// line, not a loop (00-brand-guide.md §08 / §11).
const props = withDefaults(
  defineProps<{
    surface?: 'dark' | 'light'
    label: string
    /** Right-aligned metadata, e.g. a sequence position. */
    meta?: string
    /** Heading level for `label`; use `h2` when this IS the section's heading. */
    as?: 'p' | 'h2'
  }>(),
  { surface: 'dark', meta: undefined, as: 'p' }
)

const rootRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const dotRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  const line = lineRef.value
  const dot = dotRef.value
  if (!root || !line || !dot) return

  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(line, { scaleX: 1 })
    gsap.set(dot, { opacity: 1 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(dot, { opacity: 0, scale: 0.4 })
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top 90%', once: true }
    })
    tl.to(line, { scaleX: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic })
    tl.to(dot, { opacity: 1, scale: 1, duration: motionTier.microMax, ease: approvedEase.gsapStandard }, '-=0.25')
    return () => tl.kill()
  })
})

const tone = computed(() =>
  props.surface === 'dark'
    ? { text: 'text-[color:rgba(255,255,255,0.55)]', line: 'bg-[color:rgba(255,255,255,0.14)]' }
    : { text: 'text-[color:rgba(15,23,42,0.6)]', line: 'bg-[color:rgba(15,23,42,0.14)]' }
)
</script>

<template>
  <div ref="rootRef" class="flex items-center gap-4">
    <LayoutBrandMark :surface="surface" :height="15" />
    <span class="relative block h-px flex-1">
      <span ref="lineRef" class="absolute inset-0 origin-left" :class="tone.line" />
      <span ref="dotRef" class="absolute -right-px -top-[2.5px] h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />
    </span>
    <component :is="as" class="font-display text-token-metadata font-semibold uppercase tracking-[0.12em]" :class="tone.text">
      {{ label }}
    </component>
    <span v-if="meta" class="font-display text-token-metadata font-semibold tracking-[0.08em]" :class="tone.text">{{ meta }}</span>
  </div>
</template>
