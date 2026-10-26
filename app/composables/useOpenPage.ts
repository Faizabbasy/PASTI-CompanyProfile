import { OPEN_SECTIONS, OpenContentSchema } from '#shared/utils/openSchema'
import type { ProductPageMeta } from './useProductPageSource'

// Public /open content source (shared product-page source, see
// useProductPageSource.ts): useOpen() + og image + hero button labels, with
// the published OPEN CMS copy laid over it when NUXT_CMS_OPEN_PUBLIC_ENABLED.

type OpenData = ReturnType<typeof useOpen>
export type OpenPageContent = Omit<OpenData, 'seo' | 'hero'> & ProductPageMeta & {
  hero: OpenData['hero'] & { primaryCtaLabel: string; secondaryCtaLabel: string }
}

export function buildLegacyOpenContent(): OpenPageContent {
  const { seo, hero, ...rest } = useOpen()
  return {
    ...rest,
    source: 'legacy',
    cmsVersion: null,
    hero: { ...hero, primaryCtaLabel: 'Request a Demo', secondaryCtaLabel: 'Explore OPEN' },
    seo: { title: seo.title, description: seo.description, image: '/images/og/open.jpg' }
  }
}

const source = defineProductPageSource({ slug: 'open', flag: 'openPublicEnabled', sections: OPEN_SECTIONS, schema: OpenContentSchema, buildLegacy: buildLegacyOpenContent })

export const adaptOpenCms = source.adapt
// Called once by pages/open.vue.
export const resolveOpenPageContent = source.resolve
export const provideOpenPreview = source.providePreview
// Every OPEN component reads its content through this.
export const useOpenPage = source.use
