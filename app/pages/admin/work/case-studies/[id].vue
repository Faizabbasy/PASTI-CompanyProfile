<script setup lang="ts">
import { CASE_LIMITS as LIM, type CaseStudyContent, type CaseStudyExtra } from '#shared/utils/caseStudySchema'
import type { ClaimStatus, CollectionAdminState } from '#shared/cms/fields'
import type { ProjectListRow } from '#shared/utils/projectSchema'

// Case study record editor. Project identity (name, client, year, poster)
// comes from the linked project. Metrics and gallery images carry their own
// claim status; publishing the case never approves them.
definePageMeta({ layout: 'admin' })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()

type CaseState = CollectionAdminState<CaseStudyContent, CaseStudyExtra>
const id = useRoute().params.id as string
const { cmsFetch, can } = useCmsSession()
const { data: projects } = await useAsyncData(`admin-work-case-${id}-projects-${lang}`, () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects', { query: { lang } }))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errors, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<CaseState, CaseStudyForm>({
  lang,
  name: 'this case study',
  endpoint: `/api/admin/work/case-studies/${id}`,
  asyncKey: `admin-work-case-${id}`,
  tabs: CASE_TABS,
  toForm: toCaseStudyForm,
  toPayload: toCaseStudyPayload,
  validate: validateCaseStudyForm
})
const title = computed(() => state.value?.extra.project?.name ?? 'Case study')
useHead({ title: computed(() => `${title.value} · Case Studies`) })

const canApprove = computed(() => can('claims.approve'))
const projectOptions = computed(() => (projects.value ?? []).filter((p) => p.status !== 'archived' && (!p.caseStudy || p.caseStudy.id === id)))
const project = computed(() => projects.value?.find((p) => p.id === form.value?.projectId))
const savedMetric = (mid?: string): ClaimStatus | null => (mid ? state.value?.draft.content.metrics.find((m) => m.id === mid)?.claimStatus ?? null : null)
const savedImage = (gid?: string): ClaimStatus | null => (gid ? state.value?.draft.content.gallery.find((g) => g.id === gid)?.approvalStatus ?? null : null)
const slugChanged = computed(() => !!state.value?.extra.publishedSlug && form.value?.slug !== state.value.extra.publishedSlug)

function addMetric() {
  const list = form.value!.metrics
  list.push({ _key: newKey(), value: '', label: '', context: '', sourceNote: '', claimStatus: 'needs_approval', active: true, sortOrder: list.length + 1 })
}
function addImage() {
  const list = form.value!.gallery
  list.push({ _key: newKey(), src: '', alt: '', kind: 'screen', sourceNote: '', approvalStatus: 'needs_approval', active: true, sortOrder: list.length + 1 })
}
const move = <T>(list: T[], i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}

