<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { SharedId } from '#shared/utils/sharedContentSchema'

// Authenticated draft preview frame for Shared Content (ADMIN + EDITOR).
// Loads /api/admin/shared/<id>/preview, keeps only the items set to show
// (exactly what the site would serve), and renders the REAL components
// (slot) with it through the shared source's preview provider.
const props = defineProps<{ id: SharedId; name: string }>()

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: Record<string, unknown>
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-shared-${props.id}-preview`, () =>
  cmsFetch<PreviewResponse>(`/api/admin/shared/${props.id}/preview`)
)

const sources = { clients: clientsSource, faqs: faqsSource, ctas: ctasSource }
// Same filter as the public read path: inactive items dropped, `active` removed.
const publicContent = computed(() => {
  const c = data.value?.content
  if (!c) return null
  if (props.id === 'ctas') return c
  const items = (c.items as { active: boolean }[]).filter((i) => i.active).map(({ active: _a, ...rest }) => rest)
  return { items }
})
const provider = (content: never) => sources[props.id].providePreview(content)
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
</script>

<template>
  <div class="min-h-screen bg-paper">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">{{ name }} · draft v{{ data.version }} · disimpan {{ fmt(data.updatedAt) }} · status: {{ data.status }}</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}
      </p>
      <a :href="`/admin/shared/${id}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>

    <main v-else-if="publicContent">
      <!-- Remount on reload so the components re-read the new draft. -->
      <AdminProductPreviewScope :key="`${data?.version}-${data?.revision}-${data?.updatedAt}`" :content="publicContent" :provider="provider">
        <slot />
      </AdminProductPreviewScope>
    </main>
  </div>
</template>
