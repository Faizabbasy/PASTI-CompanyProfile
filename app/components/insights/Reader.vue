<script setup lang="ts">
import gsap from 'gsap'
import type { InsightsArticleView } from '#shared/utils/insightsPublic'

// READER — full-screen reading sheet for one article. Articles with a
// written body (CMS) also link to their own page (/insights/:slug).
// Editorial spread (owner revision 2026-10-16, "masih kureng"):
// - Cover: the poster cropped to its visual focal point (`page.focus`), so
//   the poster's own headline isn't repeated next to the real one. "View full
//   poster" swaps the crop for the whole poster.
// - Story column: ghost index numeral, kicker, headline, lead paragraph,
//   numbered topic grid, PASTI perspective as a pull quote, project links as
//   arrow rows. Everything is the article's existing copy (useInsights).
// - Footer: a segment per article (current in Yellow) and a "Next" preview.
// Prev / next, Esc to close, ← → keys, page scroll locked while open.
const props = defineProps<{ articles: InsightsArticleView[]; index: number | null }>()
const emit = defineEmits<{ close: []; go: [i: number] }>()

const sheetRef = ref<HTMLElement | null>(null)
const storyRef = ref<HTMLElement | null>(null)
const article = computed(() => (props.index === null ? null : props.articles[props.index]!))
const pad = (n: number) => String(n).padStart(2, '0')
const t = useT()
const lp = useLocalePath()
const n = computed(() => props.articles.length)
const nextArticle = computed(() => (props.index === null ? null : props.articles[(props.index + 1) % n.value]!))
const fullPoster = ref(false)
const mark = useCmsMark()
const articleLink = useInsightArticleLink()

// Cover crop: every poster carries its own headline on the left half and its
// visual on the right, so the cover zooms (origin right) until only the
// right ~48% shows — whatever the cover's shape on this screen.
const VISIBLE = 0.48
const coverScale = () => {
  const img = sheetRef.value?.querySelector<HTMLImageElement>('[data-rd-img]')
  const box = img?.parentElement
  if (!img || !box || !img.naturalWidth) return 1
  const fit = Math.min(1, box.clientWidth / box.clientHeight / (img.naturalWidth / img.naturalHeight))
  return Math.min(1.8, Math.max(1.04, fit / VISIBLE))
}
const fitCover = (animate = true) => {
  const img = sheetRef.value?.querySelector<HTMLImageElement>('[data-rd-img]')
  if (!img) return
  const scale = fullPoster.value ? 1 : coverScale()
  const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
  gsap.to(img, { scale, duration: animate && !reduce ? motionTier.standardMax : 0, ease: approvedEase.gsapStandard, overwrite: 'auto' })
}
watch(fullPoster, () => fitCover())
const onResize = () => fitCover(false)
const focusY = computed(() => (article.value?.page?.focus ?? '50% 50%').split(' ')[1] ?? '50%')

