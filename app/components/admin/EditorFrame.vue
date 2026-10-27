<script setup lang="ts">
// Shared frame for every CMS editor (products, pages, work, insights …), so
// they all read the same way: title + "Cara pakai", the action bar, then a
// numbered list of the page's sections in page order (same numbers as on
// the site) with error counts, and for the chosen section a plain-language
// "Letaknya" note + "Lihat bagian ini" (opens the preview scrolled to it).
// A last entry lists what stays locked in code. The fields themselves come
// from the page through the default slot (`current` = the chosen tab).

export interface FrameTab {
  key: string
  // Section number as shown on the site ('01', '02' …); '' = settings (SEO …).
  no: string
  label: string
  // Where the section sits and what it looks like, in plain Indonesian.
  where: string
  // Position of the section inside the preview page (for "Lihat bagian ini").
  previewIndex?: number
}

const props = withDefaults(
  defineProps<{
    title: string
    crumb: string
    crumbTo?: string
    // Public URL of the page ('/technology'); omitted for collection items.
    publicPath?: string
    // Server flag that switches the public page to CMS content.
    flag?: string
    tabs: readonly FrameTab[]
    previewPath?: string
    codeManaged: string[]
    dummy?: boolean
    migratedVersion?: string | null
    dirty?: boolean
    errorCount?: (key: string) => number
    // Extra lines for the "Cara pakai" box (collections: create/archive notes).
    howTo?: string[]
    // Content loaded: show the action bar, section list and fields.
    ready?: boolean
    // Number of sections the public page has ("Bagian 05 / 06"); default =
    // the highest section number among the tabs.
    total?: number
    // Bilingual pages: the language being edited (shows the ID / EN switch).
    lang?: 'id' | 'en'
  }>(),
  { crumbTo: undefined, publicPath: undefined, flag: undefined, previewPath: undefined, dummy: false, migratedVersion: null, dirty: false, errorCount: () => 0, howTo: () => [], ready: false, total: undefined, lang: undefined }
)
const activeTab = defineModel<string>('activeTab', { required: true })

const route = useRoute()
const langHref = (l: 'id' | 'en') => `${route.path}?lang=${l}`
// Preview link for a section, keeping ?lang= when the preview path has it.
const previewHref = (index: number) => `${props.previewPath}${props.previewPath?.includes('?') ? '&' : '?'}s=${index}`
const current = computed(() => props.tabs.find((t) => t.key === activeTab.value) ?? props.tabs[0]!)
const total = computed(() => props.total ?? Math.max(0, ...props.tabs.map((t) => Number(t.no) || 0)))

