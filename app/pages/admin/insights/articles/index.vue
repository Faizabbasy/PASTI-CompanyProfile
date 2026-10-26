<script setup lang="ts">
import type { ArticleListRow } from '#shared/utils/insightsSchema'

// Articles collection: the editorial content of each insight.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Articles · Insights' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-insights-articles', () => cmsFetch<ArticleListRow[]>('/api/admin/insights/articles'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))
const archivedCount = computed(() => (data.value ?? []).filter((r) => r.status === 'archived').length)
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span> Articles</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Artikel</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/insights/articles/new" class="ml-auto rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">+ Tambah artikel</NuxtLink>
    </div>

    <div class="mt-3 grid max-w-3xl gap-3">
      <div class="rounded-lg border border-pastiYellow-300 bg-pastiYellow-50 px-4 py-3 text-sm text-navy-700">
        <p><strong>Tampil di:</strong> halaman <code>/insights</code> — daftar artikel bernomor; diklik → artikel terbuka layar penuh. Gambar sampulnya juga mengisi huruf “Insights.” di hero.</p>
      </div>
      <div class="rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
        <p class="font-semibold">Cara pakai</p>
        <ol class="mt-1 list-decimal space-y-0.5 pl-5">
          <li>Klik <strong>+ Tambah artikel</strong>, isi, lalu <strong>Buat draft</strong>. Klik judul artikel untuk mengubahnya.</li>
          <li>Admin klik <strong>Publish</strong> di halaman artikel.</li>
          <li>Pilih artikel itu di <NuxtLink to="/admin/insights" class="underline">Insights → Insights page</NuxtLink> supaya tampil (di sana juga urutannya diatur).</li>
          <li>Artikel yang sudah pernah tayang tidak dihapus, tapi <strong>Archive</strong> (diarsipkan).</li>
        </ol>
      </div>
    </div>

    <label v-if="archivedCount" class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Tampilkan yang diarsipkan ({{ archivedCount }})</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Memuat artikel…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Daftar artikel gagal dimuat. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Artikel</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Topik</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Di halaman Insights</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Terakhir diubah</th>
            <th scope="col" class="px-4 py-2.5 font-semibold"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0 hover:bg-navy-50/40">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/insights/articles/${r.id}`" class="font-semibold hover:underline">{{ r.title }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Contoh</span>
              <div class="text-xs text-navy-500">{{ r.slug }}</div>
            </td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-amber-800">Ada perubahan belum di-publish</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.categories.join(', ') || '—' }}</td>
            <td class="px-4 py-3 text-xs">{{ r.inIssue ? '✓ Dipilih' : '— Belum dipilih' }}</td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
            <td class="px-4 py-3 text-right"><NuxtLink :to="`/admin/insights/articles/${r.id}`" class="rounded-md border border-navy-200 px-2.5 py-1 text-xs font-semibold text-slateNavy hover:bg-navy-50">Edit<span class="sr-only"> {{ r.title }}</span></NuxtLink></td>
          </tr>
          <tr v-if="!rows.length"><td colspan="6" class="px-4 py-6 text-center text-navy-500">Belum ada artikel.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