const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/work/case-studies/${id}?lang=${lang}`, `/admin/work/case-studies?lang=${lang}`, () => title.value)

const STATUS_ID: Record<string, string> = { draft: 'draft', published: 'sudah tayang', archived: 'diarsipkan' }
// Keeps a collapsed list item open while it has a validation error.
const hasErr = (prefix: string) => (i: number) => Object.keys(errors.value).some((k) => k.startsWith(`${prefix}.${i}.`))
const codeManaged = [
  'Nama, klien, tahun dan poster — diambil dari proyeknya (Work → Projects).',
  'Desain bagian studi kasus: strip gambar, berkas bab demi bab, judul bab (Challenge, What we built …), dan animasinya.',
  'Tampil/tidaknya studi kasus dan urutannya — diatur di Work → Work page.',
  'Persetujuan angka dan gambar — hanya admin yang bisa menyetujui.'
]
</script>

<template>
  <AdminEditorFrame
    :lang="lang"
    v-model:active-tab="activeTab"
    :title="`${title} · studi kasus`"
    crumb="Case Studies"
    :crumb-to="`/admin/work/case-studies?lang=${lang}`"
    :tabs="CASE_TABS"
    :preview-path="`/admin/preview/work/case-studies/${id}?lang=${lang}`"
    :code-managed="codeManaged"
    :dummy="!!state?.dummy"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
    :how-to="['Supaya tampil di /work, studi kasus harus di-Publish dan dipilih di Work → Work page (bagian 03).']"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat studi kasus…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ loadError.statusCode === 404 ? 'Studi kasus ini tidak ada.' : 'Studi kasus gagal dimuat.' }}
        <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <template v-if="form && state">
        <AdminEditorActionBar
          :state="state"
          :dirty="dirty"
          :busy="busy"
          :preview-href="`/admin/preview/work/case-studies/${id}?lang=${lang}`"
          :can-publish="canPublish"
          :can-unpublish="canUnpublish"
          :can-archive="canArchive"
          :publish-disabled-reason="publishDisabledReason"
          :notice="notice"
          :session-expired="sessionExpired"
          @save="saveDraft"
          @status="runStatusAction"
        />
        <p class="mt-3 max-w-3xl rounded-md border border-navy-100 bg-white px-3 py-2 text-xs text-navy-600" role="note">
          Mem-publish studi kasus <strong>tidak</strong> otomatis menyetujui angka dan gambarnya. Hanya angka dan gambar berstatus <strong>Disetujui</strong> yang tampil di website<template v-if="!canApprove">, dan hanya admin yang bisa menyetujuinya</template>.
        </p>
      </template>
    </template>

    <template v-if="form && state" #default>
      <!-- 01 HEADER -->
      <div v-show="activeTab === 'header'" class="grid gap-5">
        <div>
          <label :for="fieldId('projectId')" class="text-sm font-medium">Proyek<span class="text-red-700" aria-hidden="true"> *</span></label>
          <select :id="fieldId('projectId')" v-model="form.projectId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('projectId')">
            <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }} · {{ STATUS_ID[p.status] ?? p.status }}</option>
          </select>
          <p v-if="err('projectId')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('projectId') }}</p>
          <p v-if="project" class="mt-1 text-xs text-navy-500">
            Dari proyek: {{ project.name }} · {{ project.category }} —
            <NuxtLink :to="`/admin/work/projects/${project.id}?lang=${lang}`" class="underline">nama, klien, tahun dan poster diubah di sana</NuxtLink>.
          </p>
        </div>
        <div>
          <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Alamat singkat (slug)" :maxlength="60" required hint="Link langsung di /work: #case-<slug>. Huruf kecil, angka dan tanda hubung." :error="err('slug')" />
          <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
            Slug yang sudah tayang adalah “{{ state.extra.publishedSlug }}”. Kalau diganti, link lama #case-{{ state.extra.publishedSlug }} tidak berfungsi lagi setelah di-publish.
          </p>
        </div>
        <AdminFormField :id="fieldId('categoryOverride')" v-model="form.categoryOverride" label="Kategori studi kasus (opsional)" :maxlength="LIM.category" hint="Kosong = memakai kategori proyeknya." :error="err('categoryOverride')" />
      </div>

      <!-- 02 CONTEXT -->
      <div v-show="activeTab === 'context'" class="grid gap-5">
        <AdminFormField :id="fieldId('context.body')" v-model="form.context.body" label="Konteks bisnis" multiline :rows="5" :maxlength="LIM.context" hint="Tampil di sampul berkas. Hanya fakta yang ada sumbernya — jangan mengarang detail klien." :error="err('context.body')" />
      </div>

      <!-- 03 CHALLENGE -->
      <div v-show="activeTab === 'challenge'" class="grid gap-5">
        <AdminFormStringList legend="Poin tantangan" path="challenge.points" :items="form.challenge.points" :max="6" :maxlength="LIM.point" item-label="Poin" add-label="Tambah poin" :err="err" hint="Kosong = bab ini disembunyikan." />
      </div>

      <!-- 04 APPROACH -->
      <div v-show="activeTab === 'approach'" class="grid gap-5">
        <fieldset>
          <legend class="text-sm font-medium">Jenis bab</legend>
          <div class="mt-2 flex flex-wrap gap-4 text-sm">
            <label class="inline-flex items-center gap-2"><input v-model="form.approach.mode" type="radio" value="solution"> Yang kami bangun (solusi)</label>
            <label class="inline-flex items-center gap-2"><input v-model="form.approach.mode" type="radio" value="request"> Yang diminta klien</label>
          </div>
          <p class="mt-1 text-xs text-navy-500">Judul bab diatur oleh desain. Pilih “Yang diminta klien” kalau sumbernya tidak menjelaskan apa yang dikerjakan PASTI sendiri.</p>
        </fieldset>
        <AdminFormStringList legend="Poin" path="approach.points" :items="form.approach.points" :max="LIM.points" :maxlength="LIM.point" item-label="Poin" add-label="Tambah poin" :err="err" />
      </div>

      <!-- 05 OUTCOME -->
      <div v-show="activeTab === 'outcome'" class="grid gap-5">
        <AdminFormStringList legend="Poin hasil" path="outcome.points" :items="form.outcome.points" :max="6" :maxlength="LIM.point" item-label="Poin" add-label="Tambah poin" :err="err" hint="Hasil dalam kata-kata. Angka ditulis di bagian Angka / metrik (perlu persetujuan)." />
        <AdminFormField :id="fieldId('insight')" v-model="form.insight" label="Insight (opsional)" multiline :maxlength="LIM.insight" :error="err('insight')" />
      </div>

      <!-- 06 METRICS -->
      <div v-show="activeTab === 'metrics'" class="grid gap-5">
        <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">
          <strong>Hanya angka berstatus Disetujui yang tampil di website.</strong> Angka “Perlu persetujuan” dan “Disembunyikan” tidak pernah tampil, walaupun studi kasusnya sudah di-publish.
        </p>
        <AdminFormRepeater legend="Angka / metrik" :items="form.metrics" :max="LIM.metrics" :published-ids="publishedIds" :item-title="(m) => `${m.value} ${m.label}`.trim()" add-label="Tambah angka" :error="err('metrics')" collapsible :has-error="hasErr('metrics')" @add="addMetric">
          <template #summary="{ item }">
            <span class="rounded-full border px-1.5 text-[10px] font-semibold" :class="CLAIM_LABELS[item.claimStatus].cls">{{ CLAIM_LABELS[item.claimStatus].mark }} {{ CLAIM_LABELS[item.claimStatus].label }}</span>
          </template>
          <template #default="{ item, index }">
            <div class="grid gap-4 tablet:grid-cols-[140px_1fr]">
              <AdminFormField :id="fieldId(`metrics.${index}.value`)" v-model="item.value" label="Angka" :maxlength="LIM.metricValue" required placeholder="mis. 30%" :error="err(`metrics.${index}.value`)" />
              <AdminFormField :id="fieldId(`metrics.${index}.label`)" v-model="item.label" label="Keterangan" :maxlength="LIM.metricLabel" required :error="err(`metrics.${index}.label`)" />
            </div>
            <AdminFormField :id="fieldId(`metrics.${index}.context`)" v-model="item.context" label="Konteks (opsional)" :maxlength="LIM.metricContext" hint="Mis. periode atau cara pengukuran." :error="err(`metrics.${index}.context`)" />
            <AdminFormField :id="fieldId(`metrics.${index}.sourceNote`)" v-model="item.sourceNote" label="Catatan sumber (internal, tidak pernah tampil)" multiline :rows="2" :maxlength="LIM.sourceNote" :error="err(`metrics.${index}.sourceNote`)" />
            <AdminWorkClaimStatus :id="fieldId(`metrics.${index}.claimStatus`)" v-model="item.claimStatus" :can-approve="canApprove" :saved-status="savedMetric(item.id)" :error="err(`metrics.${index}.claimStatus`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 07 GALLERY -->
      <div v-show="activeTab === 'gallery'" class="grid gap-5">
        <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">
          Screenshot bisa berisi data sensitif klien (nama, harga, sistem internal). Tiap gambar harus <strong>Disetujui</strong> admin sebelum bisa tampil. Gambar Disetujui yang pertama jadi gambar utama di strip studi kasus.
        </p>
        <AdminFormRepeater legend="Galeri gambar" :items="form.gallery" :max="LIM.gallery" :published-ids="publishedIds" :item-title="(g) => g.alt || g.src" add-label="Tambah gambar" :error="err('gallery')" collapsible :has-error="hasErr('gallery')" @add="addImage">
          <template #summary="{ item }">
            <span class="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-navy-100 bg-white">
              <img v-if="item.src" :src="item.src" alt="" class="h-full w-full object-cover">
            </span>
            <span class="rounded-full border px-1.5 text-[10px] font-semibold" :class="CLAIM_LABELS[item.approvalStatus].cls">{{ CLAIM_LABELS[item.approvalStatus].mark }} {{ CLAIM_LABELS[item.approvalStatus].label }}</span>
          </template>
          <template #default="{ item, index }">
            <AdminFormImage :id="fieldId(`gallery.${index}.src`)" v-model="item.src" label="Gambar" required :error="err(`gallery.${index}.src`)" />
            <div>
              <label :for="fieldId(`gallery.${index}.kind`)" class="text-sm font-medium">Jenis gambar</label>
              <select :id="fieldId(`gallery.${index}.kind`)" v-model="item.kind" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm tablet:w-64">
                <option value="poster">Poster (foto)</option>
                <option value="screen">Layar aplikasi (UI)</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>
            <AdminFormField :id="fieldId(`gallery.${index}.alt`)" v-model="item.alt" label="Deskripsi gambar untuk pembaca layar" :maxlength="LIM.alt" required :error="err(`gallery.${index}.alt`)" />
            <AdminFormField :id="fieldId(`gallery.${index}.sourceNote`)" v-model="item.sourceNote" label="Catatan sumber (internal, tidak pernah tampil)" multiline :rows="2" :maxlength="LIM.sourceNote" :error="err(`gallery.${index}.sourceNote`)" />
            <AdminWorkClaimStatus :id="fieldId(`gallery.${index}.approvalStatus`)" v-model="item.approvalStatus" :can-approve="canApprove" :saved-status="savedImage(item.id)" :error="err(`gallery.${index}.approvalStatus`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 08 TIMELINE & STACK -->
      <div v-show="activeTab === 'delivery'" class="grid gap-5">
        <fieldset class="grid gap-3">
          <legend class="text-sm font-medium">Durasi pengerjaan (opsional)</legend>
          <p class="text-xs text-navy-500">Fakta proyek, bukan klaim kinerja. Kosongkan kalau sumbernya tidak menyebut durasi — jangan memperkirakan.</p>
          <AdminFormField :id="fieldId('timeline.total')" v-model="form.timeline.total" label="Total durasi" :maxlength="LIM.timelineTotal" placeholder="mis. ~3,5 bulan" :error="err('timeline.total')" />
          <p v-if="err('timeline.steps')" class="text-xs font-medium text-red-700" role="alert">{{ err('timeline.steps') }}</p>
          <div v-for="(s, k) in form.timeline.steps" :key="k" class="grid gap-3 rounded-md border border-navy-100 bg-white p-3 tablet:grid-cols-[1fr_120px_auto]">
            <AdminFormField :id="fieldId(`timeline.steps.${k}.label`)" v-model="s.label" :label="`Tahap ${k + 1}`" :maxlength="LIM.stepLabel" required :error="err(`timeline.steps.${k}.label`)" />
            <div>
              <label :for="fieldId(`timeline.steps.${k}.weeks`)" class="text-sm font-medium">Minggu</label>
              <input :id="fieldId(`timeline.steps.${k}.weeks`)" v-model.number="s.weeks" type="number" min="1" max="104" class="mt-1 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm">
              <p v-if="err(`timeline.steps.${k}.weeks`)" class="mt-1 text-xs text-red-700">{{ err(`timeline.steps.${k}.weeks`) }}</p>
            </div>
            <div class="flex items-end gap-1 pb-1 text-xs">
              <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === 0" :aria-label="`Naikkan tahap ${k + 1}`" @click="move(form.timeline.steps, k, -1)">↑</button>
              <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === form.timeline.steps.length - 1" :aria-label="`Turunkan tahap ${k + 1}`" @click="move(form.timeline.steps, k, 1)">↓</button>
              <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50" @click="form.timeline.steps.splice(k, 1)">Hapus</button>
            </div>
          </div>
          <div>
            <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="form.timeline.steps.length >= LIM.steps" @click="form.timeline.steps.push({ label: '', weeks: 1 })">+ Tambah tahap</button>
          </div>
        </fieldset>
        <AdminFormStringList legend="Teknologi yang dipakai (opsional)" path="technologyLabels" :items="form.technologyLabels" :max="LIM.techLabels" :maxlength="LIM.techLabel" item-label="Label" add-label="Tambah label" :err="err" hint="Hanya teknologi yang dikonfirmasi sumbernya." />

      </div>
    </template>

    <template #after>
      <div v-if="state && canDelete(state)" class="mt-10 max-w-3xl rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm">
        <h3 class="font-semibold text-red-800">Hapus draft</h3>
        <p class="mt-1 text-navy-600">Studi kasus ini belum pernah tayang, jadi bisa dihapus permanen.</p>
        <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Menghapus…' : 'Hapus studi kasus' }}</button>
        <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
      </div>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
