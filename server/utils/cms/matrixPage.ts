import { MATRIX_SECTIONS, MatrixContentSchema, type MatrixContent } from '#shared/utils/matrixSchema'
import type { SingletonRecord } from './singletonPage'
import { defineProductPage } from './productPage'

// MATRIX product page = product page on the shared singleton engine.
export type MatrixRecord = SingletonRecord<'matrix', MatrixContent>

const page = defineProductPage({
  id: 'matrix',
  sections: MATRIX_SECTIONS,
  schema: MatrixContentSchema,
  actions: { update: 'matrix.update', publish: 'matrix.publish', unpublish: 'matrix.unpublish', archive: 'matrix.archive' }
})

// Used by scripts/cms-migrate-product.mjs.
export const buildMigratedMatrixRecord = page.buildMigratedRecord
export const MATRIX_RECORD_KEY = page.RECORD_KEY
export const MATRIX_REVISION_PREFIX = page.REVISION_PREFIX

export const getMatrixState = page.getState
export const getMatrixDraftContent = page.getDraftContent
export const saveMatrixDraft = page.saveDraft
export const publishMatrix = page.publish
export const setMatrixStatus = page.setStatus
export const getPublishedMatrix = page.getPublished

// Bilingual CMS: the record for one language (English = the original record).
export const matrixFor = (lang: CmsLang) => page.forLocale(lang)
