<script setup lang="ts">
import { MATRIX_SECTIONS, MATRIX_SEO_DESCRIPTION_MAX, MATRIX_TABS, MatrixContentSchema } from '#shared/utils/matrixSchema'

// MATRIX product page editor (shared product editor, field map in matrixSchema).
definePageMeta({ layout: 'admin' })
useHead({ title: 'MATRIX · Products' })

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf, animasi, dan jumlah item di setiap daftar.',
  'Judul hero “Material certainty is operational certainty.” dan nama lengkap produk.',
  'Penanda rak di kiri layar (LOC A-01 … C-04) dan label kecil tiap bagian.',
  'Semua data contoh: material MTX-0412, bar stok, lokasi, serial, ledger, audit trail, daftar aging, zona gudang, dan pasokan masuk.',
  'Isi kartu aging (rentang umur, barang, bukti keputusan) dan denah warehouse explorer — hanya judul bagiannya yang bisa diubah.',
  'Daftar kemampuan internal (register) — tidak pernah tampil di halaman.',
  'Form demo: label kolom, pilihan jumlah gudang, validasi, dan pesan WhatsApp.'
]
</script>

<template>
  <AdminProductEditor
    name="MATRIX"
    slug="matrix"
    public-path="/matrix"
    flag="NUXT_CMS_MATRIX_PUBLIC_ENABLED"
    :sections="MATRIX_SECTIONS"
    :tabs="MATRIX_TABS"
    :schema="MatrixContentSchema"
    :seo-description-max="MATRIX_SEO_DESCRIPTION_MAX"
    :code-managed="codeManaged"
  />
</template>
