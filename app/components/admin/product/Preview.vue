<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { AnyProductContent } from '#shared/cms/productFields'

// Authenticated draft preview frame for a product page (ADMIN + EDITOR).
// Loads /api/admin/pages/<slug>/preview, runs it through the same adapter
// the public page uses, and renders the REAL section components (slot) with
// it. `?s=<n>` scrolls to the n-th section — the editor's "Lihat bagian ini".
const props = defineProps<{
  slug: string
  name: string
  buildLegacy: () => unknown
  adapt: (legacy: never, cms: { version: number; content: AnyProductContent }) => unknown
  provider: (content: never) => void
}>()

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: AnyProductContent
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-${props.slug}-preview`, () =>
  cmsFetch<PreviewResponse>(`/api/admin/pages/${props.slug}/preview`)
)

const legacy = props.buildLegacy()
const preview = computed(() => {
  const d = data.value
  return d ? (props.adapt(legacy as never, { version: d.version, content: d.content }) as { seo: { title: string; noIndex?: boolean } }) : null
})
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'

const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)
</script>

<template>
  <div class="min-h-screen bg-paper">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">{{ name }} · draft v{{ data.version }} · disimpan {{ fmt(data.updatedAt) }} · status: {{ data.status }}</span>
        <span class="text-xs">SEO: {{ preview?.seo.title }}{{ preview?.seo.noIndex ? ' · noindex' : '' }}</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}
      </p>
      <a :href="`/admin/products/${slug}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>

    <main v-else-if="preview" ref="mainRef">
      <!-- Remount on reload so the components re-read the new draft. -->
      <AdminProductPreviewScope :key="`${data?.version}-${data?.revision}-${data?.updatedAt}`" :content="preview" :provider="provider">
        <slot />
      </AdminProductPreviewScope>
    </main>
  </div>
</template>
