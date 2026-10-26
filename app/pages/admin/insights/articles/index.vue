<script setup lang="ts">
import type { ArticleListRow } from '#shared/utils/insightsSchema'

// Articles collection: the editorial content of each insight.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Articles · Insights' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-insights-articles', () => cmsFetch<ArticleListRow[]>('/api/admin/insights/articles'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span> Articles</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Articles</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/insights/articles/new" class="ml-auto rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800">+ Add article</NuxtLink>
    </div>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Which articles appear on <code>/insights</code>, and in which order, is chosen on the <NuxtLink to="/admin/insights" class="underline">Insights page</NuxtLink>.
      Published articles are archived, never deleted.
    </p>
    <label class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Show archived</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Loading articles…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Could not load articles. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Article</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Categories</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">In issue</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Last edited</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/insights/articles/${r.id}`" class="font-semibold hover:underline">{{ r.title }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Demo</span>
              <div class="text-xs text-navy-500">{{ r.slug }}</div>
            </td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-navy-500">Unpublished changes</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.categories.join(', ') }}</td>
            <td class="px-4 py-3 text-xs">{{ r.inIssue ? 'Listed' : '—' }}</td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="5" class="px-4 py-6 text-center text-navy-500">No articles yet.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
