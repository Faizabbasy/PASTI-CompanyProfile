<script setup lang="ts">
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create a project as an unpublished draft, then continue in its editor.
definePageMeta({ layout: 'admin' })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()
useHead({ title: 'New project · Work' })

const { cmsFetch } = useCmsSession()
const form = ref<ProjectForm>(emptyProject())
const { errors, err, notice, busy, submit } = useCollectionCreate()

async function create() {
  await submit({
    validate: () => validateProjectForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/work/projects', { query: { lang }, method: 'POST', body: { content: toProjectPayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/work/projects/${res.state.id}?lang=${lang}`)
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink :to="`/admin/work?lang=${lang}`" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink :to="`/admin/work/projects?lang=${lang}`" class="hover:underline">Projects</NuxtLink> <span aria-hidden="true">/</span> Baru
    </nav>
    <h1 class="mt-1 text-2xl font-bold">Proyek baru</h1>
    <div class="mt-3 max-w-3xl rounded-lg border border-navy-100 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
      <p class="font-semibold">Cara pakai</p>
      <ol class="mt-1 list-decimal space-y-0.5 pl-5">
        <li>Isi data di bawah, lalu klik <strong>Buat draft</strong>. Proyek tersimpan sebagai draft dan belum tampil di website.</li>
        <li>Setelah itu kamu dibawa ke editor proyek untuk mengecek dan mem-<strong>Publish</strong>-nya.</li>
        <li>Terakhir, pilih proyeknya di <NuxtLink :to="`/admin/work?lang=${lang}`" class="underline">Work → Work page</NuxtLink> supaya tampil di <code>/work</code>.</li>
      </ol>
    </div>
    <AdminEditorNotice :notice="notice" />
    <form class="mt-6 max-w-3xl" novalidate @submit.prevent="create">
      <AdminWorkProjectFields :form="form" :err="err" />
      <p v-if="Object.keys(errors).length" class="mt-4 text-sm text-red-700" role="alert">Perbaiki kolom yang ditandai merah.</p>
      <button type="submit" class="mt-6 rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Membuat…' : 'Buat draft' }}</button>
    </form>
  </section>
</template>
