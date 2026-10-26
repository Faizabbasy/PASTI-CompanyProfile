import { pickOpenContent, type OpenContent } from './openSchema'

// Legacy (useOpen() + og image) → OPEN CMS content. Pure and deterministic:
// copies exactly the mapped fields, so re-running gives the same record.
export const OPEN_MIGRATION_VERSION = 'open-v1'
export const OPEN_DUMMY_MARKERS = ['[Dummy]']

export interface OpenLegacySource {
  sections: Record<string, unknown>
  seo: { title: string; description: string; image: string }
}

export function legacyToOpenContent(legacy: OpenLegacySource, opts: { canonicalUrl: string }): OpenContent {
  return {
    ...pickOpenContent(legacy.sections),
    seo: {
      metaTitle: legacy.seo.title,
      metaDescription: legacy.seo.description,
      ogImage: legacy.seo.image,
      canonicalUrl: opts.canonicalUrl,
      noIndex: false
    }
  }
}
