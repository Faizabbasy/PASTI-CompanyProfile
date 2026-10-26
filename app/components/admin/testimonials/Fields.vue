<script setup lang="ts">
import { TESTIMONIAL_CATEGORIES, TESTIMONIAL_LIMITS as LIM, TESTIMONIAL_TYPES } from '#shared/utils/testimonialSchema'
import { testimonialRoleLine } from '#shared/utils/testimonialPublic'

// Testimonial content fields, shared by the create page and the record
// editor. `tab` limits the output to one editor tab; without it (create
// page) every section renders in order. Content only — card layout, quote
// marks, avatar shape and motion are owned by the components.
const props = defineProps<{ form: TestimonialForm; err: (path: string) => string | undefined; tab?: string; legacyRoleLine?: string | null }>()
const show = (t: string) => !props.tab || props.tab === t
const clients = testimonialClientOptions()
const roleLine = computed(() => testimonialRoleLine(props.form))
const newTag = ref('')
function addTag() {
  const t = newTag.value.trim()
  if (t && props.form.tags.length < LIM.tags) props.form.tags.push(t)
  newTag.value = ''
}
function toggleCategory(c: (typeof TESTIMONIAL_CATEGORIES)[number]) {
  const list = props.form.categoryIds
  const i = list.indexOf(c)
  if (i >= 0) list.splice(i, 1)
  else list.push(c)
}
</script>

