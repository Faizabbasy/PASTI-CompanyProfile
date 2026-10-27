<script setup lang="ts">
import gsap from 'gsap'
import type { InsightArticlePageView } from '~/composables/useInsightArticle'

// ARTICLE HERO — the Reader's editorial spread as the top of a real page
// (dark Slate Navy, white type, the yellow accent from the poster). Story on
// the left (kicker, H1, tagline, lead, byline), the poster cover on the right
// cropped to its focal point exactly like the Reader ("View full poster"
// shows all of it). The "In this insight" points close the hero as a strip.
// Motion: H1 words rise out of masks, the cover unclips and settles, the
// byline cells and points draw in after. Reduced motion: all static.
const props = defineProps<{ page: InsightArticlePageView }>()
const t = useT()
const lp = useLocalePath()
const locale = useLocale()
const mark = useCmsMark()
const rec = computed(() => `article:${props.page.article.slug}`)
const a = computed(() => props.page.article)
const pad = (n: number) => String(n).padStart(2, '0')

const headWords = computed(() => a.value.page.headline.text.split(/\s+/).filter(Boolean))
const accentWords = computed(() => a.value.page.headline.accent.split(/\s+/).filter(Boolean))
const dateLabel = computed(() => {
  const d = props.page.date
  if (!d) return ''
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`))
})

// Cover crop — same rule as the Reader: posters carry their own headline on
// the left half, so the cover zooms (origin right) until ~48% shows.
const rootRef = ref<HTMLElement | null>(null)
const fullPoster = ref(false)
const VISIBLE = 0.48
const focusY = computed(() => (a.value.page.focus ?? '50% 50%').split(' ')[1] ?? '50%')
const img = () => rootRef.value?.querySelector<HTMLImageElement>('[data-ah-img]') ?? null
const coverScale = () => {
  const el = img()
  const box = el?.parentElement
  if (!el || !box || !el.naturalWidth) return 1
  const fit = Math.min(1, box.clientWidth / box.clientHeight / (el.naturalWidth / el.naturalHeight))
  return Math.min(1.8, Math.max(1.04, fit / VISIBLE))
}
const fitCover = (animate = true) => {
  const el = img()
  if (!el) return
  const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
  gsap.to(el, { scale: fullPoster.value ? 1 : coverScale(), duration: animate && !reduce ? motionTier.standardMax : 0, ease: approvedEase.gsapStandard, overwrite: 'auto' })
}
watch(fullPoster, () => fitCover())
const onResize = () => fitCover(false)
onMounted(() => window.addEventListener('resize', onResize, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

useGsapContext(() => {
  const root = rootRef.value
  if (!root) return
  const words = root.querySelectorAll<HTMLElement>('[data-ah-word]')
  const parts = root.querySelectorAll<HTMLElement>('[data-ah-part]')
  const cells = root.querySelectorAll<HTMLElement>('[data-ah-cell]')
  const cover = root.querySelector<HTMLElement>('[data-ah-cover]')
  const numeral = root.querySelector<HTMLElement>('[data-ah-numeral]')
  const el = img()
  const whenLoaded = (fn: () => void) => {
    if (!el) return
    if (el.complete && el.naturalWidth) fn()
    else el.addEventListener('load', fn, { once: true })
  }
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set([...words, ...parts, ...cells, numeral].filter(Boolean), { clearProps: 'all' })
    whenLoaded(() => fitCover(false))
  })
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(words, { yPercent: 110 })
    gsap.set(parts, { autoAlpha: 0, y: 18 })
    gsap.set(cells, { autoAlpha: 0, x: -16 })
    if (cover) gsap.set(cover, { clipPath: 'inset(100% 0% 0% 0% round 26px)' })
    if (numeral) gsap.set(numeral, { yPercent: 40, autoAlpha: 0 })
    const tl = gsap.timeline({ delay: 0.15 })
    tl.to(words, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.06 })
    if (cover) tl.to(cover, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapCinematic }, 0.1)
    if (numeral) tl.to(numeral, { yPercent: 0, autoAlpha: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary }, 0.6)
    tl.to(parts, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 }, 0.35)
      .to(cells, { autoAlpha: 1, x: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.06 }, 0.7)
    whenLoaded(() => {
      const end = coverScale()
      gsap.fromTo(el, { scale: end * 1.18 }, { scale: end, duration: motionTier.cinematicMax * 1.1, ease: approvedEase.gsapPrimary, overwrite: 'auto' })
    })
    return () => tl.kill()
  })
})
</script>

<template>
  <section ref="rootRef" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy pb-12 pt-28 text-pureWhite tablet:pb-16 desktop:pt-36">
    <BaseGridLines tone="dark" />
    <!-- Soft yellow light behind the cover (the poster's own accent). -->
    <div aria-hidden="true" class="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-pastiYellow-500 opacity-[0.07] blur-[120px]" />

    <BaseContainer class="relative z-10">
      <!-- Crumb + issue position -->
      <div data-ah-part class="flex flex-wrap items-center justify-between gap-3">
        <nav :aria-label="t('Breadcrumb')" class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
          <ol class="flex flex-wrap items-center gap-2">
            <li><NuxtLink :to="lp('/insights')" class="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-pastiYellow-500">
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 rotate-180" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>{{ t('The PASTI Journal') }}
            </NuxtLink></li>
            <li aria-hidden="true">/</li>
            <li v-bind="mark('categoryIds', 'Topik (nama topik diubah di menu Categories)', rec)">{{ t(a.page.topic) }}</li>
          </ol>
        </nav>
        <span v-if="page.position" class="inline-flex items-center gap-2.5 rounded-full border border-[color:rgba(255,255,255,0.16)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.75)]">
          <LayoutBrandMark surface="dark" :height="10" />{{ t('Insight') }} {{ a.index }} / {{ pad(page.total) }}
        </span>
      </div>

      <div class="mt-8 grid gap-10 desktop:mt-12 desktop:grid-cols-12 desktop:gap-12">
        <!-- STORY -->
        <div class="desktop:col-span-7 desktop:flex desktop:flex-col desktop:justify-center">
          <p data-ah-part class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.7)]">
            <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" /><span v-bind="mark('kicker', 'Label kecil (kicker)', rec)">{{ a.page.category }}</span>
          </p>
          <h1 :aria-label="`${a.page.headline.text} ${a.page.headline.accent}`.trim()" class="mt-5 font-display text-[length:clamp(44px,6.4vw,108px)] font-extrabold leading-[0.92] tracking-[-0.05em] text-pureWhite">
            <span v-bind="mark('headline.text', 'Judul besar', rec)" aria-hidden="true">
              <span v-for="(w, i) in headWords" :key="`h${i}`" class="ah-mask"><span data-ah-word class="inline-block">{{ w }}</span></span>
            </span>
            <span v-if="accentWords.length" v-bind="mark('headline.accent', 'Judul besar — bagian kuning', rec)" aria-hidden="true" class="text-pastiYellow-500">
              <span v-for="(w, i) in accentWords" :key="`a${i}`" class="ah-mask"><span data-ah-word class="inline-block">{{ w }}</span></span>
            </span>
          </h1>
          <p v-if="a.page.tagline" v-bind="mark('tagline.text', 'Tagline', rec)" data-ah-part class="mt-5 font-display text-[clamp(18px,1.7vw,26px)] font-semibold tracking-[-0.01em] text-[color:rgba(255,255,255,0.92)]">
            {{ a.page.tagline.text }} <span v-bind="mark('tagline.accent', 'Tagline — bagian kuning', rec)" class="text-pastiYellow-500">{{ a.page.tagline.accent }}</span>
          </p>
          <p v-bind="mark('excerpt', 'Ringkasan (paragraf pembuka)', rec)" data-ah-part class="mt-8 max-w-[40rem] border-l-2 border-pastiYellow-500 pl-5 text-[clamp(17px,1.35vw,21px)] leading-[1.6] text-[color:rgba(255,255,255,0.82)]">{{ a.page.description }}</p>

          <!-- Byline: only what the article actually has. -->
          <dl class="ah-byline mt-10 grid grid-cols-2 border-l border-t border-[color:rgba(255,255,255,0.12)] tablet:grid-cols-3">
            <div v-if="page.author" v-bind="mark('authorName', 'Penulis', rec)" data-ah-cell class="border-b border-r border-[color:rgba(255,255,255,0.12)] p-4">
              <dt class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">{{ t('Written by') }}</dt>
              <dd class="mt-2 font-display text-[15px] font-bold leading-tight">{{ page.author }}</dd>
            </div>
            <div v-if="dateLabel" v-bind="mark('publishDate', 'Tanggal tulisan', rec)" data-ah-cell class="border-b border-r border-[color:rgba(255,255,255,0.12)] p-4">
              <dt class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">{{ t('Published') }}</dt>
              <dd class="mt-2 font-display text-[15px] font-bold leading-tight"><time :datetime="page.date">{{ dateLabel }}</time></dd>
            </div>
            <div data-ah-cell class="border-b border-r border-[color:rgba(255,255,255,0.12)] p-4">
              <dt class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">{{ t('Reading time') }}</dt>
              <dd class="mt-2 font-display text-[15px] font-bold leading-tight">{{ t('{n} min read', { n: String(page.readMinutes) }) }}</dd>
            </div>
          </dl>
        </div>

        <!-- COVER -->
        <div class="desktop:col-span-5">
          <div
            data-ah-cover
            class="relative aspect-[4/3] overflow-hidden rounded-[26px] tablet:aspect-[16/10] desktop:aspect-auto desktop:h-full desktop:min-h-[560px]"
            :class="fullPoster ? 'bg-pureWhite' : 'bg-navyDeep-800'"
          >
            <img
              v-bind="mark('coverImage', 'Gambar sampul', rec)"
              data-ah-img
              :src="a.image" :srcset="imgSet(a.image)" sizes="(max-width: 1023px) 100vw, 42vw"
              :alt="a.alt"
              fetchpriority="high"
              class="h-full w-full"
              :class="fullPoster ? 'object-contain' : 'object-cover'"
              :style="{ objectPosition: fullPoster ? 'center' : `100% ${focusY}`, transformOrigin: `100% ${focusY}` }"
            >
            <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(2,30,46,0.85)] via-[rgba(2,30,46,0.08)] to-transparent transition-opacity duration-500" :class="fullPoster ? 'opacity-0' : 'opacity-100'" />
            <div class="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
              <span v-show="!fullPoster" data-ah-numeral aria-hidden="true" class="ah-numeral block select-none font-display font-extrabold leading-[0.8]">{{ a.index }}</span>
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
      </div>

      <!-- In this insight -->
      <div v-if="a.page.points.length" class="mt-12 desktop:mt-16">
        <p data-ah-part class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">{{ t('In this insight') }}</p>
        <ol class="mt-4 grid grid-cols-2 border-l border-t border-[color:rgba(255,255,255,0.12)] tablet:grid-cols-4" :class="{ 'tablet:!grid-cols-3': a.page.points.length === 3 }">
          <li v-for="(pt, i) in a.page.points" v-bind="mark(`points.${i}`, `Poin ${i + 1} “Dalam insight ini”`, rec)" :key="pt" data-ah-cell class="ah-cell border-b border-r border-[color:rgba(255,255,255,0.12)] p-4 transition-colors duration-300 tablet:p-5">
            <span class="font-mono text-[11px] tabular-nums text-pastiYellow-500">{{ pad(i + 1) }}</span>
            <span class="mt-6 block font-display text-[16px] font-bold leading-tight tracking-[-0.01em] tablet:text-[18px]">{{ pt }}</span>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
/* Word mask: room below the baseline so descenders aren't clipped. */
.ah-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
  margin-right: 0.22em;
}
.ah-mask:last-child {
  margin-right: 0;
}
.ah-numeral {
  font-size: clamp(64px, 7vw, 132px);
  color: transparent;
  -webkit-text-stroke: 1.5px #fbba00;
  letter-spacing: -0.05em;
}
.ah-byline > :last-child:nth-child(odd) {
  grid-column: span 2;
}
@media (min-width: 640px) {
  .ah-byline > :last-child:nth-child(odd) {
    grid-column: auto;
  }
}
.ah-cell:hover {
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
