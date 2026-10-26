import type { InjectionKey } from 'vue'
import { OPEN_SECTION_KEYS, OPEN_SECTIONS, overlayOpen } from '#shared/utils/openSchema'
import { PublicOpenResponseSchema, type PublicOpenResponse } from '#shared/utils/openPublic'

// Public /open content source. The page resolves it ONCE and every OPEN
// component reads the same shape via useOpenPage() — the useOpen() object
// plus the hero button labels — whichever source produced it:
//
//   legacy:  useOpen() + og image + hero button labels → buildLegacyOpenContent
//   cms:     GET /api/public/pages/open → adaptOpenCms(legacy, …)
//
// The CMS only replaces mapped copy (shared/utils/openSchema.ts); ids, module
// wiring, method codes/stages and anything unmapped keep coming from code.
// The CMS source is used only when the SERVER says so (runtime config flag).
// Any failure, a disabled flag, no published snapshot or an unexpected
// response → the code content.

type OpenData = ReturnType<typeof useOpen>
export type OpenPageContent = Omit<OpenData, 'seo' | 'hero'> & {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: OpenData['hero'] & { primaryCtaLabel: string; secondaryCtaLabel: string }
  seo: { title: string; description: string; image: string; canonical?: string; noIndex?: boolean }
}
type PublishedOpen = Extract<PublicOpenResponse, { status: 'published' }>

const STATE_KEY = 'open-page-content'
const PREVIEW_KEY: InjectionKey<OpenPageContent> = Symbol('open-preview')

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

export function adaptOpenCms(legacy: OpenPageContent, cms: Pick<PublishedOpen, 'version' | 'content'>): OpenPageContent {
  const out = { ...legacy, source: 'cms', cmsVersion: cms.version } as OpenPageContent
  const target = out as unknown as Record<string, unknown>
  const content = cms.content as Record<string, unknown>
  for (const k of OPEN_SECTION_KEYS) target[k] = overlayOpen(OPEN_SECTIONS[k], target[k], content[k])
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

// Called once by pages/open.vue.
export async function resolveOpenPageContent() {
  const legacy = buildLegacyOpenContent()
  const state = useState<OpenPageContent>(STATE_KEY, () => legacy)

  const { data } = await useAsyncData('open-cms-source', async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !openCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      const parsed = PublicOpenResponseSchema.safeParse(await $fetch('/api/public/pages/open', { timeout: 2500 }))
      if (!parsed.success) {
        if (import.meta.server) console.error('[open] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[open] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  state.value = data.value?.status === 'published' ? adaptOpenCms(legacy, data.value) : legacy
  return state
}

function openCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { openPublicEnabled?: unknown } | undefined
  return String(cms?.openPublicEnabled) === 'true'
}

// Admin draft preview: renders the real OPEN components with draft content
// provided to that subtree only (never written to public state).
export function provideOpenPreview(content: OpenPageContent) {
  provide(PREVIEW_KEY, content)
}

// Every OPEN component reads its content through this.
export function useOpenPage(): OpenPageContent {
  const preview = inject(PREVIEW_KEY, null)
  if (preview) return preview
  const state = useState<OpenPageContent | undefined>(STATE_KEY)
  return state.value ?? buildLegacyOpenContent()
}
