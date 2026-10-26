<script setup lang="ts">
import type { CaseStudyListRow } from '#shared/utils/caseStudySchema'

// Case studies collection: deeper narratives, each linked to one project.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Case Studies · Work' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-work-cases', () => cmsFetch<CaseStudyListRow[]>('/api/admin/work/case-studies'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span> Case Studies</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Case Studies</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/work/case-studies/new" class="ml-auto rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800">+ Tambah studi kasus</NuxtLink>
    </div>

    <div class="mt-3 max-w-3xl rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
      <p class="font-semibold">Cara pakai</p>
      <ol class="mt-1 list-decimal space-y-0.5 pl-5">
        <li>Studi kasus = cerita lengkap satu proyek (konteks, tantangan, yang dibangun, hasil, angka, galeri). Nama, klien dan tahun diambil dari proyeknya.</li>
        <li>Klik <strong>+ Tambah studi kasus</strong>, pilih proyeknya, lalu isi ceritanya.</li>
        <li>Setelah di-<strong>Publish</strong>, pilih studi kasusnya di <NuxtLink to="/admin/work" class="underline">Work → Work page</NuxtLink> (bagian 03) supaya tampil di <code>/work</code>.</li>
      </ol>
      <p class="mt-1 text-xs text-navy-500">Publish tidak otomatis menyetujui angka dan gambar — tiap angka/gambar punya status persetujuan sendiri, dan hanya yang <strong>Disetujui</strong> yang tampil.</p>
    </div>

    <label class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Tampilkan yang diarsipkan</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Memuat studi kasus…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Daftar studi kasus gagal dimuat. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Studi kasus</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Di halaman Work</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Angka &amp; gambar</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Terakhir diubah</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0 hover:bg-navy-50/40">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/work/case-studies/${r.id}`" class="font-semibold hover:underline">{{ r.projectName ?? 'Belum terhubung ke proyek' }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Demo</span>
              <div class="text-xs text-navy-500">#case-{{ r.slug }}</div>
            </td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-navy-500">Ada perubahan belum di-publish</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.featuredInWork ? 'Ditampilkan' : '—' }}</td>
            <td class="px-4 py-3 text-xs">
              <span class="mr-2">✓ {{ r.claims.confirmed }} disetujui</span>
              <span class="mr-2" :class="r.claims.needsApproval ? 'font-semibold text-amber-900' : ''">! {{ r.claims.needsApproval }} perlu persetujuan</span>
              <span>– {{ r.claims.hidden }} disembunyikan</span>
            </td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="5" class="px-4 py-6 text-center text-navy-500">Belum ada studi kasus.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
