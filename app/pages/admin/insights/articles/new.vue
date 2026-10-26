<script setup lang="ts">
import type { CategoryListRow } from '#shared/utils/insightsSchema'
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create an article as an unpublished draft, then continue in its editor.
definePageMeta({ layout: 'admin' })
useHead({ title: 'New article · Insights' })

const { cmsFetch } = useCmsSession()
const { data: categories } = await useAsyncData('admin-insights-new-article-cats', () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))
const form = ref<ArticleForm>(emptyArticle())
const { errors, err, notice, busy, submit } = useCollectionCreate()

async function create() {
  await submit({
    validate: () => validateArticleForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/insights/articles', { method: 'POST', body: { content: toArticlePayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/insights/articles/${res.state.id}`)
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/insights/articles" class="hover:underline">Articles</NuxtLink> <span aria-hidden="true">/</span> New
    </nav>
    <h1 class="mt-1 text-2xl font-bold">New article</h1>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">Saved as a draft. It appears on <code>/insights</code> only after an admin publishes it and it is listed on the Insights page.</p>
    <AdminEditorNotice :notice="notice" />
    <form class="mt-6 max-w-3xl" novalidate @submit.prevent="create">
      <AdminInsightsArticleFields :form="form" :err="err" :categories="categories ?? []" tab="basics" />
      <div class="mt-5"><AdminInsightsArticleFields :form="form" :err="err" :categories="categories ?? []" tab="content" /></div>
      <div class="mt-5"><AdminInsightsArticleFields :form="form" :err="err" :categories="categories ?? []" tab="media" /></div>
      <p v-if="Object.keys(errors).length" class="mt-4 text-sm text-red-700" role="alert">Fix the highlighted fields.</p>
      <button type="submit" class="mt-6 rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Creating…' : 'Create draft' }}</button>
    </form>
  </section>
</template>
