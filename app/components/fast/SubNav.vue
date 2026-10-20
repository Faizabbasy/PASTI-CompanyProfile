<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Compact FAST sub-navigation, same pattern as ShiftlySubNav: a slim bar
// docked bottom-centre on desktop that appears after the hero, tracks the
// section in view and steps aside at the demo form. Skipped below desktop
// (the WhatsApp FAB owns that edge). Not a second navbar.
// Performance: section offsets are cached (re-read on ScrollTrigger refresh,
// since the Board pin changes them) and the scroll handler is rAF-throttled
// — no layout reads on the scroll path.
const { subnav: items } = useFast()
const scrollTo = useFastScroll()
const visible = ref(false)
const active = ref('')

let tops: { id: string; top: number }[] = []
let demoTop = Infinity
let raf = 0
let settle: ReturnType<typeof setTimeout> | undefined
const measure = () => {
  tops = items.map((it) => ({ id: it.id, top: (document.getElementById(it.id)?.getBoundingClientRect().top ?? 0) + window.scrollY }))
  const demo = document.getElementById('demo')
  demoTop = demo ? demo.getBoundingClientRect().top + window.scrollY : Infinity
  update()
}
const update = () => {
  raf = 0
  const y = window.scrollY
  const vh = window.innerHeight
  visible.value = y > vh * 0.8 && demoTop - y > vh * 0.6
  let cur = ''
  for (const t of tops) if (t.top - y < vh * 0.5) cur = t.id
  active.value = cur
}
const onScroll = () => {
  if (!raf) raf = requestAnimationFrame(update)
}
onMounted(() => {
  if (!window.matchMedia(breakpointQuery.desktopUp).matches) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
  ScrollTrigger.addEventListener('refresh', measure)
  measure()
  // Re-read once the Board pin and late layout have settled.
  settle = setTimeout(measure, 2500)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measure)
  ScrollTrigger.removeEventListener('refresh', measure)
  cancelAnimationFrame(raf)
  clearTimeout(settle)
})
</script>

<template>
  <nav
    aria-label="FAST page sections"
    class="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 transition-[opacity,transform] duration-500 ease-editorial desktop:block"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'"
    :inert="!visible || undefined"
  >
    <div class="flex items-center overflow-hidden rounded-full border border-[color:rgba(255,255,255,0.16)] bg-slateNavy pl-4 shadow-[0_24px_50px_-20px_rgba(0,12,22,0.7)]">
      <FastMark surface="dark" :size="13" class="pr-3" />
      <button
        v-for="it in items"
        :key="it.id"
        type="button"
        class="relative h-11 px-3.5 font-display text-[13px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500"
        :class="active === it.id ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.6)] hover:text-pureWhite'"
        :aria-current="active === it.id ? 'true' : undefined"
        @click="scrollTo(it.id)"
      >
        {{ it.label }}
        <span aria-hidden="true" class="absolute inset-x-3 bottom-1.5 h-[2px] origin-left bg-pastiYellow-500 transition-transform duration-300" :class="active === it.id ? 'scale-x-100' : 'scale-x-0'" />
      </button>
      <button type="button" class="h-11 bg-pastiYellow-500 px-5 font-display text-[13px] font-bold text-slateNavy focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slateNavy" @click="scrollTo('demo')">
        Demo
      </button>
    </div>
  </nav>
</template>
