<script setup lang="ts">
// Pages overview. Home is intentionally not listed: the homepage stays
// code-managed (layout, copy composition and motion are too sensitive).
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pages' })

const pages = [
  { label: 'About', to: '/admin/pages/about', state: 'Editable' },
  { label: 'Technology', to: '/admin/pages/technology', state: 'Editable' },
  { label: 'Creative', to: '/admin/pages/creative', state: 'Editable' },
  { label: 'Contact', to: '/admin/pages/contact', state: 'Editable' }
]
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold">Pages</h1>
    <p class="mt-1 text-sm text-navy-500">Singleton pages. The homepage is managed in code and is not part of the CMS.</p>
    <ul class="mt-6 max-w-2xl divide-y divide-navy-100 rounded-lg border border-navy-100 bg-white">
      <li v-for="p in pages" :key="p.to">
        <NuxtLink :to="p.to" class="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-navy-50">
          <span class="font-semibold">{{ p.label }}</span>
          <span class="text-xs text-navy-500">{{ p.state }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
