<script setup lang="ts">
import { TESTIMONIAL_APPROVALS, TESTIMONIAL_TYPES, type TestimonialListRow } from '#shared/utils/testimonialSchema'

// Shared Content → Testimonials: the single source of testimonial content.
// Pages only pick testimonial ids; nothing here decides where one appears.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Testimonials · Shared Content' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-shared-testimonials', () => cmsFetch<TestimonialListRow[]>('/api/admin/shared/testimonials'))

const q = ref('')
const fStatus = ref<'' | 'draft' | 'published' | 'archived'>('')
const fApproval = ref('')
const fType = ref('')
const fActive = ref<'' | 'active' | 'inactive'>('')

const rows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return (data.value ?? []).filter(
    (r) =>
      (!fStatus.value ? r.status !== 'archived' : r.status === fStatus.value) &&
      (!fApproval.value || r.approval === fApproval.value) &&
      (!fType.value || r.type === fType.value) &&
      (!fActive.value || (fActive.value === 'active') === r.active) &&
      (!needle || [r.personName, r.companyDisplayName, r.quotePreview].some((v) => v.toLowerCase().includes(needle)))
  )
})
const total = computed(() => data.value?.length ?? 0)
const APPROVAL_HELP: Record<string, string> = {
  confirmed: 'Admin sudah menyetujui teks ini untuk tampil.',
  needs_approval: 'Belum disetujui — tidak tampil sampai admin menyetujui.',
  hidden: 'Sengaja disembunyikan — tidak tampil.'
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">Shared Content <span aria-hidden="true">/</span> Testimonials</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Testimoni</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/shared/testimonials/new" class="ml-auto rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">+ Tambah testimoni</NuxtLink>
    </div>

    <div class="mt-3 grid max-w-3xl gap-3">
      <div class="rounded-lg border border-pastiYellow-300 bg-pastiYellow-50 px-4 py-3 text-sm text-navy-700">
        <p><strong>Tampil di:</strong> bagian Testimoni di homepage dan kartu testimoni di halaman Creative — satu daftar untuk semua halaman. Tiap halaman memilih testimoninya sendiri dan punya urutan sendiri.</p>
      </div>
      <div class="rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
        <p class="font-semibold">Cara pakai</p>
        <ol class="mt-1 list-decimal space-y-0.5 pl-5">
          <li>Klik <strong>+ Tambah testimoni</strong>, isi, lalu <strong>Buat draft</strong>. Klik nama orang untuk mengubahnya.</li>
          <li>Testimoni tampil di website hanya kalau: sudah di-<strong>Publish</strong>, dicentang <strong>Tampilkan</strong>, DAN persetujuannya <strong>Disetujui</strong> (oleh admin).</li>
          <li>Testimoni yang sudah pernah tayang tidak dihapus, tapi <strong>Archive</strong> (diarsipkan).</li>
        </ol>
        <p class="mt-2 text-xs font-semibold text-navy-600">Arti persetujuan:</p>
        <ul class="mt-1 grid gap-1 text-xs text-navy-600 tablet:grid-cols-3">
          <li v-for="a in TESTIMONIAL_APPROVALS" :key="a" class="flex items-start gap-1.5">
            <span class="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-semibold" :class="CLAIM_LABELS[a].cls"><span aria-hidden="true">{{ CLAIM_LABELS[a].mark }}</span>{{ CLAIM_LABELS[a].label }}</span>
            <span>{{ APPROVAL_HELP[a] }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-5 flex flex-wrap items-end gap-3 text-sm" role="search">
      <div>
        <label for="t-q" class="block text-xs font-medium text-navy-600">Cari</label>
        <input id="t-q" v-model="q" type="search" placeholder="Nama, perusahaan atau kutipan" class="mt-1 w-64 rounded-md border border-navy-200 px-3 py-1.5">
      </div>
      <div>
        <label for="t-status" class="block text-xs font-medium text-navy-600">Status</label>
        <select id="t-status" v-model="fStatus" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">Draft + Published</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived (diarsipkan)</option>
        </select>
      </div>
      <div>
        <label for="t-approval" class="block text-xs font-medium text-navy-600">Persetujuan</label>
        <select id="t-approval" v-model="fApproval" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">Semua</option><option v-for="a in TESTIMONIAL_APPROVALS" :key="a" :value="a">{{ CLAIM_LABELS[a].label }}</option>
        </select>
      </div>
      <div>
        <label for="t-type" class="block text-xs font-medium text-navy-600">Jenis</label>
        <select id="t-type" v-model="fType" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">Semua</option><option v-for="t in TESTIMONIAL_TYPES" :key="t" :value="t">{{ TESTIMONIAL_TYPE_LABELS[t] }}</option>
        </select>
      </div>
      <div>
        <label for="t-active" class="block text-xs font-medium text-navy-600">Tampilkan</label>
        <select id="t-active" v-model="fActive" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">Semua</option><option value="active">Dicentang</option><option value="inactive">Tidak dicentang</option>
        </select>
      </div>
      <p class="ml-auto text-xs text-navy-500" role="status">{{ rows.length }} dari {{ total }}</p>
    </div>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Memuat testimoni…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Daftar testimoni gagal dimuat. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[900px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Orang</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Kutipan</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Jenis</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Persetujuan</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Tampilkan</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Terakhir diubah</th>
            <th scope="col" class="px-4 py-2.5 font-semibold"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 align-top last:border-0 hover:bg-navy-50/40">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/shared/testimonials/${r.id}`" class="font-semibold hover:underline">{{ r.personName }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Contoh</span>
              <div class="text-xs text-navy-500">{{ r.companyDisplayName || '—' }}</div>
            </td>
            <td class="max-w-[22rem] px-4 py-3 text-xs text-navy-600">{{ r.quotePreview }}</td>
            <td class="px-4 py-3 text-xs">{{ TESTIMONIAL_TYPE_LABELS[r.type] }}</td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-amber-800">Ada perubahan belum di-publish</div>
            </td>
            <td class="px-4 py-3 text-xs">
              <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold" :class="CLAIM_LABELS[r.approval].cls"><span aria-hidden="true">{{ CLAIM_LABELS[r.approval].mark }}</span>{{ CLAIM_LABELS[r.approval].label }}</span>
              <div class="mt-1 text-[11px]" :class="r.publicEligible ? 'font-semibold text-emerald-800' : 'text-navy-500'">{{ r.publicEligible ? '✓ Boleh tampil' : 'Belum tampil' }}</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.active ? '● Ya' : '○ Tidak' }}</td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
            <td class="px-4 py-3 text-right text-xs">
              <NuxtLink :to="`/admin/shared/testimonials/${r.id}`" class="rounded-md border border-navy-200 px-2.5 py-1 font-semibold text-slateNavy hover:bg-navy-50">Edit<span class="sr-only"> {{ r.personName }}</span></NuxtLink>
              <span v-if="r.referenced" class="mt-2 block text-[11px] text-navy-500">Dipilih sebuah halaman</span>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="8" class="px-4 py-6 text-center text-navy-500">Tidak ada testimoni yang cocok.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
