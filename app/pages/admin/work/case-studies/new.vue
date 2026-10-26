<script setup lang="ts">
import type { ProjectListRow } from '#shared/utils/projectSchema'
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create a case study for an existing project (draft), then continue in its
// editor. Projects that already have a case study are not offered.
definePageMeta({ layout: 'admin' })
useHead({ title: 'New case study · Work' })

const { cmsFetch } = useCmsSession()
const { data: projects } = await useAsyncData('admin-work-case-new-projects', () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects'))
const available = computed(() => (projects.value ?? []).filter((p) => p.status !== 'archived' && !p.caseStudy))

const form = ref<CaseStudyForm>(emptyCaseStudy())
const { errors, err, notice, busy, submit } = useCollectionCreate()

async function create() {
  await submit({
    validate: () => validateCaseStudyForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/work/case-studies', { method: 'POST', body: { content: toCaseStudyPayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/work/case-studies/${res.state.id}`)
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/work/case-studies" class="hover:underline">Case Studies</NuxtLink> <span aria-hidden="true">/</span> New
    </nav>
    <h1 class="mt-1 text-2xl font-bold">New case study</h1>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">Pick the project first — the case study takes its name, client and year from it. The narrative is filled in on the next screen.</p>
    <AdminEditorNotice :notice="notice" />
    <form class="mt-6 grid max-w-3xl gap-5" novalidate @submit.prevent="create">
      <div>
        <label :for="fieldId('projectId')" class="text-sm font-medium">Project<span class="text-red-700" aria-hidden="true"> *</span></label>
        <select :id="fieldId('projectId')" v-model="form.projectId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('projectId')">
          <option value="" disabled>Choose a project…</option>
          <option v-for="p in available" :key="p.id" :value="p.id">{{ p.name }} · {{ p.status }}</option>
        </select>
        <p v-if="!available.length" class="mt-1 text-xs text-navy-500">Every project already has a case study. <NuxtLink to="/admin/work/projects/new" class="underline">Add a project</NuxtLink> first.</p>
        <p v-if="err('projectId')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('projectId') }}</p>
      </div>
      <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug" :maxlength="60" required hint="Deep link on /work: #case-<slug>. Lowercase letters, numbers and hyphens." :error="err('slug')" />
      <p v-if="Object.keys(errors).length" class="text-sm text-red-700" role="alert">Fix the highlighted fields.</p>
      <div>
        <button type="submit" class="rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Creating…' : 'Create draft' }}</button>
      </div>
    </form>
  </section>
</template>
