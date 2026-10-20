<script setup lang="ts">
import gsap from 'gsap'

// Section heading for /dora. The eyebrow glyph is the page's Signal — a
// field-location marker: four corner brackets close in on a point, the way
// the verification workspace frames a field on the page. The title rises
// word by word out of a mask (the yellow full stop rides on the last
// word); the lede follows. One IntersectionObserver per heading, fires
// once. Reduced motion: static. `size="md"` for narrow columns.
const props = withDefaults(
  defineProps<{ eyebrow: string; title: string; lede?: string; surface?: 'light' | 'dark'; as?: 'h1' | 'h2'; size?: 'lg' | 'md' }>(),
  { surface: 'light', as: 'h2', size: 'lg' }
)
const words = computed(() => props.title.replace(/\.$/, '').split(' '))
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const corners = root.querySelector<HTMLElement>('[data-dh-corners]')
  const inner = root.querySelectorAll<HTMLElement>('[data-dh-word]')
  const lede = root.querySelector<HTMLElement>('[data-dh-lede]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(corners, { scale: 1.7, autoAlpha: 0 })
    gsap.set(inner, { yPercent: 108 })
    if (lede) gsap.set(lede, { autoAlpha: 0, y: 12 })
    const tl = gsap.timeline({ paused: true })
    tl.to(corners, { scale: 1, autoAlpha: 1, duration: 0.6, ease: approvedEase.gsapPrimary }, 0)
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
      <span aria-hidden="true" class="relative block h-3.5 w-3.5">
        <span data-dh-corners class="dh-corners absolute inset-0" :class="surface === 'dark' ? 'text-doraCyan' : 'text-doraCyan-deep'" />
        <span class="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pastiYellow-500" />
      </span>
      {{ eyebrow }}
    </p>
    <component :is="as" :aria-label="title" class="hero-title mt-4 max-w-[20ch] max-desktop:mx-auto" :class="[surface === 'dark' ? 'hero-title--dark' : '', size === 'md' ? '!text-[clamp(30px,3.3vw,50px)]' : '']">
      <span aria-hidden="true">
        <template v-for="(w, i) in words" :key="i"><span class="dh-mask"><span data-dh-word class="inline-block">{{ w }}<span v-if="i === words.length - 1" class="text-pastiYellow-500">.</span></span></span>{{ i < words.length - 1 ? ' ' : '' }}</template>
      </span>
    </component>
    <p v-if="lede" data-dh-lede class="m-center mt-5 max-w-[54ch] text-token-body-large leading-relaxed" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.72)]'">{{ lede }}</p>
  </div>
</template>

<style scoped>
.dh-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
/* Four corner brackets drawn with gradients (one element, no SVG). */
.dh-corners {
  --c: currentColor;
  background:
    linear-gradient(var(--c), var(--c)) top left / 5px 1.5px,
    linear-gradient(var(--c), var(--c)) top left / 1.5px 5px,
    linear-gradient(var(--c), var(--c)) top right / 5px 1.5px,
    linear-gradient(var(--c), var(--c)) top right / 1.5px 5px,
    linear-gradient(var(--c), var(--c)) bottom left / 5px 1.5px,
    linear-gradient(var(--c), var(--c)) bottom left / 1.5px 5px,
    linear-gradient(var(--c), var(--c)) bottom right / 5px 1.5px,
    linear-gradient(var(--c), var(--c)) bottom right / 1.5px 5px;
  background-repeat: no-repeat;
}
</style>
