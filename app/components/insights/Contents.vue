<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// TABLE OF CONTENTS — every article as a large editorial row. Hover / focus
// opens the row (grid-rows) onto its thumbnail + description and slides the
// title; topic tabs filter the list; clicking a row opens the Reader.
// Touch: rows are tap-to-read, the first row shows its preview.
const { articles } = useInsights()
const topics = ['All', ...Array.from(new Set(articles.map((a) => a.page?.topic).filter(Boolean) as string[]))]
const topic = ref('All')
const hovered = ref<number | null>(null)
const reading = ref<number | null>(null)
const listRef = ref<HTMLElement | null>(null)
const { setState } = useCustomCursor()

const visible = computed(() => articles.map((a, i) => ({ a, i })).filter(({ a }) => topic.value === 'All' || a.page?.topic === topic.value))
const countFor = (t: string) => (t === 'All' ? articles.length : articles.filter((a) => a.page?.topic === t).length)

const setTopic = (t: string) => {
  topic.value = t
  hovered.value = null
  nextTick(() => {
    ScrollTrigger.refresh()
    const rows = listRef.value?.querySelectorAll('[data-ix-row]')
    if (rows && !window.matchMedia(reducedMotionQuery.reduce).matches) gsap.fromTo(rows, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: approvedEase.gsapPrimary, stagger: 0.05 })
  })
}

useGsapContext(() => {
  const list = listRef.value
  if (!list) return
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const rows = list.querySelectorAll<HTMLElement>('[data-ix-row]')
    gsap.set(rows, { autoAlpha: 0, y: 40 })
    const b = ScrollTrigger.batch(rows, { start: 'top 92%', once: true, onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.07 }) })
    return () => b.forEach((t) => t.kill())
  })
})
</script>

<template>
  <section id="insights-contents" class="relative bg-pureWhite py-20 tablet:py-28">
    <BaseContainer>
      <div class="flex flex-col gap-6 desktop:flex-row desktop:items-end desktop:justify-between">
        <div>
          <BaseSectionMark surface="light" label="Contents" :meta="`${String(articles.length).padStart(2, '0')} articles`" class="desktop:w-[34rem]" />
          <h2 class="m-center mt-8 font-display text-[length:clamp(36px,4.6vw,72px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slateNavy">In this issue<span class="text-pastiYellow-500">.</span></h2>
        </div>
        <div class="snap-rail -mx-gutter flex gap-2 overflow-x-auto px-gutter desktop:mx-0 desktop:px-0" role="tablist" aria-label="Filter by topic">
          <button
            v-for="t in topics"
            :key="t"
            type="button"
            role="tab"
            :aria-selected="topic === t"
            class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-display text-[14px] font-bold transition-colors duration-300"
            :class="topic === t ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.18)] text-slateNavy hover:border-slateNavy'"
            @click="setTopic(t)"
          >
            {{ t }}<span class="font-mono text-[10px]" :class="topic === t ? 'text-pastiYellow-500' : 'text-[color:rgba(3,60,89,0.45)]'">{{ String(countFor(t)).padStart(2, '0') }}</span>
          </button>
        </div>
      </div>

      <ol ref="listRef" class="mt-12 border-b border-[color:rgba(3,60,89,0.14)]" @mouseleave="hovered = null">
        <li v-for="({ a, i }, k) in visible" :key="a.index" data-ix-row class="border-t border-[color:rgba(3,60,89,0.14)]">
          <button
            type="button"
            class="group block w-full text-left"
            :aria-label="`Read ${a.title}`"
            @mouseenter="hovered = i; setState('view', 'Read')"
            @mouseleave="setState('default')"
            @focus="hovered = i"
            @click="reading = i"
          >
            <span class="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 tablet:gap-8 tablet:py-8">
              <span class="font-mono text-[12px] tabular-nums transition-colors" :class="hovered === i ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.4)]'">{{ a.index }}</span>
              <span class="min-w-0">
                <span class="block font-display text-[clamp(26px,4vw,64px)] font-extrabold leading-[1] tracking-[-0.04em] text-slateNavy transition-transform duration-500 ease-editorial" :class="hovered === i ? 'translate-x-3' : ''">
                  {{ a.page?.headline.text }} <span class="transition-colors duration-500" :class="hovered === i ? 'text-pastiYellow-500' : 'text-[color:rgba(3,60,89,0.35)]'">{{ a.page?.headline.accent }}</span>
                </span>
                <span class="mt-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">{{ a.page?.topic }} · {{ a.page?.category }}</span>
              </span>
              <span class="grid h-12 w-12 place-items-center rounded-full border transition-[transform,background-color,border-color] duration-500 ease-editorial" :class="hovered === i ? '-rotate-45 border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(3,60,89,0.2)] text-slateNavy'">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </span>
            <!-- Preview strip -->
            <span class="grid transition-[grid-template-rows] duration-700 ease-editorial" :class="hovered === i || (hovered === null && k === 0) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
              <span class="block overflow-hidden">
                <span class="grid gap-6 pb-8 tablet:grid-cols-[minmax(0,420px)_1fr] tablet:items-center tablet:pl-12">
                  <span class="block aspect-[4/3] overflow-hidden rounded-[18px] bg-surfaceNeutral">
                    <img :src="a.image" :alt="''" loading="lazy" class="h-full w-full object-cover transition-transform duration-1000 ease-editorial" :class="hovered === i ? 'scale-105' : 'scale-100'">
                  </span>
                  <span class="block">
                    <span class="block max-w-[46ch] text-token-body-large text-[color:rgba(3,60,89,0.72)]">{{ a.page?.description }}</span>
                    <span class="mt-5 inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.1em] text-slateNavy">
                      Read insight <span aria-hidden="true" class="h-px w-8 bg-pastiYellow-500" />
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </button>
        </li>
      </ol>
    </BaseContainer>

    <InsightsReader :articles="articles" :index="reading" @close="reading = null" @go="reading = $event" />
  </section>
</template>
