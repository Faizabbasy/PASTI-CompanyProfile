<script setup lang="ts">
import { CONTACT_LIMITS as LIM, type ContactAdminState } from '#shared/utils/contactSchema'

// Contact singleton editor. Page wording only — layout, typography, colour,
// motion, shared company contact data and every piece of form behaviour
// stay in code. No add/duplicate/delete for the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Contact · Pages' })

// Bilingual: which language record is being edited (?lang=, default Indonesian).
const lang = useEditorLang()
const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<ContactAdminState, ContactForm>({
  name: 'Contact',
  endpoint: '/api/admin/pages/contact',
  asyncKey: 'admin-contact',
  lang,
  tabs: CONTACT_TABS,
  toForm: toContactForm,
  toPayload: toContactPayload,
  validate: validateContactForm
})

// Shared company contact data, read from its one shared source (the same
// code the public page and the footer read). Shown for reference only —
// it is not part of the Contact CMS record and cannot be saved from here.
const { contact, socials } = useContact()
const shared = [
  { label: 'WhatsApp', value: contact.whatsappDisplay, source: 'Dikunci di kode' },
  { label: 'Email', value: contact.email, source: 'Global CTAs' },
  { label: 'Alamat kantor', value: contact.address, source: 'Global CTAs' },
  { label: 'Link Google Maps', value: contact.mapsUrl, source: 'Global CTAs' },
  { label: 'Jam kerja', value: contact.hours, source: 'Global CTAs' },
  { label: 'Nama perusahaan', value: contact.entity, source: 'Dikunci di kode' },
  { label: 'Sosial media', value: socials.map((s) => s.label).join(', ') || null, source: 'Global CTAs' }
]

const channelRows = [
  { key: 'whatsapp', name: 'Baris WhatsApp' },
  { key: 'email', name: 'Baris Email' },
  { key: 'office', name: 'Baris Kantor' }
] as const

const fieldRows = [
  { key: 'name', name: 'Nama', note: 'Wajib diisi' },
  { key: 'company', name: 'Perusahaan', note: 'Wajib diisi' },
  { key: 'email', name: 'Email kerja', note: 'Wajib diisi · format email' },
  { key: 'phone', name: 'Telepon / WhatsApp', note: 'Opsional · format nomor' },
  { key: 'message', name: 'Pesan', note: 'Opsional · bisa beberapa baris' }
] as const

