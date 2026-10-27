<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { InsightArticlePageView } from '~/composables/useInsightArticle'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// ARTICLE END — where the reader goes next, in the Journal's language.
// "Next": the next article of the issue as one large link (headline + its
// poster, which drifts against the scroll). "More from the Journal": up to
// three more, same-topic first, as the /insights contents rows. Articles
// without their own page open in the Reader on /insights (?read=).
const props = defineProps<{ page: InsightArticlePageView }>()
const t = useT()
const lp = useLocalePath()
const articleLink = useInsightArticleLink()
const mark = useCmsMark()
const pad = (n: number) => String(n).padStart(2, '0')
const { setState } = useCustomCursor()
const rootRef = ref<HTMLElement | null>(null)
const hovered = ref<number | null>(null)
const focusY = computed(() => (props.page.next?.view.page?.focus ?? '50% 50%').split(' ')[1] ?? '50%')

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const img = root.querySelector<HTMLElement>('[data-an-img]')
    const word = root.querySelectorAll<HTMLElement>('[data-an-word]')
    const rows = root.querySelectorAll<HTMLElement>('[data-an-row]')
    const tweens: (gsap.core.Tween | ScrollTrigger)[] = []
    if (img) tweens.push(gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement?.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }))
    gsap.set(word, { yPercent: 110 })
    tweens.push(...ScrollTrigger.batch(word, { start: 'top 90%', once: true, onEnter: (els) => gsap.to(els, { yPercent: 0, duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapPrimary, stagger: 0.05 }) }))
    gsap.set(rows, { autoAlpha: 0, x: -30 })
    tweens.push(...ScrollTrigger.batch(rows, { start: 'top 92%', once: true, onEnter: (els) => gsap.to(els, { autoAlpha: 1, x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, stagger: 0.07 }) }))
    return () => tweens.forEach((x) => x.kill())
  })
})
</script>

<template>
  <section ref="rootRef" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy py-20 text-pureWhite tablet:py-28">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <!-- NEXT -->
      <template v-if="page.next">
        <BaseSectionMark surface="dark" :label="t('Next')" :meta="`${page.next.view.index} / ${pad(page.total)}`" class="desktop:w-[34rem]" />
        <NuxtLink
          :to="articleLink(page.next.view)"
          class="group mt-10 grid gap-8 desktop:grid-cols-12 desktop:items-center desktop:gap-12"
          @mouseenter="setState('view', t('Read'))"
          @mouseleave="setState('default')"
        >
          <span class="block desktop:col-span-7">
            <span class="block font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">{{ t(page.next.view.page?.topic ?? '') }} · {{ page.next.view.page?.category }}</span>
            <span v-bind="mark('headline.text', 'Judul besar', `article:${page.next.view.slug}`)" class="mt-5 block font-display text-[length:clamp(40px,6vw,96px)] font-extrabold leading-[0.92] tracking-[-0.05em]">
              <span v-for="(w, i) in (page.next.view.page?.headline.text ?? '').split(/\s+/).filter(Boolean)" :key="`n${i}`" class="an-mask"><span data-an-word class="inline-block">{{ w }}</span></span>
              <span v-for="(w, i) in (page.next.view.page?.headline.accent ?? '').split(/\s+/).filter(Boolean)" :key="`x${i}`" class="an-mask"><span data-an-word class="inline-block text-pastiYellow-500">{{ w }}</span></span>
            </span>
            <span class="mt-6 block max-w-[38rem] text-[17px] leading-[1.6] text-[color:rgba(255,255,255,0.72)]">{{ page.next.view.page?.description }}</span>
            <span class="mt-8 inline-flex items-center gap-4 font-display text-[14px] font-bold uppercase tracking-[0.1em]">
              {{ page.next.view.hasBody ? t('Read the article') : t('Read insight') }}
              <span aria-hidden="true" class="grid h-12 w-12 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial group-hover:-rotate-45">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </span>
          </span>
          <span class="relative block aspect-[4/3] overflow-hidden rounded-[26px] bg-navyDeep-800 desktop:col-span-5">
            <!-- Poster cropped to its right-hand visual (its own headline sits
                 on the left), like the Reader cover; the inner image drifts. -->
            <span class="absolute inset-0 block" :style="{ transform: 'scale(1.7)', transformOrigin: `100% ${focusY}` }">
              <img
                data-an-img
                :src="page.next.view.image" :srcset="imgSet(page.next.view.image)" sizes="(max-width: 1023px) 92vw, 40vw"
                alt="" loading="lazy"
                class="absolute inset-x-0 top-[-8%] h-[116%] w-full object-cover"
                :style="{ objectPosition: `100% ${focusY}` }"
              >
            </span>
            <span aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-[rgba(2,30,46,0.55)] to-transparent" />
            <span class="absolute left-4 top-4 inline-flex items-center gap-2.5 rounded-full bg-[color:rgba(3,60,89,0.72)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.8)] backdrop-blur-sm">
              <LayoutBrandMark surface="dark" :height="10" />{{ t('Insight') }} {{ page.next.view.index }}
            </span>
          </span>
        </NuxtLink>
      </template>

      <!-- MORE -->
      <div v-if="page.more.length" :class="page.next ? 'mt-20 tablet:mt-28' : ''">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <h2 class="font-display text-[length:clamp(28px,3vw,44px)] font-extrabold leading-[1] tracking-[-0.04em] text-pureWhite">{{ t('More from the Journal') }}<span class="text-pastiYellow-500">.</span></h2>
          <NuxtLink :to="lp('/insights')" class="inline-flex min-h-11 items-center gap-3 rounded-full border border-[color:rgba(255,255,255,0.25)] px-5 font-display text-[14px] font-bold transition-colors duration-300 hover:border-pastiYellow-500 hover:bg-pastiYellow-500 hover:text-slateNavy">
            {{ t('All insights') }}
            <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </NuxtLink>
        </div>
        <ol class="mt-10 border-b border-[color:rgba(255,255,255,0.12)]" @mouseleave="hovered = null">
          <li v-for="(m, i) in page.more" :key="m.view.slug" data-an-row class="border-t border-[color:rgba(255,255,255,0.12)]">
            <NuxtLink :to="articleLink(m.view)" class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 tablet:gap-8 tablet:py-7" @mouseenter="hovered = i" @focus="hovered = i">
              <span class="font-mono text-[12px] tabular-nums transition-colors" :class="hovered === i ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.45)]'">{{ m.view.index }}</span>
              <span class="min-w-0">
                <span v-bind="mark('headline.text', 'Judul besar', `article:${m.view.slug}`)" class="block font-display text-[clamp(24px,3vw,44px)] font-extrabold leading-[1] tracking-[-0.04em] transition-transform duration-500 ease-editorial" :class="hovered === i ? 'translate-x-3' : ''">
                  {{ m.view.page?.headline.text }} <span class="transition-colors duration-500" :class="hovered === i ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.4)]'">{{ m.view.page?.headline.accent }}</span>
                </span>
                <span class="mt-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.5)]">{{ t(m.view.page?.topic ?? '') }} · {{ m.view.page?.category }}<template v-if="m.view.hasBody"> · {{ t('Full article') }}</template></span>
              </span>
              <span aria-hidden="true" class="grid h-12 w-12 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-editorial" :class="hovered === i ? '-rotate-45 border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(255,255,255,0.25)]'">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.an-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
  margin-right: 0.22em;
}
</style>
