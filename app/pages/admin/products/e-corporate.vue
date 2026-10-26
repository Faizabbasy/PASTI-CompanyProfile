<script setup lang="ts">
import { ECORPORATE_SECTIONS, ECORPORATE_TABS, EcorporateContentSchema } from '#shared/utils/ecorporateSchema'

// e-CORPORATE product page editor (shared product editor, field map in ecorporateSchema).
definePageMeta({ layout: 'admin' })
useHead({ title: 'e-CORPORATE · Products' })

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf, animasi, dan jumlah item di setiap daftar.',
  'Tiga kata hero “people / processes / information” — terhubung ke sorotan di ilustrasi hero.',
  'Judul tiap bagian (mis. “What the environment brings together”), label kecil, dan tulisan dekoratif besar (“e-CORPORATE”, “ADAPT”, “06 → 01”).',
  'Ilustrasi: tampilan aplikasi di hero dan kartu “Approval trail”.',
  'Ikon area kemampuan dan diagram tiga tingkat integrasi.',
  'Tombol hero, tautan “About PASTI”, dan menu mengambang.',
  'Form demo: label kolom, validasi, dan pesan WhatsApp.'
]
</script>

<template>
  <AdminProductEditor
    name="e-CORPORATE"
    slug="e-corporate"
    public-path="/e-corporate"
    flag="NUXT_CMS_ECORPORATE_PUBLIC_ENABLED"
    :sections="ECORPORATE_SECTIONS"
    :tabs="ECORPORATE_TABS"
    :schema="EcorporateContentSchema"
    :seo-description-max="170"
    :code-managed="codeManaged"
  />
</template>
