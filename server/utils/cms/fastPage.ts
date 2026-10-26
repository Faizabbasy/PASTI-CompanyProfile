import { FAST_SECTIONS, FastContentSchema, type FastContent } from '#shared/utils/fastSchema'
import type { SingletonRecord } from './singletonPage'
import { defineProductPage } from './productPage'

// FAST product page = product page on the shared singleton engine.
export type FastRecord = SingletonRecord<'fast', FastContent>

const page = defineProductPage({
  id: 'fast',
  sections: FAST_SECTIONS,
  schema: FastContentSchema,
  actions: { update: 'fast.update', publish: 'fast.publish', unpublish: 'fast.unpublish', archive: 'fast.archive' }
})

// Used by scripts/cms-migrate-product.mjs.
export const buildMigratedFastRecord = page.buildMigratedRecord
export const FAST_RECORD_KEY = page.RECORD_KEY
export const FAST_REVISION_PREFIX = page.REVISION_PREFIX

export const getFastState = page.getState
export const getFastDraftContent = page.getDraftContent
export const saveFastDraft = page.saveDraft
export const publishFast = page.publish
export const setFastStatus = page.setStatus
export const getPublishedFast = page.getPublished
