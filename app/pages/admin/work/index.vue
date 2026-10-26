<script setup lang="ts">
import { WORK_LIMITS as LIM, type WorkAdminState } from '#shared/utils/workSchema'
import type { ProjectListRow } from '#shared/utils/projectSchema'
import type { CaseStudyListRow } from '#shared/utils/caseStudySchema'

// Work page singleton editor. Decides what /work shows and in which order;
// project and case-study content lives in their own records and is only
// referenced here. No add / duplicate / delete for the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Work page · Work' })

const { cmsFetch } = useCmsSession()
const { data: projectRows } = await useAsyncData('admin-work-project-options', () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects'))
const { data: caseRows } = await useAsyncData('admin-work-case-options', () => cmsFetch<CaseStudyListRow[]>('/api/admin/work/case-studies'))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<WorkAdminState, WorkForm>({
  name: 'Work',
  endpoint: '/api/admin/work',
  asyncKey: 'admin-work',
  tabs: WORK_TABS,
  toForm: toWorkForm,
  toPayload: toWorkPayload,
  validate: validateWorkForm
})

const projectOptions = computed(() => (projectRows.value ?? []).filter((p) => p.status !== 'archived'))
const caseOptions = computed(() => (caseRows.value ?? []).filter((c) => c.status !== 'archived'))
const projectById = (id: string) => projectRows.value?.find((p) => p.id === id)
const caseById = (id: string) => caseRows.value?.find((c) => c.id === id)
const projectLabel = (id: string) => projectById(id)?.name ?? `Proyek tidak ditemukan (${id})`
const caseLabel = (id: string) => {
  const c = caseById(id)
  return c ? `${c.projectName ?? 'Belum terhubung ke proyek'} · #case-${c.slug}` : `Studi kasus tidak ditemukan (${id})`
}

function addProject() {
  const items = form.value!.projectIndex.items
  const used = new Set(items.map((i) => i.projectId))
  const next = projectOptions.value.find((p) => !used.has(p.id))
  if (next) items.push({ _key: newKey(), projectId: next.id, sortOrder: items.length + 1, active: true })
}
function addCase() {
  const items = form.value!.featuredCases.items
  const used = new Set(items.map((i) => i.caseStudyId))
  const next = caseOptions.value.find((c) => !used.has(c.id))
  if (next) items.push({ _key: newKey(), caseStudyId: next.id, sortOrder: items.length + 1, active: true })
}

// Active selections that are not live yet — publishing the page is blocked
// until they are published (server-enforced, shown here early).
const unpublishedSelected = computed(() => {
  const f = form.value
  if (!f) return []
  return [
    ...f.projectIndex.items.filter((i) => i.active && projectById(i.projectId)?.status !== 'published').map((i) => projectLabel(i.projectId)),
    ...f.featuredCases.items.filter((i) => i.active && caseById(i.caseStudyId)?.status !== 'published').map((i) => caseLabel(i.caseStudyId))
  ]
})

const STATUS_ID: Record<string, string> = { draft: 'draft', published: 'sudah tayang', archived: 'diarsipkan' }
const statusLabel = (s: string) => STATUS_ID[s] ?? s

const codeManaged = [
  'Susunan dan desain halaman: tumpukan poster, tampilan Grid / List, filter, strip studi kasus, berkas, dan tampilan geser di HP.',
  'Teks kecil antarmuka: “Filter · Grid / List”, “Select a case”, “Swipe & tap a case”, label kursor, nama bab (Challenge, What we built …), badge dan penghitung.',
  'Isi tiap proyek (nama, klien, poster, deskripsi) — diubah di Work → Projects.',
  'Cerita, angka dan galeri studi kasus — diubah di Work → Case Studies; angka dan gambar perlu disetujui admin.',
  'Ajakan di footer — diatur di Shared Content → Global CTAs.'
]
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Halaman Work"
    crumb="Work"
    public-path="/work"
    flag="NUXT_CMS_WORK_PUBLIC_ENABLED"
    :tabs="WORK_TABS"
    preview-path="/admin/preview/work"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
    :how-to="['Halaman ini hanya memilih proyek dan studi kasus mana yang tampil, dan urutannya. Isi tiap proyek / studi kasus diubah di menu Projects dan Case Studies.']"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat halaman Work…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Halaman Work gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <template v-if="form && state">
        <AdminEditorActionBar
          :state="state"
          :dirty="dirty"
          :busy="busy"
          preview-href="/admin/preview/work"
          :can-publish="canPublish"
          :can-unpublish="canUnpublish"
          :can-archive="canArchive"
          :publish-disabled-reason="publishDisabledReason"
          :notice="notice"
          :session-expired="sessionExpired"
          @save="saveDraft"
          @status="runStatusAction"
        />
        <p v-if="unpublishedSelected.length" class="mt-3 max-w-3xl rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
          Belum di-publish (publish dulu, atau sembunyikan, sebelum mem-publish halaman ini): {{ unpublishedSelected.join(' · ') }}
        </p>
      </template>
    </template>

    <template v-if="form" #default>
      <!-- 01 HERO -->
      <div v-show="activeTab === 'hero'" class="grid gap-5">
        <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Label kecil di atas judul" :maxlength="LIM.heroEyebrow" required hint="Jumlah proyek / studi kasus di sebelahnya dihitung otomatis." :error="err('hero.eyebrow')" />
        <fieldset class="grid gap-4 rounded-lg border border-navy-100 bg-white p-4">
          <legend class="px-1 text-sm font-semibold">Judul besar — dua baris</legend>
          <p class="text-xs text-navy-500">Tiap kolom = satu baris judul. Titik kuning setelah baris 2 ditambahkan otomatis.</p>
          <div class="grid gap-4 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.headlineLine1')" v-model="form.hero.headlineLine1" label="Baris 1" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine1')" />
            <AdminFormField :id="fieldId('hero.headlineLine2')" v-model="form.hero.headlineLine2" label="Baris 2" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine2')" />
          </div>
        </fieldset>
        <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Paragraf di bawah judul" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Tombol utama — teks" :maxlength="LIM.ctaLabel" required hint="Tombol ini selalu menggulir ke Daftar proyek." :error="err('hero.primaryCtaLabel')" />
          <div />
          <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Tombol kedua — teks" :maxlength="LIM.ctaLabel" required :error="err('hero.secondaryCtaLabel')" />
          <AdminFormField :id="fieldId('hero.secondaryCtaUrl')" v-model="form.hero.secondaryCtaUrl" label="Tombol kedua — link" inputmode="url" :maxlength="500" required hint="Contoh: /contact, #bagian, https://… Link ke situs lain terbuka di tab baru." :error="err('hero.secondaryCtaUrl')" />
        </div>
        <p class="text-xs text-navy-500">Tumpukan poster di hero otomatis dibuat dari proyek yang tampil di Daftar proyek — tidak ada gambar hero terpisah.</p>
      </div>

      <!-- 02 PROJECT INDEX -->
      <div v-show="activeTab === 'projectIndex'" class="grid gap-5">
        <AdminFormField :id="fieldId('projectIndex.sectionLabel')" v-model="form.projectIndex.sectionLabel" label="Label bagian" :maxlength="LIM.sectionLabel" required :error="err('projectIndex.sectionLabel')" />
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
          Maksimal <strong>{{ LIM.projectsActive }}</strong> proyek yang tampil; nomor (01, 02 …) mengikuti urutan. Nama, poster, kategori, filter dan deskripsi diambil dari
          <NuxtLink to="/admin/work/projects" class="underline">data proyek</NuxtLink>. Kartu memberi link ke studi kasus hanya kalau studi kasusnya dipilih di bagian 03.
        </p>
        <AdminFormRepeater legend="Proyek yang tampil" :items="form.projectIndex.items" :max="LIM.projects" :published-ids="publishedIds" :item-title="(i) => projectLabel(i.projectId)" add-label="Tambah proyek" :error="err('projectIndex.items')" @add="addProject">
          <template #default="{ item, index }">
            <div>
              <label :for="fieldId(`projectIndex.items.${index}.projectId`)" class="text-sm font-medium">Proyek<span class="text-red-700" aria-hidden="true"> *</span></label>
              <select :id="fieldId(`projectIndex.items.${index}.projectId`)" v-model="item.projectId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`projectIndex.items.${index}.projectId`)">
                <option v-if="!projectById(item.projectId)" :value="item.projectId">{{ projectLabel(item.projectId) }}</option>
                <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }} · {{ statusLabel(p.status) }}{{ p.dummy ? ' · demo' : '' }}</option>
              </select>
              <p v-if="err(`projectIndex.items.${index}.projectId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`projectIndex.items.${index}.projectId`) }}</p>
              <p v-if="projectById(item.projectId)" class="mt-1 flex items-center gap-2 text-xs text-navy-500">
                <AdminStatusBadge :status="projectById(item.projectId)!.status" />
                <NuxtLink :to="`/admin/work/projects/${item.projectId}`" class="underline">Ubah proyek ini</NuxtLink>
              </p>
            </div>
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 03 FEATURED CASES -->
      <div v-show="activeTab === 'featuredCases'" class="grid gap-5">
        <div class="grid gap-5 tablet:grid-cols-3">
          <AdminFormField :id="fieldId('featuredCases.sectionLabel')" v-model="form.featuredCases.sectionLabel" label="Label bagian" :maxlength="LIM.sectionLabel" required :error="err('featuredCases.sectionLabel')" />
          <AdminFormField :id="fieldId('featuredCases.titleLead')" v-model="form.featuredCases.titleLead" label="Judul (bagian awal)" :maxlength="LIM.titleLead" required :error="err('featuredCases.titleLead')" />
          <AdminFormField :id="fieldId('featuredCases.titleAccent')" v-model="form.featuredCases.titleAccent" label="Judul (bagian kuning)" :maxlength="LIM.titleAccent" required :error="err('featuredCases.titleAccent')" />
        </div>
        <AdminFormField :id="fieldId('featuredCases.supportingCopy')" v-model="form.featuredCases.supportingCopy" label="Kalimat di bawah judul" :maxlength="LIM.supportingCopy" required :error="err('featuredCases.supportingCopy')" />
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
          Maksimal <strong>{{ LIM.casesActive }}</strong> studi kasus yang tampil. Cerita dan angkanya diisi di masing-masing
          <NuxtLink to="/admin/work/case-studies" class="underline">studi kasus</NuxtLink>; hanya angka/gambar yang sudah Disetujui yang tampil di website.
        </p>
        <AdminFormRepeater legend="Studi kasus unggulan" :items="form.featuredCases.items" :max="LIM.cases" :published-ids="publishedIds" :item-title="(i) => caseLabel(i.caseStudyId)" add-label="Tambah studi kasus" :error="err('featuredCases.items')" @add="addCase">
          <template #default="{ item, index }">
            <div>
              <label :for="fieldId(`featuredCases.items.${index}.caseStudyId`)" class="text-sm font-medium">Studi kasus<span class="text-red-700" aria-hidden="true"> *</span></label>
              <select :id="fieldId(`featuredCases.items.${index}.caseStudyId`)" v-model="item.caseStudyId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`featuredCases.items.${index}.caseStudyId`)">
                <option v-if="!caseById(item.caseStudyId)" :value="item.caseStudyId">{{ caseLabel(item.caseStudyId) }}</option>
                <option v-for="c in caseOptions" :key="c.id" :value="c.id">{{ c.projectName ?? 'Belum terhubung ke proyek' }} · {{ statusLabel(c.status) }}{{ c.dummy ? ' · demo' : '' }}</option>
              </select>
              <p v-if="err(`featuredCases.items.${index}.caseStudyId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`featuredCases.items.${index}.caseStudyId`) }}</p>
              <p v-if="caseById(item.caseStudyId)" class="mt-1 flex flex-wrap items-center gap-2 text-xs text-navy-500">
                <AdminStatusBadge :status="caseById(item.caseStudyId)!.status" />
                <span v-if="caseById(item.caseStudyId)!.claims.needsApproval">{{ caseById(item.caseStudyId)!.claims.needsApproval }} angka/gambar menunggu persetujuan — belum tampil di website</span>
                <NuxtLink :to="`/admin/work/case-studies/${item.caseStudyId}`" class="underline">Ubah studi kasus ini</NuxtLink>
              </p>
            </div>
          </template>
        </AdminFormRepeater>
      </div>

      <!-- SEO -->
      <AdminSeoFields v-show="activeTab === 'seo'" v-model="form.seo" :err="err" />
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
