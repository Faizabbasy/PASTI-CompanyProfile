<script setup lang="ts">
import type { AboutContent, PageStatus } from '#shared/utils/aboutSchema'

// Authenticated draft preview (ADMIN + EDITOR). Lives under /admin, so the
// session gate, no-store and noindex headers apply; data comes from
// /api/admin/pages/about/preview — never from /api/public. Shows the saved
// draft's content in reading order with active items only. The public
// /about design is code-managed and not connected to the CMS yet, so this
// is a content preview, not a pixel replica.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · About (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: AboutContent
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData('admin-about-preview', () =>
  cmsFetch<PreviewResponse>('/api/admin/pages/about/preview')
)

const c = computed(() => data.value?.content)
const active = <T extends { active: boolean }>(list: T[]) => list.filter((i) => i.active)
const hidden = computed(() => {
  if (!c.value) return 0
  return [c.value.mission.points, c.value.values, c.value.milestones, c.value.proof, c.value.leadership].reduce((n, l) => n + l.filter((i) => !i.active).length, 0)
})
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
</script>

<template>
  <div class="min-h-screen bg-paper text-slateNavy">
    <div class="sticky top-0 z-10 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Draft preview — not public</strong>
        <span v-if="data">About · draft v{{ data.version }} · saved {{ fmt(data.updatedAt) }} · page status: {{ data.status }}</span>
        <span v-if="hidden" class="text-xs">{{ hidden }} inactive item(s) hidden</span>
        <span class="text-xs">Content preview — final layout and motion are managed in code.</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Reload draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Loading draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview unavailable.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Your role cannot preview this page.' : 'The draft could not be loaded. Your session may have expired.' }}
      </p>
      <a href="/admin/pages/about" class="mt-3 inline-block text-sm font-semibold underline">Back to the editor</a>
    </div>

    <main v-else-if="c" class="mx-auto max-w-5xl px-4 pb-24 tablet:px-8">
      <!-- Hero -->
      <section class="grid gap-8 py-16 desktop:grid-cols-[1.3fr_1fr] desktop:items-center">
        <div>
          <p v-if="c.hero.eyebrow" class="font-mono text-xs uppercase tracking-[0.2em] text-navy-500">{{ c.hero.eyebrow }}</p>
          <h1 class="mt-3 font-display text-4xl font-bold leading-tight tablet:text-5xl">{{ c.hero.headline }}</h1>
          <p v-if="c.hero.supportingCopy" class="mt-5 max-w-xl text-lg leading-relaxed text-navy-600">{{ c.hero.supportingCopy }}</p>
          <div class="mt-7 flex flex-wrap gap-3">
            <span v-if="c.hero.primaryCtaLabel" class="rounded-full bg-slateNavy px-5 py-2.5 text-sm font-semibold text-white">{{ c.hero.primaryCtaLabel }} <span class="font-normal opacity-70">→ {{ c.hero.primaryCtaUrl }}</span></span>
            <span v-if="c.hero.secondaryCtaLabel" class="rounded-full border border-slateNavy px-5 py-2.5 text-sm font-semibold">{{ c.hero.secondaryCtaLabel }} <span class="font-normal opacity-70">→ {{ c.hero.secondaryCtaUrl }}</span></span>
          </div>
        </div>
        <img v-if="c.hero.heroMedia" :src="c.hero.heroMedia" :alt="c.hero.heroMediaAlt" class="mx-auto max-h-80 w-auto">
      </section>

      <!-- Story -->
      <section class="border-t border-navy-100 py-14">
        <p v-if="c.story.sectionLabel" class="font-mono text-xs uppercase tracking-[0.2em] text-navy-500">{{ c.story.sectionLabel }}</p>
        <h2 class="mt-2 font-display text-3xl font-bold">{{ c.story.title }}</h2>
        <div class="mt-6 grid gap-8 desktop:grid-cols-[1.4fr_1fr]">
          <div class="space-y-4 text-base leading-relaxed text-navy-700">
            <p v-for="(p, i) in c.story.paragraphs" :key="i">{{ p }}</p>
          </div>
          <img v-if="c.story.supportingMedia" :src="c.story.supportingMedia" :alt="c.story.supportingMediaAlt" class="w-full rounded-lg object-cover">
        </div>
      </section>

      <!-- Vision & Mission -->
      <section class="grid gap-6 rounded-2xl bg-slateNavy p-8 text-white tablet:grid-cols-2 tablet:p-12">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-white/60">{{ c.vision.title }}</p>
          <p class="mt-3 text-xl leading-snug">{{ c.vision.description }}</p>
        </div>
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-white/60">{{ c.mission.title }}</p>
          <p class="mt-3 leading-relaxed text-white/90">{{ c.mission.description }}</p>
          <ul v-if="active(c.mission.points).length" class="mt-4 list-disc space-y-1 pl-5 text-sm text-white/85">
            <li v-for="p in active(c.mission.points)" :key="p.id">{{ p.text }}</li>
          </ul>
        </div>
      </section>

      <!-- Values -->
      <section v-if="active(c.values).length" class="py-14">
        <h2 class="font-display text-2xl font-bold">Values</h2>
        <ol class="mt-6 grid gap-4 tablet:grid-cols-2">
          <li v-for="(v, i) in active(c.values)" :key="v.id" class="rounded-lg border border-navy-100 p-5">
            <p class="font-mono text-xs text-navy-500">{{ String(i + 1).padStart(2, '0') }}<template v-if="v.iconOrVisual !== 'none'"> · icon: {{ v.iconOrVisual }}</template></p>
            <h3 class="mt-1 text-lg font-semibold">{{ v.title }}</h3>
            <p v-if="v.description" class="mt-2 text-sm leading-relaxed text-navy-600">{{ v.description }}</p>
          </li>
        </ol>
      </section>

      <!-- Milestones -->
      <section v-if="active(c.milestones).length" class="border-t border-navy-100 py-14">
        <h2 class="font-display text-2xl font-bold">Milestones</h2>
        <ol class="mt-6 space-y-5 border-l-2 border-navy-100 pl-6">
          <li v-for="m in active(c.milestones)" :key="m.id">
            <p class="font-mono text-xs uppercase tracking-wider text-navy-500">{{ m.yearOrPeriod }}</p>
            <h3 class="font-semibold">{{ m.title }}</h3>
            <p v-if="m.description" class="mt-1 text-sm text-navy-600">{{ m.description }}</p>
            <img v-if="m.optionalMedia" :src="m.optionalMedia" :alt="m.optionalMediaAlt" class="mt-2 max-h-40 rounded">
          </li>
        </ol>
      </section>

      <!-- Proof -->
      <section v-if="active(c.proof).length" class="border-t border-navy-100 py-14">
        <h2 class="font-display text-2xl font-bold">Company proof</h2>
        <dl class="mt-6 grid gap-6 tablet:grid-cols-3">
          <div v-for="p in active(c.proof)" :key="p.id" class="flex flex-col-reverse">
            <dt class="text-sm font-semibold">{{ p.label }}<span v-if="p.supportingText" class="block text-xs font-normal text-navy-500">{{ p.supportingText }}</span></dt>
            <dd class="font-display text-4xl font-bold">{{ p.value }}</dd>
          </div>
        </dl>
      </section>

      <!-- Leadership -->
      <section v-if="active(c.leadership).length" class="border-t border-navy-100 py-14">
        <h2 class="font-display text-2xl font-bold">Leadership</h2>
        <ul class="mt-6 grid gap-6 tablet:grid-cols-2">
          <li v-for="p in active(c.leadership)" :key="p.id" class="flex gap-4">
            <img v-if="p.portrait" :src="p.portrait" :alt="p.portraitAlt" class="h-20 w-20 rounded-full object-cover">
            <div v-else class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-navy-50 text-xs text-navy-500" aria-hidden="true">No photo</div>
            <div>
              <h3 class="font-semibold">{{ p.name }}</h3>
              <p class="text-sm text-navy-500">{{ p.role }}</p>
              <p v-if="p.shortBio" class="mt-2 text-sm leading-relaxed text-navy-600">{{ p.shortBio }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- CTA -->
      <section class="rounded-2xl border border-navy-100 p-8 text-center tablet:p-12">
        <p v-if="c.cta.eyebrow" class="font-mono text-xs uppercase tracking-[0.2em] text-navy-500">{{ c.cta.eyebrow }}</p>
        <h2 class="mt-2 font-display text-3xl font-bold">{{ c.cta.title }}</h2>
        <p v-if="c.cta.supportingCopy" class="mx-auto mt-3 max-w-xl text-navy-600">{{ c.cta.supportingCopy }}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <span v-if="c.cta.primaryCtaLabel" class="rounded-full bg-slateNavy px-5 py-2.5 font-semibold text-white">{{ c.cta.primaryCtaLabel }} <span class="font-normal opacity-70">→ {{ c.cta.primaryCtaUrl }}</span></span>
          <span v-if="c.cta.secondaryCtaLabel" class="rounded-full border border-slateNavy px-5 py-2.5 font-semibold">{{ c.cta.secondaryCtaLabel }} <span class="font-normal opacity-70">→ {{ c.cta.secondaryCtaUrl }}</span></span>
        </div>
      </section>

      <!-- SEO -->
      <section class="mt-10 rounded-lg border border-dashed border-navy-200 p-5 text-sm">
        <h2 class="font-semibold">SEO (draft)</h2>
        <dl class="mt-2 grid gap-1 text-navy-600">
          <div><dt class="inline font-medium">Title:</dt> <dd class="inline">{{ c.seo.metaTitle }}</dd></div>
          <div><dt class="inline font-medium">Description:</dt> <dd class="inline">{{ c.seo.metaDescription }}</dd></div>
          <div><dt class="inline font-medium">Canonical:</dt> <dd class="inline">{{ c.seo.canonicalUrl || '—' }}</dd></div>
          <div><dt class="inline font-medium">Share image:</dt> <dd class="inline">{{ c.seo.ogImage || '—' }}</dd></div>
          <div><dt class="inline font-medium">Indexing:</dt> <dd class="inline">{{ c.seo.noIndex ? 'noindex' : 'index' }}</dd></div>
        </dl>
      </section>
    </main>
  </div>
</template>
