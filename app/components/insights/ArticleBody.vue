<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { InsightArticlePageView } from '~/composables/useInsightArticle'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// ARTICLE BODY — long-form reading on white (navy type, ~68ch measure).
// Desktop: a sticky rail on the left carries the contents (active chapter
// follows the scroll), reading progress and sharing; phones get a fold-out
// contents box and the share row at the end (the header's own line tracks
// the page; the rail shows how much of the text is read). Chapters (H2) carry a
// numbered rule; images break out wider than the text. The PASTI
// perspective closes the text as a dark pull-quote card.
// Motion: chapter rules draw, images unclip once — reading never waits on
// an animation. Reading % + active chapter work with reduced motion too.
const props = defineProps<{ page: InsightArticlePageView }>()
const t = useT()
const lp = useLocalePath()
const route = useRoute()
const mark = useCmsMark()
const rec = computed(() => `article:${props.page.article.slug}`)
const pasti = computed(() => props.page.article.page.pasti)
const pad = (n: number) => String(n).padStart(2, '0')

// Chapter numbers for H2s (H3s sit under the current chapter).
const chapterNo = computed(() => {
  let n = 0
  return props.page.body.map((b) => (b.type === 'heading' && b.level === 2 ? ++n : 0))
})
// The first paragraph opens with a drop cap.
const firstParagraph = computed(() => props.page.body.findIndex((b) => b.type === 'paragraph'))

const rootRef = ref<HTMLElement | null>(null)
const articleRef = ref<HTMLElement | null>(null)
const active = ref(props.page.toc[0]?.id ?? '')
const progress = ref(0)
const tocOpen = ref(false)

const goTo = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  tocOpen.value = false
  const lenis = getLenisInstance()
  // After a client-side route change Lenis may still hold the previous
  // page's height (it would stop short), so re-measure first.
  lenis?.resize()
  if (lenis) lenis.scrollTo(el, { offset: -110, duration: 1.2 })
  else el.scrollIntoView({ behavior: window.matchMedia(reducedMotionQuery.reduce).matches ? 'auto' : 'smooth' })
  history.replaceState(history.state, '', `#${id}`)
}

