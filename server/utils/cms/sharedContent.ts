import {
  ClientsContentSchema,
  CtasContentSchema,
  FaqsContentSchema,
  type ClientsContent,
  type ClientsContentInput,
  type CtasContent,
  type FaqsContent,
  type FaqsContentInput
} from '#shared/utils/sharedContentSchema'
import { activeOnly, defineSingletonPage } from './singletonPage'

// Shared Content (Clients, FAQs, Global CTAs) = three singletons on the shared
// singleton engine (see singletonPage.ts for the draft / published model).
// Dev seed content is Lorem, marked dummy, and never served outside `nuxt dev`.

const LOREM = '[Dummy] Lorem ipsum dolor sit amet'

const clients = defineSingletonPage<'clients', ClientsContent, ClientsContentInput>({
  id: 'clients',
  schema: ClientsContentSchema,
  dummyContent: {
    items: Array.from({ length: 8 }, (_, i) => ({ id: `cli-dummy-${i + 1}`, name: `${LOREM} ${i + 1}`.slice(0, 60), logo: '/logos/clients/brin.webp', ratio: 2.548, sortOrder: i + 1, active: true }))
  },
  lists: [{ path: 'items', prefix: 'cli' }],
  actions: { update: 'clients.update', publish: 'clients.publish', unpublish: 'clients.unpublish', archive: 'clients.archive' }
})

const faqs = defineSingletonPage<'faqs', FaqsContent, FaqsContentInput>({
  id: 'faqs',
  schema: FaqsContentSchema,
  dummyContent: {
    items: Array.from({ length: 3 }, (_, i) => ({ id: `faq-dummy-${i + 1}`, question: `${LOREM}?`, answer: `${LOREM}, consectetur adipiscing elit.`, sortOrder: i + 1, active: true }))
  },
  lists: [{ path: 'items', prefix: 'faq' }],
  actions: { update: 'faqs.update', publish: 'faqs.publish', unpublish: 'faqs.unpublish', archive: 'faqs.archive' }
})

const ctas = defineSingletonPage<'ctas', CtasContent>({
  id: 'ctas',
  schema: CtasContentSchema,
  dummyContent: {
    eyebrow: '[Dummy] Lorem ipsum',
    headline: '[Dummy] Lorem ipsum dolor',
    email: 'dummy@example.com',
    address: LOREM,
    mapsUrl: '',
    hours: '',
    positioning: LOREM,
    socials: { linkedin: '', instagram: '', tiktok: '', youtube: '' }
  },
  lists: [],
  actions: { update: 'ctas.update', publish: 'ctas.publish', unpublish: 'ctas.unpublish', archive: 'ctas.archive' }
})

export const sharedPages = { clients, faqs, ctas }
export type SharedPageId = keyof typeof sharedPages

// Used by scripts/cms-migrate-shared.mjs.
export const SHARED_RECORD_KEYS = { clients: clients.RECORD_KEY, faqs: faqs.RECORD_KEY, ctas: ctas.RECORD_KEY }
export const SHARED_REVISION_PREFIXES = { clients: clients.REVISION_PREFIX, faqs: faqs.REVISION_PREFIX, ctas: ctas.REVISION_PREFIX }
export const buildMigratedSharedRecord = (id: SharedPageId, content: unknown, version: string, now: string) =>
  // Each engine builds its own record shape; the content was validated by the caller.
  (sharedPages[id].buildMigratedRecord as (c: unknown, v: string, n: string) => unknown)(content, version, now)

// Public read path: published snapshot only; inactive items removed.
export async function getPublishedShared(id: SharedPageId) {
  const snap = await sharedPages[id].getPublishedSnapshot()
  if (!snap) return null
  const c = snap.content as Record<string, unknown>
  const content = id === 'ctas' ? c : { items: activeOnly(c.items as { active: boolean }[]) }
  return { dummy: snap.dummy, version: snap.version, publishedAt: snap.publishedAt, content }
}
