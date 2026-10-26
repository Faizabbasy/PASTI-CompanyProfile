import { OPEN_SECTIONS, OpenContentSchema, type OpenContent } from '#shared/utils/openSchema'
import type { SingletonRecord } from './singletonPage'
import { defineProductPage } from './productPage'

// OPEN product page = product page on the shared singleton engine.
export type OpenRecord = SingletonRecord<'open', OpenContent>

const open = defineProductPage({
  id: 'open',
  sections: OPEN_SECTIONS,
  schema: OpenContentSchema,
  actions: { update: 'open.update', publish: 'open.publish', unpublish: 'open.unpublish', archive: 'open.archive' }
})

// Used by scripts/cms-migrate-product.mjs.
export const buildMigratedOpenRecord = open.buildMigratedRecord
export const OPEN_RECORD_KEY = open.RECORD_KEY
export const OPEN_REVISION_PREFIX = open.REVISION_PREFIX

export const getOpenState = open.getState
export const getOpenDraftContent = open.getDraftContent
export const saveOpenDraft = open.saveDraft
export const publishOpen = open.publish
export const setOpenStatus = open.setStatus
export const getPublishedOpen = open.getPublished
