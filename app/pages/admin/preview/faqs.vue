<script setup lang="ts">
// Authenticated draft preview of Shared Content · FAQs (real components).
// The homepage FAQ section.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · FAQs (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminSharedPreview id="faqs" name="FAQs">
    <div class="bg-pureWhite">
      <HomeFaq />
    </div>
  </AdminSharedPreview>
</template>
