import { TechnologyContentSchema, type TechnologyContent, type TechnologyContentInput } from '#shared/utils/technologySchema'
import { TECHNOLOGY_DUMMY_CONTENT } from '../../data/technologyDummy'
import { activeOnly, defineSingletonPage, type SingletonRecord } from './singletonPage'

// Technology = singleton page on the shared singleton engine (same draft /
// published / revision model, storage and audit as About).

export type TechnologyRecord = SingletonRecord<'technology', TechnologyContent>

const technology = defineSingletonPage<'technology', TechnologyContent, TechnologyContentInput>({
  id: 'technology',
  schema: TechnologyContentSchema,
  dummyContent: TECHNOLOGY_DUMMY_CONTENT,
  lists: [
    { path: 'capabilities.items', prefix: 'cap' },
    { path: 'work.items', prefix: 'tw' }
  ],
  actions: { update: 'technology.update', publish: 'technology.publish', unpublish: 'technology.unpublish', archive: 'technology.archive' }
})

// Used by scripts/cms-migrate-technology.mjs.
export const buildMigratedTechnologyRecord = technology.buildMigratedRecord
export const TECHNOLOGY_RECORD_KEY = technology.RECORD_KEY
export const TECHNOLOGY_REVISION_PREFIX = technology.REVISION_PREFIX

export const getTechnologyState = technology.getState
export const getTechnologyDraftContent = technology.getDraftContent
export const saveTechnologyDraft = technology.saveDraft
export const publishTechnology = technology.publish
export const setTechnologyStatus = technology.setStatus

// Public read path: published snapshot only, inactive items removed, list
// order kept and the internal sortOrder dropped.
const publicList = <T extends { active: boolean; sortOrder: number }>(list: T[]) => activeOnly(list).map(({ sortOrder: _s, ...rest }) => rest)

export async function getPublishedTechnology(lang: CmsLang = 'en') {
  const snap = await technology.forLocale(lang).getPublishedSnapshot()
  if (!snap) return null
  const c = snap.content
  return {
    dummy: snap.dummy,
    version: snap.version,
    publishedAt: snap.publishedAt,
    content: {
      ...c,
      capabilities: { ...c.capabilities, items: publicList(c.capabilities.items) },
      work: { ...c.work, items: publicList(c.work.items) }
    }
  }
}

// Bilingual CMS: the record for one language (English = the original record).
export const technologyFor = (lang: CmsLang) => technology.forLocale(lang)
