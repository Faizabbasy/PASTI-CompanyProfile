<script setup lang="ts">
import type { TestimonialAdminState } from '#shared/utils/testimonialSchema'

// Testimonial record editor. Content only; publication approval is its own
// action (AdminTestimonialsApproval). Where a testimonial appears is chosen
// by each page, shown here read-only.
definePageMeta({ layout: 'admin' })

const id = useRoute().params.id as string

const {
  loadStatus, loadError, refresh, form, state, revision, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<TestimonialAdminState, TestimonialForm>({
  name: 'this testimonial',
  endpoint: `/api/admin/shared/testimonials/${id}`,
  asyncKey: `admin-shared-testimonial-${id}`,
  tabs: TESTIMONIAL_TABS,
  toForm: toTestimonialForm,
  toPayload: toTestimonialPayload,
  validate: validateTestimonialForm
})
useHead({ title: computed(() => `${state.value?.draft.content.personName ?? 'Testimonial'} · Testimonials`) })

const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/shared/testimonials/${id}`, '/admin/shared/testimonials', () => state.value?.draft.content.personName ?? id)
const referenced = computed(() => (state.value?.extra.usage.length ?? 0) > 0)
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      Shared Content <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/shared/testimonials" class="hover:underline">Testimonials</NuxtLink> <span aria-hidden="true">/</span> {{ state?.draft.content.personName ?? id }}
    </nav>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading testimonial…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'This testimonial does not exist.' : 'Could not load the testimonial.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <div class="mt-1 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold">{{ state.draft.content.personName }}</h1>
        <span v-if="state.dummy" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
        <span v-else-if="state.source.kind === 'migration'" class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">Migrated · {{ state.source.version }}</span>
      </div>

      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/testimonials/${id}`"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminTestimonialsApproval
        :id="id"
        :revision="revision"
        :approval="state.extra.approval"
        :public-eligible="state.extra.publicEligible"
        :status="state.status"
        :active="state.draft.content.active"
        :dirty="dirty"
        @changed="refresh()"
      />

      <p v-if="referenced && state.status === 'archived'" class="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
        Archived but still referenced by a page. It is not public; that page keeps the reference and shows nothing in its place until someone picks another testimonial there.
      </p>

      <AdminEditorTabs v-model="activeTab" :tabs="TESTIMONIAL_TABS" label="Testimonial sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <div v-for="t in TESTIMONIAL_TABS" v-show="activeTab === t.key" :id="`panel-${t.key}`" :key="t.key" role="tabpanel" :aria-labelledby="`tab-${t.key}`">
          <AdminTestimonialsFields :form="form" :err="err" :tab="t.key" :legacy-role-line="state.extra.legacyRoleLine" />
        </div>

        <section aria-labelledby="usage-title" class="mt-8 rounded-lg border border-navy-100 bg-white p-4 text-sm">
          <h2 id="usage-title" class="font-semibold">Used by pages</h2>
          <ul v-if="state.extra.usage.length" class="mt-2 list-disc space-y-1 pl-5 text-navy-600">
            <li v-for="u in state.extra.usage" :key="`${u.page}-${u.where}`">{{ u.label }} <span class="text-xs text-navy-500">({{ u.where === 'published' ? 'live page' : 'draft' }})</span></li>
          </ul>
          <p v-else class="mt-1 text-navy-500">No page CMS record references this testimonial.</p>
          <p class="mt-2 text-xs text-navy-500">Pages pick testimonials themselves and keep their own order. The homepage keeps its own code-managed testimonials.</p>
        </section>

        <div v-if="canDelete(state)" class="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm">
          <h2 class="font-semibold text-red-800">Delete draft</h2>
          <p class="mt-1 text-navy-600">
            Never published, so it can be removed permanently.<template v-if="referenced"> A page references it, so delete is blocked — remove it there first.</template>
          </p>
          <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting || referenced" @click="remove">{{ deleting ? 'Deleting…' : 'Delete testimonial' }}</button>
          <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
