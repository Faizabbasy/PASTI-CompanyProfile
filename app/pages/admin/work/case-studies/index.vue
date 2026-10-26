<script setup lang="ts">
import type { CaseStudyListRow } from '#shared/utils/caseStudySchema'

// Case studies collection: deeper narratives, each linked to one project.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Case Studies · Work' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-work-cases', () => cmsFetch<CaseStudyListRow[]>('/api/admin/work/case-studies'))
const showArchived = ref(false)
const rows = computed(() => (data.value ?? []).filter((r) => showArchived.value || r.status !== 'archived'))
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500"><NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span> Case Studies</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Case studies</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/work/case-studies/new" class="ml-auto rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800">+ Add case study</NuxtLink>
    </div>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Every case study belongs to a project, which supplies its name, client and year. Which cases are featured on <code>/work</code> is chosen on the
      <NuxtLink to="/admin/work" class="underline">Work page</NuxtLink>. Publishing a case never approves its claims — each metric and image keeps its own status.
    </p>
    <label class="mt-4 inline-flex items-center gap-2 text-sm"><input v-model="showArchived" type="checkbox" class="h-4 w-4"> Show archived</label>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Loading case studies…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Could not load case studies. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Case study</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Featured</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Claims &amp; media</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Last edited</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 last:border-0">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/work/case-studies/${r.id}`" class="font-semibold hover:underline">{{ r.projectName ?? 'Unlinked project' }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Demo</span>
              <div class="text-xs text-navy-500">#case-{{ r.slug }}</div>
            </td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-navy-500">Unpublished changes</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.featuredInWork ? 'Featured' : '—' }}</td>
            <td class="px-4 py-3 text-xs">
              <span class="mr-2">✓ {{ r.claims.confirmed }} confirmed</span>
              <span class="mr-2" :class="r.claims.needsApproval ? 'font-semibold text-amber-900' : ''">! {{ r.claims.needsApproval }} need approval</span>
              <span>– {{ r.claims.hidden }} hidden</span>
            </td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="5" class="px-4 py-6 text-center text-navy-500">No case studies yet.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
