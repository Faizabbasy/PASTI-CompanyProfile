<script setup lang="ts">
import type { ZodType } from 'zod'
import type { SingletonAdminState } from '#shared/cms/fields'
import type { AnyProductContent, ProductTab, SectionMap } from '#shared/cms/productFields'

// Editor for a product page (OPEN, SHIFTLY, e-CORPORATE …), driven by its
// field map. Left: the page's sections in page order (same numbers as on the
// site), each with an error count. Right: a plain-language note on where the
// section sits + a link that opens the preview scrolled to it, then the
// fields. Copy only — design, layout and wiring are not editable here.
const props = defineProps<{
  name: string
  slug: string
  publicPath: string
  flag: string
  sections: SectionMap
  tabs: readonly ProductTab[]
  schema: ZodType
  seoDescriptionMax: number
  codeManaged: string[]
}>()

const endpoint = `/api/admin/pages/${props.slug}`
const previewPath = `/admin/preview/${props.slug}`
const toJson = <T,>(v: T) => JSON.parse(JSON.stringify(v)) as T

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<SingletonAdminState<string, AnyProductContent>, AnyProductContent>({
  name: props.name,
  endpoint,
  asyncKey: `admin-${props.slug}`,
  tabs: props.tabs,
  toForm: toJson,
  toPayload: toJson,
  validate: (f) => zodFieldErrors(props.schema.safeParse(toJson(f)))
})

const current = computed(() => props.tabs.find((t) => t.key === activeTab.value) ?? props.tabs[0]!)
const contentSections = computed(() => current.value.sections.filter((s) => s !== 'seo'))
const sectionModel = (k: string) => (form.value as unknown as Record<string, Record<string, unknown>>)[k]!
const tabTitle = (t: ProductTab) => (t.no ? `${t.no} · ${t.label}` : t.label)
const total = computed(() => props.tabs.filter((t) => t.no).length)

