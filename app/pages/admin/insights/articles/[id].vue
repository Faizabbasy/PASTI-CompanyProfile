<script setup lang="ts">
import type { CollectionAdminState } from '#shared/cms/fields'
import type { ArticleContent, ArticleExtra, CategoryListRow } from '#shared/utils/insightsSchema'

// Article record editor. Unsaved-change protection, optimistic locking and
// the publish workflow come from useSingletonEditor.
definePageMeta({ layout: 'admin' })

type ArticleState = CollectionAdminState<ArticleContent, ArticleExtra>
const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data: categories } = await useAsyncData(`admin-insights-article-${id}-cats`, () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<ArticleState, ArticleForm>({
  name: 'this article',
  endpoint: `/api/admin/insights/articles/${id}`,
  asyncKey: `admin-insights-article-${id}`,
  tabs: ARTICLE_TABS,
  toForm: toArticleForm,
  toPayload: toArticlePayload,
  validate: validateArticleForm
})
useHead({ title: computed(() => `${state.value?.draft.content.title ?? 'Article'} · Articles`) })
const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/insights/articles/${id}`, '/admin/insights/articles', () => state.value?.draft.content.title ?? id)
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/insights/articles" class="hover:underline">Articles</NuxtLink> <span aria-hidden="true">/</span> {{ state?.draft.content.title ?? id }}
    </nav>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading article…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'This article does not exist.' : 'Could not load the article.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <div class="mt-1 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold">{{ state.draft.content.title }}</h1>
        <span v-if="state.dummy" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
        <span v-else-if="state.source.kind === 'migration'" class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">Migrated · {{ state.source.version }}</span>
      </div>

      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/insights/articles/${id}`"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminEditorTabs v-model="activeTab" :tabs="ARTICLE_TABS" label="Article sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <div v-for="t in (['basics', 'content', 'media', 'body'] as const)" v-show="activeTab === t" :id="`panel-${t}`" :key="t" role="tabpanel" :aria-labelledby="`tab-${t}`">
          <AdminInsightsArticleFields :form="form" :err="err" :categories="categories ?? []" :tab="t" :published-slug="state.extra.publishedSlug" />
        </div>
        <div v-show="activeTab === 'relations'" id="panel-relations" role="tabpanel" aria-labelledby="tab-relations" class="grid gap-4 text-sm">
          <div class="rounded-lg border border-navy-100 bg-white p-4">
            <h2 class="font-semibold">Insights page</h2>
            <p class="mt-1 text-navy-500">
              Draft issue: {{ state.extra.usedInLanding.draft ? 'listed' : 'not listed' }} · Live page: {{ state.extra.usedInLanding.published ? 'shown' : 'not shown' }}.
              Order and visibility are managed on the <NuxtLink to="/admin/insights" class="underline">Insights page</NuxtLink>.
            </p>
            <p class="mt-1 text-xs text-navy-500">Related articles: the reader's “Next” follows the issue order (code-managed); there is no related-articles block on the current design.</p>
          </div>
          <div v-if="canDelete(state)" class="rounded-lg border border-red-200 bg-red-50/50 p-4">
            <h2 class="font-semibold text-red-800">Delete draft</h2>
            <p class="mt-1 text-navy-600">Never published, so it can be removed permanently.</p>
            <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Deleting…' : 'Delete article' }}</button>
            <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
          </div>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
