<script setup lang="ts">
defineProps<{ navOpen: boolean }>()
defineEmits<{ toggleNav: [] }>()

const { user, logout } = useCmsSession()
const loggingOut = ref(false)

async function onLogout() {
  loggingOut.value = true
  try {
    await logout()
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-100 bg-white px-4 tablet:px-8">
    <button
      type="button"
      class="-ml-1 rounded-md p-2 text-slateNavy hover:bg-navy-50 desktop:hidden"
      aria-controls="admin-sidebar"
      :aria-expanded="navOpen"
      @click="$emit('toggleNav')"
    >
      <span class="sr-only">{{ navOpen ? 'Close navigation' : 'Open navigation' }}</span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <div class="ml-auto flex items-center gap-3">
      <div v-if="user" class="hidden text-right leading-tight tablet:block">
        <p class="text-sm font-semibold">{{ user.name }}</p>
        <p class="text-xs text-navy-500">{{ user.email }}</p>
      </div>
      <AdminRoleBadge v-if="user" :role="user.role" />
      <button
        type="button"
        class="rounded-md border border-navy-200 px-3 py-1.5 text-sm font-medium text-slateNavy hover:bg-navy-50 disabled:opacity-60"
        :disabled="loggingOut"
        @click="onLogout"
      >
        {{ loggingOut ? 'Signing out…' : 'Log out' }}
      </button>
    </div>
  </header>
</template>
