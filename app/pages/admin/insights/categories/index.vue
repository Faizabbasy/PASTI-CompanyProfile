<script setup lang="ts">
import type { CategoryListRow } from '#shared/utils/insightsSchema'
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Categories (topic taxonomy). Simple table + quick create. Filter order on
// /insights is set on the Insights page (Topic filters tab).
definePageMeta({ layout: 'admin' })
useHead({ title: 'Categories · Insights' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-insights-categories', () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))

const form = ref<CategoryForm>(emptyCategory())
const { errors, err, notice, busy, submit } = useCollectionCreate()
async function create() {
  if (!form.value.slug) form.value.slug = slugFrom(form.value.name)
  await submit({
    validate: () => validateCategoryForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/insights/categories', { method: 'POST', body: { content: toCategoryPayload(form.value) }, keepOn401: true }),
    then: async () => {
      form.value = emptyCategory()
      notice.value = { kind: 'success', text: 'Category created as a draft. An admin publishes it.' }
      await refresh()
    }
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span> Categories</nav>
    <h1 class="mt-1 text-2xl font-bold">Categories</h1>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Topics articles belong to. Only published, active categories are offered publicly. The order of the filter chips is set on the
      <NuxtLink to="/admin/insights" class="underline">Insights page</NuxtLink>. Categories in use cannot be archived or deleted.
    </p>
    <label class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Show archived</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Loading categories…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Could not load categories. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Name</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Slug</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Active</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Articles</th>
            <th scope="col" class="px-4 py-2.5 font-semibold"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0">
            <td class="px-4 py-3 font-semibold">{{ r.name }}<span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Demo</span></td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ r.slug }}</td>
            <td class="px-4 py-3 text-xs">{{ r.active ? '● Active' : '○ Inactive' }}</td>
            <td class="px-4 py-3"><AdminStatusBadge :status="r.status" /></td>
            <td class="px-4 py-3 text-xs tabular-nums">{{ r.articleCount }}</td>
            <td class="px-4 py-3 text-right"><NuxtLink :to="`/admin/insights/categories/${r.id}`" class="text-sm font-medium underline">Edit<span class="sr-only"> {{ r.name }}</span></NuxtLink></td>
          </tr>
          <tr v-if="!rows.length"><td colspan="6" class="px-4 py-6 text-center text-navy-500">No categories yet.</td></tr>
        </tbody>
      </table>
    </div>

    <form v-if="can('content.edit')" class="mt-8 grid max-w-3xl gap-4 rounded-lg border border-navy-100 bg-white p-4" novalidate @submit.prevent="create">
      <h2 class="font-semibold">Add category</h2>
      <AdminEditorNotice :notice="notice" />
      <div class="grid gap-4 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('name')" v-model="form.name" label="Name" :maxlength="20" required :error="err('name')" />
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug" :maxlength="60" required hint="Empty = generated from the name." :error="err('slug')" />
      </div>
      <AdminFormField :id="fieldId('description')" v-model="form.description" label="Description (optional, internal)" :maxlength="200" :error="err('description')" />
      <p v-if="Object.keys(errors).length" class="text-sm text-red-700" role="alert">Fix the highlighted fields.</p>
      <div><button type="submit" class="rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Creating…' : 'Create draft' }}</button></div>
    </form>
  </section>
</template>
