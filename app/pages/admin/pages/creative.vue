<script setup lang="ts">
import {
  COMPANY_MILESTONE_REFS,
  COMPANY_STANDARD_REFS,
  CREATIVE_LIMITS as LIM,
  CREATIVE_TESTIMONIAL_REFS,
  CREATIVE_WORK_REFS,
  type CreativeAdminState
} from '#shared/utils/creativeSchema'

// Creative singleton editor. Content only — layout, section order,
// typography, colour and motion stay in code. Creative-only content is
// edited here; shared records (projects, testimonials, company standards and
// milestones) are only picked. No add/duplicate/delete for the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Creative · Pages' })

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<CreativeAdminState, CreativeForm>({
  name: 'Creative',
  endpoint: '/api/admin/pages/creative',
  asyncKey: 'admin-creative',
  tabs: CREATIVE_TABS,
  toForm: toCreativeForm,
  toPayload: toCreativePayload,
  validate: validateCreativeForm
})

// ---- repeaters ------------------------------------------------------------
const nextOrder = (list: { sortOrder: number }[]) => list.length + 1
function addService() {
  const items = form.value!.services.items
  items.push({ _key: newKey(), title: '', body: '', keywords: [], related: [], image: '', imageWidth: 1448, imageHeight: 1086, imageAlt: '', sortOrder: nextOrder(items), active: true })
}
function addVisual() {
  const items = form.value!.wall.visuals
  items.push({ _key: newKey(), image: '', label: '', sortOrder: nextOrder(items), active: true })
}
function addUiux() {
  const items = form.value!.work.uiux.items
  const used = new Set(items.map((i) => i.ref))
  const ref = CREATIVE_WORK_REFS.find((r) => !used.has(r))
  if (ref) items.push({ _key: newKey(), ref, sortOrder: nextOrder(items), active: true })
}
const move = <T>(list: T[], i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}

