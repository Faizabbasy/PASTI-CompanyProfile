<script setup lang="ts">
import gsap from 'gsap'
import type { InsightArticle } from '~/composables/useInsights'

// READER — a full-screen reading sheet for one article (there are no article
// detail pages yet). Slides up over the index; poster on one side, the
// article's own copy (transcribed from the poster) on the other. Prev / next,
// Esc to close, ← → keys, page scroll locked while open.
const props = defineProps<{ articles: InsightArticle[]; index: number | null }>()
const emit = defineEmits<{ close: []; go: [i: number] }>()

const sheetRef = ref<HTMLElement | null>(null)
const article = computed(() => (props.index === null ? null : props.articles[props.index]!))
const pad = (n: number) => String(n).padStart(2, '0')
const n = computed(() => props.articles.length)

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
    await nextTick()
    const sheet = sheetRef.value
    if (!sheet || window.matchMedia(reducedMotionQuery.reduce).matches) return
    const parts = sheet.querySelectorAll<HTMLElement>('[data-rd-part]')
    gsap.fromTo(parts, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.06, overwrite: 'auto' })
    const img = sheet.querySelector<HTMLElement>('[data-rd-img]')
    if (img) gsap.fromTo(img, { scale: 1.08, clipPath: 'inset(6% 6% 6% 6% round 24px)' }, { scale: 1, clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapPrimary, overwrite: 'auto' })
  }
)

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
  getLenisInstance()?.start()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="rd">
      <div v-if="article" class="fixed inset-0 z-[80] flex items-end bg-[color:rgba(2,20,32,0.6)] tablet:items-stretch" role="dialog" aria-modal="true" :aria-label="article.title" @click.self="emit('close')">
        <div ref="sheetRef" class="rd-sheet relative flex h-[94svh] w-full flex-col overflow-y-auto rounded-t-[28px] bg-slateNavy text-pureWhite tablet:m-4 tablet:h-auto tablet:rounded-[28px] desktop:overflow-hidden">
          <!-- Top bar -->
          <div class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[color:rgba(255,255,255,0.1)] bg-slateNavy px-5 py-4 tablet:px-8">
            <span class="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
              <LayoutBrandMark surface="dark" :height="12" />
              Insight {{ article.index }} / {{ pad(n) }}
            </span>
            <div class="flex items-center gap-2">
              <button type="button" aria-label="Previous article" class="grid h-11 w-11 place-items-center rounded-full border border-[color:rgba(255,255,255,0.2)] transition-colors hover:border-pastiYellow-500 hover:text-pastiYellow-500" @click="prev">
                <svg viewBox="0 0 16 16" class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
              <button type="button" aria-label="Next article" class="grid h-11 w-11 place-items-center rounded-full border border-[color:rgba(255,255,255,0.2)] transition-colors hover:border-pastiYellow-500 hover:text-pastiYellow-500" @click="next">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
              <button type="button" aria-label="Close" class="ml-2 grid h-11 w-11 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform hover:rotate-90" @click="emit('close')">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
              </button>
            </div>
          </div>

          <div :key="article.index" class="grid flex-1 gap-8 p-5 tablet:p-8 desktop:grid-cols-12 desktop:items-center desktop:gap-12 desktop:p-12">
            <div class="desktop:col-span-7">
              <div data-rd-img class="overflow-hidden rounded-[24px] bg-pureWhite">
                <img :src="article.image" :alt="article.title" class="w-full object-contain">
              </div>
            </div>
            <div class="desktop:col-span-5">
              <p data-rd-part class="inline-flex items-center gap-2.5 rounded-full border border-[color:rgba(255,255,255,0.16)] py-1.5 pl-2.5 pr-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.72)]">
                <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ article.page?.topic }} · {{ article.page?.category }}
              </p>
              <h2 data-rd-part class="mt-5 font-display text-[length:clamp(36px,3.8vw,60px)] font-extrabold leading-[1] tracking-[-0.04em] text-pureWhite">
                {{ article.page?.headline.text }} <span class="text-pastiYellow-500">{{ article.page?.headline.accent }}</span>
              </h2>
              <p v-if="article.page?.tagline" data-rd-part class="mt-3 font-display text-[20px] font-semibold text-[color:rgba(255,255,255,0.9)]">
                {{ article.page.tagline.text }} <span class="text-pastiYellow-500">{{ article.page.tagline.accent }}</span>
              </p>
              <p data-rd-part class="mt-5 text-token-body-large text-[color:rgba(255,255,255,0.72)]">{{ article.page?.description }}</p>
              <ul v-if="article.page?.points.length" data-rd-part class="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[color:rgba(255,255,255,0.12)] pt-6">
                <li v-for="pt in article.page.points" :key="pt" class="flex items-center gap-3 font-display text-[14px] font-semibold text-[color:rgba(255,255,255,0.85)]">
                  <span aria-hidden="true" class="h-px w-4 bg-pastiYellow-500" />{{ pt }}
                </li>
              </ul>
              <p data-rd-part class="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.4)]">← → to browse · Esc to close</p>
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
</style>
