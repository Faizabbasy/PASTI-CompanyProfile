<script setup lang="ts">
import gsap from 'gsap'

// Section heading for /matrix. The eyebrow glyph is a tiny stock bar that
// splits into its composition (net · reserved · quarantine) — the page's
// Signal: a total resolving into what is actually usable. The title rises
// word by word out of a mask (yellow full stop on the last word); the lede
// follows. One IntersectionObserver per heading, fires once. Reduced
// motion: static. `size="md"` for narrow columns.
const props = withDefaults(
  defineProps<{ eyebrow: string; title: string; lede?: string; surface?: 'light' | 'dark'; as?: 'h1' | 'h2'; size?: 'lg' | 'md' }>(),
  { surface: 'light', as: 'h2', size: 'lg' }
)
const words = computed(() => props.title.trim().replace(/\.$/, '').split(/\s+/))
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const segs = root.querySelectorAll<HTMLElement>('[data-mh-seg]')
  const inner = root.querySelectorAll<HTMLElement>('[data-mh-word]')
  const lede = root.querySelector<HTMLElement>('[data-mh-lede]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(segs, { scaleX: 0 })
    gsap.set(inner, { yPercent: 108 })
    if (lede) gsap.set(lede, { autoAlpha: 0, y: 12 })
    const tl = gsap.timeline({ paused: true })
    tl.to(segs, { scaleX: 1, duration: 0.45, ease: approvedEase.gsapStandard, stagger: 0.1 }, 0)
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
      <span aria-hidden="true" class="flex h-[5px] w-[24px] gap-px overflow-hidden rounded-full">
        <span data-mh-seg class="block h-full w-[11px] origin-left bg-pastiYellow-500" />
        <span data-mh-seg class="block h-full w-[7px] origin-left bg-[#3E7A99]" />
        <span data-mh-seg class="mh-hatch block h-full flex-1 origin-left" />
      </span>
      {{ eyebrow }}
    </p>
    <component :is="as" :aria-label="title" class="hero-title mt-4 max-w-[20ch] max-desktop:mx-auto" :class="[surface === 'dark' ? 'hero-title--dark' : '', size === 'md' ? '!text-[clamp(30px,3.3vw,50px)]' : '']">
      <span aria-hidden="true">
        <template v-for="(w, i) in words" :key="i"><span class="mh-mask"><span data-mh-word class="inline-block">{{ w }}<span v-if="i === words.length - 1" class="text-pastiYellow-500">.</span></span></span>{{ i < words.length - 1 ? ' ' : '' }}</template>
      </span>
    </component>
    <p v-if="lede" data-mh-lede class="m-center mt-5 max-w-[56ch] text-token-body-large leading-relaxed" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.72)]'">{{ lede }}</p>
  </div>
</template>

<style scoped>
.mh-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
.mh-hatch {
  background: repeating-linear-gradient(135deg, #8fa9b8 0 2px, #c9d6de 2px 4px);
}
</style>
