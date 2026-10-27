// Admin editors of bilingual pages: the language being edited, from
// `?lang=id|en`. Indonesian is the default — it's the main site language.
export function useEditorLang(): 'id' | 'en' {
  return useRoute().query.lang === 'en' ? 'en' : 'id'
}
