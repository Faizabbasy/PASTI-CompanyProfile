<script setup lang="ts">
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create a project as an unpublished draft, then continue in its editor.
definePageMeta({ layout: 'admin' })
useHead({ title: 'New project · Work' })

const { cmsFetch } = useCmsSession()
const form = ref<ProjectForm>(emptyProject())
const { errors, err, notice, busy, submit } = useCollectionCreate()

async function create() {
  await submit({
    validate: () => validateProjectForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/work/projects', { method: 'POST', body: { content: toProjectPayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/work/projects/${res.state.id}`)
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/work/projects" class="hover:underline">Projects</NuxtLink> <span aria-hidden="true">/</span> New
    </nav>
    <h1 class="mt-1 text-2xl font-bold">New project</h1>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">Saved as a draft. It appears on <code>/work</code> only after an admin publishes it and it is selected on the Work page.</p>
    <AdminEditorNotice :notice="notice" />
    <form class="mt-6 max-w-3xl" novalidate @submit.prevent="create">
      <AdminWorkProjectFields :form="form" :err="err" />
      <p v-if="Object.keys(errors).length" class="mt-4 text-sm text-red-700" role="alert">Fix the highlighted fields.</p>
      <button type="submit" class="mt-6 rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Creating…' : 'Create draft' }}</button>
    </form>
  </section>
</template>
