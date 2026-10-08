<script setup lang="ts">
import type { FeaturedCase } from '~/composables/useFeaturedCases'

// One Featured Case as a dossier of numbered chapters (right side of the
// case dossier in FeaturedCases). A chapter renders only when the case has
// source-backed data for it; only 'approved' metrics / visuals are shown.
// The lead visual lives in the reel strip above, so the Gallery chapter shows
// the remaining approved visuals at their own ratio.
// Rows marked [data-cp-anim] settle in on case change (FeaturedCases).
const props = defineProps<{ item: FeaturedCase }>()

const gallery = computed(() => approvedVisuals(props.item).slice(1))
const metrics = computed(() => approvedMetrics(props.item))
const weeks = computed(() => props.item.timeline?.steps.reduce((n, s) => n + s.weeks, 0) ?? 0)

type ChapterKey = 'challenge' | 'second' | 'outcome' | 'insight' | 'timeline' | 'stack' | 'gallery'
const chapters = computed(() => {
  const c = props.item
  const out: Array<{ key: ChapterKey; label: string }> = []
  if (c.challenge?.length) out.push({ key: 'challenge', label: 'Challenge' })
  if (c.solution?.length) out.push({ key: 'second', label: 'What we built' })
  else if (c.request?.length) out.push({ key: 'second', label: 'What was requested' })
  if (c.outcome?.length || metrics.value.length) out.push({ key: 'outcome', label: 'Outcome' })
  if (c.insight) out.push({ key: 'insight', label: 'Insight' })
  if (c.timeline) out.push({ key: 'timeline', label: 'Delivery timeline' })
  if (c.technologyStack?.length) out.push({ key: 'stack', label: 'Technology stack' })
  if (gallery.value.length) out.push({ key: 'gallery', label: 'Inside the product' })
  return out
})
const secondItems = computed(() => props.item.solution ?? props.item.request ?? [])
</script>

