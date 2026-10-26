<script setup lang="ts">
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create a testimonial as an unpublished draft (approval: needs approval),
// then continue in its editor.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Testimoni baru · Shared Content' })

const { cmsFetch } = useCmsSession()
const form = ref<TestimonialForm>(emptyTestimonial())
const { errors, err, notice, busy, submit } = useCollectionCreate()

const activeTab = ref<string>('quote')
const errorCount = (key: string) => Object.keys(errors.value).filter((p) => tabForPathIn(TESTIMONIAL_TABS, p) === key).length
// Open the group holding the first error before it gets focused.
watch(errors, (e) => {
  const first = Object.keys(e)[0]
  const tab = first ? tabForPathIn(TESTIMONIAL_TABS, first) : null
  if (tab) activeTab.value = tab
}, { flush: 'sync' })

async function create() {
  await submit({
    validate: () => validateTestimonialForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/shared/testimonials', { method: 'POST', body: { content: toTestimonialPayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/shared/testimonials/${res.state.id}`)
  })
}
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Testimoni baru"
    crumb="Shared Content · Testimonials"
    crumb-to="/admin/shared/testimonials"
    :tabs="TESTIMONIAL_TABS"
    :code-managed="[]"
    :error-count="errorCount"
    ready
    :how-to="['Isi bagian-bagian di kiri, lalu klik Buat draft. Hanya masukkan kutipan asli yang orangnya setuju untuk dibagikan.', 'Testimoni baru berstatus “Perlu persetujuan”: tampil di website hanya setelah admin mem-publish DAN menyetujuinya.']"
  >
    <template #actions>
      <div class="sticky top-16 z-10 -mx-4 mt-5 flex flex-wrap items-center gap-3 border-y border-navy-100 bg-white/95 px-4 py-3 tablet:-mx-8 tablet:px-8">
        <span class="text-sm text-navy-600">Testimoni baru disimpan sebagai <strong>draft</strong> (belum tampil di website).</span>
        <button type="button" class="ml-auto rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy" @click="create">{{ busy ? 'Membuat…' : 'Buat draft' }}</button>
      </div>
      <AdminEditorNotice :notice="notice" />
      <p v-if="Object.keys(errors).length" class="mt-3 text-sm text-red-700" role="alert">Perbaiki kolom yang ditandai merah (jumlah error tampil di daftar bagian kiri).</p>
    </template>

    <form novalidate @submit.prevent="create">
      <div v-for="t in TESTIMONIAL_TABS" v-show="activeTab === t.key" :key="t.key">
        <AdminTestimonialsFields :form="form" :err="err" :tab="t.key" />
      </div>
    </form>
  </AdminEditorFrame>
</template>
