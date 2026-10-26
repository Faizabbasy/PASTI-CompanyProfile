import { OPEN_SECTION_KEYS, OPEN_SECTIONS, OpenContentSchema, pickOpen, type OpenContent, type OpenContentInput } from '#shared/utils/openSchema'
import { OPEN_DUMMY_CONTENT } from '../../data/openDummy'
import { defineSingletonPage, type SingletonRecord } from './singletonPage'

// OPEN product page = singleton on the shared singleton engine (same draft /
// published / revision model, storage and audit as the other pages). Every
// list has a fixed item count (no repeaters), so `lists` is empty.

export type OpenRecord = SingletonRecord<'open', OpenContent>

const open = defineSingletonPage<'open', OpenContent, OpenContentInput>({
  id: 'open',
  schema: OpenContentSchema,
  dummyContent: OPEN_DUMMY_CONTENT,
  lists: [],
  actions: { update: 'open.update', publish: 'open.publish', unpublish: 'open.unpublish', archive: 'open.archive' }
})

// Used by scripts/cms-migrate-open.mjs.
export const buildMigratedOpenRecord = open.buildMigratedRecord
export const OPEN_RECORD_KEY = open.RECORD_KEY
export const OPEN_REVISION_PREFIX = open.REVISION_PREFIX

export const getOpenState = open.getState
export const getOpenDraftContent = open.getDraftContent
export const saveOpenDraft = open.saveDraft
export const publishOpen = open.publish
export const setOpenStatus = open.setStatus

// Public read path: published snapshot only, copied through the field map so
// nothing outside the public contract can leak through.
export async function getPublishedOpen() {
  const snap = await open.getPublishedSnapshot()
  if (!snap) return null
  const c = snap.content
  const s = c.seo
  return {
    dummy: snap.dummy,
    version: snap.version,
    publishedAt: snap.publishedAt,
    content: {
      ...Object.fromEntries(OPEN_SECTION_KEYS.map((k) => [k, pickOpen(OPEN_SECTIONS[k], c[k])])),
      seo: { metaTitle: s.metaTitle, metaDescription: s.metaDescription, ogImage: s.ogImage, canonicalUrl: s.canonicalUrl, noIndex: s.noIndex }
    }
  }
}
