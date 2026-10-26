<script setup lang="ts">
import { ARTICLE_LIMITS as LIM, PERSPECTIVE_REFS } from '#shared/utils/insightsSchema'
import type { CategoryListRow } from '#shared/utils/insightsSchema'

// Article fields grouped by editor tab (Info dasar / Ringkasan / Gambar / Isi lengkap).
// Shared by the create page (all groups) and the edit page (one per tab).
const props = defineProps<{
  form: ArticleForm
  err: (path: string) => string | undefined
  categories: CategoryListRow[]
  tab?: 'basics' | 'content' | 'media' | 'body'
  publishedSlug?: string | null
}>()
const show = (t: 'basics' | 'content' | 'media' | 'body') => !props.tab || props.tab === t
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
    <template v-if="show('basics')">
      <AdminFormField :id="fieldId('title')" v-model="form.title" label="Judul" :maxlength="LIM.title" required hint="Judul polos — dipakai di label pembaca artikel, “Now showing” dan “Next”." :error="err('title')" />
      <div>
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug (alamat)" :maxlength="60" required hint="Unik, huruf kecil-dengan-tanda-hubung. Disiapkan untuk alamat artikel di masa depan (/insights/<slug>). Kalau kosong, terisi otomatis dari judul saat kolom ini diklik." :error="err('slug')" @focus="suggestSlug" />
        <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
          Slug yang sudah tayang: “{{ publishedSlug }}”. Kalau diubah, alamat publik artikel nanti ikut berubah setelah di-publish.
        </p>
      </div>
      <fieldset class="grid gap-3">
        <legend class="text-sm font-medium">Judul besar di daftar artikel</legend>
        <p class="text-xs text-navy-500">Bagian “aksen” tampil kuning setelah teks utama.</p>
        <div class="grid gap-4 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('headline.text')" v-model="form.headline.text" label="Teks utama" :maxlength="LIM.headline" required :error="err('headline.text')" />
          <AdminFormField :id="fieldId('headline.accent')" v-model="form.headline.accent" label="Aksen kuning (opsional)" :maxlength="LIM.accent" :error="err('headline.accent')" />
        </div>
      </fieldset>
      <fieldset class="grid gap-3">
        <legend class="text-sm font-medium">Tagline (opsional)</legend>
        <div class="grid gap-4 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('tagline.text')" v-model="form.tagline.text" label="Teks tagline" :maxlength="LIM.tagline" :error="err('tagline.text')" />
          <AdminFormField :id="fieldId('tagline.accent')" v-model="form.tagline.accent" label="Aksen kuning" :maxlength="LIM.tagline" :error="err('tagline.accent')" />
        </div>
      </fieldset>
      <AdminFormField :id="fieldId('kicker')" v-model="form.kicker" label="Label kecil (kicker)" :maxlength="LIM.kicker" required hint="Label kecil di sebelah topik, mis. Security." :error="err('kicker')" />
      <fieldset :id="fieldId('categoryIds')" tabindex="-1" class="grid gap-2">
        <legend class="text-sm font-medium">Topik<span class="text-red-700" aria-hidden="true"> *</span></legend>
        <p class="text-xs text-navy-500">Maksimal {{ LIM.categories }}. Topik pertama tampil di artikel; semuanya dipakai filter.</p>
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
    </template>

    <template v-if="show('content')">
      <AdminFormField :id="fieldId('excerpt')" v-model="form.excerpt" label="Ringkasan" multiline :maxlength="LIM.excerpt" required hint="Tampil saat baris artikel dibuka dan sebagai paragraf pembuka di pembaca artikel." :error="err('excerpt')" />
      <AdminFormStringList legend="Poin “In this insight”" path="points" :items="form.points" :max="LIM.points" :maxlength="LIM.point" item-label="Poin" add-label="Tambah poin" :err="err" hint="2–4 topik singkat, atau kosongkan untuk menyembunyikan kotaknya." />
      <fieldset class="grid gap-3 rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-medium">Kutipan “PASTI perspective” (opsional)</legend>
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
        Disiapkan untuk halaman artikel di masa depan (/insights/&lt;slug&gt;). Isi tab ini belum tampil di website. Jangan mengarang nama penulis atau tanggal.
      </p>
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('authorName')" v-model="form.authorName" label="Penulis (opsional)" :maxlength="LIM.author" :error="err('authorName')" />
        <AdminFormField :id="fieldId('publishDate')" v-model="form.publishDate" label="Tanggal tulisan (opsional)" :maxlength="10" placeholder="YYYY-MM-DD" hint="Hanya tanggal yang ditampilkan — publish tetap dilakukan admin; tidak ada penjadwalan." :error="err('publishDate')" />
      </div>
      <AdminInsightsBodyEditor :blocks="form.body" :err="err" />
    </template>
  </div>
</template>
