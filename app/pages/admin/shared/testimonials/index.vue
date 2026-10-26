<script setup lang="ts">
import { TESTIMONIAL_APPROVALS, TESTIMONIAL_TYPES, type TestimonialListRow } from '#shared/utils/testimonialSchema'

// Shared Content → Testimonials: the single source of testimonial content.
// Pages only pick testimonial ids; nothing here decides where one appears.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Testimonials · Shared Content' })

const { cmsFetch, can } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-shared-testimonials', () => cmsFetch<TestimonialListRow[]>('/api/admin/shared/testimonials'))

const q = ref('')
const fStatus = ref<'' | 'draft' | 'published' | 'archived'>('')
const fApproval = ref('')
const fType = ref('')
const fActive = ref<'' | 'active' | 'inactive'>('')

const rows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return (data.value ?? []).filter(
    (r) =>
      (!fStatus.value ? r.status !== 'archived' : r.status === fStatus.value) &&
      (!fApproval.value || r.approval === fApproval.value) &&
      (!fType.value || r.type === fType.value) &&
      (!fActive.value || (fActive.value === 'active') === r.active) &&
      (!needle || [r.personName, r.companyDisplayName, r.quotePreview].some((v) => v.toLowerCase().includes(needle)))
  )
})
const total = computed(() => data.value?.length ?? 0)
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">Shared Content <span aria-hidden="true">/</span> Testimonials</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Testimonials</h1>
      <NuxtLink v-if="can('content.edit')" to="/admin/shared/testimonials/new" class="ml-auto rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800">+ Add testimonial</NuxtLink>
    </div>
    <p class="mt-1 max-w-3xl text-sm text-navy-500">
      One shared source for every page. Pages select testimonials by reference and keep their own order. A testimonial is public only when it is
      <strong>published</strong>, <strong>active</strong> and its publication approval is <strong>confirmed</strong> (admin). The homepage keeps its own code-managed testimonials.
    </p>

    <div class="mt-4 flex flex-wrap items-end gap-3 text-sm" role="search">
      <div>
        <label for="t-q" class="block text-xs font-medium text-navy-600">Search</label>
        <input id="t-q" v-model="q" type="search" placeholder="Person, company or quote" class="mt-1 w-64 rounded-md border border-navy-200 px-3 py-1.5">
      </div>
      <div>
        <label for="t-status" class="block text-xs font-medium text-navy-600">Status</label>
        <select id="t-status" v-model="fStatus" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">Draft + published</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
        </select>
      </div>
      <div>
        <label for="t-approval" class="block text-xs font-medium text-navy-600">Approval</label>
        <select id="t-approval" v-model="fApproval" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">All</option><option v-for="a in TESTIMONIAL_APPROVALS" :key="a" :value="a">{{ CLAIM_LABELS[a].label }}</option>
        </select>
      </div>
      <div>
        <label for="t-type" class="block text-xs font-medium text-navy-600">Type</label>
        <select id="t-type" v-model="fType" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">All</option><option v-for="t in TESTIMONIAL_TYPES" :key="t" :value="t">{{ TESTIMONIAL_TYPE_LABELS[t] }}</option>
        </select>
      </div>
      <div>
        <label for="t-active" class="block text-xs font-medium text-navy-600">Active</label>
        <select id="t-active" v-model="fActive" class="mt-1 rounded-md border border-navy-200 bg-white px-2 py-1.5">
          <option value="">All</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>
      <p class="ml-auto text-xs text-navy-500" role="status">{{ rows.length }} of {{ total }}</p>
    </div>

    <p v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Loading testimonials…</p>
    <div v-else-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      Could not load testimonials. <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-navy-100 bg-white">
      <table class="w-full min-w-[900px] text-left text-sm">
        <thead class="border-b border-navy-100 bg-surfaceNeutral text-xs uppercase tracking-wider text-navy-500">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-semibold">Person</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Quote</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Type</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Approval</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Active</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Last edited</th>
            <th scope="col" class="px-4 py-2.5 font-semibold"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-b border-navy-50 align-top last:border-0">
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/shared/testimonials/${r.id}`" class="font-semibold hover:underline">{{ r.personName }}</NuxtLink>
              <span v-if="r.dummy" class="ml-2 rounded-full border border-dashed border-navy-300 px-1.5 text-[10px] font-semibold uppercase text-navy-500">Demo</span>
              <div class="text-xs text-navy-500">{{ r.companyDisplayName || '—' }}</div>
            </td>
            <td class="max-w-[22rem] px-4 py-3 text-xs text-navy-600">{{ r.quotePreview }}</td>
            <td class="px-4 py-3 text-xs">{{ TESTIMONIAL_TYPE_LABELS[r.type] }}</td>
            <td class="px-4 py-3">
              <AdminStatusBadge :status="r.status" />
              <div v-if="r.hasUnpublishedChanges && r.publishedVersion" class="mt-1 text-[11px] text-navy-500">Unpublished changes</div>
            </td>
            <td class="px-4 py-3 text-xs">
              <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold" :class="CLAIM_LABELS[r.approval].cls"><span aria-hidden="true">{{ CLAIM_LABELS[r.approval].mark }}</span>{{ CLAIM_LABELS[r.approval].label }}</span>
              <div class="mt-1 text-[11px]" :class="r.publicEligible ? 'font-semibold text-emerald-800' : 'text-navy-500'">{{ r.publicEligible ? '✓ Public-eligible' : 'Not public' }}</div>
            </td>
            <td class="px-4 py-3 text-xs">{{ r.active ? 'Active' : 'Inactive' }}</td>
            <td class="px-4 py-3 text-xs text-navy-500">{{ fmtCmsTime(r.updatedAt) }}<br>{{ r.updatedBy.name }}</td>
            <td class="px-4 py-3 text-xs">
              <NuxtLink :to="`/admin/shared/testimonials/${r.id}`" class="font-semibold underline">Edit<span class="sr-only"> {{ r.personName }}</span></NuxtLink>
              <span v-if="r.referenced" class="mt-1 block text-[11px] text-navy-500">Used by a page</span>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="8" class="px-4 py-6 text-center text-navy-500">No testimonials match.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
