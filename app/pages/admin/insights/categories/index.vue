<script setup lang="ts">
import type { CategoryListRow } from '#shared/utils/insightsSchema'
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Categories (topic taxonomy). Simple table + quick create. Filter order on
// /insights is set on the Insights page (Topic filters tab).
definePageMeta({ layout: 'admin' })
useHead({ title: 'Categories · Insights' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-insights-categories', () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))
const archivedCount = computed(() => (data.value ?? []).filter((r) => r.status === 'archived').length)

const form = ref<CategoryForm>(emptyCategory())
const { errors, err, notice, busy, submit } = useCollectionCreate()
async function create() {
  if (!form.value.slug) form.value.slug = slugFrom(form.value.name)
  await submit({
    validate: () => validateCategoryForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/insights/categories', { method: 'POST', body: { content: toCategoryPayload(form.value) }, keepOn401: true }),
    then: async () => {
      form.value = emptyCategory()
      notice.value = { kind: 'success', text: 'Topik dibuat sebagai draft. Admin perlu mem-publish-nya.' }
      await refresh()
    }
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span> Categories</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Topik</h1>
      <a v-if="can('content.edit')" href="#add-category" class="ml-auto rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">+ Tambah topik</a>
    </div>

    <div class="mt-3 grid max-w-3xl gap-3">
      <div class="rounded-lg border border-pastiYellow-300 bg-pastiYellow-50 px-4 py-3 text-sm text-navy-700">
        <p><strong>Tampil di:</strong> halaman <code>/insights</code> — tombol filter topik di atas daftar artikel, dan label topik di tiap artikel.</p>
      </div>
      <div class="rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
        <p class="font-semibold">Cara pakai</p>
        <ol class="mt-1 list-decimal space-y-0.5 pl-5">
          <li>Tambah topik lewat form di bawah tabel; topik baru tersimpan sebagai draft.</li>
          <li>Klik <strong>Edit</strong> lalu <strong>Publish</strong> (admin). Hanya topik yang di-publish dan “Tampil” yang muncul di website.</li>
          <li>Urutan tombol filter diatur di <NuxtLink to="/admin/insights" class="underline">Insights → Insights page</NuxtLink>.</li>
          <li>Topik yang masih dipakai artikel tidak bisa diarsipkan atau dihapus.</li>
        </ol>
      </div>
    </div>

    <label v-if="archivedCount" class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Tampilkan yang diarsipkan ({{ archivedCount }})</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Memuat topik…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Daftar topik gagal dimuat. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Nama</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Slug</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Tampil</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Jumlah artikel</th>
            <th scope="col" class="px-4 py-2.5 font-semibold"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0 hover:bg-navy-50/40">
            <td class="px-4 py-3 font-semibold">
              <NuxtLink :to="`/admin/insights/categories/${r.id}`" class="hover:underline">{{ r.name }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Contoh</span>
            </td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ r.slug }}</td>
            <td class="px-4 py-3 text-xs">{{ r.active ? '● Tampil' : '○ Disembunyikan' }}</td>
            <td class="px-4 py-3"><AdminStatusBadge :status="r.status" /></td>
            <td class="px-4 py-3 text-xs tabular-nums">{{ r.articleCount }}</td>
            <td class="px-4 py-3 text-right"><NuxtLink :to="`/admin/insights/categories/${r.id}`" class="rounded-md border border-navy-200 px-2.5 py-1 text-xs font-semibold text-slateNavy hover:bg-navy-50">Edit<span class="sr-only"> {{ r.name }}</span></NuxtLink></td>
          </tr>
          <tr v-if="!rows.length"><td colspan="6" class="px-4 py-6 text-center text-navy-500">Belum ada topik.</td></tr>
        </tbody>
      </table>
    </div>

    <form v-if="can('content.edit')" id="add-category" class="mt-8 grid max-w-3xl scroll-mt-24 gap-4 rounded-lg border border-navy-100 bg-white p-4" novalidate @submit.prevent="create">
      <h2 class="font-semibold">Tambah topik</h2>
      <AdminEditorNotice :notice="notice" />
      <div class="grid gap-4 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('name')" v-model="form.name" label="Nama topik" :maxlength="20" required :error="err('name')" />
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug (alamat)" :maxlength="60" required hint="Kosongkan = dibuat otomatis dari nama." :error="err('slug')" />
      </div>
      <AdminFormField :id="fieldId('description')" v-model="form.description" label="Keterangan (opsional, hanya untuk internal)" :maxlength="200" :error="err('description')" />
      <p v-if="Object.keys(errors).length" class="text-sm text-red-700" role="alert">Perbaiki kolom yang ditandai merah.</p>
      <div><button type="submit" class="rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Membuat…' : 'Buat draft' }}</button></div>
    </form>
  </section>
</template>
