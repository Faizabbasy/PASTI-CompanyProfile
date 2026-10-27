<script setup lang="ts">
import {
  COMPANY_MILESTONE_REFS,
  COMPANY_STANDARD_REFS,
  CREATIVE_LIMITS as LIM,
  CREATIVE_TESTIMONIAL_REFS,
  CREATIVE_WORK_REFS,
  type CreativeAdminState
} from '#shared/utils/creativeSchema'

// Creative singleton editor. Content only — layout, section order,
// typography, colour and motion stay in code. Creative-only content is
// edited here; shared records (projects, testimonials, company standards and
// milestones) are only picked. No add/duplicate/delete for the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Creative · Pages' })

// Bilingual: which language record is being edited (?lang=, default Indonesian).
const lang = useEditorLang()
const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errors, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<CreativeAdminState, CreativeForm>({
  name: 'Creative',
  endpoint: '/api/admin/pages/creative',
  asyncKey: 'admin-creative',
  lang,
  tabs: CREATIVE_TABS,
  toForm: toCreativeForm,
  toPayload: toCreativePayload,
  validate: validateCreativeForm
})

// ---- repeaters ------------------------------------------------------------
const nextOrder = (list: { sortOrder: number }[]) => list.length + 1
function addService() {
  const items = form.value!.services.items
  items.push({ _key: newKey(), title: '', body: '', keywords: [], related: [], image: '', imageWidth: 1448, imageHeight: 1086, imageAlt: '', sortOrder: nextOrder(items), active: true })
}
function addVisual() {
  const items = form.value!.wall.visuals
  items.push({ _key: newKey(), image: '', label: '', sortOrder: nextOrder(items), active: true })
}
function addUiux() {
  const items = form.value!.work.uiux.items
  const used = new Set(items.map((i) => i.ref))
  const ref = CREATIVE_WORK_REFS.find((r) => !used.has(r))
  if (ref) items.push({ _key: newKey(), ref, sortOrder: nextOrder(items), active: true })
}
const move = <T>(list: T[], i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}

