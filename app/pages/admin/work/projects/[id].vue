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
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/work/projects" class="hover:underline">Projects</NuxtLink> <span aria-hidden="true">/</span> {{ state?.draft.content.name ?? id }}
    </nav>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading project…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'This project does not exist.' : 'Could not load the project.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <div class="mt-1 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold">{{ state.draft.content.name }}</h1>
        <span v-if="state.dummy" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
        <span v-else-if="state.source.kind === 'migration'" class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">Migrated · {{ state.source.version }}</span>
      </div>

      <AdminEditorActionBar
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

      <AdminEditorTabs v-model="activeTab" :tabs="PROJECT_TABS" label="Project sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <div v-show="activeTab === 'identity'" id="panel-identity" role="tabpanel" aria-labelledby="tab-identity">
          <AdminWorkProjectFields :form="form" :err="err" tab="identity" :published-slug="state.extra.publishedSlug" />
        </div>
        <div v-show="activeTab === 'card'" id="panel-card" role="tabpanel" aria-labelledby="tab-card">
          <AdminWorkProjectFields :form="form" :err="err" tab="card" />
        </div>
        <div v-show="activeTab === 'relations'" id="panel-relations" role="tabpanel" aria-labelledby="tab-relations" class="grid gap-4 text-sm">
          <div class="rounded-lg border border-navy-100 bg-white p-4">
            <h2 class="font-semibold">Case study</h2>
            <p v-if="state.extra.caseStudy" class="mt-1 flex items-center gap-2">
              <NuxtLink :to="`/admin/work/case-studies/${state.extra.caseStudy.id}`" class="underline">#case-{{ state.extra.caseStudy.slug }}</NuxtLink>
              <AdminStatusBadge :status="state.extra.caseStudy.status" />
            </p>
            <p v-else class="mt-1 text-navy-500">
              None — portfolio only. A case study is linked from its own record
              (<NuxtLink to="/admin/work/case-studies/new" class="underline">create one</NuxtLink>).
            </p>
          </div>
          <div class="rounded-lg border border-navy-100 bg-white p-4">
            <h2 class="font-semibold">Work page</h2>
            <p class="mt-1 text-navy-500">
              Draft selection: {{ state.extra.usedInWork.draft ? 'active' : 'not selected' }} · Live page: {{ state.extra.usedInWork.published ? 'shown' : 'not shown' }}.
              Visibility and order are managed on the <NuxtLink to="/admin/work" class="underline">Work page</NuxtLink>.
            </p>
            <p v-if="state.meta.legacyAnchor" class="mt-1 text-xs text-navy-500">Deep link kept from the current site: <code>/work#work-{{ state.meta.legacyAnchor }}</code></p>
          </div>
          <div v-if="canDelete(state)" class="rounded-lg border border-red-200 bg-red-50/50 p-4">
            <h2 class="font-semibold text-red-800">Delete draft</h2>
            <p class="mt-1 text-navy-600">Never published, so it can be removed permanently.</p>
            <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Deleting…' : 'Delete project' }}</button>
            <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
          </div>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
