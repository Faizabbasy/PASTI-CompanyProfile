<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard' })

interface DashboardData {
  dummy: boolean
  user: { name: string; email: string; role: 'ADMIN' | 'EDITOR' }
  counts: { draft: number; published: number; archived: number; pendingReview: number }
  recentEdits: { id: string; entityType: string; label: string; status: string; updatedAt: string; updatedBy: string }[]
  recentMedia: { id: string; filename: string; mime: string; sizeKb: number; uploadedAt: string; uploadedBy: string }[]
}

const route = useRoute()
const { cmsFetch } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-dashboard', () =>
  cmsFetch<DashboardData>('/api/admin/dashboard')
)

const denied = computed(() => typeof route.query.denied === 'string')
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })

const statusClass: Record<string, string> = {
  draft: 'bg-navy-50 text-navy-600',
  published: 'bg-emerald-50 text-emerald-800',
  archived: 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p v-if="data" class="mt-1 text-sm text-navy-500">
          Signed in as <strong class="text-slateNavy">{{ data.user.name }}</strong> · {{ data.user.email }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <AdminRoleBadge v-if="data" :role="data.user.role" />
        <span class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
      </div>
    </div>

    <div v-if="denied" role="alert" class="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      You don't have permission to open that section.
    </div>

    <div v-if="status === 'pending'" class="mt-6 text-sm text-navy-500" role="status">Loading dashboard…</div>

    <div v-else-if="error" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the dashboard.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="data">
      <div class="mt-6 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <AdminStatCard label="Draft" :value="data.counts.draft" />
        <AdminStatCard label="Published" :value="data.counts.published" />
        <AdminStatCard label="Pending review" :value="data.counts.pendingReview" />
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 desktop:grid-cols-3">
        <div class="rounded-lg border border-navy-100 bg-white desktop:col-span-2">
          <h2 class="border-b border-navy-100 px-5 py-3 text-sm font-semibold">Recent edits</h2>
          <ul class="divide-y divide-navy-100">
            <li v-for="item in data.recentEdits" :key="item.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm">
              <span class="font-medium">{{ item.label }}</span>
              <span class="text-xs uppercase tracking-wider text-navy-400">{{ item.entityType }}</span>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="statusClass[item.status]">{{ item.status }}</span>
              <span class="ml-auto text-xs text-navy-500">{{ fmt(item.updatedAt) }} · {{ item.updatedBy }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-navy-100 bg-white">
          <h2 class="border-b border-navy-100 px-5 py-3 text-sm font-semibold">Recent media</h2>
          <ul class="divide-y divide-navy-100">
            <li v-for="m in data.recentMedia" :key="m.id" class="px-5 py-3 text-sm">
              <p class="truncate font-medium">{{ m.filename }}</p>
              <p class="text-xs text-navy-500">{{ m.mime }} · {{ m.sizeKb }} KB · {{ fmt(m.uploadedAt) }}</p>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </section>
</template>
