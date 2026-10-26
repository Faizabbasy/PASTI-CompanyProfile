<script setup lang="ts">
// SEO tab fields, shared by every page editor: what Google shows and the
// card a shared link gets. Same labels and hints everywhere.
withDefaults(
  defineProps<{
    err: (path: string) => string | undefined
    descriptionMax?: number
    // Dotted path of the seo object in the form (error lookup + field ids).
    path?: string
  }>(),
  { descriptionMax: 170, path: 'seo' }
)
const seo = defineModel<{ metaTitle: string; metaDescription: string; ogImage: string; canonicalUrl: string; noIndex: boolean }>({ required: true })
</script>

<template>
  <div class="grid gap-5">
    <AdminFormField :id="fieldId(`${path}.metaTitle`)" v-model="seo.metaTitle" label="Judul di Google (meta title)" :maxlength="70" required hint="Baris biru di hasil pencarian Google dan teks di tab browser." :error="err(`${path}.metaTitle`)" />
    <AdminFormField :id="fieldId(`${path}.metaDescription`)" v-model="seo.metaDescription" label="Deskripsi di Google (meta description)" multiline :rows="3" :maxlength="descriptionMax" required hint="1–2 kalimat di bawah judul di hasil pencarian." :error="err(`${path}.metaDescription`)" />
    <AdminFormImage :id="fieldId(`${path}.ogImage`)" v-model="seo.ogImage" label="Gambar saat link dibagikan" aspect="1200/630" hint="Kartu preview di WhatsApp / LinkedIn / X. Ukuran 1200×630. Kosongkan untuk memakai gambar bawaan." :error="err(`${path}.ogImage`)" />
    <AdminFormField :id="fieldId(`${path}.canonicalUrl`)" v-model="seo.canonicalUrl" label="Canonical URL" inputmode="url" :maxlength="300" hint="Biarkan seperti ini kecuali diminta tim SEO. Kosongkan = alamat halaman ini." :error="err(`${path}.canonicalUrl`)" />
    <label class="inline-flex items-center gap-2 text-sm">
      <input v-model="seo.noIndex" type="checkbox" class="h-4 w-4">
      Sembunyikan dari mesin pencari (noindex)
    </label>
  </div>
</template>
