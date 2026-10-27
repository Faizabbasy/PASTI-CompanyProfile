<script setup lang="ts">
import { ABOUT_LIMITS as LIM, VALUE_ICONS, type AboutAdminState } from '#shared/utils/aboutSchema'

// About singleton editor (Step 2), on the shared editor frame. Content only —
// layout, order, typography, colour and motion stay in code. Fields the
// public page doesn't use yet sit in collapsed "Kolom tambahan" boxes.
definePageMeta({ layout: 'admin' })
useHead({ title: 'About · Pages' })

// Bilingual: which language record is being edited (?lang=, default Indonesian).
const lang = useEditorLang()
const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errors, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<AboutAdminState, AboutForm>({
  name: 'About',
  endpoint: '/api/admin/pages/about',
  asyncKey: 'admin-about',
  lang,
  tabs: ABOUT_TABS,
  toForm: toAboutForm,
  toPayload: toAboutPayload,
  validate: validateAboutForm
})

// ---- repeaters ------------------------------------------------------------
const nextOrder = (list: { sortOrder: number }[]) => list.length + 1
function addValue() {
  form.value!.values.push({ _key: newKey(), title: '', description: '', iconOrVisual: 'none', sortOrder: nextOrder(form.value!.values), active: true })
}
function addMilestone() {
  form.value!.milestones.push({ _key: newKey(), yearOrPeriod: '', title: '', description: '', optionalMedia: '', optionalMediaAlt: '', sortOrder: nextOrder(form.value!.milestones), active: true })
}
function addProof() {
  form.value!.proof.push({ _key: newKey(), value: '', label: '', supportingText: '', sortOrder: nextOrder(form.value!.proof), active: true })
}
function addLeader() {
  form.value!.leadership.push({ _key: newKey(), name: '', role: '', shortBio: '', portrait: '', portraitAlt: '', sortOrder: nextOrder(form.value!.leadership), active: true })
}
function addMissionPoint() {
  form.value!.mission.points.push({ _key: newKey(), text: '', sortOrder: nextOrder(form.value!.mission.points), active: true })
}

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf dan animasi.',
  'Judul animasi hero “We turn complexity into certainty.”.',
  'Fakta perusahaan dan lima langkah cara kerja di bagian Cerita.',
  'Kutipan dan sambutan pemimpin — kata-kata orang itu sendiri.',
  'Bagian “How we work” (lima pilar) dan susunan diagram Technology × Creative.',
  'Logo klien — diatur di Shared Content → Clients.',
  'Ajakan di footer — diatur di Shared Content → Global CTAs.'
]
// Keeps a collapsed list item open while it has a validation error.
const hasErr = (prefix: string) => (i: number) => Object.keys(errors.value).some((k) => k.startsWith(`${prefix}.${i}.`))
// Opens a "Kolom tambahan" box while one of its fields has an error.
const anyErr = (...prefixes: string[]) => Object.keys(errors.value).some((k) => prefixes.some((p) => k === p || k.startsWith(`${p}.`)))
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Halaman About"
    crumb="Pages"
    crumb-to="/admin/pages"
    public-path="/about"
    :lang="lang"
    flag="NUXT_CMS_ABOUT_PUBLIC_ENABLED"
    :tabs="ABOUT_TABS"
    :preview-path="`/admin/preview/about?lang=${lang}`"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat konten About…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Konten About gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <AdminEditorActionBar
        v-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/about?lang=${lang}`"
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
        <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Label kecil di atas judul" :maxlength="LIM.heroEyebrow" :error="err('hero.eyebrow')" />
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Tombol utama — teks" :maxlength="LIM.ctaLabel" :error="err('hero.primaryCtaLabel')" />
          <AdminFormField :id="fieldId('hero.primaryCtaUrl')" v-model="form.hero.primaryCtaUrl" label="Tombol utama — link" inputmode="url" :maxlength="500" hint="Contoh: /contact, #bagian, https://… Teks dan link harus diisi dua-duanya." :error="err('hero.primaryCtaUrl')" />
          <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Tombol kedua — teks" :maxlength="LIM.ctaLabel" hint="Tombol ini selalu menggulir ke bagian cerita perusahaan." :error="err('hero.secondaryCtaLabel')" />
        </div>
        <details class="rounded-lg border border-dashed border-navy-200 bg-white px-4 py-3" :open="anyErr('hero.headline', 'hero.supportingCopy', 'hero.secondaryCtaUrl', 'hero.heroMedia')">
          <summary class="cursor-pointer text-sm font-semibold text-navy-600">Kolom tambahan — belum tampil di website</summary>
          <div class="mt-4 grid gap-5">
            <AdminFormField :id="fieldId('hero.headline')" v-model="form.hero.headline" label="Judul (hanya catatan)" :maxlength="140" required hint="Judul animasi di website (“We turn complexity into certainty.”) dikunci di kode." :error="err('hero.headline')" />
            <AdminFormField :id="fieldId('hero.supportingCopy')" v-model="form.hero.supportingCopy" label="Paragraf pendukung" multiline :maxlength="400" :error="err('hero.supportingCopy')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaUrl')" v-model="form.hero.secondaryCtaUrl" label="Tombol kedua — link" inputmode="url" :maxlength="500" hint="Tidak dipakai: tombol kedua selalu menggulir ke cerita perusahaan." :error="err('hero.secondaryCtaUrl')" />
            <AdminFormImage :id="fieldId('hero.heroMedia')" v-model="form.hero.heroMedia" label="Gambar hero" :error="err('hero.heroMedia')" />
            <AdminFormField :id="fieldId('hero.heroMediaAlt')" v-model="form.hero.heroMediaAlt" label="Deskripsi gambar hero" :maxlength="160" :error="err('hero.heroMediaAlt')" />
          </div>
        </details>
      </div>

      <!-- 02 STORY -->
      <div v-show="activeTab === 'story'" class="grid gap-5">
        <fieldset class="grid gap-4">
          <legend class="text-sm font-semibold">Paragraf cerita</legend>
          <p class="text-xs text-navy-500">Paragraf 1 tampil besar dan muncul kata demi kata saat di-scroll. Paragraf berikutnya tampil di samping fakta perusahaan.</p>
          <p v-if="err('story.paragraphs')" class="text-xs font-medium text-red-700" role="alert">{{ err('story.paragraphs') }}</p>
          <div v-for="(_, i) in form.story.paragraphs" :key="i" class="rounded-lg border border-navy-100 bg-white p-4">
            <AdminFormField :id="fieldId(`story.paragraphs.${i}`)" v-model="form.story.paragraphs[i]!" :label="i === 0 ? 'Paragraf 1 — pernyataan pembuka (tampil besar)' : `Paragraf ${i + 1}`" multiline :rows="4" :maxlength="i === 0 ? LIM.storyIntro : LIM.storyParagraph" required :error="err(`story.paragraphs.${i}`)" />
            <div class="mt-2 flex gap-2 text-xs">
              <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="i === 0" @click="form.story.paragraphs.splice(i - 1, 0, form.story.paragraphs.splice(i, 1)[0]!)">↑ Naik</button>
              <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="i === form.story.paragraphs.length - 1" @click="form.story.paragraphs.splice(i + 1, 0, form.story.paragraphs.splice(i, 1)[0]!)">↓ Turun</button>
              <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40" :disabled="form.story.paragraphs.length <= 1" @click="form.story.paragraphs.splice(i, 1)">Hapus</button>
            </div>
          </div>
          <div>
            <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="form.story.paragraphs.length >= LIM.storyParagraphs" @click="form.story.paragraphs.push('')">+ Tambah paragraf</button>
            <span class="ml-2 text-xs text-navy-500">{{ form.story.paragraphs.length }}/{{ LIM.storyParagraphs }}</span>
          </div>
        </fieldset>
        <details class="rounded-lg border border-dashed border-navy-200 bg-white px-4 py-3" :open="anyErr('story.sectionLabel', 'story.title', 'story.supportingMedia')">
          <summary class="cursor-pointer text-sm font-semibold text-navy-600">Kolom tambahan — belum tampil di website</summary>
          <div class="mt-4 grid gap-5">
            <AdminFormField :id="fieldId('story.sectionLabel')" v-model="form.story.sectionLabel" label="Label bagian" :maxlength="60" :error="err('story.sectionLabel')" />
            <AdminFormField :id="fieldId('story.title')" v-model="form.story.title" label="Judul (opsional)" :maxlength="140" :error="err('story.title')" />
            <AdminFormImage :id="fieldId('story.supportingMedia')" v-model="form.story.supportingMedia" label="Gambar pendukung" :error="err('story.supportingMedia')" />
            <AdminFormField :id="fieldId('story.supportingMediaAlt')" v-model="form.story.supportingMediaAlt" label="Deskripsi gambar pendukung" :maxlength="160" :error="err('story.supportingMediaAlt')" />
          </div>
        </details>
      </div>

      <!-- 03 VISION & MISSION -->
      <div v-show="activeTab === 'vm'" class="grid gap-8">
        <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-4">
          <legend class="px-1 text-base font-semibold">Visi</legend>
          <AdminFormField :id="fieldId('vision.title')" v-model="form.vision.title" label="Label" hint="Contoh: Vision" :maxlength="LIM.vmTitle" required :error="err('vision.title')" />
          <AdminFormField :id="fieldId('vision.description')" v-model="form.vision.description" label="Kalimat visi (tampil besar)" multiline :maxlength="LIM.vision" required :error="err('vision.description')" />
        </fieldset>
        <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-4">
          <legend class="px-1 text-base font-semibold">Misi</legend>
          <AdminFormField :id="fieldId('mission.title')" v-model="form.mission.title" label="Label" hint="Contoh: Mission" :maxlength="LIM.vmTitle" required :error="err('mission.title')" />
          <AdminFormField :id="fieldId('mission.description')" v-model="form.mission.description" label="Paragraf misi" multiline :maxlength="LIM.mission" required :error="err('mission.description')" />
        </fieldset>
        <details class="rounded-lg border border-dashed border-navy-200 bg-white px-4 py-3" :open="anyErr('mission.points')">
          <summary class="cursor-pointer text-sm font-semibold text-navy-600">Poin-poin misi — belum tampil di website</summary>
          <div class="mt-4">
            <AdminFormRepeater legend="Poin misi" path="mission.points" :items="form.mission.points" :max="10" :published-ids="publishedIds" :item-title="(p) => p.text" add-label="Tambah poin misi" :error="err('mission.points')" @add="addMissionPoint">
              <template #default="{ item, index }">
                <AdminFormField :id="fieldId(`mission.points.${index}.text`)" v-model="item.text" label="Poin" :maxlength="240" required :error="err(`mission.points.${index}.text`)" />
              </template>
            </AdminFormRepeater>
          </div>
        </details>
      </div>

      <!-- 04 VALUES -->
      <div v-show="activeTab === 'values'" class="grid gap-5">
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Maksimal <strong>{{ LIM.valuesActive }}</strong> standar yang tampil. Kalau semua disembunyikan, website memakai standar bawaan.</p>
        <AdminFormRepeater legend="Standar" path="values" :items="form.values" :max="12" :published-ids="publishedIds" :item-title="(v) => v.title" add-label="Tambah standar" :error="err('values')" collapsible :has-error="hasErr('values')" @add="addValue">
          <template #default="{ item, index }">
            <AdminFormField :id="fieldId(`values.${index}.title`)" v-model="item.title" label="Nama standar" :maxlength="LIM.valueTitle" required :error="err(`values.${index}.title`)" />
            <AdminFormField :id="fieldId(`values.${index}.description`)" v-model="item.description" label="Penjelasan" multiline :maxlength="LIM.valueBody" :error="err(`values.${index}.description`)" />
            <div>
              <label :for="fieldId(`values.${index}.iconOrVisual`)" class="text-sm font-medium">Ikon (opsional)</label>
              <select :id="fieldId(`values.${index}.iconOrVisual`)" v-model="item.iconOrVisual" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm tablet:w-64">
                <option v-for="icon in VALUE_ICONS" :key="icon" :value="icon">{{ icon }}</option>
              </select>
              <p class="mt-1 text-xs text-navy-500">Belum tampil di website.</p>
            </div>
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 05 MILESTONES -->
      <div v-show="activeTab === 'milestones'" class="grid gap-5">
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Garis waktu memuat maksimal <strong>{{ LIM.milestonesActive }}</strong> tahun yang tampil (satu baris). Kalau semua disembunyikan, website memakai perjalanan bawaan.</p>
        <AdminFormRepeater legend="Perjalanan" path="milestones" :items="form.milestones" :max="30" :published-ids="publishedIds" :item-title="(m) => [m.yearOrPeriod, m.title].filter(Boolean).join(' — ')" add-label="Tambah tahun" :error="err('milestones')" collapsible :has-error="hasErr('milestones')" @add="addMilestone">
          <template #default="{ item, index }">
            <div class="grid gap-4 tablet:grid-cols-[10rem_1fr]">
              <AdminFormField :id="fieldId(`milestones.${index}.yearOrPeriod`)" v-model="item.yearOrPeriod" label="Tahun / periode" :maxlength="LIM.milestoneYear" required :error="err(`milestones.${index}.yearOrPeriod`)" />
              <AdminFormField :id="fieldId(`milestones.${index}.title`)" v-model="item.title" label="Kejadian" :maxlength="120" required :error="err(`milestones.${index}.title`)" />
            </div>
            <details class="rounded-md border border-dashed border-navy-200 px-3 py-2" :open="anyErr(`milestones.${index}.description`, `milestones.${index}.optionalMedia`)">
              <summary class="cursor-pointer text-xs font-semibold text-navy-600">Kolom tambahan — belum tampil di website</summary>
              <div class="mt-3 grid gap-4">
                <AdminFormField :id="fieldId(`milestones.${index}.description`)" v-model="item.description" label="Penjelasan" multiline :maxlength="600" :error="err(`milestones.${index}.description`)" />
                <AdminFormImage :id="fieldId(`milestones.${index}.optionalMedia`)" v-model="item.optionalMedia" label="Gambar (opsional)" :error="err(`milestones.${index}.optionalMedia`)" />
                <AdminFormField :id="fieldId(`milestones.${index}.optionalMediaAlt`)" v-model="item.optionalMediaAlt" label="Deskripsi gambar" :maxlength="160" :error="err(`milestones.${index}.optionalMediaAlt`)" />
              </div>
            </details>
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 06 LEADERSHIP -->
      <div v-show="activeTab === 'leadership'" class="grid gap-5">
        <p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Website hanya memakai <strong>orang pertama</strong> di daftar, dan hanya jika namanya sama persis dengan pemimpin yang sekarang tampil — karena kutipan dan sambutannya adalah kata-kata orang itu sendiri (dikunci di kode). Yang ikut berubah: jabatan dan foto.</p>
        <AdminFormRepeater legend="Kepemimpinan" path="leadership" :items="form.leadership" :max="12" :published-ids="publishedIds" :item-title="(p) => [p.name, p.role].filter(Boolean).join(' · ')" add-label="Tambah orang" :error="err('leadership')" collapsible :has-error="hasErr('leadership')" @add="addLeader">
          <template #default="{ item, index }">
            <div class="grid gap-4 tablet:grid-cols-2">
              <AdminFormField :id="fieldId(`leadership.${index}.name`)" v-model="item.name" label="Nama" :maxlength="80" required :error="err(`leadership.${index}.name`)" />
              <AdminFormField :id="fieldId(`leadership.${index}.role`)" v-model="item.role" label="Jabatan" :maxlength="LIM.leaderRole" required :error="err(`leadership.${index}.role`)" />
            </div>
            <AdminFormImage :id="fieldId(`leadership.${index}.portrait`)" v-model="item.portrait" label="Foto" :error="err(`leadership.${index}.portrait`)" />
            <AdminFormField :id="fieldId(`leadership.${index}.portraitAlt`)" v-model="item.portraitAlt" label="Deskripsi foto untuk pembaca layar" :maxlength="160" :error="err(`leadership.${index}.portraitAlt`)" />
            <AdminFormField :id="fieldId(`leadership.${index}.shortBio`)" v-model="item.shortBio" label="Bio singkat" multiline :maxlength="800" hint="Belum tampil di website." :error="err(`leadership.${index}.shortBio`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 08 PROOF -->
      <div v-show="activeTab === 'proof'" class="grid gap-5">
        <p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Angka ini hanya tampil kalau flag server <code>NUXT_CMS_ABOUT_PUBLIC_PROOF_ENABLED</code> juga menyala. Isi hanya angka yang sudah benar dan disetujui.</p>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Maksimal <strong>{{ LIM.proofActive }}</strong> angka yang tampil. Format angka: contoh <code>70+</code>, <code>4.3</code>, <code>100%</code> — kalau satu saja formatnya tidak cocok, website memakai angka bawaan.</p>
        <AdminFormRepeater legend="Angka bukti" path="proof" :items="form.proof" :max="12" :published-ids="publishedIds" :item-title="(p) => [p.value, p.label].filter(Boolean).join(' ')" add-label="Tambah angka" :error="err('proof')" @add="addProof">
          <template #default="{ item, index }">
            <div class="grid gap-4 tablet:grid-cols-[10rem_1fr]">
              <AdminFormField :id="fieldId(`proof.${index}.value`)" v-model="item.value" label="Angka" :maxlength="6" hint="Contoh: 70+, 4.3, 100%" required :error="err(`proof.${index}.value`)" />
              <AdminFormField :id="fieldId(`proof.${index}.label`)" v-model="item.label" label="Keterangan" :maxlength="LIM.proofLabel" required :error="err(`proof.${index}.label`)" />
            </div>
            <AdminFormField :id="fieldId(`proof.${index}.supportingText`)" v-model="item.supportingText" label="Teks pendukung" :maxlength="240" hint="Belum tampil di website." :error="err(`proof.${index}.supportingText`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- CTA (not public) -->
      <div v-show="activeTab === 'cta'" class="grid gap-5">
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Halaman About tidak punya ajakan sendiri — yang tampil adalah ajakan di footer (diatur di <strong>Shared Content → Global CTAs</strong>). Kolom di bawah disimpan tapi <strong>tidak tampil</strong> di website.</p>
        <AdminFormField :id="fieldId('cta.eyebrow')" v-model="form.cta.eyebrow" label="Teks kecil (opsional)" :maxlength="60" :error="err('cta.eyebrow')" />
        <AdminFormField :id="fieldId('cta.title')" v-model="form.cta.title" label="Judul (opsional)" :maxlength="140" :error="err('cta.title')" />
        <AdminFormField :id="fieldId('cta.supportingCopy')" v-model="form.cta.supportingCopy" label="Paragraf" multiline :maxlength="400" :error="err('cta.supportingCopy')" />
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('cta.primaryCtaLabel')" v-model="form.cta.primaryCtaLabel" label="Tombol utama — teks" :maxlength="40" :error="err('cta.primaryCtaLabel')" />
          <AdminFormField :id="fieldId('cta.primaryCtaUrl')" v-model="form.cta.primaryCtaUrl" label="Tombol utama — link" inputmode="url" :maxlength="500" hint="Contoh: /contact, #bagian, https://…" :error="err('cta.primaryCtaUrl')" />
          <AdminFormField :id="fieldId('cta.secondaryCtaLabel')" v-model="form.cta.secondaryCtaLabel" label="Tombol kedua — teks" :maxlength="40" :error="err('cta.secondaryCtaLabel')" />
          <AdminFormField :id="fieldId('cta.secondaryCtaUrl')" v-model="form.cta.secondaryCtaUrl" label="Tombol kedua — link" inputmode="url" :maxlength="500" :error="err('cta.secondaryCtaUrl')" />
        </div>
      </div>

      <!-- SEO -->
      <div v-show="activeTab === 'seo'" class="grid gap-5">
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">SEO halaman About saat ini masih diatur di kode; isian ini disimpan untuk tahap berikutnya.</p>
        <AdminSeoFields v-model="form.seo" :err="err" />
      </div>
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
