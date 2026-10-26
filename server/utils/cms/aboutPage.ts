import { AboutContentSchema, type AboutContent, type AboutContentInput } from '#shared/utils/aboutSchema'
import { ABOUT_DUMMY_CONTENT } from '../../data/aboutDummy'
import { activeOnly, defineSingletonPage, type SingletonRecord } from './singletonPage'

// About = singleton page (Step 2), on the shared singleton engine (see
// singletonPage.ts for the draft / published / revision model).

export type AboutRecord = SingletonRecord<'about', AboutContent>

const about = defineSingletonPage<'about', AboutContent, AboutContentInput>({
  id: 'about',
  schema: AboutContentSchema,
  dummyContent: ABOUT_DUMMY_CONTENT,
  lists: [
    { path: 'mission.points', prefix: 'mp' },
    { path: 'values', prefix: 'val' },
    { path: 'milestones', prefix: 'ms' },
    { path: 'proof', prefix: 'pf' },
    { path: 'leadership', prefix: 'ld' }
  ],
  actions: { update: 'about.update', publish: 'about.publish', unpublish: 'about.unpublish', archive: 'about.archive' }
})

// Step 4: used by scripts/cms-migrate-about.mjs.
export const buildMigratedAboutRecord = about.buildMigratedRecord
export const ABOUT_RECORD_KEY = about.RECORD_KEY
export const ABOUT_REVISION_PREFIX = about.REVISION_PREFIX

export const toAboutAdminState = about.toAdminState
export const getAboutState = about.getState
export const getAboutDraftContent = about.getDraftContent
export const saveAboutDraft = about.saveDraft
export const publishAbout = about.publish
export const setAboutStatus = about.setStatus

// Public read path: inactive items removed. `proof` is dropped unless
// explicitly allowed (claims stay code-managed by default).
export async function getPublishedAbout(opts: { includeProof: boolean }) {
  const snap = await about.getPublishedSnapshot()
  if (!snap) return null
  const c = snap.content
  const { proof, ...rest } = c
  return {
    dummy: snap.dummy,
    version: snap.version,
    publishedAt: snap.publishedAt,
    content: {
      ...rest,
      mission: { ...c.mission, points: activeOnly(c.mission.points) },
      values: activeOnly(c.values),
      milestones: activeOnly(c.milestones),
      ...(opts.includeProof ? { proof: activeOnly(proof) } : {}),
      leadership: activeOnly(c.leadership)
    }
  }
}
