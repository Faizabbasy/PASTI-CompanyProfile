<script setup lang="ts">
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create a testimonial as an unpublished draft (approval: needs approval),
// then continue in its editor.
definePageMeta({ layout: 'admin' })
useHead({ title: 'New testimonial · Shared Content' })

const { cmsFetch } = useCmsSession()
const form = ref<TestimonialForm>(emptyTestimonial())
const { errors, err, notice, busy, submit } = useCollectionCreate()

async function create() {
  await submit({
    validate: () => validateTestimonialForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/shared/testimonials', { method: 'POST', body: { content: toTestimonialPayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/shared/testimonials/${res.state.id}`)
  })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      Shared Content <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/shared/testimonials" class="hover:underline">Testimonials</NuxtLink> <span aria-hidden="true">/</span> New
    </nav>
    <h1 class="mt-1 text-2xl font-bold">New testimonial</h1>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Saved as a draft with approval “Needs approval”. It becomes eligible for public display only after an admin publishes it and confirms it for public use.
      Only add real quotes the person agreed to share.
    </p>
    <AdminEditorNotice :notice="notice" />
    <form class="mt-6 max-w-3xl" novalidate @submit.prevent="create">
      <AdminTestimonialsFields :form="form" :err="err" />
      <p v-if="Object.keys(errors).length" class="mt-4 text-sm text-red-700" role="alert">Fix the highlighted fields.</p>
      <button type="submit" class="mt-6 rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy">{{ busy ? 'Creating…' : 'Create draft' }}</button>
    </form>
  </section>
</template>
