<script setup lang="ts">
import { INSIGHTS_LIMITS as LIM, type ArticleListRow, type CategoryListRow, type InsightsAdminState } from '#shared/utils/insightsSchema'

// Insights landing singleton editor. Masthead copy plus which articles the
// issue lists (order + active) and which topic filters appear. Article and
// category content live in their own records and are only referenced here.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Insights page · Insights' })

const { cmsFetch } = useCmsSession()
const { data: articleRows } = await useAsyncData('admin-insights-article-options', () => cmsFetch<ArticleListRow[]>('/api/admin/insights/articles'))
const { data: categoryRows } = await useAsyncData('admin-insights-category-options', () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<InsightsAdminState, InsightsForm>({
  name: 'the Insights page',
  endpoint: '/api/admin/insights',
  asyncKey: 'admin-insights',
  tabs: INSIGHTS_TABS,
  toForm: toInsightsForm,
  toPayload: toInsightsPayload,
  validate: validateInsightsForm
})

const articleOptions = computed(() => (articleRows.value ?? []).filter((a) => a.status !== 'archived'))
const categoryOptions = computed(() => (categoryRows.value ?? []).filter((c) => c.status !== 'archived'))
const articleById = (id: string) => articleRows.value?.find((a) => a.id === id)
const categoryById = (id: string) => categoryRows.value?.find((c) => c.id === id)
const articleLabel = (id: string) => articleById(id)?.title ?? `Unknown article (${id})`
const categoryLabel = (id: string) => categoryById(id)?.name ?? `Unknown category (${id})`

function addArticle() {
  const items = form.value!.contents.items
  const used = new Set(items.map((i) => i.articleId))
  const next = articleOptions.value.find((a) => !used.has(a.id))
  if (next) items.push({ _key: newKey(), articleId: next.id, sortOrder: items.length + 1, active: true })
}
function addFilter() {
  const items = form.value!.filters.items
  const used = new Set(items.map((i) => i.categoryId))
  const next = categoryOptions.value.find((c) => !used.has(c.id))
  if (next) items.push({ _key: newKey(), categoryId: next.id, sortOrder: items.length + 1, active: true })
}

const unpublishedSelected = computed(() => {
  const f = form.value
  if (!f) return []
  return [
    ...f.contents.items.filter((i) => i.active && articleById(i.articleId)?.status !== 'published').map((i) => articleLabel(i.articleId)),
    ...f.filters.items.filter((i) => i.active && categoryById(i.categoryId)?.status !== 'published').map((i) => `Category ${categoryLabel(i.categoryId)}`)
  ]
})
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">Insights <span aria-hidden="true">/</span> Insights page</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Insights page</h1>
      <span v-if="state?.dummy !== false" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
      <span v-else-if="state?.source.kind === 'migration'" class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">Migrated from current site · {{ state.source.version }}</span>
    </div>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Singleton page. Choose which <NuxtLink to="/admin/insights/articles" class="underline">articles</NuxtLink> the issue lists and which
      <NuxtLink to="/admin/insights/categories" class="underline">topics</NuxtLink> can filter it. The public <code>/insights</code> page uses published CMS content only when the
      server flag <code>NUXT_CMS_INSIGHTS_PUBLIC_ENABLED</code> is on. The homepage Insights section is code-managed and never reads this.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading Insights page…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the Insights page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/insights"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />
      <p v-if="unpublishedSelected.length" class="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
        Not published yet (publish them, or set them inactive, before publishing this page): {{ unpublishedSelected.join(' · ') }}
      </p>

      <AdminEditorTabs v-model="activeTab" :tabs="INSIGHTS_TABS" label="Insights page sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HERO -->
        <div v-show="activeTab === 'hero'" id="panel-hero" role="tabpanel" aria-labelledby="tab-hero" class="grid gap-5">
          <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Eyebrow" :maxlength="LIM.eyebrow" required hint="Hero marker label; the article / topic counts next to it are automatic." :error="err('hero.eyebrow')" />
          <AdminFormField :id="fieldId('hero.headline')" v-model="form.hero.headline" label="Headline (one word)" :maxlength="LIM.headlineWord" required hint="Set at hero size with its letters filled by the article posters. The yellow period is added by the design." :error="err('hero.headline')" />
          <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Supporting copy" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Primary CTA label" :maxlength="LIM.ctaLabel" required hint="Scrolls to the contents (code-managed)." :error="err('hero.primaryCtaLabel')" />
            <div />
            <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Secondary CTA label" :maxlength="LIM.ctaLabel" required :error="err('hero.secondaryCtaLabel')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaUrl')" v-model="form.hero.secondaryCtaUrl" label="Secondary CTA link" inputmode="url" :maxlength="500" required hint="/path, #anchor, https://, mailto: or tel:." :error="err('hero.secondaryCtaUrl')" />
          </div>
          <p class="text-xs text-navy-500">The poster stack and the letter fill use the covers of the listed articles — there is no separate hero image.</p>
        </div>

        <!-- CONTENTS -->
        <div v-show="activeTab === 'contents'" id="panel-contents" role="tabpanel" aria-labelledby="tab-contents" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('contents.sectionLabel')" v-model="form.contents.sectionLabel" label="Section label" :maxlength="LIM.sectionLabel" required :error="err('contents.sectionLabel')" />
            <AdminFormField :id="fieldId('contents.title')" v-model="form.contents.title" label="Title" :maxlength="LIM.title" required hint="The yellow period is added by the design." :error="err('contents.title')" />
          </div>
          <p class="text-xs text-navy-500">
            Up to {{ LIM.articlesActive }} active articles; numbering (01, 02…) follows the order and the first one opens its preview by default.
            Title, cover, excerpt and topic come from each article record.
          </p>
          <AdminFormRepeater legend="Articles in this issue" :items="form.contents.items" :max="LIM.articles" :published-ids="publishedIds" :item-title="(i) => articleLabel(i.articleId)" add-label="Add article" :error="err('contents.items')" @add="addArticle">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`contents.items.${index}.articleId`)" class="text-sm font-medium">Article<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`contents.items.${index}.articleId`)" v-model="item.articleId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`contents.items.${index}.articleId`)">
                  <option v-if="!articleById(item.articleId)" :value="item.articleId">{{ articleLabel(item.articleId) }}</option>
                  <option v-for="a in articleOptions" :key="a.id" :value="a.id">{{ a.title }} · {{ a.status }}{{ a.dummy ? ' · demo' : '' }}</option>
                </select>
                <p v-if="err(`contents.items.${index}.articleId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`contents.items.${index}.articleId`) }}</p>
                <p v-if="articleById(item.articleId)" class="mt-1 flex items-center gap-2 text-xs text-navy-500">
                  <AdminStatusBadge :status="articleById(item.articleId)!.status" />
                  {{ articleById(item.articleId)!.categories.join(', ') }}
                  <NuxtLink :to="`/admin/insights/articles/${item.articleId}`" class="underline">Edit article</NuxtLink>
                </p>
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- FILTERS -->
        <div v-show="activeTab === 'filters'" id="panel-filters" role="tabpanel" aria-labelledby="tab-filters" class="grid gap-5">
          <p class="text-xs text-navy-500">
            Topic chips after “All”, in this order. A chip appears only when the category is published and active and at least one listed article uses it.
            Category names are edited in <NuxtLink to="/admin/insights/categories" class="underline">Categories</NuxtLink>.
          </p>
          <AdminFormRepeater legend="Topic filters" :items="form.filters.items" :max="LIM.filters" :published-ids="publishedIds" :item-title="(i) => categoryLabel(i.categoryId)" add-label="Add topic" :error="err('filters.items')" @add="addFilter">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`filters.items.${index}.categoryId`)" class="text-sm font-medium">Category<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`filters.items.${index}.categoryId`)" v-model="item.categoryId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                  <option v-if="!categoryById(item.categoryId)" :value="item.categoryId">{{ categoryLabel(item.categoryId) }}</option>
                  <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.name }} · {{ c.status }}{{ c.active ? '' : ' · inactive' }}</option>
                </select>
                <p v-if="err(`filters.items.${index}.categoryId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`filters.items.${index}.categoryId`) }}</p>
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- SEO -->
        <div v-show="activeTab === 'seo'" id="panel-seo" role="tabpanel" aria-labelledby="tab-seo" class="grid gap-5">
          <AdminFormField :id="fieldId('seo.metaTitle')" v-model="form.seo.metaTitle" label="Meta title" :maxlength="70" required :error="err('seo.metaTitle')" />
          <AdminFormField :id="fieldId('seo.metaDescription')" v-model="form.seo.metaDescription" label="Meta description" multiline :rows="2" :maxlength="170" required :error="err('seo.metaDescription')" />
          <AdminFormField :id="fieldId('seo.ogImage')" v-model="form.seo.ogImage" label="Share image" :maxlength="200" hint="Image path under /images/ (1200×630). Empty = current share card." :error="err('seo.ogImage')" />
          <AdminFormField :id="fieldId('seo.canonicalUrl')" v-model="form.seo.canonicalUrl" label="Canonical URL" inputmode="url" :maxlength="300" hint="https://www.pastipeople.id/… — no query or hash. Empty = this page's URL." :error="err('seo.canonicalUrl')" />
          <label class="inline-flex items-center gap-2 text-sm">
            <input v-model="form.seo.noIndex" type="checkbox" class="h-4 w-4">
            Hide from search engines (noindex)
          </label>
        </div>

        <!-- CODE-MANAGED -->
        <div v-show="activeTab === 'code'" id="panel-code" role="tabpanel" aria-labelledby="tab-code" class="grid gap-3 text-sm text-navy-600">
          <p>These parts of <code>/insights</code> are not edited here:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><strong>Layout and motion</strong> — poster-filled masthead, contents rows and previews, full-screen reader.</li>
            <li><strong>Interface text</strong> — “All”, “Read insight”, “In this insight”, “Next”, “View full poster”, “Now showing”, counters.</li>
            <li><strong>PASTI perspective quotes</strong> — read from shared company content; articles only pick the source.</li>
            <li><strong>Homepage Insights section</strong> — frozen, code-managed.</li>
            <li><strong>Footer CTA</strong> — global, shared by every page.</li>
          </ul>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