<template>
  <div class="grid gap-8">
    <fieldset v-if="show('quote')" class="grid gap-3">
      <legend v-if="!tab" class="text-base font-semibold">Kutipan</legend>
      <AdminFormField
        :id="fieldId('quote')"
        v-model="form.quote"
        label="Kutipan"
        multiline
        :rows="6"
        :maxlength="LIM.quote"
        required
        :hint="`Kata-kata orang itu sendiri, ${LIM.quoteMin}–${LIM.quote} karakter. Teks biasa — tanda kutip ditambahkan otomatis oleh kartu.`"
        :error="err('quote')"
      />
    </fieldset>

    <fieldset v-if="show('person')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Orang & perusahaan</legend>
      <AdminFormField :id="fieldId('personName')" v-model="form.personName" label="Nama orang" :maxlength="LIM.personName" required :error="err('personName')" />
      <div class="grid gap-4 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('roleTitle')" v-model="form.roleTitle" label="Jabatan" :maxlength="LIM.roleTitle" hint="Sesuai yang diberikan orangnya. Kosongkan kalau tidak tahu — jangan menebak." :error="err('roleTitle')" />
        <AdminFormField :id="fieldId('companyDisplayName')" v-model="form.companyDisplayName" label="Nama perusahaan" :maxlength="LIM.company" hint="Nama perusahaan seperti yang ingin dibaca di bawah kutipan." :error="err('companyDisplayName')" />
      </div>
      <p class="text-xs text-navy-500">
        Baris di bawah kutipan: <strong class="text-navy-700">{{ roleLine || '—' }}</strong>
        <template v-if="legacyRoleLine"> · website sekarang menampilkan “{{ legacyRoleLine }}”</template>
      </p>
      <div>
        <label :for="fieldId('clientId')" class="text-sm font-medium">Terhubung ke klien (opsional)</label>
        <select :id="fieldId('clientId')" v-model="form.clientId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('clientId')" :aria-describedby="`${fieldId('clientId')}-hint`">
          <option value="">Tidak dihubungkan</option>
          <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p :id="`${fieldId('clientId')}-hint`" class="mt-1 text-xs text-navy-500">Dari daftar klien bersama (logo dan detail klien diatur di sana, bukan di sini).</p>
        <p v-if="err('clientId')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('clientId') }}</p>
      </div>
    </fieldset>

    <fieldset v-if="show('media')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Foto</legend>
      <AdminFormImage :id="fieldId('photo')" v-model="form.photo" label="Foto (opsional)" round hint="Foto wajah persegi. Kosong = kartu menampilkan inisial nama." :error="err('photo')" />
      <AdminFormField :id="fieldId('photoAlt')" v-model="form.photoAlt" label="Deskripsi foto untuk pembaca layar (opsional)" :maxlength="LIM.photoAlt" hint="Kosong = foto dianggap dekorasi (namanya sudah tertulis di sebelah foto)." :error="err('photoAlt')" />
    </fieldset>

    <fieldset v-if="show('classification')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Jenis & kategori</legend>
      <div>
        <label :for="fieldId('type')" class="text-sm font-medium">Jenis<span class="text-red-700" aria-hidden="true"> *</span></label>
        <select :id="fieldId('type')" v-model="form.type" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('type')">
          <option v-for="t in TESTIMONIAL_TYPES" :key="t" :value="t">{{ TESTIMONIAL_TYPE_LABELS[t] }}</option>
        </select>
        <p v-if="err('type')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('type') }}</p>
      </div>
      <fieldset>
        <legend class="text-sm font-medium">Kategori (opsional)</legend>
        <div class="mt-1 flex flex-wrap gap-4">
          <label v-for="c in TESTIMONIAL_CATEGORIES" :key="c" class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" class="h-4 w-4" :checked="form.categoryIds.includes(c)" @change="toggleCategory(c)">{{ TESTIMONIAL_CATEGORY_LABELS[c] }}
          </label>
        </div>
        <p v-if="err('categoryIds')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('categoryIds') }}</p>
      </fieldset>
      <fieldset>
        <legend class="text-sm font-medium">Tag (opsional)</legend>
        <ul class="mt-1 flex flex-wrap gap-2">
          <li v-for="(t, i) in form.tags" :key="`${t}-${i}`" class="inline-flex items-center gap-1 rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-xs">
            {{ t }}
            <button type="button" class="rounded px-1 text-navy-500 hover:bg-navy-50" :aria-label="`Hapus tag ${t}`" @click="form.tags.splice(i, 1)">×</button>
          </li>
        </ul>
        <div class="mt-2 flex gap-2">
          <label :for="fieldId('newTag')" class="sr-only">Tag baru</label>
          <input :id="fieldId('newTag')" v-model="newTag" type="text" :maxlength="LIM.tag" class="w-48 rounded-md border border-navy-200 px-3 py-1.5 text-sm" placeholder="Tulis tag lalu Enter" @keydown.enter.prevent="addTag">
          <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="form.tags.length >= LIM.tags" @click="addTag">Tambah</button>
          <span class="self-center text-xs text-navy-500">{{ form.tags.length }}/{{ LIM.tags }}</span>
        </div>
        <p v-if="err('tags')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('tags') }}</p>
      </fieldset>
    </fieldset>

    <fieldset v-if="show('publication')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Tampil & urutan</legend>
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="form.active" type="checkbox" class="h-4 w-4">
        Tampilkan — testimoni yang tidak dicentang tidak pernah tampil di website
      </label>
      <div class="max-w-[12rem]">
        <label :for="fieldId('sortOrder')" class="text-sm font-medium">Urutan bawaan</label>
        <input :id="fieldId('sortOrder')" v-model.number="form.sortOrder" type="number" min="0" max="9999" step="1" class="mt-1 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm" :aria-invalid="!!err('sortOrder')" :aria-describedby="`${fieldId('sortOrder')}-hint`">
        <p :id="`${fieldId('sortOrder')}-hint`" class="mt-1 text-xs text-navy-500">Angka kecil tampil lebih dulu. Halaman yang memilih testimoni tetap memakai urutannya sendiri.</p>
        <p v-if="err('sortOrder')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('sortOrder') }}</p>
      </div>
      <AdminFormField :id="fieldId('sourceNote')" v-model="form.sourceNote" label="Catatan sumber (opsional, internal)" multiline :rows="2" :maxlength="LIM.sourceNote" hint="Hanya untuk admin, tidak pernah tampil. Dari mana kutipan ini (mis. website lama, persetujuan saat meeting). Jangan isi dokumen atau data pribadi." :error="err('sourceNote')" />
    </fieldset>
  </div>
</template>
