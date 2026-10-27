import { DORA_SECTIONS, DoraContentSchema, type DoraContent } from '#shared/utils/doraSchema'
import type { SingletonRecord } from './singletonPage'
import { defineProductPage } from './productPage'

// DORA product page = product page on the shared singleton engine.
export type DoraRecord = SingletonRecord<'dora', DoraContent>

const page = defineProductPage({
  id: 'dora',
  sections: DORA_SECTIONS,
  schema: DoraContentSchema,
  actions: { update: 'dora.update', publish: 'dora.publish', unpublish: 'dora.unpublish', archive: 'dora.archive' }
})

// Used by scripts/cms-migrate-product.mjs.
export const buildMigratedDoraRecord = page.buildMigratedRecord
export const DORA_RECORD_KEY = page.RECORD_KEY
export const DORA_REVISION_PREFIX = page.REVISION_PREFIX

export const getDoraState = page.getState
export const getDoraDraftContent = page.getDraftContent
export const saveDoraDraft = page.saveDraft
export const publishDora = page.publish
export const setDoraStatus = page.setStatus
export const getPublishedDora = page.getPublished

// Bilingual CMS: the record for one language (English = the original record).
export const doraFor = (lang: CmsLang) => page.forLocale(lang)