function selectTab(key: string) {
  activeTab.value = key
  nextTick(() => document.getElementById('editor-panel')?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
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
      <NuxtLink v-if="crumbTo" :to="crumbTo" class="hover:underline">{{ crumb }}</NuxtLink><span v-else>{{ crumb }}</span>
      <span aria-hidden="true"> / </span>{{ title }}
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <span
        v-if="dummy"
        class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500"
      >Dummy data</span>
      <span
        v-else-if="migratedVersion"
        class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600"
      >Migrated from current site · {{ migratedVersion }}</span>
      <slot name="badges" />
    </div>
    <div class="mt-3 max-w-3xl rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
      <p class="font-semibold">Cara pakai</p>
      <ol class="mt-1 list-decimal space-y-0.5 pl-5">
        <li>Pilih bagian di kiri<template v-if="publicPath"> — urutannya sama dengan halaman <code>{{ publicPath }}</code> dari atas ke bawah</template>.</li>
        <li>Ubah isinya, lalu klik <strong>Save draft</strong>.<template v-if="previewPath"> Klik <strong>Lihat bagian ini</strong> untuk melihat hasilnya.</template></li>
        <li>Kalau sudah benar, klik <strong>Publish</strong> supaya tampil di website.</li>
        <li v-for="(h, i) in howTo" :key="i">{{ h }}</li>
      </ol>
      <p class="mt-1 text-xs text-navy-500">Hanya isi yang bisa diubah. Tampilan, warna dan susunan dikunci supaya halaman tidak rusak.</p>
    </div>

    <!-- Language being edited (bilingual pages). -->
    <div v-if="lang" class="mt-4 flex max-w-3xl flex-wrap items-center gap-3 rounded-lg border border-navy-100 bg-white px-4 py-3">
      <span class="text-sm font-semibold">Bahasa yang diedit:</span>
      <div class="inline-flex rounded-full bg-navy-50 p-0.5 text-sm font-semibold" role="group" aria-label="Bahasa yang diedit">
        <component :is="lang === 'id' ? 'span' : 'a'" :href="lang === 'id' ? undefined : langHref('id')" class="rounded-full px-3 py-1" :class="lang === 'id' ? 'bg-slateNavy text-white' : 'text-navy-600 hover:text-slateNavy'" :aria-current="lang === 'id' ? 'true' : undefined">Indonesia</component>
        <component :is="lang === 'en' ? 'span' : 'a'" :href="lang === 'en' ? undefined : langHref('en')" class="rounded-full px-3 py-1" :class="lang === 'en' ? 'bg-slateNavy text-white' : 'text-navy-600 hover:text-slateNavy'" :aria-current="lang === 'en' ? 'true' : undefined">English</component>
      </div>
      <p class="w-full text-xs text-navy-500">
        <template v-if="lang === 'id'">Versi utama — tampil di <code>{{ publicPath || '/' }}</code>. Versi English diedit dan di-publish terpisah.</template>
        <template v-else>Versi English — tampil di <code>/en{{ publicPath && publicPath !== '/' ? publicPath : '' }}</code>. Versi Indonesia diedit dan di-publish terpisah.</template>
      </p>
    </div>

    <slot name="status" />

    <template v-if="ready">
      <slot name="actions" />

      <div class="mt-6 grid items-start gap-6 desktop:grid-cols-[15rem_minmax(0,1fr)]">
        <div role="tablist" aria-orientation="vertical" :aria-label="`Bagian ${title}`" class="grid gap-1 desktop:sticky desktop:top-4">
          <p class="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Bagian halaman</p>
          <button
            v-for="(tab, i) in tabs"
            :id="`tab-${tab.key}`"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key"
            aria-controls="editor-panel"
            :tabindex="activeTab === tab.key ? 0 : -1"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            :class="[activeTab === tab.key ? 'bg-slateNavy text-white' : 'text-navy-700 hover:bg-navy-50', !tab.no && i > 0 && tabs[i - 1]!.no ? 'mt-2' : '']"
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
            v-if="codeManaged.length"
            type="button"
            class="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            :class="activeTab === 'code' ? 'bg-slateNavy text-white' : 'text-navy-500 hover:bg-navy-50'"
            @click="selectTab('code')"
          ><span class="w-6 text-xs">🔒</span>Yang tidak bisa diedit</button>
        </div>

        <div id="editor-panel" role="tabpanel" :aria-labelledby="`tab-${activeTab}`" class="min-w-0 max-w-3xl scroll-mt-4">
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
                  v-if="previewPath && current.previewIndex !== undefined"
                  :href="previewHref(current.previewIndex)"
                  target="_blank"
                  rel="noopener"
                  class="shrink-0 rounded-md border border-navy-300 bg-white px-3 py-1.5 text-sm font-semibold text-slateNavy hover:bg-navy-50"
                >Lihat bagian ini ↗</a>
              </div>
              <p v-if="previewPath && current.previewIndex !== undefined && dirty" class="mt-2 text-xs text-amber-900">Ada perubahan yang belum disimpan — klik <strong>Save draft</strong> dulu supaya terlihat di preview.</p>
            </div>

            <div class="mt-6">
              <slot :current="current" />
            </div>
          </template>

          <p v-if="flag && publicPath" class="mt-8 text-xs text-navy-400">
            Halaman publik <code>{{ publicPath }}</code> memakai konten yang sudah di-publish hanya jika flag server <code>{{ flag }}</code> menyala; kalau tidak, tetap memakai konten bawaan dari kode.
          </p>
        </div>
      </div>

      <slot name="after" />
    </template>
  </section>
</template>