// Sharing: the canonical address, never a preview URL.
const shareUrl = computed(() => useSiteUrl(route.path.replace(/\/+$/, '') || '/'))
const shareText = computed(() => props.page.article.title)
const copied = ref(false)
const canNativeShare = ref(false)
onMounted(() => (canNativeShare.value = typeof navigator !== 'undefined' && !!navigator.share))
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 2200)
  } catch {
    /* clipboard blocked — the address bar still has it */
  }
}
const nativeShare = () => navigator.share?.({ title: shareText.value, url: shareUrl.value }).catch(() => {})
const waHref = computed(() => `https://wa.me/?text=${encodeURIComponent(`${shareText.value} — ${shareUrl.value}`)}`)
const inHref = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`)

useGsapContext(() => {
  const root = rootRef.value
  const article = articleRef.value
  if (!root || !article) return
  const read = ScrollTrigger.create({
    trigger: article,
    start: 'top 70%',
    end: 'bottom 60%',
    onUpdate: (s) => {
      progress.value = Math.round(s.progress * 100)
    }
  })
  const chapters = props.page.toc.map((c) => {
    const el = document.getElementById(c.id)
    return el
      ? ScrollTrigger.create({ trigger: el, start: 'top 35%', end: 'max', onEnter: () => (active.value = c.id), onEnterBack: () => (active.value = c.id), onLeaveBack: () => {
        const i = props.page.toc.findIndex((x) => x.id === c.id)
        active.value = props.page.toc[Math.max(0, i - 1)]!.id
      } })
      : null
  })

  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    const rules = root.querySelectorAll<HTMLElement>('[data-ab-rule]')
    const figures = root.querySelectorAll<HTMLElement>('[data-ab-figure]')
    gsap.set(rules, { scaleX: 0, transformOrigin: '0% 50%' })
    gsap.set(figures, { clipPath: 'inset(10% 6% 10% 6% round 22px)' })
    const r = ScrollTrigger.batch(rules, { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { scaleX: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic }) })
    const f = ScrollTrigger.batch(figures, { start: 'top 85%', once: true, onEnter: (els) => gsap.to(els, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapCinematic }) })
    return () => [...r, ...f].forEach((x) => x.kill())
  })
  return () => {
    read.kill()
    chapters.forEach((c) => c?.kill())
  }
})
</script>

<template>
  <div ref="rootRef" class="relative bg-pureWhite text-slateNavy">
    <BaseContainer class="py-16 tablet:py-24">
      <div class="grid gap-10 desktop:grid-cols-12 desktop:gap-12">
        <!-- RAIL (desktop) -->
        <aside class="hidden desktop:col-span-3 desktop:block">
          <div class="sticky top-28 flex max-h-[calc(100svh-8rem)] flex-col gap-10 overflow-y-auto pb-6" data-lenis-prevent>
            <nav v-if="page.toc.length" :aria-label="t('Contents')">
              <p class="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">
                <span>{{ t('Contents') }}</span><span class="tabular-nums">{{ progress }}%</span>
              </p>
              <ol class="mt-4 border-l border-[color:rgba(3,60,89,0.14)]">
                <li v-for="c in page.toc" :key="c.id">
                  <a
                    :href="`#${c.id}`"
                    class="relative -ml-px block border-l-2 py-2 pr-2 text-[14px] leading-snug transition-colors duration-300"
                    :class="[c.level === 3 ? 'pl-8' : 'pl-4', active === c.id ? 'border-pastiYellow-500 font-bold text-slateNavy' : 'border-transparent text-[color:rgba(3,60,89,0.6)] hover:text-slateNavy']"
                    :aria-current="active === c.id ? 'true' : undefined"
                    @click.prevent="goTo(c.id)"
                  >{{ c.text }}</a>
                </li>
              </ol>
            </nav>
            <div>
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">{{ t('Share') }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <button type="button" class="ab-share" :aria-label="t('Copy link')" @click="copyLink">
                  <svg v-if="!copied" viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.5l1-1a2.8 2.8 0 014 4l-1 1M9 11.5l-1 1a2.8 2.8 0 01-4-4l1-1" /></svg>
                  <svg v-else viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                </button>
                <a :href="waHref" target="_blank" rel="noopener" class="ab-share" :aria-label="t('Share on WhatsApp')"><span class="block h-[18px] w-[18px]"><LayoutSocialIcon name="whatsapp" /></span></a>
                <a :href="inHref" target="_blank" rel="noopener" class="ab-share" :aria-label="t('Share on LinkedIn')"><span class="block h-[18px] w-[18px]"><LayoutSocialIcon name="linkedin" /></span></a>
              </div>
              <p class="mt-2 h-4 text-[12px] text-[color:rgba(3,60,89,0.6)]" aria-live="polite">{{ copied ? t('Link copied') : '' }}</p>
            </div>
            <NuxtLink :to="lp('/insights')" class="group inline-flex min-h-11 items-center gap-3 font-display text-[14px] font-bold">
              <span aria-hidden="true" class="grid h-10 w-10 place-items-center rounded-full border border-[color:rgba(3,60,89,0.2)] transition-colors duration-300 group-hover:border-pastiYellow-500 group-hover:bg-pastiYellow-500">
                <svg viewBox="0 0 16 16" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
              {{ t('All insights') }}
            </NuxtLink>
          </div>
        </aside>

        <!-- TEXT -->
        <div class="min-w-0 desktop:col-span-8 desktop:col-start-5">
          <!-- Contents (phones / tablets) -->
          <div v-if="page.toc.length" class="mb-12 rounded-[20px] border border-[color:rgba(3,60,89,0.14)] desktop:hidden">
            <button type="button" class="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 text-left" :aria-expanded="tocOpen" aria-controls="article-toc" @click="tocOpen = !tocOpen">
              <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">{{ t('Contents') }} · {{ pad(page.toc.length) }}</span>
              <span aria-hidden="true" class="grid h-9 w-9 place-items-center rounded-full bg-slateNavy text-pureWhite transition-transform duration-500 ease-editorial" :class="tocOpen ? 'rotate-45' : ''">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10" /></svg>
              </span>
            </button>
            <div id="article-toc" class="grid transition-[grid-template-rows] duration-500 ease-editorial" :class="tocOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
              <ol class="overflow-hidden px-5" :class="tocOpen ? 'pb-4' : ''">
                <li v-for="c in page.toc" :key="c.id" class="border-t border-[color:rgba(3,60,89,0.1)]">
                  <a :href="`#${c.id}`" :tabindex="tocOpen ? undefined : -1" class="flex min-h-11 items-center py-2 text-[15px] leading-snug" :class="c.level === 3 ? 'pl-4 text-[color:rgba(3,60,89,0.7)]' : 'font-semibold'" @click.prevent="goTo(c.id)">{{ c.text }}</a>
                </li>
              </ol>
            </div>
          </div>

          <article ref="articleRef" class="ab-prose">
            <template v-for="(b, i) in page.body" :key="i">
              <p v-if="b.type === 'paragraph'" v-bind="mark(`body.${i}.text`, 'Isi — paragraf', rec)" :class="{ 'ab-lead': i === firstParagraph }"><InsightsRichText :text="b.text" /></p>

              <h2 v-else-if="b.type === 'heading' && b.level === 2" :id="page.anchors[i]" v-bind="mark(`body.${i}.text`, 'Isi — subjudul', rec)" class="ab-h2">
                <span class="flex items-center gap-4 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.5)]">
                  {{ pad(chapterNo[i] ?? 0) }}<span data-ab-rule aria-hidden="true" class="h-[2px] w-16 bg-pastiYellow-500" />
                </span>
                <span class="mt-4 block"><InsightsRichText :text="b.text" /></span>
              </h2>
              <h3 v-else-if="b.type === 'heading'" :id="page.anchors[i]" v-bind="mark(`body.${i}.text`, 'Isi — subjudul kecil', rec)" class="ab-h3"><InsightsRichText :text="b.text" /></h3>

              <figure v-else-if="b.type === 'quote'" v-bind="mark(`body.${i}.text`, 'Isi — kutipan', rec)" class="ab-quote">
                <span aria-hidden="true" class="block font-display text-[72px] font-extrabold leading-[0.5] text-pastiYellow-500">“</span>
                <blockquote class="mt-3 font-display text-[clamp(22px,2.2vw,32px)] font-bold leading-[1.3] tracking-[-0.02em] text-slateNavy"><InsightsRichText :text="b.text" /></blockquote>
                <figcaption v-if="b.attribution" class="mt-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.6)]">
                  <span aria-hidden="true" class="h-px w-8 bg-slateNavy" />{{ b.attribution }}
                </figcaption>
              </figure>

              <component :is="b.style === 'numbered' ? 'ol' : 'ul'" v-else-if="b.type === 'list'" v-bind="mark(`body.${i}.items`, 'Isi — daftar poin', rec)" :class="b.style === 'numbered' ? 'ab-ol' : 'ab-ul'">
                <li v-for="(item, k) in b.items" :key="k">
                  <span v-if="b.style === 'numbered'" aria-hidden="true" class="ab-num">{{ pad(k + 1) }}</span>
                  <span v-else aria-hidden="true" class="ab-dot" />
                  <span class="min-w-0"><InsightsRichText :text="item" /></span>
                </li>
              </component>

              <figure v-else-if="b.type === 'image'" class="ab-figure">
                <div data-ab-figure class="overflow-hidden rounded-[22px] bg-surfaceNeutral">
                  <img v-bind="mark(`body.${i}.src`, 'Isi — gambar', rec)" :src="b.src" :srcset="imgSet(b.src)" sizes="(max-width: 1023px) 92vw, 60vw" :alt="b.alt" loading="lazy" decoding="async" class="block h-auto w-full">
                </div>
                <figcaption v-if="b.caption" v-bind="mark(`body.${i}.caption`, 'Isi — keterangan gambar', rec)" class="mt-3 flex gap-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-[color:rgba(3,60,89,0.6)]">
                  <span aria-hidden="true" class="mt-[0.55em] h-px w-6 shrink-0 bg-pastiYellow-500" />{{ b.caption }}
                </figcaption>
              </figure>

              <div v-else-if="b.type === 'divider'" class="ab-divider" role="separator">
                <span aria-hidden="true" class="h-px flex-1 bg-[color:rgba(3,60,89,0.14)]" />
                <LayoutBrandMark surface="light" :height="12" />
                <span aria-hidden="true" class="h-px flex-1 bg-[color:rgba(3,60,89,0.14)]" />
              </div>
            </template>
          </article>

          <!-- PASTI perspective -->
          <figure v-if="pasti" class="relative mt-16 overflow-hidden rounded-[28px] bg-slateNavy p-7 text-pureWhite tablet:p-12">
            <BaseGridLines tone="dark" />
            <div class="relative">
              <p class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
                <LayoutBrandMark surface="dark" :height="11" />{{ t('PASTI perspective') }}
              </p>
              <span aria-hidden="true" class="mt-8 block font-display text-[80px] font-extrabold leading-[0.5] text-pastiYellow-500">“</span>
              <blockquote v-bind="mark('perspective.sourceRef', 'Kutipan PASTI — pilih sumbernya (isi kutipan dari data perusahaan)', rec)" class="mt-2 max-w-[42rem] font-display text-[clamp(20px,1.9vw,28px)] font-semibold leading-[1.4] tracking-[-0.015em]">{{ pasti.text }}</blockquote>
              <figcaption class="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
                <span aria-hidden="true" class="h-px w-8 bg-pastiYellow-500" />{{ pasti.label }}
              </figcaption>
              <ul v-if="pasti.links.length" class="mt-8 border-t border-[color:rgba(255,255,255,0.12)]">
                <li v-for="(l, li) in pasti.links" v-bind="mark(`perspective.links.${li}.label`, 'Link di bawah kutipan', rec)" :key="l.to + l.label" class="border-b border-[color:rgba(255,255,255,0.12)]">
                  <NuxtLink :to="lp(l.to)" class="group flex min-h-[56px] items-center justify-between gap-4 py-3">
                    <span class="font-display text-[16px] font-bold tracking-[-0.01em] transition-colors duration-300 group-hover:text-pastiYellow-500">{{ l.label }}</span>
                    <span aria-hidden="true" class="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:rgba(255,255,255,0.2)] transition-[background-color,border-color,color,transform] duration-500 ease-editorial group-hover:-rotate-45 group-hover:border-pastiYellow-500 group-hover:bg-pastiYellow-500 group-hover:text-slateNavy">
                      <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </figure>

          <!-- Share (phones / tablets) -->
          <div class="mt-12 flex flex-wrap items-center gap-3 border-t border-[color:rgba(3,60,89,0.14)] pt-6 desktop:hidden">
            <p class="mr-auto font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">{{ copied ? t('Link copied') : t('Share') }}</p>
            <button v-if="canNativeShare" type="button" class="ab-share" :aria-label="t('Share')" @click="nativeShare">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 10V2M5 5l3-3 3 3M3 8v5h10V8" /></svg>
            </button>
            <button type="button" class="ab-share" :aria-label="t('Copy link')" @click="copyLink">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.5l1-1a2.8 2.8 0 014 4l-1 1M9 11.5l-1 1a2.8 2.8 0 01-4-4l1-1" /></svg>
            </button>
            <a :href="waHref" target="_blank" rel="noopener" class="ab-share" :aria-label="t('Share on WhatsApp')"><span class="block h-[18px] w-[18px]"><LayoutSocialIcon name="whatsapp" /></span></a>
            <a :href="inHref" target="_blank" rel="noopener" class="ab-share" :aria-label="t('Share on LinkedIn')"><span class="block h-[18px] w-[18px]"><LayoutSocialIcon name="linkedin" /></span></a>
          </div>
        </div>
      </div>
    </BaseContainer>
  </div>
