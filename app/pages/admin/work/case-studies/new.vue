<script setup lang="ts">
import type { ProjectListRow } from '#shared/utils/projectSchema'
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create a case study for an existing project (draft), then continue in its
// editor. Projects that already have a case study are not offered.
definePageMeta({ layout: 'admin' })
useHead({ title: 'New case study · Work' })

const { cmsFetch } = useCmsSession()
const { data: projects } = await useAsyncData('admin-work-case-new-projects', () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects'))
const available = computed(() => (projects.value ?? []).filter((p) => p.status !== 'archived' && !p.caseStudy))
const STATUS_ID: Record<string, string> = { draft: 'draft', published: 'sudah tayang', archived: 'diarsipkan' }

const form = ref<CaseStudyForm>(emptyCaseStudy())
const { errors, err, notice, busy, submit } = useCollectionCreate()

async function create() {
  await submit({
    validate: () => validateCaseStudyForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/work/case-studies', { method: 'POST', body: { content: toCaseStudyPayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/work/case-studies/${res.state.id}`)
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/work/case-studies" class="hover:underline">Case Studies</NuxtLink> <span aria-hidden="true">/</span> Baru
    </nav>
    <h1 class="mt-1 text-2xl font-bold">Studi kasus baru</h1>
    <div class="mt-3 max-w-3xl rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
      <p class="font-semibold">Cara pakai</p>
      <ol class="mt-1 list-decimal space-y-0.5 pl-5">
        <li>Pilih proyeknya dulu — nama, klien dan tahun studi kasus diambil dari proyek itu.</li>
        <li>Klik <strong>Buat draft</strong>. Ceritanya (konteks, tantangan, hasil, angka, galeri) diisi di layar berikutnya.</li>
      </ol>
    </div>
    <AdminEditorNotice :notice="notice" />
    <form class="mt-6 grid max-w-3xl gap-5" novalidate @submit.prevent="create">
      <div>
        <label :for="fieldId('projectId')" class="text-sm font-medium">Proyek<span class="text-red-700" aria-hidden="true"> *</span></label>
        <select :id="fieldId('projectId')" v-model="form.projectId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('projectId')">
          <option value="" disabled>Pilih proyek…</option>
          <option v-for="p in available" :key="p.id" :value="p.id">{{ p.name }} · {{ STATUS_ID[p.status] ?? p.status }}</option>
        </select>
        <p v-if="!available.length" class="mt-1 text-xs text-navy-500">Semua proyek sudah punya studi kasus. <NuxtLink to="/admin/work/projects/new" class="underline">Tambah proyek</NuxtLink> dulu.</p>
        <p v-if="err('projectId')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('projectId') }}</p>
      </div>
      <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Alamat singkat (slug)" :maxlength="60" required hint="Link langsung di /work: #case-<slug>. Huruf kecil, angka dan tanda hubung, mis. toko-online-abc." :error="err('slug')" />
      <p v-if="Object.keys(errors).length" class="text-sm text-red-700" role="alert">Perbaiki kolom yang ditandai merah.</p>
      <div>
        <button type="submit" class="rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Membuat…' : 'Buat draft' }}</button>
      </div>
    </form>
  </section>
</template>
