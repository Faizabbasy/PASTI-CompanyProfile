import { MATRIX_SECTIONS, MatrixContentSchema } from '#shared/utils/matrixSchema'
import type { ProductPageMeta } from './useProductPageSource'

// Public /matrix content source (shared product-page source, see
// useProductPageSource.ts): useMatrix() + og image, with the published
// MATRIX CMS copy laid over it when NUXT_CMS_MATRIX_PUBLIC_ENABLED.

type MatrixData = ReturnType<typeof useMatrix>
export type MatrixPageContent = Omit<MatrixData, 'seo'> & ProductPageMeta

export function buildLegacyMatrixContent(): MatrixPageContent {
  const { seo, ...rest } = useMatrix()
  return { ...rest, source: 'legacy', cmsVersion: null, seo: { title: seo.title, description: seo.description, image: '/images/og/matrix.jpg' } }
}

const source = defineProductPageSource({ slug: 'matrix', flag: 'matrixPublicEnabled', sections: MATRIX_SECTIONS, schema: MatrixContentSchema, buildLegacy: buildLegacyMatrixContent })

export const adaptMatrixCms = source.adapt
// Called once by pages/matrix.vue.
export const resolveMatrixPageContent = source.resolve
export const provideMatrixPreview = source.providePreview
// Every MATRIX component reads its content through this.
export const useMatrixPage = source.use