function selectTab(key: string) {
  activeTab.value = key
  nextTick(() => document.getElementById('product-panel')?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
}
function onTabKey(e: KeyboardEvent, index: number) {
  const n = props.tabs.length
  const next = e.key === 'ArrowDown' ? (index + 1) % n : e.key === 'ArrowUp' ? (index - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
  if (next < 0) return
  e.preventDefault()
  activeTab.value = props.tabs[next]!.key
  nextTick(() => document.getElementById(`tab-${props.tabs[next]!.key}`)?.focus())
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <span>Products</span> <span aria-hidden="true">/</span> {{ name }}
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Halaman {{ name }}</h1>
      <span
        v-if="state?.dummy !== false"
        class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500"
      >Dummy data</span>
      <span
        v-else-if="state?.source.kind === 'migration'"
        class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600"
      >Migrated from current site · {{ state.source.version }}</span>
    </div>
    <div class="mt-3 max-w-3xl rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
      <p class="font-semibold">Cara pakai</p>
      <ol class="mt-1 list-decimal space-y-0.5 pl-5">
        <li>Pilih bagian halaman di kiri — urutannya sama dengan halaman <code>{{ publicPath }}</code> dari atas ke bawah.</li>
        <li>Ubah teksnya, lalu klik <strong>Save draft</strong>. Klik <strong>Lihat bagian ini</strong> untuk melihat hasilnya.</li>
        <li>Kalau sudah benar, klik <strong>Publish</strong> supaya tampil di website.</li>
      </ol>
      <p class="mt-1 text-xs text-navy-500">Hanya isi teks yang bisa diubah. Tampilan, warna, susunan dan jumlah item dikunci supaya halaman tidak rusak.</p>
    </div>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat konten {{ name }}…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Konten {{ name }} gagal dimuat.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="previewPath"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <div class="mt-6 grid items-start gap-6 desktop:grid-cols-[15rem_minmax(0,1fr)]">
        <!-- Sections of the page, in page order -->
        <div role="tablist" aria-orientation="vertical" :aria-label="`Bagian halaman ${name}`" class="grid gap-1 desktop:sticky desktop:top-4">
          <p class="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Bagian halaman</p>
          <button
            v-for="(tab, i) in tabs"
            :id="`tab-${tab.key}`"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key"
            :aria-controls="'product-panel'"
            :tabindex="activeTab === tab.key ? 0 : -1"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            :class="[activeTab === tab.key ? 'bg-slateNavy text-white' : 'text-navy-700 hover:bg-navy-50', !tab.no ? 'mt-2' : '']"
            @click="selectTab(tab.key)"
            @keydown="onTabKey($event, i)"
          >
            <span class="w-6 shrink-0 text-xs tabular-nums" :class="activeTab === tab.key ? 'text-pastiYellow-400' : 'text-navy-400'">{{ tab.no || '—' }}</span>
            <span class="min-w-0 flex-1 truncate">{{ tab.label }}</span>
            <span v-if="errorCount(tab.key)" class="rounded-full bg-red-100 px-1.5 text-[11px] font-semibold text-red-800">
              {{ errorCount(tab.key) }}<span class="sr-only"> error</span>
            </span>
          </button>
          <button
            type="button"
            class="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            :class="activeTab === 'code' ? 'bg-slateNavy text-white' : 'text-navy-500 hover:bg-navy-50'"
            @click="selectTab('code')"
          ><span class="w-6 text-xs">🔒</span>Yang tidak bisa diedit</button>
        </div>

        <div id="product-panel" role="tabpanel" :aria-labelledby="`tab-${activeTab}`" class="min-w-0 max-w-3xl scroll-mt-4">
          <template v-if="activeTab === 'code'">
            <h2 class="text-lg font-bold">Yang tidak bisa diedit di sini</h2>
            <p class="mt-1 text-sm text-navy-600">Bagian ini sengaja dikunci di kode supaya tampilan halaman tetap rapi:</p>
            <ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy-700">
              <li v-for="(c, i) in codeManaged" :key="i">{{ c }}</li>
            </ul>
          </template>

          <template v-else>
            <div class="rounded-lg border border-pastiYellow-300 bg-pastiYellow-50 px-4 py-3">
              <div class="flex flex-wrap items-start gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-navy-500">{{ current.no ? `Bagian ${current.no} / ${String(total).padStart(2, '0')}` : 'Pengaturan' }}</p>
                  <h2 class="text-lg font-bold">{{ current.label }}</h2>
                  <p class="mt-1 text-sm text-navy-700"><strong>Letaknya:</strong> {{ current.where }}</p>
                </div>
                <a
                  v-if="current.previewIndex !== undefined"
                  :href="`${previewPath}?s=${current.previewIndex}`"
                  target="_blank"
                  rel="noopener"
                  class="shrink-0 rounded-md border border-navy-300 bg-white px-3 py-1.5 text-sm font-semibold text-slateNavy hover:bg-navy-50"
                >Lihat bagian ini ↗</a>
              </div>
              <p v-if="current.previewIndex !== undefined && dirty" class="mt-2 text-xs text-amber-900">Ada perubahan yang belum disimpan — klik <strong>Save draft</strong> dulu supaya terlihat di preview.</p>
            </div>

            <div v-if="current.key !== 'seo'" class="mt-6 grid gap-8">
              <section v-for="s in contentSections" :key="s" :aria-labelledby="contentSections.length > 1 ? `sec-${s}` : undefined">
                <h3 v-if="contentSections.length > 1 && sections[s]!.k === 'group'" :id="`sec-${s}`" class="mb-3 border-b border-navy-100 pb-1 text-base font-bold">{{ sections[s]!.label }}</h3>
                <AdminProductFields v-if="sections[s]!.k === 'group'" :fields="sections[s]!.fields" :model="sectionModel(s)" :path="s" :err="err" />
                <AdminProductFields v-else :fields="{ [s]: sections[s]! }" :model="(form as unknown as Record<string, unknown>)" path="" :err="err" />
              </section>
            </div>

            <div v-else class="mt-6 grid gap-5">
              <AdminFormField :id="fieldId('seo.metaTitle')" v-model="form.seo.metaTitle" label="Judul di Google (meta title)" :maxlength="70" required :error="err('seo.metaTitle')" />
              <AdminFormField :id="fieldId('seo.metaDescription')" v-model="form.seo.metaDescription" label="Deskripsi di Google (meta description)" multiline :rows="3" :maxlength="seoDescriptionMax" required :error="err('seo.metaDescription')" />
              <AdminFormImage :id="fieldId('seo.ogImage')" v-model="form.seo.ogImage" label="Gambar saat link dibagikan" aspect="1200/630" hint="Ukuran 1200×630. Kosongkan untuk memakai gambar bawaan." :error="err('seo.ogImage')" />
              <AdminFormField :id="fieldId('seo.canonicalUrl')" v-model="form.seo.canonicalUrl" label="Canonical URL" inputmode="url" :maxlength="300" hint="Biarkan seperti ini kecuali diminta tim SEO. Kosongkan = alamat halaman ini." :error="err('seo.canonicalUrl')" />
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model="form.seo.noIndex" type="checkbox" class="h-4 w-4">
                Sembunyikan dari mesin pencari (noindex)
              </label>
            </div>
          </template>

          <p class="mt-8 text-xs text-navy-400">
            Halaman publik <code>{{ publicPath }}</code> memakai konten yang sudah di-publish hanya jika flag server <code>{{ flag }}</code> menyala; kalau tidak, tetap memakai konten bawaan dari kode.
          </p>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
