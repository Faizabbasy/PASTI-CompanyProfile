<script setup lang="ts">
import type { Keyed } from '~/composables/useSingletonEditor'
import { FAQS_LIMITS as LIM, FaqsContentSchema, type FaqsAdminState, type FaqsContent } from '#shared/utils/sharedContentSchema'

// Shared Content · FAQs — the questions of the homepage PAQ / FAQ section.
// Add / reorder / hide / remove; numbers (01, 02 …) follow the order.
definePageMeta({ layout: 'admin' })
useHead({ title: 'FAQs · Shared Content' })

type FaqForm = { items: Keyed<FaqsContent['items'][number]>[] }
const TABS = [{ key: 'items', label: 'Pertanyaan', sections: ['items'] }] as const
const toPayload = (f: FaqForm) => ({ items: unkeyed(f.items) })

const {
  loadStatus, loadError, refresh, form, state, dirty, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<FaqsAdminState, FaqForm>({
  name: 'FAQs',
  endpoint: '/api/admin/shared/faqs',
  asyncKey: 'admin-shared-faqs',
  tabs: TABS,
  toForm: (c) => ({ items: keyed((JSON.parse(JSON.stringify(c)) as FaqsContent).items) }),
  toPayload,
  validate: (f) => zodFieldErrors(FaqsContentSchema.safeParse(toPayload(f)))
})

const shown = computed(() => form.value?.items.filter((i) => i.active).length ?? 0)

function addFaq() {
  const items = form.value!.items
  items.push({ _key: newKey(), question: '', answer: '', sortOrder: items.length + 1, active: true })
}
</script>

<template>
  <AdminSharedShell
    name="FAQs"
    where="Homepage, bagian “FAQ” (dekat bagian bawah): daftar pertanyaan bernomor di kanan; pertanyaan yang dibuka tampil besar dengan nomornya di kiri (desktop)."
    flag="NUXT_CMS_FAQS_PUBLIC_ENABLED"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :code-managed="[
      'Judul “FAQ”, label “PAQ”, tombol “Tell us about it” (WhatsApp), dan kalimat “Certainty Through Execution”.',
      'Nomor pertanyaan (01, 02 …) dan total “/ 07” — dihitung otomatis dari urutan pertanyaan yang tampil.',
      'Desain, animasi, dan aturan “satu jawaban terbuka”.'
    ]"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat FAQ…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        FAQ gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
      <AdminEditorActionBar
        v-else-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/faqs"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />
    </template>

    <template v-if="form && state">
      <div class="mb-4 rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
        <p><strong>{{ shown }}</strong> pertanyaan tampil <span class="text-navy-500">(minimal {{ LIM.minActive }}, maksimal {{ LIM.maxActive }})</span>. Urutan di sini = urutan di website; nomornya (01, 02 …) dihitung dari pertanyaan yang tampil.</p>
        <p class="mt-1 text-xs text-navy-500">Pertanyaan yang sudah pernah tayang tidak bisa dihapus — sembunyikan saja (hilangkan centang “Tampilkan”).</p>
      </div>

      <AdminFormRepeater
        legend="Pertanyaan"
        locale="id"
        :items="form.items"
        :max="LIM.max"
        :published-ids="publishedIds"
        :item-title="(q) => q.question"
        add-label="Tambah pertanyaan"
        :error="err('items')"
        @add="addFaq"
      >
        <template #default="{ item, index }">
          <AdminFormField :id="fieldId(`items.${index}.question`)" v-model="item.question" label="Pertanyaan" hint="Satu kalimat, diakhiri tanda tanya." :maxlength="LIM.question" required :error="err(`items.${index}.question`)" />
          <AdminFormField :id="fieldId(`items.${index}.answer`)" v-model="item.answer" label="Jawaban" multiline :rows="4" hint="Tampil saat pertanyaan dibuka. Cukup 1–3 kalimat." :maxlength="LIM.answer" required :error="err(`items.${index}.answer`)" />
        </template>
      </AdminFormRepeater>
    </template>
  </AdminSharedShell>
</template>
