<script setup lang="ts">
import type { ActorRef } from '#shared/cms/fields'

defineProps<{ revisions: { version: number; publishedAt: string; publishedBy: ActorRef }[] }>()
</script>

<template>
  <section v-if="revisions.length" class="mt-10 max-w-3xl rounded-lg border border-navy-100 bg-white">
    <h2 class="border-b border-navy-100 px-5 py-3 text-sm font-semibold">Published versions</h2>
    <ul class="divide-y divide-navy-100 text-sm">
      <li v-for="rev in revisions" :key="rev.version" class="flex flex-wrap gap-x-3 px-5 py-2">
        <span class="font-semibold">v{{ rev.version }}</span>
        <span class="text-navy-500">{{ fmtCmsTime(rev.publishedAt) }} by {{ rev.publishedBy.name }}</span>
      </li>
    </ul>
  </section>
</template>
