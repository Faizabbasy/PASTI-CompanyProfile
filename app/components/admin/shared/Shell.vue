<script setup lang="ts">
// Frame for the Shared Content editors (Clients, FAQs, Global CTAs): title,
// a plain-language "how to" and "where it shows", the action bar slot, the
// fields slot, and the list of things that stay in code. Same wording style
// as the product editors.
defineProps<{
  name: string
  // Where on the site this content shows, in plain Indonesian.
  where: string
  flag: string
  migratedVersion?: string | null
  dummy: boolean
  codeManaged: string[]
}>()
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <span>Shared Content</span> <span aria-hidden="true">/</span> {{ name }}
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">{{ name }}</h1>
      <span
        v-if="dummy"
        class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500"
      >Dummy data</span>
      <span
        v-else-if="migratedVersion"
        class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600"
      >Migrated from current site · {{ migratedVersion }}</span>
    </div>

    <div class="mt-3 grid max-w-3xl gap-3">
      <div class="rounded-lg border border-pastiYellow-300 bg-pastiYellow-50 px-4 py-3 text-sm text-navy-700">
        <p><strong>Tampil di:</strong> {{ where }}</p>
      </div>
      <div class="rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
        <p class="font-semibold">Cara pakai</p>
        <ol class="mt-1 list-decimal space-y-0.5 pl-5">
          <li>Ubah isinya di bawah, lalu klik <strong>Save draft</strong>.</li>
          <li>Klik <strong>Preview</strong> untuk melihat hasilnya dengan desain asli.</li>
          <li>Kalau sudah benar, klik <strong>Publish</strong> supaya tampil di website.</li>
        </ol>
        <p class="mt-1 text-xs text-navy-500">Perubahan di sini berlaku di semua halaman yang memakainya. Tampilan, warna dan susunan dikunci supaya halaman tidak rusak.</p>
      </div>
    </div>

    <slot name="status" />

    <div class="mt-6 max-w-3xl">
      <slot />

      <details class="mt-10 rounded-lg border border-navy-100 bg-white px-4 py-3">
        <summary class="cursor-pointer text-sm font-semibold text-navy-700">🔒 Yang tidak bisa diedit di sini</summary>
        <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm text-navy-700">
          <li v-for="(c, i) in codeManaged" :key="i">{{ c }}</li>
        </ul>
      </details>

      <p class="mt-6 text-xs text-navy-400">
        Website memakai konten yang sudah di-publish hanya jika flag server <code>{{ flag }}</code> menyala; kalau tidak, tetap memakai konten bawaan dari kode.
      </p>
    </div>
  </section>
</template>
