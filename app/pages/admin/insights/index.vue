<script setup lang="ts">
import { INSIGHTS_LIMITS as LIM, type ArticleListRow, type CategoryListRow, type InsightsAdminState } from '#shared/utils/insightsSchema'

// Insights landing singleton editor. Masthead copy plus which articles the
// issue lists (order + active) and which topic filters appear. Article and
// category content live in their own records and are only referenced here.
definePageMeta({ layout: 'admin' })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()
useHead({ title: 'Insights page · Insights' })

const { cmsFetch } = useCmsSession()
const { data: articleRows } = await useAsyncData(`admin-insights-article-options-${lang}`, () => cmsFetch<ArticleListRow[]>('/api/admin/insights/articles', { query: { lang } }))
const { data: categoryRows } = await useAsyncData(`admin-insights-category-options-${lang}`, () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories', { query: { lang } }))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<InsightsAdminState, InsightsForm>({
  lang,
  name: 'halaman Insights',
  endpoint: '/api/admin/insights',
  asyncKey: `admin-insights-${lang}`,
  tabs: INSIGHTS_TABS,
  toForm: toInsightsForm,
  toPayload: toInsightsPayload,
  validate: validateInsightsForm
})

const articleOptions = computed(() => (articleRows.value ?? []).filter((a) => a.status !== 'archived'))
const categoryOptions = computed(() => (categoryRows.value ?? []).filter((c) => c.status !== 'archived'))
const articleById = (id: string) => articleRows.value?.find((a) => a.id === id)
const categoryById = (id: string) => categoryRows.value?.find((c) => c.id === id)
const articleLabel = (id: string) => articleById(id)?.title ?? `Artikel tidak ditemukan (${id})`
const categoryLabel = (id: string) => categoryById(id)?.name ?? `Topik tidak ditemukan (${id})`

function addArticle() {
  const items = form.value!.contents.items
  const used = new Set(items.map((i) => i.articleId))
  const next = articleOptions.value.find((a) => !used.has(a.id))
  if (next) items.push({ _key: newKey(), articleId: next.id, sortOrder: items.length + 1, active: true })
}
function addFilter() {
  const items = form.value!.filters.items
  const used = new Set(items.map((i) => i.categoryId))
  const next = categoryOptions.value.find((c) => !used.has(c.id))
  if (next) items.push({ _key: newKey(), categoryId: next.id, sortOrder: items.length + 1, active: true })
}

const unpublishedSelected = computed(() => {
  const f = form.value
  if (!f) return []
  return [
    ...f.contents.items.filter((i) => i.active && articleById(i.articleId)?.status !== 'published').map((i) => articleLabel(i.articleId)),
    ...f.filters.items.filter((i) => i.active && categoryById(i.categoryId)?.status !== 'published').map((i) => `Topik ${categoryLabel(i.categoryId)}`)
  ]
})

// Same words as the status badges and the action bar (Draft / Published / Archived).
const statusLabel = (s: string) => ({ draft: 'Draft', published: 'Published', archived: 'Archived' })[s] ?? s
const codeManaged = [
  'Susunan, desain dan animasi: kata besar berisi poster, baris daftar isi dan pratinjaunya, pembaca artikel layar penuh.',
  'Teks kecil antarmuka: “All”, “Read insight”, “In this insight”, “Next”, “View full poster”, “Now showing”, penghitung.',
  'Kutipan “PASTI perspective” — diambil dari data perusahaan; artikel hanya memilih sumbernya.',
  'Bagian Insights di homepage — diatur di kode.',
  'Ajakan di footer — diatur di Shared Content → Global CTAs.'
]
</script>

