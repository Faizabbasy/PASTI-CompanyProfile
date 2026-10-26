<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { CreativePageContent } from '#shared/utils/creativePublic'
import type { TestimonialContent, TestimonialExtra } from '#shared/utils/testimonialSchema'
import { testimonialRoleLine } from '#shared/utils/testimonialPublic'

// Authenticated draft preview of ONE testimonial (ADMIN + EDITOR, noindex,
// no-store via /admin route rules). Renders the saved draft in the REAL
// testimonial card that exists on a CMS page today — the Creative "Campaign +
// testimonial" figure — through the Creative preview scope, so layout and
// wrapping match. Nothing is written to any page; the public /creative page
// keeps its own source. The homepage ring is code-managed and not previewed.
definePageMeta({ layout: false })
useHead({ title: 'Preview · Testimonial (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface PreviewResponse {
  record: { id: string; status: PageStatus; version: number; updatedAt: string; content: TestimonialContent }
  approval: TestimonialExtra['approval']
  publicEligible: boolean
}

const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-testimonial-preview-${id}`, () => cmsFetch<PreviewResponse>(`/api/admin/shared/testimonials/${id}/preview`))

const legacy = buildLegacyCreativeContent()
const preview = computed<CreativePageContent | null>(() => {
  const c = data.value?.record.content
  if (!c) return null
  return { ...legacy, work: { ...legacy.work, testimonial: { name: c.personName, role: testimonialRoleLine(c), quote: c.quote, photo: c.photo || undefined } } }
})
const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)
</script>

<template>
  <div class="min-h-screen bg-paper">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Testimoni · draft v{{ data.record.version }} · disimpan {{ fmtCmsTime(data.record.updatedAt) }} · status: {{ data.record.status }}</span>
        <span v-if="data" class="text-xs">Persetujuan: {{ CLAIM_LABELS[data.approval.value].label }} · {{ data.publicEligible ? 'boleh tampil' : 'belum tampil' }}{{ data.record.content.active ? '' : ' · tidak dicentang “Tampilkan”' }}</span>
        <span class="text-xs">Ditampilkan memakai kartu testimoni di halaman Creative.</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button>
      </div>
    </div>
    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : error.statusCode === 404 ? 'Testimoni ini tidak ada.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}</p>
      <a :href="`/admin/shared/testimonials/${id}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>
    <main v-else-if="preview" ref="mainRef">
      <AdminCreativePreviewScope :key="`${data?.record.version}-${data?.record.updatedAt}`" :content="preview">
        <CreativeWork />
      </AdminCreativePreviewScope>
    </main>
  </div>
</template>
