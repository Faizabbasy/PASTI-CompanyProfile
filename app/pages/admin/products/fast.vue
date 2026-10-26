<script setup lang="ts">
import { FAST_SECTIONS, FAST_SEO_DESCRIPTION_MAX, FAST_TABS, FastContentSchema } from '#shared/utils/fastSchema'

// FAST product page editor (shared product editor, field map in fastSchema).
definePageMeta({ layout: 'admin' })
useHead({ title: 'FAST · Products' })

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf, animasi, dan jumlah item di setiap daftar.',
  'Tulisan FAST, nama lengkap “Flexible Advanced Scheduling Technology”, judul hero “Your Production. Your Rules.” dan tombol-tombolnya.',
  'Menu kecil di bawah layar (Overview, Scheduling, …) dan nomor bagian “FAST · 02 / 12”.',
  'Semua contoh data di gambar: scheduling board (order PRD-…, Line A, WC 03…), plan vs actual, feed exception, grafik KPI, heatmap, dan daftar report.',
  'Label status kecil: Fully available / Material shortage, Hard / Soft, Global / Plant / Scenario, Active / Draft / Simulation, Critical / High / …',
  'Aturan yang masih “coming soon” dan daftar kemampuan internal — tidak pernah ditampilkan.',
  'Form demo: label kolom, validasi, dan pesan WhatsApp.'
]
</script>

<template>
  <AdminProductEditor
    name="FAST"
    slug="fast"
    public-path="/fast"
    flag="NUXT_CMS_FAST_PUBLIC_ENABLED"
    :sections="FAST_SECTIONS"
    :tabs="FAST_TABS"
    :schema="FastContentSchema"
    :seo-description-max="FAST_SEO_DESCRIPTION_MAX"
    :code-managed="codeManaged"
  />
</template>
