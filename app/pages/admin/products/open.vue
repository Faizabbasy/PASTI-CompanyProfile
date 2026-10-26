<script setup lang="ts">
import { OPEN_SECTIONS, type OpenAdminState, type OpenSectionKey } from '#shared/utils/openSchema'

// OPEN product page editor. Copy only — layout, typography, colour, motion,
// tab/module wiring, illustration mock-ups and the demo form's behaviour stay
// in code. Every list has the fixed item count of the current design.
definePageMeta({ layout: 'admin' })
useHead({ title: 'OPEN · Products' })

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<OpenAdminState, OpenForm>({
  name: 'OPEN',
  endpoint: '/api/admin/pages/open',
  asyncKey: 'admin-open',
  tabs: OPEN_TABS,
  toForm: toOpenForm,
  toPayload: toOpenPayload,
  validate: validateOpenForm
})

const sectionsOf = (tab: string) => (OPEN_TABS.find((t) => t.key === tab)?.sections ?? []).filter((s) => s !== 'seo') as OpenSectionKey[]
const contentTabs = OPEN_TABS.filter((t) => t.key !== 'seo' && t.key !== 'code')
const sectionModel = (k: OpenSectionKey) => (form.value as unknown as Record<string, Record<string, unknown>>)[k]!
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <span>Products</span> <span aria-hidden="true">/</span> OPEN
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">OPEN product page</h1>
      <span
        v-if="state?.dummy !== false"
        class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500"
      >Dummy data</span>
      <span
        v-else-if="state?.source.kind === 'migration'"
        class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600"
      >Migrated from current site · {{ state.source.version }}</span>
    </div>
    <p class="mt-1 max-w-2xl text-sm text-navy-500">
      Singleton page. Edit copy only — layout, illustrations and the demo form are managed in code.
      The public <code>/open</code> page uses published CMS content only when the server flag
      <code>NUXT_CMS_OPEN_PUBLIC_ENABLED</code> is on; otherwise it keeps its code content.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading OPEN content…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the OPEN page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/open"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminEditorTabs v-model="activeTab" :tabs="OPEN_TABS" label="OPEN sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <div
          v-for="tab in contentTabs"
          v-show="activeTab === tab.key"
          :id="`panel-${tab.key}`"
          :key="tab.key"
          role="tabpanel"
          :aria-labelledby="`tab-${tab.key}`"
          class="grid gap-8"
        >
          <section v-for="s in sectionsOf(tab.key)" :key="s" :aria-labelledby="`sec-${s}`">
            <h2 :id="`sec-${s}`" class="mb-3 text-base font-bold">{{ OPEN_SECTIONS[s].label }}</h2>
            <AdminOpenFields :fields="OPEN_SECTIONS[s].fields" :model="sectionModel(s)" :path="s" :err="err" />
          </section>
        </div>

        <!-- SEO -->
        <div v-show="activeTab === 'seo'" id="panel-seo" role="tabpanel" aria-labelledby="tab-seo" class="grid gap-5">
          <AdminFormField :id="fieldId('seo.metaTitle')" v-model="form.seo.metaTitle" label="Meta title" :maxlength="70" required :error="err('seo.metaTitle')" />
          <AdminFormField :id="fieldId('seo.metaDescription')" v-model="form.seo.metaDescription" label="Meta description" multiline :rows="2" :maxlength="200" required :error="err('seo.metaDescription')" />
          <AdminFormImage :id="fieldId('seo.ogImage')" v-model="form.seo.ogImage" label="Share image" aspect="1200/630" hint="1200×630 share card. Empty = current share card." :error="err('seo.ogImage')" />
          <AdminFormField :id="fieldId('seo.canonicalUrl')" v-model="form.seo.canonicalUrl" label="Canonical URL" inputmode="url" :maxlength="300" hint="https://www.pastipeople.id/… — no query or hash. Empty = this page's URL." :error="err('seo.canonicalUrl')" />
          <label class="inline-flex items-center gap-2 text-sm">
            <input v-model="form.seo.noIndex" type="checkbox" class="h-4 w-4">
            Hide from search engines (noindex)
          </label>
        </div>

        <!-- CODE-MANAGED -->
        <div v-show="activeTab === 'code'" id="panel-code" role="tabpanel" aria-labelledby="tab-code" class="grid gap-3 text-sm text-navy-600">
          <p>These parts of <code>/open</code> are not edited here:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><strong>Structure</strong> — section order, the number of items in every list, which module tab each ecosystem function opens, procurement method codes and stage diagrams.</li>
            <li><strong>Section tags and sub-headings</strong> — e.g. “03 / 12 · Not another SaaS”, “Vendor lifecycle in OPEN”, “Key capabilities”.</li>
            <li><strong>Illustrations</strong> — the hero procurement record, the approval demo, the audit log and the monitoring dashboard.</li>
            <li><strong>The O+PEN logo</strong> in the hero.</li>
            <li><strong>Demo form</strong> — field labels, validation, and the WhatsApp hand-off with its message template. The challenge and interest options are editable in “Demo CTA”.</li>
            <li><strong>Floating section menu</strong> and the other “Request a Demo” buttons.</li>
          </ul>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
