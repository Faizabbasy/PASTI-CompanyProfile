<script setup lang="ts">
import { TECHNOLOGY_LIMITS as LIM, TECHNOLOGY_WORK_REFS, type TechnologyAdminState } from '#shared/utils/technologySchema'

// Technology singleton editor. Content only — layout, section order,
// typography, colour and motion stay in code. No add/duplicate/delete for
// the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Technology · Pages' })

// Bilingual: which language record is being edited (?lang=, default Indonesian).
const lang = useEditorLang()
const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errors, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<TechnologyAdminState, TechnologyForm>({
  name: 'Technology',
  endpoint: '/api/admin/pages/technology',
  asyncKey: 'admin-technology',
  lang,
  tabs: TECHNOLOGY_TABS,
  toForm: toTechnologyForm,
  toPayload: toTechnologyPayload,
  validate: validateTechnologyForm
})

// ---- repeaters ------------------------------------------------------------
const nextOrder = (list: { sortOrder: number }[]) => list.length + 1
function addCapability() {
  const items = form.value!.capabilities.items
  items.push({ _key: newKey(), title: '', body: '', keywords: [], related: [], image: '', imageAlt: '', sortOrder: nextOrder(items), active: true })
}
function addWorkItem() {
  const items = form.value!.work.items
  const used = new Set(items.map((i) => i.ref))
  const ref = TECHNOLOGY_WORK_REFS.find((r) => !used.has(r))
  if (ref) items.push({ _key: newKey(), ref, sortOrder: nextOrder(items), active: true })
}
const move = <T>(list: T[], i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}

