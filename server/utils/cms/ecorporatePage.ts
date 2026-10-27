import { ECORPORATE_SECTIONS, EcorporateContentSchema, type EcorporateContent } from '#shared/utils/ecorporateSchema'
import type { SingletonRecord } from './singletonPage'
import { defineProductPage } from './productPage'

// e-CORPORATE product page = product page on the shared singleton engine.
export type EcorporateRecord = SingletonRecord<'e-corporate', EcorporateContent>

const page = defineProductPage({
  id: 'e-corporate',
  sections: ECORPORATE_SECTIONS,
  schema: EcorporateContentSchema,
  actions: { update: 'ecorporate.update', publish: 'ecorporate.publish', unpublish: 'ecorporate.unpublish', archive: 'ecorporate.archive' }
})

// Used by scripts/cms-migrate-product.mjs.
export const buildMigratedEcorporateRecord = page.buildMigratedRecord
export const ECORPORATE_RECORD_KEY = page.RECORD_KEY
export const ECORPORATE_REVISION_PREFIX = page.REVISION_PREFIX

export const getEcorporateState = page.getState
export const getEcorporateDraftContent = page.getDraftContent
export const saveEcorporateDraft = page.saveDraft
export const publishEcorporate = page.publish
export const setEcorporateStatus = page.setStatus
export const getPublishedEcorporate = page.getPublished

// Bilingual CMS: the record for one language (English = the original record).
export const ecorporateFor = (lang: CmsLang) => page.forLocale(lang)
