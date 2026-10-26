<script setup lang="ts">
import { CASE_LIMITS as LIM, type CaseStudyContent, type CaseStudyExtra } from '#shared/utils/caseStudySchema'
import type { ClaimStatus, CollectionAdminState } from '#shared/cms/fields'
import type { ProjectListRow } from '#shared/utils/projectSchema'

// Case study record editor. Project identity (name, client, year, poster)
// comes from the linked project. Metrics and gallery images carry their own
// claim status; publishing the case never approves them.
definePageMeta({ layout: 'admin' })

type CaseState = CollectionAdminState<CaseStudyContent, CaseStudyExtra>
const id = useRoute().params.id as string
const { cmsFetch, can } = useCmsSession()
const { data: projects } = await useAsyncData(`admin-work-case-${id}-projects`, () => cmsFetch<ProjectListRow[]>('/api/admin/work/projects'))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, publishedIds, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<CaseState, CaseStudyForm>({
  name: 'this case study',
  endpoint: `/api/admin/work/case-studies/${id}`,
  asyncKey: `admin-work-case-${id}`,
  tabs: CASE_TABS,
  toForm: toCaseStudyForm,
  toPayload: toCaseStudyPayload,
  validate: validateCaseStudyForm
})
const title = computed(() => state.value?.extra.project?.name ?? 'Case study')
useHead({ title: computed(() => `${title.value} · Case Studies`) })

const canApprove = computed(() => can('claims.approve'))
const projectOptions = computed(() => (projects.value ?? []).filter((p) => p.status !== 'archived' && (!p.caseStudy || p.caseStudy.id === id)))
const project = computed(() => projects.value?.find((p) => p.id === form.value?.projectId))
const savedMetric = (mid?: string): ClaimStatus | null => (mid ? state.value?.draft.content.metrics.find((m) => m.id === mid)?.claimStatus ?? null : null)
const savedImage = (gid?: string): ClaimStatus | null => (gid ? state.value?.draft.content.gallery.find((g) => g.id === gid)?.approvalStatus ?? null : null)
const slugChanged = computed(() => !!state.value?.extra.publishedSlug && form.value?.slug !== state.value.extra.publishedSlug)

function addMetric() {
  const list = form.value!.metrics
  list.push({ _key: newKey(), value: '', label: '', context: '', sourceNote: '', claimStatus: 'needs_approval', active: true, sortOrder: list.length + 1 })
}
function addImage() {
  const list = form.value!.gallery
  list.push({ _key: newKey(), src: '', alt: '', kind: 'screen', sourceNote: '', approvalStatus: 'needs_approval', active: true, sortOrder: list.length + 1 })
}
const move = <T>(list: T[], i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= list.length) return
  list.splice(t, 0, list.splice(i, 1)[0]!)
}