const prev = () => props.index !== null && emit('go', (props.index - 1 + n.value) % n.value)
const next = () => props.index !== null && emit('go', (props.index + 1) % n.value)
const onKey = (e: KeyboardEvent) => {
  if (props.index === null) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

watch(
  () => props.index,
  async (i, old) => {
    const lenis = getLenisInstance()
    if (i !== null && old === null) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else if (i === null) {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
    if (i === null) return
    fullPoster.value = false
    await nextTick()
    storyRef.value?.scrollTo({ top: 0 })
    sheetRef.value?.scrollTo({ top: 0 })
    const sheet = sheetRef.value
    if (!sheet) return
    if (window.matchMedia(reducedMotionQuery.reduce).matches) {
      const img = sheet.querySelector<HTMLImageElement>('[data-rd-img]')
      if (img?.complete) fitCover(false)
      else img?.addEventListener('load', () => fitCover(false), { once: true })
      return
    }
    const parts = sheet.querySelectorAll<HTMLElement>('[data-rd-part]')
    gsap.fromTo(parts, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.05, overwrite: 'auto' })
    const cover = sheet.querySelector<HTMLElement>('[data-rd-cover]')
    if (cover) gsap.fromTo(cover, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapCinematic, overwrite: 'auto' })
    const img = sheet.querySelector<HTMLImageElement>('[data-rd-img]')
    if (img) {
      const play = () => {
        const end = coverScale()
        gsap.fromTo(img, { scale: end * 1.15 }, { scale: end, duration: motionTier.cinematicMax, ease: approvedEase.gsapPrimary, overwrite: 'auto' })
      }
      if (img.complete && img.naturalWidth) play()
      else img.addEventListener('load', play, { once: true })
    }
    const numeral = sheet.querySelector<HTMLElement>('[data-rd-numeral]')
    if (numeral) gsap.fromTo(numeral, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapPrimary, overwrite: 'auto' })
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  document.documentElement.style.overflow = ''
  getLenisInstance()?.start()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="rd">
      <div v-if="article" class="fixed inset-0 z-[80] flex items-end bg-[color:rgba(2,20,32,0.6)] tablet:items-stretch" role="dialog" aria-modal="true" :aria-label="article.title" @click.self="emit('close')">
        <!-- data-lenis-prevent: Lenis is stopped while the sheet is open and
             would otherwise swallow every wheel/touch event, so the sheet's
             own scroll areas need to opt out. -->
        <div
          ref="sheetRef"
          data-lenis-prevent
          class="rd-sheet relative flex h-[94svh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-[28px] bg-slateNavy text-pureWhite tablet:m-4 tablet:h-[calc(100svh-2rem)] tablet:rounded-[28px] desktop:overflow-hidden"
        >
          <div :key="article.index" class="flex flex-col desktop:grid desktop:min-h-0 desktop:flex-1 desktop:grid-cols-12">
            <!-- COVER -->
            <div class="relative shrink-0 p-3 tablet:p-4 desktop:col-span-5 desktop:h-full desktop:pr-0">
              <div
                data-rd-cover
                class="relative h-[44svh] overflow-hidden rounded-[22px] tablet:h-[52svh] desktop:h-full"
                :class="fullPoster ? 'bg-pureWhite' : 'bg-navyDeep-800'"
              >
                <img
                  v-bind="mark('coverImage', 'Gambar sampul', `article:${article.slug}`)"
                  data-rd-img
                  :src="article.image" :srcset="imgSet(article.image)" sizes="(max-width: 1023px) 100vw, 60vw"
                  :alt="article.alt"
                  class="h-full w-full"
                  :class="fullPoster ? 'object-contain' : 'object-cover'"
                  :style="{ objectPosition: fullPoster ? 'center' : `100% ${focusY}`, transformOrigin: `100% ${focusY}` }"
                >
                <div
                  aria-hidden="true"
                  class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(2,30,46,0.85)] via-[rgba(2,30,46,0.1)] to-transparent transition-opacity duration-500"
                  :class="fullPoster ? 'opacity-0' : 'opacity-100'"
                />
                <!-- Phones/tablets: close sits on the cover so it never scrolls away. -->
                <button type="button" :aria-label="t('Close')" class="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy desktop:hidden" @click="emit('close')">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
                </button>
                <!-- Top-left brand chip -->
                <span class="absolute left-4 top-4 inline-flex items-center gap-2.5 rounded-full bg-[color:rgba(3,60,89,0.72)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.8)] backdrop-blur-sm">
                  <LayoutBrandMark surface="dark" :height="10" />{{ t('Insight') }} {{ article.index }} / {{ pad(n) }}
                </span>
                <!-- Bottom: category + poster toggle -->
                <div class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div v-show="!fullPoster" class="min-w-0">
                    <span data-rd-numeral aria-hidden="true" class="rd-numeral block select-none font-display font-extrabold leading-[0.8]">{{ article.index }}</span>
                    <p v-bind="mark('kicker', 'Label kecil (kicker)', `article:${article.slug}`)" class="mt-2 font-display text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.85)]">{{ article.page?.category }}</p>
                  </div>
                  <button
                    type="button"
                    :aria-pressed="fullPoster"
                    class="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-pureWhite px-4 text-[13px] font-semibold text-slateNavy shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform duration-200 active:scale-[0.97]"
                    @click="fullPoster = !fullPoster"
                  >
                    <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                      <path v-if="!fullPoster" d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />
                      <path v-else d="M2 6h4V2M14 6h-4V2M2 10h4v4M14 10h-4v4" />
                    </svg>
                    {{ fullPoster ? t('Back to cover') : t('View full poster') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- STORY -->
            <div class="relative flex flex-1 flex-col desktop:col-span-7 desktop:h-full desktop:min-h-0">
              <!-- Top bar: close (prev/next live in the footer) -->
              <div class="flex min-h-11 items-center justify-between gap-4 px-5 pt-5 tablet:px-8 desktop:px-12 desktop:pt-7">
                <p class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
                  <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" /><span v-bind="mark('categoryIds', 'Topik (nama topik diubah di menu Categories)', `article:${article.slug}`)">{{ t(article.page?.topic ?? '') }}</span> · {{ t('The PASTI Journal') }}
                </p>
                <button type="button" :aria-label="t('Close')" class="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial hover:rotate-90 desktop:grid" @click="emit('close')">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
                </button>
              </div>

              <div ref="storyRef" class="relative flex-1 px-5 pb-8 pt-6 tablet:px-8 desktop:min-h-0 desktop:overflow-y-auto desktop:overscroll-contain desktop:px-12 desktop:pt-8">
                <h2 v-bind="mark('headline.text', 'Judul besar', `article:${article.slug}`)" data-rd-part class="relative max-w-[16ch] font-display text-[length:clamp(40px,4.4vw,72px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-pureWhite">
                  {{ article.page?.headline.text }}{{ article.page?.headline.accent ? ' ' : '' }}<span v-if="article.page?.headline.accent" v-bind="mark('headline.accent', 'Judul besar — bagian kuning', `article:${article.slug}`)" class="text-pastiYellow-500">{{ article.page.headline.accent }}</span>
                </h2>
                <p v-if="article.page?.tagline" v-bind="mark('tagline.text', 'Tagline', `article:${article.slug}`)" data-rd-part class="relative mt-4 font-display text-[clamp(18px,1.6vw,24px)] font-semibold tracking-[-0.01em] text-[color:rgba(255,255,255,0.92)]">
                  {{ article.page.tagline.text }} <span v-bind="mark('tagline.accent', 'Tagline — bagian kuning', `article:${article.slug}`)" class="text-pastiYellow-500">{{ article.page.tagline.accent }}</span>
                </p>

                <p v-bind="mark('excerpt', 'Ringkasan (paragraf pembuka)', `article:${article.slug}`)" data-rd-part class="relative mt-7 max-w-[38rem] border-l-2 border-pastiYellow-500 pl-5 text-[clamp(17px,1.35vw,21px)] leading-[1.55] text-[color:rgba(255,255,255,0.82)]">{{ article.page?.description }}</p>

                <!-- Own page (CMS articles with a written body) -->
                <NuxtLink
                  v-if="article.hasBody && article.slug"
                  data-rd-part
                  :to="articleLink(article)"
                  class="group relative mt-8 inline-flex min-h-[52px] items-center gap-4 rounded-full bg-pastiYellow-500 py-1.5 pl-6 pr-1.5 font-display text-[15px] font-bold text-slateNavy transition-transform duration-300 active:scale-[0.98]"
                  @click="emit('close')"
                >
                  {{ t('Read the full article') }}
                  <span aria-hidden="true" class="grid h-10 w-10 place-items-center rounded-full bg-slateNavy text-pureWhite transition-transform duration-500 ease-editorial group-hover:-rotate-45">
                    <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  </span>
                </NuxtLink>

                <!-- Topic grid -->
                <div v-if="article.page?.points.length" data-rd-part class="relative mt-10">
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">{{ t('In this insight') }}</p>
                  <ol class="mt-4 grid grid-cols-2 border-l border-t border-[color:rgba(255,255,255,0.12)] tablet:grid-cols-4" :class="{ 'tablet:!grid-cols-3': article.page.points.length === 3 }">
                    <li
                      v-bind="mark(`points.${i}`, `Poin ${i + 1} “Dalam insight ini”`, `article:${article.slug}`)"
                      v-for="(pt, i) in article.page.points"
                      :key="pt"
                      class="rd-cell group relative border-b border-r border-[color:rgba(255,255,255,0.12)] p-4 transition-colors duration-300"
                    >
                      <span class="font-mono text-[11px] tabular-nums text-pastiYellow-500">{{ pad(i + 1) }}</span>
                      <span class="mt-6 block font-display text-[16px] font-bold leading-tight tracking-[-0.01em] text-pureWhite">{{ pt }}</span>
                    </li>
                  </ol>
                </div>

                <!-- PASTI perspective as a pull quote -->
                <figure v-if="article.page?.pasti" data-rd-part class="relative mt-12">
                  <span aria-hidden="true" class="block font-display text-[80px] font-extrabold leading-[0.5] text-pastiYellow-500">“</span>
                  <blockquote v-bind="mark('perspective.sourceRef', 'Kutipan PASTI — pilih sumbernya (isi kutipan dari data perusahaan)', `article:${article.slug}`)" class="mt-2 max-w-[40rem] font-display text-[clamp(19px,1.6vw,25px)] font-semibold leading-[1.4] tracking-[-0.015em] text-pureWhite">{{ article.page.pasti.text }}</blockquote>
                  <figcaption class="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.55)]">
                    <span aria-hidden="true" class="h-px w-8 bg-pastiYellow-500" />
                    <LayoutBrandMark surface="dark" :height="10" />{{ article.page.pasti.label }}
                  </figcaption>
                  <ul class="mt-7 border-t border-[color:rgba(255,255,255,0.12)]">
                    <li v-for="(l, li) in article.page.pasti.links" v-bind="mark(`perspective.links.${li}.label`, 'Link di bawah kutipan', `article:${article.slug}`)" :key="l.to + l.label" class="border-b border-[color:rgba(255,255,255,0.12)]">
                      <NuxtLink :to="lp(l.to)" class="group flex min-h-[56px] items-center justify-between gap-4 py-3" @click="emit('close')">
                        <span class="font-display text-[16px] font-bold tracking-[-0.01em] text-pureWhite transition-colors duration-300 group-hover:text-pastiYellow-500">{{ l.label }}</span>
                        <span aria-hidden="true" class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:rgba(255,255,255,0.2)] transition-[background-color,border-color,color,transform] duration-500 ease-editorial group-hover:-rotate-45 group-hover:border-pastiYellow-500 group-hover:bg-pastiYellow-500 group-hover:text-slateNavy">
                          <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                        </span>
                      </NuxtLink>
                    </li>
                  </ul>
                </figure>
              </div>

              <!-- FOOTER: progress + next preview -->
              <div class="sticky bottom-0 border-t border-[color:rgba(255,255,255,0.1)] bg-slateNavy px-5 py-4 tablet:px-8 desktop:static desktop:px-12">
                <div class="flex items-center gap-4">
                  <button type="button" :aria-label="t('Previous article')" class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[color:rgba(255,255,255,0.2)] transition-colors hover:border-pastiYellow-500 hover:text-pastiYellow-500" @click="prev">
                    <svg viewBox="0 0 16 16" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  </button>
                  <div class="hidden flex-1 items-center gap-1.5 tablet:flex" aria-hidden="true">
                    <button
                      v-for="(a, i) in articles"
                      :key="a.index"
                      type="button"
                      tabindex="-1"
                      class="group h-6 flex-1"
                      @click="emit('go', i)"
                    >
                      <span class="block h-[3px] w-full rounded-full transition-colors duration-300" :class="i === index ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.18)] group-hover:bg-[color:rgba(255,255,255,0.4)]'" />
                    </button>
                  </div>
                  <button
                    v-if="nextArticle"
                    type="button"
                    class="group ml-auto flex min-w-0 items-center gap-3 text-right tablet:ml-0"
                    @click="next"
                  >
                    <span class="min-w-0">
                      <span class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">{{ t('Next') }} · {{ nextArticle.index }}</span>
                      <span v-bind="mark('title', 'Judul pendek (dipakai di “Berikutnya”)', `article:${nextArticle.slug}`)" class="block max-w-[14rem] truncate font-display text-[14px] font-bold text-pureWhite transition-colors duration-300 group-hover:text-pastiYellow-500">{{ nextArticle.title }}</span>
                    </span>
                    <span aria-hidden="true" class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pureWhite text-slateNavy transition-[background-color,transform] duration-500 ease-editorial group-hover:-rotate-45 group-hover:bg-pastiYellow-500">
                      <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rd-enter-active,
.rd-leave-active {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.rd-enter-active .rd-sheet,
.rd-leave-active .rd-sheet {
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.rd-enter-from,
.rd-leave-to {
  background-color: rgba(2, 20, 32, 0);
}
.rd-enter-from .rd-sheet,
.rd-leave-to .rd-sheet {
  transform: translateY(105%);
}

/* Index numeral on the cover (outline type, PASTI Yellow stroke). */
.rd-numeral {
  font-size: clamp(64px, 7vw, 132px);
  color: transparent;
  -webkit-text-stroke: 1.5px #fbba00;
  letter-spacing: -0.05em;
}

.rd-cell:hover {
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
