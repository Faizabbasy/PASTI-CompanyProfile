// Globals the app composables reach through Nuxt auto-imports, for the
// migration scripts that load those composables with jiti outside Nuxt.
// `lang` = which copy the composables build: 'en' (the base copy, default)
// or 'id' (the Indonesian overlay) — for `--lang id` migrations.
export async function installNuxtShims(load, lang = 'en') {
  const { localize } = await load('app/utils/localize.ts')
  const loc = await load('app/composables/useLocale.ts')
  Object.assign(globalThis, {
    localize,
    localeOfPath: loc.localeOfPath,
    localePath: loc.localePath,
    stripLocale: loc.stripLocale,
    useLocale: () => lang
  })
  const { translate } = await load('app/composables/useT.ts')
  globalThis.translate = translate
  // Testimonials as the public pages see them without the CMS (legacy list).
  globalThis.useTestimonialsSource = () => {
    const { useTestimonials } = globalThis.useTestimonials ? globalThis : { useTestimonials: null }
    const list = (useTestimonials ?? (() => ({ testimonials: [] })))().testimonials
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return list.filter((t) => t.status !== 'placeholder').map((t) => ({ ...t, id: `tst-${slug(t.name)}` }))
  }
  const seo = await load('app/composables/useSeo.ts')
  const await_id_seo = (await load('app/i18n/content/seo.ts')).PAGE_SEO_ID
  globalThis.localizedPageSeo = (key) => (lang === 'id' ? localize(seo.pageSeo[key], (await_id_seo)[key]) : seo.pageSeo[key])
}
