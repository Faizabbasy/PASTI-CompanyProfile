<script setup lang="ts">
import type { ZodType } from 'zod'
import type { SingletonAdminState } from '#shared/cms/fields'
import type { AnyProductContent, ProductTab, SectionMap } from '#shared/cms/productFields'

// Editor for a product page (OPEN, SHIFTLY, e-CORPORATE …), driven by its
// field map. Left: the page's sections in page order (same numbers as on the
// site), each with an error count. Right: a plain-language note on where the
// section sits + a link that opens the preview scrolled to it, then the
// fields. Copy only — design, layout and wiring are not editable here.
const props = defineProps<{
  name: string
  slug: string
  publicPath: string
  flag: string
  sections: SectionMap
  tabs: readonly ProductTab[]
  schema: ZodType
  seoDescriptionMax: number
  codeManaged: string[]
}>()

const lang = useEditorLang()
const endpoint = `/api/admin/pages/${props.slug}`
const previewPath = `/admin/preview/${props.slug}?lang=${lang}`
const toJson = <T,>(v: T) => JSON.parse(JSON.stringify(v)) as T

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<SingletonAdminState<string, AnyProductContent>, AnyProductContent>({
  name: props.name,
  endpoint,
  asyncKey: `admin-${props.slug}`,
  lang,
  tabs: props.tabs,
  toForm: toJson,
  toPayload: toJson,
  validate: (f) => zodFieldErrors(props.schema.safeParse(toJson(f)))
})

const contentSections = (tab: { key: string }) => (props.tabs.find((t) => t.key === tab.key)?.sections ?? []).filter((s) => s !== 'seo')
const sectionModel = (k: string) => (form.value as unknown as Record<string, Record<string, unknown>>)[k]!
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    :title="`Halaman ${name}`"
    crumb="Products"
    :public-path="publicPath"
    :lang="lang"
    :flag="flag"
    :tabs="tabs"
    :preview-path="previewPath"
    :code-managed="codeManaged"
    :dummy="state?.dummy !== false"
    :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
    :dirty="dirty"
    :error-count="errorCount"
    :ready="!!(form && state)"
  >
    <template #status>
      <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat konten {{ name }}…</div>
      <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Konten {{ name }} gagal dimuat.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      </div>
    </template>

    <template #actions>
      <AdminEditorActionBar
        v-if="form && state"
        :state="state"
        :dirty="dirty"
        :busy="busy"
        :preview-href="previewPath"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />
    </template>

    <template #default="{ current }">
      <template v-if="form">
        <div v-if="current.key !== 'seo'" class="grid gap-8">
          <section v-for="s in contentSections(current)" :key="s" :aria-labelledby="contentSections(current).length > 1 ? `sec-${s}` : undefined">
            <h3 v-if="contentSections(current).length > 1 && sections[s]!.k === 'group'" :id="`sec-${s}`" class="mb-3 border-b border-navy-100 pb-1 text-base font-bold">{{ sections[s]!.label }}</h3>
            <AdminProductFields v-if="sections[s]!.k === 'group'" :fields="sections[s]!.fields" :model="sectionModel(s)" :path="s" :err="err" />
            <AdminProductFields v-else :fields="{ [s]: sections[s]! }" :model="(form as unknown as Record<string, unknown>)" path="" :err="err" />
          </section>
        </div>
        <AdminSeoFields v-else v-model="form.seo" :description-max="seoDescriptionMax" :err="err" />
      </template>
    </template>

    <template #after>
      <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
    </template>
  </AdminEditorFrame>
</template>