// Shared records the page may reference (labels come from the records).
const workOptions = CREATIVE_WORK_REFS.map((ref) => {
  const p = resolveCreativeUiuxRef(ref)
  return { value: ref, label: p ? `${p.title} · ${p.category}` : ref }
})
const testimonialOptions = CREATIVE_TESTIMONIAL_REFS.map((ref) => {
  const t = resolveCreativeTestimonialRef(ref)
  return { value: ref, label: t ? `${t.name} — ${t.role}` : ref }
})
const standardOptions = COMPANY_STANDARD_REFS.map((ref) => ({ value: ref, label: resolveCompanyStandardRef(ref)?.name ?? ref }))
const milestoneOptions = COMPANY_MILESTONE_REFS.map((ref) => {
  const m = resolveCompanyMilestoneRef(ref)
  return { value: ref, label: m ? `${m.year} — ${m.text}` : ref }
})
const workLabel = (ref: string) => workOptions.find((o) => o.value === ref)?.label ?? ref
const company = useCompany()

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf dan animasi.',
  'Pita berjalan (bagian 02) — otomatis dari judul layanan yang tampil.',
  'Data proyek, testimoni, standar dan perjalanan perusahaan — dipakai juga di halaman lain; di sini hanya dipilih, diubah di sumbernya.',
  'Sub-judul studi kasus: “Challenge”, “Game plan”, “Acquisition funnel”, “Marketing playbook”.',
  'Teks kecil antarmuka: “Drag to explore”, “Related work”, “View in Work”, badge, penghitung dan label kursor.',
  'Ilustrasi sementara — hanya muncul kalau layanan belum punya gambar.',
  'Ajakan di footer — diatur di Shared Content → Global CTAs.'
]
// Keeps a collapsed list item open while it has a validation error.
const hasErr = (prefix: string) => (i: number) => Object.keys(errors.value).some((k) => k.startsWith(`${prefix}.${i}.`))
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Halaman Creative"
    crumb="Pages"
    crumb-to="/admin/pages"
    public-path="/creative"
    :lang="lang"
    flag="NUXT_CMS_CREATIVE_PUBLIC_ENABLED"
    :tabs="CREATIVE_TABS"
    :preview-path="`/admin/preview/creative?lang=${lang}`"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat konten Creative…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Konten Creative gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <AdminEditorActionBar
        v-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/creative?lang=${lang}`"
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
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Label kecil di atas judul" :maxlength="LIM.heroEyebrow" required hint="Tampil sebagai “<label> studio” di penanda hero." :error="err('hero.eyebrow')" />
          <AdminFormField :id="fieldId('hero.markerMeta')" v-model="form.hero.markerMeta" label="Catatan di sebelah penanda (opsional)" :maxlength="LIM.markerMeta" hint="Hanya tampil di tablet dan desktop." :error="err('hero.markerMeta')" />
        </div>
        <fieldset class="grid gap-4 rounded-lg border border-navy-100 bg-white p-4">
          <legend class="px-1 text-sm font-semibold">Judul besar — dua baris</legend>
          <p class="text-xs text-navy-500">Tiap kata muncul dengan animasi. Kata terakhir baris 2 tampil bergaris tepi (outline) dan titik di akhir ditambahkan otomatis.</p>
          <AdminFormField :id="fieldId('hero.headlineLine1')" v-model="form.hero.headlineLine1" label="Baris 1" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine1')" />
          <AdminFormField :id="fieldId('hero.headlineLine2')" v-model="form.hero.headlineLine2" label="Baris 2 (kata terakhir bergaris tepi)" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine2')" />
        </fieldset>
        <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Paragraf di bawah judul" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Tombol utama — teks" :maxlength="LIM.ctaLabel" required :error="err('hero.primaryCtaLabel')" />
          <AdminFormField :id="fieldId('hero.primaryCtaUrl')" v-model="form.hero.primaryCtaUrl" label="Tombol utama — link" inputmode="url" :maxlength="500" required hint="Contoh: /contact, #bagian, https://… Link ke situs lain terbuka di tab baru." :error="err('hero.primaryCtaUrl')" />
          <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Tombol kedua — teks" :maxlength="LIM.ctaLabel" required hint="Tombol ini selalu menggulir ke bagian Layanan." :error="err('hero.secondaryCtaLabel')" />
        </div>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Kipas tiga gambar dan jejak gambar di hero memakai gambar dari <strong>Studio Wall</strong> (tiga gambar pertama = kipas).</p>
      </div>

      <!-- 03 SERVICES -->
      <div v-show="activeTab === 'services'" class="grid gap-5">
        <div class="grid gap-5 tablet:grid-cols-3">
          <AdminFormField :id="fieldId('services.sectionLabel')" v-model="form.services.sectionLabel" label="Label bagian" :maxlength="LIM.label" required :error="err('services.sectionLabel')" />
          <AdminFormField :id="fieldId('services.eyebrow')" v-model="form.services.eyebrow" label="Teks kecil di atas judul" :maxlength="LIM.label" required :error="err('services.eyebrow')" />
          <AdminFormField :id="fieldId('services.title')" v-model="form.services.title" label="Judul bagian" :maxlength="LIM.servicesTitle" required :error="err('services.title')" />
        </div>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
          Maksimal <strong>{{ LIM.servicesActive }}</strong> layanan yang tampil. Judulnya juga berjalan di pita (bagian 02); nomor (01, 02 …) mengikuti urutan.
        </p>
        <AdminFormRepeater legend="Layanan" path="services.items" :items="form.services.items" :max="12" :published-ids="publishedIds" :item-title="(s) => s.title" add-label="Tambah layanan" :error="err('services.items')" collapsible :has-error="hasErr('services.items')" @add="addService">
          <template #default="{ item, index }">
            <AdminFormField :id="fieldId(`services.items.${index}.title`)" v-model="item.title" label="Judul" :maxlength="LIM.serviceTitle" required :error="err(`services.items.${index}.title`)" />
            <AdminFormField :id="fieldId(`services.items.${index}.body`)" v-model="item.body" label="Deskripsi" multiline :maxlength="LIM.serviceBody" required :error="err(`services.items.${index}.body`)" />
            <AdminFormStringList legend="Area utama (label-label kecil)" :path="`services.items.${index}.keywords`" :items="item.keywords" :max="LIM.keywords" :maxlength="LIM.keyword" item-label="Area" add-label="Tambah area" :err="err" />
            <fieldset class="grid gap-2">
              <legend class="text-sm font-medium">Proyek terkait (opsional)</legend>
              <p v-if="err(`services.items.${index}.related`)" class="text-xs font-medium text-red-700" role="alert">{{ err(`services.items.${index}.related`) }}</p>
              <div v-for="(r, k) in item.related" :key="k" class="rounded-md border border-navy-100 p-3">
                <div class="grid gap-3 tablet:grid-cols-2">
                  <AdminFormField :id="fieldId(`services.items.${index}.related.${k}.label`)" v-model="r.label" label="Teks" :maxlength="LIM.relatedLabel" required :error="err(`services.items.${index}.related.${k}.label`)" />
                  <AdminFormField :id="fieldId(`services.items.${index}.related.${k}.url`)" v-model="r.url" label="Link" inputmode="url" :maxlength="500" hint="Contoh: /work#work-05 atau #creative-work" :error="err(`services.items.${index}.related.${k}.url`)" />
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
            <AdminFormImage :id="fieldId(`services.items.${index}.image`)" v-model="item.image" label="Gambar" required hint="Tampil utuh sesuai rasionya. Lebar dan tinggi terisi otomatis." :error="err(`services.items.${index}.image`)" @dimensions="(s) => { item.imageWidth = s.width; item.imageHeight = s.height }" />
            <div class="grid gap-4 tablet:grid-cols-[7rem_7rem]">
              <div>
                <label :for="fieldId(`services.items.${index}.imageWidth`)" class="text-sm font-medium">Lebar (px)</label>
                <input :id="fieldId(`services.items.${index}.imageWidth`)" v-model.number="item.imageWidth" type="number" min="200" max="6000" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                <p v-if="err(`services.items.${index}.imageWidth`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`services.items.${index}.imageWidth`) }}</p>
              </div>
              <div>
                <label :for="fieldId(`services.items.${index}.imageHeight`)" class="text-sm font-medium">Tinggi (px)</label>
                <input :id="fieldId(`services.items.${index}.imageHeight`)" v-model.number="item.imageHeight" type="number" min="200" max="6000" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                <p v-if="err(`services.items.${index}.imageHeight`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`services.items.${index}.imageHeight`) }}</p>
              </div>
            </div>
            <AdminFormField :id="fieldId(`services.items.${index}.imageAlt`)" v-model="item.imageAlt" label="Deskripsi gambar untuk pembaca layar (opsional)" :maxlength="160" hint="Kosong = “<judul> — PASTI”." :error="err(`services.items.${index}.imageAlt`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 04 STUDIO WALL -->
      <div v-show="activeTab === 'wall'" class="grid gap-5">
        <div class="grid gap-5 tablet:grid-cols-3">
          <AdminFormField :id="fieldId('wall.sectionLabel')" v-model="form.wall.sectionLabel" label="Label bagian" :maxlength="LIM.label" required :error="err('wall.sectionLabel')" />
          <AdminFormField :id="fieldId('wall.titleLead')" v-model="form.wall.titleLead" label="Judul" :maxlength="LIM.wallLead" required :error="err('wall.titleLead')" />
          <AdminFormField :id="fieldId('wall.titleAccent')" v-model="form.wall.titleAccent" label="Akhir judul (kuning)" :maxlength="LIM.wallAccent" required hint="Titik di akhir ditambahkan otomatis." :error="err('wall.titleAccent')" />
        </div>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
          Perlu <strong>{{ LIM.visualsMin }}–{{ LIM.visualsActive }}</strong> gambar yang tampil. Gambar-gambar ini mengisi papan yang bisa digeser dan jejak gambar di hero; tiga yang pertama jadi kipas di hero. Gambar dipotong ke rasio 4:5.
        </p>
        <AdminFormRepeater legend="Gambar Studio Wall" path="wall.visuals" :items="form.wall.visuals" :max="24" :published-ids="publishedIds" :item-title="(v) => v.label" add-label="Tambah gambar" :error="err('wall.visuals')" collapsible :has-error="hasErr('wall.visuals')" @add="addVisual">
          <template #summary="{ item }">
            <span class="flex h-10 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-navy-100 bg-white">
              <img v-if="item.image" :src="item.image" alt="" class="h-full w-full object-cover">
            </span>
          </template>
          <template #default="{ item, index }">
            <AdminFormImage :id="fieldId(`wall.visuals.${index}.image`)" v-model="item.image" label="Gambar" aspect="4/5" required :error="err(`wall.visuals.${index}.image`)" />
            <AdminFormField :id="fieldId(`wall.visuals.${index}.label`)" v-model="item.label" label="Keterangan gambar" :maxlength="LIM.visualLabel" required hint="Juga dibaca pembaca layar." :error="err(`wall.visuals.${index}.label`)" />
          </template>
        </AdminFormRepeater>
      </div>

      <!-- 05 SELECTED WORK -->
      <div v-show="activeTab === 'work'" class="grid gap-8">
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('work.sectionLabel')" v-model="form.work.sectionLabel" label="Label bagian" :maxlength="LIM.label" required :error="err('work.sectionLabel')" />
          <AdminFormField :id="fieldId('work.sectionMeta')" v-model="form.work.sectionMeta" label="Catatan bagian (opsional)" :maxlength="LIM.label" :error="err('work.sectionMeta')" />
          <AdminFormField :id="fieldId('work.eyebrow')" v-model="form.work.eyebrow" label="Teks kecil di atas judul" :maxlength="LIM.label" required :error="err('work.eyebrow')" />
          <AdminFormField :id="fieldId('work.title')" v-model="form.work.title" label="Judul bagian" :maxlength="LIM.sectionTitle" required :error="err('work.title')" />
        </div>

        <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-5">
          <legend class="px-1 text-base font-semibold">Studi kasus utama</legend>
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('work.feature.title')" v-model="form.work.feature.title" label="Judul" :maxlength="LIM.caseTitle" required :error="err('work.feature.title')" />
            <AdminFormField :id="fieldId('work.feature.category')" v-model="form.work.feature.category" label="Kategori" :maxlength="LIM.caseCategory" required :error="err('work.feature.category')" />
          </div>
          <div>
            <label :for="fieldId('work.feature.imageRef')" class="text-sm font-medium">Gambar — diambil dari proyek</label>
            <select :id="fieldId('work.feature.imageRef')" v-model="form.work.feature.imageRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
              <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <AdminFormStringList legend="Tantangan (Challenge)" path="work.feature.challenge" :items="form.work.feature.challenge" :min="1" :max="LIM.challenge" :maxlength="LIM.challengeItem" item-label="Poin" add-label="Tambah poin" :err="err" />
          <AdminFormField :id="fieldId('work.feature.gamePlan')" v-model="form.work.feature.gamePlan" label="Rencana (Game plan)" multiline :maxlength="LIM.gamePlan" required :error="err('work.feature.gamePlan')" />
          <fieldset class="grid gap-3">
            <legend class="text-sm font-medium">Acquisition funnel — tepat 4 tahap (tahap terakhir disorot)</legend>
            <p v-if="err('work.feature.funnel')" class="text-xs font-medium text-red-700" role="alert">{{ err('work.feature.funnel') }}</p>
            <div v-for="(s, k) in form.work.feature.funnel" :key="k" class="grid gap-3 rounded-md border border-navy-100 p-3 tablet:grid-cols-[12rem_1fr]">
              <AdminFormField :id="fieldId(`work.feature.funnel.${k}.stage`)" v-model="s.stage" :label="`Tahap ${k + 1}`" :maxlength="LIM.funnelStage" required :error="err(`work.feature.funnel.${k}.stage`) || err(`work.feature.funnel.${k}`)" />
              <AdminFormField :id="fieldId(`work.feature.funnel.${k}.text`)" v-model="s.text" label="Teks" :maxlength="LIM.funnelText" required :error="err(`work.feature.funnel.${k}.text`)" />
            </div>
          </fieldset>
          <AdminFormStringList legend="Marketing playbook" path="work.feature.playbook" :items="form.work.feature.playbook" :min="1" :max="LIM.playbook" :maxlength="LIM.playbookItem" item-label="Poin" add-label="Tambah poin" :err="err" />
        </fieldset>

        <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-5">
          <legend class="px-1 text-base font-semibold">Kampanye + testimoni</legend>
          <p class="text-xs text-navy-500">Dipilih dari data yang sudah ada — judul, deskripsi, gambar, kutipan dan foto diambil dari data tersebut (diubah di menu Work / Testimonials).</p>
          <div>
            <label :for="fieldId('work.campaignRef')" class="text-sm font-medium">Proyek kampanye</label>
            <select :id="fieldId('work.campaignRef')" v-model="form.work.campaignRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
              <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div>
            <label :for="fieldId('work.testimonialRef')" class="text-sm font-medium">Testimoni</label>
            <select :id="fieldId('work.testimonialRef')" v-model="form.work.testimonialRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
              <option v-for="o in testimonialOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </fieldset>

        <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-5">
          <legend class="px-1 text-base font-semibold">Proyek UI/UX</legend>
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('work.uiux.title')" v-model="form.work.uiux.title" label="Judul" :maxlength="LIM.uiuxTitle" required :error="err('work.uiux.title')" />
            <AdminFormField :id="fieldId('work.uiux.label')" v-model="form.work.uiux.label" label="Label samping (opsional)" :maxlength="LIM.uiuxTitle" :error="err('work.uiux.label')" />
          </div>
          <p class="text-xs text-navy-500">Maksimal {{ LIM.uiux }} proyek yang tampil (satu baris di desktop).</p>
          <AdminFormRepeater legend="Proyek UI/UX" path="work.uiux.items" :items="form.work.uiux.items" :max="CREATIVE_WORK_REFS.length" :published-ids="publishedIds" :item-title="(u) => workLabel(u.ref)" add-label="Tambah proyek" :error="err('work.uiux.items')" @add="addUiux">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`work.uiux.items.${index}.ref`)" class="text-sm font-medium">Proyek</label>
                <select :id="fieldId(`work.uiux.items.${index}.ref`)" v-model="item.ref" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`work.uiux.items.${index}.ref`) || !!err(`work.uiux.items.${index}`)">
                  <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
                <p v-if="err(`work.uiux.items.${index}.ref`) || err(`work.uiux.items.${index}`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`work.uiux.items.${index}.ref`) || err(`work.uiux.items.${index}`) }}</p>
              </div>
            </template>
          </AdminFormRepeater>
        </fieldset>
      </div>

      <!-- 06 WHY PASTI -->
      <div v-show="activeTab === 'why'" class="grid gap-6">
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Pernyataan, standar dan perjalanan perusahaan adalah data perusahaan yang dipakai juga di About dan Technology. Di sini cukup pilih dan urutkan; teksnya diubah di satu tempat saja.</p>
        <AdminFormField :id="fieldId('why.leadLabel')" v-model="form.why.leadLabel" label="Label pembuka" :maxlength="LIM.label" required :error="err('why.leadLabel')" />
        <div>
          <label :for="fieldId('why.statementSource')" class="text-sm font-medium">Pernyataan</label>
          <select :id="fieldId('why.statementSource')" v-model="form.why.statementSource" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
            <option value="mission">Misi perusahaan</option>
            <option value="vision">Visi perusahaan</option>
          </select>
          <p class="mt-2 text-xs text-navy-500">“{{ form.why.statementSource === 'vision' ? company.vision : company.mission }}”</p>
        </div>
        <AdminFormStringList legend="Standar" path="why.standardRefs" :items="form.why.standardRefs" :min="1" :max="4" item-label="Standar" add-label="Tambah standar" :options="standardOptions" :err="err" />
        <AdminFormStringList legend="Perjalanan perusahaan" path="why.milestoneRefs" :items="form.why.milestoneRefs" :min="3" :max="4" item-label="Tahun" add-label="Tambah tahun" hint="Baris perjalanan dibuat untuk 3 atau 4 tahun." :options="milestoneOptions" :err="err" />
      </div>

      <!-- SEO -->
      <AdminSeoFields v-show="activeTab === 'seo'" v-model="form.seo" :err="err" />
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
