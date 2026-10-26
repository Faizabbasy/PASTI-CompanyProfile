<script setup lang="ts">
import { CTAS_LIMITS as LIM, CtasContentSchema, type CtasAdminState, type CtasContent } from '#shared/utils/sharedContentSchema'

// Shared Content · Global CTAs — the footer's closing band on every page and
// the shared company contact facts (footer + /contact). The WhatsApp number
// and the legal entity name stay in code.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Global CTAs · Shared Content' })

const TABS = [{ key: 'ctas', label: 'Global CTAs', sections: ['eyebrow', 'headline', 'email', 'address', 'mapsUrl', 'hours', 'positioning', 'socials'] }] as const
const toJson = <T,>(v: T) => JSON.parse(JSON.stringify(v)) as T

const {
  loadStatus, loadError, refresh, form, state, dirty, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<CtasAdminState, CtasContent>({
  name: 'Global CTAs',
  endpoint: '/api/admin/shared/ctas',
  asyncKey: 'admin-shared-ctas',
  tabs: TABS,
  toForm: toJson,
  toPayload: toJson,
  validate: (f) => zodFieldErrors(CtasContentSchema.safeParse(toJson(f)))
})

// Live sample of the footer heading: last word yellow, full stop added.
const headWords = computed(() => (form.value?.headline ?? '').trim().replace(/[.!?,;:]+$/, '').split(/\s+/).filter(Boolean))
const socials = [
  { key: 'linkedin', label: 'LinkedIn', example: 'https://www.linkedin.com/company/…' },
  { key: 'instagram', label: 'Instagram', example: 'https://www.instagram.com/…' },
  { key: 'tiktok', label: 'TikTok', example: 'https://www.tiktok.com/@…' },
  { key: 'youtube', label: 'YouTube', example: 'https://www.youtube.com/@…' }
] as const
</script>

<template>
  <AdminSharedShell
    name="Global CTAs"
    where="Bagian penutup footer di SEMUA halaman (“Have a challenge?” / “Let’s build what matters.” + tombol email + ikon sosial media), kolom kontak di footer, dan info kontak di halaman Contact. Teks ajakan ini juga dipakai sebagai judul halaman Contact selama halaman Contact belum di-publish lewat Pages → Contact."
    flag="NUXT_CMS_CTAS_PUBLIC_ENABLED"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :code-managed="[
      'Nomor WhatsApp (+62 821-2549-2299) — dipakai semua tombol WhatsApp dan semua form demo, jadi dikunci supaya tidak ada salah ketik yang memutus jalur kontak.',
      'Nama perusahaan “PT Hidup Pasti Bahagia” (nama resmi) di footer.',
      'Tombol “Chat on WhatsApp”, label kecil (“Follow PASTI”, dll.), menu footer, dan desainnya.',
      'Teks di halaman Contact selain info kontak — itu diatur di Pages → Contact.'
    ]"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat Global CTAs…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Global CTAs gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
      <AdminEditorActionBar
        v-else-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/ctas"
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

    <div v-if="form && state" class="grid gap-10">
      <fieldset class="grid gap-5">
        <legend class="mb-1 text-base font-bold">Ajakan di footer</legend>
        <AdminFormField :id="fieldId('eyebrow')" v-model="form.eyebrow" label="Teks kecil di atas judul" hint="Contoh: Have a challenge?" :maxlength="LIM.eyebrow" required :error="err('eyebrow')" />
        <AdminFormField :id="fieldId('headline')" v-model="form.headline" label="Judul besar" hint="Minimal 2 kata. Kata terakhir otomatis kuning dan diberi titik — jangan tulis titik sendiri." :maxlength="LIM.headline" required :error="err('headline')" />
        <div class="rounded-lg bg-slateNavy px-5 py-4" aria-hidden="true">
          <p class="text-[11px] uppercase tracking-[0.2em] text-white/60">Contoh tampilan · {{ form.eyebrow }}</p>
          <p class="mt-1 font-display text-2xl font-extrabold leading-tight text-white">
            {{ headWords.slice(0, -1).join(' ') }} <span class="text-pastiYellow-500">{{ headWords[headWords.length - 1] }}.</span>
          </p>
        </div>
      </fieldset>

      <fieldset class="grid gap-5">
        <legend class="mb-1 text-base font-bold">Info kontak</legend>
        <AdminFormField :id="fieldId('email')" v-model="form.email" label="Email" hint="Tampil sebagai tombol di footer dan di halaman Contact." :maxlength="LIM.email" required :error="err('email')" />
        <AdminFormField :id="fieldId('address')" v-model="form.address" label="Alamat kantor" multiline :rows="2" hint="Kosongkan untuk menyembunyikan alamat." :maxlength="LIM.address" :error="err('address')" />
        <AdminFormField :id="fieldId('mapsUrl')" v-model="form.mapsUrl" label="Link Google Maps" inputmode="url" hint="Opsional. Kosong = link pencarian Google Maps dibuat otomatis dari alamat (di halaman Contact)." :maxlength="LIM.url" :error="err('mapsUrl')" />
        <AdminFormField :id="fieldId('hours')" v-model="form.hours" label="Jam kerja" hint="Opsional, contoh: Mon–Fri, 09:00–18:00 WIB. Kosong = tidak ditampilkan." :maxlength="LIM.hours" :error="err('hours')" />
        <AdminFormField :id="fieldId('positioning')" v-model="form.positioning" label="Kalimat di bawah logo footer" hint="Contoh: Technology × Creative Execution Partner" :maxlength="LIM.positioning" required :error="err('positioning')" />
      </fieldset>

      <fieldset class="grid gap-5">
        <legend class="mb-1 text-base font-bold">Sosial media</legend>
        <p class="-mt-3 text-xs text-navy-500">Isi link lengkap profil resmi. Kosong = ikonnya tampil redup dan tidak bisa diklik. Ikon WhatsApp selalu aktif.</p>
        <AdminFormField
          v-for="s in socials"
          :id="fieldId(`socials.${s.key}`)"
          :key="s.key"
          v-model="form.socials[s.key]"
          :label="s.label"
          inputmode="url"
          :placeholder="s.example"
          :maxlength="LIM.url"
          :error="err(`socials.${s.key}`)"
        />
      </fieldset>
    </div>
  </AdminSharedShell>
</template>
