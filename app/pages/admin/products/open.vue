<script setup lang="ts">
import { OPEN_SECTIONS, OPEN_SEO_DESCRIPTION_MAX, OPEN_TABS, OpenContentSchema } from '#shared/utils/openSchema'

// OPEN product page editor (shared product editor, field map in openSchema).
definePageMeta({ layout: 'admin' })
useHead({ title: 'OPEN · Products' })

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf, animasi, dan jumlah item di setiap daftar.',
  'Label kecil tiap bagian (mis. “03 / 12 · Not another SaaS”) dan sub-judul kecil seperti “Key capabilities”.',
  'Logo O+PEN di hero.',
  'Ilustrasi: kartu procurement di hero, contoh approval, tabel audit log, dan dashboard monitoring.',
  'Tab modul yang dibuka tiap titik ekosistem, kode metode procurement dan diagram sampulnya.',
  'Form demo: label kolom, validasi, dan pesan WhatsApp yang dikirim.',
  'Menu mengambang dan tombol “Request a Demo” lainnya.'
]
</script>

<template>
  <AdminProductEditor
    name="OPEN"
    slug="open"
    public-path="/open"
    flag="NUXT_CMS_OPEN_PUBLIC_ENABLED"
    :sections="OPEN_SECTIONS"
    :tabs="OPEN_TABS"
    :schema="OpenContentSchema"
    :seo-description-max="OPEN_SEO_DESCRIPTION_MAX"
    :code-managed="codeManaged"
  />
</template>
