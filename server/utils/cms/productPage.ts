import type { ZodType } from 'zod'
import { dummySections, pickSections, type AnyProductContent, type SectionMap } from '#shared/cms/productFields'
import { defineSingletonPage } from './singletonPage'
import type { AuditAction } from './types'

// A product page (OPEN, SHIFTLY, e-CORPORATE …) = a singleton on the shared
// singleton engine whose content is described by a field map. Every list has
// a fixed item count, so there are no repeaters (`lists: []`).
export function defineProductPage<Id extends string, C extends AnyProductContent>(cfg: {
  id: Id
  sections: SectionMap
  schema: ZodType<C>
  actions: { update: AuditAction; publish: AuditAction; unpublish: AuditAction; archive: AuditAction }
}) {
  const page = defineSingletonPage<Id, C, C>({
    id: cfg.id,
    schema: cfg.schema,
    dummyContent: {
      ...dummySections(cfg.sections),
      seo: { metaTitle: `[Dummy] ${cfg.id}`, metaDescription: '[Dummy] Lorem ipsum dolor sit amet, consectetur adipiscing elit.', ogImage: '', canonicalUrl: '', noIndex: true }
    } as unknown as C,
    lists: [],
    actions: cfg.actions
  })

  // Public read path: published snapshot only, copied through the field map
  // so nothing outside the public contract can leak through.
  async function getPublished() {
    const snap = await page.getPublishedSnapshot()
    if (!snap) return null
    const c = snap.content as unknown as Record<string, unknown> & { seo: AnyProductContent['seo'] }
    const s = c.seo
    return {
      dummy: snap.dummy,
      version: snap.version,
      publishedAt: snap.publishedAt,
      content: {
        ...pickSections(cfg.sections, c),
        seo: { metaTitle: s.metaTitle, metaDescription: s.metaDescription, ogImage: s.ogImage, canonicalUrl: s.canonicalUrl, noIndex: s.noIndex }
      }
    }
  }

  return { ...page, getPublished }
}
