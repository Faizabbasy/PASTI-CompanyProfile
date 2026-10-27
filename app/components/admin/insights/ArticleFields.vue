<script setup lang="ts">
import { ARTICLE_LIMITS as LIM, PERSPECTIVE_REFS } from '#shared/utils/insightsSchema'
import type { CategoryListRow } from '#shared/utils/insightsSchema'

// Article fields grouped by editor tab, in the order they appear on the
// article (Judul & label / Paragraf pembuka / Gambar / Kutipan / Isi lengkap /
// Judul pendek & alamat). Labels name what the reader sees.
// Shared by the create page (all groups) and the edit page (one per tab).
const props = defineProps<{
  form: ArticleForm
  err: (path: string) => string | undefined
  categories: CategoryListRow[]
  tab?: Tab
  publishedSlug?: string | null
}>()
type Tab = 'header' | 'content' | 'media' | 'perspective' | 'body' | 'settings'
const show = (t: Tab) => !props.tab || props.tab === t
const slugChanged = computed(() => !!props.publishedSlug && props.form.slug !== props.publishedSlug)
const usable = computed(() => props.categories.filter((c) => c.status !== 'archived'))
const catLabel = (id: string) => props.categories.find((c) => c.id === id)?.name ?? `Tidak ditemukan (${id})`

function suggestSlug() {
  if (!props.form.slug) props.form.slug = slugFrom(`${props.form.headline.text} ${props.form.headline.accent}`.trim() || props.form.title)
}
function toggleCategory(id: string, on: boolean) {
  const list = props.form.categoryIds
  if (on && !list.includes(id)) list.push(id)
  if (!on) list.splice(list.indexOf(id), 1)
}
function moveCategory(i: number, d: number) {
  const list = props.form.categoryIds
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}
</script>

