<script setup lang="ts">
import { WORK_LIMITS as LIM, type WorkAdminState } from '#shared/utils/workSchema'
import type { ProjectListRow } from '#shared/utils/projectSchema'
import type { CaseStudyListRow } from '#shared/utils/caseStudySchema'

// Work page singleton editor. Decides what /work shows and in which order;
// project and case-study content lives in their own records and is only
// referenced here. No add / duplicate / delete for the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Work page · Work' })

const { cmsFetch } = useCmsSession()
const { data: projectRows } = await useAsyncData('admin-work-project-options', () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects'))
const { data: caseRows } = await useAsyncData('admin-work-case-options', () => cmsFetch<CaseStudyListRow[]>('/api/admin/work/case-studies'))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<WorkAdminState, WorkForm>({
  name: 'the Work page',
  endpoint: '/api/admin/work',
  asyncKey: 'admin-work',
  tabs: WORK_TABS,
  toForm: toWorkForm,
  toPayload: toWorkPayload,
  validate: validateWorkForm
})

const projectOptions = computed(() => (projectRows.value ?? []).filter((p) => p.status !== 'archived'))
const caseOptions = computed(() => (caseRows.value ?? []).filter((c) => c.status !== 'archived'))
const projectById = (id: string) => projectRows.value?.find((p) => p.id === id)
const caseById = (id: string) => caseRows.value?.find((c) => c.id === id)
const projectLabel = (id: string) => projectById(id)?.name ?? `Unknown project (${id})`
const caseLabel = (id: string) => {
  const c = caseById(id)
  return c ? `${c.projectName ?? 'Unlinked'} · #case-${c.slug}` : `Unknown case study (${id})`
}

function addProject() {
  const items = form.value!.projectIndex.items
  const used = new Set(items.map((i) => i.projectId))
  const next = projectOptions.value.find((p) => !used.has(p.id))
  if (next) items.push({ _key: newKey(), projectId: next.id, sortOrder: items.length + 1, active: true })
}
function addCase() {
  const items = form.value!.featuredCases.items
  const used = new Set(items.map((i) => i.caseStudyId))
  const next = caseOptions.value.find((c) => !used.has(c.id))
  if (next) items.push({ _key: newKey(), caseStudyId: next.id, sortOrder: items.length + 1, active: true })
}

// Active selections that are not live yet — publishing the page is blocked
// until they are published (server-enforced, shown here early).
const unpublishedSelected = computed(() => {
  const f = form.value
  if (!f) return []
  return [
    ...f.projectIndex.items.filter((i) => i.active && projectById(i.projectId)?.status !== 'published').map((i) => projectLabel(i.projectId)),
    ...f.featuredCases.items.filter((i) => i.active && caseById(i.caseStudyId)?.status !== 'published').map((i) => caseLabel(i.caseStudyId))
  ]
})
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">Work <span aria-hidden="true">/</span> Work page</nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Work page</h1>
      <span v-if="state?.dummy !== false" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
      <span v-else-if="state?.source.kind === 'migration'" class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">Migrated from current site · {{ state.source.version }}</span>
    </div>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Singleton page. Choose which <NuxtLink to="/admin/work/projects" class="underline">projects</NuxtLink> and
      <NuxtLink to="/admin/work/case-studies" class="underline">case studies</NuxtLink> appear and in which order — their content is edited in their own records.
      The public <code>/work</code> page uses published CMS content only when the server flag <code>NUXT_CMS_WORK_PUBLIC_ENABLED</code> is on.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading Work page…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the Work page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/work"
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

      <AdminEditorTabs v-model="activeTab" :tabs="WORK_TABS" label="Work page sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HERO -->
        <div v-show="activeTab === 'hero'" id="panel-hero" role="tabpanel" aria-labelledby="tab-hero" class="grid gap-5">
          <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Eyebrow" :maxlength="LIM.heroEyebrow" required hint="Hero marker label; the project / case-study counts next to it are automatic." :error="err('hero.eyebrow')" />
          <fieldset class="grid gap-4">
            <legend class="text-sm font-medium">Headline — two lines</legend>
            <p class="text-xs text-navy-500">Each line is one animated line of the display headline. The yellow period after line 2 is added by the design.</p>
            <div class="grid gap-4 tablet:grid-cols-2">
              <AdminFormField :id="fieldId('hero.headlineLine1')" v-model="form.hero.headlineLine1" label="Line 1" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine1')" />
              <AdminFormField :id="fieldId('hero.headlineLine2')" v-model="form.hero.headlineLine2" label="Line 2" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine2')" />
            </div>
          </fieldset>
          <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Supporting copy" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Primary CTA label" :maxlength="LIM.ctaLabel" required hint="Scrolls to the project index (code-managed)." :error="err('hero.primaryCtaLabel')" />
            <div />
            <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Secondary CTA label" :maxlength="LIM.ctaLabel" required :error="err('hero.secondaryCtaLabel')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaUrl')" v-model="form.hero.secondaryCtaUrl" label="Secondary CTA link" inputmode="url" :maxlength="500" required hint="/path, #anchor, https://, mailto: or tel:. Other sites open in a new tab." :error="err('hero.secondaryCtaUrl')" />
          </div>
          <p class="text-xs text-navy-500">The poster deck is built from the active projects of the Project Index — there is no separate hero image.</p>
        </div>

        <!-- PROJECT INDEX -->
        <div v-show="activeTab === 'projectIndex'" id="panel-projectIndex" role="tabpanel" aria-labelledby="tab-projectIndex" class="grid gap-5">
          <AdminFormField :id="fieldId('projectIndex.sectionLabel')" v-model="form.projectIndex.sectionLabel" label="Section label" :maxlength="LIM.sectionLabel" required :error="err('projectIndex.sectionLabel')" />
          <p class="text-xs text-navy-500">
            Up to {{ LIM.projectsActive }} active projects; numbering (01, 02…) follows the order. Name, poster, category, filter group and description come from each
            <NuxtLink to="/admin/work/projects" class="underline">project record</NuxtLink>. A card links to a case study only when that case is featured below.
          </p>
          <AdminFormRepeater legend="Selected projects" :items="form.projectIndex.items" :max="LIM.projects" :published-ids="publishedIds" :item-title="(i) => projectLabel(i.projectId)" add-label="Add project" :error="err('projectIndex.items')" @add="addProject">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`projectIndex.items.${index}.projectId`)" class="text-sm font-medium">Project<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`projectIndex.items.${index}.projectId`)" v-model="item.projectId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`projectIndex.items.${index}.projectId`)">
                  <option v-if="!projectById(item.projectId)" :value="item.projectId">{{ projectLabel(item.projectId) }}</option>
                  <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }} · {{ p.status }}{{ p.dummy ? ' · demo' : '' }}</option>
                </select>
                <p v-if="err(`projectIndex.items.${index}.projectId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`projectIndex.items.${index}.projectId`) }}</p>
                <p v-if="projectById(item.projectId)" class="mt-1 flex items-center gap-2 text-xs text-navy-500">
                  <AdminStatusBadge :status="projectById(item.projectId)!.status" />
                  <NuxtLink :to="`/admin/work/projects/${item.projectId}`" class="underline">Edit project</NuxtLink>
                </p>
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- FEATURED CASES -->
        <div v-show="activeTab === 'featuredCases'" id="panel-featuredCases" role="tabpanel" aria-labelledby="tab-featuredCases" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-3">
            <AdminFormField :id="fieldId('featuredCases.sectionLabel')" v-model="form.featuredCases.sectionLabel" label="Section label" :maxlength="LIM.sectionLabel" required :error="err('featuredCases.sectionLabel')" />
            <AdminFormField :id="fieldId('featuredCases.titleLead')" v-model="form.featuredCases.titleLead" label="Title" :maxlength="LIM.titleLead" required :error="err('featuredCases.titleLead')" />
            <AdminFormField :id="fieldId('featuredCases.titleAccent')" v-model="form.featuredCases.titleAccent" label="Title accent (yellow)" :maxlength="LIM.titleAccent" required :error="err('featuredCases.titleAccent')" />
          </div>
          <AdminFormField :id="fieldId('featuredCases.supportingCopy')" v-model="form.featuredCases.supportingCopy" label="Supporting copy" :maxlength="LIM.supportingCopy" required :error="err('featuredCases.supportingCopy')" />
          <p class="text-xs text-navy-500">
            Up to {{ LIM.casesActive }} active case studies. The narrative and metrics live in each
            <NuxtLink to="/admin/work/case-studies" class="underline">case study</NuxtLink>; only confirmed claims are ever shown publicly.
          </p>
          <AdminFormRepeater legend="Featured case studies" :items="form.featuredCases.items" :max="LIM.cases" :published-ids="publishedIds" :item-title="(i) => caseLabel(i.caseStudyId)" add-label="Add case study" :error="err('featuredCases.items')" @add="addCase">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`featuredCases.items.${index}.caseStudyId`)" class="text-sm font-medium">Case study<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`featuredCases.items.${index}.caseStudyId`)" v-model="item.caseStudyId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`featuredCases.items.${index}.caseStudyId`)">
                  <option v-if="!caseById(item.caseStudyId)" :value="item.caseStudyId">{{ caseLabel(item.caseStudyId) }}</option>
                  <option v-for="c in caseOptions" :key="c.id" :value="c.id">{{ c.projectName ?? 'Unlinked' }} · {{ c.status }}{{ c.dummy ? ' · demo' : '' }}</option>
                </select>
                <p v-if="err(`featuredCases.items.${index}.caseStudyId`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`featuredCases.items.${index}.caseStudyId`) }}</p>
                <p v-if="caseById(item.caseStudyId)" class="mt-1 flex flex-wrap items-center gap-2 text-xs text-navy-500">
                  <AdminStatusBadge :status="caseById(item.caseStudyId)!.status" />
                  <span v-if="caseById(item.caseStudyId)!.claims.needsApproval">{{ caseById(item.caseStudyId)!.claims.needsApproval }} item(s) awaiting approval — not shown publicly</span>
                  <NuxtLink :to="`/admin/work/case-studies/${item.caseStudyId}`" class="underline">Edit case study</NuxtLink>
                </p>
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
          <p>These parts of <code>/work</code> are not edited here:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><strong>Layout and motion</strong> — poster deck, grid / list toggle, filters, case reel, dossier, mobile rail.</li>
            <li><strong>Interface text</strong> — “Filter · Grid / List”, “Select a case”, “Swipe &amp; tap a case”, cursor labels, chapter labels (Challenge, What we built…), badges and counters.</li>
            <li><strong>Project identity</strong> — edited in each project record.</li>
            <li><strong>Case narratives, metrics and gallery</strong> — edited in each case study; claims need admin approval.</li>
            <li><strong>Footer CTA</strong> — global, shared by every page.</li>
          </ul>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
