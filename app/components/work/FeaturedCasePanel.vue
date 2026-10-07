<script setup lang="ts">
import type { FeaturedCase } from '~/composables/useFeaturedCases'

// One Featured Case's detail — shared by the desktop tab panel and the mobile
// accordion body. Every block renders only when the case has source-backed
// data for it (no placeholders), and only 'approved' visuals / metrics are
// ever shown. The first approved visual leads (posters crop to 4:5, UI
// screenshots / dashboards keep their full frame); further approved visuals
// sit under it as supporting proof. Without any approved visual, a neutral
// typographic tile keeps the layout from collapsing. Elements marked [data-cp-anim] are animated by
// FeaturedCases on case change.
const props = defineProps<{ item: FeaturedCase }>()

const visuals = computed(() => approvedVisuals(props.item))
const visual = computed(() => visuals.value[0] ?? null)
const extras = computed(() => visuals.value.slice(1))
const metrics = computed(() => approvedMetrics(props.item))
const second = computed(() =>
  props.item.solution?.length
    ? { label: 'What we built', items: props.item.solution }
    : props.item.request?.length
      ? { label: 'What was requested', items: props.item.request }
      : null
)
const weeks = computed(() => props.item.timeline?.steps.reduce((n, s) => n + s.weeks, 0) ?? 0)
</script>

