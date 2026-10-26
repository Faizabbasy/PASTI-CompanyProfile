<script setup lang="ts">
import type { Keyed } from '~/composables/useSingletonEditor'
import { CLIENTS_LIMITS as LIM, ClientsContentSchema, type ClientsAdminState, type ClientsContent } from '#shared/utils/sharedContentSchema'

// Shared Content · Clients — the client logos of the homepage "Our Beloved
// Client" marquee and the About client grid. Add / reorder / hide / remove;
// the logo's proportions are measured automatically when it's picked.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Clients · Shared Content' })

type ClientForm = { items: Keyed<ClientsContent['items'][number]>[] }
const TABS = [{ key: 'items', label: 'Klien', sections: ['items'] }] as const
const toPayload = (f: ClientForm) => ({ items: unkeyed(f.items) })

const {
  loadStatus, loadError, refresh, form, state, dirty, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<ClientsAdminState, ClientForm>({
  name: 'Clients',
  endpoint: '/api/admin/shared/clients',
  asyncKey: 'admin-shared-clients',
  tabs: TABS,
  toForm: (c) => ({ items: keyed((JSON.parse(JSON.stringify(c)) as ClientsContent).items) }),
  toPayload,
  validate: (f) => zodFieldErrors(ClientsContentSchema.safeParse(toPayload(f)))
})

const shown = computed(() => form.value?.items.filter((i) => i.active).length ?? 0)

function addClient() {
  const items = form.value!.items
  items.push({ _key: newKey(), name: '', logo: '', ratio: 2, sortOrder: items.length + 1, active: true })
}

// Measure a newly picked logo (width ÷ height) so it gets the same visual
// weight as the others. Existing logos keep their stored ratio.
function measure(item: ClientForm['items'][number]) {
  const src = item.logo
  if (!src || !import.meta.client) return
  const img = new Image()
  img.onload = () => {
    if (item.logo === src && img.naturalWidth && img.naturalHeight) item.ratio = Math.min(10, Math.max(0.2, Math.round((img.naturalWidth / img.naturalHeight) * 1000) / 1000))
  }
  img.src = src
}
</script>

<template>
  <AdminSharedShell
    name="Clients"
    where="Homepage, bagian “Our Beloved Client” (logo berjalan dalam dua baris, dengan angka jumlah klien), dan halaman About, bagian grid logo klien."
    flag="NUXT_CMS_CLIENTS_PUBLIC_ENABLED"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :code-managed="[
      'Judul “Our Beloved Client” dan kalimat di bawahnya, desain marquee dan grid, animasi, dan ukuran logo (dihitung otomatis dari proporsi logo).',
      'Angka jumlah klien di homepage — dihitung otomatis dari klien yang tampil.',
      'Logo teknologi (Google, Microsoft, …) di bagian “Technologies we build with” — itu bukan klien.'
    ]"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat daftar klien…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Daftar klien gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
      <AdminEditorActionBar
        v-else-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/clients"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />
    </template>

    <template v-if="form && state">
      <div class="mb-4 rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
        <p><strong>{{ shown }}</strong> klien tampil <span class="text-navy-500">(minimal {{ LIM.minActive }}, maksimal {{ LIM.maxActive }})</span>. Urutan di sini = urutan di website; logo dibagi bergantian ke dua baris.</p>
        <p class="mt-1 text-xs text-navy-500">Klien yang sudah pernah tayang tidak bisa dihapus — sembunyikan saja (hilangkan centang “Tampilkan”).</p>
      </div>

      <AdminFormRepeater
        legend="Klien"
        locale="id"
        :items="form.items"
        :max="LIM.max"
        :published-ids="publishedIds"
        :item-title="(c) => c.name"
        add-label="Tambah klien"
        :error="err('items')"
        collapsible
        :has-error="(i) => !!(err(`items.${i}.name`) || err(`items.${i}.logo`) || err(`items.${i}.ratio`))"
        @add="addClient"
      >
        <template #summary="{ item }">
          <span class="flex h-8 w-20 shrink-0 items-center justify-center rounded border border-navy-100 bg-white p-1">
            <img v-if="item.logo" :src="item.logo" alt="" class="max-h-full max-w-full object-contain">
          </span>
        </template>
        <template #default="{ item, index }">
          <AdminFormField :id="fieldId(`items.${index}.name`)" v-model="item.name" label="Nama klien" hint="Muncul di kursor saat logo disorot, dan dibaca pembaca layar. Harus beda dari klien lain." :maxlength="LIM.name" required :error="err(`items.${index}.name`)" />
          <AdminFormImage
            :id="fieldId(`items.${index}.logo`)"
            v-model="item.logo"
            label="Logo"
            aspect="5/2"
            fit="contain"
            required
            hint="PNG/WebP berlatar transparan, tanpa ruang kosong di sekeliling logo. Ukurannya di website diatur otomatis."
            :error="err(`items.${index}.logo`) || err(`items.${index}.ratio`)"
            @update:model-value="measure(item)"
          />
        </template>
      </AdminFormRepeater>
    </template>
  </AdminSharedShell>
</template>