<template>
  <AdminEditorFrame
    :lang="lang"
    v-model:active-tab="activeTab"
    title="Halaman Insights"
    crumb="Insights"
    public-path="/insights"
    flag="NUXT_CMS_INSIGHTS_PUBLIC_ENABLED"
    :tabs="INSIGHTS_TABS"
    :preview-path="`/admin/preview/insights?lang=${lang}`"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
    :how-to="[
      'Isi artikel dan nama topik diubah di menu Insights → Articles dan Insights → Categories. Di sini hanya memilih artikel & topik mana yang tampil, dan urutannya.',
      'Bagian Insights di homepage diatur di kode dan tidak membaca halaman ini.'
    ]"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat halaman Insights…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Halaman Insights gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <template v-if="form && state">
        <AdminEditorActionBar
          :state="state"
          :dirty="dirty"
          :busy="busy"
          :preview-href="`/admin/preview/insights?lang=${lang}`"
          :can-publish="canPublish"
          :can-unpublish="canUnpublish"
          :can-archive="canArchive"
          :publish-disabled-reason="publishDisabledReason"
          :notice="notice"
          :session-expired="sessionExpired"
          @save="saveDraft"
          @status="runStatusAction"
        />
        <p v-if="unpublishedSelected.length" class="mt-3 max-w-3xl rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
          Belum di-publish (publish dulu, atau sembunyikan, sebelum mem-publish halaman ini): {{ unpublishedSelected.join(' · ') }}
        </p>
      </template>
    </template>

    <template v-if="form" #default>
      <!-- 01 HERO -->
      <div v-show="activeTab === 'hero'" class="grid gap-5">
        <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Label kecil di atas judul" :maxlength="LIM.eyebrow" required hint="Jumlah artikel & topik di sebelahnya dihitung otomatis." :error="err('hero.eyebrow')" />
        <AdminFormField :id="fieldId('hero.headline')" v-model="form.hero.headline" label="Kata besar (satu kata)" :maxlength="LIM.headlineWord" required hint="Tampil sangat besar, hurufnya diisi gambar sampul artikel. Titik kuning di akhir ditambahkan otomatis." :error="err('hero.headline')" />
        <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Paragraf di bawah judul" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
        <div class="grid gap-5 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Tombol utama — teks" :maxlength="LIM.ctaLabel" required hint="Tombol ini selalu menggulir ke daftar artikel." :error="err('hero.primaryCtaLabel')" />
          <div />
          <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Tombol kedua — teks" :maxlength="LIM.ctaLabel" required :error="err('hero.secondaryCtaLabel')" />
          <AdminFormField :id="fieldId('hero.secondaryCtaUrl')" v-model="form.hero.secondaryCtaUrl" label="Tombol kedua — link" inputmode="url" :maxlength="500" required hint="Contoh: /contact, #bagian, https://…" :error="err('hero.secondaryCtaUrl')" />
        </div>
        <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">Gambar di dalam huruf dan tumpukan poster memakai gambar sampul artikel yang tampil — tidak ada gambar hero terpisah.</p>
      </div>

      <!-- 02 CONTENTS + FILTERS -->
      <div v-show="activeTab === 'contents'" class="grid gap-8">
        <section class="grid gap-5" aria-labelledby="sec-contents">
          <h3 id="sec-contents" class="border-b border-navy-100 pb-1 text-base font-bold">Daftar artikel</h3>
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('contents.sectionLabel')" v-model="form.contents.sectionLabel" label="Label bagian" :maxlength="LIM.sectionLabel" required :error="err('contents.sectionLabel')" />
            <AdminFormField :id="fieldId('contents.title')" v-model="form.contents.title" label="Judul bagian" :maxlength="LIM.title" required hint="Titik kuning di akhir ditambahkan otomatis." :error="err('contents.title')" />
          </div>
          <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
            Maksimal <strong>{{ LIM.articlesActive }}</strong> artikel yang tampil. Nomor (01, 02 …) mengikuti urutan, dan artikel pertama terbuka otomatis.
            Judul, sampul, ringkasan dan topik diambil dari data artikel masing-masing.
          </p>
          <AdminFormRepeater legend="Artikel yang tampil" :items="form.contents.items" :max="LIM.articles" :published-ids="publishedIds" :item-title="(i) => articleLabel(i.articleId)" add-label="Tambah artikel" :error="err('contents.items')" @add="addArticle">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`contents.items.${index}.articleId`)" class="text-sm font-medium">Artikel<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`contents.items.${index}.articleId`)" v-model="item.articleId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`contents.items.${index}.articleId`)">
                  <option v-if="!articleById(item.articleId)" :value="item.articleId">{{ articleLabel(item.articleId) }}</option>
                  <option v-for="a in articleOptions" :key="a.id" :value="a.id">{{ a.title }} · {{ statusLabel(a.status) }}{{ a.dummy ? ' · contoh' : '' }}</option>
                </select>
                <p v-if="err(`contents.items.${index}.articleId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`contents.items.${index}.articleId`) }}</p>
                <p v-if="articleById(item.articleId)" class="mt-1 flex flex-wrap items-center gap-2 text-xs text-navy-500">
                  <AdminStatusBadge :status="articleById(item.articleId)!.status" />
                  {{ articleById(item.articleId)!.categories.join(', ') }}
                  <NuxtLink :to="`/admin/insights/articles/${item.articleId}?lang=${lang}`" class="underline">Edit artikel</NuxtLink>
                </p>
              </div>
            </template>
          </AdminFormRepeater>
        </section>

        <section class="grid gap-5" aria-labelledby="sec-filters">
          <h3 id="sec-filters" class="border-b border-navy-100 pb-1 text-base font-bold">Filter topik</h3>
          <p class="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
            Tombol topik setelah “All”, sesuai urutan ini. Tombol hanya muncul kalau topiknya sudah di-publish, tampil, dan dipakai minimal satu artikel di daftar.
            Nama topik diubah di <NuxtLink :to="`/admin/insights/categories?lang=${lang}`" class="underline">Categories</NuxtLink>.
          </p>
          <AdminFormRepeater legend="Filter topik" :items="form.filters.items" :max="LIM.filters" :published-ids="publishedIds" :item-title="(i) => categoryLabel(i.categoryId)" add-label="Tambah topik" :error="err('filters.items')" @add="addFilter">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`filters.items.${index}.categoryId`)" class="text-sm font-medium">Topik<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`filters.items.${index}.categoryId`)" v-model="item.categoryId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                  <option v-if="!categoryById(item.categoryId)" :value="item.categoryId">{{ categoryLabel(item.categoryId) }}</option>
                  <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.name }} · {{ statusLabel(c.status) }}{{ c.active ? '' : ' · disembunyikan' }}</option>
                </select>
                <p v-if="err(`filters.items.${index}.categoryId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`filters.items.${index}.categoryId`) }}</p>
              </div>
            </template>
          </AdminFormRepeater>
        </section>
      </div>

      <!-- SEO -->
      <AdminSeoFields v-show="activeTab === 'seo'" v-model="form.seo" :err="err" />
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
