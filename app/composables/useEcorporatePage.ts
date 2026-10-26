import { ECORPORATE_SECTIONS, EcorporateContentSchema } from '#shared/utils/ecorporateSchema'
import type { ProductPageMeta } from './useProductPageSource'

// Public /e-corporate content source (shared product-page source, see
// useProductPageSource.ts): useEcorporate() + og image, with the published
// e-CORPORATE CMS copy laid over it when NUXT_CMS_ECORPORATE_PUBLIC_ENABLED.

type EcorporateData = ReturnType<typeof useEcorporate>
export type EcorporatePageContent = Omit<EcorporateData, 'seo'> & ProductPageMeta

export function buildLegacyEcorporateContent(): EcorporatePageContent {
  const { seo, ...rest } = useEcorporate()
  return { ...rest, source: 'legacy', cmsVersion: null, seo: { title: seo.title, description: seo.description, image: '/images/og/e-corporate.jpg' } }
}

const source = defineProductPageSource({ slug: 'e-corporate', flag: 'ecorporatePublicEnabled', sections: ECORPORATE_SECTIONS, schema: EcorporateContentSchema, buildLegacy: buildLegacyEcorporateContent })

export const adaptEcorporateCms = source.adapt
// Called once by pages/e-corporate.vue.
export const resolveEcorporatePageContent = source.resolve
export const provideEcorporatePreview = source.providePreview
// Every e-CORPORATE component reads its content through this.
export const useEcorporatePage = source.use
