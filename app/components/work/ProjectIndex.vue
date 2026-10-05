<script setup lang="ts">
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(Flip, ScrollTrigger)
}

// PROJECT INDEX — filter chips + a Grid ↔ List toggle. Every change is a
// GSAP Flip: cards physically travel / resize into their new slots, filtered
// ones scale away. Grid: poster cards with a pointer tilt. List: editorial
// rows with thumbnail, category and description. Reduced motion: instant.
const { projects, groups } = useWorkPortfolio()
const filter = ref('All')
const view = ref<'grid' | 'list'>('grid')
const listRef = ref<HTMLElement | null>(null)
const { setState } = useCustomCursor()

const visible = computed(() => projects.filter((p) => filter.value === 'All' || p.group === filter.value))
const countFor = (g: string) => (g === 'All' ? projects.length : projects.filter((p) => p.group === g).length)

const animateChange = async (mutate: () => void) => {
  const list = listRef.value
  const reduce = import.meta.client && window.matchMedia(reducedMotionQuery.reduce).matches
  if (!list || reduce) {
    mutate()
    return
  }
  const state = Flip.getState(list.querySelectorAll('[data-wi-card], [data-wi-media]'))
  mutate()
  await nextTick()
  Flip.from(state, {
    duration: 0.75,
    ease: approvedEase.gsapPrimary,
    absolute: true,
    nested: true,
    stagger: 0.03,
    onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: approvedEase.gsapStandard }),
    onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: approvedEase.gsapStandard })
  })
  ScrollTrigger.refresh()
}
const setFilter = (g: string) => g !== filter.value && animateChange(() => (filter.value = g))
const setView = (v: 'grid' | 'list') => v !== view.value && animateChange(() => (view.value = v))

const onTilt = (e: PointerEvent) => {
  if (view.value !== 'grid' || !window.matchMedia('(pointer: fine)').matches) return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  gsap.to(el.querySelector('[data-wi-media]'), { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 10, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 10, transformPerspective: 900, duration: 0.5, ease: approvedEase.gsapStandard })
}
const offTilt = (e: PointerEvent) => {
  gsap.to((e.currentTarget as HTMLElement).querySelector('[data-wi-media]'), { rotationX: 0, rotationY: 0, duration: 0.6, ease: approvedEase.gsapStandard })
  setState('default')
}

useGsapContext(() => {
  const list = listRef.value
  if (!list) return
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const cards = list.querySelectorAll<HTMLElement>('[data-wi-card]')
    gsap.set(cards, { autoAlpha: 0, y: 50 })
    const b = ScrollTrigger.batch(cards, { start: 'top 90%', once: true, onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.08 }) })
    return () => b.forEach((t) => t.kill())
  })
})
</script>

<template>
  <section id="work-index" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer>
      <BaseSectionMark surface="light" label="Index" meta="Filter · Grid / List" />

      <!-- Controls -->
      <div class="mt-12 flex flex-col gap-6 desktop:flex-row desktop:items-center desktop:justify-between">
        <div class="snap-rail -mx-gutter flex gap-2 overflow-x-auto px-gutter desktop:mx-0 desktop:flex-wrap desktop:px-0" role="tablist" aria-label="Filter projects">
          <button
            v-for="g in groups"
            :key="g"
            type="button"
            role="tab"
            :aria-selected="filter === g"
            class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-display text-[14px] font-bold transition-colors duration-300 ease-editorial"
            :class="filter === g ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.18)] text-slateNavy hover:border-slateNavy'"
            @click="setFilter(g)"
          >
            {{ g }}
            <span class="font-mono text-[10px]" :class="filter === g ? 'text-pastiYellow-500' : 'text-[color:rgba(3,60,89,0.45)]'">{{ String(countFor(g)).padStart(2, '0') }}</span>
          </button>
        </div>
        <div class="flex shrink-0 items-center gap-1 self-start rounded-full bg-surfaceNeutral p-1 ring-1 ring-[color:rgba(3,60,89,0.1)] desktop:self-auto" role="group" aria-label="Layout">
          <button
            v-for="v in (['grid', 'list'] as const)"
            :key="v"
            type="button"
            :aria-pressed="view === v"
            class="inline-flex min-h-10 items-center gap-2 rounded-full px-4 font-display text-[13px] font-bold capitalize transition-colors duration-300"
            :class="view === v ? 'bg-pastiYellow-500 text-slateNavy' : 'text-[color:rgba(3,60,89,0.6)] hover:text-slateNavy'"
            @click="setView(v)"
          >
            <svg v-if="v === 'grid'" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
            <svg v-else viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><rect x="1" y="2" width="14" height="3" rx="1" /><rect x="1" y="7" width="14" height="3" rx="1" /><rect x="1" y="12" width="14" height="3" rx="1" /></svg>
            {{ v }}
          </button>
        </div>
      </div>

      <!-- Items -->
      <ul ref="listRef" class="mt-12" :class="view === 'grid' ? 'grid gap-x-6 gap-y-14 tablet:grid-cols-2 desktop:grid-cols-3' : 'flex flex-col'">
        <li
          v-for="p in visible"
          :id="`work-${p.index}`"
          :key="p.index"
          data-wi-card
          :data-flip-id="`card-${p.index}`"
          class="group/wi"
          :class="view === 'list' ? 'grid grid-cols-[96px_1fr] items-center gap-5 border-t border-[color:rgba(3,60,89,0.14)] py-6 last:border-b tablet:grid-cols-[160px_1fr_auto] tablet:gap-8' : ''"
          @pointermove="onTilt"
          @pointerenter="setState('view', 'View')"
          @pointerleave="offTilt"
        >
          <div
            data-wi-media
            :data-flip-id="`media-${p.index}`"
            class="relative overflow-hidden bg-surfaceNeutral"
            :class="view === 'grid' ? 'aspect-[4/5] rounded-[22px] shadow-[0_40px_70px_-45px_rgba(3,60,89,0.6)]' : 'aspect-[4/5] rounded-[12px] tablet:aspect-[16/10]'"
          >
            <img :src="p.image" :alt="p.title" loading="lazy" draggable="false" class="h-full w-full object-cover object-top transition-transform duration-700 ease-editorial group-hover/wi:scale-[1.04]">
            <span v-if="view === 'grid'" class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-[color:rgba(3,60,89,0.9)] px-3 py-1.5">
              <LayoutBrandMark :height="9" />
              <span aria-hidden="true" class="h-2.5 w-px bg-[color:rgba(255,255,255,0.25)]" />
              <span class="font-mono text-[10px] text-pureWhite">{{ p.index }}</span>
            </span>
          </div>
          <div :class="view === 'grid' ? 'mt-5 px-1' : 'min-w-0'">
            <p class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">
              <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ p.category }}
            </p>
            <h3 class="mt-2 font-display font-extrabold leading-[1.08] tracking-[-0.03em] text-slateNavy" :class="view === 'grid' ? 'text-[26px]' : 'text-[clamp(22px,3vw,44px)]'">
              {{ p.title }}
            </h3>
            <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.7)]" :class="view === 'grid' ? 'line-clamp-2' : 'line-clamp-2 max-w-[60ch] tablet:line-clamp-none'">{{ p.description }}</p>
          </div>
          <span v-if="view === 'list'" class="hidden h-12 w-12 place-items-center rounded-full border border-[color:rgba(3,60,89,0.2)] text-slateNavy transition-[transform,background-color,border-color] duration-500 ease-editorial group-hover/wi:-rotate-45 group-hover/wi:border-pastiYellow-500 group-hover/wi:bg-pastiYellow-500 tablet:grid">
            <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </span>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>
