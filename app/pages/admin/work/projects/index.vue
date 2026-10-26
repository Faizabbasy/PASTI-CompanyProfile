<script setup lang="ts">
import type { ProjectListRow } from '#shared/utils/projectSchema'

// Projects collection: the source of truth for project identity.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Projects · Work' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-work-projects', () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span> Projects</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Projects</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/work/projects/new" class="ml-auto rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800">+ Add project</NuxtLink>
    </div>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Each project's name, client, category, poster and description. Where projects appear on <code>/work</code>, and in which order, is chosen on the
      <NuxtLink to="/admin/work" class="underline">Work page</NuxtLink>. Published projects are archived, never deleted.
    </p>
    <label class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Show archived</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Loading projects…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Could not load projects. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Project</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">On Work page</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Case study</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Last edited</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/work/projects/${r.id}`" class="font-semibold hover:underline">{{ r.name }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Demo</span>
              <div class="text-xs text-navy-500">{{ r.category }} · {{ r.slug }}</div>
            </td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-navy-500">Unpublished changes</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.selectedInWork ? 'Selected' : '—' }}</td>
            <td class="px-4 py-3 text-xs">
              <NuxtLink v-if="r.caseStudy" :to="`/admin/work/case-studies/${r.caseStudy.id}`" class="underline">#case-{{ r.caseStudy.slug }}</NuxtLink>
              <span v-else class="text-navy-400">Portfolio only</span>
            </td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="5" class="px-4 py-6 text-center text-navy-500">No projects yet.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
