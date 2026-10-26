import { FAST_SECTIONS, FastContentSchema } from '#shared/utils/fastSchema'
import type { ProductPageMeta } from './useProductPageSource'

// Public /fast content source (shared product-page source, see
// useProductPageSource.ts): useFast() + og image, with the published FAST
// CMS copy laid over it when NUXT_CMS_FAST_PUBLIC_ENABLED.

type FastData = ReturnType<typeof useFast>
export type FastPageContent = Omit<FastData, 'seo'> & ProductPageMeta

export function buildLegacyFastContent(): FastPageContent {
  const { seo, ...rest } = useFast()
  return { ...rest, source: 'legacy', cmsVersion: null, seo: { title: seo.title, description: seo.description, image: '/images/og/fast.jpg' } }
}

const source = defineProductPageSource({ slug: 'fast', flag: 'fastPublicEnabled', sections: FAST_SECTIONS, schema: FastContentSchema, buildLegacy: buildLegacyFastContent })

export const adaptFastCms = source.adapt
// Called once by pages/fast.vue.
export const resolveFastPageContent = source.resolve
export const provideFastPreview = source.providePreview
// Every FAST component reads its content through this.
export const useFastPage = source.use
