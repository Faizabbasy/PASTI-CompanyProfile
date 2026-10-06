<script setup lang="ts">
import gsap from 'gsap'

// e-CORPORATE section head — "Structured Precision": mono eyebrow with a
// square yellow tick, a tight display heading, and one phrase underlined by a
// thin PASTI Yellow rule (a precise line, not OPEN's broad marker bar). The
// rule draws once on entry; reduced motion shows the final state.
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    before?: string
    mark?: string
    after?: string
    lede?: string
    surface?: 'light' | 'dark'
    size?: 'lg' | 'md'
    /** Trailing full stop in PASTI Yellow (off when `after` ends in "?"). */
    dot?: boolean
  }>(),
  { eyebrow: undefined, before: '', mark: '', after: '', lede: undefined, surface: 'light', size: 'lg', dot: true }
)

const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const rule = root.querySelector<HTMLElement>('[data-eh-rule]')
  const lines = root.querySelectorAll<HTMLElement>('[data-eh-line]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lines, { yPercent: 105 })
    if (rule) gsap.set(rule, { backgroundSize: '0% 0.07em' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 82%', once: true } })
    tl.to(lines, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 })
    if (rule) tl.to(rule, { backgroundSize: '100% 0.07em', duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic }, '-=0.4')
    return () => {
      tl.kill()
      gsap.set(lines, { clearProps: 'transform' })
      if (rule) gsap.set(rule, { clearProps: 'backgroundSize' })
    }
  })
})

const dark = computed(() => props.surface === 'dark')
</script>

<template>
  <div ref="rootRef" class="m-center">
    <div v-if="eyebrow" class="overflow-hidden">
      <p data-eh-line class="m-center-row inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]" :class="dark ? 'text-[color:rgba(255,255,255,0.62)]' : 'text-[color:rgba(3,60,89,0.62)]'">
        <span aria-hidden="true" class="h-1.5 w-1.5 bg-pastiYellow-500" />{{ eyebrow }}
      </p>
    </div>
    <div class="overflow-hidden pb-[0.14em]" :class="eyebrow ? 'mt-4' : ''">
      <h2
        data-eh-line
        class="font-display font-extrabold tracking-[-0.04em]"
        :class="[
          dark ? 'text-pureWhite' : 'text-slateNavy',
          size === 'lg' ? 'text-[length:clamp(36px,5vw,76px)] leading-[0.98]' : 'text-[length:clamp(32px,3.8vw,58px)] leading-[1.02]'
        ]"
      >
        {{ before }}<span v-if="mark" data-eh-rule class="eh-rule">{{ mark }}</span>{{ after }}<span v-if="dot" class="text-pastiYellow-500">.</span>
      </h2>
    </div>
    <p v-if="lede" class="m-center mt-5 max-w-[32rem] text-[16px] leading-relaxed tablet:text-[17px]" :class="dark ? 'text-[color:rgba(255,255,255,0.74)]' : 'text-[color:rgba(3,60,89,0.76)]'">{{ lede }}</p>
  </div>
</template>

<style scoped>
/* Underline that wraps with the text (multi-line phrases keep their rule). */
.eh-rule {
  background-image: linear-gradient(#fbba00, #fbba00);
  background-repeat: no-repeat;
  background-position: 0 92%;
  background-size: 100% 0.07em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  padding-bottom: 0.04em;
}
</style>
