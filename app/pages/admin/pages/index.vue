<script setup lang="ts">
// Pages overview. Home is intentionally not listed: the homepage stays
// code-managed (layout, copy composition and motion are too sensitive);
// its shared parts (clients, FAQ, footer CTA) live under Shared Content.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pages' })

const pages = [
  { label: 'Technology', path: '/technology', to: '/admin/pages/technology', body: 'Hero, daftar kemampuan teknologi, dan studi kasus.' },
  { label: 'Creative', path: '/creative', to: '/admin/pages/creative', body: 'Hero, layanan kreatif, Studio Wall, karya pilihan, dan “Kenapa PASTI”.' },
  { label: 'About', path: '/about', to: '/admin/pages/about', body: 'Hero, cerita perusahaan, visi & misi, standar, perjalanan, dan kepemimpinan.' },
  { label: 'Contact', path: '/contact', to: '/admin/pages/contact', body: 'Judul halaman, teks kanal kontak, dan teks form.' }
]
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold">Pages</h1>
    <div class="mt-3 max-w-3xl rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
      <p>Pilih halaman yang mau diubah. Tiap editor menampilkan bagian-bagian halaman sesuai urutannya di website, lengkap dengan tombol <strong>Lihat bagian ini</strong>.</p>
      <p class="mt-1 text-xs text-navy-500">Homepage tidak diedit di sini (dikunci di kode). Bagian homepage yang dipakai bersama — logo klien, FAQ, dan ajakan footer — ada di menu <strong>Shared Content</strong>.</p>
    </div>
    <ul class="mt-6 grid max-w-3xl gap-3">
      <li v-for="p in pages" :key="p.to">
        <NuxtLink :to="p.to" class="flex items-center gap-4 rounded-lg border border-navy-100 bg-white px-5 py-4 hover:border-navy-300 hover:bg-navy-50">
          <div class="min-w-0 flex-1">
            <p class="font-semibold">Halaman {{ p.label }} <code class="ml-1 text-xs font-normal text-navy-500">{{ p.path }}</code></p>
            <p class="mt-0.5 text-sm text-navy-600">{{ p.body }}</p>
          </div>
          <span class="shrink-0 text-sm font-semibold text-slateNavy">Edit →</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