const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/work/case-studies/${id}`, '/admin/work/case-studies', () => title.value)
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/work" class="hover:underline">Work</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/work/case-studies" class="hover:underline">Case Studies</NuxtLink> <span aria-hidden="true">/</span> {{ title }}
    </nav>

    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading case study…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'This case study does not exist.' : 'Could not load the case study.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>

    <template v-else-if="form && state">
      <div class="mt-1 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold">{{ title }} <span class="text-base font-normal text-navy-500">· case study</span></h1>
        <span v-if="state.dummy" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
        <span v-else-if="state.source.kind === 'migration'" class="rounded-full border border-navy-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">Migrated · {{ state.source.version }}</span>
      </div>

      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="`/admin/preview/work/case-studies/${id}`"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />
      <p class="mt-3 rounded-md border border-navy-100 bg-white px-3 py-2 text-xs text-navy-600" role="note">
        Publishing this case study does <strong>not</strong> approve its claims. Only metrics and images marked <strong>Confirmed</strong> are eligible for public rendering<template v-if="!canApprove">, and only an admin can confirm them</template>.
      </p>

      <AdminEditorTabs v-model="activeTab" :tabs="CASE_TABS" label="Case study sections" :error-count="errorCount" />

      <div class="mt-6 max-w-3xl">
        <!-- HEADER -->
        <div v-show="activeTab === 'header'" id="panel-header" role="tabpanel" aria-labelledby="tab-header" class="grid gap-5">
          <div>
            <label :for="fieldId('projectId')" class="text-sm font-medium">Project<span class="text-red-700" aria-hidden="true"> *</span></label>
            <select :id="fieldId('projectId')" v-model="form.projectId" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err('projectId')">
              <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }} · {{ p.status }}</option>
            </select>
            <p v-if="err('projectId')" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err('projectId') }}</p>
            <p v-if="project" class="mt-1 text-xs text-navy-500">
              From the project: {{ project.name }} · {{ project.category }} —
              <NuxtLink :to="`/admin/work/projects/${project.id}`" class="underline">edit name, client, year or poster there</NuxtLink>.
            </p>
          </div>
          <div>
            <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug" :maxlength="60" required hint="Deep link on /work: #case-<slug>." :error="err('slug')" />
            <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">
              The published slug is “{{ state.extra.publishedSlug }}”. Changing it breaks existing #case-{{ state.extra.publishedSlug }} links once published.
            </p>
          </div>
          <AdminFormField :id="fieldId('categoryOverride')" v-model="form.categoryOverride" label="Case category (optional)" :maxlength="LIM.category" hint="Empty = the project's category." :error="err('categoryOverride')" />
        </div>

        <!-- CONTEXT -->
        <div v-show="activeTab === 'context'" id="panel-context" role="tabpanel" aria-labelledby="tab-context" class="grid gap-5">
          <AdminFormField :id="fieldId('context.body')" v-model="form.context.body" label="Business context" multiline :rows="5" :maxlength="LIM.context" hint="Shown on the file cover. Source-backed facts only — no invented client details." :error="err('context.body')" />
        </div>

        <!-- CHALLENGE -->
        <div v-show="activeTab === 'challenge'" id="panel-challenge" role="tabpanel" aria-labelledby="tab-challenge" class="grid gap-5">
          <AdminFormStringList legend="Challenge points" path="challenge.points" :items="form.challenge.points" :max="6" :maxlength="LIM.point" item-label="Point" add-label="Add point" :err="err" hint="Empty list = the chapter is hidden." />
        </div>

        <!-- APPROACH -->
        <div v-show="activeTab === 'approach'" id="panel-approach" role="tabpanel" aria-labelledby="tab-approach" class="grid gap-5">
          <fieldset>
            <legend class="text-sm font-medium">Chapter type</legend>
            <div class="mt-2 flex flex-wrap gap-4 text-sm">
              <label class="inline-flex items-center gap-2"><input v-model="form.approach.mode" type="radio" value="solution"> What we built (solution)</label>
              <label class="inline-flex items-center gap-2"><input v-model="form.approach.mode" type="radio" value="request"> What was requested</label>
            </div>
            <p class="mt-1 text-xs text-navy-500">The chapter label is set by the design. Use “requested” when the source does not describe PASTI's own scope.</p>
          </fieldset>
          <AdminFormStringList legend="Points" path="approach.points" :items="form.approach.points" :max="LIM.points" :maxlength="LIM.point" item-label="Point" add-label="Add point" :err="err" />
        </div>

        <!-- OUTCOME -->
        <div v-show="activeTab === 'outcome'" id="panel-outcome" role="tabpanel" aria-labelledby="tab-outcome" class="grid gap-5">
          <AdminFormStringList legend="Outcome points" path="outcome.points" :items="form.outcome.points" :max="6" :maxlength="LIM.point" item-label="Point" add-label="Add point" :err="err" hint="Qualitative outcomes. Figures go in Metrics, where they need approval." />
          <AdminFormField :id="fieldId('insight')" v-model="form.insight" label="Insight (optional)" multiline :maxlength="LIM.insight" :error="err('insight')" />
        </div>

        <!-- METRICS -->
        <div v-show="activeTab === 'metrics'" id="panel-metrics" role="tabpanel" aria-labelledby="tab-metrics" class="grid gap-5">
          <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">
            <strong>Only confirmed claims are eligible for public rendering.</strong> Needs approval and Hidden metrics never appear on the public site, even when the case study is published.
          </p>
          <AdminFormRepeater legend="Metrics" :items="form.metrics" :max="LIM.metrics" :published-ids="publishedIds" :item-title="(m) => `${m.value} ${m.label}`.trim()" add-label="Add metric" :error="err('metrics')" @add="addMetric">
            <template #default="{ item, index }">
              <div class="grid gap-4 tablet:grid-cols-[140px_1fr]">
                <AdminFormField :id="fieldId(`metrics.${index}.value`)" v-model="item.value" label="Value" :maxlength="LIM.metricValue" required placeholder="e.g. 30%" :error="err(`metrics.${index}.value`)" />
                <AdminFormField :id="fieldId(`metrics.${index}.label`)" v-model="item.label" label="Label" :maxlength="LIM.metricLabel" required :error="err(`metrics.${index}.label`)" />
              </div>
              <AdminFormField :id="fieldId(`metrics.${index}.context`)" v-model="item.context" label="Context (optional)" :maxlength="LIM.metricContext" hint="e.g. measurement period or method." :error="err(`metrics.${index}.context`)" />
              <AdminFormField :id="fieldId(`metrics.${index}.sourceNote`)" v-model="item.sourceNote" label="Source note (internal, never public)" multiline :rows="2" :maxlength="LIM.sourceNote" :error="err(`metrics.${index}.sourceNote`)" />
              <AdminWorkClaimStatus :id="fieldId(`metrics.${index}.claimStatus`)" v-model="item.claimStatus" :can-approve="canApprove" :saved-status="savedMetric(item.id)" :error="err(`metrics.${index}.claimStatus`)" />
            </template>
          </AdminFormRepeater>
        </div>

        <!-- GALLERY -->
        <div v-show="activeTab === 'gallery'" id="panel-gallery" role="tabpanel" aria-labelledby="tab-gallery" class="grid gap-5">
          <p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">
            Screenshots can contain client-sensitive data (names, prices, internal systems). Each image needs an admin's <strong>Confirmed</strong> status before it can render publicly. The first public image leads the case in the reel.
          </p>
          <AdminFormRepeater legend="Gallery" :items="form.gallery" :max="LIM.gallery" :published-ids="publishedIds" :item-title="(g) => g.alt || g.src" add-label="Add image" :error="err('gallery')" @add="addImage">
            <template #default="{ item, index }">
              <div class="grid gap-4 tablet:grid-cols-[1fr_160px]">
                <AdminFormField :id="fieldId(`gallery.${index}.src`)" v-model="item.src" label="Image" :maxlength="200" required hint="Path under /images/." :error="err(`gallery.${index}.src`)" />
                <div>
                  <label :for="fieldId(`gallery.${index}.kind`)" class="text-sm font-medium">Kind</label>
                  <select :id="fieldId(`gallery.${index}.kind`)" v-model="item.kind" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                    <option value="poster">Poster (photo)</option>
                    <option value="screen">Screen (UI)</option>
                    <option value="dashboard">Dashboard</option>
                  </select>
                </div>
              </div>
              <AdminFormField :id="fieldId(`gallery.${index}.alt`)" v-model="item.alt" label="Alt text" :maxlength="LIM.alt" required :error="err(`gallery.${index}.alt`)" />
              <AdminFormField :id="fieldId(`gallery.${index}.sourceNote`)" v-model="item.sourceNote" label="Source note (internal, never public)" multiline :rows="2" :maxlength="LIM.sourceNote" :error="err(`gallery.${index}.sourceNote`)" />
              <AdminWorkClaimStatus :id="fieldId(`gallery.${index}.approvalStatus`)" v-model="item.approvalStatus" :can-approve="canApprove" :saved-status="savedImage(item.id)" :error="err(`gallery.${index}.approvalStatus`)" />
              <img v-if="item.src && !err(`gallery.${index}.src`)" :src="item.src" alt="" class="max-h-40 w-auto rounded-md ring-1 ring-navy-100">
            </template>
          </AdminFormRepeater>
        </div>

        <!-- TIMELINE & STACK -->
        <div v-show="activeTab === 'delivery'" id="panel-delivery" role="tabpanel" aria-labelledby="tab-delivery" class="grid gap-5">
          <fieldset class="grid gap-3">
            <legend class="text-sm font-medium">Delivery timeline (optional)</legend>
            <p class="text-xs text-navy-500">A project fact, not a performance claim. Leave empty if the source gives no timeline — never estimate.</p>
            <AdminFormField :id="fieldId('timeline.total')" v-model="form.timeline.total" label="Total" :maxlength="LIM.timelineTotal" placeholder="e.g. ~3.5 months" :error="err('timeline.total')" />
            <p v-if="err('timeline.steps')" class="text-xs font-medium text-red-700" role="alert">{{ err('timeline.steps') }}</p>
            <div v-for="(s, k) in form.timeline.steps" :key="k" class="grid gap-3 rounded-md border border-navy-100 p-3 tablet:grid-cols-[1fr_120px_auto]">
              <AdminFormField :id="fieldId(`timeline.steps.${k}.label`)" v-model="s.label" :label="`Step ${k + 1}`" :maxlength="LIM.stepLabel" required :error="err(`timeline.steps.${k}.label`)" />
              <div>
                <label :for="fieldId(`timeline.steps.${k}.weeks`)" class="text-sm font-medium">Weeks</label>
                <input :id="fieldId(`timeline.steps.${k}.weeks`)" v-model.number="s.weeks" type="number" min="1" max="104" class="mt-1 block w-full rounded-md border border-navy-200 px-3 py-2 text-sm">
                <p v-if="err(`timeline.steps.${k}.weeks`)" class="mt-1 text-xs text-red-700">{{ err(`timeline.steps.${k}.weeks`) }}</p>
              </div>
              <div class="flex items-end gap-1 pb-1 text-xs">
                <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === 0" @click="move(form.timeline.steps, k, -1)">↑</button>
                <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === form.timeline.steps.length - 1" @click="move(form.timeline.steps, k, 1)">↓</button>
                <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50" @click="form.timeline.steps.splice(k, 1)">Remove</button>
              </div>
            </div>
            <div>
              <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="form.timeline.steps.length >= LIM.steps" @click="form.timeline.steps.push({ label: '', weeks: 1 })">+ Add step</button>
            </div>
          </fieldset>
          <AdminFormStringList legend="Technology stack (optional)" path="technologyLabels" :items="form.technologyLabels" :max="LIM.techLabels" :maxlength="LIM.techLabel" item-label="Label" add-label="Add label" :err="err" hint="Only technologies the source confirms." />
        </div>

        <div v-if="canDelete(state)" class="mt-10 rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm">
          <h2 class="font-semibold text-red-800">Delete draft</h2>
          <p class="mt-1 text-navy-600">Never published, so it can be removed permanently.</p>
          <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Deleting…' : 'Delete case study' }}</button>
          <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
        </div>
      </div>

      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>
