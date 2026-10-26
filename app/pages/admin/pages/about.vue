<script setup lang="ts">
import { ABOUT_LIMITS as LIM, VALUE_ICONS, type AboutAdminState } from '#shared/utils/aboutSchema'

// About singleton editor (Step 2). Content only — layout, order, typography,
// colour and motion stay in code. No add/duplicate/delete for the page.
definePageMeta({ layout: 'admin' })
useHead({ title: 'About · Pages' })

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<AboutAdminState, AboutForm>({
  name: 'About',
  endpoint: '/api/admin/pages/about',
  asyncKey: 'admin-about',
  tabs: ABOUT_TABS,
  toForm: toAboutForm,
  toPayload: toAboutPayload,
  validate: validateAboutForm
})

// ---- repeaters ------------------------------------------------------------
const nextOrder = (list: { sortOrder: number }[]) => list.length + 1
function addValue() {
  form.value!.values.push({ _key: newKey(), title: '', description: '', iconOrVisual: 'none', sortOrder: nextOrder(form.value!.values), active: true })
}
function addMilestone() {
  form.value!.milestones.push({ _key: newKey(), yearOrPeriod: '', title: '', description: '', optionalMedia: '', optionalMediaAlt: '', sortOrder: nextOrder(form.value!.milestones), active: true })
}
function addProof() {
  form.value!.proof.push({ _key: newKey(), value: '', label: '', supportingText: '', sortOrder: nextOrder(form.value!.proof), active: true })
}
function addLeader() {
  form.value!.leadership.push({ _key: newKey(), name: '', role: '', shortBio: '', portrait: '', portraitAlt: '', sortOrder: nextOrder(form.value!.leadership), active: true })
}
function addMissionPoint() {
  form.value!.mission.points.push({ _key: newKey(), text: '', sortOrder: nextOrder(form.value!.mission.points), active: true })
}
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/pages" class="hover:underline">Pages</NuxtLink> <span aria-hidden="true">/</span> About
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">About page</h1>
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
      The public <code>/about</code> page uses published CMS content only when the server flag
      <code>NUXT_CMS_ABOUT_PUBLIC_ENABLED</code> is on; otherwise it keeps its code content.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading About content…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the About page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/about"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminEditorTabs v-model="activeTab" :tabs="ABOUT_TABS" label="About sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HERO -->
        <div v-show="activeTab === 'hero'" id="panel-hero" role="tabpanel" aria-labelledby="tab-hero" class="grid gap-5">
          <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Eyebrow" :maxlength="LIM.heroEyebrow" :error="err('hero.eyebrow')" />
          <AdminFormField :id="fieldId('hero.headline')" v-model="form.hero.headline" label="Headline" :maxlength="140" required hint="Reference only — the public headline is code-managed (animated “complexity”)." :error="err('hero.headline')" />
          <AdminFormField :id="fieldId('hero.supportingCopy')" v-model="form.hero.supportingCopy" label="Supporting copy" multiline :maxlength="400" hint="Not shown on the public page yet (code-managed there)." :error="err('hero.supportingCopy')" />
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('hero.primaryCtaLabel')" v-model="form.hero.primaryCtaLabel" label="Primary CTA label" :maxlength="LIM.ctaLabel" :error="err('hero.primaryCtaLabel')" />
            <AdminFormField :id="fieldId('hero.primaryCtaUrl')" v-model="form.hero.primaryCtaUrl" label="Primary CTA link" inputmode="url" :maxlength="500" hint="/path, #anchor, https://, mailto: or tel:" :error="err('hero.primaryCtaUrl')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaLabel')" v-model="form.hero.secondaryCtaLabel" label="Secondary CTA label" :maxlength="LIM.ctaLabel" :error="err('hero.secondaryCtaLabel')" />
            <AdminFormField :id="fieldId('hero.secondaryCtaUrl')" v-model="form.hero.secondaryCtaUrl" label="Secondary CTA link" inputmode="url" :maxlength="500" hint="Public button scrolls to the story section (code-managed); only the label is used." :error="err('hero.secondaryCtaUrl')" />
            <AdminFormField :id="fieldId('hero.heroMedia')" v-model="form.hero.heroMedia" label="Hero media" :maxlength="200" hint="Not shown on the public page yet (code-managed there)." :error="err('hero.heroMedia')" />
            <AdminFormField :id="fieldId('hero.heroMediaAlt')" v-model="form.hero.heroMediaAlt" label="Hero media alt text" :maxlength="160" :error="err('hero.heroMediaAlt')" />
          </div>
        </div>

        <!-- STORY -->
        <div v-show="activeTab === 'story'" id="panel-story" role="tabpanel" aria-labelledby="tab-story" class="grid gap-5">
          <AdminFormField :id="fieldId('story.sectionLabel')" v-model="form.story.sectionLabel" label="Section label" :maxlength="60" hint="Not shown on the public page yet (code-managed there)." :error="err('story.sectionLabel')" />
          <AdminFormField :id="fieldId('story.title')" v-model="form.story.title" label="Title (optional)" :maxlength="140" hint="Not shown on the public page yet (code-managed there)." :error="err('story.title')" />
          <fieldset class="grid gap-4">
            <legend class="text-sm font-medium">Body paragraphs</legend>
            <p v-if="err('story.paragraphs')" class="text-xs font-medium text-red-700" role="alert">{{ err('story.paragraphs') }}</p>
            <div v-for="(_, i) in form.story.paragraphs" :key="i" class="rounded-lg border border-navy-100 bg-white p-4">
              <AdminFormField :id="fieldId(`story.paragraphs.${i}`)" v-model="form.story.paragraphs[i]!" :label="i === 0 ? 'Paragraph 1 — opening statement (shown large)' : `Paragraph ${i + 1}`" multiline :rows="4" :maxlength="i === 0 ? LIM.storyIntro : LIM.storyParagraph" required :error="err(`story.paragraphs.${i}`)" />
              <div class="mt-2 flex gap-2 text-xs">
                <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="i === 0" @click="form.story.paragraphs.splice(i - 1, 0, form.story.paragraphs.splice(i, 1)[0]!)">↑ Up</button>
                <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="i === form.story.paragraphs.length - 1" @click="form.story.paragraphs.splice(i + 1, 0, form.story.paragraphs.splice(i, 1)[0]!)">↓ Down</button>
                <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40" :disabled="form.story.paragraphs.length <= 1" @click="form.story.paragraphs.splice(i, 1)">Remove</button>
              </div>
            </div>
            <div>
              <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="form.story.paragraphs.length >= LIM.storyParagraphs" @click="form.story.paragraphs.push('')">+ Add paragraph</button>
              <span class="ml-2 text-xs text-navy-500">{{ form.story.paragraphs.length }}/{{ LIM.storyParagraphs }}</span>
            </div>
          </fieldset>
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('story.supportingMedia')" v-model="form.story.supportingMedia" label="Supporting media" :maxlength="200" hint="Not shown on the public page yet (code-managed there)." :error="err('story.supportingMedia')" />
            <AdminFormField :id="fieldId('story.supportingMediaAlt')" v-model="form.story.supportingMediaAlt" label="Supporting media alt text" :maxlength="160" :error="err('story.supportingMediaAlt')" />
          </div>
        </div>

        <!-- VISION & MISSION -->
        <div v-show="activeTab === 'vm'" id="panel-vm" role="tabpanel" aria-labelledby="tab-vm" class="grid gap-8">
          <fieldset class="grid gap-5">
            <legend class="mb-1 text-base font-semibold">Vision</legend>
            <AdminFormField :id="fieldId('vision.title')" v-model="form.vision.title" label="Title" :maxlength="LIM.vmTitle" required :error="err('vision.title')" />
            <AdminFormField :id="fieldId('vision.description')" v-model="form.vision.description" label="Description" multiline :maxlength="LIM.vision" required :error="err('vision.description')" />
          </fieldset>
          <fieldset class="grid gap-5">
            <legend class="mb-1 text-base font-semibold">Mission</legend>
            <AdminFormField :id="fieldId('mission.title')" v-model="form.mission.title" label="Title" :maxlength="LIM.vmTitle" required :error="err('mission.title')" />
            <AdminFormField :id="fieldId('mission.description')" v-model="form.mission.description" label="Description" multiline :maxlength="LIM.mission" required :error="err('mission.description')" />
            <h3 class="text-sm font-medium">Mission points (optional)</h3>
            <p class="-mt-3 text-xs text-navy-500">Not shown on the public page yet (code-managed there).</p>
            <AdminFormRepeater legend="Mission points" :items="form.mission.points" :max="10" :published-ids="publishedIds" :item-title="(p) => p.text" add-label="Add mission point" :error="err('mission.points')" @add="addMissionPoint">
              <template #default="{ item, index }">
                <AdminFormField :id="fieldId(`mission.points.${index}.text`)" v-model="item.text" label="Point" :maxlength="240" required :error="err(`mission.points.${index}.text`)" />
              </template>
            </AdminFormRepeater>
          </fieldset>
        </div>

        <!-- VALUES -->
        <div v-show="activeTab === 'values'" id="panel-values" role="tabpanel" aria-labelledby="tab-values">
          <p class="mb-3 text-xs text-navy-500">The design shows up to {{ LIM.valuesActive }} active values.</p>
          <AdminFormRepeater legend="Values" :items="form.values" :max="12" :published-ids="publishedIds" :item-title="(v) => v.title" add-label="Add value" :error="err('values')" @add="addValue">
            <template #default="{ item, index }">
              <AdminFormField :id="fieldId(`values.${index}.title`)" v-model="item.title" label="Title" :maxlength="LIM.valueTitle" required :error="err(`values.${index}.title`)" />
              <AdminFormField :id="fieldId(`values.${index}.description`)" v-model="item.description" label="Description" multiline :maxlength="LIM.valueBody" :error="err(`values.${index}.description`)" />
              <div>
                <label :for="fieldId(`values.${index}.iconOrVisual`)" class="text-sm font-medium">Icon (optional)</label>
                <select :id="fieldId(`values.${index}.iconOrVisual`)" v-model="item.iconOrVisual" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm tablet:w-64">
                  <option v-for="icon in VALUE_ICONS" :key="icon" :value="icon">{{ icon }}</option>
                </select>
                <p class="mt-1 text-xs text-navy-500">Not shown on the public page yet (code-managed there).</p>
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- MILESTONES -->
        <div v-show="activeTab === 'milestones'" id="panel-milestones" role="tabpanel" aria-labelledby="tab-milestones">
          <p class="mb-3 text-xs text-navy-500">The timeline holds up to {{ LIM.milestonesActive }} active milestones (one row).</p>
          <AdminFormRepeater legend="Milestones" :items="form.milestones" :max="30" :published-ids="publishedIds" :item-title="(m) => [m.yearOrPeriod, m.title].filter(Boolean).join(' — ')" add-label="Add milestone" :error="err('milestones')" @add="addMilestone">
            <template #default="{ item, index }">
              <div class="grid gap-4 tablet:grid-cols-[10rem_1fr]">
                <AdminFormField :id="fieldId(`milestones.${index}.yearOrPeriod`)" v-model="item.yearOrPeriod" label="Year / period" :maxlength="LIM.milestoneYear" required :error="err(`milestones.${index}.yearOrPeriod`)" />
                <AdminFormField :id="fieldId(`milestones.${index}.title`)" v-model="item.title" label="Title" :maxlength="120" required :error="err(`milestones.${index}.title`)" />
              </div>
              <AdminFormField :id="fieldId(`milestones.${index}.description`)" v-model="item.description" label="Description" multiline :maxlength="600" hint="Not shown on the public page yet (code-managed there)." :error="err(`milestones.${index}.description`)" />
              <div class="grid gap-4 tablet:grid-cols-2">
                <AdminFormField :id="fieldId(`milestones.${index}.optionalMedia`)" v-model="item.optionalMedia" label="Media (optional)" :maxlength="200" hint="Not shown on the public page yet (code-managed there)." :error="err(`milestones.${index}.optionalMedia`)" />
                <AdminFormField :id="fieldId(`milestones.${index}.optionalMediaAlt`)" v-model="item.optionalMediaAlt" label="Media alt text" :maxlength="160" :error="err(`milestones.${index}.optionalMediaAlt`)" />
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- PROOF -->
        <div v-show="activeTab === 'proof'" id="panel-proof" role="tabpanel" aria-labelledby="tab-proof">
          <p class="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Dummy values only in this phase — do not enter real claims or production numbers.</p>
          <p class="mb-3 text-xs text-navy-500">Up to {{ LIM.proofActive }} active proof items.</p>
          <AdminFormRepeater legend="Company proof" :items="form.proof" :max="12" :published-ids="publishedIds" :item-title="(p) => [p.value, p.label].filter(Boolean).join(' ')" add-label="Add proof item" :error="err('proof')" @add="addProof">
            <template #default="{ item, index }">
              <div class="grid gap-4 tablet:grid-cols-[10rem_1fr]">
                <AdminFormField :id="fieldId(`proof.${index}.value`)" v-model="item.value" label="Value" :maxlength="6" hint="e.g. 70+, 4.3, 100%" required :error="err(`proof.${index}.value`)" />
                <AdminFormField :id="fieldId(`proof.${index}.label`)" v-model="item.label" label="Label" :maxlength="LIM.proofLabel" required :error="err(`proof.${index}.label`)" />
              </div>
              <AdminFormField :id="fieldId(`proof.${index}.supportingText`)" v-model="item.supportingText" label="Supporting text" :maxlength="240" hint="Not shown on the public page yet (code-managed there)." :error="err(`proof.${index}.supportingText`)" />
            </template>
          </AdminFormRepeater>
        </div>

        <!-- LEADERSHIP -->
        <div v-show="activeTab === 'leadership'" id="panel-leadership" role="tabpanel" aria-labelledby="tab-leadership">
          <p class="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Synthetic people only in this phase — no real or unapproved stakeholders.</p>
          <AdminFormRepeater legend="Leadership" :items="form.leadership" :max="12" :published-ids="publishedIds" :item-title="(p) => [p.name, p.role].filter(Boolean).join(' · ')" add-label="Add person" :error="err('leadership')" @add="addLeader">
            <template #default="{ item, index }">
              <div class="grid gap-4 tablet:grid-cols-2">
                <AdminFormField :id="fieldId(`leadership.${index}.name`)" v-model="item.name" label="Name" :maxlength="80" required hint="The public section keeps this person's quote and foreword (code-managed), so CMS changes apply only while the name matches." :error="err(`leadership.${index}.name`)" />
                <AdminFormField :id="fieldId(`leadership.${index}.role`)" v-model="item.role" label="Role" :maxlength="LIM.leaderRole" required :error="err(`leadership.${index}.role`)" />
              </div>
              <AdminFormField :id="fieldId(`leadership.${index}.shortBio`)" v-model="item.shortBio" label="Short bio" multiline :maxlength="800" hint="Not shown on the public page yet (code-managed there)." :error="err(`leadership.${index}.shortBio`)" />
              <div class="grid gap-4 tablet:grid-cols-2">
                <AdminFormField :id="fieldId(`leadership.${index}.portrait`)" v-model="item.portrait" label="Portrait" :maxlength="200" hint="Image path under /images/" :error="err(`leadership.${index}.portrait`)" />
                <AdminFormField :id="fieldId(`leadership.${index}.portraitAlt`)" v-model="item.portraitAlt" label="Portrait alt text" :maxlength="160" :error="err(`leadership.${index}.portraitAlt`)" />
              </div>
            </template>
          </AdminFormRepeater>
        </div>

        <!-- CTA -->
        <div v-show="activeTab === 'cta'" id="panel-cta" role="tabpanel" aria-labelledby="tab-cta" class="grid gap-5">
          <p class="rounded-md border border-navy-100 bg-white px-3 py-2 text-xs text-navy-600">The public About page has no page-specific CTA — it uses the global footer CTA. These fields are not shown publicly.</p>
          <AdminFormField :id="fieldId('cta.eyebrow')" v-model="form.cta.eyebrow" label="Eyebrow (optional)" :maxlength="60" :error="err('cta.eyebrow')" />
          <AdminFormField :id="fieldId('cta.title')" v-model="form.cta.title" label="Title (optional)" :maxlength="140" :error="err('cta.title')" />
          <AdminFormField :id="fieldId('cta.supportingCopy')" v-model="form.cta.supportingCopy" label="Supporting copy" multiline :maxlength="400" :error="err('cta.supportingCopy')" />
          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('cta.primaryCtaLabel')" v-model="form.cta.primaryCtaLabel" label="Primary CTA label" :maxlength="40" :error="err('cta.primaryCtaLabel')" />
            <AdminFormField :id="fieldId('cta.primaryCtaUrl')" v-model="form.cta.primaryCtaUrl" label="Primary CTA link" inputmode="url" :maxlength="500" hint="/path, #anchor, https://, mailto: or tel:" :error="err('cta.primaryCtaUrl')" />
            <AdminFormField :id="fieldId('cta.secondaryCtaLabel')" v-model="form.cta.secondaryCtaLabel" label="Secondary CTA label" :maxlength="40" :error="err('cta.secondaryCtaLabel')" />
            <AdminFormField :id="fieldId('cta.secondaryCtaUrl')" v-model="form.cta.secondaryCtaUrl" label="Secondary CTA link" inputmode="url" :maxlength="500" :error="err('cta.secondaryCtaUrl')" />
          </div>
        </div>

        <!-- SEO -->
        <div v-show="activeTab === 'seo'" id="panel-seo" role="tabpanel" aria-labelledby="tab-seo" class="grid gap-5">
          <p class="rounded-md border border-navy-100 bg-white px-3 py-2 text-xs text-navy-600">Public SEO tags are still code-managed; these fields are stored for a later step.</p>
          <AdminFormField :id="fieldId('seo.metaTitle')" v-model="form.seo.metaTitle" label="Meta title" :maxlength="70" required :error="err('seo.metaTitle')" />
          <AdminFormField :id="fieldId('seo.metaDescription')" v-model="form.seo.metaDescription" label="Meta description" multiline :rows="2" :maxlength="170" required :error="err('seo.metaDescription')" />
          <AdminFormField :id="fieldId('seo.ogImage')" v-model="form.seo.ogImage" label="Share image" :maxlength="200" hint="Image path under /images/ (1200×630)" :error="err('seo.ogImage')" />
          <AdminFormField :id="fieldId('seo.canonicalUrl')" v-model="form.seo.canonicalUrl" label="Canonical URL" inputmode="url" :maxlength="300" hint="https://www.pastipeople.id/… — no query or hash" :error="err('seo.canonicalUrl')" />
          <label class="inline-flex items-center gap-2 text-sm">
            <input v-model="form.seo.noIndex" type="checkbox" class="h-4 w-4">
            Hide from search engines (noindex)
          </label>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