<template>
  <div class="grid gap-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] desktop:gap-10">
    <!-- Visuals (or neutral tile) -->
    <div class="w-full desktop:self-start" :class="!visual || visual.kind === 'poster' ? 'tablet:max-w-[420px] desktop:max-w-none' : ''">
      <div data-cp-visual class="relative overflow-hidden rounded-[20px] bg-[color:rgba(255,255,255,0.06)] ring-1 ring-[color:rgba(255,255,255,0.1)]" :class="visual && visual.kind !== 'poster' ? 'bg-pureWhite' : ''">
        <img
          v-if="visual"
          :src="visual.src"
          :alt="visual.alt"
          loading="lazy"
          decoding="async"
          draggable="false"
          class="w-full"
          :class="visual.kind === 'poster' ? 'aspect-[4/5] object-cover object-top' : 'h-auto'"
        >
        <div v-else class="flex aspect-[16/10] items-end justify-between p-6 desktop:aspect-[4/5] desktop:p-8" aria-hidden="true">
          <span class="fc-outline font-display text-[clamp(96px,14vw,200px)] font-extrabold leading-[0.8] tracking-[-0.06em]">{{ item.index }}</span>
          <LayoutBrandMark :height="12" class="mb-2 opacity-60" />
        </div>
      </div>
      <ul v-if="extras.length" data-cp-anim class="mt-3 grid grid-cols-2 gap-3">
        <li
          v-for="(v, i) in extras"
          :key="v.src"
          class="overflow-hidden rounded-[14px] bg-pureWhite ring-1 ring-[color:rgba(255,255,255,0.1)]"
          :class="extras.length % 2 === 1 && i === extras.length - 1 ? 'col-span-2' : ''"
        >
          <img :src="v.src" :alt="v.alt" loading="lazy" decoding="async" draggable="false" class="h-auto w-full">
        </li>
      </ul>
    </div>

    <!-- Copy -->
    <div class="min-w-0">
      <p v-if="item.businessContext" data-cp-anim class="max-w-[58ch] text-token-body leading-relaxed text-[color:rgba(255,255,255,0.78)]">
        {{ item.businessContext }}
      </p>

      <div v-if="item.challenge?.length || second" class="mt-8 grid gap-8 border-t border-[color:rgba(255,255,255,0.14)] pt-8" :class="item.challenge?.length && second ? 'tablet:grid-cols-2 desktop:grid-cols-1 wide:grid-cols-2' : ''">
        <div v-if="item.challenge?.length" data-cp-anim>
          <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Challenge</h4>
          <ol class="mt-4 space-y-3">
            <li v-for="(c, i) in item.challenge" :key="i" class="grid grid-cols-[28px_1fr] text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.85)]">
              <span class="pt-[3px] font-mono text-[10px] text-[color:rgba(255,255,255,0.4)]">{{ String(i + 1).padStart(2, '0') }}</span>{{ c }}
            </li>
          </ol>
        </div>
        <div v-if="second" data-cp-anim>
          <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">{{ second.label }}</h4>
          <ul class="mt-4 space-y-3">
            <li v-for="(s, i) in second.items" :key="i" class="grid grid-cols-[28px_1fr] text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.85)]">
              <span aria-hidden="true" class="mt-[9px] h-px w-3 bg-[color:rgba(255,255,255,0.4)]" />{{ s }}
            </li>
          </ul>
        </div>
      </div>

      <div v-if="item.outcome?.length || metrics.length" data-cp-anim class="mt-8 rounded-[18px] bg-pastiYellow-500 p-6 text-slateNavy">
        <h4 class="font-mono text-[10px] uppercase tracking-[0.2em]">Outcome</h4>
        <dl v-if="metrics.length" class="mt-4 flex flex-wrap gap-x-10 gap-y-4">
          <div v-for="m in metrics" :key="m.label" class="flex flex-col-reverse">
            <dt class="text-[13px] font-semibold">{{ m.label }}</dt>
            <dd class="font-display text-[40px] font-extrabold leading-none tracking-[-0.04em]">{{ m.value }}</dd>
          </div>
        </dl>
        <ul v-if="item.outcome?.length" class="mt-4 space-y-2.5">
          <li v-for="(o, i) in item.outcome" :key="i" class="grid grid-cols-[20px_1fr] text-[15px] font-semibold leading-snug">
            <span aria-hidden="true" class="mt-[7px] h-1.5 w-1.5 rounded-full bg-slateNavy" />{{ o }}
          </li>
        </ul>
      </div>

      <div v-if="item.insight" data-cp-anim class="mt-8 border-l-2 border-pastiYellow-500 pl-5">
        <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Insight</h4>
        <p class="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.8)]">{{ item.insight }}</p>
      </div>

      <div v-if="item.timeline" data-cp-anim class="mt-8 border-t border-[color:rgba(255,255,255,0.14)] pt-8">
        <div class="flex items-baseline justify-between gap-4">
          <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Delivery timeline</h4>
          <span class="font-display text-[15px] font-bold text-pureWhite">{{ item.timeline.total }}</span>
        </div>
        <ol class="mt-4 flex gap-1" :aria-label="`Delivery timeline, ${item.timeline.total} in total`">
          <li
            v-for="(s, i) in item.timeline.steps"
            :key="s.label"
            class="min-w-0"
            :style="{ flexGrow: s.weeks, flexBasis: 0 }"
          >
            <span aria-hidden="true" class="block h-2 rounded-full" :class="i === 2 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.28)]'" />
            <span class="mt-2 block font-mono text-[10px] text-[color:rgba(255,255,255,0.5)]">{{ s.weeks }} wk</span>
          </li>
        </ol>
        <ul class="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] text-[color:rgba(255,255,255,0.75)]">
          <li v-for="s in item.timeline.steps" :key="s.label">{{ s.label }} <span class="text-[color:rgba(255,255,255,0.45)]">· {{ s.weeks }} wk</span></li>
        </ul>
        <span class="sr-only">{{ weeks }} weeks in total.</span>
      </div>

      <div v-if="item.technologyStack?.length" data-cp-anim class="mt-8">
        <h4 class="font-mono text-[10px] uppercase tracking-[0.2em] text-pastiYellow-500">Technology stack</h4>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="t in item.technologyStack" :key="t" class="rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-pureWhite ring-1 ring-[color:rgba(255,255,255,0.2)]">{{ t }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fc-outline {
  color: transparent;
  /* pastiYellow-500 (#FBBA00, placeholder scale) at 75% */
  -webkit-text-stroke: 1.5px rgba(251, 186, 0, 0.75);
}
</style>
