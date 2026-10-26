<script setup lang="ts">
// Authenticated draft preview of Shared Content · Global CTAs (real components).
// The /contact contact block, then the footer every page shows.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · Global CTAs (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <AdminSharedPreview id="ctas" name="Global CTAs">
    <div class="bg-pureWhite">
      <ContactHero />
      <LayoutFooter />
    </div>
  </AdminSharedPreview>
</template>
