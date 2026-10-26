<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { ContactContent } from '#shared/utils/contactSchema'

// Authenticated draft preview (ADMIN + EDITOR). Lives under /admin, so the
// session gate, no-store and noindex headers apply; data comes from
// /api/admin/pages/contact/preview — never from /api/public. Renders the
// REAL Contact hero + form with the saved draft wording through the same
// adapter the public page uses; shared contact data comes from code as on
// the public page. The form behaves as on the public page (WhatsApp
// hand-off) — nothing is sent anywhere by the preview itself.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · Contact (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: ContactContent
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData('admin-contact-preview', () =>
  cmsFetch<PreviewResponse>('/api/admin/pages/contact/preview')
)

const legacy = buildLegacyContactContent()
const preview = computed(() => {
  const d = data.value
  return d ? adaptContactCms(legacy, { version: d.version, content: d.content }) : null
})
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
</script>

<template>
  <div class="min-h-screen bg-paper">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Draft preview — not public</strong>
        <span v-if="data">Contact · draft v{{ data.version }} · saved {{ fmt(data.updatedAt) }} · page status: {{ data.status }}</span>
        <span class="text-xs">SEO: {{ preview?.seo.title }}{{ preview?.seo.noIndex ? ' · noindex' : '' }}</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Reload draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Loading draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview unavailable.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Your role cannot preview this page.' : 'The draft could not be loaded. Your session may have expired.' }}
      </p>
      <a href="/admin/pages/contact" class="mt-3 inline-block text-sm font-semibold underline">Back to the editor</a>
    </div>

    <main v-else-if="preview">
      <!-- Remount on reload so the components re-read the new draft. -->
      <AdminContactPreviewScope :key="`${data?.version}-${data?.revision}-${data?.updatedAt}`" :content="preview">
        <ContactHero />
      </AdminContactPreviewScope>
    </main>
  </div>
</template>
