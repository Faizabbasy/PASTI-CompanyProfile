import type { InjectionKey } from 'vue'
import type { ZodType } from 'zod'
import {
  CtasContentSchema,
  PublicClientsContentSchema,
  PublicFaqsContentSchema,
  publicSharedResponseSchema,
  type CtasContent,
  type PublicClientsContent,
  type PublicFaqsContent,
  type SharedId
} from '#shared/utils/sharedContentSchema'

// Content source for the Shared Content CMS (Clients, FAQs, Global CTAs).
// The code composables (useClients, useFaq, useFinalCta / useFooter) stay the
// one place components read from; they ask `read()` first and fall back to
// their own code data when it returns null. So:
//   - CMS used only when the SERVER flag is on and a snapshot is published;
//     any failure or unexpected response → code content.
//   - resolve() runs once per app (clients/faqs: the pages that show them;
//     ctas: app.vue, because the footer is on every page).
//   - Admin preview provides draft content to its subtree only.
//   - Safe outside a Nuxt app (migration scripts load the code composables
//     with jiti): read() then simply returns null.

function defineSharedSource<P, T>(opts: { id: SharedId; flag: string; content: ZodType<P>; adapt: (content: P) => T }) {
  const STATE_KEY = `shared-${opts.id}`
  const PREVIEW_KEY: InjectionKey<T> = Symbol(`shared-${opts.id}-preview`)
  const responseSchema = publicSharedResponseSchema(opts.content)

  async function resolve() {
    const state = useState<T | null | undefined>(STATE_KEY, () => undefined)
    if (state.value !== undefined) return
    const { data } = await useAsyncData(`shared-${opts.id}-cms-source`, async () => {
      // SSR: skip the call entirely when the server-side flag is off.
      if (import.meta.server && !enabledOnServer()) return null
      try {
        const parsed = responseSchema.safeParse(await $fetch(`/api/public/shared/${opts.id}`, { timeout: 2500 }))
        if (!parsed.success) {
          if (import.meta.server) console.error(`[shared:${opts.id}] CMS response failed validation — using code content`)
          return null
        }
        return parsed.data.status === 'published' ? (parsed.data as { content: P }).content : null
      } catch (err) {
        if (import.meta.server) console.error(`[shared:${opts.id}] CMS source unavailable — using code content:`, (err as Error).message)
        return null
      }
    })
    state.value = data.value ? opts.adapt(data.value as P) : null
  }

  function enabledOnServer(): boolean {
    // Private runtime config — only readable during SSR, never in the bundle.
    const cms = useRuntimeConfig().cms as Record<string, unknown> | undefined
    return String(cms?.[opts.flag]) === 'true'
  }

  // Draft preview (admin): the real components in this subtree get the draft.
  function providePreview(content: P) {
    provide(PREVIEW_KEY, opts.adapt(content))
  }

  function read(): T | null {
    try {
      if (getCurrentInstance()) {
        const preview = inject(PREVIEW_KEY, null)
        if (preview) return preview
      }
      return useState<T | null | undefined>(STATE_KEY).value ?? null
    } catch {
      return null
    }
  }

  // `adapt` is exposed for scripts/cms-migrate-shared.mjs (round-trip check).
  return { resolve, providePreview, read, adapt: opts.adapt }
}

export interface SharedClient { name: string; logo: string; ratio: number }
export interface SharedFaq { index: string; question: string; answer: string }

export const clientsSource = defineSharedSource({
  id: 'clients',
  flag: 'clientsPublicEnabled',
  content: PublicClientsContentSchema,
  adapt: (c: PublicClientsContent): SharedClient[] => c.items.map((i) => ({ name: i.name, logo: i.logo, ratio: i.ratio }))
})

export const faqsSource = defineSharedSource({
  id: 'faqs',
  flag: 'faqsPublicEnabled',
  content: PublicFaqsContentSchema,
  adapt: (c: PublicFaqsContent): SharedFaq[] => c.items.map((i, n) => ({ index: String(n + 1).padStart(2, '0'), question: i.question, answer: i.answer }))
})

export const ctasSource = defineSharedSource({
  id: 'ctas',
  flag: 'ctasPublicEnabled',
  content: CtasContentSchema,
  adapt: (c: CtasContent): CtasContent => c
})
