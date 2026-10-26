<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { TechnologyContent } from '#shared/utils/technologySchema'

// Authenticated draft preview (ADMIN + EDITOR). Lives under /admin, so the
// session gate, no-store and noindex headers apply; data comes from
// /api/admin/pages/technology/preview — never from /api/public. Renders the
// REAL Technology sections with the saved draft (active items only) through
// the same adapter the public page uses, so layout and motion match.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · Technology (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: TechnologyContent
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData('admin-technology-preview', () =>
  cmsFetch<PreviewResponse>('/api/admin/pages/technology/preview')
)

const { why } = useTechnology()
const legacy = buildLegacyTechnologyContent()

const preview = computed(() => {
  const d = data.value
  if (!d) return null
  const c = d.content
  const content = {
    ...c,
    capabilities: { ...c.capabilities, items: c.capabilities.items.filter((i) => i.active) },
    work: { ...c.work, items: c.work.items.filter((i) => i.active) }
  }
  return adaptTechnologyCms(legacy, { version: d.version, content })
})
const hidden = computed(() => {
  const c = data.value?.content
  return c ? [c.capabilities.items, c.work.items].reduce((n, l) => n + l.filter((i) => !i.active).length, 0) : 0
})
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
</script>

<template>
  <div class="min-h-screen bg-slateNavy">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Draft preview — not public</strong>
        <span v-if="data">Technology · draft v{{ data.version }} · saved {{ fmt(data.updatedAt) }} · page status: {{ data.status }}</span>
        <span v-if="hidden" class="text-xs">{{ hidden }} inactive item(s) hidden</span>
        <span class="text-xs">SEO: {{ preview?.seo.title }}{{ preview?.seo.noIndex ? ' · noindex' : '' }}</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Reload draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="bg-paper p-8 text-sm" role="status">Loading draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl bg-paper p-8" role="alert">
      <p class="font-semibold">Preview unavailable.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Your role cannot preview this page.' : 'The draft could not be loaded. Your session may have expired.' }}
      </p>
      <a href="/admin/pages/technology" class="mt-3 inline-block text-sm font-semibold underline">Back to the editor</a>
    </div>

    <main v-else-if="preview">
      <!-- Remount on reload so the sections re-read the new draft. -->
      <AdminTechnologyPreviewScope :key="`${data?.version}-${data?.revision}-${data?.updatedAt}`" :content="preview">
        <TechnologyHero />
        <TechnologyMarquee />
        <TechnologyCapabilities />
        <TechnologyPlatforms />
        <TechnologyWork />
        <BaseWhyPasti :why="why" />
      </AdminTechnologyPreviewScope>
    </main>
  </div>
</template>