// Existing project records the case-study rail may reference (temporary
// layer until a Work CMS exists). Labels come from the project data itself.
const refOptions = TECHNOLOGY_WORK_REFS.map((ref) => {
  const card = resolveTechnologyWorkRef(ref)
  return { ref, label: card ? `${card.kind === 'case' ? 'Case study' : 'Project'} · ${card.title}` : ref }
})
const refLabel = (ref: string) => refOptions.find((o) => o.ref === ref)?.label ?? ref

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf dan animasi.',
  'Pita teks berjalan (bagian 02) — otomatis dari judul kemampuan yang tampil.',
  'Platform milik PASTI (OPEN, e-CORPORATE) di bagian 04 — teksnya dikunci dan dipakai juga di homepage.',
  'Bagian “Why PASTI” — visi, standar dan perjalanan perusahaan diambil dari data perusahaan.',
  'Angka/metrik studi kasus — milik masing-masing proyek di menu Work, tampil hanya bersama proyeknya.',
  'Teks kecil antarmuka: label konsol, “Hover to preview”, “Related work”, badge dan penghitung.',
  'Ajakan di footer — diatur di Shared Content → Global CTAs.'
]
// Keeps a collapsed list item open while it has a validation error.
const hasErr = (prefix: string) => (i: number) => Object.keys(errors.value).some((k) => k.startsWith(`${prefix}.${i}.`))
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Halaman Technology"
    crumb="Pages"
    crumb-to="/admin/pages"
    public-path="/technology"
    :lang="lang"
    flag="NUXT_CMS_TECHNOLOGY_PUBLIC_ENABLED"
    :tabs="TECHNOLOGY_TABS"
    :total="6"
    :preview-path="`/admin/preview/technology?lang=${lang}`"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat konten Technology…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Konten Technology gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <AdminEditorActionBar
        v-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/technology?lang=${lang}`"
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
        <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Label kecil di atas judul" :maxlength="LIM.heroEyebrow" required hint="Tampil di penanda hero, di sebelah jumlah kemampuan." :error="err('hero.eyebrow')" />
        <fieldset class="grid gap-4 rounded-lg border border-navy-100 bg-white p-4">
          <legend class="px-1 text-sm font-semibold">Judul besar — tiga baris</legend>
          <p class="text-xs text-navy-500">Tiap kolom = satu baris judul. Baris 3 tampil di atas penanda kuning; titik kuning di akhir ditambahkan otomatis.</p>
          <AdminFormField :id="fieldId('hero.headlineLine1')" v-model="form.hero.headlineLine1" label="Baris 1" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine1')" />
          <AdminFormField :id="fieldId('hero.headlineLine2')" v-model="form.hero.headlineLine2" label="Baris 2" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine2')" />
          <AdminFormField :id="fieldId('hero.headlineLine3')" v-model="form.hero.headlineLine3" label="Baris 3 (di atas penanda kuning)" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine3')" />
        </fieldset>
        <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Paragraf di bawah judul" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Tombol utama — teks" :maxlength="LIM.ctaLabel" required :error="err('hero.primaryCtaLabel')" />
          <AdminFormField :id="fieldId('hero.primaryCtaUrl')" v-model="form.hero.primaryCtaUrl" label="Tombol utama — link" inputmode="url" :maxlength="500" required hint="Contoh: /contact, #bagian, https://… Link ke situs lain terbuka di tab baru." :error="err('hero.primaryCtaUrl')" />
          <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Tombol kedua — teks" :maxlength="LIM.ctaLabel" required hint="Tombol ini selalu menggulir ke bagian Kemampuan." :error="err('hero.secondaryCtaLabel')" />
        </div>
      </div>

      <!-- 03 CAPABILITIES -->
      <div v-show="activeTab === 'capabilities'" class="grid gap-5">
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('capabilities.eyebrow')" v-model="form.capabilities.eyebrow" label="Teks kecil di atas judul" :maxlength="LIM.eyebrow" required :error="err('capabilities.eyebrow')" />
          <AdminFormField :id="fieldId('capabilities.title')" v-model="form.capabilities.title" label="Judul bagian" :maxlength="LIM.sectionTitle" required :error="err('capabilities.title')" />
        </div>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
          Maksimal <strong>{{ LIM.capabilitiesActive }}</strong> kemampuan yang tampil. Judulnya juga dipakai di konsol hero dan pita teks berjalan; nomor (01, 02 …) mengikuti urutan.
        </p>
        <AdminFormRepeater legend="Kemampuan" path="capabilities.items" :items="form.capabilities.items" :max="12" :published-ids="publishedIds" :item-title="(c) => c.title" add-label="Tambah kemampuan" :error="err('capabilities.items')" collapsible :has-error="hasErr('capabilities.items')" @add="addCapability">
          <template #default="{ item, index }">
            <AdminFormField :id="fieldId(`capabilities.items.${index}.title`)" v-model="item.title" label="Judul" :maxlength="LIM.capabilityTitle" required :error="err(`capabilities.items.${index}.title`)" />
            <AdminFormField :id="fieldId(`capabilities.items.${index}.body`)" v-model="item.body" label="Deskripsi" multiline :maxlength="LIM.capabilityBody" required :error="err(`capabilities.items.${index}.body`)" />

            <fieldset class="grid gap-2">
              <legend class="text-sm font-medium">Area utama (label-label kecil)</legend>
              <p v-if="err(`capabilities.items.${index}.keywords`)" class="text-xs font-medium text-red-700" role="alert">{{ err(`capabilities.items.${index}.keywords`) }}</p>
              <div v-for="(_, k) in item.keywords" :key="k" class="flex items-start gap-2">
                <div class="flex-1">
                  <AdminFormField :id="fieldId(`capabilities.items.${index}.keywords.${k}`)" v-model="item.keywords[k]!" :label="`Area ${k + 1}`" :maxlength="LIM.keyword" required :error="err(`capabilities.items.${index}.keywords.${k}`)" />
                </div>
                <button type="button" class="mt-6 rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50" :aria-label="`Hapus area ${k + 1}`" @click="item.keywords.splice(k, 1)">Hapus</button>
              </div>
              <div>
                <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="item.keywords.length >= LIM.keywords" @click="item.keywords.push('')">+ Tambah area</button>
                <span class="ml-2 text-xs text-navy-500">{{ item.keywords.length }}/{{ LIM.keywords }}</span>
              </div>
            </fieldset>

            <fieldset class="grid gap-2">
              <legend class="text-sm font-medium">Proyek terkait (opsional)</legend>
              <p v-if="err(`capabilities.items.${index}.related`)" class="text-xs font-medium text-red-700" role="alert">{{ err(`capabilities.items.${index}.related`) }}</p>
              <div v-for="(r, k) in item.related" :key="k" class="rounded-md border border-navy-100 p-3">
                <div class="grid gap-3 tablet:grid-cols-2">
                  <AdminFormField :id="fieldId(`capabilities.items.${index}.related.${k}.label`)" v-model="r.label" label="Teks" :maxlength="LIM.relatedLabel" required :error="err(`capabilities.items.${index}.related.${k}.label`)" />
                  <AdminFormField :id="fieldId(`capabilities.items.${index}.related.${k}.url`)" v-model="r.url" label="Link (opsional)" inputmode="url" :maxlength="500" hint="Contoh: /work#case-textile — kosong = teks biasa tanpa link." :error="err(`capabilities.items.${index}.related.${k}.url`)" />
                </div>
                <div class="mt-2 flex gap-2 text-xs">
                  <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === 0" @click="move(item.related, k, -1)">↑ Naik</button>
                  <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === item.related.length - 1" @click="move(item.related, k, 1)">↓ Turun</button>
                  <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50" @click="item.related.splice(k, 1)">Hapus</button>
                </div>
              </div>
              <div>
                <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="item.related.length >= LIM.related" @click="item.related.push({ label: '', url: '' })">+ Tambah proyek terkait</button>
                <span class="ml-2 text-xs text-navy-500">{{ item.related.length }}/{{ LIM.related }}</span>
              </div>
            </fieldset>

            <AdminFormImage :id="fieldId(`capabilities.items.${index}.image`)" v-model="item.image" label="Gambar" required hint="Muncul mengikuti kursor (desktop) dan di panel yang terbuka (HP)." :error="err(`capabilities.items.${index}.image`)" />
            <AdminFormField :id="fieldId(`capabilities.items.${index}.imageAlt`)" v-model="item.imageAlt" label="Deskripsi gambar untuk pembaca layar (opsional)" :maxlength="160" hint="Kosong = gambar dianggap dekorasi (judulnya sudah ada di sebelahnya)." :error="err(`capabilities.items.${index}.imageAlt`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 05 CASE STUDIES -->
      <div v-show="activeTab === 'work'" class="grid gap-5">
        <div class="grid gap-5 tablet:grid-cols-3">
          <AdminFormField :id="fieldId('work.sectionLabel')" v-model="form.work.sectionLabel" label="Label bagian" :maxlength="LIM.eyebrow" required :error="err('work.sectionLabel')" />
          <AdminFormField :id="fieldId('work.eyebrow')" v-model="form.work.eyebrow" label="Teks kecil di atas judul" :maxlength="LIM.eyebrow" required :error="err('work.eyebrow')" />
          <AdminFormField :id="fieldId('work.title')" v-model="form.work.title" label="Judul bagian" :maxlength="LIM.sectionTitle" required :error="err('work.title')" />
        </div>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
          Pilih proyek yang sudah ada. Judul, gambar dan metriknya diambil dari data proyek di menu <strong>Work</strong> — tidak diubah di sini.
        </p>
        <AdminFormRepeater legend="Studi kasus" path="work.items" :items="form.work.items" :max="TECHNOLOGY_WORK_REFS.length" :published-ids="publishedIds" :item-title="(w) => refLabel(w.ref)" add-label="Tambah proyek" :error="err('work.items')" @add="addWorkItem">
          <template #default="{ item, index }">
            <div>
              <label :for="fieldId(`work.items.${index}.ref`)" class="text-sm font-medium">Proyek<span class="text-red-700" aria-hidden="true"> *</span></label>
              <select :id="fieldId(`work.items.${index}.ref`)" v-model="item.ref" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`work.items.${index}.ref`)">
                <option v-for="o in refOptions" :key="o.ref" :value="o.ref">{{ o.label }}</option>
              </select>
              <p v-if="err(`work.items.${index}.ref`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`work.items.${index}.ref`) }}</p>
            </div>
          </template>
        </AdminFormRepeater>
      </div>

      <!-- SEO -->
      <AdminSeoFields v-show="activeTab === 'seo'" v-model="form.seo" :err="err" />
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