// Shared records the page may reference (labels come from the records).
const workOptions = CREATIVE_WORK_REFS.map((ref) => {
  const p = resolveCreativeUiuxRef(ref)
  return { value: ref, label: p ? `${p.title} · ${p.category}` : ref }
})
const testimonialOptions = CREATIVE_TESTIMONIAL_REFS.map((ref) => {
  const t = resolveCreativeTestimonialRef(ref)
  return { value: ref, label: t ? `${t.name} — ${t.role}` : ref }
})
const standardOptions = COMPANY_STANDARD_REFS.map((ref) => ({ value: ref, label: resolveCompanyStandardRef(ref)?.name ?? ref }))
const milestoneOptions = COMPANY_MILESTONE_REFS.map((ref) => {
  const m = resolveCompanyMilestoneRef(ref)
  return { value: ref, label: m ? `${m.year} — ${m.text}` : ref }
})
const workLabel = (ref: string) => workOptions.find((o) => o.value === ref)?.label ?? ref
const company = useCompany()
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/pages" class="hover:underline">Pages</NuxtLink> <span aria-hidden="true">/</span> Creative
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Creative page</h1>
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
      The public <code>/creative</code> page uses published CMS content only when the server flag
      <code>NUXT_CMS_CREATIVE_PUBLIC_ENABLED</code> is on; otherwise it keeps its code content.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading Creative content…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the Creative page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/creative"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminEditorTabs v-model="activeTab" :tabs="CREATIVE_TABS" label="Creative sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HERO -->
        <div v-show="activeTab === 'hero'" id="panel-hero" role="tabpanel" aria-labelledby="tab-hero" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Eyebrow" :maxlength="LIM.heroEyebrow" required hint="Shown as “<eyebrow> studio” in the hero marker." :error="err('hero.eyebrow')" />
            <AdminFormField :id="fieldId('hero.markerMeta')" v-model="form.hero.markerMeta" label="Marker note (optional)" :maxlength="LIM.markerMeta" hint="Shown next to the marker from tablet up." :error="err('hero.markerMeta')" />
          </div>
          <fieldset class="grid gap-4">
            <legend class="text-sm font-medium">Headline — two lines</legend>
            <p class="text-xs text-navy-500">Each word animates in. The last word of line 2 is outlined and the period is added by the design.</p>
            <AdminFormField :id="fieldId('hero.headlineLine1')" v-model="form.hero.headlineLine1" label="Line 1" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine1')" />
            <AdminFormField :id="fieldId('hero.headlineLine2')" v-model="form.hero.headlineLine2" label="Line 2 (last word outlined)" :maxlength="LIM.headlineLine" required :error="err('hero.headlineLine2')" />
          </fieldset>
          <AdminFormField :id="fieldId('hero.lede')" v-model="form.hero.lede" label="Supporting copy" multiline :maxlength="LIM.lede" required :error="err('hero.lede')" />
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Primary CTA label" :maxlength="LIM.ctaLabel" required :error="err('hero.primaryCtaLabel')" />
            <AdminFormField :id="fieldId('hero.primaryCtaUrl')" v-model="form.hero.primaryCtaUrl" label="Primary CTA link" inputmode="url" :maxlength="500" required hint="/path, #anchor, https://, mailto: or tel:. Other sites open in a new tab." :error="err('hero.primaryCtaUrl')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Secondary CTA label" :maxlength="LIM.ctaLabel" required hint="The button scrolls to Services (code-managed)." :error="err('hero.secondaryCtaLabel')" />
          </div>
          <p class="text-xs text-navy-500">The hero image trail and the fan of three use the Studio Wall visuals (first three = fan).</p>
        </div>

        <!-- SERVICES -->
        <div v-show="activeTab === 'services'" id="panel-services" role="tabpanel" aria-labelledby="tab-services" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-3">
            <AdminFormField :id="fieldId('services.sectionLabel')" v-model="form.services.sectionLabel" label="Section label" :maxlength="LIM.label" required :error="err('services.sectionLabel')" />
            <AdminFormField :id="fieldId('services.eyebrow')" v-model="form.services.eyebrow" label="Eyebrow" :maxlength="LIM.label" required :error="err('services.eyebrow')" />
            <AdminFormField :id="fieldId('services.title')" v-model="form.services.title" label="Title" :maxlength="LIM.servicesTitle" required :error="err('services.title')" />
          </div>
          <p class="text-xs text-navy-500">Up to {{ LIM.servicesActive }} active services. Their titles also run in the tape marquee; numbering (01, 02…) follows the order.</p>
          <AdminFormRepeater legend="Services" :items="form.services.items" :max="12" :published-ids="publishedIds" :item-title="(s) => s.title" add-label="Add service" :error="err('services.items')" @add="addService">
            <template #default="{ item, index }">
              <AdminFormField :id="fieldId(`services.items.${index}.title`)" v-model="item.title" label="Title" :maxlength="LIM.serviceTitle" required :error="err(`services.items.${index}.title`)" />
              <AdminFormField :id="fieldId(`services.items.${index}.body`)" v-model="item.body" label="Description" multiline :maxlength="LIM.serviceBody" required :error="err(`services.items.${index}.body`)" />
              <AdminFormStringList legend="Key areas (chips)" :path="`services.items.${index}.keywords`" :items="item.keywords" :max="LIM.keywords" :maxlength="LIM.keyword" item-label="Key area" add-label="Add key area" :err="err" />
              <fieldset class="grid gap-2">
                <legend class="text-sm font-medium">Related work (optional)</legend>
                <p v-if="err(`services.items.${index}.related`)" class="text-xs font-medium text-red-700" role="alert">{{ err(`services.items.${index}.related`) }}</p>
                <div v-for="(r, k) in item.related" :key="k" class="rounded-md border border-navy-100 p-3">
                  <div class="grid gap-3 tablet:grid-cols-2">
                    <AdminFormField :id="fieldId(`services.items.${index}.related.${k}.label`)" v-model="r.label" label="Label" :maxlength="LIM.relatedLabel" required :error="err(`services.items.${index}.related.${k}.label`)" />
                    <AdminFormField :id="fieldId(`services.items.${index}.related.${k}.url`)" v-model="r.url" label="Link" inputmode="url" :maxlength="500" hint="e.g. /work#work-05 or #creative-work" :error="err(`services.items.${index}.related.${k}.url`)" />
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
              <div class="grid gap-4 tablet:grid-cols-[1fr_7rem_7rem]">
                <AdminFormField :id="fieldId(`services.items.${index}.image`)" v-model="item.image" label="Image" :maxlength="200" required hint="Image path under /images/ — shown whole at its own ratio." :error="err(`services.items.${index}.image`)" />
                <div>
                  <label :for="fieldId(`services.items.${index}.imageWidth`)" class="text-sm font-medium">Width px</label>
                  <input :id="fieldId(`services.items.${index}.imageWidth`)" v-model.number="item.imageWidth" type="number" min="200" max="6000" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                  <p v-if="err(`services.items.${index}.imageWidth`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`services.items.${index}.imageWidth`) }}</p>
                </div>
                <div>
                  <label :for="fieldId(`services.items.${index}.imageHeight`)" class="text-sm font-medium">Height px</label>
                  <input :id="fieldId(`services.items.${index}.imageHeight`)" v-model.number="item.imageHeight" type="number" min="200" max="6000" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                  <p v-if="err(`services.items.${index}.imageHeight`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`services.items.${index}.imageHeight`) }}</p>
                </div>
              </div>
              <AdminFormField :id="fieldId(`services.items.${index}.imageAlt`)" v-model="item.imageAlt" label="Image alt text (optional)" :maxlength="160" hint="Empty = “<title> — PASTI”." :error="err(`services.items.${index}.imageAlt`)" />
            </template>
          </AdminFormRepeater>
        </div>

        <!-- STUDIO WALL -->
        <div v-show="activeTab === 'wall'" id="panel-wall" role="tabpanel" aria-labelledby="tab-wall" class="grid gap-5">
          <div class="grid gap-5 tablet:grid-cols-3">
            <AdminFormField :id="fieldId('wall.sectionLabel')" v-model="form.wall.sectionLabel" label="Section label" :maxlength="LIM.label" required :error="err('wall.sectionLabel')" />
            <AdminFormField :id="fieldId('wall.titleLead')" v-model="form.wall.titleLead" label="Title" :maxlength="LIM.wallLead" required :error="err('wall.titleLead')" />
            <AdminFormField :id="fieldId('wall.titleAccent')" v-model="form.wall.titleAccent" label="Title accent (yellow)" :maxlength="LIM.wallAccent" required hint="The period is added by the design." :error="err('wall.titleAccent')" />
          </div>
          <p class="text-xs text-navy-500">{{ LIM.visualsMin }}–{{ LIM.visualsActive }} active visuals. They fill the draggable wall and the hero trail; the first three form the hero fan. Images are cropped to 4:5.</p>
          <AdminFormRepeater legend="Studio wall visuals" :items="form.wall.visuals" :max="24" :published-ids="publishedIds" :item-title="(v) => v.label" add-label="Add visual" :error="err('wall.visuals')" @add="addVisual">
            <template #default="{ item, index }">
              <div class="grid gap-4 tablet:grid-cols-2">
                <AdminFormField :id="fieldId(`wall.visuals.${index}.image`)" v-model="item.image" label="Image" :maxlength="200" required hint="Image path under /images/" :error="err(`wall.visuals.${index}.image`)" />
                <AdminFormField :id="fieldId(`wall.visuals.${index}.label`)" v-model="item.label" label="Caption (also alt text)" :maxlength="LIM.visualLabel" required :error="err(`wall.visuals.${index}.label`)" />
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- SELECTED WORK -->
        <div v-show="activeTab === 'work'" id="panel-work" role="tabpanel" aria-labelledby="tab-work" class="grid gap-8">
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('work.sectionLabel')" v-model="form.work.sectionLabel" label="Section label" :maxlength="LIM.label" required :error="err('work.sectionLabel')" />
            <AdminFormField :id="fieldId('work.sectionMeta')" v-model="form.work.sectionMeta" label="Section note (optional)" :maxlength="LIM.label" :error="err('work.sectionMeta')" />
            <AdminFormField :id="fieldId('work.eyebrow')" v-model="form.work.eyebrow" label="Eyebrow" :maxlength="LIM.label" required :error="err('work.eyebrow')" />
            <AdminFormField :id="fieldId('work.title')" v-model="form.work.title" label="Title" :maxlength="LIM.sectionTitle" required :error="err('work.title')" />
          </div>

          <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-5">
            <legend class="px-1 text-base font-semibold">Featured case</legend>
            <div class="grid gap-5 tablet:grid-cols-2">
              <AdminFormField :id="fieldId('work.feature.title')" v-model="form.work.feature.title" label="Title" :maxlength="LIM.caseTitle" required :error="err('work.feature.title')" />
              <AdminFormField :id="fieldId('work.feature.category')" v-model="form.work.feature.category" label="Category" :maxlength="LIM.caseCategory" required :error="err('work.feature.category')" />
            </div>
            <div>
              <label :for="fieldId('work.feature.imageRef')" class="text-sm font-medium">Image — from project</label>
              <select :id="fieldId('work.feature.imageRef')" v-model="form.work.feature.imageRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <AdminFormStringList legend="Challenge" path="work.feature.challenge" :items="form.work.feature.challenge" :min="1" :max="LIM.challenge" :maxlength="LIM.challengeItem" item-label="Point" add-label="Add point" :err="err" />
            <AdminFormField :id="fieldId('work.feature.gamePlan')" v-model="form.work.feature.gamePlan" label="Game plan" multiline :maxlength="LIM.gamePlan" required :error="err('work.feature.gamePlan')" />
            <fieldset class="grid gap-3">
              <legend class="text-sm font-medium">Acquisition funnel — exactly 4 stages (the last is highlighted)</legend>
              <p v-if="err('work.feature.funnel')" class="text-xs font-medium text-red-700" role="alert">{{ err('work.feature.funnel') }}</p>
              <div v-for="(s, k) in form.work.feature.funnel" :key="k" class="grid gap-3 rounded-md border border-navy-100 p-3 tablet:grid-cols-[12rem_1fr]">
                <AdminFormField :id="fieldId(`work.feature.funnel.${k}.stage`)" v-model="s.stage" :label="`Stage ${k + 1}`" :maxlength="LIM.funnelStage" required :error="err(`work.feature.funnel.${k}.stage`) || err(`work.feature.funnel.${k}`)" />
                <AdminFormField :id="fieldId(`work.feature.funnel.${k}.text`)" v-model="s.text" label="Text" :maxlength="LIM.funnelText" required :error="err(`work.feature.funnel.${k}.text`)" />
              </div>
            </fieldset>
            <AdminFormStringList legend="Marketing playbook" path="work.feature.playbook" :items="form.work.feature.playbook" :min="1" :max="LIM.playbook" :maxlength="LIM.playbookItem" item-label="Point" add-label="Add point" :err="err" />
          </fieldset>

          <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-5">
            <legend class="px-1 text-base font-semibold">Campaign + testimonial</legend>
            <p class="text-xs text-navy-500">Picked from existing records — title, description, image, quote and photo come from those records.</p>
            <div>
              <label :for="fieldId('work.campaignRef')" class="text-sm font-medium">Campaign project</label>
              <select :id="fieldId('work.campaignRef')" v-model="form.work.campaignRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div>
              <label :for="fieldId('work.testimonialRef')" class="text-sm font-medium">Testimonial</label>
              <select :id="fieldId('work.testimonialRef')" v-model="form.work.testimonialRef" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                <option v-for="o in testimonialOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
          </fieldset>

          <fieldset class="grid gap-5 rounded-lg border border-navy-100 bg-white p-5">
            <legend class="px-1 text-base font-semibold">UI/UX projects</legend>
            <div class="grid gap-5 tablet:grid-cols-2">
              <AdminFormField :id="fieldId('work.uiux.title')" v-model="form.work.uiux.title" label="Title" :maxlength="LIM.uiuxTitle" required :error="err('work.uiux.title')" />
              <AdminFormField :id="fieldId('work.uiux.label')" v-model="form.work.uiux.label" label="Side label (optional)" :maxlength="LIM.uiuxTitle" :error="err('work.uiux.label')" />
            </div>
            <p class="text-xs text-navy-500">Up to {{ LIM.uiux }} active projects (one row on desktop).</p>
            <AdminFormRepeater legend="UI/UX projects" :items="form.work.uiux.items" :max="CREATIVE_WORK_REFS.length" :published-ids="publishedIds" :item-title="(u) => workLabel(u.ref)" add-label="Add project" :error="err('work.uiux.items')" @add="addUiux">
              <template #default="{ item, index }">
                <div>
                  <label :for="fieldId(`work.uiux.items.${index}.ref`)" class="text-sm font-medium">Project</label>
                  <select :id="fieldId(`work.uiux.items.${index}.ref`)" v-model="item.ref" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`work.uiux.items.${index}.ref`) || !!err(`work.uiux.items.${index}`)">
                    <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                  </select>
                  <p v-if="err(`work.uiux.items.${index}.ref`) || err(`work.uiux.items.${index}`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`work.uiux.items.${index}.ref`) || err(`work.uiux.items.${index}`) }}</p>
                </div>
              </template>
            </AdminFormRepeater>
          </fieldset>
        </div>

        <!-- WHY PASTI -->
        <div v-show="activeTab === 'why'" id="panel-why" role="tabpanel" aria-labelledby="tab-why" class="grid gap-6">
          <p class="rounded-md border border-navy-100 bg-white px-3 py-2 text-xs text-navy-600">The statement, standards and milestones are company data shared with About and Technology. Pick and order them here; their text is edited in one place only.</p>
          <AdminFormField :id="fieldId('why.leadLabel')" v-model="form.why.leadLabel" label="Lead label" :maxlength="LIM.label" required :error="err('why.leadLabel')" />
          <div>
            <label :for="fieldId('why.statementSource')" class="text-sm font-medium">Statement</label>
            <select :id="fieldId('why.statementSource')" v-model="form.why.statementSource" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
              <option value="mission">Company mission</option>
              <option value="vision">Company vision</option>
            </select>
            <p class="mt-2 text-xs text-navy-500">“{{ form.why.statementSource === 'vision' ? company.vision : company.mission }}”</p>
          </div>
          <AdminFormStringList legend="Standards" path="why.standardRefs" :items="form.why.standardRefs" :min="1" :max="4" item-label="Standard" add-label="Add standard" :options="standardOptions" :err="err" />
          <AdminFormStringList legend="Milestones" path="why.milestoneRefs" :items="form.why.milestoneRefs" :min="3" :max="4" item-label="Milestone" add-label="Add milestone" hint="The milestone row is laid out for 3 or 4 entries." :options="milestoneOptions" :err="err" />
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
          <p>These parts of <code>/creative</code> are not edited here:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><strong>Discipline tapes</strong> — derived from the active service titles.</li>
            <li><strong>Project records, testimonials, company standards &amp; milestones</strong> — shared with other pages; picked here, edited at their source.</li>
            <li><strong>Case sub-headings</strong> — “Challenge”, “Game plan”, “Acquisition funnel”, “Marketing playbook”.</li>
            <li><strong>Interface text</strong> — “Drag to explore”, “Related work”, “View in Work”, badges, counters and cursor labels.</li>
            <li><strong>Interim illustrations</strong> — only drawn when a service has no image.</li>
            <li><strong>Footer CTA</strong> — global, shared by every page.</li>
          </ul>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
