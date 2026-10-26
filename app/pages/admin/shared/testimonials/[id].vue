<script setup lang="ts">
import type { TestimonialAdminState } from '#shared/utils/testimonialSchema'

// Testimonial record editor. Content only; publication approval is its own
// action (AdminTestimonialsApproval). Where a testimonial appears is chosen
// by each page, shown here read-only.
definePageMeta({ layout: 'admin' })

const id = useRoute().params.id as string

const {
  loadStatus, loadError, refresh, form, state, revision, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<TestimonialAdminState, TestimonialForm>({
  name: 'testimoni ini',
  endpoint: `/api/admin/shared/testimonials/${id}`,
  asyncKey: `admin-shared-testimonial-${id}`,
  tabs: TESTIMONIAL_TABS,
  toForm: toTestimonialForm,
  toPayload: toTestimonialPayload,
  validate: validateTestimonialForm
})
useHead({ title: computed(() => `${state.value?.draft.content.personName ?? 'Testimoni'} · Testimonials`) })

const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/shared/testimonials/${id}`, '/admin/shared/testimonials', () => state.value?.draft.content.personName ?? id)
const referenced = computed(() => (state.value?.extra.usage.length ?? 0) > 0)

const codeManaged = [
  'Desain kartu testimoni: tanda kutip, bentuk foto, susunan dan animasi.',
  'Di halaman mana testimoni tampil dan urutannya di sana — dipilih oleh masing-masing halaman.',
  'Persetujuan tampil — punya tombol sendiri (kotak “Persetujuan tampil”), bukan bagian dari form.'
]
</script>

<template>
  <div>
    <div v-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'Testimoni ini tidak ada.' : 'Testimoni gagal dimuat.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      <NuxtLink v-else to="/admin/shared/testimonials" class="ml-2 font-semibold underline">Kembali ke daftar testimoni</NuxtLink>
    </div>

    <AdminEditorFrame
      v-else
      v-model:active-tab="activeTab"
      :title="state?.draft.content.personName || 'Testimoni'"
      crumb="Shared Content · Testimonials"
      crumb-to="/admin/shared/testimonials"
      :tabs="TESTIMONIAL_TABS"
      :preview-path="`/admin/preview/testimonials/${id}`"
      :code-managed="codeManaged"
      :dummy="!!state?.dummy"
      :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
      :dirty="dirty"
      :error-count="errorCount"
      :ready="!!(form && state)"
      :how-to="['Selain Publish, testimoni perlu disetujui untuk tampil (kotak “Persetujuan tampil” di bawah tombol). Hanya admin yang bisa menyetujui.', 'Testimoni yang sudah pernah tayang tidak bisa dihapus — pakai Archive.']"
    >
      <template #status>
        <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat testimoni…</div>
      </template>

      <template #actions>
        <template v-if="form && state">
          <AdminEditorActionBar
            :state="state"
            :dirty="dirty"
            :busy="busy"
            :preview-href="`/admin/preview/testimonials/${id}`"
            :can-publish="canPublish"
            :can-unpublish="canUnpublish"
            :can-archive="canArchive"
            :publish-disabled-reason="publishDisabledReason"
            :notice="notice"
            :session-expired="sessionExpired"
            @save="saveDraft"
            @status="runStatusAction"
          />
          <div class="max-w-3xl">
            <AdminTestimonialsApproval
              :id="id"
              :revision="revision"
              :approval="state.extra.approval"
              :public-eligible="state.extra.publicEligible"
              :status="state.status"
              :active="state.draft.content.active"
              :dirty="dirty"
              @changed="refresh()"
            />
            <p v-if="referenced && state.status === 'archived'" class="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
              Sudah diarsipkan tapi masih dipilih sebuah halaman. Testimoni ini tidak tampil; halaman itu menampilkan kosong di tempatnya sampai dipilih testimoni lain di sana.
            </p>
          </div>
        </template>
      </template>

      <template v-if="form && state" #default>
        <div v-for="t in TESTIMONIAL_TABS" v-show="activeTab === t.key" :key="t.key">
          <AdminTestimonialsFields :form="form" :err="err" :tab="t.key" :legacy-role-line="state.extra.legacyRoleLine" />
        </div>

        <section aria-labelledby="usage-title" class="mt-8 rounded-lg border border-navy-100 bg-white p-4 text-sm">
          <h3 id="usage-title" class="font-semibold">Dipakai di halaman</h3>
          <ul v-if="state.extra.usage.length" class="mt-2 list-disc space-y-1 pl-5 text-navy-600">
            <li v-for="u in state.extra.usage" :key="`${u.page}-${u.where}`">{{ u.label }} <span class="text-xs text-navy-500">({{ u.where === 'published' ? 'halaman yang tayang' : 'draft' }})</span></li>
          </ul>
          <p v-else class="mt-1 text-navy-500">Belum ada halaman CMS yang memilih testimoni ini.</p>
          <p class="mt-2 text-xs text-navy-500">Halaman memilih testimoninya sendiri dan punya urutan sendiri. Bagian Testimoni di homepage membaca daftar ini kalau flag server <code>NUXT_CMS_TESTIMONIALS_PUBLIC_ENABLED</code> menyala.</p>
        </section>

        <div v-if="canDelete(state)" class="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm">
          <h3 class="font-semibold text-red-800">Hapus draft</h3>
          <p class="mt-1 text-navy-600">
            Belum pernah tayang, jadi bisa dihapus permanen.<template v-if="referenced"> Tapi sebuah halaman masih memilihnya — hapus dari halaman itu dulu.</template>
          </p>
          <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting || referenced" @click="remove">{{ deleting ? 'Menghapus…' : 'Hapus testimoni' }}</button>
          <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
        </div>
      </template>

      <template #after>
        <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
      </template>
    </AdminEditorFrame>
  </div>
</template>
