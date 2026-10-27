<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// MATRIX wayfinding — a rack locator instead of the bottom-centre sub-nav
// FAST / DORA use (owner 2026-10-20: MATRIX must feel distinct). The page
// is one rack: 12 sections = rows A–C × bins 01–04 (see MatrixBinLabel).
// Docked in the left gutter on desktop (vertical, ~35px wide, inside the 41px+ page gutter): bins
// already passed are filled, the current one is yellow, its LOC code reads
// underneath and each bin's name appears on hover / focus. Every bin
// is a button that jumps to its section. Appears after the hero and steps
// aside at the footer. Offsets are cached (re-read on ScrollTrigger
// refresh); the scroll handler is rAF-throttled. Skipped below desktop.
type Bin = { code: string; name: string; el: HTMLElement; top: number }
const t = useT()
const bins = ref<Bin[]>([])
const active = ref(-1)
const visible = ref(false)
let endTop = Infinity
let raf = 0
let settle: ReturnType<typeof setTimeout> | undefined

const measure = () => {
  const els = [...document.querySelectorAll<HTMLElement>('[data-mx-bin]')]
  bins.value = els.map((el) => {
    const sec = el.closest('section') ?? el
    return { code: el.dataset.mxCode ?? '', name: el.dataset.mxName ?? '', el: sec as HTMLElement, top: sec.getBoundingClientRect().top + window.scrollY }
  })
  const last = bins.value.at(-1)?.el
  endTop = last ? last.getBoundingClientRect().bottom + window.scrollY : Infinity
  update()
}
const update = () => {
  raf = 0
  const y = window.scrollY
  const vh = window.innerHeight
  let cur = -1
  bins.value.forEach((b, i) => {
    if (b.top - y < vh * 0.5) cur = i
  })
  active.value = cur
    visible.value = y > vh * 0.7 && endTop - y > vh * 0.9
}
const onScroll = () => {
  if (!raf) raf = requestAnimationFrame(update)
}
const go = (i: number) => {
  const el = bins.value[i]?.el
  if (!el) return
  const lenis = getLenisInstance()
  if (lenis) lenis.scrollTo(el, { offset: -10, duration: 1.4 })
  else el.scrollIntoView({ behavior: window.matchMedia(reducedMotionQuery.reduce).matches ? 'auto' : 'smooth' })
}
onMounted(() => {
  if (!window.matchMedia(breakpointQuery.desktopUp).matches) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
  ScrollTrigger.addEventListener('refresh', measure)
  measure()
  settle = setTimeout(measure, 2500)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', measure)
  ScrollTrigger.removeEventListener('refresh', measure)
  cancelAnimationFrame(raf)
  clearTimeout(settle)
})
const current = computed(() => bins.value[active.value])
</script>

<template>
  <!-- A slim vertical rack in the left gutter (columns A–C, bins 01–04), so it
       never covers content; the LOC code reads under it and the bin's name
       shows beside it on hover / focus. -->
  <nav
    :aria-label="t('MATRIX page sections')"
    class="fixed left-1 top-1/2 z-40 hidden -translate-y-1/2 transition-[opacity,transform] duration-500 ease-editorial desktop:block"
    :class="visible ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'"
    :inert="!visible || undefined"
  >
    <div class="flex flex-col items-center gap-2 rounded-[9px] bg-slateNavy px-1 py-2 shadow-[0_18px_40px_-18px_rgba(0,12,22,0.7)] ring-1 ring-[color:rgba(255,255,255,0.12)]">
      <ol class="grid grid-flow-col grid-cols-3 grid-rows-4 gap-[2px] border-x-2 border-[color:rgba(255,255,255,0.35)] px-[2px]">
        <li v-for="(b, i) in bins" :key="b.code" class="group/bin relative">
          <button
            type="button"
            class="block h-[13px] w-[5px] rounded-[1.5px] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-pastiYellow-500"
            :class="i === active ? 'bg-pastiYellow-500' : i < active ? 'bg-[color:rgba(255,255,255,0.7)] hover:bg-pureWhite' : 'bg-[color:rgba(255,255,255,0.16)] hover:bg-[color:rgba(255,255,255,0.45)]'"
            :aria-label="`${b.code} · ${b.name}`"
            :aria-current="i === active ? 'location' : undefined"
            @click="go(i)"
          />
          <span aria-hidden="true" class="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-slateNavy px-2 py-1 font-display text-[12px] font-semibold text-pureWhite shadow-lg group-hover/bin:block group-focus-within/bin:block">
            <span class="font-mono text-pastiYellow-400">{{ b.code }}</span> {{ b.name }}
          </span>
        </li>
      </ol>
      <p class="font-mono text-[8px] font-semibold tabular-nums leading-none text-pastiYellow-400" aria-live="polite">
        <span class="sr-only">{{ `${t('Current section: {name}, location', { name: current?.name ?? '' })} ` }}</span>{{ current?.code ?? 'A-01' }}
      </p>
    </div>
  </nav>
</template>
