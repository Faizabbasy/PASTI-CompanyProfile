<script setup lang="ts">
import gsap from 'gsap'

// Section heading for /fast. The eyebrow glyph is a mini Gantt whose three
// bars are "placed" one after another; the title rises word by word out of
// a mask (the yellow full stop rides on the last word); the lede follows.
// Motion = scheduling, not a generic fade (07 §4). One ScrollTrigger per
// heading via IntersectionObserver (no scroll handler), fires once.
// Reduced motion: static.
// `size="md"` for headings that sit in a narrow column.
const props = withDefaults(
  defineProps<{ eyebrow: string; title: string; lede?: string; surface?: 'light' | 'dark'; as?: 'h1' | 'h2'; size?: 'lg' | 'md' }>(),
  { surface: 'light', as: 'h2', size: 'lg' }
)
const words = computed(() => props.title.trim().replace(/\.$/, '').split(/\s+/))
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const bars = root.querySelectorAll<HTMLElement>('[data-fh-bar]')
  const inner = root.querySelectorAll<HTMLElement>('[data-fh-word]')
  const lede = root.querySelector<HTMLElement>('[data-fh-lede]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(bars, { scaleX: 0 })
    gsap.set(inner, { yPercent: 108 })
    if (lede) gsap.set(lede, { autoAlpha: 0, y: 12 })
    const tl = gsap.timeline({ paused: true })
    tl.to(bars, { scaleX: 1, duration: 0.5, ease: approvedEase.gsapStandard, stagger: 0.12 }, 0)
      .to(inner, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.045 }, 0.1)
    if (lede) tl.to(lede, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard }, 0.35)
    const stop = onceInView(root, () => tl.play())
    return () => {
      stop()
      tl.kill()
    }
  })
})
</script>

<template>
  <div ref="rootRef" class="m-center">
    <p class="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.62)]' : 'text-[color:rgba(3,60,89,0.6)]'">
      <span aria-hidden="true" class="relative block h-[11px] w-[22px]">
        <span data-fh-bar class="absolute left-0 top-0 h-[3px] w-3 origin-left rounded-full bg-pastiYellow-500" />
        <span data-fh-bar class="absolute left-[6px] top-[4px] h-[3px] w-3 origin-left rounded-full bg-pastiYellow-500 opacity-70" />
        <span data-fh-bar class="absolute left-[11px] top-[8px] h-[3px] w-[11px] origin-left rounded-full bg-pastiYellow-500 opacity-40" />
      </span>
      {{ eyebrow }}
    </p>
    <component :is="as" :aria-label="title" class="hero-title mt-4 max-w-[20ch] max-desktop:mx-auto" :class="[surface === 'dark' ? 'hero-title--dark' : '', size === 'md' ? '!text-[clamp(30px,3.3vw,50px)]' : '']">
      <span aria-hidden="true">
        <template v-for="(w, i) in words" :key="i"><span class="fh-mask"><span data-fh-word class="inline-block">{{ w }}<span v-if="i === words.length - 1" class="text-pastiYellow-500">.</span></span></span>{{ i < words.length - 1 ? ' ' : '' }}</template>
      </span>
    </component>
    <p v-if="lede" data-fh-lede class="m-center mt-5 max-w-[52ch] text-token-body-large leading-relaxed" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.72)]'">{{ lede }}</p>
  </div>
</template>

<style scoped>
.fh-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
</style>