<template>
  <ol class="border-b border-[color:rgba(255,255,255,0.14)]">
    <li
      v-for="(ch, n) in chapters"
      :key="ch.key"
      data-cp-anim
      class="grid gap-5 border-t border-[color:rgba(255,255,255,0.14)] py-9 desktop:grid-cols-[170px_minmax(0,1fr)] desktop:gap-8 desktop:py-11"
    >
      <h4 class="m-center flex items-baseline gap-3 desktop:block">
        <span class="font-mono text-[11px] tracking-[0.18em] text-[color:rgba(255,255,255,0.4)]">{{ String(n + 1).padStart(2, '0') }}</span>
        <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-pastiYellow-500 desktop:mt-2 desktop:block">{{ ch.label }}</span>
      </h4>

      <!-- Challenge -->
      <ol v-if="ch.key === 'challenge'" class="space-y-5">
        <li v-for="(t, i) in item.challenge" :key="i" class="grid grid-cols-[36px_1fr] font-display text-[length:clamp(18px,1.6vw,22px)] font-semibold leading-[1.35] tracking-[-0.01em] text-pureWhite">
          <span class="pt-1 font-mono text-[11px] font-normal text-pastiYellow-500">{{ String(i + 1).padStart(2, '0') }}</span>{{ t }}
        </li>
      </ol>

      <!-- What we built / requested -->
      <ul v-else-if="ch.key === 'second'" class="grid gap-x-8 gap-y-4 tablet:grid-cols-2">
        <li v-for="(t, i) in secondItems" :key="i" class="grid grid-cols-[22px_1fr] text-[16px] leading-relaxed text-[color:rgba(255,255,255,0.85)]">
          <svg viewBox="0 0 16 16" class="mt-[5px] h-3.5 w-3.5 text-pastiYellow-500" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>{{ t }}
        </li>
      </ul>

      <!-- Outcome -->
      <div v-else-if="ch.key === 'outcome'">
        <dl v-if="metrics.length" class="grid gap-6 tablet:grid-cols-2">
          <div v-for="m in metrics" :key="m.label" class="flex flex-col-reverse border-l-2 border-pastiYellow-500 pl-5">
            <dt class="mt-2 max-w-[22ch] text-[15px] font-semibold leading-snug text-[color:rgba(255,255,255,0.8)]">{{ m.label }}</dt>
            <dd class="font-display text-[length:clamp(64px,7vw,104px)] font-extrabold leading-[0.85] tracking-[-0.05em] text-pastiYellow-500">{{ m.value }}</dd>
          </div>
        </dl>
        <ul v-if="item.outcome?.length" class="space-y-3" :class="metrics.length ? 'mt-8' : ''">
          <li v-for="(o, i) in item.outcome" :key="i" class="grid grid-cols-[22px_1fr] text-[17px] font-semibold leading-snug text-pureWhite">
            <span aria-hidden="true" class="mt-[9px] h-2 w-2 rounded-full bg-pastiYellow-500" />{{ o }}
          </li>
        </ul>
      </div>

      <!-- Insight -->
      <blockquote v-else-if="ch.key === 'insight'" class="relative font-display text-[length:clamp(20px,2vw,28px)] font-bold leading-[1.3] tracking-[-0.02em] text-pureWhite">
        <span aria-hidden="true" class="mr-1 text-pastiYellow-500">“</span>{{ item.insight }}<span aria-hidden="true" class="text-pastiYellow-500">”</span>
      </blockquote>

      <!-- Timeline -->
      <div v-else-if="ch.key === 'timeline' && item.timeline">
        <p class="font-display text-[length:clamp(36px,4vw,56px)] font-extrabold leading-none tracking-[-0.04em] text-pureWhite">{{ item.timeline.total }}</p>
        <ol class="mt-6 flex gap-1.5" :aria-label="`Delivery timeline, ${item.timeline.total} in total`">
          <li v-for="(s, i) in item.timeline.steps" :key="s.label" class="min-w-0" :style="{ flexGrow: s.weeks, flexBasis: 0 }">
            <span aria-hidden="true" class="block h-3 rounded-full" :class="i === 2 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.25)]'" />
            <span class="mt-2 block font-mono text-[10px] text-[color:rgba(255,255,255,0.5)]">{{ s.weeks }}w</span>
          </li>
        </ol>
        <ul class="mt-5 grid gap-x-6 gap-y-2 tablet:grid-cols-2">
          <li v-for="(s, i) in item.timeline.steps" :key="s.label" class="flex items-center gap-2.5 text-[14px] text-[color:rgba(255,255,255,0.8)]">
            <span aria-hidden="true" class="h-2 w-2 shrink-0 rounded-full" :class="i === 2 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.35)]'" />{{ s.label }} <span class="text-[color:rgba(255,255,255,0.45)]">· {{ s.weeks }} wk</span>
          </li>
        </ul>
        <span class="sr-only">{{ weeks }} weeks in total.</span>
      </div>

      <!-- Stack -->
      <ul v-else-if="ch.key === 'stack'" class="m-center-row flex flex-wrap gap-2">
        <li v-for="t in item.technologyStack" :key="t" class="rounded-full px-4 py-2 text-[14px] font-semibold text-pureWhite ring-1 ring-[color:rgba(255,255,255,0.22)]">{{ t }}</li>
      </ul>

      <!-- Gallery -->
      <ul v-else-if="ch.key === 'gallery'" class="grid gap-3" :class="gallery.length > 1 ? 'tablet:grid-cols-2' : ''">
        <li v-for="v in gallery" :key="v.src" class="overflow-hidden rounded-[16px] bg-pureWhite ring-1 ring-[color:rgba(255,255,255,0.12)]">
          <img :src="v.src" :alt="v.alt" loading="lazy" decoding="async" draggable="false" class="h-auto w-full">
        </li>
      </ul>
    </li>
  </ol>
</template>
