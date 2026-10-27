import { UI_ID } from '~/i18n/ui'

// Inline UI text in components: write the English text and wrap it,
// `t('Request a demo')`. On Indonesian pages it returns the Indonesian entry
// from app/i18n/ui/*.ts; anything without an entry falls back to the English
// text, so nothing ever renders empty. `{name}` placeholders are filled from
// `vars`: t('{n} conditions', { n: 13 }).
export function translate(text: string, locale: Locale, vars?: Record<string, string | number>): string {
  let out = locale === 'id' ? (UI_ID[text] ?? text) : text
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v))
  return out
}

export function useT() {
  const locale = useLocale()
  return (text: string, vars?: Record<string, string | number>) => translate(text, locale, vars)
}
