<script setup lang="ts">
import { ARTICLE_LIMITS as LIM, PERSPECTIVE_REFS } from '#shared/utils/insightsSchema'
import type { CategoryListRow } from '#shared/utils/insightsSchema'

// Article fields grouped by editor tab (Basics / Content / Media / Body).
// Shared by the create page (all groups) and the edit page (one per tab).
const props = defineProps<{
  form: ArticleForm
  err: (path: string) => string | undefined
  categories: CategoryListRow[]
  tab?: 'basics' | 'content' | 'media' | 'body'
  publishedSlug?: string | null
}>()
const show = (t: 'basics' | 'content' | 'media' | 'body') => !props.tab || props.tab === t
const slugChanged = computed(() => !!props.publishedSlug && props.form.slug !== props.publishedSlug)
const usable = computed(() => props.categories.filter((c) => c.status !== 'archived'))
const catLabel = (id: string) => props.categories.find((c) => c.id === id)?.name ?? `Unknown (${id})`

function suggestSlug() {
  if (!props.form.slug) props.form.slug = slugFrom(`${props.form.headline.text} ${props.form.headline.accent}`.trim() || props.form.title)
}
function toggleCategory(id: string, on: boolean) {
  const list = props.form.categoryIds
  if (on && !list.includes(id)) list.push(id)
  if (!on) list.splice(list.indexOf(id), 1)
}
function moveCategory(i: number, d: number) {
  const list = props.form.categoryIds
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}
</script>