const codeManaged = [
  'Susunan dan desain halaman: warna, ukuran huruf, animasi.',
  'Nomor WhatsApp dan nama perusahaan (dikunci di kode). Email, alamat, link Maps, jam kerja dan sosial media diatur di Shared Content → Global CTAs.',
  'Cara kerja form: urutan dan jenis kolom, kolom wajib, aturan dan pesan validasi, serta pesan WhatsApp yang dikirim.',
  'Pilihan “What do you need?” — otomatis dari nama layanan dan platform.',
  'Teks kecil antarmuka: penanda “Contact”, “Open WhatsApp”, “Start a new brief”, nomor baris, dan teks untuk pembaca layar.',
  'Ajakan di footer — diatur di Shared Content → Global CTAs.'
]
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Halaman Contact"
    crumb="Pages"
    crumb-to="/admin/pages"
    public-path="/contact"
    :lang="lang"
    flag="NUXT_CMS_CONTACT_PUBLIC_ENABLED"
    :tabs="CONTACT_TABS"
    :preview-path="`/admin/preview/contact?lang=${lang}`"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat konten Contact…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Konten Contact gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <AdminEditorActionBar
        v-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/contact?lang=${lang}`"
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

    <template v-if="form" #default>
      <!-- 01 HERO -->
      <div v-show="activeTab === 'hero'" class="grid gap-5">
        <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Label kecil di atas judul" :maxlength="LIM.heroEyebrow" required hint="Tampil setelah penanda “Contact” (di tablet dan layar lebih besar)." :error="err('hero.eyebrow')" />
        <AdminFormField
          :id="fieldId('hero.headline')"
          v-model="form.hero.headline"
          label="Judul besar"
          :maxlength="LIM.headline"
          required
          :hint="`Tiap kata muncul bergantian. Maksimal ${LIM.headlineWord} huruf per kata; titik kuning di akhir ditambahkan otomatis.`"
          :error="err('hero.headline')"
        />
        <AdminFormField :id="fieldId('hero.supportingCopy')" v-model="form.hero.supportingCopy" label="Paragraf di bawah judul" multiline :maxlength="LIM.supportingCopy" required :error="err('hero.supportingCopy')" />
      </div>

      <!-- 02 CONTACT ROWS -->
      <div v-show="activeTab === 'info'" class="grid gap-6">
        <section aria-labelledby="shared-info-title" class="rounded-lg border border-navy-100 bg-navy-50/60 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <h3 id="shared-info-title" class="text-sm font-semibold">Info kontak perusahaan</h3>
            <span class="rounded-full border border-navy-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-600">Hanya dilihat</span>
          </div>
          <p class="mt-1 text-xs text-navy-500">
            Nilai ini dipakai juga di footer dan tombol WhatsApp di seluruh website, jadi tidak diubah di sini.
            Email, alamat, link Maps, jam kerja dan sosial media diubah di
            <NuxtLink to="/admin/shared/ctas" class="underline">Shared Content → Global CTAs</NuxtLink>.
          </p>
          <dl class="mt-3 divide-y divide-navy-100 rounded-md border border-navy-100 bg-white text-sm">
            <div v-for="s in shared" :key="s.label" class="grid gap-1 px-3 py-2 tablet:grid-cols-[10rem_minmax(0,1fr)_auto] tablet:items-baseline tablet:gap-3">
              <dt class="font-medium text-navy-600">{{ s.label }}</dt>
              <dd class="min-w-0 [overflow-wrap:anywhere]">{{ s.value ?? 'Belum diisi — tidak tampil di halaman' }}</dd>
              <dd class="whitespace-nowrap text-[11px] text-navy-400">{{ s.source }}</dd>
            </div>
          </dl>
        </section>

        <fieldset class="grid gap-4">
          <legend class="text-sm font-semibold">Teks di tiap baris kontak</legend>
          <p class="text-xs text-navy-500">Tiap baris membuka WhatsApp, email atau Google Maps — tujuannya diambil dari info kontak di atas.</p>
          <div v-for="row in channelRows" :key="row.key" class="grid gap-3 rounded-md border border-navy-100 bg-white p-3 tablet:grid-cols-2">
            <AdminFormField :id="fieldId(`channels.${row.key}.label`)" v-model="form.channels[row.key].label" :label="`${row.name} — label kecil`" :maxlength="LIM.channelLabel" required :error="err(`channels.${row.key}.label`)" />
            <AdminFormField :id="fieldId(`channels.${row.key}.action`)" v-model="form.channels[row.key].action" :label="`${row.name} — teks link`" :maxlength="LIM.channelAction" required :error="err(`channels.${row.key}.action`)" />
          </div>
        </fieldset>
      </div>

      <!-- 03 FORM -->
      <div v-show="activeTab === 'form'" class="grid gap-5">
        <AdminFormField :id="fieldId('form.title')" v-model="form.form.title" label="Judul form" :maxlength="LIM.formTitle" required hint="Titik kuning di akhir ditambahkan otomatis." :error="err('form.title')" />
        <AdminFormField :id="fieldId('form.description')" v-model="form.form.description" label="Keterangan di bawah judul form" multiline :rows="2" :maxlength="LIM.formDescription" required :error="err('form.description')" />

        <fieldset class="grid gap-3">
          <legend class="text-sm font-semibold">Label kolom isian</legend>
          <p class="text-xs text-navy-500">
            Label dan contoh isian (placeholder) untuk kolom yang sudah ada. Urutan kolom, jenisnya, kolom mana yang wajib, dan pesan validasinya dikunci di kode.
          </p>
          <div v-for="f in fieldRows" :key="f.key" class="rounded-md border border-navy-100 bg-white p-3">
            <p class="text-xs font-semibold text-navy-600">{{ f.name }} <span class="font-normal text-navy-400">· {{ f.note }} (diatur di kode)</span></p>
            <div class="mt-2 grid gap-3 tablet:grid-cols-2">
              <AdminFormField :id="fieldId(`form.fields.${f.key}.label`)" v-model="form.form.fields[f.key].label" label="Label" :maxlength="LIM.fieldLabel" required :error="err(`form.fields.${f.key}.label`)" />
              <AdminFormField :id="fieldId(`form.fields.${f.key}.placeholder`)" v-model="form.form.fields[f.key].placeholder" label="Contoh isian (opsional)" :maxlength="f.key === 'message' ? LIM.messagePlaceholder : LIM.placeholder" hint="Kosong = tanpa contoh isian." :error="err(`form.fields.${f.key}.placeholder`)" />
            </div>
          </div>
        </fieldset>

        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('form.needsLegend')" v-model="form.form.needsLegend" label="Judul pilihan “What do you need?”" :maxlength="LIM.needsLegend" required hint="Pilihannya otomatis dari nama layanan dan platform." :error="err('form.needsLegend')" />
          <AdminFormField :id="fieldId('form.needsHint')" v-model="form.form.needsHint" label="Petunjuk kecil di sebelahnya (opsional)" :maxlength="LIM.needsHint" hint="Contoh: “Pick any”. Kosong = tidak tampil." :error="err('form.needsHint')" />
        </div>
        <AdminFormField :id="fieldId('form.submitLabel')" v-model="form.form.submitLabel" label="Teks tombol kirim" :maxlength="LIM.submitLabel" required :error="err('form.submitLabel')" />

        <fieldset class="grid gap-4 rounded-lg border border-navy-100 bg-white p-4">
          <legend class="px-1 text-sm font-semibold">Setelah tombol kirim diklik</legend>
          <p class="text-xs text-navy-500">Pesan berhasil tampil kalau WhatsApp terbuka dengan brief-nya; pesan gagal tampil kalau browser memblokir jendela WhatsApp.</p>
          <AdminFormField :id="fieldId('form.successTitle')" v-model="form.form.successTitle" label="Judul pesan berhasil" :maxlength="LIM.stateTitle" required :error="err('form.successTitle')" />
          <AdminFormField :id="fieldId('form.successMessage')" v-model="form.form.successMessage" label="Isi pesan berhasil" multiline :rows="2" :maxlength="LIM.stateMessage" required :error="err('form.successMessage')" />
          <AdminFormField :id="fieldId('form.errorTitle')" v-model="form.form.errorTitle" label="Judul pesan gagal" :maxlength="LIM.stateTitle" required :error="err('form.errorTitle')" />
          <AdminFormField :id="fieldId('form.errorMessage')" v-model="form.form.errorMessage" label="Isi pesan gagal" multiline :rows="2" :maxlength="LIM.stateMessage" required :error="err('form.errorMessage')" />
        </fieldset>
      </div>

      <!-- SEO -->
      <AdminSeoFields v-show="activeTab === 'seo'" v-model="form.seo" :err="err" />
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