<template>
  <div class="grid gap-5">
    <template v-if="show('header')">
      <fieldset :id="fieldId('categoryIds')" tabindex="-1" class="grid gap-2">
        <legend class="text-sm font-medium">Topik — label kecil bertitik kuning di atas judul<span class="text-red-700" aria-hidden="true"> *</span></legend>
        <p class="text-xs text-navy-500">Maksimal {{ LIM.categories }}. Topik pertama yang tampil di artikel; semuanya dipakai tombol filter di /insights. Nama topik diubah di menu Categories.</p>
        <p v-if="err('categoryIds')" class="text-xs font-medium text-red-700" role="alert">{{ err('categoryIds') }}</p>
        <div class="flex flex-wrap gap-3">
          <label v-for="c in usable" :key="c.id" class="inline-flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-1.5 text-sm">
            <input type="checkbox" class="h-4 w-4" :checked="form.categoryIds.includes(c.id)" :disabled="!form.categoryIds.includes(c.id) && form.categoryIds.length >= LIM.categories" @change="toggleCategory(c.id, ($event.target as HTMLInputElement).checked)">
            {{ c.name }}<span v-if="!c.active" class="text-[11px] text-navy-500">(disembunyikan)</span><span v-if="c.status !== 'published'" class="text-[11px] text-navy-500">· {{ c.status }}</span>
          </label>
        </div>
        <ol v-if="form.categoryIds.length > 1" class="mt-1 flex flex-wrap gap-2 text-xs">
          <li v-for="(id, i) in form.categoryIds" :key="id" class="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-1">
            {{ i === 0 ? 'Utama: ' : '' }}{{ catLabel(id) }}
            <button type="button" class="px-1 disabled:opacity-40" :disabled="i === 0" :aria-label="`Majukan ${catLabel(id)}`" @click="moveCategory(i, -1)">←</button>
          </li>
        </ol>
        <p v-for="(id, i) in form.categoryIds" v-show="err(`categoryIds.${i}`)" :key="`e-${id}`" class="text-xs text-red-700" role="alert">{{ catLabel(id) }}: {{ err(`categoryIds.${i}`) }}</p>
      </fieldset>
      <fieldset class="grid gap-3">
        <legend class="text-sm font-medium">Judul besar</legend>
        <p class="text-xs text-navy-500">Teks paling besar di pembaca artikel dan di daftar artikel. Bagian “aksen” tampil kuning setelah teks utama.</p>
        <div class="grid gap-4 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('headline.text')" v-model="form.headline.text" label="Teks utama" :maxlength="LIM.headline" required :error="err('headline.text')" />
          <AdminFormField :id="fieldId('headline.accent')" v-model="form.headline.accent" label="Aksen kuning (opsional)" :maxlength="LIM.accent" :error="err('headline.accent')" />
        </div>
      </fieldset>
      <fieldset class="grid gap-3">
        <legend class="text-sm font-medium">Tagline (opsional)</legend>
        <p class="text-xs text-navy-500">Kalimat di bawah judul besar; bagian aksen tampil kuning.</p>
        <div class="grid gap-4 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('tagline.text')" v-model="form.tagline.text" label="Teks tagline" :maxlength="LIM.tagline" :error="err('tagline.text')" />
          <AdminFormField :id="fieldId('tagline.accent')" v-model="form.tagline.accent" label="Aksen kuning" :maxlength="LIM.tagline" :error="err('tagline.accent')" />
        </div>
      </fieldset>
      <AdminFormField :id="fieldId('kicker')" v-model="form.kicker" label="Label kecil (kicker)" :maxlength="LIM.kicker" required hint="Huruf kapital kecil di pojok kiri bawah gambar sampul, dan di daftar artikel setelah topik. Mis. Keamanan." :error="err('kicker')" />
    </template>

    <template v-if="show('content')">

      <AdminFormField :id="fieldId('excerpt')" v-model="form.excerpt" label="Paragraf pembuka (ringkasan)" multiline :maxlength="LIM.excerpt" required hint="Paragraf bergaris kuning di bawah judul, juga teks pratinjau saat baris artikel disorot di /insights. Isi artikel yang panjang ditulis di bagian 05 · Isi lengkap, bukan di sini." :error="err('excerpt')" />
      <AdminFormStringList legend="Poin “Dalam insight ini”" path="points" :items="form.points" :max="LIM.points" :maxlength="LIM.point" item-label="Poin" add-label="Tambah poin" :err="err" hint="Kotak bernomor 01–04 di bawah paragraf pembuka. Isi 2–4 poin singkat, atau kosongkan untuk menyembunyikan kotaknya." />
    </template>

    <template v-if="show('perspective')">
      <fieldset class="grid gap-3 rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-medium">Kutipan PASTI (opsional)</legend>
        <p class="text-xs text-navy-500">Kalimat besar dengan tanda kutip kuning di bawah poin, lalu baris link berpanah.</p>
        <div>
          <label :for="fieldId('perspective.sourceRef')" class="text-sm font-medium">Sumber kutipan</label>
          <select :id="fieldId('perspective.sourceRef')" v-model="form.perspective.sourceRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
            <option value="">Tidak ada</option>
            <option v-for="r in PERSPECTIVE_REFS" :key="r" :value="r">{{ PERSPECTIVE_LABELS[r] }}</option>
          </select>
          <p class="mt-1 text-xs text-navy-500">Isi kutipan diambil dari data perusahaan tersebut — ubah di sana, bukan di sini.</p>
          <p v-if="err('perspective.sourceRef')" class="mt-1 text-xs text-red-700" role="alert">{{ err('perspective.sourceRef') }}</p>
        </div>
        <p v-if="err('perspective.links')" class="text-xs font-medium text-red-700" role="alert">{{ err('perspective.links') }}</p>
        <div v-for="(l, k) in form.perspective.links" :key="k" class="grid gap-3 rounded-md border border-navy-100 p-3 tablet:grid-cols-[1fr_1fr_auto]">
          <AdminFormField :id="fieldId(`perspective.links.${k}.label`)" v-model="l.label" :label="`Link ${k + 1} — teks`" :maxlength="LIM.linkLabel" required :error="err(`perspective.links.${k}.label`)" />
          <AdminFormField :id="fieldId(`perspective.links.${k}.url`)" v-model="l.url" label="Link" inputmode="url" :maxlength="500" required hint="Contoh: /work#case-textile" :error="err(`perspective.links.${k}.url`)" />
          <button type="button" class="mt-6 self-start rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50" @click="form.perspective.links.splice(k, 1)">Hapus</button>
        </div>
        <div>
          <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="!form.perspective.sourceRef || form.perspective.links.length >= LIM.links" @click="form.perspective.links.push({ label: '', url: '' })">+ Tambah link</button>
        </div>
      </fieldset>
    </template>

    <template v-if="show('media')">
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormImage :id="fieldId('coverImage')" v-model="form.coverImage" label="Poster sampul" required aspect="4/5" :focus="form.coverFocus" hint="Gambar yang sudah disetujui, format poster tegak 4:5." :error="err('coverImage')" />
        <AdminFormField :id="fieldId('coverImageAlt')" v-model="form.coverImageAlt" label="Deskripsi gambar (untuk pembaca layar)" :maxlength="LIM.alt" required :error="err('coverImageAlt')" />
      </div>
      <AdminFormField :id="fieldId('coverFocus')" v-model="form.coverFocus" label="Titik fokus gambar" :maxlength="16" required hint="Posisi “x% y%” bagian terpenting poster — sampul di pembaca artikel dipotong mengikuti titik ini (mis. 74.5% 48%). Pratinjau di atas ikut berubah." :error="err('coverFocus')" />
    </template>

    <template v-if="show('body')">
      <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
        Tulis isi artikel yang panjang di sini, blok demi blok (paragraf, subjudul, kutipan, daftar, gambar). Belum tampil di website — nanti muncul di halaman artikel /insights/&lt;slug&gt;. Jangan mengulang paragraf pembuka; jangan mengarang nama penulis atau tanggal.
      </p>
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('authorName')" v-model="form.authorName" label="Penulis (opsional)" :maxlength="LIM.author" :error="err('authorName')" />
        <AdminFormField :id="fieldId('publishDate')" v-model="form.publishDate" label="Tanggal tulisan (opsional)" :maxlength="10" placeholder="YYYY-MM-DD" hint="Hanya tanggal yang ditampilkan — publish tetap dilakukan admin; tidak ada penjadwalan." :error="err('publishDate')" />
      </div>
      <AdminInsightsBodyEditor :blocks="form.body" :err="err" />
    </template>

    <template v-if="show('settings')">
      <AdminFormField :id="fieldId('title')" v-model="form.title" label="Judul pendek" :maxlength="LIM.title" required hint="Tidak tampil sebagai judul besar. Dipakai di tombol “Berikutnya” pembaca artikel, “Sedang tampil” di hero /insights, dan judul tab browser. Biasanya judul besar + tagline dalam satu kalimat." :error="err('title')" />
      <div>
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug (alamat)" :maxlength="60" required hint="Unik, huruf kecil-dengan-tanda-hubung. Disiapkan untuk alamat artikel di masa depan (/insights/<slug>). Kalau kosong, terisi otomatis dari judul saat kolom ini diklik." :error="err('slug')" @focus="suggestSlug" />
        <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
          Slug yang sudah tayang: “{{ publishedSlug }}”. Kalau diubah, alamat publik artikel nanti ikut berubah setelah di-publish.
        </p>
      </div>
    </template>
  </div>
</template>
