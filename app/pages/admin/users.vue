<script setup lang="ts">
import type { CmsPublicUser } from '#shared/utils/cmsPermissions'

// ADMIN only (route middleware + server permission check). Read-only list in
// Step 1; user management arrives later.
definePageMeta({ layout: 'admin' })

const { cmsFetch } = useCmsSession()
const { data, status, error } = await useAsyncData('admin-users', () =>
  cmsFetch<{ users: CmsPublicUser[] }>('/api/admin/users')
)
</script>

<template>
  <AdminComingSoon title="Users">
    <div class="mt-6 rounded-lg border border-navy-100 bg-white">
      <h2 class="border-b border-navy-100 px-5 py-3 text-sm font-semibold">CMS accounts (read-only)</h2>
      <p v-if="status === 'pending'" class="px-5 py-3 text-sm text-navy-500" role="status">Loading…</p>
      <p v-else-if="error" class="px-5 py-3 text-sm text-red-700" role="alert">Could not load users.</p>
      <ul v-else class="divide-y divide-navy-100">
        <li v-for="u in data?.users" :key="u.id" class="flex items-center gap-3 px-5 py-3 text-sm">
          <span class="font-medium">{{ u.name }}</span>
          <span class="text-navy-500">{{ u.email }}</span>
          <AdminRoleBadge class="ml-auto" :role="u.role" />
        </li>
      </ul>
    </div>
  </AdminComingSoon>
</template>
