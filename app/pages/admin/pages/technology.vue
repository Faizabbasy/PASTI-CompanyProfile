<script setup lang="ts">
import { TECHNOLOGY_LIMITS as LIM, TECHNOLOGY_WORK_REFS, type TechnologyAdminState } from '#shared/utils/technologySchema'

// Technology singleton editor. Content only — layout, section order,
// typography, colour and motion stay in code. No add/duplicate/delete for
// the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Technology · Pages' })

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<TechnologyAdminState, TechnologyForm>({
  name: 'Technology',
  endpoint: '/api/admin/pages/technology',
  asyncKey: 'admin-technology',
  tabs: TECHNOLOGY_TABS,
  toForm: toTechnologyForm,
  toPayload: toTechnologyPayload,
  validate: validateTechnologyForm
})

// ---- repeaters ------------------------------------------------------------
const nextOrder = (list: { sortOrder: number }[]) => list.length + 1
function addCapability() {
  const items = form.value!.capabilities.items
  items.push({ _key: newKey(), title: '', body: '', keywords: [], related: [], image: '', imageAlt: '', sortOrder: nextOrder(items), active: true })
}
function addWorkItem() {
  const items = form.value!.work.items
  const used = new Set(items.map((i) => i.ref))
  const ref = TECHNOLOGY_WORK_REFS.find((r) => !used.has(r))
  if (ref) items.push({ _key: newKey(), ref, sortOrder: nextOrder(items), active: true })
}
const move = <T>(list: T[], i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}

