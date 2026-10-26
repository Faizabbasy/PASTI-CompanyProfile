import { SHIFTLY_SECTIONS, ShiftlyContentSchema } from '#shared/utils/shiftlySchema'
import type { ProductPageMeta } from './useProductPageSource'

// Public /shiftly content source (shared product-page source, see
// useProductPageSource.ts): useShiftly() + og image, with the published
// SHIFTLY CMS copy laid over it when NUXT_CMS_SHIFTLY_PUBLIC_ENABLED.

type ShiftlyData = ReturnType<typeof useShiftly>
export type ShiftlyPageContent = Omit<ShiftlyData, 'seo'> & ProductPageMeta

export function buildLegacyShiftlyContent(): ShiftlyPageContent {
  const { seo, ...rest } = useShiftly()
  return { ...rest, source: 'legacy', cmsVersion: null, seo: { title: seo.title, description: seo.description, image: '/images/og/shiftly.jpg' } }
}

const source = defineProductPageSource({ slug: 'shiftly', flag: 'shiftlyPublicEnabled', sections: SHIFTLY_SECTIONS, schema: ShiftlyContentSchema, buildLegacy: buildLegacyShiftlyContent })

export const adaptShiftlyCms = source.adapt
// Called once by pages/shiftly.vue.
export const resolveShiftlyPageContent = source.resolve
export const provideShiftlyPreview = source.providePreview
// Every SHIFTLY component reads its content through this.
export const useShiftlyPage = source.use
