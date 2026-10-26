<script setup lang="ts">
import { TESTIMONIAL_CATEGORIES, TESTIMONIAL_LIMITS as LIM, TESTIMONIAL_TYPES } from '#shared/utils/testimonialSchema'
import { testimonialRoleLine } from '#shared/utils/testimonialPublic'

// Testimonial content fields, shared by the create page and the record
// editor. `tab` limits the output to one editor tab; without it (create
// page) every section renders in order. Content only — card layout, quote
// marks, avatar shape and motion are owned by the components.
const props = defineProps<{ form: TestimonialForm; err: (path: string) => string | undefined; tab?: string; legacyRoleLine?: string | null }>()
const show = (t: string) => !props.tab || props.tab === t
const clients = testimonialClientOptions()
const roleLine = computed(() => testimonialRoleLine(props.form))
const newTag = ref('')
function addTag() {
  const t = newTag.value.trim()
  if (t && props.form.tags.length < LIM.tags) props.form.tags.push(t)
  newTag.value = ''
}
function toggleCategory(c: (typeof TESTIMONIAL_CATEGORIES)[number]) {
  const list = props.form.categoryIds
  const i = list.indexOf(c)
  if (i >= 0) list.splice(i, 1)
  else list.push(c)
}
</script>

<template>
  <div class="grid gap-8">
    <fieldset v-if="show('quote')" class="grid gap-3">
      <legend v-if="!tab" class="text-base font-semibold">Quote</legend>
      <AdminFormField
        :id="fieldId('quote')"
        v-model="form.quote"
        label="Quote"
        multiline
        :rows="6"
        :maxlength="LIM.quote"
        required
        :hint="`The person's own words, ${LIM.quoteMin}–${LIM.quote} characters. Plain text — the cards add the quote marks.`"
        :error="err('quote')"
      />
    </fieldset>

    <fieldset v-if="show('person')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Person</legend>
      <AdminFormField :id="fieldId('personName')" v-model="form.personName" label="Person name" :maxlength="LIM.personName" required :error="err('personName')" />
      <div class="grid gap-4 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('roleTitle')" v-model="form.roleTitle" label="Job title" :maxlength="LIM.roleTitle" hint="As the person gave it. Leave empty if unknown — never guess." :error="err('roleTitle')" />
        <AdminFormField :id="fieldId('companyDisplayName')" v-model="form.companyDisplayName" label="Company (display name)" :maxlength="LIM.company" hint="The company as it should read under the quote." :error="err('companyDisplayName')" />
      </div>
      <p class="text-xs text-navy-500">
        Attribution line: <strong class="text-navy-700">{{ roleLine || '—' }}</strong>
        <template v-if="legacyRoleLine"> · current site shows “{{ legacyRoleLine }}”</template>
      </p>
      <div>
        <label :for="fieldId('clientId')" class="text-sm font-medium">Linked client (optional)</label>
        <select :id="fieldId('clientId')" v-model="form.clientId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('clientId')" :aria-describedby="`${fieldId('clientId')}-hint`">
          <option value="">Not linked</option>
          <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p :id="`${fieldId('clientId')}-hint`" class="mt-1 text-xs text-navy-500">From the shared client list (logos and client details live there, not here).</p>
        <p v-if="err('clientId')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('clientId') }}</p>
      </div>
    </fieldset>

    <fieldset v-if="show('media')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Media</legend>
      <div class="flex items-start gap-4">
        <img v-if="form.photo && !err('photo')" :src="form.photo" alt="" class="mt-6 h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-navy-200">
        <span v-else aria-hidden="true" class="mt-6 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy-50 text-xs font-semibold text-navy-500">{{ (form.personName || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('') }}</span>
        <div class="flex-1">
          <AdminFormField :id="fieldId('photo')" v-model="form.photo" label="Photo (optional)" :maxlength="200" hint="Image path under /images/ (webp, jpg, png, avif), e.g. /images/testimonials/name.webp. Empty = the card's initials fallback." :error="err('photo')" />
        </div>
      </div>
      <AdminFormField :id="fieldId('photoAlt')" v-model="form.photoAlt" label="Photo alt text (optional)" :maxlength="LIM.photoAlt" hint="Empty = decorative: the name is printed next to the photo." :error="err('photoAlt')" />
    </fieldset>

    <fieldset v-if="show('classification')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Classification</legend>
      <div>
        <label :for="fieldId('type')" class="text-sm font-medium">Type<span class="text-red-700" aria-hidden="true"> *</span></label>
        <select :id="fieldId('type')" v-model="form.type" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('type')">
          <option v-for="t in TESTIMONIAL_TYPES" :key="t" :value="t">{{ TESTIMONIAL_TYPE_LABELS[t] }}</option>
        </select>
        <p v-if="err('type')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('type') }}</p>
      </div>
      <fieldset>
        <legend class="text-sm font-medium">Categories (optional)</legend>
        <div class="mt-1 flex flex-wrap gap-4">
          <label v-for="c in TESTIMONIAL_CATEGORIES" :key="c" class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" class="h-4 w-4" :checked="form.categoryIds.includes(c)" @change="toggleCategory(c)">{{ TESTIMONIAL_CATEGORY_LABELS[c] }}
          </label>
        </div>
        <p v-if="err('categoryIds')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('categoryIds') }}</p>
      </fieldset>
      <fieldset>
        <legend class="text-sm font-medium">Tags (optional)</legend>
        <ul class="mt-1 flex flex-wrap gap-2">
          <li v-for="(t, i) in form.tags" :key="`${t}-${i}`" class="inline-flex items-center gap-1 rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-xs">
            {{ t }}
            <button type="button" class="rounded px-1 text-navy-500 hover:bg-navy-50" :aria-label="`Remove tag ${t}`" @click="form.tags.splice(i, 1)">×</button>
          </li>
        </ul>
        <div class="mt-2 flex gap-2">
          <label :for="fieldId('newTag')" class="sr-only">New tag</label>
          <input :id="fieldId('newTag')" v-model="newTag" type="text" :maxlength="LIM.tag" class="w-48 rounded-md border border-navy-200 px-3 py-1.5 text-sm" placeholder="Add a tag" @keydown.enter.prevent="addTag">
          <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="form.tags.length >= LIM.tags" @click="addTag">Add</button>
          <span class="self-center text-xs text-navy-500">{{ form.tags.length }}/{{ LIM.tags }}</span>
        </div>
        <p v-if="err('tags')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('tags') }}</p>
      </fieldset>
    </fieldset>

    <fieldset v-if="show('publication')" class="grid gap-4">
      <legend v-if="!tab" class="text-base font-semibold">Publication</legend>
      <label class="inline-flex items-center gap-2 text-sm">
        <input v-model="form.active" type="checkbox" class="h-4 w-4">
        Active — inactive testimonials are never shown publicly
      </label>
      <div class="max-w-[12rem]">
        <label :for="fieldId('sortOrder')" class="text-sm font-medium">Default order</label>
        <input :id="fieldId('sortOrder')" v-model.number="form.sortOrder" type="number" min="0" max="9999" step="1" class="mt-1 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm" :aria-invalid="!!err('sortOrder')" :aria-describedby="`${fieldId('sortOrder')}-hint`">
        <p :id="`${fieldId('sortOrder')}-hint`" class="mt-1 text-xs text-navy-500">Lower first. Pages keep their own order.</p>
        <p v-if="err('sortOrder')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('sortOrder') }}</p>
      </div>
      <AdminFormField :id="fieldId('sourceNote')" v-model="form.sourceNote" label="Internal source note (optional)" multiline :rows="2" :maxlength="LIM.sourceNote" hint="Admin-only, never public. Where the quote came from (e.g. current site, meeting approval). No documents or personal data." :error="err('sourceNote')" />
    </fieldset>
  </div>
</template>