// Existing project records the case-study rail may reference (temporary
// layer until a Work CMS exists). Labels come from the project data itself.
const refOptions = TECHNOLOGY_WORK_REFS.map((ref) => {
  const card = resolveTechnologyWorkRef(ref)
  return { ref, label: card ? `${card.kind === 'case' ? 'Case study' : 'Project'} · ${card.title}` : ref }
})
const refLabel = (ref: string) => refOptions.find((o) => o.ref === ref)?.label ?? ref
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/pages" class="hover:underline">Pages</NuxtLink> <span aria-hidden="true">/</span> Technology
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Technology page</h1>
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
      Singleton page. Edit content only — layout, section order, typography and motion are managed in code.
      The public <code>/technology</code> page uses published CMS content only when the server flag
      <code>NUXT_CMS_TECHNOLOGY_PUBLIC_ENABLED</code> is on; otherwise it keeps its code content.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading Technology content…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the Technology page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/technology"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminEditorTabs v-model="activeTab" :tabs="TECHNOLOGY_TABS" label="Technology sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HERO -->
        <div v-show="activeTab === 'hero'" id="panel-hero" role="tabpanel" aria-labelledby="tab-hero" class="grid gap-5">
          <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Eyebrow" :maxlength="LIM.heroEyebrow" required hint="Shown in the hero marker next to the capability count." :error="err('hero.eyebrow')" />
          <fieldset class="grid gap-4">
            <legend class="text-sm font-medium">Headline — three lines</legend>
            <p class="-mt-2 text-xs text-navy-500">Each line is one animated line of the headline. Line 3 sits on the yellow marker; the yellow period is added by the design.</p>
            <AdminFormField :id="fieldId('hero.headlineLine1')" v-model="form.hero.headlineLine1" label="Line 1" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine1')" />
            <AdminFormField :id="fieldId('hero.headlineLine2')" v-model="form.hero.headlineLine2" label="Line 2" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine2')" />
            <AdminFormField :id="fieldId('hero.headlineLine3')" v-model="form.hero.headlineLine3" label="Line 3 (marker)" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine3')" />
          </fieldset>
          <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Supporting copy" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Primary CTA label" :maxlength="LIM.ctaLabel" required :error="err('hero.primaryCtaLabel')" />
            <AdminFormField :id="fieldId('hero.primaryCtaUrl')" v-model="form.hero.primaryCtaUrl" label="Primary CTA link" inputmode="url" :maxlength="500" required hint="/path, #anchor, https://, mailto: or tel:. Other sites open in a new tab." :error="err('hero.primaryCtaUrl')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Secondary CTA label" :maxlength="LIM.ctaLabel" required hint="The button scrolls to Capabilities (code-managed)." :error="err('hero.secondaryCtaLabel')" />
          </div>
        </div>

        <!-- CAPABILITIES -->
        <div v-show="activeTab === 'capabilities'" id="panel-capabilities" role="tabpanel" aria-labelledby="tab-capabilities" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('capabilities.eyebrow')" v-model="form.capabilities.eyebrow" label="Eyebrow" :maxlength="LIM.eyebrow" required :error="err('capabilities.eyebrow')" />
            <AdminFormField :id="fieldId('capabilities.title')" v-model="form.capabilities.title" label="Title" :maxlength="LIM.sectionTitle" required :error="err('capabilities.title')" />
          </div>
          <p class="text-xs text-navy-500">
            Up to {{ LIM.capabilitiesActive }} active capabilities. Their titles also drive the hero console and the marquee; numbering (01, 02…) follows the order.
          </p>
          <AdminFormRepeater legend="Capabilities" :items="form.capabilities.items" :max="12" :published-ids="publishedIds" :item-title="(c) => c.title" add-label="Add capability" :error="err('capabilities.items')" @add="addCapability">
            <template #default="{ item, index }">
              <AdminFormField :id="fieldId(`capabilities.items.${index}.title`)" v-model="item.title" label="Title" :maxlength="LIM.capabilityTitle" required :error="err(`capabilities.items.${index}.title`)" />
              <AdminFormField :id="fieldId(`capabilities.items.${index}.body`)" v-model="item.body" label="Description" multiline :maxlength="LIM.capabilityBody" required :error="err(`capabilities.items.${index}.body`)" />

              <fieldset class="grid gap-2">
                <legend class="text-sm font-medium">Key areas (chips)</legend>
                <p v-if="err(`capabilities.items.${index}.keywords`)" class="text-xs font-medium text-red-700" role="alert">{{ err(`capabilities.items.${index}.keywords`) }}</p>
                <div v-for="(_, k) in item.keywords" :key="k" class="flex items-start gap-2">
                  <div class="flex-1">
                    <AdminFormField :id="fieldId(`capabilities.items.${index}.keywords.${k}`)" v-model="item.keywords[k]!" :label="`Key area ${k + 1}`" :maxlength="LIM.keyword" required :error="err(`capabilities.items.${index}.keywords.${k}`)" />
                  </div>
                  <button type="button" class="mt-6 rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50" :aria-label="`Remove key area ${k + 1}`" @click="item.keywords.splice(k, 1)">Remove</button>
                </div>
                <div>
                  <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="item.keywords.length >= LIM.keywords" @click="item.keywords.push('')">+ Add key area</button>
                  <span class="ml-2 text-xs text-navy-500">{{ item.keywords.length }}/{{ LIM.keywords }}</span>
                </div>
              </fieldset>

              <fieldset class="grid gap-2">
                <legend class="text-sm font-medium">Related work (optional)</legend>
                <p v-if="err(`capabilities.items.${index}.related`)" class="text-xs font-medium text-red-700" role="alert">{{ err(`capabilities.items.${index}.related`) }}</p>
                <div v-for="(r, k) in item.related" :key="k" class="rounded-md border border-navy-100 p-3">
                  <div class="grid gap-3 tablet:grid-cols-2">
                    <AdminFormField :id="fieldId(`capabilities.items.${index}.related.${k}.label`)" v-model="r.label" label="Label" :maxlength="LIM.relatedLabel" required :error="err(`capabilities.items.${index}.related.${k}.label`)" />
                    <AdminFormField :id="fieldId(`capabilities.items.${index}.related.${k}.url`)" v-model="r.url" label="Link (optional)" inputmode="url" :maxlength="500" hint="e.g. /work#case-textile — empty shows a plain label" :error="err(`capabilities.items.${index}.related.${k}.url`)" />
                  </div>
                  <div class="mt-2 flex gap-2 text-xs">
                    <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === 0" @click="move(item.related, k, -1)">↑ Up</button>
                    <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === item.related.length - 1" @click="move(item.related, k, 1)">↓ Down</button>
                    <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50" @click="item.related.splice(k, 1)">Remove</button>
                  </div>
                </div>
                <div>
                  <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="item.related.length >= LIM.related" @click="item.related.push({ label: '', url: '' })">+ Add related work</button>
                  <span class="ml-2 text-xs text-navy-500">{{ item.related.length }}/{{ LIM.related }}</span>
                </div>
              </fieldset>

              <div class="grid gap-4 tablet:grid-cols-2">
                <AdminFormField :id="fieldId(`capabilities.items.${index}.image`)" v-model="item.image" label="Image" :maxlength="200" required hint="Image path under /images/ (cursor preview + mobile panel)" :error="err(`capabilities.items.${index}.image`)" />
                <AdminFormField :id="fieldId(`capabilities.items.${index}.imageAlt`)" v-model="item.imageAlt" label="Image alt text (optional)" :maxlength="160" hint="Empty = decorative (the title sits next to the image)." :error="err(`capabilities.items.${index}.imageAlt`)" />
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- CASE STUDIES -->
        <div v-show="activeTab === 'work'" id="panel-work" role="tabpanel" aria-labelledby="tab-work" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-3">
            <AdminFormField :id="fieldId('work.sectionLabel')" v-model="form.work.sectionLabel" label="Section label" :maxlength="LIM.eyebrow" required :error="err('work.sectionLabel')" />
            <AdminFormField :id="fieldId('work.eyebrow')" v-model="form.work.eyebrow" label="Eyebrow" :maxlength="LIM.eyebrow" required :error="err('work.eyebrow')" />
            <AdminFormField :id="fieldId('work.title')" v-model="form.work.title" label="Title" :maxlength="LIM.sectionTitle" required :error="err('work.title')" />
          </div>
          <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Temporary reference list until the Work CMS exists: pick existing projects only. Titles, images and approved metrics come from the project records — nothing is copied or edited here.
          </p>
          <AdminFormRepeater legend="Case studies" :items="form.work.items" :max="TECHNOLOGY_WORK_REFS.length" :published-ids="publishedIds" :item-title="(w) => refLabel(w.ref)" add-label="Add project" :error="err('work.items')" @add="addWorkItem">
            <template #default="{ item, index }">
              <div>
                <label :for="fieldId(`work.items.${index}.ref`)" class="text-sm font-medium">Project<span class="text-red-700" aria-hidden="true"> *</span></label>
                <select :id="fieldId(`work.items.${index}.ref`)" v-model="item.ref" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`work.items.${index}.ref`)">
                  <option v-for="o in refOptions" :key="o.ref" :value="o.ref">{{ o.label }}</option>
                </select>
                <p v-if="err(`work.items.${index}.ref`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`work.items.${index}.ref`) }}</p>
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
          <p>These parts of <code>/technology</code> are not edited here:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><strong>Capability marquee</strong> — derived from the active capability titles.</li>
            <li><strong>Our own platforms</strong> (OPEN, e-CORPORATE) — locked copy shared with the homepage.</li>
            <li><strong>Why PASTI</strong> — vision, standards and milestones come from the company data.</li>
            <li><strong>Case-study metrics</strong> — owned by each project record, shown only with that project.</li>
            <li><strong>Interface text</strong> — console labels, “Hover to preview”, “Related work”, badges and counters.</li>
            <li><strong>Footer CTA</strong> — global, shared by every page.</li>
          </ul>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
