import { DORA_SECTIONS, DoraContentSchema } from '#shared/utils/doraSchema'
import type { ProductPageMeta } from './useProductPageSource'

// Public /dora content source (shared product-page source, see
// useProductPageSource.ts): useDora() + og image, with the published DORA
// CMS copy laid over it when NUXT_CMS_DORA_PUBLIC_ENABLED.

type DoraData = ReturnType<typeof useDora>
export type DoraPageContent = Omit<DoraData, 'seo'> & ProductPageMeta

export function buildLegacyDoraContent(): DoraPageContent {
  const { seo, ...rest } = useDora()
  return { ...rest, source: 'legacy', cmsVersion: null, seo: { title: seo.title, description: seo.description, image: '/images/og/dora.jpg' } }
}

const source = defineProductPageSource({ slug: 'dora', flag: 'doraPublicEnabled', sections: DORA_SECTIONS, schema: DoraContentSchema, buildLegacy: buildLegacyDoraContent })

export const adaptDoraCms = source.adapt
// Called once by pages/dora.vue.
export const resolveDoraPageContent = source.resolve
export const provideDoraPreview = source.providePreview
// Every DORA component reads its content through this.
export const useDoraPage = source.use
