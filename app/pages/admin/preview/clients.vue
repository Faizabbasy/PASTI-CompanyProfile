<script setup lang="ts">
// Authenticated draft preview of Shared Content · Clients (real components).
// Homepage “Our Beloved Client” marquee, then the About client grid.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · Clients (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminSharedPreview id="clients" name="Clients">
    <div class="bg-pureWhite">
      <HomeTrust />
      <AboutClients />
    </div>
  </AdminSharedPreview>
</template>