<template>
  <div class="grid gap-5">
    <template v-if="show('basics')">
      <AdminFormField :id="fieldId('title')" v-model="form.title" label="Title" :maxlength="LIM.title" required hint="Plain title — used for the reader label, “Now showing” and “Next”." :error="err('title')" />
      <div>
        <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug" :maxlength="60" required hint="Unique, lowercase-with-hyphens. Reserved for the future article URL (/insights/<slug>)." :error="err('slug')" @focus="suggestSlug" />
        <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
          The published slug is “{{ publishedSlug }}”. Changing it changes the article's future public URL once published.
        </p>
      </div>
      <fieldset class="grid gap-3">
        <legend class="text-sm font-medium">Display headline</legend>
        <p class="text-xs text-navy-500">The accent part renders in yellow after the main text.</p>
        <div class="grid gap-4 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('headline.text')" v-model="form.headline.text" label="Headline" :maxlength="LIM.headline" required :error="err('headline.text')" />
          <AdminFormField :id="fieldId('headline.accent')" v-model="form.headline.accent" label="Accent (optional)" :maxlength="LIM.accent" :error="err('headline.accent')" />
        </div>
      </fieldset>
      <fieldset class="grid gap-3">
        <legend class="text-sm font-medium">Tagline (optional)</legend>
        <div class="grid gap-4 tablet:grid-cols-2">
          <AdminFormField :id="fieldId('tagline.text')" v-model="form.tagline.text" label="Tagline" :maxlength="LIM.tagline" :error="err('tagline.text')" />
          <AdminFormField :id="fieldId('tagline.accent')" v-model="form.tagline.accent" label="Accent" :maxlength="LIM.tagline" :error="err('tagline.accent')" />
        </div>
      </fieldset>
      <AdminFormField :id="fieldId('kicker')" v-model="form.kicker" label="Kicker" :maxlength="LIM.kicker" required hint="Small label next to the topic, e.g. Security." :error="err('kicker')" />
      <fieldset :id="fieldId('categoryIds')" tabindex="-1" class="grid gap-2">
        <legend class="text-sm font-medium">Categories (topics)<span class="text-red-700" aria-hidden="true"> *</span></legend>
        <p class="text-xs text-navy-500">Up to {{ LIM.categories }}. The first is the topic shown on the article; all are used by the filter.</p>
        <p v-if="err('categoryIds')" class="text-xs font-medium text-red-700" role="alert">{{ err('categoryIds') }}</p>
        <div class="flex flex-wrap gap-3">
          <label v-for="c in usable" :key="c.id" class="inline-flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-1.5 text-sm">
            <input type="checkbox" class="h-4 w-4" :checked="form.categoryIds.includes(c.id)" :disabled="!form.categoryIds.includes(c.id) && form.categoryIds.length >= LIM.categories" @change="toggleCategory(c.id, ($event.target as HTMLInputElement).checked)">
            {{ c.name }}<span v-if="!c.active" class="text-[11px] text-navy-500">(inactive)</span><span v-if="c.status !== 'published'" class="text-[11px] text-navy-500">· {{ c.status }}</span>
          </label>
        </div>
        <ol v-if="form.categoryIds.length > 1" class="mt-1 flex flex-wrap gap-2 text-xs">
          <li v-for="(id, i) in form.categoryIds" :key="id" class="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-1">
            {{ i === 0 ? 'Primary: ' : '' }}{{ catLabel(id) }}
            <button type="button" class="px-1 disabled:opacity-40" :disabled="i === 0" :aria-label="`Move ${catLabel(id)} earlier`" @click="moveCategory(i, -1)">←</button>
          </li>
        </ol>
        <p v-for="(id, i) in form.categoryIds" v-show="err(`categoryIds.${i}`)" :key="`e-${id}`" class="text-xs text-red-700" role="alert">{{ catLabel(id) }}: {{ err(`categoryIds.${i}`) }}</p>
      </fieldset>
    </template>

    <template v-if="show('content')">
      <AdminFormField :id="fieldId('excerpt')" v-model="form.excerpt" label="Excerpt / lead" multiline :maxlength="LIM.excerpt" required hint="Shown in the contents preview and as the reader's lead paragraph." :error="err('excerpt')" />
      <AdminFormStringList legend="“In this insight” points" path="points" :items="form.points" :max="LIM.points" :maxlength="LIM.point" item-label="Point" add-label="Add point" :err="err" hint="2–4 short topics, or none to hide the grid." />
      <fieldset class="grid gap-3 rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-medium">PASTI perspective (optional)</legend>
        <div>
          <label :for="fieldId('perspective.sourceRef')" class="text-sm font-medium">Source</label>
          <select :id="fieldId('perspective.sourceRef')" v-model="form.perspective.sourceRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
            <option value="">None</option>
            <option v-for="r in PERSPECTIVE_REFS" :key="r" :value="r">{{ PERSPECTIVE_LABELS[r] }}</option>
          </select>
          <p class="mt-1 text-xs text-navy-500">The pull quote is read from that shared company content — edit it there, not here.</p>
          <p v-if="err('perspective.sourceRef')" class="mt-1 text-xs text-red-700" role="alert">{{ err('perspective.sourceRef') }}</p>
        </div>
        <p v-if="err('perspective.links')" class="text-xs font-medium text-red-700" role="alert">{{ err('perspective.links') }}</p>
        <div v-for="(l, k) in form.perspective.links" :key="k" class="grid gap-3 rounded-md border border-navy-100 p-3 tablet:grid-cols-[1fr_1fr_auto]">
          <AdminFormField :id="fieldId(`perspective.links.${k}.label`)" v-model="l.label" :label="`Link ${k + 1} label`" :maxlength="LIM.linkLabel" required :error="err(`perspective.links.${k}.label`)" />
          <AdminFormField :id="fieldId(`perspective.links.${k}.url`)" v-model="l.url" label="Link" inputmode="url" :maxlength="500" required hint="e.g. /work#case-textile" :error="err(`perspective.links.${k}.url`)" />
          <button type="button" class="mt-6 self-start rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50" @click="form.perspective.links.splice(k, 1)">Remove</button>
        </div>
        <div>
          <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="!form.perspective.sourceRef || form.perspective.links.length >= LIM.links" @click="form.perspective.links.push({ label: '', url: '' })">+ Add link</button>
        </div>
      </fieldset>
    </template>

    <template v-if="show('media')">
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('coverImage')" v-model="form.coverImage" label="Cover poster" :maxlength="200" required hint="Approved image under /images/ (4:5 poster)." :error="err('coverImage')" />
        <AdminFormField :id="fieldId('coverImageAlt')" v-model="form.coverImageAlt" label="Cover alt text" :maxlength="LIM.alt" required :error="err('coverImageAlt')" />
      </div>
      <AdminFormField :id="fieldId('coverFocus')" v-model="form.coverFocus" label="Focal point" :maxlength="16" required hint="“x% y%” of the poster's visual — the reader cover crops to it (e.g. 74.5% 48%)." :error="err('coverFocus')" />
      <img v-if="form.coverImage && !err('coverImage')" :src="form.coverImage" alt="" class="aspect-[4/5] w-40 rounded-lg object-cover ring-1 ring-navy-100" :style="{ objectPosition: form.coverFocus }">
    </template>

    <template v-if="show('body')">
      <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
        Prepared for a future article page (/insights/&lt;slug&gt;). Nothing in this tab is shown publicly yet. Never invent an author or a date.
      </p>
      <div class="grid gap-5 tablet:grid-cols-2">
        <AdminFormField :id="fieldId('authorName')" v-model="form.authorName" label="Author (optional)" :maxlength="LIM.author" :error="err('authorName')" />
        <AdminFormField :id="fieldId('publishDate')" v-model="form.publishDate" label="Editorial date (optional)" :maxlength="10" placeholder="YYYY-MM-DD" hint="Display date only — publishing is still done by an admin; there is no scheduling." :error="err('publishDate')" />
      </div>
      <AdminInsightsBodyEditor :blocks="form.body" :err="err" />
    </template>
  </div>
</template>
