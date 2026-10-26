<script setup lang="ts">
// /contact (2026-10-16) — direct channels + a brief form that hands off to
// WhatsApp. Fixes the footer "Let's Talk" and FinalCta links, which pointed
// here before the page existed. The global footer follows. Shared contact
// data: useContact.
//
// Page wording is resolved once here (legacy code by default; the published
// Contact CMS snapshot only when the server-side flag allows it) and read by
// the Contact components through useContactPage().
const content = await resolveContactPageContent()
usePageSeo(content.value.seo)
</script>

<template>
  <ContactHero />
</template>
