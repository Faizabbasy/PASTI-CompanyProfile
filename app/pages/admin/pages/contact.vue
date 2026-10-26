<script setup lang="ts">
import { CONTACT_LIMITS as LIM, type ContactAdminState } from '#shared/utils/contactSchema'

// Contact singleton editor. Page wording only — layout, typography, colour,
// motion, shared company contact data and every piece of form behaviour
// stay in code. No add/duplicate/delete for the page itself.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Contact · Pages' })

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<ContactAdminState, ContactForm>({
  name: 'Contact',
  endpoint: '/api/admin/pages/contact',
  asyncKey: 'admin-contact',
  tabs: CONTACT_TABS,
  toForm: toContactForm,
  toPayload: toContactPayload,
  validate: validateContactForm
})

// Shared company contact data, read from its one shared source (the same
// code the public page and the footer read). Shown for reference only —
// it is not part of the Contact CMS record and cannot be saved from here.
const { contact, socials } = useContact()
const shared = [
  { label: 'WhatsApp', value: contact.whatsappDisplay, source: 'useFooter · useWhatsapp' },
  { label: 'Email', value: contact.email, source: 'useFinalCta' },
  { label: 'Office address', value: contact.address, source: 'useFooter' },
  { label: 'Maps link', value: contact.mapsUrl, source: 'from the address' },
  { label: 'Office hours', value: contact.hours, source: 'useFooter' },
  { label: 'Legal entity', value: contact.entity, source: 'useFooter' },
  { label: 'Social links', value: socials.map((s) => s.label).join(', ') || null, source: 'useFooter' }
]

const channelRows = [
  { key: 'whatsapp', name: 'WhatsApp row' },
  { key: 'email', name: 'Email row' },
  { key: 'office', name: 'Office row' }
] as const

