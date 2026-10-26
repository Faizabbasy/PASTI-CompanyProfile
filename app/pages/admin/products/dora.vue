<script setup lang="ts">
import { DORA_SECTIONS, DORA_TABS, DoraContentSchema } from '#shared/utils/doraSchema'

// DORA product page editor (shared product editor, field map in doraSchema).
definePageMeta({ layout: 'admin' })
useHead({ title: 'DORA · Products' })

const codeManaged = [
  'Susunan dan desain halaman: urutan bagian, warna, ukuran huruf, animasi, dan jumlah item di setiap daftar.',
  'Judul hero “Turn Documents Into Structured, Verifiable Data.”, tulisan DORA, nama lengkap produk, dan tombol-tombolnya.',
  'Label kecil di kartu/kotak (mis. “Your configuration”, “Actor”, “Result”, “Baseline access”, “Agreed before build”) dan menu mengambang.',
  'Semua data contoh: surat contoh, file upload, hasil OCR, hasil pencarian, angka dashboard, dan contoh jenis dokumen di Model dokumen.',
  'Teks keterangan di bawah contoh layar verifikasi (menjelaskan surat contoh) dan daftar “Baseline access” tiap peran.',
  'Daftar kemampuan internal yang belum dikonfirmasi — sengaja tidak pernah ditampilkan.',
  'Form demo: label kolom, pilihan volume/proses/tantangan, validasi, dan pesan WhatsApp.'
]
</script>

<template>
  <AdminProductEditor
    name="DORA"
    slug="dora"
    public-path="/dora"
    flag="NUXT_CMS_DORA_PUBLIC_ENABLED"
    :sections="DORA_SECTIONS"
    :tabs="DORA_TABS"
    :schema="DoraContentSchema"
    :seo-description-max="170"
    :code-managed="codeManaged"
  />
</template>
