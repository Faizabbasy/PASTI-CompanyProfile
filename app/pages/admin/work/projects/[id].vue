<script setup lang="ts">
import type { CollectionAdminState } from '#shared/cms/fields'
import type { ProjectContent, ProjectExtra } from '#shared/utils/projectSchema'

// Project record editor (identity + work card). Visibility and order on
// /work are chosen on the Work page; the case study link is owned by the
// case study (projectId) and shown here read-only.
definePageMeta({ layout: 'admin' })

type ProjectState = CollectionAdminState<ProjectContent, ProjectExtra>
const id = useRoute().params.id as string

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<ProjectState, ProjectForm>({
  name: 'this project',
  endpoint: `/api/admin/work/projects/${id}`,
  asyncKey: `admin-work-project-${id}`,
  tabs: PROJECT_TABS,
  toForm: toProjectForm,
  toPayload: toProjectPayload,
  validate: validateProjectForm
})
useHead({ title: computed(() => `${state.value?.draft.content.name ?? 'Project'} · Projects`) })

const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/work/projects/${id}`, '/admin/work/projects', () => state.value?.draft.content.name ?? id)

const codeManaged = [
  'Desain kartu proyek, animasi, dan tumpukan poster di hero /work.',
  'Tampil/tidaknya proyek dan urutannya — diatur di Work → Work page.',
  'Hubungan ke studi kasus — diatur dari studi kasusnya (Work → Case Studies).'
]
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    :title="state?.draft.content.name || 'Proyek'"
    crumb="Projects"
    crumb-to="/admin/work/projects"
    :tabs="PROJECT_TABS"
    :preview-path="`/admin/preview/work/projects/${id}`"
    :code-managed="codeManaged"
    :dummy="!!state?.dummy"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
    :how-to="['Supaya tampil di /work, proyek harus di-Publish dan dipilih di Work → Work page.']"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat proyek…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ loadError.statusCode === 404 ? 'Proyek ini tidak ada.' : 'Proyek gagal dimuat.' }}
        <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <AdminEditorActionBar
        v-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/work/projects/${id}`"
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

    <template v-if="form && state" #default>
      <div v-show="activeTab === 'identity'">
        <AdminWorkProjectFields :form="form" :err="err" tab="identity" :published-slug="state.extra.publishedSlug" />
      </div>
      <div v-show="activeTab === 'card'">
        <AdminWorkProjectFields :form="form" :err="err" tab="card" />
      </div>
      <div v-show="activeTab === 'relations'" class="grid gap-4 text-sm">
        <div class="rounded-lg border border-navy-100 bg-white p-4">
          <h3 class="font-semibold">Studi kasus</h3>
          <p v-if="state.extra.caseStudy" class="mt-1 flex items-center gap-2">
            <NuxtLink :to="`/admin/work/case-studies/${state.extra.caseStudy.id}`" class="underline">#case-{{ state.extra.caseStudy.slug }}</NuxtLink>
            <AdminStatusBadge :status="state.extra.caseStudy.status" />
          </p>
          <p v-else class="mt-1 text-navy-500">
            Belum ada — proyek ini hanya tampil sebagai kartu. Studi kasus dibuat dan dihubungkan dari menu Case Studies
            (<NuxtLink to="/admin/work/case-studies/new" class="underline">buat studi kasus</NuxtLink>).
          </p>
        </div>
        <div class="rounded-lg border border-navy-100 bg-white p-4">
          <h3 class="font-semibold">Halaman Work</h3>
          <p class="mt-1 text-navy-500">
            Di draft halaman Work: {{ state.extra.usedInWork.draft ? 'dipilih' : 'tidak dipilih' }} · Di website sekarang: {{ state.extra.usedInWork.published ? 'tampil' : 'tidak tampil' }}.
            Tampil/tidaknya dan urutannya diatur di <NuxtLink to="/admin/work" class="underline">Work → Work page</NuxtLink>.
          </p>
          <p v-if="state.meta.legacyAnchor" class="mt-1 text-xs text-navy-500">Link lama dari website sekarang tetap dipakai: <code>/work#work-{{ state.meta.legacyAnchor }}</code></p>
        </div>
        <div v-if="canDelete(state)" class="rounded-lg border border-red-200 bg-red-50/50 p-4">
          <h3 class="font-semibold text-red-800">Hapus draft</h3>
          <p class="mt-1 text-navy-600">Proyek ini belum pernah tayang, jadi bisa dihapus permanen.</p>
          <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Menghapus…' : 'Hapus proyek' }}</button>
          <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
        </div>
      </div>
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