const fieldRows = [
  { key: 'name', name: 'Name', note: 'Required' },
  { key: 'company', name: 'Company', note: 'Required' },
  { key: 'email', name: 'Work email', note: 'Required · email format' },
  { key: 'phone', name: 'Phone / WhatsApp', note: 'Optional · phone format' },
  { key: 'message', name: 'Message', note: 'Optional · multi-line' }
] as const
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/pages" class="hover:underline">Pages</NuxtLink> <span aria-hidden="true">/</span> Contact
    </nav>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-bold">Contact page</h1>
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
      Singleton page. Edit wording only — layout, form behaviour and shared contact details are managed in code.
      The public <code>/contact</code> page uses published CMS content only when the server flag
      <code>NUXT_CMS_CONTACT_PUBLIC_ENABLED</code> is on; otherwise it keeps its code content.
    </p>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading Contact content…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Could not load the Contact page.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/contact"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />

      <AdminEditorTabs v-model="activeTab" :tabs="CONTACT_TABS" label="Contact sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HERO -->
        <div v-show="activeTab === 'hero'" id="panel-hero" role="tabpanel" aria-labelledby="tab-hero" class="grid gap-5">
          <AdminFormField :id="fieldId('hero.eyebrow')" v-model="form.hero.eyebrow" label="Eyebrow" :maxlength="LIM.heroEyebrow" required hint="Shown after the “Contact” marker (tablet and larger screens)." :error="err('hero.eyebrow')" />
          <AdminFormField
            :id="fieldId('hero.headline')"
            v-model="form.hero.headline"
            label="Headline"
            :maxlength="LIM.headline"
            required
            :hint="`Each word rises in on its own line mask. Max ${LIM.headlineWord} characters per word; the yellow period is added by the design.`"
            :error="err('hero.headline')"
          />
          <AdminFormField :id="fieldId('hero.supportingCopy')" v-model="form.hero.supportingCopy" label="Supporting copy" multiline :maxlength="LIM.supportingCopy" required :error="err('hero.supportingCopy')" />
        </div>

        <!-- CONTACT INFORMATION -->
        <div v-show="activeTab === 'info'" id="panel-info" role="tabpanel" aria-labelledby="tab-info" class="grid gap-6">
          <section aria-labelledby="shared-info-title" class="rounded-lg border border-navy-100 bg-navy-50/60 p-4">
            <div class="flex flex-wrap items-center gap-2">
              <h2 id="shared-info-title" class="text-sm font-semibold">Shared contact information</h2>
              <span class="rounded-full border border-navy-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-600">Inherited · read-only</span>
            </div>
            <p class="mt-1 text-xs text-navy-500">
              Company-wide values, also used by the footer and the WhatsApp buttons across the site. They are not stored in the
              Contact page and cannot be changed here — they will move to a shared Site Settings area later.
            </p>
            <dl class="mt-3 divide-y divide-navy-100 rounded-md border border-navy-100 bg-white text-sm">
              <div v-for="s in shared" :key="s.label" class="grid gap-1 px-3 py-2 tablet:grid-cols-[10rem_minmax(0,1fr)_auto] tablet:items-baseline tablet:gap-3">
                <dt class="font-medium text-navy-600">{{ s.label }}</dt>
                <dd class="min-w-0 [overflow-wrap:anywhere]">{{ s.value ?? 'Not set — not shown on the page' }}</dd>
                <dd class="whitespace-nowrap text-[11px] text-navy-400">{{ s.source }}</dd>
              </div>
            </dl>
          </section>

          <fieldset class="grid gap-4">
            <legend class="text-sm font-semibold">Contact-page labels</legend>
            <p class="-mt-2 text-xs text-navy-500">Wording around the shared values above. Each row links to WhatsApp, email or Google Maps — the destinations come from the shared data.</p>
            <div v-for="row in channelRows" :key="row.key" class="grid gap-3 rounded-md border border-navy-100 p-3 tablet:grid-cols-2">
              <AdminFormField :id="fieldId(`channels.${row.key}.label`)" v-model="form.channels[row.key].label" :label="`${row.name} · label`" :maxlength="LIM.channelLabel" required :error="err(`channels.${row.key}.label`)" />
              <AdminFormField :id="fieldId(`channels.${row.key}.action`)" v-model="form.channels[row.key].action" :label="`${row.name} · link text`" :maxlength="LIM.channelAction" required :error="err(`channels.${row.key}.action`)" />
            </div>
          </fieldset>
        </div>

        <!-- FORM CONTENT -->
        <div v-show="activeTab === 'form'" id="panel-form" role="tabpanel" aria-labelledby="tab-form" class="grid gap-5">
          <AdminFormField :id="fieldId('form.title')" v-model="form.form.title" label="Form title" :maxlength="LIM.formTitle" required hint="The yellow period is added by the design." :error="err('form.title')" />
          <AdminFormField :id="fieldId('form.description')" v-model="form.form.description" label="Form description" multiline :rows="2" :maxlength="LIM.formDescription" required :error="err('form.description')" />

          <fieldset class="grid gap-3">
            <legend class="text-sm font-semibold">Field labels</legend>
            <p class="-mt-1 text-xs text-navy-500">
              Labels and optional placeholders for the existing fields. Field order, input types, which fields are required and
              the validation messages are fixed in code (front end and hand-off stay consistent).
            </p>
            <div v-for="f in fieldRows" :key="f.key" class="rounded-md border border-navy-100 p-3">
              <p class="text-xs font-semibold text-navy-600">{{ f.name }} <span class="font-normal text-navy-400">· {{ f.note }} (code-managed)</span></p>
              <div class="mt-2 grid gap-3 tablet:grid-cols-2">
                <AdminFormField :id="fieldId(`form.fields.${f.key}.label`)" v-model="form.form.fields[f.key].label" label="Label" :maxlength="LIM.fieldLabel" required :error="err(`form.fields.${f.key}.label`)" />
                <AdminFormField :id="fieldId(`form.fields.${f.key}.placeholder`)" v-model="form.form.fields[f.key].placeholder" label="Placeholder (optional)" :maxlength="f.key === 'message' ? LIM.messagePlaceholder : LIM.placeholder" hint="Empty = no placeholder." :error="err(`form.fields.${f.key}.placeholder`)" />
              </div>
            </div>
          </fieldset>

          <div class="grid gap-5 tablet:grid-cols-2">
            <AdminFormField :id="fieldId('form.needsLegend')" v-model="form.form.needsLegend" label="“What do you need?” heading" :maxlength="LIM.needsLegend" required hint="The options are the service and platform names (code-managed)." :error="err('form.needsLegend')" />
            <AdminFormField :id="fieldId('form.needsHint')" v-model="form.form.needsHint" label="Heading hint (optional)" :maxlength="LIM.needsHint" hint="e.g. “Pick any”. Empty = hidden." :error="err('form.needsHint')" />
          </div>
          <AdminFormField :id="fieldId('form.submitLabel')" v-model="form.form.submitLabel" label="Submit button label" :maxlength="LIM.submitLabel" required :error="err('form.submitLabel')" />

          <fieldset class="grid gap-4">
            <legend class="text-sm font-semibold">After submit</legend>
            <p class="-mt-2 text-xs text-navy-500">The code decides which state shows: success when WhatsApp opened with the brief, failure when the browser blocked it.</p>
            <AdminFormField :id="fieldId('form.successTitle')" v-model="form.form.successTitle" label="Success title" :maxlength="LIM.stateTitle" required :error="err('form.successTitle')" />
            <AdminFormField :id="fieldId('form.successMessage')" v-model="form.form.successMessage" label="Success message" multiline :rows="2" :maxlength="LIM.stateMessage" required :error="err('form.successMessage')" />
            <AdminFormField :id="fieldId('form.errorTitle')" v-model="form.form.errorTitle" label="Failure title" :maxlength="LIM.stateTitle" required :error="err('form.errorTitle')" />
            <AdminFormField :id="fieldId('form.errorMessage')" v-model="form.form.errorMessage" label="Failure message" multiline :rows="2" :maxlength="LIM.stateMessage" required :error="err('form.errorMessage')" />
          </fieldset>
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
          <p>These parts of <code>/contact</code> are not edited here:</p>
          <ul class="list-disc space-y-1.5 pl-5">
            <li><strong>Shared contact details</strong> — WhatsApp number, email, address, maps link, legal entity and social links (shared with the footer).</li>
            <li><strong>Form behaviour</strong> — field identifiers, input types, required fields, validation rules and messages, and the WhatsApp hand-off with its message template.</li>
            <li><strong>“What do you need?” options</strong> — the service and platform names.</li>
            <li><strong>Interface text</strong> — the “Contact” marker, “Open WhatsApp”, “Start a new brief”, row numbers and screen-reader text.</li>
            <li><strong>Footer CTA</strong> — global, shared by every page. The Contact page has no page-specific CTA, intro section or hero media.</li>
          </ul>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
