import type { InjectionKey } from 'vue'
import type { ZodType } from 'zod'
import { overlaySections, publicProductResponseSchema, type AnyProductContent, type SectionMap } from '#shared/cms/productFields'

// Shared content source for the product pages (OPEN, SHIFTLY, e-CORPORATE).
// Each page resolves its content ONCE (pages/<product>.vue) and its section
// components read the same object through `use()` — the page composable's
// own data (useOpen(), useShiftly() …) with the published CMS copy laid over
// it. Only mapped copy is replaced; ids, wiring and anything unmapped keep
// coming from code. The CMS is used only when the SERVER flag is on; any
// failure, no published snapshot or an unexpected response → code content.

export interface ProductPageSeo {
  title: string
  description: string
  image: string
  canonical?: string
  noIndex?: boolean
}
export interface ProductPageMeta {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  seo: ProductPageSeo
}

export function defineProductPageSource<L extends ProductPageMeta>(opts: {
  slug: string
  // runtimeConfig.cms key of the page's public flag.
  flag: string
  sections: SectionMap
  schema: ZodType
  buildLegacy: () => L
}) {
  const STATE_KEY = `${opts.slug}-page-content`
  const PREVIEW_KEY: InjectionKey<L> = Symbol(`${opts.slug}-preview`)
  const responseSchema = publicProductResponseSchema(opts.schema)

  function adapt(legacy: L, cms: { version: number; content: AnyProductContent }): L {
    const out = { ...legacy, source: 'cms', cmsVersion: cms.version } as L
    overlaySections(opts.sections, out as unknown as Record<string, unknown>, cms.content as unknown as Record<string, unknown>)
    const s = cms.content.seo
    out.seo = {
      title: s.metaTitle,
      description: s.metaDescription,
      image: s.ogImage || legacy.seo.image,
      ...(s.canonicalUrl ? { canonical: s.canonicalUrl } : {}),
      ...(s.noIndex ? { noIndex: true } : {})
    }
    return out
  }

  // Called once by the public page.
  async function resolve() {
    const legacy = opts.buildLegacy()
    const state = useState<L>(STATE_KEY, () => legacy)
    const { data } = await useAsyncData(`${opts.slug}-cms-source`, async () => {
      // SSR: skip the call entirely when the server-side flag is off.
      if (import.meta.server && !enabledOnServer()) return { status: 'disabled' as const }
      try {
        const parsed = responseSchema.safeParse(await $fetch(`/api/public/pages/${opts.slug}`, { timeout: 2500 }))
        if (!parsed.success) {
          if (import.meta.server) console.error(`[${opts.slug}] CMS response failed validation — using legacy content`)
          return { status: 'invalid' as const }
        }
        return parsed.data
      } catch (err) {
        if (import.meta.server) console.error(`[${opts.slug}] CMS source unavailable — using legacy content:`, (err as Error).message)
        return { status: 'error' as const }
      }
    })
    const d = data.value
    state.value = d?.status === 'published' ? adapt(legacy, d as { version: number; content: AnyProductContent }) : legacy
    return state
  }

  function enabledOnServer(): boolean {
    // Private runtime config — only readable during SSR, never in the bundle.
    const cms = useRuntimeConfig().cms as Record<string, unknown> | undefined
    return String(cms?.[opts.flag]) === 'true'
  }

  // Admin draft preview: the real components get the draft content in this
  // subtree only (never written to public state).
  function providePreview(content: L) {
    provide(PREVIEW_KEY, content)
  }

  // Every section component reads its content through this.
  function use(): L {
    const preview = inject(PREVIEW_KEY, null)
    if (preview) return preview
    const state = useState<L | undefined>(STATE_KEY)
    return state.value ?? opts.buildLegacy()
  }

  return { adapt, resolve, providePreview, use }
}
