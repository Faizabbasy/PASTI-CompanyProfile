import { SHIFTLY_SECTIONS, ShiftlyContentSchema, type ShiftlyContent } from '#shared/utils/shiftlySchema'
import type { SingletonRecord } from './singletonPage'
import { defineProductPage } from './productPage'

// SHIFTLY product page = product page on the shared singleton engine.
export type ShiftlyRecord = SingletonRecord<'shiftly', ShiftlyContent>

const page = defineProductPage({
  id: 'shiftly',
  sections: SHIFTLY_SECTIONS,
  schema: ShiftlyContentSchema,
  actions: { update: 'shiftly.update', publish: 'shiftly.publish', unpublish: 'shiftly.unpublish', archive: 'shiftly.archive' }
})

// Used by scripts/cms-migrate-product.mjs.
export const buildMigratedShiftlyRecord = page.buildMigratedRecord
export const SHIFTLY_RECORD_KEY = page.RECORD_KEY
export const SHIFTLY_REVISION_PREFIX = page.REVISION_PREFIX

export const getShiftlyState = page.getState
export const getShiftlyDraftContent = page.getDraftContent
export const saveShiftlyDraft = page.saveDraft
export const publishShiftly = page.publish
export const setShiftlyStatus = page.setStatus
export const getPublishedShiftly = page.getPublished

// Bilingual CMS: the record for one language (English = the original record).
export const shiftlyFor = (lang: CmsLang) => page.forLocale(lang)
