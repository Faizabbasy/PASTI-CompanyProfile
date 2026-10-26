<script setup lang="ts">
import { SHIFTLY_SECTIONS, SHIFTLY_SEO_DESCRIPTION_MAX, SHIFTLY_TABS, ShiftlyContentSchema } from '#shared/utils/shiftlySchema'

// SHIFTLY product page editor (shared product editor, field map in shiftlySchema).
definePageMeta({ layout: 'admin' })
useHead({ title: 'SHIFTLY · Products' })

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf, animasi, dan jumlah item di setiap daftar.',
  'Judul hero “Everything HR, Simplified.” dan tombol-tombolnya.',
  'Label kecil tiap bagian (mis. “Platform · More than just HRIS”) dan teks petunjuk kecil.',
  'Tanda “In SHIFTLY Standard / Additional module” tiap modul, ikon perangkat & arsitektur, dan ikon di tabel perbandingan.',
  'Contoh tampilan branding (mock-up) dan menu mengambang.',
  'Data harga — belum disetujui untuk tampil, jadi tidak ditampilkan di halaman.',
  'Form demo: label kolom, pilihan jumlah karyawan, validasi, dan pesan WhatsApp.'
]
</script>

<template>
  <AdminProductEditor
    name="SHIFTLY"
    slug="shiftly"
    public-path="/shiftly"
    flag="NUXT_CMS_SHIFTLY_PUBLIC_ENABLED"
    :sections="SHIFTLY_SECTIONS"
    :tabs="SHIFTLY_TABS"
    :schema="ShiftlyContentSchema"
    :seo-description-max="SHIFTLY_SEO_DESCRIPTION_MAX"
    :code-managed="codeManaged"
  />
</template>
