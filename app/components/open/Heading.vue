<script setup lang="ts">
import gsap from 'gsap'

// Shared OPEN section head, in the homepage's voice: mono eyebrow with a
// yellow dot, a tight display heading with one word on the PASTI Yellow
// marker bar (as "Fast" / "FCP" / "100%" on the homepage), optional lede.
// The marker draws once on entry; reduced motion shows it drawn.
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    before?: string
    mark?: string
    after?: string
    lede?: string
    surface?: 'light' | 'dark'
    size?: 'lg' | 'md'
  }>(),
  { eyebrow: undefined, before: '', mark: '', after: '', lede: undefined, surface: 'light', size: 'lg' }
)

const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const marker = root.querySelector<HTMLElement>('[data-oh-marker]')
  const lines = root.querySelectorAll<HTMLElement>('[data-oh-line]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lines, { yPercent: 105 })
    if (marker) gsap.set(marker, { scaleX: 0 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true } })
    tl.to(lines, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 })
    if (marker) tl.to(marker, { scaleX: 1, duration: motionTier.standardMax, ease: approvedEase.gsapCinematic }, '-=0.45')
    return () => {
      tl.kill()
      gsap.set([lines, marker], { clearProps: 'transform' })
    }
  })
})

const dark = computed(() => props.surface === 'dark')
</script>

<template>
  <div ref="rootRef" class="m-center">
    <div v-if="eyebrow" class="overflow-hidden">
      <p data-oh-line class="m-center-row inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]" :class="dark ? 'text-[color:rgba(255,255,255,0.6)]' : 'text-[color:rgba(3,60,89,0.6)]'">
        <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ eyebrow }}
      </p>
    </div>
    <div class="overflow-hidden pb-[0.12em]" :class="eyebrow ? 'mt-4' : ''">
      <h2
        data-oh-line
        class="relative isolate font-display font-extrabold tracking-[-0.045em]"
        :class="[
          dark ? 'text-pureWhite' : 'text-slateNavy',
          size === 'lg' ? 'text-[length:clamp(40px,5.4vw,84px)] leading-[0.95]' : 'text-[length:clamp(34px,4.2vw,64px)] leading-[0.98]'
        ]"
      >
        {{ before }}<span class="whitespace-nowrap"><span v-if="mark" class="relative inline-block"><span data-oh-marker aria-hidden="true" class="absolute -inset-x-[0.06em] bottom-[0.08em] -z-10 h-[0.38em] origin-left rounded-[4px] bg-pastiYellow-500" />{{ mark }}</span>{{ after }}<span class="text-pastiYellow-500">.</span></span>
      </h2>
    </div>
    <p v-if="lede" class="m-center mt-5 max-w-[30rem] text-[16px] leading-relaxed tablet:text-[17px]" :class="dark ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.75)]'">{{ lede }}</p>
  </div>
</template>
