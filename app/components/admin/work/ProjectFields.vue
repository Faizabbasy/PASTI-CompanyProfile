<script setup lang="ts">
import { PROJECT_LIMITS as LIM } from '#shared/utils/projectSchema'

// Project identity + work-card fields, shared by the create and edit pages.
// `tab` limits the rendered group (edit page tabs); omit it to show all.
const props = defineProps<{ form: ProjectForm; err: (path: string) => string | undefined; tab?: 'identity' | 'card'; publishedSlug?: string | null }>()
const show = (t: 'identity' | 'card') => !props.tab || props.tab === t
const slugChanged = computed(() => !!props.publishedSlug && props.form.slug !== props.publishedSlug)

function suggestSlug() {
  if (props.form.slug) return
  props.form.slug = props.form.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}
</script>

<template>
  <div class="grid gap-5">
    <template v-if="show('identity')">
      <AdminFormField :id="fieldId('name')" v-model="form.name" label="Project name" :maxlength="LIM.name" required :error="err('name')" @focusout="suggestSlug" />
      <div>
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug" :maxlength="60" required hint="Lowercase letters, numbers and hyphens. Unique; used as the card's deep link for new projects (/work#work-<slug>)." :error="err('slug')" />
        <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
          The published slug is “{{ publishedSlug }}”. Changing it can break existing links once published.
        </p>
      </div>
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('clientDisplayName')" v-model="form.clientDisplayName" label="Client display name (optional)" :maxlength="LIM.client" hint="Temporary until Shared Clients exists. Only names the client has approved for public use." :error="err('clientDisplayName')" />
        <AdminFormField :id="fieldId('year')" v-model="form.year" label="Year (optional)" :maxlength="4" hint="4 digits. Leave empty if unknown — never guess." :error="err('year')" />
      </div>
      <AdminFormField :id="fieldId('category')" v-model="form.category" label="Category" :maxlength="LIM.category" required :error="err('category')" />
    </template>

    <template v-if="show('card')">
      <AdminFormField :id="fieldId('shortDescription')" v-model="form.shortDescription" label="Short description" multiline :maxlength="LIM.description" required hint="Shown on the index card (two lines in the grid, full in the list)." :error="err('shortDescription')" />
      <AdminFormField :id="fieldId('filterGroup')" v-model="form.filterGroup" label="Filter group" :maxlength="LIM.filterGroup" required hint="The index filter chip this project belongs to (e.g. Commerce, Wellness)." :error="err('filterGroup')" />
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormImage :id="fieldId('poster')" v-model="form.poster" label="Poster image" required aspect="4/5" hint="Approved public image — shown 4:5 in the deck and index. No confidential screenshots." :error="err('poster')" />
        <AdminFormField :id="fieldId('posterAlt')" v-model="form.posterAlt" label="Poster alt text" :maxlength="LIM.alt" required :error="err('posterAlt')" />
      </div>
    </template>
  </div>
</template>
