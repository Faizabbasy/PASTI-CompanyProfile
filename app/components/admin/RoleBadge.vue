<script setup lang="ts">
import type { CmsRole } from '#shared/utils/cmsPermissions'

defineProps<{ role: CmsRole }>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
    :class="role === 'ADMIN' ? 'bg-slateNavy text-white' : 'border border-navy-300 bg-white text-navy-600'"
  >
    <span class="sr-only">Role: </span>{{ role }}
  </span>
</template>