</template>

<style scoped>
.ab-prose {
  max-width: 44rem;
  font-size: clamp(17px, 1.2vw, 19px);
  line-height: 1.75;
  color: rgba(3, 60, 89, 0.86);
}
.ab-prose > * + * {
  margin-top: 1.4em;
}
.ab-lead {
  font-size: 1.12em;
  color: #033c59;
}
.ab-lead::first-letter {
  float: left;
  margin: 0.08em 0.14em 0 0;
  padding: 0.12em 0.16em 0.04em;
  border-radius: 14px;
  background: #fbba00;
  color: #033c59;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 3.4em;
  line-height: 0.82;
}
.ab-h2 {
  margin-top: 2.6em !important;
  scroll-margin-top: 7rem;
  font-family: var(--font-display);
  font-size: clamp(28px, 2.8vw, 42px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: #033c59;
}
.ab-h3 {
  margin-top: 2em !important;
  scroll-margin-top: 7rem;
  font-family: var(--font-display);
  font-size: clamp(21px, 1.7vw, 26px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #033c59;
}
.ab-h2 + *,
.ab-h3 + * {
  margin-top: 0.9em;
}
.ab-quote {
  margin-top: 2.4em !important;
  margin-bottom: 2.4em;
  border-left: 2px solid #fbba00;
  padding-left: clamp(20px, 2.4vw, 36px);
}
.ab-ul > li,
.ab-ol > li {
  display: flex;
  gap: 0.9em;
}
.ab-ul > li + li,
.ab-ol > li + li {
  margin-top: 0.7em;
}
.ab-dot {
  margin-top: 0.68em;
  height: 7px;
  width: 7px;
  flex-shrink: 0;
  border-radius: 2px;
  background: #fbba00;
}
.ab-num {
  flex-shrink: 0;
  min-width: 1.8em;
  padding-top: 0.28em;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.72em;
  font-variant-numeric: tabular-nums;
  color: rgba(3, 60, 89, 0.55);
}
.ab-figure {
  margin-top: 2.6em !important;
  margin-bottom: 2.6em;
}
@media (min-width: 1024px) {
  /* Images break out of the measure, to the right. */
  .ab-figure {
    width: calc(100% + 8rem);
    max-width: none;
  }
}
.ab-divider {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 3em !important;
  margin-bottom: 3em;
}
.ab-share {
  display: grid;
  height: 44px;
  width: 44px;
  place-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(3, 60, 89, 0.2);
  color: #033c59;
  transition: background-color 0.3s, border-color 0.3s;
}
.ab-share:hover {
  border-color: #fbba00;
  background-color: #fbba00;
}
</style>
