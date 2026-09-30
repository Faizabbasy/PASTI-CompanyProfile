<script setup lang="ts">
import gsap from 'gsap'

// First-load brand moment (owner-directed). On the first visit of a session:
// the PASTI wordmark is uncovered left-to-right, the logo's Yellow dot drops
// into its measured place, one Signal ring confirms it, the brand essence
// line appears, then the panel lifts away and the page's own entrance
// (usePageReady) starts underneath. ~2.3s. Only approved eases
// (expo.out / power4.out / power3.out) — no bounce on the dot.
//
// Not shown under reduced motion (CSS media query, so it never flashes on
// SSR either) or on repeat loads in the same session. The page-ready flag is
// always flipped — immediately when the intro is skipped.
const emit = defineEmits<{ done: [] }>()

const show = ref(true)
const rootRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const dotRef = ref<HTMLElement | null>(null)
const ringRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)

const KEY = 'pasti-intro-seen'

function finish() {
  // Marked seen only once it has actually played through (the app shell can
  // remount this component right after hydration in dev).
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {}
  document.documentElement.style.overflow = ''
  getLenisInstance()?.start()
  show.value = false
}

let tl: gsap.core.Timeline | undefined
onBeforeUnmount(() => {
  tl?.kill()
  document.documentElement.style.overflow = ''
})

onMounted(() => {
  let seen = false
  try {
    seen = sessionStorage.getItem(KEY) === '1'
  } catch {}
  const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
  if (seen || reduce || !rootRef.value) {
    show.value = false
    emit('done')
    return
  }

  document.documentElement.style.overflow = 'hidden'
  getLenisInstance()?.stop()

  // Paused until the page has loaded and the main thread is free: the
  // panel doubles as the loading cover, so the sequence never plays into
  // dropped frames while hydration / WebGL setup are still running.
  tl = gsap.timeline({ paused: true, defaults: { ease: approvedEase.gsapCinematic } })
  tl.fromTo(wordRef.value, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9 }, 0.15)
    .fromTo(barRef.value, { scaleX: 0 }, { scaleX: 1, duration: 1.7, ease: 'power3.out' }, 0.15)
    .fromTo(dotRef.value, { yPercent: -900, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: approvedEase.gsapPrimary }, 0.75)
    .fromTo(ringRef.value, { scale: 0.4, opacity: 0.9 }, { scale: 3.2, opacity: 0, duration: 0.8, ease: approvedEase.gsapStandard }, 1.3)
    .fromTo(lineRef.value, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: approvedEase.gsapStandard }, 1.2)
    .call(() => emit('done'), undefined, 2.0)
    .to(rootRef.value, { yPercent: -100, duration: 1, ease: approvedEase.gsapCinematic }, 2.0)
    .call(finish)

  let started = false
  const start = () => {
    if (started) return
    started = true
    requestAnimationFrame(() => requestAnimationFrame(() => tl?.play()))
  }
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
  window.setTimeout(start, 4000)
})
</script>

<template>
  <div
    v-if="show"
    ref="rootRef"
    class="brand-intro fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slateNavy"
    aria-hidden="true"
  >
    <div class="relative" style="height: clamp(56px, 8vw, 104px); aspect-ratio: 1205 / 527">
      <div ref="wordRef" class="h-full w-full">
        <LayoutBrandMark :dot="false" class="!block h-full" />
      </div>
      <!-- Logo dot at its measured box (see Logo.vue), dropped in. -->
      <span class="absolute" style="left: 87.8%; top: 9.3%; width: 9.38%; height: 21.44%">
        <span ref="ringRef" class="absolute inset-0 rounded-full border-2 border-pastiYellow-500 opacity-0" />
        <span ref="dotRef" class="absolute inset-0 rounded-full bg-pastiYellow-500 opacity-0" />
      </span>
    </div>
    <p ref="lineRef" class="mt-8 font-display text-token-metadata font-semibold uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)] opacity-0">
      Certainty Through Execution
    </p>
    <div class="absolute bottom-12 left-1/2 h-px w-40 -translate-x-1/2 bg-[color:rgba(255,255,255,0.12)]">
      <span ref="barRef" class="absolute inset-0 origin-left bg-pastiYellow-500" />
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .brand-intro {
    display: none;
  }
}
</style>
