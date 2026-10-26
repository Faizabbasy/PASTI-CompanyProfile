<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { CreativeContent } from '#shared/utils/creativeSchema'

// Authenticated draft preview (ADMIN + EDITOR). Lives under /admin, so the
// session gate, no-store and noindex headers apply; data comes from
// /api/admin/pages/creative/preview — never from /api/public. Renders the
// REAL Creative sections with the saved draft (active items only) through
// the same adapter the public page uses, so layout and motion match.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · Creative (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: CreativeContent
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData('admin-creative-preview', () =>
  cmsFetch<PreviewResponse>('/api/admin/pages/creative/preview')
)

const legacy = buildLegacyCreativeContent()

const preview = computed(() => {
  const d = data.value
  if (!d) return null
  const c = d.content
  const content = {
    ...c,
    services: { ...c.services, items: c.services.items.filter((i) => i.active) },
    wall: { ...c.wall, visuals: c.wall.visuals.filter((i) => i.active) },
    work: { ...c.work, uiux: { ...c.work.uiux, items: c.work.uiux.items.filter((i) => i.active) } }
  }
  return adaptCreativeCms(legacy, { version: d.version, content })
})
const hidden = computed(() => {
  const c = data.value?.content
  return c ? [c.services.items, c.wall.visuals, c.work.uiux.items].reduce((n, l) => n + l.filter((i) => !i.active).length, 0) : 0
})
const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
</script>

<template>
  <div class="min-h-screen bg-pastiYellow-500">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Creative · draft v{{ data.version }} · disimpan {{ fmt(data.updatedAt) }} · status: {{ data.status }}</span>
        <span v-if="hidden" class="text-xs">{{ hidden }} item disembunyikan</span>
        <span class="text-xs">SEO: {{ preview?.seo.title }}{{ preview?.seo.noIndex ? ' · noindex' : '' }}</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="bg-paper p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl bg-paper p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}
      </p>
      <a href="/admin/pages/creative" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>

    <main v-else-if="preview" ref="mainRef">
      <!-- Remount on reload so the sections re-read the new draft. -->
      <AdminCreativePreviewScope :key="`${data?.version}-${data?.revision}-${data?.updatedAt}`" :content="preview">
        <CreativeHero />
        <CreativeTapes />
        <CreativeServices />
        <CreativeWall />
        <CreativeWork />
        <BaseWhyPasti :why="preview.why" />
      </AdminCreativePreviewScope>
    </main>
  </div>
</template>
