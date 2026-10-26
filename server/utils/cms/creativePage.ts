import { CreativeContentSchema, type CreativeContent, type CreativeContentInput } from '#shared/utils/creativeSchema'
import { CREATIVE_DUMMY_CONTENT } from '../../data/creativeDummy'
import { activeOnly, defineSingletonPage, type SingletonRecord } from './singletonPage'

// Creative = singleton page on the shared singleton engine (same draft /
// published / revision model, storage and audit as About and Technology).

export type CreativeRecord = SingletonRecord<'creative', CreativeContent>

const creative = defineSingletonPage<'creative', CreativeContent, CreativeContentInput>({
  id: 'creative',
  schema: CreativeContentSchema,
  dummyContent: CREATIVE_DUMMY_CONTENT,
  lists: [
    { path: 'services.items', prefix: 'svc' },
    { path: 'wall.visuals', prefix: 'vis' },
    { path: 'work.uiux.items', prefix: 'ux' }
  ],
  actions: { update: 'creative.update', publish: 'creative.publish', unpublish: 'creative.unpublish', archive: 'creative.archive' }
})

// Used by scripts/cms-migrate-creative.mjs.
export const buildMigratedCreativeRecord = creative.buildMigratedRecord
export const CREATIVE_RECORD_KEY = creative.RECORD_KEY
export const CREATIVE_REVISION_PREFIX = creative.REVISION_PREFIX

export const getCreativeState = creative.getState
export const getCreativeDraftContent = creative.getDraftContent
export const saveCreativeDraft = creative.saveDraft
export const publishCreative = creative.publish
export const setCreativeStatus = creative.setStatus

// Public read path: published snapshot only, inactive items removed, list
// order kept and the internal sortOrder dropped.
const publicList = <T extends { active: boolean; sortOrder: number }>(list: T[]) => activeOnly(list).map(({ sortOrder: _s, ...rest }) => rest)

export async function getPublishedCreative() {
  const snap = await creative.getPublishedSnapshot()
  if (!snap) return null
  const c = snap.content
  return {
    dummy: snap.dummy,
    version: snap.version,
    publishedAt: snap.publishedAt,
    content: {
      ...c,
      services: { ...c.services, items: publicList(c.services.items) },
      wall: { ...c.wall, visuals: publicList(c.wall.visuals) },
      work: { ...c.work, uiux: { ...c.work.uiux, items: publicList(c.work.uiux.items) } }
    }
  }
}
