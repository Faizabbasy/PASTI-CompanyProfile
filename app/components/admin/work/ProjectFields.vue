<script setup lang="ts">
import { PROJECT_LIMITS as LIM } from '#shared/utils/projectSchema'

// Project identity + work-card fields, shared by the create and edit pages.
// `tab` limits the rendered group (edit page tabs); omit it to show all.
const props = defineProps<{ form: ProjectForm; err: (path: string) => string | undefined; tab?: 'identity' | 'card'; publishedSlug?: string | null }>()
const show = (t: 'identity' | 'card') => !props.tab || props.tab === t
const slugChanged = computed(() => !!props.publishedSlug && props.form.slug !== props.publishedSlug)

function suggestSlug() {
  if (props.form.slug) return
  props.form.slug = props.form.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}
</script>

<template>
  <div class="grid gap-5">
    <template v-if="show('identity')">
      <AdminFormField :id="fieldId('name')" v-model="form.name" label="Nama proyek" :maxlength="LIM.name" required :error="err('name')" @focusout="suggestSlug" />
      <div>
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Alamat singkat (slug)" :maxlength="60" required hint="Huruf kecil, angka dan tanda hubung, mis. toko-online-abc. Harus unik; dipakai sebagai link langsung ke kartu proyek (/work#work-<slug>). Terisi otomatis dari nama." :error="err('slug')" />
        <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
          Slug yang sudah tayang adalah “{{ publishedSlug }}”. Kalau diganti, link lama ke proyek ini bisa tidak berfungsi setelah di-publish.
        </p>
      </div>
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('clientDisplayName')" v-model="form.clientDisplayName" label="Nama klien (opsional)" :maxlength="LIM.client" hint="Hanya nama yang sudah disetujui klien untuk ditampilkan." :error="err('clientDisplayName')" />
        <AdminFormField :id="fieldId('year')" v-model="form.year" label="Tahun (opsional)" :maxlength="4" hint="4 angka. Kosongkan kalau tidak tahu — jangan menebak." :error="err('year')" />
      </div>
      <AdminFormField :id="fieldId('category')" v-model="form.category" label="Kategori" :maxlength="LIM.category" required hint="Tampil kecil di kartu proyek, mis. E-commerce Platform." :error="err('category')" />
    </template>

    <template v-if="show('card')">
      <AdminFormField :id="fieldId('shortDescription')" v-model="form.shortDescription" label="Deskripsi singkat" multiline :maxlength="LIM.description" required hint="Tampil di kartu proyek (dua baris di tampilan Grid, lengkap di tampilan List)." :error="err('shortDescription')" />
      <AdminFormField :id="fieldId('filterGroup')" v-model="form.filterGroup" label="Kelompok filter" :maxlength="LIM.filterGroup" required hint="Nama tombol filter tempat proyek ini muncul (mis. Commerce, Wellness). Pakai nama yang sama untuk proyek sejenis." :error="err('filterGroup')" />
      <AdminFormImage :id="fieldId('poster')" v-model="form.poster" label="Gambar poster" required aspect="4/5" hint="Rasio 4:5 (tegak). Hanya gambar yang boleh dipublikasikan — jangan screenshot yang berisi data rahasia." :error="err('poster')" />
      <AdminFormField :id="fieldId('posterAlt')" v-model="form.posterAlt" label="Deskripsi gambar untuk pembaca layar" :maxlength="LIM.alt" required hint="Satu kalimat yang menjelaskan isi gambar." :error="err('posterAlt')" />
    </template>
  </div>
</template>
